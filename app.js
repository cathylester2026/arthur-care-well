// Arthur · Care Well — stable single-player edition. No build tools or services required.
const CFG = window.ARTHUR_CONFIG || {};
const GAME={
 budgets:{capital:7,change:8,operations:7},
 dimensions:['Journey Clarity','Service Continuity','Spatial Adaptability','Operational Authority','Capacity Resilience','Transition Integrity'],
 decisions:[
 {id:'arrival',title:'How will the campus meet Arthur?',prompt:'Choose where arrival intelligence should live.',options:[
 {id:'digital',letter:'A',name:'Digital Arrival',tag:'Arthur’s phone becomes the front door.',creates:['Personalized parking and check-in','Live directions and itinerary updates','Support-person notifications'],requires:['Reliable connectivity','Accurate digital and physical naming','Accessible fallback'],risk:'Clear instructions can still lead through a confusing building.',cost:[1,2,1],impact:[2,2,0,1,1,1],strength:'Responsive Arrival',boost:[1,1,0,0,1,0]},
 {id:'legible',letter:'B',name:'Legible Campus',tag:'The building explains the journey.',creates:['Visible destinations','Fewer wrong turns','Accessible routes for everyone'],requires:['Clear sightlines','Recognizable landmarks','Fewer decision points'],risk:'Arthur can find the destination, but the building cannot fix the schedule.',cost:[3,1,0],impact:[3,1,2,0,1,0],strength:'Responsive Environment',boost:[0,1,1,0,1,0]},
 {id:'human',letter:'C',name:'Human Welcome',tag:'A guide helps assemble Arthur’s visit.',creates:['Personal support','Early identification of needs','Help when the plan changes'],requires:['Cross-trained staff','Access to schedules','Authority to resolve problems'],risk:'A helpful person cannot fix the journey without authority.',cost:[1,2,3],impact:[3,2,1,2,1,1],strength:'Journey Navigator',boost:[0,1,0,1,1,1]}]},
 {id:'care',title:'How will care come together?',prompt:'Choose how imaging, diagnostics, surgery and pharmacy operate as one episode.',options:[
 {id:'network',letter:'A',name:'Department Network',tag:'Connect the departments while keeping each service in its own area.',creates:['One itinerary','Shared status','Concentrated expertise'],requires:['Shared scheduling','Standard handoffs','Protected linked slots'],risk:'Arthur’s information moves as one record. Arthur still moves as several appointments.',cost:[1,2,1],impact:[2,2,1,1,1,1],strength:'Coordinated Network',boost:[0,1,0,1,1,1]},
 {id:'core',letter:'B',name:'Shared Diagnostic Core',tag:'Create one preparation and diagnostic journey.',creates:['One check-in','Shared preparation','Ability to reorder the visit'],requires:['Universal rooms','Common booking','Joint operational authority'],risk:'Departments may share space while protecting separate schedules.',cost:[3,3,2],impact:[3,3,2,2,3,2],strength:'Integrated Diagnostic Platform',boost:[0,0,0,1,1,1]},
 {id:'comes',letter:'C',name:'Care Comes to Arthur',tag:'Arthur stays in one flexible setting while selected services move.',creates:['Less patient movement','Fewer repeated waits','Greater continuity'],requires:['Universal care rooms','Mobile equipment routes','Staff and equipment tracking'],risk:'Reducing Arthur’s movement increases operational movement.',cost:[2,3,3],impact:[3,3,3,2,1,2],strength:'Distributed Care Platform',boost:[0,0,0,1,1,0]}]},
 {id:'leave',title:'How will Arthur leave ready?',prompt:'Choose what the campus resolves before Arthur goes home.',options:[
 {id:'fast',letter:'A',name:'Fast Exit',tag:'Prepare everything before Arthur is ready to leave.',creates:['Less discharge waiting','Medication ready','Coordinated pickup'],requires:['Early planning','Pharmacy integration','Support-person updates'],risk:'The model works best when recovery follows the expected path.',cost:[1,2,1],impact:[2,2,1,2,1,3],strength:'Responsive Departure',boost:[1,1,0,0,1,0]},
 {id:'adaptive',letter:'B',name:'Adaptive Recovery',tag:'Change Arthur’s recovery setting as Arthur’s needs change.',creates:['Recovery matched to need','Capacity for slower recovery','Better use of procedure space'],requires:['Different recovery settings','Flexible monitoring','Flexible staffing'],risk:'Flexible rooms do not create flexible care unless staffing moves too.',cost:[3,2,2],impact:[2,2,3,2,3,2],strength:'Elastic Recovery Platform',boost:[0,1,0,1,0,1]},
 {id:'wellness',letter:'C',name:'Connected Wellness',tag:'Use the procedure as the beginning of Arthur’s next care plan.',creates:['Confirmed follow-up','Connected medication and recovery','Continued support'],requires:['Wellness navigation','Virtual care','Named follow-up ownership'],risk:'A referral is not continuity unless capacity and ownership exist.',cost:[2,3,3],impact:[3,3,2,2,2,3],strength:'Closed-Loop Wellness',boost:[0,0,0,1,1,0]}]}],
 synergies:[['digital','network',1,1],['digital','core',0,1],['legible','core',2,1],['human','network',3,1],['human','comes',0,1],['core','adaptive',4,1],['comes','adaptive',2,1],['network','wellness',5,1],['core','wellness',1,1],['human','wellness',5,1]]
};
const STORAGE_KEY = 'arthur-care-well-v18';
const OLD_KEY = 'arthur-care-well';
const SCREEN_ORDER = ['intro','campus','arthur','baseline','howto','launch','d1','d2','d3','impact1','impact2','impact3','reveal1','reveal2','reveal3','watershed1','watershed2','watershed3','shift1','shift2','shift3','readiness','disruption','pressure','lens','commit','result','journeyResult'];
const app = document.getElementById('app');
const newId = () => (window.crypto && typeof crypto.randomUUID==='function') ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fresh = () => ({screen:'intro', helpReturn:null, baselineStep:0, choices:{}, watersheds:{}, reserveApplied:false, strengthened:null, readiness:null, startedAt:null, sessionId:newId(), events:[], completed:false, lensTab:'operations', commitment:null, journeyStep:0});
function load() {
 try {
  const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;
  const saved=JSON.parse(raw);if(!saved||typeof saved!=='object'||!saved.choices)return null;
  const next=fresh();
  for(const d of GAME.decisions){if(d.options.some(o=>o.id===saved.choices[d.id]))next.choices[d.id]=saved.choices[d.id];}
  // Reject invalid and over-budget portfolios, including edited localStorage.
  if(!withinBudget(next.choices))return null;
  for(const [stage,valid] of [['arrival',['central','department','federated']],['care',['local','coordinator','shared']],['leave',['fixed','flex','response']]]){
    if(valid.includes(saved.watersheds?.[stage]))next.watersheds[stage]=saved.watersheds[stage];
  }
  if(['arrival','care','leave'].includes(saved.readiness?.priority) && next.watersheds.arrival)
    next.readiness={registration:next.watersheds.arrival,priority:saved.readiness.priority};
  next.reserveApplied=Boolean(saved.reserveApplied)&&next.readiness!==null;
  if(next.readiness)next.strengthened=next.choices[next.readiness.priority]||null;
  if(SCREEN_ORDER.includes(saved.screen))next.screen=saved.screen;
  if(typeof saved.startedAt==='string')next.startedAt=saved.startedAt;
  if(typeof saved.helpReturn==='string' && SCREEN_ORDER.includes(saved.helpReturn))next.helpReturn=saved.helpReturn;
  if(Number.isInteger(saved.baselineStep))next.baselineStep=Math.max(0,Math.min(3,saved.baselineStep));
  if(typeof saved.sessionId==='string')next.sessionId=saved.sessionId;
  if(Array.isArray(saved.events))next.events=saved.events.slice(-100);
  if(['operations','design'].includes(saved.lensTab))next.lensTab=saved.lensTab;
  if(Number.isInteger(saved.journeyStep))next.journeyStep=Math.max(0,Math.min(4,saved.journeyStep));
  if(saved.commitment && ['arrival','care','leave'].includes(saved.commitment.id) && ['enable','coordinate','preserve'].includes(saved.commitment.category))next.commitment={id:saved.commitment.id,category:saved.commitment.category};
  const progress=ids(next.choices).length;
  if(progress===0 && !['intro','campus','arthur','baseline','howto','launch','d1'].includes(next.screen))next.screen='d1';
  else if(progress===1 && !['intro','d1','impact1','reveal1','watershed1','shift1','d2'].includes(next.screen))next.screen='impact1';
  else if(progress===2 && !['intro','d1','impact1','reveal1','watershed1','shift1','d2','impact2','reveal2','watershed2','shift2','d3'].includes(next.screen))next.screen='impact2';
  else if(progress===3 && ['disruption','pressure','lens','commit','result','journeyResult'].includes(next.screen) && !next.readiness)next.screen='readiness';
  if(progress>=1 && !next.watersheds.arrival && ['d2','impact2','reveal2','watershed2','shift2','d3','impact3','reveal3','watershed3','shift3','readiness','disruption','pressure','lens','commit','result','journeyResult'].includes(next.screen))next.screen='watershed1';
  else if(progress>=2 && !next.watersheds.care && ['d3','impact3','reveal3','watershed3','shift3','readiness','disruption','pressure','lens','commit','result','journeyResult'].includes(next.screen))next.screen='watershed2';
  else if(progress>=3 && !next.watersheds.leave && ['readiness','disruption','pressure','lens','commit','result','journeyResult'].includes(next.screen))next.screen='watershed3';
  if(/^shift[1-3]$/.test(next.screen)){const n=Number(next.screen.slice(5));const key=GAME.decisions[n-1].id;if(!next.watersheds[key])next.screen=`watershed${n}`;}
  if(['result','journeyResult'].includes(next.screen)&&!next.commitment)next.screen='commit';
  next.completed=['result','journeyResult'].includes(next.screen);return next;
 } catch(err){console.warn('Saved game could not be restored',err);return null;}
}
// Always begin at the story for a new page visit. The valid saved game remains
// available via an explicit Resume Journey action; this avoids skipping ACHC/Arthur.
let state=fresh();
let db=null;
try { if (CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase) db=window.supabase.createClient(CFG.supabaseUrl,CFG.supabaseAnonKey); }
catch(err) { console.warn('Telemetry unavailable; local game continues',err); }
function save(){ try {localStorage.setItem(STORAGE_KEY, JSON.stringify(state));} catch(err){console.warn('Local save unavailable',err);} }
function event(type,payload={}) {
  const e={session_id:state.sessionId,event_type:type,payload,game_version:CFG.gameVersion||'dev'};
  state.events.push(e); if(state.events.length>100)state.events.shift(); save();
  if(db) db.from('game_events').insert(e).then(({error})=>{if(error)console.warn('Telemetry:',error.message)}).catch(()=>{});
}
function option(id){for(const d of GAME.decisions){const o=d.options.find(o=>o.id===id);if(o)return o;}return null;}
function ids(choices=state.choices){return GAME.decisions.map(d=>choices[d.id]).filter(Boolean);}
function totals(choices=state.choices){
  const t={capital:0,change:0,operations:0};
  for(const id of ids(choices)){const o=option(id);if(!o)continue;t.capital+=o.cost[0];t.change+=o.cost[1];t.operations+=o.cost[2];}
  return t;
}
function withinBudget(choices){const t=totals(choices),b=GAME.budgets;return ['capital','change','operations'].every(k=>t[k]<=b[k]);}
// Operational commitments are distinct from the capital investments. Each watershed
// expresses a future design intent, but only an opening-day priority with sufficient
// remaining capacity activates that operating model. All other choices retain future value.
const MODEL_REQUIREMENTS = {
 arrival:{central:[0,1,0],department:[0,0,0],federated:[0,1,1]},
 care:{local:[0,0,0],coordinator:[0,1,1],shared:[0,2,1]},
 leave:{fixed:[0,0,0],flex:[1,1,1],response:[0,1,1]}
};
const RESOURCE_NAMES=['capital','change','operations'];
function modelRequirements(stage){return MODEL_REQUIREMENTS[stage]?.[state.watersheds[stage]]||[0,0,0];}
function modelCanActivate(stage){
 if(!state.watersheds[stage])return false;
 const req=modelRequirements(stage),t=totals(),b=GAME.budgets;
 return RESOURCE_NAMES.every((k,i)=>t[k]+req[i]<=b[k]);
}
function modelActive(stage){return state.readiness?.priority===stage && modelCanActivate(stage);}
function resourceTotals(){
 const t=totals();const active=state.readiness?.priority;
 if(active && modelActive(active))RESOURCE_NAMES.forEach((k,i)=>{t[k]+=modelRequirements(active)[i]});
 if(state.reserveApplied){t.change++;t.operations++;}
 return t;
}
function resourceMeter(){
 const t=resourceTotals(),b=GAME.budgets;const selected=ids().length;
 if(!selected)return '';
 return `<aside class="resource-ribbon" aria-label="Remaining implementation resources"><span class="resource-caption">YOUR IMPLEMENTATION CAPACITY</span><div class="resource-items">${RESOURCE_NAMES.map(k=>`<div class="resource-item"><span>${k[0].toUpperCase()+k.slice(1)} <b>${Math.max(0,b[k]-t[k])} left</b></span><div class="resource-track"><i class="${k}" style="width:${Math.min(100,100*t[k]/b[k])}%"></i></div></div>`).join('')}</div><small>Investments${state.readiness?.priority && modelActive(state.readiness.priority)?' + active operating model':''}${state.reserveApplied?' + response reserve':''}</small></aside>`;
}
function modelReadinessNote(stage){
 const key=state.watersheds[stage];if(!key)return '';
 const r=modelRequirements(stage),can=modelCanActivate(stage);
 const label=RESOURCE_NAMES.map((k,i)=>`${r[i]} ${k==='operations'?'Operations':k[0].toUpperCase()+k.slice(1)}`).join(' · ');
 return {can,req:r,label,stage,key};
}
function assetURL(path){
 const filename=String(path).split('/').pop();
 return window.ARTHUR_ASSETS?.[filename]||path;
}

