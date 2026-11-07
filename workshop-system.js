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
 let seed=0,inventory=[],lockerContents=[[],[]],opened=[false,false],specReleased=false,specUnlocked=false,loose=[],activeLocker=-1,screenOpen=false;
 const shell=new THREE.MeshStandardMaterial({color:0x767f70,metalness:.55,roughness:.65});
 const steel=new THREE.MeshStandardMaterial({color:0x313c3b,metalness:.68,roughness:.55});
 const brass=new THREE.MeshStandardMaterial({color:0xb5a168,metalness:.5,roughness:.56});
 function cube(parent,w,h,d,mat,x,y,z){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
 }
 function makeLocker(index,x,z){
  const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);
  cube(root,1.12,2.15,.70,shell,0,1.075,0);
  cube(root,.96,1.85,.08,steel,0,1.09,.40);
  cube(root,.08,.55,.10,brass,.33,1.08,.47);
  for(let i=0;i<4;i++)cube(root,.64,.026,.035,shell,-.06,1.58-i*.12,.46);
  root.userData={name:'SALVAGE LOCKER '+(index+1),x,z,workshopType:'locker',index};
  interactables.push(root);colliders.push([x,z,.58,.38]);return root;
 }
 // Keep the lockers beside the workshop route, with clear player approach space.
 makeLocker(0,-10.9,1.15);makeLocker(1,8.9,1.2);
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
  inventory=[];opened=[false,false];specReleased=false;specUnlocked=false;loose=[];
  lockerContents=[Array.from({length:5},generate),Array.from({length:4},generate)];setShardVisible();updateUI();
 }
 function describe(item){
  const base=catalogue[item.type],rarity=rarities.find(x=>x.name===item.rarity)||rarities[0];
  return base.name+' · '+item.rarity+' · '+base.mass.toFixed(1)+' KG · '+Math.round(base.value*rarity.multiplier)+' CR';
 }
 function mass(){return inventory.reduce((n,p)=>n+catalogue[p.type].mass,0)}
 function createLoose(item,x,z,kind='component'){
  const root=new THREE.Group();root.position.set(x,0,z);
  const material=kind==='cell'?brass:catalogue[item.type]&&new THREE.MeshStandardMaterial({color:catalogue[item.type].color,metalness:.58,roughness:.5})||shell;
  cube(root,.36,.22,.36,material,0,.16,0);cube(root,.25,.08,.25,steel,0,.32,0);
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
  lockerContents[activeLocker].forEach((item,i)=>{const row=document.createElement('div');row.className='workshop-row';const info=document.createElement('span');info.textContent=describe(item);const button=document.createElement('button');button.textContent='TAKE';button.disabled=inventory.length>=20;button.onclick=()=>{inventory.push(item);lockerContents[activeLocker].splice(i,1);notify('SALVAGE RECOVERED');sound('collect');updateUI();save()};row.append(info,button);locker.append(row)});
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
 function restore(data){if(!data||typeof data!=='object'){startFresh();return;}seed=Number.isInteger(data.seed)?data.seed:12345;inventory=Array.isArray(data.inventory)?data.inventory.filter(i=>catalogue[i.type]).slice(0,20):[];lockerContents=Array.isArray(data.lockerContents)&&data.lockerContents.length===2?data.lockerContents:[[],[]];opened=Array.isArray(data.opened)?data.opened:[false,false];specReleased=!!data.specReleased;specUnlocked=!!data.specUnlocked;for(const o of [...loose])removeLoose(o);for(const p of Array.isArray(data.loose)?data.loose:[]){if(Number.isFinite(p.x)&&Number.isFinite(p.z))createLoose(p.item,p.x,p.z,p.kind)}setShardVisible();updateUI()}
 function update(dt){for(const o of loose){if(o.position.y<=0&&o.userData.velocity===undefined)continue;const v=(o.userData.velocity||0)-9.8*dt;o.position.y+=v*dt;if(o.position.y<=0){o.position.y=0;const bounce=-v*.16;if(bounce>.24)o.userData.velocity=bounce;else delete o.userData.velocity}else o.userData.velocity=v}}
 function hint(){if(!specUnlocked)return specReleased?'Collect the ejected spec shard beside the terminal.':'Explore the terminal files to release a fabrication specification.';return 'You can fabricate the service arm at the maintenance workshop using recovered parts.'}
 startFresh();
 return {open,close,handle,releaseSpec,serialize,restore,hint,updateUI,update,mass,get isOpen(){return screenOpen},get specUnlocked(){return specUnlocked}};
}
