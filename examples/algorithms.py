class Node:
    def __init__(self, value):
        self.value, self.left, self.right = value, None, None
        self.height, self.red = 1, False
class Link:
    def __init__(self, value):
        self.value, self.count = value, 1
        self.next, self.prev = None, None

def height(node):
    return node.height if node else 0

def update_height(node):
    node.height = 1 + max(height(node.left), height(node.right))

def rotate_left(node):
    child = node.right
    node.right, child.left = child.left, node
    update_height(node); update_height(child)
    return child

def rotate_right(node):
    child = node.left
    node.left, child.right = child.right, node
    update_height(node); update_height(child)
    return child

def insert_bst(node, value):
    if node is None: return Node(value)
    if value < node.value: node.left = insert_bst(node.left, value)
    elif value > node.value: node.right = insert_bst(node.right, value)
    return node

def insert_avl(node, value):
    if node is None: return Node(value)
    if value < node.value: node.left = insert_avl(node.left, value)
    elif value > node.value: node.right = insert_avl(node.right, value)
    else: return node
    update_height(node)
    balance = height(node.left) - height(node.right)
    if balance > 1:
        if value > node.left.value: node.left = rotate_left(node.left)
        return rotate_right(node)
    if balance < -1:
        if value < node.right.value: node.right = rotate_right(node.right)
        return rotate_left(node)
    return node

def is_red(node):
    return node is not None and node.red

def insert_red_black(node, value):
    if node is None:
        node = Node(value); node.red = True
        return node
    if value < node.value: node.left = insert_red_black(node.left, value)
    elif value > node.value: node.right = insert_red_black(node.right, value)
    else: return node
    update_height(node)
    if is_red(node.right) and not is_red(node.left):
        color = node.red; node = rotate_left(node)
        node.red, node.left.red = color, True
    if is_red(node.left) and is_red(node.left.left):
        color = node.red; node = rotate_right(node)
        node.red, node.right.red = color, True
    if is_red(node.left) and is_red(node.right):
        node.red = not node.red
        node.left.red = node.right.red = False
    return node

def heap_push(heap, value):
    heap.append(value)
    i = len(heap) - 1
    while i > 0:
        parent = (i - 1) // 2
        if heap[parent] <= heap[i]: break
        heap[parent], heap[i] = heap[i], heap[parent]
        i = parent

def heap_pop(heap):
    smallest, last = heap[0], heap.pop()
    if heap: heap[0] = last
    i = 0
    while 2*i + 1 < len(heap):
        child = 2*i + 1
        if child+1 < len(heap) and heap[child+1] < heap[child]: child += 1
        if heap[i] <= heap[child]: break
        heap[i], heap[child] = heap[child], heap[i]
        i = child
    return smallest

def adjacency(graph, directed=False):
    neighbors = {node: [] for node in graph['nodes']}
    for edge in graph['edges']:
        neighbors[edge['from']].append((edge['to'], edge['weight']))
        if not directed:
            neighbors[edge['to']].append((edge['from'], edge['weight']))
    return neighbors

def bubble_sort(values):
    a = list(values)
    for end in range(len(a)-1, 0, -1):
        changed = False
        for j in range(end):
            if a[j] > a[j+1]:
                a[j], a[j+1] = a[j+1], a[j]
                changed = True
        if not changed: break
    return a

def selection_sort(values):
    a = list(values)
    for i in range(len(a)):
        smallest = i
        for j in range(i+1, len(a)):
            if a[j] < a[smallest]: smallest = j
        a[i], a[smallest] = a[smallest], a[i]
    return a

def insertion_sort(values):
    a = list(values)
    for i in range(1, len(a)):
        j = i
        while j > 0:
            if a[j-1] <= a[j]: break
            a[j-1], a[j] = a[j], a[j-1]
            j -= 1
    return a

def merge_sort(values):
    a = list(values)
    def sort(left, right):
        if left >= right: return
        mid = (left+right)//2
        sort(left, mid); sort(mid+1, right)
        first, second = a[left:mid+1], a[mid+1:right+1]
        i = j = 0; k = left
        while i < len(first) and j < len(second):
            take_left = first[i] <= second[j]
            if take_left: a[k] = first[i]; i += 1
            else: a[k] = second[j]; j += 1
            k += 1
        while i < len(first): a[k] = first[i]; i += 1; k += 1
        while j < len(second): a[k] = second[j]; j += 1; k += 1
    sort(0, len(a)-1)
    return a