// Validate the entire remaining route, not just the next screen.
function completionExists(choices,index=0){
  if(!withinBudget(choices))return false;
  if(index>=GAME.decisions.length)return true;
  const d=GAME.decisions[index];
  if(choices[d.id])return completionExists(choices,index+1);
  return d.options.some(o=>completionExists({...choices,[d.id]:o.id},index+1));
}
function optionAvailable(did,oid){
  const proposed={...state.choices};
  const idx=GAME.decisions.findIndex(d=>d.id===did);
  if(idx<0 || !GAME.decisions[idx].options.some(o=>o.id===oid)) return false;
  for(let i=idx;i<GAME.decisions.length;i++)delete proposed[GAME.decisions[i].id];
  proposed[did]=oid;
  return completionExists(proposed);
}
function scores(){
  const chosen=ids();let raw=[0,0,0,0,0,0];
  chosen.forEach(id=>option(id).impact.forEach((v,i)=>raw[i]+=v));
  GAME.synergies.forEach(([a,b,i,v])=>{if(chosen.includes(a)&&chosen.includes(b))raw[i]+=v;});
  const norm=raw.map(v=>Math.min(3,Math.max(0,Math.round(v/Math.max(1,chosen.length)))));
  // Capability scores show the portfolio; operational readiness affects observed consequences, not free numeric boosts.
  return norm;
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
const CHAPTERS=[
 {name:'Meet ACHC & Arthur',short:'Meet',icon:'⌂',screens:['intro','campus','arthur']},
 {name:'Arthur’s baseline',short:'Baseline',icon:'①',screens:['baseline']},
 {name:'Learn to play',short:'Learn',icon:'?',screens:['howto','launch']},
 {name:'Investments & watershed choices',short:'Invest',icon:'◆',screens:['d1','impact1','reveal1','watershed1','shift1','d2','impact2','reveal2','watershed2','shift2','d3','impact3','reveal3','watershed3','shift3']},
 {name:'Opening-day choices',short:'Opening',icon:'◷',screens:['readiness']},
 {name:'Arthur’s changed day',short:'Change',icon:'↝',screens:['disruption','pressure']},
 {name:'Design & results',short:'Design',icon:'✓',screens:['lens','commit','result','journeyResult']}
];
function chapterIndex(){return Math.max(0,CHAPTERS.findIndex(c=>c.screens.includes(state.screen)));}
function journeyMap(){
 const active=chapterIndex();
 return `<nav class="chapter-map" aria-label="Your journey through the game">${CHAPTERS.map((c,i)=>`<div class="chapter-step ${i===active?'active':i<active?'done':''}" ${i===active?'aria-current="step"':''}><span class="chapter-bubble">${i<active?'✓':c.icon}</span><span class="chapter-name">${escapeHTML(c.short)}</span></div>`).join('')}</nav>`;
}
function shell(inner,step=0){return `<div class="shell"><div class="topbar"><div class="brand">Arthur <span>·</span> Care Well</div><div class="top-controls"><button class="story-return" data-action="story-home" aria-label="Return to story introduction">Meet ACHC & Arthur</button><button class="story-return" data-action="open-help">How to Play</button><div class="version">Single player · ${escapeHTML(CFG.gameVersion||'prototype')}</div></div></div>${journeyMap()}${resourceMeter()}${inner}<div class="footerline">A health campus is more than a collection of services. We are designing how the experience connects around Arthur.</div></div>`;}
function render(){
  if(state.screen==='intro')return intro();
  if(state.screen==='campus')return campusScreen();
  if(state.screen==='arthur')return arthurScreen();
  if(state.screen==='baseline')return baselineScreen();
  if(state.screen==='howto')return howToScreen();
  if(state.screen==='launch')return launchScreen();
  if(state.screen==='readiness')return readinessScreen();
  if(/^watershed[1-3]$/.test(state.screen))return watershedScreen(Number(state.screen.slice(9)));
  if(/^shift[1-3]$/.test(state.screen))return designShiftScreen(Number(state.screen.slice(5)));
  if(/^impact[1-3]$/.test(state.screen))return investmentImpact(Number(state.screen.slice(6)));
  if(/^reveal[1-3]$/.test(state.screen))return investmentReveal(Number(state.screen.slice(6))); 
  if(state.screen==='disruption')return disruption();
  if(state.screen==='pressure')return pressure();
  if(/^d[1-3]$/.test(state.screen))return decision(Number(state.screen.slice(1)));
  if(state.screen==='lens')return lensScreen();
  if(state.screen==='commit')return commitmentScreen();
  if(state.screen==='result')return result();
  if(state.screen==='journeyResult')return journeyResult();
  state.screen='intro';save();intro();
}
// v0.9: Ground the game in the ACHC ecosystem and Arthur's ordinary pre-procedure journey.
// This is an illustrative workshop case, not a prescribed clinical pathway.
const BASELINE_STOPS = [
 {name:'Arrival',short:'Find the first desk',icon:'⌖',image:'access-0.webp',question:'Is this one check-in or the first of several?',feel:'I just want to know I am in the right place.',issue:'A clear first stop does not guarantee that every service has the same registration requirements.',value:'Clarity'},
 {name:'Laboratory',short:'Complete lab work',icon:'◉',image:'lab-journey.webp',question:'Does the lab know Arthur is expected today?',feel:'I have followed the instructions. I hope I have everything I need.',issue:'A lab may be ready for the test while the wider visit still depends on separate appointments and status updates.',value:'Continuity'},
 {name:'Imaging',short:'Complete imaging',icon:'▣',image:'connected-1.webp',question:'Can the next service see when imaging is complete?',feel:'I am trying to keep everything on schedule.',issue:'Imaging has specialized capacity and readiness requirements; co-location does not itself connect the schedule.',value:'Continuity'},
 {name:'Pre-check consult',short:'Confirm procedure readiness',icon:'✓',image:'distributed-0.webp',question:'Is the consultation team ready with the information it needs?',feel:'Will everything be ready so my procedure can go ahead?',issue:'The plan depends on the right results, clinical review and someone accountable for communicating what comes next.',value:'Confidence'}
];
function intro(){
 app.innerHTML=shell(`<section class="hero intro-v9"><div class="eyebrow">Airdrie Covenant Health Centre · Digital visioning simulation</div><h1>Design the<br>connections.</h1><p>One campus. Many services. A future that has to work together.</p><div class="opening-visual">${designScene('access',2,'hero')}</div><p class="lede">Before choosing technology or rooms, meet the campus—and the person who will depend on it.</p><div class="actions"><button class="primary" data-action="begin">Enter the Airdrie campus →</button><button class="secondary" data-action="open-gallery">Explore the six futures</button>${load()?.screen !== 'intro'?'<button class="secondary" data-action="resume">Resume saved journey →</button>':''}</div></section>`);
}
function begin(){state=fresh();state.startedAt=new Date().toISOString();state.screen='campus';event('game_started');render();}
function resume(){const saved=load();if(!saved)return begin();state=saved;render();}
function storyHome(){state.screen='intro';render();}
function campusScreen(){
 app.innerHTML=shell(`<section class="panel story-panel"><div class="story-step">THE PLACE · 01 / 03</div><h2>One health centre. Many care journeys.</h2><p class="lede">Airdrie Covenant Health Centre (ACHC) is being envisioned as a three-building connected ecosystem—not simply an inventory of rooms and departments.</p><div class="story-image">${designScene('access',2,'hero')}<span class="story-image-tag">Illustrative campus future</span></div><div class="service-cloud" aria-label="Services in the campus"><span>Urgent care</span><span>Outpatient clinics</span><span>Laboratory + diagnostics</span><span>Imaging</span><span>Day surgery</span><span>Pharmacy</span><span>Maternal care</span><span>Behavioral health</span><span>Independent partners</span></div><div class="story-callout"><span class="story-symbol">↔</span><div><strong>The design challenge</strong><p>People, information and responsibility must move across buildings and services—even when some providers operate outside Covenant Health.</p></div></div><div class="actions"><button class="primary" data-action="next-opening" data-dest="arthur">Meet Arthur →</button><button class="secondary" data-action="open-gallery">See the six design futures</button></div><p class="small">Illustrative visioning scenario. Service arrangements and operational models are not approved specifications.</p></section>`);
}
function arthurScreen(){
 app.innerHTML=shell(`<section class="panel story-panel"><div class="story-step">THE PERSON · 02 / 03</div><h2>Arthur has a procedure coming up.</h2><div class="arthur-layout"><div class="arthur-portrait"><div class="person-illustration" role="img" aria-label="Illustration representing Arthur at home reviewing care instructions"><svg viewBox="0 0 440 350" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="room" x2="1" y2="1"><stop stop-color="#d7ebe3"/><stop offset="1" stop-color="#f6e7d3"/></linearGradient></defs><rect width="440" height="350" fill="url(#room)"/><rect x="34" y="22" width="140" height="186" rx="10" fill="#f5f8f3"/><rect x="51" y="36" width="106" height="158" fill="#c1e5e6"/><path d="M51 164Q100 118 157 153V194H51Z" fill="#96b7a6"/><rect x="0" y="282" width="440" height="68" fill="#b77e59"/><rect x="250" y="194" width="159" height="98" rx="12" fill="#faf9f4" transform="rotate(-7 250 194)"/><path d="M278 222h100M278 239h84M278 256h90" stroke="#8db4ae" stroke-width="6" stroke-linecap="round"/><path d="M96 303V223Q96 150 184 150H252Q328 150 329 242V303" fill="#3b7977"/><ellipse cx="214" cy="130" rx="73" ry="84" fill="#e9bc9c"/><path d="M142 111q-10-89 71-92 88-5 76 92-25-30-53-26-60 0-94 26Z" fill="#dce2de"/><path d="M154 148q27 16 54 0M222 148q28 13 51-2" fill="none" stroke="#9c6650" stroke-width="4"/><rect x="150" y="117" width="53" height="30" rx="14" fill="none" stroke="#354e52" stroke-width="5"/><rect x="220" y="117" width="53" height="30" rx="14" fill="none" stroke="#354e52" stroke-width="5"/><path d="M204 130h14" stroke="#354e52" stroke-width="5"/><path d="M198 184q17 12 33 0" fill="none" stroke="#a86c61" stroke-width="4"/><path d="M170 278q62-30 118 9" stroke="#d9ede6" stroke-width="13" fill="none"/></svg></div><div class="portrait-caption">Arthur · 72 · Preparing for outpatient care</div></div><div class="arthur-story"><p>Arthur and his wife have planned around a forthcoming outpatient procedure. Before it can proceed, his care team has asked him to complete three steps at the centre.</p><div class="three-needs"><span>◉ Lab work</span><span>▣ Imaging</span><span>♧ Pre-check consult</span></div><div class="arthur-quote">“I don't mind the tests. I just want to know everyone has what they need so my procedure stays on track.”</div><p class="small">Arthur and his procedure are fictional; these pre-procedure requirements are assumptions for the game, not universal clinical rules.</p></div></div><div class="actions"><button class="primary" data-action="next-opening" data-dest="baseline">Walk Arthur's visit →</button><button class="secondary" data-action="next-opening" data-dest="campus">Back to campus</button></div></section>`);
}
function baselineScreen(){
 const i=state.baselineStep||0, s=BASELINE_STOPS[i];
 const nodes=BASELINE_STOPS.map((x,n)=>`<button class="journey-node ${n===i?'active':''} ${n<i?'visited':''}" data-action="baseline-jump" data-step="${n}" aria-pressed="${n===i}"><span class="journey-number">${n+1}</span><strong>${escapeHTML(x.name)}</strong><small>${escapeHTML(x.short)}</small></button>`).join('');
 app.innerHTML=shell(`<section class="panel story-panel"><div class="story-step">THE BASELINE · 03 / 03</div><h2>One visit. Four stops. One big question.</h2><p class="lede">Before any new investments, walk the everyday journey Arthur needs to complete. Each service can do its job well, while connections between services remain uncertain.</p><div class="journey-track">${nodes}</div><div class="baseline-stage"><div class="baseline-scene"><img src="assets/${s.image}" alt="Illustrative ACHC clinical environment for ${escapeHTML(s.name)}"><div class="baseline-scene-label">STOP ${i+1} OF 4 · ${escapeHTML(s.name)}</div></div><div class="baseline-text"><div class="baseline-kicker">WHAT ARTHUR NEEDS · ${escapeHTML(s.value)}</div><h3>${escapeHTML(s.question)}</h3><blockquote>“${escapeHTML(s.feel)}”</blockquote><div class="baseline-dependency"><strong>What may require coordination</strong><p>${escapeHTML(s.issue)}</p></div></div></div><div class="baseline-values"><span>⌖ Clarity</span><span>↔ Continuity</span><span>♡ Confidence</span></div><div class="actions">${i<3?`<button class="primary" data-action="baseline-next">Next stop →</button>`:`<button class="primary" data-action="baseline-finish">See how we can improve Arthur’s journey →</button>`}<button class="secondary" data-action="baseline-back">${i>0?'Previous stop':'Back to Arthur'}</button></div><p class="small">Illustrative baseline, not evidence of existing ACHC service failures. No delay or unsafe care is presumed.</p></section>`);
}
function goOpening(dest){if(!['campus','arthur','baseline'].includes(dest))return;state.screen=dest;if(dest==='baseline')state.baselineStep=0;save();render();}
function baselineNext(){if(state.baselineStep<3)state.baselineStep++;save();render();}
function baselineBack(){if(state.baselineStep>0){state.baselineStep--;save();render();}else goOpening('arthur');}
function baselineFinish(){if(state.baselineStep!==3)return;state.screen='howto';state.helpReturn=null;event('baseline_completed');render();}

function howToScreen(){
 const returning=!!state.helpReturn;
 const steps=[
  ['01','Meet Arthur','You’ve seen his planned visit: registration, lab work, imaging and pre-check.'],
  ['02','Invest in the future','Make three choices. Each decision uses Capital, Change and Operations resources.'],
  ['03','See the impact & reveal','First see what your investment enables and costs. Then see what Arthur experiences.'],
  ['04','Choose opening-day priorities','Decide what can actually be operational at opening. Other investments retain future value.'],
  ['05','Respond to a change','Arthur’s plan changes. Discover which connections work and which remain fragile.'],
  ['06','Translate into design','Explore architecture, functional planning and engineering implications.']
 ];
 app.innerHTML=shell(`<section class="panel onboarding"><div class="stage">YOUR GAME GUIDE · HOW TO PLAY</div><h2>Here’s how to shape Arthur’s future.</h2><p class="lede">Your investments will help Arthur. They will also commit resources, create obligations and change what else ACHC can deliver at opening.</p><div class="onboarding-grid"><div class="guide-card"><h3>The journey ahead</h3><div class="how-steps">${steps.map(([n,t,d])=>`<div class="how-step"><span class="how-count">${n}</span><div><strong>${t}</strong><p>${d}</p></div></div>`).join('')}</div></div><div class="guide-card"><h3>How to read an investment card</h3><div class="guide-image">${investmentScene('digital','card')}</div><div class="guide-key"><div><span class="guide-token gain">✓ Helps Arthur</span><p>What this investment makes easier for his journey.</p></div><div><span class="guide-token cost">↔ Demands more</span><p>The operational and design obligations it creates.</p></div><div><span class="guide-token resource">Capital · Change · Operations</span><p>The limited resources available for all three investments.</p></div><div><span class="guide-token more">Learn More</span><p>Optional images and architecture, planning and engineering impacts.</p></div></div></div></div><div class="guide-bottom"><strong>Your goal</strong><p>Make thoughtful investments that help Arthur now, while keeping ACHC ready for future care. No investment is simply “bad”—but you cannot do everything at once.</p></div><div class="actions"><button class="primary" data-action="help-next">${returning?'Return to my journey':'See the challenge →'}</button><button class="secondary" data-action="next-opening" data-dest="baseline">Back to Arthur’s baseline</button></div></section>`);
}
function launchScreen(){
 app.innerHTML=shell(`<section class="panel launch-game"><div class="launch-grid"><div class="launch-image">${investmentScene('digital','hero')}</div><div class="launch-copy"><div class="stage">YOUR NEXT CHAPTER · THE INVESTMENTS</div><h2>Let’s see how we can make Arthur’s journey successful.</h2><p>You’ve walked his baseline. Now help ACHC make the experience clearer, more connected and more reliable—while making smart choices about what can be ready at opening.</p><div class="launch-values"><span>✓ Improve Arthur’s experience</span><span>↔ Connect services</span><span>◷ Preserve future options</span></div><div class="actions"><button class="primary" data-action="launch-investments">Explore your first investment →</button><button class="secondary" data-action="launch-back">Back to How to Play</button></div></div></div></section>`);
}
function openHelp(){if(state.screen!=='howto')state.helpReturn=state.screen;state.screen='howto';save();render();}
function helpNext(){const returning=state.helpReturn;if(returning && SCREEN_ORDER.includes(returning)){state.screen=returning;state.helpReturn=null;}else state.screen='launch';save();render();}
function launchInvestments(){state.screen='d1';state.helpReturn=null;save();render();}
function resources(){const t=totals(),b=GAME.budgets;return `<div class="resourcebar" aria-label="Resource use">${[['capital','Capital'],['change','Change'],['operations','Operations']].map(([k,l])=>`<span class="resource ${t[k]>b[k]?'over':''}">${l}: ${t[k]} / ${b[k]}</span>`).join('')}</div>`;}
function decision(n){
  const d=GAME.decisions[n-1];
  const previous=n>1?`<button class="secondary" data-action="back" data-step="${n-1}">Back to decision ${n-1}</button>`:'';
  app.innerHTML=shell(`<section class="panel"><div class="stage">Decision ${n} of 3 · ${n===1?'Arthur’s baseline: clarity':n===2?'Arthur’s baseline: continuity':'Arthur’s baseline: confidence'}</div><h2>${escapeHTML(d.title)}</h2><p class="lede">${escapeHTML(d.prompt)}</p>${resources()}<div class="cards">${d.options.map((o,idx)=>{
    const available=optionAvailable(d.id,o.id);
    return `<article class="card ${!available?'unavailable':''}"><div class="letter">${escapeHTML(o.letter)}</div>${investmentScene(o.id,'card')}<h3>${escapeHTML(o.name)}</h3><div class="tagline">${escapeHTML(o.tag)}</div><div class="card-snapshot positive"><b>✓ Helps Arthur</b><span>${escapeHTML(o.creates[0])}</span></div><div class="card-snapshot drawback"><b>↔ Demands more</b><span>${escapeHTML(o.risk)}</span></div><details class="choice-details"><summary>What else does this enable or require?</summary><strong>Creates</strong><ul>${o.creates.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><strong>Requires</strong><ul>${o.requires.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul></details>${momentLinkForChoice(d.id,o.id)}<div class="costs"><span class="cost">Capital ${o.cost[0]}</span><span class="cost">Change ${o.cost[1]}</span><span class="cost">Operations ${o.cost[2]}</span></div>${available?'':`<p class="limit-note">Unavailable with this resource plan. Go back to revise an earlier decision.</p>`}<button class="${available?'primary':'secondary'}" data-action="choose" data-decision="${d.id}" data-option="${o.id}" ${available?'':'disabled'}>${available?'Choose this direction':'Budget limit'}</button></article>`;
  }).join('')}</div><div id="msg" class="error" role="status" aria-live="polite"></div><div class="actions">${previous}</div></section>`,n);
}
function choose(did,oid){
  if(!optionAvailable(did,oid)){const msg=document.getElementById('msg');if(msg)msg.textContent='This choice would prevent a complete visit within the resource budget. Revise your earlier choices.';return;}
  const n=GAME.decisions.findIndex(d=>d.id===did)+1;
  for(let i=n;i<GAME.decisions.length;i++)delete state.choices[GAME.decisions[i].id];
  state.readiness=null;state.strengthened=null;state.reserveApplied=false;
  const order=['arrival','care','leave'];for(let i=order.indexOf(did);i<order.length;i++)delete state.watersheds[order[i]];
  state.choices[did]=oid;
  state.completed=false;state.commitment=null;
  state.screen=`impact${n}`;
  event('decision_selected',{decision:did,option:oid});render();
}
// V0.8: A decision always invests in something valuable. Opening-day readiness determines when
// the value is realized; remaining resources determine which other directions are affordable.
const INVESTMENT_STORIES = {
 digital:{moment:'access',image:2,need:'Arthur values knowing what to expect before he arrives.',gain:'An itinerary and clear arrival instructions reduce uncertainty before Arthur reaches the door.',cost:'Live information, accessible alternatives and exception handling need ongoing support.',opening:'A digital welcome can start with directions and preparation, even before cross-provider integration is complete.',future:'The same investment can later support live changes across more services and partners.',design:'Protect intuitive digital touchpoints, reliable wireless coverage and a visible assisted-arrival alternative.'},
 legible:{moment:'access',image:1,need:'Arthur wants to find his way without being dependent on a device.',gain:'A readable campus makes destinations easier to recognize and reach.',cost:'Physical circulation and wayfinding decisions are difficult to fix after construction.',opening:'Arthur benefits from clear routes as soon as the facility opens.',future:'The legible framework can accommodate new services without completely relearning the campus.',design:'Protect sightlines, landmarks, accessible circulation, and consistent physical/digital place names.'},
 human:{moment:'access',image:0,need:'Arthur wants a person to help when his plan is unfamiliar or changes.',gain:'A welcoming navigator can recognize personal needs and help him through an uncertain arrival.',cost:'Coverage, training and authority require recurring operating resources.',opening:'A staffed welcome supports Arthur even when digital services are phased.',future:'Navigators can eventually coordinate increasingly complex multi-service journeys.',design:'Protect approachable welcome locations, privacy, staff visibility and access to live status.'},
 network:{moment:'connected',image:0,need:'Arthur needs his information and next appointment to move between services.',gain:'Distinct departments remain specialized, with a shared itinerary linking the journey.',cost:'Every departmental boundary still needs a reliable handoff and linked scheduling.',opening:'Common directions and handoff protocols can improve the journey before major renovations.',future:'Shared status and protected slots can grow into closer coordination over time.',design:'Protect clear transfer routes, handoff areas, connectivity and service interfaces.'},
 core:{moment:'connected',image:1,need:'Arthur wants tests and consultations to feel like one episode, not separate visits.',gain:'Shared diagnostic adjacency shortens transfer routes and supports coordinated preparation.',cost:'Shared rooms do not share scheduling authority by themselves; change effort is substantial.',opening:'The core creates enduring physical benefit even if joint booking is phased.',future:'Integrated scheduling and coordinated capacity can unlock more value from the same spaces.',design:'Protect diagnostic adjacencies, preparation capacity, specialized systems and shared operational touchpoints.'},
 comes:{moment:'connected',image:2,need:'Arthur values fewer moves and less disruption between services.',gain:'Selected services can meet Arthur in adaptable care settings.',cost:'Staff, equipment, storage, cleaning and room readiness must move instead.',opening:'A limited group of compatible activities can be mobile before the full model is ready.',future:'Adaptable spaces and support infrastructure preserve a path to broader mobile clinical services.',design:'Protect selected flexible rooms, clean/dirty logistics, charging, clearances and dependable connectivity.'},
 fast:{moment:'adapt',image:0,need:'Arthur wants to leave promptly with a clear plan.',gain:'Early pharmacy, pickup and discharge preparation reduce avoidable departure delays.',cost:'Unexpected changes demand active reassessment and revised instructions.',opening:'Simple preparation checklists and early coordination can help immediately.',future:'Automated readiness and partner communication can grow around a dependable workflow.',design:'Protect pharmacy access, transition spaces, accessible pickup and order/status connectivity.'},
 adaptive:{moment:'adapt',image:1,need:'Arthur needs recovery that can adjust when his condition or timing changes.',gain:'Flexible recovery capacity offers time and appropriate monitoring when the plan shifts.',cost:'Staffing and clinical monitoring cannot automatically stretch with the room.',opening:'Selected recovery environments can support different compatible levels of observation.',future:'Infrastructure can accommodate more variable recovery pathways as staffing models mature.',design:'Protect suitable monitoring, utilities, visibility, staff support and safe recovery adjacencies.'},
 wellness:{moment:'adapt',image:2,need:'Arthur wants someone to own the next step after he leaves.',gain:'Medication, follow-up and ongoing care are treated as part of the same journey.',cost:'Partner referral acceptance, clinical accountability and information-sharing agreements take effort.',opening:'A named follow-up owner can improve continuity even with manual partner workflows.',future:'Virtual follow-up and richer closed-loop partner integration can mature later.',design:'Protect private education space, connected consult capacity and resilient partner interfaces.'}
};

const INVESTMENT_VISUALS={digital:'digital-story.webp',legible:'legible-wayfinding.webp',human:'human-guide.webp',network:'department-network.webp',core:'core-story.webp',fast:'work-2.webp',adaptive:'adapt-2.webp',wellness:'wellness-story.webp'};
function investmentScene(oid,variant='card'){
  const photo=INVESTMENT_VISUALS[oid];
  if(photo)return `<span class="design-scene ${variant} investment-art ${oid}-art"><img src="assets/${photo}" alt="Visual concept for ${escapeHTML(option(oid).name)}" loading="lazy"></span>`;
  const found=GAME.decisions.find(d=>d.options.some(o=>o.id===oid));
  const mid=found?.id==='arrival'?'access':found?.id==='care'?'connected':'adapt';
  const idx=found?.options.findIndex(o=>o.id===oid)||0;
  return designScene(mid,idx,variant);
}
function foregoneFutures(){
 const current=totals(),b=GAME.budgets;
 return GAME.decisions.flatMap(d=>d.options.filter(o=>o.id!==state.choices[d.id]).map(o=>{
   const proposed={...state.choices,[d.id]:o.id};const nt=totals(proposed);
   const deficit=Object.keys(b).map(k=>({k,over:nt[k]-b[k]})).filter(x=>x.over>0);
   return deficit.length?{option:o,deficit,from:option(state.choices[d.id])}:null;
 }).filter(Boolean));
}
function strategicAha(){
 const prime=option(state.choices[state.readiness.priority]);
 const deferred=GAME.decisions.filter(d=>d.id!==state.readiness.priority).map(d=>option(state.choices[d.id]));
 const insight={digital:'Arthur can arrive informed, but live diagnostic coordination still takes separate agreements.',legible:'Arthur can navigate the campus, but clear routes do not automatically connect schedules.',human:'Arthur can find personal help, but staff still need authority to fix handoffs.',network:'Departments can share an itinerary, but each service retains its own capacity constraints.',core:'Arthur’s labs and imaging can become one episode, but shared space alone cannot grant shared authority.',comes:'Arthur can move less, but staff, equipment and supplies must move more.',fast:'Arthur’s departure can be prepared early, but a changed clinical plan still needs flexible response.',adaptive:'Recovery can adapt, but flexible rooms need matching staffing and monitoring.',wellness:'Arthur can have follow-up ownership, but independent providers still have to accept the handoff.'};
 return {headline:insight[prime.id],deferred};
}

// These are essential operating/design consequences, not optional Learn More content.
// Registration authority is intentionally a later player decision, not silently decided here.
const ESSENTIAL_IMPLICATIONS={
 digital:'A digital itinerary must reflect live registration, lab and imaging status. Decide who owns registration and exceptions at opening.',
 legible:'Entries, sightlines and accessible routes must remain clear even when a service or appointment changes.',
 human:'Welcome staff need live appointment visibility and permission to resolve cross-service exceptions—not just directions.',
 network:'Separate departments need named handoff owners, shared visit status and reliable links between appointments.',
 core:'The diagnostic layout can be shared, but scheduling authority and responsibility for reassessment must be agreed.',
 comes:'Flexible rooms need mobile staff, equipment storage, charging, transport and turnover coordination.',
 fast:'Pharmacy readiness, pickup, education and clinical clearance must be confirmed by an accountable team.',
 adaptive:'Flexible recovery rooms require matching staffing, observation capability and access to clinical escalation.',
 wellness:'A named follow-up owner must confirm referral acceptance and information sharing with independent partners.'
};
function remainingText(){const t=totals(),b=GAME.budgets;return ['capital','change','operations'].map(k=>`${k[0].toUpperCase()+k.slice(1)} ${b[k]-t[k]} left`).join(' · ');}
function investmentImpact(n){
 const d=GAME.decisions[n-1],id=state.choices[d.id],o=option(id);
 if(!o){state.screen=`d${n}`;save();return render();}
 const st=INVESTMENT_STORIES[id];
 const nextD=GAME.decisions[n];
 const blocked=nextD?nextD.options.filter(x=>!completionExists({...state.choices,[nextD.id]:x.id})):[];
 const possible=nextD?nextD.options.filter(x=>completionExists({...state.choices,[nextD.id]:x.id})):[];
 const future = n===3?'You now choose which of your three investments becomes fully operational at opening. The others still create future value.':blocked.length?`${blocked.map(x=>x.name).join(' and ')} ${blocked.length===1?'is':'are'} out of reach within this opening-day resource envelope. Those futures can still be planned for later.`:'All next-stage choices remain possible, but every commitment uses finite resources.';
 const tradeoff = blocked.length
   ? `Because you selected ${o.name}, ${blocked[0].name} cannot also fit the current opening-day resource plan. It can remain a future-phase option.`
   : 'Your investment creates value. The resources left will limit what else can be fully operational at opening.';
 app.innerHTML=shell(`<section class="panel investment-reveal impact-v14">
   <div class="stage">Decision ${n} · Impact · 1 of 2</div>
   <h2>You invested in ${escapeHTML(o.name)}.</h2>
   <p class="lede compact-lede">One benefit for Arthur. One obligation for the campus.</p>
   <div class="impact-v14-main">
      ${investmentScene(id,'hero')}
      <div class="impact-v14-summary">
        <div><span class="impact-kicker">✓ Arthur gains</span><p>${escapeHTML(st.gain)}</p></div>
        <div><span class="impact-kicker">↔ ACHC takes on</span><p>${escapeHTML(st.cost)}</p></div>
      </div>
   </div>
   <div class="impact-v14-insight"><span class="impact-kicker">KEY DESIGN + OPERATIONS DECISION</span><strong>${escapeHTML(ESSENTIAL_IMPLICATIONS[id])}</strong></div>
   <div class="impact-v14-trade"><span class="impact-kicker">YOUR TRADE-OFF</span><p>${escapeHTML(tradeoff)}</p></div>
   <details class="impact-v14-more"><summary>Resources, phasing and deeper design impacts</summary>
     <div class="impact-v14-extra"><p><b>Invested:</b> Capital ${o.cost[0]} · Change ${o.cost[1]} · Operations ${o.cost[2]}</p>
     <p><b>Remaining:</b> ${escapeHTML(remainingText())}</p>
     <p><b>Opening possibility:</b> ${escapeHTML(st.opening)}</p>
     <p><b>Future value:</b> ${escapeHTML(st.future)}</p>
     <p><b>Design guardrail:</b> ${escapeHTML(st.design)}</p>
     ${momentLinkForChoice(d.id,id)}</div>
   </details>
   <div class="actions"><button class="primary" data-action="continue-impact" data-step="${n}">See what Arthur experiences →</button><button class="secondary" data-action="back" data-step="${n}">Reconsider investment</button></div>
 </section>`,n);
}

// One immediate, human-scale reveal for each investment. These scenes show
// value made possible by the investment, not guarantees that all systems are
// operating on day one (the readiness decision still comes later).
const ARTHUR_REVEALS = {
 digital:{step:'Arrival',title:'Arthur knows where to begin.',voice:'“I can see where I need to go first.”',moment:'Before leaving home, Arthur sees a clear itinerary for his lab, imaging and pre-check visits.',gain:'The digital investment helps him prepare and reduces the uncertainty of the first arrival.',limit:'If an appointment changes, live updates and an assisted fallback still depend on connected operations.',insight:'Digital arrival needs reliable information, wayfinding and human support.'},
 legible:{step:'Arrival',title:'The campus makes sense to Arthur.',voice:'“I can find the lab without guessing.”',moment:'Arthur follows recognizable landmarks and accessible routes from the front door to his first appointment.',gain:'The building itself helps him navigate, whether or not he uses a phone.',limit:'The physical route cannot tell him when the diagnostic schedule changes.',insight:'Clear circulation helps on day one; coordinated status is a separate investment.'},
 human:{step:'Arrival',title:'Someone knows Arthur is here.',voice:'“It helps to have someone I can ask.”',moment:'A welcome guide checks Arthur’s itinerary, asks what he needs and directs him toward the laboratory.',gain:'Human attention helps him feel understood instead of being passed from desk to desk.',limit:'The guide still needs current schedules and authority to solve a real exception.',insight:'A welcoming desk is useful; empowering the people there makes it effective.'},
 network:{step:'Labs → Imaging',title:'The departments can follow Arthur’s progress.',voice:'“At least the next team knows I’m coming.”',moment:'Arthur finishes his lab work, then travels to the imaging department with a shared itinerary.',gain:'The linked journey helps the next service anticipate him while departments retain specialized workflows.',limit:'Every service boundary still requires a dependable handoff and protected appointment capacity.',insight:'A common itinerary helps, but it does not eliminate departmental interfaces.'},
 core:{step:'Labs → Imaging',title:'Arthur’s tests feel closer together.',voice:'“This is starting to feel like one visit.”',moment:'Arthur moves between coordinated diagnostic spaces, with shared preparation and a more legible clinical route.',gain:'The physical investment can shorten transfers and create a platform for coordinated diagnostics.',limit:'Shared rooms do not automatically give teams shared scheduling authority.',insight:'Adjacency creates opportunity; governance converts it into integrated service.'},
 comes:{step:'Labs → Imaging',title:'More of the care comes to Arthur.',voice:'“I’m not walking the whole campus for every step.”',moment:'For compatible activities, Arthur stays in an adaptable setting as clinicians and equipment come to him.',gain:'Reducing unnecessary patient movement can make the pre-procedure visit less tiring.',limit:'The campus must now coordinate mobile equipment, staff time, cleaning and room readiness.',insight:'Less movement for Arthur means more deliberate movement for teams and resources.'},
 fast:{step:'Pre-check → Home',title:'Arthur leaves with fewer loose ends.',voice:'“We know what to do when procedure day arrives.”',moment:'Arthur and his wife receive an organized checklist for medications, pickup and the procedure-day plan.',gain:'Starting transition planning early reduces preventable delays and last-minute uncertainty.',limit:'An unexpected diagnostic finding could require the team to revise the plan.',insight:'Early preparation is valuable, provided the plan can also change.'},
 adaptive:{step:'Pre-check → Recovery',title:'Arthur has a plan that can adapt.',voice:'“If things take longer, there’s a plan for that too.”',moment:'The pre-check team explains how recovery space and observation could adapt to his needs.',gain:'A flexible recovery model preserves options when timing or observation requirements change.',limit:'Flexible space only works when staffing and clinical monitoring can adjust too.',insight:'Adaptable rooms require an equally adaptable operating model.'},
 wellness:{step:'Pre-check → Beyond campus',title:'Arthur knows who follows through.',voice:'“I know who to call, even after I go home.”',moment:'Arthur and his wife leave the consultation with a named follow-up contact and a clearer medication and recovery pathway.',gain:'Connecting future services and follow-up helps Arthur feel supported beyond the procedure.',limit:'Partner capacity, referral acceptance and information-sharing agreements are not automatic.',insight:'A referral becomes continuity only when someone owns the next step.'}
};
function investmentReveal(n){
 const d=GAME.decisions[n-1],id=state.choices[d.id],o=option(id);
 if(!o){state.screen=`d${n}`;save();return render();}
 const st=INVESTMENT_STORIES[id],r=ARTHUR_REVEALS[id];
 app.innerHTML=shell(`<section class="panel arthur-reveal"><div class="stage">Decision ${n} · Arthur’s reveal · 2 of 2</div><h2>${escapeHTML(r.title)}</h2><p class="lede">${escapeHTML(r.step)} · A glimpse of what your investment makes possible</p><div class="reveal-layout"><div class="reveal-scene">${investmentScene(id,'hero')}<div class="reveal-speech">${escapeHTML(r.voice)}</div></div><div class="reveal-content"><div class="reveal-story">${escapeHTML(r.moment)}</div><div class="reveal-gain"><strong>✓ Your investment helps</strong><p>${escapeHTML(r.gain)}</p></div><div class="reveal-limit"><strong>↔ What it still needs</strong><p>${escapeHTML(r.limit)}</p></div></div></div><div class="reveal-insight"><strong>Design insight</strong><span>${escapeHTML(r.insight)}</span>${momentLinkForChoice(d.id,id)}</div><p class="reveal-footnote">This is the value of the chosen future. You will decide what can be fully operational at opening after all three investments.</p><div class="actions"><button class="primary" data-action="continue-reveal" data-step="${n}">${n===3?'Choose what goes live at opening →':'Continue to decision '+(n+1)+' →'}</button><button class="secondary" data-action="return-impact" data-step="${n}">Back to investment impact</button></div></section>`,n);
}

function continueImpact(n){if(n<1||n>3||!state.choices[GAME.decisions[n-1].id])return;state.screen=`reveal${n}`;save();render();}
function continueReveal(n){if(n<1||n>3||!state.choices[GAME.decisions[n-1].id])return;state.screen=`watershed${n}`;save();render();}
function back(n){
 if(n<1||n>3)return;
 for(let i=n-1;i<GAME.decisions.length;i++)delete state.choices[GAME.decisions[i].id];
 state.readiness=null;state.strengthened=null;state.completed=false;state.commitment=null;state.reserveApplied=false;for(let i=n-1;i<3;i++)delete state.watersheds[GAME.decisions[i].id];
 state.screen=`d${n}`;save();render();
}
const REGISTRATION={
 central:{name:'Centralized registration',gain:'One common Covenant-operated intake and welcome process.',cost:'Independent providers may still require their own registration, consent and billing steps.',ops:'Define registration boundaries, identity exceptions and which partner processes cannot be completed centrally.',place:'Provide one prominent welcome with private exceptions and clear partner-service routing.'},
 department:{name:'Department / setting registration',gain:'Each service retains control of its own eligibility, privacy and intake workflow.',cost:'Arthur can be asked to repeat details and navigate several desks.',ops:'Create consistent referral instructions and named handoff owners across organizations.',place:'Allow local registration points, visible service entries and accessible circulation between them.'},
 federated:{name:'Federated welcome',gain:'One campus welcome and identity guidance with service-specific registration where required.',cost:'Shared status, consent and partner agreements must be negotiated and maintained.',ops:'Agree who shares what information, reconciles identity, manages exceptions and accepts referrals.',place:'Combine common welcome infrastructure with flexible private intake capacity for providers.'}
};
// One watershed moment after each investment, not another investment round.
// These operating-model choices have real consequences in playState() and design outputs.
const WATERSHEDS={
 arrival:{label:'ARRIVAL · THREE BUILDINGS',question:'Who owns Arthur’s welcome across the campus?',intro:'Arthur moves among three buildings and may visit independent providers. Decide how the front door works.',why:'One campus experience does not require one organization—but it does require ownership.',options:[
  {id:'central',title:'One central welcome',image:'assets/shift-arrival-central.webp',icon:'⌂',layout:'hub',gain:'One recognizable first stop',cost:'Partner intake may still be separate',design:'Main welcome, private exception space, clear connections to all buildings'},
  {id:'department',title:'Register at each service',image:'assets/shift-arrival-department.webp',icon:'▦',layout:'nodes',gain:'Local provider control',cost:'More check-ins and service-level queues',design:'Distributed intake points, consistent signs, accessible paths'},
  {id:'federated',title:'Shared welcome + local intake',image:'assets/shift-arrival-federated.webp',icon:'↔',layout:'bridge',gain:'One guided journey across providers',cost:'Agreements, status sharing and exception owners',design:'Common welcome plus partner-specific private intake capability'}]},
 care:{label:'CARE · CAPACITY',question:'Who can change Arthur’s diagnostic sequence?',intro:'Labs, imaging and pre-check may sit in different buildings. When timing shifts, who can reassign appointments?',why:'Shared space is helpful. Shared authority is what changes the schedule.',options:[
  {id:'local',title:'Each department decides',image:'assets/shift-care-local.webp',icon:'▦',layout:'nodes',gain:'Teams protect specialized capacity',cost:'Arthur can wait across disconnected queues',design:'Clear handoff stations and decentralized support areas'},
  {id:'coordinator',title:'Campus flow coordinator',image:'assets/shift-care-coordinator.webp',icon:'◉',layout:'hub',gain:'One owner can negotiate the next slot',cost:'Needs staffing, real-time visibility and escalation rules',design:'Distributed status displays and a coordination touchdown space'},
  {id:'shared',title:'Shared clinical + ops authority',image:'assets/shift-care-shared.webp',icon:'↔',layout:'bridge',gain:'Clinical and operations leaders can resequence care',cost:'Requires formal decision rights and partner agreements',design:'Common capacity data, resilient communications and team workpoints'}]},
 leave:{label:'RESPONSE · ADAPTABLE CAMPUS',question:'What happens when the expected pathway changes?',intro:'Urgent care demand rises and Arthur’s procedure plan changes. What must the campus be ready to reorganize?',why:'Flexibility is not a room type. It is space, staffing and an agreed response.',options:[
  {id:'fixed',title:'Protect specialized settings',image:'assets/shift-leave-fixed.webp',icon:'▦',layout:'nodes',gain:'Predictable workflows and dedicated resources',cost:'Surges require escalation and external transfer capacity',design:'Defined triage, separation, recovery and transfer routes'},
  {id:'flex',title:'Flexible care + recovery zones',image:'assets/shift-leave-flex.webp',icon:'⇄',layout:'bridge',gain:'Adapt select compatible spaces to changing demand',cost:'Cross-trained staffing, monitoring and cleaning must keep up',design:'Universal room provisions, equipment storage and infection-prevention zoning'},
  {id:'response',title:'Coordinated campus response',image:'assets/shift-leave-response.webp',icon:'◉',layout:'hub',gain:'See pressure and assign an accountable response',cost:'Decision authority and communications require sustained staffing',design:'Clinical/ops coordination touchpoints, acuity escalation and transfer pathways'}]}
};
function watershedScreen(n){
 const key=GAME.decisions[n-1].id,w=WATERSHEDS[key];const selected=state.watersheds[key]||null;
 const chosen=w.options.find(o=>o.id===selected);
 app.innerHTML=shell(`<section class="panel watershed-screen"><div class="stage">WATERSHED ${n} OF 3 · ${w.label}</div><h2>${w.question}</h2><p class="watershed-deck">${w.intro}</p><div class="watershed-grid">${w.options.map(o=>`<button class="watershed-choice ${selected===o.id?'is-selected':''}" data-action="watershed-select" data-stage="${key}" data-value="${o.id}" aria-pressed="${selected===o.id}"><span class="watershed-visual"><img src="${assetURL(o.image)}" alt="${escapeHTML(o.title)} — illustrative design approach" loading="eager"></span><strong>${o.title}</strong><span class="gain">✓ ${o.gain}</span><span class="burden">↔ ${o.cost}</span><span class="operating-commitment">${(MODEL_REQUIREMENTS[key][o.id][0]+MODEL_REQUIREMENTS[key][o.id][1]+MODEL_REQUIREMENTS[key][o.id][2])?'Opening activation needs additional capacity':'Can use existing operating model'}</span></button>`).join('')}</div><div class="watershed-bottom"><div><span class="watershed-caption">THE DESIGN AHA</span><strong>${chosen?escapeHTML(chosen.design):escapeHTML(w.why)}</strong></div><div class="actions"><button class="primary" data-action="watershed-confirm" data-step="${n}" ${chosen?'':'disabled'}>See what your design changes →</button><button class="secondary" data-action="watershed-back" data-step="${n}">Back to Arthur’s reveal</button></div></div></section>`,n);
}
function watershedSelect(stage,value){
 if(!WATERSHEDS[stage]?.options.some(o=>o.id===value))return;
 state.watersheds[stage]=value;state.readiness=null;state.reserveApplied=false;state.commitment=null;save();render();
}
function watershedConfirm(n){
 const d=GAME.decisions[n-1];if(!WATERSHEDS[d.id].options.some(o=>o.id===state.watersheds[d.id]))return;
 state.screen=`shift${n}`;event('watershed_selected',{stage:d.id,choice:state.watersheds[d.id]});render();
}
// One short environmental pause, following each watershed decision.
// This stage has no new spend or score. It translates the chosen operating model
// into a tangible physical, workforce and digital implication.
const SHIFT_IMPACTS={
 arrival:{
  central:{head:'One recognizable front door.',arch:'A prominent welcome, private exception support and clear routes between all three buildings.',ops:'A central arrival team guides Arthur; independent providers still own their specialized intake.',eng:'Common arrival status, accessible check-in and reliable links to separate provider services.',arthur:'Arthur knows where to begin, but may still check in again with a partner.',insight:'One first stop does not eliminate every provider boundary.'},
  department:{head:'Each service keeps its own front door.',arch:'Clear department entries, appropriately sized local check-in and easy-to-follow accessible routes.',ops:'Each service owns intake; a handoff process must keep Arthur from getting lost between desks.',eng:'Consistent signage and digital route instructions even when registration systems differ.',arthur:'Arthur sees familiar local teams, but must follow several check-in steps.',insight:'Local independence shifts more wayfinding work onto Arthur.'},
  federated:{head:'A shared welcome bridges different organizations.',arch:'A common welcome with concierge touchpoints and private partner-specific intake space.',ops:'Navigation staff need visibility of arrivals and named owners for exceptions between services.',eng:'Role-based status exchange, patient navigation and secure partner connection points.',arthur:'Arthur experiences one guided route even when providers register him separately.',insight:'One journey needs shared ownership—not necessarily one system.'}},
 care:{
  local:{head:'Specialized departments retain their own capacity.',arch:'Distinct diagnostics, preparation and consultation destinations connected by accessible routes.',ops:'Service teams protect their own slots; escalation and agreed handoffs remain critical.',eng:'Reliable appointment status exchange and clear service-by-service communications.',arthur:'Arthur can complete each test, but delays may still ripple across separate queues.',insight:'Protected specialty capacity does not automatically connect the schedule.'},
  coordinator:{head:'A coordinator can negotiate Arthur’s next step.',arch:'Small flow-coordination workpoints and status visibility near service interfaces.',ops:'A named coordinator needs scheduling access, escalation protocols and service contacts.',eng:'A shared operational picture, timely status updates and reliable team communications.',arthur:'When imaging falls behind, someone can try to protect his next appointment.',insight:'Visibility is valuable when a person can act on it.'},
  shared:{head:'Clinical and operations teams can resequence care.',arch:'Coordinated diagnostic access, flexible team touchdown areas and clear travel routes.',ops:'Clinical authority and scheduling authority agree who can reprioritize competing needs.',eng:'Common readiness and capacity information, secure communications and resilient integration.',arthur:'The team can reconsider his sequence when the plan changes, not just report the delay.',insight:'Shared authority—not shared walls—is what can change the schedule.'}},
 leave:{
  fixed:{head:'Specialized settings remain protected.',arch:'Purpose-designed treatment, recovery and triage areas with safe separation and transfer paths.',ops:'Dedicated teams keep predictable workflows while higher acuity follows explicit escalation routes.',eng:'Specialty clinical services, appropriate monitoring and dependable transfer communication.',arthur:'His planned pathway remains clear, but changes may require a different setting or transfer.',insight:'Specialization improves reliability while limiting how far capacity can flex.'},
  flex:{head:'Selected spaces can adapt to changing needs.',arch:'Compatible recovery/observation rooms, storage, support space and infection-prevention zoning.',ops:'Qualified staff, turnover, cleaning and equipment availability must change with the room use.',eng:'Adaptable power, communications, monitoring and appropriate room-specific services.',arthur:'Arthur can remain in a suitable setting longer if the team and equipment are available.',insight:'Flexible rooms work only when staffing and support flex with them.'},
  response:{head:'One campus response coordinates competing demand.',arch:'Distributed response touchpoints and clear clinical escalation and transport paths.',ops:'Clinical and operational leaders need shared visibility, staffing and decision rights.',eng:'Live capacity signals, dependable communications and escalation/transfer coordination tools.',arthur:'His change in plan is visible to the people who can coordinate the next safe step.',insight:'A command function is accountable action, not just a dashboard.'}}
};
function designShiftScreen(n){
 const stage=GAME.decisions[n-1].id,w=WATERSHEDS[stage],key=state.watersheds[stage];
 const chosen=w.options.find(x=>x.id===key),s=SHIFT_IMPACTS[stage]?.[key];
 if(!chosen||!s){state.screen=`watershed${n}`;save();return render();}
 const photo=`assets/shift-${stage}-${key}.webp`;
 app.innerHTML=shell(`<section class="panel design-shift-screen">
 <div class="stage">DESIGN SHIFT ${n} OF 3 · THE ENVIRONMENT CHANGES</div>
 <h2>${escapeHTML(s.head)}</h2><p class="shift-intro">You chose <b>${escapeHTML(chosen.title)}</b>. Here is what ACHC must make possible.</p>
 <div class="shift-layout"><div class="shift-image"><img src="${assetURL(photo)}" alt="Illustrative environment for ${escapeHTML(chosen.title)}" loading="eager"><span class="shift-photo-note">Illustrative design direction, not an approved ACHC layout</span></div>
 <div class="shift-implications">
 <div class="shift-impact"><span class="shift-icon">⌂</span><div><strong>Architecture</strong><p>${escapeHTML(s.arch)}</p></div></div>
 <div class="shift-impact"><span class="shift-icon">♧</span><div><strong>Operations & staffing</strong><p>${escapeHTML(s.ops)}</p></div></div>
 <div class="shift-impact"><span class="shift-icon">▣</span><div><strong>Engineering & digital</strong><p>${escapeHTML(s.eng)}</p></div></div>
 </div></div>
 ${(()=>{const m=modelReadinessNote(stage);const committed=totals(),b=GAME.budgets;const insufficient=RESOURCE_NAMES.filter((k,i)=>committed[k]+m.req[i]>b[k]);return `<div class="shift-readiness ${m.can?'ready':'phased'}"><span class="shift-readiness-title">${m.can?'✓ Can be activated at opening—if prioritized':'↗ Future design enabled; full operation must be phased'}</span><span>${m.can?`Operating commitment: ${m.label}. This would use some of your remaining capacity.`:`Not enough ${insufficient.join(' and ')} capacity to activate this full model now. The spatial and technology design can still be protected.`}</span><small>${m.can?'Opening-day selection is made after your three investments.':'Your investment still creates value; this operating model needs later organizational readiness.'}</small></div>`;})()}
 <div class="shift-arthur"><span class="shift-label">WHAT ARTHUR EXPERIENCES</span><strong>${escapeHTML(s.arthur)}</strong></div>
 <div class="shift-footer"><div class="shift-insight"><span>THE DESIGN AHA</span><b>${escapeHTML(s.insight)}</b></div><div class="actions"><button class="secondary" data-action="shift-back" data-step="${n}">← Reconsider this model</button><button class="primary" data-action="shift-next" data-step="${n}">${n===3?'Set opening-day priority →':`Continue to investment ${n+1} →`}</button></div></div>
 </section>`,n);
}
function shiftNext(n){
 const stage=GAME.decisions[n-1]?.id;
 if(!stage||!state.watersheds[stage]){state.screen=`watershed${n}`;save();return render();}
 state.screen=n<3?`d${n+1}`:'readiness';event('design_shift_seen',{stage,option:state.watersheds[stage]});render();
}
function shiftBack(n){state.screen=`watershed${n}`;save();render();}
function watershedBack(n){state.screen=`reveal${n}`;save();render();}
function reserveAvailable(){const t=resourceTotals(),b=GAME.budgets;return !state.reserveApplied && b.change-t.change>=1 && b.operations-t.operations>=1 || state.reserveApplied;}
function readinessScreen(){
 if(ids().length!==3 || !state.watersheds.arrival || !state.watersheds.care || !state.watersheds.leave){state.screen='watershed3';save();return render();}
 const ready=state.readiness||{};
 app.innerHTML=shell(`<section class="panel compact-readiness"><div class="stage">OPENING DAY · WHAT WILL BE READY?</div><h2>You cannot activate everything at opening.</h2><p class="lede">Each investment has value. Choose one to operate fully first; the others remain enabled for later.</p><div class="readiness-mini">${GAME.decisions.map(d=>{const o=option(state.choices[d.id]);return `<label class="priority-tile ${ready.priority===d.id?'selected':''}"><input type="radio" name="priority" value="${d.id}" ${ready.priority===d.id?'checked':''}><span class="priority-title">${o.name}</span><small>${modelCanActivate(d.id)?`Can activate operating model · ${modelRequirements(d.id).map((v,i)=>v?`${v} ${RESOURCE_NAMES[i]}`:'').filter(Boolean).join(' + ')||'No extra cost'}`:'Investment ready; operating model phased'}</small></label>`}).join('')}</div><div class="readiness-recap"><strong>Your operating-model choices</strong><span>Welcome: ${escapeHTML(WATERSHEDS.arrival.options.find(o=>o.id===state.watersheds.arrival).title)}</span><span>Care: ${escapeHTML(WATERSHEDS.care.options.find(o=>o.id===state.watersheds.care).title)}</span><span>Response: ${escapeHTML(WATERSHEDS.leave.options.find(o=>o.id===state.watersheds.leave).title)}</span></div><p class="readiness-note">Choose which investment to prioritize. The selected operating model activates only if your remaining resources cover its additional Change, Operations and infrastructure burden; otherwise the investment contributes its baseline value while the fuller model remains a future commitment.</p><div id="msg" class="error" role="status" aria-live="polite"></div><div class="actions"><button class="primary" data-action="set-readiness">Test the campus under pressure →</button><button class="secondary" data-action="watershed-back" data-step="3">Reconsider response model</button></div></section>`,4);
}
function setReadiness(){
 const p=document.querySelector('input[name="priority"]:checked')?.value;
 const r=state.watersheds.arrival;
 if(!['arrival','care','leave'].includes(p)||!REGISTRATION[r]){document.getElementById('msg').textContent='Choose one opening-day priority to continue.';return;}
 state.readiness={priority:p,registration:r};state.strengthened=state.choices[p];state.reserveApplied=false;
 state.completed=false;state.commitment=null;state.screen='disruption';event('opening_day_decided',{priority:p,registration:r,watersheds:state.watersheds,operatingModelReady:modelActive(p)});render();
}
function summary(){return GAME.decisions.map(d=>{const o=option(state.choices[d.id]);return `<div><small>${escapeHTML(d.title)}</small><strong>${o?escapeHTML(o.name):'—'}</strong></div>`;}).join('');}
// v0.3 story engine: discrete moments, never a single threshold hiding other effects.
const SEVERITY={helped:2,fragile:1,hurt:0};
function verdict(status,title,detail,why){return {status,title,detail,why};}
function playState(){
  const a=state.choices.arrival,c=state.choices.care,l=state.choices.leave;
  const strong=state.strengthened;
  const sc=scores();
  // Diagnostic re-plan depends on shared clinical context AND ability to move the plan.
  let clinical;
  if(c==='core') clinical=verdict('helped','One diagnostic episode','Shared preparation and diagnostic access let Arthur’s plan be resequenced.','This works only when booking rules and clinical responsibility are genuinely shared.');
  else if(c==='comes') clinical=verdict('fragile','The team must come to Arthur','Arthur stays in place, but specialist review and the additional diagnostic require coordinated staff and mobile equipment.','Patient movement is reduced; operational movement is increased.');
  else clinical=verdict('fragile','Connected departments, separate queues','The result can travel between departments, but Arthur’s next step competes with independently managed appointments.','A shared itinerary does not guarantee control of linked capacity.');
  if(c==='network'&&strong==='network')clinical=verdict('helped','Linked slots are protected','The strengthened network supports a rebooked test and an accountable interdepartmental handoff.','Protected slots and service ownership make a distributed model work.');
  if(c==='comes'&&strong==='comes')clinical=verdict('helped','Mobile resources respond','The distributed-care platform locates equipment and brings the next clinical step to Arthur.','This depends on mobilization protocols, tracking and room readiness.');
  // An unmanaged front door can undermine otherwise well-linked care.
  if(a==='digital'&&c==='network'&&strong!=='network')clinical=verdict('hurt','The itinerary changes faster than the handoff','Arthur receives an updated itinerary, but no single team has committed to the new diagnostic slot.','Digital directions cannot substitute for clinical acceptance of the next step.');
  let ops;
  if(c==='core') ops=verdict('fragile','Shared space, contested capacity','The shared diagnostic core helps the team see the bottleneck, but specialties still have to release capacity.','Adjacency is not the same thing as joint scheduling authority.');
  else if(c==='comes') ops=verdict('fragile','Arthur waits; teams and equipment move','The delayed diagnostic pushes work onto mobile teams and equipment routes rather than onto Arthur’s feet.','Flexible patient space creates staff movement, storage and transport demands.');
  else ops=verdict('hurt','Separate queues absorb the delay','Each department protects its own schedule; Arthur’s procedure window becomes harder to hold.','Cross-department escalation needs a named decision maker and protected linked slots.');
  if(c==='core'&&['core','adaptive'].includes(strong))ops=verdict('helped','One team reallocates diagnostic capacity','A strengthened shared core supports an authorized adjustment to room, staff and diagnostic availability.','Joint resource oversight needs a real operational owner.');
  if(c==='comes'&&strong==='comes')ops=verdict('helped','Mobile teams absorb the change','The strengthened distributed-care platform helps move equipment and staff into the right setting.','This requires reliable staffing coverage and equipment availability.');
  if(c==='network'&&strong==='network')ops=verdict('fragile','Linked slots protect some capacity','Protected cross-service slots reduce the impact, but the procedure window remains exposed to competing demand.','A connected schedule helps without creating extra diagnostic capacity.');
  if(l==='adaptive'&&ops.status==='hurt')ops=verdict('fragile','Recovery can absorb the delay','Different recovery settings protect some procedural capacity, although diagnostic coordination is still weak.','Flexible recovery needs staffing and monitoring that can move with demand.');
  let home;
  if(l==='fast')home=verdict('fragile','Departure was planned for yesterday’s pathway','Pickup and medications were prepared early, but the unexpected finding requires the plan to be checked again.','A fast exit is not a complete transition when clinical needs change.');
  if(l==='adaptive')home=verdict('fragile','Recovery adapts; follow-up is still a handoff','Arthur can be monitored for longer, but the new clinical finding still needs a named follow-up owner.','Adaptable recovery space does not automatically close the loop after discharge.');
  if(l==='wellness')home=verdict('helped','Someone owns Arthur’s next step','Medication, follow-up and partner communication remain part of one care episode.','The partner or receiving team must actually accept responsibility.');
  if(l==='fast'&&c==='network'&&strong!=='fast')home=verdict('hurt','Fast exit, unfinished transition','The disrupted visit invalidates early discharge assumptions; pickup, medication and follow-up may be out of sync.','Preparation does not replace reassessment and confirmed ownership.');
  if(l==='fast'&&strong==='fast')home=verdict('helped','Departure is rebuilt around new information','Responsive departure updates medications and pickup after the revised plan is confirmed.','The strengthened departure process closes the loop on changes.');
  if(l==='adaptive'&&strong==='adaptive')home=verdict('helped','Recovery and transition are actively reassessed','Flexible staffing and monitoring give Arthur time for clinical reassessment and an orderly transition.','An assigned clinician still needs to confirm follow-up ownership.');
  if(l==='wellness'&&c==='network'&&strong!=='wellness'&&strong!=='network')home=verdict('fragile','A referral exists; acceptance is uncertain','Connected wellness identifies next steps, but separated departments may not verify that a partner accepted the referral.','A referral is not a closed-loop handoff.');
  // Arrival is not erased by a strong care model.
  let access;
  if(a==='digital')access=verdict(strong==='digital'?'helped':'fragile','Arrival by digital itinerary',strong==='digital'?'Arthur receives accessible updated directions as the plan changes.':'Arthur receives updates, but directions may no longer reflect the changed clinic or timing.','A current source of truth and human fallback are essential.');
  else if(a==='legible')access=verdict('helped','A building Arthur can read','Visible routes and landmarks let Arthur navigate without depending on his phone.','Staff and signs must still address changed clinical destinations.');
  else access=verdict('helped','A human helps Arthur reorient','The welcome guide identifies the changed needs and helps coordinate the next destination.','The guide requires access to current status and someone empowered to act.');
  if(a==='human'&&strong==='human'&&ops.status==='hurt')ops=verdict('fragile','The navigator escalates the conflict','Arthur’s guide can identify a decision maker and help protect the next step, but the capacity constraint remains.','Human authority can resolve an escalation, not manufacture a free diagnostic room.');
  // Distinguish designed future capability from capability operational on opening day.
  const priority=state.readiness?.priority,registration=state.readiness?.registration;
  if((priority!=='arrival'||!modelActive('arrival'))&&access.status==='helped')access=verdict('fragile','Arrival design is not fully operational yet',access.detail+' Opening-day teams still bridge gaps manually.','Enabling the building does not make the arrival model operational.');
  if((priority!=='care'||!modelActive('care'))&&clinical.status==='helped')clinical=verdict('fragile','Care design awaits operational readiness',clinical.detail+' The joint service rules are not fully live yet.','Co-location or interoperability is not equivalent to operational coordination.');
  if((priority!=='care'||!modelActive('care'))&&ops.status==='helped')ops=verdict('fragile','Capacity coordination is not fully live',ops.detail+' Staff still negotiate exceptions manually.','Unfunded operational authority cannot be assumed.');
  if((priority!=='leave'||!modelActive('leave'))&&home.status==='helped')home=verdict('fragile','Departure capability remains a future commitment',home.detail+' The complete follow-through workflow is not yet operational.','A future capability does not automatically deliver day-one value.');
  // An independent specialist must accept a new referral. Sharing a campus is not shared governance.
  let partner;
  if(registration==='central')partner=verdict('fragile','One welcome, a second organization','The common desk has prepared Arthur, but the independent specialist still needs separate registration and has not accepted the urgent referral.','Central registration cannot promise an independent provider’s capacity or consent process.');
  else if(registration==='department')partner=verdict('fragile','Separate desks, separate systems','The partner can manage its own intake, but Arthur repeats details and needs a tracked cross-organization handoff.','Local autonomy preserves service control at the expense of journey continuity.');
  else partner=verdict('fragile','Shared welcome, negotiated boundaries','The federated welcome shares routing and permitted status information, but the specialist must still confirm acceptance under a partner agreement.','A federated model needs ongoing governance and clear exceptions; it is not automatically seamless.');
  if(registration==='federated'&&modelActive('care'))partner=verdict('helped','The independent partner accepts the handoff','A prepared cross-provider workflow confirms the specialist’s acceptance while the partner retains its own intake and governance.','A shared welcome succeeds only when cross-organization acceptance and escalation are operational.');
  if(registration==='department'&&modelActive('care'))partner=verdict('helped','A manual but owned partner handoff','The specialist completes local intake, while an accountable coordinator verifies acceptance and updates Arthur’s pathway.','Coordinated handoffs can work without one registration system, but require staff time.');
  if(registration==='central'&&modelActive('care'))partner=verdict('fragile','The second registration is actively managed','The independent provider retains separate requirements, but a named coordinator confirms intake and appointment acceptance.','A centralized welcome can be effective without pretending to control partner systems.');
  // The three watershed choices determine whether envisioned capabilities have the operating model to support them.
  const wc=state.watersheds.care,wr=state.watersheds.leave;
  // Envisioned authority does not create opening-day operational capacity without resources.
  if(priority==='care' && !modelActive('care') && ops.status==='helped')ops=verdict('fragile','Design-ready, operationally phased',ops.detail+' The governance, staffing and data needed for full authority are not yet funded.','Physical enablement and an operating model are separate commitments.');
  if(wc==='local' && clinical.status==='helped')clinical=verdict('fragile','Shared places, separate decision rights','Arthur benefits from the connected spaces, but each diagnostic service still controls its own capacity.','Co-location does not remove the need for an agreed scheduling owner.');
  if(wc==='local' && ops.status==='helped')ops=verdict('fragile','Capacity exists, coordination is local','Departments may negotiate changes, but no one has campus-wide reallocation authority.','Preserving local authority demands disciplined handoffs.');
  if((wc==='coordinator'||wc==='shared') && modelActive('care') && ops.status==='hurt')ops=verdict('fragile','A coordinator brokers the next step','A named coordinator negotiates a change, but capacity and clinical approvals are still limited.','Visibility plus an escalation owner can reduce delay without inventing extra slots.');
  if(wc==='shared' && modelActive('care') && ops.status==='fragile')ops=verdict('helped','A clinical and operational team acts','The team has an agreed mechanism to safely review the sequence and reassign available capacity.','Clinical judgment and operational scheduling must be jointly accountable.');
  if(wr==='fixed' && ops.status==='helped')ops=verdict('fragile','Specialized capacity needs careful transfers',ops.detail+' Dedicated settings still need explicit transfer and surge procedures.','Specialized rooms are valuable but not infinitely adaptable.');
  if(wr==='flex' && modelActive('leave') && home.status==='fragile')home=verdict('helped','Recovery adapts to his needs','Compatible observation capacity and a staffed recovery plan give Arthur more time when necessary.','Flexibility requires staffing, monitoring, cleaning and infection-prevention provisions.');
  if(wr==='response' && modelActive('leave') && ops.status==='hurt')ops=verdict('fragile','A campus response is activated','Clinical and operations leaders see the pressure and assign an owner, though no additional clinical capacity is created.','The coordination function is authority and action, not just a dashboard.');
  if(state.reserveApplied && reserveAvailable()){
    if(ops.status==='hurt')ops=verdict('fragile','Reserve supports a manual recovery','Available change and operations capacity supports a temporary coordinator and approved schedule recovery.','Uncommitted capacity can support exceptions, not substitute for clinical resources.');
    else if(partner.status==='fragile')partner=verdict('helped','Reserve supports an owned partner handoff','A temporary navigator confirms the external provider’s acceptance and communicates the new itinerary.','Use the reserve to close an accountable handoff, subject to partner acceptance.');
  }
  const moments=[{key:'arrival',...access},{key:'clinical',...clinical},{key:'ops',...ops},{key:'partner',...partner},{key:'home',...home}];
  const counts={helped:0,fragile:0,hurt:0};moments.forEach(m=>counts[m.status]++);
  const headline=counts.hurt>=2?'Several connections fail under pressure':counts.hurt===1?'One critical connection breaks':counts.fragile>=3?'The journey works, but depends on extra effort':'A connected journey with visible dependencies';
  return {moments,counts,headline,sc};
}
function stamp(m){return `<span class="status status-${m.status}">${m.status==='helped'?'Helped':m.status==='fragile'?'Helped, but fragile':'Hurt'}</span>`;}
function momentCard(m){return `<article class="moment-card"><div class="moment-top">${stamp(m)}</div><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.detail)}</p><p class="why"><strong>Design insight:</strong> ${escapeHTML(m.why)}</p></article>`;}
function disruption(){
  if(ids().length!==3||!state.readiness){state.screen=ids().length!==3?'d3':'readiness';save();return render();}
  const p=playState();
  app.innerHTML=shell(`<section class="disruption"><div class="stage">Disruption · Part 1 of 2</div><h2>Arthur’s plan changes.</h2><p>Imaging identifies an unexpected finding. Arthur needs an additional diagnostic step and review from an independent specialist working on the same campus. The specialist is not operated by Covenant Health and has separate intake and referral acceptance rules.</p><p><strong>Opening-day priority:</strong> ${escapeHTML(GAME.decisions.find(x=>x.id===state.readiness.priority).title)} · <strong>Registration:</strong> ${escapeHTML(REGISTRATION[state.readiness.registration].name)}</p><div class="choice-summary">${summary()}</div><div class="reveal-on-dark">${momentCard(p.moments[1])}${momentCard(p.moments[3])}</div><p class="subtle-on-dark">The question is not only whether the information travels—but whether someone can accept and reorganize the next step.</p><div class="actions"><button class="primary" data-action="next-beat">Continue: pressure builds</button><button class="secondary" data-action="back" data-step="3">Revisit departure decision</button></div></section>`,4);
}
function pressure(){
 if(ids().length!==3||!state.readiness){state.screen='readiness';save();return render();}
 const p=playState(),available=reserveAvailable();
 const t=resourceTotals(),b=GAME.budgets;
 app.innerHTML=shell(`<section class="disruption pressure-compact"><div class="stage">DISRUPTION · 2 OF 2</div><h2>Demand rises. Arthur’s plan changes.</h2><p class="pressure-lede">Imaging runs 45 minutes behind as urgent-care demand increases. Higher-acuity needs require assessment and possible escalation or transfer; scheduled care still needs protected routes and infection-prevention provisions.</p><div class="pressure-grid"><div class="pressure-status"><strong>What your model does</strong>${momentCard(p.moments[2])}</div><div class="reserve-panel"><span class="watershed-caption">YOUR RESOURCE TRADE-OFF</span><h3>${available?'You kept some response capacity.':'Your opening-day resources are committed.'}</h3><p>${available?'You can use remaining Change and Operations capacity for a limited, accountable response. It cannot create a diagnostic room or override clinical judgment.':'You can still escalate using existing workflows, but there is no uncommitted change-and-operations reserve to deploy.'}</p>${available?`<div class="actions"><button class="${state.reserveApplied?'secondary':'primary'}" data-action="reserve-toggle">${state.reserveApplied?'✓ Response reserve activated · Undo':'Activate limited response reserve →'}</button></div>`:''}<small>${state.reserveApplied?`Reserve deployed: 1 Change + 1 Operations unit · Remaining available: Change ${b.change-t.change}, Operations ${b.operations-t.operations}`:`Change ${b.change-t.change} left · Operations ${b.operations-t.operations} left`}</small></div></div><div class="actions"><button class="primary" data-action="resolve">See the implications for Arthur →</button><button class="secondary" data-action="back-beat">Back to Arthur’s changed plan</button></div></section>`,4);
}
function designOutput(){
 const a=state.choices.arrival,c=state.choices.care,l=state.choices.leave;
 const A={
 digital:{operations:'Own real-time itinerary updates and escalation when a schedule or destination changes.',place:'Provide digital-ready arrival points, accessible wayfinding fallback and supported check-in locations.',information:'Maintain consistent place names, accessible directions and live appointment status.'},
 legible:{operations:'Keep physical wayfinding and temporary route changes current; provide help at decision points.',place:'Protect clear sightlines, consistent landmarks, barrier-free routes and visible service entries.',information:'Maintain a single destination naming standard shared by signs, maps and appointment instructions.'},
 human:{operations:'Define navigator coverage, cross-service escalation authority and what problems the welcome team may resolve.',place:'Provide staffed welcome positions, privacy for complex discussions and convenient access to multiple routes.',information:'Give navigators role-appropriate access to schedules, destinations and live service readiness.'}}
 const C={
 network:{operations:'Establish linked slots, named sending/receiving owners and an escalation pathway across departments.',place:'Design intuitive, accessible links and handoff points among otherwise distinct service zones.',information:'Create a common itinerary, status model and closed-loop interdepartmental handoffs.'},
 core:{operations:'Establish shared diagnostic scheduling authority and agreed rules for reallocating rooms, staff and slots.',place:'Plan a shared preparation core, compatible multipurpose support spaces and short diagnostic transfer paths.',information:'Expose capacity, readiness, diagnostic status and clinical ownership across participating services.'},
 comes:{operations:'Coordinate mobile staffing, device dispatch, infection control, turnaround and equipment tracking.',place:'Provide flexible care rooms, equipment storage, charging, service routes and adequate clearances.',information:'Connect patient context, room readiness, equipment location and team assignments.'}}
 const L={
 fast:{operations:'Build a reassessment checkpoint before medications, pickup and discharge are finalized.',place:'Provide an organized discharge/pickup interface and pharmacy access that can handle late changes.',information:'Synchronize updated orders, medication readiness, support-person status and discharge instructions.'},
 adaptive:{operations:'Set criteria and ownership for moving Arthur between recovery levels and staffing models.',place:'Reserve adaptable recovery settings with suitable monitoring, utilities and team visibility.',information:'Share recovery readiness, reassessment decisions, staffing and transfer status.'},
 wellness:{operations:'Assign post-visit ownership; confirm that pharmacy and external partners accept referrals and follow-up tasks.',place:'Provide private transition/education locations and access to virtual follow-up support.',information:'Support closed-loop referrals, shared discharge plans, medication reconciliation and partner communication.'}}
 return {operations:[A[a].operations,C[c].operations,L[l].operations,REGISTRATION[state.readiness?.registration||'department'].ops],place:[A[a].place,C[c].place,L[l].place,REGISTRATION[state.readiness?.registration||'department'].place],information:[A[a].information,C[c].information,L[l].information,'Partner referral acceptance and allowed information sharing require explicit agreements.'],foundation:[
  c==='comes'?'Plan resilient wireless coverage, device charging, mobility standards and operational support.':c==='core'?'Plan resilient shared infrastructure, common room standards and diagnostic integration.':'Plan shared workflow standards and reliable connectivity across service boundaries.',
  l==='wellness'?'Agree partner integration, privacy, consent and follow-up accountability before selecting products.':'Preserve the ability to change pathways and operations without rebuilding the clinical environment.'
 ]};
}
function watershedDesignNotes(){
 const a=state.watersheds.arrival,c=state.watersheds.care,l=state.watersheds.leave;
 return [
  `THREE BUILDINGS: ${WATERSHEDS.arrival.options.find(o=>o.id===a)?.design||'Define a campus welcome.'}`,
  `STAFF / CAPACITY: ${WATERSHEDS.care.options.find(o=>o.id===c)?.design||'Define an operational owner.'}`,
  `ADAPTABILITY / INFECTION PREVENTION: ${WATERSHEDS.leave.options.find(o=>o.id===l)?.design||'Plan protected care and transfer routes.'}`
 ];
}
function implications(title,items){return `<section class="implication"><h3>${escapeHTML(title)}</h3><ul>${items.map(v=>`<li>${escapeHTML(v)}</li>`).join('')}</ul></section>`;}
// The design/operations lens sits between Arthur's disruption and the final vision.
function commitmentOptions(ch=state.choices){
 const care=ch.care,arr=ch.arrival,leave=ch.leave;
 const names={
  network:['Cross-service handoff authority','Agree who receives Arthur, owns rebooking and protects linked slots.'],
  core:['Shared diagnostic capacity','Agree joint scheduling rules, pooled readiness visibility and response authority.'],
  comes:['Mobile care readiness','Agree who dispatches mobile teams, maintains equipment and manages room turnaround.']
 };
 const arrival={
  digital:['Accessible arrival and fallback','Protect digital check-in with understandable physical and staffed alternatives.'],
  legible:['Intuitive campus navigation','Protect legible routes, landmarks and barrier-free connections.'],
  human:['Empowered welcome team','Define navigator authority, coverage and access to live journey information.']
 };
 const departure={
  fast:['Responsive departure planning','Reassess discharge, medication and pickup readiness when clinical plans change.'],
  adaptive:['Adaptable recovery settings','Protect changing recovery acuity, monitoring and staffing capacity.'],
  wellness:['Closed-loop partner follow-up','Assign follow-up ownership and confirm that partners accept handoffs.']
 };
 return [{id:'care',title:names[care][0],detail:names[care][1],source:'Care model',operations:designOutputFor(ch).operations[1],place:designOutputFor(ch).place[1]},
         {id:'arrival',title:arrival[arr][0],detail:arrival[arr][1],source:'Arrival',operations:designOutputFor(ch).operations[0],place:designOutputFor(ch).place[0]},
         {id:'leave',title:departure[leave][0],detail:departure[leave][1],source:'Departure',operations:designOutputFor(ch).operations[2],place:designOutputFor(ch).place[2]}];
}
// Temporarily use the current portfolio; this function only reads the design-output mapping.
function designOutputFor(ch){
 const before=state.choices;
 try {state.choices=ch;return designOutput();} finally {state.choices=before;}
}
function lensScreen(){
 if(ids().length!==3||!state.readiness){state.screen=ids().length!==3?'d3':'readiness';save();return render();}
 const d=designOutput(),tab=state.lensTab==='design'?'design':'operations';
 const values=tab==='operations'?d.operations:d.place;
 app.innerHTML=shell(`<section class="panel v15-lens"><div class="stage">DESIGN & OPERATIONS · YOUR FUTURE CAMPUS</div><h2>What must ACHC make possible?</h2><p class="lede">Your three investments each helped Arthur. Here is what your chosen operating model demands.</p><div class="lens-tabs" role="group" aria-label="Choose a lens"><button class="${tab==='operations'?'active':''}" data-action="lens-tab" data-tab="operations" aria-pressed="${tab==='operations'}">Operations & staffing</button><button class="${tab==='design'?'active':''}" data-action="lens-tab" data-tab="design" aria-pressed="${tab==='design'}">Place & engineering</button></div><div class="v15-lens-grid">${values.slice(0,3).map((v,i)=>`<article class="v15-lens-tile"><span>${['01 · Welcome','02 · Connected care','03 · Flexible response'][i]}</span><strong>${escapeHTML(option(state.choices[GAME.decisions[i].id]).name)}</strong><p>${escapeHTML(v)}</p></article>`).join('')}</div><div class="v15-lens-aha"><span class="watershed-caption">YOUR DESIGN MOMENTS</span>${watershedDesignNotes().map(x=>`<p>✓ ${escapeHTML(x)}</p>`).join('')}</div><details class="impact-v14-more"><summary>Explore partner rules, infrastructure and further design requirements</summary><div class="impact-v14-extra"><p><b>${escapeHTML(REGISTRATION[state.readiness.registration].name)}:</b> ${escapeHTML(tab==='operations'?REGISTRATION[state.readiness.registration].ops:REGISTRATION[state.readiness.registration].place)}</p><ul>${(tab==='operations'?d.information:d.foundation).map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><p>An independent specialist must explicitly accept Arthur's referral. These implications are design questions, not an approved ACHC clinical or building specification.</p>${selectedFutureStrip()}</div></details><div class="actions"><button class="primary" data-action="go-commit">Choose a design commitment →</button><button class="secondary" data-action="lens-back">Back to Arthur’s disruption</button></div></section>`,5);
}
function commitmentScreen(){
 if(ids().length!==3||!state.readiness){state.screen=ids().length!==3?'d3':'readiness';save();return render();}
 const items=commitmentOptions();
 const current=state.commitment;
 app.innerHTML=shell(`<section class="panel"><div class="stage">Design & Operations Lens · 2 of 2</div><h2>What would you protect in the ACHC vision?</h2><p class="lede">Choose one priority from your portfolio. Then decide whether ACHC should enable it in design now, coordinate an operating/partner agreement, or preserve the option for the future. There is no scored right answer.</p><div class="commit-options" role="radiogroup" aria-label="Select one commitment">${items.map(x=>`<label class="commit-option ${current&&current.id===x.id?'chosen':''}"><input type="radio" name="commitment" value="${x.id}" ${current&&current.id===x.id?'checked':''}><span><small>${x.source}</small><strong>${escapeHTML(x.title)}</strong><span>${escapeHTML(x.detail)}</span></span></label>`).join('')}</div><h3 class="lens-heading">What kind of commitment is it?</h3><div class="category-options" role="radiogroup" aria-label="Commitment timing and ownership">${[['enable','Enable now','Protect a design or infrastructure requirement'],['coordinate','Coordinate across services','Resolve ownership, workflow and partner agreements'],['preserve','Preserve for the future','Keep capacity for changing care models']].map(([id,name,detail])=>`<label class="category-option"><input type="radio" name="category" value="${id}" ${current&&current.category===id?'checked':''}><span><strong>${name}</strong><small>${detail}</small></span></label>`).join('')}</div><div id="msg" class="error" aria-live="polite"></div><div class="actions"><button class="primary" data-action="finish">Reveal my ACHC vision</button><button class="secondary" data-action="go-lens">Back to the lenses</button></div></section>`,5);
}
function finishCommitment(){
 const chosen=document.querySelector('input[name="commitment"]:checked');
 const category=document.querySelector('input[name="category"]:checked');
 if(!chosen||!category){document.getElementById('msg').textContent='Choose both one priority and one commitment category to continue.';return;}
 if(!commitmentOptions().some(x=>x.id===chosen.value) || !['enable','coordinate','preserve'].includes(category.value))return;
 state.commitment={id:chosen.value,category:category.value};state.screen='result';state.journeyStep=0;
 if(!state.completed){state.completed=true;event('vision_completed',{choices:state.choices,strengthened:state.strengthened,commitment:state.commitment,readiness:state.readiness,statuses:playState().moments.map(m=>m.status)});}
 save();render();
}
function resolveGame(){
 if(ids().length!==3||!state.readiness){state.screen=ids().length!==3?'d3':'readiness';save();return render();}
 state.screen='lens';state.lensTab='operations';state.completed=false;state.commitment=null;
 event('disruption_resolved',{scores:scores(),readiness:state.readiness,statuses:playState().moments.map(m=>m.status)});
 save();render();
}
function result(){
 if(ids().length!==3||!state.readiness){state.screen=ids().length!==3?'d3':'readiness';save();return render();}
 if(!state.commitment){state.screen='commit';save();return render();}
 const prime=option(state.choices[state.readiness.priority]);const aha=strategicAha();const limits=foregoneFutures();const t=totals(),b=GAME.budgets;
 const icons={arrival:'⌖',care:'◉',leave:'↗'};
 app.innerHTML=shell(`<section class="panel v12-result"><div class="stage">YOUR ACHC FUTURE · SCREEN 1 OF 2</div><h2>What your investments created.</h2><p class="lede">Three meaningful investments. One operational priority at opening. The others still have future value.</p><div class="v12-strategy-grid">${GAME.decisions.map(d=>{const o=option(state.choices[d.id]);const ready=d.id===state.readiness.priority;return `<article class="strategy-tile ${ready?'ready-now':'later-phase'}">${investmentScene(o.id,'card')}<div class="strategy-tile-body"><span class="strategy-phase">${ready?'✓ OPENING DAY':'↗ FUTURE VALUE'}</span><h3>${escapeHTML(o.name)}</h3><p>${escapeHTML(ready?INVESTMENT_STORIES[o.id].opening:INVESTMENT_STORIES[o.id].future)}</p></div></article>`;}).join('')}</div><div class="v12-aha"><div class="aha-label">THE AHA · BECAUSE YOU CHOSE THIS...</div><h3>${escapeHTML(aha.headline)}</h3><p>${limits.length?`${escapeHTML(limits[0].option.name)} would require replacing a selected investment and exceeds this portfolio’s budget. It remains a possible alternative future, not an additional investment.`:`Your other investments can support the building’s future, but are not all operational on day one.`}</p></div><div class="v12-resource-line">${state.reserveApplied?'Response reserve: 1 Change + 1 Operations allocated · ':''}Capital ${resourceTotals().capital}/${b.capital} · Change ${resourceTotals().change}/${b.change} · Operations ${resourceTotals().operations}/${b.operations} · ${modelActive(state.readiness.priority)?'Operating model active at opening':'Full operating model phased'}<span> · ${escapeHTML(REGISTRATION[state.readiness.registration].name)}</span></div><div class="actions"><button class="primary" data-action="view-journey">See what Arthur experienced →</button><button class="secondary" data-action="edit-readiness">Reconsider opening-day priority</button></div></section>`,5);
}
const JOURNEY_IMAGES=['access-0.webp','connected-1.webp','operations-1.webp','distributed-2.webp','adapt-1.webp'];
function journeyResult(){
 if(!state.commitment||!state.readiness){state.screen='commit';save();return render();}
 const p=playState(),n=Math.min(4,Math.max(0,state.journeyStep||0)),m=p.moments[n],d=designOutput();
 const selection=commitmentOptions().find(x=>x.id===state.commitment.id);
 if(!selection){state.screen='commit';save();return render();}
 const arrivalAha={digital:'Digital guidance gave Arthur a clearer start. If the schedule changes, someone still needs to update the itinerary.',legible:'The building helped Arthur find his way. The clearest route still cannot resolve a late appointment.',human:'A human welcome reassured Arthur. The guide needs access and authority to resolve a changed plan.'};
 const diagnosticAha={network:'Arthur has one itinerary across departments. Separate services still need reliable handoffs and protected capacity.',core:'Shared diagnostics created a better episode of care. Shared rooms only reach their potential with shared scheduling authority.',comes:'Arthur travels less when care comes to him. Staff, equipment and supplies must move and arrive together.'};
 const opsAha=state.readiness.priority==='care'?'You made your care model operational at opening. The next test is whether shared capacity decisions can actually be made.':'You prioritized another investment for opening. Diagnostic coordination has future value, but may still rely on manual work today.';
 const partnerAha={central:'A common Covenant welcome helps, but the independent specialist still has separate registration and referral rules.',department:'Department control preserves local workflows, but Arthur may face another intake and handoff.',federated:'A federated welcome can bridge the campus experience, but only agreements can connect partner identity and referral acceptance.'};
 const transitionAha={fast:'Early departure planning reduced uncertainty. An unexpected finding may still require the plan to be rewritten.',adaptive:'Flexible recovery offers Arthur options. Those rooms need staffing and monitoring that can adapt too.',wellness:'Named follow-up helps Arthur leave confidently. The next provider still has to accept and own the handoff.'};
 const aha=[arrivalAha[state.choices.arrival],diagnosticAha[state.choices.care],opsAha,partnerAha[state.readiness.registration],transitionAha[state.choices.leave]];
 const label={helped:'HELPED',fragile:'HELPED, BUT FRAGILE',hurt:'NEEDS ATTENTION'}[m.status]||m.status.toUpperCase();
 app.innerHTML=shell(`<section class="panel v12-journey"><div class="stage">ARTHUR'S EXPERIENCE · SCREEN 2 OF 2</div><h2>What happened to Arthur?</h2><p class="lede">Tap through the five moments. Each shows where your decisions helped—and what still needs to connect.</p><nav class="journey-minimap" aria-label="Five journey moments">${p.moments.map((x,i)=>`<button class="moment-dot ${i===n?'active':''} ${x.status}" data-action="journey-jump" data-step="${i}" aria-label="Moment ${i+1}: ${escapeHTML(x.title)}" aria-current="${i===n?'step':'false'}"><span>${i+1}</span><small>${['Arrival','Diagnostics','Capacity','Partner','Transition'][i]}</small></button>`).join('')}</nav><div class="v12-journey-hero"><div class="v12-journey-image"><img src="assets/${JOURNEY_IMAGES[n]}" alt="Illustrative care environment for moment ${n+1}"/><span class="journey-image-label">MOMENT ${n+1} OF 5</span></div><div class="v12-journey-story"><span class="moment-status ${m.status}">${label}</span><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.detail)}</p><div class="v12-aha compact"><span class="aha-label">AHA MOMENT</span><strong>${escapeHTML(aha[n])}</strong></div><details class="journey-details"><summary>Learn more · Operational and design implications</summary><p>${escapeHTML(m.why)}</p></details></div></div><div class="actions"><button class="primary" data-action="journey-next">${n<4?'Next moment →':'View my design commitment ↓'}</button><button class="secondary" data-action="journey-back">${n>0?'Previous moment':'Back to strategy'}</button></div>${n===4?`<section id="v12-commitment" class="v12-brief"><div class="stage">YOUR ACHC COMMITMENT</div><h3>${escapeHTML(selection.title)}</h3><p>${escapeHTML(selection.detail)}</p><div class="brief-two"><div><b>Operations</b><p>${escapeHTML(selection.operations)}</p></div><div><b>Place / design</b><p>${escapeHTML(selection.place)}</p></div></div><details><summary>Explore full design implications and underlying scores</summary><div class="implication-grid">${implications('Operations',d.operations)}${implications('Place',d.place)}${implications('Information',d.information)}${implications('Foundation',d.foundation)}</div><div class="scoregrid">${GAME.dimensions.map((x,i)=>`<div class="score"><div class="scorehead"><span>${escapeHTML(x)}</span><span>${p.sc[i]}/3</span></div><div class="meter"><span style="width:${p.sc[i]/3*100}%"></span></div></div>`).join('')}</div></details><div class="actions"><button class="primary" data-action="restart">Play again</button><button class="secondary" data-action="go-lens">Explore Design & Operations</button><button class="secondary" data-action="copy-brief">Copy design brief</button><button class="secondary" data-action="go-commit">Change commitment</button></div><div id="msg" class="error" role="status" aria-live="polite"></div></section>`:''}</section>`,5);
}
function copyBrief(){
 const p=playState(),d=designOutput();const lines=[`Arthur · Care Well — ${CFG.gameVersion||'v0.6'}`, ...GAME.decisions.map(x=>`${x.title}: ${option(state.choices[x.id]).name}`),`Operational at opening: ${option(state.strengthened).name}`,`Registration: ${REGISTRATION[state.readiness.registration].name}`,`Registration trade-off: ${REGISTRATION[state.readiness.registration].cost}`,'',...p.moments.map(m=>`${m.key.toUpperCase()} — ${m.status}: ${m.title}. ${m.detail} Design insight: ${m.why}`),'',...Object.entries(d).flatMap(([k,v])=>[k.toUpperCase(),...v.map(x=>`- ${x}`),''])];
 const selected=state.commitment?commitmentOptions().find(x=>x.id===state.commitment.id):null;
 if(selected)lines.push('ACHC COMMITMENT',selected.title,selected.detail,'Category: '+({enable:'Enable now',coordinate:'Coordinate across services',preserve:'Preserve for the future'}[state.commitment.category]),'Operations: '+selected.operations,'Place: '+selected.place);
 lines.push('', 'WATERSHED DESIGN IMPLICATIONS',...watershedDesignNotes().map(x=>'- '+x),`Reserve used: ${state.reserveApplied?'Yes':'No'}`);
 const value=lines.join('\n');
 const msg=document.getElementById('msg');
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(value).then(()=>{if(msg)msg.textContent='Design brief copied.'}).catch(()=>{if(msg)msg.textContent='Clipboard permission unavailable. Select the brief text to copy.'});}
 else if(msg)msg.textContent='Clipboard unavailable in this browser. Select the brief text to copy.';
}
function restart(){state=fresh();save();render();}
function review(){back(1);}
// All UI actions are delegated here: no inline JS strings and no accidental page reloads.
app.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-action]');if(!btn||btn.disabled)return;
  switch(btn.dataset.action){
    case 'begin':begin();break;
    case 'resume':resume();break;
    case 'story-home':storyHome();break;
    case 'open-help':openHelp();break;
    case 'help-next':helpNext();break;
    case 'launch-investments':launchInvestments();break;
    case 'launch-back':state.screen='howto';state.helpReturn=null;save();render();break;
    case 'next-opening':goOpening(btn.dataset.dest);break;
    case 'baseline-next':baselineNext();break;
    case 'baseline-back':baselineBack();break;
    case 'baseline-jump':state.baselineStep=Math.max(0,Math.min(3,Number(btn.dataset.step)||0));save();render();break;
    case 'baseline-finish':baselineFinish();break;
    case 'open-gallery':showGallery();break;
    case 'open-moment':showMoment(btn.dataset.moment,btn.dataset.choice);break;
    case 'close-moment':{const dlg=document.getElementById('moment-dialog');if(dlg){if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.removeAttribute('open');}break;}
    case 'moment-choice':momentView.choice=Math.max(0,Math.min(2,Number(btn.dataset.index)||0));renderMomentDialog();break;
    case 'moment-tab':momentView.tab=['arch','plan','eng'].includes(btn.dataset.tab)?btn.dataset.tab:'arch';renderMomentDialog();break;
    case 'moment-next':momentView.step='impact';momentView.tab='arch';renderMomentDialog();break;
    case 'moment-back':momentView.step='explore';renderMomentDialog();break;
    case 'choose':choose(btn.dataset.decision,btn.dataset.option);break;
    case 'continue-impact':continueImpact(Number(btn.dataset.step));break;
    case 'continue-reveal':continueReveal(Number(btn.dataset.step));break;
    case 'watershed-select':watershedSelect(btn.dataset.stage,btn.dataset.value);break;
    case 'watershed-confirm':watershedConfirm(Number(btn.dataset.step));break;
    case 'watershed-back':watershedBack(Number(btn.dataset.step));break;
    case 'shift-next':shiftNext(Number(btn.dataset.step));break;
    case 'shift-back':shiftBack(Number(btn.dataset.step));break;
    case 'reserve-toggle':if(reserveAvailable()){state.reserveApplied=!state.reserveApplied;event('reserve_changed',{active:state.reserveApplied});render();}break;
    case 'return-impact':state.screen=`impact${Number(btn.dataset.step)}`;save();render();break;
    case 'back':back(Number(btn.dataset.step));break;
    case 'set-readiness':setReadiness();break;
    case 'next-beat':state.screen='pressure';save();render();break;
    case 'back-beat':state.screen='disruption';save();render();break;
    case 'resolve':resolveGame();break;
    case 'lens-tab':state.lensTab=btn.dataset.tab==='design'?'design':'operations';save();render();break;
    case 'go-lens':state.screen='lens';save();render();break;
    case 'go-commit':state.screen='commit';save();render();break;
    case 'edit-readiness':state.screen='readiness';state.completed=false;state.commitment=null;save();render();break;
    case 'lens-back':state.screen='pressure';save();render();break;
    case 'finish':finishCommitment();break;
    case 'copy-brief':copyBrief();break;
    case 'view-journey':state.screen='journeyResult';state.journeyStep=0;save();render();break;
    case 'journey-jump':state.journeyStep=Math.max(0,Math.min(4,Number(btn.dataset.step)||0));save();render();break;
    case 'journey-next':if(state.journeyStep<4){state.journeyStep++;save();render();}else{document.getElementById('v12-commitment')?.scrollIntoView({behavior:'smooth'});}break;
    case 'journey-back':if(state.journeyStep>0){state.journeyStep--;save();render();}else{state.screen='result';save();render();}break;
    case 'restart':restart();break;
    case 'review':review();break;
  }
});
// A saved unfinished game resumes on refresh; a finished game remains reviewable.
render();
