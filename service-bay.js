// Structural dressing stays behind the interactive equipment and above the clear floor route.
export function installServiceBay({THREE,scene,layout,lockers,box,cylinder,wornPaint}){
 const bay=new THREE.Group();
 bay.name='B-7 overhead services and recessed cabinets';
 scene.add(bay);
 const enamel=wornPaint(0x426760,176);
 const bulkhead=wornPaint(0x647979,193);
 const skin=bulkhead.map.image;
 const paint=skin.getContext('2d');
 for(const [x,y,len] of [[21,27,113],[44,18,42],[93,72,143],[112,35,83],[162,15,94],[221,46,170],[239,22,69]]){
  const stain=paint.createLinearGradient(0,y,0,y+len);
  stain.addColorStop(0,'#472d23c0');stain.addColorStop(.23,'#844e31a0');stain.addColorStop(1,'#8f553000');
  paint.fillStyle=stain;
  paint.beginPath();paint.moveTo(x-6,y);paint.lineTo(x+5,y+4);
  paint.lineTo(x+3,y+len*.63);paint.lineTo(x-1,y+len);
  paint.lineTo(x-3,y+len*.4);paint.closePath();paint.fill();
 }
 bulkhead.map.needsUpdate=true;
 const cabinet=wornPaint(0x64664e,183);
 const oxide=wornPaint(0x593c2f,191);
 const steel=new THREE.MeshStandardMaterial({color:0x484e48,roughness:.94,metalness:.18});
 const gasket=new THREE.MeshLambertMaterial({color:0x121614});
 const cable=[0x574d37,0x72644a,0x363b36,0x252c2b,0x696c54].map(color=>new THREE.MeshLambertMaterial({color}));
 const brass=new THREE.MeshStandardMaterial({color:0x9c8354,roughness:.78,metalness:.27});
 const mount=(w,h,d,m,x,y,z)=>box(bay,w,h,d,m,x,y,z,false);
 function tube(points,r,material,segments=38){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)),false,'centripetal');
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,segments,r,7,false),material);
  mesh.receiveShadow=true;
  bay.add(mesh);
  return mesh;
 }
 function bolt(x,y,z,axis='z'){
  const head=cylinder(bay,.037,.037,.037,steel,x,y,z,axis==='z'?Math.PI/2:0,axis==='x'?Math.PI/2:0);
  head.castShadow=false;
 }
 function collar(x,y,z,axis,r=.42){
  const band=cylinder(bay,r,r,.18,oxide,x,y,z,axis==='z'?Math.PI/2:0,axis==='x'?Math.PI/2:0);
  band.castShadow=false;
  return band;
 }

 // A cabinet shell wraps the existing working doors. The frontage and its aisle stay unobstructed.
 const left=lockers.x-.53,right=layout.terminal.x+1.18,centre=(left+right)/2;
 mount(right-left,.22,.95,enamel,centre,2.42,-10.07);
 mount(right-left,.19,.72,gasket,centre,.10,-10.30);
 for(const x of [left-.04,layout.terminal.x-1.13,right+.04])mount(.16,3.3,.84,enamel,x,1.65,-10.15);
 mount(right-left,1.04,.15,cabinet,centre,3.02,-10.50);
 mount(right-left,.18,.86,enamel,centre,3.65,-10.18);
 for(let i=0;i<4;i++){
  const x=lockers.x+i*lockers.spacing;
  mount(.82,.59,.17,cabinet,x,2.96,-10.31);
  mount(.18,.037,.026,brass,x-.23,3.08,-10.21);
  for(const dx of [-.33,.33])for(const y of [2.74,3.18])bolt(x+dx,y,-10.20);
  tube([[x,3.27,-10.36],[x,3.74,-10.31],[x+.28,4.04,-10.29],[x+.65,4.04,-10.29]],.033,cable[i]);
 }
 for(let i=0;i<5;i++){
  const x=layout.terminal.x-.63+i*.22;
  tube([[x,2.75,-10.25],[x,3.66,-10.08],[x-.11,4.13,-10.11],[-2,4.35+i*.063,-10.07],[-5.25,4.43+i*.063,-10.07]],.032,cable[i]);
 }

 // Deckhead panels face the room so the orbit camera can still look down into the cutaway.
 const roof=new THREE.PlaneGeometry(3.95,3.13);
 for(let x=-12;x<=12;x+=4)for(let z=-8.98;z<=10;z+=3.16){
  const panel=new THREE.Mesh(roof,(Math.round(x/4)+Math.round(z/3.16))%3===0?bulkhead:steel);
  panel.rotation.x=Math.PI/2;
  panel.position.set(x,7.62,z);
  bay.add(panel);
 }
 // Steel canopy along the service wall, with open ladder trays like the observatory reference.
 for(const x of [-12.6,-8.4]){
  mount(.22,.30,12.8,enamel,x,6.55,-2.35);
  for(const z of [-7.6,-3.2,1.1,3.95]){
   mount(.16,.17,.75,steel,x,6.29,z);
   bolt(x-.12,6.16,z,'x');
  }
 }
 for(const z of [-8.15,-4.5,-.8,3.85])mount(4.45,.30,.25,enamel,-10.5,6.47,z);
 for(const x of [-12.92,-12.34,-9.42,-8.84])mount(.085,.12,12.3,steel,x,6.79,-2.15);
 for(let z=-8.15;z<4;z+=.49){
  mount(.61,.045,.07,steel,-12.63,6.74,z);
  mount(.61,.045,.07,steel,-9.13,6.74,z);
 }
 for(const z of [-7.4,-4.2,4.85,7.9]){
  mount(.14,4.35,2.98,bulkhead,-13.47,3.43,z);
  for(const dz of [-1.39,1.39])for(const y of [1.49,5.39])bolt(-13.38,y,z+dz,'x');
 }
 // Enclosed machine bay attached to the west shell.
 for(const z of [-.95,3.92]){
  mount(.26,5.75,.26,enamel,-13.15,2.9,z);
  mount(.24,.28,4.78,enamel,-10.85,5.77,z);
  mount(.52,.12,.50,oxide,-13.15,.10,z);
 }
 mount(.26,.25,5.13,enamel,-8.52,6.02,1.49);
 for(const z of [-.4,.56,1.52,2.48,3.44]){
  mount(.12,2.9,.88,cabinet,-13.36,2.54,z);
  for(const y of [1.25,3.88])bolt(-13.27,y,z,'x');
 }

 for(const x of [-10.85,-6.95]){
  mount(.22,.23,1.38,enamel,x,4.1,-10.01);
  mount(.15,1.95,.16,oxide,x,5.88,-9.93);
 }
 // Heavy line runs from the cabinet, along the west bay, across the north bulkhead and through the exit.
 tube([[-11.2,2.12,-8.85],[-11.2,4.94,-8.85],[-11.2,6.21,-8.35],[-11.2,6.24,-5.8],[-11.2,6.24,2.4],[-10.45,6.29,3.1],[-9.2,6.3,3.1]],.32,oxide,60);
 tube([[-11.2,6.24,-5.8],[-11.2,6.55,-8.4],[-10.4,6.94,-9.37],[-7,6.99,-9.54],[5.3,6.99,-9.54],[10.45,6.99,-9.54],[11.42,6.9,-10.55],[11.42,6.9,-12.0]],.34,oxide,76);
 for(const z of [-7.1,-4.3,-1.3,1.62])collar(-11.2,6.24,z,'z');
 for(const x of [-8.2,-5.6,-2.8,.1,3.35,6.7,9.4]){
  collar(x,6.99,-9.54,'x');
  mount(.12,.76,.12,steel,x,7.38,-9.54);
 }
 for(const x of [-10.52,-9.66]){
  collar(x,6.29,3.1,'x',.47);
  mount(.12,.67,.19,enamel,x,6.64,3.1);
 }
 // A deliberately symmetrical junction carries the larger station's original engineering.
 mount(2.2,.37,3.36,enamel,-10.05,6.32,1.55);
 for(const x of [-10.88,-10.33,-9.77,-9.22]){
  collar(x,5.98,1.05,'y',.22);
  mount(.29,.29,.55,steel,x,6.03,1.05);
  bolt(x,5.94,1.36);
 }
 for(let i=0;i<21;i++){
  const row=Math.floor(i/7),offset=(i%7-3)*.067;
  const z=.18+row*1.17,low=3.16+row*.34+(i%4)*.19;
  tube([[-10.56+offset,6.12,z],[-10.37+offset,5.18,z+.13],
   [-10.08+offset,low+.39,z+.26],[-9.26+offset,low,z+.61],
   [-8.92+offset,4.48+row*.2,z+.82],[-8.86+offset*.52,6.23,z+.69]],.027+(i%4)*.009,cable[i%5]);
 }
 for(let i=0;i<8;i++){
  const offset=(i-3.5)*.10;
  tube([[-11.28+offset,6.16,.77],[-11.42+offset,4.85,1.4],[-11.26+offset,3.38-i%3*.16,1.5],
   [-10.77+offset,2.55-i%3*.13,2.15],[-10.23+offset,1.25+i%3*.13,2.54]],.03+(i%2)*.018,cable[(i+2)%5]);
 }
 // The hanging drops terminate in a distribution strip bolted behind the arm.
 mount(.94,.58,.31,cabinet,-10.23,1.47,2.70);
 mount(.13,1.26,.16,steel,-10.48,.66,2.70);
 for(const x of [-10.57,-9.89])for(const y of [1.26,1.68])bolt(x,y,2.88);
 tube([[-10.04,1.21,2.70],[-9.93,.64,2.64],[-9.63,.35,2.45],[-9.36,.32,2.23]],.078,cable[3]);
 // The return bundle disappears into its tray through a row of strain reliefs.
 mount(.69,.31,3.02,enamel,-8.86,6.32,2.04);
 for(const z of [.87,2.04,3.21])collar(-8.86,6.12,z,'y',.19);
 // Dead spur and a newer flexible bypass physically feed into the working equipment.
 tube([[-11.2,6.23,-1.3],[-12,5.72,-1.3],[-12.33,4.18,-1.3]],.18,oxide);
 collar(-12.33,4.17,-1.3,'y',.24);
 mount(.41,.11,.41,gasket,-12.33,4.07,-1.3);
 tube([[-12.32,4.7,-1.32],[-12.5,4.0,-.82],[-12.4,2.45,-.2],[-11.8,1.28,.24],[-11.32,1.19,.43],[-11.51,1.07,1.59]],.074,cable[1]);
 const actuator=cylinder(bay,.18,.18,.53,brass,-11.2,5.9,-6.8);
 actuator.castShadow=false;
 for(let i=0;i<3;i++){
  const x=10.13+i*.15;
  tube([[x,6.94,-9.56],[x,6.44,-10.04],[x,3.73,-10.34],[10.06,2.48+i*.12,-10.25]],.038,cable[i]);
 }
 // A feeder branches from the exit main into the converter's top housing.
 const {x:converterX,z:converterZ}=layout.turbine;
 tube([[8.0,6.99,-9.54],[8.95,6.84,-8.92],[9.23,6.56,-8.0],
  [converterX+.75,6.37,-2.0],[converterX+.75,6.37,converterZ-2.22]],.14,oxide,52);
 for(const z of [-8,-4.4,-.8])mount(.13,1.11,.15,steel,converterX+.75,7.06,z);
 const rotorLamp=new THREE.PointLight(0xb9cbbe,0,13,2);
 rotorLamp.position.set(converterX-2.8,6.4,converterZ+2.7);
 scene.add(rotorLamp);
 // Narrow trim on the service wall gives the pipes a readable silhouette before full power.
 const bounced=new THREE.PointLight(0xe6cfa8,27,10,2);
 bounced.position.set(-7.75,5.1,3.9);
 scene.add(bounced);
 return {update(powered,time,reduced){
  const t=powered?Math.max(0,time-.4):0;
  actuator.position.y=5.9-(t>0?.14:0)+(reduced?0:Math.sin(t*17)*Math.exp(-t*2.4)*.065);
  bounced.intensity=powered?27+12*Math.min(1,t*1.2):27;
  rotorLamp.intensity=powered?9+27*Math.min(1,t*.8):9;
 }};
}
