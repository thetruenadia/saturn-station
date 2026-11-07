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
const floor=box(scene,28,.35,22,floorMat,0,-.2,0,false);
// No prototype grid: a practical metal maintenance deck replaces it.
box(scene,28,8,.55,wallMat,0,3.8,-11,false);box(scene,.55,8,22,wallMat,-14,3.8,0,false);box(scene,.55,8,22,wallMat,14,3.8,0,false);box(scene,28,8,.55,wallMat,0,3.8,11,false);
for(let x=-8;x<=8;x+=2){box(scene,.18,4.8,.22,edgeMat,x,2.2,-6.72);box(scene,.16,4.6,.18,darkMat,x,2.2,-6.55)}
for(let z=-5;z<=4;z+=2){cylinder(scene,.16,.16,17,edgeMat,0,4.35,z,0,Math.PI/2);for(let x=-7;x<=7;x+=3)cylinder(scene,.22,.22,.13,rustMat,x,4.35,z,Math.PI/2,0)}
for(let i=0;i<8;i++){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(-8+i*2,4.7,-6),new THREE.Vector3(-7+i*2,3.7,-3),new THREE.Vector3(-8+i*2,3.1,0),new THREE.Vector3(-6+i*2,2.7,4)]);scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,28,.045,6,false),darkMat))}
for(let i=0;i<20;i++){const x=((i*37)%160)/10-8,z=((i*61)%120)/10-6;const stain=new THREE.Mesh(new THREE.CircleGeometry(.25+(i%4)*.12,16),mat(0x080d0b,.25,.35));stain.rotation.x=-Math.PI/2;stain.position.set(x,.002,z);scene.add(stain)}
function machine(x,z,colour=greenMat){const g=new THREE.Group();g.position.set(x,0,z);box(g,1.2,.5,1,edgeMat,0,.25,0);box(g,.85,1.7,.75,wallMat,0,1.25,0);box(g,.65,.65,.08,colour,0,1.6,.4);box(g,.4,.18,.04,screenMat,0,1.65,.46);for(let i=-1;i<=1;i++)cylinder(g,.045,.045,1.3,darkMat,i*.38,.8,-.35);scene.add(g);return g}
machine(-5,-3);machine(5,-2, rustMat);
function crate(x,z){const g=new THREE.Group();g.position.set(x,0,z);box(g,1,.8,1,mat(0x3d392d,.95,.15),0,.4,0);for(let i=-1;i<=1;i++)box(g,.08,.84,.08,edgeMat,i*.4,.4,.51);box(g,1.04,.08,1.04,rustMat,0,.82,0);scene.add(g)}
crate(-7,3);crate(7,4);crate(6,-5);
// Maintenance deck B-7: dense, abandoned industrial infrastructure.
// Massive machinery is kept to the walls and high ceiling to preserve navigation.
const industrial=new THREE.Group();scene.add(industrial);
const iron=mat(0x343a35,.9,.48),oxidised=mat(0x514638,.97,.3);
const conduit=mat(0x252d2a,.83,.58),insulation=mat(0x171d1b,.98,.1);
const fadedSage=mat(0x465449,.91,.28),warning=mat(0x8a7748,.87,.2);
function pipeBetween(parent,a,b,r,material,segments=10){
 const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),segments),material);
 mesh.position.copy(av).add(bv).multiplyScalar(.5);
 mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
 mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function industrialTube(points,r,material){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
 const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,30,r,7,false),material);
 mesh.castShadow=true;industrial.add(mesh);
}
// Tall wall frames, cross-bracing and layered service panels.
for(const x of [-8.3,-5.6,-2.9,-.2,2.5,5.2,7.9]){
 box(industrial,.26,6.4,.34,iron,x,3.25,-6.47);
 box(industrial,.56,.18,.5,oxidised,x,1.05,-6.25);
 box(industrial,.56,.18,.5,oxidised,x,4.65,-6.25);
 box(industrial,2.4,.12,.25,iron,x+1.15,3.7,-6.35);
 for(let k=0;k<3;k++)box(industrial,1.85,.65,.12,k===1?fadedSage:wallMat,x+1.05,1.65+k*.85,-6.31);
}
for(const x of [-8.65,8.65]){
 for(let z=-5.4;z<=5.5;z+=2.25){
  box(industrial,.4,6.1,.38,iron,x,3.1,z);
  box(industrial,.52,.16,1.85,oxidised,x,4.5,z+.75);
 }
}
// Heavy overhead cylindrical processing vessels along the rear of the room.
for(const x of [-4.4,3.8]){
 const vessel=new THREE.Group();vessel.position.set(x,5.35,-5.25);industrial.add(vessel);
 const barrel=new THREE.Mesh(new THREE.CylinderGeometry(.94,.94,6.3,16),oxidised);
 barrel.rotation.z=Math.PI/2;barrel.castShadow=true;vessel.add(barrel);
 for(const offset of [-2.7,-1.5,0,1.5,2.7]){
  const band=new THREE.Mesh(new THREE.CylinderGeometry(1.015,1.015,.16,16),iron);
  band.rotation.z=Math.PI/2;band.position.x=offset;vessel.add(band);
 }
 for(let k=0;k<7;k++){
  const x0=-2.6+k*.85;
  industrialTube([[x+x0,5.96,-5.95],[x+x0+.12,5.6,-6.18],[x+x0+.3,4.8,-6.28]],.035,conduit);
 }
}
// Banks of large pipes turn down the rear wall, with couplings and collars.
for(let i=0;i<11;i++){
 const x=-7.5+i*1.45;
 const r=i%3===0?.21:.115;
 industrialTube([[x,6.2,-5.55],[x,5.3,-5.45],[x+.15,4.8,-6.03],[x+.18,3.15,-6.08],[x+.18,1.4,-6.12]],r,i%4===0?oxidised:conduit);
 for(const y of [2.05,3.85])pipeBetween(industrial,[x+.18,y-.08,-6.08],[x+.18,y+.08,-6.08],r*1.3,iron);
}
// Long pipe racks and hanging cable bundles under the roof.
for(let i=0;i<12;i++){
 const x=-7.6+i*1.32;
 industrialTube([[x,6.15,-6.1],[x-.15,5.7,-4.9],[x+.12,5.65,-3.25],[x+.05,5.9,-1.1]],.065+(i%3)*.023,i%4===0?oxidised:conduit);
 if(i%2===0)industrialTube([[x,5.65,-3.3],[x+.3,5.1,-3.0],[x+.55,4.65,-3.35],[x+.6,4.95,-4.05]],.025,insulation);
}
for(const z of [-5.9,-3.8,-1.6,1.1,3.6]){
 box(industrial,17.4,.22,.2,iron,0,6.3,z);
 for(const x of [-7,-3.5,0,3.5,7])box(industrial,.16,.9,.16,iron,x,5.8,z);
}
// Perimeter grated service walkways, edge rails, and narrow access channels.
for(const side of [-1,1]){
 const x=side*7.65;
 box(industrial,1.55,.13,11.6,iron,x,.085,-.1,false);
 for(let z=-5.65;z<5.6;z+=.29)box(industrial,1.45,.018,.055,edgeMat,x,.17,z,false);
 for(let z=-5.5;z<=5.5;z+=1.8){
  pipeBetween(industrial,[side*6.8,.17,z],[side*6.8,1.1,z],.035,warning);
 }
 pipeBetween(industrial,[side*6.8,1.1,-5.5],[side*6.8,1.1,5.5],.035,warning);
}
// Wall-mounted service machinery and readable low-level silhouettes.
for(const x of [-6.5,-3.3,.1,3.25,6.5]){
 const g=new THREE.Group();g.position.set(x,0,-6.05);industrial.add(g);
 box(g,1.35,1.8,.62,iron,0,1.5,0);
 box(g,1.1,1.3,.09,fadedSage,0,1.55,.38);
 for(const dx of [-.42,.42]){
  pipeBetween(g,[dx,.55,.45],[dx,2.3,.45],.08,oxidised);
  const valve=new THREE.Mesh(new THREE.TorusGeometry(.19,.035,6,12),warning);
  valve.position.set(dx,1.05,.55);g.add(valve);
 }
 for(let k=0;k<5;k++)box(g,.12,.18,.05,insulation,-.43+k*.22,2.12,.46);
}
// Oil-stained access plates and exposed drainage slots across the deck.
for(let i=0;i<28;i++){
 const x=-6.9+(i*2.37)%13.8,z=-5.4+(i*3.19)%10.8;
 box(industrial,.78,.015,.5,i%4===0?oxidised:iron,x,.014,z,false);
 for(const dx of [-.32,.32])for(const dz of [-.19,.19])
  cylinder(industrial,.023,.023,.012,insulation,x+dx,.03,z+dz);
}
for(const z of [-4.3,-1.8,1.1,3.7]){
 box(industrial,11.5,.024,.3,insulation,0,.022,z,false);
 for(let x=-5.4;x<5.5;x+=.32)box(industrial,.035,.03,.26,iron,x,.044,z,false);
}
// Restrained, uneven practical lights; the room remains shadowy.
for(const x of [-6,0,6]){
 box(industrial,1.4,.11,.42,iron,x,5.75,-3.8);
 const lamp=box(industrial,1.13,.035,.28,screenMat,x,5.67,-3.8,false);
 lamp.material=new THREE.MeshStandardMaterial({color:0xb2ba91,emissive:0x758263,emissiveIntensity:1.3});
 const glow=new THREE.PointLight(0xb5b18a,4.2,7,2);glow.position.set(x,5.3,-3.7);industrial.add(glow);
}

