export const PROGRESS_KEY='saturn-station-0.2-progress-v1';
export const SLOTS_KEY='saturn-station-0.2-save-slots-v1';
export const ACTIVE_KEY='saturn-station-0.2-active-slot-v1';
export const LAUNCH_KEY='saturn-station-0.2-menu-launch-v1';
export function validProgress(p){return !!p&&p.version===1&&Number.isFinite(p.charge)&&p.charge>=0&&p.charge<=100&&Number.isFinite(p.x)&&Number.isFinite(p.z)}
function parse(storage,key,fallback){try{return JSON.parse(storage.getItem(key))??fallback}catch{return fallback}}
export function listSaves(storage){
 const stored=parse(storage,SLOTS_KEY,[]);const slots=(Array.isArray(stored)?stored:[]).filter(s=>s&&typeof s.id==='string'&&validProgress(s.progress));
 const active=parse(storage,PROGRESS_KEY,null);
 if(validProgress(active)){
  const id=storage.getItem(ACTIVE_KEY)||'previous-local-record';
  if(!slots.some(s=>s.id===id))slots.push({id,name:'Local record',t:active.savedAt||0,progress:active});
 }
 return slots.sort((a,b)=>(b.t||0)-(a.t||0));
}
export function recordSave(storage,progress,now=Date.now()){
 if(!validProgress(progress))throw Error('Invalid game record');
 const id=storage.getItem(ACTIVE_KEY)||'previous-local-record';const slots=listSaves(storage);const previous=slots.find(s=>s.id===id);
 const snapshot={...progress,savedAt:now};const slot={id,name:previous?.name||'Demo record',t:now,progress:snapshot};
 storage.setItem(PROGRESS_KEY,JSON.stringify(snapshot));storage.setItem(ACTIVE_KEY,id);storage.setItem(SLOTS_KEY,JSON.stringify([slot,...slots.filter(s=>s.id!==id)].slice(0,20)));return slot;
}
export function newGame(storage,now=Date.now()){
 const active=parse(storage,PROGRESS_KEY,null);if(validProgress(active))recordSave(storage,active,active.savedAt||now);
 const id='demo-'+now;storage.setItem(ACTIVE_KEY,id);storage.removeItem(PROGRESS_KEY);return id;
}
export function loadSave(storage,id){const slot=listSaves(storage).find(s=>s.id===id);if(!slot)throw Error('Save no longer available');storage.setItem(PROGRESS_KEY,JSON.stringify(slot.progress));storage.setItem(ACTIVE_KEY,slot.id);return slot;}
export function deleteSave(storage,id){const slots=listSaves(storage).filter(s=>s.id!==id);storage.setItem(SLOTS_KEY,JSON.stringify(slots));if((storage.getItem(ACTIVE_KEY)||'previous-local-record')===id){storage.removeItem(PROGRESS_KEY);storage.removeItem(ACTIVE_KEY);}}
export function consumeLaunch(storage){const intent=parse(storage,LAUNCH_KEY,null);storage.removeItem(LAUNCH_KEY);return intent?.mode==='new'||intent?.mode==='resume'?intent:null;}
