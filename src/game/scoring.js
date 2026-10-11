export const categoryFor=item=>item?.category;
export const isCorrect=(item,category)=>Boolean(item&&item.category===category);
export function scoreAnswer(state,correct){const streak=correct?state.streak+1:0;return {...state,score:state.score+(correct?10:0),streak,bestStreak:Math.max(state.bestStreak,streak)}}
export function accuracy(answers){return answers.length?Math.round(100*answers.filter(a=>a.correct).length/answers.length):0}
