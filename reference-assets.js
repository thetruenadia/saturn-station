export const ROOM_COLLIDERS=[[-5,2,1,.73],[5,-7,1.15,.55],[-7,-4,1.1,.6],[-9,2.2,1.05,.9],[9.8,4.8,1.05,.9],[10,-3.5,.95,.85],[-10.5,-6.6,.9,.8]];
// Reference-led procedural assets for prototype 0.2. Gameplay groups remain stable.
export function stepFloorBody(body,dt){
 const step=Math.min(Math.max(dt,0),.04);if(body.sleeping)return;
 body.velocity-=12*step;body.height+=body.velocity*step;
 if(body.height<=body.floor){body.height=body.floor;body.velocity=-body.velocity*.08;if(Math.abs(body.velocity)<.12){body.velocity=0;body.sleeping=true}}
}
export function installReferenceAssets({THREE,scene,cell,caseGroup,lidPivot,hatch,hatchDoor,leftLeaf,rightLeaf,mountedArm,arm,box,cylinder,wornPaint,stationArt,generator,generatorLever}){
 const makeMat=(color,roughness=.8,metalness=.25)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const olive=wornPaint(0x84917d,617),cream=wornPaint(0xb7b59d,619),steel=makeMat(0x59656a,.55,.7),black=makeMat(0x20292a,.7,.5),copper=makeMat(0xac6031,.5,.7),yellow=wornPaint(0xc4ab49,623),blue=wornPaint(0x597c7b,629);
 const indicators=[],rotors=[],reciprocators=[],workLights=[],powerDisplays=[];
 const group=(name,x=0,y=0,z=0,parent=scene)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g};
 const B=(p,w,h,d,m,x=0,y=0,z=0)=>box(p,w,h,d,m,x,y,z);
 const C=(p,r,h,m,x=0,y=0,z=0,rx=0,rz=0)=>cylinder(p,r,r,h,m,x,y,z,rx,rz);
 function beam(p,a,b,r,m){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=bv.clone().sub(av),o=C(p,r,d.length(),m);o.position.copy(av).add(bv).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());return o}
 function cable(p,points,r=.025,m=black){const path=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)));const o=new THREE.Mesh(new THREE.TubeGeometry(path,22,r,6,false),m);p.add(o);return o}
 function ring(p,r,t,m,x,y,z){const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,24),m);o.position.set(x,y,z);p.add(o);return o}
 function plaque(p,text,x,y,z,w=.6,h=.16,bg='#283230',ink='#d5d3b6'){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=ink;ctx.font='bold 36px monospace';ctx.textAlign='center';ctx.fillText(text,256,78,480);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:tex,roughness:.9}));o.position.set(x,y,z);p.add(o);return o;
 }
 function lamp(p,x,y,z,color=0x83c69c){const m=new THREE.MeshStandardMaterial({color:0x25362d,emissive:color,emissiveIntensity:0});const o=B(p,.07,.055,.025,m,x,y,z);indicators.push(m);return o}
 function gauge(p,x,y,z,r=.13){C(p,r,.045,black,x,y,z,Math.PI/2);C(p,r*.8,.052,cream,x,y,z+.01,Math.PI/2);const pivot=group('gauge-needle',x,y,z+.045,p);B(pivot,.012,r*.95,.01,black,0,r*.26,0);indicators.push({needle:pivot});}
 function rounded(p,w,h,d,r,m,x=0,y=0,z=0){const s=new THREE.Shape(),l=-w/2,b=-h/2;s.moveTo(l+r,b);s.lineTo(l+w-r,b);s.quadraticCurveTo(l+w,b,l+w,b+r);s.lineTo(l+w,b+h-r);s.quadraticCurveTo(l+w,b+h,l+w-r,b+h);s.lineTo(l+r,b+h);s.quadraticCurveTo(l,b+h,l,b+h-r);s.lineTo(l,b+r);s.quadraticCurveTo(l,b,l+r,b);const o=new THREE.Mesh(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:2,steps:1}),m);o.position.set(x,y,z-d/2);o.castShadow=o.receiveShadow=true;p.add(o);return o}
 // 01: CubeSat-style cartridge: exposed copper winding, amber circuit enclosure, black rails.
 cell.clear();cell.rotation.set(0,0,0);cell.name='cubesat-fuel-cell';
 const amber=new THREE.MeshStandardMaterial({color:0xc9a04f,roughness:.4,metalness:.12,transparent:true,opacity:.88});
 rounded(cell,.93,.46,.63,.045,amber,0,0,0);B(cell,.66,.025,.51,makeMat(0x305745),0,.15,0);
 const coilCanvas=document.createElement('canvas');coilCanvas.width=256;coilCanvas.height=64;const cc=coilCanvas.getContext('2d');cc.fillStyle='#ae6536';cc.fillRect(0,0,256,64);for(let x=0;x<256;x+=8){cc.fillStyle='#e3a46a';cc.fillRect(x,0,3,64);cc.fillStyle='#543a29';cc.fillRect(x+6,0,2,64)}
 const coilTex=new THREE.CanvasTexture(coilCanvas);coilTex.colorSpace=THREE.SRGBColorSpace;const coilMat=new THREE.MeshStandardMaterial({map:coilTex,metalness:.65,roughness:.4});
 for(let i=0;i<4;i++){C(cell,.057,.57,coilMat,-.3+i*.20,.27,0,Math.PI/2);}
 for(const x of [-.52,.52]){B(cell,.075,.64,.79,black,x,0,0);for(const z of [-.34,.34]){B(cell,1.1,.06,.06,black,0,-.28,z);C(cell,.018,.025,steel,x,.22,z,Math.PI/2);C(cell,.018,.025,steel,x,-.20,z,Math.PI/2);}}
 for(const x of [-.43,.43])B(cell,.1,.055,.78,black,x,.32,0);
 for(const x of [-.23,0,.23]){B(cell,.15,.055,.025,black,x,-.12,.334);B(cell,.11,.018,.03,steel,x,-.12,.353);}
 plaque(cell,'FC-55 / ENERGY MODULE',0,.10,.337,.61,.105);lamp(cell,.35,.08,.342);cell.visible=false;
 // 02: hinged military electronics case. Retain the actual lid pivot and collectible cell.
 caseGroup.clear();caseGroup.add(lidPivot,cell);lidPivot.clear();
 const casePaint=wornPaint(0x59696b,631);rounded(caseGroup,1.86,.72,1.34,.08,casePaint,0,.37,0);
 B(caseGroup,1.58,.045,1.08,black,0,.75,0);B(caseGroup,1.18,.08,.86,black,0,.76,0);
 for(const x of [-.78,.78]){B(caseGroup,.075,.68,1.39,steel,x,.38,0);for(const z of [-.58,.58])C(caseGroup,.032,.04,steel,x,.22,z,Math.PI/2);}
 for(const x of [-.43,.43]){rounded(caseGroup,.65,.40,.04,.025,casePaint,x,.39,.70);B(caseGroup,.46,.055,.07,steel,x,.46,.76);B(caseGroup,.07,.17,.06,black,x-.22,.40,.75);B(caseGroup,.07,.17,.06,black,x+.22,.40,.75);plaque(caseGroup,'SEALED / B7',x,.29,.734,.39,.08);}
 for(const x of [-.66,.66]){B(caseGroup,.13,.22,.08,steel,x,.77,.70);B(caseGroup,.055,.10,.095,black,x,.76,.755);}
 for(const y of [.28,.53])C(caseGroup,.074,.07,black,-.96,y,.27,0,Math.PI/2);
 rounded(lidPivot,1.91,.15,1.38,.04,casePaint,0,.06,.58);for(const x of [-.80,.80])B(lidPivot,.08,.19,1.37,steel,x,.06,.58);
 plaque(lidPivot,'SERVICE CARTRIDGE / 55',0,.065,1.29,.95,.09);cell.position.set(0,.93,0);
 // Power distribution: yellow-green analogue instrumentation, mechanical lever and amber scope.
 if(generator&&generatorLever){
  generator.clear();generator.add(generatorLever);generatorLever.position.set(-.70,1.40,.64);
  const enamel=wornPaint(0x9caa61,701);B(generator,2.30,.18,1.04,black,0,.12,0);rounded(generator,2.17,3.24,.76,.13,enamel,0,1.82,0);
  B(generator,2.04,.06,.06,steel,0,2.08,.42);B(generator,.065,3.06,.06,steel,.08,1.82,.43);
  for(const x of [-.78,-.37]){rounded(generator,.29,.72,.035,.025,black,x,2.82,.43);for(let row=0;row<5;row++)for(let col=0;col<3;col++)B(generator,.055,.065,.025,cream,x-.08+col*.08,2.55+row*.12,.47);}
  gauge(generator,-.67,1.02,.47,.19);gauge(generator,-.25,1.02,.47,.16);gauge(generator,-.44,.58,.47,.14);
  for(const x of [.35,.67]){gauge(generator,x,2.92,.47,.11);C(generator,.045,.055,black,x,2.55,.48,Math.PI/2);}
  const scopeMat=new THREE.MeshStandardMaterial({color:0x4b3d1b,emissive:0xe4a82c,emissiveIntensity:0,roughness:.25});C(generator,.41,.08,scopeMat,.57,1.72,.47,Math.PI/2);ring(generator,.45,.065,enamel,.57,1.72,.52);powerDisplays.push(scopeMat);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;C(generator,.025,.04,black,.57+Math.sin(a)*.52,1.72+Math.cos(a)*.52,.50,Math.PI/2);}
  for(let i=0;i<5;i++)B(generator,.65,.025,.04,black,.57,.50+i*.075,.45);
  plaque(generator,'AUXILIARY GRID / CONTROL',0,3.32,.44,1.50,.12);plaque(generator,'MECHANICAL ISOLATOR',-.52,1.87,.45,.74,.085);lamp(generator,.88,2.53,.46);
 }
 // 03: pressure bulkhead. Leaves retain their original slide transforms and opening controls.
 hatch.clear();hatch.add(hatchDoor);leftLeaf.clear();rightLeaf.clear();
 const doorPaint=wornPaint(0xb3b59e,641),doorMetal=wornPaint(0x67716c,643);
 B(hatch,4.35,.40,.62,doorMetal,0,3.36,0);B(hatch,4.35,.17,.8,black,0,.13,0);
 const stripeCanvas=document.createElement('canvas');stripeCanvas.width=256;stripeCanvas.height=64;const sx=stripeCanvas.getContext('2d');sx.fillStyle='#b9ae72';sx.fillRect(0,0,256,64);sx.fillStyle='#39403c';for(let i=-64;i<320;i+=64){sx.beginPath();sx.moveTo(i,0);sx.lineTo(i+32,0);sx.lineTo(i-32,64);sx.lineTo(i-64,64);sx.closePath();sx.fill();}const stripeTex=new THREE.CanvasTexture(stripeCanvas);stripeTex.colorSpace=THREE.SRGBColorSpace;const stripe=new THREE.MeshStandardMaterial({map:stripeTex,roughness:.9});
 B(hatch,4.1,.27,.04,stripe,0,3.33,.34);
 for(const side of [-1,1]){B(hatch,.29,3.1,.65,doorMetal,side*2.02,1.73,0);C(hatch,.10,2.45,black,side*1.88,1.75,.40);for(const y of [.64,1.08,2.48,2.87])C(hatch,.15,.16,steel,side*1.88,y,.40);}
 for(const [leaf,side] of [[leftLeaf,-1],[rightLeaf,1]]){B(leaf,1.78,2.91,.29,doorPaint,side*.94,1.72,0);B(leaf,1.56,2.60,.035,cream,side*.94,1.72,.17);B(leaf,.10,2.93,.06,black,side*.07,1.72,.19);for(const y of [.36,3.06])B(leaf,1.70,.11,.10,doorMetal,side*.94,y,.22);for(const y of [.55,2.87])for(const x of [.25,1.64])C(leaf,.032,.035,steel,side*x,y,.245,Math.PI/2);}
 const latch=group('bulkhead-lock',-.2,1.65,.25,leftLeaf);rounded(latch,.74,.78,.14,.12,doorMetal);C(latch,.23,.06,black,0,0,.12,Math.PI/2);C(latch,.16,.08,steel,0,0,.17,Math.PI/2);for(const y of [-.22,.22])B(latch,.55,.07,.10,cream,0,y,.18);plaque(hatch,'PRESSURE SEAL / B-7',0,2.75,.24,.86,.12);
 // 04: articulated floor work arm replaces both repeated benches.
 const workArm=group('large-work-arm',-9,0,2.2);B(workArm,2.0,.18,1.65,black,0,.12,0);for(const x of [-.72,.72])for(const z of [-.55,.55]){B(workArm,.18,.18,.19,yellow,x,.28,z);C(workArm,.04,.04,steel,x,.39,z);}
 C(workArm,.62,.48,olive,0,.42,0);C(workArm,.63,.08,black,0,.70,0);
 const swivel=group('work-arm-swivel',0,.76,0,workArm);const shoulder=group('work-arm-shoulder',0,.32,0,swivel);
 C(shoulder,.39,.62,steel,0,0,0,0,Math.PI/2);C(shoulder,.31,.69,olive,0,0,0,0,Math.PI/2);
 const upper=group('work-arm-upper',0,0,0,shoulder);rounded(upper,.48,1.65,.52,.14,olive,0,.80,0);beam(upper,[.31,.16,0],[.31,1.40,0],.065,steel);
 const elbow=group('work-arm-elbow',0,1.65,0,upper);C(elbow,.30,.70,olive,0,0,0,0,Math.PI/2);
 const fore=group('work-arm-fore',0,0,0,elbow);rounded(fore,.35,1.50,.38,.10,olive,0,.75,0);beam(fore,[-.24,.10,0],[-.24,1.30,0],.045,steel);
 const wrist=group('work-arm-tool',0,1.50,0,fore);C(wrist,.20,.34,black,0,.1,0);for(const side of [-1,1]){B(wrist,.07,.30,.09,steel,side*.14,.38,0);B(wrist,.13,.05,.10,steel,side*.10,.52,0);}
 cable(upper,[[.32,0,-.28],[.45,.6,-.35],[.35,1.5,-.25]],.035);cable(fore,[[.22,0,-.2],[.35,.8,-.3],[.20,1.5,-.15]],.027);plaque(workArm,'ROBOTIC SERVICE / 04',0,.43,.51,.75,.12);lamp(workArm,.32,.56,.52);
 shoulder.rotation.z=-1.061;elbow.rotation.z=-1.839;wrist.rotation.z=.8;
 // Recoverable arm follows the preceding olive industrial reference, without its ceiling rail.
 mountedArm.clear();rounded(mountedArm,.36,.32,.40,.06,olive,0,-.08,0);C(mountedArm,.23,.42,steel,0,-.23,0,Math.PI/2);
 rounded(mountedArm,.24,.56,.25,.06,olive,.12,-.57,0);C(mountedArm,.18,.33,steel,.22,-.84,0,Math.PI/2);rounded(mountedArm,.21,.39,.22,.05,olive,.26,-1.08,0);
 for(const side of [-1,1]){B(mountedArm,.06,.25,.09,steel,.26+side*.11,-1.40,.02);B(mountedArm,.11,.05,.10,black,.26+side*.08,-1.52,.02);}
 beam(mountedArm,[-.09,-.32,-.08],[.10,-.81,-.08],.035,steel);cable(mountedArm,[[-.13,-.14,-.2],[-.21,-.65,-.25],[.14,-1.1,-.2],[.25,-1.33,-.16]],.025);
 arm.clear();const recovered=mountedArm.clone(true);recovered.visible=true;recovered.position.set(-.42,.33,0);recovered.rotation.z=Math.PI/2;recovered.scale.setScalar(.72);arm.add(recovered);
 // The claw rests the heavy attachment on the deck; no invisible pedestal or hovering pickup.
 scene.updateMatrixWorld(true);const heldPoint=wrist.localToWorld(new THREE.Vector3(0,.34,0));arm.position.copy(heldPoint);arm.rotation.set(0,0,0);arm.updateMatrixWorld(true);
 const pickupBounds=new THREE.Box3().setFromObject(recovered);arm.position.y+=.09-pickupBounds.min.y;arm.updateMatrixWorld(true);
 arm.userData.x=arm.position.x;arm.userData.z=arm.position.z;
 let armHeld=true;const armBody={height:arm.position.y,velocity:0,floor:arm.position.y,sleeping:true};
 function releaseArm(){armHeld=false;armBody.height=arm.position.y+.035;armBody.velocity=-.12;armBody.sleeping=false;}

 // 05/06: chamfered ship viewport and the user's Enceladus photograph.
 const windowGroup=group('enceladus-observation-window',5,4.35,-10.52);const w=7.7,h=3.9,ch=.58;
 function octagon(width,height,c){return [[-width/2+c,-height/2],[width/2-c,-height/2],[width/2,-height/2+c],[width/2,height/2-c],[width/2-c,height/2],[-width/2+c,height/2],[-width/2,height/2-c],[-width/2,-height/2+c]];}
 function path(points,Type){const p=new Type();p.moveTo(...points[0]);points.slice(1).forEach(v=>p.lineTo(...v));p.closePath();return p;}
 const outer=path(octagon(w,h,ch),THREE.Shape);outer.holes.push(path(octagon(w-.42,h-.42,ch-.12).reverse(),THREE.Path));
 const frame=new THREE.Mesh(new THREE.ExtrudeGeometry(outer,{depth:.25,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:2,steps:1}),cream);windowGroup.add(frame);
 const imageGeometry=new THREE.ShapeGeometry(path(octagon(w-.39,h-.39,ch-.1),THREE.Shape));const uv=imageGeometry.attributes.uv;const pos=imageGeometry.attributes.position;for(let i=0;i<uv.count;i++)uv.setXY(i,(pos.getX(i)+w/2)/w,(pos.getY(i)+h/2)/h);uv.needsUpdate=true;
 const photo=new THREE.TextureLoader().load('./assets/enceladus.jpg');photo.colorSpace=THREE.SRGBColorSpace;photo.repeat.set(1,.53);photo.offset.set(0,0);
 const glass=new THREE.Mesh(imageGeometry,new THREE.MeshBasicMaterial({map:photo,toneMapped:false}));glass.position.z=.01;windowGroup.add(glass);
 for(const y of [-h/2,h/2]){B(windowGroup,1.15,.26,.18,steel,0,y,.31);for(const x of [-2.9,2.9])B(windowGroup,.42,.12,.12,black,x,y,.28);}
 for(const x of [-w/2,w/2])for(const y of [-.9,.9])B(windowGroup,.12,.26,.14,steel,x,y,.28);
 for(const x of [-.76,.76]){C(windowGroup,.12,.04,black,x,-h/2,.43,Math.PI/2);for(let i=0;i<4;i++)B(windowGroup,.14,.012,.02,steel,x,-h/2-.05+i*.035,.46);}
 // 07: three distinct perimeter machines. No random duplicate screen props.
 stationArt.compressor.removeFromParent();stationArt.cabinet.removeFromParent();
 const turbine=group('rotary-power-machine',9.8,0,4.8);B(turbine,1.9,.20,1.65,black,0,.14,0);C(turbine,.68,1.35,blue,0,1.10,0,Math.PI/2);
 const flywheel=group('turbine-flywheel',0,1.1,.76,turbine);ring(flywheel,.55,.09,steel,0,0,0);C(flywheel,.16,.18,black,0,0,0,Math.PI/2);for(let i=0;i<6;i++){const spoke=B(flywheel,.065,.92,.07,copper);spoke.rotation.z=i*Math.PI/3;}rotors.push(flywheel);
 for(const z of [-.55,0,.55]){const band=ring(turbine,.71,.055,black,0,1.10,z);}
 for(const side of [-1,1]){B(turbine,.38,.80,.65,blue,side*.70,.65,0);C(turbine,.13,.6,copper,side*.57,1.75,0);gauge(turbine,side*.28,1.60,.64,.12);}
 plaque(turbine,'ROTARY CONVERTER',0,.30,.85,1.04,.13);lamp(turbine,.62,.45,.86);
 const press=group('hydraulic-work-press',10,0,-3.5);rounded(press,1.65,.25,1.48,.16,steel,0,.15,0);rounded(press,.60,2.55,.90,.13,blue,.48,1.50,-.15);C(press,.40,1.10,blue,-.18,2.76,0);C(press,.48,.16,steel,-.18,2.28,0);C(press,.22,.72,steel,-.18,1.88,0);
 const ram=group('press-ram',-.18,1.48,0,press);C(ram,.23,.42,steel);C(ram,.30,.10,black,0,-.25,0);C(press,.42,.38,black,-.18,.48,0);B(press,.70,.12,.67,steel,-.18,.74,0);reciprocators.push({node:ram,base:1.48,amplitude:.16});gauge(press,.40,2.17,.48,.14);plaque(press,'HYDRAULIC / 02',.48,1.41,.33,.38,.13);lamp(press,.62,1.14,.34);cable(press,[[.72,2.35,-.1],[.92,1.7,.1],[.83,.4,.3]],.04);
 const engine=group('vertical-service-engine',-10.5,0,-6.6);B(engine,1.65,.19,1.35,black,0,.14,0);rounded(engine,1.13,1.65,1.02,.12,olive,0,1.1,0);C(engine,.45,1.9,steel,.18,2.59,0);C(engine,.49,.12,black,.18,3.57,0);for(let y=1.9;y<3.5;y+=.17)C(engine,.47,.035,black,.18,y,0);
 for(let i=0;i<3;i++){C(engine,.15,.22,black,-.36,.69+i*.4,.62,Math.PI/2);cable(engine,[[-.36,.69+i*.4,.74],[.35,.83+i*.4,.74],[.55,1.6+i*.3,.28]],.025,copper);}
 const crank=group('engine-drive',.72,.72,0,engine);const wheel=ring(crank,.34,.07,steel,0,0,0);for(let i=0;i<4;i++){const spoke=B(crank,.045,.6,.05,black);spoke.rotation.z=i*Math.PI/4;}rotors.push(crank);plaque(engine,'AUX / COMPRESSOR',0,1.53,.53,.83,.13);lamp(engine,.33,1.32,.54);
 for(const machine of [workArm,turbine,press,engine]){const light=new THREE.PointLight(0xd6dfc1,0,5,2);light.position.set(.4,2.7,1.1);machine.add(light);workLights.push(light);}
 const colliders=ROOM_COLLIDERS;
 let phase=0,speed=0;
 function update(dt,powered,reducedMotion=false,beingPickedUp=false){
  // A smooth start/stop; zero power eventually means no mechanical movement.
  speed=THREE.MathUtils.damp(speed,powered?1:0,3,dt);if(speed<.001&&!powered)speed=0;
  if(!reducedMotion)phase+=dt*speed;
  if(!armHeld&&arm.parent&&!beingPickedUp){stepFloorBody(armBody,dt);arm.position.y=armBody.height;}
  if(!reducedMotion){rotors.forEach((r,i)=>r.rotation.z=phase*(i?1.4:1.9));reciprocators.forEach(r=>r.node.position.y=r.base+Math.sin(phase*1.8)*r.amplitude);if(!armHeld){swivel.rotation.y=Math.sin(phase*.35)*.16;shoulder.rotation.z=-1.061+Math.sin(phase*.45)*.07;elbow.rotation.z=-1.839+Math.sin(phase*.45+.6)*.10;}}
  powerDisplays.forEach(m=>m.emissiveIntensity=powered?1.6:0);
  workLights.forEach(l=>l.intensity=powered?9:0);
  indicators.forEach((m,i)=>{if(m.needle){m.needle.rotation.z=powered?-.6+Math.sin(phase*.7+i)*.08:.85;}else{m.emissiveIntensity=powered?1.8:0;m.color.set(powered?0x80b79b:0x25362d);}});
 }
 return {update,releaseArm,armBody,colliders,workArm,windowGroup,turbine,press,engine,rotors,reciprocators};
}
