import {listSaves,recordSave,newGame,loadSave,deleteSave,LAUNCH_KEY} from './menu-saves.js?v=menu1';
export function createMainMenu({saveCurrent,sound,unlockAudio=()=>{}}){
 const frame=document.createElement('iframe');frame.id='station-main-menu';frame.title='Saturn Station main menu';frame.src='./station-menu.html?v=menu1';frame.hidden=true;
 frame.style.cssText='position:fixed;inset:0;width:100%;height:100%;border:0;z-index:220;background:#000;display:none';document.body.append(frame);
 let active=false;
 function send(){let saves=[],error='';try{saves=listSaves(localStorage).map(({id,name,t})=>({id,name,t}));}catch{error='Device storage is unavailable. Starting a new session may not save progress.';}frame.contentWindow?.postMessage({type:'saturn-menu-state',saves,error},location.origin);}
 function launch(mode,id){
  try{
   if(mode==='new')newGame(localStorage);else loadSave(localStorage,id);
   sessionStorage.setItem(LAUNCH_KEY,JSON.stringify({mode}));location.reload();
  }catch{frame.contentWindow?.postMessage({type:'saturn-menu-error',message:'Could not access this save. Check device storage and try again.'},location.origin)}
 }
 window.addEventListener('message',e=>{
  if(e.origin!==location.origin||e.source!==frame.contentWindow||e.data?.type!=='saturn-menu-action')return;
  const {action,id}=e.data;
  if(action==='ready'){send();return;}
  sound('select');
  if(action==='start')launch('new');
  else if(action==='load')launch('resume',id);
  else if(action==='delete'){try{deleteSave(localStorage,id);send()}catch{frame.contentWindow?.postMessage({type:'saturn-menu-error',message:'Could not delete this save.'},location.origin)}}
 });
 frame.addEventListener('load',()=>{send();for(const event of ['pointerdown','keydown'])frame.contentDocument.addEventListener(event,unlockAudio,{capture:true});});
 return {show(){if(!active)saveCurrent();active=true;frame.hidden=false;frame.style.display='block';send();frame.contentWindow?.focus()},hide(){active=false;frame.hidden=true;frame.style.display='none'},get active(){return active},record(progress){recordSave(localStorage,progress)},startNew(){launch('new')}};
}
