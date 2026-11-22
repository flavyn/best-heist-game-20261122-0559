import {conePolygon} from './vision.js';
import {adjacentCover} from './geometry.js';
const C={bg:'#09121b',panel:'#101e29',line:'#2a3d49',muted:'#78909f',text:'#e0ebe9',mint:'#80ffd0',gold:'#ffda77',amber:'#ffb54e',cyan:'#70ddff',red:'#ff6a79'};
function box(c,x,y,w,h,fill,stroke,r=0){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
function text(c,label,x,y,size=12,color=C.text,font='Consolas, monospace',align='left'){c.fillStyle=color;c.font=`${size}px ${font}`;c.textAlign=align;c.fillText(label,x,y);c.textAlign='left';}
function line(c,points,color,width=1,dash=[]){c.beginPath();c.setLineDash(dash);c.strokeStyle=color;c.lineWidth=width;points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();c.setLineDash([]);}
function circle(c,x,y,r,fill,stroke){c.beginPath();c.arc(x,y,r,0,Math.PI*2);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1;c.stroke();}}
function glow(c,color,blur,draw){c.save();c.shadowColor=color;c.shadowBlur=blur;draw();c.restore();}
function wrapped(c,str,x,y,max,size=12,color=C.muted){let row='';for(const word of str.split(' ')){if((row+word).length>max){text(c,row,x,y,size,color);row='';y+=19;}row+=word+' ';}text(c,row,x,y,size,color);}
function diamond(c,x,y,size,color){c.beginPath();c.moveTo(x,y-size);c.lineTo(x+size*0.65,y);c.lineTo(x,y+size);c.lineTo(x-size*0.65,y);c.closePath();c.fillStyle=color;c.fill();line(c,[[x,y-size],[x+size*0.23,y],[x,y+size]],'#fff4c5');}
function drawCone(c,source,cover,color,disabled=false){
  if(disabled)return;
  const pts=conePolygon(source,cover),gradient=c.createRadialGradient(source.x,source.y,10,source.x,source.y,source.range);
  gradient.addColorStop(0,color+'46');gradient.addColorStop(0.65,color+'25');gradient.addColorStop(1,color+'0c');
  c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=gradient;c.fill();
  c.strokeStyle=color+'63';c.lineWidth=1;c.stroke();
}
function drawCover(c,r,i){
  box(c,r.x+5,r.y+8,r.w,r.h,'#03090caa',null,4);
  box(c,r.x,r.y,r.w,r.h,'#263947','#637987',4);
  box(c,r.x+5,r.y+5,r.w-10,r.h-10,'#1c2c37','#3b5260',2);
  c.save();c.beginPath();c.rect(r.x+6,r.y+6,r.w-12,r.h-12);c.clip();
  for(let k=-r.h;k<r.w;k+=13)line(c,[[r.x+k,r.y+r.h],[r.x+k+r.h,r.y]],'#314551',1);
  c.restore();
  box(c,r.x+10,r.y+r.h/2-12,r.w-20,24,'#1a2b35dd',null,2);
  text(c,r.label,r.x+r.w/2,r.y+r.h/2+3,10,'#a6b6bc','Consolas, monospace','center');
  for(const x of [r.x+8,r.x+r.w-8])for(const y of [r.y+8,r.y+r.h-8])circle(c,x,y,2,'#8b9ca3');
  line(c,[[r.x+9,r.y+2],[r.x+28,r.y+2]],C.mint,2);
  text(c,String(i+1).padStart(2,'0'),r.x+8,r.y+r.h+15,9,'#4c6473');
}
function drawGuard(c,g,i,s){
  const distracted=g.distract>0;
  circle(c,g.x+2,g.y+5,13,'#0008');
  c.save();c.translate(g.x,g.y);c.rotate(g.angle);
  box(c,-10,-9,19,18,'#b57c39','#ffca76',4);
  box(c,1,-5,11,10,'#f2c47b',null,3);box(c,9,-3,5,6,'#3a3b39');
  line(c,[[-7,-7],[-7,7]],'#6d4c2c',3);c.restore();
  circle(c,g.x,g.y,18,null,distracted?C.gold:'#ffb54e55');
  text(c,distracted?`? ${g.distract.toFixed(1)}s`:`G${i+1}`,g.x,g.y-25,10,distracted?C.gold:'#c1a375','Consolas, monospace','center');
  if(s.seenBy.includes(`PATROL ${i+1}`))text(c,'!',g.x,g.y-39,19,C.red,'Consolas, monospace','center');
}
function drawCamera(c,cam,i,jammed){
  c.save();c.translate(cam.x,cam.y);circle(c,0,0,14,'#0a1a25','#376274');
  c.rotate(cam.angle);box(c,-8,-7,20,14,jammed?'#304650':'#68bdd2','#a9eaff',3);box(c,9,-4,6,8,'#173645',C.cyan,1);c.restore();
  circle(c,cam.x-5,cam.y-10,2,jammed?C.muted:C.red);
  text(c,jammed?'LOOPED':`CCTV ${i+1}`,cam.x,cam.y+29,9,jammed?C.muted:C.cyan,'Consolas, monospace','center');
}
function drawThief(c,s){
  const p=s.thief,r=p.hidden?8:12;
  c.save();c.globalAlpha=p.hidden?0.55:1;
  circle(c,p.x+2,p.y+5,r+2,'#0008');
  glow(c,C.mint,18,()=>circle(c,p.x,p.y,r+6,null,C.mint+'66'));
  c.save();c.translate(p.x,p.y);c.rotate(p.angle);
  box(c,-10,-9,16,18,'#274d47',C.mint,5);circle(c,3,0,r-3,'#83ffd0');
  box(c,5,-6,5,12,'#0a2531',null,2);line(c,[[8,-3],[8,3]],'#e0fff2',1.5);
  box(c,-14,-5,6,10,'#496c61','#9ac7ab',2);c.restore();c.restore();
  text(c,p.hidden?'HIDDEN':'YOU',p.x,p.y+33,10,C.mint,'Consolas, monospace','center');
  if(s.loot)diamond(c,p.x-18,p.y-18,7,C.gold);
  if(!p.hidden&&adjacentCover(p,s.level.cover)&&s.status==='playing')text(c,'[ SPACE ] COVER',p.x,p.y+49,9,C.mint,'Consolas, monospace','center');
}
function drawFloor(c,s){
  const theme=s.level.accent;
  box(c,0,0,920,540,'#152530','#344c59',10);
  box(c,16,16,888,508,'#101e28','#4a5b60',4);
  c.save();c.beginPath();c.rect(24,24,872,492);c.clip();
  for(let y=24;y<516;y+=40)for(let x=24;x<896;x+=40){
    const n=((x*17+y*13+s.level.seed)%11);
    box(c,x,y,39,39,n<3?'#162630':'#13222c',null);
    circle(c,x+3,y+3,0.7,'#34414a');
  }
  // Floor geometry is architectural paint; collision belongs only to solid cover.
  line(c,[[70,492],[70,65],[855,65]],'#2d464d',2);
  line(c,[[77,492],[77,72],[855,72]],'#1e353d',1);
  line(c,[[120,480],[810,480]],'#33443e',2,[14,10]);
  text(c,'RESTRICTED / NIGHT OPERATIONS',450,505,10,'#41514f','Consolas, monospace','center');
  text(c,s.level.code,72,48,10,'#5e747b');
  text(c,'AUTHORIZED PERSONNEL ONLY',895,48,9,'#49616c','Consolas, monospace','right');
  c.restore();
  for(let x=36;x<900;x+=84){box(c,x,5,31,5,'#233944');line(c,[[x,7],[x+13,7]],theme+'77',2);}
  for(let y=60;y<500;y+=90){box(c,3,y,7,30,'#243946');box(c,909,y,7,30,'#243946');}
  // Draw the extraction arch before the actors, so the thief can stand inside it.
  const e=s.level.extraction,ec=s.loot?C.mint:'#87bcad';
  glow(c,ec,20,()=>{box(c,e.x-30,e.y-34,60,66,'#123a312b',ec,8);});
  line(c,[[e.x-34,e.y+31],[e.x-34,e.y-31],[e.x-23,e.y-41],[e.x+23,e.y-41],[e.x+34,e.y-31],[e.x+34,e.y+31]],ec,3);
  for(let y=e.y-24;y<e.y+27;y+=9)line(c,[[e.x-24,y],[e.x+24,y]],ec+'33');
  text(c,'EXTRACTION',e.x,e.y+55,11,ec,'Consolas, monospace','center');
  text(c,s.loot?'GATE OPEN':'LOOT REQUIRED',e.x,e.y+69,8,C.muted,'Consolas, monospace','center');
}
function drawLoot(c,s){
  if(s.loot)return;
  const l=s.level.loot,pulse=1+Math.sin(s.time*3)*0.08;
  glow(c,C.gold,30,()=>{circle(c,l.x,l.y,32*pulse,'#ffda7711','#ffda7755');diamond(c,l.x,l.y,20*pulse,C.gold);});
  circle(c,l.x,l.y,42,null,'#ffda772c');
  for(let a=0;a<4;a++){const angle=a*Math.PI/2+s.time*0.3;line(c,[[l.x+Math.cos(angle)*34,l.y+Math.sin(angle)*34],[l.x+Math.cos(angle)*39,l.y+Math.sin(angle)*39]],C.gold,2);}
  text(c,l.name,l.x,l.y+58,11,C.gold,'Consolas, monospace','center');
  text(c,'TARGET / +4 CR',l.x,l.y+73,9,'#aa9868','Consolas, monospace','center');
}
function drawWorld(c,s){
  c.save();c.translate(40,164);drawFloor(c,s);
  c.save();c.beginPath();c.rect(24,24,872,492);c.clip();
  for(const g of s.guards){line(c,g.points.concat([g.points[0]]).map(p=>[p.x,p.y]),'#bc985322',1,[3,8]);}
  for(const cam of s.cameras)drawCone(c,cam,s.level.cover,C.cyan,s.jammer>0);
  for(const g of s.guards)drawCone(c,g,s.level.cover,C.amber);
  if(s.route.length)line(c,[[s.thief.x,s.thief.y],...s.route.map(p=>[p.x,p.y])],C.mint+'55',1,[3,6]);
  if(s.waypoint){circle(c,s.waypoint.x,s.waypoint.y,8,null,C.mint);circle(c,s.waypoint.x,s.waypoint.y,3,C.mint);}
  c.restore();
  s.level.cover.forEach((r,i)=>drawCover(c,r,i));drawLoot(c,s);
  if(s.coin){const p=s.coin;circle(c,p.x,p.y,8+Math.sin(s.time*10)*3,null,C.gold);circle(c,p.x,p.y,3,C.gold);text(c,'COIN',p.x,p.y-18,9,C.gold,'Consolas, monospace','center');}
  s.cameras.forEach((cam,i)=>drawCamera(c,cam,i,s.jammer>0));s.guards.forEach((g,i)=>drawGuard(c,g,i,s));drawThief(c,s);
  if(s.status==='caught'){
    box(c,20,20,880,500,'#4b11284f',C.red,4);
    box(c,250,205,420,123,'#151c26f5','#ff6a7977',8);
    text(c,'SIGHTLINE LOST. YOU WERE CAUGHT.',460,245,18,C.red,'Consolas, monospace','center');
    text(c,'Rewinding this room. Your credits are safe.',460,276,12,C.text,'Consolas, monospace','center');
    text(c,'R  /  RETRY NOW',460,302,10,C.muted,'Consolas, monospace','center');
  }
  if(s.status==='clear'){
    box(c,220,192,480,155,'#0c242bf5','#80ffd099',8);
    text(c,s.index===2?'THE CITY NEVER SAW YOU.':'CLEAN GETAWAY',460,231,27,C.mint,'Arial, sans-serif','center');
    text(c,`${s.level.loot.name} SECURED  /  +7 CR TOTAL`,460,260,12,C.gold,'Consolas, monospace','center');
    text(c,`TIME ${Math.floor(s.elapsed)}s   •   PEAK ALARM ${Math.round(s.peak)}%`,460,285,10,C.muted,'Consolas, monospace','center');
    text(c,s.index===2?'N  /  RUN THE HEIST AGAIN':'N  /  NEXT ROOM',460,320,13,C.mint,'Consolas, monospace','center');
  }
  c.restore();
}
function drawSidebar(c,s){
  const x=986;
  box(c,x,164,254,540,C.panel,C.line,8);
  text(c,'SECURITY FEED',x+20,193,10,C.muted);
  circle(c,x+222,189,3,s.seenBy.length?C.red:C.mint);
  const danger=s.detection>60?C.red:s.detection>0?C.amber:C.mint;
  text(c,'ALARM',x+20,224,12,danger);
  text(c,String(Math.round(s.detection)).padStart(2,'0'),x+16,283,62,danger,'Arial, sans-serif');
  text(c,'/ 100',x+114,279,15,C.muted);
  for(let i=0;i<20;i++)box(c,x+20+i*10.5,301,7,21,i<s.detection/5?danger:'#263540');
  text(c,s.status==='caught'?'SIGNAL LOCKED':s.seenBy.length?'YOU ARE EXPOSED':'NO SIGHTLINE',x+20,347,12,danger);
  text(c,s.seenBy[0]||'Stay in the shadows.',x+20,368,10,C.muted);
  line(c,[[x+20,389],[x+234,389]],C.line);
  text(c,'THE TAKE',x+20,418,10,C.muted);
  text(c,String(s.credits).padStart(2,'0'),x+19,458,35,C.gold,'Arial, sans-serif');
  text(c,'CREDITS',x+87,456,11,C.gold);
  box(c,x+18,479,218,61,'#152932',s.credits>=2?'#3e5b60':C.line,5);
  text(c,'1',x+31,506,20,C.gold);text(c,'DECOY COIN',x+62,501,12,C.text);
  text(c,'2 CR  /  3s distraction',x+62,522,10,C.muted);
  box(c,x+18,550,218,61,s.jammer>0?'#173d48':'#152932',s.jammer>0?C.cyan:C.line,5);
  text(c,'2',x+31,577,20,C.cyan);text(c,s.jammer>0?`LOOPING ${s.jammer.toFixed(1)}s`:'CAMERA JAMMER',x+62,572,12,s.jammer>0?C.cyan:C.text);
  text(c,'3 CR  /  4s blind spot',x+62,593,10,C.muted);
  text(c,'SOLID COVER BLOCKS VISION',x+20,643,10,C.mint);
  wrapped(c,'Space near a crate to tuck in. Moving leaves cover.',x+20,665,33,10,C.muted);
}
export function render(c,s){
  c.clearRect(0,0,1280,800);c.fillStyle=C.bg;c.fillRect(0,0,1280,800);
  const wash=c.createLinearGradient(0,0,1280,800);wash.addColorStop(0,'#1c3e3a33');wash.addColorStop(1,'#11182a00');c.fillStyle=wash;c.fillRect(0,0,1280,800);
  // The broken square is the original Vault Shift insignia.
  line(c,[[42,54],[42,29],[67,29],[67,54],[57,54],[57,40],[52,40]],C.mint,3);
  text(c,'VAULT SHIFT',85,53,32,C.text,'Arial, sans-serif');
  text(c,'A QUIET KIND OF CRIME',87,75,9,C.mint);
  text(c,'THREE ROOMS. ONE CLEAN EXIT.',626,43,10,C.muted);
  for(let i=0;i<3;i++){
    const bx=626+i*126;line(c,[[bx,65],[bx+105,65]],i<=s.index?C.mint:C.line,2);
    text(c,`${String(i+1).padStart(2,'0')} / ${['VAULT','EXCHANGE','FREIGHT'][i]}`,bx,84,9,i===s.index?C.mint:C.muted);
  }
  line(c,[[40,101],[1240,101]],C.line);
  text(c,String(s.index+1).padStart(2,'0'),42,144,29,s.level.accent,'Arial, sans-serif');
  text(c,s.level.name.toUpperCase(),94,141,23,C.text,'Arial, sans-serif');
  text(c,s.level.subtitle,440,140,11,C.muted);
  text(c,s.loot?'●  TARGET SECURED':'◇  STEAL THE '+s.level.loot.name,953,138,11,s.loot?C.mint:C.gold,'Consolas, monospace','right');
  drawWorld(c,s);drawSidebar(c,s);
  circle(c,49,727,3,s.seenBy.length?C.red:C.mint);
  text(c,s.messageTimer>0?s.message:s.level.tip,64,731,11,s.seenBy.length?C.red:'#9cafaF');
  text(c,`LOOT ${s.loot?'1':'0'}/1`,948,731,10,C.gold,'Consolas, monospace','right');
  line(c,[[40,749],[1240,749]],C.line);
  const controls=[['WASD / ↑↓←→','MOVE'],['CLICK','WALK TO'],['SPACE','COVER'],['1 / 2','TOOLS'],['R','RETRY'],['N','NEXT ROOM']];
  controls.forEach(([key,label],i)=>{const x=42+i*198;text(c,key,x,778,11,'#d7e3df');text(c,label,x+(i===0?105:64),778,9,C.muted);});
}
