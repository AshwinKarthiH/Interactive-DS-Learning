/* Same-origin Spring Boot API. file:// keeps the standalone teaching demo available. */
(() => {
 'use strict';
 const enabled=location.protocol==='http:'||location.protocol==='https:';
 if(enabled&&/\/(dashboard|admin)\.html$/.test(location.pathname))document.body.classList.add('backend-loading');
 const cache=new Map(),pending=new Map(),timers=new Map();let csrf='',user=null;
 const API=globalThis.AlgoAPI={enabled,cache,pending,user:null,notes:[],progress:null};
 API.status=function(message,error=false){let el=document.getElementById('syncStatus');if(!el){el=document.createElement('p');el.id='syncStatus';el.setAttribute('role','status');el.className='demo-notice';document.body.prepend(el);}el.textContent=message;if(error){const b=document.createElement('button');b.textContent='Retry';b.type='button';b.onclick=()=>pending.size?API.flush():location.reload();el.append(' ',b);}el.dataset.error=String(error);};
 API.request=async function(url,options={}){const headers={'Content-Type':'application/json','X-Algoverse-Request':'1',...(csrf?{'X-CSRF-Token':csrf}:{}),...options.headers};const response=await fetch('/api'+url,{credentials:'same-origin',signal:AbortSignal.timeout(20000),...options,headers});let body;try{body=await response.json();}catch{throw new Error('The backend returned an invalid response.');}if(!response.ok)throw Object.assign(new Error(body.error||'Request failed.'),{status:response.status});if(body.csrf)csrf=body.csrf;return body;};
 API.auth=async function(kind,body){const answer=await API.request('/auth/'+kind,{method:'POST',body:JSON.stringify(body)});API.user=user=answer.user;cache.set('algoverse_user',user);return user;};
 API.logout=async function(){if(pending.size)await API.flush();if(pending.size)throw new Error('Some changes could not be saved. Retry saving before signing out.');await API.request('/auth/logout',{method:'POST',body:'{}'});cache.clear();location.href='index.html';};
 API.queue=function(key,url,body){pending.set(key,{url,body});clearTimeout(timers.get(key));API.status('Saving to MongoDB…');timers.set(key,setTimeout(()=>API.flush(),650));};
 let saving=false;
 API.flush=async function(){if(saving)return;saving=true;try{let learning=false;for(const [key,item] of pending){await API.request(item.url,{method:'PUT',body:JSON.stringify(item.body)});if(item.url.startsWith('/progress/'))learning=true;if(pending.get(key)===item)pending.delete(key);}if(learning)await API.refresh();if(pending.size)setTimeout(()=>API.flush(),100);else API.status('Connected • Changes saved to MongoDB');}catch(e){API.status('Changes have not been saved: '+e.message,true);}finally{saving=false;}};
 API.refresh=async function(){API.progress=await API.request('/progress');const key='algoverse_progress_'+user.email;cache.set(key,Object.fromEntries(API.progress.solved.map(id=>[id,{solved:true}])));document.dispatchEvent(new CustomEvent('algo-progress',{detail:API.progress}));};
 API.escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 API.ready=enabled?new Promise(resolve=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',resolve,{once:true});else resolve();}).then(async()=>{
  try{const answer=await API.request('/auth/me');API.user=user=answer.user;cache.set('algoverse_user',user);}catch(e){if(e.status===401){if(!location.pathname.endsWith('index.html')&&location.pathname!=='/')location.href='index.html';return;}API.status('Backend connection failed: '+e.message,true);throw e;}
  if(user&&location.pathname.endsWith('dashboard.html')){
   const [problems,lessons,drafts,notes,settings]=await Promise.all([API.request('/problems'),API.request('/lessons'),API.request('/drafts'),API.request('/notes'),API.request('/settings/public')]);API.settings=settings;
   globalThis.AlgoProblems=problems.map(p=>{const original=globalThis.AlgoProblems?.find(x=>x.id===p.id);return{...original,...p,testCases:p.sampleTests.map(t=>({input:JSON.stringify(t.args),expected:JSON.stringify(t.expected),run:fn=>fn(...structuredClone(t.args))}))};});
   const list=document.querySelector('.problems-list');if(list)list.innerHTML=problems.map(p=>`<div class="problem-card" data-problem="${API.escape(p.id)}" data-difficulty="${API.escape(p.difficulty.toLowerCase())}"><div class="problem-status">○</div><div class="problem-info"><h4>${API.escape(p.number)}. ${API.escape(p.title)}</h4><p>${API.escape(p.tags.join(' • '))}</p></div><span class="difficulty-badge ${API.escape(p.difficulty.toLowerCase())}">${API.escape(p.difficulty)}</span><button class="problem-action" data-problem="${API.escape(p.id)}">Solve →</button></div>`).join('');
   for(const l of lessons){const original=globalThis.AlgoLessonById?.[l.id];if(original){original.name=l.title;original.desc=l.summary;original.guide=l.steps;}}
   API.activeLessons=new Set(lessons.map(l=>l.id));API.notes=notes.operations;
   for(const d of drafts)cache.set('algoverse_progress_'+user.email+'_draft_'+d.problemId+'_'+d.language,d.code);
   await API.refresh();API.status('Connected • Progress, drafts and notes saved to MongoDB');
  }
 }).then(()=>{document.body.classList.remove('backend-loading');}).catch(error=>{API.status('Backend connection failed: '+error.message,true);throw error;}):Promise.resolve();
 if(enabled)API.ready.catch(()=>{});
 window.addEventListener('beforeunload',e=>{if(pending.size){e.preventDefault();e.returnValue='';}});
})();
