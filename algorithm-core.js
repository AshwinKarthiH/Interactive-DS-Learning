globalThis.AlgoCore = {
 generateSteps(id, input, searchTarget) {
 const steps = [];
    function bubbleSortSteps(arr) {
        const a = [...arr];
        const n = a.length;
        const sorted = [];
        for (let i = 0; i < n; i++) {
            let changed = false;
            for (let j = 0; j < n - i - 1; j++) {
                steps.push({ type: 'compare', indices: [j, j + 1], array: [...a], sorted: [...sorted] });
                if (a[j] > a[j + 1]) {
                    [a[j], a[j + 1]] = [a[j + 1], a[j]];
                    changed = true;
                    steps.push({ type: 'swap', indices: [j, j + 1], array: [...a], sorted: [...sorted] });
                }
            }
            sorted.unshift(n - i - 1);
            if (!changed) break;
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
                steps.push({ type: 'compare', indices: [l + i, m + 1 + j], compareValues:[left[i],right[j]], state:{left:[...left],right:[...right],leftIndex:i,rightIndex:j}, array: [...a], sorted: [] });
                if (left[i] <= right[j]) { a[k++] = left[i++]; }
                else { a[k++] = right[j++]; }
                steps.push({ type: 'write', indices: [k - 1], array: [...a], sorted: [] });
            }
            while (i < left.length) { a[k++] = left[i++]; steps.push({ type: 'write', codeKey:'writeLeft', indices: [k - 1], array: [...a], sorted: [] }); }
            while (j < right.length) { a[k++] = right[j++]; steps.push({ type: 'write', codeKey:'writeRight', indices: [k - 1], array: [...a], sorted: [] }); }
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
        const target = searchTarget;
        for (let i = 0; i < arr.length; i++) {
            steps.push({ type: 'compare', indices: [i], array: [...arr], sorted: [] });
            if (arr[i] === target) {
                steps.push({ type: 'done', array: [...arr], sorted: [i], message: `Found ${target} at index ${i}` });
                return;
            }
        }
        steps.push({type: 'done', array: [...arr], sorted: [], message: `Target ${target} not found`});
    }

    function binarySearchSteps(arr) {
        const a = [...arr].sort((x, y) => x - y);

        const target = searchTarget;
        let l = 0, r = a.length - 1;
        while (l <= r) {
            const m = Math.floor((l + r) / 2);
            steps.push({ type: 'compare', indices: [m], array: [...a], sorted: [], pivot: m });
            if (a[m] === target) {
                steps.push({ type: 'done', array: [...a], sorted: [m], message: `Found ${target} at index ${m}` });
                return;
            } else if (a[m] < target) l = m + 1;
            else r = m - 1;
        }
        steps.push({type: 'done', array: [...a], sorted: [], message: `Target ${target} not found`});
    }

 const generators = {bubble:bubbleSortSteps, selection:selectionSortSteps, insertion:insertionSortSteps, merge:mergeSortSteps, linear:linearSearchSteps, binary:binarySearchSteps};
 if (!generators[id]) throw new Error('This visualization is not implemented.');
 generators[id](input);
 return steps;
 }
};
