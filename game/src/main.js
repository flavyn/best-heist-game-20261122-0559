import {createState,tick,resetRoom,advanceRoom,setWaypoint,toggleHide,useTool} from './state.js';
import {render} from './render.js';
import {installInput} from './input.js';
import {poseShot} from './shots.js';
import {toggleSound} from './audio.js';
import {lineOfSight,coneIntersection} from './geometry.js';
import {updateVision} from './vision.js';
const canvas=document.querySelector('#game'),context=canvas.getContext('2d');
const state=createState();
const posed=poseShot(state,new URLSearchParams(location.search));
const keys=installInput(canvas,state);
let previous=0,accumulator=0,lastStatus='';
function frame(now){
  if(previous)accumulator+=Math.min((now-previous)/1000,0.1);previous=now;
  while(accumulator>=1/60){if(!posed)tick(state,1/60,keys);accumulator-=1/60;}
  render(context,state);
  const status=`${state.level.name}. ${state.status}. Credits ${state.credits}. ${state.loot?'Loot secured.':'Find the loot.'}`;
  if(status!==lastStatus){document.querySelector('#hud').textContent=status;lastStatus=status;}
  requestAnimationFrame(frame);
}
document.querySelector('#sound').addEventListener('click',e=>{e.target.textContent=toggleSound()?'SOUND ON':'SOUND OFF';});
window.vaultShift={state,keys,tick:(dt=1/60)=>tick(state,dt,keys),reset:()=>resetRoom(state),advance:()=>advanceRoom(state),
  waypoint:p=>setWaypoint(state,p),hide:()=>toggleHide(state),tool:(n,p)=>useTool(state,n,p),
  geometry:{lineOfSight,coneIntersection},updateVision:()=>updateVision(state),render:()=>render(context,state),createState};
render(context,state);requestAnimationFrame(frame);canvas.focus();
