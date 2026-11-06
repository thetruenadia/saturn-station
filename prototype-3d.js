import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

const viewport=document.querySelector('#viewport');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x050a0b);
scene.fog=new THREE.FogExp2(0x050a0b,.035);
const camera=new THREE.OrthographicCamera(-11,11,8,-8,.1,100);
camera.position.set(12,14,12);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
viewport.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;
controls.minPolarAngle=.55;controls.maxPolarAngle=1.25;controls.minZoom=.65;controls.maxZoom=2;
camera.zoom=1.05;camera.updateProjectionMatrix();
scene.add(new THREE.HemisphereLight(0x829b9a,0x15100c,1.25));
const keyLight=new THREE.DirectionalLight(0xb7c6b0,2.1);keyLight.position.set(-5,12,7);keyLight.castShadow=true;keyLight.shadow.mapSize.set(2048,2048);keyLight.shadow.camera.left=-12;keyLight.shadow.camera.right=12;keyLight.shadow.camera.top=12;keyLight.shadow.camera.bottom=-12;scene.add(keyLight);
const emergency=new THREE.PointLight(0xc33d24,32,11,2);emergency.position.set(4,4,-3);scene.add(emergency);
const phosphor=new THREE.PointLight(0x6bff8b,13,7,2);phosphor.position.set(-4,2,2);scene.add(phosphor);
const mat=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const floorMat=mat(0x202723,.96,.25),wallMat=mat(0x171f1d,.9,.3),edgeMat=mat(0x4a4a38,.8,.35),rustMat=mat(0x70412a,.95,.1),darkMat=mat(0x080e0d,.7,.3),greenMat=mat(0x68765b,.72,.35),screenMat=new THREE.MeshStandardMaterial({color:0x72ff92,emissive:0x35d85c,emissiveIntensity:2});
function box(parent,w,h,d,material,x,y,z,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function cylinder(parent,r1,r2,h,material,x,y,z,rx=0,rz=0){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),material);o.position.set(x,y,z);o.rotation.x=rx;o.rotation.z=rz;o.castShadow=true;parent.add(o);return o}
const floor=box(scene,18,.35,14,floorMat,0,-.2,0,false);
const grid=new THREE.GridHelper(18,18,0x3c5146,0x29352f);grid.position.y=-.015;scene.add(grid);
box(scene,18,5,.45,wallMat,0,2.3,-7,false);box(scene,.45,5,14,wallMat,-9,2.3,0,false);box(scene,.45,5,14,wallMat,9,2.3,0,false);
for(let x=-8;x<=8;x+=2){box(scene,.18,4.8,.22,edgeMat,x,2.2,-6.72);box(scene,.16,4.6,.18,darkMat,x,2.2,-6.55)}
for(let z=-5;z<=4;z+=2){cylinder(scene,.16,.16,17,edgeMat,0,4.35,z,0,Math.PI/2);for(let x=-7;x<=7;x+=3)cylinder(scene,.22,.22,.13,rustMat,x,4.35,z,Math.PI/2,0)}
for(let i=0;i<8;i++){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-8+i*2,4.7,-6),new THREE.Vector3(-7+i*2,3.7,-3),new THREE.Vector3(-8+i*2,3.1,0),new THREE.Vector3(-6+i*2,2.7,4)]);scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,28,.045,6,false),darkMat))}
for(let i=0;i<20;i++){const x=((i*37)%160)/10-8,z=((i*61)%120)/10-6;const stain=new THREE.Mesh(new THREE.CircleGeometry(.25+(i%4)*.12,16),mat(0x080d0b,.25,.35));stain.rotation.x=-Math.PI/2;stain.position.set(x,.002,z);scene.add(stain)}
function machine(x,z,colour=greenMat){const g=new THREE.Group();g.position.set(x,0,z);box(g,1.2,.5,1,edgeMat,0,.25,0);box(g,.85,1.7,.75,wallMat,0,1.25,0);box(g,.65,.65,.08,colour,0,1.6,.4);box(g,.4,.18,.04,screenMat,0,1.65,.46);for(let i=-1;i<=1;i++)cylinder(g,.045,.045,1.3,darkMat,i*.38,.8,-.35);scene.add(g);return g}
machine(-5,-3);machine(5,-2, rustMat);
function crate(x,z){const g=new THREE.Group();g.position.set(x,0,z);box(g,1,.8,1,mat(0x3d392d,.95,.15),0,.4,0);for(let i=-1;i<=1;i++)box(g,.08,.84,.08,edgeMat,i*.4,.4,.51);box(g,1.04,.08,1.04,rustMat,0,.82,0);scene.add(g)}
crate(-7,3);crate(7,4);crate(6,-5);
// The lock-service manipulator: a loose, recognisable mechanical component on the deck.
const interactables=[];
const arm=new THREE.Group();arm.position.set(5,0,-3);arm.scale.setScalar(1.35);
// A conspicuous recovery marker and a phosphor-lit component make the arm readable at a distance.
const armMarker=new THREE.Mesh(new THREE.TorusGeometry(.72,.045,8,40),new THREE.MeshBasicMaterial({color:0xe0a34b}));
armMarker.rotation.x=-Math.PI/2;armMarker.position.y=.035;arm.add(armMarker);
const armBeacon=new THREE.Mesh(new THREE.CylinderGeometry(.018,.11,1.35,10,1,true),new THREE.MeshBasicMaterial({color:0xe0a34b,transparent:true,opacity:.22,side:THREE.DoubleSide}));
armBeacon.position.set(0,.9,0);arm.add(armBeacon);
const armBeaconTop=new THREE.Mesh(new THREE.OctahedronGeometry(.16,0),new THREE.MeshBasicMaterial({color:0xffc36b,emissive:0x9b4e12,emissiveIntensity:1.8}));
armBeaconTop.position.set(0,1.65,0);arm.add(armBeaconTop);
cylinder(arm,.23,.23,.18,edgeMat,0,.16,0,Math.PI/2,0);
const armBase=box(arm,.42,.16,.38,greenMat,0,.25,0);armBase.rotation.z=-.2;
const armJoint=cylinder(arm,.12,.12,.18,rustMat,.22,.3,0,Math.PI/2,0);
const armRod=cylinder(arm,.075,.09,.72,edgeMat,.52,.31,0,0,0);armRod.rotation.z=-Math.PI/2.5;
const claw=new THREE.Group();claw.position.set(.83,.34,0);arm.add(claw);
for(const s of [-1,1]){const finger=cylinder(claw,.035,.045,.28,greenMat,s*.07,0,0,0,0);finger.rotation.z=s*.38}
const armGlow=new THREE.PointLight(0x8dff7a,1.3,1.8);armGlow.position.set(.45,.55,0);arm.add(armGlow);scene.add(arm);
arm.userData={name:'LOCK-SERVICE MANIPULATOR',x:5,z:-3};interactables.push(arm);
// A sealed service case. The power cell is visible only after its lid is released.
const caseGroup=new THREE.Group();caseGroup.position.set(-5,0,2);
box(caseGroup,1.45,.55,1.15,mat(0x292d25,.92,.25),0,.28,0);
for(let s of [-1,1])box(caseGroup,.08,.62,.08,rustMat,s*.63,.3,.52);
const lidPivot=new THREE.Group();lidPivot.position.set(0,.58,-.53);caseGroup.add(lidPivot);
box(lidPivot,1.48,.13,.16,edgeMat,0,0,.52);
const lidTop=box(lidPivot,1.45,.13,1.08,mat(0x514632,.94,.2),0,.02,0);
for(let x of [-.48,.48])box(lidPivot,.07,.15,.08,rustMat,x,0,.1);
const cell=new THREE.Group();cell.position.set(0,.7,0);box(cell,.5,.3,.36,greenMat,0,0,0);box(cell,.28,.12,.04,screenMat,0,.02,.2);cylinder(cell,.08,.08,.12,rustMat,.29,0,0,0,0);cell.visible=false;caseGroup.add(cell);
scene.add(caseGroup);caseGroup.userData={name:'SEALED SERVICE CASE',x:-5,z:2};interactables.push(caseGroup);
const generator=new THREE.Group();generator.position.set(-4,0,-3);box(generator,1,.7,.8,edgeMat,0,.35,0);box(generator,.7,.9,.6,wallMat,0,1.1,0);box(generator,.48,.22,.05,screenMat,0,1.25,.33);scene.add(generator);generator.userData={name:'AUXILIARY POWER DISTRIBUTION',x:-4,z:-3};interactables.push(generator);
const hatch=new THREE.Group();hatch.position.set(7,0,1);cylinder(hatch,1.15,1.15,.22,edgeMat,0,1.4,0,Math.PI/2,0);cylinder(hatch,.83,.83,.24,darkMat,0,1.4,.02,Math.PI/2,0);const hatchDoor=new THREE.Group();hatchDoor.position.set(-.72,1.4,.2);hatch.add(hatchDoor);box(hatchDoor,.18,1.2,.22,rustMat,.72,0,0);box(hatchDoor,.12,.2,.28,greenMat,.72,.35,.12);scene.add(hatch);hatch.userData={name:'MAINTENANCE EXIT',x:7,z:1};interactables.push(hatch);
// SRV-09 is a horizontal chassis on articulated reverse-jointed legs.
const robot=new THREE.Group();scene.add(robot);const body=new THREE.Group();robot.add(body);
box(body,1.55,.62,.92,greenMat,0,1.35,0);box(body,1.34,.13,.78,edgeMat,0,1.69,0);box(body,.55,.36,.72,mat(0x46513f,.8,.35),.35,1.55,.08);box(body,.34,.26,.28,darkMat,.82,1.43,.18);
const lens=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),new THREE.MeshStandardMaterial({color:0x9d3426,emissive:0x7a130d,emissiveIntensity:1.8,roughness:.2}));lens.position.set(.84,1.46,.34);body.add(lens);
cylinder(body,.13,.16,.2,edgeMat,.42,1.86,-.23);const topEye=new THREE.Mesh(new THREE.SphereGeometry(.065,12,10),screenMat);topEye.position.set(.42,1.91,-.23);body.add(topEye);
box(body,.5,.08,.08,rustMat,-.2,1.71,.47);
for(let i=0;i<3;i++){const wire=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.6,1.05,-.25+i*.22),new THREE.Vector3(-.3,.9,-.35+i*.22),new THREE.Vector3(.3,1,-.3+i*.22)]),12,.035,6,false),darkMat);body.add(wire)}
const legs=[];for(const side of [-1,1]){const hip=new THREE.Group();hip.position.set(side*.48,.98,0);robot.add(hip);cylinder(hip,.24,.24,.22,edgeMat,0,0,0,Math.PI/2);const upper=cylinder(hip,.11,.15,.68,darkMat,0,-.36,0);upper.rotation.z=side*.18;const knee=new THREE.Group();knee.position.set(side*.08,-.68,0);hip.add(knee);cylinder(knee,.17,.17,.18,greenMat,0,0,0,Math.PI/2);const lower=cylinder(knee,.075,.11,.7,greenMat,side*.08,-.35,.03);lower.rotation.z=-side*.12;box(knee,.32,.12,.35,darkMat,side*.1,-.72,.05);for(let p=-1;p<=1;p+=2){const toe=cylinder(knee,.035,.035,.32,edgeMat,side*.1+p*.1,-.78,.2,Math.PI/2);toe.rotation.z=.35}legs.push({hip,knee,side})}
robot.position.set(0,0,4);robot.rotation.y=Math.PI*.18;
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.45}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;robot.add(shadow);

