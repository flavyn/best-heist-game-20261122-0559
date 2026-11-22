import {rayRect,coneIntersection} from './geometry.js';
export function conePolygon(source,cover) {
  const points=[{x:source.x,y:source.y}];
  for(let i=0;i<=64;i++) {
    const a=source.angle-source.spread/2+source.spread*i/64;
    let d=source.range;
    for(const r of cover) d=Math.min(d,rayRect(source,a,r,d));
    points.push({x:source.x+Math.cos(a)*d,y:source.y+Math.sin(a)*d});
  }
  return points;
}
export function cameraAngle(camera,time) { return camera.base+Math.sin(time*0.65+camera.phase)*0.67; }
export function updateVision(state) {
  for(const camera of state.cameras) camera.angle=cameraAngle(camera,state.time);
  state.seenBy=[];
  for(const [i,g] of state.guards.entries()) if(coneIntersection(g,state.thief,state.level.cover)) state.seenBy.push(`PATROL ${i+1}`);
  if(state.jammer<=0) for(const [i,c] of state.cameras.entries()) if(coneIntersection(c,state.thief,state.level.cover)) state.seenBy.push(`CCTV ${i+1}`);
  return state.seenBy.length>0;
}
