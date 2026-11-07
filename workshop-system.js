// Workshop prototype: seeded salvage, lockers, loose pickups and physical specification recovery.
export function createWorkshopSystem({THREE,scene,robot,interactables,colliders,notify,sound,save,cellCount,setCellCount,onCraftArm,onDismantle}){
 const catalogue={
  motor:{name:'SERVO MOTOR',mass:2.4,value:48,color:0x8c987f},
  gear:{name:'REDUCTION GEARS',mass:1.1,value:20,color:0xa8a797},
  chip:{name:'CONTROL CHIP',mass:.2,value:90,color:0x4d9c8b},
  plate:{name:'ARMOUR PLATES',mass:1.8,value:30,color:0x9d956d},
  wire:{name:'WIRING LOOM',mass:.5,value:16,color:0xb47856}
 };
 const rarities=[{name:'COMMON',chance:.62,multiplier:1},{name:'UNCOMMON',chance:.27,multiplier:1.6},{name:'RARE',chance:.095,multiplier:2.7},{name:'EXCEPTIONAL',chance:.015,multiplier:4.5}];
 const recipe={motor:1,gear:2,chip:1,plate:2,wire:2};
 let seed=0,inventory=[],lockerContents=[[],[],[],[]],opened=[false,false,false,false],specReleased=false,specUnlocked=false,loose=[],activeLocker=-1,screenOpen=false;
 const shell=new THREE.MeshStandardMaterial({color:0x767f70,metalness:.55,roughness:.65});
 const steel=new THREE.MeshStandardMaterial({color:0x313c3b,metalness:.68,roughness:.55});
 const brass=new THREE.MeshStandardMaterial({color:0xb5a168,metalness:.5,roughness:.56});
 function cube(parent,w,h,d,mat,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 // Cream-painted factory lockers: four numbered individual compartments in one bank.
 const lockerDoors=[],lockerShelves=[];
 const agedCream=new THREE.MeshStandardMaterial({color:0xb2ad97,metalness:.23,roughness:.91});
 const agedDark=new THREE.MeshStandardMaterial({color:0x6b685c,metalness:.38,roughness:.88});
 const numbered=new THREE.MeshStandardMaterial({color:0x913e35,roughness:.94});
 function numberPlaque(root,n){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.clearRect(0,0,256,128);ctx.fillStyle='#913e35';ctx.font='bold 74px Georgia,serif';ctx.textAlign='center';ctx.fillText(String(n),128,86);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const plate=new THREE.Mesh(new THREE.PlaneGeometry(.37,.19),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide}));
  plate.position.set(.42,1.49,.075);root.add(plate);
 }
 function makeLocker(index,x,z){
  const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);
  // Doors face +Z; each frame stands on short legs, clear of the floor.
  cube(root,.96,2.12,.66,agedCream,0,1.13,0);
  cube(root,.82,1.88,.08,agedDark,0,1.16,.30);
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
  lockerDoors.push(pivot);
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
 function rarity(){const n=next();let total=0;for(const r of rarities){total+=r.chance;if(n<total)return r.name}return 'COMMON'}
 function generate(){
  const keys=Object.keys(catalogue);const type=keys[Math.floor(next()*keys.length)];
  return {id:Math.floor(next()*1000000000).toString(36),type,rarity:rarity()};
 }
 function startFresh(){
  seed=(Math.floor(Math.random()*4294967295)>>>0)||12345;
  inventory=[];opened=[false,false,false,false];specReleased=false;specUnlocked=false;loose=[];
  lockerContents=[Array.from({length:3},generate),Array.from({length:2},generate),Array.from({length:3},generate),Array.from({length:2},generate)];
  refreshLockerModels();setShardVisible();updateUI();
 }
 function describe(item){
  const base=catalogue[item.type],rarity=rarities.find(x=>x.name===item.rarity)||rarities[0];
  return base.name+' · '+item.rarity+' · '+base.mass.toFixed(1)+' KG · '+Math.round(base.value*rarity.multiplier)+' CR';
 }
 function mass(){return inventory.reduce((n,p)=>n+catalogue[p.type].mass,0)}
 // Reuse the same recognisable mechanical silhouettes for stored and dropped salvage.
 function makePartModel(parent,type,scale=.85){
  const group=new THREE.Group();group.scale.setScalar(scale);parent.add(group);
  const tone=new THREE.MeshStandardMaterial({color:catalogue[type]?.color||0x807e6f,roughness:.72,metalness:.55});
  if(type==='motor'){
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
 function refreshLockerModels(){
  lockerShelves.forEach((shelf,index)=>{
   shelf.clear();
   const items=lockerContents[index]||[];
   for(let i=0;i<Math.min(items.length,3);i++){
    const part=makePartModel(shelf,items[i].type,.60);
    part.position.set(-.23+(i%2)*.45,Math.floor(i/2)*.44,.02);
   }
  });
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
 const panel=document.createElement('section');panel.id='workshop-panel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Maintenance workshop');
 panel.innerHTML='<div class="workshop-window"><header><span>MU-1 / MAINTENANCE WORKSHOP</span><button id="workshop-close">CLOSE ×</button></header><p id="workshop-status"></p><div class="workshop-columns"><section><h2>RECOVERED SALVAGE</h2><div id="workshop-items"></div><button id="workshop-drop-cell">DROP FUEL CELL</button><button id="workshop-dismantle-arm">DISMANTLE SERVICE ARM</button></section><section><h2>FABRICATION SPECS</h2><div id="workshop-spec"></div><h2>STORAGE LOCKER</h2><div id="workshop-locker"></div></section></div></div>';
 document.body.append(panel);
 const css=document.createElement('style');css.textContent='#workshop-panel{position:fixed;inset:0;z-index:210;display:grid;place-items:center;background:#020806db;color:#d9e0d2;font:12px IBM Plex Mono,monospace}#workshop-panel[hidden]{display:none}.workshop-window{width:min(900px,96vw);max-height:90vh;overflow:auto;background:#0c1715;border:1px solid #839886;padding:20px;box-shadow:0 15px 90px #000}.workshop-window header{display:flex;justify-content:space-between;border-bottom:1px solid #657664;padding-bottom:12px;letter-spacing:.12em}.workshop-window h2{font-size:13px;color:#a6c4ab;letter-spacing:.15em}.workshop-window button{background:#1c2b27;color:#d6e7d5;border:1px solid #6d8b78;padding:7px 10px;margin:4px;cursor:pointer}.workshop-columns{display:grid;grid-template-columns:1fr 1fr;gap:24px}.workshop-row{display:flex;align-items:center;justify-content:space-between;gap:7px;border-bottom:1px solid #43524a;padding:6px 0}.workshop-row button{flex-shrink:0}@media(max-width:650px){.workshop-columns{grid-template-columns:1fr}}';document.head.append(css);
 panel.querySelector('#workshop-close').onclick=close;
 panel.querySelector('#workshop-drop-cell').onclick=dropFuelCell;
 panel.querySelector('#workshop-dismantle-arm').onclick=()=>{if(inventory.length>16){notify('FREE FOUR SALVAGE SLOTS FIRST');return}if(!onDismantle()){notify('NO SERVICE ARM AVAILABLE TO DISMANTLE');return}specUnlocked=true;setShardVisible();for(const type of ['motor','gear','plate','wire'])inventory.push({id:'reclaimed-'+Math.floor(next()*1000000),type,rarity:'COMMON'});notify('ARM DISMANTLED · PARTIAL SALVAGE RECOVERED');updateUI();save()};
 function updateUI(){
  panel.querySelector('#workshop-status').textContent='SALVAGE '+inventory.length+' / 20 SLOTS · '+(mass()+cellCount()*1.8).toFixed(1)+' KG INCLUDING '+cellCount()+' FUEL CELL(S)';
  const list=panel.querySelector('#workshop-items');list.replaceChildren();
  inventory.forEach((item,i)=>{const row=document.createElement('div');row.className='workshop-row';const info=document.createElement('span');info.textContent=describe(item);const button=document.createElement('button');button.textContent='DROP';button.onclick=()=>drop(item,i);row.append(info,button);list.append(row)});
  if(!inventory.length)list.textContent='No recovered components.';
  const spec=panel.querySelector('#workshop-spec');spec.replaceChildren();
  const text=document.createElement('p');text.textContent=specUnlocked?'SERVICE ARM / SPECIFICATION ACQUIRED':'LOCKED · Recover the fabrication shard from the terminal.';spec.append(text);
  if(specUnlocked){const requirements=document.createElement('p');requirements.textContent=Object.entries(recipe).map(([type,n])=>n+' × '+catalogue[type].name).join(' · ');spec.append(requirements);
   const can=Object.entries(recipe).every(([type,n])=>inventory.filter(x=>x.type===type).length>=n);
   const btn=document.createElement('button');btn.textContent='FABRICATE SERVICE ARM';btn.disabled=!can;btn.onclick=()=>{if(!onCraftArm()){notify('SERVICE ARM ALREADY INSTALLED');return}for(const [type,n] of Object.entries(recipe)){for(let j=0;j<n;j++)inventory.splice(inventory.findIndex(x=>x.type===type),1)}notify('SERVICE ARM FABRICATED · BLUEPRINT VERIFIED');sound('equip');updateUI();save();};spec.append(btn);
  }
  const locker=panel.querySelector('#workshop-locker');locker.replaceChildren();
  if(activeLocker<0){locker.textContent='Open a locker with E to inspect its contents.';return;}
  lockerContents[activeLocker].forEach((item,i)=>{const row=document.createElement('div');row.className='workshop-row';const info=document.createElement('span');info.textContent=describe(item);const button=document.createElement('button');button.textContent='TAKE';button.disabled=inventory.length>=20;button.onclick=()=>{inventory.push(item);lockerContents[activeLocker].splice(i,1);refreshLockerModels();notify('SALVAGE RECOVERED');sound('collect');updateUI();save()};row.append(info,button);locker.append(row)});
  if(!lockerContents[activeLocker].length)locker.textContent='Locker empty.';
 }
 function open(locker=-1){activeLocker=locker;screenOpen=true;panel.hidden=false;updateUI();panel.querySelector('#workshop-close').focus()}
 function close(){screenOpen=false;panel.hidden=true;activeLocker=-1}
 function handle(o){
  if(o.userData.workshopType==='bench'){open();sound('select');return true}
  if(o.userData.workshopType==='locker'){opened[o.userData.index]=true;open(o.userData.index);sound('select');return true}
  if(o.userData.workshopType==='shard'){specUnlocked=true;specReleased=false;setShardVisible();notify('FABRICATION SPEC UNLOCKED');sound('collect');updateUI();save();return true}
  if(o.userData.workshopType==='loose'){
   if(o.userData.kind==='cell'){setCellCount(cellCount()+1);notify('FUEL CELL RECOVERED · 1.8 KG')}else if(inventory.length<20){inventory.push(o.userData.item);notify('COMPONENT RECOVERED')}else{notify('SALVAGE INVENTORY FULL');return true}
   removeLoose(o);sound('collect');updateUI();save();return true;
  }
  return false;
 }
 function releaseSpec(){if(specUnlocked)return 'SPEC ALREADY RECOVERED';if(specReleased)return 'SHARD WAITING AT TERMINAL OUTPUT';specReleased=true;setShardVisible();notify('FABRICATION SHARD EJECTED');save();return 'FABRICATION SHARD EJECTED · RECOVER FROM TERMINAL OUTPUT'}
 function serialize(){return {seed,inventory,lockerContents,opened,specReleased,specUnlocked,loose:loose.map(o=>({x:o.userData.x,z:o.userData.z,item:o.userData.item,kind:o.userData.kind}))}}
 function restore(data){if(!data||typeof data!=='object'){startFresh();return;}seed=Number.isInteger(data.seed)?data.seed:12345;inventory=Array.isArray(data.inventory)?data.inventory.filter(i=>catalogue[i.type]).slice(0,20):[];lockerContents=Array.isArray(data.lockerContents)?Array.from({length:4},(_,i)=>data.lockerContents[i]||[]):[[],[],[],[]];opened=Array.isArray(data.opened)?data.opened.slice(0,4):[false,false,false,false];specReleased=!!data.specReleased;specUnlocked=!!data.specUnlocked;for(const o of [...loose])removeLoose(o);for(const p of Array.isArray(data.loose)?data.loose:[]){if(Number.isFinite(p.x)&&Number.isFinite(p.z))createLoose(p.item,p.x,p.z,p.kind)}setShardVisible();refreshLockerModels();updateUI()}
 function update(dt){for(let i=0;i<lockerDoors.length;i++){const desired=opened[i]?-1.55:0;lockerDoors[i].rotation.y=THREE.MathUtils.damp(lockerDoors[i].rotation.y,desired,7,dt)}for(const o of loose){if(o.position.y<=0&&o.userData.velocity===undefined)continue;const v=(o.userData.velocity||0)-9.8*dt;o.position.y+=v*dt;if(o.position.y<=0){o.position.y=0;const bounce=-v*.16;if(bounce>.24)o.userData.velocity=bounce;else delete o.userData.velocity}else o.userData.velocity=v}}
 function hint(){if(!specUnlocked)return specReleased?'Collect the ejected spec shard beside the terminal.':'Explore the terminal files to release a fabrication specification.';return 'You can fabricate the service arm at the maintenance workshop using recovered parts.'}
 startFresh();
 return {open,close,handle,releaseSpec,serialize,restore,hint,updateUI,update,mass,get isOpen(){return screenOpen},get specUnlocked(){return specUnlocked}};
}
