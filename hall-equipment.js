// Reference-led service fittings and analogue instruments share the hall's aged enamel palette.
export function installHallEquipment(THREE,scene){
 const cream=new THREE.MeshStandardMaterial({color:0x9b9c85,roughness:.96,metalness:.12});
 const green=new THREE.MeshStandardMaterial({color:0x53685b,roughness:.95,metalness:.18});
 const oxide=new THREE.MeshStandardMaterial({color:0x765440,roughness:.98});
 const dark=new THREE.MeshLambertMaterial({color:0x1d2927});
 const metal=new THREE.MeshStandardMaterial({color:0x737b6c,roughness:.83,metalness:.3});
 const glow=new THREE.MeshStandardMaterial({color:0x597264,emissive:0x426f55,emissiveIntensity:.4,roughness:1});
 function box(root,w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);root.add(o);return o}
 function pipe(root,points,r,m){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const o=new THREE.Mesh(new THREE.TubeGeometry(curve,20,r,7,false),m);root.add(o);return o}
 function round(root,r,d,m,x,y,z){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d,24),m);o.rotation.x=Math.PI/2;o.position.set(x,y,z);root.add(o);return o}
 function unit(name,x,y,z,angle=0){const root=new THREE.Group();root.name=name;root.position.set(x,y,z);root.rotation.y=angle;scene.add(root);return root}
 function vent(root,x,y,z,r){round(root,r,.18,metal,x,y,z);round(root,r*.82,.20,dark,x,y,z+.03);for(let i=-3;i<=3;i++){const yy=i*r*.2;const width=2*Math.sqrt(Math.max(0,r*r*.62-yy*yy));box(root,width,.045,.06,green,x,y+yy,z+.17)}}
 function gauge(root,x,y,z,r=.15){round(root,r,.1,dark,x,y,z);round(root,r*.79,.11,cream,x,y,z+.025);const needle=box(root,.018,r*.9,.017,oxide,x,y+r*.23,z+.10);needle.rotation.z=-.6}
 // Tall asymmetric louvre with round service caps, inspired by the elongated fittings sheet.
 for(const [x,y,z,a] of [[-39,3,7,Math.PI/2],[-39,-6,-18,Math.PI/2],[39,6,-10,-Math.PI/2]]){
  const root=unit('Louvred coolant service column',x,y,z,a);
  box(root,1.25,4.7,.58,green,0,0,0);box(root,1.04,3.9,.64,cream,0,.15,.08);
  for(let i=0;i<7;i++)box(root,.82,.12,.11,dark,0,1.6-i*.18,.46);
  vent(root,0,-.65,.46,.43);vent(root,0,-1.65,.46,.32);
  for(const side of [-1,1])pipe(root,[[side*.48,2.28,0],[side*.85,1.7,.2],[side*.85,-1.2,.2],[side*.44,-2.6,0]],.065,oxide);
  for(const yy of [-1.9,1.9])for(const xx of [-.46,.46])round(root,.043,.045,metal,xx,yy,.46);
 }
 for(const [x,y,z,a] of [[-37.6,-7.8,-24,Math.PI/2],[37.6,6,-32,-Math.PI/2],[-37.6,20,-18,Math.PI/2]]){
  const root=unit('Pressure regulator and inspection housing',x,y,z,a);
  pipe(root,[[0,-2.3,0],[0,2.6,0]],.13,oxide);box(root,.93,1.34,.65,green,0,0,.10);
  gauge(root,0,.23,.5,.29);vent(root,0,-.38,.5,.2);
  box(root,.58,.64,.56,cream,0,1.72,0);for(let i=0;i<5;i++)box(root,.42,.047,.06,dark,0,1.95-i*.1,.32);
 }
 // A complete operator station is fixed to the landing beside the stair route.
 const bench=unit('Generator 04 local instrument station',-4.25,0,9.8,.25);
 box(bench,2.25,1.03,.84,green,0,.59,0);box(bench,2.45,.14,1.08,metal,0,1.18,.10);
 for(const x of [-.93,.93])box(bench,.12,.3,.66,oxide,x,.15,0);
 box(bench,1.13,.94,.74,cream,-.39,1.72,-.08);box(bench,.89,.64,.05,dark,-.39,1.74,.32);box(bench,.73,.48,.018,glow,-.39,1.74,.355);
 for(let i=0;i<6;i++)box(bench,.52-i*.03,.012,.015,metal,-.43,1.89-i*.053,.37);
 box(bench,.94,.06,.35,dark,-.39,1.30,.55);
 for(let row=0;row<3;row++)for(let col=0;col<8;col++)box(bench,.075,.035,.055,cream,-.73+col*.095,1.34,.46+row*.08);
 box(bench,.72,.64,.48,oxide,.68,1.57,-.07);gauge(bench,.52,1.64,.2,.13);gauge(bench,.85,1.64,.2,.13);
 for(let i=0;i<4;i++)round(bench,.043,.06,i===0?glow:dark,.45+i*.15,1.37,.2);
 pipe(bench,[[-.77,1.51,-.45],[-1.25,1.4,-.6],[-1.3,.3,-.4],[-1.1,.15,-1.8],[-.8,.15,-3.2]],.045,dark);
 const rack=unit('Auxiliary diagnostic rack',-34.9,-9,-23,Math.PI/2);
 box(rack,1.4,2.6,.8,green,0,1.38,0);
 for(let i=0;i<4;i++){box(rack,1.24,.51,.09,cream,0,.47+i*.59,.45);gauge(rack,-.32,.48+i*.59,.52,.16);for(let j=0;j<4;j++)round(rack,.035,.07,dark,.05+j*.17,.49+i*.59,.54)}
}
