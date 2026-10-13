function bubbleSort(values) {
  const a = [...values];
  for (let end = a.length - 1; end > 0; end--) {
    let changed = false;
    for (let j = 0; j < end; j++) {
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        changed = true;
      }
    }
    if (!changed) break;
  }
  return a;
}

function selectionSort(values) {
  const a = [...values];
  for (let i = 0; i < a.length; i++) {
    let smallest = i;
    for (let j = i + 1; j < a.length; j++) {
      if (a[j] < a[smallest]) smallest = j;
    }
    if (smallest !== i) {
      [a[i], a[smallest]] = [a[smallest], a[i]];
    }
  }
  return a;
}

function insertionSort(values) {
  const a = [...values];
  for (let i = 1; i < a.length; i++) {
    let j = i;
    while (j > 0) {
      if (a[j - 1] <= a[j]) break;
      [a[j - 1], a[j]] = [a[j], a[j - 1]];
      j--;
    }
  }
  return a;
}

function mergeSort(values) {
  const a = [...values];
  function sort(left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    sort(left, mid); sort(mid + 1, right);
    const first = a.slice(left, mid + 1);
    const second = a.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < first.length && j < second.length) {
      const takeLeft = first[i] <= second[j];
      a[k++] = takeLeft ? first[i++] : second[j++];
    }
    while (i < first.length) a[k++] = first[i++];
    while (j < second.length) a[k++] = second[j++];
  }
  sort(0, a.length - 1);
  return a;
}

function quickSort(values) {
  const a = [...values];
  function sort(left, right) {
    if (left >= right) return;
    const pivot = a[right];
    let next = left;
    for (let j = left; j < right; j++) {
      if (a[j] < pivot) {
        [a[next], a[j]] = [a[j], a[next]];
        next++;
      }
    }
    [a[next], a[right]] = [a[right], a[next]];
    sort(left, next - 1); sort(next + 1, right);
  }
  sort(0, a.length - 1);
  return a;
}

function radixSort(values) {
  const a = [...values];
  const largest = Math.max(0, ...a);
  for (let place = 1; place <= largest; place *= 10) {
    const buckets = Array.from({length: 10}, () => []);
    for (const value of a) {
      const digit = Math.floor(value / place) % 10;
      buckets[digit].push(value);
    }
    const next = buckets.flat();
    for (let i = 0; i < a.length; i++) a[i] = next[i];
  }
  return a;
}

function linearSearch(values, target) {
  for (let i = 0; i < values.length; i++) {
    if (values[i] === target) return i;
  }
  return -1;
}

function binarySearch(values, target) {
  const a = [...values].sort((a, b) => a - b);
  let left = 0, right = a.length - 1;
  while (left <= right) {
    const middle = Math.floor((left + right) / 2);
    if (a[middle] === target) return middle;
    if (a[middle] < target) left = middle + 1;
    else right = middle - 1;
  }
  return -1;
}

function traverseArray(values) {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    total += values[i];
  }
  return total;
}

function maxWindowSum(values, k) {
  let sum = 0, best = -Infinity;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= k) sum -= values[i - k];
    if (i >= k - 1) best = Math.max(best, sum);
  }
  return best;
}

