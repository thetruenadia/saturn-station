// Mechanics tutorial only: never names the hidden password's location.
export const CONTROL_STEPS=[
 {title:'MOVE MU-1',text:'Hold W / A / S / D to walk across the deck. W moves toward the back wall; S moves toward the open edge. The camera follows MU-1.'},
 {title:'LOOK AROUND',text:'Hold the left mouse button on empty space and drag to orbit the camera. Scroll or pinch to zoom. Press R to return to the default view.'},
 {title:'INTERACT & INSPECT',text:'Walk close to an object. Its E prompt tells you what will happen. Press E to use or collect it. Press I, then select a collected item to inspect it.'},
 {title:'PANELS & SHORTCUTS',text:'I opens inventory. C opens the nearby maintenance station. E interacts with the nearest object. Escape closes a panel or pauses. H shows these controls.'}
];
export function openingDirective(s){
 if(!s.powerOn)return 'Restore auxiliary power. Walk to the power control cabinet and press E.';
 if(s.hasProbe)return s.doorOpen?'Exit open. Approach the door and press E to finish the demo.':'Access Probe installed. Approach the exit door and press E at its socket.';
 if(s.probeCrafted)return 'Probe fabricated. At the maintenance station, place it in the wrist modification slot and confirm installation.';
 if(s.specUnlocked){if(!s.salvagedClaw)return 'Recover crafting parts. Approach the broken Industrial Claw and press E to dismantle it.';if(!s.recipeReady)return 'Collect the missing components. Check owned / required counts at the maintenance arm (C nearby).';return 'Parts ready. Approach the maintenance arm and press E. Load the recipe slots, then fabricate the probe.';}
 if(s.specReleased)return 'Specification exported. Close the terminal and collect the shard beside it with E.';
 if(!s.hasNote)return 'Find station access information. Explore, collect items with E and inspect them in inventory (I).';
 if(!s.terminalBooted)return 'Inspect the worker ID card (I). Use its handwritten password at the powered terminal.';
 return 'In terminal Files, open Fabrication Specifications and export ACCESS-PROBE.SPEC.';
}
export function createControlGuide({host,onOpen=()=>{}}){
 const panel=document.createElement('aside');panel.id='control-guide';panel.hidden=true;panel.setAttribute('aria-label','Movement and camera tutorial');host.append(panel);let step=0;
 function render(){panel.replaceChildren();const count=document.createElement('small');count.textContent='MU-1 / CONTROLS · '+(step+1)+' / '+CONTROL_STEPS.length;const title=document.createElement('h2');title.textContent=CONTROL_STEPS[step].title;const text=document.createElement('p');text.textContent=CONTROL_STEPS[step].text;const next=document.createElement('button');next.textContent=step===CONTROL_STEPS.length-1?'READY TO EXPLORE':'NEXT';next.onclick=()=>{if(step===CONTROL_STEPS.length-1)panel.hidden=true;else{step++;render()}};const close=document.createElement('button');close.textContent='CLOSE · H TO REOPEN';close.onclick=()=>panel.hidden=true;panel.append(count,title,text,next,close)}
 return {show(){onOpen();step=0;panel.hidden=false;render()},toggle(){if(panel.hidden)this.show();else panel.hidden=true},hide(){panel.hidden=true}};
}
