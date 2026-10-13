import sys,importlib.util,json
from pathlib import Path
sys.dont_write_bytecode=True
spec=importlib.util.spec_from_file_location('algorithms',Path(__file__).parent/'examples'/'algorithms.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
catalog=json.loads((Path(__file__).parent/'examples'/'catalog.json').read_text());count=0
def check(condition,message):
 global count
 assert condition,message
 count+=1
for a in [[],[1],[3,2,1],[7,7,2],[-4,1,0],list(range(25,0,-1))]:
 for id in ['bubble','selection','insertion','merge','quick']:
  check(getattr(m,catalog[id]['python'])(a)==sorted(a),id)
 if all(v>=0 for v in a):check(m.radix_sort(a)==sorted(a),'radix')
 check(m.stack_demo(a)==list(reversed(a)),'stack');check(m.queue_demo(a)==a,'queue');check(m.priority_queue_demo(a)==sorted(a),'priority')
 heap=m.build_min_heap(a);check(all(heap[(i-1)//2]<=v for i,v in enumerate(heap) if i),'heap')
 for id in ['singly','doubly','circular']:
  root=getattr(m,catalog[id]['python'])(a);node=root
  for value in a:check(node.value==value,id);node=node.next
  check(node==(root if id=='circular' else None),id+' end')
 for id in ['hash_chaining','hash_probing','hashset']:
  result=getattr(m,catalog[id]['python'])(a,a[0] if a else 99);check(result[1]==bool(a),id)
for seed in range(1,41):
 values=[(i*seed*13+seed*7)%97 for i in range(20)]
 for id in ['avl','redblack']:
  root=getattr(m,catalog[id]['python'])(values)
  def visit(n,lo=float('-inf'),hi=float('inf')):
   if n is None:return 0,1
   check(lo<n.value<hi,'order');lh,lb=visit(n.left,lo,n.value);rh,rb=visit(n.right,n.value,hi)
   if id=='avl':check(abs(lh-rh)<=1,'AVL balance');check(n.height==1+max(lh,rh),'AVL height')
   else:
    check(lb==rb,'black height');check(not(n.right and n.right.red),'left leaning');check(not(n.red and n.left and n.left.red),'adjacent reds')
   return 1+max(lh,rh),lb+(not n.red)
  visit(root);check(id!='redblack' or not root.red,'root')
check(m.linear_search([1,3],3)==1,'linear');check(m.linear_search([1,3],9)==-1,'linear absent');check(m.binary_search([9,2,3],3)==1,'binary')
check(m.traverse_array([1,2,3])==6,'sum');check(m.max_window_sum([1,2,3,4],2)==7,'window');check(m.find_pair_sum([1,8,3],9)==[0,2],'pair');check(m.reverse_string('a🙂b')=='b🙂a','Unicode');check(m.deque_demo([1,2,3,4])==[3,4,1,2],'deque')
check(m.build_and_search_bst([3,1,4],1).value==3,'BST');check(m.tree_breadth_first([3,1,4,2])==[3,1,4,2],'tree bfs');check(m.tree_depth_first([3,1,4,2])==[3,1,2,4],'tree dfs')
g={'nodes':list(range(6)),'edges':[dict(from_=0)]}
g['edges']=[{'from':a,'to':b,'weight':w} for a,b,w in [(0,1,4),(0,2,2),(1,2,1),(1,3,5),(2,3,8),(2,4,10),(3,4,2),(3,5,6),(4,5,3)]]
check(m.graph_breadth_first(g,0)==[0,1,2,3,4,5],'graph bfs');check(len(set(m.graph_depth_first(g,0)))==6,'graph dfs');check(m.shortest_distances(g,0)=={0:0,1:3,2:2,3:8,4:10,5:13},'dijkstra')
dag={'nodes':[0,1,2],'edges':[{'from':0,'to':1,'weight':1},{'from':1,'to':2,'weight':1}]};check(m.topological_sort(dag)==[0,1,2],'topological');dag['edges'].append({'from':2,'to':0,'weight':1});check(m.topological_sort(dag) is None,'cycle')
for n in range(21):
 a,b=0,1
 for i in range(n):a,b=b,a+b
 check(m.fibonacci_table(n)==a,'table');check(m.fibonacci_memo(n)==a,'memo')
check(m.knapsack([6,10,12],5)==22,'knapsack')
print(f'{count} Python execution checks passed across all 35 lessons')
