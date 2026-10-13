/* DOM/SVG renderers for the structures actually present in each snapshot. */
globalThis.AlgoView = {
 draw(container,lesson,step) {
  container.replaceChildren();container.className='dsa-stage';
  const state=step.state||{},active=new Set(step.active||step.indices||[]),visited=new Set(state.visited||[]);
  const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=String(text);return n;};
  const cell=(value,index,label)=>{const n=el('div','dsa-cell'+(active.has(index)?' is-active':''));n.append(el('small','',label??index),el('strong','',value));return n;};
  const note=text=>container.append(el('p','dsa-note',text));
  const row=(values,labels)=>{const n=el('div','dsa-row');values.forEach((v,i)=>n.append(cell(v,i,labels?.[i])));container.append(n);return n;};
  if(lesson.view==='bars') {
   const values=step.array,max=Math.max(1,...values.map(Math.abs));const bars=el('div','dsa-bars');
   values.forEach((v,i)=>{const n=el('div','dsa-bar'+(active.has(i)?' is-active':'')+((step.sorted?.includes(i)||(['quick','radix'].includes(lesson.id)&&step.kind==='done'))?' is-visited':'')+(v<0?' is-negative':''));n.style.height=(Math.abs(v)/max*180+12)+'px';n.append(el('span','',v),el('small','',i));bars.append(n);});container.append(bars);
   if(state.left)note(`Merge buffers — left: [${state.left.join(', ')}], right: [${state.right.join(', ')}].`);
   if(state.buckets)note('Digit buckets: '+state.buckets.map((b,i)=>`${i}: [${b.join(', ')}]`).join(' • '));
  } else if(lesson.view==='cells'||lesson.view==='string') {
   row(lesson.view==='string'?(state.chars||Array.from(step.text||'ALGORITHM')):step.array);
   if(state.sum!==undefined)note(`Current sum: ${state.sum}${state.best!==undefined&&state.best!==null?' • Best full window: '+state.best:''}`);
   if(state.found)note('Pair positions: '+state.found.join(' and '));
  } else if(lesson.view==='stack'||lesson.view==='queue') {
   const values=step.array,n=el('div',lesson.view==='stack'?'dsa-stack':'dsa-row');
   if(lesson.view==='stack'){for(let i=values.length-1;i>=0;i--)n.append(cell(values[i],i,i===values.length-1?'TOP':i));}
   else values.forEach((v,i)=>n.append(cell(v,i,i===0?'FRONT':i===values.length-1?'BACK':i)));
   container.append(n);if(!values.length)note('Empty structure');
  } else if(lesson.view==='list') {
   const n=el('div','dsa-row dsa-linked');
   step.array.forEach((v,i)=>{const box=cell(v,i,i===0?'HEAD':i===step.array.length-1?'TAIL':`node ${i}`);box.append(el('small','',`next: ${i+1<step.array.length?step.array[i+1]:state.closed&&step.array.length?step.array[0]:'null'}`));if(lesson.id==='doubly')box.append(el('small','',`prev: ${i?step.array[i-1]:'null'}`));n.append(box);if(i<step.array.length-1)n.append(el('span','dsa-link',lesson.id==='doubly'?'⇄':'→'));});container.append(n);
   if(state.closed&&step.array.length)note(`↩ Tail ${step.array.at(-1)} links back to head ${step.array[0]}. Stop after one round.`);
   else if(step.array.length)note('The final next link is null.');
  } else if(lesson.view==='tree'||lesson.view==='heap') {
   const points=[],edges=[];let index=0,maxDepth=0;
   if(lesson.view==='heap') {
    const values=step.array;const walk=(i,depth,x,spread)=>{if(i>=values.length)return;const p={key:i,value:values[i],x,y:45+depth*80,color:'black'};points.push(p);maxDepth=Math.max(maxDepth,depth);for(const child of [2*i+1,2*i+2])if(child<values.length){edges.push([i,child]);walk(child,depth+1,x+(child===2*i+1?-spread:spread),spread/2);}};
    walk(0,0,400,190);
   } else {
    const walk=(node,depth)=>{if(!node)return;walk(node.left,depth+1);const p={key:node.value,value:node.value,x:45+index++*60,y:45+depth*80,color:node.color,height:node.height};points.push(p);maxDepth=Math.max(maxDepth,depth);if(node.left)edges.push([node.value,node.left.value]);if(node.right)edges.push([node.value,node.right.value]);walk(node.right,depth+1);};walk(state.root,0);
   }
   this.diagram(container,points,edges,{width:lesson.view==='heap'?800:Math.max(400,index*60+30),height:Math.max(180,maxDepth*80+110),active,visited,heights:lesson.id==='avl',fit:points.length<=7});
   if(!points.length)note('Empty tree');
   if(state.frontier)note('Queue: ['+state.frontier.join(', ')+']');
  } else if(lesson.view==='graph') {
   const nodes=state.nodes||[],count=nodes.length;const points=nodes.map((v,i)=>({key:v,value:v,x:260+190*Math.cos(2*Math.PI*i/count-Math.PI/2),y:220+155*Math.sin(2*Math.PI*i/count-Math.PI/2),detail:state.distance?`d=${state.distance[v]}`:state.indegree?`incoming=${state.indegree[v]}`:''}));
   this.diagram(container,points,(state.edges||[]).map(e=>[e.from,e.to,e.weight]),{width:520,height:440,active,visited,directed:state.directed,weights:lesson.id==='dijkstra',fit:true});
   if(state.frontier)note('Queue: ['+state.frontier.join(', ')+']');
   if(state.cycle)note('Cycle detected. This graph has no topological ordering.');
  } else if(lesson.view==='table') {
   const values=state.table||[];row(values.map(v=>v===null?'?':v),values.map((_,i)=>`F(${i})`));
   note('A question mark means this answer has not been computed yet.');
  } else if(lesson.view==='matrix') {
   const table=el('table','dsa-table');table.append(el('caption','', 'Best value by item count (rows) and capacity (columns)'));
   const head=el('tr');head.append(el('th','', 'Items / capacity'));for(let c=0;c<(state.table?.[0]?.length||0);c++)head.append(el('th','',c));table.append(head);
   (state.table||[]).forEach((values,i)=>{const tr=el('tr');tr.append(el('th','',i));values.forEach((v,c)=>tr.append(el('td',state.cell?.[0]===i&&state.cell?.[1]===c?'is-active':'',v)));table.append(tr);});container.append(table);
   note('Items: '+(state.values||[]).map((v,i)=>`#${i+1} (weight ${state.weights[i]}, value ${v})`).join(' • '));
  } else if(lesson.view==='buckets') {
   const grid=el('div','dsa-buckets');(state.buckets||[]).forEach((values,i)=>{const n=el('div','dsa-bucket'+(active.has(i)?' is-active':''));n.append(el('strong','',`Bucket ${i}`),el('span','',values.length?values.map(v=>lesson.id==='hashset'?v:`${v} (count ${state.entries?.[v]||0})`).join(' → '):'empty'));grid.append(n);});container.append(grid);
  }
  if(state.removed?.length)note('Removed: '+state.removed.join(' → '));
  if(state.visited?.length)note('Visited: '+state.visited.join(' → '));
 },
 diagram(container,points,edges,options) {
  const ns='http://www.w3.org/2000/svg';const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox',`0 0 ${options.width} ${options.height}`);svg.setAttribute('role','img');svg.setAttribute('aria-label','Current data structure diagram');svg.classList.add('dsa-diagram');svg.style.minWidth=options.fit?'0':Math.min(options.width,600)+'px';svg.style.width='100%';svg.style.height=options.fit?'auto':options.height+'px';if(options.fit)svg.style.maxHeight='400px';
  const make=(tag,attrs,text)=>{const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs||{}))n.setAttribute(k,v);if(text!==undefined)n.textContent=String(text);return n;};
  const defs=make('defs'),marker=make('marker',{id:'dsa-arrow',markerWidth:8,markerHeight:8,refX:7,refY:4,orient:'auto'});marker.append(make('path',{d:'M0,0 L8,4 L0,8 Z',fill:'var(--cyan-400, #22d3ee)'}));defs.append(marker);svg.append(defs);
  const map=new Map(points.map(p=>[p.key,p]));
  for(const[from,to,weight]of edges){const a=map.get(from),b=map.get(to);if(!a||!b)continue;const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;svg.append(make('line',{x1:a.x+dx/len*23,y1:a.y+dy/len*23,x2:b.x-dx/len*27,y2:b.y-dy/len*27,class:'dsa-edge'+(options.active.has(from)&&options.active.has(to)?' is-current':''),...(options.directed?{'marker-end':'url(#dsa-arrow)'}:{})}));if(options.weights)svg.append(make('text',{x:(a.x+b.x)/2+7,y:(a.y+b.y)/2-7,class:'dsa-weight'},weight));}
  for(const p of points){const g=make('g',{class:'dsa-node'+(options.active.has(p.key)?' is-active':options.visited.has(p.key)?' is-visited':'')});g.append(make('circle',{cx:p.x,cy:p.y,r:22,fill:p.color==='red'?'#a52b54':'var(--bg-card, #181824)'}));g.append(make('text',{x:p.x,y:p.y+5,'text-anchor':'middle'},p.value));if(options.heights)g.append(make('text',{x:p.x,y:p.y+39,'text-anchor':'middle',class:'dsa-detail'},'h='+p.height));if(p.detail)g.append(make('text',{x:p.x,y:p.y+39,'text-anchor':'middle',class:'dsa-detail'},p.detail));svg.append(g);}
  container.append(svg);
 }
};
