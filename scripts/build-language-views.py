from pathlib import Path
import json,re
root=Path(__file__).resolve().parents[1]; data={k:{} for k in ['python','c','cpp','java']}; cfuncs={}; pyfuncs={}
def parse(source):
 tags={};lines=[]
 for line in source.strip().splitlines():
  m=re.search(r'\s*(?://|#) @([\w,]+)\s*$',line)
  if m:
   for key in m[1].split(','):tags[key]=len(lines)+1
   line=line[:m.start()]
  lines.append(line)
 return dict(source='\n'.join(lines),lines=lines,tags=tags)
def cadd(id,source):cfuncs[id]=source.strip()
def pyadd(id,source):pyfuncs[id]=source.strip()
C_TYPES=r'''
#include <stdlib.h>
#include <stdbool.h>
#include <stdint.h>
#include <limits.h>
#include <math.h>
/* Input bounds used by the app: 25 integer values, 12 graph nodes, 40 edges, DP n/capacity <= 20. */
typedef struct { int data[64]; int count; } IntList;
typedef struct Node { int value, height; bool red; struct Node *left, *right; } Node;
typedef struct Link { int value, count; struct Link *next, *prev; } Link;
typedef struct { int from, to; double weight; } Edge;
typedef struct { int nodes[12], nodeCount, edgeCount; Edge edges[40]; } Graph;
typedef struct { int count[12], next[12][80]; double weight[12][80]; } Adj;
typedef struct { double data[12]; int count; } Distances;
typedef struct { Link *buckets[64]; int size; bool found; } HashTable;
'''
JAVA_TYPES=r'''
public class Algorithms {
  static class IntList { int[] data = new int[64]; int count; }
  static class Node { int value, height; boolean red; Node left, right; }
  static class Link { int value, count; Link next, prev; }
  static class Edge { int from, to; double weight; }
  static class Graph { int[] nodes = new int[12]; int nodeCount, edgeCount; Edge[] edges = new Edge[40]; }
  static class Adj { int[] count = new int[12]; int[][] next = new int[12][80]; double[][] weight = new double[12][80]; }
  static class Distances { double[] data = new double[12]; int count; }
  static class HashTable { Link[] buckets = new Link[64]; int size; boolean found; }
'''
def java(source):
 s=source
 s=re.sub(r'const int (\w+)\[\]',r'int[] \1',s);s=re.sub(r'(?<!const )int (\w+)\[\]',r'int[] \1',s);s=re.sub(r'uint32_t (\w+)\[\]',r'int[] \1',s)
 s=re.sub(r'(?:const )?(Node|Link|Graph|Adj|IntList|HashTable|Distances)\s*\*\s*(\w+)',r'\1 \2',s)
 s=s.replace('->','.').replace('NULL','null').replace('bool ','boolean ').replace('INT_MIN','Integer.MIN_VALUE').replace('INFINITY','Double.POSITIVE_INFINITY').replace('fmax(','Math.max(')
 s=re.sub(r'&(heap|adj|visited|output)',r'\1',s)
 s=re.sub(r'(int|double) (\w+)\[(\d+)\]\[(\d+)\](?: = \{\{0\}\})?;',r'\1[][] \2 = new \1[\3][\4];',s)
 s=re.sub(r'(int|double|bool) (\w+)\[(\d+)\](?: = \{0\})?;',r'\1[] \2 = new \1[\3];',s)
 s=re.sub(r'^(IntList|Node|Link|Distances|HashTable|int|void|double|boolean) (\w+)\(',r'static \1 \2(',s,flags=re.M)
 return s