// The lock-service manipulator: a loose, recognisable mechanical component on the deck.
const interactables=[];
const arm=new THREE.Group();arm.position.set(6,0,5);arm.scale.setScalar(1.35);
// A conspicuous recovery marker and a phosphor-lit component make the arm readable at a distance.
const armMarker=new THREE.Mesh(new THREE.TorusGeometry(.72,.045,8,40),new THREE.MeshBasicMaterial({color:0xe0a34b}));
armMarker.rotation.x=-Math.PI/2;armMarker.position.y=.035;arm.add(armMarker);
const armBeacon=new THREE.Mesh(new THREE.CylinderGeometry(.018,.11,1.35,10,1,true),new THREE.MeshBasicMaterial({color:0xe0a34b,transparent:true,opacity:.22,side:THREE.DoubleSide}));
armBeacon.position.set(0,.9,0);arm.add(armBeacon);
const armBeaconTop=new THREE.Mesh(new THREE.OctahedronGeometry(.16,0),new THREE.MeshStandardMaterial({color:0xffc36b,emissive:0x9b4e12,emissiveIntensity:1.8,roughness:.32,metalness:.12}));
armBeaconTop.position.set(0,1.65,0);arm.add(armBeaconTop);
cylinder(arm,.23,.23,.18,edgeMat,0,.16,0,Math.PI/2,0);
const armBase=box(arm,.42,.16,.38,greenMat,0,.25,0);armBase.rotation.z=-.2;
const armJoint=cylinder(arm,.12,.12,.18,rustMat,.22,.3,0,Math.PI/2,0);
const armRod=cylinder(arm,.075,.09,.72,edgeMat,.52,.31,0,0,0);armRod.rotation.z=-Math.PI/2.5;
const claw=new THREE.Group();claw.position.set(.83,.34,0);arm.add(claw);
for(const s of [-1,1]){const finger=cylinder(claw,.035,.045,.28,greenMat,s*.07,0,0,0,0);finger.rotation.z=s*.38}
const armGlow=new THREE.PointLight(0x8dff7a,1.3,1.8);armGlow.position.set(.45,.55,0);arm.add(armGlow);scene.add(arm);
arm.userData={name:'LOCK-SERVICE MANIPULATOR',x:6,z:5};interactables.push(arm);
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
const generator=new THREE.Group();generator.position.set(-7,0,-4);box(generator,1,.7,.8,edgeMat,0,.35,0);box(generator,.7,.9,.6,wallMat,0,1.1,0);box(generator,.48,.22,.05,screenMat,0,1.25,.33);scene.add(generator);generator.userData={name:'AUXILIARY POWER DISTRIBUTION',x:-7,z:-4};interactables.push(generator);
const hatch=new THREE.Group();hatch.position.set(11,0,-3);cylinder(hatch,1.15,1.15,.22,edgeMat,0,1.4,0,Math.PI/2,0);cylinder(hatch,.83,.83,.24,darkMat,0,1.4,.02,Math.PI/2,0);const hatchDoor=new THREE.Group();hatchDoor.position.set(-.72,1.4,.2);hatch.add(hatchDoor);box(hatchDoor,.18,1.2,.22,rustMat,.72,0,0);box(hatchDoor,.12,.2,.28,greenMat,.72,.35,.12);scene.add(hatch);hatch.userData={name:'MAINTENANCE EXIT',x:11,z:-3};interactables.push(hatch);
// Expanded maintenance chamber: functional repair bay and terminal alcove.
const deckSteel=mat(0x3c443e,.94,.14),deckRust=mat(0x625142,.95,.12),deckCream=mat(0x9b9477,.88,.09);
for(let z=-10;z<=10;z+=2){box(scene,27,.07,.16,deckSteel,0,.035,z);for(let x=-13;x<=13;x+=3.3)box(scene,.22,.045,1.8,deckRust,x,.052,z+.85)}
for(const x of [-13.5,13.5])for(let z=-9;z<=9;z+=3){box(scene,.35,7,.42,deckSteel,x,3.5,z);box(scene,.7,.16,.7,deckRust,x,6.7,z)}
for(const z of [-10.6,10.6])for(let x=-12;x<=12;x+=3){box(scene,.35,7,.4,deckSteel,x,3.5,z)}
// Scrap and tools surrounding MU-1's waking area.
const scrap=new THREE.Group();scrap.position.set(-10,0,7);scene.add(scrap);
box(scrap,3.6,.22,2.8,deckRust,0,.12,0);
for(let i=0;i<19;i++){const x=Math.sin(i*2.17)*1.5,z=Math.cos(i*3.71)*1.05;const piece=box(scrap,.22+(i%4)*.16,.12+(i%3)*.14,.35+(i%5)*.12,i%3?deckSteel:deckRust,x,.35+(i%4)*.13,z);piece.rotation.y=i*.72;piece.rotation.z=(i%3-1)*.18}
for(let i=0;i<5;i++){const t=cylinder(scrap,.055,.055,.7,deckCream,-1.2+i*.52,.5,-.7,0,Math.PI/2);t.rotation.y=i*.2}
for(let i=0;i<6;i++){const x=-12+i*4.5;box(scene,.23,7,.3,deckSteel,x,7.1,-8);box(scene,.45,.28,17,deckRust,x,7.3,0)}
for(let i=0;i<5;i++){const z=-8+i*4;box(scene,1.6,2.4,1.3,deckSteel,12.1,1.2,z);box(scene,1.2,.65,.09,deckRust,11.24,1.8,z)}
// Terminal is physically separated from the generator and exit.
const terminal=new THREE.Group();terminal.position.set(5,0,-7);scene.add(terminal);
box(terminal,1.8,1.2,1.05,deckRust,0,.6,0);box(terminal,1.5,1.65,.6,deckSteel,0,1.9,-.15);
const terminalDark=new THREE.MeshStandardMaterial({color:0x101b17,emissive:0x030907,emissiveIntensity:.2});
const terminalLit=new THREE.MeshStandardMaterial({color:0x3d8765,emissive:0x5ad69a,emissiveIntensity:1.4});
const terminalScreen=box(terminal,1.16,.77,.08,terminalDark,0,2.12,.21);
const terminalLamp=box(terminal,.18,.08,.07,terminalDark,.55,1.42,.2);
for(let i=0;i<5;i++)box(terminal,.18,.045,.09,deckCream,-.5+i*.25,1.34,.4);
terminal.userData={name:'CONTROL TERMINAL',x:5,z:-7};interactables.push(terminal);
// The existing hatch stays at the exit and is controlled exclusively by the terminal.
// SRV-09 silhouette-first reconstruction for 0.2.
// Proportions follow the supplied sprite/blueprint: broad, heavy upper chassis,
// compact reverse-jointed legs, and a total height close to 1.8x its width.
// Forward is +Z. This block is deliberately self-contained.
const robot=new THREE.Group();scene.add(robot);
const body=new THREE.Group();robot.add(body);
const sage=new THREE.MeshStandardMaterial({color:0x667865,roughness:.65,metalness:.15});
const sageLight=new THREE.MeshStandardMaterial({color:0x82917a,roughness:.72,metalness:.18});
const sageDark=new THREE.MeshStandardMaterial({color:0x414d43,roughness:.82,metalness:.25});
const gunmetal=new THREE.MeshStandardMaterial({color:0x242826,roughness:.4,metalness:.85});
const jointMetal=new THREE.MeshStandardMaterial({color:0x181a19,roughness:.25,metalness:.9});
const rawSteel=new THREE.MeshStandardMaterial({color:0x777c70,roughness:.48,metalness:.82});
const rubber=new THREE.MeshStandardMaterial({color:0x0f1010,roughness:.9,metalness:0});
const rust=new THREE.MeshStandardMaterial({color:0x70412b,roughness:.94,metalness:.18});
const brass=new THREE.MeshStandardMaterial({color:0x987344,roughness:.42,metalness:.78});
const stencil=new THREE.MeshStandardMaterial({color:0xd0cbb2,roughness:.85,metalness:.08});
const opticGlass=new THREE.MeshStandardMaterial({color:0xff3518,emissive:0x9b170b,emissiveIntensity:1.6,roughness:.1,metalness:0});
const blackGlass=new THREE.MeshStandardMaterial({color:0x101c19,emissive:0x183c30,emissiveIntensity:.4,roughness:.18,metalness:.25});
const bodyBox=(parent,w,h,d,m,x,y,z)=>box(parent,w,h,d,m,x,y,z);
function cylX(parent,r,h,m,x,y,z){return cylinder(parent,r,r,h,m,x,y,z,0,Math.PI/2)}
function rodBetween(parent,a,b,r,material,r2=r){
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r2,delta.length(),10),material);
  mesh.position.copy(av.clone().add(bv).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function beam(parent,a,b,w,d,material){
  const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av);
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,delta.length(),d),material);
  mesh.position.copy(av.clone().add(bv).multiplyScalar(.5));
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function tube(parent,points,r,material,segments=24){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,r,7,false),material);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function label(parent,text,x,y,z,rotationY=0,size=.12,color=0xd0cbb2){
  const c=document.createElement('canvas');c.width=256;c.height=128;
  const ctx=c.getContext('2d');ctx.clearRect(0,0,256,128);
  ctx.fillStyle='#'+color.toString(16).padStart(6,'0');ctx.font='bold 76px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,128,65);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(size*2,size),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
  mesh.position.set(x,y,z);mesh.rotation.y=rotationY;parent.add(mesh);return mesh;
}
function hazardMark(parent,x,y,z,rotationY=0){
  const s=new THREE.Shape();s.moveTo(0,.09);s.lineTo(.09,-.075);s.lineTo(-.09,-.075);s.closePath();
  const m=new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshBasicMaterial({color:0x171b17,side:THREE.DoubleSide}));
  m.position.set(x,y,z);m.rotation.y=rotationY;parent.add(m);
}
// Maintenance Unit 0.2: custom Three.js geometry rebuilt from the reference views.
function wedge(parent,name,rings,material){
 const v=[],indices=[];
 for(const [z,w,lo,hi,shift] of rings)v.push(shift-w,lo,z,shift+w,lo,z,shift+w,hi,z,shift-w,hi,z);
 indices.push(0,3,2,0,2,1);
 for(let i=0;i<rings.length-1;i++)for(let j=0;j<4;j++){
 const x=i*4+j,y=i*4+(j+1)%4;indices.push(x,y,y+4,x,y+4,x+4);
 }
 const n=(rings.length-1)*4;indices.push(n,n+1,n+2,n,n+2,n+3);
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(indices);geo.computeVertexNormals();
 const obj=new THREE.Mesh(geo,material);obj.name=name;obj.castShadow=true;obj.receiveShadow=true;parent.add(obj);return obj;
}
// Sculpted low, elongated body: the front is +Z, rear service boom is -Z.
const shell=new THREE.Group();shell.position.set(0,2.48,0);body.add(shell);
// Main load-bearing chassis is narrow in height and extended along the travel axis.
wedge(shell,'Main low-profile cast wedge',[
 [-1.02,.49,-.23,.26,-.06],[-.77,.58,-.27,.35,-.04],
 [-.25,.63,-.29,.39,-.02],[.18,.62,-.28,.33,.02],
 [.60,.55,-.27,.23,.07],[1.03,.45,-.24,.16,.10],
 [1.18,.34,-.17,.10,.10]
],sage);
// Raised rear engine fairing and long, offset left rear service boom.
wedge(shell,'Raised rear upper fairing',[
 [-1.08,.40,.10,.33,-.09],[-.84,.48,.12,.47,-.08],
 [-.38,.49,.15,.48,-.07],[-.11,.38,.13,.40,-.06]
],sageLight);
wedge(shell,'Offset left rear service boom',[
 [-1.42,.18,.15,.34,-.48],[-1.24,.19,.15,.36,-.49],
 [-.77,.18,.17,.37,-.48],[-.58,.15,.16,.32,-.48]
],sageLight);
// Projecting front-right armour has a faceted side, rather than a second box.
wedge(shell,'Angular front optic cheek',[
 [-.32,.25,-.23,.30,.42],[.22,.28,-.26,.30,.43],
 [.70,.25,-.25,.22,.43],[1.11,.18,-.18,.12,.39],
 [1.24,.12,-.10,.055,.36]
],sageLight);
// Opposite cheek is shorter, leaving an intentionally asymmetric silhouette.
wedge(shell,'Short left front cheek',[
 [-.29,.14,-.21,.30,-.48],[.22,.17,-.23,.27,-.48],
 [.69,.13,-.21,.19,-.43],[1.02,.09,-.12,.10,-.39]
],sage);
// Dark inset top access panel and thin raised surrounding lip.
const chassisHatch=bodyBox(shell,.69,.018,.74,gunmetal,.03,.401,.16);
chassisHatch.rotation.x=-.10;
const hatchInset=bodyBox(shell,.61,.019,.64,sageDark,.03,.420,.16);
hatchInset.rotation.x=-.10;
// Rear mechanical vent and raised service identification panel.
bodyBox(shell,.60,.15,.21,sageLight,-.48,.30,-1.30);
bodyBox(shell,.35,.035,.15,gunmetal,.15,.485,-.68);
for(const side of [-1,1]){
 for(const z of [-.56,.02,.56,.94]){
  cylX(shell,.017,.018,rawSteel,side*(z>.70?.51:.63),.13,z);
 }
}
label(shell,'ば',-.52,.38,-1.414,0,.15);
label(shell,'の',-.03,-.05,1.195,0,.085,0xb6b49e);
// Front-right primary optic: deeply recessed into a thick metal collar.
const optic=new THREE.Group();optic.position.set(.67,-.065,.94);optic.rotation.y=Math.PI/2;shell.add(optic);
const opticCup=new THREE.Mesh(new THREE.CylinderGeometry(.19,.22,.16,20),jointMetal);opticCup.rotation.x=Math.PI/2;optic.add(opticCup);
const opticRim=new THREE.Mesh(new THREE.TorusGeometry(.148,.035,10,32),rawSteel);opticRim.position.z=.09;optic.add(opticRim);
const lens=new THREE.Mesh(new THREE.SphereGeometry(.105,20,16),opticGlass);lens.position.z=.105;optic.add(lens);
const lensCore=new THREE.Mesh(new THREE.SphereGeometry(.035,12,10),new THREE.MeshBasicMaterial({color:0xffa16b}));lensCore.position.set(-.025,.022,.18);optic.add(lensCore);
const opticLight=new THREE.PointLight(0xff3217,.45,1.3);opticLight.position.set(.64,2.40,1.04);body.add(opticLight);
// Rear-right secondary sensor pod, visibly distinct from the main chassis.
const sensor=new THREE.Group();sensor.position.set(.39,2.99,-.66);body.add(sensor);
bodyBox(sensor,.32,.25,.36,gunmetal,0,0,0);
bodyBox(sensor,.27,.12,.27,sageDark,0,.16,-.015);
const sensorLens=new THREE.Mesh(new THREE.SphereGeometry(.065,14,12),blackGlass);sensorLens.position.set(0,-.015,.205);sensor.add(sensorLens);
cylX(sensor,.09,.36,rawSteel,0,-.03,-.02);
// Flush service access panel behind the sensor.
const service=new THREE.Group();service.position.set(-.31,2.94,-.48);body.add(service);
bodyBox(service,.36,.035,.30,gunmetal,0,0,0);
bodyBox(service,.30,.025,.24,sageLight,0,.024,0);
for(const x of [-.13,.13])cylX(service,.018,.04,rawSteel,x,.045,-.10);
// Heavy pelvis tucked directly beneath the chassis.
bodyBox(body,.88,.29,.66,gunmetal,0,1.96,-.035);
bodyBox(body,.62,.19,.54,jointMetal,0,1.77,-.02);
bodyBox(body,.42,.12,.42,rawSteel,0,1.67,-.02);
// Symmetrical hip drums and outboard service housings.
for(const side of [-1,1]){
  cylX(body,.29,.24,jointMetal,side*.51,1.91,0);
  cylX(body,.225,.28,gunmetal,side*.53,1.91,0);
  cylX(body,.125,.30,rawSteel,side*.55,1.91,0);
  cylX(body,.067,.32,jointMetal,side*.57,1.91,0);
  bodyBox(body,.23,.22,.29,sageDark,side*.69,1.80,-.025);
  bodyBox(body,.19,.16,.035,rawSteel,side*.69,1.80,.13);
  hazardMark(body,side*.69,1.80,.151);
}
// Three thick ribbed conduits descend from the belly to the hip assembly.
for(let i=-1;i<=1;i++){
  const x=i*.14;
  tube(body,[[x,2.22,.27],[x*1.15,2.10,.34],[x*1.35,1.98,.30],[x*1.6,1.83,.16]],.045,rubber,24);
  for(let j=0;j<7;j++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.047,.012,6,12),gunmetal);
    ring.position.set(x,2.13-j*.042,.32-j*.018);ring.rotation.x=Math.PI/2;body.add(ring);
  }
}
// Brass hydraulic feed lines run down the outer rear of the pelvis.
for(const side of [-1,1]){
  tube(body,[[side*.31,2.18,-.43],[side*.42,2.04,-.53],[side*.54,1.90,-.47],[side*.61,1.78,-.34]],.022,brass,20);
}
// Folded two-stage belly manipulator with a small two-prong claw.
const manipulator=new THREE.Group();manipulator.position.set(-.05,1.70,-.42);body.add(manipulator);
bodyBox(manipulator,.20,.13,.34,gunmetal,0,0,-.08);
bodyBox(manipulator,.13,.11,.27,rawSteel,0,-.02,-.31);
rodBetween(manipulator,[0,-.02,-.40],[0,-.02,-.60],.045,gunmetal);
for(const side of [-1,1])rodBetween(manipulator,[0,-.02,-.60],[side*.085,-.045,-.76],.019,rawSteel);
// Compact reverse-jointed legs. The thigh sweeps backwards; the shin returns forwards.
const legs=[];
for(const side of [-1,1]){
  const hip=new THREE.Group();hip.position.set(side*.53,1.88,0);robot.add(hip);
  cylX(hip,.23,.22,jointMetal,0,0,0);
  cylX(hip,.17,.25,gunmetal,side*.015,0,0);
  cylX(hip,.085,.28,rawSteel,side*.025,0,0);
  // Thigh: a substantial armoured upper segment, angled out and rearward.
  const thighA=[0,-.10,0],thighB=[side*.28,-.77,-.39];
  beam(hip,thighA,thighB,.27,.34,sageDark);
  beam(hip,[side*.015,-.15,.12],[side*.13,-.61,-.045],.20,.075,sage);
  beam(hip,[side*.02,-.17,-.14],[side*.14,-.61,-.30],.055,.06,rawSteel);
  // Reverse knee projects behind the leg, with paired clevis plates and pin.
  const knee=new THREE.Group();knee.position.set(...thighB);hip.add(knee);
  const kneeCore=new THREE.Mesh(new THREE.SphereGeometry(.145,16,12),jointMetal);knee.add(kneeCore);
  cylX(knee,.12,.29,rawSteel,0,0,0);
  for(const s of [-1,1]){
    const cheek=bodyBox(knee,.055,.25,.23,gunmetal,s*.13,0,-.015);
    cheek.rotation.z=-.12;
    const pin=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.045,12),rawSteel);
    pin.rotation.z=Math.PI/2;pin.position.set(s*.17,0,0);knee.add(pin);
  }
  // Shin angles forward below the backward knee.
  const shinA=[0,-.04,0],shinB=[-side*.18,-.88,.58];
  beam(knee,shinA,shinB,.13,.16,gunmetal);
  // Removable green shin armour sleeve on the forward face.
  const sleeve=beam(knee,[side*.015,-.12,.075],[-side*.035,-.62,.38],.23,.20,sage);
  beam(knee,[side*.015,-.12,.18],[-side*.035,-.60,.47],.17,.045,sageLight);
  label(knee,'09',-side*.035,-.40,.495,0,.045,0xc9c8ac);
  // Large visible piston spans the front of the reverse knee.
  rodBetween(knee,[-side*.11,-.12,.14],[-side*.07,-.59,.43],.035,rawSteel,.045);
  rodBetween(knee,[-side*.11,-.12,.14],[-side*.10,-.43,.29],.052,jointMetal,.052);
  tube(knee,[[-side*.04,-.16,-.08],[-side*.08,-.34,-.10],[-side*.06,-.53,.02],[-side*.03,-.66,.26]],.014,rubber,18);
  for(let j=0;j<3;j++){
    const clip=bodyBox(knee,.045,.045,.045,brass,-side*.02,-.25-j*.14,.12+j*.055);
  }
  // Two-axis ankle, broad low foot plate, two forward toes and rear heel spur.
  const ankle=new THREE.Group();ankle.position.set(...shinB);knee.add(ankle);
  cylX(ankle,.105,.20,jointMetal,0,-.015,0);
  bodyBox(ankle,.34,.10,.34,gunmetal,0,-.12,.08);
  bodyBox(ankle,.29,.035,.28,rawSteel,0,-.06,.09);
  for(const s of [-1,1]){
    const toe=bodyBox(ankle,.105,.075,.37,rawSteel,s*.105,-.17,.32);
    toe.rotation.x=-.12;
    const toeCap=bodyBox(ankle,.11,.07,.13,sageDark,s*.105,-.205,.55);
    toeCap.rotation.x=-.20;
  }
  bodyBox(ankle,.22,.08,.23,sageDark,0,-.16,-.17);
  rodBetween(ankle,[-.10,-.02,-.02],[-.10,-.15,.18],.022,brass);
  legs.push({hip,knee,side,ankle,thighB,shinB,plant:null,lastSwing:true});
}
// Scattered paint loss is concentrated on exposed edges, not evenly tiled.
for(let i=0;i<15;i++){
  const x=-.76+((i*17)%150)/100,z=-.47+((i*29)%90)/100;
  const chip=bodyBox(shell,.025+(i%3)*.012,.014,.035+(i%2)*.02,i%4===0?rust:rawSteel,x,.20+(i%4)*.045,z);
  chip.rotation.y=(i%5)*.17;
}
for(const side of [-1,1])for(let i=0;i<3;i++){
  const rivet=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),rawSteel);
  rivet.position.set(side*.84,-.20,-.34+i*.28);shell.add(rivet);
}
robot.position.set(-9,0,6);robot.rotation.y=Math.PI*.18;
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.92,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.56}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;robot.add(shadow);

