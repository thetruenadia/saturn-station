export function createObservationScene(THREE){
 const scene=new THREE.Scene();scene.background=new THREE.Color(0x03070c);
 const camera=new THREE.PerspectiveCamera(46,2,.1,120);camera.position.set(0,.5,8.2);camera.lookAt(0,0,0);
 const light=new THREE.DirectionalLight(0xf4e4c6,3);light.position.set(-4,4,5);scene.add(light,new THREE.HemisphereLight(0x72899d,0x030508,.30));
 const texture=new THREE.TextureLoader().load('./assets/enceladus-surface-v2.jpg');texture.colorSpace=THREE.SRGBColorSpace;
 const moon=new THREE.Group();moon.position.set(1,-1.55,-.8);moon.rotation.set(.3,-.45,2.8);scene.add(moon);
 const surface=new THREE.Mesh(new THREE.SphereGeometry(3.3,96,64),new THREE.MeshStandardMaterial({map:texture,bumpMap:texture,bumpScale:.035,roughness:.98,metalness:0}));moon.add(surface);
 // Sparse real-depth stars, deterministic for stable screenshots and reproducible tests.
 const starPositions=[];let n=617;const rnd=()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296};
 for(let i=0;i<650;i++)starPositions.push((rnd()-.5)*70,(rnd()-.5)*45,-12-rnd()*25);
 const starsGeometry=new THREE.BufferGeometry();starsGeometry.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));const stars=new THREE.Points(starsGeometry,new THREE.PointsMaterial({color:0xbfd2e5,size:.045,sizeAttenuation:true,transparent:true,opacity:.65}));scene.add(stars);
 const plumes=new THREE.Group();moon.add(plumes);
 const softData=new Uint8Array(32*32*4);for(let y=0;y<32;y++)for(let x=0;x<32;x++){const r=Math.hypot((x-15.5)/15.5,(y-15.5)/15.5),j=(y*32+x)*4;softData[j]=softData[j+1]=softData[j+2]=255;softData[j+3]=Math.round(Math.max(0,Math.exp(-5*r*r)-.007)*255)}const soft=new THREE.DataTexture(softData,32,32,THREE.RGBAFormat);soft.needsUpdate=true;
 for(let i=0;i<10;i++){const a=(i/9-.5)*1.8,origin=new THREE.Vector3(Math.sin(a)*.45,-3.22,Math.cos(a)*.42),out=origin.clone().normalize(),pos=[],col=[];for(let j=0;j<190;j++){const t=rnd(),length=.65+(i%4)*.22,spread=.035+t*.15;const v=origin.clone().addScaledVector(out,t*length);v.x+=(rnd()-.5)*spread;v.z+=(rnd()-.5)*spread;pos.push(v.x,v.y,v.z);const fade=(1-t)*(1-t);col.push(.58*fade,.78*fade,fade)}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(col,3));const jet=new THREE.Points(geometry,new THREE.PointsMaterial({map:soft,size:.10,transparent:true,opacity:.11,vertexColors:true,blending:THREE.AdditiveBlending,depthWrite:false}));plumes.add(jet);}

 return {scene,camera,moon,stars,plumes,texture};
}
export function createObservationView({THREE,viewport,renderer,windowGlass,sourceCamera,reducedMotion,onOpen,onClose,sound}){
 const view=createObservationScene(THREE);
 const approachCamera=new THREE.PerspectiveCamera(58,1,.08,100);
 const pane=new THREE.WebGLRenderTarget(1536,778,{type:THREE.HalfFloatType});
 const glass=windowGlass.material;
 const {width,height}=windowGlass.userData.aperture;
 view.camera.aspect=width/height;
 view.camera.updateProjectionMatrix();

 const panel=document.createElement('dialog');
 panel.id='observation-view';
 panel.setAttribute('aria-label','Observation window');
 const back=document.createElement('button');
 back.type='button';
 back.textContent='×';
 back.setAttribute('aria-label','Return to room (Escape)');
 panel.append(back);
 viewport.append(panel);

 const from=new THREE.Vector3(),arrival=new THREE.Vector3(),centre=new THREE.Vector3();
 const fromRotation=new THREE.Quaternion(),arrivalRotation=new THREE.Quaternion();
 const origin=new THREE.Vector3();
 let active=false,elapsed=0,lookX=0,lookY=0,returnFocus=null,needsPane=true;
 const duration=2.2;

 function renderPane(){
  if(!view.texture.image?.complete)return;
  const previousTarget=renderer.getRenderTarget();
  renderer.setRenderTarget(pane);
  renderer.render(view.scene,view.camera);
  renderer.setRenderTarget(previousTarget);
  if(glass.map!==pane.texture){
   glass.map=pane.texture;
   glass.color.set(0xffffff);
   glass.needsUpdate=true;
  }
  needsPane=false;
 }
 function frameWindow(){
  const aspect=viewport.clientWidth/Math.max(1,viewport.clientHeight);
  approachCamera.aspect=aspect;
  const span=Math.max(height*1.1,width*1.08/Math.max(1.65,aspect));
  const distance=span/(2*Math.tan(THREE.MathUtils.degToRad(approachCamera.fov/2)));
  arrival.copy(centre);
  arrival.z+=distance;
  approachCamera.position.copy(arrival);
  approachCamera.lookAt(centre);
  arrivalRotation.copy(approachCamera.quaternion);
  approachCamera.updateProjectionMatrix();
 }
 function hide(){
  if(!active)return;
  active=false;
  panel.close();
  lookX=lookY=0;
  view.camera.position.set(0,.5,8.2);
  view.camera.lookAt(origin);
  needsPane=true;
  onClose();
  returnFocus?.focus?.();
 }
 back.addEventListener('click',hide);
 panel.addEventListener('cancel',e=>{e.preventDefault();hide()});
 panel.addEventListener('pointermove',e=>{
  if(reducedMotion)return;
  const rect=panel.getBoundingClientRect();
  lookX=THREE.MathUtils.clamp((e.clientX-rect.left)/rect.width-.5,-.5,.5);
  lookY=THREE.MathUtils.clamp((e.clientY-rect.top)/rect.height-.5,-.5,.5);
 });
 panel.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
  e.preventDefault();
  if(!reducedMotion)lookX=THREE.MathUtils.clamp(lookX+(e.key==='ArrowLeft'?-.15:.15),-.5,.5);
 });
 window.addEventListener('resize',()=>{if(active)frameWindow()});
 document.addEventListener('fullscreenchange',()=>{if(active)frameWindow()});

 return {
  approachCamera,
  get active(){return active},
  show(){
   if(active)return;
   active=true;
   elapsed=0;
   returnFocus=document.activeElement;
   const current=sourceCamera();
   from.copy(current.position);
   fromRotation.copy(current.quaternion);
   windowGlass.getWorldPosition(centre);
   frameWindow();
   panel.showModal();
   onOpen();
   sound('servo');
   back.focus({preventScroll:true});
  },
  hide,
  update(dt){
   if(!active){if(needsPane)renderPane();return}
   elapsed+=dt;
   const t=reducedMotion?1:Math.min(1,elapsed/duration);
   const eased=t*t*(3-2*t);
   approachCamera.position.lerpVectors(from,arrival,eased);
   approachCamera.quaternion.slerpQuaternions(fromRotation,arrivalRotation,eased);
   const settle=THREE.MathUtils.smoothstep(t,.7,1);
   view.camera.position.x=THREE.MathUtils.damp(view.camera.position.x,lookX*.45*settle,3,dt);
   view.camera.position.y=THREE.MathUtils.damp(view.camera.position.y,.5-lookY*.25*settle,3,dt);
   view.camera.lookAt(origin);
   renderPane();
  }
 };
}
