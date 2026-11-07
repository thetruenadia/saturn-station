import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleOpening,OPENING_DURATION} from '../opening-timeline.mjs';
test('30 second chronology keeps door open until Maker has left',()=>{
 assert.equal(OPENING_DURATION,30);
 for(let t=0;t<=24.5;t+=.1)assert.equal(sampleOpening(t).door,1);
 assert.equal(sampleOpening(24.5).run,1);
 assert.ok(sampleOpening(25.5).door>0&&sampleOpening(25.5).door<1);
 assert.equal(sampleOpening(26.3).door,0);
 assert.equal(sampleOpening(29.9).done,false);
 assert.equal(sampleOpening(30).done,true);
});
test('Maker freezes, stands, and only then departs',()=>{
 assert.equal(sampleOpening(13).phase,'DISTURBANCE');
 assert.equal(sampleOpening(16).stand,0);
 assert.equal(sampleOpening(18).stand,.5);
 assert.equal(sampleOpening(18).run,0);
 assert.equal(sampleOpening(19).stand,1);
 assert.ok(sampleOpening(21).run>0);
});
test('sensor flickers do not rewind character or door chronology',()=>{
 assert.equal(sampleOpening(0).blackout,1);
 assert.equal(sampleOpening(2).blackout,0);
 assert.equal(sampleOpening(3).blackout,1);
 assert.equal(sampleOpening(8).blackout,0);
 assert.equal(sampleOpening(9.2).blackout,1);
 assert.equal(sampleOpening(30).blackout,1);
 let lastRun=0,lastDoor=1;
 for(let t=0;t<=31;t+=.025){const s=sampleOpening(t);assert.ok(s.blackout>=0&&s.blackout<=1);assert.ok(s.run>=lastRun);assert.ok(s.door<=lastDoor);lastRun=s.run;lastDoor=s.door;}
});