let charge=60,hasArm=false,armEquipped=false,caseOpen=false,hasCell=false,usedCell=false,powerOn=false,ended=false,paused=false,doorOpening=false,doorOpen=false,target=null,selected=null,walkTime=0;
const keys={w:false,a:false,s:false,d:false};
const logMessages=[];const task=document.querySelector('#task'),toast=document.querySelector('#toast'),inventory=document.querySelector('#inventory');
const terminalPanel=document.createElement('section');terminalPanel.id='station-terminal';terminalPanel.style.cssText='display:none;position:fixed;z-index:80;inset:12% 18%;background:#0b1511f5;border:2px solid #718b6c;box-shadow:0 0 0 100vmax #0009;padding:30px;color:#bce5b6;font:15px/1.8 monospace;white-space:pre-line;overflow:auto';
terminalPanel.innerHTML='<div style="font-size:12px;letter-spacing:.2em;color:#879d83">SATURN STATION // LOCAL CONTROL INTERFACE</div><pre id="terminal-output" style="white-space:pre-wrap;font:inherit;margin:25px 0">SYSTEM READY\n\nPRESS ENTER TO BOOT TERMINAL</pre><div style="font-size:12px;color:#859b85">ENTER BOOT · 1 OPEN DOOR · 2 CLOSE DOOR · 3 POWER OFF · ESC EXIT</div>';document.body.append(terminalPanel);
let terminalBooted=false,terminalOpen=false;
const terminalOutput=terminalPanel.querySelector('#terminal-output');
function showTerminal(){terminalOpen=true;terminalPanel.style.display='block';terminalOutput.textContent=terminalBooted?'LOCAL CONTROL // READY\n1  OPEN DOOR\n2  CLOSE DOOR\n3  TURN OFF POWER':'SYSTEM READY\n\nPRESS ENTER TO BOOT TERMINAL';Object.keys(keys).forEach(k=>keys[k]=false)}
function hideTerminal(){terminalOpen=false;terminalPanel.style.display='none'}
function terminalKey(k){if(k==='escape'){hideTerminal();return}if(k==='enter'){terminalBooted=true;terminalOutput.textContent='BOOT COMPLETE\nLOCAL CONTROL // READY\n\n1  OPEN DOOR\n2  CLOSE DOOR\n3  TURN OFF POWER';return}if(!terminalBooted){terminalOutput.textContent='PRESS ENTER TO BOOT TERMINAL';return}if(k==='1'){if(!powerOn){terminalOutput.textContent='ERROR: GENERATOR OFFLINE';return}doorOpening=true;hatch.userData.openStarted=performance.now();terminalOutput.textContent='COMMAND 01: OPEN DOOR\nACTUATOR ENGAGED';task.textContent='Door opening. Explore the exit.'}else if(k==='2'){doorOpening=false;doorOpen=false;hatchDoor.rotation.z=0;terminalOutput.textContent='COMMAND 02: CLOSE DOOR\nDOOR SEALED'}else if(k==='3'){powerOn=false;phosphor.intensity=13;terminalScreen.material=terminalDark;terminalLamp.material=terminalDark;terminalBooted=false;hideTerminal();task.textContent='Restore generator power to use the terminal.';notify('GENERATOR POWER OFF')}}

