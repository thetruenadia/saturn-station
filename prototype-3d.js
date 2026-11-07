import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

const viewport=document.querySelector('#viewport');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x242923);
scene.fog=new THREE.FogExp2(0x242923,.012);
const camera=new THREE.OrthographicCamera(-11,11,8,-8,.1,100);
camera.position.set(12,15,12);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
viewport.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;
controls.minPolarAngle=.55;controls.maxPolarAngle=1.25;controls.minZoom=.65;controls.maxZoom=5.5;
camera.zoom=1.8;camera.updateProjectionMatrix();
scene.add(new THREE.HemisphereLight(0xc9c4aa,0x453c30,2.15));
const keyLight=new THREE.DirectionalLight(0xf1d9b1,2.5);keyLight.position.set(-5,12,7);keyLight.castShadow=true;keyLight.shadow.mapSize.set(2048,2048);keyLight.shadow.camera.left=-12;keyLight.shadow.camera.right=12;keyLight.shadow.camera.top=12;keyLight.shadow.camera.bottom=-12;scene.add(keyLight);
const emergency=new THREE.PointLight(0xc87937,19,15,2);emergency.position.set(4,4,-3);scene.add(emergency);
const phosphor=new THREE.PointLight(0xd4b56d,12,11,2);phosphor.position.set(-4,2,2);scene.add(phosphor);
const mat=(c,r=.8,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const floorMat=mat(0x555346,.96,.25),wallMat=mat(0x171f1d,.9,.3),edgeMat=mat(0x4a4a38,.8,.35),rustMat=mat(0x70412a,.95,.1),darkMat=mat(0x080e0d,.7,.3),greenMat=mat(0x68765b,.72,.35),screenMat=new THREE.MeshStandardMaterial({color:0x72ff92,emissive:0x35d85c,emissiveIntensity:2});
function box(parent,w,h,d,material,x,y,z,cast=true){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function cylinder(parent,r1,r2,h,material,x,y,z,rx=0,rz=0){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),material);o.position.set(x,y,z);o.rotation.x=rx;o.rotation.z=rz;o.castShadow=true;parent.add(o);return o}
function wornPaint(hex,seed){
 const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');
 ctx.fillStyle='#'+new THREE.Color(hex).getHexString();ctx.fillRect(0,0,256,256);
 let n=seed;const rnd=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296};
 for(let i=0;i<4400;i++){ctx.fillStyle=rnd()>.5?'#f0e5be10':'#191b1820';ctx.fillRect(rnd()*256,rnd()*256,2+rnd()*18,.5+rnd()*2)}
 for(let i=0;i<130;i++){const x=rnd()*256,y=rnd()*256;ctx.strokeStyle=rnd()>.5?'#272c2780':'#a9774b70';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+rnd()*12,y-rnd()*5);ctx.stroke()}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 return new THREE.MeshStandardMaterial({map:tex,roughness:.92,metalness:.16});
}
const wornOliveMat=wornPaint(0x707661,11),wornSandMat=wornPaint(0xa3987b,22),wornRustMat=wornPaint(0x655347,33),wornSteelMat=wornPaint(0x505a53,44);
const floor=box(scene,28,.35,22,floorMat,0,-.2,0,false);
// No prototype grid: a practical metal maintenance deck replaces it.
// Dollhouse cutaway: north and west are solid; south/east walls are open to the camera.
// The north bulkhead has a genuine opening at the exit.
box(scene,23.7,8,.55,wallMat,-2.15,3.8,-11,false);
box(scene,.4,8,.55,wallMat,13.8,3.8,-11,false);
box(scene,4.1,4.4,.65,wallMat,11.8,5.8,-11,false);
box(scene,.55,8,22,wallMat,-14,3.8,0,false);
for(let x=-12;x<=12;x+=4)box(scene,.38,.85,.38,wallMat,x,.45,10.9,false);
for(let z=-9;z<=9;z+=4)box(scene,.38,.85,.38,wallMat,13.9,.45,z,false);
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
const industrial=new THREE.Group();industrial.position.set(0,0,-3.3);scene.add(industrial);
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
// Ribbed field-service chest with hinged heavy lid and separate removable power pack.
const caseGroup=new THREE.Group();caseGroup.position.set(-5,0,2);
const caseBody=mat(0x6e715d,.88,.23),caseMetal=mat(0x292d28,.67,.55),caseAccent=mat(0xb48a45,.9,.12);
box(caseGroup,1.65,.65,1.24,caseBody,0,.36,0);
for(const x of [-.7,.7]){box(caseGroup,.1,.78,1.32,caseMetal,x,.38,0);for(const z of [-.44,.44])cylinder(caseGroup,.05,.05,.06,caseAccent,x,.48,z,Math.PI/2)}
for(const z of [-.45,.45])box(caseGroup,1.58,.12,.09,caseMetal,0,.42,z);
box(caseGroup,.48,.22,.11,caseMetal,0,.4,.66);box(caseGroup,.18,.12,.08,caseAccent,0,.41,.73);
const lidPivot=new THREE.Group();lidPivot.position.set(0,.72,-.58);caseGroup.add(lidPivot);
box(lidPivot,1.7,.17,1.32,caseBody,0,0,.58);
for(const x of [-.72,.72])box(lidPivot,.12,.22,1.34,caseMetal,x,.05,.58);
for(let x=-.5;x<=.5;x+=.25)box(lidPivot,.07,.03,1.04,caseAccent,x,.1,.58);
const cell=new THREE.Group();cell.position.set(0,.86,0);caseGroup.add(cell);
const cellShell=mat(0xa9a48a,.7,.18),cellRubber=mat(0x242b29,.88,.15),cellCopper=mat(0xa97639,.55,.7);
box(cell,.7,.32,.45,cellShell,0,0,0);
for(const x of [-.3,.3])box(cell,.11,.4,.49,cellRubber,x,0,0);
for(let i=0;i<4;i++)box(cell,.05,.22,.46,cellCopper,-.19+i*.13,0,0);
for(const x of [-.19,.19])cylinder(cell,.07,.07,.12,cellCopper,x,.2,0);
box(cell,.31,.1,.045,screenMat,0,.02,.24);
cell.visible=false;
scene.add(caseGroup);caseGroup.userData={name:'SEALED SERVICE CASE',x:-5,z:2};interactables.push(caseGroup);
const generator=new THREE.Group();generator.position.set(-7,0,-4);box(generator,1,.7,.8,edgeMat,0,.35,0);box(generator,.7,.9,.6,wallMat,0,1.1,0);box(generator,.48,.22,.05,screenMat,0,1.25,.33);
const generatorLever=new THREE.Group();generatorLever.position.set(.37,1.35,.35);generator.add(generatorLever);
cylinder(generatorLever,.16,.16,.15,rustMat,0,0,0,Math.PI/2);
const leverHandle=box(generatorLever,.09,.65,.09,edgeMat,0,.35,.04);leverHandle.rotation.z=-.34;
cylinder(generatorLever,.16,.16,.16,greenMat,-.11,.7,.04);
for(let i=0;i<6;i++)box(generator,.12,.08,.58,edgeMat,-.35+i*.14,.48,.12);
scene.add(generator);generator.userData={name:'AUXILIARY POWER DISTRIBUTION',x:-7,z:-4};interactables.push(generator);
// Sliding double-leaf pressure bulkhead with a visible rectangular doorway.
const hatch=new THREE.Group();hatch.position.set(11.4,0,-10.6);scene.add(hatch);
const doorFrame=mat(0x343c34,.83,.35),doorPaint=mat(0x88876a,.88,.22),doorInset=mat(0x42483e,.8,.34),doorWarning=mat(0xc19b4b,.87,.2);
box(hatch,4.2,.55,.7,doorFrame,0,3.35,0);
for(const x of [-2.0,2.0]){box(hatch,.5,3.4,.7,doorFrame,x,1.7,0);box(hatch,.14,2.85,.74,doorWarning,x*.87,1.72,0)}
box(hatch,4.1,.2,.85,doorFrame,0,.12,0);
const hatchDoor=new THREE.Group();hatch.add(hatchDoor);
const leftLeaf=new THREE.Group(),rightLeaf=new THREE.Group();hatchDoor.add(leftLeaf,rightLeaf);
for(const [leaf,side] of [[leftLeaf,-1],[rightLeaf,1]]){
 box(leaf,1.83,2.82,.32,doorPaint,side*.96,1.7,0);
 box(leaf,1.5,2.37,.36,doorInset,side*.96,1.7,.02);
 box(leaf,1.34,2.16,.4,doorPaint,side*.96,1.7,.04);
 for(const y of [.82,2.58])box(leaf,1.52,.11,.43,doorFrame,side*.96,y,.08);
 for(const y of [1.03,1.72,2.4])for(const x of [side*.4,side*1.5])cylinder(leaf,.055,.055,.04,doorFrame,x,y,.27,Math.PI/2);
 box(leaf,.16,.95,.45,doorWarning,side*.14,1.65,.12);
}
hatch.userData={name:'MAINTENANCE EXIT',x:11.4,z:-10.6};interactables.push(hatch);
// Expanded maintenance chamber: functional repair bay and terminal alcove.
const deckSteel=wornSteelMat,deckRust=wornRustMat,deckCream=wornSandMat;
for(let z=-10;z<=10;z+=2){box(scene,27,.07,.16,deckSteel,0,.035,z);for(let x=-13;x<=13;x+=3.3)box(scene,.22,.045,1.8,deckRust,x,.052,z+.85)}
for(const x of [-13.5,13.5])for(let z=-9;z<=9;z+=3){box(scene,.35,7,.42,deckSteel,x,3.5,z);box(scene,.7,.16,.7,deckRust,x,6.7,z)}
for(const z of [-10.6,10.6])for(let x=-12;x<=12;x+=3){if(z<0&&x>9)continue;box(scene,.35,7,.4,deckSteel,x,3.5,z)}
// Scrap and tools surrounding MU-1's waking area.
const scrap=new THREE.Group();scrap.position.set(-10,0,7);scene.add(scrap);
box(scrap,3.6,.22,2.8,deckRust,0,.12,0);
for(let i=0;i<19;i++){const x=Math.sin(i*2.17)*1.5,z=Math.cos(i*3.71)*1.05;const piece=box(scrap,.22+(i%4)*.16,.12+(i%3)*.14,.35+(i%5)*.12,i%3?deckSteel:deckRust,x,.35+(i%4)*.13,z);piece.rotation.y=i*.72;piece.rotation.z=(i%3-1)*.18}
for(let i=0;i<5;i++){const t=cylinder(scrap,.055,.055,.7,deckCream,-1.2+i*.52,.5,-.7,0,Math.PI/2);t.rotation.y=i*.2}
for(let i=0;i<6;i++){const x=-12+i*4.5;box(scene,.23,7,.3,deckSteel,x,7.1,-8);box(scene,.45,.28,17,deckRust,x,7.3,0)}
for(let i=0;i<5;i++){const z=-8+i*4;box(scene,1.6,2.4,1.3,deckSteel,12.1,1.2,z);box(scene,1.2,.65,.09,deckRust,11.24,1.8,z)}
// A deep overhead service bridge and wall-mounted pressure tanks establish scale.
for(let x=-12;x<=12;x+=2){box(scene,1.72,.18,2.3,deckSteel,x,6.15,-8.8);box(scene,.14,.95,.15,deckCream,x,6.7,-7.7)}
box(scene,25,.13,.12,deckRust,0,7.16,-7.7);
for(const x of [-12.2])for(const z of [-7,-2,3,8]){
 const tank=cylinder(scene,.85,.85,3.4,deckSteel,x,3.8,z);
 for(const y of [2.5,4.9])cylinder(scene,.92,.92,.13,deckRust,x,y,z);
 box(scene,1.95,.17,1.95,deckRust,x,1.9,z);
}
for(let i=0;i<8;i++){
 const x=-11.5+i*3.2;
 industrialTube([[x,7.7,-10],[x,7.9,-5],[x,7.4,0],[x,7.6,5]],.085+(i%3)*.045,i%3===0?oxidised:conduit);
}
for(let i=0;i<10;i++){const z=-9+i*2;box(scene,.8,.04,1.3,deckRust,0,.09,z);box(scene,.58,.04,.06,deckCream,0,.12,z-.4)}
// Repainted bulkhead skins, warning panels, and riveted service cladding.
const olivePaint=wornOliveMat,sandPaint=wornSandMat,inkBlack=mat(0x282b25,.92,.12),hazardPaint=mat(0xb17943,.94,.08);
for(let x=-12;x<=7.5;x+=3.5){
 box(scene,3.12,3.2,.11,x%2===0?olivePaint:sandPaint,x,3.1,-10.65);
 box(scene,3.1,.11,.18,inkBlack,x,1.48,-10.53);
 for(const y of [1.7,4.5])for(const dx of [-1.38,1.38])cylinder(scene,.055,.055,.06,inkBlack,x+dx,y,-10.52,Math.PI/2);
}
for(let z=-9;z<=9;z+=3.6){
 box(scene,.12,3.15,3.2,olivePaint,-13.63,3.1,z);
 box(scene,.22,.13,3.1,inkBlack,-13.5,1.5,z);
}
for(let i=0;i<7;i++){
 const x=-11+i*3.5;
 box(scene,1.35,.06,.8,hazardPaint,x,.095,-2);
 box(scene,.15,.07,.82,inkBlack,x-.48,.13,-2);
 box(scene,.15,.07,.82,inkBlack,x+.48,.13,-2);
}
// Illustrated industrial set piece: enormous serviced heat-exchanger, catwalk and Saturn observation port.
const exchanger=new THREE.Group();exchanger.position.set(-5.5,0,-8.5);scene.add(exchanger);
const wornOlive=wornOliveMat,oxidisedCopper=wornRustMat,ivory=wornSandMat;
cylinder(exchanger,1.75,1.75,6.5,wornOlive,0,4.25,0,0,Math.PI/2);
for(let x=-2.7;x<=2.7;x+=1.35)cylinder(exchanger,1.83,1.83,.22,oxidisedCopper,x,4.25,0,0,Math.PI/2);
for(let x=-2.4;x<=2.4;x+=.8)box(exchanger,.16,.19,2.9,ivory,x,5.1,0);
for(let i=0;i<10;i++){const a=i*Math.PI*2/10;cylinder(exchanger,.07,.07,.14,doorFrame,-2.7,4.25+1.55*Math.sin(a),1.55*Math.cos(a),0,Math.PI/2)}
box(exchanger,8.6,.28,2.5,doorFrame,0,2.15,1.4);
for(let x=-3.9;x<=3.9;x+=.8){box(exchanger,.1,1.2,.11,ivory,x,2.9,2.65);box(exchanger,.75,.05,2.3,oxidisedCopper,x,2.32,1.4)}
box(exchanger,8.2,.09,.12,ivory,0,3.5,2.65);
// Painted Saturn backdrop inside a reinforced observation viewport on the north bulkhead.
const saturnCanvas=document.createElement('canvas');saturnCanvas.width=512;saturnCanvas.height=320;
const sc=saturnCanvas.getContext('2d');
const sky=sc.createLinearGradient(0,0,0,320);sky.addColorStop(0,'#111b21');sky.addColorStop(1,'#3a4039');sc.fillStyle=sky;sc.fillRect(0,0,512,320);
for(let i=0;i<160;i++){const x=(i*173.13)%512,y=(i*91.79)%320;sc.fillStyle=i%7===0?'#e4d6b0':'#899aa0';sc.fillRect(x,y,i%11===0?2:1,1)}
sc.save();sc.translate(256,165);sc.rotate(-.28);
sc.strokeStyle='#b7a98b';sc.lineWidth=18;sc.beginPath();sc.ellipse(0,0,170,40,0,0,Math.PI*2);sc.stroke();
sc.strokeStyle='#605e56';sc.lineWidth=5;sc.beginPath();sc.ellipse(0,0,194,49,0,0,Math.PI*2);sc.stroke();
const planet=sc.createLinearGradient(-80,-80,90,90);planet.addColorStop(0,'#c8bda1');planet.addColorStop(.55,'#8d826d');planet.addColorStop(1,'#3e4645');
sc.fillStyle=planet;sc.beginPath();sc.arc(0,0,87,0,Math.PI*2);sc.fill();
for(let j=-65;j<=65;j+=15){sc.strokeStyle='#8a7b63';sc.globalAlpha=.18;sc.lineWidth=5;sc.beginPath();sc.moveTo(-65,j);sc.lineTo(65,j+8);sc.stroke()}sc.globalAlpha=1;
sc.strokeStyle='#e0cba1';sc.lineWidth=12;sc.beginPath();sc.ellipse(0,0,170,40,0,0,Math.PI);sc.stroke();sc.restore();
const saturnTexture=new THREE.CanvasTexture(saturnCanvas);saturnTexture.colorSpace=THREE.SRGBColorSpace;
const saturnPanel=new THREE.Mesh(new THREE.PlaneGeometry(7,4.4),new THREE.MeshBasicMaterial({map:saturnTexture,side:THREE.DoubleSide}));saturnPanel.position.set(5,4.35,-10.55);scene.add(saturnPanel);
for(const x of [1.2,8.8])box(scene,.35,5.2,.4,doorFrame,x,4.35,-10.38);
for(const y of [1.95,6.75])box(scene,8,.34,.45,doorFrame,5,y,-10.38);
for(let i=0;i<9;i++){const x=1.3+i*.92;box(scene,.09,4.5,.1,oxidisedCopper,x,4.35,-10.25)}
// Workshop zones: scrap/wake, fabrication, generator and command, with clear central circulation.
const worktop=wornPaint(0x948669,81),toolMetal=mat(0x292e2b,.78,.4);
function workshopBench(x,z,rotation=0){
 const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;scene.add(g);
 box(g,3.1,.17,1.15,worktop,0,1.1,0);
 for(const xx of [-1.35,1.35])for(const zz of [-.46,.46])box(g,.15,1.05,.16,toolMetal,xx,.55,zz);
 box(g,2.9,.72,.12,wornOliveMat,0,1.52,-.5);
 for(let i=0;i<8;i++)box(g,.07,.22,.08,toolMetal,-1.1+i*.3,1.55,-.38);
 box(g,.9,.18,.65,wornRustMat,-.65,1.3,.05);
}
workshopBench(-9,2.2);workshopBench(1.5,7,Math.PI);
const pathPaint=mat(0xb1a16e,.98,.05);
for(let z=-7;z<=8;z+=1.25)for(const x of [3.8,8.2])box(scene,.12,.024,.75,pathPaint,x,.1,z);
for(let x=-11;x<=-4;x+=1.2)box(scene,.7,.024,.12,pathPaint,x,.1,3.6);
for(let i=0;i<4;i++){const x=-10+i*.68;box(scene,.38,2.8,.48,wornOliveMat,x,1.4,-5.8);box(scene,.48,.13,.56,wornRustMat,x,2.8,-5.8)}
const generatorLight=new THREE.PointLight(0xffc17b,18,10,2);generatorLight.position.set(-7,4,-4);scene.add(generatorLight);
const benchLight=new THREE.PointLight(0xffd99b,12,10,2);benchLight.position.set(-9,3.5,4);scene.add(benchLight);
// Terminal is physically separated from the generator and exit.
const terminal=new THREE.Group();terminal.position.set(5,0,-7);scene.add(terminal);
box(terminal,1.8,1.2,1.05,deckRust,0,.6,0);
box(terminal,1.64,1.58,.72,deckSteel,0,1.85,-.15);
for(const x of [-.75,.75])box(terminal,.14,1.65,.83,deckCream,x,1.85,-.15);
box(terminal,1.66,.17,.78,deckRust,0,2.72,-.15);
const terminalBezel=box(terminal,1.4,1.02,.13,deckCream,0,2.1,.23);
box(terminal,1.62,.22,.78,deckRust,0,1.36,.36);
for(let i=0;i<4;i++)cylinder(terminal,.055,.055,.09,deckCream,-.53+i*.34,1.44,.76,Math.PI/2);
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
const sage=wornPaint(0x667865,61);
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
// Equipable lock-service arm, anchored to the chassis and initially hidden.
// MU-1 has one original articulated maintenance arm, even before recovery.
const originalArm=new THREE.Group();originalArm.name='original-arm';originalArm.position.set(-.94,-.17,.12);shell.add(originalArm);
const originalDark=mat(0x313731,.84,.45),originalGreen=mat(0x697663,.9,.18);
cylinder(originalArm,.2,.2,.32,originalDark,0,0,0,Math.PI/2);
const originalUpper=box(originalArm,.19,.58,.23,originalGreen,-.13,-.35,0);originalUpper.rotation.z=-.22;
cylinder(originalArm,.14,.14,.25,originalDark,-.22,-.65,0,Math.PI/2);
const originalFore=box(originalArm,.17,.55,.18,originalGreen,-.27,-.94,.05);originalFore.rotation.z=.12;
box(originalArm,.25,.17,.2,originalDark,-.3,-1.24,.06);
for(const side of [-1,1])box(originalArm,.07,.24,.09,originalDark,-.3+side*.1,-1.4,.06);
const mountedArm=new THREE.Group();mountedArm.name='mounted-service-arm';mountedArm.position.set(.91,-.13,.33);shell.add(mountedArm);
const factoryYellow=wornPaint(0xc69a3d,73),factoryBlack=mat(0x222521,.7,.55),factorySteel=mat(0x77796c,.6,.68);
cylinder(mountedArm,.23,.23,.35,factoryBlack,0,0,0,Math.PI/2);
box(mountedArm,.31,.18,.31,factoryYellow,0,-.1,0);
const factoryUpper=box(mountedArm,.26,.55,.3,factoryYellow,.12,-.38,.02);factoryUpper.rotation.z=.28;
cylinder(mountedArm,.18,.18,.33,factorySteel,.23,-.66,.05,Math.PI/2);
const factoryFore=box(mountedArm,.3,.58,.27,factoryYellow,.3,-.98,.1);factoryFore.rotation.z=-.12;
for(let i=0;i<4;i++){const stripe=box(mountedArm,.32,.075,.3,factoryBlack,.3,-.78-i*.13,.1);stripe.rotation.z=-.12}
box(mountedArm,.38,.2,.31,factoryBlack,.34,-1.33,.13);
for(const side of [-1,1]){const jaw=box(mountedArm,.085,.33,.12,factorySteel,.34+side*.17,-1.55,.13);jaw.rotation.z=side*.19}
// Exposed actuator housings and cable runs on both mechanical arms.
for(const rig of [originalArm,mountedArm]){
 const colour=rig===originalArm?originalGreen:factoryYellow;
 for(const y of [-.35,-.92]){cylinder(rig,.11,.11,.11,factorySteel,.2,y,.24,Math.PI/2);cylinder(rig,.06,.06,.13,factoryBlack,.2,y,.33,Math.PI/2)}
 const cable=new THREE.CatmullRomCurve3([new THREE.Vector3(0,-.05,-.1),new THREE.Vector3(-.15,-.5,-.26),new THREE.Vector3(.15,-.9,-.24),new THREE.Vector3(.3,-1.24,-.08)]);
 rig.add(new THREE.Mesh(new THREE.TubeGeometry(cable,18,.045,8,false),factoryBlack));
 for(let i=0;i<3;i++)box(rig,.16,.05,.25,colour,.13,-.47-i*.16,.07);
}
mountedArm.visible=false;

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
robot.position.set(-9,0,6);controls.target.set(-9,1.3,6);camera.position.set(3,16,18);controls.update();robot.rotation.y=Math.PI*.18;
// Selective ink outlines: hard structural silhouettes, not a black wireframe on every triangle.
const inkMaterial=new THREE.LineBasicMaterial({color:0x171c19,transparent:true,opacity:.42,depthWrite:false});
const inkMeshes=[];
function addTechnicalInk(root){
 root.traverse(o=>{
  if(!o.isMesh||o.geometry.type==='TubeGeometry'||o.geometry.type==='SphereGeometry'||o.geometry.type==='TorusGeometry'||o.geometry.type==='CircleGeometry')return;
  if(o.material?.transparent||o.material?.emissiveIntensity>1)return;
  const geo=o.geometry;
  if(!geo.attributes?.position||geo.attributes.position.count>1800)return;
  const edge=new THREE.LineSegments(new THREE.EdgesGeometry(geo,38),inkMaterial);
  edge.renderOrder=1;edge.scale.setScalar(1.003);o.add(edge);inkMeshes.push(edge);
 });
}
addTechnicalInk(scene);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.92,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.56}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;robot.add(shadow);

