import test from 'node:test';
import assert from 'node:assert/strict';
// THREE_MODULE can point to the exact module already used by the browser build.
const Real=await import(process.env.THREE_MODULE||'three');
import {installReferenceAssets} from '../reference-assets.js';
const context=new Proxy({},{get:(o,k)=>o[k]||(()=>{})});
globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>context})};
const THREE={...Real,TextureLoader:class{load(){return new Real.Texture()}}};
function setup(){
 const scene=new THREE.Scene(),objects={};for(const k of ['cell','caseGroup','lidPivot','hatch','hatchDoor','leftLeaf','rightLeaf','mountedArm','arm','generator','generatorLever'])objects[k]=new THREE.Group();
 objects.mountedArm.name='mounted-service-arm';scene.add(objects.caseGroup,objects.hatch,objects.arm,objects.generator);objects.generator.add(objects.generatorLever);objects.caseGroup.add(objects.cell,objects.lidPivot);objects.hatch.add(objects.hatchDoor);objects.hatchDoor.add(objects.leftLeaf,objects.rightLeaf);
 const stationArt={compressor:new THREE.Group(),cabinet:new THREE.Group()};scene.add(stationArt.compressor,stationArt.cabinet);
 const box=(p,w,h,d,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);p.add(o);return o};
 const cylinder=(p,r1,r2,h,m,x=0,y=0,z=0,rx=0,rz=0)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,12),m);o.position.set(x,y,z);o.rotation.set(rx,0,rz);p.add(o);return o};
 const result=installReferenceAssets({THREE,scene,...objects,box,cylinder,wornPaint:c=>new THREE.MeshStandardMaterial({color:c}),stationArt});return {scene,objects,result};
}
test('replacements preserve gameplay ownership, lid hinge, and sliding leaf objects',()=>{const {objects:o}=setup();assert.equal(o.cell.parent,o.caseGroup);assert.equal(o.lidPivot.parent,o.caseGroup);assert.equal(o.leftLeaf.parent,o.hatchDoor);assert.equal(o.rightLeaf.parent,o.hatchDoor);assert.equal(o.hatchDoor.parent,o.hatch);assert.equal(o.cell.visible,false);o.lidPivot.rotation.x=-1.35;assert.equal(o.cell.parent,o.caseGroup);});
test('all authored mesh positions and world bounds are finite',()=>{const {scene}=setup();scene.updateMatrixWorld(true);let count=0;scene.traverse(o=>{if(o.isMesh){count++;const b=new THREE.Box3().setFromObject(o);assert(Number.isFinite(b.min.x)&&Number.isFinite(b.max.y)&&Number.isFinite(b.max.z),o.name||o.geometry.type)}});assert(count>100);});
test('mechanisms are stationary when unpowered and animate when powered',()=>{const {result:r}=setup();const angle=r.rotors[0].rotation.z;for(let i=0;i<60;i++)r.update(1/60,false);assert.equal(r.rotors[0].rotation.z,angle);for(let i=0;i<60;i++)r.update(1/60,true);assert.notEqual(r.rotors[0].rotation.z,angle);assert.notEqual(r.reciprocators[0].node.position.y,r.reciprocators[0].base);});
test('power-off winds machinery down to a complete stop',()=>{const {result:r}=setup();r.update(1,true);for(let i=0;i<600;i++)r.update(1/60,false);const a=r.rotors[0].rotation.z;r.update(1,false);assert.equal(r.rotors[0].rotation.z,a);});
test('reduced motion leaves mechanisms static while power indicators still respond',()=>{const {result:r}=setup();r.update(1,true,true);assert.equal(r.rotors[0].rotation.z,0);assert.equal(r.reciprocators[0].node.position.y,r.reciprocators[0].base);});
test('collision footprints describe the authored machines rather than deleted props',()=>{const {result:r}=setup();for(const g of [r.workArm,r.turbine,r.press,r.engine])assert(r.colliders.some(([x,z])=>x===g.position.x&&z===g.position.z));assert(!r.colliders.some(([x,z])=>x===-5&&z===-3));});

test('the collectible geometry rests on the deck inside the lowered work claw',()=>{const {scene,objects:o}=setup();scene.updateMatrixWorld(true);const body=o.arm.getObjectByName('mounted-service-arm');const bounds=new THREE.Box3().setFromObject(body);assert(Math.abs(bounds.min.y-.09)<.001);assert(Math.hypot(o.arm.position.x+9,o.arm.position.z-2.2)<3);});

test('loose claw has only its salvage model and no recovery marker meshes',()=>{const {objects:o}=setup();assert.equal(o.arm.children.length,1);assert.equal(o.arm.children[0].name,'mounted-service-arm');assert(!o.arm.children.some(c=>c.geometry?.type==='TorusGeometry'))});
