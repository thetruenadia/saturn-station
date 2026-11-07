// Original procedural artwork: painted metal, repair history and silhouette-led machinery.
export function applyArtDirection({THREE,scene,robot,terminal,terminalScreen,terminalLamp,terminalLit,exchanger,box,cylinder,pipeBetween,wornPaint,label}){
 const ink=new THREE.MeshStandardMaterial({color:0x202b2b,roughness:.93,metalness:.12});
 const cream=wornPaint(0xb9b19a,271),olive=wornPaint(0x727969,283),rust=wornPaint(0x765043,297);
 const brass=wornPaint(0x9e8961,301),rubber=new THREE.MeshStandardMaterial({color:0x262b2a,roughness:1});
 const ceramic=wornPaint(0xc7c1aa,317);
 function drum(parent,r,h,material,x,y,z){return cylinder(parent,r,r,h,material,x,y,z)}
 function pipe(parent,points,r,material){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,32,r,8,false),material);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh}
 function gauge(parent,x,y,z,r=.19){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  const face=new THREE.Mesh(new THREE.CircleGeometry(r,24),ceramic);g.add(face);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.035,6,24),ink);g.add(ring);
  for(let i=0;i<9;i++){const a=-2.4+i*.6;const tick=box(g,.014,.04,.008,ink,Math.sin(a)*r*.77,Math.cos(a)*r*.77,.015);tick.rotation.z=-a}
  const needle=box(g,.012,r*.8,.015,rust,-r*.12,r*.13,.025);needle.rotation.z=.65;
 }
 function rivets(parent,w,h,z){for(const x of [-w/2,w/2])for(const y of [-h/2,h/2]){const bolt=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),brass);bolt.position.set(x,y,z);parent.add(bolt)}}
 function plate(parent,text,x,y,z,w=1.1){box(parent,w,.32,.035,ink,x,y,z);label(parent,text,x,y,z+.024,0,w*.38,0xd5c8a7)}
 // A squat bell-shaped ceramic compressor with an off-axis flywheel and repairs.
 const compressor=new THREE.Group();compressor.position.set(-10.6,0,-3.7);scene.add(compressor);
 const profile=[[0,.1],[.65,.1],[.82,.24],[.86,.55],[.76,.78],[.63,.86],[.58,2.0],[.48,2.3],[.26,2.48],[0,2.5]].map(([r,y])=>new THREE.Vector2(r,y));
 const vessel=new THREE.Mesh(new THREE.LatheGeometry(profile,24),cream);vessel.castShadow=vessel.receiveShadow=true;compressor.add(vessel);
 for(const y of [.35,.8,1.95])drum(compressor,y<1?.86:.6,.09,ink,0,y,0);
 for(const x of [-.55,.55])box(compressor,.24,.25,1.4,rust,x,.14,0);
 gauge(compressor,-.22,1.65,.57,.22);gauge(compressor,.26,1.55,.6,.13);
 const wheel=new THREE.Group();wheel.position.set(1.0,.8,0);wheel.rotation.y=Math.PI/2;compressor.add(wheel);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.57,.09,8,28),rust);wheel.add(rim);
 for(let i=0;i<5;i++){const spoke=box(wheel,.07,1.0,.08,ink,0,0,0);spoke.rotation.z=i*Math.PI/5}
 drum(compressor,.16,.5,brass,1,.8,0,0,Math.PI/2);
 pipe(compressor,[[0,2.45,0],[0,2.9,0],[.9,3.15,0],[1.45,2.8,0],[1.45,.4,0]],.12,rust);
 pipe(compressor,[[-.55,1.95,.1],[-1.0,1.8,.1],[-1.05,.6,.2],[-.7,.35,.5]],.07,rubber);
 plate(compressor,'CP / 04',0,1.03,.75,.8);
 // Rounded field cabinet: offset vent, strapped casing and one mismatched replacement door.
 const cabinet=new THREE.Group();cabinet.position.set(9.6,0,4.5);cabinet.rotation.y=-.28;scene.add(cabinet);
 const casing=new THREE.Mesh(new THREE.CapsuleGeometry(.65,1.1,5,14),olive);casing.scale.z=.72;casing.position.y=1.35;casing.castShadow=casing.receiveShadow=true;cabinet.add(casing);
 for(const x of [-.48,.48])box(cabinet,.2,.38,.8,ink,x,.2,0);
 box(cabinet,1.12,1.05,.1,cream,0,1.35,.48);box(cabinet,.48,.6,.05,rust,.24,1.3,.55);
 for(let i=0;i<7;i++)box(cabinet,.36,.033,.08,ink,-.28,1.64-i*.09,.55);
 for(const y of [.74,1.98])box(cabinet,1.35,.07,1.0,ink,0,y,0);
 gauge(cabinet,.2,1.38,.6,.15);plate(cabinet,'FIELD SERVICE',0,2.15,.46,1.1);
 pipe(cabinet,[[.6,1.6,0],[.95,1.7,0],[1.05,.65,.1],[.85,.2,.8]],.055,rubber);
 rivets(cabinet,1.0,.88,.57);
 // Preserve the blue CRT and cream rack built by prototype-3d.js.
 // The terminal's live display and lamp remain connected to station power.
 // The exchanger's bolted end cap and patchwork insulation read as one authored machine.
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(1.62,1.62,.16,24),cream);cap.rotation.z=Math.PI/2;cap.position.set(3.3,4.25,0);exchanger.add(cap);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;drum(exchanger,.065,.12,ink,3.42,4.25+1.4*Math.sin(a),1.4*Math.cos(a)).rotation.z=Math.PI/2}
 pipe(exchanger,[[1.8,5.6,0],[2.1,6,.15],[3.5,6,.15],[4.1,4.2,.15],[4.1,.5,.15]],.15,rust);
 // Torn notices and inspection stamps are drawn at their actual scale, not repeated as tiling.
 function notice(x,y,z,heading,seed){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;const c=canvas.getContext('2d');
  c.fillStyle='#b8ac8e';c.beginPath();c.moveTo(9,6);c.lineTo(247,12);c.lineTo(242,296);c.lineTo(214,314);c.lineTo(14,306);c.closePath();c.fill();
  c.fillStyle='#443e33';c.font='bold 26px monospace';c.fillText(heading,24,54);c.fillRect(24,69,207,5);
  for(let i=0;i<12;i++){c.globalAlpha=.35+(i%3)*.14;c.fillRect(25,95+i*13,100+(i*seed)%105,3)}c.globalAlpha=1;
  c.strokeStyle='#824e3c';c.lineWidth=4;c.strokeRect(110,246,110,40);c.font='16px monospace';c.fillStyle='#824e3c';c.fillText('INSPECTED',119,272);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.82,1.03),new THREE.MeshStandardMaterial({map:texture,transparent:true,roughness:1,side:THREE.DoubleSide}));mesh.position.set(x,y,z);mesh.rotation.z=-.06;scene.add(mesh);
 }
 notice(-9,2.9,-10.3,'SHIFT  /  07',17);
 // Floor: a broad quiet ground plane with localized stains and etched plate seams.
 const floorCanvas=document.createElement('canvas');floorCanvas.width=floorCanvas.height=1024;const c=floorCanvas.getContext('2d');c.fillStyle='#69695b';c.fillRect(0,0,1024,1024);
 let seed=41;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<18000;i++){c.fillStyle=i%3?'#272d2910':'#d4c7a215';c.fillRect(random()*1024,random()*1024,1+random()*15,1+random()*4)}
 for(let i=0;i<14;i++){const x=random()*1024,y=random()*1024,r=20+random()*100,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#272e2940');g.addColorStop(1,'#272e2900');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)}
 c.strokeStyle='#282f2c80';c.lineWidth=2;for(let i=0;i<=1024;i+=128){c.beginPath();c.moveTo(i,0);c.lineTo(i,1024);c.stroke();c.beginPath();c.moveTo(0,i);c.lineTo(1024,i);c.stroke()}
 const texture=new THREE.CanvasTexture(floorCanvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 const floor=scene.children.find(o=>o.isMesh&&o.geometry.type==='BoxGeometry'&&o.geometry.parameters.width===28);if(floor){floor.material=floor.material.clone();floor.material.map=texture;floor.material.color.set(0xffffff);floor.material.roughness=1;floor.material.metalness=.08}
 // Keep construction scaffolding in the background; the central floor remains readable.
 scene.updateMatrixWorld(true);const position=new THREE.Vector3();
 scene.traverse(o=>{if(!o.isMesh)return;o.getWorldPosition(position);const p=o.geometry.parameters;
  if(o.geometry.type==='CircleGeometry'&&position.y<.01){o.material=o.material.clone();o.material.color.set(0x464e45);o.material.transparent=true;o.material.opacity=.28}
  const overhead=new THREE.Box3().setFromObject(o);if(overhead.min.y>3.4&&overhead.max.z> -8.5)o.visible=false;
  if(o.geometry.type==='CylinderGeometry'&&p.height>10&&position.y>3&&position.z>-6)o.visible=false;
  if(o.geometry.type==='TubeGeometry'){const b=new THREE.Box3().setFromObject(o);if(b.min.y>2.5&&b.min.z< -5&&b.max.z>3)o.visible=false}
  if(o.geometry.type!=='BoxGeometry')return;if(position.y>5.5&&p.height<.5&&Math.abs(position.z)<7)o.visible=false;
  // Open the control alcove as a deliberate architectural cutaway around its instrument bank.
  if(p.height>2&&p.width<.8&&p.depth<.8&&position.x>2.5&&position.x<9.5&&position.z> -10&&position.z< -3.5)o.visible=false;
  if(p.height>3&&p.width<.8&&p.depth<.8&&position.z>0){o.scale.y=.14;o.position.y=.55}
 });
 // Restrained stepped illumination on painted surfaces gives the room a drawn, gouache-like read.
 // Bare steel and optics retain their physical response and point-light falloff.
 const values=[88,132,176,216,255],data=new Uint8Array(values.flatMap(v=>[v,v,v,255]));
 const ramp=new THREE.DataTexture(data,5,1,THREE.RGBAFormat);ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
 const painted=new Map();
 scene.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material))return;const m=o.material;
  if(!m.isMeshStandardMaterial||m.transparent||m.roughness<.7||m.metalness>.4||m.emissive?.getHex()>0)return;
  if(!painted.has(m)){const toon=new THREE.MeshToonMaterial({color:m.color,map:m.map,gradientMap:ramp,side:m.side});painted.set(m,toon)}
  o.material=painted.get(m);
 });
 // Fade only scenery that actually crosses the view of MU-1, leaving the surrounding detail intact.
 const blockers=[];scene.updateMatrixWorld(true);
 scene.traverse(o=>{
  if(!o.isMesh||Array.isArray(o.material)||o.material.transparent)return;
  let parent=o;while(parent){if(parent===robot)return;parent=parent.parent}
  const bounds=new THREE.Box3().setFromObject(o);if(bounds.min.y>2.6||bounds.max.y>3.5)blockers.push(o);
 });
 const ray=new THREE.Raycaster(),target=new THREE.Vector3(),direction=new THREE.Vector3(),faded=new Map(),active=new Set();let elapsed=0;
 function updateOcclusion(camera,dt){
  elapsed+=dt;
  if(elapsed>=.12){elapsed=0;active.clear();
  for(const y of [1.1,1.9,2.5])for(const dx of [-.5,0,.5]){
   target.copy(robot.position).add(new THREE.Vector3(dx,y,0));direction.copy(target).sub(camera.position);ray.far=direction.length()-.3;ray.set(camera.position,direction.normalize());
   for(const hit of ray.intersectObjects(blockers,false)){
    const o=hit.object;if(!faded.has(o)){const original=o.material,m=original.clone();m.transparent=true;m.opacity=original.opacity;m.depthWrite=false;const outlines=new Map(o.children.filter(c=>c.isLineSegments).map(c=>[c,c.visible]));faded.set(o,{original,material:m,outlines})}active.add(o);
   }
  }
  }
  for(const [o,{original,material,outlines}] of faded){
   const target=active.has(o)?.12:original.opacity;material.opacity=THREE.MathUtils.damp(material.opacity,target,10,dt);
   const restored=!active.has(o)&&Math.abs(material.opacity-original.opacity)<.005;
   o.material=restored?original:material;o.children.forEach(c=>{if(c.isLineSegments)c.visible=restored?(outlines.get(c)??true):false});
  }
 }
 return {compressor,cabinet,updateOcclusion};
}

