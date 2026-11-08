// A third finger mounted on the back of the existing two-jaw wrist.
export function createAccessProbe(THREE){
 const root=new THREE.Group();root.name='door-access-probe';root.position.set(-.3,-1.25,-.075);
 const paint=new THREE.MeshStandardMaterial({color:0x7e8c70,metalness:.55,roughness:.65});
 const steel=new THREE.MeshStandardMaterial({color:0x424c49,metalness:.8,roughness:.48});
 const contact=new THREE.MeshStandardMaterial({color:0xc3a967,metalness:.8,roughness:.32});
 const block=(name,w,h,d,m,x,y,z)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.name=name;o.position.set(x,y,z);o.castShadow=true;root.add(o);return o};
 block('wrist-saddle',.28,.12,.08,steel,0,0,0);
 block('finger-root',.095,.18,.09,paint,0,-.10,-.025);
 const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,.13,12),steel);hinge.rotation.z=Math.PI/2;hinge.position.set(0,-.18,-.025);root.add(hinge);
 block('third-finger',.075,.24,.075,paint,0,-.29,-.01);
 block('keyed-connector',.065,.10,.09,steel,0,-.45,.005);
 for(const side of [-1,1])block('electrical-contact',.015,.075,.025,contact,side*.018,-.46,.056);
 block('connector-key',.025,.055,.035,contact,.043,-.44,.005);
 root.visible=false;return root;
}
