// One player per game document, independent of pause/menu state and Web Audio effects.
export function createBackgroundMusic({volume=.35,media=new Audio(),doc=document,win=window,storage}={}){
 const key='saturn-station-music-position-v1';
 try{storage??=win.sessionStorage}catch{}
 media.id='background-music';media.hidden=true;doc.body?.append(media);
 media.loop=true;media.preload='auto';
 // AAC is the supplied original; PCM WAV is the fallback for browsers without AAC.
 media.src=new URL(media.canPlayType('audio/mp4; codecs="mp4a.40.2"')?'./assets/audio/main-menu.m4a':'./assets/audio/main-menu.wav',import.meta.url).href;
 let enabled=true,unlocked=false,pending=false;
 try{const saved=JSON.parse(storage?.getItem(key)||'null');if(saved&&Date.now()-saved.at<30000&&Number.isFinite(saved.time)&&saved.time>=0){media.addEventListener('loadedmetadata',()=>{if(Number.isFinite(media.duration)&&media.duration>0)media.currentTime=saved.time%media.duration},{once:true});unlocked=!!saved.unlocked;enabled=saved.enabled!==false}}catch{}
 function save(){try{storage?.setItem(key,JSON.stringify({time:media.currentTime,at:Date.now(),unlocked,enabled}))}catch{}}
 function play(){
  if(!unlocked||!enabled||doc.hidden||media.volume===0||!media.paused||pending)return;
  pending=true;
  try{Promise.resolve(media.play()).catch(()=>{}).finally(()=>{pending=false;if(!enabled||doc.hidden||media.volume===0)media.pause()})}catch{pending=false}
 }
 function setVolume(value){media.volume=Math.max(0,Math.min(1,value));if(media.volume===0)media.pause();else play()}
 function setEnabled(value){enabled=value;if(!enabled)media.pause();else play();save()}
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){save();media.pause()}else play()});
 win.addEventListener('pagehide',save);media.addEventListener('timeupdate',save);
 setVolume(volume);
 return {get enabled(){return enabled},unlock(){unlocked=true;play()},setVolume,setEnabled};
}
