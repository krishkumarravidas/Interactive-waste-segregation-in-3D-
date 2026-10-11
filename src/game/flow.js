export const phaseLengths={pre:10,training:20,post:10};
const challenging=new Set(['tetra-pack','pizza-box','thermocol']);
export function shuffled(items){return [...items].sort(()=>Math.random()-.5)}
export function makeQueue(items,count,level='medium'){
 const usual=items.filter(i=>!challenging.has(i.id));
 const hard=items.filter(i=>challenging.has(i.id));
 const source=level==='easy'?shuffled(usual):level==='hard'?[...shuffled(hard),...shuffled(usual)]:shuffled(items);
 return source.slice(0,count);
}
