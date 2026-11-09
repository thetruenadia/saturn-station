// Functional zones, kept separate from art so collisions and interaction anchors agree.
export const ROOM_LAYOUT={
 case:{x:-5,z:2,hx:1,hz:.73},generator:{x:-10.8,z:-8.5,hx:1.15,hz:.55},
 terminal:{x:5,z:-5.5,hx:1.1,hz:.6},workArm:{x:-9,z:2.2,hx:1.05,hz:.9},
 turbine:{x:-11,z:-2,hx:1.05,hz:.9},press:{x:-11.4,z:1.8,hx:.95,hz:.85},engine:{x:-11,z:-5.7,hx:.9,hz:.8},exchanger:{x:-5.5,z:-9.2,hx:4.3,hz:.9},
 crewTable:{x:8.3,z:-5,hx:.7,hz:.4},windowShelf:{x:2.1,z:-9,hx:1,hz:.35},seat:{x:7.5,z:-8.9,hx:.4,hz:.4},helmetStand:{x:11.2,z:-2.1,hx:.35,hz:.3}
};
export const ROOM_COLLIDERS=Object.values(ROOM_LAYOUT).map(p=>[p.x,p.z,p.hx,p.hz]);
export const LOCKER_BANK={x:6.8,z:-2,spacing:.98};
export const SPEC_OUTPUT={x:5.4,z:-3.95};
export const WINDOW_APPROACH={x:5,z:-8.8};
export const OBSERVATION_PORT={x:WINDOW_APPROACH.x,y:4.35,z:-10.52,width:7.7,height:3.9};
export function roomPointClear(x,z,extra=[]){return x>=-12.5&&x<=12.5&&z>=-9.5&&z<=9.5&&![...ROOM_COLLIDERS,...extra].some(([px,pz,hx,hz])=>Math.abs(x-px)<hx+.42&&Math.abs(z-pz)<hz+.42)}
// The Maker uses the same clear central aisle instead of running through the crew lockers.
export const MAKER_EXIT_ROUTE=[[-7.6,4.8],[-3.5,5.3],[2,1],[2,-6.8],[4,-7.2],[9,-7.4],[11.4,-9.3],[11.4,-14.5]];
