(() => {
  const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
  const W=960,H=600,TW=78,TH=39,OX=480,OY=205;
  const held=new Set();let last=0,toastTimer=0,toastUntil=0,selectedItem=null,mode='move';
  let started=false,charge=8,hasBattery=false,batteryUsed=false,powerOn=false,hasTool=false,doorOpen=false,gameEnded=false,inventory=[];
  const player={x:4.3,y:4.4,face:1,step:0,walkPhase:0,actionUntil:0};
  const objects=[
    {id:'battery',name:'PORTABLE POWER CELL',x:1,y:5,desc:'A portable reserve cell lies half-hidden beneath a maintenance trolley. Its casing is scratched, but the charge indicator still flickers.',action:'POWER CELL RECOVERED.'},
    {id:'generator',name:'AUXILIARY POWER DISTRIBUTION',x:2,y:2,desc:'A manual distribution console. The room circuits are isolated. Its emergency start sequence requires a charged unit.',action:'AUXILIARY POWER RESTORED.'},
    {id:'part',name:'LOCK-SERVICE MANIPULATOR',x:7,y:2,desc:'A compact mechanical attachment stored in a sealed service cradle. Its fine twin probes are designed to operate mechanical locks.',action:'LOCK-SERVICE MANIPULATOR RECOVERED.'},
    {id:'hatch',name:'MAINTENANCE EXIT',x:9,y:6,desc:'A heavy pressure door. The mechanical lock has no power and no accessible manual release.',action:'EXIT LOCKED. A LOCK-SERVICE MANIPULATOR IS REQUIRED.'}
  ];
  const log=document.getElementById('log'),toast=document.getElementById('toast');
  const say=(message)=>{const p=document.createElement('p');p.textContent='> '+message;log.insertBefore(p,log.lastElementChild);while(log.children.length>5)log.removeChild(log.firstChild);};
  function notify(message){toast.textContent=message;toast.classList.add('show');toastUntil=performance.now()+2300;}
  function iso(x,y){return{x:OX+(x-y)*TW/2,y:OY+(x+y)*TH/2};}
  function polygon(points,fill,stroke,width=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
  function line(points,color,width=1){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
  function glow(x,y,r,color){const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
  function drawBackdrop(t){
    const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#03080c');g.addColorStop(.42,'#0a1112');g.addColorStop(1,'#020403');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    // Deep structural ribs disappear into shadow; the room should feel larger than the camera can see.
    for(let x=-35;x<W+80;x+=94){
      polygon([[x,0],[x+19,0],[x+30,135],[x+11,151]],'#111918','#26312d',2);
      line([[x+5,0],[x+17,132]],'#3b4034',1);
      line([[x+24,15],[x+32,118]],'#050a09',4);
    }
    // Observation slit, almost swallowed by darkness.
    ctx.fillStyle='#010507';ctx.fillRect(42,29,286,105);ctx.fillStyle='#07151c';ctx.fillRect(48,35,274,91);
    glow(184,80,150,'rgba(24,92,125,.23)');
    ctx.save();ctx.translate(183,81);ctx.rotate(-.18);ctx.strokeStyle='#6b7d78';ctx.lineWidth=8;ctx.beginPath();ctx.ellipse(0,0,82,24,0,Math.PI,Math.PI*2);ctx.stroke();ctx.fillStyle='#887f69';ctx.beginPath();ctx.arc(0,0,39,0,Math.PI*2);ctx.fill();ctx.fillStyle='#35454a';ctx.beginPath();ctx.ellipse(0,0,80,23,0,0,Math.PI);ctx.stroke();ctx.restore();
    ctx.fillStyle='#030606';ctx.fillRect(0,128,W,12);
    // Bundles of old cable, sagging between structural ribs.
    for(let i=0;i<10;i++){const x=i*112-30;const col=['#222b28','#302d26','#111a19'][i%3];line([[x,0],[x+8,32],[x+26,57],[x+20,94],[x+47,130]],col,3+i%3);line([[x+3,0],[x+12,31],[x+30,57],[x+24,94],[x+51,130]],'#080e0d',1);}
    // Corroded conduit trunk with repeated collars.
    line([[350,0],[366,34],[359,82],[389,132]],'#34362d',13);line([[350,0],[366,34],[359,82],[389,132]],'#111918',8);
    for(let i=0;i<8;i++){const y=15+i*14;ctx.fillStyle='#62513b';ctx.fillRect(354+(i%2)*4,y,13,3);}
    // Localised emergency lamp, red light falling into black.
    glow(842,126,115,'rgba(175,28,18,.22)');ctx.fillStyle='#21100e';ctx.fillRect(814,101,55,13);ctx.fillStyle='#a32d20';ctx.fillRect(819,104,35,5);ctx.fillStyle='#ef6841';ctx.fillRect(821,105,12,2);
    // Fine soot, scratches and vignette.
    for(let i=0;i<145;i++){const x=(i*137)%W,y=(i*71)%H;ctx.fillStyle=i%3?'rgba(126,133,112,.055)':'rgba(0,0,0,.2)';ctx.fillRect(x,y,1+(i%3),1);}
    const vignette=ctx.createRadialGradient(480,300,115,480,300,610);vignette.addColorStop(0,'transparent');vignette.addColorStop(1,'rgba(0,0,0,.82)');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);
  }
  function drawTile(x,y,t){
    const p=iso(x,y),w=TW/2,h=TH/2;
    const shade=(x*13+y*7)%5;
    polygon([[p.x,p.y],[p.x+w,p.y+h],[p.x+1,p.y+TH],[p.x-w,p.y+h]],shade===0?'#171f1d':shade===1?'#20221d':'#191e1b','#303b35',1);
    // Broken seams, oily staining and hand-scratched maintenance marks.
    if((x*7+y*11)%4===0){ctx.fillStyle='rgba(0,0,0,.48)';ctx.beginPath();ctx.ellipse(p.x+((x%3)-1)*7,p.y+19,18,4,-.25,0,Math.PI*2);ctx.fill();line([[p.x-18,p.y+12],[p.x-5,p.y+16],[p.x+8,p.y+11]],'#514333',1.5);}
    if((x*3+y*5)%5===0){line([[p.x-w+8,p.y+h+2],[p.x-7,p.y+TH-5],[p.x+4,p.y+TH-2]],'#080d0b',2);line([[p.x-w+10,p.y+h+1],[p.x-7,p.y+TH-6]],'#586052',.7);}
    if((x+y)%2===0){ctx.fillStyle='#7b7358';ctx.fillRect(p.x-w+5,p.y+h-1,2,2);}
    if((x*5+y*3)%9===0){ctx.fillStyle='#090e0c';ctx.fillRect(p.x-23,p.y+18,34,2);for(let k=0;k<4;k++)ctx.fillRect(p.x-18+k*8,p.y+15,2,8);}
  }
  function drawWall(x,y,height=72){
    const p=iso(x,y),w=TW/2,h=TH/2;
    polygon([[p.x-w,p.y+h],[p.x,p.y+TH],[p.x,p.y+TH+height],[p.x-w,p.y+h+height]],'#0d1514','#29342e',2);
    polygon([[p.x,p.y+TH],[p.x+w,p.y+h],[p.x+w,p.y+h+height],[p.x,p.y+TH+height]],'#171d19','#394039',2);
    line([[p.x-w+7,p.y+h+12],[p.x-4,p.y+TH+12]],'#6a5438',2);
    line([[p.x+6,p.y+TH+height-12],[p.x+w-5,p.y+h+height-12]],'#050908',4);
    // Corroded seams and irregular repair plates.
    for(let i=0;i<5;i++){const yy=p.y+h+12+i*12;line([[p.x-w+4,yy],[p.x-w+13,yy+3],[p.x-4,yy+1]],i%2?'#252e28':'#4c3c2d',1);}
    ctx.fillStyle='#080d0b';ctx.fillRect(p.x-w+14,p.y+h+24,9,15);ctx.fillStyle='#8b482c';ctx.fillRect(p.x-w+15,p.y+h+25,2,12);
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
    // Heavy service pipes cross the ceiling, patched and sweating condensation.
    for(let i=0;i<5;i++){const x=25+i*185,y=144+(i%2)*22;line([[x,y],[x+100,y+25],[x+200,y+8]],'#080e0d',12);line([[x,y-2],[x+100,y+23],[x+200,y+6]],i%2?'#514332':'#465047',7);line([[x,y-4],[x+100,y+21],[x+200,y+4]],'#77715a',1);}
    // Ribbed, almost tendon-like insulated conduits.
    for(let i=0;i<17;i++){const x=520+i*17;ctx.strokeStyle=i%2?'#5a4432':'#252f2b';ctx.lineWidth=8;ctx.beginPath();ctx.arc(x,143,16,Math.PI,Math.PI*2);ctx.stroke();ctx.strokeStyle='#090f0e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,143,16,Math.PI,Math.PI*2);ctx.stroke();}
    // Hanging cable bundles descend into the machinery.
    for(let i=0;i<6;i++){const x=95+i*142;line([[x,0],[x-7,40],[x+4,76],[x-13,115]],'#080d0c',7);line([[x+2,0],[x-4,42],[x+9,77],[x-7,116]],'#515044',2);}
  }
  function drawObject(o,t){
    const p=iso(o.x,o.y);
    if(o.id==='battery'&&!hasBattery){
      drawCrate(o.x,o.y,.65);ctx.save();ctx.translate(p.x,p.y+1);ctx.rotate(-.2);
      polygon([[-13,-10],[10,-10],[14,-5],[14,12],[-13,12]],'#242e28','#a49b73',1.5);
      ctx.fillStyle='#77845e';ctx.fillRect(-9,-7,17,14);ctx.fillStyle='#111914';ctx.fillRect(-6,-4,11,7);ctx.fillStyle='#c4c98a';ctx.fillRect(-4,-2,7,3);
      ctx.fillStyle='#9a6338';ctx.fillRect(10,-6,4,4);ctx.restore();
    }
    if(o.id==='generator'){
      drawMachine(o.x,o.y,true);ctx.fillStyle=powerOn?'#b5e7a0':'#9b3328';ctx.shadowColor=powerOn?'#b5e7a0':'#9b3328';ctx.shadowBlur=12;ctx.fillRect(p.x-10,p.y+30,18,7);ctx.shadowBlur=0;
      line([[p.x-22,p.y+58],[p.x-33,p.y+69],[p.x-33,p.y+83]],'#121a17',5);line([[p.x-22,p.y+58],[p.x-33,p.y+69],[p.x-33,p.y+83]],'#786344',2);
    }
    if(o.id==='part'&&!hasTool){
      drawCrate(o.x,o.y,1);ctx.fillStyle='#8d9a79';ctx.fillRect(p.x-10,p.y+15,20,9);ctx.fillStyle='#1a211c';ctx.fillRect(p.x-7,p.y+17,14,5);
      line([[p.x-7,p.y+22],[p.x-15,p.y+32],[p.x-20,p.y+34]],'#a3a17b',3);line([[p.x+7,p.y+22],[p.x+15,p.y+31],[p.x+20,p.y+33]],'#a3a17b',3);
    }
    if(o.id==='hatch'){
      ctx.strokeStyle=doorOpen?'#8bbd83':'#7d8065';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(p.x,p.y+12,34,17,0,0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle='#171f1a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(p.x,p.y+12,25,11,0,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle=doorOpen?'#a7df9a':'#9a3328';ctx.fillRect(p.x-5,p.y+7,10,4);
    }
    if(Math.hypot(player.x-o.x,player.y-o.y)<1.35){ctx.fillStyle='#baff9b';ctx.font='11px Share Tech Mono';ctx.fillText('[E] '+o.name,p.x-65,p.y-52);}
  }
  // Sprite-sheet animation. Frames are extracted once from the repository asset.
  const unitSheet=new Image();
  const unitAnimations={idle:[],walk:[],interact:[]};
  let unitSpriteReady=false;
  unitSheet.onload=()=>{
    const specs={
      idle:[[20,20,270,240],[320,20,270,240],[620,20,270,240],[920,20,270,240]],
      walk:[[10,310,135,240],[160,310,135,240],[310,310,135,240],[460,310,135,240],[610,310,135,240],[760,310,135,240],[910,310,135,240],[1060,310,135,240]],
      interact:[[10,600,135,240],[160,600,135,240],[310,600,135,240],[460,600,135,240],[610,600,135,240],[760,600,135,240]]
    };
    // The sheet has white paper and black cell rules. Remove the paper by alpha-keying
    // near-white pixels; inset crops avoid most cell borders. Thin horizontal rules
    // are repaired from their neighbouring scanlines before the frames are keyed.
    const cleaned=document.createElement('canvas');
    cleaned.width=unitSheet.naturalWidth;cleaned.height=unitSheet.naturalHeight;
    const c=cleaned.getContext('2d',{willReadFrequently:true});
    c.drawImage(unitSheet,0,0);
    const imageData=c.getImageData(0,0,cleaned.width,cleaned.height),px=imageData.data;
    for(const y of [148,447]){
      for(let x=0;x<cleaned.width;x++){
        const i=(y*cleaned.width+x)*4,up=((y-1)*cleaned.width+x)*4,dn=((y+1)*cleaned.width+x)*4;
        for(let k=0;k<3;k++)px[i+k]=(px[up+k]+px[dn+k])>>1;
      }
    }
    c.putImageData(imageData,0,0);
    for(const [name,rects] of Object.entries(specs)){
      unitAnimations[name]=rects.map(([x,y,w,h])=>{
        const frame=document.createElement('canvas'),fc=frame.getContext('2d',{willReadFrequently:true});
        frame.width=w;frame.height=h;fc.drawImage(cleaned,x,y,w,h,0,0,w,h);
        const data=fc.getImageData(0,0,w,h),d=data.data;
        let minX=w,minY=h,maxX=0,maxY=0;
        for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){
          const i=(yy*w+xx)*4,rr=d[i],gg=d[i+1],bb=d[i+2];
          if(rr>218&&gg>218&&bb>210){d[i+3]=0;continue;}
          if(d[i+3]>0){minX=Math.min(minX,xx);minY=Math.min(minY,yy);maxX=Math.max(maxX,xx);maxY=Math.max(maxY,yy);}
        }
        fc.putImageData(data,0,0);
        const trim=document.createElement('canvas');
        const tw=Math.max(1,maxX-minX+1),th=Math.max(1,maxY-minY+1);
        trim.width=tw;trim.height=th;
        trim.getContext('2d').drawImage(frame,minX,minY,tw,th,0,0,tw,th);
        return {canvas:trim,width:tw,height:th};
      });
    }
    unitSpriteReady=true;
  };
  unitSheet.onerror=()=>{unitSpriteReady=false;};
  unitSheet.src='../../assets/sprites/Gemini_Generated_Image_jt74kajt74kajt74.jpeg';

  function drawRobot(t){
    if(!unitSpriteReady){drawRobotFallback(t);return;}
    const p=iso(player.x,player.y),now=performance.now();
    const interacting=now<player.actionUntil;
    const walking=!!player.step&&!interacting;
    const name=interacting?'interact':walking?'walk':'idle';
    const frames=unitAnimations[name];
    const fps=name==='idle'?6:name==='walk'?10:8;
    const index=name==='interact'
      ?Math.min(frames.length-1,Math.floor((800-(player.actionUntil-now))*fps/1000))
      :Math.floor((t/1000)*fps)%frames.length;
    const frame=frames[index]||frames[0];
    const targetHeight=112;
    const scale=targetHeight/frame.height;
    const dw=frame.width*scale,dh=targetHeight;
    ctx.save();ctx.translate(p.x,p.y-5);
    ctx.fillStyle='rgba(0,0,0,.58)';ctx.beginPath();ctx.ellipse(0,14,dw*.31,10,-.08,0,Math.PI*2);ctx.fill();
    if(player.face<0){ctx.scale(-1,1);}
    ctx.imageSmoothingEnabled=true;
    ctx.drawImage(frame.canvas,-dw*.5,-dh*.88,dw,dh);
    ctx.restore();
  }

  function drawRobotFallback(t){
    const p=iso(player.x,player.y),walking=!!player.step,phase=player.walkPhase;
    const swing=walking?Math.sin(phase)*.27:Math.sin(t*.0017)*.018;
    const bob=walking?Math.abs(Math.sin(phase*2))*1.8:Math.sin(t*.0021)*.85;
    const now=performance.now(),action=Math.max(0,1-Math.abs((now-(player.actionUntil-400))/400));
    const reach=action*15;
    ctx.save();ctx.translate(p.x,p.y-5);
    ctx.fillStyle='rgba(0,0,0,.58)';ctx.beginPath();ctx.ellipse(1,15+bob*.35,34,12,-.08,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.translate(-15,-37);ctx.rotate(-swing);ctx.translate(15,37);
    line([[-15,-37],[-27,-21],[-36,1],[-47,11]],'#171e19',11);line([[-15,-37],[-27,-21],[-36,1],[-47,11]],'#59634e',6);
    ctx.fillStyle='#242d26';ctx.beginPath();ctx.arc(-27,-22,7,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#9a9b74';ctx.lineWidth=2;ctx.stroke();
    polygon([[-48,9],[-39,5],[-31,12],[-36,16],[-51,15]],'#252e28','#8b9271',1.5);
    line([[-45,13],[-53,17]],'#b0a47c',2);line([[-36,12],[-41,19]],'#b0a47c',2);ctx.restore();
    ctx.save();ctx.translate(14,-34);ctx.rotate(swing);ctx.translate(-12,34);
    line([[14,-34],[25,-17],[28,3],[36,12]],'#171e19',13);line([[14,-34],[25,-17],[28,3],[36,12]],'#68745a',7);
    ctx.fillStyle='#222b25';ctx.beginPath();ctx.arc(25,-17,8,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a6a17a';ctx.lineWidth=2;ctx.stroke();
    polygon([[34,9],[44,7],[52,13],[47,17],[34,15]],'#252e28','#9a9b78',1.5);line([[45,13],[55,17]],'#b5a77b',2);line([[39,14],[44,21]],'#b5a77b',2);ctx.restore();
    ctx.save();ctx.translate(0,bob);ctx.rotate(-action*.035);
    polygon([[-24,-43],[-15,-53],[18,-51],[29,-40],[22,-23],[-17,-22]],'#171f1a','#77816a',2);
    line([[-18,-38],[20,-37]],'#9a9a72',2);line([[-12,-29],[15,-29]],'#444f40',4);
    polygon([[-31,-68],[-19,-80],[15,-78],[34,-65],[29,-39],[13,-31],[-23,-38],[-36,-51]],'#647052','#a4a783',2);
    polygon([[-31,-68],[-19,-80],[8,-77],[4,-48],[-23,-44],[-36,-51]],'#7d8768','#b1b28a',1.5);
    polygon([[4,-77],[15,-78],[34,-65],[29,-39],[13,-31],[4,-48]],'#394638','#899174',1.5);
    ctx.fillStyle='#d0c7a0';ctx.font='5px monospace';ctx.fillText('SRV-09',-22,-55);
    polygon([[9,-79],[17,-87],[27,-84],[30,-76],[20,-72],[11,-74]],'#303b30','#a1a582',2);
    polygon([[20,-65],[34,-62],[38,-54],[31,-44],[22,-48]],'#252e28','#a5a47e',2);
    ctx.fillStyle='#0a100d';ctx.beginPath();ctx.arc(31,-55,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d55b45';ctx.beginPath();ctx.arc(32,-56,1.8,0,Math.PI*2);ctx.fill();
    const elbow=[31+reach*.55,-42-reach*.28],tip=[38+reach,-34-reach*.52];
    line([[22,-48],elbow,tip],'#101712',7);line([[22,-48],elbow,tip],'#788365',3);
    line([tip,[tip[0]+5,-31-reach*.52]],'#a9a17b',2);line([tip,[tip[0]+5,-37-reach*.52]],'#a9a17b',2);
    ctx.restore();ctx.restore();
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
    const l1=iso(2,2),l2=iso(8,3);if(powerOn){glow(l1.x,l1.y,125,'rgba(87,190,125,.16)');glow(l2.x,l2.y,105,'rgba(183,54,24,.10)');}else{glow(l1.x,l1.y,55,'rgba(87,255,102,.025)');glow(l2.x,l2.y,85,'rgba(183,54,24,.12)');}
    // edge shadow
    const vg=ctx.createRadialGradient(480,300,180,480,300,590);vg.addColorStop(0,'transparent');vg.addColorStop(1,'rgba(0,0,0,.65)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
  }
  function nearest(){let best=null,d=99;for(const o of objects){const n=Math.hypot(player.x-o.x,player.y-o.y);if(n<d){d=n;best=o;}}return d<1.5?best:null;}
  function interact(){
    player.actionUntil=performance.now()+800;const o=nearest();
    if(!o){notify('NO SERVICE POINT IN RANGE');say('No accessible equipment nearby.');return;}
    if(o.id==='battery'){
      if(hasBattery){say('POWER CELL ALREADY RECOVERED.');return;}
      hasBattery=true;inventory.push({id:'cell',name:'POWER CELL',desc:'PORTABLE POWER CELL / 55 UNITS'});renderInventory();say('PORTABLE POWER CELL RECOVERED. SELECT IT IN INVENTORY TO USE.');notify('POWER CELL ACQUIRED');return;
    }
    if(o.id==='generator'){
      if(!hasBattery){say('START SEQUENCE BLOCKED. RECOVER A PORTABLE POWER CELL.');notify('POWER RESERVE REQUIRED');return;}
      if(!batteryUsed){say('START SEQUENCE BLOCKED. CHARGE RESERVE TOO LOW. USE THE POWER CELL.');notify('CHARGE UNIT FIRST');return;}
      if(!powerOn){powerOn=true;say('AUXILIARY DISTRIBUTION ONLINE. LIGHTING AND SERVICE CIRCUITS RESTORED.');say('LOCK-SERVICE STORAGE CRADLE RELEASED.');notify('ROOM POWER RESTORED');}
      else say('AUXILIARY POWER IS ALREADY ONLINE.');
      return;
    }
    if(o.id==='part'){
      if(!powerOn){say('STORAGE CRADLE IS UNPOWERED. RESTORE AUXILIARY DISTRIBUTION FIRST.');notify('CRADLE OFFLINE');return;}
      if(!hasTool){hasTool=true;say('LOCK-SERVICE MANIPULATOR RECOVERED AND INSTALLED.');notify('NEW PART INSTALLED');renderInventory();}
      else say('LOCK-SERVICE MANIPULATOR ALREADY INSTALLED.');
      return;
    }
    if(o.id==='hatch'){
      if(!hasTool){say('MECHANICAL LOCK REQUIRES A LOCK-SERVICE MANIPULATOR.');notify('ACCESS DENIED');return;}
      if(!powerOn){say('DOOR CONTROL CIRCUIT HAS NO POWER.');return;}
      doorOpen=true;gameEnded=true;say('MECHANICAL LOCK RELEASED. EXIT OPEN.');notify('ACCESS GRANTED');document.getElementById('end-screen').classList.remove('hidden');return;
    }
  }
  function inspect(o){if(!o)o=nearest();if(!o){say('Nothing of interest in immediate range.');notify('NO OBJECT SELECTED');return;}say(o.desc);notify(o.name);}
  function update(dt){
    if(!started||gameEnded)return;
    let dx=0,dy=0;if(held.has('w')||held.has('arrowup'))dy-=1;if(held.has('s')||held.has('arrowdown'))dy+=1;if(held.has('a')||held.has('arrowleft'))dx-=1;if(held.has('d')||held.has('arrowright'))dx+=1;
    if(dx&&dy){dx*=.707;dy*=.707;}
    player.x=Math.max(.25,Math.min(9.4,player.x+dx*2.5*dt));player.y=Math.max(.25,Math.min(7.4,player.y+dy*2.5*dt));player.step=dx||dy;if(player.step)player.walkPhase+=dt*9;if(dx)player.face=dx;
    charge=Math.max(0,charge-dt*.10);updateCharge();
    if(charge<=0){say('CRITICAL: UNIT POWER DEPLETED.');notify('POWER DEPLETED');gameEnded=true;document.getElementById('end-screen').classList.remove('hidden');document.querySelector('#end-screen .boot-mark').innerHTML='POWER<span> FAILURE</span>';document.querySelector('#end-screen .boot-message').innerHTML='UNIT SHUTDOWN<br>POWER RESERVE DEPLETED<br>RESTART TO TRY AGAIN';}
    document.getElementById('coords').textContent='GRID '+String(Math.floor(player.x)).padStart(2,'0')+'-'+String(Math.floor(player.y)).padStart(2,'0');
  }
  function frame(t){const dt=Math.min((t-last)/1000||0,.04);last=t;update(dt);drawScene(t);if(t>toastUntil)toast.classList.remove('show');requestAnimationFrame(frame);}
  window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();held.add(k);if(k==='e'){if(started&&!gameEnded){if(selectedItem==='cell')useSelected();else interact();}}if(k===' '&&started){inspect();}});window.addEventListener('keyup',e=>held.delete(e.key.toLowerCase()));window.addEventListener('blur',()=>held.clear());
  canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*W/r.width,y=(e.clientY-r.top)*H/r.height;let hit=null,dist=65;for(const o of objects){const p=iso(o.x,o.y),d=Math.hypot(x-p.x,y-(p.y+18));if(d<dist){dist=d;hit=o;}}inspect(hit);});
  function updateCharge(){const v=document.getElementById('charge-value'),bar=document.getElementById('charge-bar');if(v)v.textContent=String(Math.ceil(charge)).padStart(2,'0')+'%';if(bar)bar.style.width=Math.max(0,charge)+'%';}
  function renderInventory(){
    const grid=document.getElementById('inventory-grid');grid.innerHTML='';
    for(let i=0;i<6;i++){const item=inventory[i];const b=document.createElement('button');b.className='item'+(item&&selectedItem===item.id?' selected':'')+(!item?' empty':'');if(item){b.dataset.item=item.id;b.innerHTML='<span>'+(item.id==='cell'?'▥':'⌁')+'</span><small>'+item.name+'</small>';b.addEventListener('click',()=>{selectedItem=item.id;renderInventory();document.getElementById('item-description').textContent=item.desc;say('Selected '+item.name+'. Press E to use.');});}else b.innerHTML='<span>·</span>';grid.appendChild(b);}
    document.getElementById('item-count').textContent=String(inventory.length).padStart(2,'0')+' ITEMS';
    if(!inventory.length)document.getElementById('item-description').textContent='NO ITEMS STORED';
    else if(!selectedItem)document.getElementById('item-description').textContent='SELECT AN ITEM TO INSPECT';
  }
  function useSelected(){
    if(selectedItem==='cell'&&hasBattery&&!batteryUsed){batteryUsed=true;charge=Math.min(100,charge+55);inventory=inventory.filter(i=>i.id!=='cell');selectedItem=null;updateCharge();renderInventory();say('POWER CELL CONSUMED. INTERNAL CHARGE RESTORED.');notify('CHARGE +55');return;}
    if(selectedItem==='tool'&&hasTool){say('LOCK-SERVICE MANIPULATOR READY.');return;}
    say('NO USABLE ITEM SELECTED.');
  }
  document.querySelectorAll('.item').forEach(b=>b.addEventListener('click',()=>{}));
  document.getElementById('boot-button').addEventListener('click',()=>{started=true;document.getElementById('boot-screen').classList.add('hidden');say('BOOT COMPLETE. POWER RESERVE CRITICAL.');say('TASK: LOCATE A PORTABLE POWER CELL.');notify('CHARGE CRITICAL / 08%');});
  document.getElementById('reboot-button').addEventListener('click',()=>window.location.reload());
  document.querySelectorAll('.action').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.action').forEach(x=>x.classList.remove('active'));b.classList.add('active');mode=b.dataset.action;if(mode==='interact')interact();if(mode==='inspect')inspect();if(mode==='terminal'){say('LOCAL TERMINAL LINK ACTIVE.');say('3 SERVICE NOTICES AVAILABLE.');notify('TERMINAL LOG UPDATED');}if(mode==='move')notify('MOVEMENT CONTROL ACTIVE');}));
  document.getElementById('loading')?.classList.add('hidden');renderInventory();updateCharge();requestAnimationFrame(frame);
})();