/* Executable teaching examples. Tags identify the operation represented by a snapshot. */
(function(){
 const catalog={};
 const names={bubble:'bubbleSort',selection:'selectionSort',insertion:'insertionSort',merge:'mergeSort',quick:'quickSort',radix:'radixSort',linear:'linearSearch',binary:'binarySearch',traverse:'traverseArray',sliding:'maxWindowSum',two_pointer:'findPairSum',reverse_string:'reverseString',stack:'stackDemo',queue:'queueDemo',deque:'dequeDemo',heap:'buildMinHeap',priority:'priorityQueueDemo',singly:'buildSinglyLinkedList',doubly:'buildDoublyLinkedList',circular:'buildCircularList',bst:'buildAndSearchBST',bfs_tree:'treeBreadthFirst',dfs_tree:'treeDepthFirst',avl:'buildAVLTree',redblack:'buildRedBlackTree',bfs_graph:'graphBreadthFirst',dfs_graph:'graphDepthFirst',dijkstra:'shortestDistances',topological:'topologicalSort',fibonacci:'fibonacciTable',memoization:'fibonacciMemo',knapsack:'knapsack',hash_chaining:'hashMapChaining',hash_probing:'hashMapProbing',hashset:'hashSet'};
 function add(id,source){const functionName=names[id];source=source.replace('function lesson(',`function ${functionName}(`);const tags={};const lines=source.trim().split('\n').map((line,i)=>{const match=line.match(/\s*\/\/ @([\w,]+)\s*$/);if(match){for(const key of match[1].split(','))tags[key]=i+1;line=line.slice(0,match.index);}return line;});catalog[id]={source:lines.join('\n'),lines,tags,functionName};}
 add('bubble',`function lesson(values) {
  const a = [...values];
  for (let end = a.length - 1; end > 0; end--) {
    let changed = false;
    for (let j = 0; j < end; j++) {
      if (a[j] > a[j + 1]) { // @compare
        [a[j], a[j + 1]] = [a[j + 1], a[j]]; // @swap
        changed = true;
      }
    }
    if (!changed) break;
  }
  return a; // @done
}`);
 add('selection',`function lesson(values) {
  const a = [...values];
  for (let i = 0; i < a.length; i++) {
    let smallest = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[smallest]) smallest = j; // @compare
    }
    if (smallest !== i) {
      [a[i], a[smallest]] = [a[smallest], a[i]]; // @swap
    }
  }
  return a; // @done
}`);
 add('insertion',`function lesson(values) {
  const a = [...values];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      if (a[j - 1] <= a[j]) break; // @compare
      [a[j - 1], a[j]] = [a[j], a[j - 1]]; // @swap
      j--;
    }
  }
  return a; // @done
}`);
 add('merge',`function lesson(values) {
  const a = [...values];
  function sort(left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    sort(left, mid); sort(mid + 1, right);
    const first = a.slice(left, mid + 1);
    const second = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < first.length && j < second.length) {
      const takeLeft = first[i] <= second[j]; // @compare
      a[k++] = takeLeft ? first[i++] : second[j++]; // @write
    }
    while (i < first.length) a[k++] = first[i++]; // @writeLeft
    while (j < second.length) a[k++] = second[j++]; // @writeRight
  }
  sort(0, a.length - 1);
  return a; // @done
}`);
 add('quick',`function lesson(values) {
  const a = [...values];
  function sort(left, right) {
    if (left >= right) return;
    const pivot = a[right]; // @visit
    let next = left;
    for (let j = left; j < right; j++) {
      if (a[j] < pivot) { // @compare
        [a[next], a[j]] = [a[j], a[next]]; // @swap
        next++;
      }
    }
    [a[next], a[right]] = [a[right], a[next]]; // @pivotSwap
    sort(left, next - 1); sort(next + 1, right);
  }
  sort(0, a.length - 1);
  return a; // @done
}`);
 add('radix',`function lesson(values) {
  const a = [...values];
  const largest = Math.max(0, ...a);
  for (let place = 1; place <= largest; place *= 10) {
    const buckets = Array.from({length: 10}, () => []);
    for (const value of a) {
      const digit = Math.floor(value / place) % 10;
      buckets[digit].push(value); // @visit,hash
    }
    const next = buckets.flat();
    for (let i = 0; i < a.length; i++) a[i] = next[i]; // @write
  }
  return a; // @done
}`);
 add('linear',`function lesson(values, target) {
  for (let i = 0; i < values.length; i++) {
    if (values[i] === target) return i; // @compare,found
  }
  return -1; // @done
}`);
 add('binary',`function lesson(values, target) {
  const a = [...values].sort((a, b) => a - b);
  let left = 0, right = a.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if (a[middle] === target) return middle; // @compare,found
    if (a[middle] < target) left = middle + 1;
    else right = middle - 1;
  }
  return -1; // @done
}`);
 add('traverse',`function lesson(values) {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += values[i]; // @visit
  }
  return total; // @done
}`);
 add('sliding',`function lesson(values, k) {
  let sum = 0, best = -Infinity;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= k) sum -= values[i - k];
    if (i >= k - 1) best = Math.max(best, sum); // @visit
  }
  return best; // @done
}`);
 add('two_pointer',`function lesson(values, target) {
  const a = [...values].sort((a, b) => a - b);
  let left = 0, right = a.length - 1;
  while (left < right) {
    const sum = a[left] + a[right]; // @compare
    if (sum === target) return [left, right]; // @found
    if (sum < target) left++;
    else right--;
  }
  return null; // @done
}`);
 add('reverse_string',`function lesson(text) {
  const letters = Array.from(text);
  let left = 0, right = letters.length - 1;
  while (left < right) {
    // Choose the outside letters. // @visit
    [letters[left], letters[right]] =
      [letters[right], letters[left]]; // @change,swap
    left++; right--;
  }
  return letters.join(''); // @done
}`);
 add('stack',`function lesson(values) {
  const stack = [], removed = [];
  for (const value of values) {
    stack.push(value); // @change,insert
  }
  while (stack.length) {
    removed.push(stack.pop()); // @remove
  }
  return removed; // @done
}`);
 add('queue',`function lesson(values) {
  const queue = [], removed = [];
  for (const value of values) {
    queue.push(value); // @change,insert
  }
  let front = 0;
  while (front < queue.length) {
    removed.push(queue[front++]); // @remove
  }
  return removed; // @done
}`);
 add('deque',`function lesson(values) {
  const deque = new Map(), removed = [];
  let front = 0, back = 0;
  values.forEach((value, i) => {
    if (i % 2 === 0) deque.set(--front, value); // @change,insert
    else deque.set(back++, value); // @back
  });
  let turn = 0;
  while (front < back) {
    const index = turn++ % 2 === 0 ? front++ : --back;
    removed.push(deque.get(index)); deque.delete(index); // @remove
  }
  return removed; // @done
}`);
 const heapHelpers=`  function insert(heap, value) {
    heap.push(value); // @insert
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) break; // @compare
      [heap[parent], heap[i]] = [heap[i], heap[parent]]; // @change,swap
      i = parent;
    }
  }`;
 add('heap',`function lesson(values) {
  const heap = [];
${heapHelpers}
  for (const value of values) insert(heap, value);
  return heap; // @done
}`);
 add('priority',`function lesson(values) {
  const heap = [], removed = [];
${heapHelpers}
  for (const value of values) insert(heap, value);
  while (heap.length) {
    const smallest = heap[0], last = heap.pop();
    if (heap.length) heap[0] = last; // @remove
    removed.push(smallest);
    let i = 0;
    while (2 * i + 1 < heap.length) {
      let child = 2 * i + 1;
      if (child + 1 < heap.length && heap[child + 1] < heap[child]) child++; // @children
      if (heap[i] <= heap[child]) break; // @downCompare
      [heap[i], heap[child]] = [heap[child], heap[i]]; // @downSwap
      i = child;
    }
  }
  return removed; // @done
}`);
 for(const id of ['singly','doubly','circular'])add(id,`function lesson(values) {
  let head = null, tail = null;
  for (const value of values) {
    const node = {value, next: null${id==='doubly'?', prev: tail':''}};
    if (!head) head = node;
    else tail.next = node; // @insert,change
    tail = node;
  }
${id==='circular'?'  if (tail) tail.next = head; // @link':''}
  let current = head;
  for (let i = 0; i < values.length; i++) {
    current = current.next; // @visit
  }
${id==='doubly'?'  current = tail;\n  while (current) current = current.prev; // @backward':''}
  return head; // @done
}`);
 const bstHelper=`  function insert(node, value) {
    if (!node) return {value, left: null, right: null};
    if (value < node.value) node.left = insert(node.left, value);
    if (value > node.value) node.right = insert(node.right, value);
    return node;
  }`;
 add('bst',`function lesson(values, target) {
${bstHelper}
  let root = null;
  for (const value of values) root = insert(root, value); // @change,insert
  let node = root;
  while (node) {
    if (node.value === target) return root; // @compare,found
    node = target < node.value ? node.left : node.right;
  }
  return root; // @done
}`);
 add('bfs_tree',`function lesson(values) {
${bstHelper}
  let root = null;
  for (const value of values) root = insert(root, value);
  const queue = root ? [root] : [], visited = []; // @initial
  while (queue.length) {
    const node = queue.shift(); visited.push(node.value);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right); // @visit
  }
  return visited; // @done
}`);
 add('dfs_tree',`function lesson(values) {
${bstHelper}
  let root = null;
  for (const value of values) root = insert(root, value);
  const visited = [];
  function visit(node) {
    if (!node) return;
    visited.push(node.value); // @visit
    visit(node.left);
    visit(node.right);
  }
  visit(root);
  return visited; // @done
}`);
 const rotateHelpers=`  const height = node => node ? node.height : 0;
  function update(node) {
    node.height = 1 + Math.max(height(node.left), height(node.right));
    return node;
  }
  function rotateLeft(node) {
    const child = node.right;
    node.right = child.left; child.left = node;
    update(node); return update(child);
  }
  function rotateRight(node) {
    const child = node.left;
    node.left = child.right; child.right = node;
    update(node); return update(child);
  }`;
 add('avl',`function lesson(values) {
${rotateHelpers}
  function insert(node, value) {
    if (!node) return {value, left: null, right: null, height: 1};
    if (value < node.value) node.left = insert(node.left, value);
    else if (value > node.value) node.right = insert(node.right, value);
    else return node;
    update(node);
    const balance = height(node.left) - height(node.right);
    if (balance > 1) {
      if (value > node.left.value) node.left = rotateLeft(node.left);
      return rotateRight(node);
    }
    if (balance < -1) {
      if (value < node.right.value) node.right = rotateRight(node.right);
      return rotateLeft(node);
    }
    return node;
  }
  let root = null;
  for (const value of values) root = insert(root, value); // @change,insert,repair
  return root; // @done
}`);
 add('redblack',`function lesson(values) {
${rotateHelpers}
  const red = node => node && node.color === 'red';
  function insert(node, value) {
    if (!node) return {value, left: null, right: null, height: 1, color: 'red'};
    if (value < node.value) node.left = insert(node.left, value);
    else if (value > node.value) node.right = insert(node.right, value);
    else return node;
    update(node);
    if (red(node.right) && !red(node.left)) {
      const color = node.color; node = rotateLeft(node);
      node.color = color; node.left.color = 'red';
    }
    if (red(node.left) && red(node.left.left)) {
      const color = node.color; node = rotateRight(node);
      node.color = color; node.right.color = 'red';
    }
    if (red(node.left) && red(node.right)) {
      node.color = node.color === 'red' ? 'black' : 'red';
      node.left.color = node.right.color = 'black';
    }
    return node;
  }
  let root = null;
  for (const value of values) {
    root = insert(root, value); root.color = 'black'; // @change,insert,repair
  }
  return root; // @done
}`);
 const adjacency=`  const neighbors = Object.fromEntries(graph.nodes.map(n => [n, []]));
  for (const edge of graph.edges) {
    neighbors[edge.from].push({node: edge.to, weight: edge.weight});
    neighbors[edge.to].push({node: edge.from, weight: edge.weight});
  }`;
 add('bfs_graph',`function lesson(graph, start) {
${adjacency}
  const queue = [start], seen = new Set([start]), visited = []; // @initial
  while (queue.length) {
    const node = queue.shift(); visited.push(node);
    for (const next of neighbors[node]) {
      if (!seen.has(next.node)) {
        seen.add(next.node); queue.push(next.node); // @visit
      }
    }
  }
  return visited; // @done
}`);
 add('dfs_graph',`function lesson(graph, start) {
${adjacency}
  const seen = new Set(), visited = [];
  function visit(node) {
    seen.add(node); visited.push(node); // @visit
    for (const next of neighbors[node]) {
      if (!seen.has(next.node)) visit(next.node);
    }
  }
  visit(start);
  return visited; // @done
}`);
 add('dijkstra',`function lesson(graph, start) {
${adjacency}
  const distance = Object.fromEntries(graph.nodes.map(n => [n, Infinity]));
  distance[start] = 0; // @initial
  const visited = new Set();
  while (visited.size < graph.nodes.length) {
    let node = null;
    for (const n of graph.nodes) {
      if (!visited.has(n) && (node === null || distance[n] < distance[node])) node = n;
    }
    if (node === null || distance[node] === Infinity) break;
    visited.add(node); // @visit,choose
    for (const next of neighbors[node]) {
      const candidate = distance[node] + next.weight; // @compare
      if (candidate < distance[next.node]) {
        distance[next.node] = candidate; // @change
      }
    }
  }
  return distance; // @done
}`);
 add('topological',`function lesson(graph) {
  const incoming = Object.fromEntries(graph.nodes.map(n => [n, 0]));
  const neighbors = Object.fromEntries(graph.nodes.map(n => [n, []]));
  for (const edge of graph.edges) {
    incoming[edge.to]++; neighbors[edge.from].push(edge.to);
  }
  const queue = graph.nodes.filter(n => incoming[n] === 0); // @initial,visit
  const order = [];
  while (queue.length) {
    const node = queue.shift(); order.push(node);
    for (const next of neighbors[node]) {
      if (--incoming[next] === 0) queue.push(next); // @change
    }
  }
  return order.length === graph.nodes.length ? order : null; // @done
}`);
 add('fibonacci',`function lesson(n) {
  const answer = Array(n + 1).fill(null);
  answer[0] = 0; if (n >= 1) answer[1] = 1; // @initial
  for (let i = 2; i <= n; i++) {
    answer[i] = answer[i - 1] + answer[i - 2]; // @change
  }
  return answer[n]; // @done
}`);
 add('memoization',`function lesson(n) {
  const saved = Array(n + 1).fill(null);
  function fib(i) {
    if (saved[i] !== null) return saved[i]; // @cache
    const value = i <= 1 ? i : fib(i - 1) + fib(i - 2); // @visit,ask
    saved[i] = value; // @change,save
    return value;
  }
  return fib(n); // @done
}`);
 add('knapsack',`function lesson(values, capacity) {
  const weights = values.map((_, i) => i % 5 + 1);
  const best = Array.from({length: values.length + 1},
    () => Array(capacity + 1).fill(0)); // @initial,visit
  for (let i = 1; i <= values.length; i++) {
    for (let room = 0; room <= capacity; room++) {
      const skip = best[i - 1][room];
      const take = room >= weights[i - 1]
        ? values[i - 1] + best[i - 1][room - weights[i - 1]]
        : -Infinity;
      best[i][room] = Math.max(skip, take); // @change
    }
  }
  return best[values.length][capacity]; // @done
}`);
 add('hash_chaining',`function lesson(values, target) {
  const buckets = Array.from({length: 7}, () => []);
  for (const key of values) {
    const slot = ((key % 7) + 7) % 7; // @visit,hash,compare,search
    let entry = buckets[slot].find(e => e.key === key);
    if (entry) entry.count++; // @change
    else buckets[slot].push({key, count: 1}); // @insert
  }
  const slot = ((target % 7) + 7) % 7;
  const found = buckets[slot].some(e => e.key === target); // @search
  return {buckets, found}; // @done
}`);
 add('hash_probing',`function lesson(values, target) {
  const size = Math.max(7, values.length * 2 + 1);
  const table = Array(size).fill(null);
  for (const key of values) {
    let slot = ((key % size) + size) % size; // @hash,visit
    while (table[slot] && table[slot].key !== key) {
      slot = (slot + 1) % size; // @compare,search
    }
    if (table[slot]) table[slot].count++; // @change
    else table[slot] = {key, count: 1}; // @insert
  }
  let slot = ((target % size) + size) % size;
  while (table[slot] && table[slot].key !== target) slot = (slot + 1) % size; // @search
  const found = Boolean(table[slot] && table[slot].key === target);
  return {table, found}; // @done
}`);
 add('hashset',`function lesson(values, target) {
  const buckets = Array.from({length: 7}, () => []);
  for (const key of values) {
    const slot = ((key % 7) + 7) % 7; // @visit,hash
    if (!buckets[slot].includes(key)) { // @compare,search,duplicate
      buckets[slot].push(key); // @change,insert
    }
  }
  const slot = ((target % 7) + 7) % 7;
  const found = buckets[slot].includes(target); // @search
  return {buckets, found}; // @done
}`);
 globalThis.AlgoCode={catalog,
  entry(id,language='javascript'){return language==='javascript'?catalog[id]:AlgoMultiCode[language][id];},
  line(id,step,language='javascript'){const tags=this.entry(id,language).tags;if(step?.codeKey&&tags[step.codeKey])return tags[step.codeKey];let key=step?.kind||step?.type||'initial';const message=step?.message||'';
   if(step?.kind==='done'&&/^Found/.test(message))key='found';
   else if(/already exists; keep one copy/.test(message))key='duplicate';else if(/^Remove/.test(message))key='remove';else if(/^Add at back/.test(message)&&id==='deque')key='back';else if(/^Insert|^Append|^Push|^Add at|^Store/.test(message))key='insert';else if(/^Put pivot/.test(message))key='pivotSwap';else if(/^Compare the two children/.test(message))key='children';else if(/^Compare the parent with/.test(message))key='downCompare';else if(/^Move the smaller child up/.test(message))key='downSwap';else if(/^Link/.test(message))key='link';else if(/^Walk backward/.test(message))key='backward';else if(/^Reuse/.test(message))key='cache';else if(/^Save F/.test(message))key='save';else if(/^Ask/.test(message))key='ask';else if(/^Hash/.test(message))key='hash';else if(/^Search target/.test(message))key='search';else if(/^Start|^Count incoming|^Save the base/.test(message))key='initial';
   return tags[key]||tags[step?.kind||step?.type]||tags.visit||tags.change||1;
  },
  render(container,id,step,view='javascript') {
   container.replaceChildren();const entry=view==='english'?catalog[id]:this.entry(id,view);const line=view==='english'?(step?.guide??0)+1:this.line(id,step,view);
   const lines=view==='english'?AlgoLessonById[id].guide:entry.lines;
   lines.forEach((text,i)=>{const row=document.createElement('div');row.className='code-line'+(step&&i+1===line?' code-active':'');row.dataset.line=i+1;const num=document.createElement('span');num.className='code-number';num.textContent=i+1;const code=document.createElement('code');code.textContent=text;row.append(num,code);if(step&&i+1===line){row.setAttribute('aria-current','step');}container.append(row);});
   const active=container.querySelector('.code-active');if(active){const top=active.offsetTop;if(top<container.scrollTop||top>container.scrollTop+container.clientHeight-40)container.scrollTop=Math.max(0,top-100);}
  }
 };
})();
