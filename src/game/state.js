export const freshState=()=>({phase:'intro',index:0,score:0,streak:0,bestStreak:0,answers:[],queue:[],startedAt:0,phaseStartedAt:0,preScore:null,held:null,locked:false});
export function currentMode(s){return s.phase==='pre'?'pre-test':s.phase==='training'?'training':s.phase==='post'?'post-test':s.phase}