C_HELPERS=r'''
IntList emptyList(void) { IntList a = {0}; return a; }
IntList copyValues(const int values[], int n) { IntList a = emptyList(); a.count=n; for(int i=0;i<n;i++) a.data[i]=values[i]; return a; }
Node *newNode(int value) { Node *n=(Node*)calloc(1,sizeof(Node)); n->value=value; n->height=1; return n; }
Link *newLink(int value) { Link *n=(Link*)calloc(1,sizeof(Link)); n->value=value; n->count=1; return n; }
int height(Node *n) { return n!=NULL?n->height:0; }
void updateHeight(Node *n) { int left=height(n->left),right=height(n->right); n->height=1+(left>right?left:right); }
Node *rotateLeft(Node *n) { Node *child=n->right; n->right=child->left; child->left=n; updateHeight(n);updateHeight(child);return child; }
Node *rotateRight(Node *n) { Node *child=n->left; n->left=child->right;child->right=n;updateHeight(n);updateHeight(child);return child; }
bool isRed(Node *n) { return n!=NULL&&n->red; }
Node *insertBST(Node *node,int value) { if(node==NULL)return newNode(value);if(value<node->value)node->left=insertBST(node->left,value);else if(value>node->value)node->right=insertBST(node->right,value);return node; }
Node *insertAVL(Node *node,int value) {
 if(node==NULL)return newNode(value);
 if(value<node->value)node->left=insertAVL(node->left,value);else if(value>node->value)node->right=insertAVL(node->right,value);else return node;
 updateHeight(node);int balance=height(node->left)-height(node->right);
 if(balance>1){if(value>node->left->value)node->left=rotateLeft(node->left);return rotateRight(node);}
 if(balance < -1){if(value<node->right->value)node->right=rotateRight(node->right);return rotateLeft(node);}return node;
}
Node *insertRedBlack(Node *node,int value) {
 if(node==NULL){Node *fresh=newNode(value);fresh->red=true;return fresh;}
 if(value<node->value)node->left=insertRedBlack(node->left,value);else if(value>node->value)node->right=insertRedBlack(node->right,value);else return node;
 updateHeight(node);
 if(isRed(node->right)&&!isRed(node->left)){bool color=node->red;node=rotateLeft(node);node->red=color;node->left->red=true;}
 if(isRed(node->left)&&isRed(node->left->left)){bool color=node->red;node=rotateRight(node);node->red=color;node->right->red=true;}
 if(isRed(node->left)&&isRed(node->right)){node->red=!node->red;node->left->red=false;node->right->red=false;}return node;
}
void heapPush(IntList *heap,int value) {
 heap->data[heap->count++]=value; // @insert
 int i=heap->count-1;
 while(i>0){int parent=(i-1)/2;
  if(heap->data[parent]<=heap->data[i])break; // @compare
  int temp=heap->data[i];heap->data[i]=heap->data[parent];heap->data[parent]=temp; // @change,swap
  i=parent;
 }
}
int heapPop(IntList *heap) {
 int smallest=heap->data[0];heap->count--;heap->data[0]=heap->data[heap->count]; // @remove
 int i=0;
 while(2*i+1<heap->count){int child=2*i+1;
  if(child+1<heap->count&&heap->data[child+1]<heap->data[child])child++; // @children
  if(heap->data[i]<=heap->data[child])break; // @downCompare
  int temp=heap->data[i];heap->data[i]=heap->data[child];heap->data[child]=temp; // @downSwap
  i=child;
 }return smallest;
}
int nodeIndex(const Graph *graph,int key) {for(int i=0;i<graph->nodeCount;i++)if(graph->nodes[i]==key)return i;return -1;}
Adj emptyAdj(void) { Adj a={0};return a; }
void buildAdj(Adj *adj,const Graph *graph,bool directed) {for(int i=0;i<graph->edgeCount;i++){int from=nodeIndex(graph,graph->edges[i].from),to=nodeIndex(graph,graph->edges[i].to);int at=adj->count[from]++;adj->next[from][at]=to;adj->weight[from][at]=graph->edges[i].weight;if(!directed){at=adj->count[to]++;adj->next[to][at]=from;adj->weight[to][at]=graph->edges[i].weight;}}}
HashTable emptyHash(int size) {HashTable table={0};table.size=size;return table;}
int bucketFor(int key,int size) { return ((key%size)+size)%size; }
'''
JAVA_HELPERS=java(C_HELPERS)
JAVA_HELPERS=re.sub(r'static IntList emptyList\(void\) \{.*?\}', 'static IntList emptyList() { return new IntList(); }',JAVA_HELPERS)
JAVA_HELPERS=JAVA_HELPERS.replace('emptyList(void)','emptyList()').replace('emptyAdj(void)','emptyAdj()')
JAVA_HELPERS=re.sub(r'static Node newNode\(int value\) \{.*?\}', 'static Node newNode(int value) { Node n=new Node(); n.value=value;n.height=1;return n; }',JAVA_HELPERS)
JAVA_HELPERS=re.sub(r'static Link newLink\(int value\) \{.*?\}', 'static Link newLink(int value) { Link n=new Link();n.value=value;n.count=1;return n; }',JAVA_HELPERS)
JAVA_HELPERS=re.sub(r'static Adj emptyAdj\(\) \{.*?\}', 'static Adj emptyAdj() { return new Adj(); }',JAVA_HELPERS)
JAVA_HELPERS=re.sub(r'static HashTable emptyHash\(int size\) \{.*?\}', 'static HashTable emptyHash(int size) { HashTable table=new HashTable();table.size=size;return table; }',JAVA_HELPERS)
PY_HELPERS=r'''
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
    heap.append(value) # @insert
    i = len(heap) - 1
    while i > 0:
        parent = (i - 1) // 2
        if heap[parent] <= heap[i]: break # @compare
        heap[parent], heap[i] = heap[i], heap[parent] # @change,swap
        i = parent

def heap_pop(heap):
    smallest, last = heap[0], heap.pop() # @remove
    if heap: heap[0] = last
    i = 0
    while 2*i + 1 < len(heap):
        child = 2*i + 1
        if child+1 < len(heap) and heap[child+1] < heap[child]: child += 1 # @children
        if heap[i] <= heap[child]: break # @downCompare
        heap[i], heap[child] = heap[child], heap[i] # @downSwap
        i = child
    return smallest

def adjacency(graph, directed=False):
    neighbors = {node: [] for node in graph['nodes']}
    for edge in graph['edges']:
        neighbors[edge['from']].append((edge['to'], edge['weight']))
        if not directed:
            neighbors[edge['to']].append((edge['from'], edge['weight']))
    return neighbors
'''
cadd('bubble',r'''IntList bubbleSort(const int values[], int n) {
 IntList a=copyValues(values,n);
 for(int end=n-1;end>0;end--){bool changed=false;
  for(int j=0;j<end;j++){
   if(a.data[j]>a.data[j+1]){ // @compare
    int temp=a.data[j];a.data[j]=a.data[j+1];a.data[j+1]=temp; // @swap
    changed=true;
   }
  }if(!changed)break;
 }return a; // @done
}''')
pyadd('bubble',r'''def bubble_sort(values):
    a = list(values)
    for end in range(len(a)-1, 0, -1):
        changed = False
        for j in range(end):
            if a[j] > a[j+1]: # @compare
                a[j], a[j+1] = a[j+1], a[j] # @swap
                changed = True
        if not changed: break
    return a # @done''')
cadd('selection',r'''IntList selectionSort(const int values[],int n) {
 IntList a=copyValues(values,n);
 for(int i=0;i<n;i++){int smallest=i;
  for(int j=i+1;j<n;j++){
   if(a.data[j]<a.data[smallest])smallest=j; // @compare
  }if(smallest!=i){int temp=a.data[i];a.data[i]=a.data[smallest];a.data[smallest]=temp;} // @swap
 }return a; // @done
}''')
pyadd('selection',r'''def selection_sort(values):
    a = list(values)
    for i in range(len(a)):
        smallest = i
        for j in range(i+1, len(a)):
            if a[j] < a[smallest]: smallest = j # @compare
        a[i], a[smallest] = a[smallest], a[i] # @swap
    return a # @done''')