let interactionPulse=0;let charge=60,hasArm=false,armEquipped=false,caseOpen=false,hasCell=false,usedCell=false,powerOn=false,ended=false,paused=false,doorOpening=false,doorOpen=false,target=null,selected=null,walkTime=0;
const keys={w:false,a:false,s:false,d:false};
const logMessages=[];const task=document.querySelector('#task'),toast=document.querySelector('#toast'),inventory=document.querySelector('#inventory');
const terminalPanel=document.createElement('section');terminalPanel.id='station-terminal';terminalPanel.style.cssText='display:none;position:fixed;z-index:80;inset:10% 18%;background:repeating-linear-gradient(0deg,#0002 0px,#0002 1px,transparent 2px,transparent 5px),linear-gradient(145deg,#15241d,#08120f 75%);border:9px solid #343b32;outline:2px solid #8a8b6d;box-shadow:0 0 0 100vmax #000b,inset 0 0 75px #000a,0 12px 55px #000;padding:clamp(15px,3vw,38px);color:#b7dfae;text-shadow:0 0 8px #4e9d6650;font:clamp(12px,1.4vw,16px)/1.85 monospace;letter-spacing:.045em;white-space:pre-line;overflow:auto';
terminalPanel.innerHTML='<div style="font-size:12px;letter-spacing:.2em;color:#879d83">SATURN STATION // LOCAL CONTROL INTERFACE</div><pre id="terminal-output" style="white-space:pre-wrap;font:inherit;margin:25px 0">SYSTEM READY\n\nPRESS ENTER TO BOOT TERMINAL</pre><div style="font-size:12px;color:#859b85">ENTER BOOT · 1 OPEN DOOR · 2 CLOSE DOOR · 3 POWER OFF · ESC EXIT</div>';document.body.append(terminalPanel);
let terminalBooted=false,terminalOpen=false;
const terminalOutput=terminalPanel.querySelector('#terminal-output');
terminalPanel.setAttribute('role','dialog');terminalPanel.setAttribute('aria-label','Station control terminal');
const terminalStatus=document.createElement('div');terminalStatus.style.cssText='margin-top:28px;border-top:1px solid #5a765b;padding-top:13px;color:#7e9b7c;font-size:11px;letter-spacing:.16em';terminalPanel.append(terminalStatus);
function updateTerminalStatus(){terminalStatus.textContent='AUXILIARY GRID: '+(powerOn?'ONLINE':'OFFLINE')+'   /   DOOR: '+(doorOpen?'OPEN':'SEALED')+'   /   MU-1 LINK: ACTIVE'}

