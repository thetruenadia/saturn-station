import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../maker-opening.js',import.meta.url),'utf8');
function fixture(){
 let completes=0,removed=0;
 const c=vm.createContext({active:true,leftLeaf:{position:{x:-1.85}},rightLeaf:{position:{x:1.85}},overlay:{remove(){}},maker:{visible:true},lap:{visible:true},lamp:{visible:true},robot:{visible:false},document:{body:{classList:{remove(){}}}},audio:{close(){}},window:{removeEventListener(){removed++}},onComplete(){completes++}});
 vm.runInContext(source.slice(source.indexOf(' function finish(){'),source.indexOf(" window.addEventListener('keydown',skipKey")),c);
 return {c,completes:()=>completes,removed:()=>removed};
}
test('Y skips once, restores robot, closes door and removes keyboard listener',()=>{
 const f=fixture();let prevented=false;
 f.c.skipKey({key:'Y',preventDefault(){prevented=true},stopImmediatePropagation(){}});
 assert.ok(prevented);assert.equal(f.c.active,false);assert.equal(f.c.robot.visible,true);assert.equal(f.c.maker.visible,false);assert.equal(f.c.leftLeaf.position.x,0);assert.equal(f.c.rightLeaf.position.x,0);
 f.c.finish();assert.equal(f.completes(),1);assert.equal(f.removed(),1);
});
test('unrelated keys and browser shortcuts do not skip',()=>{
 const f=fixture();for(const event of [{key:'x'},{key:'y',ctrlKey:true},{key:'y',metaKey:true},{key:'y',altKey:true}])f.c.skipKey(event);
 assert.equal(f.c.active,true);assert.equal(f.completes(),0);
});
