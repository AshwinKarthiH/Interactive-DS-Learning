const assert=require('node:assert/strict');require('./algorithm-core.js');require('./lessons.js');require('./dsa-core.js');require('./lesson-code.js');let count=0;
const fn=id=>new Function(AlgoCode.catalog[id].source+'\nreturn '+AlgoCode.catalog[id].functionName+';')();
for(const id of Object.keys(AlgoLessonById)){assert.ok(AlgoCode.catalog[id],id);new Function(AlgoCode.catalog[id].source);count+=2;const options={target: id==='sliding'?2:['fibonacci','memoization'].includes(id)?8:id==='knapsack'?5:AlgoLessonById[id].view==='graph'?0:7,text:'ABC'};const steps=AlgoDSA.generate(id,[3,7,1,7],options);for(const step of steps){const line=AlgoCode.line(id,step);assert.ok(line>=1&&line<=AlgoCode.catalog[id].lines.length,id);count++;}}
for(const a of [[],[3,1,2],[2,2,1],[-5,0,3]])for(const id of ['bubble','selection','insertion','merge','quick']){assert.deepEqual(fn(id)(a),[...a].sort((a,b)=>a-b));count++;}
assert.deepEqual(fn('radix')([9,101,8,0,17]),[0,8,9,17,101]);count++;
assert.equal(fn('linear')([2,3],3),1);assert.equal(fn('linear')([2,3],9),-1);assert.equal(fn('binary')([9,2,3],3),1);assert.equal(fn('traverse')([1,2,3]),6);assert.equal(fn('sliding')([1,2,3,4],2),7);assert.deepEqual(fn('two_pointer')([1,8,3],9),[0,2]);assert.equal(fn('reverse_string')('a🙂b'),'b🙂a');count+=7;
assert.deepEqual(fn('stack')([1,2,3]),[3,2,1]);assert.deepEqual(fn('queue')([1,2,3]),[1,2,3]);assert.deepEqual(fn('deque')([1,2,3,4]),[3,4,1,2]);assert.deepEqual(fn('priority')([7,2,9,1]),[1,2,7,9]);count+=4;
for(const id of ['singly','doubly','circular']){const root=fn(id)([1,2,3]);let n=root;for(const value of [1,2,3]){assert.equal(n.value,value);n=n.next;count++;}assert.equal(n,id==='circular'?root:null);count++;}
for(const id of ['bst','avl','redblack']){const root=fn(id)([30,20,10,25,40,50],25);const inorder=[];function visit(n){if(!n)return;visit(n.left);inorder.push(n.value);visit(n.right);}visit(root);assert.deepEqual(inorder,[10,20,25,30,40,50]);count++;}
assert.deepEqual(fn('bfs_tree')([3,1,4,2]),[3,1,4,2]);assert.deepEqual(fn('dfs_tree')([3,1,4,2]),[3,1,2,4]);count+=2;
const graph=AlgoDSA.defaultGraph();assert.deepEqual(fn('bfs_graph')(graph,0),[0,1,2,3,4,5]);assert.equal(fn('dfs_graph')(graph,0).length,6);assert.deepEqual(fn('dijkstra')(graph,0),{0:0,1:3,2:2,3:8,4:10,5:13});assert.equal(fn('topological')(AlgoDSA.parseGraph('0-1,1-0')),null);count+=4;
assert.equal(fn('fibonacci')(8),21);assert.equal(fn('memoization')(8),21);assert.equal(fn('knapsack')([6,10,12],5),22);count+=3;
for(const id of ['hash_chaining','hash_probing','hashset']){const result=fn(id)([7,14,7],7);assert.equal(result.found,true);count++;}
const found=AlgoDSA.generate('linear',[1,2],{target:2}).at(-1);assert.equal(AlgoCode.line('linear',found),AlgoCode.catalog.linear.tags.found);count++;
const merge=AlgoDSA.generate('merge',[3,1,2]);assert.ok(merge.filter(s=>s.kind==='compare').every(s=>s.compareValues.length===2));count++;
console.log(`${count} executable lesson-code and highlight checks passed`);
