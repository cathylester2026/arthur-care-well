/* Visual Design Moment UI. All content is hypothetical workshop guidance, not approved ACHC requirements. */
let momentView={moment:'access',choice:0,tab:'arch',step:'explore'};
const momentById=id=>(window.ARTHUR_MOMENTS||[]).find(m=>m.id===id);
const MOMENT_TABS={arch:'Architecture',plan:'Functional planning',eng:'Engineering'};
function designSketch(theme,selected=0,large=false){
 const coords={entry:[[46,72],[165,72],[286,72]],diagnostics:[[46,72],[165,72],[286,72]],virtual:[[46,72],[165,72],[286,72]],work:[[46,72],[165,72],[286,72]],operations:[[46,72],[165,72],[286,72]],rooms:[[46,72],[165,72],[286,72]]};
 const labels={entry:['ENTRY','WELCOME','SERVICES'],diagnostics:['ARRIVAL','DIAGNOSTICS','NEXT CARE'],virtual:['HOME','CAMPUS','PARTNER'],work:['CLINIC','TEAM','ACTION'],operations:['SIGNALS','DECISIONS','RESPONSE'],rooms:['CONSULT','HYBRID','SPECIALTY']};
 const name=labels[theme]||labels.entry;
 const colors=['#3f8d87','#cd8f60','#5572a0'];const accent=colors[selected%3];
 let links= selected===0?'<path d="M85 72H126 M204 72H246"/>':selected===1?'<path d="M85 72Q165 18 246 72 M85 72Q165 126 246 72"/>':'<path d="M85 72H246 M165 54V20 M165 90V123"/>';
 let extra=selected===2?'<circle cx="165" cy="20" r="7"/><circle cx="165" cy="123" r="7"/>':'';
 const blocks=coords[theme].map(([x,y],i)=>`<rect x="${x-39}" y="${y-18}" width="78" height="36" rx="10" fill="${i===1?accent:'#e9f3ee'}" stroke="${accent}" stroke-width="1.5"/><text x="${x}" y="${y+3}" font-size="${name[i].length>10?8:9.5}" text-anchor="middle" font-weight="750" fill="${i===1?'#fff':'#173b31'}">${name[i]}</text>`).join('');
 return `<svg class="design-sketch ${large?'large':''}" viewBox="0 0 332 144" role="img" aria-label="Conceptual flow diagram showing ${escapeHTML(name.join(' to '))}"><g fill="none" stroke="${accent}" stroke-width="2.5" stroke-dasharray="5 5">${links}${extra}</g>${blocks}</svg>`;
}
// Contextual architectural imagery derived from the user's ACHC visioning presentation.
// Illustrated possibilities, not approved layouts, registration models, or clinical rooms.
function designScene(id,index,variant='card'){
 const allowed=['access','connected','distributed','work','operations','adapt'];
 const safe=allowed.includes(id)?id:'access';
 const n=Math.max(0,Math.min(2,Number(index)||0));
 const m=momentById(safe);
 const alt=`Illustrative ${m?.shift||'ACHC'} scene: ${m?.choices[n]?.title||'future state'}`;
 return `<span class="design-scene ${variant}"><img src="assets/${safe}-${n}.webp" loading="lazy" alt="${escapeHTML(alt)}"><span class="scene-number">${String(n+1).padStart(2,'0')}</span></span>`;
}
function designSceneCallouts(c){
 const short=text=>escapeHTML(text.length>145?text.slice(0,142)+'…':text);
 return `<div class="scene-callouts" aria-label="Key design considerations"><div><span>ARCHITECTURE</span><p>${short(c.arch)}</p></div><div><span>FUNCTIONAL PLANNING</span><p>${short(c.plan)}</p></div><div><span>ENGINEERING</span><p>${short(c.eng)}</p></div></div>`;
}
function showGallery(){let dialog=document.getElementById("moment-dialog");if(!dialog){dialog=document.createElement("dialog");dialog.id="moment-dialog";dialog.className="moment-dialog";app.appendChild(dialog);}dialog.innerHTML=`<div class="moment-modal-content"><div class="moment-topline"><span class="stage">The future-ready campus</span><button class="moment-close" data-action="close-moment" aria-label="Close">×</button></div>${momentOverview()}<button class="secondary" data-action="close-moment">Return to Arthur</button></div>`;if(typeof dialog.showModal==="function"&&!dialog.open)dialog.showModal();else dialog.setAttribute("open","");}
function momentOverview(){return `<section class="futures-overview"><div class="stage">Six shifts · One connected ecosystem</div><h2>Design the connections.</h2><p class="lede">Explore six consequential choices that shape architecture, functional planning, engineering and operations. These are provocations—not approved specifications.</p><div class="future-grid">${window.ARTHUR_MOMENTS.map(m=>`<article class="future-tile"><span class="future-number">${m.number}</span>${designScene(m.id,1,"tile")}<div class="stage">${escapeHTML(m.shift)}</div><h3>${escapeHTML(m.question)}</h3><p>${escapeHTML(m.prompt)}</p><button class="moment-link" data-action="open-moment" data-moment="${m.id}">Explore design futures <span aria-hidden="true">↗</span></button></article>`).join('')}</div></section>`;}
function momentTrigger(mid,label='Learn more · Design Moment',choiceId=''){return `<button class="moment-link" data-action="open-moment" data-moment="${mid}" ${choiceId?`data-choice="${escapeHTML(choiceId)}"`:''}>${escapeHTML(label)} <span aria-hidden="true">↗</span></button>`;}
function showMoment(id,choiceId){const m=momentById(id);if(!m)return;const selected=choiceId?m.choices.findIndex(x=>x.id===choiceId):-1;momentView={moment:id,choice:selected>=0?selected:0,tab:'arch',step:'explore'};let dialog=document.getElementById('moment-dialog');if(!dialog){dialog=document.createElement('dialog');dialog.id='moment-dialog';dialog.className='moment-dialog';app.appendChild(dialog);}renderMomentDialog();if(typeof dialog.showModal==='function'&&!dialog.open)dialog.showModal();else dialog.setAttribute('open','');}
function renderMomentDialog(){
 const dialog=document.getElementById('moment-dialog');if(!dialog)return;
 const m=momentById(momentView.moment);if(!m)return;
 const c=m.choices[momentView.choice];const key=momentView.tab;
 const explore=momentView.step!=='impact';
 const header=`<div class="moment-topline"><span class="stage">Design moment ${m.number} · ${escapeHTML(m.shift)}</span><button class="moment-close" data-action="close-moment" aria-label="Close design moment">×</button></div>`;
 const progress=`<div class="moment-step-track" aria-label="Step ${explore?'1':'2'} of 2"><span class="${explore?'current':'done'}">01 · Explore futures</span><span class="${explore?'':'current'}">02 · Understand impact</span></div>`;
 let main;
 if(explore){
  main=`<div class="moment-view-title"><h2>${escapeHTML(m.question)}</h2><p>${escapeHTML(m.prompt)}</p></div><div class="moment-explore-grid">${m.choices.map((o,i)=>`<button class="moment-option ${i===momentView.choice?'active':''}" data-action="moment-choice" data-index="${i}" aria-pressed="${i===momentView.choice}">${designScene(m.id,i)}<strong>${escapeHTML(o.title)}</strong><small>${escapeHTML(o.short)}</small><span class="moment-selection">${i===momentView.choice?'✓ Selected future':'Select this future'}</span></button>`).join('')}</div><div class="moment-explore-question"><span>THE DESIGN QUESTION</span><p>${escapeHTML(m.prompt)}</p></div>`;
 }else{
  main=`<div class="moment-impact-title"><div><div class="stage">Your selected future</div><h2>${escapeHTML(c.title)}</h2></div><span class="moment-future-pill">Future ${String(momentView.choice+1).padStart(2,'0')}</span></div><div class="moment-impact-image">${designScene(m.id,momentView.choice,'hero')}<span class="moment-image-note">Illustrative future-state concept, not an approved ACHC layout</span></div><div class="moment-gain-trade"><div><span class="moment-mini-label">✓ What this makes possible for Arthur</span><p>${escapeHTML(c.gain)}</p></div><div><span class="moment-mini-label">↗ What ACHC must take on</span><p>${escapeHTML(c.trade)}</p></div></div><div class="moment-compact-design"><div class="moment-design-header"><h3>What changes in the design?</h3><span>Explore one discipline at a time</span></div><div class="moment-tabs" role="group" aria-label="Choose a design discipline">${Object.entries(MOMENT_TABS).map(([id,label])=>`<button data-action="moment-tab" data-tab="${id}" aria-pressed="${id===key}" class="${id===key?'active':''}">${label}</button>`).join('')}</div><div class="moment-discipline moment-one-discipline"><div class="moment-discipline-symbol">${{arch:'⌂',plan:'▦',eng:'⚡'}[key]}</div><p>${escapeHTML(c[key])}</p></div></div><details class="moment-extra"><summary>Opening-day and future-state considerations</summary><div class="moment-phasing"><div><strong>Protect at opening</strong><p>${escapeHTML(c.now)}</p></div><div><strong>Enable as the model evolves</strong><p>${escapeHTML(c.later)}</p></div></div><p class="moment-disclaimer">Visioning hypothesis only; validate project requirements and operating agreements.</p></details>`;
 }
 const footer=explore?`<button class="secondary" data-action="close-moment">Return to Arthur</button><span class="moment-footer-hint">Choose a future to explore</span><button class="primary" data-action="moment-next">Understand the impact →</button>`:`<button class="secondary" data-action="moment-back">← Compare futures</button><span class="moment-footer-hint">${escapeHTML(c.title)}</span><button class="primary" data-action="close-moment">Return to Arthur →</button>`;
 dialog.innerHTML=`<div class="moment-modal-content moment-two-screen">${header}${progress}<div class="moment-screen-content">${main}</div><div class="moment-screen-footer">${footer}</div></div>`;
 const viewport=dialog.querySelector('.moment-screen-content');if(viewport)viewport.scrollTop=0;
}
function momentLinkForChoice(did,oid){const mid=did==='arrival'?'access':did==='care'?'connected':'adapt';const mapping={digital:'federated',legible:'department',human:'central',network:'network',core:'core',comes:'comes',fast:'special',adaptive:'universal',wellness:'modular'};return momentTrigger(mid,'Learn more · Design impact',mapping[oid]||'');}
function selectedFutureStrip(){const a=state.choices.arrival,c=state.choices.care,l=state.choices.leave;return `<div class="future-strip"><div>${investmentScene(a,'strip')}<strong>Arrival</strong>${momentTrigger('access','Explore arrival design')}</div><div>${investmentScene(c,'strip')}<strong>Care</strong>${momentTrigger('connected','Explore care design',c)}</div><div>${investmentScene(l,'strip')}<strong>Transition</strong>${momentTrigger('adapt','Explore adaptable environments')}</div></div>`;}
