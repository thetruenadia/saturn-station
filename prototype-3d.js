import {createBackgroundMusic} from './background-music.js?v=menu-music3';
import {createMainMenu} from './main-menu.js?v=menu-music3';
import {consumeLaunch} from './menu-saves.js?v=menu1';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';
import {createTerminalBrowser,createDemoEnding} from './terminal-browser.js?v=access1';
import {installReferenceAssets} from './reference-assets.js?v=etna1';
import { applyArtDirection } from './station-art.js?v=etna1';

import {createMakerOpening} from './maker-opening.js?v=menu1';
import {createWorkshopSystem} from './workshop-system.js?v=access1';

let opening,mainMenu;
let menuLaunch=null;try{menuLaunch=consumeLaunch(sessionStorage)}catch{}
const viewport=document.querySelector('#viewport');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x242923);
scene.fog=new THREE.FogExp2(0x242923,.012);
const camera=new THREE.OrthographicCamera(-11,11,8,-8,.1,100);
const firstPersonCamera=new THREE.PerspectiveCamera(74,1,.08,90);
let firstPerson=false,lookHeading=0,lookPitch=0,looking=false,lastLookX=0,lastLookY=0;
const activeCamera=()=>firstPerson?firstPersonCamera:camera;
camera.position.set(12,15,12);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
viewport.appendChild(renderer.domElement);
const controls=new OrbitControls(camera,renderer.domElement);
controls.target.set(0,0,0);controls.enableDamping=true;controls.dampingFactor=.07;controls.enablePan=false;
controls.minPolarAngle=.55;controls.maxPolarAngle=1.25;controls.minZoom=.65;controls.maxZoom=5.5;
camera.zoom=1.55;camera.updateProjectionMatrix();
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
 for(let i=0;i<4400;i++){ctx.fillStyle=rnd()>.5?'#f0e5be10':'#191b1820';ctx.fillRect(rnd()*256,rnd()*256,.5+rnd()*4,.5+rnd()*3)}
 for(let i=0;i<130;i++){const x=rnd()*256,y=rnd()*256;ctx.strokeStyle=rnd()>.5?'#272c2780':'#a9774b70';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+rnd()*12,y-rnd()*5);ctx.stroke()}
 // Broad pigment variation, edge chips and pooled grime suggest painted illustration.
 for(let i=0;i<26;i++){const x=rnd()*256,y=rnd()*256,r=12+rnd()*65;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,i%2?'#d9cba324':'#25312c32');g.addColorStop(1,'#25312c00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
 for(let i=0;i<75;i++){const x=rnd()>.5?rnd()*256:(rnd()>.5?rnd()*16:240+rnd()*16),y=rnd()*256;ctx.fillStyle=i%3?'#333c3290':'#aa815998';ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+2+rnd()*9,y+1);ctx.lineTo(x+1+rnd()*5,y+2+rnd()*4);ctx.closePath();ctx.fill()}
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 return new THREE.MeshStandardMaterial({map:tex,roughness:.97,metalness:.08});
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
// Quiet perimeter infrastructure; the authored machinery defines the room.
const industrial=new THREE.Group();scene.add(industrial);
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