function showTerminal(){updateTerminalStatus();terminalOpen=true;terminalPanel.style.display='block';terminalOutput.textContent=terminalBooted?'LOCAL CONTROL // READY\n1  OPEN DOOR\n2  CLOSE DOOR\n3  TURN OFF POWER':'SYSTEM READY\n\nPRESS ENTER TO BOOT TERMINAL';Object.keys(keys).forEach(k=>keys[k]=false)}
function hideTerminal(){terminalOpen=false;terminalPanel.style.display='none'}
function terminalKey(k){if(k==='escape'){hideTerminal();return}if(k==='enter'){terminalBooted=true;terminalOutput.textContent='BOOT COMPLETE\nLOCAL CONTROL // READY\n\n1  OPEN DOOR\n2  CLOSE DOOR\n3  TURN OFF POWER';return}if(!terminalBooted){terminalOutput.textContent='PRESS ENTER TO BOOT TERMINAL';return}if(k==='1'){if(!powerOn){terminalOutput.textContent='ERROR: GENERATOR OFFLINE';return}doorOpening=true;hatch.userData.openStarted=performance.now();terminalOutput.textContent='COMMAND 01: OPEN DOOR\nACTUATOR ENGAGED';updateTerminalStatus();task.textContent='Door opening. Explore the exit.'}else if(k==='2'){doorOpening=false;doorOpen=false;leftLeaf.position.x=0;rightLeaf.position.x=0;terminalOutput.textContent='COMMAND 02: CLOSE DOOR\nDOOR SEALED';updateTerminalStatus()}else if(k==='3'){powerOn=false;generatorLever.rotation.z=0;phosphor.intensity=13;terminalScreen.material=terminalDark;terminalLamp.material=terminalDark;terminalBooted=false;updateTerminalStatus();hideTerminal();task.textContent='Restore generator power to use the terminal.';notify('GENERATOR POWER OFF')}}

