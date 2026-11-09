import test from 'node:test';
import assert from 'node:assert/strict';
import {createBackgroundMusic} from '../background-music.js';
function setup(saved,{blocked=false}={}){
 const doc=new EventTarget(),win=new EventTarget(),media=new EventTarget();doc.hidden=false;
 let plays=0;Object.assign(media,{paused:true,currentTime:0,duration:70,canPlayType:()=>'',play(){plays++;if(blocked)return Promise.reject(Error('NotAllowedError'));this.paused=false;return Promise.resolve()},pause(){this.paused=true}});
 const values=new Map(saved?[['saturn-station-music-position-v1',JSON.stringify(saved)]]:[]);
 const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 const player=createBackgroundMusic({media,doc,win,storage});return {player,media,doc,win,values,get plays(){return plays}};
}
const flush=()=>new Promise(r=>setTimeout(r,0));
test('attempts autoplay and repeated gestures do not restart the loop',async()=>{const s=setup();assert.equal(s.plays,1);s.player.unlock();await flush();s.media.currentTime=12;s.player.unlock();assert.equal(s.plays,1);assert.equal(s.media.currentTime,12);assert.equal(s.media.loop,true);assert.match(s.media.src,/\.wav$/)});
test('blocked playback is caught and can retry on another gesture',async()=>{const s=setup(undefined,{blocked:true});await flush();assert.equal(s.media.paused,true);s.media.play=()=>{s.media.paused=false;return Promise.resolve()};s.player.unlock();await flush();assert.equal(s.media.paused,false)});
test('mute, zero volume and hidden tab pause without losing position',async()=>{const s=setup();s.player.unlock();await flush();s.media.currentTime=23;s.player.setEnabled(false);assert.equal(s.media.paused,true);s.player.setEnabled(true);await flush();s.player.setVolume(0);assert.equal(s.media.paused,true);s.player.setVolume(.5);await flush();s.doc.hidden=true;s.doc.dispatchEvent(new Event('visibilitychange'));assert.equal(s.media.paused,true);s.doc.hidden=false;s.doc.dispatchEvent(new Event('visibilitychange'));await flush();assert.equal(s.media.currentTime,23);assert.equal(s.media.paused,false)});
test('reload restores recent playback position and sound preference',()=>{const s=setup({time:29,at:Date.now(),unlocked:true,enabled:false});s.media.dispatchEvent(new Event('loadedmetadata'));assert.equal(s.media.currentTime,29);assert.equal(s.plays,0);s.win.dispatchEvent(new Event('pagehide'));assert.equal(JSON.parse([...s.values.values()][0]).time,29)});
test('old playback positions are ignored',()=>{const s=setup({time:29,at:0,unlocked:true});s.media.dispatchEvent(new Event('loadedmetadata'));assert.equal(s.media.currentTime,0);assert.equal(s.plays,1)});

test('reported playback state exposes blocked autoplay for an explicit retry control',async()=>{const states=[];const doc=new EventTarget(),win=new EventTarget(),media=new EventTarget();Object.assign(media,{paused:true,volume:.35,canPlayType:()=>true,play:()=>Promise.reject(Error('NotAllowedError')),pause(){}});createBackgroundMusic({media,doc,win,storage:{getItem:()=>null},onState:s=>states.push(s)});await flush();assert.equal(states.at(-1),'blocked');assert.match(media.src,/\.mp3$/);});

test('game launch stops menu music and later gestures cannot restart it',async()=>{const s=setup();await flush();s.media.currentTime=18;s.player.setActive(false);assert.equal(s.media.paused,true);assert.equal(s.media.currentTime,0);s.player.unlock();s.player.setVolume(.5);s.doc.dispatchEvent(new Event('visibilitychange'));await flush();assert.equal(s.media.paused,true);s.player.setActive(true);await flush();assert.equal(s.media.paused,false)});
test('a document launched directly into gameplay never autoplays menu music',()=>{let calls=0;const doc=new EventTarget(),win=new EventTarget(),media=new EventTarget();Object.assign(media,{paused:true,canPlayType:()=>true,play(){calls++;return Promise.resolve()},pause(){}});const player=createBackgroundMusic({active:false,media,doc,win});player.unlock();assert.equal(calls,0)});
