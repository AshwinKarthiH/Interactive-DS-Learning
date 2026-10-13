globalThis.AlgoBattle = {
 sort(input, id) {
  const a=[...input]; let comparisons=0, writes=0;
  const swap=(i,j)=>{if(i===j)return; [a[i],a[j]]=[a[j],a[i]];writes+=2;};
  if(id==='bubble') {for(let i=0;i<a.length;i++){let changed=false;for(let j=0;j<a.length-i-1;j++){comparisons++;if(a[j]>a[j+1]){swap(j,j+1);changed=true;}}if(!changed)break;}}
  else if(id==='selection') {for(let i=0;i<a.length;i++){let m=i;for(let j=i+1;j<a.length;j++){comparisons++;if(a[j]<a[m])m=j;}swap(i,m);}}
  else if(id==='insertion') {for(let i=1;i<a.length;i++){let j=i;while(j>0){comparisons++;if(a[j-1]<=a[j])break;swap(j-1,j);j--;}}}
  else if(id==='merge') {
   function merge(l,r){if(l>=r)return;const m=Math.floor((l+r)/2);merge(l,m);merge(m+1,r);const left=a.slice(l,m+1),right=a.slice(m+1,r+1);let i=0,j=0,k=l;while(i<left.length&&j<right.length){comparisons++;a[k++]=left[i]<=right[j]?left[i++]:right[j++];writes++;}while(i<left.length){a[k++]=left[i++];writes++;}while(j<right.length){a[k++]=right[j++];writes++;}}
   merge(0,a.length-1);
  } else if(id==='quick') {
   function quick(l,r){if(l>=r)return;const pivot=a[r];let i=l;for(let j=l;j<r;j++){comparisons++;if(a[j]<pivot)swap(i++,j);}swap(i,r);quick(l,i-1);quick(i+1,r);}quick(0,a.length-1);
  } else throw new Error('Unsupported algorithm');
  return {sorted:a,comparisons,swaps:writes};
 },
 measure(input,id) {
  this.sort(input,id); // Warmup; timings include copying and instrumentation.
  const times=[]; let result;
  for(let i=0;i<20;i++){const start=performance.now();result=this.sort(input,id);times.push(performance.now()-start);}
  times.sort((a,b)=>a-b);return {...result,time:((times[9]+times[10])/2).toFixed(3)};
 }
};