function say(s){logMessages.push(s);if(logMessages.length>8)logMessages.shift()}
let toastTimer;function notify(s){toast.textContent=s;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
function updateCharge(){document.querySelector('#charge').textContent=String(Math.ceil(charge)).padStart(2,'0')+'%';document.querySelector('#charge-bar').style.width=Math.max(0,charge)+'%'}
function itemIcon(type){
 const base='<svg viewBox="0 0 96 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
 if(type==='arm')return base+'<g transform="rotate(-20 48 36)" stroke="#1c211d" stroke-width="3"><rect x="34" y="3" width="29" height="17" rx="5" fill="#b7a13f"/><circle cx="49" cy="21" r="9" fill="#7a8176"/><rect x="40" y="26" width="19" height="25" rx="4" fill="#d0a84a"/><path d="M40 30h19M40 40h19" stroke="#222"/><circle cx="49" cy="52" r="7" fill="#838b80"/><path d="M43 57v12m12-12v12" stroke="#c1c6b9" stroke-width="6"/></g></svg>';
 return base+'<g stroke="#262d2b" stroke-width="3"><rect x="15" y="20" width="66" height="35" rx="6" fill="#b5ad8d"/><rect x="15" y="20" width="12" height="35" fill="#333c39"/><rect x="69" y="20" width="12" height="35" fill="#333c39"/><path d="M32 25v24m9-24v24m9-24v24m9-24v24" stroke="#b7803b" stroke-width="5"/><rect x="40" y="14" width="16" height="8" rx="2" fill="#a9773c"/></g></svg>';
}
function updateInventory(){
 document.querySelector('#item-count').textContent=String(Number(hasArm)+Number(hasCell)).padStart(2,'0');
 document.querySelector('#cell-hot').textContent=hasCell?'READY':usedCell?'USED':'EMPTY';
 document.querySelector('#cell-hot').classList.toggle('filled',hasCell||usedCell);
 document.querySelector('#arm-slot').textContent=armEquipped?'FACTORY MANIPULATOR':'EMPTY';
 document.querySelector('#arm-slot').nextElementSibling.textContent=armEquipped?'COMPONENT INSTALLED':'DRAG COMPONENT HERE';
 document.querySelector('#arm-hot').innerHTML=armEquipped?itemIcon('arm'):'';
 document.querySelector('#cell-icon').innerHTML=hasCell||usedCell?itemIcon('cell'):'';
 const list=document.querySelector('#inventory-items');list.replaceChildren();
 function item(type,name,description,stats,draggable){
  const node=document.createElement('div');node.className='inventory-item';node.draggable=draggable;
  const picture=document.createElement('div');picture.className='item-illustration';picture.innerHTML=itemIcon(type);
  const info=document.createElement('div');info.className='item-info';
  const heading=document.createElement('strong');heading.textContent=name;
  const detail=document.createElement('small');detail.textContent=description;
  const properties=document.createElement('p');properties.className='item-stats';properties.textContent=stats;
  info.append(heading,detail,properties);node.append(picture,info);
  if(draggable)node.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain','lock-arm');e.dataTransfer.effectAllowed='move'});
  node.addEventListener('click',()=>chooseInspection(type));list.append(node);
 }
 if(hasArm)item('arm','INDUSTRIAL MANIPULATOR','Yellow-and-black interchangeable factory arm. Heavy-duty gripper for physical switches and mechanical releases.','CLASS  TOOL ARM  /  MOUNT  RIGHT  /  GRIP  85 N  /  STATUS  '+(armEquipped?'EQUIPPED':'STOWED'),!armEquipped);
 if(hasCell)item('cell','PORTABLE POWER PACK','Sealed auxiliary energy cartridge. Restores MU-1 internal charge when consumed with Q.','CLASS  CONSUMABLE  /  CHARGE  +55%  /  USE  Q',false);
 if(!hasArm&&!hasCell)list.innerHTML='<p class="empty-inventory">No components recovered.</p>';
}
function openInventory(){inventory.classList.add('open');inventory.setAttribute('aria-hidden','false');updateInventory();chooseInspection(hasArm?'arm':hasCell?'cell':'arm');target=null}
function closeInventory(){inventory.classList.remove('open');inventory.setAttribute('aria-hidden','true')}
const armSlot=document.querySelector('[data-slot="arm"]');armSlot.addEventListener('dragover',e=>{e.preventDefault();armSlot.classList.add('drag-over')});armSlot.addEventListener('dragleave',()=>armSlot.classList.remove('drag-over'));armSlot.addEventListener('drop',e=>{e.preventDefault();armSlot.classList.remove('drag-over');if(e.dataTransfer.getData('text/plain')==='lock-arm'&&hasArm){armEquipped=true;mountedArm.visible=true;previewMountedArm.visible=true;updateInventory();say('LOCK-SERVICE ARM INSTALLED.');notify('COMPONENT INSTALLED');task.textContent='Activate the generator switch.'}});
document.querySelector('#close-inventory').addEventListener('click',closeInventory);
document.querySelector('#fullscreen').addEventListener('click',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()});
function removeObject(o){if(selected===o)selected=null;scene.remove(o);const i=interactables.indexOf(o);if(i>=0)interactables.splice(i,1)}
function nearest(){let best=null,d=Infinity;for(const o of interactables){const n=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(n<d){d=n;best=o}}return d<1.8?best:null}
function interact(){if(ended||inventory.classList.contains('open'))return;const o=(selected&&interactables.includes(selected)&&Math.hypot(robot.position.x-selected.userData.x,robot.position.z-selected.userData.z)<1.8?selected:null)||nearest();if(!o){notify('NO SERVICE OBJECT IN REACH');return}const dist=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(dist>1.8){target=new THREE.Vector3(o.userData.x,0,o.userData.z);notify('MOVING TO '+o.userData.name);return}
const id=o.userData.name;interactionPulse=1;
if(id==='LOCK-SERVICE MANIPULATOR'){if(hasArm)return;hasArm=true;removeObject(o);updateInventory();say('LOOSE MANIPULATOR RECOVERED.');task.textContent='Inspect the recovered component in your inventory.';notify('COMPONENT RECOVERED');setTimeout(()=>notify('NEW COMPONENT STORED  ·  I TO INSPECT'),850)}
else if(id==='SEALED SERVICE CASE'){if(!armEquipped){notify('MECHANICAL RELEASE REQUIRED');say('CASE LOCK CANNOT BE OPERATED WITHOUT A MANIPULATOR.');return}if(!caseOpen){caseOpen=true;lidPivot.rotation.x=-1.35;cell.visible=true;say('SERVICE CASE RELEASED.');task.textContent='Recover the portable power cell from the open case.';notify('LOCK RELEASED')}else if(!hasCell){hasCell=true;cell.visible=false;say('PORTABLE POWER CELL RECOVERED.');task.textContent='Use the power cell to restore internal charge.';updateInventory();notify('POWER CELL ACQUIRED')}}
else if(id==='AUXILIARY POWER DISTRIBUTION'){if(!armEquipped){notify('MANIPULATOR REQUIRED TO THROW SWITCH');return}powerOn=true;generatorLever.rotation.z=.75;phosphor.intensity=24;terminalScreen.material=terminalLit;terminalLamp.material=terminalLit;say('GENERATOR SWITCH ENGAGED. TERMINAL POWER AVAILABLE.');task.textContent='Access the powered terminal.';notify('GENERATOR ONLINE')}
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
const previewMountedArm=previewRobot.getObjectByName('mounted-service-arm');

// Rotatable 3D equipment inspection uses clones of the actual game models.
const itemHost=document.querySelector('#item-model-preview'),itemScene=new THREE.Scene();
itemScene.add(new THREE.HemisphereLight(0xf0e5c9,0x39453d,2.5));
const itemLight=new THREE.DirectionalLight(0xffe0ae,3);itemLight.position.set(-3,6,6);itemScene.add(itemLight);
const itemCamera=new THREE.PerspectiveCamera(32,1,.1,30);itemCamera.position.set(3,2.6,4.2);itemCamera.lookAt(0,.7,0);
const itemRenderer=new THREE.WebGLRenderer({antialias:true,alpha:true});itemRenderer.setPixelRatio(Math.min(devicePixelRatio,2));itemRenderer.outputColorSpace=THREE.SRGBColorSpace;itemHost.appendChild(itemRenderer.domElement);
const itemModel=new THREE.Group();itemScene.add(itemModel);
let itemType='arm',itemYaw=.4,itemDragging=false,itemLastX=0;
function chooseInspection(type){
 itemType=type;itemYaw=.4;itemModel.clear();
 const model=(type==='arm'?mountedArm:cell).clone(true);model.visible=true;
 model.position.set(0,type==='arm'?1.7:.75,0);model.scale.setScalar(type==='arm'?1.2:2.1);itemModel.add(model);
 document.querySelector('#inspection-title').textContent=type==='arm'?'INDUSTRIAL MANIPULATOR':'PORTABLE POWER PACK';
 document.querySelector('#inspection-specs').textContent=type==='arm'?'RIGHT MOUNT · MECHANICAL GRIPPER · 85 N · '+(armEquipped?'INSTALLED':'STOWED'):'ENERGY CARTRIDGE · +55% CHARGE · '+(hasCell?'READY':'USED');
}
itemHost.addEventListener('pointerdown',e=>{itemDragging=true;itemLastX=e.clientX;itemHost.setPointerCapture(e.pointerId)});
itemHost.addEventListener('pointermove',e=>{if(itemDragging){itemYaw+=(e.clientX-itemLastX)*.012;itemLastX=e.clientX}});
itemHost.addEventListener('pointerup',()=>itemDragging=false);itemHost.addEventListener('pointercancel',()=>itemDragging=false);
function renderItemInspection(dt){
 if(!itemDragging)itemYaw+=dt*.35;itemModel.rotation.y=itemYaw;
 const w=itemHost.clientWidth,h=itemHost.clientHeight;if(!w||!h)return;
 itemRenderer.setSize(w,h,false);itemCamera.aspect=w/h;itemCamera.updateProjectionMatrix();itemRenderer.render(itemScene,itemCamera);
}
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
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);controls.enabled=!inventory.classList.contains('open')&&!paused&&!devConsole.classList.contains('open');// Keep MU-1 in view instead of orbiting the empty centre of the expanded chamber.
const desiredFocus=new THREE.Vector3(robot.position.x,1.25,robot.position.z);
const followDelta=desiredFocus.sub(controls.target).multiplyScalar(1-Math.exp(-dt*4));
controls.target.add(followDelta);camera.position.add(followDelta);
controls.update();if(inventory.classList.contains('open')){renderInventoryPreview();renderItemInspection(dt)}if(!paused&&!ended&&!terminalOpen&&!inventory.classList.contains('open')&&!devConsole.classList.contains('open')){const mx=(keys.d?1:0)-(keys.a?1:0),mz=(keys.s?1:0)-(keys.w?1:0),len=Math.hypot(mx,mz);const wantsMove=len>0;
const targetSpeed=wantsMove?2.25:0;
// Inertial acceleration and braking make the chassis feel mechanically heavy.
gaitVelocity=THREE.MathUtils.damp(gaitVelocity,targetSpeed,wantsMove?6.2:8.5,dt);
gaitWeight=THREE.MathUtils.damp(gaitWeight,wantsMove?1:0,wantsMove?3.0:5.0,dt);
if(wantsMove){
 robot.position.x=THREE.MathUtils.clamp(robot.position.x+mx/len*gaitVelocity*dt,-12.5,12.5);
 robot.position.z=THREE.MathUtils.clamp(robot.position.z+mz/len*gaitVelocity*dt,-9.5,9.5);
 const desiredHeading=Math.atan2(mx,mz);
 robot.rotation.y+=Math.atan2(Math.sin(desiredHeading-robot.rotation.y),Math.cos(desiredHeading-robot.rotation.y))*Math.min(1,dt*9);
}
walkTime+=dt*4.8*(gaitVelocity/1.5);
animateGait(dt,gaitWeight>.06);
interactionPulse=Math.max(0,interactionPulse-dt*2.7);
const reach=Math.sin((1-interactionPulse)*Math.PI)*Math.min(1,interactionPulse*2);
const working=armEquipped?mountedArm:originalArm;
originalArm.rotation.x=THREE.MathUtils.damp(originalArm.rotation.x,working===originalArm?-reach*.9:0,11,dt);
originalArm.rotation.z=THREE.MathUtils.damp(originalArm.rotation.z,working===originalArm?-reach*.3:0,11,dt);
mountedArm.rotation.x=THREE.MathUtils.damp(mountedArm.rotation.x,working===mountedArm?-reach*1.1:0,11,dt);
mountedArm.rotation.z=THREE.MathUtils.damp(mountedArm.rotation.z,working===mountedArm?reach*.3:0,11,dt);
originalFore.rotation.z=.12+(working===originalArm?reach*.2:0);
factoryFore.rotation.z=-.12-(working===mountedArm?reach*.24:0);
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
if(doorOpening&&!doorOpen){const t=Math.min(1,(performance.now()-hatch.userData.openStarted)/1150);leftLeaf.position.x=-1.85*t;rightLeaf.position.x=1.85*t;if(t>=1){doorOpening=false;doorOpen=true;task.textContent='Exit door open. Terminal remains available.';notify('DOOR OPEN')}}
renderer.render(scene,camera);updateNearbyUI()}
animate();document.querySelector('#loading').classList.add('hidden');document.querySelector('#charge').textContent='60%';document.querySelector('#charge-bar').style.width='60%';updateCharge();updateInventory();task.textContent='Recover the missing manipulator from the repair bay.';say('MU-1 ONLINE. MANIPULATOR MISSING. LOCATE SERVICE ARM.');
