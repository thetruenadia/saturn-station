// Workshop prototype: seeded salvage, lockers, loose pickups and physical specification recovery.
export function createWorkshopSystem({THREE,scene,robot,interactables,colliders,notify,sound,save,cellCount,setCellCount,onCraftProbe,onAccessCard,armModel}){
 const catalogue={
  motor:{name:'SERVO MOTOR',mass:2.4,value:48,color:0x8c987f},
  gear:{name:'REDUCTION GEARS',mass:1.1,value:20,color:0xa8a797},
  chip:{name:'CONTROL CHIP',mass:.2,value:90,color:0x4d9c8b},
  plate:{name:'ARMOUR PLATES',mass:1.8,value:30,color:0x9d956d},
  wire:{name:'WIRING LOOM',mass:.5,value:16,color:0xb47856},
  card:{name:'STAFF ACCESS CARD',mass:.1,value:0,color:0xc7b174},
  camera:{name:'BROKEN CAMERA',mass:.6,value:0,color:0x515d62},
  tin:{name:'RATION TIN',mass:.25,value:0,color:0xa9a78b}
 };
 const recipe={motor:1,gear:2,chip:1,plate:1,wire:2};
 let seed=0,inventory=[],lockerContents=[[],[],[],[]],opened=[false,false,false,false],specReleased=false,specUnlocked=false,probeInstalled=false,clawSalvaged=false,loose=[],activeLocker=-1,screenOpen=false,mode='craft',craftingUntil=0;
 const worldLoot=[];
 const shell=new THREE.MeshStandardMaterial({color:0x767f70,metalness:.55,roughness:.65});
 const steel=new THREE.MeshStandardMaterial({color:0x313c3b,metalness:.68,roughness:.55});
 const brass=new THREE.MeshStandardMaterial({color:0xb5a168,metalness:.5,roughness:.56});
 function cube(parent,w,h,d,mat,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 // Cream-painted factory lockers: four numbered individual compartments in one bank.
 const lockerDoors=[],lockerShelves=[],lockerRoots=[];
 const agedCream=new THREE.MeshStandardMaterial({color:0xb2ad97,metalness:.23,roughness:.91});
 const agedDark=new THREE.MeshStandardMaterial({color:0x6b685c,metalness:.38,roughness:.88});
 const numbered=new THREE.MeshStandardMaterial({color:0x913e35,roughness:.94});
 function numberPlaque(root,n){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,256,128);ctx.fillStyle='#913e35';ctx.font='bold 74px Georgia,serif';ctx.textAlign='center';ctx.fillText(String(n),128,86);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const plate=new THREE.Mesh(new THREE.PlaneGeometry(.37,.19),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}));
  plate.position.set(0,1.49,.075);root.add(plate);
 }
 function makeLocker(index,x,z){
  const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);
  // Doors face +Z; each frame stands on short legs, clear of the floor.
  // Hollow housing: four walls and a dark back, so the real parts sit on open shelves.
  cube(root,.96,2.12,.055,agedCream,0,1.13,-.34);
  for(const side of [-1,1])cube(root,.07,2.12,.68,agedCream,side*.46,1.13,0);
  cube(root,.94,.085,.70,agedCream,0,2.17,0);
  cube(root,.86,.065,.65,agedDark,0,.32,0);
  cube(root,.79,.06,.59,agedCream,0,.29,0);
  for(const y of [.65,1.22,1.78])cube(root,.75,.035,.47,agedCream,0,y,-.02);
  for(const side of [-1,1])cube(root,.095,.28,.64,agedDark,side*.39,.17,0);
  const pivot=new THREE.Group();pivot.position.set(-.43,0,.37);root.add(pivot);
  const door=new THREE.Group();door.position.set(.43,0,0);pivot.add(door);
  cube(door,.86,1.94,.068,agedCream,0,1.16,0);
  // Narrow, irregular lower scuffs and riveted hinges.
  for(let i=0;i<10;i++){const x=-.32+(i*37%65)/100,y=.28+(i*29%23)/100;cube(door,.06+(i%3)*.025,.01+(i%2)*.02,.008,agedDark,x,y,.041)}
  for(const y of [.45,1.1,1.92]){const hinge=cube(door,.075,.16,.11,agedDark,-.45,y,.055);hinge.rotation.y=.1}
  for(const y of [.40,1.78])for(const x of [-.26,.26]){
   const hole=new THREE.Mesh(new THREE.CylinderGeometry(.027,.027,.009,12),steel);hole.rotation.x=Math.PI/2;hole.position.set(x,y,.048);door.add(hole);
  }
  const knob=new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,.08,12),agedDark);
  knob.rotation.x=Math.PI/2;knob.position.set(.32,1.08,.11);door.add(knob);
  numberPlaque(door,106+index);
  // Faded raised lip across the bank, and stamped identification at each door.
  cube(root,.99,.095,.77,agedDark,0,2.24,0);
  root.userData={name:'SALVAGE LOCKER '+(106+index),x,z,workshopType:'locker',index};
  interactables.push(root);colliders.push([x,z,.48,.35]);
  lockerDoors.push(pivot);lockerRoots.push(root);
  const shelf=new THREE.Group();shelf.position.set(0,.69,.09);root.add(shelf);lockerShelves.push(shelf);
  return root;
 }
 // One shared four-door bank, positioned away from the central repair route.
 for(let i=0;i<4;i++)makeLocker(i,7.15+i*.98,1.15);
 const workbench=new THREE.Group();workbench.position.set(-9,0,2.2);scene.add(workbench);
 cube(workbench,1.2,.18,.8,steel,0,.95,0);cube(workbench,.12,.88,.1,shell,-.42,.47,0);cube(workbench,.12,.88,.1,shell,.42,.47,0);
 cube(workbench,.48,.28,.38,brass,0,1.15,0);
 workbench.userData={name:'MAINTENANCE CLAW WORKBENCH',x:-9,z:2.2,workshopType:'bench'};interactables.push(workbench);
 const terminalShard=new THREE.Group();terminalShard.position.set(-6.8,.65,-2.45);
 const shardMat=new THREE.MeshStandardMaterial({color:0x69bc9c,emissive:0x164e45,emissiveIntensity:.5,metalness:.65,roughness:.38});
 cube(terminalShard,.35,.48,.12,shardMat,0,0,0);cube(terminalShard,.27,.10,.14,steel,0,.29,0);
 terminalShard.userData={name:'FABRICATION SPEC SHARD',x:-6.8,z:-2.45,workshopType:'shard'};
 function setShardVisible(){if(specReleased&&!specUnlocked){scene.add(terminalShard);if(!interactables.includes(terminalShard))interactables.push(terminalShard)}else{scene.remove(terminalShard);const i=interactables.indexOf(terminalShard);if(i>=0)interactables.splice(i,1)}}
 function next(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
 function generate(type){const keys=['motor','gear','chip','plate','wire'];return {id:Math.floor(next()*1000000000).toString(36),type:type||keys[Math.floor(next()*keys.length)]};}
 function startFresh(){
  seed=(Math.floor(Math.random()*4294967295)>>>0)||12345;
  inventory=[];opened=[false,false,false,false];specReleased=false;specUnlocked=false;probeInstalled=false;clawSalvaged=false;for(const loot of [...worldLoot])removeWorldLoot(loot);loose=[];
  lockerContents=[[generate('card'),generate('camera'),generate('tin')],[generate('motor'),generate('plate'),generate('wire')],[generate('gear'),generate('wire')],[generate(),generate()]];
  refreshLockerModels();setShardVisible();updateUI();
 }
 function describe(item){
  const base=catalogue[item.type];return base.name+' · '+(item.type==='card'?'PERSONAL / ACCESS':item.type==='camera'||item.type==='tin'?'PERSONAL / JUNK':'MECHANICAL / COMPONENT')+' · '+base.mass.toFixed(1)+' KG'+(item.type==='card'?' · Note on reverse: ETNA':item.type==='camera'?' · Cracked lens; someone treasured its photographs.':item.type==='tin'?' · Empty, thankfully.':'');
 }
 function mass(){return inventory.reduce((n,p)=>n+catalogue[p.type].mass,0)}
 // Reuse the same recognisable mechanical silhouettes for stored and dropped salvage.
 function makePartModel(parent,type,scale=.85){
  const group=new THREE.Group();group.scale.setScalar(scale);parent.add(group);
  const tone=new THREE.MeshStandardMaterial({color:catalogue[type]?.color||0x807e6f,roughness:.72,metalness:.55});
  if(type==='card'){cube(group,.48,.3,.025,tone,0,0,0);cube(group,.24,.13,.03,brass,.08,.08,.02)}else if(type==='camera'){cube(group,.45,.3,.25,steel,0,0,0)}else if(type==='tin'){group.add(new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.3,14),tone))}else if(type==='motor'){
   const core=new THREE.Mesh(new THREE.CylinderGeometry(.20,.20,.58,16),tone);core.rotation.z=Math.PI/2;group.add(core);
   for(let i=-3;i<=3;i++)cube(group,.035,.45,.43,steel,i*.075,0,0);
   const axle=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.93,12),brass);axle.rotation.z=Math.PI/2;group.add(axle);
   for(const side of [-1,1])cube(group,.14,.12,.18,steel,side*.2,-.26,0);
  }else if(type==='gear'){
   const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.11,12),steel);wheel.rotation.x=Math.PI/2;group.add(wheel);
   for(let i=0;i<12;i++){const a=i*Math.PI/6;const tooth=cube(group,.10,.12,.13,tone,Math.sin(a)*.23,Math.cos(a)*.23,0);tooth.rotation.z=-a}
   const hub=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.15,16),brass);hub.rotation.x=Math.PI/2;group.add(hub);
  }else if(type==='chip'){
   cube(group,.47,.07,.36,tone,0,0,0);cube(group,.20,.065,.18,steel,0,.06,0);
   for(let i=0;i<5;i++)for(const s of [-1,1])cube(group,.025,.045,.07,brass,-.2+i*.1,.015,s*.21);
  }else if(type==='plate'){
   cube(group,.52,.075,.40,tone,0,0,0);for(const x of [-.19,.19])for(const z of [-.13,.13])cube(group,.055,.022,.055,steel,x,.049,z);
   cube(group,.45,.06,.32,steel,.09,-.07,.07);
  }else if(type==='wire'){
   for(let i=0;i<4;i++){
    const material=new THREE.MeshStandardMaterial({color:i%2?0x754f39:0x394d45,roughness:.83});
    const points=[new THREE.Vector3(-.30,0,i*.07-.11),new THREE.Vector3(-.08,.13,i*.07-.11),new THREE.Vector3(.14,-.10,i*.07-.11),new THREE.Vector3(.31,0,i*.07-.11)];
    group.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),14,.019,6,false),material));
   }
   for(const x of [-.32,.32])cube(group,.07,.16,.30,steel,x,0,0);
  }else cube(group,.35,.25,.35,tone,0,0,0);
  return group;
 }
 function removeWorldLoot(o){
  const i=interactables.indexOf(o);if(i>=0)interactables.splice(i,1);
  const j=worldLoot.indexOf(o);if(j>=0)worldLoot.splice(j,1);
  o.parent?.remove(o);
 }
 function refreshLockerModels(){
  for(const o of [...worldLoot])removeWorldLoot(o);
  lockerShelves.forEach((shelf,index)=>{
   shelf.clear();
   const items=lockerContents[index]||[];
   items.forEach((item,i)=>{
    const object=new THREE.Group();
    // Loose components are physical things on shelves, not a list of virtual locker slots.
    object.position.set(-.20+(i%2)*.38,.08+Math.floor(i/2)*.48,.15);
    makePartModel(object,item.type,.68);
    object.userData={name:catalogue[item.type].name,x:lockerRoots[index].position.x+object.position.x,
     z:lockerRoots[index].position.z+.22,workshopType:'locker-loot',index,itemId:item.id};
    shelf.add(object);worldLoot.push(object);
    if(opened[index])interactables.push(object);
   });
  });
 }
 function setLockerOpen(index){
  opened[index]=true;
  for(const o of worldLoot)if(o.userData.index===index&&!interactables.includes(o))interactables.push(o);
 }

 function createLoose(item,x,z,kind='component'){
  const root=new THREE.Group();root.position.set(x,0,z);
  const material=kind==='cell'?brass:catalogue[item.type]&&new THREE.MeshStandardMaterial({color:catalogue[item.type].color,metalness:.58,roughness:.5})||shell;
  if(kind==='cell'){cube(root,.36,.22,.36,material,0,.16,0);cube(root,.25,.08,.25,steel,0,.32,0)}else{const part=makePartModel(root,item.type,1);part.position.y=.28}
  root.userData={name:kind==='cell'?'DROPPED FUEL CELL':catalogue[item.type].name,x,z,workshopType:'loose',item,kind};
  scene.add(root);interactables.push(root);loose.push(root);return root;
 }
 function removeLoose(o){scene.remove(o);const i=interactables.indexOf(o);if(i>=0)interactables.splice(i,1);const j=loose.indexOf(o);if(j>=0)loose.splice(j,1)}
 function drop(item,index){
  if(index>=0)inventory.splice(index,1);
  const angle=robot.rotation.y;
  const x=THREE.MathUtils.clamp(robot.position.x+Math.sin(angle)*1.05,-12.2,12.2);
  const z=THREE.MathUtils.clamp(robot.position.z+Math.cos(angle)*1.05,-9.2,9.2);
  const object=createLoose(item,x,z);object.position.y=.65;object.userData.velocity=1.6;notify('COMPONENT DROPPED');sound('collect');updateUI();save();
 }
 function dropFuelCell(){
  if(cellCount()<1)return;
  setCellCount(cellCount()-1);
  const x=THREE.MathUtils.clamp(robot.position.x+Math.sin(robot.rotation.y)*1.1,-12.2,12.2);
  const z=THREE.MathUtils.clamp(robot.position.z+Math.cos(robot.rotation.y)*1.1,-9.2,9.2);
  const object=createLoose(null,x,z,'cell');object.position.y=.65;object.userData.velocity=1.25;notify('FUEL CELL DROPPED · 1.8 KG');updateUI();save();
 }
 // Non-modal side panels: the 3D game stays visible and keeps rendering.
 const panel=document.createElement('aside');panel.id='workshop-panel';panel.hidden=true;panel.setAttribute('aria-label','Maintenance interface');
 panel.innerHTML=`<div class="workshop-window">
 <header><span id="workshop-heading">MU-1 / FABRICATION</span><button id="workshop-close" type="button">×</button></header>
 <p id="workshop-status"></p><div id="workshop-mini"><p>The door is open. Physical components can be picked up with E.</p><div id="workshop-locker"></div></div>
 <div id="workshop-crafting"><div class="workshop-columns">
 <section><h2>RECOVERED SALVAGE</h2><div id="workshop-items"></div><div class="workshop-actions"><button id="workshop-drop-cell">DROP FUEL CELL</button><button id="workshop-dismantle-arm">DISMANTLE ARM</button></div></section>
 <section><h2>CRAFTING SPECS</h2><div id="workshop-spec"></div><div class="workshop-preview"><canvas id="workshop-preview-3d" aria-label="Three-dimensional component preview"></canvas><small id="workshop-preview-label">SELECT A COMPONENT</small></div></section>
 </div><p class="workshop-footer">SELECT A SPEC & PRESS ENTER, OR HOLD CRAFT · ESC TO CLOSE</p></div></div>`;
 document.body.append(panel);
 const css=document.createElement('style');css.textContent=`
 #workshop-panel{position:fixed;right:16px;top:8%;bottom:9%;z-index:105;pointer-events:none;color:#d9e0d2;font:11px IBM Plex Mono,monospace}
 #workshop-panel[hidden]{display:none}.workshop-window{pointer-events:auto;width:min(660px,61vw);max-height:100%;overflow:auto;background:#0b1513e8;backdrop-filter:blur(8px);border:1px solid #6f8276;padding:16px;box-shadow:0 12px 50px #0009}
 #workshop-panel.mini{top:auto;bottom:12%;right:22px}#workshop-panel.mini .workshop-window{width:min(300px,39vw)}#workshop-panel.mini #workshop-crafting{display:none}
 #workshop-panel:not(.mini) #workshop-mini{display:none}
 .workshop-window header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #6a816a;padding-bottom:11px;letter-spacing:.12em}
 .workshop-window h2{color:#a5c4af;font-size:11px;letter-spacing:.12em}.workshop-window button{background:#1a2b26;color:#d4e5d3;border:1px solid #607f70;padding:7px 10px;cursor:pointer;font:inherit}
 .workshop-window button:focus-visible{outline:2px solid #a3e1ac}.workshop-window button:disabled{opacity:.36;cursor:default}
 .workshop-columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}.workshop-row{display:flex;align-items:center;gap:7px;justify-content:space-between;border-bottom:1px solid #41544b;padding:5px 0}
 .workshop-row button{flex-shrink:0}.workshop-item-label{flex:1}.workshop-icon{width:55px;height:43px;flex-shrink:0;display:block;background:#182722}
 .workshop-spec-card{width:100%;text-align:left;margin:6px 0;padding:13px!important;display:flex;flex-direction:column;gap:7px;opacity:.5;border:1px solid #6e7571!important;color:#98a79f!important;background:#131b1a!important}
 .workshop-spec-card.unlocked{opacity:1;border:1px solid #75c88e!important;box-shadow:inset 0 0 0 1px #40825966;color:#d6f0da!important}
 .workshop-spec-card.selected{background:#21372b!important}.workshop-spec-card small{font-size:9px}
 .workshop-hold{height:4px;background:#314139;display:block;margin-top:4px}.workshop-hold i{display:block;width:0;height:100%;background:#98e1a3}
 .workshop-preview{margin-top:15px;border:1px solid #50665d;background:#0d1715}.workshop-preview canvas{width:100%;height:145px;display:block}.workshop-preview small{display:block;padding:6px;color:#b9ceb8}
 .workshop-footer{font-size:9px;color:#9aac9c}.workshop-actions{display:flex;flex-wrap:wrap}
 #workshop-panel.mini #workshop-mini p{color:#c3d5c2;line-height:1.5}#workshop-locker{font-size:10px;color:#8da391}
 @media(max-width:750px){#workshop-panel{right:8px;top:10%;bottom:10%}.workshop-window{width:min(520px,85vw)}.workshop-columns{grid-template-columns:1fr}#workshop-panel.mini .workshop-window{width:min(290px,65vw)}}
 `;document.head.append(css);
 const previewCanvas=panel.querySelector('#workshop-preview-3d');
 const previewRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
 const previewCtx=previewCanvas.getContext('2d');
 previewRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 const previewScene=new THREE.Scene();previewScene.add(new THREE.AmbientLight(0xffffff,2));
 const previewLamp=new THREE.DirectionalLight(0xe8f4db,2.2);previewLamp.position.set(2,4,5);previewScene.add(previewLamp);
 const previewCamera=new THREE.PerspectiveCamera(40,1,.1,20);previewCamera.position.set(0,1.2,2.3);previewCamera.lookAt(0,0,0);
 const previewModel=new THREE.Group();previewScene.add(previewModel);
 let previewType='',previewAngle=0,craftProgress=0,craftHolding=false,selectedSpec=false;
 function showPreview(type){
  if(previewType===type)return;
  previewType=type;previewModel.clear();
  if(type==='arm'&&armModel){const model=armModel.clone(true);model.visible=true;model.scale.setScalar(.75);model.position.set(0,.8,0);previewModel.add(model)}else if(type&&catalogue[type])makePartModel(previewModel,type,1.65);
  panel.querySelector('#workshop-preview-label').textContent=type==='arm'?'INDUSTRIAL MANIPULATOR':type?catalogue[type].name:'SELECT A COMPONENT';
 }
 function stacked(items){const groups=new Map();for(const item of items){const key=item.type;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item)}return [...groups.values()]}
 function craftAvailable(){return specUnlocked&&!probeInstalled&&Math.hypot(robot.position.x-workbench.position.x,robot.position.z-workbench.position.z)<2.5&&Object.entries(recipe).every(([type,n])=>inventory.filter(x=>x.type===type).length>=n)}
 function fabricate(){
  if(!craftAvailable())return;
  if(!onCraftProbe()){notify('ACCESS PROBE ALREADY INSTALLED');return}
  for(const [type,n] of Object.entries(recipe))for(let j=0;j<n;j++)inventory.splice(inventory.findIndex(x=>x.type===type),1);
  probeInstalled=true;notify('ACCESS PROBE INSTALLED');sound('equip');craftProgress=0;craftHolding=false;updateUI();save();
 }
 function releaseHold(){craftHolding=false;craftProgress=0;const bar=panel.querySelector('.workshop-hold i');if(bar)bar.style.width='0%'}
 panel.querySelector('#workshop-close').onclick=close;
 panel.querySelector('#workshop-drop-cell').onclick=dropFuelCell;
 panel.querySelector('#workshop-dismantle-arm').onclick=()=>notify('DISMANTLE THE BROKEN CLAW ON THE REPAIR BAY FLOOR');
 function updateUI(){
  panel.querySelector('#workshop-status').textContent='SALVAGE '+inventory.length+'/20 · '+(mass()+cellCount()*1.8).toFixed(1)+' KG · FUEL CELLS '+cellCount();
  const list=panel.querySelector('#workshop-items');list.replaceChildren();
  for(const stack of stacked(inventory)){
   const item=stack[0],row=document.createElement('div');row.className='workshop-row';
   const canvas=document.createElement('canvas');canvas.className='workshop-icon';canvas.width=110;canvas.height=86;
   const text=document.createElement('span');text.className='workshop-item-label';text.textContent=describe(item)+' ×'+stack.length;
   text.onclick=()=>showPreview(item.type);
   const button=document.createElement('button');button.textContent='DROP 1';button.onclick=()=>drop(item,inventory.findIndex(x=>x.id===item.id));
   row.append(canvas,text,button);list.append(row);
   // Render each icon from the actual Three.js model via the shared preview renderer.
   const model=makePartModel(new THREE.Group(),item.type,1);model.rotation.y=.42;
   const slotScene=new THREE.Scene();slotScene.add(new THREE.AmbientLight(0xffffff,2));slotScene.add(new THREE.DirectionalLight(0xffffff,2));
   slotScene.add(model);previewRenderer.setSize(110,86,false);previewCamera.aspect=110/86;previewCamera.updateProjectionMatrix();previewRenderer.render(slotScene,previewCamera);
   canvas.getContext('2d').drawImage(previewRenderer.domElement,0,0,110,86);
  }
  if(!inventory.length)list.textContent='NO RECOVERED COMPONENTS';
  const spec=panel.querySelector('#workshop-spec');spec.replaceChildren();
  const card=document.createElement('button');card.className='workshop-spec-card'+(specUnlocked?' unlocked':'')+(selectedSpec?' selected':'');card.type='button';
  const name=document.createElement('strong');name.textContent='DOOR ACCESS PROBE';
  const detail=document.createElement('small');detail.textContent=specUnlocked?'SPECIFICATION ACQUIRED · '+Object.entries(recipe).map(([t,n])=>n+'× '+catalogue[t].name).join(' · '):'UNKNOWN SPECIFICATION · TERMINAL ACCESS REQUIRED';
  const status=document.createElement('small');status.textContent=craftAvailable()?'READY TO CRAFT · HOLD OR SELECT + ENTER':specUnlocked?'COMPONENTS REQUIRED · USE WORKBENCH':'SPEC LOCKED';
  const hold=document.createElement('span');hold.className='workshop-hold';const bar=document.createElement('i');hold.append(bar);
  card.append(name,detail,status,hold);
  card.onclick=()=>{selectedSpec=true;showPreview('arm');card.classList.add('selected')};
  card.onkeydown=e=>{if(e.key==='Enter'&&craftAvailable()){e.preventDefault();fabricate()}};
  card.onpointerdown=()=>{if(craftAvailable()){craftHolding=true;craftProgress=0}};
  card.onpointerup=()=>{if(craftProgress<1.25)releaseHold()};card.onpointerleave=releaseHold;
  spec.append(card);
  panel.querySelector('#workshop-locker').textContent=activeLocker<0?'':'Locker '+(106+activeLocker)+' · '+lockerContents[activeLocker].length+' physical pieces remain';
 }
 function open(locker=-1){
  mode=locker>=0?'locker':'craft';activeLocker=locker;screenOpen=true;panel.hidden=false;
  panel.classList.toggle('mini',mode==='locker');
  panel.querySelector('#workshop-heading').textContent=mode==='locker'?'STORAGE / '+(106+locker):'MU-1 / FABRICATION';
  updateUI();panel.querySelector('#workshop-close').focus();
 }
 function close(){screenOpen=false;panel.hidden=true;activeLocker=-1;releaseHold()}
 function handle(o){
  if(o.userData.workshopType==='bench'){open();sound('select');return true}
  if(o.userData.workshopType==='locker'){setLockerOpen(o.userData.index);open(o.userData.index);sound('select');save();return true}
  if(o.userData.workshopType==='locker-loot'){const index=o.userData.index;const contents=lockerContents[index];const n=contents.findIndex(x=>x.id===o.userData.itemId);if(n<0)return true;if(inventory.length>=20){notify('SALVAGE CAPACITY FULL');return true}const found=contents.splice(n,1)[0];inventory.push(found);if(found.type==='card')onAccessCard(true);refreshLockerModels();notify(found.type==='card'?'WORKER CARD · PASSWORD ETNA':'ITEM RECOVERED');sound('collect');updateUI();save();return true}
  if(o.userData.workshopType==='broken-claw'){if(clawSalvaged)return true;if(inventory.length>16){notify('SALVAGE INVENTORY FULL');return true}clawSalvaged=true;for(const type of ['gear','chip','wire'])inventory.push(generate(type));scene.remove(o);const i=interactables.indexOf(o);if(i>=0)interactables.splice(i,1);notify('BROKEN CLAW DISMANTLED · COMPONENTS SALVAGED');updateUI();save();return true}
  if(o.userData.workshopType==='shard'){specUnlocked=true;specReleased=false;setShardVisible();notify('FABRICATION SPEC UNLOCKED');sound('collect');updateUI();save();return true}
  if(o.userData.workshopType==='loose'){
   if(o.userData.kind==='cell'){setCellCount(cellCount()+1);notify('FUEL CELL RECOVERED · 1.8 KG')}else if(inventory.length<20){inventory.push(o.userData.item);notify('COMPONENT RECOVERED')}else{notify('SALVAGE INVENTORY FULL');return true}
   removeLoose(o);sound('collect');updateUI();save();return true;
  }
  return false;
 }
 function releaseSpec(){if(specUnlocked)return 'SPEC ALREADY RECOVERED';if(specReleased)return 'SHARD WAITING AT TERMINAL OUTPUT';specReleased=true;setShardVisible();notify('FABRICATION SHARD EJECTED');save();return 'FABRICATION SHARD EJECTED · RECOVER FROM TERMINAL OUTPUT'}
 function serialize(){return {seed,inventory,lockerContents,opened,specReleased,specUnlocked,loose:loose.map(o=>({x:o.userData.x,z:o.userData.z,item:o.userData.item,kind:o.userData.kind}))}}
 function restore(data){if(!data||typeof data!=='object'){startFresh();return;}seed=Number.isInteger(data.seed)?data.seed:12345;inventory=Array.isArray(data.inventory)?data.inventory.filter(i=>catalogue[i.type]).slice(0,20):[];lockerContents=Array.isArray(data.lockerContents)?Array.from({length:4},(_,i)=>data.lockerContents[i]||[]):[[],[],[],[]];opened=Array.isArray(data.opened)?data.opened.slice(0,4):[false,false,false,false];specReleased=!!data.specReleased;specUnlocked=!!data.specUnlocked;for(const o of [...loose])removeLoose(o);for(const p of Array.isArray(data.loose)?data.loose:[]){if(Number.isFinite(p.x)&&Number.isFinite(p.z))createLoose(p.item,p.x,p.z,p.kind)}setShardVisible();refreshLockerModels();for(let i=0;i<4;i++)if(opened[i])setLockerOpen(i);updateUI()}
 function update(dt){if(screenOpen&&mode==='craft'){previewAngle+=dt*.5;previewModel.rotation.y=previewAngle;const width=previewCanvas.clientWidth,height=previewCanvas.clientHeight;if(width&&height){previewRenderer.setSize(width,height,false);previewCamera.aspect=width/height;previewCamera.updateProjectionMatrix();previewRenderer.render(previewScene,previewCamera);previewCanvas.width=width;previewCanvas.height=height;previewCtx.drawImage(previewRenderer.domElement,0,0,width,height)}if(craftHolding&&craftAvailable()){craftProgress+=dt;const bar=panel.querySelector('.workshop-hold i');if(bar)bar.style.width=Math.min(100,craftProgress/1.25*100)+'%';if(craftProgress>=1.25)fabricate()}}for(let i=0;i<lockerDoors.length;i++){const desired=opened[i]?-1.55:0;lockerDoors[i].rotation.y=THREE.MathUtils.damp(lockerDoors[i].rotation.y,desired,7,dt)}for(const o of loose){if(o.position.y<=0&&o.userData.velocity===undefined)continue;const v=(o.userData.velocity||0)-9.8*dt;o.position.y+=v*dt;if(o.position.y<=0){o.position.y=0;const bounce=-v*.16;if(bounce>.24)o.userData.velocity=bounce;else delete o.userData.velocity}else o.userData.velocity=v}}
 function hint(){if(!specUnlocked)return specReleased?'Collect the ejected spec shard beside the terminal.':'Explore the terminal files to release a fabrication specification.';return 'You can fabricate the service arm at the maintenance workshop using recovered parts.'}
 startFresh();
 return {open,close,handle,releaseSpec,serialize,restore,hint,updateUI,update,mass,get isOpen(){return screenOpen&&mode==='craft'},get miniOpen(){return screenOpen&&mode==='locker'},get specUnlocked(){return specUnlocked}};
}
