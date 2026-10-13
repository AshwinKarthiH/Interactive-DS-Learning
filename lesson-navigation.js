/* One catalog powers navigation, search, and landing-page coverage. */
(function(){
 const navigation=document.getElementById('lessonNavigation'),categories=document.getElementById('lessonCategories');
 for(const [category,group] of Object.entries(AlgoLessons)) {
  if(navigation){const wrapper=document.createElement('div');wrapper.className='topic-group'+(category==='sorting'?' open':'');wrapper.dataset.group=category;
   const header=document.createElement('button');header.className='topic-header';header.dataset.topic=category;header.title=group.label;header.setAttribute('aria-expanded',category==='sorting'?'true':'false');
   const icon=document.createElement('span');icon.textContent=group.icon;const title=document.createElement('span');title.className='topic-title';title.textContent=group.label;header.append(icon,title);wrapper.append(header);
   const sub=document.createElement('div');sub.className='topic-subdivision';
   for(const lesson of group.algos){const link=document.createElement('a');link.href='#'+category;link.className='subtopic-link';link.dataset.page='visualizer';link.dataset.topic=category;link.dataset.algo=lesson.id;link.textContent=lesson.name;sub.append(link);}
   wrapper.append(sub);navigation.append(wrapper);
  }
  if(categories){const button=document.createElement('button');button.className='algo-category'+(category==='sorting'?' active':'');button.dataset.category=category;button.textContent=group.icon+' '+group.label;categories.append(button);}
 }
 const topicMap={topicArrays:'arrays',topicLinkedList:'linkedlist',topicStacks:'stack',topicTrees:'tree',topicGraphs:'graphs',topicSorting:'sorting',topicDP:'dp',topicHashing:'hashing'};
 for(const [id,category]of Object.entries(topicMap)){const card=document.getElementById(id);if(card){card.href='dashboard.html#'+category;card.querySelector('.topic-count').textContent=AlgoLessons[category].algos.length+' visualizers';}}
 const count=Object.keys(AlgoLessonById).length;
 const stats=document.getElementById('statVisuals');if(stats)stats.textContent=count;
})();