// The lock-service manipulator: a loose, recognisable mechanical component on the deck.
const interactables=[];
const arm=new THREE.Group();arm.position.set(-7.2,0,3);arm.scale.setScalar(1.35);
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
arm.userData={name:'LOCK-SERVICE MANIPULATOR',x:-7.2,z:3};interactables.push(arm);
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
// Tan field cartridge: moulded asymmetric shell, recessed buttons and rotary caps.
const cellShell=wornPaint(0xb5a07a,94),cellRubber=mat(0x20231e,.7,.25),cellCopper=mat(0x967247,.55,.5);
function assetLabel(parent,text,w,h,x,y,z,background='#aa956f',ink='#292c25'){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
 const ctx=canvas.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,512,256);
 ctx.fillStyle=ink;ctx.font='bold 31px monospace';ctx.textAlign='center';
 text.split('\n').forEach((line,i)=>ctx.fillText(line,256,44+i*39,480));
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,roughness:.9}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
const cartridgeOutline=new THREE.Shape();
cartridgeOutline.moveTo(-.29,-.52);cartridgeOutline.lineTo(.12,-.52);cartridgeOutline.lineTo(.15,-.43);cartridgeOutline.lineTo(.28,-.40);cartridgeOutline.lineTo(.28,-.02);cartridgeOutline.lineTo(.23,.07);cartridgeOutline.lineTo(.23,.51);cartridgeOutline.lineTo(-.25,.51);cartridgeOutline.lineTo(-.25,-.12);cartridgeOutline.lineTo(-.30,-.21);cartridgeOutline.closePath();
const cartridge=new THREE.Mesh(new THREE.ExtrudeGeometry(cartridgeOutline,{depth:.20,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.035,bevelThickness:.035}),cellShell);cartridge.position.z=-.1;cartridge.castShadow=true;cell.add(cartridge);
box(cell,.19,.4,.018,cellCopper,-.145,.25,.141);
assetLabel(cell,'CAUTION\nFUEL CELL\nSEALED UNIT\nFC / 55',.18,.35,-.145,.26,.155,'#947447');
// Right-side recessed triangular controls and central pill button.
for(const [y,up] of [[.34,true],[.1,false]]){
 const shape=new THREE.Shape();shape.moveTo(-.055,up?-.035:.035);shape.lineTo(.055,up?-.035:.035);shape.lineTo(0,up?.055:-.055);shape.closePath();
 const recess=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.018,bevelEnabled:true,bevelSize:.013,bevelThickness:.008,bevelSegments:2,steps:1}),cellRubber);recess.position.set(.125,y,.14);cell.add(recess);
 const button=recess.clone();button.material=cellCopper;button.scale.set(.77,.77,1);button.position.z=.16;cell.add(button);
}
box(cell,.13,.07,.025,cellRubber,.125,.22,.15);box(cell,.10,.045,.025,cellCopper,.125,.22,.17);
for(const [x,y,r] of [[-.015,-.095,.09],[.16,-.30,.115],[-.16,-.32,.085]]){
 cylinder(cell,r,r,.035,cellRubber,x,y,.16,Math.PI/2);
 cylinder(cell,r*.76,r*.76,.044,x===-.015?cellRubber:cellShell,x,y,.19,Math.PI/2);
 if(x!==-.015)box(cell,r*1.5,.025,.045,cellCopper,x,y,.22);
 for(let i=0;i<8;i++){const a=i*Math.PI/4;box(cell,.013,.018,.012,cellCopper,x+Math.cos(a)*r*.87,y+Math.sin(a)*r*.87,.189)}
}
cylinder(cell,.025,.025,.03,mat(0x247b9a,.3,.5),-.19,-.43,.18,Math.PI/2);
cylinder(cell,.07,.07,.09,cellShell,-.17,-.57,0);
cylinder(cell,.065,.065,.055,cellCopper,-.08,.57,0);
const cellLoop=new THREE.Mesh(new THREE.TorusGeometry(.07,.012,6,18),cellCopper);cellLoop.position.set(.08,.57,0);cell.add(cellLoop);
cell.rotation.x=-Math.PI/2;
cell.visible=false;
scene.add(caseGroup);caseGroup.userData={name:'SEALED SERVICE CASE',x:-5,z:2};interactables.push(caseGroup);
const generator=new THREE.Group();generator.position.set(5,0,-7);box(generator,1,.7,.8,edgeMat,0,.35,0);box(generator,.7,.9,.6,wallMat,0,1.1,0);box(generator,.48,.22,.05,screenMat,0,1.25,.33);
const generatorLever=new THREE.Group();generatorLever.position.set(.37,1.35,.35);generator.add(generatorLever);
cylinder(generatorLever,.16,.16,.15,rustMat,0,0,0,Math.PI/2);
const leverHandle=box(generatorLever,.09,.65,.09,edgeMat,0,.35,.04);leverHandle.rotation.z=-.34;
cylinder(generatorLever,.16,.16,.16,greenMat,-.11,.7,.04);
for(let i=0;i<6;i++)box(generator,.12,.08,.58,edgeMat,-.35+i*.14,.48,.12);
scene.add(generator);generator.userData={name:'AUXILIARY POWER DISTRIBUTION',x:5,z:-7};interactables.push(generator);
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
// Local override socket, with two narrow keyed contact channels.
box(hatch,.38,.43,.13,doorFrame,-1.4,1.48,.48);
box(hatch,.20,.28,.08,doorPaint,-1.4,1.48,.56);
for(const side of [-1,1])box(hatch,.035,.14,.035,doorWarning,-1.4+side*.065,1.48,.62);
// Expanded maintenance chamber: functional repair bay and terminal alcove.
const deckSteel=wornSteelMat,deckRust=wornRustMat,deckCream=wornSandMat;
for(let z=-10;z<=10;z+=2){box(scene,27,.07,.16,deckSteel,0,.035,z);for(let x=-13;x<=13;x+=3.3)box(scene,.22,.045,1.8,deckRust,x,.052,z+.85)}
for(const x of [-13.5,13.5])for(let z=-9;z<=9;z+=3){box(scene,.35,7,.42,deckSteel,x,3.5,z);box(scene,.7,.16,.7,deckRust,x,6.7,z)}
for(const z of [-10.6,10.6])for(let x=-12;x<=12;x+=3){if(z<0&&x>9)continue;box(scene,.35,7,.4,deckSteel,x,3.5,z)}
// Scrap and tools surrounding MU-1's waking area.
const scrap=new THREE.Group();scrap.position.set(-10,0,7);scene.add(scrap);
// Dense, grounded salvage from industrial motor and gear assemblies.
const motorBlue=mat(0x3b626e,.84,.32),motorCream=mat(0x9e9986,.88,.22),motorRust=mat(0x795c47,.92,.25),motorShaft=mat(0x444c4c,.57,.66);
box(scrap,3.6,.22,2.8,deckRust,0,.12,0);
function salvageMotor(x,z,paint,turn=0){
 const unit=new THREE.Group();unit.position.set(x,.57,z);unit.rotation.y=turn;scrap.add(unit);
 const housing=cylinder(unit,.29,.29,.71,paint,0,0,0,0,Math.PI/2);
 // Fins grow out of a proper motor body, while feet sit on the scrap tray.
 for(let i=-3;i<=3;i++)box(unit,.055,.63,.62,motorShaft,i*.085,0,0);
 for(const side of [-1,1]){
  const cap=cylinder(unit,.30,.30,.075,motorRust,side*.37,0,0,0,Math.PI/2);
  cylinder(unit,.07,.07,.20,motorShaft,side*.47,0,0,0,Math.PI/2);
  box(unit,.23,.12,.20,motorRust,side*.18,-.29,0);
 }
 box(unit,.34,.17,.28,motorCream,.06,.39,0);
 return unit;
}
salvageMotor(-.95,-.48,motorBlue,.25);
salvageMotor(.63,.45,motorCream,-.43);
salvageMotor(.95,-.75,motorRust,.85);
function salvageGear(x,z,scale=1){
 const g=new THREE.Group();g.position.set(x,.40,z);g.scale.setScalar(scale);scrap.add(g);
 cylinder(g,.28,.28,.14,motorShaft,0,0,0,Math.PI/2,0);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;const tooth=box(g,.11,.15,.12,motorRust,Math.sin(a)*.27,0,Math.cos(a)*.27);tooth.rotation.y=a}
 cylinder(g,.09,.09,.19,motorCream,0,.04,0);
}
salvageGear(-.2,.72,.85);salvageGear(.08,-.68,.66);
for(let i=0;i<3;i++){
 const pts=[new THREE.Vector3(-1.3+i*.25,.31,.7),new THREE.Vector3(-.45+i*.16,.34,-.1),new THREE.Vector3(.25+i*.20,.40,.65)];
 scrap.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),18,.022,6,false),i===0?motorRust:motorShaft));
}
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
// Observation window and Enceladus view are constructed by reference-assets.js.
// Workshop zones: scrap/wake, fabrication, generator and command, with clear central circulation.
const pathPaint=mat(0xb1a16e,.98,.05);
for(let z=-7;z<=8;z+=1.25)for(const x of [3.8,8.2])box(scene,.12,.024,.75,pathPaint,x,.1,z);
for(let x=-11;x<=-4;x+=1.2)box(scene,.7,.024,.12,pathPaint,x,.1,3.6);
const generatorLight=new THREE.PointLight(0xffc17b,18,10,2);generatorLight.position.set(5,4,-7);scene.add(generatorLight);
const benchLight=new THREE.PointLight(0xffd99b,12,10,2);benchLight.position.set(-9,3.5,4);scene.add(benchLight);
// Terminal is physically separated from the generator and exit.
const terminal=new THREE.Group();terminal.position.set(-7,0,-4);scene.add(terminal);
const rackCream=wornPaint(0xb7b398,95),rackBlue=wornPaint(0x29486c,96),rackBlack=mat(0x141b1b,.72,.3),rackHandle=mat(0x8d9281,.5,.65);
box(terminal,2.05,.15,1.15,rackBlack,0,.08,0);
box(terminal,1.96,2.03,1.03,rackCream,0,1.14,0);
for(const x of [-.94,.94])box(terminal,.10,2.15,1.12,rackHandle,x,1.16,0);
for(let row=0;row<3;row++){
 const y=.47+row*.65;box(terminal,1.77,.60,.045,rackCream,0,y,.545);
 box(terminal,1.77,.025,.025,rackBlack,0,y-.31,.57);
 for(const x of [-.8,.8])box(terminal,.045,.42,.12,rackHandle,x,y,.64);
 if(row>0){box(terminal,.40,.35,.07,rackBlack,-.48,y,.60);box(terminal,.26,.025,.025,rackHandle,-.48,y,.645)}
 for(let i=0;i<(row===0?7:3);i++)cylinder(terminal,.025,.025,.035,rackBlack,.03+i*.095,y-.12,.60,Math.PI/2);
 assetLabel(terminal,row===2?'380 EVENT GENERATOR':row===1?'340 PROCESSOR':'CONTROL / POWER UNIT',1.18,.10,-.08,y+.20,.575,'#b7b398');
}
box(terminal,2.12,1.55,1.16,rackBlue,0,2.94,0);
box(terminal,2.19,.09,1.2,rackCream,0,3.76,0);
// Deep dark bezel and a slightly convex-looking glass display.
box(terminal,1.30,1.13,.10,rackBlack,-.29,3.02,.61);
const terminalDark=new THREE.MeshStandardMaterial({color:0x061912,emissive:0x021009,emissiveIntensity:.2,roughness:.24});
const crtCanvas=document.createElement('canvas');crtCanvas.width=512;crtCanvas.height=384;
const crt=crtCanvas.getContext('2d');crt.fillStyle='#031b14';crt.fillRect(0,0,512,384);crt.fillStyle='#5effb4';crt.font='17px monospace';
['SATURN STATION // LOCAL CONTROL','================================','AUXILIARY GRID      ONLINE','MU-1 SERVICE LINK   CONNECTED','','01  BULKHEAD ACTUATOR','02  PRESSURE SEAL','03  POWER DISTRIBUTION','','> AWAITING LOCAL INPUT_'].forEach((line,i)=>crt.fillText(line,18,30+i*31));
crt.fillStyle='#00000055';for(let y=0;y<384;y+=4)crt.fillRect(0,y,512,1);
const crtTexture=new THREE.CanvasTexture(crtCanvas);crtTexture.colorSpace=THREE.SRGBColorSpace;
const terminalLit=new THREE.MeshStandardMaterial({map:crtTexture,emissiveMap:crtTexture,emissive:0x71ffb4,emissiveIntensity:1.6,roughness:.25});
const terminalScreen=box(terminal,1.10,.88,.045,terminalDark,-.29,3.04,.68);
for(const x of [.47,.72]){box(terminal,.21,1.12,.055,rackBlack,x,3.03,.61);box(terminal,.026,.96,.025,rackHandle,x,3.03,.648);box(terminal,.045,.24,.055,rackBlack,x+.055,2.99,.69)}
box(terminal,1.32,.12,.43,rackBlack,-.29,2.38,.78);
for(let row=0;row<2;row++)for(let i=0;i<10;i++)box(terminal,.103,.035,.115,rackCream,-.84+i*.12,2.46,.70+row*.14);
const terminalLamp=box(terminal,.065,.065,.04,terminalDark,.55,2.40,.62);
cylinder(terminal,.035,.035,.045,mat(0xa8442d),.72,2.4,.64,Math.PI/2);
assetLabel(terminal,'WAVETERM / STATION B-7',1.65,.10,0,3.62,.594,'#29486c','#cec9aa');
const rackCable=new THREE.CatmullRomCurve3([new THREE.Vector3(-.35,1.85,.65),new THREE.Vector3(-.15,1.3,.78),new THREE.Vector3(-.30,.4,.85),new THREE.Vector3(-.8,.22,.7)]);
terminal.add(new THREE.Mesh(new THREE.TubeGeometry(rackCable,24,.027,7,false),rackHandle));
terminal.userData={name:'CONTROL TERMINAL',x:-7,z:-4};interactables.push(terminal);
// The existing hatch stays at the exit and is controlled exclusively by the terminal.
// MU-1 silhouette-first reconstruction for 0.2.
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
const originalJaws=[];
for(const side of [-1,1]){const jaw=box(originalArm,.07,.24,.09,originalDark,-.3+side*.1,-1.4,.06);originalJaws.push({jaw,side})}
// Standard manipulator retrofit: a short keyed probe fitted between its existing fingers.
const doorAccessProbe=new THREE.Group();doorAccessProbe.name='door-access-probe';doorAccessProbe.position.set(-.3,-1.53,.08);originalArm.add(doorAccessProbe);
box(doorAccessProbe,.15,.21,.14,originalGreen,0,-.02,0);
for(const side of [-1,1])box(doorAccessProbe,.035,.17,.035,originalDark,side*.05,-.17,.01);
doorAccessProbe.visible=false;
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
// Structural pedestal ties the raised sensor assembly into the chassis below.
bodyBox(body,.30,.37,.31,gunmetal,.39,2.72,-.66);
const sensor=new THREE.Group();sensor.position.set(.39,2.99,-.66);body.add(sensor);
bodyBox(sensor,.32,.25,.36,gunmetal,0,0,0);
bodyBox(sensor,.27,.12,.27,sageDark,0,.16,-.015);
const sensorLens=new THREE.Mesh(new THREE.SphereGeometry(.065,14,12),blackGlass);sensorLens.position.set(0,-.015,.205);sensor.add(sensorLens);
cylX(sensor,.09,.36,rawSteel,0,-.03,-.02);
// Flush service access panel behind the sensor.
bodyBox(body,.27,.23,.29,sageDark,-.31,2.79,-.48);
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
const inkMaterial=new THREE.LineBasicMaterial({color:0x1c2928,transparent:true,opacity:.6,depthWrite:false});
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
const maintenanceNote=new THREE.Group();maintenanceNote.position.set(5,1.25,-10.15);scene.add(maintenanceNote);
assetLabel(maintenanceNote,'STAFF LOCKERS\nB-7 / 106',.65,.44,0,0,0,'#c2b68e','#353a2d');
maintenanceNote.userData={name:'LOCKER DIRECTION SIGN',x:5,z:-10.15};
const stationArt=applyArtDirection({THREE,scene,robot,terminal,terminalScreen,terminalLamp,terminalLit,exchanger,box,cylinder,pipeBetween,wornPaint,label});
const referenceAssets=installReferenceAssets({THREE,scene,cell,caseGroup,lidPivot,hatch,hatchDoor,leftLeaf,rightLeaf,mountedArm,arm,box,cylinder,wornPaint,stationArt,generator,generatorLever});
addTechnicalInk(scene);
const shadow=new THREE.Mesh(new THREE.CircleGeometry(.92,32),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.56}));
shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;robot.add(shadow);