cadd('insertion',r'''IntList insertionSort(const int values[],int n) {
 IntList a=copyValues(values,n);
 for(int i=1;i<n;i++){int j=i;
  while(j>0){
   if(a.data[j-1]<=a.data[j])break; // @compare
   int temp=a.data[j];a.data[j]=a.data[j-1];a.data[j-1]=temp; // @swap
   j--;
  }
 }return a; // @done
}''')
pyadd('insertion',r'''def insertion_sort(values):
    a = list(values)
    for i in range(1, len(a)):
        j = i
        while j > 0:
            if a[j-1] <= a[j]: break # @compare
            a[j-1], a[j] = a[j], a[j-1] # @swap
            j -= 1
    return a # @done''')
cadd('merge',r'''void mergeRange(IntList *a,int left,int right) {
 if(left>=right)return;
 int mid=(left+right)/2;mergeRange(a,left,mid);mergeRange(a,mid+1,right);
 int first[64];int second[64];int x=mid-left+1,y=right-mid;
 for(int i=0;i<x;i++)first[i]=a->data[left+i];
 for(int j=0;j<y;j++)second[j]=a->data[mid+1+j];
 int i=0,j=0,k=left;
 while(i<x&&j<y){
  bool takeLeft=first[i]<=second[j]; // @compare
  a->data[k++]=takeLeft?first[i++]:second[j++]; // @write
 }
 while(i<x)a->data[k++]=first[i++]; // @writeLeft
 while(j<y)a->data[k++]=second[j++]; // @writeRight
}
IntList mergeSort(const int values[],int n) {
 IntList a=copyValues(values,n);mergeRange(&a,0,n-1);
 return a; // @done
}''')
pyadd('merge',r'''def merge_sort(values):
    a = list(values)
    def sort(left, right):
        if left >= right: return
        mid = (left+right)//2
        sort(left, mid); sort(mid+1, right)
        first, second = a[left:mid+1], a[mid+1:right+1]
        i = j = 0; k = left
        while i < len(first) and j < len(second):
            take_left = first[i] <= second[j] # @compare
            if take_left: a[k] = first[i]; i += 1
            else: a[k] = second[j]; j += 1 # @write
            k += 1
        while i < len(first): a[k] = first[i]; i += 1; k += 1 # @writeLeft
        while j < len(second): a[k] = second[j]; j += 1; k += 1 # @writeRight
    sort(0, len(a)-1)
    return a # @done''')
cadd('quick',r'''void quickRange(IntList *a,int left,int right) {
 if(left>=right)return;
 int pivot=a->data[right]; // @visit
 int next=left;
 for(int j=left;j<right;j++){
  if(a->data[j]<pivot){ // @compare
   int temp=a->data[next];a->data[next]=a->data[j];a->data[j]=temp; // @swap
   next++;
  }
 }
 int temp=a->data[next];a->data[next]=a->data[right];a->data[right]=temp; // @pivotSwap
 quickRange(a,left,next-1);quickRange(a,next+1,right);
}
IntList quickSort(const int values[],int n) {
 IntList a=copyValues(values,n);quickRange(&a,0,n-1);
 return a; // @done
}''')
pyadd('quick',r'''def quick_sort(values):
    a = list(values)
    def sort(left, right):
        if left >= right: return
        pivot = a[right] # @visit
        next_position = left
        for j in range(left, right):
            if a[j] < pivot: # @compare
                a[next_position], a[j] = a[j], a[next_position] # @swap
                next_position += 1
        a[next_position], a[right] = a[right], a[next_position] # @pivotSwap
        sort(left, next_position-1); sort(next_position+1, right)
    sort(0, len(a)-1)
    return a # @done''')
cadd('radix',r'''IntList radixSort(const int values[],int n) {
 IntList a=copyValues(values,n);int largest=0;
 for(int i=0;i<n;i++)if(a.data[i]>largest)largest=a.data[i];
 for(int place=1;place<=largest;place*=10){
  int buckets[10][64];int count[10]={0};
  for(int i=0;i<n;i++){int digit=(a.data[i]/place)%10;
   buckets[digit][count[digit]++]=a.data[i]; // @visit,hash
  }
  int next=0;
  for(int digit=0;digit<10;digit++)for(int j=0;j<count[digit];j++)a.data[next++]=buckets[digit][j]; // @write
 }return a; // @done
}''')
pyadd('radix',r'''def radix_sort(values):
    a = list(values); largest = max(a, default=0); place = 1
    while place <= largest:
        buckets = [[] for _ in range(10)]
        for value in a:
            digit = (value//place)%10
            buckets[digit].append(value) # @visit,hash
        a = [value for bucket in buckets for value in bucket] # @write
        place *= 10
    return a # @done''')
cadd('linear',r'''int linearSearch(const int values[],int n,int target) {
 for(int i=0;i<n;i++){
  if(values[i]==target)return i; // @compare,found
 }return -1; // @done
}''')
pyadd('linear',r'''def linear_search(values, target):
    for i, value in enumerate(values):
        if value == target: return i # @compare,found
    return -1 # @done''')
cadd('binary',r'''int binarySearch(const int values[],int n,int target) {
 IntList a=insertionSort(values,n);int left=0,right=n-1;
 while(left<=right){int middle=(left+right)/2;
  if(a.data[middle]==target)return middle; // @compare,found
  if(a.data[middle]<target)left=middle+1;else right=middle-1;
 }return -1; // @done
}''')
pyadd('binary',r'''def binary_search(values, target):
    a = sorted(values); left, right = 0, len(a)-1
    while left <= right:
        middle = (left+right)//2
        if a[middle] == target: return middle # @compare,found
        if a[middle] < target: left = middle+1
        else: right = middle-1
    return -1 # @done''')
