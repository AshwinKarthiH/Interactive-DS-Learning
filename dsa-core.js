/* Actual DSA state transitions; visual snapshots do not change algorithm semantics. */
globalThis.AlgoDSA = {
 generate(id, values, options={}) {
  const lesson=AlgoLessonById[id]; if(!lesson)throw new Error('Unknown algorithm');
  if(values.length>25 || values.some(v=>!Number.isFinite(v)))throw new Error('Use at most 25 finite numbers.');
  const input=[...values], steps=[];
  const target=options.target ?? 10;
  const emit=(array,message,state={},kind='visit',active=[],guide=0,extra={})=>{
   steps.push(JSON.parse(JSON.stringify({array:[...array],message,state,kind,type:kind,active,guide,...extra})));
  };
  const done=(array,message,state={})=>emit(array,message,state,'done');
  if(['bubble','selection','insertion','merge','linear','binary'].includes(id)) {
   return AlgoCore.generateSteps(id,input,target).map(s=>({...s,kind:s.type,active:s.indices||[],guide:s.type==='compare'?0:s.type==='done'?2:1,message:s.message || (s.type==='compare'?`Compare ${(s.compareValues||s.indices.map(i=>s.array[i])).join(' and ')}.`:s.type==='swap'?`Swap positions ${s.indices.join(' and ')}.`:s.type==='write'?`Write ${s.array[s.indices[0]]} at position ${s.indices[0]}.`:'All numbers are now sorted.')}));
  }
  if(id==='quick') {
   const a=[...input];
   function sort(lo,hi){if(lo>=hi)return;let p=lo;const pivot=a[hi];emit(a,`Choose ${pivot} as the pivot for positions ${lo} through ${hi}.`,{},'visit',[hi],0,{pivot:hi});
    for(let j=lo;j<hi;j++){emit(a,`Compare ${a[j]} with pivot ${pivot}.`,{},'compare',[j,hi],1);if(a[j]<pivot){if(p!==j){[a[p],a[j]]=[a[j],a[p]];emit(a,'Move this smaller value to the left side.',{},'swap',[p,j],1);}p++;}}
    if(p!==hi){[a[p],a[hi]]=[a[hi],a[p]];emit(a,`Put pivot ${pivot} in its final position ${p}.`,{},'swap',[p,hi],1);}
    sort(lo,p-1);sort(p+1,hi);
   }
   sort(0,a.length-1);done(a,'The left and right sides are sorted.');return steps;
  }
  if(id==='radix') {
   if(input.some(v=>!Number.isSafeInteger(v)||v<0))throw new Error('Radix sort needs non-negative whole numbers.');
   const a=[...input],max=Math.max(0,...a);
   for(let place=1;place<=max;place*=10){const buckets=Array.from({length:10},()=>[]);
    a.forEach((v,i)=>{const digit=Math.floor(v/place)%10;buckets[digit].push(v);emit(a,`At digit place ${place}, ${v} belongs to bucket ${digit}.`,{buckets,place},'visit',[i],0);});
    const collected=buckets.flat();collected.forEach((v,i)=>{a[i]=v;emit(a,`Collect bucket values in order: write ${v} at position ${i}.`,{buckets,place},'write',[i],1);});
   }
   done(a,'All decimal digit places have been processed.');return steps;
  }
  if(id==='traverse') {let sum=0;input.forEach((v,i)=>{sum+=v;emit(input,`Visit position ${i}: value ${v}. Running total = ${sum}.`,{sum},'visit',[i],1);});done(input,`Visited ${input.length} values. Total = ${sum}.`,{sum});return steps;}
  if(id==='sliding') {
   const k=target;if(!Number.isInteger(k)||k<1||k>input.length)throw new Error('Window size k must be between 1 and the number of values.');
   let sum=0,best=-Infinity,bestStart=0;
   for(let i=0;i<input.length;i++){sum+=input[i];if(i>=k)sum-=input[i-k];const start=Math.max(0,i-k+1);if(i>=k-1&&sum>best){best=sum;bestStart=start;}
    emit(input,`Window ${start}–${i}: sum ${sum}${i>=k-1?`; best full-window sum ${best}`:' (still filling)'}.`,{sum,best:best===-Infinity?null:best,bestStart,k},'visit',Array.from({length:i-start+1},(_,j)=>start+j),i<k?0:2);
   }done(input,`Largest ${k}-value window sum = ${best}, starting at ${bestStart}.`,{best,bestStart,k});return steps;
  }
  if(id==='two_pointer') {
   const a=[...input].sort((a,b)=>a-b);let l=0,r=a.length-1,found=null;
   while(l<r){const sum=a[l]+a[r];emit(a,`${a[l]} + ${a[r]} = ${sum}. ${sum<target?'Too small: move the left pointer right.':sum>target?'Too large: move the right pointer left.':'This matches the target!'}`,{},'compare',[l,r],1);
    if(sum===target){found=[l,r];break;}if(sum<target)l++;else r--;
   }done(a,found?`Found ${a[found[0]]} + ${a[found[1]]} = ${target}.`:`No pair adds up to ${target}.`,{found});return steps;
  }
  if(id==='reverse_string') {const a=Array.from(options.text||'');let l=0,r=a.length-1;while(l<r){emit([],`Swap “${a[l]}” and “${a[r]}”.`,{chars:a},'visit',[l,r],1);[a[l],a[r]]=[a[r],a[l]];emit([],`The outside letters now face the other way.`,{chars:a},'change',[l,r],2);l++;r--;}done([],`Reversed string: ${a.join('')}`,{chars:a});return steps;}
  if(['stack','queue','deque'].includes(id)) {
   const a=[],removed=[];
   input.forEach((v,i)=>{const front=id==='deque'&&i%2===0;front?a.unshift(v):a.push(v);emit(a,`${id==='stack'?'Push':front?'Add at front':'Add at back'} ${v}.`,{removed},'change',[front?0:a.length-1],0);});
   let i=0;while(a.length){const back=id==='stack'||(id==='deque'&&i++%2===1);const value=back?a.pop():a.shift();removed.push(value);emit(a,`Remove ${value} from the ${back?'top/back':'front'}.`,{removed},'change',[],2);}
   done(a,`Empty now. Removal order: ${removed.join(', ')}.`,{removed});return steps;
  }
  if(['priority','heap'].includes(id)) {
   const a=[],removed=[];
   const snap=(message,active=[],guide=0,kind='change')=>emit(a,message,{removed},kind,active,guide);
   input.forEach(v=>{a.push(v);let i=a.length-1;snap(`Insert ${v} at the next open leaf.`,[i],0);
    while(i>0){const parent=Math.floor((i-1)/2);snap(`Compare child ${a[i]} with parent ${a[parent]}.`,[i,parent],1,'compare');if(a[parent]<=a[i])break;[a[parent],a[i]]=[a[i],a[parent]];snap('Swap the smaller child upward.',[i,parent],2);i=parent;}
   });
   if(id==='priority')while(a.length){const minimum=a[0],last=a.pop();removed.push(minimum);if(a.length)a[0]=last;snap(`Remove minimum ${minimum}; move the last leaf to the root.`,[0],2);
    let i=0;while(2*i+1<a.length){let child=2*i+1;if(child+1<a.length){snap('Compare the two children.',[child,child+1],2,'compare');if(a[child+1]<a[child])child++;}snap('Compare the parent with its smaller child.',[i,child],2,'compare');if(a[i]<=a[child])break;[a[i],a[child]]=[a[child],a[i]];snap('Move the smaller child up to restore the heap.',[i,child],2);i=child;}
   }
   done(a,id==='heap'?'Every parent is no larger than its children.':`Removed in priority order: ${removed.join(', ')}.`,{removed});return steps;
  }
  if(['singly','doubly','circular'].includes(id)) {
   const a=[];input.forEach(v=>{a.push(v);emit(a,`Append node ${v}${a.length>1?`; link ${a[a.length-2]} to it`: ' as the head'}.`,{mode:id},'change',[a.length-1],0);});
   if(id==='circular'&&a.length)emit(a,'Link the tail back to the head, making a circle.',{mode:id,closed:true},'change',[a.length-1,0],1);
   a.forEach((v,i)=>emit(a,`Visit node ${v}; ${i===a.length-1?(id==='circular'?'the next link returns to the head.':'the next link is null.'):'follow its next link.'}`,{mode:id,closed:id==='circular'},'visit',[i],2));
   if(id==='doubly')for(let i=a.length-1;i>=0;i--)emit(a,`Walk backward to ${a[i]} using the previous link.`,{mode:id},'visit',[i],2);
   done(a,id==='circular'?'Completed one full round; stop to avoid an endless loop.':'Traversal complete.',{mode:id,closed:id==='circular'});return steps;
  }
  if(['bst','bfs_tree','dfs_tree','avl','redblack'].includes(id)) {
   let root=null;const repair=[];const height=n=>n?n.height:0;const red=n=>!!n&&n.color==='red';
   const update=n=>{n.height=1+Math.max(height(n.left),height(n.right));return n;};
   function rotateLeft(n){const x=n.right;n.right=x.left;x.left=n;update(n);update(x);repair.push(`rotate left at ${n.value}`);return x;}
   function rotateRight(n){const x=n.left;n.left=x.right;x.right=n;update(n);update(x);repair.push(`rotate right at ${n.value}`);return x;}
   function insert(n,value){if(!n)return {value,left:null,right:null,height:1,color:id==='redblack'?'red':'black'};
    if(value<n.value)n.left=insert(n.left,value);else if(value>n.value)n.right=insert(n.right,value);else return n;
    update(n);
    if(id==='avl'){const balance=height(n.left)-height(n.right);if(balance>1){if(value>n.left.value)n.left=rotateLeft(n.left);return rotateRight(n);}if(balance< -1){if(value<n.right.value)n.right=rotateRight(n.right);return rotateLeft(n);}}
    if(id==='redblack'){
     if(red(n.right)&&!red(n.left)){const color=n.color;n=rotateLeft(n);n.color=color;n.left.color='red';}
     if(red(n.left)&&red(n.left.left)){const color=n.color;n=rotateRight(n);n.color=color;n.right.color='red';}
     if(red(n.left)&&red(n.right)){n.color=n.color==='red'?'black':'red';n.left.color='black';n.right.color='black';repair.push(`flip colors at ${n.value}`);}
    }return n;
   }
   const inserted=[];
   for(const v of input){repair.length=0;const duplicate=inserted.includes(v);root=insert(root,v);if(root)root.color='black';if(!duplicate)inserted.push(v);
    if(!['bfs_tree','dfs_tree'].includes(id))emit(inserted,duplicate?`${v} is already present; skip the duplicate.`:`Insert ${v}${repair.length?`; repair: ${repair.join('; ')}`: ' using the smaller-left, larger-right rule'}.`,{root},'change',[v],repair.length?2:0);
   }
   const visited=[];
   if(id==='bst'){let node=root;while(node){emit(inserted,`Compare target ${target} with ${node.value}.`,{root,visited},'compare',[node.value],1);if(node.value===target){done(inserted,`Found ${target} in the tree.`,{root,found:target});return steps;}node=target<node.value?node.left:node.right;}done(inserted,`${target} is not in the tree.`,{root});}
   else if(id==='bfs_tree'){const queue=root?[root]:[];emit(inserted,'Start with the root in a queue.',{root,frontier:queue.map(n=>n.value),visited},'visit',[],0);while(queue.length){const n=queue.shift();visited.push(n.value);if(n.left)queue.push(n.left);if(n.right)queue.push(n.right);emit(inserted,`Visit ${n.value}; add its children to the queue.`,{root,visited,frontier:queue.map(n=>n.value)},'visit',[n.value],2);}done(inserted,`Level-order traversal: ${visited.join(', ')}.`,{root,visited});}
   else if(id==='dfs_tree'){function dfs(n){if(!n)return;visited.push(n.value);emit(inserted,`Visit ${n.value}; next explore left, then right.`,{root,visited},'visit',[n.value],0);dfs(n.left);dfs(n.right);}dfs(root);done(inserted,`Preorder traversal: ${visited.join(', ')}.`,{root,visited});}
   else done(inserted,'Insertion complete. The tree is balanced.',{root});return steps;
  }
  if(['bfs_graph','dfs_graph','dijkstra','topological'].includes(id)) {
   const graph=options.graph||this.defaultGraph(id==='topological');
   const nodes=[...graph.nodes],edges=graph.edges.map(e=>({...e}));
   if(nodes.length>12||edges.length>40||(id!=='topological'&&!nodes.includes(target)))throw new Error('Use 1–12 nodes, at most 40 edges, and a start node present in the graph.');
   if(edges.some(e=>!nodes.includes(e.from)||!nodes.includes(e.to)||!Number.isFinite(e.weight)||e.weight<0))throw new Error('Edges need valid endpoints and non-negative weights.');
   const directed=id==='topological';const adj=Object.fromEntries(nodes.map(n=>[n,[]]));edges.forEach(e=>{adj[e.from].push({node:e.to,weight:e.weight});if(!directed)adj[e.to].push({node:e.from,weight:e.weight});});
   const visited=[],seen=new Set(),state=(extra={})=>({nodes,edges,directed,visited:[...visited],...extra});
   if(id==='bfs_graph'){const queue=[target];seen.add(target);emit([],`Start at ${target}; add it to the queue.`,state({frontier:queue}),'visit',[target],0);while(queue.length){const n=queue.shift();visited.push(n);for(const e of adj[n])if(!seen.has(e.node)){seen.add(e.node);queue.push(e.node);}emit([],`Visit ${n}; queue unvisited neighbors.`,state({frontier:queue}),'visit',[n],2);}done([],`BFS order: ${visited.join(', ')}.`,state());}
   else if(id==='dfs_graph'){function dfs(n){seen.add(n);visited.push(n);emit([],`Visit ${n}; follow an unvisited neighbor before backtracking.`,state(),'visit',[n],1);for(const e of adj[n])if(!seen.has(e.node))dfs(e.node);}dfs(target);done([],`DFS order: ${visited.join(', ')}.`,state());}
   else if(id==='dijkstra'){const distance=Object.fromEntries(nodes.map(n=>[n,Infinity])),previous={};distance[target]=0;
    const snap=(message,active=[],kind='visit',guide=1)=>emit([],message,state({distance:Object.fromEntries(nodes.map(n=>[n,Number.isFinite(distance[n])?distance[n]:'∞'])),previous}),kind,active,guide);
    snap('Start distance is 0; all other distances are infinity.',[target],'visit',0);
    while(seen.size<nodes.length){let u=null;for(const n of nodes)if(!seen.has(n)&&(u===null||distance[n]<distance[u]))u=n;if(u===null||distance[u]===Infinity)break;seen.add(u);visited.push(u);snap(`Finalize node ${u} at distance ${distance[u]}.`,[u]);
     for(const e of adj[u]){const candidate=distance[u]+e.weight;snap(`Try ${u} → ${e.node}: ${distance[u]} + ${e.weight} = ${candidate}.`,[u,e.node],'compare',2);if(candidate<distance[e.node]){distance[e.node]=candidate;previous[e.node]=u;snap(`Improve distance to ${e.node} to ${candidate}.`,[e.node],'change',2);}}
    }snap('Shortest distances are final; infinity means unreachable.',[],'done',2);
   } else {const indegree=Object.fromEntries(nodes.map(n=>[n,0]));edges.forEach(e=>indegree[e.to]++);const queue=nodes.filter(n=>indegree[n]===0);emit([],'Count incoming edges; queue nodes with no prerequisites.',state({indegree,frontier:queue}),'visit',[],0);
    while(queue.length){const u=queue.shift();visited.push(u);for(const e of adj[u]){indegree[e.node]--;if(indegree[e.node]===0)queue.push(e.node);}emit([],`Complete ${u}; remove its outgoing dependencies.`,state({indegree,frontier:queue}),'change',[u],2);}
    done([],visited.length===nodes.length?`Valid task order: ${visited.join(', ')}.`:'Cycle detected: remaining tasks cannot be ordered.',state({indegree,cycle:visited.length!==nodes.length}));
   }return steps;
  }
  if(['fibonacci','memoization'].includes(id)) {
   const n=target;if(!Number.isInteger(n)||n<0||n>20)throw new Error('Choose n from 0 to 20.');const table=Array(n+1).fill(null);
   if(id==='fibonacci'){table[0]=0;if(n>=1)table[1]=1;emit([],'Save the base answers: F(0)=0 and F(1)=1.',{table},'change',[0,1],0);for(let i=2;i<=n;i++){table[i]=table[i-1]+table[i-2];emit([],`F(${i}) = ${table[i-1]} + ${table[i-2]} = ${table[i]}.`,{table},'change',[i,i-1,i-2],1);}}
   else {function fib(i){if(table[i]!==null){emit([],`Reuse the saved answer F(${i}) = ${table[i]}.`,{table},'visit',[i],1);return table[i];}emit([],`Ask for F(${i})${i>1?'; first solve F('+ (i-1)+') and F('+ (i-2)+')':''}.`,{table},'visit',[i],0);const result=i<=1?i:fib(i-1)+fib(i-2);table[i]=result;emit([],`Save F(${i}) = ${result} for future calls.`,{table},'change',[i],2);return result;}fib(n);}
   done([],`F(${n}) = ${table[n]}.`,{table,result:table[n]});return steps;
  }
  if(id==='knapsack') {
   const capacity=target;if(!Number.isInteger(capacity)||capacity<0||capacity>20)throw new Error('Choose a capacity from 0 to 20.');
   const weights=input.map((_,i)=>i%5+1),table=Array.from({length:input.length+1},()=>Array(capacity+1).fill(0));
   emit([],'Start with zero value when no items are available.',{table,weights,values:input,capacity},'visit',[],0);
   for(let i=1;i<=input.length;i++)for(let c=0;c<=capacity;c++){const skip=table[i-1][c],take=c>=weights[i-1]?input[i-1]+table[i-1][c-weights[i-1]]:-Infinity;table[i][c]=Math.max(skip,take);emit([],`Item ${i}: weight ${weights[i-1]}, value ${input[i-1]}; capacity ${c}. ${take===-Infinity?'Does not fit.':`Skip = ${skip}, take = ${take}.`} Keep ${table[i][c]}.`,{table,weights,values:input,capacity,cell:[i,c]},'change',[],1);}
   let c=capacity;const chosen=[];for(let i=input.length;i>0;i--)if(table[i][c]!==table[i-1][c]){chosen.unshift(i-1);c-=weights[i-1];}
   done([],`Best value = ${table[input.length][capacity]}. Choose items ${chosen.map(i=>i+1).join(', ')||'none'}.`,{table,weights,values:input,capacity,chosen,result:table[input.length][capacity]});return steps;
  }
  if(['hash_chaining','hash_probing','hashset'].includes(id)) {
   if(!Number.isSafeInteger(target)||input.some(v=>!Number.isSafeInteger(v)))throw new Error('Hashing examples need whole-number keys.');
   const size=id==='hash_probing'?Math.max(7,input.length*2+1):7;
   const entries={},buckets=Array.from({length:size},()=>[]),hash=v=>((v%size)+size)%size;
   input.forEach(v=>{let slot=hash(v);emit(input,`Hash ${v}: normalized remainder modulo ${size} = ${slot}.`,{buckets,size,entries},'visit',[slot],0);
    if(id==='hash_probing'){while(buckets[slot].length&&buckets[slot][0]!==v){emit(input,`Slot ${slot} is occupied by ${buckets[slot][0]}; try the next slot.`,{buckets,size,entries},'compare',[slot],1);slot=(slot+1)%size;}}
    const duplicate=buckets[slot].includes(v);if(!duplicate)buckets[slot].push(v);if(id!=='hashset')entries[v]=(entries[v]||0)+1;emit(input,duplicate?(id==='hashset'?`${v} already exists; keep one copy.`:`Update key ${v}: count is now ${entries[v]}.`):`Store ${v} in bucket ${slot}${id==='hashset'?'': ' with count 1'}.`,{buckets,size,entries},duplicate&&id==='hashset'?'visit':'change',[slot],2);
   });
   let slot=hash(target),found=false;if(id==='hash_probing'){for(let i=0;i<size;i++){emit(input,`Search target ${target} in slot ${slot}.`,{buckets,size,entries},'compare',[slot],1);if(!buckets[slot].length)break;if(buckets[slot][0]===target){found=true;break;}slot=(slot+1)%size;}}
   else {emit(input,`Search target ${target} in bucket ${slot}.`,{buckets,size,entries},'compare',[slot],1);found=buckets[slot].includes(target);}
   done(input,`${target} is ${found?'present':'not present'}. Stored ${buckets.flat().length} unique keys${found&&id!=='hashset'?`; count for ${target} = ${entries[target]}`:''}.`,{buckets,size,entries,found});return steps;
  }
  throw new Error('No visualizer for '+id);
 },
 defaultGraph(directed=false) {return {nodes:[0,1,2,3,4,5],edges:(directed?[[0,1,2],[0,2,4],[1,3,3],[2,3,1],[3,4,2],[2,5,7]]:[[0,1,4],[0,2,2],[1,2,1],[1,3,5],[2,3,8],[2,4,10],[3,4,2],[3,5,6],[4,5,3]]).map(([from,to,weight])=>({from,to,weight}))};},
 parseGraph(text) {
  const nodes=new Set(),edges=[];
  for(const part of text.split(/[,\n]/).map(s=>s.trim()).filter(Boolean)) {
   if(/^\d+$/.test(part)){nodes.add(Number(part));continue;}
   const m=part.match(/^(\d+)\s*-\s*(\d+)(?:\s*:\s*(\d+(?:\.\d+)?))?$/);
   if(!m)throw new Error('Edges use from-to:weight, for example 0-1:4. Add a standalone node number for an isolated node.');
   const from=Number(m[1]),to=Number(m[2]),weight=m[3]===undefined?1:Number(m[3]);nodes.add(from);nodes.add(to);edges.push({from,to,weight});
  }
  if([...nodes].some(n=>!Number.isSafeInteger(n)||n<0||n>2147483647))throw new Error('Node labels must be whole numbers from 0 to 2147483647.');
  if(!nodes.size)throw new Error('Enter at least one node or edge.');return {nodes:[...nodes].sort((a,b)=>a-b),edges};
 }
};
