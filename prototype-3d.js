import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

const viewport=document.querySelector('#viewport');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x050a0b);
scene.fog=new THREE.FogExp2(0x050a0b,0.035);
const camera=new THREE.OrthographicCamera(-11,11,8,-8,0.1,100);
camera.position.set(12,14,12);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
viewport.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,0,0);
controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;
controls.minPolarAngle=.55;controls.maxPolarAngle=1.25;controls.minZoom=.65;controls.maxZoom=2.0;
camera.zoom=1.05;camera.updateProjectionMatrix();
scene.add(new THREE.HemisphereLight(0x829b9a,0x15100c,1.25));
const key=new THREE.DirectionalLight(0xb7c6b0,2.1);key.position.set(-5,12,7);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-12;key.shadow.camera.right=12;key.shadow.camera.top=12;key.shadow.camera.bottom=-12;scene.add(key);
const emergency=new THREE.PointLight(0xc33d24,32,11,2);emergency.position.set(4,4,-3);scene.add(emergency);
const phosphor=new THREE.PointLight(0x6bff8b,13,7,2);phosphor.position.set(-4,2,2);scene.add(phosphor);
const mat=(colour,rough=.8,metal=0)=>new THREE.MeshStandardMaterial({color:colour,roughness:rough,metalness:metal});
const floorMat=mat(0x202723,.96,.25),wallMat=mat(0x171f1d,.9,.3),edgeMat=mat(0x4a4a38,.8,.35),rustMat=mat(0x70412a,.95,.1),darkMat=mat(0x080e0d,.7,.3),greenMat=mat(0x68765b,.72,.35),greenLight=mat(0x9dff70,.35,.1),screenMat=new THREE.MeshStandardMaterial({color:0x72ff92,emissive:0x35d85c,emissiveIntensity:2});
function box(parent,w,h,d,material,x,y,z,cast=true){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m}
function cylinder(parent,r1,r2,h,material,x,y,z,rx=0,rz=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),material);m.position.set(x,y,z);m.rotation.x=rx;m.rotation.z=rz;m.castShadow=true;parent.add(m);return m}
const floor=box(scene,18,.35,14,floorMat,0,-.2,0,false);
const grid=new THREE.GridHelper(18,18,0x3c5146,0x29352f);grid.position.y=-.015;scene.add(grid);
// Enclosing walls and heavy structural ribs.
box(scene,18,5,.45,wallMat,0,2.3,-7,false);box(scene,.45,5,14,wallMat,-9,2.3,0,false);box(scene,.45,5,14,wallMat,9,2.3,0,false);
for(let x=-8;x<=8;x+=2){box(scene,.18,4.8,.22,edgeMat,x,2.2,-6.72);box(scene,.16,4.6,.18,darkMat,x,2.2,-6.55)}
// Overhead pipework, cable bundles and the station's improvised repairs.
for(let z=-5;z<=4;z+=2){cylinder(scene,.16,.16,17,edgeMat,0,4.35,z,0,Math.PI/2);for(let x=-7;x<=7;x+=3)cylinder(scene,.22,.22,.13,rustMat,x,4.35,z,Math.PI/2,0)}
for(let i=0;i<8;i++){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-8+i*2,4.7,-6),new THREE.Vector3(-7+i*2,3.7,-3),new THREE.Vector3(-8+i*2,3.1,0),new THREE.Vector3(-6+i*2,2.7,4)]);const cable=new THREE.Mesh(new THREE.TubeGeometry(curve,28,.045,6,false),darkMat);scene.add(cable)}
// Floor plates, oil patches and scattered debris.
for(let i=0;i<20;i++){const x=((i*37)%160)/10-8,z=((i*61)%120)/10-6;const stain=new THREE.Mesh(new THREE.CircleGeometry(.25+(i%4)*.12,16),new THREE.MeshStandardMaterial({color:0x080d0b,roughness:.25,metalness:.35}));stain.rotation.x=-Math.PI/2;stain.position.set(x,.002,z);scene.add(stain)}
function machine(x,z,colour=greenMat){const g=new THREE.Group();g.position.set(x,0,z);box(g,1.2,.5,1,edgeMat,0,.25,0);box(g,.85,1.7,.75,wallMat,0,1.25,0);box(g,.65,.65,.08,colour,0,1.6,.4);box(g,.4,.18,.04,screenMat,0,1.65,.46);for(let i=-1;i<=1;i++)cylinder(g,.045,.045,1.3,darkMat,i*.38,.8,-.35);scene.add(g);return g}
machine(-5,-3);machine(5,-2,rustMat);
function crate(x,z){const g=new THREE.Group();g.position.set(x,0,z);box(g,1,.8,1,mat(0x3d392d,.95,.15),0,.4,0);for(let i=-1;i<=1;i++)box(g,.08,.84,.08,edgeMat,i*.4,.4,.51);box(g,1.04,.08,1.04,rustMat,0,.82,0);scene.add(g)}
crate(-7,3);crate(7,4);crate(6,-5);
// Service objects, each with a simple visual marker and interaction data.
const interactables=[];
function marker(name,x,z,kind){const group=new THREE.Group();group.position.set(x,0,z);if(kind==='battery'){box(group,.65,.38,.45,greenMat,0,.3,0);box(group,.38,.17,.04,screenMat,0,.32,.24);cylinder(group,.09,.09,.1,rustMat,.38,.3,0,0,0)}else if(kind==='generator'){box(group,1,.7,.8,edgeMat,0,.35,0);box(group,.7,.9,.6,wallMat,0,1.1,0);box(group,.48,.22,.05,screenMat,0,1.25,.33)}else{box(group,.8,.22,.5,greenMat,0,.35,0);for(let s of [-1,1]){const rod=cylinder(group,.045,.045,.7,edgeMat,s*.2,.68,0,0,0);rod.rotation.z=s*.55;}}scene.add(group);group.userData={name,x,z};interactables.push(group);return group}
const battery=marker('PORTABLE POWER CELL',-5,2,'battery');
const generator=marker('AUXILIARY POWER DISTRIBUTION',-4,-3,'generator');
const tool=marker('LOCK-SERVICE MANIPULATOR',5,-4,'tool');
const hatch=new THREE.Group();hatch.position.set(7,0,1);cylinder(hatch,1.15,1.15,.22,edgeMat,0,1.4,0,Math.PI/2,0);cylinder(hatch,.83,.83,.24,darkMat,0,1.4,.02,Math.PI/2,0);box(hatch,.18,1.2,.22,rustMat,0,1.4,.2);scene.add(hatch);hatch.userData={name:'MAINTENANCE EXIT',x:7,z:1};interactables.push(hatch);
// SRV-09: deliberately non-humanoid, horizontal chassis on articulated reverse-jointed legs.
const robot=new THREE.Group();scene.add(robot);
const body=new THREE.Group();robot.add(body);
box(body,1.55,.62,.92,greenMat,0,1.35,0);
box(body,1.34,.13,.78,edgeMat,0,1.69,0);
box(body,.55,.36,.72,mat(0x46513f,.8,.35),.35,1.55,.08);
box(body,.34,.26,.28,darkMat,.82,1.43,.18);
const lens=new THREE.Mesh(new THREE.SphereGeometry(.13,16,12),new THREE.MeshStandardMaterial({color:0x9d3426,emissive:0x7a130d,emissiveIntensity:1.8,roughness:.2}));lens.position.set(.84,1.46,.34);body.add(lens);
const topSensor=cylinder(body,.13,.16,.2,edgeMat,.42,1.86,-.23,0,0);const topEye=new THREE.Mesh(new THREE.SphereGeometry(.065,12,10),screenMat);topEye.position.set(.42,1.91,-.23);body.add(topEye);
box(body,.5,.08,.08,rustMat,-.2,1.71,.47);
for(let i=0;i<3;i++){const wire=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-.6,1.05,-.25+i*.22),new THREE.Vector3(-.3,.9,-.35+i*.22),new THREE.Vector3(.3,1.0,-.3+i*.22)]),12,.035,6,false),darkMat);body.add(wire)}
const legs=[];
for(const side of [-1,1]){const hip=new THREE.Group();hip.position.set(side*.48,.98,0);robot.add(hip);cylinder(hip,.24,.24,.22,edgeMat,0,0,0,Math.PI/2,0);const upper=cylinder(hip,.11,.15,.68,darkMat,0,-.36,0,0,0);upper.rotation.z=side*.18;const knee=new THREE.Group();knee.position.set(side*.08,-.68,0);hip.add(knee);cylinder(knee,.17,.17,.18,greenMat,0,0,0,Math.PI/2,0);const lower=cylinder(knee,.075,.11,.7,greenMat,side*.08,-.35,.03,0,0);lower.rotation.z=-side*.12;box(knee,.32,.12,.35,darkMat,side*.1,-.72,.05);for(let pr=-1;pr<=1;pr+=2){const toe=cylinder(knee,.035,.035,.32,edgeMat,side*.1+pr*.1,-.78,.2,Math.PI/2,0);toe.rotation.z=.35}legs.push({hip,knee,side})}
robot.position.set(0,0,4);robot.rotation.y=Math.PI*.18;
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.9,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.45}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;robot.add(shadow);
let charge=8,hasCell=false,usedCell=false,powerOn=false,hasTool=false,ended=false,target=null,selected=null,walkTime=0;
const log=document.querySelector('#log'),task=document.querySelector('#task'),toast=document.querySelector('#toast');
function say(s){const p=document.createElement('p');p.textContent='> '+s;log.insertBefore(p,log.lastElementChild);while(log.children.length>5)log.removeChild(log.firstChild)}
let toastTimer;function notify(s){toast.textContent=s;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2100)}
function updateCharge(){document.querySelector('#charge').textContent=String(Math.ceil(charge)).padStart(2,'0')+'%';document.querySelector('#charge-bar').style.width=Math.max(0,charge)+'%'}
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();let downX=0,downY=0,dragged=false;
renderer.domElement.addEventListener('pointerdown',e=>{downX=e.clientX;downY=e.clientY;dragged=false});
renderer.domElement.addEventListener('pointermove',e=>{if(Math.hypot(e.clientX-downX,e.clientY-downY)>5)dragged=true});
renderer.domElement.addEventListener('pointerup',e=>{if(dragged||ended)return;const r=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(interactables,true);let hit=null;for(const h of hits){let o=h.object;while(o.parent&&!interactables.includes(o))o=o.parent;if(interactables.includes(o)){hit=o;break}}if(hit){selected=hit;notify(hit.userData.name);say('Selected '+hit.userData.name+'. Move close and press E.');return}const ground=raycaster.intersectObject(floor);if(ground.length){target=ground[0].point;target.y=0;target.x=THREE.MathUtils.clamp(target.x,-8,8);target.z=THREE.MathUtils.clamp(target.z,-6,6);notify('MOVEMENT ORDER RECEIVED')}});
function nearest(){let best=null,d=Infinity;for(const o of interactables){const n=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(n<d){d=n;best=o}}return d<1.8?best:null}
function interact(){const o=selected||nearest();if(!o){notify('NO SERVICE POINT IN RANGE');say('No equipment within reach. Click an object to select it.');return}const dist=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(dist>1.8){target=new THREE.Vector3(o.userData.x,0,o.userData.z);notify('MOVING TO '+o.userData.name);return}
const id=o.userData.name;
if(id==='PORTABLE POWER CELL'){if(hasCell){say('POWER CELL ALREADY RECOVERED.');return}hasCell=true;scene.remove(o);interactables.splice(interactables.indexOf(o),1);say('PORTABLE POWER CELL RECOVERED.');task.textContent='Use the portable cell, then restore auxiliary power.';notify('POWER CELL ACQUIRED')}
else if(id==='AUXILIARY POWER DISTRIBUTION'){if(!hasCell||!usedCell){say('START SEQUENCE BLOCKED. A charged unit is required.');notify('POWER RESERVE REQUIRED');return}powerOn=true;phosphor.intensity=34;say('AUXILIARY DISTRIBUTION ONLINE.');task.textContent='Recover the lock-service manipulator.';notify('ROOM POWER RESTORED')}
else if(id==='LOCK-SERVICE MANIPULATOR'){if(!powerOn){say('STORAGE CRADLE IS UNPOWERED.');notify('CRADLE OFFLINE');return}hasTool=true;scene.remove(o);interactables.splice(interactables.indexOf(o),1);say('LOCK-SERVICE MANIPULATOR RECOVERED.');task.textContent='Reach the maintenance exit.';notify('NEW PART RECOVERED')}
else if(id==='MAINTENANCE EXIT'){if(!hasTool||!powerOn){say('EXIT LOCKED. REQUIRED SYSTEMS OFFLINE.');notify('ACCESS DENIED');return}ended=true;say('MECHANICAL LOCK RELEASED. EXIT OPEN.');task.textContent='Demo complete.';notify('ACCESS GRANTED')}
}
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='e')interact();if(k==='q'&&hasCell&&!usedCell){usedCell=true;charge=Math.min(100,charge+55);updateCharge();say('POWER CELL CONSUMED. INTERNAL CHARGE RESTORED.');task.textContent='Restore auxiliary power distribution.';notify('CHARGE +55');}if(e.key==='Escape'){selected=null;target=null}});
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);const aspect=w/h;const view=8;camera.left=-view*aspect;camera.right=view*aspect;camera.top=view;camera.bottom=-view;camera.updateProjectionMatrix()}
window.addEventListener('resize',resize);resize();
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);controls.update();if(target&&!ended){const dx=target.x-robot.position.x,dz=target.z-robot.position.z,dist=Math.hypot(dx,dz);if(dist>.12){const speed=2.1;robot.position.x+=dx/dist*Math.min(dist,speed*dt);robot.position.z+=dz/dist*Math.min(dist,speed*dt);robot.rotation.y=Math.atan2(dx,dz);walkTime+=dt*9;for(const l of legs){l.hip.rotation.z=Math.sin(walkTime+l.side)*.22;l.knee.rotation.z=Math.max(0,Math.sin(walkTime+l.side+1))*.38}body.position.y=.035+Math.abs(Math.sin(walkTime*2))*.035}else{target=null;for(const l of legs){l.hip.rotation.z=0;l.knee.rotation.z=0}}}
if(!ended&&charge>0){charge=Math.max(0,charge-dt*.1);updateCharge();if(charge===0){ended=true;task.textContent='UNIT POWER DEPLETED.';notify('POWER DEPLETED');say('CRITICAL: UNIT POWER DEPLETED.')}}
document.querySelector('#coords').textContent='GRID '+String(Math.round(robot.position.x+9)).padStart(2,'0')+'-'+String(Math.round(robot.position.z+7)).padStart(2,'0');
renderer.render(scene,camera)}
animate();document.querySelector('#loading').classList.add('hidden');updateCharge();
say('3D TEST ENVIRONMENT READY.');say('Click the floor to move. Drag to rotate the camera.');