cadd('traverse',r'''int traverseArray(const int values[],int n) {
 int total=0;
 for(int i=0;i<n;i++)total+=values[i]; // @visit
 return total; // @done
}''')
pyadd('traverse',r'''def traverse_array(values):
    total = 0
    for value in values:
        total += value # @visit
    return total # @done''')
cadd('sliding',r'''int maxWindowSum(const int values[],int n,int k) {
 int sum=0,best=INT_MIN;
 for(int i=0;i<n;i++){
  sum+=values[i];if(i>=k)sum-=values[i-k];
  if(i>=k-1&&sum>best)best=sum; // @visit
 }return best; // @done
}''')
pyadd('sliding',r'''def max_window_sum(values, k):
    total = 0; best = float('-inf')
    for i, value in enumerate(values):
        total += value
        if i >= k: total -= values[i-k]
        if i >= k-1: best = max(best, total) # @visit
    return best # @done''')
cadd('two_pointer',r'''IntList findPairSum(const int values[],int n,int target) {
 IntList a=insertionSort(values,n),pair=emptyList();int left=0,right=n-1;
 while(left<right){
  int sum=a.data[left]+a.data[right]; // @compare
  if(sum==target){pair.data[0]=left;pair.data[1]=right;pair.count=2;return pair;} // @found
  if(sum<target)left++;else right--;
 }return pair; // @done
}''')
pyadd('two_pointer',r'''def find_pair_sum(values, target):
    a = sorted(values); left, right = 0, len(a)-1
    while left < right:
        total = a[left]+a[right] # @compare
        if total == target: return [left, right] # @found
        if total < target: left += 1
        else: right -= 1
    return None # @done''')
cadd('reverse_string',r'''void reverseCodepoints(uint32_t letters[],int n) {
 /* letters contains decoded Unicode code points, not UTF-8 bytes. */
 int left=0,right=n-1;
 while(left<right){ // @visit
  uint32_t temp=letters[left];letters[left]=letters[right];letters[right]=temp; // @change,swap
  left++;right--;
 }return; // @done
}''')
pyadd('reverse_string',r'''def reverse_string(text):
    letters = list(text); left, right = 0, len(letters)-1
    while left < right: # @visit
        letters[left], letters[right] = letters[right], letters[left] # @change,swap
        left += 1; right -= 1
    return ''.join(letters) # @done''')
cadd('stack',r'''IntList stackDemo(const int values[],int n) {
 IntList stack=emptyList(),removed=emptyList();
 for(int i=0;i<n;i++)stack.data[stack.count++]=values[i]; // @insert,change
 while(stack.count>0)removed.data[removed.count++]=stack.data[--stack.count]; // @remove
 return removed; // @done
}''')
pyadd('stack',r'''def stack_demo(values):
    stack, removed = [], []
    for value in values: stack.append(value) # @insert,change
    while stack: removed.append(stack.pop()) # @remove
    return removed # @done''')
cadd('queue',r'''IntList queueDemo(const int values[],int n) {
 IntList queue=emptyList(),removed=emptyList();
 for(int i=0;i<n;i++)queue.data[queue.count++]=values[i]; // @insert,change
 int front=0;
 while(front<queue.count)removed.data[removed.count++]=queue.data[front++]; // @remove
 return removed; // @done
}''')
pyadd('queue',r'''def queue_demo(values):
    from collections import deque
    queue, removed = deque(), []
    for value in values: queue.append(value) # @insert,change
    while queue: removed.append(queue.popleft()) # @remove
    return removed # @done''')
cadd('deque',r'''IntList dequeDemo(const int values[],int n) {
 int deque[64];int front=32,back=32;IntList removed=emptyList();
 for(int i=0;i<n;i++){
  if(i%2==0)deque[--front]=values[i]; // @insert,change
  else deque[back++]=values[i]; // @back
 }
 int turn=0;
 while(front<back){int index=(turn++%2==0)?front++:--back;
  removed.data[removed.count++]=deque[index]; // @remove
 }return removed; // @done
}''')
pyadd('deque',r'''def deque_demo(values):
    from collections import deque
    items, removed = deque(), []
    for i, value in enumerate(values):
        if i%2 == 0: items.appendleft(value) # @insert,change
        else: items.append(value) # @back
    turn = 0
    while items:
        removed.append(items.popleft() if turn%2 == 0 else items.pop()) # @remove
        turn += 1
    return removed # @done''')
cadd('heap',r'''IntList buildMinHeap(const int values[],int n) {
 IntList heap=emptyList();
 for(int i=0;i<n;i++)heapPush(&heap,values[i]);
 return heap; // @done
}''')
pyadd('heap',r'''def build_min_heap(values):
    heap = []
    for value in values: heap_push(heap, value)
    return heap # @done''')
cadd('priority',r'''IntList priorityQueueDemo(const int values[],int n) {
 IntList heap=emptyList(),removed=emptyList();
 for(int i=0;i<n;i++)heapPush(&heap,values[i]);
 while(heap.count>0)removed.data[removed.count++]=heapPop(&heap);
 return removed; // @done
}''')
pyadd('priority',r'''def priority_queue_demo(values):
    heap, removed = [], []
    for value in values: heap_push(heap, value)
    while heap: removed.append(heap_pop(heap))
    return removed # @done''')
