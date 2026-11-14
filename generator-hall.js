import {installHallEquipment} from './hall-equipment.js?v=1';
// The service door opens onto an accessible landing, halfway up the generator vessel.
export function createGeneratorHallScene(THREE){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x10191b);scene.fog=new THREE.FogExp2(0x152023,.0065);
 const iron=new THREE.MeshStandardMaterial({color:0x414b47,roughness:.94,metalness:.26});
 const rust=new THREE.MeshStandardMaterial({color:0x624737,roughness:.99,metalness:.12});
 const paint=new THREE.MeshStandardMaterial({color:0x6c7b70,roughness:.98,metalness:.1});
 const brass=new THREE.MeshStandardMaterial({color:0x9b8450,roughness:.88,metalness:.22});
 const dark=new THREE.MeshLambertMaterial({color:0x1b2526});
 // Material texture follows gravity and panel seams, with old leaks beneath the fasteners.
 if(typeof document!=='undefined'){
  for(const [material,colour,seed] of [[paint,'#697369',51],[rust,'#624737',83],[iron,'#424d49',113]]){
   const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle=colour;c.fillRect(0,0,256,256);let n=seed;const rnd=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
   for(let i=0;i<4000;i++){c.fillStyle=i%2?'#101b1828':'#bcbfa017';c.fillRect(rnd()*256,rnd()*256,1+rnd()*4,1+rnd()*3)}
   for(let i=0;i<26;i++){const x=rnd()*256,y=rnd()*150,length=30+rnd()*100;c.fillStyle='#39271f55';c.beginPath();c.moveTo(x-2,y);c.lineTo(x+3,y);c.lineTo(x+.5,y+length);c.fill()}
   c.strokeStyle='#15201d70';c.lineWidth=2;c.strokeRect(2,2,252,252);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;material.map=tex;material.color.set(0xffffff);
  }
 }
 const hot=new THREE.MeshStandardMaterial({color:0xb37442,emissive:0xff6426,emissiveIntensity:1.4,roughness:1});
 function box(w,h,d,m,x,y,z,parent=scene){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);parent.add(o);return o}
 function pipe(points,r,m=rust,parent=scene){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');const o=new THREE.Mesh(new THREE.TubeGeometry(curve,40,r,8,false),m);parent.add(o);return o}
 function drum(top,bottom,height,m,x,y,z,parent=scene){const o=new THREE.Mesh(new THREE.CylinderGeometry(top,bottom,height,40),m);o.position.set(x,y,z);parent.add(o);return o}
 function ring(radius,tube,m,x,y,z,parent=scene){const o=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,64),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);parent.add(o);return o}
 function rail(a,b,y,broken=false){const [ax,az]=a,[bx,bz]=b,length=Math.hypot(bx-ax,bz-az);for(let s=0;s<=length;s+=2.3){if(broken&&s>length*.55)continue;const t=s/length;box(.08,1.35,.08,iron,ax+(bx-ax)*t,y+.67,az+(bz-az)*t)}for(const h of [.55,1.3])pipe([[ax,y+h,az],[bx,y+h,bz]],.045,brass)}
 function catwalk(x,y,z,width,length){
  box(width,.22,length,iron,x,y-.11,z);
  for(let zz=z-length/2+.15;zz<z+length/2;zz+=.36)box(width-.1,.025,.065,brass,x,y+.02,zz);
  const start=z-length/2,end=z+length/2;
  const outside=x<0?x-width/2:x+width/2,inside=x<0?x+width/2:x-width/2;
  rail([outside,start],[outside,end],y);
  const gaps=Math.abs(x)===36?[-43,...(x<0&&y===-9?[-20]:[]),-10]:[];
  let previous=start;
  for(const gap of gaps){rail([inside,previous],[inside,gap-1.7],y);previous=gap+1.7}
  rail([inside,previous],[inside,end],y);
 }
 function stairFlight(a,b,width=2.2){
  const [ax,ay,az]=a,[bx,by,bz]=b,steps=Math.ceil(Math.abs(by-ay)/.22),dx=bx-ax,dz=bz-az;
  const length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),side=new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle));
  for(let i=0;i<steps;i++){
   const t=(i+.5)/steps,o=box(width,.13,length/steps+.03,iron,ax+dx*t,ay+(by-ay)*t-.065,az+dz*t);o.rotation.y=angle;
  }
  for(const sign of [-1,1]){
   const sx=side.x*width*.48*sign,sz=side.z*width*.48*sign;
   pipe([[ax+sx,ay-.17,az+sz],[bx+sx,by-.17,bz+sz]],.11,iron);
   for(const h of [.58,1.23])pipe([[ax+sx,ay+h,az+sz],[bx+sx,by+h,bz+sz]],.045,brass);
   for(let i=0;i<=steps;i+=4){const t=i/steps;box(.06,1.23,.06,iron,ax+dx*t+sx,ay+(by-ay)*t+.615,az+dz*t+sz)}
  }
 }
 // A broad drop surrounds the small working landing.
 box(110,1,120,dark,0,-37,-32);box(1.5,100,120,paint,-43,10,-32);box(1.5,100,120,iron,43,10,-32);box(87,100,1.5,paint,0,10,-91);
 for(const x of [-40,40])for(let z=-86;z<=20;z+=12){box(.9,90,1,rust,x,8,z);for(let y=-26;y<49;y+=15){box(1,1.05,12,iron,x,y,z+5.5);pipe([[x,y-6,z],[x,y+6,z+10]],.16,iron)}}
 for(let y=-23;y<49;y+=14){catwalk(-36,y,-32,3.4,108);catwalk(36,y,-32,3.4,108);box(75,.24,3,iron,0,y,-85);rail([-36,-83],[36,-83],y)}
 for(const z of [-80,-54,-28,0,21]){box(84,1.2,.8,iron,0,52,z);for(const x of [-21,0,21])pipe([[x,52,z],[x+19,57,z]],.18,rust)}
 box(86,.7,118,dark,0,58,-32);
 // One monumental vessel, with its base and upper exhaust leaving the initial field of view.
 const vessel=new THREE.Group();vessel.position.set(4,0,-37);scene.add(vessel);
 drum(12.2,14.3,34,paint,0,-8,0,vessel);drum(8.3,12.2,13,iron,0,15.5,0,vessel);drum(8.3,8.3,18,paint,0,31,0,vessel);drum(3.5,8.3,9,iron,0,44.5,0,vessel);
 for(const y of [-23,-17,-9,-1,8,13,23,30,39])ring(y>22?8.5:y>8?11.4:13.9,.22,rust,0,y,0,vessel);
 for(let i=0;i<24;i++){const a=i*Math.PI/12,x=Math.sin(a),z=Math.cos(a);box(.24,28,.24,iron,x*14.1,-8,z*14.1,vessel);for(const y of [-20,-8,5])drum(.11,.11,.22,brass,x*14.2,y,z*14.2,vessel)}
 for(let i=0;i<8;i++){const a=i*Math.PI/4;pipe([[Math.sin(a)*5,47,Math.cos(a)*5],[Math.sin(a)*15,49,Math.cos(a)*15],[Math.sin(a)*23,37,Math.cos(a)*23],[Math.sin(a)*27,22,Math.cos(a)*27]],1.25,iron,vessel)}
 for(const x of [-9,9])pipe([[x,-31,0],[x,-22,6],[x,-14,13],[x,-10,18],[x,-10,29]],2,rust,vessel);
 // A visible pulse at the inspection throat keeps the huge volume just alive.
 drum(4.5,4.5,1.1,dark,0,-24.5,0,vessel);ring(4.1,.15,hot,0,-24,0,vessel);
 const furnaceLight=new THREE.PointLight(0xf5823f,210,43,2);furnaceLight.position.set(4,-20,-27);scene.add(furnaceLight);
 for(let i=0;i<17;i++){const a=i*.37;pipe([[4+Math.sin(a)*9,-28,-37+Math.cos(a)*9],[Math.sin(a)*22,-32,-30+Math.cos(a)*23]],.18,dark)}
 // Layered inspection throat and radial stiffeners give the vessel an engineered face.
 const throat=new THREE.Group();throat.position.set(4,1.4,-22.3);scene.add(throat);
 for(const [radius,tube,material,z] of [[4.4,.26,rust,0],[3.95,.18,iron,.2],[3.4,.16,brass,.29]]){
  const collar=new THREE.Mesh(new THREE.TorusGeometry(radius,tube,8,64),material);collar.position.z=z;throat.add(collar);
 }
 const hatch=new THREE.Mesh(new THREE.CylinderGeometry(3.3,3.3,.36,48),dark);hatch.rotation.x=Math.PI/2;throat.add(hatch);
 for(let i=0;i<24;i++){
  const a=i*Math.PI/12,x=Math.sin(a),y=Math.cos(a),rib=box(.16,2.3,.3,iron,x*2.1,y*2.1,.28,throat);rib.rotation.z=-a;
  const bolt=new THREE.Mesh(new THREE.SphereGeometry(.11,6,4),brass);bolt.position.set(x*4.35,y*4.35,.28);throat.add(bolt);
 }
 for(let i=0;i<11;i++){
  const x=-7+i*1.48;
  pipe([[x,25,-24],[x,20,-21],[x,14,-21],[x,9,-21.2],[x,7.4,-22]],.09+i%3*.025,rust);
  box(.6,.86,.4,paint,x,8,-21.5);
 }
 for(const [x,y,z] of [[-7,12,-22],[15,8,-25],[-9,-11,-20],[17,-17,-27]]){
  box(2.3,3.6,1.1,iron,x,y,z);for(let i=0;i<8;i++)box(2.4,.12,1.22,rust,x,y-1.4+i*.4,z);
  pipe([[x,y+1.4,z],[x-1.6,y+3,z],[x-2,y+9,z]],.3,iron);
 }
 const faceLight=new THREE.PointLight(0xe0c7a1,130,45,2);faceLight.position.set(-11,13,-9);scene.add(faceLight);
 // Further vessels behind the first one establish that this is one of several generators.
 for(const [x,z] of [[-22,-72],[25,-75]]){drum(6,8,35,iron,x,2,z);drum(3,6,10,rust,x,24,z);for(const y of [-10,0,12])ring(7,.18,rust,x,y,z);pipe([[x,29,z],[x,40,z],[x*.5,46,-89]],1.8,iron)}
 // The playable landing has real boundaries. Rails frame the drop at the player's feet.
 box(13,.4,8,iron,0,-.2,8);for(let x=-6;x<6;x+=.35)box(.055,.035,7.8,rust,x,.025,8);
 rail([-6.3,4],[6.3,4],0);rail([-6.3,4],[-6.3,6.8],0);rail([-6.3,9.2],[-6.3,12],0);rail([6.3,4],[6.3,12],0);
 box(3.2,.25,8,paint,0,-.12,16);rail([-1.6,12],[-1.6,20],0);rail([1.6,12],[1.6,20],0);
 for(const x of [-5.4,5.4])pipe([[x,-1,5],[x,-5,11],[x,-10,17]],.3,iron);
 // Every stair terminates on a landing. The side-wall flights connect successive gallery levels.
 for(const side of [-1,1])for(let y=-23,level=0;y<47;y+=14,level++){
  const z=level%2?-43:-10,endZ=level%2?-10:-43,x=side*(level%2?29:32);
  box(10,.22,3.2,iron,side*32,y-.11,z);box(10,.22,3.2,iron,side*32,y+13.89,endZ);
  stairFlight([x,y,z],[x,y+14,endZ]);
 }
 // Walkable route from the service landing down to the lower gallery.
 box(26,.22,2.4,iron,-19,-.11,8);rail([-6.3,6.8],[-32,6.8],0);rail([-6.3,9.2],[-32,9.2],0);
 box(3.4,.22,3.4,iron,-32,-.11,8);stairFlight([-32,0,8],[-32,-9,-20],2.5);
 box(6,.22,3.4,iron,-34,-9.11,-20);rail([-37,-21.7],[-30.4,-21.7],-9);
 // A buckled section is visible below the connected route, with both ends still attached to its brackets.
 pipe([[-32,-13,-20],[-29,-18,-28],[-32,-23,-35]],.12,rust);
 for(const x of [-6,6])box(.18,31,.18,iron,x,-16,7);
 // Sparse working lamps pick out scale. Most fixtures stay dark.
 scene.add(new THREE.HemisphereLight(0xb1c6c5,0x151715,.85));const sky=new THREE.DirectionalLight(0xc3d5d1,2.2);sky.position.set(-18,41,15);scene.add(sky);
 for(const [x,y,z,on] of [[-35,15,-4,true],[-35,-12,-45,false],[35,0,-15,true],[-22,15,-28,true],[22,-11,-6,true],[35,28,-60,false],[0,3,16,true]]){
  box(.8,.18,.5,on?hot:dark,x,y,z);if(on){const l=new THREE.PointLight(0xffcb8d,75,22,2);l.position.set(x,y-.5,z);scene.add(l)}
 }
 installHallEquipment(THREE,scene);
 const returnMark=box(2.7,3.5,.25,dark,0,1.75,20);box(.15,3.5,.15,brass,-1.48,1.75,19.9);box(.15,3.5,.15,brass,1.48,1.75,19.9);
 return {scene,furnaceLight,returnMark};
}
export function hallFloorHeight(x,z,currentHeight){
 const heights=[];
 if((x>=-5.8&&x<=5.8&&z>=4.6&&z<=11.8)||(x>=-1.25&&x<=1.25&&z>=11.5&&z<=19.2)){
  if(!(x< -2.85&&z>8.5&&z<11.05))heights.push(0);
 }
 if(x>=-33.1&&x<=-5.7&&z>=8&&z<=9.2)heights.push(0);
 if(x>=-33&&x<=-31&&z>=-20&&z<=8)heights.push(-(8-z)*9/28);
 if(x>=-37.05&&x<=-30.7&&z>=-21.25&&z<=-19.9)heights.push(-9);
 for(let y=-23,level=0;y<=47;y+=14,level++){
  if(Math.abs(x)>=34.95&&Math.abs(x)<=37.05&&z>=-85.3&&z<=21.3)heights.push(y);
  if(x>=-37.05&&x<=37.05&&z>=-86.1&&z<=-84)heights.push(y);
  if(Math.abs(x)>=27.9&&Math.abs(x)<=37.05&&(Math.abs(z+43)<=.3||Math.abs(z+10)<=.3))heights.push(y);
  const stairX=level%2?29:32;
  if(y<47&&Math.abs(Math.abs(x)-stairX)<=.9&&z>=-43&&z<=-10){
   const t=level%2?(z+43)/33:(-10-z)/33;heights.push(y+14*t);
  }
 }
 if(!heights.length)return null;
 if(currentHeight===undefined)return heights[0];
 const nearest=heights.reduce((a,b)=>Math.abs(a-currentHeight)<Math.abs(b-currentHeight)?a:b);
 return Math.abs(nearest-currentHeight)<.55?nearest:null;
}
export function hallPointClear(x,z,height){return hallFloorHeight(x,z,height)!==null}
export function createGeneratorHall({THREE,robot,onReturn,onComplete,reducedMotion=false}){
 const panel=document.createElement('dialog');panel.id='generator-hall';panel.setAttribute('aria-label','Generator hall');
 panel.innerHTML='<div class="hall-canvas"></div><div class="hall-arrival" aria-hidden="true"></div><div class="hall-actions"><button data-view>ISOMETRIC · §</button><button data-return>RETURN TO SERVICE BAY</button><button data-complete>END DEMO</button></div><p class="hall-controls">W A S D · WALK &nbsp; DRAG · CAMERA &nbsp; SCROLL · ZOOM &nbsp; § · VIEW &nbsp; R · RESET</p><p class="hall-location" aria-live="polite">GENERATOR 04</p>';
 document.body.append(panel);
 const {scene,furnaceLight}=createGeneratorHallScene(THREE);
 const camera=new THREE.PerspectiveCamera(65,1,.1,240);const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;panel.querySelector('.hall-canvas').append(renderer.domElement);
 const isoCamera=new THREE.OrthographicCamera(-16,16,12,-12,.1,240);
 const unit=robot?robot.clone(true):new THREE.Group();unit.visible=true;unit.name='MU-1 in generator hall';scene.add(unit);
 const occluders=[];scene.traverse(o=>{if(o.isMesh&&!unit.getObjectById(o.id)&&!o.material.transparent)occluders.push(o)});
 const faded=new Map(),raycaster=new THREE.Raycaster();
 function restoreOcclusion(){for(const [o,original] of faded){const temporary=o.material;o.material=original;temporary.dispose()}faded.clear()}
 function clearView(){
  restoreOcclusion();if(!isometric)return;
  const centre=unit.position.clone().add(new THREE.Vector3(0,1.1,0));const delta=centre.clone().sub(isoCamera.position),distance=delta.length();
  raycaster.set(isoCamera.position,delta.normalize());raycaster.far=distance-.75;
  for(const {object} of raycaster.intersectObjects(occluders,false)){
   if(faded.has(object)||Array.isArray(object.material))continue;
   const original=object.material,material=original.clone();material.transparent=true;material.opacity=.09;material.depthWrite=false;
   faded.set(object,original);object.material=material;
  }
 }
 let isometric=true,orbit=Math.PI/4,elevation=.72,zoom=1;
 function syncView(){unit.visible=isometric;panel.querySelector('[data-view]').textContent=isometric?'FIRST PERSON · §':'ISOMETRIC · §';restoreOcclusion()}
 panel.querySelector('[data-view]').onclick=()=>{isometric=!isometric;syncView()};
 const pos=new THREE.Vector3(0,1.75,17.7),keys=new Set();let active=false,heading=0,pitch=.02,dragging=false,lastX=0,lastY=0,elapsed=0,lastTime=0,frame=0;
 function sign(text,x,y,z,size=1.8){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');c.clearRect(0,0,1024,256);c.fillStyle='#c4bb91';c.font='bold 82px monospace';c.textAlign='center';c.fillText(text,512,160);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;const plane=new THREE.Mesh(new THREE.PlaneGeometry(size*4,size),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false}));plane.position.set(x,y,z);scene.add(plane)}
 sign('B-7 / SERVICE',0,2.4,19.79,.46);
 const exitSign=scene.children.at(-1);exitSign.rotation.y=Math.PI;exitSign.position.z=19.78;
 function resize(){if(!active)return;camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();const aspect=innerWidth/innerHeight;isoCamera.left=-12*aspect;isoCamera.right=12*aspect;isoCamera.top=12;isoCamera.bottom=-12;isoCamera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false)}
 function hide(complete=false){if(!active)return;active=false;keys.clear();dragging=false;cancelAnimationFrame(frame);restoreOcclusion();panel.close();if(complete)onComplete();else onReturn()}
 panel.querySelector('[data-return]').onclick=()=>hide();panel.querySelector('[data-complete]').onclick=()=>hide(true);panel.addEventListener('cancel',e=>{e.preventDefault();hide()});
 panel.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown'].includes(k)){keys.add(k);e.preventDefault()}if(['§','`'].includes(k)){e.preventDefault();isometric=!isometric;syncView()}if(k==='r'){orbit=Math.PI/4;elevation=.72;zoom=1;heading=0;pitch=.02}if(k==='e'&&pos.z>16)hide()});panel.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
 renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;if(isometric){orbit-=(e.clientX-lastX)*.005;elevation=THREE.MathUtils.clamp(elevation+(e.clientY-lastY)*.003,.32,1.15)}else{heading-=(e.clientX-lastX)*.0035;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-lastY)*.0035,-1.15,1.15);}lastX=e.clientX;lastY=e.clientY});for(const name of ['pointerup','pointercancel','lostpointercapture'])renderer.domElement.addEventListener(name,()=>dragging=false);
 renderer.domElement.addEventListener('wheel',e=>{if(!isometric)return;e.preventDefault();zoom=THREE.MathUtils.clamp(zoom*Math.exp(-e.deltaY*.001),.42,2.5)},{passive:false});
 window.addEventListener('blur',()=>{keys.clear();dragging=false});window.addEventListener('resize',resize);
 function tick(now){if(!active)return;const dt=Math.min(.05,(now-lastTime)/1000);lastTime=now;elapsed+=dt;
  const walk=elapsed>(reducedMotion?0:2.1);
  if(walk){
   const forward=(keys.has('w')?1:0)-(keys.has('s')?1:0),side=(keys.has('d')?1:0)-(keys.has('a')?1:0),length=Math.hypot(forward,side)||1;
   const dx=(isometric?side:-Math.sin(heading)*forward+Math.cos(heading)*side)/length*dt*2.4;
   const dz=(isometric?-forward:-Math.cos(heading)*forward-Math.sin(heading)*side)/length*dt*2.4;
   let floor=pos.y-1.75;
   const nextX=hallFloorHeight(pos.x+dx,pos.z,floor);
   if(nextX!==null){pos.x+=dx;floor=nextX}
   const nextZ=hallFloorHeight(pos.x,pos.z+dz,floor);
   if(nextZ!==null){pos.z+=dz;floor=nextZ}
   pos.y=floor+1.75;
   if(Math.hypot(dx,dz)>.001)unit.rotation.y=Math.atan2(dx,dz);
  }
  else{const t=Math.min(1,elapsed/2.1);pos.z=17.7-5.7*t*t*(3-2*t)}
  if(keys.has('arrowleft'))heading+=dt*.8;if(keys.has('arrowright'))heading-=dt*.8;if(keys.has('arrowup'))pitch=Math.min(1.15,pitch+dt*.6);if(keys.has('arrowdown'))pitch=Math.max(-1.15,pitch-dt*.6);
  unit.position.set(pos.x,pos.y-1.75,pos.z);unit.visible=isometric;
  isoCamera.position.set(pos.x+Math.sin(orbit)*23*Math.cos(elevation),pos.y+23*Math.sin(elevation),pos.z+Math.cos(orbit)*23*Math.cos(elevation));isoCamera.zoom=zoom;isoCamera.lookAt(pos.x,pos.y-.5,pos.z);isoCamera.updateProjectionMatrix();clearView();
  camera.position.copy(pos);camera.rotation.set(pitch,heading,0,'YXZ');furnaceLight.intensity=reducedMotion?210:210+Math.sin(elapsed*.7)*15;
  panel.querySelector('.hall-location').classList.toggle('visible',elapsed>.8&&elapsed<5.4);
  panel.classList.toggle('arrived',reducedMotion||elapsed>.9);renderer.render(scene,isometric?isoCamera:camera);frame=requestAnimationFrame(tick);
 }
 return {get active(){return active},show(){if(active)return;active=true;elapsed=0;keys.clear();orbit=Math.PI/4;elevation=.72;zoom=1;isometric=true;syncView();heading=0;pitch=.02;pos.set(0,1.75,reducedMotion?12:17.7);panel.classList.remove('arrived');panel.showModal();resize();panel.querySelector('[data-return]').focus({preventScroll:true});lastTime=performance.now();frame=requestAnimationFrame(tick)},hide};
}
