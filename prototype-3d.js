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
// SRV-09: 0.2 reconstruction guided by the original 0.1 isometric sprite.
// Keep the low, elongated chassis, offset optical nose, exposed underside and
// asymmetric forward/rear walking legs. This is deliberately non-humanoid.
const robot=new THREE.Group();scene.add(robot);
const body=new THREE.Group();robot.add(body);
const sage=mat(0x68765b,.88,.22),sageLight=mat(0x879176,.9,.12),sageDark=mat(0x424d3b,.92,.18);
const gunmetal=mat(0x252c29,.76,.62),blackMetal=mat(0x101614,.7,.48),steel=mat(0x68716a,.52,.78);
const grime=mat(0x33291f,.98,.08),hazard=mat(0x9b4a2d,.88,.18),ivory=mat(0xb5b49a,.9,.08);
const opticDark=mat(0x090d0d,.24,.55);
const optic=new THREE.MeshStandardMaterial({color:0x67241e,emissive:0x5d100c,emissiveIntensity:1.35,roughness:.22,metalness:.18});
const bodyBox=(w,h,d,m,x,y,z)=>box(body,w,h,d,m,x,y,z);
const cylX=(parent,r,h,m,x,y,z)=>cylinder(parent,r,r,h,m,x,y,z,0,Math.PI/2);
function strut(parent,a,b,r1,r2,material){
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,delta.length(),9),material);
  mesh.position.copy(av.add(bv).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function cable(parent,points,r=.025,material=blackMetal){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,20,r,6,false),material);
  mesh.castShadow=true;parent.add(mesh);return mesh;
}
// Main floating maintenance chassis: long and low, with layered battered armour.
bodyBox(2.05,.48,1.02,sage,0,1.35,0);
bodyBox(1.82,.12,.88,sageDark,-.04,1.64,-.015);
bodyBox(1.52,.09,.78,sageLight,-.08,1.72,-.02);
bodyBox(.58,.22,1.04,gunmetal,-.22,1.13,0); // exposed belly cradle
bodyBox(.94,.16,.72,blackMetal,-.15,1.02,-.02);
bodyBox(.72,.12,.62,gunmetal,-.18,.94,.02);
bodyBox(.42,.28,.62,sageDark,-.55,1.31,-.03);
bodyBox(.28,.18,.48,hazard,-.66,1.43,.02);
// Raised armour shoulders and side skirts, deliberately unequal.
bodyBox(.62,.2,.13,sageLight,-.52,1.53,.51);
bodyBox(.88,.17,.12,sage,-.43,1.52,-.51);
bodyBox(.36,.12,.16,hazard,.48,1.57,.49);
bodyBox(.48,.08,.12,ivory,-.58,1.61,.34);
bodyBox(.42,.07,.12,ivory,.18,1.61,-.43);
// Front sensor/nose: offset multi-lens optical assembly in a recessed dark housing.
const nose=new THREE.Group();nose.position.set(.47,1.34,.52);body.add(nose);
const noseHousing=new THREE.Mesh(new THREE.CylinderGeometry(.23,.27,.22,10),gunmetal);
noseHousing.rotation.x=Math.PI/2;noseHousing.castShadow=true;nose.add(noseHousing);
const noseRim=new THREE.Mesh(new THREE.TorusGeometry(.17,.035,8,20),steel);noseRim.position.z=.125;nose.add(noseRim);
const mainLens=new THREE.Mesh(new THREE.SphereGeometry(.115,16,12),optic);mainLens.position.z=.14;nose.add(mainLens);
for(const [x,y,r] of [[-.085,.07,.035],[.085,.07,.035],[0,-.075,.027]]){
  const l=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),opticDark);l.position.set(x,y,.17);nose.add(l);
}
const lensGlow=new THREE.PointLight(0x8e241b,.32,1.1);lensGlow.position.set(.47,1.34,.78);body.add(lensGlow);
// Small secondary sensor pod on the upper ridge, offset to the opposite side.
cylX(body,.14,.23,gunmetal,.68,1.67,-.22);
const sensorCap=new THREE.Mesh(new THREE.SphereGeometry(.105,12,10),screenMat);sensorCap.position.set(.68,1.79,-.22);body.add(sensorCap);
cable(body,[[-.82,1.2,-.3],[-.56,.99,-.42],[-.16,1.02,-.38],[.22,1.1,-.34]],.032,blackMetal);
cable(body,[[-.62,1.17,.36],[-.35,.98,.48],[.02,1.03,.42],[.34,1.13,.4]],.025,grime);
// Ribbed conduit running along the underside.
for(let i=0;i<7;i++){
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.105,.027,6,12),gunmetal);
  ring.rotation.y=Math.PI/2;ring.position.set(-.48+i*.15,.94,.03);body.add(ring);
}
// Visible fasteners, chipped plates and stencilled maintenance marks.
for(const x of [-.86,-.48,.08,.73]){
  for(const z of [-.43,.43]){
    const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.025,8),steel);
    bolt.rotation.x=Math.PI/2;bolt.position.set(x,1.48,z);body.add(bolt);
  }
}
for(let i=0;i<4;i++){
  const vent=box(body,.055,.018,.22,blackMetal,-.82+i*.11,1.61,-.12,false);
  vent.rotation.z=-.08;
}
bodyBox(.24,.035,.025,ivory,-.78,1.55,.523);
bodyBox(.16,.035,.025,hazard,.43,1.55,.524);
// Asymmetric two-leg walking gear. The rear leg is shorter and acts as a counterbalance.
const legs=[];
for(const spec of [{z:.34,side:1,upper:.48,lower:.64,forward:.22},{z:-.34,side:-1,upper:.42,lower:.52,forward:-.16}]){
  const hip=new THREE.Group();hip.position.set(-.12,1.12,spec.z);robot.add(hip);
  const pivot=cylX(hip,.235,.2,gunmetal,0,0,0);
  const pivotCap=cylX(hip,.15,.225,steel,.015,0,0);
  const pivotInset=cylX(hip,.095,.24,blackMetal,.025,0,0);
  const upperEnd=[spec.side*.13,-spec.upper*.68,spec.forward*.55];
  strut(hip,[0,-.06,0],upperEnd,.115,.16,sageDark);
  strut(hip,[.11,-.08,.04],[upperEnd[0]+.08,upperEnd[1]+.04,upperEnd[2]+.06],.035,.045,steel);
  // Hydraulic actuator alongside the upper strut.
  strut(hip,[-.11,-.1,-.06],[upperEnd[0]-.08,upperEnd[1]+.12,upperEnd[2]-.04],.027,.045,blackMetal);
  const piston=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.27,8),steel);
  piston.position.set(-.045,-spec.upper*.38,-.015);piston.rotation.z=-spec.side*.18;hip.add(piston);
  const knee=new THREE.Group();knee.position.set(...upperEnd);hip.add(knee);
  const kneeShell=new THREE.Mesh(new THREE.SphereGeometry(.145,12,10),sage);knee.add(kneeShell);
  const kneeAxle=cylX(knee,.105,.22,steel,0,0,0);
  const shinEnd=[spec.side*.06,-spec.lower*.72,spec.forward*.95];
  strut(knee,[0,-.04,0],shinEnd,.085,.12,sage);
  strut(knee,[.075,-.08,.045],[shinEnd[0]+.035,shinEnd[1]+.04,shinEnd[2]+.035],.025,.035,steel);
  cable(knee,[[-.09,-.05,-.06],[-.14,-.22,-.04],[-.1,-.42,.01],[shinEnd[0]-.06,shinEnd[1]+.12,shinEnd[2]-.04]],.022,blackMetal);
  // Broad ankle block and two separate gripping toes.
  const ankle=new THREE.Group();ankle.position.set(...shinEnd);knee.add(ankle);
  const ankleBlock=box(ankle,.34,.16,.3,gunmetal,0,-.04,.08);
  const toeMat=steel;
  for(const s of [-1,1]){
    const toe=box(ankle,.105,.085,.34,toeMat,s*.105,-.105,.25);
    toe.rotation.x=-.12;
    const clawTip=box(ankle,.09,.07,.13,sageDark,s*.105,-.12,.46);
    clawTip.rotation.x=-.18;
  }
  strut(ankle,[-.11,.02,-.02],[-.12,-.13,.19],.025,.035,hazard);
  legs.push({hip,knee,side:spec.side,ankle});
}
robot.position.set(0,0,4);robot.rotation.y=Math.PI*.18;
const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.05,28),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.48}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;robot.add(shadow);

