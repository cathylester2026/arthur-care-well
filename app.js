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
 {id:'core',letter:'B',name:'Shared Diagnostic Core',tag:'Create one preparation and diagnostic journey.',creates:['One check-in','Shared preparation','Ability to reorder the visit'],requires:['Universal rooms','Common booking','Joint operational authority'],risk:'Departments may share space while protecting separate schedules.',cost:[3,3,2],impact:[3,3,3,2,2,2],strength:'Integrated Diagnostic Platform',boost:[0,0,0,1,1,1]},
 {id:'comes',letter:'C',name:'Care Comes to Arthur',tag:'Arthur stays in one flexible setting while selected services move.',creates:['Less patient movement','Fewer repeated waits','Greater continuity'],requires:['Universal care rooms','Mobile equipment routes','Staff and equipment tracking'],risk:'Reducing Arthur’s movement increases operational movement.',cost:[2,3,3],impact:[3,3,3,2,2,2],strength:'Distributed Care Platform',boost:[0,0,0,1,1,0]}]},
 {id:'leave',title:'How will Arthur leave ready?',prompt:'Choose what the campus resolves before Arthur goes home.',options:[
 {id:'fast',letter:'A',name:'Fast Exit',tag:'Prepare everything before Arthur is ready to leave.',creates:['Less discharge waiting','Medication ready','Coordinated pickup'],requires:['Early planning','Pharmacy integration','Support-person updates'],risk:'The model works best when recovery follows the expected path.',cost:[1,2,1],impact:[2,2,1,2,1,3],strength:'Responsive Departure',boost:[1,1,0,0,1,0]},
 {id:'adaptive',letter:'B',name:'Adaptive Recovery',tag:'Change Arthur’s recovery setting as Arthur’s needs change.',creates:['Recovery matched to need','Capacity for slower recovery','Better use of procedure space'],requires:['Different recovery settings','Flexible monitoring','Flexible staffing'],risk:'Flexible rooms do not create flexible care unless staffing moves too.',cost:[3,2,2],impact:[2,2,3,2,3,2],strength:'Elastic Recovery Platform',boost:[0,1,0,1,0,1]},
 {id:'wellness',letter:'C',name:'Connected Wellness',tag:'Use the procedure as the beginning of Arthur’s next care plan.',creates:['Confirmed follow-up','Connected medication and recovery','Continued support'],requires:['Wellness navigation','Virtual care','Named follow-up ownership'],risk:'A referral is not continuity unless capacity and ownership exist.',cost:[2,3,3],impact:[3,3,2,2,2,3],strength:'Closed-Loop Wellness',boost:[0,0,0,1,1,0]}]}],
 synergies:[['digital','network',1,1],['digital','core',0,1],['legible','core',2,1],['human','network',3,1],['human','comes',0,1],['core','adaptive',4,1],['comes','adaptive',2,1],['network','wellness',5,1],['core','wellness',1,1],['human','wellness',5,1]]
};
const STORAGE_KEY = 'arthur-care-well-v2';
const OLD_KEY = 'arthur-care-well';
const SCREEN_ORDER = ['intro','d1','d2','strengthen','d3','disruption','result'];
const app = document.getElementById('app');
const newId = () => (window.crypto && typeof crypto.randomUUID==='function') ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fresh = () => ({screen:'intro', choices:{}, strengthened:null, startedAt:null, sessionId:newId(), events:[], completed:false});
function load() {
  try {
    const raw=localStorage.getItem(STORAGE_KEY);
    if (!raw) return null; // Prior-version decisions are not imported into changed budgets / logic.
    const s=JSON.parse(raw);
    if (!s || typeof s!=='object' || !s.choices || typeof s.choices!=='object') return null;
    const safe=fresh();
    for (const d of GAME.decisions) {
      if (d.options.some(o=>o.id===s.choices[d.id])) safe.choices[d.id]=s.choices[d.id];
    }
    if (SCREEN_ORDER.includes(s.screen)) safe.screen=s.screen;
    if (typeof s.strengthened==='string' && Object.values(safe.choices).includes(s.strengthened)) safe.strengthened=s.strengthened;
    if (typeof s.startedAt==='string') safe.startedAt=s.startedAt;
    if (typeof s.sessionId==='string') safe.sessionId=s.sessionId;
    if (Array.isArray(s.events)) safe.events=s.events.slice(-100);
    safe.completed=!!s.completed;
    // Never resume a screen without its prerequisites.
    if (['d2','strengthen','d3','disruption','result'].includes(safe.screen) && !safe.choices.arrival) safe.screen='d1';
    if (['strengthen','d3','disruption','result'].includes(safe.screen) && !safe.choices.care) safe.screen='d2';
    if (['d3','disruption','result'].includes(safe.screen) && !safe.strengthened) safe.screen='strengthen';
    if (['disruption','result'].includes(safe.screen) && !safe.choices.leave) safe.screen='d3';
    return safe;
  } catch (err) { console.warn('Could not restore game:',err); return null; }
}
let state=load() || fresh();
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
  if(state.strengthened&&chosen.includes(state.strengthened)) option(state.strengthened).boost.forEach((v,i)=>norm[i]=Math.min(3,norm[i]+v));
  return norm;
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function shell(inner,step=0){return `<div class="shell"><div class="topbar"><div class="brand">Arthur <span>·</span> Care Well</div><div class="version">Single player · ${escapeHTML(CFG.gameVersion||'prototype')}</div></div>${step?`<div class="progress" aria-label="Game progress, step ${step} of 5">${[1,2,3,4,5].map(x=>`<i class="${x<=step?'on':''}"></i>`).join('')}</div>`:''}${inner}<div class="footerline">A wellness campus is not a collection of services. It is a promise that the experience can reorganize around Arthur.</div></div>`;}
function render(){
  if(state.screen==='intro')return intro();
  if(state.screen==='strengthen')return strengthen();
  if(state.screen==='disruption')return disruption();
  if(/^d[1-3]$/.test(state.screen))return decision(Number(state.screen.slice(1)));
  if(state.screen==='result')return result();
  state.screen='intro';save();intro();
}
function intro(){
  const resumable=!!state.startedAt && state.screen==='intro' && !!ids().length;
  app.innerHTML=shell(`<section class="hero"><div class="eyebrow">One visit · Three decisions · One disruption</div><h1>Care<br>Well.</h1><p>Arthur is coming to a wellness campus for imaging, diagnostics and a planned outpatient procedure. Design how the campus meets Arthur, assembles care and sends Arthur home ready. Then see what holds when the plan changes.</p><p class="intro-note">You will make three design decisions with limited Capital, Change and Operations resources, strengthen one choice, and then face an unexpected change.</p><div class="actions"><button class="primary" data-action="begin">Begin Arthur’s day</button></div></section>`);
}
function begin(){state=fresh();state.startedAt=new Date().toISOString();state.screen='d1';event('game_started');render();}
function resources(){const t=totals(),b=GAME.budgets;return `<div class="resourcebar" aria-label="Resource use">${[['capital','Capital'],['change','Change'],['operations','Operations']].map(([k,l])=>`<span class="resource ${t[k]>b[k]?'over':''}">${l}: ${t[k]} / ${b[k]}</span>`).join('')}</div>`;}
function decision(n){
  const d=GAME.decisions[n-1];
  const previous=n>1?`<button class="secondary" data-action="back" data-step="${n-1}">Back to decision ${n-1}</button>`:'';
  app.innerHTML=shell(`<section class="panel"><div class="stage">Decision ${n} of 3</div><h2>${escapeHTML(d.title)}</h2><p class="lede">${escapeHTML(d.prompt)}</p>${resources()}<div class="cards">${d.options.map(o=>{
    const available=optionAvailable(d.id,o.id);
    return `<article class="card ${!available?'unavailable':''}"><div class="letter">${escapeHTML(o.letter)}</div><h3>${escapeHTML(o.name)}</h3><div class="tagline">${escapeHTML(o.tag)}</div><strong>Creates</strong><ul>${o.creates.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><strong>Requires</strong><ul>${o.requires.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><div class="risk"><strong>Risk:</strong> ${escapeHTML(o.risk)}</div><div class="costs"><span class="cost">Capital ${o.cost[0]}</span><span class="cost">Change ${o.cost[1]}</span><span class="cost">Operations ${o.cost[2]}</span></div>${available?'':`<p class="limit-note">Unavailable with this resource plan. Go back to revise an earlier decision.</p>`}<button class="${available?'primary':'secondary'}" data-action="choose" data-decision="${d.id}" data-option="${o.id}" ${available?'':'disabled'}>${available?'Choose this direction':'Budget limit'}</button></article>`;
  }).join('')}</div><div id="msg" class="error" role="status" aria-live="polite"></div><div class="actions">${previous}</div></section>`,n);
}
function choose(did,oid){
  if(!optionAvailable(did,oid)){const msg=document.getElementById('msg');if(msg)msg.textContent='This choice would prevent a complete visit within the resource budget. Revise your earlier choices.';return;}
  const n=GAME.decisions.findIndex(d=>d.id===did)+1;
  for(let i=n;i<GAME.decisions.length;i++)delete state.choices[GAME.decisions[i].id];
  if(n<=2)state.strengthened=null;
  state.choices[did]=oid;
  state.completed=false;
  state.screen=n===1?'d2':n===2?'strengthen':'disruption';
  event('decision_selected',{decision:did,option:oid});render();
}
function back(n){
  if(n<1||n>3)return;
  // Preserve previous choices only up to the preceding step, then allow a clean re-selection.
  for(let i=n-1;i<GAME.decisions.length;i++)delete state.choices[GAME.decisions[i].id];
  state.strengthened=null;state.completed=false;state.screen=`d${n}`;save();render();
}
function strengthen(){
  if(!state.choices.arrival||!state.choices.care){state.screen='d2';save();return render();}
  const chosen=ids();
  app.innerHTML=shell(`<section class="panel"><div class="stage">Strengthen the design</div><h2>Strengthen one decision</h2><p class="lede">Make one focused resilience improvement to a choice already made. Strengthening does not consume additional resources in this prototype.</p>${resources()}<div class="cards">${chosen.map(id=>{const o=option(id);return `<article class="card strength-card"><div class="letter">+</div><h3>${escapeHTML(o.strength)}</h3><div class="tagline">Strengthen ${escapeHTML(o.name)}</div><p>${escapeHTML(o.risk)}</p><p><strong>Support the journey when Arthur’s plan changes.</strong></p><button class="primary" data-action="strengthen" data-option="${id}">Strengthen this</button></article>`;}).join('')}</div><div class="actions"><button class="secondary" data-action="back" data-step="2">Back to care decision</button></div></section>`,3);
}
function applyStrength(id){if(!ids().includes(id))return;state.strengthened=id;state.screen='d3';event('option_strengthened',{option:id});render();}
function summary(){return GAME.decisions.map(d=>{const o=option(state.choices[d.id]);return `<div><small>${escapeHTML(d.title)}</small><strong>${o?escapeHTML(o.name):'—'}</strong></div>`;}).join('');}
function disruption(){
  if(ids().length!==3){state.screen='d3';save();return render();}
  app.innerHTML=shell(`<section class="disruption"><div class="stage">The plan changes</div><h2>Imaging finds something unexpected.</h2><p>Arthur can still have the procedure today, but the campus must reorganize the visit.</p><ul><li>A specialist must review the finding.</li><li>Another diagnostic test is required.</li><li>Diagnostics are running 45 minutes behind.</li><li>Arthur has been fasting.</li><li>The support person has temporarily left.</li><li>Pharmacy closes in 90 minutes.</li><li>The procedure room has a limited opening.</li></ul><div class="choice-summary">${summary()}</div><div class="actions"><button class="primary" data-action="resolve">See what holds</button><button class="secondary" data-action="back" data-step="3">Revisit final decision</button></div></section>`,4);
}
function outcome(s){
  const low=s.filter(x=>x<=1).length;
  if(s[3]<2)return ['Coordinated, but no one can act','The campus can see Arthur’s changed plan, but no role has enough authority to protect the procedure window and reorder the episode.'];
  if(s[4]<2)return ['The plan has nowhere to wait','The change is understood, but the campus lacks appropriate capacity to absorb delay without blocking another service.'];
  if(s[5]<2)return ['Procedure complete. Transition incomplete.','Arthur may receive the procedure, but medication, transportation or follow-up remains unresolved.'];
  if(low>=3)return ['A collection of services','Arthur’s information moves, but Arthur must restart parts of the journey when the plan changes.'];
  if(s.filter(x=>x===3).length>=4)return ['A resilient wellness campus','The campus reorders the episode around Arthur, protects the procedure window and keeps departure needs connected.'];
  return ['Coordinated, but brittle','The procedure can proceed, but staff intervention and added waiting are needed to hold the journey together.'];
}
const moments={
  arrival:{digital:'Arthur gets live directions and schedule updates, provided the information is accurate and accessible.',legible:'Arthur can see where to go without relying on a phone, but still needs help if appointments change.',human:'A welcome guide identifies his needs, but must have authority to fix a changed itinerary.'},
  care:{network:'Departments share status, but linked slots and handoffs remain critical.',core:'Shared preparation and diagnostics make reordering possible if teams share authority.',comes:'Arthur moves less, while staff, equipment and schedules must move more.'},
  leave:{fast:'Departure is prepared early, but the unexpected result may change medication and pickup needs.',adaptive:'Recovery space can flex, provided staffing and monitoring change with Arthur.',wellness:'Follow-up can extend beyond the visit if a partner or team actually accepts responsibility.'}
};
function resolveGame(){
  if(ids().length!==3||!state.strengthened)return;
  state.screen='result';
  if(!state.completed){state.completed=true;event('disruption_resolved',{scores:scores()});
    if(db)db.from('game_runs').insert({session_id:state.sessionId,game_version:CFG.gameVersion||'dev',choices:state.choices,strengthened_option:state.strengthened,scores:scores(),resource_use:totals(),completed_at:new Date().toISOString()}).then(({error})=>{if(error)console.warn('Telemetry:',error.message)}).catch(()=>{});
  }
  save();render();
}
function result(){
  const s=scores(),o=outcome(s),t=totals(),b=GAME.budgets;
  app.innerHTML=shell(`<section class="panel"><div class="stage">Arthur's reveal</div><h2>${escapeHTML(o[0])}</h2><p class="lede">${escapeHTML(o[1])}</p><div class="choice-summary">${summary()}</div><h3>What Arthur experiences</h3><div class="moment-list">${GAME.decisions.map((d,i)=>{const id=state.choices[d.id];return `<div><strong>${i+1}. ${escapeHTML(option(id).name)}</strong><p>${escapeHTML(moments[d.id][id])}</p></div>`;}).join('')}</div><div class="outcome"><strong>Strengthened:</strong> ${escapeHTML(option(state.strengthened)?.strength||'None')}<br><strong>Resources:</strong> Capital ${t.capital}/${b.capital} · Change ${t.change}/${b.change} · Operations ${t.operations}/${b.operations}</div><h3>Six conditions of connected care</h3><div class="scoregrid">${GAME.dimensions.map((d,i)=>`<div class="score"><div class="scorehead"><span>${escapeHTML(d)}</span><span>${s[i]} / 3</span></div><div class="meter"><span style="width:${s[i]/3*100}%"></span></div></div>`).join('')}</div><h3>Design translation</h3><p>Use these prompts to move from a portfolio of ideas to requirements for ACHC.</p><ul><li><strong>Experience:</strong> Where does Arthur still need to repeat a step or ask for help?</li><li><strong>Operations:</strong> Who can reorder the visit when circumstances change?</li><li><strong>Information:</strong> Which teams and partner services need the same plan and status?</li><li><strong>Place:</strong> Which space and patient routes absorb a 45-minute delay?</li><li><strong>Foundation:</strong> What shared standards and infrastructure make the handoffs reliable?</li></ul><div class="actions"><button class="primary" data-action="restart">Play again</button><button class="secondary" data-action="review">Revise your design</button></div></section>`,5);
}
function restart(){state=fresh();save();render();}
function review(){back(1);}
// All UI actions are delegated here: no inline JS strings and no accidental page reloads.
app.addEventListener('click',e=>{
  const btn=e.target.closest('button[data-action]');if(!btn||btn.disabled)return;
  switch(btn.dataset.action){
    case 'begin':begin();break;
    case 'choose':choose(btn.dataset.decision,btn.dataset.option);break;
    case 'back':back(Number(btn.dataset.step));break;
    case 'strengthen':applyStrength(btn.dataset.option);break;
    case 'resolve':resolveGame();break;
    case 'restart':restart();break;
    case 'review':review();break;
  }
});
// A saved unfinished game resumes on refresh; a finished game remains reviewable.
render();
