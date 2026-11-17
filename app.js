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
const STORAGE_KEY = 'arthur-care-well-v5';
const OLD_KEY = 'arthur-care-well';
const SCREEN_ORDER = ['intro','d1','d2','d3','readiness','disruption','pressure','lens','commit','result'];
const app = document.getElementById('app');
const newId = () => (window.crypto && typeof crypto.randomUUID==='function') ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const fresh = () => ({screen:'intro', choices:{}, strengthened:null, readiness:null, startedAt:null, sessionId:newId(), events:[], completed:false, lensTab:'operations', commitment:null});
function load() {
 try {
  const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return null;
  const saved=JSON.parse(raw);if(!saved||typeof saved!=='object'||!saved.choices)return null;
  const next=fresh();
  for(const d of GAME.decisions){if(d.options.some(o=>o.id===saved.choices[d.id]))next.choices[d.id]=saved.choices[d.id];}
  // Reject invalid and over-budget portfolios, including edited localStorage.
  if(!withinBudget(next.choices))return null;
  if(['central','department','federated'].includes(saved.readiness?.registration) &&
     ['arrival','care','leave'].includes(saved.readiness?.priority))next.readiness={registration:saved.readiness.registration,priority:saved.readiness.priority};
  if(next.readiness)next.strengthened=next.choices[next.readiness.priority]||null;
  if(SCREEN_ORDER.includes(saved.screen))next.screen=saved.screen;
  if(typeof saved.startedAt==='string')next.startedAt=saved.startedAt;
  if(typeof saved.sessionId==='string')next.sessionId=saved.sessionId;
  if(Array.isArray(saved.events))next.events=saved.events.slice(-100);
  if(['operations','design'].includes(saved.lensTab))next.lensTab=saved.lensTab;
  if(saved.commitment && ['arrival','care','leave'].includes(saved.commitment.id) && ['enable','coordinate','preserve'].includes(saved.commitment.category))next.commitment={id:saved.commitment.id,category:saved.commitment.category};
  const progress=ids(next.choices).length;
  if(progress===0 && next.screen!=='intro')next.screen='d1';
  else if(progress===1 && !['intro','d1','d2'].includes(next.screen))next.screen='d2';
  else if(progress===2 && !['intro','d1','d2','d3'].includes(next.screen))next.screen='d3';
  else if(progress===3 && ['disruption','pressure','lens','commit','result'].includes(next.screen) && !next.readiness)next.screen='readiness';
  if(next.screen==='result'&&!next.commitment)next.screen='commit';
  next.completed=next.screen==='result';return next;
 } catch(err){console.warn('Saved game could not be restored',err);return null;}
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
  // Capability scores show the portfolio; operational readiness affects observed consequences, not free numeric boosts.
  return norm;
}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function shell(inner,step=0){return `<div class="shell"><div class="topbar"><div class="brand">Arthur <span>·</span> Care Well</div><div class="version">Single player · ${escapeHTML(CFG.gameVersion||'prototype')}</div></div>${step?`<div class="progress" aria-label="Game progress, step ${step} of 5">${[1,2,3,4,5].map(x=>`<i class="${x<=step?'on':''}"></i>`).join('')}</div>`:''}${inner}<div class="footerline">A wellness campus is not a collection of services. It is a promise that the experience can reorganize around Arthur.</div></div>`;}
function render(){
  if(state.screen==='intro')return intro();
  if(state.screen==='readiness')return readinessScreen();
  if(state.screen==='disruption')return disruption();
  if(state.screen==='pressure')return pressure();
  if(/^d[1-3]$/.test(state.screen))return decision(Number(state.screen.slice(1)));
  if(state.screen==='lens')return lensScreen();
  if(state.screen==='commit')return commitmentScreen();
  if(state.screen==='result')return result();
  state.screen='intro';save();intro();
}
function intro(){
  
  app.innerHTML=shell(`<section class="hero"><div class="eyebrow">One visit · Three decisions · One opening-day priority</div><h1>Care<br>Well.</h1><p>Arthur is coming to a wellness campus for imaging, diagnostics and a planned outpatient procedure. Design how the campus meets Arthur, assembles care and sends Arthur home ready. Then see what holds when the plan changes.</p><p class="intro-note">You will make three design decisions with limited Capital, Change and Operations resources, choose what can be operational at opening and how independent partners register, then face an unexpected change.</p><div class="actions"><button class="primary" data-action="begin">Begin Arthur’s day</button></div></section>`);
}
function begin(){state=fresh();state.startedAt=new Date().toISOString();state.screen='d1';event('game_started');render();}
function resources(){const t=totals(),b=GAME.budgets;return `<div class="resourcebar" aria-label="Resource use">${[['capital','Capital'],['change','Change'],['operations','Operations']].map(([k,l])=>`<span class="resource ${t[k]>b[k]?'over':''}">${l}: ${t[k]} / ${b[k]}</span>`).join('')}</div>`;}
function decision(n){
  const d=GAME.decisions[n-1];
  const previous=n>1?`<button class="secondary" data-action="back" data-step="${n-1}">Back to decision ${n-1}</button>`:'';
  app.innerHTML=shell(`<section class="panel"><div class="stage">Decision ${n} of 3</div><h2>${escapeHTML(d.title)}</h2><p class="lede">${escapeHTML(d.prompt)}</p>${resources()}<div class="cards">${d.options.map(o=>{
    const available=optionAvailable(d.id,o.id);
    return `<article class="card ${!available?'unavailable':''}"><div class="letter">${escapeHTML(o.letter)}</div><h3>${escapeHTML(o.name)}</h3><div class="tagline">${escapeHTML(o.tag)}</div><strong>Creates</strong><ul>${o.creates.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><strong>Requires</strong><ul>${o.requires.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ul><div class="risk"><strong>Trade-off / what becomes harder:</strong> ${escapeHTML(o.risk)}</div><div class="costs"><span class="cost">Capital ${o.cost[0]}</span><span class="cost">Change ${o.cost[1]}</span><span class="cost">Operations ${o.cost[2]}</span></div>${available?'':`<p class="limit-note">Unavailable with this resource plan. Go back to revise an earlier decision.</p>`}<button class="${available?'primary':'secondary'}" data-action="choose" data-decision="${d.id}" data-option="${o.id}" ${available?'':'disabled'}>${available?'Choose this direction':'Budget limit'}</button></article>`;
  }).join('')}</div><div id="msg" class="error" role="status" aria-live="polite"></div><div class="actions">${previous}</div></section>`,n);
}
function choose(did,oid){
  if(!optionAvailable(did,oid)){const msg=document.getElementById('msg');if(msg)msg.textContent='This choice would prevent a complete visit within the resource budget. Revise your earlier choices.';return;}
  const n=GAME.decisions.findIndex(d=>d.id===did)+1;
  for(let i=n;i<GAME.decisions.length;i++)delete state.choices[GAME.decisions[i].id];
  state.readiness=null;state.strengthened=null;
  state.choices[did]=oid;
  state.completed=false;state.commitment=null;
  state.screen=n===1?'d2':n===2?'d3':'readiness';
  event('decision_selected',{decision:did,option:oid});render();
}
function back(n){
 if(n<1||n>3)return;
 for(let i=n-1;i<GAME.decisions.length;i++)delete state.choices[GAME.decisions[i].id];
 state.readiness=null;state.strengthened=null;state.completed=false;state.commitment=null;
 state.screen=`d${n}`;save();render();
}
const REGISTRATION={
 central:{name:'Centralized registration',gain:'One common Covenant-operated intake and welcome process.',cost:'Independent providers may still require their own registration, consent and billing steps.',ops:'Define registration boundaries, identity exceptions and which partner processes cannot be completed centrally.',place:'Provide one prominent welcome with private exceptions and clear partner-service routing.'},
 department:{name:'Department / setting registration',gain:'Each service retains control of its own eligibility, privacy and intake workflow.',cost:'Arthur can be asked to repeat details and navigate several desks.',ops:'Create consistent referral instructions and named handoff owners across organizations.',place:'Allow local registration points, visible service entries and accessible circulation between them.'},
 federated:{name:'Federated welcome',gain:'One campus welcome and identity guidance with service-specific registration where required.',cost:'Shared status, consent and partner agreements must be negotiated and maintained.',ops:'Agree who shares what information, reconciles identity, manages exceptions and accepts referrals.',place:'Combine common welcome infrastructure with flexible private intake capacity for providers.'}
};
function readinessScreen(){
 if(ids().length!==3){state.screen='d3';save();return render();}
 const ready=state.readiness||{};
 app.innerHTML=shell(`<section class="panel"><div class="stage">Opening day · A real trade-off</div><h2>You cannot launch everything at once.</h2><p class="lede">Your three directions shape the future campus. But only one can be fully operational on opening day; the other two will be physically enabled or deferred until people, governance and systems are ready. Choose where to concentrate scarce change capacity.</p><div class="choice-summary">${summary()}</div><h3 class="lens-heading">What must be operational at opening?</h3><div class="commit-options" role="radiogroup" aria-label="Opening day priority">${GAME.decisions.map(d=>{const o=option(state.choices[d.id]);return `<label class="commit-option"><input type="radio" name="priority" value="${d.id}" ${ready.priority===d.id?'checked':''}><span><small>${d.title}</small><strong>${escapeHTML(o.name)}</strong><span>Ready with workflows, owners and supporting services. Other choices remain planned, not fully live.</span></span></label>`}).join('')}</div><h3 class="lens-heading">Who registers Arthur across organizational boundaries?</h3><p class="lede">The campus includes independently operated services that may not share Covenant Health's registration system or policies. Choose a model, including its burden.</p><div class="commit-options" role="radiogroup" aria-label="Registration model">${Object.entries(REGISTRATION).map(([id,r])=>`<label class="commit-option"><input type="radio" name="registration" value="${id}" ${ready.registration===id?'checked':''}><span><strong>${escapeHTML(r.name)}</strong><span><b>Enables:</b> ${escapeHTML(r.gain)}</span><span><b>Costs / risks:</b> ${escapeHTML(r.cost)}</span></span></label>`).join('')}</div><div id="msg" class="error" role="status" aria-live="polite"></div><div class="actions"><button class="primary" data-action="set-readiness">Open the campus: test your choices</button><button class="secondary" data-action="back" data-step="3">Change departure design</button></div></section>`,4);
}
function setReadiness(){
 const p=document.querySelector('input[name="priority"]:checked')?.value;
 const r=document.querySelector('input[name="registration"]:checked')?.value;
 if(!['arrival','care','leave'].includes(p)||!REGISTRATION[r]){document.getElementById('msg').textContent='Choose both an opening-day priority and a registration approach.';return;}
 state.readiness={priority:p,registration:r};state.strengthened=state.choices[p];
 state.completed=false;state.commitment=null;state.screen='disruption';event('opening_day_decided',{priority:p,registration:r});render();
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
  if(priority!=='arrival'&&access.status==='helped')access=verdict('fragile','Arrival design is not fully operational yet',access.detail+' Opening-day teams still bridge gaps manually.','Enabling the building does not make the arrival model operational.');
  if(priority!=='care'&&clinical.status==='helped')clinical=verdict('fragile','Care design awaits operational readiness',clinical.detail+' The joint service rules are not fully live yet.','Co-location or interoperability is not equivalent to operational coordination.');
  if(priority!=='care'&&ops.status==='helped')ops=verdict('fragile','Capacity coordination is not fully live',ops.detail+' Staff still negotiate exceptions manually.','Unfunded operational authority cannot be assumed.');
  if(priority!=='leave'&&home.status==='helped')home=verdict('fragile','Departure capability remains a future commitment',home.detail+' The complete follow-through workflow is not yet operational.','A future capability does not automatically deliver day-one value.');
  // An independent specialist must accept a new referral. Sharing a campus is not shared governance.
  let partner;
  if(registration==='central')partner=verdict('hurt','One welcome, a second organization','The common desk has prepared Arthur, but the independent specialist still needs separate registration and has not accepted the urgent referral.','Central registration cannot promise an independent provider’s capacity or consent process.');
  else if(registration==='department')partner=verdict('fragile','Separate desks, separate systems','The partner can manage its own intake, but Arthur repeats details and needs a tracked cross-organization handoff.','Local autonomy preserves service control at the expense of journey continuity.');
  else partner=verdict('fragile','Shared welcome, negotiated boundaries','The federated welcome shares routing and permitted status information, but the specialist must still confirm acceptance under a partner agreement.','A federated model needs ongoing governance and clear exceptions; it is not automatically seamless.');
  if(registration==='federated'&&priority==='care')partner=verdict('helped','The independent partner accepts the handoff','A prepared cross-provider workflow confirms the specialist’s acceptance while the partner retains its own intake and governance.','A shared welcome succeeds only when cross-organization acceptance and escalation are operational.');
  if(registration==='department'&&priority==='care')partner=verdict('helped','A manual but owned partner handoff','The specialist completes local intake, while an accountable coordinator verifies acceptance and updates Arthur’s pathway.','Coordinated handoffs can work without one registration system, but require staff time.');
  if(registration==='central'&&priority==='care')partner=verdict('fragile','The second registration is actively managed','The independent provider retains separate requirements, but a named coordinator confirms intake and appointment acceptance.','A centralized welcome can be effective without pretending to control partner systems.');
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
  if(ids().length!==3||!state.readiness){state.screen=ids().length!==3?'d3':'readiness';save();return render();}
  const p=playState();
  app.innerHTML=shell(`<section class="disruption"><div class="stage">Disruption · Part 2 of 2</div><h2>Now the clock matters.</h2><p>Diagnostics are 45 minutes behind. Arthur has been fasting. The procedure opening is limited, his support person is temporarily away, and pharmacy closes soon.</p><div class="reveal-on-dark">${momentCard(p.moments[2])}</div><p class="subtle-on-dark">What the campus can <em>see</em> is different from what it has the authority and capacity to <em>change</em>.</p><div class="actions"><button class="primary" data-action="resolve">See Arthur’s full outcome</button><button class="secondary" data-action="back-beat">Back to the changed clinical plan</button></div></section>`,4);
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
 const title=tab==='operations'?'Who makes this model work?':'What must the place make possible?';
 const context=tab==='operations'?'Operational success depends on roles, authority, capacity and coordination—not just choosing a service model.':'The choices imply different adjacencies, circulation, support spaces, room flexibility and infrastructure.';
 app.innerHTML=shell(`<section class="panel"><div class="stage">The Design & Operations Lens · 1 of 2</div><h2>Your design worked. But what did it require?</h2><p class="lede">Arthur’s changed pathway revealed the consequences. Now look beneath the experience to the commitments that would make your future possible.</p><div class="choice-summary">${summary()}</div><div class="lens-tabs" role="group" aria-label="Choose a lens"><button class="${tab==='operations'?'active':''}" data-action="lens-tab" data-tab="operations" aria-pressed="${tab==='operations'}">Operations</button><button class="${tab==='design'?'active':''}" data-action="lens-tab" data-tab="design" aria-pressed="${tab==='design'}">Design</button></div><h3 class="lens-heading">${title}</h3><p class="lede">${context}</p><div class="lens-cards">${values.slice(0,3).map((v,i)=>`<article class="lens-card"><div class="stage">${['Arrival','Care model','Departure'][i]}</div><h3>${escapeHTML(option(state.choices[GAME.decisions[i].id]).name)}</h3><p>${escapeHTML(v)}</p></article>`).join('')}</div><section class="lens-support"><h3>Opening-day trade-offs and partner boundary</h3><p><strong>Operational now:</strong> ${escapeHTML(option(state.choices[state.readiness.priority]).name)}. The two other models are design directions, not fully operational promises.</p><p><strong>${escapeHTML(REGISTRATION[state.readiness.registration].name)}:</strong> ${escapeHTML(tab==='operations'?REGISTRATION[state.readiness.registration].ops:REGISTRATION[state.readiness.registration].place)}</p><p><strong>Unresolved dependency:</strong> an independent specialist must accept the referral; a shared campus does not convey shared clinical or scheduling authority.</p></section><section class="lens-support"><h3>${tab==='operations'?'What information must support action?':'What should remain resilient and adaptable?'}</h3><ul>${(tab==='operations'?d.information:d.foundation).map(v=>`<li>${escapeHTML(v)}</li>`).join('')}</ul></section><p class="decision-prompt">These are <strong>visioning implications</strong>, not confirmed ACHC service policies, room requirements or technology selections.</p><div class="actions"><button class="primary" data-action="go-commit">Choose a design commitment</button><button class="secondary" data-action="lens-back">Back to Arthur’s disruption</button></div></section>`,5);
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
 state.commitment={id:chosen.value,category:category.value};state.screen='result';
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
 const p=playState(),t=totals(),b=GAME.budgets,d=designOutput();
 if(!state.commitment || !commitmentOptions().some(x=>x.id===state.commitment.id)){state.screen='commit';save();return render();}
 const selection=commitmentOptions().find(x=>x.id===state.commitment.id);
 const categoryLabel={enable:'Enable now',coordinate:'Coordinate across services',preserve:'Preserve for the future'}[state.commitment.category];
 app.innerHTML=shell(`<section class="panel"><div class="stage">Arthur’s reveal · Single-player v0.5</div><h2>${escapeHTML(p.headline)}</h2><p class="lede">No single total score defines whether Arthur’s day succeeded. Here is what your decisions enabled—and where they created dependencies.</p><div class="choice-summary">${summary()}</div><p><strong>Operational at opening:</strong> ${escapeHTML(option(state.strengthened).name)} · <strong>Registration:</strong> ${escapeHTML(REGISTRATION[state.readiness.registration].name)} · <strong>Resources:</strong> Capital ${t.capital}/${b.capital} · Change ${t.change}/${b.change} · Operations ${t.operations}/${b.operations}</p><h3>Five moments of Arthur’s day, including the independent partner</h3><div class="moment-grid">${p.moments.map(momentCard).join('')}</div><section class="commitment-result"><div class="stage">Your ACHC commitment</div><h3>${escapeHTML(selection.title)}</h3><p>${escapeHTML(selection.detail)}</p><strong>${escapeHTML(categoryLabel)}</strong><p><small>Operational implication:</small> ${escapeHTML(selection.operations)}</p><p><small>Physical design implication:</small> ${escapeHTML(selection.place)}</p></section><section class="workshop-output"><div class="stage">From experience to an ACHC design decision</div><h2 class="output-heading">What must the campus enable?</h2><p>This is a discussion brief derived from your portfolio—not a room list, approved operating model, or technology specification.</p><div class="implication-grid">${implications('Operations · roles and authority',d.operations)}${implications('Place · spatial and environmental design',d.place)}${implications('Information · handoffs and context',d.information)}${implications('Foundation · resilience and flexibility',d.foundation)}</div><div class="decision-prompt"><strong>Workshop question:</strong> Which of these must be built into ACHC now, which depend on enterprise/partner agreements, and which should remain adaptable?</div></section><details class="score-details"><summary>View underlying capability scores (optional)</summary><p class="small">Comparative indicators, not a clinical success or safety rating.</p><div class="scoregrid">${GAME.dimensions.map((x,i)=>`<div class="score"><div class="scorehead"><span>${escapeHTML(x)}</span><span>${p.sc[i]} / 3</span></div><div class="meter"><span style="width:${p.sc[i]/3*100}%"></span></div></div>`).join('')}</div></details><div class="actions"><button class="primary" data-action="restart">Play again</button><button class="secondary" data-action="go-commit">Change commitment</button><button class="secondary" data-action="go-lens">Review Design & Operations</button><button class="secondary" data-action="edit-readiness">Change opening-day priority</button><button class="secondary" data-action="back" data-step="3">Change departure decision</button><button class="secondary" data-action="review">Rebuild the whole design</button><button class="ghost" data-action="copy-brief">Copy design brief</button></div><div id="msg" class="error" aria-live="polite"></div></section>`,5);
}
function copyBrief(){
 const p=playState(),d=designOutput();const lines=[`Arthur · Care Well — ${CFG.gameVersion||'v0.5'}`, ...GAME.decisions.map(x=>`${x.title}: ${option(state.choices[x.id]).name}`),`Operational at opening: ${option(state.strengthened).name}`,`Registration: ${REGISTRATION[state.readiness.registration].name}`,`Registration trade-off: ${REGISTRATION[state.readiness.registration].cost}`,'',...p.moments.map(m=>`${m.key.toUpperCase()} — ${m.status}: ${m.title}. ${m.detail} Design insight: ${m.why}`),'',...Object.entries(d).flatMap(([k,v])=>[k.toUpperCase(),...v.map(x=>`- ${x}`),''])];
 const selected=state.commitment?commitmentOptions().find(x=>x.id===state.commitment.id):null;
 if(selected)lines.push('ACHC COMMITMENT',selected.title,selected.detail,'Category: '+({enable:'Enable now',coordinate:'Coordinate across services',preserve:'Preserve for the future'}[state.commitment.category]),'Operations: '+selected.operations,'Place: '+selected.place);
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
    case 'choose':choose(btn.dataset.decision,btn.dataset.option);break;
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
    case 'restart':restart();break;
    case 'review':review();break;
  }
});
// A saved unfinished game resumes on refresh; a finished game remains reviewable.
render();