let charge=20,hasArm=false,armEquipped=false,caseOpen=false,hasCell=false,usedCell=false,powerOn=false,ended=false,paused=false,doorOpening=false,doorOpen=false,target=null,selected=null,walkTime=0;
const keys={w:false,a:false,s:false,d:false};
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
function runCommand(raw){const p=raw.trim().split(/\s+/),cmd=(p.shift()||'').toLowerCase(),n=Number(p[0]);if(!cmd)return;
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
if(!paused&&!ended&&!godMode&&charge>0){charge=Math.max(0,charge-dt*.1);updateCharge();if(charge===0){notify('POWER DEPLETED');triggerDeath()}}
if(doorOpening&&!doorOpen){const t=Math.min(1,(performance.now()-hatch.userData.openStarted)/1150);hatchDoor.rotation.z=-1.65*t;if(t>=1){doorOpening=false;doorOpen=true;ended=true;task.textContent='Demo complete.';notify('DEMO COMPLETE')}}
renderer.render(scene,camera)}
animate();document.querySelector('#loading').classList.add('hidden');document.querySelector('#charge').textContent='20%';document.querySelector('#charge-bar').style.width='20%';updateCharge();updateInventory();say('SYSTEMS ONLINE. RECOVERY DIRECTIVE RECEIVED.');
