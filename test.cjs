const assert=require('node:assert/strict');
require('./algorithm-core.js');require('./battle-core.js');require('./problems.js');
let count=0;
for(const input of [[],[1],[1,2,3],[3,2,1],[2,2,1],[-4,9,0,-4],Array.from({length:40},(_,i)=>(i*17)%29)]) {
 const expected=[...input].sort((a,b)=>a-b);
 for(const id of ['bubble','selection','insertion','merge']) {const steps=AlgoCore.generateSteps(id,input);assert.deepEqual(steps.at(-1).array,expected);count++;}
 for(const id of ['bubble','selection','insertion','merge','quick']) {assert.deepEqual(AlgoBattle.sort(input,id).sorted,expected);count++;}
}
for(const id of ['linear','binary']) {
 for(const target of [2,99]) {const step=AlgoCore.generateSteps(id,[3,2,1],target).at(-1);assert.match(step.message,target===2?/Found/:/not found/);count++;}
}
assert.equal(AlgoCore.generateSteps('bubble',[1,2,3,4]).filter(s=>s.type==='compare').length,3);count++;
assert.throws(()=>AlgoCore.generateSteps('bst',[1,2]));count++;
assert.deepEqual(AlgoBattle.sort([2,1],'bubble'),{sorted:[1,2],comparisons:1,swaps:2});count++;
for(const p of AlgoProblems) {
 const names={'two-sum':'twoSum','reverse-linked-list':'reverseList','valid-parentheses':'isValid','merge-sorted-lists':'mergeTwoLists','max-subarray':'maxSubArray','best-time-stock':'maxProfit','climbing-stairs':'climbStairs'};
 const fn=new Function(p.jsStarter+'\nreturn '+names[p.id])();
 for(const tc of p.testCases){let value=tc.run(fn),expected=JSON.parse(tc.expected);if(p.id==='two-sum'){value.sort((a,b)=>a-b);expected.sort((a,b)=>a-b);}assert.deepEqual(value,expected);count++;}
}
console.log(`${count} algorithm and problem checks passed`);
