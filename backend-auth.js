(() => {
 if(!AlgoAPI.enabled)return;
 document.getElementById('statTopics').textContent='8';document.getElementById('statLearners').textContent='5';document.querySelector('#statLearners + .stat-label').textContent='Language options';
 const featureCopy=document.querySelectorAll('.feature-card p');if(featureCopy[2])featureCopy[2].textContent='Practice in JavaScript, Python, C, C++ or Java. Each language shows its execution readiness.';if(featureCopy[3])featureCopy[3].textContent='Save solved problems, editor drafts and learning progress across devices.';
 const form=document.getElementById('authForm');if(!form)return;
 let mode='login';
 document.querySelector('.auth-title').textContent='Welcome to AlgoVerse';
 document.querySelector('.auth-desc').textContent='Sign in to save your learning across devices.';
 document.querySelector('.auth-card .demo-notice').textContent='Your account, progress, drafts and notes are stored in MongoDB.';
 document.querySelector('.auth-tabs').hidden=true;document.querySelector('.demo-logins').hidden=true;
 document.querySelector('.auth-divider').hidden=true;
 const social=document.querySelector('.auth-card p:last-child');if(social?.textContent.includes('Social'))social.hidden=true;
 form.innerHTML=`<div class="form-group" id="registerName" hidden><label for="nameInput">Name</label><input id="nameInput" maxlength="80" autocomplete="name"></div><div class="form-group"><label for="emailInput">Email</label><input id="emailInput" type="email" required maxlength="254" autocomplete="username"></div><div class="form-group"><label for="passwordInput">Password</label><input id="passwordInput" type="password" required minlength="10" maxlength="64" autocomplete="current-password"></div><p id="authError" role="alert"></p><button type="submit" class="auth-submit">Sign in</button><button type="button" class="demo-login-btn" id="authMode">Create an account</button>`;
 document.getElementById('authMode').onclick=()=>{mode=mode==='login'?'register':'login';document.getElementById('registerName').hidden=mode==='login';document.getElementById('nameInput').required=mode==='register';document.getElementById('passwordInput').autocomplete=mode==='register'?'new-password':'current-password';form.querySelector('[type=submit]').textContent=mode==='login'?'Sign in':'Create account';document.getElementById('authMode').textContent=mode==='login'?'Create an account':'Already have an account? Sign in';};
 form.addEventListener('submit',async e=>{e.preventDefault();e.stopImmediatePropagation();const b=form.querySelector('[type=submit]');b.disabled=true;document.getElementById('authError').textContent='';try{const body={email:document.getElementById('emailInput').value,password:document.getElementById('passwordInput').value};if(mode==='register')body.name=document.getElementById('nameInput').value;const u=await AlgoAPI.auth(mode,body);location.href=u.role==='admin'?'admin.html':'dashboard.html';}catch(err){document.getElementById('authError').textContent=err.message;}finally{b.disabled=false;}},true);
})();
