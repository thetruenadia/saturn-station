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
// SRV-09 definitive mechanical reconstruction for 0.2.
// Forward is +Z. Keep this model self-contained so the same asset can be
// reused by the inventory preview and later animation work.
const robot=new THREE.Group();scene.add(robot);
const body=new THREE.Group();robot.add(body);
const sage= new THREE.MeshStandardMaterial({color:0x667865,roughness:.65,metalness:.15});
const sageLight= new THREE.MeshStandardMaterial({color:0x82917a,roughness:.72,metalness:.18});
const sageDark= new THREE.MeshStandardMaterial({color:0x414d43,roughness:.82,metalness:.25});
const gunmetal=new THREE.MeshStandardMaterial({color:0x242826,roughness:.4,metalness:.85});
const jointMetal=new THREE.MeshStandardMaterial({color:0x181a19,roughness:.25,metalness:.9});
const rawSteel=new THREE.MeshStandardMaterial({color:0x777c70,roughness:.48,metalness:.82});
const rubber=new THREE.MeshStandardMaterial({color:0x0f1010,roughness:.9,metalness:0});
const rust=new THREE.MeshStandardMaterial({color:0x70412b,roughness:.94,metalness:.18});
const brass=new THREE.MeshStandardMaterial({color:0x987344,roughness:.42,metalness:.78});
const stencil=new THREE.MeshStandardMaterial({color:0xd0cbb2,roughness:.85,metalness:.08});
const opticGlass=new THREE.MeshStandardMaterial({color:0xff3518,emissive:0x9b170b,emissiveIntensity:1.6,roughness:.1,metalness:0});
const opticHousing=jointMetal;
const bodyBox=(parent,w,h,d,m,x,y,z)=>box(parent,w,h,d,m,x,y,z);
function cylAlongX(parent,r,h,m,x,y,z){return cylinder(parent,r,r,h,m,x,y,z,0,Math.PI/2)}
function rodBetween(parent,a,b,r,material,r2=r){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r2,delta.length(),10),material);mesh.position.copy(av.clone().add(bv).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function tube(parent,points,r,material,segments=24){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,r,7,false),material);mesh.castShadow=true;parent.add(mesh);return mesh}
function plate(parent,w,h,d,m,x,y,z,bevel=.035){const g=new THREE.Group();g.position.set(x,y,z);const core=new THREE.Mesh(new THREE.BoxGeometry(w-bevel,h-bevel,d-bevel),m);core.castShadow=true;core.receiveShadow=true;g.add(core);parent.add(g);return g}
function label(parent,text,x,y,z,rotationY=0,size=.12,color=0xd0cbb2){const c=document.createElement('canvas');c.width=256;c.height=128;const ctx=c.getContext('2d');ctx.clearRect(0,0,256,128);ctx.fillStyle='#'+color.toString(16).padStart(6,'0');ctx.font='bold 76px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,65);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size*2,size),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));mesh.position.set(x,y,z);mesh.rotation.y=rotationY;parent.add(mesh);return mesh}
function hazardMark(parent,x,y,z,rotationY=0){const s=new THREE.Shape();s.moveTo(0,.09);s.lineTo(.09,-.075);s.lineTo(-.09,-.075);s.closePath();const m=new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshBasicMaterial({color:0x171b17,side:THREE.DoubleSide}));m.position.set(x,y,z);m.rotation.y=rotationY;parent.add(m)}
// Main anvil/wedge chassis. The roof plate is pitched down towards the nose.
const shell=new THREE.Group();shell.position.set(0,1.43,0);body.add(shell);
const core=bodyBox(shell,1.9,.53,1.12,sage,0,0,0);
const roof=bodyBox(shell,1.78,.12,1.02,sageLight,-.025,.29,-.015);roof.rotation.x=-.12;
const frontApron=bodyBox(shell,1.72,.25,.12,sageDark,0,-.13,.55);
const frontFace=bodyBox(shell,1.62,.31,.055,gunmetal,0,-.055,.612);
const leftSkirt=bodyBox(shell,.13,.34,.92,sageDark,-.91,-.055,-.025);
const rightSkirt=bodyBox(shell,.13,.29,.86,sage,.91,-.07,-.015);
bodyBox(shell,.82,.075,.12,rawSteel,-.18,.32,-.48);
bodyBox(shell,.42,.055,.11,rust,.35,.34,-.42);
// Heavy edge rails and removable armour seams.
for(const side of [-1,1]){
  bodyBox(shell,.055,.42,.94,rawSteel,side*.965,-.015,-.015);
  bodyBox(shell,.07,.07,.9,rust,side*.91,-.27,-.015);
  for(let z of [-.42,.36]){const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.025,10),rawSteel);bolt.rotation.z=Math.PI/2;bolt.position.set(side*.99,.03,z);shell.add(bolt)}
}
for(let i=0;i<5;i++){const vent=bodyBox(shell,.075,.018,.24,jointMetal,-.68+i*.13,.36,-.16);vent.rotation.z=-.08}
label(shell,'ば',-.58,.06,.577,0,.19);
label(shell,'の',.18,-.05,.65,0,.085,0xb6b49e);
// Recessed offset primary optic on the front-right nose.
const opticGroup=new THREE.Group();opticGroup.position.set(.52,.015,.66);shell.add(opticGroup);
const opticCup=new THREE.Mesh(new THREE.CylinderGeometry(.205,.23,.13,16),opticHousing);opticCup.rotation.x=Math.PI/2;opticGroup.add(opticCup);
const opticRim=new THREE.Mesh(new THREE.TorusGeometry(.155,.035,9,28),rawSteel);opticRim.position.z=.077;opticGroup.add(opticRim);
const lens=new THREE.Mesh(new THREE.SphereGeometry(.112,20,16),opticGlass);lens.position.z=.085;opticGroup.add(lens);
const lensInner=new THREE.Mesh(new THREE.SphereGeometry(.042,12,10),new THREE.MeshBasicMaterial({color:0xffa16b}));lensInner.position.set(-.025,.025,.17);opticGroup.add(lensInner);
const opticLight=new THREE.PointLight(0xff3217,.45,1.3);opticLight.position.set(.52,1.45,.88);body.add(opticLight);
// Secondary top-right sensor pod and its forward-facing lens.
const sensor=new THREE.Group();sensor.position.set(.61,1.82,-.27);body.add(sensor);
bodyBox(sensor,.34,.22,.34,gunmetal,0,0,0);
bodyBox(sensor,.27,.12,.25,sageDark,0,.14,-.01);
const sensorBar=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.13,12),rawSteel);sensorBar.rotation.x=Math.PI/2;sensorBar.position.set(0,-.015,.19);sensor.add(sensorBar);
const sensorLens=new THREE.Mesh(new THREE.SphereGeometry(.052,12,10),opticGlass);sensorLens.position.set(0,-.015,.255);sensor.add(sensorLens);
// Hinged flush service hatch on the roof.
const servicePanel=new THREE.Group();servicePanel.position.set(-.42,1.82,-.27);body.add(servicePanel);
bodyBox(servicePanel,.34,.035,.27,gunmetal,0,0,0);
bodyBox(servicePanel,.29,.025,.22,sageLight,0,.022,0);
for(const x of [-.12,.12])cylAlongX(servicePanel,.018,.035,rawSteel,x,.045,-.1);
// Exposed belly: rectangular pelvis/drive frame and symmetrical hip axle.
bodyBox(body,1.05,.28,.68,gunmetal,0,1.04,-.02);
bodyBox(body,.72,.19,.56,jointMetal,0,.88,-.01);
bodyBox(body,.4,.12,.43,rawSteel,0,.79,-.02);
for(const side of [-1,1]){
  const drum=cylAlongX(body,.31,.25,jointMetal,side*.64,1.04,0);
  cylAlongX(body,.235,.27,gunmetal,side*.66,1.04,0);
  cylAlongX(body,.115,.29,rawSteel,side*.68,1.04,0);
  const hub=cylAlongX(body,.065,.30,jointMetal,side*.69,1.04,0);
  // Utility boxes mounted outboard of each hip, with hazard triangles.
  bodyBox(body,.26,.22,.28,sageDark,side*.83,.91,-.02);
  bodyBox(body,.21,.17,.025,rawSteel,side*.83,.91,.13);
  hazardMark(body,side*.83,.91,.148);
}
// Three ribbed central rubber conduits from chassis to the hip axle.
for(let i=-1;i<=1;i++){
  const x=i*.16;
  tube(body,[[x,1.31,.24],[x*1.2,1.16,.3],[x*1.4,.98,.25],[x*1.8,.86,.12]],.043,rubber,28);
  for(let j=0;j<8;j++){const tor=new THREE.Mesh(new THREE.TorusGeometry(.044,.012,6,10),gunmetal);tor.position.set(x+(i*.02),1.22-j*.043,.27-j*.018);tor.rotation.x=Math.PI/2;body.add(tor)}
}
// Two brass-ended hydraulic fluid lines routed along the rear underside.
for(const side of [-1,1]){
  tube(body,[[side*.32,1.23,-.43],[side*.46,1.12,-.55],[side*.62,.99,-.48],[side*.76,.9,-.35]],.022,brass,20);
  cylAlongX(body,.04,.09,brass,side*.76,.9,-.35);
}
// Folded two-stage manipulator tucked beneath the rear belly.
const manipulator=new THREE.Group();manipulator.position.set(-.05,.79,-.42);body.add(manipulator);
bodyBox(manipulator,.18,.12,.34,gunmetal,0,0,-.08);
bodyBox(manipulator,.12,.10,.28,rawSteel,0,-.015,-.31);
rodBetween(manipulator,[0,-.02,-.42],[0,-.02,-.63],.045,gunmetal);
for(const side of [-1,1])rodBetween(manipulator,[0,-.02,-.63],[side*.085,-.04,-.78],.018,rawSteel);
// Reverse-jointed legs: rear-swept thigh, backward knee, forward shin, split toes.
const legs=[];
for(const spec of [{side:-1,z:.34,hipX:-.53,thighX:-.24,thighZ:-.22,shinX:.13,shinZ:.31,scale:1.04},{side:1,z:-.34,hipX:.53,thighX:.28,thighZ:-.2,shinX:-.12,shinZ:.3,scale:.94}]){
  const hip=new THREE.Group();hip.position.set(spec.hipX,1.03,spec.z);robot.add(hip);
  cylAlongX(hip,.255,.22,jointMetal,0,0,0);cylAlongX(hip,.19,.24,gunmetal,.02,0,0);cylAlongX(hip,.105,.255,rawSteel,.035,0,0);
  bodyBox(hip,.23,.18,.24,sageDark,spec.side*.13,-.04,.02);
  hazardMark(hip,spec.side*.13,-.04,.145);
  const thighEnd=[spec.thighX,-.53,spec.thighZ];
  rodBetween(hip,[0,-.08,0],thighEnd,.115,sageDark,.15);
  rodBetween(hip,[.06,-.12,.08],[thighEnd[0]+.05,thighEnd[1]+.04,thighEnd[2]+.04],.035,rawSteel,.045);
  // Double-clevis reverse knee, with exposed pin heads.
  const knee=new THREE.Group();knee.position.set(...thighEnd);hip.add(knee);
  const kneeCore=new THREE.Mesh(new THREE.SphereGeometry(.15,14,12),gunmetal);knee.add(kneeCore);
  cylAlongX(knee,.115,.25,rawSteel,0,0,0);
  for(const side of [-1,1]){const pin=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.035,10),jointMetal);pin.rotation.z=Math.PI/2;pin.position.set(side*.145,0,0);knee.add(pin)}
  // Forward-slanted shin with removable green armour sleeve.
  const shinEnd=[spec.shinX,-.83,spec.shinZ];
  rodBetween(knee,[0,-.04,0],shinEnd,.072,gunmetal,.09);
  const sleeve=bodyBox(knee,.22,.31,.19,sage,shinEnd[0]*.62,-.29,shinEnd[2]*.62);
  sleeve.rotation.z=-.18;
  bodyBox(knee,.235,.045,.205,sageLight,shinEnd[0]*.62,-.13,shinEnd[2]*.62);
  label(knee,'09',shinEnd[0]*.62,-.29,shinEnd[2]*.62+.103,0,.045,0xc9c8ac);
  // Front-spanning hydraulic piston, brass fittings and sensor wire clips.
  rodBetween(knee,[-.11,-.13,.08],[shinEnd[0]-.06,shinEnd[1]+.15,shinEnd[2]+.12],.027,rawSteel,.035);
  rodBetween(knee,[-.11,-.13,.08],[-.11,-.38,.15],.043,jointMetal,.043);
  tube(knee,[[-.055,-.18,-.07],[-.09,-.36,-.04],[-.06,-.55,.01],[shinEnd[0]-.02,shinEnd[1]+.1,shinEnd[2]-.04]],.014,rubber,18);
  for(let j=0;j<2;j++){const clip=bodyBox(knee,.035,.045,.04,brass,shinEnd[0]-.025,-.34-j*.18,shinEnd[2]-.025)}
  // Two-axis ankle joint and low-profile steel foot plate.
  const ankle=new THREE.Group();ankle.position.set(...shinEnd);knee.add(ankle);
  cylAlongX(ankle,.105,.2,jointMetal,0,-.02,0);
  bodyBox(ankle,.34,.10,.32,gunmetal,0,-.12,.08);
  bodyBox(ankle,.28,.035,.26,rawSteel,0,-.06,.08);
  // Split forward toes with slight downward pitch.
  for(const s of [-1,1]){
    const toe=bodyBox(ankle,.085,.075,.39,steel,s*.095,-.17,.31);
    toe.rotation.x=-.12;
    const tip=bodyBox(ankle,.095,.065,.13,sageDark,s*.095,-.21,.53);
    tip.rotation.x=-.22;
  }
  bodyBox(ankle,.20,.08,.22,sageDark,0,-.16,-.17); // rear heel spur
  rodBetween(ankle,[-.1,-.02,-.03],[-.1,-.16,.19],.022,brass);
  legs.push({hip,knee,side:spec.side,ankle});
}
// Armour damage: restrained exposed-steel chips and rust streaks around the shell.
for(let i=0;i<18;i++){
  const x=-.88+((i*17)%170)/100;
  const z=-.49+((i*29)%95)/100;
  const chip=bodyBox(shell,.025+(i%3)*.012,.012,.035+(i%2)*.02,i%4===0?rust:rawSteel,x,.18+(i%4)*.035,z,false);
  chip.rotation.y=(i%5)*.17;
}
for(let side of [-1,1]){
  for(let i=0;i<4;i++){const rivet=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),rawSteel);rivet.position.set(side*.98,-.13,-.32+i*.2);shell.add(rivet)}
}
robot.position.set(0,0,4);robot.rotation.y=Math.PI*.18;
const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.15,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.56}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;robot.add(shadow);

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
