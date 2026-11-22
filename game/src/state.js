import {levels} from './levels.js';
import {distance,walkable,adjacentCover,findRoute} from './geometry.js';
import {updateVision} from './vision.js';
import {cue} from './audio.js';
export function createState(index=0,credits=6) {
  const level=levels[index];let seed=level.seed;
  const seeded=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  return {index,level,credits,checkpoint:credits,time:0,thief:{...level.spawn,angle:-Math.PI/2,hidden:false},
    guards:level.guards.map(g=>{const p=g.points[0],q=g.points[1],phase=seeded();return {...g,...p,speed:g.speed*(0.96+phase*0.08),target:1,angle:Math.atan2(q.y-p.y,q.x-p.x),range:218,spread:1.03,phase,distract:0,route:[],returnRoute:[]};}),
    cameras:level.cameras.map(c=>({...c,angle:c.base})),detection:0,peak:0,seenBy:[],jammer:0,coin:null,loot:false,status:'playing',caughtTimer:0,
    waypoint:null,route:[],message:'Find the gold. Read the light. Make your exit.',messageTimer:5,attempts:0,elapsed:0,paused:false};
}
export function resetRoom(s) { const fresh=createState(s.index,s.checkpoint);fresh.attempts=s.attempts+1;Object.assign(s,fresh); }
export function advanceRoom(s) {
  if(s.status!=='clear') return false;
  Object.assign(s,createState(s.index===2?0:s.index+1,s.index===2?6:s.credits));return true;
}
function message(s,text){s.message=text;s.messageTimer=3;}
export function setWaypoint(s,p) {
  if(s.status!=='playing'||!walkable(p,s.level)||s.guards.some(g=>distance(p,g)<20)) return false;
  const route=findRoute(s.thief,p,s.level);if(!route.length)return false;
  s.route=route;s.waypoint={...p};s.thief.hidden=false;return true;
}
export function toggleHide(s) {
  if(s.status!=='playing')return false;
  if(s.thief.hidden){s.thief.hidden=false;return true;}
  if(!adjacentCover(s.thief,s.level.cover)){message(s,'Get close to a crate to tuck into cover.');cue('denied');return false;}
  s.thief.hidden=true;s.route=[];s.waypoint=null;message(s,'Tucked in. Cover blocks sight; watch the open side.');cue('hide');return true;
}
export function useTool(s,tool,aim) {
  if(s.status!=='playing')return false;
  const cost=tool===1?2:3;
  if(s.credits<cost){message(s,'Not enough credits. Keep your tools for the right moment.');cue('denied');return false;}
  if(tool===2&&s.jammer>0){message(s,'Jammer is already running.');return false;}
  s.credits-=cost;
  if(tool===1){
    let p=aim&&walkable(aim,s.level)?{...aim}:{x:s.thief.x+80,y:s.thief.y};
    const d=distance(s.thief,p);if(d>180){p={x:s.thief.x+(p.x-s.thief.x)*180/d,y:s.thief.y+(p.y-s.thief.y)*180/d};}
    if(!walkable(p,s.level))p={x:s.thief.x,y:s.thief.y};
    const guard=[...s.guards].sort((a,b)=>distance(a,p)-distance(b,p))[0];
    guard.distract=3;guard.coin={...p};guard.route=findRoute(guard,p,s.level);s.coin={...p,life:3};
    message(s,'Coin away. Nearest patrol distracted for 3 seconds.');cue('coin');
  } else {s.jammer=4;message(s,'CCTV looped. Four seconds to cross.');cue('jam');}
  return true;
}
function moveThief(s,dx,dy,dt) {
  const p=s.thief,len=Math.hypot(dx,dy);if(len<0.001)return;
  p.hidden=false;p.angle=Math.atan2(dy,dx);const step=132*dt;
  const nx={x:p.x+dx/len*step,y:p.y};if(walkable(nx,s.level))p.x=nx.x;
  const ny={x:p.x,y:p.y+dy/len*step};if(walkable(ny,s.level))p.y=ny.y;
}
export function tick(s,dt,keys=new Set()) {
  if(s.paused)return;
  if(s.status==='caught'){s.caughtTimer-=dt;if(s.caughtTimer<=0)resetRoom(s);return;}
  if(s.status!=='playing')return;
  s.time+=dt;s.elapsed+=dt;s.messageTimer=Math.max(0,s.messageTimer-dt);s.jammer=Math.max(0,s.jammer-dt);
  if(s.coin){s.coin.life-=dt;if(s.coin.life<=0)s.coin=null;}
  const dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
  const dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
  if(dx||dy){s.route=[];s.waypoint=null;moveThief(s,dx,dy,dt);}
  else if(s.route.length){const goal=s.route[0];if(distance(s.thief,goal)<3){s.route.shift();if(!s.route.length)s.waypoint=null;}else moveThief(s,goal.x-s.thief.x,goal.y-s.thief.y,dt);}
  for(const g of s.guards) {
    if(g.distract>0){
      g.distract=Math.max(0,g.distract-dt);const p=g.route[0]||g.coin;
      if(p&&distance(g,p)>3){g.angle=Math.atan2(p.y-g.y,p.x-g.x);if(g.route.length){g.x+=Math.cos(g.angle)*g.speed*dt;g.y+=Math.sin(g.angle)*g.speed*dt;}}
      else if(g.route.length)g.route.shift();
      if(g.distract===0)g.returnRoute=findRoute(g,g.points[g.target],s.level);
    } else {
      const p=g.returnRoute[0]||g.points[g.target];g.angle=Math.atan2(p.y-g.y,p.x-g.x);
      const d=distance(g,p),step=g.speed*dt;
      if(d<=step){g.x=p.x;g.y=p.y;if(g.returnRoute.length)g.returnRoute.shift();else g.target=(g.target+1)%g.points.length;}else{g.x+=Math.cos(g.angle)*step;g.y+=Math.sin(g.angle)*step;}
    }
  }
  if(s.thief.hidden&&!adjacentCover(s.thief,s.level.cover))s.thief.hidden=false;
  const was=s.seenBy.length>0,seen=updateVision(s);
  if(seen&&!was)cue('alert');
  s.detection=Math.max(0,Math.min(100,s.detection+(seen?38:-24)*dt));s.peak=Math.max(s.peak,s.detection);
  if(s.detection>=100){s.status='caught';s.caughtTimer=1.45;s.route=[];cue('caught');return;}
  if(!s.loot&&distance(s.thief,s.level.loot)<25){s.loot=true;s.credits+=4;message(s,'Target secured. +4 credits. Head for extraction.');cue('loot');}
  if(s.loot&&distance(s.thief,s.level.extraction)<30){s.status='clear';s.credits+=3;s.route=[];s.waypoint=null;cue('clear');}
}