function findPairSum(values, target) {
  const a = [...values].sort((a, b) => a - b);
  let left = 0, right = a.length - 1;
  while (left < right) {
    const sum = a[left] + a[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;
    else right--;
  }
  return null;
}

function reverseString(text) {
  const letters = Array.from(text);
  let left = 0, right = letters.length - 1;
  while (left < right) {
    // Choose the outside letters.
    [letters[left], letters[right]] =
      [letters[right], letters[left]];
    left++; right--;
  }
  return letters.join('');
}

function stackDemo(values) {
  const stack = [], removed = [];
  for (const value of values) {
    stack.push(value);
  }
  while (stack.length) {
    removed.push(stack.pop());
  }
  return removed;
}

function queueDemo(values) {
  const queue = [], removed = [];
  for (const value of values) {
    queue.push(value);
  }
  let front = 0;
  while (front < queue.length) {
    removed.push(queue[front++]);
  }
  return removed;
}

function dequeDemo(values) {
  const deque = new Map(), removed = [];
  let front = 0, back = 0;
  values.forEach((value, i) => {
    if (i % 2 === 0) deque.set(--front, value);
    else deque.set(back++, value);
  });
  let turn = 0;
  while (front < back) {
    const index = turn++ % 2 === 0 ? front++ : --back;
    removed.push(deque.get(index)); deque.delete(index);
  }
  return removed;
}

function buildMinHeap(values) {
  const heap = [];
  function insert(heap, value) {
    heap.push(value);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }
  for (const value of values) insert(heap, value);
  return heap;
}

function priorityQueueDemo(values) {
  const heap = [], removed = [];
  function insert(heap, value) {
    heap.push(value);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }
  for (const value of values) insert(heap, value);
  while (heap.length) {
    const smallest = heap[0], last = heap.pop();
    if (heap.length) heap[0] = last;
    removed.push(smallest);
    let i = 0;
    while (2 * i + 1 < heap.length) {
      let child = 2 * i + 1;
      if (child + 1 < heap.length && heap[child + 1] < heap[child]) child++;
      if (heap[i] <= heap[child]) break;
      [heap[i], heap[child]] = [heap[child], heap[i]];
      i = child;
    }
  }
  return removed;
}

function buildSinglyLinkedList(values) {
  let head = null, tail = null;
  for (const value of values) {
    const node = {value, next: null};
    if (!head) head = node;
    else tail.next = node;
    tail = node;
  }

  let current = head;
  for (let i = 0; i < values.length; i++) {
    current = current.next;
  }

  return head;
}

function buildDoublyLinkedList(values) {
  let head = null, tail = null;
  for (const value of values) {
    const node = {value, next: null, prev: tail};
    if (!head) head = node;
    else tail.next = node;
    tail = node;
  }

  let current = head;
  for (let i = 0; i < values.length; i++) {
    current = current.next;
  }
  current = tail;
  while (current) current = current.prev;
  return head;
}

function buildCircularList(values) {
  let head = null, tail = null;
  for (const value of values) {
    const node = {value, next: null};
    if (!head) head = node;
    else tail.next = node;
    tail = node;
  }
  if (tail) tail.next = head;
  let current = head;
  for (let i = 0; i < values.length; i++) {
    current = current.next;
  }

  return head;
}

function buildAndSearchBST(values, target) {
  function insert(node, value) {
    if (!node) return {value, left: null, right: null};
    if (value < node.value) node.left = insert(node.left, value);
    if (value > node.value) node.right = insert(node.right, value);
    return node;
  }
  let root = null;
  for (const value of values) root = insert(root, value);
  let node = root;
  while (node) {
    if (node.value === target) return root;
    node = target < node.value ? node.left : node.right;
  }
  return root;
}

function treeBreadthFirst(values) {
  function insert(node, value) {
    if (!node) return {value, left: null, right: null};
    if (value < node.value) node.left = insert(node.left, value);
    if (value > node.value) node.right = insert(node.right, value);
    return node;
  }
  let root = null;
  for (const value of values) root = insert(root, value);
  const queue = root ? [root] : [], visited = [];
  while (queue.length) {
    const node = queue.shift(); visited.push(node.value);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return visited;
}

function treeDepthFirst(values) {
  function insert(node, value) {
    if (!node) return {value, left: null, right: null};
    if (value < node.value) node.left = insert(node.left, value);
    if (value > node.value) node.right = insert(node.right, value);
    return node;
  }
  let root = null;
  for (const value of values) root = insert(root, value);
  const visited = [];
  function visit(node) {
    if (!node) return;
    visited.push(node.value);
    visit(node.left);
    visit(node.right);
  }
  visit(root);
  return visited;
}

function buildAVLTree(values) {
  const height = node => node ? node.height : 0;
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
  }
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
  for (const value of values) root = insert(root, value);
  return root;
}

function buildRedBlackTree(values) {
  const height = node => node ? node.height : 0;
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
  }
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
    root = insert(root, value); root.color = 'black';
  }
  return root;
}

function graphBreadthFirst(graph, start) {
  const neighbors = Object.fromEntries(graph.nodes.map(n => [n, []]));
  for (const edge of graph.edges) {
    neighbors[edge.from].push({node: edge.to, weight: edge.weight});
    neighbors[edge.to].push({node: edge.from, weight: edge.weight});
  }
  const queue = [start], seen = new Set([start]), visited = [];
  while (queue.length) {
    const node = queue.shift(); visited.push(node);
    for (const next of neighbors[node]) {
      if (!seen.has(next.node)) {
        seen.add(next.node); queue.push(next.node);
      }
    }
  }
  return visited;
}

function graphDepthFirst(graph, start) {
  const neighbors = Object.fromEntries(graph.nodes.map(n => [n, []]));
  for (const edge of graph.edges) {
    neighbors[edge.from].push({node: edge.to, weight: edge.weight});
    neighbors[edge.to].push({node: edge.from, weight: edge.weight});
  }
  const seen = new Set(), visited = [];
  function visit(node) {
    seen.add(node); visited.push(node);
    for (const next of neighbors[node]) {
      if (!seen.has(next.node)) visit(next.node);
    }
  }
  visit(start);
  return visited;
}

