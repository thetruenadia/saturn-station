export const PROBE_RECIPE={motor:1,gear:2,chip:1,plate:1,wire:2};
export function stackParts(items){const groups=new Map();for(const item of items){if(!groups.has(item.type))groups.set(item.type,[]);groups.get(item.type).push(item)}return [...groups.values()]}
export function recipeStatus(items,recipe=PROBE_RECIPE){return Object.entries(recipe).map(([type,required])=>{const owned=items.filter(i=>i.type===type).length;return {type,required,owned,missing:Math.max(0,required-owned)}})}
export function canFabricate({items,discovered,installed,powered,atStation}){return discovered&&!installed&&powered&&atStation&&recipeStatus(items).every(i=>!i.missing)}
export const SERVICE_POSITION={x:-7.35,z:2.2,heading:-Math.PI/2};
