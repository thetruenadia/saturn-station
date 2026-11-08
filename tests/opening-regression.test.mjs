import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createTerminalSession} from '../terminal-browser.js';
import {ROOM_COLLIDERS} from '../reference-assets.js';
import test from 'node:test';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../prototype-3d.js',import.meta.url),'utf8');
// Run the shipped functions, with DOM/rendering doubles. These are logic tests,
// not substitutes for a real WebGL browser playthrough.
function chunk(from,to){return source.slice(source.indexOf(from),source.indexOf(to,source.indexOf(from)));}
function element(){return {dataset:{},textContent:'',innerHTML:'',children:[],nextElementSibling:{},classList:{toggle(){},add(){},remove(){},contains(){return false}},setAttribute(){},append(...x){this.children.push(...x)},replaceChildren(){this.children=[]},addEventListener(){}};}
function setup(){
 const elements=new Map();const doc={querySelector(s){if(!elements.has(s))elements.set(s,element());return elements.get(s)},createElement:element};
 const c=vm.createContext({referenceAssets:{colliders:ROOM_COLLIDERS},document:doc,hasNote:false,hasArm:false,armEquipped:false,hasCell:false,usedCell:false,cellCount:0,itemType:null,mountedArm:{visible:false},previewMountedArm:{visible:false},previewRobot:{getObjectByName(){return {visible:false}}},doorAccessProbe:{visible:false},chooseInspection(){},saveProgress(){return true},say(){},notify(){},task:{textContent:''},terminalStatus:{},powerOn:true,doorOpening:false,doorOpen:false,terminalBooted:false,terminalOpen:true,workshop:{hasProbe:false},terminalOutput:{},hatch:{userData:{}},leftLeaf:{position:{x:0}},rightLeaf:{position:{x:0}},generatorLever:{rotation:{}},phosphor:{},terminalScreen:{},terminalLamp:{},terminalDark:{},performance:{now:()=>0},setStationPower(value){c.powerOn=value;if(!value){c.terminalBooted=false;c.terminalOpen=false;c.terminalUI.session.powerOff()}},hideTerminal(){c.terminalOpen=false},robot:{position:{x:0,z:0}}});
 vm.runInContext(chunk('function itemIcon','function openInventory'),c);
 vm.runInContext(chunk('function equipArm','const armSlot='),c);
 vm.runInContext(chunk('function updateTerminalStatus','function showTerminal'),c);
 c.terminalUI={session:createTerminalSession(),setStatus(value){c.terminalStatus.textContent=value}};
 vm.runInContext(chunk('function terminalCommand','function finishDemo'),c);
 vm.runInContext(chunk('const solidProps=','function animate(){'),c);
 return {c,e:s=>doc.querySelector(s)};
}
test('fresh inventory has 20 empty slots and no equipped model',()=>{const {c,e}=setup();c.updateInventory();assert.equal(e('#item-count').textContent,'00 / 20');assert.equal(e('#inventory-items').children.length,20);assert.equal(c.mountedArm.visible,false);assert.equal(c.previewMountedArm.visible,false);assert.equal(e('#arm-hot').innerHTML,'');});
test('body part replacement is blocked even after collection',()=>{const {c,e}=setup();c.equipArm();assert.equal(c.armEquipped,false);c.hasArm=true;c.updateInventory();c.equipArm();assert.equal(c.armEquipped,false);assert.equal(c.mountedArm.visible,false);});
test('developer equipment state is reflected by updateInventory',()=>{const {c}=setup();c.hasArm=c.armEquipped=true;c.updateInventory();assert.equal(c.mountedArm.visible,true);assert.equal(c.previewMountedArm.visible,true);});
test('fuel cell count controls available inventory and becomes zero after consumption',()=>{const {c,e}=setup();c.cellCount=2;c.hasCell=true;c.updateInventory();assert.equal(e('#cell-hot').textContent,'2 ×');assert.equal(e('#item-count').textContent,'01 / 20');c.cellCount=0;c.hasCell=false;c.usedCell=true;c.updateInventory();assert.equal(e('#cell-hot').textContent,'0 ×');assert.equal(e('#item-count').textContent,'00 / 20');});
test('terminal remains isolated even after an access probe has been fabricated',()=>{const {c}=setup();assert.match(c.terminalCommand('1'),/AUTHENTICATION/);c.terminalUI.session.boot();c.terminalUI.session.update(4);c.terminalUI.session.login('ETNA');assert.match(c.terminalCommand('1'),/LOCAL EXIT SOCKET/);c.workshop.hasProbe=true;assert.match(c.terminalCommand('1'),/LOCAL EXIT SOCKET/);assert.equal(c.doorOpening,false);});
test('terminal close cancels animation, seals leaves, and updates directive',()=>{const {c}=setup();c.terminalUI.session.state.authenticated=true;c.doorOpening=true;c.leftLeaf.position.x=-1;c.terminalCommand('2');assert.equal(c.doorOpening,false);assert.equal(c.doorOpen,false);assert.equal(c.leftLeaf.position.x,0);assert.match(c.task.textContent,/sealed/);});
test('terminal power-off closes UI and requires a new boot and password',()=>{const {c}=setup();c.terminalUI.session.state.authenticated=true;c.terminalBooted=true;c.terminalCommand('3');assert.equal(c.powerOn,false);assert.equal(c.terminalBooted,false);assert.equal(c.terminalOpen,false);assert.equal(c.terminalUI.session.state.authenticated,false);});
test('terminal rejects open without generator power',()=>{const {c}=setup();c.terminalUI.session.state.authenticated=true;c.powerOn=false;assert.match(c.terminalCommand('1'),/OFFLINE/);assert.equal(c.doorOpening,false);});
test('solid props and room bounds block movement, clear floor remains traversable',()=>{const {c}=setup();assert.equal(c.canOccupy(5,-7),false);assert.equal(c.canOccupy(-9,2.2),false);assert.equal(c.canOccupy(13,0),false);assert.equal(c.canOccupy(0,0),true);c.robot.position={x:0,z:0};c.moveRobot(.05,.05);assert.equal(c.robot.position.x,.05);});
test('axis collision permits sliding alongside the work-arm base',()=>{const {c}=setup();c.robot.position={x:-7.5,z:2.2};c.moveRobot(-.1,.1);assert.equal(c.robot.position.x,-7.5);assert.equal(c.robot.position.z,2.3000000000000003);});

