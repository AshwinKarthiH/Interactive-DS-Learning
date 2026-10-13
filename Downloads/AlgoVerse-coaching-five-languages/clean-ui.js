(async()=>{
 'use strict';
 if(globalThis.AlgoAPI?.enabled){try{await AlgoAPI.ready;}catch{return;}}
 function disclosure(element,title,className='ui-disclosure'){
  if(!element||element.parentElement.classList.contains(className))return;
  const details=document.createElement('details');details.className=className;const summary=document.createElement('summary');summary.textContent=title;element.before(details);details.append(summary,element);return details;
 }
 const dashboard=document.getElementById('pageDashboard');
 function organizeDashboard(){
  if(!dashboard)return;const stats=dashboard.querySelector('.stats-grid'),roadmap=document.getElementById('learningRoadmap');if(stats&&roadmap&&stats.nextElementSibling!==roadmap)stats.after(roadmap);
  const account=dashboard.querySelector('#profileForm')?.closest('.dash-card');if(account&&!account.closest('.account-settings')){const details=disclosure(account,'Account settings','account-settings');details.classList.add('dash-card');account.classList.remove('dash-card');account.classList.add('account-body');}
  const recentLink=dashboard.querySelector('.dash-card-link');if(recentLink&&!recentLink.dataset.uiBound){recentLink.dataset.uiBound='true';recentLink.addEventListener('click',event=>{event.preventDefault();document.getElementById('navProgress')?.click();});}
 }
 organizeDashboard();if(dashboard)new MutationObserver(()=>organizeDashboard()).observe(dashboard,{childList:true});
 const inspector=document.querySelector('.inspector-panel');if(inspector){const wrapper=disclosure(inspector,'Inspect variables','inspector-disclosure');wrapper.classList.add('studio-panel');inspector.classList.remove('studio-panel');}
 const examples=document.getElementById('solverExamples');if(examples)disclosure(examples,'Examples').open=true;
 const constraints=document.getElementById('solverConstraints');if(constraints){const parent=constraints.parentElement;if(parent.tagName==='DIV')disclosure(parent,'Constraints');else disclosure(constraints,'Constraints');}
 const practice=document.getElementById('pagePractice'),solver=document.getElementById('practiceSolverView');
 function focusPractice(){if(practice&&solver)practice.classList.toggle('practice-focused',solver.style.display!=='none'&&solver.style.display!=='');}
 if(solver)new MutationObserver(focusPractice).observe(solver,{attributes:true,attributeFilter:['style']});focusPractice();
 document.addEventListener('algo-problem',()=>queueMicrotask(()=>{document.querySelector('#solverTags .tag')?.removeAttribute('hidden');const tags=document.querySelectorAll('#solverTags .tag');for(const tag of tags)tag.hidden=tag.textContent.startsWith('LeetCode #');}));
 const success=document.querySelector('.submit-success-banner .success-info p');if(success)success.textContent='All selected tests passed. Your progress has been saved.';
 const profileRole=document.querySelector('.sidebar-footer .user-role');if(profileRole&&globalThis.AlgoAPI?.user)profileRole.textContent=AlgoAPI.user.role==='admin'?'Administrator':'Student';
 const status=document.getElementById('syncStatus');if(status){let quietTimer;const showStatus=()=>{clearTimeout(quietTimer);status.classList.remove('ui-status-quiet');if(status.dataset.error!=='true'&&status.textContent.startsWith('Connected'))quietTimer=setTimeout(()=>status.classList.add('ui-status-quiet'),3500);};new MutationObserver(showStatus).observe(status,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['data-error']});showStatus();}
 const sidebar=document.getElementById('sidebar'),menu=document.getElementById('topbarMenu');if(sidebar&&menu){const backdrop=document.createElement('button');backdrop.className='ui-nav-backdrop';backdrop.setAttribute('aria-label','Close navigation');backdrop.hidden=true;document.body.append(backdrop);const sync=()=>{backdrop.hidden=!(innerWidth<=768&&sidebar.classList.contains('open'));menu.setAttribute('aria-expanded',String(!backdrop.hidden));};function close(){sidebar.classList.remove('open');sync();menu.focus();}backdrop.addEventListener('click',close);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!backdrop.hidden)close();});new MutationObserver(sync).observe(sidebar,{attributes:true,attributeFilter:['class']});window.addEventListener('resize',sync);sync();}
 function searchableLists(){for(const [id,label] of [['pageContent','Find a lesson'],['pageQuizzes','Find a practice problem']]){const page=document.getElementById(id);if(!page||page.querySelector('.ui-list-search')||!page.querySelector('.backend-item'))continue;const controls=document.createElement('label');controls.className='ui-list-search';const field=document.createElement('input');field.type='search';field.placeholder=label;field.setAttribute('aria-label',label);const count=document.createElement('small');controls.append(field,count);const cards=[...page.children].filter(x=>x.classList.contains('backend-item'));const update=()=>{let visible=0;for(const card of cards){const show=card.querySelector('h3').textContent.toLowerCase().includes(field.value.toLowerCase());card.hidden=!show;if(show)visible++;}count.textContent=visible+' of '+cards.length;};field.addEventListener('input',update);page.querySelector('h1').after(controls);update();}}
 searchableLists();document.addEventListener('algo-admin-loaded',searchableLists);
})();
