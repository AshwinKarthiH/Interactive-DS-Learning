const assert=require('node:assert/strict');const fs=require('node:fs');require('./algorithm-core.js');require('./lessons.js');require('./dsa-core.js');require('./multilingual-code.js');require('./lesson-code.js');let checks=0;
for(const id of Object.keys(AlgoLessonById)) {
 const options={target:AlgoLessonById[id].view==='graph'?0:id==='sliding'?2:id==='knapsack'?5:8,text:'ABC'};
 const steps=AlgoDSA.generate(id,[3,7,1,7],options);
 for(const language of ['javascript','python','c','cpp','java']) {
  const entry=AlgoCode.entry(id,language);assert.ok(entry.source&&entry.lines.length&&entry.tags.done);checks++;
  for(const step of steps){const line=AlgoCode.line(id,step,language);assert.ok(line>=1&&line<=entry.lines.length,id+'/'+language);checks++;}
  if(language==='java'){assert.ok(!/calloc|sizeof|\bNULL\b|\w+\[\d+\]\s*=\s*\{0\}/.test(entry.source));checks++;}
  if(language==='python'){assert.match(entry.source,/^def /);checks++;}
  if(language!=='javascript'){assert.ok(fs.existsSync(__dirname+'/'+entry.sourceUrl));checks++;}
 }
}
const duplicate=AlgoDSA.generate('hashset',[7,7],{target:7}).find(s=>s.message.includes('already exists'));
for(const language of ['javascript','python','c','cpp','java']){assert.equal(AlgoCode.line('hashset',duplicate,language),AlgoCode.entry('hashset',language).tags.duplicate);checks++;}
assert.ok(!fs.readFileSync(__dirname+'/dashboard.html','utf8').includes('id="themeBtn"'));assert.ok(!fs.readFileSync(__dirname+'/dashboard.css','utf8').includes('light-mode'));checks+=2;
console.log(`${checks} multilingual catalog and highlight checks passed across 175 language/lesson combinations`);
