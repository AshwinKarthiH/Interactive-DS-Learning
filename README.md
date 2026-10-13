# Run the MongoDB-backed app

The app now includes Java Spring Boot + MongoDB. See [BACKEND.md](BACKEND.md) for setup and APIs.

```powershell
powershell -ExecutionPolicy Bypass -File .\backend\run.ps1 -LocalMongo -SetupAdmin
```

Open http://localhost:8080. The instructions below describe standalone file-based demo mode.

# AlgoVerse — Interactive DSA Learning

A static, browser-local learning app with **35 working visualizers**, simple
explanations, and seven JavaScript practice exercises.

## Run

Extract the download. Open a terminal in the folder containing `index.html`, run
`python -m http.server 8000`, and open `http://localhost:8000` in Chrome or Edge.
No build or package installation is needed to use the app. Keep the terminal open.

Choose **Demo Student**, then **DSA Visualizer**. Select a topic and algorithm.
Selecting a topic automatically shrinks the sidebar on desktop and closes it on mobile. Use the sidebar arrow to expand it again.

The lesson uses three panels: **Live whiteboard**, **Code**, and **Algorithm, made simple**. The selected algorithm title and short explanation appear above them.

Use **Step** to learn one move at a time or **Play** for automatic playback.
**Pause** stops playback. **Previous step** moves backward. Drag the timeline to inspect any snapshot; the diagram, highlighted code, narration, inspector and counters move together. **Reset** restarts the same example. **Generate** makes
new numbers or restores the graph/text example. Speed controls the delay.

## What you can visualize

| Topic | Working visualizers |
|---|---|
| Sorting (6) | Bubble, selection, insertion, merge, quick, radix |
| Searching (2) | Linear, binary |
| Arrays & strings (4) | Traversal, sliding-window sum, two-pointer pair sum, string reversal |
| Stacks & queues (4) | Stack push/pop, queue enqueue/dequeue, deque at both ends, heap priority queue |
| Linked lists (3) | Singly, doubly, circular construction and traversal |
| Trees (6) | BST insert/search, breadth-first traversal, depth-first traversal, AVL insertion, red-black insertion, min-heap construction |
| Graphs (4) | BFS, DFS, Dijkstra shortest paths, topological sort with cycle detection |
| Dynamic programming (3) | Fibonacci tabulation, Fibonacci memoization, 0/1 knapsack |
| Hashing (3) | Map with chaining, map with linear probing, hash set |

Every lesson offers **JavaScript, Python, C, C++, and Java** in the programming-language selector. The animation, current step, narration and counters stay in place while the code and highlight change. Choose **Plain English** for numbered instructions. Use **Complete source** to download the selected language’s full library, including supporting types and helpers.

The visualizer uses a shared algorithm model with language-specific examples; it does not compile arbitrary code in the browser. Native C/C++ examples use explicit arrays and app-bounded input sizes. The interface is dark only; light mode and its toggle have been removed, and old theme preferences are cleared. Code highlights identify the operation represented by a snapshot; a helper call may include several internal operations.

Each lesson has a simple explanation, everyday analogy, three numbered algorithm
steps, a practical use, complexity information in everyday language, and narration
of the current move. The active instruction is highlighted during playback.

Diagrams match the structure: bars/cells for arrays, next/previous links for lists,
node-and-edge diagrams for trees and graphs, tables for DP, and buckets for hashing.
Large diagrams and tables scroll within their panel on a narrow screen.

## Change the example

- Values: enter up to 25 comma-separated whole numbers between -1000 and 1000. Empty
  input demonstrates an empty structure. Radix uses non-negative integers;
  hashing uses integer keys. Hash maps store a frequency count for each key.
- Search/pair target: enter the whole number to find or the desired pair sum.
- Window size: enter k between 1 and the number of values.
- Text: up to 25 Unicode code points. Combined emoji/accents may use several.
- Graphs: use edges such as `0-1:4, 1-2:3, 0-2:10`. Add a standalone node such as
  `3` to include an isolated node. Up to 12 nodes and 40 non-negative-weight edges.
  Choose a start node for BFS/DFS/Dijkstra. Topological sort treats edges as directed;
  other graph lessons treat them as undirected.
- Fibonacci: choose n from 0 to 20.
- Knapsack: choose capacity from 0 to 20. Values come from the input; weights repeat
  1, 2, 3, 4, 5 by input position. Each item can be taken at most once.

Press **Apply example**, **Step**, or **Play** after editing. Invalid examples show
an error instead of running a different algorithm.