for id,name in [('singly','buildSinglyLinkedList'),('doubly','buildDoublyLinkedList'),('circular','buildCircularList')]:
 cadd(id,f'''Link *{name}(const int values[],int n) {{
 Link *head=NULL;Link *tail=NULL;
 for(int i=0;i<n;i++){{Link *node=newLink(values[i]);
  {'node->prev=tail;' if id=='doubly' else ''}
  if(head==NULL)head=node;else tail->next=node; // @insert,change
  tail=node;
 }}
 {'if(tail!=NULL)tail->next=head; // @link' if id=='circular' else ''}
 Link *current=head;
 for(int i=0;i<n;i++)current=current->next; // @visit
 {'current=tail;while(current!=NULL)current=current->prev; // @backward' if id=='doubly' else ''}
 return head; // @done
}}''')
 pyadd(id,f'''def {id}_linked_list(values):
    head = tail = None
    for value in values:
        node = Link(value)
        {'node.prev = tail' if id=='doubly' else ''}
        if head is None: head = node
        else: tail.next = node # @insert,change
        tail = node
    {'if tail: tail.next = head # @link' if id=='circular' else ''}
    current = head
    for _ in values: current = current.next # @visit
    {'current = tail' if id=='doubly' else ''}
    {'while current: current = current.prev # @backward' if id=='doubly' else ''}
    return head # @done''')
cadd('bst',r'''Node *buildAndSearchBST(const int values[],int n,int target) {
 Node *root=NULL;
 for(int i=0;i<n;i++)root=insertBST(root,values[i]); // @insert,change
 Node *node=root;
 while(node!=NULL){
  if(node->value==target)return root; // @compare,found
  node=target<node->value?node->left:node->right;
 }return root; // @done
}''')
pyadd('bst',r'''def build_and_search_bst(values, target):
    root = None
    for value in values: root = insert_bst(root, value) # @insert,change
    node = root
    while node:
        if node.value == target: return root # @compare,found
        node = node.left if target < node.value else node.right
    return root # @done''')
cadd('bfs_tree',r'''IntList treeBreadthFirst(const int values[],int n) {
 Node *root=NULL;for(int i=0;i<n;i++)root=insertBST(root,values[i]);
 Node *queue[64];int front=0,back=0;IntList visited=emptyList();
 if(root!=NULL)queue[back++]=root; // @initial
 while(front<back){Node *node=queue[front++];visited.data[visited.count++]=node->value;
  if(node->left!=NULL)queue[back++]=node->left;
  if(node->right!=NULL)queue[back++]=node->right; // @visit
 }return visited; // @done
}''')
pyadd('bfs_tree',r'''def tree_breadth_first(values):
    from collections import deque
    root = None
    for value in values: root = insert_bst(root, value)
    queue, visited = deque([root] if root else []), [] # @initial
    while queue:
        node = queue.popleft(); visited.append(node.value)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right) # @visit
    return visited # @done''')
cadd('dfs_tree',r'''void visitTree(Node *node,IntList *visited) {
 if(node==NULL)return;
 visited->data[visited->count++]=node->value; // @visit
 visitTree(node->left,visited);visitTree(node->right,visited);
}
IntList treeDepthFirst(const int values[],int n) {
 Node *root=NULL;for(int i=0;i<n;i++)root=insertBST(root,values[i]);
 IntList visited=emptyList();visitTree(root,&visited);
 return visited; // @done
}''')
pyadd('dfs_tree',r'''def tree_depth_first(values):
    root = None
    for value in values: root = insert_bst(root, value)
    visited = []
    def visit(node):
        if node is None: return
        visited.append(node.value) # @visit
        visit(node.left); visit(node.right)
    visit(root)
    return visited # @done''')
cadd('avl',r'''Node *buildAVLTree(const int values[],int n) {
 Node *root=NULL;
 for(int i=0;i<n;i++)root=insertAVL(root,values[i]); // @insert,change,repair
 return root; // @done
}''')
pyadd('avl',r'''def build_avl_tree(values):
    root = None
    for value in values: root = insert_avl(root, value) # @insert,change,repair
    return root # @done''')
cadd('redblack',r'''Node *buildRedBlackTree(const int values[],int n) {
 Node *root=NULL;
 for(int i=0;i<n;i++){
  root=insertRedBlack(root,values[i]);root->red=false; // @insert,change,repair
 }return root; // @done
}''')
pyadd('redblack',r'''def build_red_black_tree(values):
    root = None
    for value in values:
        root = insert_red_black(root, value); root.red = False # @insert,change,repair
    return root # @done''')
cadd('bfs_graph',r'''IntList graphBreadthFirst(const Graph *graph,int start) {
 Adj adj=emptyAdj();buildAdj(&adj,graph,false);IntList visited=emptyList();
 int seen[12]={0};int queue[64];int front=0,back=0;
 int first=nodeIndex(graph,start);if(first<0)return visited;
 queue[back++]=first;seen[first]=1; // @initial
 while(front<back){int node=queue[front++];visited.data[visited.count++]=graph->nodes[node];
  for(int j=0;j<adj.count[node];j++){int next=adj.next[node][j];
   if(seen[next]==0){seen[next]=1;queue[back++]=next;} // @visit
  }
 }return visited; // @done
}''')
pyadd('bfs_graph',r'''def graph_breadth_first(graph, start):
    from collections import deque
    neighbors = adjacency(graph)
    queue, seen, visited = deque([start]), {start}, [] # @initial
    while queue:
        node = queue.popleft(); visited.append(node)
        for next_node, _ in neighbors[node]:
            if next_node not in seen:
                seen.add(next_node); queue.append(next_node) # @visit
    return visited # @done''')
cadd('dfs_graph',r'''void visitGraph(int node,const Graph *graph,Adj *adj,int seen[],IntList *visited) {
 seen[node]=1;visited->data[visited->count++]=graph->nodes[node]; // @visit
 for(int j=0;j<adj->count[node];j++){int next=adj->next[node][j];if(seen[next]==0)visitGraph(next,graph,adj,seen,visited);}
}
IntList graphDepthFirst(const Graph *graph,int start) {
 Adj adj=emptyAdj();buildAdj(&adj,graph,false);IntList visited=emptyList();int seen[12]={0};
 int first=nodeIndex(graph,start);if(first>=0)visitGraph(first,graph,&adj,seen,&visited);
 return visited; // @done
}''')
pyadd('dfs_graph',r'''def graph_depth_first(graph, start):
    neighbors = adjacency(graph); seen, visited = set(), []
    def visit(node):
        seen.add(node); visited.append(node) # @visit
        for next_node, _ in neighbors[node]:
            if next_node not in seen: visit(next_node)
    visit(start)
    return visited # @done''')
