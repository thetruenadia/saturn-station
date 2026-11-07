// Local station interface: no external sites or network requests.
export function createTerminalSession(){
 const state={phase:'ready',elapsed:0,authenticated:false,page:'commands',message:'',bootLine:-1};
 return {state,
  boot(){if(state.phase!=='ready')return false;state.phase='booting';state.elapsed=0;return true},
  update(dt){if(state.phase==='booting'){state.elapsed+=Math.max(0,dt);if(state.elapsed>=3.2)state.phase='password'}return state.phase},
  login(value){if(state.phase!=='password')return false;if(value.trim().toUpperCase()!=='ETNA'){state.message='ACCESS DENIED — CHECK THE MAINTENANCE NOTE';return false}state.authenticated=true;state.phase='browser';state.message='';return true},
  navigate(page){if(!state.authenticated||!['commands','files','record'].includes(page))return false;state.page=page;state.message='';return true},
  powerOff(){Object.assign(state,{phase:'ready',elapsed:0,authenticated:false,page:'commands',message:'',bootLine:-1})}
 };
}
export function createTerminalBrowser({onClose,onBoot,onCommand,onSave,readNote,sound}){
 const session=createTerminalSession(),s=session.state;
 const panel=document.createElement('section');panel.id='station-terminal';panel.className='station-browser';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Station control terminal');
 panel.innerHTML=`<header><span>SATURN STATION / LOCAL OPERATING SYSTEM</span><button data-close aria-label="Close terminal">ESC ×</button></header><div class="terminal-status" role="status"></div><div class="terminal-screen"></div><footer>LOCAL CONNECTION · B-7 MAINTENANCE NETWORK</footer>`;document.body.append(panel);
 const screen=panel.querySelector('.terminal-screen'),status=panel.querySelector('.terminal-status');
 const bootLines=['B7 BIOS / REV 0.2','MEMORY TEST ................ OK','AUXILIARY POWER ............ ONLINE','MOUNTING LOCAL FILE SYSTEM','INITIALISING TERMINAL BROWSER','AUTHENTICATION REQUIRED'];
 let open=false,externalStatus='',lastPhase='',lastBootLine=-1;
 function focus(selector){panel.querySelector(selector)?.focus()}
 function setStatus(value){externalStatus=value;status.textContent=externalStatus}
 function render(){
  const phase=s.phase;
  if(phase==='ready'){screen.innerHTML='<div class="terminal-centre"><small>LOCAL CONTROL // STANDBY</small><h2>TERMINAL B-7</h2><p>Press Enter to begin the boot sequence.</p><button data-boot>ENTER · BOOT TERMINAL</button></div>';screen.querySelector('[data-boot]').onclick=startBoot;focus('[data-boot]');}
  else if(phase==='booting'){screen.innerHTML='<pre class="boot-lines" aria-live="polite"></pre><span class="terminal-cursor">▌</span>';paintBoot();}
  else if(phase==='password'){screen.innerHTML='<div class="terminal-centre"><small>BOOT COMPLETE / RESTRICTED ACCESS</small><h2>IDENTIFY YOURSELF</h2><p>Enter the station password.</p><form id="terminal-login"><label for="terminal-password">PASSWORD</label><input id="terminal-password" type="password" autocomplete="off" spellcheck="false" maxlength="40"><button>ENTER · UNLOCK</button></form><p class="terminal-feedback" role="status"></p><small>Recover the maintenance note beneath the observation window.</small></div>';screen.querySelector('form').onsubmit=e=>{e.preventDefault();login()};focus('#terminal-password');}
  else renderBrowser();
  lastPhase=phase;
 }
 function paintBoot(){const count=Math.min(bootLines.length,1+Math.floor(s.elapsed/.52));const pre=screen.querySelector('.boot-lines');if(pre)pre.textContent=bootLines.slice(0,count).join('\n\n');if(count!==lastBootLine){lastBootLine=count;sound('terminal-key');}}
 function startBoot(){if(!session.boot())return;sound('terminal-boot');render()}
 function login(){const field=screen.querySelector('#terminal-password');if(!field)return;const accepted=session.login(field.value);sound(accepted?'terminal-ready':'terminal-denied');if(accepted){render();onBoot();}else{screen.querySelector('.terminal-feedback').textContent=s.message;field.value='';field.focus()}}
 function renderBrowser(){
  screen.innerHTML='<nav class="terminal-tabs" aria-label="Terminal browser"><button data-page="commands">COMMANDS</button><button data-page="files">FILES</button><button data-page="record">RECORD ENTRY</button></nav><div class="terminal-address"></div><main class="terminal-page"></main>';
  screen.querySelector('.terminal-address').textContent='station://b7/'+s.page;
  screen.querySelectorAll('[data-page]').forEach(b=>{b.setAttribute('aria-current',b.dataset.page===s.page?'page':'false');b.onclick=()=>{session.navigate(b.dataset.page);sound('terminal-key');renderBrowser();focus('[data-page="'+s.page+'"]')}});
  const page=screen.querySelector('.terminal-page');
  if(s.page==='commands'){page.innerHTML='<h2>STATION COMMANDS</h2><p>Manage the local pressure bulkhead and auxiliary grid.</p><div class="terminal-actions"><button data-command="1">01 · OPEN EXIT DOOR</button><button data-command="2">02 · CLOSE EXIT DOOR</button><button data-command="3">03 · TURN OFF AUXILIARY POWER</button></div><pre class="terminal-command-result" role="status"></pre>';page.querySelectorAll('[data-command]').forEach(b=>b.onclick=()=>command(b.dataset.command));}
  else if(s.page==='files'){page.innerHTML='<h2>LOCAL FILES</h2><button data-file="note">MAINTENANCE-NOTE.TXT</button><button data-file="log">STATION-STATUS.LOG</button><pre class="terminal-file" tabindex="0"></pre>';page.querySelector('[data-file="note"]').onclick=()=>{sound('terminal-key');page.querySelector('.terminal-file').textContent=readNote()?'MAINTENANCE NOTE\n\nThe password is ETNA.':'FILE UNAVAILABLE\nRecover the paper note beneath the observation window.'};page.querySelector('[data-file="log"]').onclick=()=>{sound('terminal-key');page.querySelector('.terminal-file').textContent='SATURN STATION / B-7\n\n'+externalStatus+'\n\nMU-1 LOCAL SERVICE LINK: ACTIVE';};}
  else{page.innerHTML='<h2>RECORD ENTRY</h2><p>Record the current state of MU-1 and the station.</p><button data-save>SAVE CURRENT RECORD</button><p class="terminal-save-result" role="status"></p>';page.querySelector('[data-save]').onclick=()=>{const ok=onSave();sound(ok?'terminal-ready':'terminal-denied');page.querySelector('.terminal-save-result').textContent=ok?'RECORD SAVED ON THIS DEVICE.':'RECORD COULD NOT BE SAVED. DEVICE STORAGE IS UNAVAILABLE.'};}
 }
 function command(k){if(!s.authenticated||s.page!=='commands')return;sound('terminal-key');const message=onCommand(k);const result=screen.querySelector('.terminal-command-result');if(result)result.textContent=message||'';}
 function show(){open=true;panel.hidden=false;panel.style.display='flex';render()}
 function hide(){open=false;panel.hidden=true;panel.style.display='none';onClose()}
 panel.querySelector('[data-close]').onclick=hide;
 panel.addEventListener('keydown',e=>{if(e.key.length===1||e.key==='Backspace')sound('terminal-key');});
 function key(event){if(!open)return;if(event.key==='Escape'){event.preventDefault();hide();return;}if(s.phase==='ready'&&event.key==='Enter'){event.preventDefault();startBoot();return;}if(s.phase==='booting'){event.preventDefault();return;}if(s.phase==='browser'&&['1','2','3'].includes(event.key)&&event.target.tagName!=='INPUT'){event.preventDefault();command(event.key);}}
 function update(dt){if(!open)return;const previous=s.phase;session.update(dt);if(s.phase!==previous){sound('terminal-ready');render();}else if(s.phase==='booting')paintBoot();}
 return {show,hide,key,update,setStatus,session,panel,command,powerOff(){session.powerOff();hide()}};
}
export function createDemoEnding({restart,sound,reducedMotion}){
 const overlay=document.createElement('section');overlay.id='demo-ending';overlay.hidden=true;overlay.setAttribute('role','dialog');overlay.setAttribute('aria-label','Demo complete');overlay.setAttribute('aria-modal','true');document.body.append(overlay);
 let visible=false,page='complete',returnPage='complete';
 const mu=`<svg class="dancing-mu" viewBox="0 0 140 160" aria-label="Dancing MU-1"><g class="mu-body"><path d="M25 35 96 22 119 48 109 72 37 79 19 59Z" fill="#7d9078" stroke="#c1c9ac" stroke-width="3"/><path d="m39 37 49-8 16 18-51 9Z" fill="#2d3931"/><circle cx="105" cy="58" r="8" fill="#ff583c"/><path d="m24 66-13 18 8 23m91-37 18 12-5 22" fill="none" stroke="#9aab8e" stroke-width="7"/></g><g class="mu-leg left"><path d="m48 78-8 28 15 18-11 22H24" fill="none" stroke="#7d9078" stroke-width="10"/></g><g class="mu-leg right"><path d="m87 76 9 30-15 18 13 22h22" fill="none" stroke="#7d9078" stroke-width="10"/></g></svg>`;
 function render(){
  overlay.className='ending-screen'+(reducedMotion?' reduced-motion':'');
  const complete=page==='complete';
  overlay.innerHTML=(complete?'<div class="confetti" aria-hidden="true">'+Array.from({length:45},(_,i)=>'<i style="--x:'+((i*37)%100)+'%;--delay:'+(-(i%9)*.4)+'s;--colour:'+['#e5bc64','#8db69c','#d08068'][i%3]+'"></i>').join('')+'</div>':'')+'<div class="ending-card">'+(complete?mu+'<small>SATURN STATION / PROTOTYPE 0.2</small><h1>CONGRATULATIONS</h1><p>You restored the station and completed the demo.</p>':page==='credits'?'<h1>CREDITS</h1><p>Saturn Station — thetruenadia</p><p>MU-1 and station: procedural game artwork.<br>Visual references supplied by the project creator.<br>Service arm inspiration: Gregor Kopka.<br>Enceladus image supplied by the project creator.</p>':'<small>PROTOTYPE 0.2</small><h1>SATURN STATION</h1>')+'<div class="ending-actions"><button data-restart>'+(page==='menu'?'START DEMO':'RESTART DEMO')+'</button><button data-credits>CREDITS</button>'+(complete?'<button data-menu>GO TO MENU</button>':page==='credits'?'<button data-back>BACK</button>':'')+'</div></div>';
  overlay.querySelector('[data-restart]').onclick=restart;overlay.querySelector('[data-credits]').onclick=()=>{sound('select');returnPage=page;page='credits';render()};overlay.querySelector('[data-menu]')?.addEventListener('click',()=>{sound('select');page='menu';render()});overlay.querySelector('[data-back]')?.addEventListener('click',()=>{page=returnPage;render()});overlay.querySelector('button').focus();
 }
 return {show(){visible=true;page='complete';overlay.hidden=false;render();sound('terminal-ready')},get visible(){return visible}};
}
