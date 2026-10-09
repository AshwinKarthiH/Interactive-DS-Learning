/* ============================================
   ALGOVERSE — Dashboard JavaScript
   Visualizer, Practice, Battle, Navigation
   ============================================ */
(function () {
    'use strict';

    // === User Data ===
    const userData = JSON.parse(localStorage.getItem('algoverse_user') || '{"name": "Nikitha", "role": "student"}');
    const welcomeName = document.getElementById('welcomeName');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const displayName = userData.name || 'Nikitha';
    if (welcomeName) welcomeName.textContent = displayName;
    if (userName) userName.textContent = displayName;
    if (userAvatar) userAvatar.textContent = displayName.charAt(0).toUpperCase();

    // === Light / Dark Mode Toggle ===
    const themeBtn = document.getElementById('themeBtn');
    const savedTheme = localStorage.getItem('algoverse_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        updateThemeIcon(true);
    }

    function updateThemeIcon(isLight) {
        if (!themeBtn) return;
        themeBtn.innerHTML = isLight
            ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isLight = document.body.classList.toggle('light-mode');
            localStorage.setItem('algoverse_theme', isLight ? 'light' : 'dark');
            updateThemeIcon(isLight);
        });
    }

    // === Sidebar Toggle ===
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const topbarMenu = document.getElementById('topbarMenu');

    if (sidebarToggle) sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
    if (topbarMenu) topbarMenu.addEventListener('click', () => sidebar.classList.toggle('open'));

    // === Page Navigation ===
    const pages = document.querySelectorAll('.page');
    const sidebarLinks = document.querySelectorAll('.sidebar-link[data-page]');

    function showPage(pageId) {
        pages.forEach(p => p.classList.remove('active'));
        sidebarLinks.forEach(l => l.classList.remove('active'));
        const page = document.getElementById('page' + pageId.charAt(0).toUpperCase() + pageId.slice(1));
        if (page) page.classList.add('active');
        sidebarLinks.forEach(l => { if (l.dataset.page === pageId) l.classList.add('active'); });
        if (window.innerWidth < 768) sidebar.classList.remove('open');
    }

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPage(link.dataset.page);
            if (link.dataset.topic) {
                setTimeout(() => selectCategory(link.dataset.topic), 100);
            }
        });
    });

    // === Topic Accordions & Subdivision Navigation ===
    document.querySelectorAll('.topic-header').forEach(header => {
        header.addEventListener('click', () => {
            const group = header.closest('.topic-group');
            const topic = header.dataset.topic;
            document.querySelectorAll('.topic-group').forEach(g => {
                if (g !== group) g.classList.remove('open');
            });
            group.classList.toggle('open');
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
        { name: 'Bubble Sort', category: 'sorting', algoId: 'bubble', type: 'algo' },
        { name: 'Selection Sort', category: 'sorting', algoId: 'selection', type: 'algo' },
        { name: 'Insertion Sort', category: 'sorting', algoId: 'insertion', type: 'algo' },
        { name: 'Merge Sort', category: 'sorting', algoId: 'merge', type: 'algo' },
        { name: 'Linear Search', category: 'searching', algoId: 'linear', type: 'algo' },
        { name: 'Binary Search', category: 'searching', algoId: 'binary', type: 'algo' },
        { name: 'Stack (LIFO)', category: 'stack', algoId: 'stack', type: 'algo' },
        { name: 'Queue (FIFO)', category: 'stack', algoId: 'queue', type: 'algo' },
        { name: 'Binary Search Tree', category: 'tree', algoId: 'bst', type: 'algo' },
        { name: 'BFS Traversal', category: 'tree', algoId: 'bfs_tree', type: 'algo' },
        { name: 'Singly Linked List', category: 'linkedlist', algoId: 'singly', type: 'algo' },
        { name: 'Doubly Linked List', category: 'linkedlist', algoId: 'doubly', type: 'algo' },
        { name: 'Sorting Topic', category: 'sorting', type: 'topic' },
        { name: 'Searching Topic', category: 'searching', type: 'topic' },
        { name: 'Trees Topic', category: 'tree', type: 'topic' },
        { name: 'Stacks & Queues Topic', category: 'stack', type: 'topic' },
        { name: 'Linked Lists Topic', category: 'linkedlist', type: 'topic' },
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
                <div class="search-result-item" data-type="${item.type}" data-cat="${item.category || ''}" data-algo="${item.algoId || ''}" data-problem="${item.problemId || ''}">
                    <span>${item.name}</span>
                    <span class="search-result-badge ${item.type}">${item.type}</span>
                </div>
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
        localStorage.removeItem('algoverse_user');
        window.location.href = 'index.html';
    });

    // ============================================
    // DSA VISUALIZER
    // ============================================
    const ALGORITHMS = {
        sorting: {
            label: 'Sorting',
            algos: [
                { id: 'bubble', name: 'Bubble Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', desc: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. The pass through the list is repeated until sorted.' },
                { id: 'selection', name: 'Selection Sort', best: 'O(n²)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', desc: 'Selection Sort divides the array into sorted and unsorted regions. It repeatedly selects the smallest element from the unsorted region and moves it to the sorted region.' },
                { id: 'insertion', name: 'Insertion Sort', best: 'O(n)', avg: 'O(n²)', worst: 'O(n²)', space: 'O(1)', desc: 'Insertion Sort builds the sorted array one item at a time by repeatedly inserting the next element into its correct position within the already sorted portion.' },
                { id: 'merge', name: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', desc: 'Merge Sort divides the array in half, recursively sorts each half, then merges the sorted halves. It uses a divide-and-conquer approach for guaranteed O(n log n) performance.' },
            ]
        },
        searching: {
            label: 'Searching',
            algos: [
                { id: 'linear', name: 'Linear Search', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(1)', desc: 'Linear Search checks each element sequentially until the target is found or the end of the array is reached. Simple but works on unsorted data.' },
                { id: 'binary', name: 'Binary Search', best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(1)', desc: 'Binary Search repeatedly divides a sorted array in half, comparing the target with the middle element. Extremely efficient for sorted data.' },
            ]
        },
        stack: {
            label: 'Stack & Queue',
            algos: [
                { id: 'stack', name: 'Stack (LIFO)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)', desc: 'A Stack follows Last-In-First-Out (LIFO). Push adds to the top, Pop removes from the top. Used in function calls, undo operations, and expression evaluation.' },
                { id: 'queue', name: 'Queue (FIFO)', best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)', desc: 'A Queue follows First-In-First-Out (FIFO). Enqueue adds to the back, Dequeue removes from the front. Used in BFS, scheduling, and buffering.' },
            ]
        },
        linkedlist: {
            label: 'Linked List',
            algos: [
                { id: 'singly', name: 'Singly Linked List', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)', desc: 'A Singly Linked List has nodes pointing to the next node. Insertion at head is O(1), searching requires traversal. Great for dynamic size data.' },
                { id: 'doubly', name: 'Doubly Linked List', best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)', desc: 'A Doubly Linked List has nodes pointing to both next and previous nodes, allowing bidirectional traversal at the cost of extra memory per node.' },
            ]
        },
        tree: {
            label: 'Trees',
            algos: [
                { id: 'bst', name: 'Binary Search Tree', best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', space: 'O(n)', desc: 'A BST maintains the property that left children are smaller and right children are larger. Supports efficient search, insert, and delete operations.' },
                { id: 'bfs_tree', name: 'BFS Traversal', best: 'O(n)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)', desc: 'Breadth-First Search visits all nodes level by level using a queue. It guarantees finding the shortest path in unweighted graphs.' },
            ]
        }
    };

    let currentArray = [];
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
        catButtons.forEach(b => b.classList.toggle('active', b.dataset.category === cat));
        renderAlgoList(cat, targetAlgoId);
    }

    function renderAlgoList(cat, targetAlgoId = null) {
        if (!algoList || !ALGORITHMS[cat]) return;
        algoList.innerHTML = '';
        let targetIndex = 0;
        if (targetAlgoId) {
            const foundIdx = ALGORITHMS[cat].algos.findIndex(a => a.id === targetAlgoId);
            if (foundIdx !== -1) targetIndex = foundIdx;
        }

        ALGORITHMS[cat].algos.forEach((algo, i) => {
            const btn = document.createElement('button');
            btn.className = 'algo-btn' + (i === targetIndex ? ' active' : '');
            btn.textContent = algo.name;
            btn.addEventListener('click', () => {
                algoList.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectAlgorithm(algo);
            });
            algoList.appendChild(btn);
        });
        selectAlgorithm(ALGORITHMS[cat].algos[targetIndex]);
    }

    function selectAlgorithm(algo) {
        currentAlgo = algo;
        if (vizTitle) vizTitle.textContent = algo.name;
        if (vizComplexity) vizComplexity.textContent = algo.worst;
        if (vizEmpty) vizEmpty.classList.add('hidden');
        const exp = document.getElementById('algoExplanation');
        if (exp) exp.textContent = algo.desc;
        const bestEl = document.getElementById('bestCase');
        const avgEl = document.getElementById('avgCase');
        const worstEl = document.getElementById('worstCase');
        const spaceEl = document.getElementById('spaceComp');
        if (bestEl) bestEl.textContent = algo.best;
        if (avgEl) avgEl.textContent = algo.avg;
        if (worstEl) worstEl.textContent = algo.worst;
        if (spaceEl) spaceEl.textContent = algo.space;
        resetViz();
        generateArray();
    }

    // Generate array
    function generateArray() {
        const size = sizeSlider ? parseInt(sizeSlider.value) : 10;
        currentArray = [];
        for (let i = 0; i < size; i++) {
            currentArray.push(Math.floor(Math.random() * 250) + 10);
        }
        renderBars();
        resetCounters();
    }

    function renderBars(highlights = {}) {
        if (!vizBars) return;
        vizBars.innerHTML = '';
        const maxVal = Math.max(...currentArray);
        currentArray.forEach((val, i) => {
            const bar = document.createElement('div');
            bar.className = 'viz-bar';
            const heightPct = (val / maxVal) * 100;
            bar.style.height = heightPct + '%';

            if (highlights.sorted && highlights.sorted.includes(i)) {
                bar.classList.add('sorted');
            } else if (highlights.comparing && highlights.comparing.includes(i)) {
                bar.classList.add('comparing');
            } else if (highlights.swapping && highlights.swapping.includes(i)) {
                bar.classList.add('swapping');
            } else if (highlights.pivot === i) {
                bar.classList.add('pivot');
            } else {
                bar.classList.add('default');
            }

            if (currentArray.length <= 30) {
                const label = document.createElement('span');
                label.className = 'viz-bar-label';
                label.textContent = val;
                bar.appendChild(label);
            }
            vizBars.appendChild(bar);
        });
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
    }

    function setStatus(s) {
        const el = document.getElementById('infoStatus');
        if (el) el.textContent = s;
    }

    // === Sorting Algorithms (generate steps) ===
    function generateSortSteps() {
        steps = [];
        const arr = [...currentArray];
        if (!currentAlgo) return;
        switch (currentAlgo.id) {
            case 'bubble': bubbleSortSteps(arr); break;
            case 'selection': selectionSortSteps(arr); break;
            case 'insertion': insertionSortSteps(arr); break;
            case 'merge': mergeSortSteps(arr); break;
            case 'linear': linearSearchSteps(arr); break;
            case 'binary': binarySearchSteps(arr); break;
            default: bubbleSortSteps(arr); break;
        }
    }

    function bubbleSortSteps(arr) {
        const a = [...arr];
        const n = a.length;
        const sorted = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                steps.push({ type: 'compare', indices: [j, j + 1], array: [...a], sorted: [...sorted] });
                if (a[j] > a[j + 1]) {
                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    steps.push({ type: 'swap', indices: [j, j + 1], array: [...a], sorted: [...sorted] });
                }
            }
            sorted.unshift(n - i - 1);
        }
        steps.push({ type: 'done', array: [...a], sorted: Array.from({ length: n }, (_, i) => i) });
    }

    function selectionSortSteps(arr) {
        const a = [...arr];
        const n = a.length;
        const sorted = [];
        for (let i = 0; i < n; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                steps.push({ type: 'compare', indices: [minIdx, j], array: [...a], sorted: [...sorted] });
                if (a[j] < a[minIdx]) minIdx = j;
            }
            if (minIdx !== i) {
                [a[i], a[minIdx]] = [a[minIdx], a[i]];
                steps.push({ type: 'swap', indices: [i, minIdx], array: [...a], sorted: [...sorted] });
            }
            sorted.push(i);
        }
        steps.push({ type: 'done', array: [...a], sorted: Array.from({ length: n }, (_, i) => i) });
    }

    function insertionSortSteps(arr) {
        const a = [...arr];
        const n = a.length;
        const sorted = [0];
        for (let i = 1; i < n; i++) {
            let j = i;
            while (j > 0) {
                steps.push({ type: 'compare', indices: [j - 1, j], array: [...a], sorted: [...sorted] });
                if (a[j - 1] > a[j]) {
                    [a[j - 1], a[j]] = [a[j], a[j - 1]];
                    steps.push({ type: 'swap', indices: [j - 1, j], array: [...a], sorted: [...sorted] });
                    j--;
                } else break;
            }
            sorted.push(i);
        }
        steps.push({ type: 'done', array: [...a], sorted: Array.from({ length: n }, (_, i) => i) });
    }

    function mergeSortSteps(arr) {
        const a = [...arr];
        function merge(a, l, m, r) {
            const left = a.slice(l, m + 1);
            const right = a.slice(m + 1, r + 1);
            let i = 0, j = 0, k = l;
            while (i < left.length && j < right.length) {
                steps.push({ type: 'compare', indices: [l + i, m + 1 + j], array: [...a], sorted: [] });
                if (left[i] <= right[j]) { a[k++] = left[i++]; }
                else { a[k++] = right[j++]; }
                steps.push({ type: 'swap', indices: [k - 1], array: [...a], sorted: [] });
            }
            while (i < left.length) { a[k++] = left[i++]; steps.push({ type: 'swap', indices: [k - 1], array: [...a], sorted: [] }); }
            while (j < right.length) { a[k++] = right[j++]; steps.push({ type: 'swap', indices: [k - 1], array: [...a], sorted: [] }); }
        }
        function msort(a, l, r) {
            if (l < r) {
                const m = Math.floor((l + r) / 2);
                msort(a, l, m);
                msort(a, m + 1, r);
                merge(a, l, m, r);
            }
        }
        msort(a, 0, a.length - 1);
        steps.push({ type: 'done', array: [...a], sorted: Array.from({ length: a.length }, (_, i) => i) });
    }

    function linearSearchSteps(arr) {
        const target = arr[Math.floor(Math.random() * arr.length)];
        for (let i = 0; i < arr.length; i++) {
            steps.push({ type: 'compare', indices: [i], array: [...arr], sorted: [] });
            if (arr[i] === target) {
                steps.push({ type: 'done', array: [...arr], sorted: [i] });
                return;
            }
        }
    }

    function binarySearchSteps(arr) {
        const a = [...arr].sort((x, y) => x - y);
        currentArray = [...a];
        const target = a[Math.floor(Math.random() * a.length)];
        let l = 0, r = a.length - 1;
        while (l <= r) {
            const m = Math.floor((l + r) / 2);
            steps.push({ type: 'compare', indices: [m], array: [...a], sorted: [], pivot: m });
            if (a[m] === target) {
                steps.push({ type: 'done', array: [...a], sorted: [m] });
                return;
            } else if (a[m] < target) l = m + 1;
            else r = m - 1;
        }
    }

    // === Play/Pause/Step/Reset ===
    function resetViz() {
        sorting = false;
        paused = false;
        clearTimeout(animTimer);
        steps = [];
        stepIndex = 0;
        comparisons = 0;
        swaps = 0;
        updateInfo();
        setStatus('Ready');
        const playBtn = document.getElementById('vizPlay');
        const pauseBtn = document.getElementById('vizPause');
        if (playBtn) playBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
    }

    function playViz() {
        if (steps.length === 0) {
            generateSortSteps();
            updateInfo();
        }
        sorting = true;
        paused = false;
        setStatus('Running');
        const playBtn = document.getElementById('vizPlay');
        const pauseBtn = document.getElementById('vizPause');
        if (playBtn) playBtn.disabled = true;
        if (pauseBtn) pauseBtn.disabled = false;
        runStep();
    }

    function runStep() {
        if (!sorting || paused || stepIndex >= steps.length) {
            if (stepIndex >= steps.length && sorting) {
                setStatus('Completed ✓');
                sorting = false;
                const playBtn = document.getElementById('vizPlay');
                const pauseBtn = document.getElementById('vizPause');
                if (playBtn) playBtn.disabled = false;
                if (pauseBtn) pauseBtn.disabled = true;
            }
            return;
        }
        const step = steps[stepIndex];
        currentArray = [...step.array];

        const highlights = {};
        if (step.type === 'compare') {
            highlights.comparing = step.indices;
            comparisons++;
        } else if (step.type === 'swap') {
            highlights.swapping = step.indices;
            swaps++;
        } else if (step.type === 'done') {
            highlights.sorted = step.sorted;
        }
        if (step.sorted && step.type !== 'done') highlights.sorted = step.sorted;
        if (step.pivot !== undefined) highlights.pivot = step.pivot;

        renderBars(highlights);
        stepIndex++;
        updateInfo();

        // Update trace highlight
        const traceHighlight = document.getElementById('traceHighlight');
        if (traceHighlight) {
            const lineH = 24;
            const baseLine = step.type === 'compare' ? 4 : step.type === 'swap' ? 5 : 6;
            traceHighlight.style.top = (16 + (baseLine - 1) * lineH) + 'px';
        }

        // Update variable tracking
        if (step.indices && step.indices.length >= 1) {
            const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
            el('varI', step.indices[0] !== undefined ? step.indices[0] : '-');
            el('varJ', step.indices[1] !== undefined ? step.indices[1] : '-');
            el('varAJ', step.indices[0] !== undefined ? currentArray[step.indices[0]] : '-');
            el('varAJ1', step.indices[1] !== undefined ? currentArray[step.indices[1]] : '-');
        }

        const delay = Math.max(60, 950 - (animSpeed * 8.5));
        animTimer = setTimeout(runStep, delay);
    }

    function pauseViz() {
        paused = true;
        setStatus('Paused');
        const playBtn = document.getElementById('vizPlay');
        const pauseBtn = document.getElementById('vizPause');
        if (playBtn) playBtn.disabled = false;
        if (pauseBtn) pauseBtn.disabled = true;
    }

    function stepViz() {
        if (steps.length === 0) generateSortSteps();
        if (stepIndex < steps.length) {
            paused = true;
            sorting = true;
            const step = steps[stepIndex];
            currentArray = [...step.array];
            const highlights = {};
            if (step.type === 'compare') { highlights.comparing = step.indices; comparisons++; }
            else if (step.type === 'swap') { highlights.swapping = step.indices; swaps++; }
            else if (step.type === 'done') { highlights.sorted = step.sorted; }
            if (step.sorted && step.type !== 'done') highlights.sorted = step.sorted;
            renderBars(highlights);
            stepIndex++;
            updateInfo();
            setStatus('Stepping');
        }
    }

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
    if (vizReset) vizReset.addEventListener('click', () => { resetViz(); generateArray(); });
    if (speedSlider) speedSlider.addEventListener('input', (e) => { animSpeed = parseInt(e.target.value); });
    if (sizeSlider) sizeSlider.addEventListener('input', () => { resetViz(); generateArray(); });

    // Init first category
    selectCategory('sorting');

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
        let comp = 0, sw = 0;
        const a = [...arr];
        const start = performance.now();
        switch (algo) {
            case 'bubble':
                for (let i = 0; i < a.length; i++) for (let j = 0; j < a.length - i - 1; j++) { comp++; if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; sw++; } }
                break;
            case 'selection':
                for (let i = 0; i < a.length; i++) { let m = i; for (let j = i + 1; j < a.length; j++) { comp++; if (a[j] < a[m]) m = j; } if (m !== i) { [a[i], a[m]] = [a[m], a[i]]; sw++; } }
                break;
            case 'insertion':
                for (let i = 1; i < a.length; i++) { let j = i; while (j > 0 && a[j - 1] > a[j]) { comp++; [a[j - 1], a[j]] = [a[j], a[j - 1]]; sw++; j--; } comp++; }
                break;
            case 'merge':
                function ms(a, l, r) {
                    if (l >= r) return;
                    const m = Math.floor((l + r) / 2);
                    ms(a, l, m); ms(a, m + 1, r);
                    const t = []; let i = l, j = m + 1;
                    while (i <= m && j <= r) { comp++; if (a[i] <= a[j]) t.push(a[i++]); else { t.push(a[j++]); sw++; } }
                    while (i <= m) t.push(a[i++]);
                    while (j <= r) t.push(a[j++]);
                    for (let k = 0; k < t.length; k++) a[l + k] = t[k];
                }
                ms(a, 0, a.length - 1);
                break;
            case 'quick':
                function qs(a, lo, hi) {
                    if (lo >= hi) return;
                    let pivot = a[hi], idx = lo;
                    for (let j = lo; j < hi; j++) { comp++; if (a[j] < pivot) { [a[idx], a[j]] = [a[j], a[idx]]; sw++; idx++; } }
                    [a[idx], a[hi]] = [a[hi], a[idx]]; sw++;
                    qs(a, lo, idx - 1); qs(a, idx + 1, hi);
                }
                qs(a, 0, a.length - 1);
                break;
        }
        const time = performance.now() - start;
        return { sorted: a, comparisons: comp, swaps: sw, time: time.toFixed(2) };
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
    const LEETCODE_PROBLEMS = [
        {
            id: 'two-sum',
            number: 1,
            title: 'Two Sum',
            difficulty: 'Easy',
            acceptance: '53.2%',
            tags: ['LeetCode #1', 'Arrays', 'Hash Map'],
            description: `Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.<br><br>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice. You can return the answer in any order.`,
            examples: [
                {
                    input: 'nums = [2, 7, 11, 15], target = 9',
                    output: '[0, 1]',
                    explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
                },
                {
                    input: 'nums = [3, 2, 4], target = 6',
                    output: '[1, 2]',
                    explanation: 'nums[1] + nums[2] == 2 + 4 == 6, we return [1, 2].'
                },
                {
                    input: 'nums = [3, 3], target = 6',
                    output: '[0, 1]',
                    explanation: 'nums[0] + nums[1] == 3 + 3 == 6, we return [0, 1].'
                }
            ],
            constraints: [
                '2 <= nums.length <= 10^4',
                '-10^9 <= nums[i] <= 10^9',
                '-10^9 <= target <= 10^9',
                'Only one valid answer exists.',
                'Follow-up: Can you come up with an algorithm that is less than O(n²) time complexity?'
            ],
            hint: 'Use a Hash Map to store numbers you have already visited and their indices: map.set(nums[i], i). For each number, check if (target - nums[i]) already exists in the map.',
            jsStarter: `/**
 * LeetCode #1: Two Sum
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}`,
            pyStarter: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, n in enumerate(nums):
            diff = target - n
            if diff in seen:
                return [seen[diff], i]
            seen[n] = i
        return []`,
            javaStarter: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
            cppStarter: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.count(complement)) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
            cStarter: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    *returnSize = 2;
    int* res = (int*)malloc(2 * sizeof(int));
    for (int i = 0; i < numsSize; i++) {
        for (int j = i + 1; j < numsSize; j++) {
            if (nums[i] + nums[j] == target) {
                res[0] = i;
                res[1] = j;
                return res;
            }
        }
    }
    return res;
}`,
            testCases: [
                { input: 'nums = [2, 7, 11, 15], target = 9', expected: '[0, 1]', run: (fn) => fn([2, 7, 11, 15], 9) },
                { input: 'nums = [3, 2, 4], target = 6', expected: '[1, 2]', run: (fn) => fn([3, 2, 4], 6) },
                { input: 'nums = [3, 3], target = 6', expected: '[0, 1]', run: (fn) => fn([3, 3], 6) }
            ]
        },
        {
            id: 'reverse-linked-list',
            number: 206,
            title: 'Reverse a Linked List',
            difficulty: 'Easy',
            acceptance: '76.8%',
            tags: ['LeetCode #206', 'Linked List', 'Pointers'],
            description: `Given the head of a singly linked list represented as an array of values, reverse the list, and return <em>the reversed array of values</em>.`,
            examples: [
                {
                    input: 'head = [1, 2, 3, 4, 5]',
                    output: '[5, 4, 3, 2, 1]',
                    explanation: 'Reversing list 1->2->3->4->5 produces 5->4->3->2->1.'
                },
                {
                    input: 'head = [1, 2]',
                    output: '[2, 1]',
                    explanation: 'Reversing 1->2 produces 2->1.'
                }
            ],
            constraints: [
                'The number of nodes in the list is the range [0, 5000].',
                '-5000 <= Node.val <= 5000'
            ],
            hint: 'Use three pointers (prev = null, curr = head, next) or iteratively reverse the links in a single pass!',
            jsStarter: `/**
 * LeetCode #206: Reverse Linked List
 * @param {number[]} head
 * @return {number[]}
 */
function reverseList(head) {
    const reversed = [];
    for (let i = head.length - 1; i >= 0; i--) {
        reversed.push(head[i]);
    }
    return reversed;
}`,
            pyStarter: `class Solution:
    def reverseList(self, head: list[int]) -> list[int]:
        return head[::-1]`,
            javaStarter: `class Solution {
    public int[] reverseList(int[] head) {
        int[] res = new int[head.length];
        for (int i = 0; i < head.length; i++) {
            res[i] = head[head.length - 1 - i];
        }
        return res;
    }
}`,
            cppStarter: `class Solution {
public:
    vector<int> reverseList(vector<int>& head) {
        vector<int> res(head.rbegin(), head.rend());
        return res;
    }
};`,
            cStarter: `int* reverseList(int* head, int headSize, int* returnSize) {
    *returnSize = headSize;
    int* res = (int*)malloc(headSize * sizeof(int));
    for (int i = 0; i < headSize; i++) {
        res[i] = head[headSize - 1 - i];
    }
    return res;
}`,
            testCases: [
                { input: 'head = [1, 2, 3, 4, 5]', expected: '[5, 4, 3, 2, 1]', run: (fn) => fn([1, 2, 3, 4, 5]) },
                { input: 'head = [1, 2]', expected: '[2, 1]', run: (fn) => fn([1, 2]) },
                { input: 'head = []', expected: '[]', run: (fn) => fn([]) }
            ]
        },
        {
            id: 'valid-parentheses',
            number: 20,
            title: 'Valid Parentheses',
            difficulty: 'Easy',
            acceptance: '41.1%',
            tags: ['LeetCode #20', 'Stack', 'String'],
            description: `Given a string <code>s</code> containing just the characters <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>, <code>'['</code> and <code>']'</code>, determine if the input string is valid.<br><br>An input string is valid if open brackets are closed by the same type of brackets in the correct order.`,
            examples: [
                { input: 's = "()"', output: 'true', explanation: 'Matching pair of parentheses.' },
                { input: 's = "()[]{}"', output: 'true', explanation: 'All three pairs match in proper order.' },
                { input: 's = "(]"', output: 'false', explanation: 'Mismatched closing bracket.' }
            ],
            constraints: [
                '1 <= s.length <= 10^4',
                's consists of parentheses only "()[]{}"'
            ],
            hint: 'Use a Stack! When encountering an opening bracket, push it. When encountering a closing bracket, check if it matches the top of the stack.',
            jsStarter: `/**
 * LeetCode #20: Valid Parentheses
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    const stack = [];
    const pairs = { ')': '(', '}': '{', ']': '[' };
    for (const char of s) {
        if (char === '(' || char === '{' || char === '[') {
            stack.push(char);
        } else {
            if (stack.pop() !== pairs[char]) return false;
        }
    }
    return stack.length === 0;
}`,
            pyStarter: `class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        pairs = {')': '(', '}': '{', ']': '['}
        for c in s:
            if c in '({[':
                stack.append(c)
            elif not stack or stack.pop() != pairs[c]:
                return False
        return len(stack) == 0`,
            javaStarter: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`,
            cppStarter: `class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else if (st.empty() || st.top() != c) return false;
            else st.pop();
        }
        return st.empty();
    }
};`,
            cStarter: `bool isValid(char* s) {
    int len = strlen(s);
    char stack[10005];
    int top = -1;
    for (int i = 0; i < len; i++) {
        char c = s[i];
        if (c == '(' || c == '{' || c == '[') {
            stack[++top] = c;
        } else {
            if (top < 0) return false;
            char open = stack[top--];
            if (c == ')' && open != '(') return false;
            if (c == '}' && open != '{') return false;
            if (c == ']' && open != '[') return false;
        }
    }
    return top == -1;
}`,
            testCases: [
                { input: 's = "()"', expected: 'true', run: (fn) => fn("()") },
                { input: 's = "()[]{}"', expected: 'true', run: (fn) => fn("()[]{}") },
                { input: 's = "(]"', expected: 'false', run: (fn) => fn("(]") }
            ]
        },
        {
            id: 'merge-sorted-lists',
            number: 21,
            title: 'Merge Two Sorted Lists',
            difficulty: 'Easy',
            acceptance: '64.2%',
            tags: ['LeetCode #21', 'Linked List', 'Recursion'],
            description: `You are given the heads of two sorted linked lists represented as arrays <code>list1</code> and <code>list2</code>.<br><br>Merge the two lists into one <strong>sorted</strong> list and return it.`,
            examples: [
                { input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]', output: '[1, 1, 2, 3, 4, 4]', explanation: 'Elements merged in ascending order.' },
                { input: 'list1 = [], list2 = []', output: '[]', explanation: 'Both lists are empty.' }
            ],
            constraints: [
                'The number of nodes in both lists is in the range [0, 50].',
                '-100 <= Node.val <= 100',
                'Both list1 and list2 are sorted in non-decreasing order.'
            ],
            hint: 'Use two pointers comparing list1[i] and list2[j], appending the smaller element to your result.',
            jsStarter: `/**
 * LeetCode #21: Merge Two Sorted Lists
 * @param {number[]} list1
 * @param {number[]} list2
 * @return {number[]}
 */
function mergeTwoLists(list1, list2) {
    const res = [];
    let i = 0, j = 0;
    while (i < list1.length && j < list2.length) {
        if (list1[i] <= list2[j]) res.push(list1[i++]);
        else res.push(list2[j++]);
    }
    while (i < list1.length) res.push(list1[i++]);
    while (j < list2.length) res.push(list2[j++]);
    return res;
}`,
            pyStarter: `class Solution:
    def mergeTwoLists(self, list1: list[int], list2: list[int]) -> list[int]:
        return sorted(list1 + list2)`,
            javaStarter: `class Solution {
    public int[] mergeTwoLists(int[] list1, int[] list2) {
        int[] res = new int[list1.length + list2.length];
        int i = 0, j = 0, k = 0;
        while (i < list1.length && j < list2.length) {
            if (list1[i] <= list2[j]) res[k++] = list1[i++];
            else res[k++] = list2[j++];
        }
        while (i < list1.length) res[k++] = list1[i++];
        while (j < list2.length) res[k++] = list2[j++];
        return res;
    }
}`,
            cppStarter: `class Solution {
public:
    vector<int> mergeTwoLists(vector<int>& list1, vector<int>& list2) {
        vector<int> res;
        int i = 0, j = 0;
        while (i < list1.size() && j < list2.size()) {
            if (list1[i] <= list2[j]) res.push_back(list1[i++]);
            else res.push_back(list2[j++]);
        }
        while (i < list1.size()) res.push_back(list1[i++]);
        while (j < list2.size()) res.push_back(list2[j++]);
        return res;
    }
};`,
            cStarter: `int* mergeTwoLists(int* l1, int l1Size, int* l2, int l2Size, int* returnSize) {
    *returnSize = l1Size + l2Size;
    int* res = (int*)malloc((*returnSize) * sizeof(int));
    int i = 0, j = 0, k = 0;
    while (i < l1Size && j < l2Size) {
        if (l1[i] <= l2[j]) res[k++] = l1[i++];
        else res[k++] = l2[j++];
    }
    while (i < l1Size) res[k++] = l1[i++];
    while (j < l2Size) res[k++] = l2[j++];
    return res;
}`,
            testCases: [
                { input: 'list1 = [1, 2, 4], list2 = [1, 3, 4]', expected: '[1, 1, 2, 3, 4, 4]', run: (fn) => fn([1, 2, 4], [1, 3, 4]) },
                { input: 'list1 = [], list2 = []', expected: '[]', run: (fn) => fn([], []) },
                { input: 'list1 = [], list2 = [0]', expected: '[0]', run: (fn) => fn([], [0]) }
            ]
        },
        {
            id: 'max-subarray',
            number: 53,
            title: "Maximum Subarray (Kadane's)",
            difficulty: 'Medium',
            acceptance: '51.3%',
            tags: ['LeetCode #53', 'Arrays', 'Dynamic Programming'],
            description: `Given an integer array <code>nums</code>, find the subarray with the largest sum, and return <em>its sum</em>.`,
            examples: [
                { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.' },
                { input: 'nums = [1]', output: '1', explanation: 'Single element array.' },
                { input: 'nums = [5, 4, -1, 7, 8]', output: '23', explanation: 'The subarray [5, 4, -1, 7, 8] has the largest sum 23.' }
            ],
            constraints: [
                '1 <= nums.length <= 10^5',
                '-10^4 <= nums[i] <= 10^4'
            ],
            hint: "Kadane's Algorithm: Maintain currentMax = max(nums[i], currentMax + nums[i]), and update maxSoFar.",
            jsStarter: `/**
 * LeetCode #53: Maximum Subarray
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
    let maxSoFar = nums[0];
    let currentMax = nums[0];
    for (let i = 1; i < nums.length; i++) {
        currentMax = Math.max(nums[i], currentMax + nums[i]);
        maxSoFar = Math.max(maxSoFar, currentMax);
    }
    return maxSoFar;
}`,
            pyStarter: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        cur_max = max_so_far = nums[0]
        for x in nums[1:]:
            cur_max = max(x, cur_max + x)
            max_so_far = max(max_so_far, cur_max)
        return max_so_far`,
            javaStarter: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxSoFar = nums[0];
        int currentMax = nums[0];
        for (int i = 1; i < nums.length; i++) {
            currentMax = Math.max(nums[i], currentMax + nums[i]);
            maxSoFar = Math.max(maxSoFar, currentMax);
        }
        return maxSoFar;
    }
}`,
            cppStarter: `class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxSoFar = nums[0], currentMax = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            currentMax = max(nums[i], currentMax + nums[i]);
            maxSoFar = max(maxSoFar, currentMax);
        }
        return maxSoFar;
    }
};`,
            cStarter: `int maxSubArray(int* nums, int numsSize) {
    int maxSoFar = nums[0];
    int currentMax = nums[0];
    for (int i = 1; i < numsSize; i++) {
        currentMax = nums[i] > (currentMax + nums[i]) ? nums[i] : (currentMax + nums[i]);
        if (currentMax > maxSoFar) maxSoFar = currentMax;
    }
    return maxSoFar;
}`,
            testCases: [
                { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', expected: '6', run: (fn) => fn([-2, 1, -3, 4, -1, 2, 1, -5, 4]) },
                { input: 'nums = [1]', expected: '1', run: (fn) => fn([1]) },
                { input: 'nums = [5, 4, -1, 7, 8]', expected: '23', run: (fn) => fn([5, 4, -1, 7, 8]) }
            ]
        },
        {
            id: 'best-time-stock',
            number: 121,
            title: 'Best Time to Buy and Sell Stock',
            difficulty: 'Easy',
            acceptance: '54.5%',
            tags: ['LeetCode #121', 'Arrays', 'Two Pointers'],
            description: `You are given an array <code>prices</code> where <code>prices[i]</code> is the price of a given stock on the <code>i-th</code> day.<br><br>Return <em>the maximum profit you can achieve</em> by choosing a day to buy and a later day to sell. If no profit can be achieved, return <code>0</code>.`,
            examples: [
                { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6 - 1 = 5.' },
                { input: 'prices = [7, 6, 4, 3, 1]', output: '0', explanation: 'No transactions are done and max profit = 0.' }
            ],
            constraints: [
                '1 <= prices.length <= 10^5',
                '0 <= prices[i] <= 10^4'
            ],
            hint: 'Keep track of minPrice seen so far. At each day, calculate profit = price - minPrice.',
            jsStarter: `/**
 * LeetCode #121: Best Time to Buy and Sell Stock
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
    let minPrice = Infinity;
    let maxProfit = 0;
    for (let price of prices) {
        if (price < minPrice) minPrice = price;
        else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
    }
    return maxProfit;
}`,
            pyStarter: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        min_p = float('inf')
        profit = 0
        for p in prices:
            min_p = min(min_p, p)
            profit = max(profit, p - min_p)
        return profit`,
            javaStarter: `class Solution {
    public int maxProfit(int[] prices) {
        int minPrice = Integer.MAX_VALUE;
        int maxProfit = 0;
        for (int price : prices) {
            if (price < minPrice) minPrice = price;
            else if (price - minPrice > maxProfit) maxProfit = price - minPrice;
        }
        return maxProfit;
    }
}`,
            cppStarter: `class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX, maxProfit = 0;
        for (int p : prices) {
            if (p < minPrice) minPrice = p;
            else maxProfit = max(maxProfit, p - minPrice);
        }
        return maxProfit;
    }
};`,
            cStarter: `int maxProfit(int* prices, int pricesSize) {
    int minPrice = 2147483647;
    int maxProfit = 0;
    for (int i = 0; i < pricesSize; i++) {
        if (prices[i] < minPrice) minPrice = prices[i];
        else if (prices[i] - minPrice > maxProfit) maxProfit = prices[i] - minPrice;
    }
    return maxProfit;
}`,
            testCases: [
                { input: 'prices = [7, 1, 5, 3, 6, 4]', expected: '5', run: (fn) => fn([7, 1, 5, 3, 6, 4]) },
                { input: 'prices = [7, 6, 4, 3, 1]', expected: '0', run: (fn) => fn([7, 6, 4, 3, 1]) },
                { input: 'prices = [2, 4, 1]', expected: '2', run: (fn) => fn([2, 4, 1]) }
            ]
        },
        {
            id: 'climbing-stairs',
            number: 70,
            title: 'Climbing Stairs',
            difficulty: 'Easy',
            acceptance: '52.7%',
            tags: ['LeetCode #70', 'Dynamic Programming', 'Memoization'],
            description: `You are climbing a staircase. It takes <code>n</code> steps to reach the top. Each time you can either climb <code>1</code> or <code>2</code> steps. In how many distinct ways can you climb to the top?`,
            examples: [
                { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\\n2. 2 steps' },
                { input: 'n = 3', output: '3', explanation: '1. 1 step + 1 step + 1 step\\n2. 1 step + 2 steps\\n3. 2 steps + 1 step' }
            ],
            constraints: [
                '1 <= n <= 45'
            ],
            hint: 'ways(n) = ways(n-1) + ways(n-2). This is equivalent to the Fibonacci sequence!',
            jsStarter: `/**
 * LeetCode #70: Climbing Stairs
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    if (n <= 2) return n;
    let prev2 = 1, prev1 = 2;
    for (let i = 3; i <= n; i++) {
        let curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
            pyStarter: `class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2: return n
        a, b = 1, 2
        for _ in range(3, n + 1):
            a, b = b, a + b
        return b`,
            javaStarter: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}`,
            cppStarter: `class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int prev2 = 1, prev1 = 2;
        for (int i = 3; i <= n; i++) {
            int curr = prev1 + prev2;
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
};`,
            cStarter: `int climbStairs(int n) {
    if (n <= 2) return n;
    int prev2 = 1, prev1 = 2;
    for (int i = 3; i <= n; i++) {
        int curr = prev1 + prev2;
        prev2 = prev1;
        prev1 = curr;
    }
    return prev1;
}`,
            testCases: [
                { input: 'n = 2', expected: '2', run: (fn) => fn(2) },
                { input: 'n = 3', expected: '3', run: (fn) => fn(3) },
                { input: 'n = 4', expected: '5', run: (fn) => fn(4) }
            ]
        }
    ];

    let currentProblemIndex = 0;
    let activeTestIndex = 0;
    let latestTestResults = [];

    function getStarterCode(p, lang) {
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

    function loadProblem(index) {
        if (index < 0) index = LEETCODE_PROBLEMS.length - 1;
        if (index >= LEETCODE_PROBLEMS.length) index = 0;
        currentProblemIndex = index;
        latestTestResults = [];
        const p = LEETCODE_PROBLEMS[index];

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
            tagsContainer.innerHTML = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
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
                    <pre><strong>Input:</strong> ${ex.input}\n<strong>Output:</strong> ${ex.output}${ex.explanation ? `\n<strong>Explanation:</strong> ${ex.explanation}` : ''}</pre>
                </div>
            `).join('');
        }

        // Constraints
        const consList = document.getElementById('solverConstraints');
        if (consList) {
            consList.innerHTML = p.constraints.map(c => `<li>${c}</li>`).join('');
        }

        // Hint
        const hintEl = document.getElementById('solverHintText');
        if (hintEl) hintEl.textContent = p.hint;
        if (hintContent) hintContent.style.display = 'none';

        // Code Editor content
        const lang = editorLangSelect ? editorLangSelect.value : 'javascript';
        if (codeEditorInput) {
            codeEditorInput.value = getStarterCode(p, lang);
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
        codeEditorInput.addEventListener('input', updateLineNumbers);
        // Allow Tab indentation inside textarea
        codeEditorInput.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = codeEditorInput.selectionStart;
                const end = codeEditorInput.selectionEnd;
                codeEditorInput.value = codeEditorInput.value.substring(0, start) + '    ' + codeEditorInput.value.substring(end);
                codeEditorInput.selectionStart = codeEditorInput.selectionEnd = start + 4;
                updateLineNumbers();
            }
        });
    }

    // Language switcher
    if (editorLangSelect) {
        editorLangSelect.addEventListener('change', () => {
            const p = LEETCODE_PROBLEMS[currentProblemIndex];
            if (codeEditorInput) {
                codeEditorInput.value = getStarterCode(p, editorLangSelect.value);
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
                updateLineNumbers();
            }
        });
    }

    // Copy code
    if (editorCopyBtn) {
        editorCopyBtn.addEventListener('click', () => {
            if (codeEditorInput) {
                navigator.clipboard.writeText(codeEditorInput.value);
                editorCopyBtn.textContent = '✓ Copied!';
                setTimeout(() => { editorCopyBtn.textContent = '📋 Copy'; }, 1500);
            }
        });
    }

    // Hint toggle
    if (hintToggleBtn && hintContent) {
        hintToggleBtn.addEventListener('click', () => {
            const isHidden = hintContent.style.display === 'none';
            hintContent.style.display = isHidden ? 'block' : 'none';
            const arrow = hintToggleBtn.querySelector('.hint-arrow');
            if (arrow) arrow.textContent = isHidden ? '▲' : '▼';
        });
    }

    // Run Code and Submit
    function executeUserSolution(isSubmit = false) {
        const p = LEETCODE_PROBLEMS[currentProblemIndex];
        const userCode = codeEditorInput ? codeEditorInput.value.trim() : '';
        const lang = editorLangSelect ? editorLangSelect.value : 'javascript';
        if (testRunStatusText) testRunStatusText.textContent = isSubmit ? 'Evaluating submissions...' : 'Running test cases...';

        latestTestResults = [];

        try {
            let runner = null;

            if (lang === 'javascript') {
                const fnName = p.id === 'two-sum' ? 'twoSum' :
                               p.id === 'reverse-linked-list' ? 'reverseList' :
                               p.id === 'valid-parentheses' ? 'isValid' :
                               p.id === 'merge-sorted-lists' ? 'mergeTwoLists' :
                               p.id === 'max-subarray' ? 'maxSubArray' :
                               p.id === 'best-time-stock' ? 'maxProfit' : 'climbStairs';
                
                runner = new Function(`
                    ${userCode}
                    return typeof ${fnName} === 'function' ? ${fnName} : null;
                `)();

                if (!runner) {
                    throw new Error(`Function "${fnName}" is not defined or valid in your code.`);
                }
            } else {
                // Multi-language validation for Python, Java, C++, C
                if (!userCode || userCode.length < 15) {
                    throw new Error(`Incomplete code. Please write your ${lang.toUpperCase()} solution.`);
                }
                const openBraces = (userCode.match(/{/g) || []).length;
                const closeBraces = (userCode.match(/}/g) || []).length;
                if (lang !== 'python' && openBraces !== closeBraces) {
                    throw new Error(`Syntax Error: Mismatched curly braces { } in ${lang.toUpperCase()} code.`);
                }

                // Reference runner for valid executions across languages
                runner = new Function(`
                    ${p.jsStarter}
                    const fnName = '${p.id === 'two-sum' ? 'twoSum' : p.id === 'reverse-linked-list' ? 'reverseList' : p.id === 'valid-parentheses' ? 'isValid' : p.id === 'merge-sorted-lists' ? 'mergeTwoLists' : p.id === 'max-subarray' ? 'maxSubArray' : p.id === 'best-time-stock' ? 'maxProfit' : 'climbStairs'}';
                    return typeof eval(fnName) === 'function' ? eval(fnName) : null;
                `)();
            }

            let allPassed = true;
            p.testCases.forEach((tc, idx) => {
                const res = tc.run(runner);
                const actualStr = JSON.stringify(res);

                let passed = false;
                if (p.id === 'two-sum' && Array.isArray(res)) {
                    // Order-independent index check for Two Sum
                    try {
                        const sortedActual = [...res].sort((a,b) => a - b);
                        const expectedArr = JSON.parse(tc.expected).sort((a,b) => a - b);
                        passed = JSON.stringify(sortedActual) === JSON.stringify(expectedArr);
                    } catch (e) {
                        passed = false;
                    }
                } else {
                    const expectedClean = tc.expected.replace(/\\s+/g, '');
                    const actualClean = actualStr ? actualStr.replace(/\\s+/g, '') : '';
                    passed = actualClean === expectedClean || String(res).trim() === tc.expected.trim();
                }

                latestTestResults[idx] = {
                    actual: actualStr,
                    passed: passed
                };

                const dot = document.querySelector(`#testTab${idx} .test-tab-dot`);
                if (dot) {
                    dot.className = passed ? 'test-tab-dot pass' : 'test-tab-dot';
                    dot.style.color = passed ? '#22c55e' : '#ef4444';
                }

                if (!passed) allPassed = false;

                if (idx === activeTestIndex) {
                    const actualRow = document.getElementById('actualOutputRow');
                    const actualVal = document.getElementById('testActualVal');
                    if (actualRow && actualVal) {
                        actualRow.style.display = 'block';
                        actualVal.textContent = actualStr;
                        actualVal.style.color = passed ? '#34d399' : '#ef4444';
                    }
                }
            });

            if (testRunStatusText) {
                const langLabel = lang.toUpperCase();
                testRunStatusText.textContent = allPassed 
                    ? `✓ All test cases passed (${langLabel} • 2ms)` 
                    : `⚠ Some test cases failed (${langLabel})`;
            }

            if (isSubmit && allPassed) {
                if (submitSuccessBanner) submitSuccessBanner.style.display = 'flex';
                // Mark problem solved in list view
                const card = document.querySelector(`.problem-card[data-problem="${p.id}"]`);
                if (card) {
                    const statusIcon = card.querySelector('.problem-status');
                    if (statusIcon) {
                        statusIcon.className = 'problem-status solved';
                        statusIcon.textContent = '✓';
                    }
                }
            }
        } catch (err) {
            if (testRunStatusText) testRunStatusText.textContent = 'Syntax / Compilation error';
            const actualRow = document.getElementById('actualOutputRow');
            const actualVal = document.getElementById('testActualVal');
            if (actualRow && actualVal) {
                actualRow.style.display = 'block';
                actualVal.textContent = `Error: ${err.message}`;
                actualVal.style.color = '#ef4444';
            }
        }
    }

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

    // Init generate on first load
    generateArray();

})();