function say(s){logMessages.push(s);if(logMessages.length>8)logMessages.shift()}
let toastTimer;function notify(s){toast.textContent=s;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
function updateCharge(){document.querySelector('#charge').textContent=String(Math.ceil(charge)).padStart(2,'0')+'%';document.querySelector('#charge-bar').style.width=Math.max(0,charge)+'%'}
function updateInventory(){document.querySelector('#item-count').textContent=hasArm?'01':'00';document.querySelector('#cell-hot').textContent=hasCell?'READY':usedCell?'USED':'EMPTY';document.querySelector('#cell-hot').classList.toggle('filled',hasCell||usedCell);document.querySelector('#arm-slot').textContent=armEquipped?'LOCK-SERVICE ARM':'EMPTY';document.querySelector('#arm-slot').nextElementSibling.textContent=armEquipped?'COMPONENT INSTALLED':'DRAG COMPONENT HERE';
const list=document.querySelector('#inventory-items');list.innerHTML='';if(!hasArm){list.innerHTML='<p class="empty-inventory">No components recovered.</p>'}else{const item=document.createElement('div');item.className='inventory-item';item.draggable=true;item.innerHTML='<strong>LOCK-SERVICE MANIPULATOR</strong><small>ARTICULATED TOOL ARM · MECHANICAL LOCK RELEASE</small>';item.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain','lock-arm');e.dataTransfer.effectAllowed='move'});list.appendChild(item)}}
function openInventory(){inventory.classList.add('open');inventory.setAttribute('aria-hidden','false');updateInventory();target=null}
function closeInventory(){inventory.classList.remove('open');inventory.setAttribute('aria-hidden','true')}
const armSlot=document.querySelector('[data-slot="arm"]');armSlot.addEventListener('dragover',e=>{e.preventDefault();armSlot.classList.add('drag-over')});armSlot.addEventListener('dragleave',()=>armSlot.classList.remove('drag-over'));armSlot.addEventListener('drop',e=>{e.preventDefault();armSlot.classList.remove('drag-over');if(e.dataTransfer.getData('text/plain')==='lock-arm'&&hasArm){armEquipped=true;updateInventory();say('LOCK-SERVICE ARM INSTALLED.');notify('COMPONENT INSTALLED');task.textContent='Activate the generator switch.'}});
document.querySelector('#close-inventory').addEventListener('click',closeInventory);
document.querySelector('#fullscreen').addEventListener('click',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()});
function removeObject(o){if(selected===o)selected=null;scene.remove(o);const i=interactables.indexOf(o);if(i>=0)interactables.splice(i,1)}
function nearest(){let best=null,d=Infinity;for(const o of interactables){const n=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(n<d){d=n;best=o}}return d<1.8?best:null}
function interact(){if(ended||inventory.classList.contains('open'))return;const o=(selected&&interactables.includes(selected)&&Math.hypot(robot.position.x-selected.userData.x,robot.position.z-selected.userData.z)<1.8?selected:null)||nearest();if(!o){notify('NO SERVICE OBJECT IN REACH');return}const dist=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(dist>1.8){target=new THREE.Vector3(o.userData.x,0,o.userData.z);notify('MOVING TO '+o.userData.name);return}
const id=o.userData.name;
if(id==='LOCK-SERVICE MANIPULATOR'){if(hasArm)return;hasArm=true;removeObject(o);updateInventory();say('LOOSE MANIPULATOR RECOVERED.');task.textContent='Inspect the recovered component in your inventory.';notify('COMPONENT RECOVERED');setTimeout(()=>notify('NEW COMPONENT STORED  ·  I TO INSPECT'),850)}
else if(id==='SEALED SERVICE CASE'){if(!armEquipped){notify('MECHANICAL RELEASE REQUIRED');say('CASE LOCK CANNOT BE OPERATED WITHOUT A MANIPULATOR.');return}if(!caseOpen){caseOpen=true;lidPivot.rotation.x=-1.35;cell.visible=true;say('SERVICE CASE RELEASED.');task.textContent='Recover the portable power cell from the open case.';notify('LOCK RELEASED')}else if(!hasCell){hasCell=true;cell.visible=false;say('PORTABLE POWER CELL RECOVERED.');task.textContent='Use the power cell to restore internal charge.';updateInventory();notify('POWER CELL ACQUIRED')}}
else if(id==='AUXILIARY POWER DISTRIBUTION'){if(!armEquipped){notify('MANIPULATOR REQUIRED TO THROW SWITCH');return}powerOn=true;phosphor.intensity=24;terminalScreen.material=terminalLit;terminalLamp.material=terminalLit;say('GENERATOR SWITCH ENGAGED. TERMINAL POWER AVAILABLE.');task.textContent='Access the powered terminal.';notify('GENERATOR ONLINE')}
else if(id==='CONTROL TERMINAL'){if(!powerOn){notify('TERMINAL OFFLINE');return}showTerminal()}else if(id==='MAINTENANCE EXIT'){notify(doorOpen?'EXIT OPEN · TERMINAL CONTROLS DOOR':'DOOR SEALED · USE TERMINAL')}
}
// Nearby item readout and small projected E key above interactable objects.
const nearbyPanel=document.querySelector('#nearby-panel');
const nearbyList=document.querySelector('#nearby-list');
const interactionMarker=document.querySelector('#interaction-marker');
const markerWorld=new THREE.Vector3();
function updateNearbyUI(){
 const hidden=paused||ended||terminalOpen||inventory.classList.contains('open')||devConsole.classList.contains('open');
 if(hidden){nearbyPanel.classList.remove('visible');interactionMarker.classList.remove('visible');return}
 const close=interactables.map(o=>({o,d:Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z)}))
   .filter(x=>x.d<3.3).sort((a,b)=>a.d-b.d);
 nearbyPanel.classList.toggle('visible',close.length>0);
 nearbyList.replaceChildren();
 for(const {o,d} of close.slice(0,3)){
   const row=document.createElement('div');
   row.className='nearby-row'+(d<=1.8?' reachable':'');
   const name=document.createElement('span');name.textContent=o.userData.name;
   const state=document.createElement('small');state.textContent=d<=1.8?'IN RANGE':'NEARBY';
   row.append(name,state);nearbyList.appendChild(row);
 }
 const active=close.find(x=>x.d<=1.8);
 if(!active){interactionMarker.classList.remove('visible');return}
 const o=active.o;
 markerWorld.set(o.userData.x,1.65,o.userData.z).project(camera);
 if(markerWorld.z< -1||markerWorld.z>1){interactionMarker.classList.remove('visible');return}
 const rect=renderer.domElement.getBoundingClientRect();
 const x=(markerWorld.x*.5+.5)*rect.width;
 const y=(-markerWorld.y*.5+.5)*rect.height;
 interactionMarker.style.left=x+'px';
 interactionMarker.style.top=y+'px';
 interactionMarker.classList.add('visible');
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
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(terminalOpen){e.preventDefault();terminalKey(k);return}if(devConsole.classList.contains('open')){if(k==='f2'){devConsole.classList.remove('open');devConsole.setAttribute('aria-hidden','true');renderer.domElement.focus()}return}
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
// Smaller, lower stance: the Maintenance Unit should feel compact and grounded.
robot.scale.setScalar(.84);
let gaitVelocity=0;
let gaitWeight=0;
// Inventory preview: cloned idle model, independent of walking animation.
const previewHost=document.querySelector('#unit-preview');
const previewScene=new THREE.Scene();
const previewCamera=new THREE.PerspectiveCamera(35,1,.1,40);
previewCamera.position.set(5.6,3.9,6.6);
previewCamera.lookAt(0,1.35,0);
previewScene.add(new THREE.HemisphereLight(0xb9c8b4,0x293129,2.2));
const previewLight=new THREE.DirectionalLight(0xf1e7c9,2.6);
previewLight.position.set(-3,7,5);previewScene.add(previewLight);
const previewRobot=robot.clone(true);
previewRobot.position.set(0,0,0);previewRobot.rotation.set(0,-.3,0);
previewScene.add(previewRobot);
const previewRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
previewRenderer.setPixelRatio(Math.min(devicePixelRatio,2));
previewRenderer.outputColorSpace=THREE.SRGBColorSpace;
previewRenderer.toneMapping=THREE.ACESFilmicToneMapping;
previewRenderer.toneMappingExposure=1.2;
previewHost.appendChild(previewRenderer.domElement);
function renderInventoryPreview(){
 const w=previewHost.clientWidth,h=previewHost.clientHeight;
 if(!w||!h)return;
 previewRenderer.setSize(w,h,false);
 previewCamera.aspect=w/h;previewCamera.updateProjectionMatrix();
 previewRenderer.render(previewScene,previewCamera);
}
// Stable two-link mechanical gait. The target is defined in robot-local space,
// preventing world-space planting jumps when turning or crossing a phase boundary.
const gaitTarget=new THREE.Vector3();
function solveLegIK(l,target,dt){
 const upper=Math.hypot(l.thighB[1],l.thighB[2]);
 const lower=Math.hypot(l.shinB[1],l.shinB[2]);
 const dy=target.y-l.hip.position.y;
 const dz=target.z-l.hip.position.z;
 const actual=Math.hypot(dy,dz);
 const reach=THREE.MathUtils.clamp(actual,.18,upper+lower-.035);
 const uy=dy/Math.max(.0001,actual),uz=dz/Math.max(.0001,actual);
 const along=(upper*upper-lower*lower+reach*reach)/(2*reach);
 const perpendicular=Math.sqrt(Math.max(0,upper*upper-along*along));
 // Positive perpendicular here places the knee towards -Z (behind the body).
 const ky=along*uy-perpendicular*uz;
 const kz=along*uz+perpendicular*uy;
 const shinY=reach*uy-ky,shinZ=reach*uz-kz;
 const restUpper=Math.atan2(l.thighB[2],l.thighB[1]);
 const restLower=Math.atan2(l.shinB[2],l.shinB[1]);
 const upperAngle=Math.atan2(kz,ky)-restUpper;
 const lowerAngle=Math.atan2(shinZ,shinY)-restLower-upperAngle;
 const lerpAngle=(current,destination,t)=>current+Math.atan2(Math.sin(destination-current),Math.cos(destination-current))*t;
 const t=Math.min(1,dt*14);
 l.hip.rotation.x=lerpAngle(l.hip.rotation.x,upperAngle,t);
 l.knee.rotation.x=lerpAngle(l.knee.rotation.x,lowerAngle,t);
 l.ankle.rotation.x=lerpAngle(l.ankle.rotation.x,-l.hip.rotation.x-l.knee.rotation.x,t);
 l.hip.rotation.z=THREE.MathUtils.lerp(l.hip.rotation.z,0,t);
 l.knee.rotation.z=THREE.MathUtils.lerp(l.knee.rotation.z,0,t);
}
// AT-ST-inspired alternating mechanical gait: long support, short recovery.
// Feet sweep backwards under load and lift only during the forward swing.
const gaitLocalTarget=new THREE.Vector3();
function animateGait(dt,moving){
 const blend=THREE.MathUtils.clamp(gaitWeight,0,1);
 for(const l of legs){
   const cycle=((walkTime/(Math.PI*2)+(l.side===1?.5:0))%1+1)%1;
   const stance=.62;
   let forward, lift=0;
   if(cycle<stance){
     const t=cycle/stance;
     // A long, controlled planted-looking ground stroke.
     forward=.24*(1-2*t);
   }else{
     const t=(cycle-stance)/(1-stance);
     const eased=t*t*(3-2*t);
     forward=-.24+.48*eased;
     lift=.105*Math.sin(Math.PI*t);
   }
   gaitLocalTarget.set(
     l.hip.position.x+l.thighB[0]+l.shinB[0],
     .155+lift*blend,
     .09+forward*blend
   );
   solveLegIK(l,gaitLocalTarget,dt);
 }
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);controls.enabled=!inventory.classList.contains('open')&&!paused&&!devConsole.classList.contains('open');controls.update();if(inventory.classList.contains('open'))renderInventoryPreview();if(!paused&&!ended&&!terminalOpen&&!inventory.classList.contains('open')&&!devConsole.classList.contains('open')){const mx=(keys.d?1:0)-(keys.a?1:0),mz=(keys.s?1:0)-(keys.w?1:0),len=Math.hypot(mx,mz);const wantsMove=len>0;
const targetSpeed=wantsMove?.75:0;
// Inertial acceleration and braking make the chassis feel mechanically heavy.
gaitVelocity=THREE.MathUtils.damp(gaitVelocity,targetSpeed,wantsMove?3.3:5.2,dt);
gaitWeight=THREE.MathUtils.damp(gaitWeight,wantsMove?1:0,wantsMove?3.0:5.0,dt);
if(wantsMove){
 robot.position.x=THREE.MathUtils.clamp(robot.position.x+mx/len*gaitVelocity*dt,-12.5,12.5);
 robot.position.z=THREE.MathUtils.clamp(robot.position.z+mz/len*gaitVelocity*dt,-9.5,9.5);
 const desiredHeading=Math.atan2(mx,mz);
 robot.rotation.y+=Math.atan2(Math.sin(desiredHeading-robot.rotation.y),Math.cos(desiredHeading-robot.rotation.y))*Math.min(1,dt*6);
}
walkTime+=dt*4.8*(gaitVelocity/.75);
animateGait(dt,gaitWeight>.06);
const transfer=Math.sin(walkTime);
const load=Math.abs(transfer);
// A slight dip at each footfall and sideways roll onto the supporting leg.
const chassisY=gaitWeight*(-.025+.013*load);
const chassisRoll=gaitWeight*.018*transfer;
const chassisPitch=gaitWeight*.012;
body.position.y=THREE.MathUtils.damp(body.position.y,chassisY,8,dt);
body.rotation.z=THREE.MathUtils.damp(body.rotation.z,chassisRoll,7,dt);
body.rotation.x=THREE.MathUtils.damp(body.rotation.x,chassisPitch,7,dt);
}
if(!paused&&!ended&&!godMode&&charge>0){charge=Math.max(0,charge-dt*.1);updateCharge();if(charge===0){notify('POWER DEPLETED');triggerDeath()}}
if(doorOpening&&!doorOpen){const t=Math.min(1,(performance.now()-hatch.userData.openStarted)/1150);hatchDoor.rotation.z=-1.65*t;if(t>=1){doorOpening=false;doorOpen=true;task.textContent='Exit door open. Terminal remains available.';notify('DOOR OPEN')}}
renderer.render(scene,camera);updateNearbyUI()}
animate();document.querySelector('#loading').classList.add('hidden');document.querySelector('#charge').textContent='60%';document.querySelector('#charge-bar').style.width='60%';updateCharge();updateInventory();task.textContent='Recover the missing manipulator from the repair bay.';say('MU-1 ONLINE. MANIPULATOR MISSING. LOCATE SERVICE ARM.');
