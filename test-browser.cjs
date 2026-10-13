const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const base=pathToFileURL(__dirname+require('node:path').sep).href;
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 try {
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'dashboard.html');
  const checks=await page.evaluate(async()=>{
   const good=await AlgoRunner.run('function sum(a,b){return a+b}', 'sum',[{args:[2,3],expected:5}]);
   const bad=await AlgoRunner.run('function sum(a,b){return 0}', 'sum',[{args:[2,3],expected:5}]);
   let timeout=false;try{await AlgoRunner.run('function sum(){while(true){}}','sum',[{args:[],expected:0}],false,500);}catch(e){timeout=e.message.includes('exceeded');}
   const isolation=await AlgoRunner.run('function check(){return [typeof document,typeof localStorage,typeof parent]}','check',[{args:[],expected:['undefined','undefined','undefined']}]);
   let syntax=false;try{await AlgoRunner.run('function sum(}','sum',[{args:[],expected:0}]);}catch {syntax=true;}
   return {good:good.results[0].passed,bad:!bad.results[0].passed,timeout,isolation:isolation.results[0].passed,syntax};
  });
  assert.ok(Object.values(checks).every(Boolean));console.log('Sandbox checks passed',checks);
  await page.evaluate(()=>{document.querySelector('.sidebar-link[data-page="practice"]').click();document.querySelector('.problem-card .problem-action').click();document.getElementById('btnSubmitCode').click();});
  await page.waitForFunction(()=>document.getElementById('testRunStatusText').textContent.includes('sample tests passed'));
  assert.equal(await page.locator('#submitSuccessBanner').evaluate(e=>e.style.display),'flex');
  await page.locator('#codeEditorInput').fill('function twoSum(){return [9,9];}');
  await page.reload();
  await page.evaluate(()=>{document.querySelector('.sidebar-link[data-page="practice"]').click();document.querySelector('.problem-card .problem-action').click();});
  assert.equal(await page.locator('#codeEditorInput').inputValue(),'function twoSum(){return [9,9];}');
  assert.equal(await page.locator('.problem-card').first().locator('.problem-status').textContent(),'✓');
  await page.evaluate(()=>document.getElementById('btnSubmitCode').click());
  await page.waitForFunction(()=>document.getElementById('testRunStatusText').textContent.includes('failed'));
  assert.equal(await page.locator('#submitSuccessBanner').evaluate(e=>e.style.display),'none');
  await page.evaluate(()=>{document.querySelector('.algo-category[data-category="stack"]').click();});
  assert.equal(await page.locator('#vizPlay').isDisabled(),false);
  await page.evaluate(()=>document.getElementById('vizStep').click());
  assert.equal(await page.locator('.dsa-stack .dsa-cell').count(),1);
  await page.evaluate(()=>{document.querySelector('.algo-category[data-category="sorting"]').click();});
  assert.equal(await page.locator('#vizPlay').isDisabled(),false);
  console.log('Practice persistence, failed grading, and stack visualizer checks passed');
  await page.goto(base+'admin.html');
  const before=await page.locator('#usersTable tbody tr').count();
  page.on('dialog',d=>d.accept());
  await page.evaluate(()=>document.querySelector('#usersTable .del').click());
  await page.reload();assert.equal(await page.locator('#usersTable tbody tr').count(),before-1);
  await page.evaluate(()=>{const card=document.querySelector('.settings-card');card.querySelector('input').value='Local Demo';card.querySelector('.btn-save').click();});
  await page.reload();assert.equal(await page.locator('.settings-card input').first().inputValue(),'Local Demo');
  console.log('Admin local persistence checks passed');
  await page.goto(base+'index.html');assert.equal(await page.locator('input[type="password"]').count(),0);
  await page.locator('#nameInput').fill('Test learner');await page.locator('#authForm button').click();
  await page.waitForURL('**/dashboard.html');assert.equal(await page.locator('#welcomeName').textContent(),'Test learner');
  await page.setViewportSize({width:390,height:844});
  for(const file of ['index.html','dashboard.html','admin.html']) {await page.goto(base+file);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth), file+' has mobile overflow');await page.screenshot({path:require('node:os').tmpdir()+'/'+file+'.png',fullPage:true});}
  assert.deepEqual(errors,[]);console.log('Navigation, mobile screenshots, and no page errors passed');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
