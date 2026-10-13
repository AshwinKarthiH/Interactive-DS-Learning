
public class Algorithms {
  static class IntList { int[] data = new int[64]; int count; }
  static class Node { int value, height; boolean red; Node left, right; }
  static class Link { int value, count; Link next, prev; }
  static class Edge { int from, to; double weight; }
  static class Graph { int[] nodes = new int[12]; int nodeCount, edgeCount; Edge[] edges = new Edge[40]; }
  static class Adj { int[] count = new int[12]; int[][] next = new int[12][80]; double[][] weight = new double[12][80]; }
  static class Distances { double[] data = new double[12]; int count; }
  static class HashTable { Link[] buckets = new Link[64]; int size; boolean found; }

static IntList emptyList() { return new IntList(); }
static IntList copyValues(int[] values, int n) { IntList a = emptyList(); a.count=n; for(int i=0;i<n;i++) a.data[i]=values[i]; return a; }
static Node newNode(int value) { Node n=new Node();n.value=value;n.height=1;return n; }
static Link newLink(int value) { Link n=new Link();n.value=value;n.count=1;return n; }
static int height(Node n) { return n!=null?n.height:0; }
static void updateHeight(Node n) { int left=height(n.left),right=height(n.right); n.height=1+(left>right?left:right); }
static Node rotateLeft(Node n) { Node child=n.right; n.right=child.left; child.left=n; updateHeight(n);updateHeight(child);return child; }
static Node rotateRight(Node n) { Node child=n.left; n.left=child.right;child.right=n;updateHeight(n);updateHeight(child);return child; }
static boolean isRed(Node n) { return n!=null&&n.red; }
static Node insertBST(Node node,int value) { if(node==null)return newNode(value);if(value<node.value)node.left=insertBST(node.left,value);else if(value>node.value)node.right=insertBST(node.right,value);return node; }
static Node insertAVL(Node node,int value) {
 if(node==null)return newNode(value);
 if(value<node.value)node.left=insertAVL(node.left,value);else if(value>node.value)node.right=insertAVL(node.right,value);else return node;
 updateHeight(node);int balance=height(node.left)-height(node.right);
 if(balance>1){if(value>node.left.value)node.left=rotateLeft(node.left);return rotateRight(node);}
 if(balance < -1){if(value<node.right.value)node.right=rotateRight(node.right);return rotateLeft(node);}return node;
}
static Node insertRedBlack(Node node,int value) {
 if(node==null){Node fresh=newNode(value);fresh.red=true;return fresh;}
 if(value<node.value)node.left=insertRedBlack(node.left,value);else if(value>node.value)node.right=insertRedBlack(node.right,value);else return node;
 updateHeight(node);
 if(isRed(node.right)&&!isRed(node.left)){boolean color=node.red;node=rotateLeft(node);node.red=color;node.left.red=true;}
 if(isRed(node.left)&&isRed(node.left.left)){boolean color=node.red;node=rotateRight(node);node.red=color;node.right.red=true;}
 if(isRed(node.left)&&isRed(node.right)){node.red=!node.red;node.left.red=false;node.right.red=false;}return node;
}
static void heapPush(IntList heap,int value) {
 heap.data[heap.count++]=value;
 int i=heap.count-1;
 while(i>0){int parent=(i-1)/2;
  if(heap.data[parent]<=heap.data[i])break;
  int temp=heap.data[i];heap.data[i]=heap.data[parent];heap.data[parent]=temp;
  i=parent;
 }
}
static int heapPop(IntList heap) {
 int smallest=heap.data[0];heap.count--;heap.data[0]=heap.data[heap.count];
 int i=0;
 while(2*i+1<heap.count){int child=2*i+1;
  if(child+1<heap.count&&heap.data[child+1]<heap.data[child])child++;
  if(heap.data[i]<=heap.data[child])break;
  int temp=heap.data[i];heap.data[i]=heap.data[child];heap.data[child]=temp;
  i=child;
 }return smallest;
}
static int nodeIndex(Graph graph,int key) {for(int i=0;i<graph.nodeCount;i++)if(graph.nodes[i]==key)return i;return -1;}
static Adj emptyAdj() { return new Adj(); }
static void buildAdj(Adj adj,Graph graph,boolean directed) {for(int i=0;i<graph.edgeCount;i++){int from=nodeIndex(graph,graph.edges[i].from),to=nodeIndex(graph,graph.edges[i].to);int at=adj.count[from]++;adj.next[from][at]=to;adj.weight[from][at]=graph.edges[i].weight;if(!directed){at=adj.count[to]++;adj.next[to][at]=from;adj.weight[to][at]=graph.edges[i].weight;}}}
static HashTable emptyHash(int size) {HashTable table=new HashTable();table.size=size;return table;}
static int bucketFor(int key,int size) { return ((key%size)+size)%size; }


static Distances emptyDistances() { return new Distances(); }

static IntList bubbleSort(int[] values, int n) {
 IntList a=copyValues(values,n);
 for(int end=n-1;end>0;end--){boolean changed=false;
  for(int j=0;j<end;j++){
   if(a.data[j]>a.data[j+1]){
    int temp=a.data[j];a.data[j]=a.data[j+1];a.data[j+1]=temp;
    changed=true;
   }
  }if(!changed)break;
 }return a;
}

static IntList selectionSort(int[] values,int n) {
 IntList a=copyValues(values,n);
 for(int i=0;i<n;i++){int smallest=i;
  for(int j=i+1;j<n;j++){
   if(a.data[j]<a.data[smallest])smallest=j;
  }if(smallest!=i){int temp=a.data[i];a.data[i]=a.data[smallest];a.data[smallest]=temp;}
 }return a;
}

static IntList insertionSort(int[] values,int n) {
 IntList a=copyValues(values,n);
 for(int i=1;i<n;i++){int j=i;
  while(j>0){
   if(a.data[j-1]<=a.data[j])break;
   int temp=a.data[j];a.data[j]=a.data[j-1];a.data[j-1]=temp;
   j--;
  }
 }return a;
}

static void mergeRange(IntList a,int left,int right) {
 if(left>=right)return;
 int mid=(left+right)/2;mergeRange(a,left,mid);mergeRange(a,mid+1,right);
 int[] first = new int[64];int[] second = new int[64];int x=mid-left+1,y=right-mid;
 for(int i=0;i<x;i++)first[i]=a.data[left+i];
 for(int j=0;j<y;j++)second[j]=a.data[mid+1+j];
 int i=0,j=0,k=left;
 while(i<x&&j<y){
  boolean takeLeft=first[i]<=second[j];
  a.data[k++]=takeLeft?first[i++]:second[j++];
 }
 while(i<x)a.data[k++]=first[i++];
 while(j<y)a.data[k++]=second[j++];
}
static IntList mergeSort(int[] values,int n) {
 IntList a=copyValues(values,n);mergeRange(a,0,n-1);
 return a;
}

static void quickRange(IntList a,int left,int right) {
 if(left>=right)return;
 int pivot=a.data[right];
 int next=left;
 for(int j=left;j<right;j++){
  if(a.data[j]<pivot){
   int temp=a.data[next];a.data[next]=a.data[j];a.data[j]=temp;
   next++;
  }
 }
 int temp=a.data[next];a.data[next]=a.data[right];a.data[right]=temp;
 quickRange(a,left,next-1);quickRange(a,next+1,right);
}
static IntList quickSort(int[] values,int n) {
 IntList a=copyValues(values,n);quickRange(a,0,n-1);
 return a;
}

static IntList radixSort(int[] values,int n) {
 IntList a=copyValues(values,n);int largest=0;
 for(int i=0;i<n;i++)if(a.data[i]>largest)largest=a.data[i];
 for(int place=1;place<=largest;place*=10){
  int[][] buckets = new int[10][64];int[] count = new int[10];
  for(int i=0;i<n;i++){int digit=(a.data[i]/place)%10;
   buckets[digit][count[digit]++]=a.data[i];
  }
  int next=0;
  for(int digit=0;digit<10;digit++)for(int j=0;j<count[digit];j++)a.data[next++]=buckets[digit][j];
 }return a;
}

static int linearSearch(int[] values,int n,int target) {
 for(int i=0;i<n;i++){
  if(values[i]==target)return i;
 }return -1;
}

static int binarySearch(int[] values,int n,int target) {
 IntList a=insertionSort(values,n);int left=0,right=n-1;
 while(left<=right){int middle=(left+right)/2;
  if(a.data[middle]==target)return middle;
  if(a.data[middle]<target)left=middle+1;else right=middle-1;
 }return -1;
}

static int traverseArray(int[] values,int n) {
 int total=0;
 for(int i=0;i<n;i++)total+=values[i];
 return total;
}

static int maxWindowSum(int[] values,int n,int k) {
 int sum=0,best=Integer.MIN_VALUE;
 for(int i=0;i<n;i++){
  sum+=values[i];if(i>=k)sum-=values[i-k];
  if(i>=k-1&&sum>best)best=sum;
 }return best;
}

static IntList findPairSum(int[] values,int n,int target) {
 IntList a=insertionSort(values,n),pair=emptyList();int left=0,right=n-1;
 while(left<right){
  int sum=a.data[left]+a.data[right];
  if(sum==target){pair.data[0]=left;pair.data[1]=right;pair.count=2;return pair;}
  if(sum<target)left++;else right--;
 }return pair;
}

static void reverseCodepoints(int[] letters,int n) {
 /* letters contains decoded Unicode code points, not UTF-8 bytes. */
 int left=0,right=n-1;
 while(left<right){
  int temp=letters[left];letters[left]=letters[right];letters[right]=temp;
  left++;right--;
 }return;
}

static IntList stackDemo(int[] values,int n) {
 IntList stack=emptyList(),removed=emptyList();
 for(int i=0;i<n;i++)stack.data[stack.count++]=values[i];
 while(stack.count>0)removed.data[removed.count++]=stack.data[--stack.count];
 return removed;
}

static IntList queueDemo(int[] values,int n) {
 IntList queue=emptyList(),removed=emptyList();
 for(int i=0;i<n;i++)queue.data[queue.count++]=values[i];
 int front=0;
 while(front<queue.count)removed.data[removed.count++]=queue.data[front++];
 return removed;
}

static IntList dequeDemo(int[] values,int n) {
 int[] deque = new int[64];int front=32,back=32;IntList removed=emptyList();
 for(int i=0;i<n;i++){
  if(i%2==0)deque[--front]=values[i];
  else deque[back++]=values[i];
 }
 int turn=0;
 while(front<back){int index=(turn++%2==0)?front++:--back;
  removed.data[removed.count++]=deque[index];
 }return removed;
}

static IntList buildMinHeap(int[] values,int n) {
 IntList heap=emptyList();
 for(int i=0;i<n;i++)heapPush(heap,values[i]);
 return heap;
}

static IntList priorityQueueDemo(int[] values,int n) {
 IntList heap=emptyList(),removed=emptyList();
 for(int i=0;i<n;i++)heapPush(heap,values[i]);
 while(heap.count>0)removed.data[removed.count++]=heapPop(heap);
 return removed;
}

static Link buildSinglyLinkedList(int[] values,int n) {
 Link head=null;Link tail=null;
 for(int i=0;i<n;i++){Link node=newLink(values[i]);
  
  if(head==null)head=node;else tail.next=node;
  tail=node;
 }
 
 Link current=head;
 for(int i=0;i<n;i++)current=current.next;
 
 return head;
}

static Link buildDoublyLinkedList(int[] values,int n) {
 Link head=null;Link tail=null;
 for(int i=0;i<n;i++){Link node=newLink(values[i]);
  node.prev=tail;
  if(head==null)head=node;else tail.next=node;
  tail=node;
 }
 
 Link current=head;
 for(int i=0;i<n;i++)current=current.next;
 current=tail;while(current!=null)current=current.prev;
 return head;
}

static Link buildCircularList(int[] values,int n) {
 Link head=null;Link tail=null;
 for(int i=0;i<n;i++){Link node=newLink(values[i]);
  
  if(head==null)head=node;else tail.next=node;
  tail=node;
 }
 if(tail!=null)tail.next=head;
 Link current=head;
 for(int i=0;i<n;i++)current=current.next;
 
 return head;
}

static Node buildAndSearchBST(int[] values,int n,int target) {
 Node root=null;
 for(int i=0;i<n;i++)root=insertBST(root,values[i]);
 Node node=root;
 while(node!=null){
  if(node.value==target)return root;
  node=target<node.value?node.left:node.right;
 }return root;
}

static IntList treeBreadthFirst(int[] values,int n) {
 Node root=null;for(int i=0;i<n;i++)root=insertBST(root,values[i]);
 Node[] queue = new Node[64];int front=0,back=0;IntList visited=emptyList();
 if(root!=null)queue[back++]=root;
 while(front<back){Node node=queue[front++];visited.data[visited.count++]=node.value;
  if(node.left!=null)queue[back++]=node.left;
  if(node.right!=null)queue[back++]=node.right;
 }
 return visited;
}

static void visitTree(Node node,IntList visited) {
 if(node==null)return;
 visited.data[visited.count++]=node.value;
 visitTree(node.left,visited);visitTree(node.right,visited);
}
static IntList treeDepthFirst(int[] values,int n) {
 Node root=null;for(int i=0;i<n;i++)root=insertBST(root,values[i]);
 IntList visited=emptyList();visitTree(root,visited);
 
 return visited;
}

static Node buildAVLTree(int[] values,int n) {
 Node root=null;
 for(int i=0;i<n;i++)root=insertAVL(root,values[i]);
 return root;
}

static Node buildRedBlackTree(int[] values,int n) {
 Node root=null;
 for(int i=0;i<n;i++){
  root=insertRedBlack(root,values[i]);root.red=false;
 }return root;
}

static IntList graphBreadthFirst(Graph graph,int start) {
 Adj adj=emptyAdj();buildAdj(adj,graph,false);IntList visited=emptyList();
 int[] seen = new int[12];int[] queue = new int[64];int front=0,back=0;
 int first=nodeIndex(graph,start);if(first<0)return visited;
 queue[back++]=first;seen[first]=1;
 while(front<back){int node=queue[front++];visited.data[visited.count++]=graph.nodes[node];
  for(int j=0;j<adj.count[node];j++){int next=adj.next[node][j];
   if(seen[next]==0){seen[next]=1;queue[back++]=next;}
  }
 }return visited;
}

static void visitGraph(int node,Graph graph,Adj adj,int[] seen,IntList visited) {
 seen[node]=1;visited.data[visited.count++]=graph.nodes[node];
 for(int j=0;j<adj.count[node];j++){int next=adj.next[node][j];if(seen[next]==0)visitGraph(next,graph,adj,seen,visited);}
}
static IntList graphDepthFirst(Graph graph,int start) {
 Adj adj=emptyAdj();buildAdj(adj,graph,false);IntList visited=emptyList();int[] seen = new int[12];
 int first=nodeIndex(graph,start);if(first>=0)visitGraph(first,graph,adj,seen,visited);
 return visited;
}

static Distances shortestDistances(Graph graph,int start) {
 Adj adj=emptyAdj();buildAdj(adj,graph,false);Distances result=emptyDistances();result.count=graph.nodeCount;
 int[] seen = new int[12];for(int i=0;i<graph.nodeCount;i++)result.data[i]=Double.POSITIVE_INFINITY;
 int first=nodeIndex(graph,start);if(first<0)return result;
 result.data[first]=0;
 for(int turn=0;turn<graph.nodeCount;turn++){int node=-1;
  for(int i=0;i<graph.nodeCount;i++)if(seen[i]==0&&(node<0||result.data[i]<result.data[node]))node=i;
  if(node<0||result.data[node]==Double.POSITIVE_INFINITY)break;
  seen[node]=1;
  for(int j=0;j<adj.count[node];j++){int next=adj.next[node][j];
   double candidate=result.data[node]+adj.weight[node][j];
   if(candidate<result.data[next])result.data[next]=candidate;
  }
 }return result;
}

static IntList topologicalSort(Graph graph) {
 Adj adj=emptyAdj();buildAdj(adj,graph,true);IntList order=emptyList();
 int[] incoming = new int[12];for(int i=0;i<graph.edgeCount;i++)incoming[nodeIndex(graph,graph.edges[i].to)]++;
 int[] queue = new int[64];int front=0,back=0;
 for(int i=0;i<graph.nodeCount;i++)if(incoming[i]==0)queue[back++]=i;
 while(front<back){int node=queue[front++];order.data[order.count++]=graph.nodes[node];
  for(int j=0;j<adj.count[node];j++){int next=adj.next[node][j];
   if(--incoming[next]==0)queue[back++]=next;
  }
 }
 if(order.count!=graph.nodeCount)order.count=-1;
 return order;
}

static int fibonacciTable(int n) {
 int[] answer = new int[21];answer[0]=0;if(n>=1)answer[1]=1;
 for(int i=2;i<=n;i++)answer[i]=answer[i-1]+answer[i-2];
 return answer[n];
}

static int fibMemo(int[] saved,int i) {
 if(saved[i]>=0)return saved[i];
 int value=i<=1?i:fibMemo(saved,i-1)+fibMemo(saved,i-2);
 saved[i]=value;
 return value;
}
static int fibonacciMemo(int n) {
 int[] saved = new int[21];for(int i=0;i<=n;i++)saved[i]=-1;
 return fibMemo(saved,n);
}

static int knapsack(int[] values,int n,int capacity) {
 int[][] best = new int[26][21];
 for(int i=1;i<=n;i++){int weight=(i-1)%5+1;
  for(int room=0;room<=capacity;room++){
   int skip=best[i-1][room],take=Integer.MIN_VALUE;
   if(room>=weight)take=values[i-1]+best[i-1][room-weight];
   best[i][room]=skip>take?skip:take;
  }
 }return best[n][capacity];
}

static HashTable hashMapChaining(int[] values,int n,int target) {
 HashTable table=emptyHash(7);
 for(int i=0;i<n;i++){int key=values[i];
  int slot=bucketFor(key,7);
  Link entry=table.buckets[slot];Link tail=null;
  while(entry!=null&&entry.value!=key){tail=entry;entry=entry.next;}
  if(entry!=null){entry.count++;}
  else {Link fresh=newLink(key);if(tail!=null)tail.next=fresh;else table.buckets[slot]=fresh;}
 }
 int slot=bucketFor(target,7);Link entry=table.buckets[slot];
 while(entry!=null&&entry.value!=target)entry=entry.next;
 table.found=entry!=null;
 return table;
}

static HashTable hashSet(int[] values,int n,int target) {
 HashTable table=emptyHash(7);
 for(int i=0;i<n;i++){int key=values[i];
  int slot=bucketFor(key,7);
  Link entry=table.buckets[slot];Link tail=null;
  while(entry!=null&&entry.value!=key){tail=entry;entry=entry.next;}
  if(entry!=null){/* A set keeps one copy. */}
  else {Link fresh=newLink(key);if(tail!=null)tail.next=fresh;else table.buckets[slot]=fresh;}
 }
 int slot=bucketFor(target,7);Link entry=table.buckets[slot];
 while(entry!=null&&entry.value!=target)entry=entry.next;
 table.found=entry!=null;
 return table;
}

static HashTable hashMapProbing(int[] values,int n,int target) {
 int size=n*2+1;if(size<7)size=7;HashTable table=emptyHash(size);
 for(int i=0;i<n;i++){int key=values[i];
  int slot=bucketFor(key,size);
  while(table.buckets[slot]!=null&&table.buckets[slot].value!=key)slot=(slot+1)%size;
  if(table.buckets[slot]!=null)table.buckets[slot].count++;
  else table.buckets[slot]=newLink(key);
 }
 int slot=bucketFor(target,size);
 while(table.buckets[slot]!=null&&table.buckets[slot].value!=target)slot=(slot+1)%size;
 table.found=table.buckets[slot]!=null;
 return table;
}
}