let charge=20,hasArm=false,armEquipped=false,caseOpen=false,hasCell=false,usedCell=false,powerOn=false,ended=false,paused=false,doorOpening=false,doorOpen=false,target=null,selected=null,walkTime=0;\nconst keys={w:false,a:false,s:false,d:false};
const logMessages=[];const task=document.querySelector('#task'),toast=document.querySelector('#toast'),inventory=document.querySelector('#inventory');
function say(s){logMessages.push(s);if(logMessages.length>8)logMessages.shift()}
let toastTimer;function notify(s){toast.textContent=s;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
function updateCharge(){document.querySelector('#charge').textContent=String(Math.ceil(charge)).padStart(2,'0')+'%';document.querySelector('#charge-bar').style.width=Math.max(0,charge)+'%'}
function updateInventory(){document.querySelector('#item-count').textContent=hasArm?'01':'00';document.querySelector('#arm-hot').textContent=armEquipped?'EQUIPPED':hasArm?'STOWED':'EMPTY';document.querySelector('#arm-hot').classList.toggle('filled',hasArm);document.querySelector('#cell-hot').textContent=hasCell?'READY':usedCell?'USED':'EMPTY';document.querySelector('#cell-hot').classList.toggle('filled',hasCell||usedCell);document.querySelector('#arm-slot').textContent=armEquipped?'LOCK-SERVICE ARM':'EMPTY';document.querySelector('#arm-slot').nextElementSibling.textContent=armEquipped?'COMPONENT INSTALLED':'DRAG COMPONENT HERE';
const list=document.querySelector('#inventory-items');list.innerHTML='';if(!hasArm){list.innerHTML='<p class="empty-inventory">No components recovered.</p>'}else{const item=document.createElement('div');item.className='inventory-item';item.draggable=true;item.innerHTML='<strong>LOCK-SERVICE MANIPULATOR</strong><small>ARTICULATED TOOL ARM · MECHANICAL LOCK RELEASE</small>';item.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain','lock-arm');e.dataTransfer.effectAllowed='move'});list.appendChild(item)}}
function openInventory(){inventory.classList.add('open');inventory.setAttribute('aria-hidden','false');updateInventory();target=null}
function closeInventory(){inventory.classList.remove('open');inventory.setAttribute('aria-hidden','true')}
const armSlot=document.querySelector('[data-slot="arm"]');armSlot.addEventListener('dragover',e=>{e.preventDefault();armSlot.classList.add('drag-over')});armSlot.addEventListener('dragleave',()=>armSlot.classList.remove('drag-over'));armSlot.addEventListener('drop',e=>{e.preventDefault();armSlot.classList.remove('drag-over');if(e.dataTransfer.getData('text/plain')==='lock-arm'&&hasArm){armEquipped=true;updateInventory();say('LOCK-SERVICE ARM INSTALLED.');notify('COMPONENT INSTALLED');task.textContent='Use the arm to release the sealed service case.'}});
document.querySelector('#close-inventory').addEventListener('click',closeInventory);
document.querySelector('#fullscreen').addEventListener('click',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()});
function removeObject(o){scene.remove(o);const i=interactables.indexOf(o);if(i>=0)interactables.splice(i,1)}
function nearest(){let best=null,d=Infinity;for(const o of interactables){const n=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(n<d){d=n;best=o}}return d<1.8?best:null}
function interact(){if(ended||inventory.classList.contains('open'))return;const o=selected||nearest();if(!o){notify('NO SERVICE OBJECT IN REACH');return}const dist=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(dist>1.8){target=new THREE.Vector3(o.userData.x,0,o.userData.z);notify('MOVING TO '+o.userData.name);return}
const id=o.userData.name;
if(id==='LOCK-SERVICE MANIPULATOR'){if(hasArm)return;hasArm=true;removeObject(o);updateInventory();say('LOOSE MANIPULATOR RECOVERED.');task.textContent='Inspect the recovered component in your inventory.';notify('COMPONENT RECOVERED');setTimeout(()=>notify('NEW COMPONENT STORED  ·  I TO INSPECT'),850)}
else if(id==='SEALED SERVICE CASE'){if(!armEquipped){notify('MECHANICAL RELEASE REQUIRED');say('CASE LOCK CANNOT BE OPERATED WITHOUT A MANIPULATOR.');return}if(!caseOpen){caseOpen=true;lidPivot.rotation.x=-1.35;cell.visible=true;say('SERVICE CASE RELEASED.');task.textContent='Recover the portable power cell from the open case.';notify('LOCK RELEASED')}else if(!hasCell){hasCell=true;cell.visible=false;say('PORTABLE POWER CELL RECOVERED.');task.textContent='Use the power cell to restore internal charge.';updateInventory();notify('POWER CELL ACQUIRED')}}
else if(id==='AUXILIARY POWER DISTRIBUTION'){if(!usedCell){notify('POWER RESERVE REQUIRED');return}powerOn=true;phosphor.intensity=34;say('AUXILIARY DISTRIBUTION ONLINE.');task.textContent='Reach the maintenance exit.';notify('ROOM POWER RESTORED')}
else if(id==='MAINTENANCE EXIT'){if(!powerOn){notify('ACCESS SYSTEMS OFFLINE');return}if(!doorOpening&&!doorOpen){doorOpening=true;hatch.userData.openStarted=performance.now();say('EXIT MECHANISM ENGAGED.');task.textContent='Maintenance exit opening...';notify('ACCESS GRANTED');}}
}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let downX=0,downY=0,dragged=false;
renderer.domElement.addEventListener('pointerdown',e=>{downX=e.clientX;downY=e.clientY;dragged=false});
renderer.domElement.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)dragged=true});
renderer.domElement.addEventListener('pointerup',e=>{if(dragged||ended||paused||inventory.classList.contains('open'))return;const r=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(interactables,true);let hit=null;for(const h of hits){let obj=h.object;while(obj.parent&&!interactables.includes(obj))obj=obj.parent;if(interactables.includes(obj)){hit=obj;break}}if(hit){selected=hit;notify(hit.userData.name)}});
const pauseScreen=document.querySelector('#pause-screen'),deathScreen=document.querySelector('#death-screen'),devConsole=document.querySelector('#dev-console'),consoleOutput=document.querySelector('#console-output'),consoleInput=document.querySelector('#console-input');
function setPaused(value){paused=value;pauseScreen.classList.toggle('open',paused);pauseScreen.setAttribute('aria-hidden',String(!paused));document.body.classList.toggle('paused',paused);if(paused){target=null;Object.keys(keys).forEach(k=>keys[k]=false)}}
function restartDemo(){location.reload()}
document.querySelector('#resume-game').addEventListener('click',()=>setPaused(false));document.querySelector('#pause-restart').addEventListener('click',restartDemo);document.querySelector('#death-restart').addEventListener('click',restartDemo);
function consoleLog(s){consoleOutput.textContent+='\n'+s;consoleOutput.scrollTop=consoleOutput.scrollHeight}
function runCommand(raw){const p=raw.trim().split(/\\s+/),cmd=(p.shift()||'').toLowerCase(),n=Number(p[0]);if(!cmd)return;
if(cmd==='help')consoleLog('help | charge [0-100] | heal | arm | cell | power | unlock | teleport [x z] | god | kill | clear');
else if(cmd==='charge'&&Number.isFinite(n)){charge=THREE.MathUtils.clamp(n,0,100);updateCharge();consoleLog('CHARGE = '+charge)}
else if(cmd==='heal'){charge=100;updateCharge();consoleLog('CHARGE RESTORED')}
else if(cmd==='arm'){hasArm=true;armEquipped=true;const i=interactables.indexOf(arm);if(i>=0)removeObject(arm);updateInventory();consoleLog('MANIPULATOR RECOVERED + EQUIPPED')}
else if(cmd==='cell'){hasCell=true;usedCell=false;updateInventory();consoleLog('POWER CELL ADDED')}
else if(cmd==='power'){powerOn=true;phosphor.intensity=34;consoleLog('AUXILIARY POWER ENABLED')}
else if(cmd==='unlock'){armEquipped=true;caseOpen=true;lidPivot.rotation.x=-1.35;cell.visible=true;updateInventory();consoleLog('SERVICE CASE UNLOCKED')}
else if(cmd==='teleport'&&p.length>=2){robot.position.set(THREE.MathUtils.clamp(Number(p[0]),-8,8),0,THREE.MathUtils.clamp(Number(p[1]),-6,6));consoleLog('UNIT TELEPORTED')}
else if(cmd==='god'){godMode=!godMode;consoleLog('GOD MODE '+(godMode?'ON':'OFF'))}
else if(cmd==='kill'){charge=0;updateCharge();triggerDeath()}
else if(cmd==='clear')consoleOutput.textContent='SATURN STATION // 0.2 DEV CONSOLE';
else consoleLog('UNKNOWN COMMAND. Type help.')}
let godMode=false;document.querySelector('#console-form').addEventListener('submit',e=>{e.preventDefault();const value=consoleInput.value;consoleLog('> '+value);runCommand(value);consoleInput.value=''});
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(devConsole.classList.contains('open')){if(k==='f2'){devConsole.classList.remove('open');devConsole.setAttribute('aria-hidden','true');renderer.domElement.focus()}return}
if(k==='f2'){e.preventDefault();devConsole.classList.add('open');devConsole.setAttribute('aria-hidden','false');consoleInput.focus();return}
if(k==='escape'){if(inventory.classList.contains('open')){closeInventory();return}if(deathScreen.classList.contains('open'))return;setPaused(!paused);return}
if(paused||ended||inventory.classList.contains('open'))return;
if(k in keys){keys[k]=true;e.preventDefault()}
if(k==='i'){openInventory();return}if(k==='e')interact();if(k==='q'&&hasCell&&!usedCell){usedCell=true;charge=Math.min(100,charge+55);updateCharge();updateInventory();say('POWER CELL CONSUMED. INTERNAL CHARGE RESTORED.');task.textContent='Restore auxiliary power distribution.';notify('CHARGE +55')}});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k in keys)keys[k]=false});
window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
function triggerDeath(){if(godMode||deathScreen.classList.contains('open'))return;ended=true;Object.keys(keys).forEach(k=>keys[k]=false);deathScreen.classList.add('open');deathScreen.setAttribute('aria-hidden','false');task.textContent='UNIT POWER DEPLETED.';say('CRITICAL: UNIT POWER DEPLETED.');}
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);const aspect=w/h,view=8;camera.left=-view*aspect;camera.right=view*aspect;camera.top=view;camera.bottom=-view;camera.updateProjectionMatrix()}
window.addEventListener('resize',resize);resize();
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);controls.enabled=!inventory.classList.contains('open')&&!paused&&!devConsole.classList.contains('open');controls.update();if(!paused&&!ended&&!inventory.classList.contains('open')&&!devConsole.classList.contains('open')){const mx=(keys.d?1:0)-(keys.a?1:0),mz=(keys.s?1:0)-(keys.w?1:0),len=Math.hypot(mx,mz);if(len>0){const speed=2.6;robot.position.x=THREE.MathUtils.clamp(robot.position.x+mx/len*speed*dt,-8,8);robot.position.z=THREE.MathUtils.clamp(robot.position.z+mz/len*speed*dt,-6,6);robot.rotation.y=Math.atan2(mx,mz);walkTime+=dt*9;for(const l of legs){l.hip.rotation.z=Math.sin(walkTime+l.side)*.22;l.knee.rotation.z=Math.max(0,Math.sin(walkTime+l.side+1))*.38}body.position.y=.035+Math.abs(Math.sin(walkTime*2))*.035}else{body.position.y=0;for(const l of legs){l.hip.rotation.z=0;l.knee.rotation.z=0}}}
if(!paused&&!ended&&!godMode&&charge>0){charge=Math.max(0,charge-dt*.1);updateCharge();if(charge===0){notify('POWER DEPLETED');triggerDeath()}}\nif(doorOpening&&!doorOpen){const t=Math.min(1,(performance.now()-hatch.userData.openStarted)/1150);hatchDoor.rotation.z=-1.65*t;if(t>=1){doorOpening=false;doorOpen=true;ended=true;task.textContent='Demo complete.';notify('DEMO COMPLETE')}}
renderer.render(scene,camera)}
animate();document.querySelector('#loading').classList.add('hidden');document.querySelector('#charge').textContent='20%';document.querySelector('#charge-bar').style.width='20%';updateCharge();updateInventory();say('SYSTEMS ONLINE. RECOVERY DIRECTIVE RECEIVED.');
