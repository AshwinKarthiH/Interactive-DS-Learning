const{chromium}=require('playwright');const assert=require('node:assert/strict');const path=require('node:path');const{pathToFileURL}=require('node:url');
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});try{const p=await browser.newPage({viewport:{width:1600,height:1000},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.addInitScript(()=>localStorage.setItem('algoverse_theme','"light"'));await p.goto(pathToFileURL(path.join(__dirname,'dashboard.html')).href);
 assert.equal(await p.locator('#themeBtn').count(),0);assert.equal(await p.locator('body').evaluate(e=>e.classList.contains('light-mode')),false);assert.equal(await p.evaluate(()=>localStorage.getItem('algoverse_theme')),null);
 const result=await p.evaluate(()=>{
  const languages=['javascript','python','c','cpp','java'];let checks=0;
  for(const id of Object.keys(AlgoLessonById)){
   document.querySelector('.subtopic-link[data-algo="'+id+'"]').click();document.getElementById('vizStep').click();
   const total=Number(document.getElementById('stepTotal').textContent);
   for(const index of [1,Math.max(1,Math.floor(total/2)),total]){
    const timeline=document.getElementById('vizTimeline');timeline.value=index;timeline.dispatchEvent(new Event('input'));
    const before=document.getElementById('vizBars').textContent;
    for(const language of languages){const picker=document.getElementById('codeView');picker.value=language;picker.dispatchEvent(new Event('change'));
     if(document.querySelectorAll('.code-active').length!==1)throw new Error(id+'/'+language+' missing highlight');
     if(document.getElementById('vizBars').textContent!==before)throw new Error('Language switch changed diagram');
     if(Number(document.getElementById('stepCurrent').textContent)!==index)throw new Error('Language switch changed step');
     const text=document.getElementById('lessonCode').textContent;if(language==='python'&&!text.includes('def '))throw new Error('Missing Python code');
     if(language==='java'&&!text.includes('static '))throw new Error('Missing Java code');
     checks++;
    }
   }
  }
  return {checks,combinations:Object.keys(AlgoLessonById).length*languages.length};
 });console.log(result.combinations+' language/lesson combinations and '+result.checks+' synchronized snapshots passed');
 await p.evaluate(()=>{document.querySelector('.subtopic-link[data-algo="bubble"]').click();document.getElementById('codeView').value='python';document.getElementById('codeView').dispatchEvent(new Event('change'));document.getElementById('vizStep').click();document.getElementById('vizStep').click();scrollTo(0,0);});await p.screenshot({path:path.join(require('node:os').tmpdir(),'algoverse-language-preview.png'),fullPage:true});
 await p.setViewportSize({width:390,height:844});for(const language of ['python','c','cpp','java']){await p.selectOption('#codeView',language);assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
 assert.deepEqual(errors,[]);console.log('Saved light preference removed; no toggle; mobile layout and no page errors passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
