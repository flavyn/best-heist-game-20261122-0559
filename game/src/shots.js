import {createState,tick} from './state.js';
import {updateVision} from './vision.js';
// Query poses are frozen in-engine stills, using the same painter and objects as play.
export function poseShot(state,params) {
  const shot=params.get('shot');if(!shot)return false;
  const index=Math.max(0,Math.min(2,Number(params.get('level'))||0));
  Object.assign(state,createState(index));
  for(let i=0;i<42;i++)tick(state,1/60);
  if(shot==='play'){state.thief.x=300;state.thief.y=405;state.thief.angle=-0.7;state.message='A narrow window. A clean getaway.';state.messageTimer=10;}
  if(shot==='alert'){
    const g=state.guards[0];state.thief.x=g.x+95;state.thief.y=g.y;g.angle=0;state.detection=76;state.peak=76;
    state.message='Exposed! Break the sightline before the alarm fills.';state.messageTimer=10;
  }
  if(shot==='clear'){state.loot=true;state.thief={...state.thief,...state.level.extraction};state.status='clear';state.credits=13;}
  if(shot==='vault'){state.thief.x=330;state.thief.y=365;state.thief.hidden=true;state.thief.angle=-1.1;state.message='The final hold. One stone between you and daylight.';state.messageTimer=10;}
  updateVision(state);state.paused=true;return true;
}
