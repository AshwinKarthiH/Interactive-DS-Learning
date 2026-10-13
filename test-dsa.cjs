const assert=require('node:assert/strict');
require('./algorithm-core.js');require('./lessons.js');require('./dsa-core.js');
let count=0;
const check=(condition,message)=>{assert.ok(condition,message);count++;};
const last=(id,a,o)=>AlgoDSA.generate(id,a,o).at(-1);
for(const input of [[],[4],[1,2,3],[3,2,1],[7,7,3],[9,-2,0,-4],Array.from({length:25},(_,i)=>(i*7)%23)]) {
 for(const id of ['bubble','selection','insertion','merge','quick']) {assert.deepEqual(last(id,input).array,[...input].sort((a,b)=>a-b));count++;}
 if(input.every(v=>v>=0)){assert.deepEqual(last('radix',input).array,[...input].sort((a,b)=>a-b));count++;}
 for(const id of ['bst','avl','redblack']) {
  const root=last(id,input,{target:99}).state.root;
  function validate(n,lo=-Infinity,hi=Infinity){if(!n)return 0;check(n.value>lo&&n.value<hi,'BST ordering');const left=validate(n.left,lo,n.value),right=validate(n.right,n.value,hi);if(id==='avl'){check(Math.abs(left-right)<=1,'AVL balance');check(n.height===1+Math.max(left,right),'AVL height');}return 1+Math.max(left,right);}
  validate(root);
  if(id==='redblack') {
   check(!root||root.color==='black','Black root');
   function blackHeight(n){if(!n)return 1;if(n.color==='red')check(n.left?.color!=='red'&&n.right?.color!=='red','No adjacent reds');check(n.right?.color!=='red','No right leaning red');const l=blackHeight(n.left),r=blackHeight(n.right);check(l===r,'Equal black heights');return l+(n.color==='black'?1:0);}blackHeight(root);
  }
 }
 for(const id of ['priority','heap']) {
  const steps=AlgoDSA.generate(id,input);
  const final=steps.at(-1);
  if(id==='priority'){assert.deepEqual(final.state.removed,[...input].sort((a,b)=>a-b));count++;}
  else final.array.forEach((v,i)=>{if(i)check(final.array[Math.floor((i-1)/2)]<=v,'Min heap order');});
 }
 const stack=last('stack',input);assert.deepEqual(stack.state.removed,[...input].reverse());count++;
 const queue=last('queue',input);assert.deepEqual(queue.state.removed,input);count++;
 for(const id of ['singly','doubly','circular']) {assert.deepEqual(last(id,input).array,input);count++;}
 for(const id of ['hash_chaining','hash_probing','hashset']) {const end=last(id,input,{target:input[0]??99});check(end.state.found===(input.length>0),'Hash membership');assert.deepEqual(end.state.buckets.flat().sort((a,b)=>a-b),[...new Set(input)].sort((a,b)=>a-b));count++;}
}
// Many deterministic insertion orders catch subtle rotation/color bugs.
for(let seed=1;seed<=40;seed++) {
 const a=Array.from({length:20},(_,i)=>(i*seed*13+seed*7)%97);
 for(const id of ['avl','redblack']) {
  const root=last(id,a).state.root;
  function visit(n,lo=-Infinity,hi=Infinity){if(!n)return {height:0,black:1};check(n.value>lo&&n.value<hi,'Ordered balanced tree');const l=visit(n.left,lo,n.value),r=visit(n.right,n.value,hi);if(id==='avl')check(Math.abs(l.height-r.height)<=1,'AVL invariant');else {check(l.black===r.black,'Red-black black-height invariant');check(n.right?.color!=='red','Left leaning red links');if(n.color==='red')check(n.left?.color!=='red','No red-red link');}return {height:1+Math.max(l.height,r.height),black:l.black+(n.color==='black'?1:0)};}visit(root);check(id!=='redblack'||root.color==='black','Root black');
 }
}
check(last('hash_chaining',[7,7,14],{target:7}).state.entries[7]===2,'Map updates duplicate key counts');
check(last('hash_probing',[7,7,14],{target:7}).state.entries[7]===2,'Probing map updates counts');
const graph=AlgoDSA.defaultGraph();
assert.deepEqual(last('dijkstra',[],{target:0,graph}).state.distance,{0:0,1:3,2:2,3:8,4:10,5:13});count++;
assert.deepEqual(last('bfs_graph',[],{target:0,graph}).state.visited,[0,1,2,3,4,5]);count++;
check(new Set(last('dfs_graph',[],{target:0,graph}).state.visited).size===6,'DFS no repeated nodes');
const dag=AlgoDSA.defaultGraph(true),topo=last('topological',[],{graph:dag,target:999}).state;
check(!topo.cycle,'DAG accepted');for(const e of dag.edges)check(topo.visited.indexOf(e.from)<topo.visited.indexOf(e.to),'Topological edge ordering');
check(last('topological',[],{graph:AlgoDSA.parseGraph('0-1,1-0')}).state.cycle,'Cycle detected');
check(last('dijkstra',[],{target:0,graph:AlgoDSA.parseGraph('0-1:2, 2')}).state.distance[2]==='∞','Unreachable distance');
for(let n=0;n<=20;n++){let a=0,b=1;for(let i=0;i<n;i++){[a,b]=[b,a+b];}for(const id of ['fibonacci','memoization'])check(last(id,[],{target:n}).state.result===a,'Fibonacci value');}
check(last('knapsack',[6,10,12],{target:5}).state.result===22,'Knapsack optimum');
check(last('knapsack',[6,10,12],{target:0}).state.result===0,'Zero capacity');
check(last('sliding',[1,2,3,4],{target:2}).state.best===7,'Window optimum');
check(last('sliding',[-1,-2,-3],{target:2}).state.best===-3,'Negative window optimum');
check(last('two_pointer',[1,3,5,8],{target:9}).state.found!==null,'Pair found');
check(last('two_pointer',[1,3,5,8],{target:99}).state.found===null,'Pair absent');
check(last('reverse_string',[],{text:'a🙂b'}).state.chars.join('')==='b🙂a','Unicode reversal');
check(last('reverse_string',[],{text:''}).state.chars.length===0,'Empty string');
for(const [id,o] of [['sliding',{target:0}],['radix',{}],['fibonacci',{target:21}],['hashset',{target:1.2}]]){assert.throws(()=>AlgoDSA.generate(id,[-1,2],o));count++;}
assert.throws(()=>AlgoDSA.parseGraph('bad graph'));count++;
for(const lesson of Object.values(AlgoLessonById)) {
 const target=lesson.view==='graph'?0:lesson.id==='sliding'?2:lesson.id==='knapsack'?5:8;
 const steps=AlgoDSA.generate(lesson.id,[3,1,2],{target,text:'ABC'});
 check(steps.length>0&&steps.at(-1).kind==='done',lesson.id+' completes');
 check(steps.every(s=>typeof s.message==='string'&&s.message.length>0),lesson.id+' explains each step');
 check(lesson.guide.length===3&&lesson.analogy&&lesson.desc&&lesson.use,lesson.id+' has beginner lesson');
}
console.log(`${count} DSA checks passed across ${Object.keys(AlgoLessonById).length} visualizers`);
