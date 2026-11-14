import test from 'node:test';
import assert from 'node:assert/strict';
import {hallPointClear,hallFloorHeight,createGeneratorHallScene} from '../generator-hall.js';
const THREE=await import(process.env.THREE_MODULE||'three');
test('hall landing reaches its doorway and stops at every broken edge',()=>{
 for(let z=4.6;z<=19.2;z+=.1)assert(hallPointClear(0,z));
 for(const [x,z] of [[0,4.59],[5.81,8],[1.26,15],[-1.26,15],[0,19.21],[30,-12]])assert(!hallPointClear(x,z));
 for(const x of [-5.8,5.8])assert(hallPointClear(x,8));
});
test('hall has a vessel extending above and below the landing and finite geometry',()=>{
 const {scene,furnaceLight}=createGeneratorHallScene(THREE);
 const bounds=new THREE.Box3().setFromObject(scene);
 assert(bounds.min.y< -30);assert(bounds.max.y>50);assert(bounds.max.x-bounds.min.x>80);
 let meshCount=0;scene.traverse(o=>{if(!o.isMesh)return;meshCount++;const a=o.geometry.attributes.position;for(let i=0;i<a.array.length;i++)assert(Number.isFinite(a.array[i]))});
 assert(meshCount>600);assert(furnaceLight.position.y<0);
});

test('the service landing, descending stairs and lower gallery meet at the same height',()=>{
 assert.equal(hallFloorHeight(-6,8),0);assert.equal(hallFloorHeight(-32,8),0);
 let previous=0;for(let z=8;z>=-20;z-=.1){const y=hallFloorHeight(-32,z);assert(y!==null);assert(Math.abs(y-previous)<.04);previous=y}
 assert.equal(hallFloorHeight(-32,-20),-9);assert.equal(hallFloorHeight(-36,-20),-9);assert.equal(hallFloorHeight(-36,-60),-9);
 assert.equal(hallFloorHeight(-29,-5),null);assert.equal(hallFloorHeight(-4,10),null);
});
