(() => {
  const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
  const W=960,H=600,TW=78,TH=39,OX=480,OY=205;
  const held=new Set();let last=0,toastTimer=0,toastUntil=0,selectedItem='spanner',mode='move';
  const player={x:4.3,y:4.4,face:1,step:0};
  const objects=[
    {id:'console',name:'AUXILIARY CONTROL CONSOLE',x:2,y:2,desc:'An old operations console. The display pulses with a weak green phosphor glow.',action:'The console rejects the service handshake. LOCAL AUTHORITY REQUIRED.'},
    {id:'pump',name:'COOLANT TRANSFER PUMP',x:7,y:2,desc:'A heavy pump housing. Its casing vibrates, though the pressure gauge reads zero.',action:'The pump is locked out. A manual pressure release is needed.'},
    {id:'locker',name:'PERSONAL STORAGE LOCKER',x:1,y:5,desc:'A dented locker with a faded name strip and several old inspection stamps.',action:'The locker is jammed. Something metallic rattles behind the door.'},
    {id:'terminal',name:'MAINTENANCE TERMINAL',x:6,y:5,desc:'A maintenance terminal patched into a much older wall conduit.',action:'TERMINAL: 3 SERVICE NOTICES / 1 UNREAD MESSAGE.'},
    {id:'hatch',name:'LOWER DECK HATCH',x:9,y:6,desc:'A circular access hatch set into the deck. Warm air leaks through its seal.',action:'HATCH SEALED. PRESSURE DIFFERENTIAL OUT OF RANGE.'}
  ];
  const log=document.getElementById('log'),toast=document.getElementById('toast');
  const say=(message)=>{const p=document.createElement('p');p.textContent='> '+message;log.insertBefore(p,log.lastElementChild);while(log.children.length>5)log.removeChild(log.firstChild);};
  function notify(message){toast.textContent=message;toast.classList.add('show');toastUntil=performance.now()+2300;}
  function iso(x,y){return{x:OX+(x-y)*TW/2,y:OY+(x+y)*TH/2};}
  function polygon(points,fill,stroke,width=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
  function line(points,color,width=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  function drawBackdrop(t){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#080d10');g.addColorStop(.55,'#111613');g.addColorStop(1,'#050706');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // distant station bulkheads and a narrow, dirty observation slit
    ctx.fillStyle='#171b17';ctx.fillRect(0,0,W,120);ctx.fillStyle='#25291f';ctx.fillRect(0,105,W,12);
    for(let x=15;x<W;x+=112){ctx.fillStyle='#25291e';ctx.fillRect(x,8,7,106);ctx.fillStyle='#080b09';ctx.fillRect(x+8,8,3,106);}
    ctx.fillStyle='#030708';ctx.fillRect(44,30,280,100);ctx.fillStyle='#0a1b23';ctx.fillRect(49,35,270,90);
    glow(185,82,130,'rgba(25,102,130,.2)');
    // Saturn in the distant window
    ctx.save();ctx.translate(183,81);ctx.rotate(-.18);ctx.strokeStyle='#8e9d91';ctx.lineWidth=10;ctx.beginPath();ctx.ellipse(0,0,80,23,0,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle='#8d8b73';ctx.beginPath();ctx.arc(0,0,39,0,Math.PI*2);ctx.fill();ctx.fillStyle='#555d55';ctx.beginPath();ctx.ellipse(0,0,80,23,0,0,Math.PI);ctx.stroke();ctx.restore();
    ctx.fillStyle='#080b09';ctx.fillRect(0,128,W,8);
    // upper cable bundles
    for(let i=0;i<8;i++){const x=i*137-20;line([[x,0],[x+12,27],[x+4,72],[x+30,111]],i%2?'#252d26':'#343027',3+i%3);}
    // occasional warning lamps
    glow(850,126,65,'rgba(185,25,17,.12)');ctx.fillStyle='#6e1d18';ctx.fillRect(824,105,43,7);ctx.fillStyle='#e34b27';ctx.fillRect(827,106,17,3);
    const vignette=ctx.createRadialGradient(480,300,170,480,300,590);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'rgba(0,0,0,.68)');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
  }
  function drawTile(x,y,t){
    const p=iso(x,y),w=TW/2,h=TH/2;
    polygon([[p.x,p.y],[p.x+w,p.y+h],[p.x,p.y+TH],[p.x-w,p.y+h]],(x+y)%3===0?'#292c25':(x*y)%4===0?'#202820':'#242821','#41463a',1);
    if((x*7+y*11)%5===0){line([[p.x-18,p.y+13],[p.x-5,p.y+17],[p.x+7,p.y+12]],'#4c3b2b',2);}
    if((x*3+y*5)%7===0){ctx.fillStyle='#0b100d';ctx.fillRect(p.x-3,p.y+14,8,2);}
    // seams and bolts
    if((x+y)%2===0){ctx.fillStyle='#59604b';ctx.fillRect(p.x-w+4,p.y+h-2,2,2);}
  }
  function drawWall(x,y,height=72){
    const p=iso(x,y),w=TW/2,h=TH/2;
    polygon([[p.x-w,p.y+h],[p.x,p.y+TH],[p.x,p.y+TH+height],[p.x-w,p.y+h+height]],'#171d18','#343d30',2);
    polygon([[p.x,p.y+TH],[p.x+w,p.y+h],[p.x+w,p.y+h+height],[p.x,p.y+TH+height]],'#25291f','#454638',2);
    line([[p.x-w+7,p.y+h+12],[p.x-4,p.y+TH+12]],'#566044',2);
    line([[p.x+6,p.y+TH+height-12],[p.x+w-5,p.y+h+height-12]],'#090d0a',3);
  }
  function drawCrate(x,y,s=1){
    const p=iso(x,y),w=25*s,h=13*s,z=27*s;
    polygon([[p.x-w,p.y+h],[p.x,p.y+2*h],[p.x+w,p.y+h],[p.x,p.y]],'#5a4934','#92744a',1);
    polygon([[p.x-w,p.y+h],[p.x,p.y+2*h],[p.x,p.y+2*h+z],[p.x-w,p.y+h+z]],'#302e25','#786344',1);
    polygon([[p.x,p.y+2*h],[p.x+w,p.y+h],[p.x+w,p.y+h+z],[p.x,p.y+2*h+z]],'#403b2d','#8c7148',1);
    line([[p.x-w+5,p.y+h+7],[p.x-4,p.y+2*h+4],[p.x-4,p.y+2*h+z-4]],'#a0804e',2);
    ctx.fillStyle='#b58b4d';ctx.fillRect(p.x-3,p.y+2*h+z/2,7,3);
  }
  function drawMachine(x,y,tall=true){
    const p=iso(x,y),z=tall?67:42;
    polygon([[p.x-24,p.y+12],[p.x,p.y+24],[p.x+24,p.y+12],[p.x,p.y]],'#3c4133','#858565',2);
    polygon([[p.x-24,p.y+12],[p.x,p.y+24],[p.x,p.y+24+z],[p.x-24,p.y+12+z]],'#292d25','#686c50',2);
    polygon([[p.x,p.y+24],[p.x+24,p.y+12],[p.x+24,p.y+12+z],[p.x,p.y+24+z]],'#191f1a','#4b5540',2);
    ctx.fillStyle='#aaff55';ctx.shadowColor='#aaff55';ctx.shadowBlur=9;ctx.fillRect(p.x-9,p.y+30,9,5);ctx.shadowBlur=0;
    line([[p.x-17,p.y+48],[p.x-5,p.y+54],[p.x-5,p.y+61]],'#7e8a5d',3);
  }
  function drawPipes(t){
    for(let i=0;i<5;i++){const x=50+i*185,y=144+(i%2)*22;line([[x,y],[x+100,y+25],[x+200,y+8]],i%2?'#3c342b':'#394238',7);line([[x,y-2],[x+100,y+23],[x+200,y+6]],'#687052',1);}
    // hanging ribbed conduit
    for(let i=0;i<12;i++){const x=590+i*16;ctx.strokeStyle=i%2?'#4b4030':'#272f26';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,142,13,Math.PI,Math.PI*2);ctx.stroke();}
  }
  function drawObject(o,t){
    const p=iso(o.x,o.y);
    if(o.id==='console'){drawMachine(o.x,o.y,true);ctx.fillStyle='#aaff55';ctx.shadowColor='#aaff55';ctx.shadowBlur=13;ctx.fillRect(p.x-11,p.y+31,14,7);ctx.shadowBlur=0;}
    if(o.id==='pump'){drawMachine(o.x,o.y,true);ctx.strokeStyle='#b15b32';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x+5,p.y+45,14,0,Math.PI*2);ctx.stroke();}
    if(o.id==='locker'){drawCrate(o.x,o.y,1.1);ctx.fillStyle='#b2a16b';ctx.fillRect(p.x-4,p.y+23,8,5);}
    if(o.id==='terminal'){drawMachine(o.x,o.y,true);ctx.fillStyle='#aaff55';ctx.fillRect(p.x-8,p.y+30,16,9);}
    if(o.id==='hatch'){ctx.strokeStyle='#7d8065';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(p.x,p.y+12,25,12,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#282e25';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(p.x,p.y+12,17,7,0,0,Math.PI*2);ctx.stroke();}
    if(Math.hypot(player.x-o.x,player.y-o.y)<1.35){ctx.fillStyle='#baff65';ctx.font='11px Share Tech Mono';ctx.fillText('[E] '+o.name,p.x-65,p.y-52);}
  }
  function drawRobot(t){
    const p=iso(player.x,player.y),bob=player.step?Math.sin(t*.018)*2:Math.sin(t*.002)*1;
    ctx.save();ctx.translate(p.x,p.y-4+bob);
    ctx.fillStyle='#0009';ctx.beginPath();ctx.ellipse(0,13,20,9,0,0,Math.PI*2);ctx.fill();
    // legs with offset feet
    polygon([[-12,-6],[-3,-2],[-5,17],[-14,19]],'#424a39','#8b9470',1);
    polygon([[3,-3],[12,-8],[15,15],[5,18]],'#30392e','#7b8666',1);
    // torso, deliberately asymmetrical utility chassis
    polygon([[-15,-42],[-8,-53],[9,-51],[16,-39],[12,-8],[-13,-7]],'#60684e','#a1a47b',2);
    polygon([[-8,-50],[9,-51],[12,-9],[-9,-9]],'#343d31','#778263',1);
    // external chest core and hazard panel
    ctx.fillStyle='#152018';ctx.fillRect(-5,-39,12,13);ctx.fillStyle='#aaff55';ctx.shadowColor='#aaff55';ctx.shadowBlur=8;ctx.fillRect(-2,-35,6,5);ctx.shadowBlur=0;
    polygon([[-15,-39],[-23,-35],[-20,-16],[-12,-18]],'#4c5541','#8b9470',1);
    polygon([[13,-40],[23,-34],[21,-12],[12,-15]],'#30382d','#87906c',1);
    // head and sensor slit
    polygon([[-10,-66],[-4,-73],[9,-70],[13,-60],[8,-51],[-9,-53]],'#778168','#b0b78a',2);
    ctx.fillStyle='#111b15';ctx.fillRect(-6,-64,14,5);ctx.fillStyle='#aaff55';ctx.shadowColor='#aaff55';ctx.shadowBlur=10;ctx.fillRect(-3,-63,8,2);ctx.shadowBlur=0;
    // cable bundle on one shoulder
    ctx.strokeStyle='#6b7654';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(11,-43);ctx.bezierCurveTo(29,-53,26,-23,18,-18);ctx.stroke();
    // spanner arm
    ctx.strokeStyle='#8b8d6c';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-17,-37);ctx.lineTo(-24,-18);ctx.lineTo(-20,-7);ctx.stroke();
    ctx.fillStyle='#a2a47b';ctx.fillRect(-24,-10,10,4);
    ctx.restore();
  }
  function drawScene(t){
    drawBackdrop(t);drawPipes(t);
    // far walls
    for(let x=0;x<10;x++)drawWall(x,0,63);
    // floor
    for(let sum=0;sum<19;sum++)for(let x=0;x<10;x++){const y=sum-x;if(y>=0&&y<8)drawTile(x,y,t);}
    // structural debris and industrial clutter
    drawCrate(0,3,1.15);drawCrate(8,1,.9);drawCrate(8,5,1.15);drawMachine(3,1,false);
    // oil-dark puddles and scattered metal
    for(const [x,y] of [[2,5],[5,3],[7,6]]){const p=iso(x,y);ctx.fillStyle='#080e0d';ctx.beginPath();ctx.ellipse(p.x,p.y+10,25,7,-.2,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#39483d';ctx.stroke();}
    // objects and player sorted by depth
    const actors=[...objects.map(o=>({y:o.x+o.y,draw:()=>drawObject(o,t)})),{y:player.x+player.y,draw:()=>drawRobot(t)}].sort((a,b)=>a.y-b.y);
    actors.forEach(a=>a.draw());
    // harsh pools of practical light
    const l1=iso(2,2),l2=iso(8,3);glow(l1.x,l1.y,90,'rgba(87,255,102,.09)');glow(l2.x,l2.y,85,'rgba(183,54,24,.12)');
    // edge shadow
    const vg=ctx.createRadialGradient(480,300,180,480,300,590);vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,0,.65)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }
  function nearest(){let best=null,d=99;for(const o of objects){const n=Math.hypot(player.x-o.x,player.y-o.y);if(n<d){d=n;best=o;}}return d<1.5?best:null;}
  function interact(){const o=nearest();if(!o){notify('NO SERVICE POINT IN RANGE');say('No accessible equipment nearby.');return;}say(o.action);notify(o.name);if(o.id==='terminal'){say('NOTICE 01: PRESSURE SENSOR FAULT / LOWER DECK');say('NOTICE 02: CREW QUARTERS POWER INTERRUPTED');}}
  function inspect(o){if(!o)o=nearest();if(!o){say('Nothing of interest in immediate range.');notify('NO OBJECT SELECTED');return;}say(o.desc);notify(o.name);}
  function update(dt){let dx=0,dy=0;if(held.has('w')||held.has('arrowup'))dy-=1;if(held.has('s')||held.has('arrowdown'))dy+=1;if(held.has('a')||held.has('arrowleft'))dx-=1;if(held.has('d')||held.has('arrowright'))dx+=1;if(dx&&dy){dx*=.707;dy*=.707;}player.x=Math.max(.25,Math.min(9.4,player.x+dx*2.5*dt));player.y=Math.max(.25,Math.min(7.4,player.y+dy*2.5*dt));player.step=dx||dy;if(dx)player.face=dx;document.getElementById('coords').textContent='GRID '+String(Math.floor(player.x)).padStart(2,'0')+'-'+String(Math.floor(player.y)).padStart(2,'0');}
  function frame(t){const dt=Math.min((t-last)/1000||0,.04);last=t;update(dt);drawScene(t);if(t>toastUntil)toast.classList.remove('show');requestAnimationFrame(frame);}
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();held.add(k);if(k==='e')interact();if(k===' '){inspect();}});window.addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>held.clear());
  canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;let hit=null,dist=65;for(const o of objects){const p=iso(o.x,o.y),d=Math.hypot(x-p.x,y-(p.y+18));if(d<dist){dist=d;hit=o;}}inspect(hit);});
  document.querySelectorAll('.item').forEach(b=>b.addEventListener('click',()=>{if(b.classList.contains('empty'))return;document.querySelectorAll('.item').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selectedItem=b.dataset.item;const desc={spanner:'FIELD SPANNER / WORN / SERVICE TOOL',cell:'POWER CELL / 62% CHARGE / STANDARD FIT',keycard:'ACCESS CARD / CREW SERVICES / LEVEL 2'};document.getElementById('item-description').textContent=desc[selectedItem];say('Selected '+selectedItem.toUpperCase()+'.');}));
  document.querySelectorAll('.action').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.action').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.action;if(mode==='interact')interact();if(mode==='inspect')inspect();if(mode==='terminal'){say('LOCAL TERMINAL LINK ACTIVE.');say('3 SERVICE NOTICES AVAILABLE.');notify('TERMINAL LOG UPDATED');}if(mode==='move')notify('MOVEMENT CONTROL ACTIVE');}));
  document.getElementById('loading')?.classList.add('hidden');say('SRV-09 ONLINE. AWAITING TASKING.');requestAnimationFrame(frame);
})();