let interactionPulse=0;let cellCount=0,caseCellTaken=false,workshop;let charge=60,hasArm=false,armEquipped=false,caseOpen=false,hasNote=false,hasCell=false,usedCell=false,powerOn=false,ended=false,paused=false,doorOpening=false,doorOpen=false,target=null,selected=null,walkTime=0;
const keys={w:false,a:false,s:false,d:false};
const logMessages=[];const task=document.querySelector('#task'),toast=document.querySelector('#toast'),inventory=document.querySelector('#inventory');
let terminalBooted=false,terminalOpen=false;
const terminalUI=createTerminalBrowser({
 onClose(){terminalOpen=false;Object.keys(keys).forEach(k=>keys[k]=false)},
 onBoot(){terminalBooted=true;saveProgress()},onCommand:terminalCommand,onSave:saveProgress,
 readNote:()=>hasNote,sound:playSound,onSpec:()=>workshop.releaseSpec()
});
function setCellCount(n){cellCount=Math.max(0,Math.floor(n));hasCell=cellCount>0;usedCell=!hasCell;updateInventory()}
workshop=createWorkshopSystem({THREE,scene,robot,interactables,colliders:referenceAssets.colliders,notify,sound:playSound,save:saveProgress,cellCount:()=>cellCount,setCellCount,onCraftProbe(){return !workshop.hasProbe},onAccessCard(value){hasNote=value;updateInventory()},armModel:originalArm});
// Retain the loose arm as scenery, not a field-replaceable part.
{const i=interactables.indexOf(arm);if(i>=0)interactables.splice(i,1)}
function updateTerminalStatus(){terminalUI.setStatus('AUXILIARY GRID: '+(powerOn?'ONLINE':'OFFLINE')+' / DOOR: '+(doorOpen?'OPEN':doorOpening?'OPENING':'SEALED')+' / MU-1 LINK: ACTIVE')}
function showTerminal(){Object.keys(keys).forEach(k=>keys[k]=false);terminalOpen=true;updateTerminalStatus();terminalUI.show()}
function hideTerminal(){terminalUI.hide()}
function terminalKey(k){terminalUI.key({key:k,target:{tagName:'BODY'},preventDefault(){}})}
function terminalCommand(k){
 if(!terminalUI.session.state.authenticated)return 'AUTHENTICATION REQUIRED';
 if(k==='1'){
  if(!powerOn)return 'ERROR: AUXILIARY GRID OFFLINE';
  return 'AUTOMATIC DOOR LINK ISOLATED · USE LOCAL EXIT SOCKET WITH ACCESS PROBE';

 }
 if(k==='2'){doorOpening=false;doorOpen=false;leftLeaf.position.x=rightLeaf.position.x=0;task.textContent='Exit door sealed. Use the terminal to reopen it.';updateTerminalStatus();saveProgress();return 'COMMAND 02 / DOOR SEALED'}
 if(k==='3'){setStationPower(false);task.textContent='Restore generator power to use the terminal.';notify('GENERATOR POWER OFF');return 'AUXILIARY POWER OFF'}
 return 'UNKNOWN COMMAND';
}
function finishDemo(){
 if(ended||!doorOpen)return;
 hideTerminal();closeInventory();setPaused(false);ended=true;target=null;Object.keys(keys).forEach(k=>keys[k]=false);saveProgress();demoEnding.show();
}
function say(s){logMessages.push(s);if(logMessages.length>8)logMessages.shift()}
let toastTimer;function notify(s){toast.textContent=s;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
function updateCharge(){document.querySelector('#charge').textContent=String(Math.ceil(charge)).padStart(2,'0')+'%';document.querySelector('#charge-bar').style.width=Math.max(0,charge)+'%'}
function itemIcon(type){
 const base='<svg viewBox="0 0 96 72" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
 if(type==='note')return base+'<path d="M25 6h46v60H25Z" fill="#c2b68e" stroke="#413d31" stroke-width="2"/><path d="M32 20h32m-32 9h32m-32 9h24m-24 9h29" stroke="#514c3b" stroke-width="2"/></svg>';
 if(type==='arm')return base+'<g transform="rotate(-20 48 36)" stroke="#1c211d" stroke-width="3"><rect x="34" y="3" width="29" height="17" rx="5" fill="#84917d"/><circle cx="49" cy="21" r="9" fill="#7a8176"/><rect x="40" y="26" width="19" height="25" rx="4" fill="#a0ab8a"/><path d="M40 30h19M40 40h19" stroke="#222"/><circle cx="49" cy="52" r="7" fill="#838b80"/><path d="M43 57v12m12-12v12" stroke="#c1c6b9" stroke-width="6"/></g></svg>';
 return base+'<g stroke="#293233" stroke-width="2"><rect x="16" y="17" width="64" height="39" rx="5" fill="#b89948"/><path d="M21 20h54v14H21Z" fill="#d1a36a"/><path d="M26 20v14m7-14v14m7-14v14m7-14v14m7-14v14m7-14v14m7-14v14" stroke="#a75f32" stroke-width="4"/><path d="M15 14v46m66-46v46M15 15h66M15 58h66" stroke="#283230" stroke-width="7"/><rect x="26" y="39" width="44" height="10" fill="#263b33"/><path d="M30 42h31m-31 4h22" stroke="#d3c9a6" stroke-width="1"/><circle cx="19" cy="19" r="1" fill="#d8d6bd"/><circle cx="77" cy="54" r="1" fill="#d8d6bd"/></g></svg>';
}
function updateInventory(){
 mountedArm.visible=hasArm&&armEquipped;
 previewMountedArm.visible=hasArm&&armEquipped;
 const entries=[];
 if(hasNote)entries.push({type:'note',name:'WORKER ACCESS CARD',draggable:false});
 if(hasArm)entries.push({type:'arm',name:'INDUSTRIAL MANIPULATOR',description:'Olive articulated industrial service arm. Heavy-duty gripper for physical switches and mechanical releases.',stats:'CLASS  TOOL ARM  /  MOUNT  RIGHT  /  GRIP  85 N  /  STATUS  '+(armEquipped?'EQUIPPED':'STOWED'),draggable:!armEquipped});
 if(cellCount>0)entries.push({type:'cell',name:'PORTABLE POWER PACK',description:'Sealed auxiliary energy cartridge. Restores MU-1 internal charge when consumed with Q.',stats:'CLASS  CONSUMABLE  /  CHARGE  +55%  /  USE  Q',draggable:false});
 document.querySelector('#item-count').textContent=String(entries.length).padStart(2,'0')+' / 20';
 document.querySelector('#cell-hot').textContent=String(cellCount)+' ×';
 document.querySelector('#cell-hot').classList.toggle('filled',cellCount>0);
 document.querySelector('#arm-slot').textContent=armEquipped?'FACTORY MANIPULATOR':'EMPTY';
 document.querySelector('#arm-slot').nextElementSibling.textContent=armEquipped?'COMPONENT INSTALLED':hasArm?'CLICK OR DRAG TO INSTALL':'RECOVER COMPONENT FIRST';
 document.querySelector('#arm-hot').innerHTML=armEquipped?itemIcon('arm'):'';
 document.querySelector('#cell-icon').innerHTML=cellCount>0?itemIcon('cell'):'';
 mountedArm.visible=hasArm&&armEquipped;previewMountedArm.visible=hasArm&&armEquipped;
 chooseInspection(itemType);
 const grid=document.querySelector('#inventory-items');grid.replaceChildren();
 for(let i=0;i<20;i++){
  const entry=entries[i],slot=document.createElement('div');
  slot.className='inventory-grid-slot'+(entry?' occupied':'');
  slot.setAttribute('aria-label',entry?entry.name:'Empty inventory slot '+(i+1));if(entry){slot.dataset.item=entry.type;slot.classList.toggle('selected',itemType===entry.type);slot.setAttribute('aria-pressed',String(itemType===entry.type))}
  if(entry){
   slot.tabIndex=0;slot.setAttribute('role','button');slot.draggable=entry.draggable;
   const model=document.createElement('span');model.className='slot-object';model.innerHTML=itemIcon(entry.type);
   slot.append(model);
   const number=document.createElement('small');number.textContent=String(i+1).padStart(2,'0');slot.append(number);
   const inspect=()=>{chooseInspection(entry.type);playSound('select')};
   slot.addEventListener('click',inspect);
   slot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect()}});
   if(entry.draggable)slot.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain','lock-arm');e.dataTransfer.effectAllowed='move'});
  }else{const number=document.createElement('small');number.textContent=String(i+1).padStart(2,'0');slot.append(number)}
  grid.append(slot);
 }
}
function openInventory(){if(opening?.active||pickup)return;Object.keys(keys).forEach(k=>keys[k]=false);inventory.classList.add('open');inventory.setAttribute('aria-hidden','false');updateInventory();target=null}
function closeInventory(){inventory.classList.remove('open');inventory.setAttribute('aria-hidden','true')}
function equipArm(){
 if(!hasArm||armEquipped)return;
 armEquipped=true;updateInventory();say('LOCK-SERVICE ARM INSTALLED.');notify('COMPONENT INSTALLED');task.textContent='Activate the generator switch.';
}
const armSlot=document.querySelector('[data-slot="arm"]');
armSlot.tabIndex=0;armSlot.setAttribute('role','button');armSlot.setAttribute('aria-label','Install recovered manipulator');
armSlot.addEventListener('click',equipArm);
armSlot.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();equipArm()}});
armSlot.addEventListener('dragover',e=>{e.preventDefault();armSlot.classList.add('drag-over')});
armSlot.addEventListener('dragleave',()=>armSlot.classList.remove('drag-over'));
armSlot.addEventListener('drop',e=>{e.preventDefault();armSlot.classList.remove('drag-over');if(e.dataTransfer.getData('text/plain')==='lock-arm')equipArm()});
document.querySelector('#close-inventory').addEventListener('click',closeInventory);
document.querySelector('#fullscreen').addEventListener('click',()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()});
function removeObject(o){if(selected===o)selected=null;scene.remove(o);const i=interactables.indexOf(o);if(i>=0)interactables.splice(i,1)}
function nearest(){let best=null,d=Infinity;for(const o of interactables){const n=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);const score=n-(o.userData.workshopType==='locker-loot'?.8:0);if(score<d){d=score;best=o}}return d<1.8?best:null}
function interact(){if(opening?.active)return;if(ended||pickup||inventory.classList.contains('open'))return;const o=(selected&&interactables.includes(selected)&&Math.hypot(robot.position.x-selected.userData.x,robot.position.z-selected.userData.z)<1.8?selected:null)||nearest();if(!o){notify('NO SERVICE OBJECT IN REACH');return}const dist=Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z);if(dist>1.8){target=new THREE.Vector3(o.userData.x,0,o.userData.z);notify('MOVING TO '+o.userData.name);return}
const id=o.userData.name;interactionPulse=1;
if(o.userData.workshopType){workshop.handle(o);return;}
if(id==='MAINTENANCE NOTE'){notify('SEARCH LOCKER 106 FOR THE STAFF CARD')}
else if(id==='LOCK-SERVICE MANIPULATOR'){notify('PART REPLACEMENT REQUIRES A SERVICE BAY')}
else if(id==='SEALED SERVICE CASE'){if(!caseOpen){caseOpen=true;lidPivot.rotation.x=-1.35;cell.visible=true;say('SERVICE CASE RELEASED.');task.textContent='Recover the portable power cell from the open case.';notify('LOCK RELEASED')}else if(!caseCellTaken){caseCellTaken=true;setCellCount(cellCount+1);cell.visible=false;say('PORTABLE POWER CELL RECOVERED.');task.textContent='Use the power cell to restore internal charge.';updateInventory();notify('POWER CELL ACQUIRED')}}
else if(id==='AUXILIARY POWER DISTRIBUTION'){setStationPower(true);say('GENERATOR SWITCH ENGAGED. TERMINAL POWER AVAILABLE.');task.textContent='Access the powered terminal.';notify('GENERATOR ONLINE')}
else if(id==='CONTROL TERMINAL'){if(!powerOn){notify('TERMINAL OFFLINE');return}showTerminal()}else if(id==='MAINTENANCE EXIT'){if(doorOpen)finishDemo();else if(!workshop.hasProbe)notify('DOOR SOCKET REQUIRES ACCESS PROBE');else if(!powerOn)notify('RESTORE POWER FIRST');else{doorOpening=true;hatch.userData.openStarted=performance.now();notify('ACCESS PROBE ENGAGED · DOOR UNLOCKING');saveProgress()}}
}
// Nearby item readout and small projected E key above interactable objects.
const nearbyPanel=document.querySelector('#nearby-panel');
const nearbyList=document.querySelector('#nearby-list');
const interactionMarker=document.querySelector('#interaction-marker');
const markerWorld=new THREE.Vector3();
function updateNearbyUI(){
 const hidden=paused||ended||terminalOpen||inventory.classList.contains('open')||workshop.isOpen||devConsole.classList.contains('open');
 if(hidden){nearbyPanel.classList.remove('visible');interactionMarker.classList.remove('visible');return}
 const close=interactables.map(o=>({o,d:Math.hypot(robot.position.x-o.userData.x,robot.position.z-o.userData.z)}))
   .filter(x=>x.d<3.3).sort((a,b)=>a.d-b.d);
 nearbyPanel.classList.toggle('visible',close.length>0);
 nearbyList.replaceChildren();
 for(const {o,d} of close.slice(0,3)){
   const row=document.createElement('div');
   row.className='nearby-row'+(d<=1.8?' reachable':'');
   const name=document.createElement('span');name.textContent=o.userData.name;
   const state=document.createElement('small');state.textContent=d<=1.8?interactionHint(o):'MOVE CLOSER';
   row.append(name,state);nearbyList.appendChild(row);
 }
 const active=close.find(x=>x.d<=1.8);
 if(!active){interactionMarker.classList.remove('visible');return}
 const o=active.o;
 interactionMarker.textContent='E · '+interactionHint(o);
 markerWorld.set(o.userData.x,1.65,o.userData.z).project(activeCamera());
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
renderer.domElement.addEventListener('pointerup',e=>{if(opening?.active||dragged||ended||paused||inventory.classList.contains('open'))return;const r=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-r.left)/r.width)*2-1;pointer.y=-((e.clientY-r.top)/r.height)*2+1;raycaster.setFromCamera(pointer,activeCamera());const hits=raycaster.intersectObjects(interactables,true);let hit=null;for(const h of hits){let obj=h.object;while(obj.parent&&!interactables.includes(obj))obj=obj.parent;if(interactables.includes(obj)){hit=obj;break}}if(hit){if(hit===hatch&&doorOpen&&Math.hypot(robot.position.x-hatch.userData.x,robot.position.z-hatch.userData.z)<2.2){finishDemo();return}selected=hit;notify(hit.userData.name)}});
const noteDialog=document.createElement('dialog');noteDialog.className='note-dialog';noteDialog.innerHTML='<h2>MAINTENANCE NOTE</h2><p>The password is <strong>ETNA</strong>.</p><form method="dialog"><button>KEEP NOTE</button></form>';document.body.append(noteDialog);
function showNote(){Object.keys(keys).forEach(k=>keys[k]=false);setPaused(true);noteDialog.showModal()}
noteDialog.addEventListener('close',()=>setPaused(false));
const pauseScreen=document.querySelector('#pause-screen'),deathScreen=document.querySelector('#death-screen'),devConsole=document.querySelector('#dev-console'),consoleOutput=document.querySelector('#console-output'),consoleInput=document.querySelector('#console-input');
function setPaused(value){paused=value;pauseScreen.classList.toggle('open',paused);pauseScreen.setAttribute('aria-hidden',String(!paused));document.body.classList.toggle('paused',paused);if(paused){target=null;Object.keys(keys).forEach(k=>keys[k]=false)}}
function restartDemo(){resettingProgress=true;if(mainMenu){mainMenu.startNew();return;}try{localStorage.removeItem(SAVE_KEY)}catch{}location.reload()}
document.querySelector('#resume-game').addEventListener('click',()=>setPaused(false));document.querySelector('#pause-restart').addEventListener('click',restartDemo);document.querySelector('#death-restart').addEventListener('click',restartDemo);
function consoleLog(s){consoleOutput.textContent+='\n'+s;consoleOutput.scrollTop=consoleOutput.scrollHeight}
function runCommand(raw){const p=raw.trim().split(/\s+/),cmd=(p.shift()||'').toLowerCase(),n=Number(p[0]);if(!cmd)return;
if(cmd==='help')consoleLog('help | charge [0-100] | heal | arm | cell | power | unlock | teleport [x z] | god | kill | clear');
else if(cmd==='charge'&&Number.isFinite(n)){charge=THREE.MathUtils.clamp(n,0,100);updateCharge();consoleLog('CHARGE = '+charge)}
else if(cmd==='heal'){charge=100;updateCharge();consoleLog('CHARGE RESTORED')}
else if(cmd==='arm'){hasArm=true;armEquipped=true;const i=interactables.indexOf(arm);if(i>=0)removeObject(arm);updateInventory();consoleLog('MANIPULATOR RECOVERED + EQUIPPED')}
else if(cmd==='cell'){setCellCount(cellCount+1);consoleLog('POWER CELL ADDED')}
else if(cmd==='power'){setStationPower(true);consoleLog('AUXILIARY POWER ENABLED')}
else if(cmd==='unlock'){armEquipped=true;caseOpen=true;lidPivot.rotation.x=-1.35;cell.visible=true;updateInventory();consoleLog('SERVICE CASE UNLOCKED')}
else if(cmd==='teleport'&&p.length>=2){robot.position.set(THREE.MathUtils.clamp(Number(p[0]),-8,8),0,THREE.MathUtils.clamp(Number(p[1]),-6,6));consoleLog('UNIT TELEPORTED')}
else if(cmd==='god'){godMode=!godMode;consoleLog('GOD MODE '+(godMode?'ON':'OFF'))}
else if(cmd==='kill'){charge=0;updateCharge();triggerDeath()}
else if(cmd==='clear')consoleOutput.textContent='SATURN STATION // 0.2 DEV CONSOLE';
else consoleLog('UNKNOWN COMMAND. Type help.')}
let godMode=false;document.querySelector('#console-form').addEventListener('submit',e=>{e.preventDefault();const value=consoleInput.value;consoleLog('> '+value);runCommand(value);consoleInput.value=''});
window.addEventListener('keydown',e=>{if(mainMenu?.active)return;const k=e.key.toLowerCase();if(opening?.active){if(k==='escape'&&opening.elapsed>0)setPaused(!paused);return;}if(settingsPanel.open){if(k==='escape'){e.preventDefault();settingsPanel.close()}return}if(terminalOpen){terminalUI.key(e);return}if(devConsole.classList.contains('open')){if(k==='f2'){devConsole.classList.remove('open');devConsole.setAttribute('aria-hidden','true');renderer.domElement.focus()}return}
if(k==='f2'){e.preventDefault();devConsole.classList.add('open');devConsole.setAttribute('aria-hidden','false');consoleInput.focus();return}
if(workshop.isOpen||workshop.miniOpen){if(k==='escape'){workshop.close();return}if(k==='c'){if(workshop.miniOpen)workshop.open();else workshop.close();return}if(workshop.isOpen)return}
if(k==='i'&&inventory.classList.contains('open')){closeInventory();return}
if(ended)return;
if(k==='escape'){if(inventory.classList.contains('open')){closeInventory();return}if(deathScreen.classList.contains('open'))return;setPaused(!paused);return}
if(paused||ended||inventory.classList.contains('open')||workshop.isOpen)return;
if(k in keys){keys[k]=true;e.preventDefault()}
if(k==='i'){openInventory();return}if(k==='c'){workshop.open();return}if(k==='§'||k==='`'){firstPerson=!firstPerson;lookHeading=robot.rotation.y;lookPitch=0;robot.visible=!firstPerson;notify(firstPerson?'FIRST-PERSON OPTICS · DRAG TO LOOK':'ISOMETRIC VIEW');return}if(k==='e')interact();if(k==='q'&&cellCount>0){setCellCount(cellCount-1);charge=Math.min(100,charge+55);updateCharge();workshop.updateUI();say('FUEL CELL CONSUMED. INTERNAL CHARGE RESTORED.');notify('CHARGE +55 · '+cellCount+' CELLS LEFT');saveProgress()}});
window.addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k in keys)keys[k]=false});
window.addEventListener('blur',()=>Object.keys(keys).forEach(k=>keys[k]=false));
function triggerDeath(){if(godMode||deathScreen.classList.contains('open'))return;ended=true;Object.keys(keys).forEach(k=>keys[k]=false);deathScreen.classList.add('open');deathScreen.setAttribute('aria-hidden','false');task.textContent='UNIT POWER DEPLETED.';say('CRITICAL: UNIT POWER DEPLETED.');}
function resize(){const w=viewport.clientWidth,h=viewport.clientHeight;renderer.setSize(w,h,false);const aspect=w/h,view=8;camera.left=-view*aspect;camera.right=view*aspect;camera.top=view;camera.bottom=-view;camera.updateProjectionMatrix();firstPersonCamera.aspect=aspect;firstPersonCamera.updateProjectionMatrix();opening?.resize(w,h)}
window.addEventListener('resize',resize);resize();

