/* ============================================
   ALGOVERSE — Dashboard JavaScript
   Visualizer, Practice, Battle, Navigation
   ============================================ */
(async function () {
    'use strict';
    if(globalThis.AlgoAPI?.enabled){try{await AlgoAPI.ready;}catch{return;}if(!AlgoAPI.user)return;}

    // === User Data ===
    const userData = AlgoStore.read('algoverse_user', {name:'Guest', role:'student'});
    const welcomeName = document.getElementById('welcomeName');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const displayName = userData.name || 'Guest';
    if (welcomeName) welcomeName.textContent = displayName;
    if (userName) userName.textContent = displayName;
    if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();

    // This app uses the dark theme only. Ignore and remove older saved theme preferences.
    try {localStorage.removeItem('algoverse_theme');} catch {}
    // === Sidebar Toggle ===
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const topbarMenu = document.getElementById('topbarMenu');

    if (sidebarToggle) sidebarToggle.addEventListener('click', () => {sidebar.classList.toggle('collapsed');sidebarToggle.setAttribute('aria-expanded',!sidebar.classList.contains('collapsed'));sidebarToggle.setAttribute('aria-label',sidebar.classList.contains('collapsed')?'Expand sidebar':'Collapse sidebar');});
    if (topbarMenu) topbarMenu.addEventListener('click', () => {sidebar.classList.remove('collapsed');sidebar.classList.toggle('open');sidebarToggle.setAttribute('aria-expanded','true');sidebarToggle.setAttribute('aria-label','Collapse sidebar');});

    // === Page Navigation ===
    const pages = document.querySelectorAll('.page');
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');

    function showPage(pageId) {
        pages.forEach(p => p.classList.remove('active'));
        sidebarLinks.forEach(l => l.classList.remove('active'));
        const page = document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
        if (page) page.classList.add('active');
        sidebarLinks.forEach(l => { if (l.dataset.page === pageId) l.classList.add('active'); });
        if (window.innerWidth <= 768) sidebar.classList.remove('open');
    }

    sidebarLinks.forEach(link => {
        link.setAttribute('aria-label',link.textContent.trim());link.title=link.textContent.trim();
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
            if (link.dataset.topic && !link.classList.contains('subtopic-link')) selectCategory(link.dataset.topic);
        });
    });

    // === Topic Accordions & Subdivision Navigation ===
    document.querySelectorAll('.topic-header').forEach(header => {
        header.addEventListener('click', () => {
            const group = header.closest('.topic-group');
            if (sidebar.classList.contains('collapsed')) {sidebar.classList.remove('collapsed');sidebarToggle.setAttribute('aria-expanded','true');sidebarToggle.setAttribute('aria-label','Collapse sidebar');group.classList.add('open');header.setAttribute('aria-expanded','true');return;}
            const topic = header.dataset.topic;
            document.querySelectorAll('.topic-group').forEach(g => {
                if (g !== group) {g.classList.remove('open');g.querySelector('.topic-header')?.setAttribute('aria-expanded','false');}
            });
            group.classList.toggle('open');
            header.setAttribute('aria-expanded',group.classList.contains('open'));
            showPage('visualizer');
            selectCategory(topic);
        });
    });

    document.querySelectorAll('.subtopic-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const topic = link.dataset.topic;
            const algoId = link.dataset.algo;
            document.querySelectorAll('.subtopic-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const group = link.closest('.topic-group');
            if (group) group.classList.add('open');
            showPage('visualizer');
            selectCategory(topic, algoId);
        });
    });

    // === Global Search ===
    const searchInput = document.getElementById('searchInput');
    const searchDropdown = document.getElementById('searchDropdown');

    const SEARCH_ITEMS = [
        ...Object.entries(AlgoLessons).flatMap(([category,g])=>g.algos.map(a=>({name:a.name,category,algoId:a.id,type:'algo'}))),
        { name: '1. Two Sum', problemId: 'two-sum', type: 'problem' },
        { name: '206. Reverse a Linked List', problemId: 'reverse-linked-list', type: 'problem' },
        { name: '20. Valid Parentheses', problemId: 'valid-parentheses', type: 'problem' },
        { name: '21. Merge Two Sorted Lists', problemId: 'merge-sorted-lists', type: 'problem' },
        { name: '53. Maximum Subarray (Kadane)', problemId: 'max-subarray', type: 'problem' },
        { name: '121. Best Time to Buy and Sell Stock', problemId: 'best-time-stock', type: 'problem' },
        { name: '70. Climbing Stairs', problemId: 'climbing-stairs', type: 'problem' }
    ];

    if (searchInput && searchDropdown) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            if (!query) {
                searchDropdown.style.display = 'none';
                return;
            }

            const matches = SEARCH_ITEMS.filter(item => item.name.toLowerCase().includes(query)).slice(0, 8);
            if (matches.length === 0) {
                searchDropdown.innerHTML = '<div style="padding: 10px; font-size: 0.8rem; color: var(--text-muted); text-align: center;">No matches found</div>';
                searchDropdown.style.display = 'block';
                return;
            }

            searchDropdown.innerHTML = matches.map(item => `
                <button type="button" class="search-result-item" data-type="${item.type}" data-cat="${item.category || ''}" data-algo="${item.algoId || ''}" data-problem="${item.problemId || ''}">
                    <span>${item.name}</span>
                    <span class="search-result-badge ${item.type}">${item.type}</span>
                </button>
            `).join('');
            searchDropdown.style.display = 'block';

            searchDropdown.querySelectorAll('.search-result-item').forEach(el => {
                el.addEventListener('click', () => {
                    const type = el.dataset.type;
                    if (type === 'algo') {
                        showPage('visualizer');
                        selectCategory(el.dataset.cat, el.dataset.algo);
                    } else if (type === 'topic') {
                        showPage('visualizer');
                        selectCategory(el.dataset.cat);
                    } else if (type === 'problem') {
                        showPage('practice');
                        openSolver(el.dataset.problem);
                    }
                    searchDropdown.style.display = 'none';
                    searchInput.value = '';
                });
            });
        });

        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
                searchDropdown.style.display = 'none';
            }
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const first = searchDropdown.querySelector('.search-result-item');
                if (first) first.click();
            } else if (e.key === 'Escape') {
                searchDropdown.style.display = 'none';
            }
        });
    }

    // === Logout ===
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => {
        if(globalThis.AlgoAPI?.enabled){AlgoAPI.logout().catch(e=>AlgoAPI.status(e.message,true));return;}
        localStorage.removeItem('algoverse_user');
        window.location.href = 'index.html';
    });

    // ============================================
    // DSA VISUALIZER
    // ============================================
    const ALGORITHMS = AlgoLessons;

    let collapseOnSelection = false;
    let currentArray = [];
    let seedValues = [];
    let currentStep = null;
    let sorting = false;
    let paused = false;
    let animSpeed = 25;
    let currentAlgo = null;
    let steps = [];
    let stepIndex = 0;
    let comparisons = 0;
    let swaps = 0;
    let animTimer = null;

    const vizBars = document.getElementById('vizBars');
    const vizEmpty = document.getElementById('vizEmpty');
    const vizTitle = document.getElementById('vizTitle');
    const vizComplexity = document.getElementById('vizComplexity');
    const speedSlider = document.getElementById('speedSlider');
    const sizeSlider = document.getElementById('sizeSlider');
    const algoList = document.getElementById('algoList');

    // Category buttons
    const catButtons = document.querySelectorAll('.algo-category');
    catButtons.forEach(btn => {
        btn.addEventListener('click', () => selectCategory(btn.dataset.category));
    });

    function selectCategory(cat, targetAlgoId = null) {
        if (!ALGORITHMS[cat]) return;
        catButtons.forEach(b => b.classList.toggle('active', b.dataset.category === cat));
        renderAlgoList(cat, targetAlgoId);
    }
    function renderAlgoList(cat, targetAlgoId = null) {
        algoList.replaceChildren();
        const group=ALGORITHMS[cat];
        const available=group.algos.filter(a=>!AlgoAPI.enabled||AlgoAPI.activeLessons.has(a.id));
        if(!available.length){algoList.textContent='No published lessons in this category.';return;}
        const selected=available.find(a=>a.id===targetAlgoId)||available[0];
        available.forEach(algo=>{
            const btn=document.createElement('button'); btn.className='algo-btn'+(algo===selected?' active':'');
            btn.textContent=algo.name;btn.dataset.algo=algo.id;
            btn.addEventListener('click',()=>{algoList.querySelectorAll('.algo-btn').forEach(b=>b.classList.toggle('active',b===btn));selectAlgorithm(algo);});
            algoList.append(btn);
        });
        selectAlgorithm(selected);
    }
    function selectAlgorithm(algo) {
        if(AlgoAPI.enabled&&!AlgoAPI.activeLessons.has(algo.id)){AlgoAPI.status('This lesson is not currently published.');return;}
        currentAlgo=algo;
        if(collapseOnSelection) {if(innerWidth>768){sidebar.classList.add('collapsed');sidebarToggle.setAttribute('aria-expanded','false');sidebarToggle.setAttribute('aria-label','Expand sidebar');}else sidebar.classList.remove('open','collapsed');document.getElementById('lessonPicker').open=false;}
        document.querySelectorAll('.subtopic-link').forEach(link=>link.classList.toggle('active',link.dataset.algo===algo.id));
        vizTitle.textContent=algo.name;vizComplexity.textContent=algo.worst;
        vizEmpty.classList.add('hidden');
        document.getElementById('traceVars').hidden=!['bars','cells','string'].includes(algo.view);
        document.getElementById('algoExplanation').textContent=algo.desc;
        document.getElementById('lessonAnalogy').textContent=algo.analogy;
        document.getElementById('lessonUse').textContent='Where you use it: '+algo.use;
        document.getElementById('lessonNote').textContent=algo.note;
        const costs={'O(1)':'constant work for one operation','O(n)':'work grows with the number of values','O(log n)':'work grows slowly as the collection grows','O(n²)':'work can grow like the number of values squared','O(n log n)':'more work than a single scan, much less than comparing every pair','O(V + E)':'visit graph nodes and their connections','O(V² + E)':'scan nodes to select each next node, then check connections','O(nC)':'fill a table for each item and bag capacity','O(d(n + 10))':'make one bucket pass per digit'};
        document.getElementById('lessonCost').textContent='Worst-case time in everyday terms: '+(costs[algo.worst]||algo.worst)+'. n = values, V = graph nodes, E = edges, C = bag capacity, d = digits. Costs exclude drawing the animation.';
        const guide=document.getElementById('lessonGuide');guide.replaceChildren();
        algo.guide.forEach(text=>{const li=document.createElement('li');li.textContent=text;guide.append(li);});
        for(const [id,key] of [['bestCase','best'],['avgCase','avg'],['worstCase','worst'],['spaceComp','space']])document.getElementById(id).textContent=algo[key];
        const isGraph=algo.view==='graph',isText=algo.view==='string';
        document.getElementById('valueControls').hidden=isGraph||isText||['fibonacci','memoization'].includes(algo.id);
        document.getElementById('graphControls').hidden=!isGraph;
        document.getElementById('textControls').hidden=!isText;
        const paramLabels={linear:'Target to find',binary:'Target to find',sliding:'Window size k',two_pointer:'Pair sum target',bst:'Value to find',bfs_graph:'Start node',dfs_graph:'Start node',dijkstra:'Start node',fibonacci:'n (0–20)',memoization:'n (0–20)',knapsack:'Bag capacity (0–20)',hash_chaining:'Key to find',hash_probing:'Key to find',hashset:'Value to find'};
        document.getElementById('parameterControls').hidden=!paramLabels[algo.id];
        document.getElementById('parameterLabel').textContent=paramLabels[algo.id]||'Parameter';
        document.getElementById('searchTarget').value=isGraph?0:algo.id==='sliding'?3:['fibonacci','memoization'].includes(algo.id)?8:algo.id==='knapsack'?5:40;
        const graph=AlgoDSA.defaultGraph(algo.id==='topological');
        document.getElementById('graphInput').value=graph.edges.map(e=>`${e.from}-${e.to}:${e.weight}`).join(', ');
        document.getElementById('stringInput').value='ALGORITHM';
        document.getElementById('valuesInput').value=algo.id==='knapsack'?'6, 10, 12':algo.view==='tree'?'30, 20, 10, 25, 40, 50':'18, 7, 25, 3, 12, 7';
        sizeSlider.disabled=isGraph||isText||['fibonacci','memoization'].includes(algo.id);
        resetViz();applyInputs();
    }
    function optionsFromInputs() {
        const options={target:Number(document.getElementById('searchTarget').value),text:document.getElementById('stringInput').value};
        if(!Number.isSafeInteger(options.target))throw new Error('Use a whole number for the target or parameter.');
        if(currentAlgo.view==='graph')options.graph=AlgoDSA.parseGraph(document.getElementById('graphInput').value);
        return options;
    }
    function applyInputs() {
        try {
            const text=document.getElementById('valuesInput').value.trim();
            const values=text?text.split(',').map(v=>{if(!v.trim())throw new Error('Enter values separated by commas, with no empty entries.');return Number(v.trim());}):[];
            if(values.length>25||values.some(v=>!Number.isSafeInteger(v)||Math.abs(v)>1000))throw new Error('Use up to 25 whole numbers between −1000 and 1000.');
            if(Array.from(document.getElementById('stringInput').value).length>25)throw new Error('Use at most 25 characters.');
            const prepared=AlgoDSA.generate(currentAlgo.id,values,optionsFromInputs());
            resetViz();seedValues=[...values];currentArray=[...values];steps=prepared;updateInfo();renderPreview();renderLessonCode();updateInspector(null);
            document.getElementById('lessonError').textContent='';return true;
        } catch(error) {resetViz();document.getElementById('lessonError').textContent=error.message;setStatus('Check input');return false;}
    }
    function generateArray() {
        if(currentAlgo.view==='graph') {
            const graph=AlgoDSA.defaultGraph(currentAlgo.id==='topological');
            document.getElementById('graphInput').value=graph.edges.map(e=>`${e.from}-${e.to}:${e.weight}`).join(', ');
        } else if(currentAlgo.view==='string')document.getElementById('stringInput').value='ALGORITHM';
        else document.getElementById('valuesInput').value=Array.from({length:Number(sizeSlider.value)},()=>Math.floor(Math.random()*99)+1).join(', ');
        applyInputs();
    }
    function renderPreview() {
        let state={};const view=currentAlgo.view;
        if(view==='graph'){const graph=optionsFromInputs().graph;state={...graph,directed:currentAlgo.id==='topological',visited:[]};}
        if(view==='string')state={chars:Array.from(document.getElementById('stringInput').value)};
        if(view==='table')state={table:Array(Number(document.getElementById('searchTarget').value)+1).fill(null)};
        if(view==='buckets')state={buckets:Array.from({length:currentAlgo.id==='hash_probing'?Math.max(7,seedValues.length*2+1):7},()=>[])};
        const initialArray=['stack','queue','list','heap','tree'].includes(view)?[]:seedValues;
        AlgoView.draw(vizBars,currentAlgo,{array:initialArray,state,active:[]});
        document.getElementById('stepNarration').textContent='Press Step to learn one move at a time, or Play to watch the full example.';
    }
    function renderBars() {
        if(currentStep)AlgoView.draw(vizBars,currentAlgo,currentStep);
    }

    function resetCounters() {
        comparisons = 0; swaps = 0; stepIndex = 0;
        updateInfo();
    }

    function updateInfo() {
        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        el('infoComparisons', comparisons);
        el('infoSwaps', swaps);
        el('stepCurrent', stepIndex);
        el('stepTotal', steps.length);
        const timeline=document.getElementById('vizTimeline');timeline.max=steps.length;timeline.value=stepIndex;timeline.disabled=!steps.length;
        document.getElementById('vizPrevious').disabled=stepIndex===0;
    }

    function setStatus(s) {
        const el = document.getElementById('infoStatus');
        if (el) el.textContent = s;
        if(AlgoAPI.enabled&&s.startsWith('Completed')&&currentAlgo)AlgoAPI.queue('lesson:'+currentAlgo.id,'/progress/lessons/'+currentAlgo.id,{completed:true});
    }

    // === Sorting Algorithms (generate steps) ===
    function generateSortSteps() {
        if (!currentAlgo) return;
        steps = AlgoDSA.generate(currentAlgo.id, seedValues, optionsFromInputs());
    }

    // === Play/Pause/Step/Reset ===
    function resetViz() {
        sorting = false;
        paused = false;
        clearTimeout(animTimer);
        steps = [];
        currentStep = null;
        stepIndex = 0;
        comparisons = 0;
        swaps = 0;
        updateInfo();
        setStatus('Ready');
        document.getElementById('traceCode').textContent = (currentAlgo?.name || 'Select an algorithm') + ' — press Play or Step to inspect events.';
        ['varI','varJ','varAJ','varAJ1'].forEach(id=>document.getElementById(id).textContent='—');
        document.getElementById('stepExplanation').textContent='Read the starting example, then press Step to see the first operation.';
        document.getElementById('explanationStep').textContent='Before we begin';
        document.querySelectorAll('#lessonGuide li').forEach(li=>{li.classList.remove('is-active');li.removeAttribute('aria-current');});
        renderLessonCode();updateInspector(null);
        const playBtn = document.getElementById('vizPlay');
        const pauseBtn = document.getElementById('vizPause');
        if (playBtn) playBtn.disabled = !currentAlgo;
        if (pauseBtn) pauseBtn.disabled = true;
    }

    function preparePlayback() {
        return steps.length>0 || applyInputs();
    }
    function setSnapshot(index) {
        stepIndex=Math.max(0,Math.min(index,steps.length));
        comparisons=0;swaps=0;
        for(let i=0;i<stepIndex;i++) {
            const type=steps[i].type;
            if(type==='compare')comparisons++;
            else if(type==='swap')swaps+=2;
            else if(type==='write'||type==='change')swaps++;
        }
        currentStep=stepIndex?steps[stepIndex-1]:null;
        currentArray=currentStep?[...currentStep.array]:[...seedValues];
        if(currentStep){renderBars();updateStepDetails(currentStep);}else {renderPreview();renderLessonCode();updateInspector(null);document.querySelectorAll('#lessonGuide li').forEach(li=>{li.classList.remove('is-active');li.removeAttribute('aria-current');});['varI','varJ','varAJ','varAJ1'].forEach(id=>document.getElementById(id).textContent='—');document.getElementById('traceCode').textContent='Initial example: ['+seedValues.join(', ')+']';document.getElementById('stepExplanation').textContent='This is the starting state, before any operation.';document.getElementById('explanationStep').textContent='Before we begin';}
        updateInfo();
        updateInspector(currentStep);
    }
    function playViz() {
        if(!preparePlayback())return;
        clearTimeout(animTimer);
        if(stepIndex===steps.length)setSnapshot(0);
        sorting=true;paused=false;setStatus('Running');
        document.getElementById('vizPlay').disabled=true;document.getElementById('vizPause').disabled=false;
        runStep();
    }
    function runStep() {
        if(!sorting||paused)return;
        if(stepIndex<steps.length)setSnapshot(stepIndex+1);
        if(stepIndex===steps.length) {
            sorting=false;setStatus('Completed ✓');document.getElementById('vizPlay').disabled=false;document.getElementById('vizPause').disabled=true;return;
        }
        animTimer=setTimeout(runStep,Math.max(60,950-animSpeed*8.5));
    }
    function pauseViz() {
        clearTimeout(animTimer);sorting=false;paused=true;setStatus('Paused');
        document.getElementById('vizPlay').disabled=false;document.getElementById('vizPause').disabled=true;
    }
    function seekViz(index) {
        if(!preparePlayback())return;
        pauseViz();setSnapshot(index);
        setStatus(stepIndex===0?'Ready':stepIndex===steps.length?'Completed ✓':'Stepping');
    }
    function stepViz() {seekViz(stepIndex+1);}
    function renderLessonCode() {
        const language=document.getElementById('codeView').value;
        if(currentAlgo)AlgoCode.render(document.getElementById('lessonCode'),currentAlgo.id,currentStep,language);
        const link=document.getElementById('languageSource');link.hidden=language==='english';
        if(!link.hidden)link.href=language==='javascript'?'examples/algorithms.js':AlgoCode.entry(currentAlgo.id,language).sourceUrl;
    }
    function updateInspector(step) {
        const box=document.getElementById('lessonInspector');box.replaceChildren();
        const entries=[['comparisons',comparisons],['changes / writes',swaps]];
        const state=step?.state||{};
        if(step?.indices?.length)entries.push(['positions',step.indices.join(', ')]);
        if(step?.compareValues)entries.push(['comparing',step.compareValues.join(' and ')]);
        if(state.sum!==undefined)entries.push(['window sum',state.sum]);
        if(state.best!==undefined&&state.best!==null)entries.push(['best sum',state.best]);
        if(state.frontier)entries.push(['queue',state.frontier.join(' → ')||'empty']);
        if(state.visited)entries.push(['visited',state.visited.join(' → ')||'none']);
        if(state.removed)entries.push(['removed',state.removed.join(', ')||'none']);
        if(state.table&&!Array.isArray(state.table[0]))entries.push(['saved answers',state.table.map(v=>v===null?'?':v).join(', ')]);
        if(state.cell)entries.push(['table cell',`item ${state.cell[0]}, capacity ${state.cell[1]}`]);
        if(state.root)entries.push(['root',state.root.value]);
        if(state.left)entries.push(['left buffer',state.left.join(', ')]);
        if(state.right)entries.push(['right buffer',state.right.join(', ')]);
        if(state.result!==undefined)entries.push(['answer',state.result]);
        if(state.found!==undefined)entries.push(['found',String(state.found)]);
        if(state.distance)entries.push(['distances',Object.entries(state.distance).map(([n,d])=>`${n}: ${d}`).join(' · ')]);
        for(const[name,value]of entries){const row=document.createElement('div');row.className='inspector-row';const term=document.createElement('dt');term.textContent=name;const val=document.createElement('dd');val.textContent=value;row.append(term,val);box.append(row);}
    }

    function updateStepDetails(step) {
        let reason='';
        const pair=step.compareValues||step.indices?.map(i=>step.array[i])||[];
        if(step.kind==='compare'&&['bubble','insertion'].includes(currentAlgo.id))reason=pair[0]>pair[1]?`${pair[0]} is bigger than ${pair[1]}, so these neighbors need swapping.`:'These neighbors are already in the right order.';
        if(step.kind==='compare'&&currentAlgo.id==='selection')reason=pair[1]<pair[0]?`${pair[1]} is smaller; remember it as the new smallest candidate.`:`Keep ${pair[0]} as the smallest candidate so far.`;
        if(step.kind==='compare'&&currentAlgo.id==='merge')reason=pair[0]<=pair[1]?`Take ${pair[0]} from the left buffer first.`:`Take ${pair[1]} from the right buffer first.`;
        if(step.kind==='swap'&&['bubble','insertion'].includes(currentAlgo.id))reason=`The smaller value ${step.array[step.indices[0]]} is now on the left; the larger value is on the right.`;
        const narration=step.message+(reason?' '+reason:'');
        document.getElementById('stepNarration').textContent=narration;
        document.getElementById('explanationStep').textContent=`Step ${stepIndex} of ${steps.length}`;
        const purpose=step.kind==='done'?'The result is ready. You can move backward to revisit how we reached it.':step.kind==='compare'?'This check decides what to do next.':step.kind==='swap'||step.kind==='write'||step.kind==='change'?'The whiteboard now shows the changed state.':'The highlighted items are the ones we are working on now.';
        document.getElementById('stepExplanation').textContent=narration+' '+purpose+' '+(currentAlgo.guide[step.guide]||'');
        renderLessonCode();
        document.getElementById('traceCode').textContent=`${currentAlgo.name} — step ${stepIndex}/${steps.length}\n${step.message}\n${step.array.length?'Values: ['+step.array.join(', ')+']':''}`;
        document.querySelectorAll('#lessonGuide li').forEach((li,i)=>{li.classList.toggle('is-active',i===step.guide);if(i===step.guide)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current');});
        const indices=step.indices||step.active||[];
        const values=[indices[0],indices[1],step.compareValues?.[0]??step.array[indices[0]],step.compareValues?.[1]??step.array[indices[1]]];
        ['varI','varJ','varAJ','varAJ1'].forEach((id,i)=>document.getElementById(id).textContent=values[i]??'—');
    }
    document.getElementById('applyExample').addEventListener('click',applyInputs);
    document.getElementById('codeView').addEventListener('change',renderLessonCode);
    document.getElementById('vizPrevious').addEventListener('click',()=>seekViz(stepIndex-1));
    document.getElementById('vizTimeline').addEventListener('input',event=>seekViz(Number(event.target.value)));
    ['searchTarget','valuesInput','stringInput','graphInput'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{resetViz();document.getElementById('stepNarration').textContent='Input changed. Press Apply, Step, or Play to use it.';}));

    // Bind visualizer buttons
    const vizGenerate = document.getElementById('vizGenerate');
    const vizPlay = document.getElementById('vizPlay');
    const vizPause = document.getElementById('vizPause');
    const vizStep = document.getElementById('vizStep');
    const vizReset = document.getElementById('vizReset');

    if (vizGenerate) vizGenerate.addEventListener('click', () => { resetViz(); generateArray(); });
    if (vizPlay) vizPlay.addEventListener('click', playViz);
    if (vizPause) vizPause.addEventListener('click', pauseViz);
    if (vizStep) vizStep.addEventListener('click', stepViz);
    if (vizReset) vizReset.addEventListener('click', applyInputs);
    if (speedSlider) speedSlider.addEventListener('input', (e) => { animSpeed = parseInt(e.target.value); });
    if (sizeSlider) sizeSlider.addEventListener('input', () => { resetViz(); generateArray(); });

    // Init first category
    selectCategory('sorting');
    collapseOnSelection=true;

    // ============================================
    // ALGORITHM BATTLE
    // ============================================
    const battleAlgoA = document.getElementById('battleAlgoA');
    const battleAlgoB = document.getElementById('battleAlgoB');
    const battleSize = document.getElementById('battleSize');
    const battleSizeVal = document.getElementById('battleSizeVal');
    const battleStart = document.getElementById('battleStart');

    if (battleSize) battleSize.addEventListener('input', () => { if (battleSizeVal) battleSizeVal.textContent = battleSize.value; });

    const ALGO_DATA = {
        bubble: { name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
        selection: { name: 'Selection Sort', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'No' },
        insertion: { name: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', stable: 'Yes' },
        merge: { name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: 'Yes' },
        quick: { name: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n²)', space: 'O(log n)', stable: 'No' },
    };

    function updateBattleComparison() {
        const a = battleAlgoA ? battleAlgoA.value : 'merge';
        const b = battleAlgoB ? battleAlgoB.value : 'bubble';
        const da = ALGO_DATA[a], db = ALGO_DATA[b];
        const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
        el('battleTitleA', da.name); el('battleTitleB', db.name);
        el('compHeaderA', da.name); el('compHeaderB', db.name);
        el('compBestA', da.best); el('compBestB', db.best);
        el('compAvgA', da.avg); el('compAvgB', db.avg);
        el('compWorstA', da.worst); el('compWorstB', db.worst);
        el('compSpaceA', da.space); el('compSpaceB', db.space);
        el('compStableA', da.stable); el('compStableB', db.stable);
    }

    if (battleAlgoA) battleAlgoA.addEventListener('change', updateBattleComparison);
    if (battleAlgoB) battleAlgoB.addEventListener('change', updateBattleComparison);

    function sortWithCount(arr, algo) {
        return AlgoBattle.measure(arr, algo);
    }

    function renderBattleBars(container, arr) {
        if (!container) return;
        container.innerHTML = '';
        const max = Math.max(...arr);
        arr.forEach(v => {
            const bar = document.createElement('div');
            bar.className = 'viz-bar default';
            bar.style.height = ((v / max) * 100) + '%';
            container.appendChild(bar);
        });
    }

    if (battleStart) {
        battleStart.addEventListener('click', () => {
            const size = battleSize ? parseInt(battleSize.value) : 30;
            const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 200) + 10);
            const algoA = battleAlgoA ? battleAlgoA.value : 'merge';
            const algoB = battleAlgoB ? battleAlgoB.value : 'bubble';

            const resA = sortWithCount(arr, algoA);
            const resB = sortWithCount(arr, algoB);

            const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
            el('battleCompA', resA.comparisons); el('battleSwapA', resA.swaps); el('battleTimeA', resA.time + 'ms');
            el('battleCompB', resB.comparisons); el('battleSwapB', resB.swaps); el('battleTimeB', resB.time + 'ms');

            renderBattleBars(document.getElementById('battleVizA'), resA.sorted);
            renderBattleBars(document.getElementById('battleVizB'), resB.sorted);

            // Color bars green (sorted)
            document.querySelectorAll('#battleVizA .viz-bar, #battleVizB .viz-bar').forEach(b => {
                b.classList.remove('default');
                b.classList.add('sorted');
            });

            updateBattleComparison();
        });
    }

    // Init battle
    updateBattleComparison();
    // Generate initial battle bars
    const initBattleArr = Array.from({ length: 30 }, () => Math.floor(Math.random() * 200) + 10);
    renderBattleBars(document.getElementById('battleVizA'), initBattleArr);
    renderBattleBars(document.getElementById('battleVizB'), [...initBattleArr]);

    // ============================================
    // PRACTICE ARENA & LEETCODE PROBLEM SOLVER
    // ============================================
    const LEETCODE_PROBLEMS = AlgoProblems;

    let currentProblemIndex = 0;
    let activeTestIndex = 0;
    let latestTestResults = [];

    function getStarterCode(p, lang) {
        if(AlgoAPI.enabled&&p.starters?.[lang])return p.starters[lang];
        if (lang === 'python') return p.pyStarter || p.jsStarter;
        if (lang === 'java') return p.javaStarter || p.jsStarter;
        if (lang === 'cpp') return p.cppStarter || p.jsStarter;
        if (lang === 'c') return p.cStarter || p.jsStarter;
        return p.jsStarter;
    }

    const practiceListView = document.getElementById('practiceListView');
    const practiceSolverView = document.getElementById('practiceSolverView');
    const solverBackBtn = document.getElementById('solverBackBtn');
    const solverPrevBtn = document.getElementById('solverPrevBtn');
    const solverNextBtn = document.getElementById('solverNextBtn');
    const btnNextInline = document.getElementById('btnNextInline');
    const codeEditorInput = document.getElementById('codeEditorInput');
    const editorLangSelect = document.getElementById('editorLangSelect');
    const editorResetBtn = document.getElementById('editorResetBtn');
    const editorCopyBtn = document.getElementById('editorCopyBtn');
    const btnRunCode = document.getElementById('btnRunCode');
    const btnSubmitCode = document.getElementById('btnSubmitCode');
    const hintToggleBtn = document.getElementById('hintToggleBtn');
    const hintContent = document.getElementById('hintContent');
    const submitSuccessBanner = document.getElementById('submitSuccessBanner');
    const testRunStatusText = document.getElementById('testRunStatusText');

    const progressKey = 'algoverse_progress_' + (userData.email || userData.name || 'guest');
    const draftKey = (p, lang) => progressKey + '_draft_' + p.id + '_' + lang;
    let executionVersion = 0;
    function loadProblem(index) {
        executionVersion++;
        btnRunCode.disabled = false; btnSubmitCode.disabled = false;
        if (index < 0) index = LEETCODE_PROBLEMS.length - 1;
        if (index >= LEETCODE_PROBLEMS.length) index = 0;
        currentProblemIndex = index;
        latestTestResults = [];
        const p = LEETCODE_PROBLEMS[index];
        document.getElementById('practiceSolverView').dataset.problem=p.id;
        document.dispatchEvent(new CustomEvent('algo-problem',{detail:p.id}));

        // Populate top bar metadata
        const tagEl = document.getElementById('solverProblemIdTag');
        if (tagEl) tagEl.textContent = `LeetCode #${p.number}`;
        const diffEl = document.getElementById('solverDiffBadge');
        if (diffEl) {
            diffEl.textContent = p.difficulty;
            diffEl.className = `difficulty-badge ${p.difficulty.toLowerCase()}`;
        }
        const accEl = document.getElementById('solverAccRate');
        if (accEl) accEl.textContent = p.acceptance;

        // Populate Title and Tags
        const titleEl = document.getElementById('solverTitle');
        if (titleEl) titleEl.textContent = `${p.number}. ${p.title}`;
        const tagsContainer = document.getElementById('solverTags');
        if (tagsContainer) {
            tagsContainer.innerHTML = p.tags.map(t => `<span class="tag">${AlgoAPI.escape(t)}</span>`).join('');
        }

        // Description
        const descEl = document.getElementById('solverDescription');
        if (descEl) descEl.innerHTML = p.description;

        // Examples
        const exContainer = document.getElementById('solverExamples');
        if (exContainer) {
            exContainer.innerHTML = p.examples.map((ex, i) => `
                <div class="example-card">
                    <h5>Example ${i + 1}:</h5>
                    <pre><strong>Input:</strong> ${AlgoAPI.escape(ex.input)}\n<strong>Output:</strong> ${AlgoAPI.escape(ex.output)}${ex.explanation ? `\n<strong>Explanation:</strong> ${AlgoAPI.escape(ex.explanation)}` : ''}</pre>
                </button>
            `).join('');
        }

        // Constraints
        const consList = document.getElementById('solverConstraints');
        if (consList) {
            consList.innerHTML = p.constraints.map(c => `<li>${AlgoAPI.escape(c)}</li>`).join('');
        }

        // Hint
        const hintEl = document.getElementById('solverHintText');
        if (hintEl) hintEl.textContent = p.hint;
        if (hintContent) hintContent.style.display = 'none';

        // Code Editor content
        const lang = editorLangSelect ? editorLangSelect.value : 'javascript';
        if (codeEditorInput) {
            codeEditorInput.value = AlgoStore.read(draftKey(p, lang), getStarterCode(p, lang));
            updateLineNumbers();
        }

        // Hide submission banner & reset output status
        if (submitSuccessBanner) submitSuccessBanner.style.display = 'none';
        if (testRunStatusText) testRunStatusText.textContent = 'Ready to run';
        const actualRow = document.getElementById('actualOutputRow');
        if (actualRow) actualRow.style.display = 'none';

        // Reset testcase tab display
        selectTestTab(0);

        // Reset test tab dots
        [0, 1, 2].forEach(i => {
            const dot = document.querySelector(`#testTab${i} .test-tab-dot`);
            if (dot) {
                dot.className = 'test-tab-dot';
                dot.style.color = '';
            }
        });
    }

    function selectTestTab(idx) {
        activeTestIndex = idx;
        const p = LEETCODE_PROBLEMS[currentProblemIndex];
        document.querySelectorAll('.test-tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === idx);
        });

        const inputValEl = document.getElementById('testInputVal');
        const expectedValEl = document.getElementById('testExpectedVal');
        const actualRow = document.getElementById('actualOutputRow');
        const actualVal = document.getElementById('testActualVal');

        if (idx === 'results') {
            if (inputValEl) inputValEl.textContent = 'Execution output logs will appear here.';
            if (expectedValEl) expectedValEl.textContent = 'Run or Submit solution to see details.';
            if (actualRow) actualRow.style.display = 'none';
            return;
        }

        const tc = p.testCases[idx] || p.testCases[0];
        if (inputValEl) inputValEl.textContent = tc.input;
        if (expectedValEl) expectedValEl.textContent = tc.expected;

        // Restore actual output if this test was executed
        if (latestTestResults[idx] && actualRow && actualVal) {
            actualRow.style.display = 'block';
            actualVal.textContent = latestTestResults[idx].actual;
            actualVal.style.color = latestTestResults[idx].passed ? '#34d399' : '#ef4444';
        } else if (actualRow) {
            actualRow.style.display = 'none';
        }
    }

    function updateLineNumbers() {
        const lineCount = (codeEditorInput ? codeEditorInput.value.split('\n').length : 12);
        const lineEl = document.getElementById('editorLineNumbers');
        if (lineEl) {
            let html = '';
            for (let i = 1; i <= Math.max(12, lineCount); i++) {
                html += `<span>${i}</span>`;
            }
            lineEl.innerHTML = html;
        }
    }

    if (codeEditorInput) {
        codeEditorInput.addEventListener('input', () => { updateLineNumbers(); AlgoStore.write(draftKey(LEETCODE_PROBLEMS[currentProblemIndex], editorLangSelect.value), codeEditorInput.value); });
        // Allow Tab indentation inside textarea
        codeEditorInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = codeEditorInput.selectionStart;
                const end = codeEditorInput.selectionEnd;
                codeEditorInput.value = codeEditorInput.value.substring(0, start) + '    ' + codeEditorInput.value.substring(end);
                codeEditorInput.selectionStart = codeEditorInput.selectionEnd = start + 4;
                updateLineNumbers();
                AlgoStore.write(draftKey(LEETCODE_PROBLEMS[currentProblemIndex], editorLangSelect.value), codeEditorInput.value);
            }
        });
    }

    // Language switcher
    if (editorLangSelect) {
        editorLangSelect.addEventListener('change', () => {
            const p = LEETCODE_PROBLEMS[currentProblemIndex];
            executionVersion++; btnRunCode.disabled = false; btnSubmitCode.disabled = false;
            if (codeEditorInput) {
                codeEditorInput.value = AlgoStore.read(draftKey(p, editorLangSelect.value), getStarterCode(p, editorLangSelect.value));
                updateLineNumbers();
            }
        });
    }

    // Reset code
    if (editorResetBtn) {
        editorResetBtn.addEventListener('click', () => {
            const p = LEETCODE_PROBLEMS[currentProblemIndex];
            const lang = editorLangSelect ? editorLangSelect.value : 'javascript';
            if (codeEditorInput) {
                codeEditorInput.value = getStarterCode(p, lang);
                AlgoStore.write(draftKey(p, lang), codeEditorInput.value);
                updateLineNumbers();
            }
        });
    }

    // Copy code
    if (editorCopyBtn) {
        editorCopyBtn.addEventListener('click', async () => {
            if (codeEditorInput) {
                try { await navigator.clipboard.writeText(codeEditorInput.value); } catch { testRunStatusText.textContent = 'Copy unavailable. Select the code and copy manually.'; return; }
                editorCopyBtn.textContent = '✓ Copied!';
                setTimeout(() => { editorCopyBtn.textContent = '📋 Copy'; }, 1500);
            }
        });
    }

    // Hint toggle
    if (hintToggleBtn && hintContent && !AlgoAPI.enabled) {
        hintToggleBtn.addEventListener('click', () => {
            const isHidden = hintContent.style.display === 'none';
            hintContent.style.display = isHidden ? 'block' : 'none';
            const arrow = hintToggleBtn.querySelector('.hint-arrow');
            if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
        });
    }

    // Run Code and Submit
    async function executeUserSolution(isSubmit = false) {
        const p = LEETCODE_PROBLEMS[currentProblemIndex];
        if (editorLangSelect.value !== 'javascript' && !AlgoAPI.enabled) {
            testRunStatusText.textContent = 'Execution is available only for JavaScript.'; return;
        }
        const version = ++executionVersion;
        submitSuccessBanner.style.display = 'none';
        latestTestResults = [];
        btnRunCode.disabled = true; btnSubmitCode.disabled = true;
        testRunStatusText.textContent = 'Running in isolated sandbox…';
        try {
            const fnName = {'two-sum':'twoSum','reverse-linked-list':'reverseList','valid-parentheses':'isValid','merge-sorted-lists':'mergeTwoLists','max-subarray':'maxSubArray','best-time-stock':'maxProfit','climbing-stairs':'climbStairs'}[p.id] || 'climbStairs';
            const tests = p.testCases.map(tc => {
                let args;
                tc.run((...values) => { args = values; });
                return {args, expected: JSON.parse(tc.expected)};
            });
            const result = AlgoAPI.enabled ? await AlgoAPI.request('/problems/'+encodeURIComponent(p.id)+'/execute',{method:'POST',body:JSON.stringify({code:codeEditorInput.value,language:editorLangSelect.value,submit:isSubmit})}) : await AlgoRunner.run(codeEditorInput.value, fnName, tests, p.id === 'two-sum');
            if(result.error)throw new Error(result.error);
            if (version !== executionVersion) return;
            latestTestResults = result.results;
            latestTestResults.forEach((r,i) => {
                const dot = document.querySelector(`#testTab${i} .test-tab-dot`);
                if (dot) {dot.className = 'test-tab-dot'; dot.style.color = r.passed ? '#22c55e' : '#ef4444';}
            });
            const allPassed = AlgoAPI.enabled ? result.accepted : latestTestResults.every(r => r.passed);
            testRunStatusText.textContent = `${allPassed ? (AlgoAPI.enabled&&isSubmit?'✓ Accepted by server':'✓ All sample tests passed') : 'Some tests failed'} (${editorLangSelect.value} • ${result.time.toFixed(2)}ms)`;
            if(AlgoAPI.enabled)document.dispatchEvent(new CustomEvent('algo-feedback',{detail:result.feedback}));
            selectTestTab(activeTestIndex);
            if (isSubmit && allPassed) {
                const progress = AlgoStore.read(progressKey, {});
                progress[p.id] = {solved:true, submittedAt:Date.now()};
                AlgoStore.write(progressKey, progress);
                if(AlgoAPI.enabled)await AlgoAPI.refresh();
                submitSuccessBanner.style.display = 'flex'; restoreSolved();
            }
            if(AlgoAPI.enabled&&isSubmit&&!allPassed)await AlgoAPI.refresh();
        } catch (err) {
            if (version !== executionVersion) return;
            testRunStatusText.textContent = 'Execution failed: ' + err.message;
            document.getElementById('actualOutputRow').style.display = 'block';
            document.getElementById('testActualVal').textContent = err.message;
        } finally {
            if (version === executionVersion) {btnRunCode.disabled = false; btnSubmitCode.disabled = false;}
        }
    }
    function restoreSolved() {
        const progress = AlgoStore.read(progressKey, {});
        document.querySelectorAll('.problem-card').forEach(card => {
            const icon = card.querySelector('.problem-status');
            if (icon) {const solved = !!progress[card.dataset.problem]?.solved; icon.className = 'problem-status' + (solved ? ' solved' : ''); icon.textContent = solved ? '✓' : '○';}
        });
    }
    restoreSolved();

    if (btnRunCode) btnRunCode.addEventListener('click', () => executeUserSolution(false));
    if (btnSubmitCode) btnSubmitCode.addEventListener('click', () => executeUserSolution(true));

    // Testcase tab switching
    document.querySelectorAll('.test-tab').forEach((tab, i) => {
        tab.addEventListener('click', () => {
            const testKey = tab.dataset.test;
            selectTestTab(testKey === 'results' ? 'results' : parseInt(testKey));
        });
    });

    // Navigation (Solve button clicks & Next/Prev)
    function openSolver(problemId) {
        let idx = LEETCODE_PROBLEMS.findIndex(p => p.id === problemId);
        if (idx === -1) idx = 0;
        loadProblem(idx);
        if (practiceListView) practiceListView.style.display = 'none';
        if (practiceSolverView) practiceSolverView.style.display = 'flex';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function closeSolver() {
        if (practiceSolverView) practiceSolverView.style.display = 'none';
        if (practiceListView) practiceListView.style.display = 'block';
    }

    if (solverBackBtn) solverBackBtn.addEventListener('click', closeSolver);

    if (solverNextBtn) {
        solverNextBtn.addEventListener('click', () => {
            loadProblem(currentProblemIndex + 1);
        });
    }

    if (solverPrevBtn) {
        solverPrevBtn.addEventListener('click', () => {
            loadProblem(currentProblemIndex - 1);
        });
    }

    if (btnNextInline) {
        btnNextInline.addEventListener('click', () => {
            loadProblem(currentProblemIndex + 1);
        });
    }

    // Attach click listeners to problem cards and "Solve →" buttons
    document.querySelectorAll('.problem-card').forEach(card => {
        const pId = card.dataset.problem;
        card.tabIndex = 0; card.setAttribute('role','button');
        card.addEventListener('keydown', event => {if(event.target===card && ['Enter',' '].includes(event.key)){event.preventDefault();openSolver(pId);}});
        const solveBtn = card.querySelector('.problem-action');
        if (solveBtn) {
            solveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openSolver(pId || 'two-sum');
            });
        }
        card.addEventListener('click', () => {
            openSolver(pId || 'two-sum');
        });
    });

    // Practice tabs
    const practTabs = document.querySelectorAll('.practice-tab');
    practTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            practTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (practiceSolverView && practiceSolverView.style.display !== 'none') {
                closeSolver();
            }
        });
    });

    // Difficulty filter
    const diffFilter = document.getElementById('difficultyFilter');
    if (diffFilter) {
        diffFilter.addEventListener('change', () => {
            const val = diffFilter.value;
            document.querySelectorAll('.problem-card').forEach(card => {
                card.style.display = (val === 'all' || card.dataset.difficulty === val) ? 'flex' : 'none';
            });
        });
    }

    // Landing-page deep links.
    const route=location.hash.slice(1);
    if(route==='practice') showPage('practice');
    else if(route) {showPage('visualizer'); selectCategory(route);}


})();