def quick_sort(values):
    a = list(values)
    def sort(left, right):
        if left >= right: return
        pivot = a[right]
        next_position = left
        for j in range(left, right):
            if a[j] < pivot:
                a[next_position], a[j] = a[j], a[next_position]
                next_position += 1
        a[next_position], a[right] = a[right], a[next_position]
        sort(left, next_position-1); sort(next_position+1, right)
    sort(0, len(a)-1)
    return a

def radix_sort(values):
    a = list(values); largest = max(a, default=0); place = 1
    while place <= largest:
        buckets = [[] for _ in range(10)]
        for value in a:
            digit = (value//place)%10
            buckets[digit].append(value)
        a = [value for bucket in buckets for value in bucket]
        place *= 10
    return a

def linear_search(values, target):
    for i, value in enumerate(values):
        if value == target: return i
    return -1

def binary_search(values, target):
    a = sorted(values); left, right = 0, len(a)-1
    while left <= right:
        middle = (left+right)//2
        if a[middle] == target: return middle
        if a[middle] < target: left = middle+1
        else: right = middle-1
    return -1

def traverse_array(values):
    total = 0
    for value in values:
        total += value
    return total

def max_window_sum(values, k):
    total = 0; best = float('-inf')
    for i, value in enumerate(values):
        total += value
        if i >= k: total -= values[i-k]
        if i >= k-1: best = max(best, total)
    return best

def find_pair_sum(values, target):
    a = sorted(values); left, right = 0, len(a)-1
    while left < right:
        total = a[left]+a[right]
        if total == target: return [left, right]
        if total < target: left += 1
        else: right -= 1
    return None

def reverse_string(text):
    letters = list(text); left, right = 0, len(letters)-1
    while left < right:
        letters[left], letters[right] = letters[right], letters[left]
        left += 1; right -= 1
    return ''.join(letters)

def stack_demo(values):
    stack, removed = [], []
    for value in values: stack.append(value)
    while stack: removed.append(stack.pop())
    return removed

def queue_demo(values):
    from collections import deque
    queue, removed = deque(), []
    for value in values: queue.append(value)
    while queue: removed.append(queue.popleft())
    return removed

def deque_demo(values):
    from collections import deque
    items, removed = deque(), []
    for i, value in enumerate(values):
        if i%2 == 0: items.appendleft(value)
        else: items.append(value)
    turn = 0
    while items:
        removed.append(items.popleft() if turn%2 == 0 else items.pop())
        turn += 1
    return removed

def build_min_heap(values):
    heap = []
    for value in values: heap_push(heap, value)
    return heap

def priority_queue_demo(values):
    heap, removed = [], []
    for value in values: heap_push(heap, value)
    while heap: removed.append(heap_pop(heap))
    return removed

def singly_linked_list(values):
    head = tail = None
    for value in values:
        node = Link(value)
        
        if head is None: head = node
        else: tail.next = node
        tail = node
    
    current = head
    for _ in values: current = current.next
    
    
    return head

def doubly_linked_list(values):
    head = tail = None
    for value in values:
        node = Link(value)
        node.prev = tail
        if head is None: head = node
        else: tail.next = node
        tail = node
    
    current = head
    for _ in values: current = current.next
    current = tail
    while current: current = current.prev
    return head

def circular_linked_list(values):
    head = tail = None
    for value in values:
        node = Link(value)
        
        if head is None: head = node
        else: tail.next = node
        tail = node
    if tail: tail.next = head
    current = head
    for _ in values: current = current.next
    
    
    return head

def build_and_search_bst(values, target):
    root = None
    for value in values: root = insert_bst(root, value)
    node = root
    while node:
        if node.value == target: return root
        node = node.left if target < node.value else node.right
    return root

def tree_breadth_first(values):
    from collections import deque
    root = None
    for value in values: root = insert_bst(root, value)
    queue, visited = deque([root] if root else []), []
    while queue:
        node = queue.popleft(); visited.append(node.value)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
    return visited

def tree_depth_first(values):
    root = None
    for value in values: root = insert_bst(root, value)
    visited = []
    def visit(node):
        if node is None: return
        visited.append(node.value)
        visit(node.left); visit(node.right)
    visit(root)
    return visited

def build_avl_tree(values):
    root = None
    for value in values: root = insert_avl(root, value)
    return root

def build_red_black_tree(values):
    root = None
    for value in values:
        root = insert_red_black(root, value); root.red = False
    return root

def graph_breadth_first(graph, start):
    from collections import deque
    neighbors = adjacency(graph)
    queue, seen, visited = deque([start]), {start}, []
    while queue:
        node = queue.popleft(); visited.append(node)
        for next_node, _ in neighbors[node]:
            if next_node not in seen:
                seen.add(next_node); queue.append(next_node)
    return visited

def graph_depth_first(graph, start):
    neighbors = adjacency(graph); seen, visited = set(), []
    def visit(node):
        seen.add(node); visited.append(node)
        for next_node, _ in neighbors[node]:
            if next_node not in seen: visit(next_node)
    visit(start)
    return visited

def shortest_distances(graph, start):
    neighbors = adjacency(graph)
    distance = {node: float('inf') for node in graph['nodes']}
    distance[start] = 0
    seen = set()
    while len(seen) < len(graph['nodes']):
        remaining = [node for node in graph['nodes'] if node not in seen]
        node = min(remaining, key=distance.get)
        if distance[node] == float('inf'): break
        seen.add(node)
        for next_node, weight in neighbors[node]:
            candidate = distance[node]+weight
            if candidate < distance[next_node]: distance[next_node] = candidate
    return distance

def topological_sort(graph):
    from collections import deque
    neighbors = adjacency(graph, directed=True)
    incoming = {node: 0 for node in graph['nodes']}
    for edge in graph['edges']: incoming[edge['to']] += 1
    queue = deque(node for node in graph['nodes'] if incoming[node] == 0)
    order = []
    while queue:
        node = queue.popleft(); order.append(node)
        for next_node, _ in neighbors[node]:
            incoming[next_node] -= 1
            if incoming[next_node] == 0: queue.append(next_node)
    return order if len(order) == len(graph['nodes']) else None

def fibonacci_table(n):
    answer = [None]*(n+1)
    answer[0] = 0
    if n >= 1: answer[1] = 1
    for i in range(2, n+1): answer[i] = answer[i-1]+answer[i-2]
    return answer[n]

def fibonacci_memo(n):
    saved = [None]*(n+1)
    def fib(i):
        if saved[i] is not None: return saved[i]
        value = i if i <= 1 else fib(i-1)+fib(i-2)
        saved[i] = value
        return value
    return fib(n)

def knapsack(values, capacity):
    best = [[0]*(capacity+1) for _ in range(len(values)+1)]
    for i, value in enumerate(values, start=1):
        weight = (i-1)%5+1
        for room in range(capacity+1):
            skip = best[i-1][room]
            take = value+best[i-1][room-weight] if room >= weight else float('-inf')
            best[i][room] = max(skip, take)
    return best[-1][capacity]

def hash_map_chaining(values, target):
    buckets = [[] for _ in range(7)]
    for key in values:
        slot = key%7
        entry = next((item for item in buckets[slot] if item[0] == key), None)
        if entry is not None: entry[1] += 1
        else: buckets[slot].append([key, 1])
    found = any(item[0] == target for item in buckets[target%7])
    return buckets, found

def hash_set(values, target):
    buckets = [[] for _ in range(7)]
    for key in values:
        slot = key%7
        entry = next((item for item in buckets[slot] if item[0] == key), None)
        if entry is not None: pass
        else: buckets[slot].append([key, 1])
    found = any(item[0] == target for item in buckets[target%7])
    return buckets, found

def hash_map_probing(values, target):
    size = max(7, len(values)*2+1); table = [None]*size
    for key in values:
        slot = key%size
        while table[slot] is not None and table[slot][0] != key:
            slot = (slot+1)%size
        if table[slot] is not None: table[slot][1] += 1
        else: table[slot] = [key, 1]
    slot = target%size
    while table[slot] is not None and table[slot][0] != target:
        slot = (slot+1)%size
    return table, table[slot] is not None