cadd('dijkstra',r'''Distances shortestDistances(const Graph *graph,int start) {
 Adj adj=emptyAdj();buildAdj(&adj,graph,false);Distances result=emptyDistances();result.count=graph->nodeCount;
 int seen[12]={0};for(int i=0;i<graph->nodeCount;i++)result.data[i]=INFINITY;
 int first=nodeIndex(graph,start);if(first<0)return result;
 result.data[first]=0; // @initial
 for(int turn=0;turn<graph->nodeCount;turn++){int node=-1;
  for(int i=0;i<graph->nodeCount;i++)if(seen[i]==0&&(node<0||result.data[i]<result.data[node]))node=i;
  if(node<0||result.data[node]==INFINITY)break;
  seen[node]=1; // @visit,choose
  for(int j=0;j<adj.count[node];j++){int next=adj.next[node][j];
   double candidate=result.data[node]+adj.weight[node][j]; // @compare
   if(candidate<result.data[next])result.data[next]=candidate; // @change
  }
 }return result; // @done
}''')
pyadd('dijkstra',r'''def shortest_distances(graph, start):
    neighbors = adjacency(graph)
    distance = {node: float('inf') for node in graph['nodes']}
    distance[start] = 0 # @initial
    seen = set()
    while len(seen) < len(graph['nodes']):
        remaining = [node for node in graph['nodes'] if node not in seen]
        node = min(remaining, key=distance.get)
        if distance[node] == float('inf'): break
        seen.add(node) # @visit,choose
        for next_node, weight in neighbors[node]:
            candidate = distance[node]+weight # @compare
            if candidate < distance[next_node]: distance[next_node] = candidate # @change
    return distance # @done''')
cadd('topological',r'''IntList topologicalSort(const Graph *graph) {
 Adj adj=emptyAdj();buildAdj(&adj,graph,true);IntList order=emptyList();
 int incoming[12]={0};for(int i=0;i<graph->edgeCount;i++)incoming[nodeIndex(graph,graph->edges[i].to)]++;
 int queue[64];int front=0,back=0;
 for(int i=0;i<graph->nodeCount;i++)if(incoming[i]==0)queue[back++]=i; // @initial,visit
 while(front<back){int node=queue[front++];order.data[order.count++]=graph->nodes[node];
  for(int j=0;j<adj.count[node];j++){int next=adj.next[node][j];
   if(--incoming[next]==0)queue[back++]=next; // @change
  }
 }
 if(order.count!=graph->nodeCount)order.count=-1;
 return order; // @done
}''')
pyadd('topological',r'''def topological_sort(graph):
    from collections import deque
    neighbors = adjacency(graph, directed=True)
    incoming = {node: 0 for node in graph['nodes']}
    for edge in graph['edges']: incoming[edge['to']] += 1
    queue = deque(node for node in graph['nodes'] if incoming[node] == 0) # @initial,visit
    order = []
    while queue:
        node = queue.popleft(); order.append(node)
        for next_node, _ in neighbors[node]:
            incoming[next_node] -= 1
            if incoming[next_node] == 0: queue.append(next_node) # @change
    return order if len(order) == len(graph['nodes']) else None # @done''')
cadd('fibonacci',r'''int fibonacciTable(int n) {
 int answer[21];answer[0]=0;if(n>=1)answer[1]=1; // @initial
 for(int i=2;i<=n;i++)answer[i]=answer[i-1]+answer[i-2]; // @change
 return answer[n]; // @done
}''')
pyadd('fibonacci',r'''def fibonacci_table(n):
    answer = [None]*(n+1)
    answer[0] = 0
    if n >= 1: answer[1] = 1 # @initial
    for i in range(2, n+1): answer[i] = answer[i-1]+answer[i-2] # @change
    return answer[n] # @done''')
cadd('memoization',r'''int fibMemo(int saved[],int i) {
 if(saved[i]>=0)return saved[i]; // @cache
 int value=i<=1?i:fibMemo(saved,i-1)+fibMemo(saved,i-2); // @visit,ask
 saved[i]=value; // @change,save
 return value;
}
int fibonacciMemo(int n) {
 int saved[21];for(int i=0;i<=n;i++)saved[i]=-1;
 return fibMemo(saved,n); // @done
}''')
pyadd('memoization',r'''def fibonacci_memo(n):
    saved = [None]*(n+1)
    def fib(i):
        if saved[i] is not None: return saved[i] # @cache
        value = i if i <= 1 else fib(i-1)+fib(i-2) # @visit,ask
        saved[i] = value # @change,save
        return value
    return fib(n) # @done''')
cadd('knapsack',r'''int knapsack(const int values[],int n,int capacity) {
 int best[26][21]={{0}}; // @initial,visit
 for(int i=1;i<=n;i++){int weight=(i-1)%5+1;
  for(int room=0;room<=capacity;room++){
   int skip=best[i-1][room],take=INT_MIN;
   if(room>=weight)take=values[i-1]+best[i-1][room-weight];
   best[i][room]=skip>take?skip:take; // @change
  }
 }return best[n][capacity]; // @done
}''')
pyadd('knapsack',r'''def knapsack(values, capacity):
    best = [[0]*(capacity+1) for _ in range(len(values)+1)] # @initial,visit
    for i, value in enumerate(values, start=1):
        weight = (i-1)%5+1
        for room in range(capacity+1):
            skip = best[i-1][room]
            take = value+best[i-1][room-weight] if room >= weight else float('-inf')
            best[i][room] = max(skip, take) # @change
    return best[-1][capacity] # @done''')
