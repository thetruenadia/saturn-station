import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const s=await fs.readFile(new URL('prototype-3d.js',import.meta.url),'utf8');
function fn(name){const a=s.indexOf('function '+name+'(');let depth=0,b=s.indexOf('{',a);for(let i=b;i<s.length;i++){if(s[i]==='{')depth++;if(s[i]==='}'&&!--depth)return s.slice(a,i+1)}throw Error(name)}
const fixture=()=>({light:{intensity:0},material:{emissiveIntensity:0},intensity:40});
const ctx={powerOn:false,powerElapsed:0,reducedMotion:false,workFixtures:[fixture(),fixture()],redFixtures:[fixture()],ambient:{},keyLight:{},hasArm:false,hasCell:false,usedCell:false};
vm.createContext(ctx);vm.runInContext(fn('ownsInspectionItem')+fn('updateLighting')+fn('interactionHint'),ctx);
assert.equal(ctx.ownsInspectionItem('arm'),false);ctx.hasArm=true;assert.equal(ctx.ownsInspectionItem('arm'),true);ctx.hasCell=true;ctx.usedCell=true;assert.equal(ctx.ownsInspectionItem('cell'),false);
ctx.updateLighting(1);assert.equal(ctx.workFixtures[0].light.intensity,0);assert.equal(ctx.redFixtures[0].light.intensity,14);
ctx.powerOn=true;ctx.powerElapsed=0;ctx.updateLighting(.2);assert(ctx.workFixtures[0].light.intensity<ctx.workFixtures[1].light.intensity,'staggered ignition');
ctx.updateLighting(4);assert.equal(ctx.workFixtures[0].light.intensity,40);assert(ctx.redFixtures[0].light.intensity<2);
ctx.powerOn=false;ctx.updateLighting(0);assert.equal(ctx.workFixtures[0].light.intensity,0);assert.equal(ctx.redFixtures[0].light.intensity,14);
ctx.powerOn=true;ctx.reducedMotion=true;ctx.powerElapsed=0;ctx.updateLighting(.2);const first=ctx.workFixtures[0].light.intensity;ctx.updateLighting(.2);assert(ctx.workFixtures[0].light.intensity>first,'reduced motion fades without ignition dips');
ctx.armEquipped=false;assert.equal(ctx.interactionHint({userData:{name:'SEALED SERVICE CASE'}}),'MANIPULATOR REQUIRED');
assert(s.includes('if(resettingProgress)return;'),'reset cannot be overwritten on pagehide');
console.log('PASS ownership, consumed-item guard, red start, staggered ignition, settled power, power off, reduced-motion fade, contextual prompt, restart save guard');
