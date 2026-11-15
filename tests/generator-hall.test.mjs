import test from 'node:test';
import assert from 'node:assert/strict';
import {GENERATOR_LEVELS,generatorFloorAt,generatorCanOccupy} from '../generator-hall.js';

test('arrival bridge joins the level-zero generator gallery',()=>{
  assert.equal(generatorFloorAt(0,16,0),0);
  assert.equal(generatorFloorAt(34,13,0),0);
  assert.equal(generatorCanOccupy(0,16,0),true);
});

test('all generator levels are linked by continuous descending stair flights',()=>{
  for(let i=0;i<GENERATOR_LEVELS.length-1;i++){
    const start=-18-i*11,end=start-11;
    const y0=GENERATOR_LEVELS[i],y1=GENERATOR_LEVELS[i+1];
    assert.equal(generatorFloorAt(34,start,y0),y0, 'flight starts at its gallery');
    assert.equal(generatorFloorAt(34,end,y1),y1, 'flight arrives at the next gallery');
    let previous=y0;
    for(let z=start;z>=end;z-=.1){
      const y=generatorFloorAt(34,z,y0);
      assert.notEqual(y,null, 'stair surface remains walkable');
      assert.ok(Math.abs(y-previous)<.1, 'stair height changes continuously');
      assert.equal(generatorCanOccupy(34,z,y),true);
      previous=y;
    }
  }
});

test('lower gallery gate stands on the bottom level and the core void is not walkable',()=>{
  assert.equal(generatorFloorAt(34,-64,-32),-32);
  assert.equal(generatorCanOccupy(34,-64,-32),true);
  assert.equal(generatorFloorAt(0,-30,0),null);
  assert.equal(generatorCanOccupy(44,-64,-32),false);
});
