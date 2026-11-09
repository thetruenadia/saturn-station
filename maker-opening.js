import {MAKER_EXIT_ROUTE} from './room-layout.js';
import * as THREE from 'three';
import {sampleOpening,OPENING_DURATION} from './opening-timeline.mjs';

// Owns only cinematic presentation. Workshop, robot, door and gameplay stay in the host scene.
export function createMakerOpening({scene,robot,leftLeaf,rightLeaf,viewport,onComplete,isSoundEnabled=()=>true}){
 const camera=new THREE.PerspectiveCamera(66,1,.05,100);
 // Optical sensor of the seated/slumped MU-1, at the existing repair-bay spawn.
 camera.position.set(robot.position.x,.92,robot.position.z);
 camera.lookAt(2,1.35,-3.5);camera.rotateZ(-.075);
 const coat=new THREE.MeshStandardMaterial({color:0xc4b895,roughness:.95});
 const rust=new THREE.MeshStandardMaterial({color:0x9a5838,roughness:.9});
 const dark=new THREE.MeshStandardMaterial({color:0x302e29,roughness:.95});
 const skin=new THREE.MeshStandardMaterial({color:0xb89172,roughness:.9});
 const maker=new THREE.Group();scene.add(maker);
 const torso=new THREE.Group();maker.add(torso);
 function box(parent,size,material,pos){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.position.set(...pos);m.castShadow=true;parent.add(m);return m;}
 box(torso,[.7,.85,.42],coat,[0,1.2,0]);
 box(torso,[.73,.1,.46],rust,[0,.91,0]);
 const head=new THREE.Group();head.position.y=1.9;torso.add(head);
 box(head,[.38,.4,.35],skin,[0,0,.03]);box(head,[.58,.29,.54],coat,[0,.22,0]);
 box(head,[.65,.08,.62],rust,[0,.12,.02]);box(head,[.18,.32,.3],dark,[-.35,.16,0]);
 box(head,[.39,.12,.08],dark,[0,.12,.22]);
 for(const x of [-.09,.09])box(head,[.055,.04,.025],dark,[x,.01,.215]);
 box(head,[.4,.09,.37],dark,[0,.13,.04]);box(torso,[.5,.17,.51],rust,[0,1.68,0]);
 const arms=[],legs=[];
 for(const side of [-1,1]){
  const arm=new THREE.Group();arm.position.set(side*.43,1.52,0);torso.add(arm);
  box(arm,[.24,.57,.26],coat,[0,-.25,0]);box(arm,[.22,.22,.24],dark,[0,-.6,.03]);arms.push(arm);
  const leg=new THREE.Group();leg.position.set(side*.21,.83,0);maker.add(leg);
  box(leg,[.27,.66,.29],dark,[0,-.29,0]);box(leg,[.32,.2,.52],rust,[0,-.74,.1]);legs.push(leg);
 }
 // Seated lower chassis stays in view while the optical camera remains immobile.
 const lap=new THREE.Group();lap.position.set(robot.position.x,.25,robot.position.z);lap.rotation.y=Math.atan2(11,-9.5);scene.add(lap);
 for(const side of [-1,1]){box(lap,[.22,.24,.55],rust,[side*.28,0,.38]);box(lap,[.24,.3,.25],dark,[side*.28,-.08,.66]);}
 const tool=box(arms[1],[.07,.44,.08],rust,[0,-.76,.05]);tool.rotation.z=.4;
 // The existing door opens onto a short service passage, visible only through its aperture.
 const corridor=new THREE.Group();scene.add(corridor);
 box(corridor,[3.5,.22,5],dark,[11.4,-.12,-13.2]);
 for(const x of [9.45,13.35])box(corridor,[.25,3.5,5],dark,[x,1.6,-13.2]);
 box(corridor,[4,3.5,.2],dark,[11.4,1.6,-15.7]);
 const lamp=new THREE.PointLight(0xf2c78b,9,5);lamp.position.set(-6.8,1.8,4);scene.add(lamp);
 const overlay=document.createElement('section');overlay.id='maker-opening';overlay.innerHTML='<div class="boot-black"></div><div class="boot-caption" role="status" aria-live="polite"></div><button class="boot-action">BEGIN BOOT SEQUENCE</button><button class="boot-skip" aria-label="Skip cutscene (Y)"><kbd>Y</kbd> SKIP CUTSCENE</button>';viewport.append(overlay);
 const black=overlay.querySelector('.boot-black'),caption=overlay.querySelector('.boot-caption'),button=overlay.querySelector('button');
 let elapsed=0,started=false,active=true,finished=false,audio;
 const fired=new Set();
 function tone(frequency,duration,volume=.08){if(!audio||!isSoundEnabled())return;const osc=audio.createOscillator(),gain=audio.createGain();osc.type='triangle';osc.frequency.setValueAtTime(frequency,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(35,audio.currentTime+duration);gain.gain.setValueAtTime(volume,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);osc.connect(gain).connect(audio.destination);osc.start();osc.stop(audio.currentTime+duration);}
 function finish(){
  if(!active)return;
  active=false;leftLeaf.position.x=rightLeaf.position.x=0;
  overlay.remove();maker.visible=false;lap.visible=false;lamp.visible=false;robot.visible=true;
  document.body.classList.remove('opening-active');audio?.close();
  window.removeEventListener('keydown',skipKey,true);onComplete();
 }
 function skipKey(event){
  if(!active||event.key.toLowerCase()!=='y'||event.ctrlKey||event.metaKey||event.altKey)return;
  event.preventDefault();event.stopImmediatePropagation();finish();
 }
 window.addEventListener('keydown',skipKey,true);
 overlay.querySelector('.boot-skip').addEventListener('click',finish);
 button.addEventListener('click',()=>{
  if(finished){finish();return;}
  started=true;button.hidden=true;
  try{audio=new (window.AudioContext||window.webkitAudioContext)();audio.resume();tone(95,.6);}catch{/* Silent playback remains usable. */}
 });
 document.body.classList.add('opening-active');robot.visible=false;
 leftLeaf.position.x=-1.85;rightLeaf.position.x=1.85;
 function resize(w,h){camera.aspect=w/h;camera.updateProjectionMatrix();}
 function update(dt){
  if(!active)return;
  if(started&&!finished&&!document.hidden)elapsed=Math.min(OPENING_DURATION,elapsed+dt);
  const s=sampleOpening(elapsed);black.style.opacity=s.blackout;
  const repair=new THREE.Vector3(-7.6,0,4.8);
  // Follow clear aisles, skirting the central machinery and east-wall cabinets.
  const route=MAKER_EXIT_ROUTE.map(([x,z])=>new THREE.Vector3(x,0,z));
  const lengths=route.slice(1).map((p,i)=>p.distanceTo(route[i]));
  let distance=s.run*lengths.reduce((a,b)=>a+b,0),segment=0;
  while(segment<lengths.length-1&&distance>lengths[segment])distance-=lengths[segment++];
  maker.position.lerpVectors(route[segment],route[segment+1],distance/lengths[segment]);
  const crouch=1-s.stand;maker.position.y=-.48*crouch;
  const face=Math.atan2(camera.position.x-repair.x,camera.position.z-repair.z);
  const heading=Math.atan2(route[segment+1].x-route[segment].x,route[segment+1].z-route[segment].z);
  const exitHeading=Math.atan2(11.4-repair.x,-10.6-repair.z);
  const turn=Math.atan2(Math.sin(exitHeading-face),Math.cos(exitHeading-face));
  maker.rotation.y=elapsed<13?face:elapsed<19?face+turn*.65:heading;
  torso.rotation.x=.3*crouch;head.rotation.y=elapsed>=13&&elapsed<19?turn*.35:0;
  head.rotation.x=elapsed<11?.22:elapsed<13?-.12:0;
  const working=elapsed<13,run=elapsed>=19&&elapsed<24.5;
  arms.forEach((arm,i)=>{arm.rotation.x=working?-1.1+Math.sin(elapsed*7+i)*.12:run?Math.sin(elapsed*12+i*Math.PI)*.85:0;});
  legs.forEach((leg,i)=>{leg.rotation.x=run?Math.sin(elapsed*12+i*Math.PI)*.85:-.7*crouch;});
  maker.visible=elapsed<24.5;
  leftLeaf.position.x=-1.85*s.door;rightLeaf.position.x=1.85*s.door;
  caption.textContent=!started?'MAINTENANCE UNIT // MOTOR CONTROL OFFLINE':s.phase==='DISTURBANCE'?'[Distant metallic impacts]':s.phase==='DOOR CLOSING'?'[Automatic bulkhead closing]':s.phase==='OPTICAL FAILURE'?'OPTICAL SIGNAL LOST':s.phase==='SENSOR ACTIVE'?'OPTICAL SENSOR // ACTIVE':'MU-1 // INITIALISING';
  for(const [time,freq,duration] of [[2,210,.15],[6,160,.2],[13,70,.65],[16,52,.8],[24.8,130,1.4],[26.2,48,.5],[28,280,.3]])if(elapsed>=time&&!fired.has(time)){fired.add(time);tone(freq,duration);}
  if(s.done&&!finished){finished=true;button.hidden=false;button.textContent='REBOOT · ENTER WORKSHOP';}
 }
 update(0);
 return {camera,resize,update,skip:finish,get active(){return active;},get elapsed(){return elapsed;}};
}

