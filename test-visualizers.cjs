const {chromium}=require('playwright');
const assert=require('node:assert/strict');const path=require('node:path');const {pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(__dirname,'dashboard.html')).href);
 console.log('Loaded',await page.locator('.subtopic-link').count(),'lessons');
 const lessons=await page.evaluate(()=>Object.values(AlgoLessonById).map(l=>({id:l.id,view:l.view})));
 for(const lesson of lessons){
  await page.evaluate(id=>document.querySelector('.subtopic-link[data-algo="'+id+'"]').click(),lesson.id);
  assert.equal(await page.locator('#vizPlay').isDisabled(),false);
  assert.equal(await page.locator('#lessonError').textContent(),'');
  await page.evaluate(()=>{document.getElementById('vizStep').click();const total=Number(document.getElementById('stepTotal').textContent);if(total>2000)throw new Error('Too many steps');for(let i=1;i<total;i++)document.getElementById('vizStep').click();});
  assert.equal(await page.locator('#stepCurrent').textContent(),await page.locator('#stepTotal').textContent());
  assert.ok((await page.locator('#stepNarration').textContent()).length>0);
  assert.equal(await page.locator('#lessonGuide li').count(),3);
  await page.locator('#vizReset').click();assert.equal(await page.locator('#stepCurrent').textContent(),'0');
 }
 console.log('All 35 visualizers complete through UI; explanations and reset verified');
 await page.evaluate(()=>{document.querySelector('.subtopic-link[data-algo="linear"]').click();document.getElementById('valuesInput').value='3, 2, 1';document.getElementById('searchTarget').value='99';document.getElementById('applyExample').click();const speed=document.getElementById('speedSlider');speed.value='100';speed.dispatchEvent(new Event('input'));document.getElementById('vizPlay').click();});
 await page.waitForFunction(()=>document.getElementById('infoStatus').textContent.includes('Completed'));
 assert.match(await page.locator('#stepNarration').textContent(),/not found/);
 await page.evaluate(()=>{document.querySelector('.subtopic-link[data-algo="priority"]').click();document.getElementById('vizPlay').click();document.getElementById('vizPause').click();});
 const pausedStep=await page.locator('#stepCurrent').textContent();await page.waitForTimeout(200);assert.equal(await page.locator('#stepCurrent').textContent(),pausedStep);
 await page.evaluate(()=>document.getElementById('vizPlay').click());await page.waitForFunction(()=>document.getElementById('infoStatus').textContent.includes('Completed'));
 assert.match(await page.locator('#stepNarration').textContent(),/priority order/);
 console.log('Automatic playback, pause and resume checks passed');
 await page.evaluate(()=>document.querySelector('.subtopic-link[data-algo="bubble"]').click());
 await page.locator('#valuesInput').fill('3, 2, 1');await page.locator('#applyExample').click();await page.locator('#vizStep').click();await page.locator('#vizStep').click();
 assert.equal(await page.locator('#infoSwaps').textContent(),'2');
 await page.locator('#valuesInput').fill('invalid');await page.locator('#applyExample').click();assert.ok((await page.locator('#lessonError').textContent()).length>0);
 await page.evaluate(()=>document.querySelector('.subtopic-link[data-algo="topological"]').click());await page.locator('#graphInput').fill('0-1,1-0');await page.locator('#applyExample').click();await page.locator('#vizStep').click();await page.locator('#vizStep').click();assert.match(await page.locator('#stepNarration').textContent(),/Cycle detected/);
 await page.setViewportSize({width:390,height:844});
 for(const id of ['stack','singly','avl','dijkstra','fibonacci','knapsack','hash_chaining','radix']){await page.evaluate(id=>{document.querySelector('.subtopic-link[data-algo="'+id+'"]').click();document.getElementById('vizStep').click();},id);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Overflow '+id);await page.screenshot({path:path.join(require('node:os').tmpdir(),'dsa-'+id+'.png'),fullPage:true});}
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>{document.querySelector('.subtopic-link[data-algo="avl"]').click();const b=document.getElementById('vizStep');b.click();b.click();b.click();});await page.screenshot({path:path.join(require('node:os').tmpdir(),'dsa-desktop.png'),fullPage:true});
 assert.deepEqual(errors,[]);console.log('Counters, validation, cycle detection, mobile overflow and page-error checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
