import test from 'node:test';import assert from 'node:assert/strict';
import {ROOM_LAYOUT,ROOM_COLLIDERS,LOCKER_BANK,SPEC_OUTPUT,WINDOW_APPROACH,roomPointClear,MAKER_EXIT_ROUTE} from '../room-layout.js';
import {ROOM_OBSERVATIONS,nextObservation} from '../room-story.js';
import {createObservationScene} from '../observation-view.js';
const Real=await import(process.env.THREE_MODULE||'three');
const THREE={...Real,TextureLoader:class{load(){return new Real.Texture()}}};
test('opening interactions remain reachable through real collision clearance',()=>{
 const lockers=Array.from({length:4},(_,i)=>[LOCKER_BANK.x+i*LOCKER_BANK.spacing,LOCKER_BANK.z,.48,.35]);const step=.25,queue=[[-9,6]],seen=new Set(['-9,6']);
 for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,nz=z+dz,key=nx+','+nz;if(!seen.has(key)&&roomPointClear(nx,nz,lockers)){seen.add(key);queue.push([nx,nz])}}}
 const targets=[ROOM_LAYOUT.generator,ROOM_LAYOUT.terminal,ROOM_LAYOUT.workArm,ROOM_LAYOUT.case,SPEC_OUTPUT,WINDOW_APPROACH,{x:11.4,z:-10.6},...lockers.map(([x,z])=>({x,z}))];
 for(const target of targets)assert(queue.some(([x,z])=>Math.hypot(x-target.x,z-target.z)<1.79),JSON.stringify(target));assert(queue.length>5000);
});
test('perimeter utility grouping leaves the centre clear and the station dock unobstructed',()=>{for(const key of ['generator','turbine','press','engine'])assert(ROOM_LAYOUT[key].x< -9);assert(roomPointClear(0,0));assert(roomPointClear(-7.35,2.2));assert(ROOM_LAYOUT.terminal.x>0);assert(LOCKER_BANK.x>0)});
test('optional observations are bounded and repeat without granting puzzle inventory',()=>{const counts={};for(const id of Object.keys(ROOM_OBSERVATIONS)){const first=nextObservation(id,counts);assert(first.text.length>25);for(let i=0;i<8;i++)assert(nextObservation(id,counts).text);assert.equal(counts[id],9)}assert.equal(nextObservation('unknown',counts),null)});
test('observation has a textured physical sphere, distant stars and attached plume depth',()=>{const v=createObservationScene(THREE);assert.equal(v.moon.children[0].geometry.type,'SphereGeometry');assert(v.moon.children[0].material.map);assert(v.stars.geometry.attributes.position.count>=600);assert.equal(v.plumes.children.length,10);assert(v.stars.geometry.attributes.position.getZ(0)< -10);assert.equal(v.plumes.parent,v.moon);v.scene.updateMatrixWorld(true);assert(Number.isFinite(new THREE.Box3().setFromObject(v.moon).max.y))});

test('Maker departure follows a clear aisle around the relocated lockers and furniture',()=>{const lockers=Array.from({length:4},(_,i)=>[LOCKER_BANK.x+i*LOCKER_BANK.spacing,LOCKER_BANK.z,.48,.35]);for(let i=1;i<MAKER_EXIT_ROUTE.length-1;i++){const a=MAKER_EXIT_ROUTE[i-1],b=MAKER_EXIT_ROUTE[i];for(let j=0;j<=40;j++){const t=j/40,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;assert(roomPointClear(x,z,lockers),x+','+z)}}});