## Learning metrics

Complexity describes the named operation and excludes snapshot generation/drawing.
Lesson notes explain when costs apply per operation or exclude input sorting.
An array swap counts as two array writes; a merge assignment counts as one. Other
structures count visualized state changes such as insertion or saving a table answer.
The battle compares five sorts using consistent array writes and the median of
20 runs after warmup. Timing includes array copying and instrumentation; small
inputs are not a reliable benchmark of asymptotic complexity.

## Practice and demo limits

JavaScript solutions run against visible sample tests in an isolated worker. Other
execution languages remain disabled. Solved state and drafts stay in this browser.
Sample tests are not proof of correctness, and starter code includes example solutions.
Linked-list practice problems use arrays as explicitly stated in their descriptions.

This is a public learning demo, not a multi-user service. There is no password,
OAuth, backend, database, or protected admin role. Overview statistics, badges,
recommendations, and admin analytics are sample data. Admin deletions and settings
persist only in this browser; creation/edit/security operations remain unavailable.
This app covers the 35 named lessons above, not every possible DSA algorithm or
all operations on each data structure. Balanced-tree lessons demonstrate insertion.

## Execution isolation

The runner creates an opaque-origin iframe with `sandbox="allow-scripts"` and a
disposable worker. The worker has no page DOM or local storage. An inherited CSP
blocks network connections. The host checks message source and a random token and
compares actual outputs with expected values. Execution is stopped after two seconds;
a separate ten-second deadline handles sandbox startup. This is a local practice
sandbox, not a hardened server-side judge for hostile submissions.

## Code organization

- `lessons.js`: single catalog for names, beginner explanations, steps and costs.
- `lesson-navigation.js`: catalog-derived navigation and landing-page coverage.
- `lesson-code.js`: JavaScript examples and operation-to-code highlights.
- `multilingual-code.js`: language-specific examples for all 35 lessons.
- `examples/`: complete JavaScript, Python, C, C++, and Java source libraries.
- `scripts/build-language-views.py`: regenerate the four translated views/libraries.
- `learning-studio.css`: reference-inspired three-panel layout and shrinking sidebar.
- `dsa-core.js`: DSA state transitions and input validation.
- `dsa-view.js`, `dsa.css`: structure-specific diagrams and responsive lesson UI.
- `algorithm-core.js`: original sorting/searching step generators.
- `battle-core.js`: instrumented sorting and timing.
- `problems.js`, `runner.js`: practice content and isolated execution.
- `storage.js`: safe storage fallback and save-failure notices.
- `dashboard.js`, `app.js`, `admin.js`: page interactions.

## Tests

Run `npm test` (or `node test.cjs`, `node test-dsa.cjs`, `node test-code.cjs`, and `node test-multilingual.cjs`). Current checks cover
sorting, AVL and red-black invariants across insertion orders, heap order, graph
traversal/distances/cycles, DP answers, hashing, duplicates, and empty/invalid inputs.

For browser tests, install Playwright with `npm install --no-save playwright`, use
an installed Chrome browser, then run `npm run test:browser` and
`npm run test:visualizers`. The latter plays every one of the 35 lessons through
the real UI and checks explanations, reset, validation, counters, and mobile overflow.
Run `npm run test:studio` to verify sidebar collapse/reopen, code highlights, backward steps, timeline seeking, and responsive layout. Run `npm run test:languages` to check all 175 language/lesson combinations, 525 synchronized snapshots, and removal of stored light-mode settings. All browser suites use a fresh browser context and write screenshots to the OS temp folder.

No license was supplied upstream; this update does not invent one. Real shared
accounts/administration and a multi-language judge require a backend deployment.

### Source execution tests

`npm run test:python` executes every Python lesson. With a JDK, compile
`examples/Algorithms.java` and `tests/AlgorithmsTest.java` together, then run
`AlgorithmsTest`. With GCC/Clang, compile and run `tests/test-native.c` for C;
with a C++ compiler, compile the same test as C++17 with `TEST_CPP` defined.
These test drivers cover all 35 lesson functions. C/C++ source-library inputs
follow the size bounds stated in the file header; returned allocated trees and
linked/hash structures are owned by the caller.

Validation in this update: 7,500 Node checks, 5,939 Python checks, 4,993 Java checks,
and 5,105 compiled checks for each of C and C++. C11/C++17 examples were compiled
with Clang to WebAssembly and executed with memory/standard-library test bindings.
The app does not require a compiler to display or play the language views.