const hintBox=document.createElement('aside');hintBox.id='hint-box';hintBox.hidden=true;hintBox.innerHTML='<strong>MAINTENANCE GUIDANCE</strong><button aria-label="Close hints">×</button><p></p><small>H CLOSE · C WORKSHOP · § VIEW</small>';document.querySelector('#viewport').append(hintBox);
const hintButton=document.createElement('button');hintButton.id='hint-toggle';hintButton.textContent='?';hintButton.title='Gameplay hints (H)';document.querySelector('#viewport').append(hintButton);
function toggleHint(){hintBox.hidden=!hintBox.hidden;hintBox.querySelector('p').textContent=!powerOn?'Throw the generator switch to power the room.':!hasNote?'Find the staff card in locker 106.':workshop.hint()}
hintButton.onclick=toggleHint;hintBox.querySelector('button').onclick=()=>hintBox.hidden=true;
window.addEventListener('keydown',e=>{if(e.key.toLowerCase()==='h'&&!mainMenu?.active&&!terminalOpen&&!workshop.isOpen&&!inventory.classList.contains('open'))toggleHint()});


// Drag to look around in first person. Keep orbit controls exclusive to the isometric view.
renderer.domElement.addEventListener('pointerdown',e=>{if(firstPerson){looking=true;lastLookX=e.clientX;lastLookY=e.clientY}});
renderer.domElement.addEventListener('pointermove',e=>{if(!firstPerson||!looking)return;lookHeading-=(e.clientX-lastLookX)*.005;lookPitch=THREE.MathUtils.clamp(lookPitch-(e.clientY-lastLookY)*.004,-.85,.85);lastLookX=e.clientX;lastLookY=e.clientY});
window.addEventListener('pointerup',()=>looking=false);

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
let itemType=null,itemYaw=.4,itemDragging=false,itemLastX=0;
function ownsInspectionItem(type){
 return type==='note'?hasNote:type==='arm'?hasArm:type==='cell'?cellCount>0:false;
}
function chooseInspection(type){
 itemType=ownsInspectionItem(type)?type:null;itemYaw=.4;itemDragging=false;itemModel.clear();
 document.querySelectorAll('[data-item]').forEach(slot=>{const active=slot.dataset.item===itemType;slot.classList.toggle('selected',active);slot.setAttribute('aria-pressed',String(active))});
 const equip=document.querySelector('#equip-inspected');equip.hidden=itemType!=='arm';equip.textContent=armEquipped?'UNEQUIP':'EQUIP';
 if(!itemType){
  document.querySelector('#inspection-title').textContent='NO ITEM SELECTED';
  document.querySelector('#inspection-description').textContent='Select an occupied slot to inspect its equipment.';
  document.querySelector('#inspection-specs').textContent='';
  return;
 }
 if(type==='note'){document.querySelector('#inspection-title').textContent='WORKER ACCESS CARD';document.querySelector('#inspection-description').textContent='B-7 service staff identification. The battered yellow sticky note on the reverse reads ETNA.';document.querySelector('#inspection-specs').textContent='PERSONAL / ACCESS ITEM · RECOVERED FROM LOCKER 106';return;}
 const model=(type==='arm'?mountedArm:cell).clone(true);model.visible=true;
 if(type==='cell')model.rotation.x=0;
 model.position.set(0,type==='arm'?1.7:.75,0);model.scale.setScalar(type==='arm'?1.2:2.1);itemModel.add(model);
 document.querySelector('#inspection-title').textContent=type==='arm'?'INDUSTRIAL MANIPULATOR':'PORTABLE POWER PACK';
 document.querySelector('#inspection-description').textContent=type==='arm'?'Olive cast housings, exposed rotary joints and a steel service gripper. Used for heavy mechanical releases and service switches.':'Caged amber power module with exposed copper windings. Consume with Q to restore internal charge.';
 document.querySelector('#inspection-specs').textContent=type==='arm'?'RIGHT MOUNT · MECHANICAL GRIPPER · 85 N · '+(armEquipped?'INSTALLED':'STOWED'):'ENERGY CARTRIDGE · +55% CHARGE · '+(hasCell?'READY':'USED');
}
itemHost.addEventListener('pointerdown',e=>{itemDragging=true;itemLastX=e.clientX;itemHost.setPointerCapture(e.pointerId)});
itemHost.addEventListener('pointermove',e=>{if(itemDragging){itemYaw+=(e.clientX-itemLastX)*.012;itemLastX=e.clientX}});
itemHost.addEventListener('pointerup',()=>itemDragging=false);itemHost.addEventListener('pointercancel',()=>itemDragging=false);
function renderItemInspection(dt){
 if(itemType&&!ownsInspectionItem(itemType))chooseInspection(null);
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
// 0.2 station atmosphere, recovery sequence and local continuity.
const SAVE_KEY='saturn-station-0.2-progress-v1';
let pickup=null,powerElapsed=10,systemTime=0,saveElapsed=0,stepElapsed=0,resettingProgress=false;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const equipButton=document.createElement('button');equipButton.id='equip-inspected';equipButton.hidden=true;
document.querySelector('.inspection-details').append(equipButton);
equipButton.addEventListener('click',()=>setArmEquipped(!armEquipped));
const demoEnding=createDemoEnding({restart:restartDemo,sound:playSound,reducedMotion,onMenu:()=>mainMenu.show()});
function setArmEquipped(value){
 if(!hasArm)return;
 armEquipped=value;updateInventory();saveProgress();playSound('equip');
 notify(value?'MANIPULATOR INSTALLED':'MANIPULATOR STOWED');refreshDirective();
}
function refreshDirective(){task.textContent=!powerOn?'Restore auxiliary power at the generator.':!hasNote?'Find the worker access card in locker 106.':!workshop.specUnlocked?'Use the terminal to recover the fabrication spec.':!workshop.hasProbe?'Dismantle the broken claw and fabricate an Access Probe.':'Use the probe on the exit door socket.'}
function interactionHint(o){
 if(o.userData.workshopType==='locker')return 'OPEN SALVAGE LOCKER';
 if(o.userData.workshopType==='bench')return 'OPEN WORKSHOP';
 if(o.userData.workshopType==='shard')return 'RECOVER SPEC SHARD';
 if(o.userData.workshopType==='loose'||o.userData.workshopType==='locker-loot')return 'RECOVER ITEM';
  if(o.userData.workshopType==='broken-claw')return 'DISMANTLE BROKEN CLAW';
 const id=o.userData.name;
 if(id==='MAINTENANCE NOTE')return 'READ MAINTENANCE NOTE';
 if(id==='LOCK-SERVICE MANIPULATOR')return pickup?'RECOVERING':'RECOVER ARM';
 if(id==='SEALED SERVICE CASE')return !caseOpen?'RELEASE CASE':!caseCellTaken?'TAKE POWER CELL':'CASE EMPTY';
 if(id==='AUXILIARY POWER DISTRIBUTION')return powerOn?'POWER ONLINE':'RESTORE POWER';
 if(id==='CONTROL TERMINAL')return powerOn?'ACCESS TERMINAL':'POWER REQUIRED';
 return doorOpen?'FINISH DEMO':workshop.hasProbe?'USE ACCESS PROBE':'ACCESS PROBE REQUIRED';
}
function beginPickup(o){
 referenceAssets.releaseArm();pickup={object:o,time:0,start:o.position.clone()};target=null;
 Object.keys(keys).forEach(k=>keys[k]=false);
 robot.rotation.y=Math.atan2(o.position.x-robot.position.x,o.position.z-robot.position.z);
 armMarker.visible=armBeacon.visible=armBeaconTop.visible=false;
 notify('RECOVERING MANIPULATOR');playSound('servo');
}
const pickupHand=new THREE.Vector3();
function animatePickup(dt){
 if(!pickup||paused||ended||terminalOpen||devConsole.classList.contains('open'))return;
 pickup.time+=dt;const t=Math.min(1,pickup.time/1.9);
 originalJaws.forEach(({jaw,side})=>jaw.position.x=-.3+side*(t>.48?.045:.12));
 robot.updateMatrixWorld(true);
 originalArm.localToWorld(pickupHand.set(-.3,-1.4,.06));
 if(t>.28){const lift=Math.min(1,(t-.28)/.55);pickup.object.position.lerp(pickupHand,1-Math.exp(-dt*7));pickup.object.rotation.z=THREE.MathUtils.damp(pickup.object.rotation.z,-lift*.65,5,dt)}
 if(t>=1){hasArm=true;removeObject(pickup.object);pickup=null;originalJaws.forEach(({jaw,side})=>jaw.position.x=-.3+side*.1);updateInventory();refreshDirective();saveProgress();playSound('collect');notify('MANIPULATOR STORED · I TO INSPECT')}
}

// Existing broad fill lights are retired; visible luminaires own the room lighting.
scene.traverse(o=>{if(o.isLight&&o!==opticLight&&o!==armGlow)o.intensity=0});
const ambient=new THREE.HemisphereLight(0x827d79,0x211b20,.12);scene.add(ambient);
keyLight.intensity=.08;
scene.background.set(0x08090c);scene.fog.color.set(0x08090c);
const oldEmitters=new Map();scene.traverse(o=>{if(o.isMesh){for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m.emissiveIntensity>0&&!oldEmitters.has(m)){oldEmitters.set(m,m.emissiveIntensity);m.emissiveIntensity=.08}}});
// Dollhouse roof treatment: retain the high industrial silhouette without hiding the unit.
scene.updateMatrixWorld(true);
const roofMaterials=new Map(),roofPosition=new THREE.Vector3();
scene.traverse(o=>{
 if(!o.isMesh||Array.isArray(o.material)||o.material.transparent||(o.material.emissive?.getHex()>0&&o.material.emissiveIntensity>.1))return;
 o.getWorldPosition(roofPosition);if(roofPosition.y<5.5)return;
 if(!roofMaterials.has(o.material)){const m=o.material.clone();m.transparent=true;m.opacity=.16;m.depthWrite=false;roofMaterials.set(o.material,m)}
 o.material=roofMaterials.get(o.material);o.children.forEach(c=>{if(c.isLineSegments)c.visible=false});
});
const workFixtures=[],redFixtures=[];
function workLamp(x,y,z,color,intensity){
 for(const dx of [-.55,.55])cylinder(scene,.022,.022,7-y,doorFrame,x+dx,(7+y)/2,z);
 const housing=box(scene,1.55,.18,.52,doorFrame,x,y,z);
 const material=new THREE.MeshStandardMaterial({color:0xd5d7c4,emissive:color,emissiveIntensity:0});
 box(scene,1.28,.045,.34,material,x,y-.115,z,false);
 const light=new THREE.PointLight(color,0,12,2);light.position.set(x,y-.35,z);scene.add(light);
 workFixtures.push({light,material,intensity});
}
for(const [x,y,z,c,i] of [[-9,4.5,6,0xffd6a0,36],[6,4.7,5,0xffd6a0,38],[-7,4.7,-4,0xffd6a0,35],[5,4.6,-7,0xc5e5e8,42],[11.4,4,-9.5,0xe9edcc,35],[0,5,-1,0xe4dfbd,38]])workLamp(x,y,z,c,i);
for(const [x,z] of [[-13.4,5],[-13.4,-5],[0,-10.5],[10,-10.5]]){
 const material=new THREE.MeshStandardMaterial({color:0xa6190d,emissive:0xff1608,emissiveIntensity:2.4});
 box(scene,.36,.25,.15,doorFrame,x,2.8,z);box(scene,.25,.14,.04,material,x,2.8,z+.10,false);
 const light=new THREE.PointLight(0xff2410,14,10,2);light.position.set(x,2.7,z+.45);scene.add(light);redFixtures.push({light,material});
}
// Low repair-bay emergency strip replaces the removed freestanding beacon.
{
 const material=new THREE.MeshStandardMaterial({color:0xa6190d,emissive:0xff1608,emissiveIntensity:2.4});
 box(scene,.48,.10,.28,doorFrame,-9.4,.13,4.3);box(scene,.36,.03,.18,material,-9.4,.20,4.3,false);
 const light=new THREE.PointLight(0xff3c1b,14,8,2);light.position.set(-9.4,1.15,4.3);scene.add(light);redFixtures.push({light,material});
}
// Low repair-bay rails and floor markings preserve open walking routes.
for(const x of [-11.9,-7.2]){box(scene,.12,.1,3.1,hazardPaint,x,.12,6.5);for(const z of [5.1,7.9])box(scene,.18,.7,.18,deckSteel,x,.35,z)}
for(const z of [4.9,8.1])box(scene,4.8,.06,.1,hazardPaint,-9.55,.12,z);
label(scene,'REPAIR BAY',-9.5,.16,8.2,0,1.1,0xc9ae75).rotation.x=-Math.PI/2;
box(scene,3.7,.06,2.8,deckSteel,5,.08,-7);
for(const x of [3.1,6.9])box(scene,.13,3.8,.25,ivory,x,1.9,-8.5);
// The old floating CONTROL label was removed with the obsolete control-alcove props.
label(scene,'EXIT B-7',11.4,3.6,-10.15,0,.7,0xe9d7a4);
function setStationPower(value){
 if(value===powerOn)return;
 powerOn=value;powerElapsed=value?0:10;generatorLever.rotation.z=value?.75:0;
 terminalScreen.material=terminalLamp.material=value?terminalLit:terminalDark;
 if(!value){terminalBooted=false;terminalUI.powerOff();}
 playSound(value?'power':'servo');saveProgress();
}
function updateLighting(dt){
 powerElapsed+=dt;
 // Staggered ignition dips once per fitting; no repeated full-screen strobe.
 workFixtures.forEach((f,i)=>{
  const t=powerElapsed-i*.18;
  const level=!powerOn||t<0?0:reducedMotion?Math.min(1,t/1.5):t<.16?.65:t<.38?.08:t<.65?.85:t<.82?.35:Math.min(1,(t-.82)*2+.6);
  f.light.intensity=f.intensity*level;f.material.emissiveIntensity=level*3.5;
 });
 const red=powerOn?.14:1;
 redFixtures.forEach(f=>{f.light.intensity=14*red;f.material.emissiveIntensity=2.4*red});
 ambient.intensity=powerOn?.24:.18;keyLight.intensity=powerOn?.18:.1;
}

