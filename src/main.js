import items from './data/items.json';
import en from './i18n/en.json';
import kn from './i18n/kn.json';
import hi from './i18n/hi.json';
import {setupScene} from './scene/setup.js';
import {makeWasteItem} from './scene/items.js';
import {showConsequence} from './scene/effects.js';
import {freshState} from './game/state.js';
import {isCorrect,scoreAnswer,accuracy} from './game/scoring.js';
import {makeQueue} from './game/flow.js';
import {renderMenu} from './ui/menu.js';
import {renderHud} from './ui/hud.js';
import {renderResult} from './ui/result.js';
import {saveSession,downloadSessions} from './analytics/log.js';
import './style.css';

const locales={en,kn,hi};
let lang=localStorage.getItem('wastewise_lang')||'en';
let t=locales[lang]||en;
let state=freshState(),meta={},ctx=null,object=null,animators=[],soundOn=false,ray=null,plane=null,dragging=false;
const app=document.querySelector('#app');

function startScreen(){
 disposeScene();
 app.innerHTML=renderMenu(t);
 document.querySelector('#language').value=lang;
 document.querySelector('#language').onchange=e=>{lang=e.target.value;localStorage.setItem('wastewise_lang',lang);t=locales[lang]||en;startScreen()};
 document.querySelector('#start-form').onsubmit=e=>{e.preventDefault();meta=Object.fromEntries(new FormData(e.currentTarget));beginSession()};
}
function disposeScene(){
 if(ctx){ctx.resize?.disconnect();ctx.renderer.dispose();ctx.host.replaceChildren();ctx=null}
 if(object){object.traverse(o=>{o.geometry?.dispose();if(o.material)Array.isArray(o.material)?o.material.forEach(m=>m.dispose()):o.material.dispose()});object=null}
}
function beginSession(){
 state=freshState();state.phase='pre';state.startedAt=Date.now();state.preAnswers=[];
 state.preQueue=makeQueue(items,10,meta.difficulty||'medium');state.trainQueue=makeQueue(items,20,meta.difficulty||'medium');state.postQueue=makeQueue(items,10,meta.difficulty||'medium');state.queue=state.preQueue;showSim();
}
function showSim(){
 app.innerHTML='<main class="simulation"><div class="scene-wrap" id="scene" aria-label="Interactive 3D waste sorting scene"></div><section class="control-panel" id="panel"></section></main>';
 const host=document.querySelector('#scene');ctx=setupScene(host);ray=new ctx.THREE.Raycaster();plane=new ctx.THREE.Plane(new ctx.THREE.Vector3(0,1,0),-2.2);renderRound();
 const resize=new ResizeObserver(()=>{if(!ctx)return;ctx.camera.aspect=host.clientWidth/host.clientHeight;ctx.camera.updateProjectionMatrix();ctx.renderer.setSize(host.clientWidth,host.clientHeight)});resize.observe(host);ctx.resize=resize;
 function frame(){if(!ctx)return;requestAnimationFrame(frame);ctx.renderer.render(ctx.scene,ctx.camera);animators=animators.filter(a=>!a())}frame();
}
function renderRound(){
 const item=state.queue[state.index];if(!item){advancePhase();return}
 const phaseNames={pre:t.pre,training:t.training,post:t.post};
 document.querySelector('#panel').innerHTML=renderHud(t,phaseNames[state.phase],state.index,state.queue.length,item,state,state.phase);
 if(object){ctx.scene.remove(object);object.traverse(o=>{o.geometry?.dispose();if(o.material)Array.isArray(o.material)?o.material.forEach(m=>m.dispose()):o.material.dispose()})}
 object=makeWasteItem(ctx.scene,item);object.position.set(0,2.15,.12);bindControls(item);
}
function bindControls(item){
 const canvas=ctx.renderer.domElement;
 const pick=e=>{const r=canvas.getBoundingClientRect();ray.setFromCamera(new ctx.THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),ctx.camera);if(!object||state.locked)return;const hits=ray.intersectObjects(object.children,true);if(hits.length){dragging=true;state.held=item;canvas.setPointerCapture(e.pointerId);canvas.style.cursor='grabbing';announce(t.drop)}};
 const move=e=>{if(!dragging||!object||state.locked)return;const r=canvas.getBoundingClientRect();ray.setFromCamera(new ctx.THREE.Vector2(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1),ctx.camera);const p=new ctx.THREE.Vector3();if(ray.ray.intersectPlane(plane,p))object.position.set(p.x,2.15,p.z)};
 const up=e=>{if(!dragging)return;dragging=false;canvas.style.cursor='grab';const target=nearestBin(e.clientX,e.clientY);if(target)answer(item,target)};
 canvas.onpointerdown=pick;canvas.onpointermove=move;canvas.onpointerup=up;canvas.onpointercancel=up;canvas.style.cursor='grab';
 document.querySelectorAll('.bin-chip').forEach((el,i)=>{el.onclick=()=>state.held?answer(item,['wet','dry','hazardous'][i]):announce(t.notPicked);el.setAttribute('role','button');el.tabIndex=0;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();el.click()}}});
 document.querySelector('#next').onclick=advanceAfterAnswer;
 document.querySelector('#sound').onclick=e=>{soundOn=!soundOn;e.currentTarget.setAttribute('aria-pressed',String(soundOn));e.currentTarget.classList.toggle('active',soundOn)};
}
function nearestBin(x,y){let best=null,d=150;for(const [cat,g]of Object.entries(ctx.bins)){const p=g.position.clone().add(new ctx.THREE.Vector3(0,1,0)).project(ctx.camera),r=ctx.renderer.domElement.getBoundingClientRect(),sx=(p.x+1)*r.width/2+r.left,sy=(-p.y+1)*r.height/2+r.top,dist=Math.hypot(x-sx,y-sy);if(dist<d){d=dist;best=cat}}return best}
function announce(text){const f=document.querySelector('#feedback');if(f)f.textContent=text}
function playCue(correct){if(!soundOn)return;const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;const ac=new AudioCtx(),osc=ac.createOscillator(),gain=ac.createGain();osc.type='sine';osc.frequency.value=correct?660:220;gain.gain.setValueAtTime(.07,ac.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.16);osc.connect(gain);gain.connect(ac.destination);osc.start();osc.stop(ac.currentTime+.17);osc.onended=()=>ac.close()}
function answer(item,category){
 if(state.locked)return;if(!state.held){announce(t.notPicked);return}
 const correct=isCorrect(item,category),phase=state.phase;if(phase==='training')playCue(correct);
 const recorded={id:item.id,name:item.name,category:item.category,chosen:category,correct};
 if(phase==='pre')state.preAnswers.push(recorded);if(phase==='post')state.postAnswers.push(recorded);
 state.answers.push({...recorded,phase,at:Date.now()});state=scoreAnswer(state,correct);state.locked=true;state.answered=true;
 const bin=ctx.bins[category];
 if(phase==='training'){
  const color=correct?0x54d997:0xee6059;
  bin.traverse(o=>{if(o.material?.emissive){o.material.emissive.setHex(color);o.material.emissiveIntensity=.75;setTimeout(()=>{if(o.material)o.material.emissiveIntensity=0},450)}});
  announce(correct?`✓ ${t.correct}`:`↩ ${t.wrong} · ${item.name} → ${t[item.category]}`);
  document.querySelector('#tip').textContent=`${t.tip}: ${item.tip}`;
  const pos=bin.position.clone().add(new ctx.THREE.Vector3(0,1.3,0));animators.push(showConsequence(ctx.scene,pos,correct?'good':'bad'));
  if(correct)object.visible=false;else{const answeredObject=object;answeredObject.position.set(0,2.15,.12);answeredObject.rotation.z=Math.PI;setTimeout(()=>{answeredObject.rotation.z=0},260)}
 }else{
  // Baseline and post-test answers are recorded without correctness feedback.
  object.visible=false;announce(`${t.answerRecorded} · ${t.nextBelow}`);
 }
 const button=document.querySelector('#next'),last=state.index===state.queue.length-1;
 button.hidden=false;button.textContent=`${last?(phase==='post'?t.reviewResults:phase==='pre'?t.training:t.post):t.next} →`;
 button.focus({preventScroll:true});
}
function advanceAfterAnswer(){
 if(!state.answered)return;
 state.answered=false;state.locked=false;state.held=null;state.index++;renderRound();
}
function advancePhase(){
 if(state.phase==='pre'){state.preScore=accuracy(state.preAnswers);state.phase='training';state.index=0;state.queue=state.trainQueue;state.score=0;state.streak=0;state.bestStreak=0;state.answers=[];renderRound();return}
 if(state.phase==='training'){state.phase='post';state.index=0;state.postAnswers=[];state.queue=state.postQueue;renderRound();return}
 if(state.phase==='post')finish();
}
function formatDuration(seconds){const m=Math.floor(seconds/60),s=seconds%60;return m?`${m}m ${s}s`:`${s}s`}
async function finish(){
 const postScore=accuracy(state.postAnswers),trainingCorrect=state.answers.filter(a=>a.phase==='training'&&a.correct).length,counts={};
 for(const a of state.postAnswers)if(!a.correct)counts[a.name]=(counts[a.name]||0)+1;
 const mistakes=Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([name,count])=>({name,count}));
 const duration=Math.round((Date.now()-state.startedAt)/1000);
 const report={preScore:state.preScore,postScore,trainingCorrect,trainingTotal:state.trainQueue.length,trainingPoints:state.score,bestStreak:state.bestStreak,duration:formatDuration(duration),preAnswers:state.preAnswers,postAnswers:state.postAnswers,mistakes};
 const session={session_id:crypto.randomUUID(),age_group:meta.age_group||'',area_type:meta.area_type||'',prior_practice:meta.prior_practice||'',difficulty:meta.difficulty||'medium',pre_score:state.preScore,post_score:postScore,mistakes_json:mistakes,duration_s:duration,answers:[...state.preAnswers.map(a=>({...a,phase:'pre'})),...state.answers,...state.postAnswers.map(a=>({...a,phase:'post'}))]};
 await saveSession(session);disposeScene();state.phase='result';app.innerHTML=renderResult(t,report);
 document.querySelector('#download').onclick=downloadSessions;document.querySelector('#restart').onclick=startScreen;
}
document.addEventListener('keydown',e=>{if(['1','2','3'].includes(e.key)&&!['intro','result'].includes(state.phase)){const held=state.held;if(held)answer(held,['wet','dry','hazardous'][Number(e.key)-1]);else announce(t.notPicked)}});
startScreen();