for id,name in [('hash_chaining','hashMapChaining'),('hashset','hashSet')]:
 cadd(id,f'''HashTable {name}(const int values[],int n,int target) {{
 HashTable table=emptyHash(7);
 for(int i=0;i<n;i++){{int key=values[i];
  int slot=bucketFor(key,7); // @hash,visit
  Link *entry=table.buckets[slot];Link *tail=NULL;
  while(entry!=NULL&&entry->value!=key){{tail=entry;entry=entry->next;}} // @compare
  if(entry!=NULL){{{'entry->count++;' if id=='hash_chaining' else '/* A set keeps one copy. */'}}} // @change,duplicate
  else {{Link *fresh=newLink(key);if(tail!=NULL)tail->next=fresh;else table.buckets[slot]=fresh;}} // @insert
 }}
 int slot=bucketFor(target,7);Link *entry=table.buckets[slot];
 while(entry!=NULL&&entry->value!=target)entry=entry->next; // @search
 table.found=entry!=NULL;
 return table; // @done
}}''')
 pyadd(id,f'''def {'hash_map_chaining' if id=='hash_chaining' else 'hash_set'}(values, target):
    buckets = [[] for _ in range(7)]
    for key in values:
        slot = key%7 # @hash,visit
        entry = next((item for item in buckets[slot] if item[0] == key), None) # @compare
        if entry is not None: {'entry[1] += 1' if id=='hash_chaining' else 'pass'} # @change,duplicate
        else: buckets[slot].append([key, 1]) # @insert
    found = any(item[0] == target for item in buckets[target%7]) # @search
    return buckets, found # @done''')
cadd('hash_probing',r'''HashTable hashMapProbing(const int values[],int n,int target) {
 int size=n*2+1;if(size<7)size=7;HashTable table=emptyHash(size);
 for(int i=0;i<n;i++){int key=values[i];
  int slot=bucketFor(key,size); // @hash,visit
  while(table.buckets[slot]!=NULL&&table.buckets[slot]->value!=key)slot=(slot+1)%size; // @compare
  if(table.buckets[slot]!=NULL)table.buckets[slot]->count++; // @change
  else table.buckets[slot]=newLink(key); // @insert
 }
 int slot=bucketFor(target,size);
 while(table.buckets[slot]!=NULL&&table.buckets[slot]->value!=target)slot=(slot+1)%size; // @search
 table.found=table.buckets[slot]!=NULL;
 return table; // @done
}''')
pyadd('hash_probing',r'''def hash_map_probing(values, target):
    size = max(7, len(values)*2+1); table = [None]*size
    for key in values:
        slot = key%size # @hash,visit
        while table[slot] is not None and table[slot][0] != key:
            slot = (slot+1)%size # @compare
        if table[slot] is not None: table[slot][1] += 1 # @change
        else: table[slot] = [key, 1] # @insert
    slot = target%size
    while table[slot] is not None and table[slot][0] != target:
        slot = (slot+1)%size # @search
    return table, table[slot] is not None # @done''')
# Repair only the deliberately supported C-to-Java surface: fixed arrays and shared record types.
_original_java=java
def java(source):
 s=_original_java(source)
 s=re.sub(r'\buint32_t\b','int',s)
 s=re.sub(r'\b(Node|Link) (\w+)\[(\d+)\];',r'\1[] \2 = new \1[\3];',s)
 s=re.sub(r'^Adj (\w+)\(',r'static Adj \1(',s,flags=re.M)
 s=re.sub(r'(int|double) (\w+)\[(\d+)\]\[(\d+)\]\s*=\s*\{\{0\}\};',r'\1[][] \2 = new \1[\3][\4];',s)
 s=re.sub(r'(int|double) (\w+)\[(\d+)\]\s*=\s*\{0\};',r'\1[] \2 = new \1[\3];',s)
 s=s.replace('(void)','()')
 return s
# Rebuild constructors before conversion, avoiding C aggregate initializers in Java.
helper_c=C_HELPERS+'\nvoid destroyTree(Node *n) {if(n==NULL)return;destroyTree(n->left);destroyTree(n->right);free(n); }\nDistances emptyDistances(void) {Distances result={0};return result;}\n'
helper_java=helper_c
helper_java=re.sub(r'IntList emptyList\(void\) \{[^\n]*\}', 'IntList emptyList(void) { return new IntList(); }',helper_java)
helper_java=re.sub(r'Node \*newNode\(int value\) \{[^\n]*\}', 'Node *newNode(int value) { Node *n=new Node();n.value=value;n.height=1;return n; }',helper_java)
helper_java=re.sub(r'Link \*newLink\(int value\) \{[^\n]*\}', 'Link *newLink(int value) { Link *n=new Link();n.value=value;n.count=1;return n; }',helper_java)
helper_java=re.sub(r'Adj emptyAdj\(void\) \{[^\n]*\}', 'Adj emptyAdj(void) { return new Adj(); }',helper_java)
helper_java=re.sub(r'HashTable emptyHash\(int size\) \{[^\n]*\}', 'HashTable emptyHash(int size) {HashTable table=new HashTable();table.size=size;return table;}',helper_java)
helper_java=re.sub(r'Distances emptyDistances\(void\) \{[^\n]*\}', 'Distances emptyDistances(void) { return new Distances(); }',helper_java)
helper_java=re.sub(r'void destroyTree\(Node \*n\) \{[^\n]*\}', '',helper_java)
helper_java=java(helper_java)
# Correct address-of conversion without changing the short-circuit && operator.
def fix_java(s):
 s=s.replace('&a,','a,')
 # The initial converter removed a second & before these names; restore booleans.
 s=s.replace('<heap.count&heap.', '<heap.count&&heap.').replace('0&heap.', '0&&heap.')
 return s
