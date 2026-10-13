#include <stdio.h>
#include <assert.h>
#ifdef TEST_CPP
#include "../examples/algorithms.cpp"
#else
#include "../examples/algorithms.c"
#endif
static int checks=0;
#define CHECK(x) do {assert(x);checks++;}while(0)
void expect(IntList a,const int expected[],int n){CHECK(a.count==n);for(int i=0;i<n;i++)CHECK(a.data[i]==expected[i]);}
void freeTree(Node *n){if(n==NULL)return;freeTree(n->left);freeTree(n->right);
#ifdef TEST_CPP
 delete n;
#else
 free(n);
#endif
}
void freeLinks(Link *n,int count){for(int i=0;i<count;i++){Link *next=n->next;
#ifdef TEST_CPP
 delete n;
#else
 free(n);
#endif
 n=next;}}
int validate(Node *n,int low,int high,bool avl){if(n==NULL)return 1;CHECK(n->value>low&&n->value<high);int left=validate(n->left,low,n->value,avl),right=validate(n->right,n->value,high,avl);if(avl){CHECK(abs(left-right)<=1);return (left>right?left:right)+1;}CHECK(left==right);CHECK(n->right==NULL||!n->right->red);CHECK(!n->red||n->left==NULL||!n->left->red);return left+(n->red?0:1);}
Graph makeGraph(void){Graph g={0};g.nodeCount=6;for(int i=0;i<6;i++)g.nodes[i]=i;int edges[9][3]={{0,1,4},{0,2,2},{1,2,1},{1,3,5},{2,3,8},{2,4,10},{3,4,2},{3,5,6},{4,5,3}};g.edgeCount=9;for(int i=0;i<9;i++){g.edges[i].from=edges[i][0];g.edges[i].to=edges[i][1];g.edges[i].weight=edges[i][2];}return g;}
int main(void){
 int values[4]={7,1,7,2},sorted[4]={1,2,7,7},reversed[4]={2,7,1,7};
 for(int n=0;n<=4;n++){IntList baseline=insertionSort(values,n);expect(bubbleSort(values,n),baseline.data,n);expect(selectionSort(values,n),baseline.data,n);expect(mergeSort(values,n),baseline.data,n);expect(quickSort(values,n),baseline.data,n);expect(radixSort(values,n),baseline.data,n);expect(priorityQueueDemo(values,n),baseline.data,n);expect(queueDemo(values,n),values,n);IntList heap=buildMinHeap(values,n);for(int i=1;i<n;i++)CHECK(heap.data[(i-1)/2]<=heap.data[i]);
  Link *lists[3]={buildSinglyLinkedList(values,n),buildDoublyLinkedList(values,n),buildCircularList(values,n)};for(int j=0;j<3;j++){Link *node=lists[j];for(int i=0;i<n;i++){CHECK(node->value==values[i]);node=node->next;}CHECK(node==(j==2?lists[j]:NULL));freeLinks(lists[j],n);}
  HashTable maps[3]={hashMapChaining(values,n,7),hashMapProbing(values,n,7),hashSet(values,n,7)};for(int j=0;j<3;j++){CHECK(maps[j].found==(n>0));for(int b=0;b<maps[j].size;b++){Link *link=maps[j].buckets[b];while(link!=NULL){Link *next=link->next;
#ifdef TEST_CPP
 delete link;
#else
 free(link);
#endif
 link=next;}}}
 }
 expect(stackDemo(values,4),reversed,4);expect(priorityQueueDemo(values,4),sorted,4);
 for(int seed=1;seed<=40;seed++){int a[20];for(int i=0;i<20;i++)a[i]=(i*seed*13+seed*7)%97;Node *avl=buildAVLTree(a,20);validate(avl,INT_MIN,INT_MAX,true);freeTree(avl);Node *rb=buildRedBlackTree(a,20);CHECK(!rb->red);validate(rb,INT_MIN,INT_MAX,false);freeTree(rb);}
 int a[4]={1,2,3,4};CHECK(linearSearch(a,4,3)==2);CHECK(binarySearch(a,4,3)==2);CHECK(traverseArray(a,4)==10);CHECK(maxWindowSum(a,4,2)==7);CHECK(findPairSum(a,4,5).count==2);
 uint32_t text[3]={'a',0x1F642,'b'};reverseCodepoints(text,3);CHECK(text[0]=='b'&&text[1]==0x1F642&&text[2]=='a');int dequeOrder[4]={3,4,1,2};expect(dequeDemo(a,4),dequeOrder,4);
 int treeValues[4]={3,1,4,2},bfsTree[4]={3,1,4,2},dfsTree[4]={3,1,2,4};Node *bst=buildAndSearchBST(treeValues,4,1);CHECK(bst->value==3);freeTree(bst);expect(treeBreadthFirst(treeValues,4),bfsTree,4);expect(treeDepthFirst(treeValues,4),dfsTree,4);
 Graph g=makeGraph();int bfs[6]={0,1,2,3,4,5};expect(graphBreadthFirst(&g,0),bfs,6);CHECK(graphDepthFirst(&g,0).count==6);Distances distances=shortestDistances(&g,0);double expected[6]={0,3,2,8,10,13};for(int i=0;i<6;i++)CHECK(distances.data[i]==expected[i]);
 Graph dag={0};dag.nodeCount=3;dag.nodes[0]=0;dag.nodes[1]=1;dag.nodes[2]=2;dag.edgeCount=2;dag.edges[0].from=0;dag.edges[0].to=1;dag.edges[1].from=1;dag.edges[1].to=2;int order[3]={0,1,2};expect(topologicalSort(&dag),order,3);dag.edgeCount=3;dag.edges[2].from=2;dag.edges[2].to=0;CHECK(topologicalSort(&dag).count==-1);
 for(int n=0;n<=20;n++){int f=0,next=1;for(int i=0;i<n;i++){int temp=f+next;f=next;next=temp;}CHECK(fibonacciTable(n)==f);CHECK(fibonacciMemo(n)==f);}int items[3]={6,10,12};CHECK(knapsack(items,3,5)==22);
 printf("%d compiled execution checks passed across all 35 lessons\n",checks);return 0;
}
