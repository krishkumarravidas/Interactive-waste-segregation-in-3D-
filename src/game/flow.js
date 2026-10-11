export const phaseLengths={pre:10,training:20,post:10};
export function shuffled(items){return [...items].sort(()=>Math.random()-.5)}
export function makeQueue(items,count,hard=false){const source=hard?items:items.filter(i=>!['tetra-pack','pizza-box','thermocol'].includes(i.id));return shuffled(source).slice(0,count)}
