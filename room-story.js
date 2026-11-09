import {WINDOW_APPROACH} from './room-layout.js';
export const ROOM_OBSERVATIONS={
 seat:{name:'WINDOW SEAT',lines:['The deck coating is worn away beneath the front legs. This chair was pulled up to the glass, again and again.']},
 exchanger:{name:'COOLANT EXCHANGER',lines:['Fresh bolts interrupt the old rust. The repair sleeve is newer than anything connected to it.']},
 converter:{name:'ROTARY CONVERTER',lines:['The converter feeds the exchanger through the west-wall bus. Every cable here has a destination.','A service date has been scratched over three times. This unit outlived its planned replacement.']},
 press:{name:'WORKSHOP PRESS',lines:['A jaw-shaped mark remains in the press bed. Someone tried to straighten the claw before giving up.','The tooling is worn smooth where a hand would steady it. This bay was used every shift.']},
 compressor:{name:'AUXILIARY COMPRESSOR',lines:['A cloth tied around the coupling catches the last drops of oil. Someone kept running it instead of fixing the seal.']},
 cup:{name:'MARA’S CUP',lines:['A pale ring marks the shelf beneath the cup. Whoever sat here watched the plumes for a long time.','Cold. The handle has been repaired rather than replaced.']},
 handover:{name:'UNFINISHED HANDOVER',lines:['“Converter vibration steady. Claw still binding. Tell the next shift—” The last line stops there.','There is no signature in the handover box.']},
 helmet:{name:'CREW HELMET',lines:['The seal is intact. The faceplate is polished on the inside, scratched on the outside.']},
 tray:{name:'SORTED REJECTS',lines:['Failed gripper jaws, sorted by fracture. These were kept for comparison, not thrown away.']}
};
export function nextObservation(id,counts){const record=ROOM_OBSERVATIONS[id];if(!record)return null;const n=counts[id]||0;counts[id]=n+1;return {name:record.name,text:record.lines[Math.min(n,record.lines.length-1)]}}
export function installRoomStory({THREE,scene,interactables,referenceAssets,terminal,exchanger,box,cylinder,pipeBetween,label,notify,sound,onWindow}){
 const ink=new THREE.MeshStandardMaterial({color:0x24322d,roughness:.9,metalness:.25}),cream=new THREE.MeshStandardMaterial({color:0xa4a28a,roughness:.95}),brass=new THREE.MeshStandardMaterial({color:0x9f8652,roughness:.8,metalness:.4});
 const counts={};
 const narration=document.createElement('aside');narration.id='room-narration';narration.hidden=true;narration.setAttribute('aria-live','polite');narration.innerHTML='<small>MU-1 / OBSERVATION</small><strong></strong><p></p>';document.querySelector('#viewport').append(narration);let until=0;
 function examineRoot(root,id){root.userData={...root.userData,name:ROOM_OBSERVATIONS[id].name,x:root.position.x,z:root.position.z,environmentType:'observe',observationId:id};interactables.push(root)}
 function prop(id,x,z){const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);examineRoot(root,id);return root}
 // Crew belongings occupy a shallow shelf below the observation port.
 const shelf=new THREE.Group();shelf.position.set(2.1,0,-9);scene.add(shelf);box(shelf,2,.13,.70,cream,0,1,0);for(const x of [-.8,.8])box(shelf,.09,1,.09,ink,x,.5,0);
 const cup=prop('cup',2,-8.9);cylinder(cup,.10,.09,.23,cream,0,1.19,0);const handle=new THREE.Mesh(new THREE.TorusGeometry(.08,.018,6,16),brass);handle.position.set(.12,1.2,0);cup.add(handle);const cupRing=new THREE.Mesh(new THREE.TorusGeometry(.13,.006,6,24),brass);cupRing.rotation.x=Math.PI/2;cupRing.position.set(0,1.075,0);cup.add(cupRing);
 const handover=prop('handover',8.3,-5);box(handover,1.25,.10,.65,ink,0,.9,0);for(const x of [-.48,.48])box(handover,.08,.85,.45,cream,x,.44,0);box(handover,.48,.015,.34,cream,-.1,.966,0);for(let i=0;i<4;i++)box(handover,.31,.004,.012,brass,-.1,.977,-.11+i*.055);
 const helmet=prop('helmet',11.2,-2.1);cylinder(helmet,.23,.27,.34,cream,0,1.15,0);box(helmet,.35,.14,.14,ink,0,1.18,.22);box(helmet,.65,.07,.45,ink,0,.93,0);box(helmet,.06,.93,.06,brass,0,.45,0);
 const tray=prop('tray',-5,4.1);box(tray,1.1,.10,.65,ink,0,.10,0);for(let i=0;i<3;i++){box(tray,.13,.10,.35,cream,-.3+i*.27,.2,0);box(tray,.14,.12,.12,brass,-.3+i*.27,.26,.16)}
 for(const x of [-.30,-.18,-.06])box(referenceAssets.press,.018,.006,.24,ink,x,.806,.03);
 examineRoot(referenceAssets.turbine,'converter');examineRoot(referenceAssets.press,'press');examineRoot(referenceAssets.engine,'compressor');examineRoot(exchanger,'exchanger');
 const window=referenceAssets.windowGroup;window.userData={name:'ENCELADUS OBSERVATION WINDOW',...WINDOW_APPROACH,environmentType:'window'};interactables.push(window);
 // Connected wall utilities and a restrained, continuous walking route replace scattered pads.
 for(const [a,b] of [[[-10.8,0.12,-8.5],[-11,.12,-5.7]],[[-11,.12,-5.7],[-11,.12,-2]],[[-11,.12,-2],[-11.4,.12,1.8]]])pipeBetween(scene,a,b,.045,brass);
 pipeBetween(scene,[-10.8,.15,-8.5],[-5.5,.15,-8.5],.055,ink);
 const stripe=new THREE.MeshLambertMaterial({color:0x686c53});
 function floorRoute([x,z],[endX,endZ]){
  const dx=endX-x,dz=endZ-z;
  const mark=new THREE.Mesh(new THREE.PlaneGeometry(Math.hypot(dx,dz),.06),stripe);
  mark.position.set((x+endX)/2,.078,(z+endZ)/2);
  mark.rotation.set(-Math.PI/2,0,-Math.atan2(dz,dx));
  mark.receiveShadow=true;
  scene.add(mark);
 }
 floorRoute([-6,5],[-3,5]);floorRoute([-3,5],[-3,-3]);floorRoute([-3,-3],[5,-3]);floorRoute([-3,-3],[-6,-6]);
 for(const [text,x,z] of [['01 / UTILITIES',-8,-4.5],['02 / SERVICE BAY',-6.8,3.45],['03 / CREW & CONTROL',5,-1]]){const mark=label(scene,text,x,.08,z,0,.6,0xa8b08b);mark.rotation.x=-Math.PI/2;mark.scale.x=3;}
 // An unoccupied seat angled toward the moon gives the crew corner a human focal point.
 const seat=new THREE.Group();seat.position.set(7.5,0,-8.9);scene.add(seat);box(seat,.65,.12,.65,cream,0,.6,0);box(seat,.65,.65,.1,ink,0,1,-.28);for(const x of [-.25,.25])for(const z of [-.24,.24])box(seat,.07,.55,.07,ink,x,.3,z);examineRoot(seat,'seat');for(const x of [-.25,.25])box(scene,.18,.006,.75,ink,7.5+x,.04,-8.65);
 function handleObject(o){if(o.userData.environmentType==='window'){narration.hidden=true;onWindow();return true}const entry=nextObservation(o.userData.observationId,counts);if(!entry)return false;narration.querySelector('strong').textContent=entry.name;narration.querySelector('p').textContent=entry.text;narration.hidden=false;until=performance.now()+8500;sound('select');return true}
 return {handle:handleObject,hide(){narration.hidden=true},update(blocked){if(blocked||performance.now()>until)narration.hidden=true},serialize(){return {...counts}},restore(data){if(data&&typeof data==='object')for(const id of Object.keys(ROOM_OBSERVATIONS))if(Number.isInteger(data[id])&&data[id]>=0)counts[id]=data[id]},props:{cup,handover,helmet,tray}};
}
