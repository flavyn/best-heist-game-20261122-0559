export const distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export function inRect(p,r,pad=0) { return p.x>=r.x-pad && p.x<=r.x+r.w+pad && p.y>=r.y-pad && p.y<=r.y+r.h+pad; }
export function circleRect(p,r,radius=11) {
  return Math.hypot(p.x-clamp(p.x,r.x,r.x+r.w),p.y-clamp(p.y,r.y,r.y+r.h)) < radius;
}
export function rayRect(origin,angle,r,maxDistance) {
  const dx=Math.cos(angle),dy=Math.sin(angle);
  let near=0,far=maxDistance;
  for(const [start,dir,min,max] of [[origin.x,dx,r.x,r.x+r.w],[origin.y,dy,r.y,r.y+r.h]]) {
    if(Math.abs(dir)<1e-9) { if(start<min || start>max) return maxDistance; }
    else { const a=(min-start)/dir,b=(max-start)/dir; near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b)); }
  }
  return far>=near ? near : maxDistance;
}
export function lineOfSight(a,b,cover) {
  const d=distance(a,b),angle=Math.atan2(b.y-a.y,b.x-a.x);
  return cover.every(r=>rayRect(a,angle,r,d)>=d-0.1);
}
export function coneIntersection(source,target,cover) {
  if(distance(source,target)>source.range) return false;
  const angle=Math.atan2(target.y-source.y,target.x-source.x);
  const delta=Math.atan2(Math.sin(angle-source.angle),Math.cos(angle-source.angle));
  return Math.abs(delta)<=source.spread/2 && lineOfSight(source,target,cover);
}
export function walkable(p,level,radius=11) {
  return p.x>=24+radius && p.y>=24+radius && p.x<=896-radius && p.y<=516-radius && !level.cover.some(r=>circleRect(p,r,radius));
}
export function adjacentCover(p,cover) { return cover.some(r=>circleRect(p,r,31)); }
// Deterministic four-neighbour routing; every segment has clearance for the thief.
export function findRoute(start,end,level) {
  if(!walkable(end,level)) return [];
  const cell=20,cols=46,key=p=>`${Math.floor(p.x/cell)},${Math.floor(p.y/cell)}`;
  const begin=key(start),goal=key(end),queue=[begin],parents=new Map([[begin,null]]);
  for(let head=0;head<queue.length;head++) {
    const cur=queue[head]; if(cur===goal) break;
    const [x,y]=cur.split(',').map(Number);
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]) {
      const next=`${x+dx},${y+dy}`,p={x:(x+dx)*cell+10,y:(y+dy)*cell+10};
      if(x+dx<0||x+dx>=cols||parents.has(next)||!walkable(p,level,13)) continue;
      parents.set(next,cur);queue.push(next);
    }
  }
  if(!parents.has(goal)) return [];
  const route=[];let cur=goal;
  while(cur!==begin) { const [x,y]=cur.split(',').map(Number);route.unshift({x:x*cell+10,y:y*cell+10});cur=parents.get(cur); }
  route.push({...end});return route;
}
