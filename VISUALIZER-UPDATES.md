# Visualizer expansion

All topic families listed in the app now have working visualizers: 35 lessons in
nine categories. Six previously working sorting/searching animations were retained;
29 new visualizers were added. The catalog drives the sidebar, category buttons,
algorithm chooser, search results, and landing-page links/counts.

New lessons show actual stack/queue operations, linked pointers, balanced tree
insertion/rotations, graph traversals/shortest paths, DP tables, and hash collisions.
Each explains the idea, analogy, algorithm steps, practical use and cost in simpler
terms. Inputs are editable and validated; playback can be paused, stepped or reset.

Validation: 91 existing checks and 4,841 DSA checks passed. Both browser suites passed,
including completion of every visualizer, error states, saved practice data, reset,
mobile overflow, and no uncaught page errors. Visual review used desktop tree and
mobile graph layouts; narrow graph diagrams were adjusted to fit their panel.

The existing dashboard controls/styles were reused. The 21st UI build workflow was
consulted, but its CLI/catalog was unavailable: the CLI initialization could not
resolve registry.npmjs.org, and the offline search found no cached package. No new
UI framework or generated external component was installed.

See README.md for operation scopes, input limits and the remaining static-demo limits.
No changes have been pushed to GitHub.

## Reference layout update

The learning page now uses whiteboard / highlighted code / simple algorithm panels,
with the title and explanation above and a detailed step explanation below. Topic
selection shrinks the desktop sidebar; its arrow or topic icons reopen navigation.
Mobile selection closes the menu. Previous-step and timeline controls restore
matching snapshots, code highlights, narration and counters. JavaScript examples
cover all 35 lessons and can be switched to a plain-English instruction view.

5,403 Node checks passed, including 471 executable-code/highlight checks. Browser
checks verify sidebar behavior, code synchronization, timeline seeking, playback,
and mobile layout.