// Synthesised quiet mechanical sounds; audio starts only after a user gesture.
let audio=null,audioMaster=null,hum=null,humGain=null,soundEnabled=true;
const SETTINGS_KEY='saturn-station-0.2-settings-v1';
let musicVolume=35,brightness=100,settingsWasPaused=false;
try{const saved=JSON.parse(localStorage.getItem(SETTINGS_KEY));if(saved){if(Number.isFinite(saved.music))musicVolume=THREE.MathUtils.clamp(saved.music,0,100);if(Number.isFinite(saved.brightness))brightness=THREE.MathUtils.clamp(saved.brightness,50,180)}}catch{}
const musicToggle=document.createElement('button');musicToggle.id='menu-music-toggle';musicToggle.style.cssText='position:fixed;right:18px;bottom:18px;z-index:240;width:42px;height:42px;padding:9px;background:#101b20b3;color:#e7eedb;border:1px solid #8d9c8466;border-radius:50%;cursor:pointer';document.body.append(musicToggle);
const backgroundMusic=createBackgroundMusic({volume:musicVolume/100,active:true,onState(state){
 musicToggle.hidden=state==='inactive';const enabled=state!=='muted';musicToggle.setAttribute('aria-label',enabled?'Mute menu music':'Unmute menu music');musicToggle.setAttribute('aria-pressed',String(enabled));musicToggle.title=enabled?'Mute menu music':'Unmute menu music';
 musicToggle.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M11 5 6 9H3v6h3l5 4Z"/>'+(enabled?'<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>':'<path d="m16 9 6 6m0-6-6 6"/>')+'</svg>';
}});
musicToggle.addEventListener('click',()=>{backgroundMusic.setEnabled(!backgroundMusic.enabled);backgroundMusic.unlock()});
const settingsPanel=document.createElement('dialog');settingsPanel.id='game-settings';settingsPanel.setAttribute('aria-labelledby','settings-title');
settingsPanel.innerHTML='<form method="dialog"><header><div><small>MU-1 / PREFERENCES</small><h1 id="settings-title">SETTINGS</h1></div><button aria-label="Close settings" value="close">×</button></header><label for="music-volume">MUSIC <output id="music-value" for="music-volume"></output></label><input id="music-volume" type="range" min="0" max="100" step="1"><p>Ambient station score. Set to zero to mute music.</p><label for="game-brightness">BRIGHTNESS <output id="brightness-value" for="game-brightness"></output></label><input id="game-brightness" type="range" min="50" max="180" step="5"><p>Adjusts the scene while keeping emergency and working lights distinct.</p><footer><span>Saved automatically on this device.</span><button value="done">DONE</button></footer></form>';
document.body.append(settingsPanel);
const musicSlider=settingsPanel.querySelector('#music-volume'),brightnessSlider=settingsPanel.querySelector('#game-brightness');
function applySettings(){
 renderer.toneMappingExposure=1.15*brightness/100;
 musicSlider.value=String(musicVolume);brightnessSlider.value=String(brightness);
 settingsPanel.querySelector('#music-value').textContent=musicVolume+'%';settingsPanel.querySelector('#brightness-value').textContent=brightness+'%';
 backgroundMusic.setVolume(musicVolume/100);
}
function persistSettings(){try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({music:musicVolume,brightness}))}catch{}}
musicSlider.addEventListener('input',()=>{musicVolume=Number(musicSlider.value);unlockAudio();applySettings();persistSettings()});
brightnessSlider.addEventListener('input',()=>{brightness=Number(brightnessSlider.value);applySettings();persistSettings()});
function openSettings(){settingsWasPaused=paused;setPaused(true);settingsPanel.showModal();musicSlider.focus()}
settingsPanel.addEventListener('close',()=>{setPaused(settingsWasPaused)});
settingsPanel.addEventListener('cancel',e=>{e.preventDefault();settingsPanel.close()});
const settingsButton=document.createElement('button');settingsButton.id='settings-button';settingsButton.textContent='SETTINGS';settingsButton.addEventListener('click',openSettings);document.querySelector('.top-right').append(settingsButton);
const pauseSettings=document.createElement('button');pauseSettings.textContent='SETTINGS';pauseSettings.addEventListener('click',openSettings);document.querySelector('#resume-game').after(pauseSettings);
applySettings();
const soundButton=document.createElement('button');soundButton.id='sound-toggle';soundButton.textContent=soundEnabled?'SOUND ON':'SOUND OFF';soundButton.setAttribute('aria-pressed',String(soundEnabled));
document.querySelector('.top-right').append(soundButton);
function unlockAudio(){
 if(!soundEnabled)return;
 backgroundMusic.unlock();
 try{if(!audio){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audio=new Audio();audioMaster=audio.createGain();audioMaster.gain.value=.13;audioMaster.connect(audio.destination);hum=audio.createOscillator();hum.type='sine';hum.frequency.value=55;humGain=audio.createGain();humGain.gain.value=.035;hum.connect(humGain).connect(audioMaster);hum.start();
 }if(audio.state==='suspended')audio.resume().catch(()=>{})}catch{}
}
window.addEventListener('click',unlockAudio);window.addEventListener('pointerdown',unlockAudio);window.addEventListener('keydown',unlockAudio);
soundButton.addEventListener('click',()=>{soundEnabled=!soundEnabled;backgroundMusic.setEnabled(soundEnabled);soundButton.textContent=soundEnabled?'SOUND ON':'SOUND OFF';soundButton.setAttribute('aria-pressed',String(soundEnabled));if(soundEnabled)unlockAudio();if(audioMaster)audioMaster.gain.setTargetAtTime(soundEnabled?.13:0,audio.currentTime,.05)});
document.addEventListener('visibilitychange',()=>{if(audioMaster)audioMaster.gain.setTargetAtTime(soundEnabled&&!document.hidden?.13:0,audio.currentTime,.08);if(document.hidden)saveProgress()});
function playSound(kind){
 if(!audio||!soundEnabled||audio.state!=='running')return;
 const now=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();
 const tones={step:[90,42,.1],servo:[180,75,.5],collect:[390,780,.22],equip:[150,310,.2],power:[45,115,1.7],select:[540,620,.07],'terminal-key':[320,210,.025],'terminal-boot':[65,420,1.6],'terminal-ready':[660,990,.18],'terminal-denied':[170,75,.22]};
 const [a,b,d]=tones[kind]||tones.select;o.type=kind==='terminal-key'?'square':kind==='step'?'triangle':'sine';o.frequency.setValueAtTime(a,now);o.frequency.exponentialRampToValueAtTime(b,now+d);g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(kind==='terminal-key'?.06:kind==='step'?.4:.22,now+.015);g.gain.exponentialRampToValueAtTime(.001,now+d);o.connect(g).connect(audioMaster);o.start(now);o.stop(now+d+.02);o.onended=()=>{o.disconnect();g.disconnect()};
}
function saveProgress(){
 if(opening?.active||mainMenu?.active)return;
 if(resettingProgress)return;
 try{const progress={version:1,charge,hasArm,armEquipped,caseOpen,caseCellTaken,hasNote,hasCell,usedCell,cellCount,workshop:workshop.serialize(),powerOn,doorOpen,terminalBooted,x:robot.position.x,z:robot.position.z,heading:robot.rotation.y};if(mainMenu)mainMenu.record(progress);else localStorage.setItem(SAVE_KEY,JSON.stringify(progress));return true}catch{return false}
}
function restoreProgress(){
 try{
  const p=JSON.parse(localStorage.getItem(SAVE_KEY));if(!p||p.version!==1)return;
  const flag=k=>p[k]===true;
  hasNote=flag('hasNote');if(hasNote)removeObject(maintenanceNote);hasArm=flag('hasArm');armEquipped=hasArm&&flag('armEquipped');caseOpen=flag('caseOpen');caseCellTaken=flag('caseCellTaken')||flag('hasCell')||flag('usedCell');setCellCount(Number.isInteger(p.cellCount)?p.cellCount:(flag('hasCell')&&!flag('usedCell')?1:0));workshop.restore(p.workshop);
  charge=Number.isFinite(p.charge)?THREE.MathUtils.clamp(p.charge,1,100):60;
  if(Number.isFinite(p.x)&&Number.isFinite(p.z))robot.position.set(THREE.MathUtils.clamp(p.x,-12.5,12.5),0,THREE.MathUtils.clamp(p.z,-9.5,9.5));
  if(Number.isFinite(p.heading))robot.rotation.y=p.heading;
  if(!canOccupy(robot.position.x,robot.position.z))robot.position.set(0,0,0);
  if(hasArm)removeObject(arm);lidPivot.rotation.x=caseOpen?-1.35:0;cell.visible=caseOpen&&!caseCellTaken;
  powerOn=flag('powerOn');powerElapsed=10;generatorLever.rotation.z=powerOn?.75:0;terminalScreen.material=terminalLamp.material=powerOn?terminalLit:terminalDark;
  terminalBooted=powerOn&&flag('terminalBooted');doorOpen=flag('doorOpen');leftLeaf.position.x=doorOpen?-1.85:0;rightLeaf.position.x=doorOpen?1.85:0;
  controls.target.set(robot.position.x,1.3,robot.position.z);camera.position.set(robot.position.x+12,16,robot.position.z+12);notify('LOCAL PROGRESS RESTORED');
 }catch{}
}
window.addEventListener('pagehide',saveProgress);
function updateStationSystems(dt){
 const active=!paused&&!ended&&!terminalOpen&&!inventory.classList.contains('open')&&!workshop.isOpen&&!devConsole.classList.contains('open');
 terminalUI.update(dt);updateLighting(dt);animatePickup(dt);stationArt.updateOcclusion(camera,dt);
 if(active){systemTime+=dt;saveElapsed+=dt;stepElapsed+=dt;if(gaitVelocity>.35&&!pickup&&stepElapsed>.56){playSound('step');stepElapsed=0}if(saveElapsed>2){saveElapsed=0;saveProgress()}}
 if(humGain&&audio)humGain.gain.setTargetAtTime(active?(powerOn?.16:.035):0,audio.currentTime,.25);
}

