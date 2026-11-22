const crate=(x,y,w,h,label='SECURE')=>({x,y,w,h,label});
const guard=(points,speed=44)=>({points:points.map(([x,y])=>({x,y})),speed});
const camera=(x,y,base,phase=0)=>({x,y,base,phase,range:270,spread:0.77});
export const levels = [
  {
    name:'Night Vault',subtitle:'The quiet entrance',code:'NV—01',seed:71,accent:'#80ffd0',
    brief:'Take the sunstone. Leave without a sound.',
    tip:'Crates cut sightlines. Circle the lower aisle, then slip north for the stone.',
    spawn:{x:105,y:450},loot:{x:766,y:126,name:'SUNSTONE'},extraction:{x:844,y:452},
    cover:[crate(165,350,110,72,'BONDS'),crate(330,230,92,110,'RECORDS'),crate(530,360,134,66,'RESERVE'),crate(570,115,90,96,'SECURE'),crate(210,100,112,66,'DEPOSIT')],
    guards:[guard([[440,80],[800,80],[800,290],[440,290]],43),guard([[320,440],[470,440],[470,350],[320,350]],38)],
    cameras:[camera(470,35,Math.PI/2,0.5)],
  },
  {
    name:'Neon Exchange',subtitle:'Buy yourself a blind spot',code:'NE—02',seed:113,accent:'#b8a1ff',
    brief:'Lift the prism from the exchange floor.',
    tip:'Three patrols cross the trading floor. Jam CCTV before the final approach.',
    spawn:{x:85,y:457},loot:{x:800,y:90,name:'PRISM CORE'},extraction:{x:847,y:462},
    cover:[crate(160,340,100,110,'LEDGER'),crate(160,130,130,65,'TRADES'),crate(350,290,145,65,'DESK 04'),crate(390,105,80,100,'SERVER'),crate(580,180,120,65,'DESK 09'),crate(650,365,100,82,'CREDITS')],
    guards:[guard([[510,80],[740,80],[740,290],[510,290]],51),guard([[310,440],[570,440],[570,370],[310,370]],44),guard([[80,250],[300,250],[300,70],[80,70]],40)],
    cameras:[camera(880,280,Math.PI,1.2),camera(510,35,Math.PI/2,3)],
  },
  {
    name:'Freight Hold',subtitle:'One last impossible thing',code:'FH—03',seed:193,accent:'#ffb97e',
    brief:'The auric heart is on the last outbound freight.',
    tip:'Use the container lanes. A coin buys three seconds; choose the moment.',
    spawn:{x:75,y:460},loot:{x:805,y:100,name:'AURIC HEART'},extraction:{x:850,y:465},
    cover:[crate(140,340,140,100,'FREIGHT 11'),crate(140,115,105,150,'CARGO 08'),crate(350,200,100,150,'CARGO 23'),crate(355,410,170,60,'FREIGHT 06'),crate(560,80,125,90,'CARGO 41'),crate(570,290,120,110,'CARGO 17'),crate(770,220,80,130,'SEALED')],
    guards:[guard([[300,80],[500,80],[500,370],[300,370]],53),guard([[720,70],[850,70],[850,180],[720,180]],48),guard([[540,470],[740,470],[740,420],[540,420]],49),guard([[80,80],[80,300],[300,300],[300,80]],43)],
    cameras:[camera(890,130,Math.PI,0.3),camera(510,35,Math.PI/2,2.3),camera(890,410,Math.PI,4.5)],
  },
];
