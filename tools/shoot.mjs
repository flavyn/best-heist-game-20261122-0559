import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, mkdtempSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir, homedir } from 'node:os';
import { createHash } from 'node:crypto';

const require=createRequire(import.meta.url);
let playwright;
try { playwright=require('playwright'); }
catch { playwright=createRequire(join(homedir(),'package.json'))('playwright'); }
const root=dirname(dirname(fileURLToPath(import.meta.url))),port=18861,origin=`http://127.0.0.1:${port}`;
const server=spawn(process.execPath,['serve.ts'],{cwd:root,env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});
let browser;
const errors=[],outside=[],responses=[];
const pass=line=>console.log(`AUDIT PASS ${line}`);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const manifest=dir=>{
  const result={};
  function walk(path){for(const e of readdirSync(path,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const p=join(path,e.name);if(e.isDirectory())walk(p);else result[relative(dir,p).replaceAll('\\','/')]=hash(readFileSync(p));}}
  walk(dir);return result;
};
try {
  await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(new Error(`Server exited ${code}`)));});
  browser=await playwright.chromium.launch({channel:'chrome',headless:true,args:['--disable-background-networking','--no-first-run']});
  const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    if(url.origin!==origin){outside.push(url.href);return route.abort();}
    return route.continue();
  });
  const page=await context.newPage();
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)responses.push(`${r.status()} ${r.url()}`);});
  await page.goto(origin);await page.waitForFunction(()=>!!window.vaultShift);
  assert.match(await browser.version(),/\d+/);pass('real Chrome boot / 1280x800 canvas');
  const before=await page.evaluate(()=>window.vaultShift.state.thief.x);
  await page.keyboard.down('d');await page.waitForFunction(x=>window.vaultShift.state.thief.x>x+16,before);await page.keyboard.up('d');
  assert.ok(await page.evaluate(x=>window.vaultShift.state.thief.x>x+16,before));
  await page.keyboard.down('ArrowUp');
  await page.waitForFunction(()=>window.vaultShift.state.thief.y<437);await page.keyboard.up('ArrowUp');
  pass('WASD and arrow keyboard movement');
  await page.keyboard.press('r');
  await page.mouse.click(185,644); // world 145,480: open floor, below the first crate.
  await page.waitForFunction(()=>{const p=window.vaultShift.state.thief;return Math.hypot(p.x-145,p.y-480)<5;});
  await page.evaluate(()=>{const s=window.vaultShift.state;s.paused=true;s.route=[];s.waypoint=null;});
  await page.mouse.click(255,554); // solid cover
  assert.equal(await page.evaluate(()=>window.vaultShift.state.waypoint),null);
  const gp=await page.evaluate(()=>({x:window.vaultShift.state.guards[0].x+40,y:window.vaultShift.state.guards[0].y+164}));
  await page.mouse.click(gp.x,gp.y);assert.equal(await page.evaluate(()=>window.vaultShift.state.waypoint),null);
  pass('mouse waypoint arrival / cover and guard clicks ignored');
  await page.evaluate(()=>{
    const a=window.vaultShift,s=a.state;Object.assign(s,a.createState());
    s.paused=true;s.thief.x=145;s.thief.y=385;
    const g=s.guards[0];Object.assign(g,{x:315,y:385,angle:Math.PI});s.guards=[g];s.cameras=[];a.updateVision();
  });
  assert.equal(await page.evaluate(()=>window.vaultShift.state.seenBy.length),0);
  await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>window.vaultShift.state.thief.hidden),true);
  assert.ok(await page.evaluate(()=>{
    const a=window.vaultShift,s=a.state;
    const blocked=!a.geometry.lineOfSight(s.guards[0],s.thief,s.level.cover);
    Object.assign(s.guards[0],{x:90,y:385,angle:0});a.updateVision();
    return blocked&&s.seenBy.length===1;
  }));
  await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>window.vaultShift.state.thief.hidden),false);
  pass('Space cover-hide toggle / crate occlusion / exposed side stays visible');
  const alarm=await page.evaluate(()=>{
    const a=window.vaultShift,s=a.state;Object.assign(s,a.createState());
    s.level={...s.level,cover:[]};s.thief.x=300;s.thief.y=100;s.cameras=[];
    const g=s.guards[0];Object.assign(g,{x:200,y:100,speed:0,points:[{x:200,y:100},{x:400,y:100}],target:1});s.guards=[g];
    for(let i=0;i<100;i++)a.tick();const filling=s.detection;
    s.thief.y=400;for(let i=0;i<30;i++)a.tick();const cooling=s.detection;
    s.thief.y=100;for(let i=0;i<150&&s.status==='playing';i++)a.tick();const caught=s.status==='caught';
    for(let i=0;i<90;i++)a.tick();const reset=s.status==='playing'&&s.detection===0&&s.thief.x===s.level.spawn.x;
    s.paused=true;return{filling,cooling,caught,reset};
  });
  assert.ok(alarm.filling>50&&alarm.cooling<alarm.filling&&alarm.caught&&alarm.reset,JSON.stringify(alarm));
  pass('alarm fills and cools / full alarm caught / automatic fair room reset');
  await page.evaluate(()=>{const a=window.vaultShift;Object.assign(a.state,a.createState());a.state.paused=true;});
  await page.mouse.move(420,634);await page.keyboard.press('1');
  assert.deepEqual(await page.evaluate(()=>({credits:window.vaultShift.state.credits,coin:!!window.vaultShift.state.coin,distracted:window.vaultShift.state.guards.filter(g=>g.distract===3).length})),{credits:4,coin:true,distracted:1});
  await page.evaluate(()=>{const a=window.vaultShift,s=a.state;s.paused=false;for(let i=0;i<181;i++)a.tick();s.paused=true;});
  assert.equal(await page.evaluate(()=>window.vaultShift.state.guards.some(g=>g.distract>0)),false);
  pass('decoy costs 2 credits / nearest guard distracted for 3 seconds');
  await page.keyboard.press('r');
  await page.evaluate(()=>{window.vaultShift.state.paused=true;});
  await page.keyboard.press('2');
  assert.deepEqual(await page.evaluate(()=>({credits:window.vaultShift.state.credits,jammer:window.vaultShift.state.jammer})),{credits:3,jammer:4});
  const jam=await page.evaluate(()=>{
    const a=window.vaultShift,s=a.state;s.paused=false;s.guards=[];s.level={...s.level,cover:[]};
    s.cameras=[{x:200,y:100,base:0,phase:0,angle:0,range:270,spread:0.77}];s.thief.x=300;s.thief.y=100;
    for(let i=0;i<230;i++)a.tick();const blind=s.detection===0&&s.jammer>0;
    for(let i=0;i<12;i++)a.tick();s.time=0;a.updateVision();const active=s.jammer===0&&s.seenBy.length===1;
    s.paused=true;return{blind,active};
  });
  assert.ok(jam.blind&&jam.active,JSON.stringify(jam));
  pass('jammer costs 3 credits / cameras blind for 4 seconds then recover');
  const rewards=await page.evaluate(()=>{
    const a=window.vaultShift,s=a.state;Object.assign(s,a.createState());
    s.thief={...s.thief,...s.level.extraction};a.tick();const locked=s.status==='playing';
    s.thief={...s.thief,...s.level.loot};a.tick();const loot=s.loot&&s.credits===10;
    s.thief={...s.thief,...s.level.extraction};a.tick();return{locked,loot,clear:s.status==='clear',credits:s.credits};
  });
  assert.deepEqual(rewards,{locked:true,loot:true,clear:true,credits:13});
  await page.keyboard.press('n');assert.equal(await page.evaluate(()=>window.vaultShift.state.index),1);
  const progression=await page.evaluate(()=>{
    const a=window.vaultShift,s=a.state;let count=1;
    for(let room=1;room<3;room++){
      s.thief={...s.thief,...s.level.loot};a.tick();s.thief={...s.thief,...s.level.extraction};a.tick();
      if(s.status==='clear')count++;if(room===1)a.advance();
    }
    const final=s.index===2&&s.status==='clear'&&s.credits===27;a.advance();return{count,final,restart:s.index===0&&s.credits===6};
  });
  assert.deepEqual(progression,{count:3,final:true,restart:true});
  pass('loot +4 / locked extraction / payout +3 / N advances all three rooms');
  const deterministic=await page.evaluate(()=>{
    const a=window.vaultShift,one=a.createState(2),two=a.createState(2);
    // The fixed-step API acts on the exposed state; independent fixtures verify identical timelines.
    Object.assign(a.state,one);for(let i=0;i<90;i++)a.tick();const first=JSON.stringify(a.state);
    Object.assign(a.state,two);for(let i=0;i<90;i++)a.tick();return first===JSON.stringify(a.state);
  });
  assert.ok(deterministic);pass('seeded simulation repeats byte-identical state');
  const navigation=await page.evaluate(async()=>{
    const {findRoute,walkable,lineOfSight,circleRect}=await import('./src/geometry.js');
    const a=window.vaultShift,results=[];
    for(let level=0;level<3;level++){
      const fixture=a.createState(level),layout=fixture.level;
      const route=findRoute(layout.spawn,layout.loot,layout),exit=findRoute(layout.loot,layout.extraction,layout);
      let valid=route.length>0&&exit.length>0;
      for(const path of [[layout.spawn,...route],[layout.loot,...exit]])for(let j=1;j<path.length;j++){
        for(let k=0;k<=20;k++)valid&&=walkable({x:path[j-1].x+(path[j].x-path[j-1].x)*k/20,y:path[j-1].y+(path[j].y-path[j-1].y)*k/20},layout);
      }
      // Sample every authored patrol segment to prevent guards walking through solid crates.
      for(const guard of layout.guards)for(let j=0;j<guard.points.length;j++){
        const p=guard.points[j],q=guard.points[(j+1)%guard.points.length];
        for(let k=0;k<=100;k++){const point={x:p.x+(q.x-p.x)*k/100,y:p.y+(q.y-p.y)*k/100};valid&&=!layout.cover.some(r=>circleRect(point,r,10));}
      }
      results.push(valid);
    }
    return results;
  });
  assert.deepEqual(navigation,[true,true,true]);pass('three reachable loot and exit routes / all patrols clear solid cover');
  const economy=await page.evaluate(()=>{
    const a=window.vaultShift,s=a.state;Object.assign(s,a.createState());
    s.credits=1;const denied=!a.tool(1)&&!a.tool(2)&&s.credits===1;
    s.thief={...s.thief,...s.level.loot};a.tick();const collected=s.credits===5;
    a.reset();const restored=s.credits===6&&!s.loot;return denied&&collected&&restored;
  });
  assert.ok(economy);pass('insufficient credits denied / retry restores checkpoint without loot farming');
  const names=['01-cover.jpg','02-alert.jpg','03-clear.jpg','04-freight.jpg'];
  const queries=['play&level=0','alert&level=1','clear&level=0','vault&level=2'];
  for(let i=0;i<4;i++){
    await page.goto(`${origin}/?shot=${queries[i]}`);await page.waitForFunction(()=>window.vaultShift?.state.paused);
    await page.evaluate(()=>window.vaultShift.render());
    const path=join(root,'screenshots',names[i]);await page.screenshot({path,type:'jpeg',quality:88});
    const bytes=readFileSync(path),size=bytes.length;assert.ok(size<=262144);
    assert.equal(page.viewportSize().width,1280);assert.equal(page.viewportSize().height,800);
    console.log(`SCREENSHOT ${names[i]} 1280x800 ${size} bytes`);
  }
  assert.deepEqual(errors,[]);assert.deepEqual(responses,[]);assert.deepEqual(outside,[]);
  pass('zero page errors / zero failed resources / zero requests outside game/');
  const target=mkdtempSync(join(tmpdir(),'vault-shift-audit-'));
  for(const name of ['first','second']){
    const result=spawnSync(process.execPath,['main.ts'],{cwd:root,env:{...process.env,MAKEFUN_OUTPUT_DIR:join(target,name)},encoding:'utf8',windowsHide:true});
    assert.equal(result.status,0,result.stdout+result.stderr);
  }
  const first=manifest(join(target,'first')),second=manifest(join(target,'second'));assert.deepEqual(first,second);
  assert.ok(statSync(join(target,'first','dossier.json')).size<=1572864);
  const owner=readFileSync(join(root,'.makefun','owner.json'),'utf8');assert.equal(owner,'{"wallet":"3fDEba6sqMDvQJXT3UJbUoZGxK1Vk6PcUbtCwGuF2yYy"}');
  pass(`two main.ts runs byte-identical / ${Object.keys(first).length} files / dossier within 1.5 MiB`);
  console.log(`BUILD SHA256 ${hash(Buffer.from(JSON.stringify(first)))}`);
  pass('all checks complete');
} finally {if(browser)await browser.close();server.kill();}