helper_java=fix_java(helper_java)
def cpp(s):
 s=s.replace('NULL','nullptr').replace('free(n);','delete n;')
 s=re.sub(r'\(Node\*\)calloc\(1,sizeof\(Node\)\)', 'new Node{}',s)
 s=re.sub(r'\(Link\*\)calloc\(1,sizeof\(Link\)\)', 'new Link{}',s)
 return s
# Find complete helper definitions by matching braces, not by guessing line numbers.
def c_helpers(source,names):
 chunks=[]
 for name in names:
  m=re.search(r'^(?:[A-Za-z]+\s+\*?|[A-Za-z]+\s*\*)'+re.escape(name)+r'\([^\n]*?\)\s*\{',source,re.M)
  if not m:raise ValueError('Missing helper '+name)
  start=m.start();at=source.index('{',m.start());depth=1;i=at+1
  while depth:
   if source[i]=='{':depth+=1
   elif source[i]=='}':depth-=1
   i+=1
  chunks.append(source[start:i])
 return '\n\n'.join(chunks)
import ast
py_tree=ast.parse(PY_HELPERS)
py_helpers={node.name:ast.get_source_segment(PY_HELPERS,node) for node in py_tree.body if hasattr(node,'name')}
common_tree=['newNode','height','updateHeight','rotateLeft','rotateRight']
helper_names={
 'heap':['heapPush'],'priority':['heapPush','heapPop'],
 'singly':['newLink'],'doubly':['newLink'],'circular':['newLink'],
 'bst':['newNode','insertBST'],'bfs_tree':['newNode','insertBST'],'dfs_tree':['newNode','insertBST'],
 'avl':common_tree+['insertAVL'],'redblack':common_tree+['isRed','insertRedBlack'],
 'bfs_graph':['nodeIndex','buildAdj'],'dfs_graph':['nodeIndex','buildAdj'],'dijkstra':['nodeIndex','buildAdj'],'topological':['nodeIndex','buildAdj'],
 'hash_chaining':['newLink','bucketFor'],'hash_probing':['newLink','bucketFor'],'hashset':['newLink','bucketFor']}
py_names={'newNode':'Node','newLink':'Link','height':'height','updateHeight':'update_height','rotateLeft':'rotate_left','rotateRight':'rotate_right','insertAVL':'insert_avl','isRed':'is_red','insertRedBlack':'insert_red_black','insertBST':'insert_bst','heapPush':'heap_push','heapPop':'heap_pop','nodeIndex':'adjacency','buildAdj':'adjacency'}
for id in ['bfs_tree','dfs_tree']:cfuncs[id]=cfuncs[id].replace('return visited; // @done','destroyTree(root);\n return visited; // @done')
javafuncs={id:fix_java(java(source.replace('destroyTree(root);',''))) for id,source in cfuncs.items()}
for id in cfuncs:
 extra=c_helpers(helper_c,helper_names.get(id,[])+(['destroyTree'] if id in ['bfs_tree','dfs_tree'] else []))
 csource=cfuncs[id]+('\n\n// Supporting operations\n'+extra if extra else '')
 data['c'][id]=parse(csource);data['cpp'][id]=parse(cpp(csource))
 extra_java=fix_java(java(re.sub(r'void destroyTree\(Node \*n\) \{[^\n]*\}', '',extra))) if extra else ''
 # Allocation helpers use the native Java constructors.
 for name in ['newNode','newLink']:
  if name in helper_names.get(id,[]):
   replacement=c_helpers(helper_java,[name]) if False else ''
   pattern=r'static (?:Node|Link) '+name+r'\(int value\) \{[^\n]*\}'
   native=re.search(pattern,helper_java)
   if native:extra_java=re.sub(pattern,lambda m:native.group(0),extra_java)
 data['java'][id]=parse(javafuncs[id]+('\n\n// Supporting operations\n'+extra_java if extra_java else ''))
 keys=list(dict.fromkeys(py_names[n] for n in helper_names.get(id,[]) if n in py_names))
 py_source=pyfuncs[id]+('\n\n# Supporting operations\n'+'\n\n'.join(py_helpers[k] for k in keys) if keys else '')
 data['python'][id]=parse(py_source)
 for language in data:data[language][id]['sourceUrl']={'python':'examples/algorithms.py','c':'examples/algorithms.c','cpp':'examples/algorithms.cpp','java':'examples/Algorithms.java'}[language]
assert all(len(catalog)==35 for catalog in data.values())
(root/'multilingual-code.js').write_text('globalThis.AlgoMultiCode = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(root/'examples'/'algorithms.py').write_text(parse(PY_HELPERS)['source']+'\n\n'+'\n\n'.join(parse(source)['source'] for source in pyfuncs.values())+'\n',encoding='utf-8')
(root/'examples'/'algorithms.c').write_text(C_TYPES+'\n'+parse(helper_c)['source']+'\n\n'+'\n\n'.join(parse(source)['source'] for source in cfuncs.values())+'\n',encoding='utf-8')
(root/'examples'/'algorithms.cpp').write_text(cpp(C_TYPES)+'\n'+parse(cpp(helper_c))['source']+'\n\n'+'\n\n'.join(parse(cpp(source))['source'] for source in cfuncs.values())+'\n',encoding='utf-8')
(root/'examples'/'Algorithms.java').write_text(JAVA_TYPES+'\n'+parse(helper_java)['source']+'\n\n'+'\n\n'.join(parse(source)['source'] for source in javafuncs.values())+'\n}\n',encoding='utf-8')
(root/'examples'/'catalog.json').write_text(json.dumps({id:{'python':re.search(r'^def (\w+)\(',pyfuncs[id],re.M).group(1),'native':re.findall(r'^(?:IntList|Node\s*\*|Link\s*\*|int|void|Distances|HashTable)\s*(\w+)\(',cfuncs[id],re.M)[-1]} for id in cfuncs},indent=2),encoding='utf-8')
print('Built 140 language examples and four complete source libraries.')

