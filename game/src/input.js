import {setWaypoint,toggleHide,useTool,resetRoom,advanceRoom} from './state.js';
export function installInput(canvas,state) {
  const keys=new Set();let aim=null;
  const position=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*1280/r.width-40,y:(e.clientY-r.top)*800/r.height-164};};
  window.addEventListener('keydown',e=>{
    const key=e.key.toLowerCase();
    if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(key))e.preventDefault();
    keys.add(key);if(e.repeat)return;
    if(key===' ')toggleHide(state);
    if(key==='1'||key==='2')useTool(state,Number(key),aim);
    if(key==='r')resetRoom(state);
    if(key==='n')advanceRoom(state);
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>keys.clear());
  document.addEventListener('visibilitychange',()=>{keys.clear();});
  canvas.addEventListener('pointermove',e=>{aim=position(e);});
  canvas.addEventListener('pointerdown',e=>{canvas.focus();const p=position(e);if(p.x>=0&&p.y>=0&&p.x<=920&&p.y<=540)setWaypoint(state,p);});
  return keys;
}
