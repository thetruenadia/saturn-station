// Generator 04: a walkable maintenance gallery wrapped around a monumental station dynamo.
export const GENERATOR_LEVELS = [0, -8, -16, -24, -32];
const FLIGHT_START = -18, FLIGHT_LENGTH = 11, FLIGHT_WIDTH = 4.4, SIDE_X = 34;

export function generatorFloorAt(x, z, currentY = 0) {
  // Walkable arrival bridge, the five side galleries, and a connected descending stair.
  if (Math.abs(x) <= 4.4 && z >= 11 && z <= 21) return 0;
  if (Math.abs(z - 13) <= 3.2 && Math.abs(x) <= 37) return 0;
  for (let i = 0; i < GENERATOR_LEVELS.length - 1; i++) {
    const start = FLIGHT_START - i * FLIGHT_LENGTH;
    const end = start - FLIGHT_LENGTH;
    if (Math.abs(x - SIDE_X) <= FLIGHT_WIDTH / 2 && z <= start && z >= end) {
      const t = (start - z) / FLIGHT_LENGTH;
      return GENERATOR_LEVELS[i] + (GENERATOR_LEVELS[i + 1] - GENERATOR_LEVELS[i]) * t;
    }
  }
  if (Math.abs(x) >= 29 && Math.abs(x) <= 42 && z >= -70 && z <= 16) {
    return GENERATOR_LEVELS.reduce((best, y) => Math.abs(y-currentY)<Math.abs(best-currentY)?y:best, GENERATOR_LEVELS[0]);
  }
  return null;
}
export function generatorCanOccupy(x,z,currentY=0) {
  if (x < -43 || x > 43 || z < -71 || z > 22) return false;
  const floor=generatorFloorAt(x,z,currentY);
  return floor!==null && Math.abs(floor-currentY)<=4.2;
}
export function createGeneratorHall({THREE,scene,interactables}) {
  const root=new THREE.Group();root.name='Generator 04';root.position.set(11.4,0,-34);root.visible=false;scene.add(root);
  const metal=new THREE.MeshStandardMaterial({color:0x343b39,roughness:.88,metalness:.5});
  const dark=new THREE.MeshStandardMaterial({color:0x151b19,roughness:.94,metalness:.25});
  const rust=new THREE.MeshStandardMaterial({color:0x654a35,roughness:.91,metalness:.32});
  const cream=new THREE.MeshStandardMaterial({color:0x777461,roughness:.86,metalness:.38});
  const teal=new THREE.MeshStandardMaterial({color:0x3e7778,roughness:.56,metalness:.52});
  const amber=new THREE.MeshStandardMaterial({color:0xb16b2b,roughness:.43,metalness:.24,emissive:0x512707,emissiveIntensity:.7});
  const glow=new THREE.MeshStandardMaterial({color:0xf3a64f,roughness:.3,emissive:0xf27821,emissiveIntensity:2.8});
  const mats={metal,dark,rust,cream,teal,amber,glow};
  function box(parent,w,h,d,material,x,y,z,rx=0,ry=0,rz=0){
    const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function cylinder(parent,rt,rb,h,material,x,y,z,segments=24,rz=0){
    const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,segments,1),material);m.position.set(x,y,z);m.rotation.z=rz;m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
  }
  function beam(a,b,r,material,parent=root){
    const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),delta=B.clone().sub(A);
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),8),material);
    mesh.position.copy(A.add(B).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
    mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  // Tall riveted shell and structural ribs suggest a vessel much larger than this gallery.
  const shell=cylinder(root,15.2,17.4,48,metal,0,3,-25,48);
  shell.material=metal;
  cylinder(root,17.8,17.2,1.1,rust,0,-21.3,-25,48);
  cylinder(root,13.4,15.4,2.4,cream,0,27.8,-25,48);
  cylinder(root,10.2,13.4,12,metal,0,34.8,-25,40);
  cylinder(root,5.1,10.2,8,cream,0,44.8,-25,40);
  cylinder(root,3.5,5.1,5,amber,0,51.3,-25,40);
  for(let i=0;i<28;i++){
    const a=i*Math.PI*2/28,x=Math.sin(a),z=Math.cos(a);
    beam([x*17.4,-20.5,-25+z*17.4],[x*15.3,25,-25+z*15.3],.24,i%4===0?rust:cream);
    cylinder(root,.42,.42,1.1,teal,x*17.2,-20.2,-25+z*17.2,12);
  }
  // Open core well: nested luminous rings and a slow axial pulse, visible from every gallery.
  const core=new THREE.Group();root.add(core);core.position.set(0,-15,-25);
  for(let i=0;i<5;i++){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(7.6-i*.72,.18+i*.035,8,72),i%2?glow:amber);
    ring.rotation.x=Math.PI/2;ring.position.y=i*2.5;core.add(ring);
  }
  const coreLight=new THREE.PointLight(0xf08136,180,72,1.7);coreLight.position.set(0,-13,-25);root.add(coreLight);
  const inner=new THREE.Mesh(new THREE.CylinderGeometry(4.2,5.8,28,24,1,true),new THREE.MeshBasicMaterial({color:0xd66c2a,transparent:true,opacity:.11,side:THREE.DoubleSide}));
  inner.position.set(0,-13,-25);root.add(inner);
  // The immense hall, overhead catwalks, and cross-braced girders frame the dynamo.
  for(const x of [-42,-30,30,42]){
    for(const z of [-54,-39,-24,-9,6]){
      box(root,.72,60,.8,x===-30||x===30?rust:metal,x,12,z);
      box(root,3,.32,1.1,cream,x,28,z);
    }
  }
  for(const y of GENERATOR_LEVELS){
    for(const side of [-1,1]){
      const x=side*36;
      box(root,11,.42,88,metal,x,y,-26);
      box(root,11,.12,88,rust,x,y+.25,-26);
      for(const z of [-67,-59,-51,-43,-35,-27,-19,-11,-3,5,13]){
        box(root,.16,.9,.17,cream,x+side*4.9,y+.55,z);
      }
      for(const z of [-67,-51,-35,-19,-3,13]){
        for(const h of [.48,.82])beam([x-side*5,y+h,z],[x+side*5,y+h,z],.055,teal);
      }
    }
    // Thin service bridge at every tier; its missing central span exposes the depth.
    box(root,62,.33,1.1,metal,0,y,13);
    box(root,62,.3,1.1,metal,0,y,-67);
  }
  // Entry bridge and a grated service walkway that carries the player to the side galleries.
  box(root,8,.38,17,metal,0,-.2,15);
  for(let z=8;z<=22;z+=1.1)box(root,7.8,.07,.12,rust,0,.04,z);
  for(const x of [-4,4])for(const z of [9,13,17,21]){
    beam([x,0,z],[x,1,z],.07,cream);
  }
  for(const z of [9,13,17,21])for(const h of [.6,.9])beam([-4,h,z],[4,h,z],.045,teal);
  box(root,32,.38,2,metal,0,-.2,13);
  for(let x=-15;x<=15;x+=1)box(root,.09,.07,1.85,rust,x,.04,13);
  // Four linked flights descend along one side of the immense gallery.
  for(let i=0;i<GENERATOR_LEVELS.length-1;i++){
    const side=1,x=side*SIDE_X,y0=GENERATOR_LEVELS[i],y1=GENERATOR_LEVELS[i+1];
    const z0=FLIGHT_START-i*FLIGHT_LENGTH,z1=z0-FLIGHT_LENGTH;
    for(let n=0;n<17;n++){
      const t=(n+.5)/17,z=z0-(z0-z1)*t,y=y0+(y1-y0)*t;
      box(root,4,.28,.92,metal,x,y-.16,z);
      box(root,.28,.5,.14,rust,x,y+.02,z+.45);
    }
    for(const dx of [-1.9,1.9]){
      beam([x+dx,y0,z0],[x+dx,y1,z1],.1,cream);
      for(let n=0;n<=8;n++){
        const t=n/8,z=z0-(z0-z1)*t,y=y0+(y1-y0)*t;
        beam([x+dx,y,z],[x+dx,y+.9,z],.055,rust);
      }
      beam([x+dx,y0+.9,z0],[x+dx,y1+.9,z1],.075,teal);
    }
    // Broken stair lip and small debris identify old repairs while leaving a clear route.
    for(let n=0;n<3;n++)box(root,.6,.18,.5,rust,x+side*(2.6+n*.24),y0-.12,z0-1.2-n*.55);
  }
  // Thick, sagging power trunks descend from overhead cable trays into the dynamo.
  for(let i=0;i<20;i++){
    const x=-20+i*2.05,z=-49+(i%4)*3.2;
    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(x,43,z),new THREE.Vector3(x+(i%2?2:-2),31,z+2),
      new THREE.Vector3(x+(i%3-1)*3,19,z-1),new THREE.Vector3(x+(i%2?3:-3),5,z+1),
      new THREE.Vector3(x+(i%4-2)*1.3,-2,-25+(i%5-2)*2)
    ]);
    root.add(new THREE.Mesh(new THREE.TubeGeometry(curve,32,.065+(i%4)*.025,7,false),i%3?teal:rust));
  }
  for(const z of [-66,-52,-38,-24,-10]){
    box(root,3,.5,.55,metal,-41,GENERATORSHAFT(z),z);
    for(const x of [-41,-39,-37])box(root,.11,2,.12,amber,x,GENERATORSHAFT(z),z);
  }
  function GENERATORSHAFT(z){return z>-36?17:-7;}
  // Landing exit: the lower-gallery hatch leads into the existing demo ending.
  const gate=new THREE.Group();gate.position.set(34,-32,-64);root.add(gate);
  box(gate,4.2,5,.5,metal,0,2.5,0);
  box(gate,3.1,3.7,.18,dark,0,2.4,.32);
  box(gate,.32,4.1,.1,rust,-1.65,2.5,.45);
  box(gate,.09,.7,.15,glow,1.72,2.7,.48);
  box(gate,1.4,.18,.2,cream,0,4.65,.4);
  const entry=new THREE.Group();entry.position.set(0,0,20);root.add(entry);
  box(entry,4.6,5.1,.55,metal,0,2.55,0);
  box(entry,3.3,4,.18,dark,0,2.5,.36);
  for(const x of [-1.8,1.8])box(entry,.22,5.3,.6,rust,x,2.65,0);
  const returnAnchor=new THREE.Object3D();returnAnchor.position.set(0,0,19);root.add(returnAnchor);
  const exitAnchor=new THREE.Object3D();exitAnchor.position.set(-39,0,-50);root.add(exitAnchor);
  const returnTarget={userData:{name:'B-7 RETURN HATCH',x:11.4,z:-15,y:1.65,area:'generator04'}};
  const endTarget={userData:{name:'GENERATOR 04 LOWER GALLERY GATE',x:11.4+34,z:-34-64,y:-30.2,area:'generator04'}};
  interactables.push(returnTarget,endTarget);
  const glowLight=new THREE.PointLight(0x879c7d,7,19);glowLight.position.set(0,4,16);root.add(glowLight);
  const lamps=[];
  for(let i=0;i<11;i++){
    const z=7-i*5.4;
    const lamp=box(root,1.4,.24,.45,i%3?amber:glow,i%2?-39:39,23,z);
    const point=new THREE.PointLight(i%3?0xd58c4c:0xabc58d,i%3?14:20,20,2);
    point.position.set(i%2?-39:39,21,z);root.add(point);lamps.push({lamp,point,phase:i*.83});
  }
  const notice=document.createElement('div');notice.className='generator04-arrival';notice.setAttribute('aria-live','polite');notice.textContent='GENERATOR 04';document.querySelector('#viewport').append(notice);
  let noticeTimer;
  function showArrival(){notice.classList.remove('visible');void notice.offsetWidth;notice.classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>notice.classList.remove('visible'),4200)}
  function update(dt,active){
    core.rotation.y+=dt*.16;
    const pulse=.85+Math.sin(performance.now()*.0012)*.15;
    coreLight.intensity=active?180*pulse:65*pulse;
    for(const {point,phase} of lamps)point.intensity=(active?14:4)*(0.8+Math.sin(performance.now()*.001+phase)*.18);
  }
  function worldFloor(x,z,y){return generatorFloorAt(x-11.4,z+34,y)}
  function canOccupy(x,z,y){return generatorCanOccupy(x-11.4,z+34,y)}
  function setActive(value){root.visible=value}
  return {root,returnTarget,endTarget,worldFloor,canOccupy,setActive,showArrival,update};
}
