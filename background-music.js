// One player per game document, with explicit menu visibility, separate from Web Audio effects.
export function createBackgroundMusic({volume=.35,active=true,media=new Audio(),doc=document,win=window,storage,onState=()=>{}}={}){
 const key='saturn-station-music-position-v1';
 try{storage??=win.sessionStorage}catch{}
 media.id='background-music';media.hidden=true;doc.body?.append(media);
 media.loop=true;media.preload='auto';
 // Normalized MP3 avoids platform AAC decoder differences; WAV is a fallback.
 media.src=new URL(media.canPlayType('audio/mpeg')?'./assets/audio/main-menu.mp3':'./assets/audio/main-menu.wav',import.meta.url).href;
 let enabled=true,unlocked=false,pending=false;
 try{const saved=JSON.parse(storage?.getItem(key)||'null');if(saved&&Date.now()-saved.at<30000&&Number.isFinite(saved.time)&&saved.time>=0){media.addEventListener('loadedmetadata',()=>{if(Number.isFinite(media.duration)&&media.duration>0)media.currentTime=saved.time%media.duration},{once:true});unlocked=!!saved.unlocked;enabled=saved.enabled!==false}}catch{}
 function save(){try{storage?.setItem(key,JSON.stringify({time:media.currentTime,at:Date.now(),unlocked,enabled}))}catch{}}
 function report(){onState(!active?'inactive':!enabled||media.volume===0?'muted':media.paused?'blocked':'playing')}
 function play(){
  if(!active||!unlocked||!enabled||doc.hidden||media.volume===0||!media.paused||pending)return;
  pending=true;
  try{Promise.resolve(media.play()).catch(()=>{}).finally(()=>{pending=false;if(!active||!enabled||doc.hidden||media.volume===0)media.pause();report()})}catch{pending=false;report()}
 }
 function setVolume(value){media.volume=Math.max(0,Math.min(1,value));if(media.volume===0)media.pause();else play();report()}
 function setEnabled(value){enabled=value;if(!enabled)media.pause();else play();report();save()}
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){save();media.pause()}else play();report()});
 win.addEventListener('pagehide',save);media.addEventListener('timeupdate',save);
 media.addEventListener('playing',report);media.addEventListener('pause',report);
 media.addEventListener('error',()=>{if(!media.src.endsWith('.wav')){media.src=new URL('./assets/audio/main-menu.wav',import.meta.url).href;pending=false;play()}report()});
 setVolume(volume);
 // Try autoplay when permitted; activation handlers remain available after rejection.
 unlocked=true;play();
 return {setActive(value){active=value;if(!active){media.pause();media.currentTime=0}else play();report()},get enabled(){return enabled},unlock(){unlocked=true;play()},setVolume,setEnabled};
}
