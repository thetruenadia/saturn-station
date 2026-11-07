const $=s=>document.querySelector(s),items=[...document.querySelectorAll('.item')];
// Menu soundtrack: browsers may block autoplay until the first user gesture.
const menuMusic=$('#menu-music'),musicToggle=$('#menu-music-toggle');
menuMusic.volume=.42;
let musicEnabled=true;
function updateMusicButton(){musicToggle.textContent=menuMusic.paused?'PLAY MUSIC':'MUTE MUSIC';musicToggle.setAttribute('aria-pressed',String(!menuMusic.paused));}
function startMenuMusic(){if(!musicEnabled||!menuMusic.paused)return;menuMusic.play().then(updateMusicButton).catch(updateMusicButton);}
musicToggle.addEventListener('click',()=>{if(menuMusic.paused){musicEnabled=true;startMenuMusic()}else{musicEnabled=false;menuMusic.pause();updateMusicButton()}});
// The first click or keypress can unlock playback when autoplay is not permitted.
document.addEventListener('pointerdown',e=>{if(e.target!==musicToggle)startMenuMusic()},{passive:true});
document.addEventListener('keydown',e=>{if(e.key!=='Tab')startMenuMusic()});
menuMusic.addEventListener('play',updateMusicButton);
menuMusic.addEventListener('pause',updateMusicButton);
menuMusic.addEventListener('error',()=>{musicToggle.textContent='MUSIC UNAVAILABLE';musicToggle.disabled=true;});
updateMusicButton();startMenuMusic();

let saves=[],sel=0,lastFocus=null;
const send=(action,id)=>parent.postMessage({type:'saturn-menu-action',action,id},location.origin);
const fmt=t=>t?new Date(t).toLocaleString(undefined,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'Earlier local save';
function enabled(i){return items[i].getAttribute('aria-disabled')!=='true'}
function setSel(i){sel=i;items.forEach((b,k)=>b.classList.toggle('sel',k===i))}
function move(d){for(let n=1;n<=items.length;n++){const i=(sel+d*n+items.length*2)%items.length;if(enabled(i)){setSel(i);items[i].focus({preventScroll:true});break}}}
function refresh(){
 for(const id of ['resume','load']){const b=$('#'+id);b.setAttribute('aria-disabled',saves.length?'false':'true');b.title=saves.length?'':'No saved game found';}
 const resume=$('#resume');resume.replaceChildren(document.createTextNode('Resume last save'));if(saves.length){const date=document.createElement('small');date.textContent=fmt(saves[0].t);resume.append(date);}
 if(!enabled(sel))setSel(0);
 if($('#p-load').classList.contains('open'))renderSlots();
}
function open(id){lastFocus=document.activeElement;const p=$(id);p.classList.add('open');p.querySelector('button')?.focus()}
function closeAll(){document.querySelectorAll('.panel.open').forEach(p=>p.classList.remove('open'));lastFocus?.focus()}
function renderSlots(){
 const ul=$('#slots');ul.replaceChildren();
 for(const save of saves){const li=document.createElement('li');li.innerHTML='<div><div class="name"></div><div class="meta"></div></div><div class="row" style="margin:0"><button class="btn" data-l>Load</button><button class="btn del" data-d>Delete</button></div>';li.querySelector('.name').textContent=save.name;li.querySelector('.meta').textContent=fmt(save.t);li.querySelector('[data-l]').onclick=()=>send('load',save.id);li.querySelector('[data-d]').onclick=()=>{if(confirm('Delete this saved record?'))send('delete',save.id)};ul.append(li);}
 if(!saves.length){const li=document.createElement('li');li.textContent='No saved records.';ul.append(li);}
}
function run(action){if(action==='start')send('start');else if(action==='resume'&&saves[0])send('load',saves[0].id);else if(action==='load'){renderSlots();open('#p-load')}else if(action==='credits')open('#p-credits');else if(action==='exit')open('#p-exit')}
items.forEach((b,i)=>{b.onmouseenter=()=>{if(enabled(i))setSel(i)};b.onfocus=()=>{if(enabled(i))setSel(i)};b.onclick=()=>{if(enabled(i))run(b.dataset.act)}});
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeAll);document.querySelectorAll('.panel').forEach(p=>p.onmousedown=e=>{if(e.target===p)closeAll()});
$('#exit-yes').onclick=()=>{menuMusic.pause();closeAll();$('#closed').classList.add('open');$('.menu-screen').inert=true;$('#closed').tabIndex=-1;$('#closed').focus();};
document.addEventListener('keydown',e=>{
 const panel=document.querySelector('.panel.open');if(panel){if(e.key==='Escape')closeAll();if(e.key==='Tab'){const controls=[...panel.querySelectorAll('button')];const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}return;}
 if($('#closed').classList.contains('open'))return;
 if(e.key==='ArrowDown'){e.preventDefault();move(1)}else if(e.key==='ArrowUp'){e.preventDefault();move(-1)}else if(e.key==='Enter'&&document.activeElement===document.body&&enabled(sel))run(items[sel].dataset.act);
});
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==parent)return;if(e.data?.type==='saturn-menu-state'){saves=Array.isArray(e.data.saves)?e.data.saves:[];refresh();if(e.data.error)showError(e.data.error)}else if(e.data?.type==='saturn-menu-error')showError(e.data.message)});
function showError(message){let p=$('#menu-error');if(!p){p=document.createElement('p');p.id='menu-error';p.setAttribute('role','status');p.style.cssText='position:absolute;bottom:4%;left:7%;max-width:75%;font-size:16px;color:#dec4ac';$('.stage').append(p)}p.textContent=message;}
refresh();setSel(0);send('ready');
