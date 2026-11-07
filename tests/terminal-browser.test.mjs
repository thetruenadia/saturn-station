import test from 'node:test';
import assert from 'node:assert/strict';
import {createTerminalSession} from '../terminal-browser.js';
import {stepFloorBody} from '../reference-assets.js';
test('Enter initiates a separate timed boot before password entry',()=>{const t=createTerminalSession();assert.equal(t.login('ETNA'),false);assert.equal(t.boot(),true);t.update(1);assert.equal(t.state.phase,'booting');assert.equal(t.login('ETNA'),false);t.update(2.3);assert.equal(t.state.phase,'password');});
test('incorrect password never authenticates or unlocks navigation',()=>{const t=createTerminalSession();t.boot();t.update(4);assert.equal(t.login('wrong'),false);assert.equal(t.state.authenticated,false);assert.equal(t.navigate('commands'),false);});
test('ETNA unlocks only local commands, files, and record pages',()=>{const t=createTerminalSession();t.boot();t.update(4);assert.equal(t.login('ETNA'),true);for(const page of ['commands','files','record']){assert.equal(t.navigate(page),true);assert.equal(t.state.page,page)}assert.equal(t.navigate('https://example.com'),false);});
test('power off destroys authentication and resets boot progress',()=>{const t=createTerminalSession();t.boot();t.update(4);t.login('ETNA');t.powerOff();assert.equal(t.state.phase,'ready');assert.equal(t.state.authenticated,false);assert.equal(t.state.elapsed,0);assert.equal(t.navigate('files'),false);});
test('heavy attachment drops under gravity and settles without penetrating floor',()=>{const body={height:1.5,velocity:0,floor:.1,sleeping:false};stepFloorBody(body,1/60);assert(body.height<1.5);for(let i=0;i<300;i++){stepFloorBody(body,1/60);assert(body.height>=body.floor)}assert.equal(body.height,.1);assert.equal(body.velocity,0);assert.equal(body.sleeping,true);});