function shortestDistances(graph, start) {
  const neighbors = Object.fromEntries(graph.nodes.map(n => [n, []]));
  for (const edge of graph.edges) {
    neighbors[edge.from].push({node: edge.to, weight: edge.weight});
    neighbors[edge.to].push({node: edge.from, weight: edge.weight});
  }
  const distance = Object.fromEntries(graph.nodes.map(n => [n, Infinity]));
  distance[start] = 0;
  const visited = new Set();
  while (visited.size < graph.nodes.length) {
    let node = null;
    for (const n of graph.nodes) {
      if (!visited.has(n) && (node === null || distance[n] < distance[node])) node = n;
    }
    if (node === null || distance[node] === Infinity) break;
    visited.add(node);
    for (const next of neighbors[node]) {
      const candidate = distance[node] + next.weight;
      if (candidate < distance[next.node]) {
        distance[next.node] = candidate;
      }
    }
  }
  return distance;
}

function topologicalSort(graph) {
  const incoming = Object.fromEntries(graph.nodes.map(n => [n, 0]));
  const neighbors = Object.fromEntries(graph.nodes.map(n => [n, []]));
  for (const edge of graph.edges) {
    incoming[edge.to]++; neighbors[edge.from].push(edge.to);
  }
  const queue = graph.nodes.filter(n => incoming[n] === 0);
  const order = [];
  while (queue.length) {
    const node = queue.shift(); order.push(node);
    for (const next of neighbors[node]) {
      if (--incoming[next] === 0) queue.push(next);
    }
  }
  return order.length === graph.nodes.length ? order : null;
}

function fibonacciTable(n) {
  const answer = Array(n + 1).fill(null);
  answer[0] = 0; if (n >= 1) answer[1] = 1;
  for (let i = 2; i <= n; i++) {
    answer[i] = answer[i - 1] + answer[i - 2];
  }
  return answer[n];
}

function fibonacciMemo(n) {
  const saved = Array(n + 1).fill(null);
  function fib(i) {
    if (saved[i] !== null) return saved[i];
    const value = i <= 1 ? i : fib(i - 1) + fib(i - 2);
    saved[i] = value;
    return value;
  }
  return fib(n);
}

function knapsack(values, capacity) {
  const weights = values.map((_, i) => i % 5 + 1);
  const best = Array.from({length: values.length + 1},
    () => Array(capacity + 1).fill(0));
  for (let i = 1; i <= values.length; i++) {
    for (let room = 0; room <= capacity; room++) {
      const skip = best[i - 1][room];
      const take = room >= weights[i - 1]
        ? values[i - 1] + best[i - 1][room - weights[i - 1]]
        : -Infinity;
      best[i][room] = Math.max(skip, take);
    }
  }
  return best[values.length][capacity];
}

function hashMapChaining(values, target) {
  const buckets = Array.from({length: 7}, () => []);
  for (const key of values) {
    const slot = ((key % 7) + 7) % 7;
    let entry = buckets[slot].find(e => e.key === key);
    if (entry) entry.count++;
    else buckets[slot].push({key, count: 1});
  }
  const slot = ((target % 7) + 7) % 7;
  const found = buckets[slot].some(e => e.key === target);
  return {buckets, found};
}

function hashMapProbing(values, target) {
  const size = Math.max(7, values.length * 2 + 1);
  const table = Array(size).fill(null);
  for (const key of values) {
    let slot = ((key % size) + size) % size;
    while (table[slot] && table[slot].key !== key) {
      slot = (slot + 1) % size;
    }
    if (table[slot]) table[slot].count++;
    else table[slot] = {key, count: 1};
  }
  let slot = ((target % size) + size) % size;
  while (table[slot] && table[slot].key !== target) slot = (slot + 1) % size;
  const found = Boolean(table[slot] && table[slot].key === target);
  return {table, found};
}

function hashSet(values, target) {
  const buckets = Array.from({length: 7}, () => []);
  for (const key of values) {
    const slot = ((key % 7) + 7) % 7;
    if (!buckets[slot].includes(key)) {
      buckets[slot].push(key);
    }
  }
  const slot = ((target % 7) + 7) % 7;
  const found = buckets[slot].includes(target);
  return {buckets, found};
}
if(typeof module!=="undefined") module.exports={bubbleSort,selectionSort,insertionSort,mergeSort,quickSort,radixSort,linearSearch,binarySearch,traverseArray,maxWindowSum,findPairSum,reverseString,stackDemo,queueDemo,dequeDemo,buildMinHeap,priorityQueueDemo,buildSinglyLinkedList,buildDoublyLinkedList,buildCircularList,buildAndSearchBST,treeBreadthFirst,treeDepthFirst,buildAVLTree,buildRedBlackTree,graphBreadthFirst,graphDepthFirst,shortestDistances,topologicalSort,fibonacciTable,fibonacciMemo,knapsack,hashMapChaining,hashMapProbing,hashSet};