// Robot centre uses a 0.42-unit clearance around solid floor props.
const solidProps=referenceAssets.colliders;
function canOccupy(x,z){
 if(x< -12.5||x>12.5||z< -9.5||z>9.5)return false;
 return !solidProps.some(([px,pz,hx,hz])=>Math.abs(x-px)<hx+.42&&Math.abs(z-pz)<hz+.42);
}
function moveRobot(dx,dz){
 // Separate axes let the unit slide along an obstacle rather than sticking.
 if(canOccupy(robot.position.x+dx,robot.position.z))robot.position.x+=dx;
 if(canOccupy(robot.position.x,robot.position.z+dz))robot.position.z+=dz;
}
function animate(){requestAnimationFrame(animate);const elapsed=clock.getDelta();const dt=Math.min(elapsed,.04);if(mainMenu?.active)return;referenceAssets.update(paused||ended?0:dt,powerOn,reducedMotion,!!pickup&&pickup.time>.53);if(opening?.active){controls.enabled=false;if(!paused)opening.update(elapsed);renderer.render(scene,opening.camera);return;}controls.enabled=!firstPerson&&!inventory.classList.contains('open')&&!workshop.isOpen&&!paused&&!devConsole.classList.contains('open')&&!terminalOpen;// Keep MU-1 in view instead of orbiting the empty centre of the expanded chamber.
const desiredFocus=new THREE.Vector3(robot.position.x-(workshop.isOpen?1.6:0),1.25,robot.position.z);
const followDelta=desiredFocus.sub(controls.target).multiplyScalar(1-Math.exp(-dt*4));
controls.target.add(followDelta);camera.position.add(followDelta);
controls.update();if(inventory.classList.contains('open')){renderInventoryPreview();renderItemInspection(dt)}if(!paused&&!ended&&!terminalOpen&&!inventory.classList.contains('open')&&!devConsole.classList.contains('open')){let mx=(keys.d?1:0)-(keys.a?1:0),mz=(keys.s?1:0)-(keys.w?1:0);if(firstPerson){const f=-mz,r=mx;mx=Math.sin(lookHeading)*f+Math.cos(lookHeading)*r;mz=Math.cos(lookHeading)*f-Math.sin(lookHeading)*r;}const len=Math.hypot(mx,mz);const wantsMove=len>0&&!pickup&&!workshop.isOpen;
const targetSpeed=wantsMove?2.25*Math.max(.72,1-(workshop.mass()+cellCount*1.8)*.006):0;
// Inertial acceleration and braking make the chassis feel mechanically heavy.
gaitVelocity=THREE.MathUtils.damp(gaitVelocity,targetSpeed,wantsMove?6.2:8.5,dt);
gaitWeight=THREE.MathUtils.damp(gaitWeight,wantsMove?1:0,wantsMove?3.0:5.0,dt);
if(wantsMove){
 moveRobot(mx/len*gaitVelocity*dt,mz/len*gaitVelocity*dt);
 const desiredHeading=firstPerson?lookHeading:Math.atan2(mx,mz);
 robot.rotation.y+=Math.atan2(Math.sin(desiredHeading-robot.rotation.y),Math.cos(desiredHeading-robot.rotation.y))*Math.min(1,dt*9);
}
walkTime+=dt*4.8*(gaitVelocity/1.5);
animateGait(dt,gaitWeight>.06);
interactionPulse=Math.max(0,interactionPulse-dt*2.7);
const reach=pickup?Math.sin(Math.min(1,pickup.time/1.9)*Math.PI):Math.sin((1-interactionPulse)*Math.PI)*Math.min(1,interactionPulse*2);
const working=armEquipped?mountedArm:originalArm;
const tinkering=workshop.isOpen&&!paused?Math.sin(performance.now()*.009):0;
originalArm.rotation.x=THREE.MathUtils.damp(originalArm.rotation.x,working===originalArm?(-reach*.9-tinkering*.3):0,11,dt);
originalArm.rotation.z=THREE.MathUtils.damp(originalArm.rotation.z,working===originalArm?-reach*.3:0,11,dt);
mountedArm.rotation.x=THREE.MathUtils.damp(mountedArm.rotation.x,working===mountedArm?(-reach*1.1-tinkering*.45):0,11,dt);
mountedArm.rotation.z=THREE.MathUtils.damp(mountedArm.rotation.z,working===mountedArm?(reach*.3+tinkering*.15):0,11,dt);
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
if(!paused&&!ended&&!workshop.isOpen&&!godMode&&charge>0){charge=Math.max(0,charge-dt*.1);updateCharge();if(charge===0){notify('POWER DEPLETED');triggerDeath()}}
if(doorOpening&&!doorOpen){const t=Math.min(1,(performance.now()-hatch.userData.openStarted)/1150);leftLeaf.position.x=-1.85*t;rightLeaf.position.x=1.85*t;if(t>=1){doorOpening=false;doorOpen=true;updateTerminalStatus();task.textContent='Exit door open. Terminal remains available.';notify('DOOR OPEN')}}
if(firstPerson){firstPersonCamera.position.set(robot.position.x,2.15,robot.position.z);firstPersonCamera.lookAt(robot.position.x+Math.sin(lookHeading)*Math.cos(lookPitch),2.15+Math.sin(lookPitch),robot.position.z+Math.cos(lookHeading)*Math.cos(lookPitch));}
doorAccessProbe.visible=workshop.hasProbe;workshop.update(dt);updateStationSystems(dt);renderer.render(scene,activeCamera());updateNearbyUI()}
opening=createMakerOpening({scene,robot,leftLeaf,rightLeaf,viewport,isSoundEnabled:()=>soundEnabled,onComplete(){setPaused(false);restoreProgress();if(menuLaunch?.mode!=='resume'){doorOpen=false;doorOpening=false;leftLeaf.position.x=rightLeaf.position.x=0;}updateTerminalStatus();updateInventory();updateCharge();Object.keys(keys).forEach(k=>keys[k]=false);refreshDirective();}});
mainMenu=createMainMenu({saveCurrent:saveProgress,sound:playSound,unlockAudio});
const returnMenuButton=document.createElement('button');returnMenuButton.textContent='MAIN MENU';returnMenuButton.addEventListener('click',()=>{hideTerminal();closeInventory();saveProgress();setPaused(true);mainMenu.show()});document.querySelector('#pause-restart').after(returnMenuButton);
if(menuLaunch?.mode==='resume')opening.skip();else if(!menuLaunch)mainMenu.show();
resize();updateStationSystems(0);animate();document.querySelector('#loading').classList.add('hidden');document.querySelector('#charge').textContent='60%';document.querySelector('#charge-bar').style.width='60%';updateCharge();updateInventory();refreshDirective();say('MU-1 ONLINE.');

