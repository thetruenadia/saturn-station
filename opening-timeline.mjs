// Pure, elapsed-time sampling: blackouts never skip or reset scene chronology.
export const OPENING_DURATION=30;
const clamp=x=>Math.max(0,Math.min(1,x));
export function sampleOpening(t){
 const fades=[[0,1],[1.2,1],[1.65,0],[2.2,0],[2.4,1],[3.2,1],[3.7,0],[5.8,0],[6,1],[6.5,1],[6.85,0],[8.8,0],[9,1],[9.35,1],[9.7,0],[25.8,0],[26.8,.85],[27.2,.2],[28.5,1],[30,1]];
 let blackout=1;
 for(let i=1;i<fades.length;i++)if(t>=fades[i-1][0]){const [a,x]=fades[i-1],[b,y]=fades[i];blackout=x+(y-x)*clamp((t-a)/(b-a));}
 return {blackout,stand:clamp((t-17)/2),run:clamp((t-19)/5.5),door:1-clamp((t-24.8)/1.4),
 phase:t<11?'TINKERING':t<13?'SENSOR ACTIVE':t<17?'DISTURBANCE':t<19?'STANDING':t<24.5?'DEPARTURE':t<26.2?'DOOR CLOSING':'OPTICAL FAILURE',done:t>=OPENING_DURATION};
}
