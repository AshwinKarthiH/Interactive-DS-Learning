# Five-language visualizers and dark theme

All 35 visualizers now offer JavaScript, Python, C, C++, and Java. Changing
languages preserves the current snapshot, timeline position, narration, and
counters, and highlights the corresponding operation in that language. Complete
source libraries, including supporting types/helpers, are downloadable from the
code panel. Plain-English mode remains available.

Day mode, its toggle, and its CSS/JavaScript handlers have been removed. Saved
legacy theme preferences are cleared; the application remains dark on reload.

Validation passed: all 175 language/lesson combinations, 525 synchronized
snapshots, mobile layout, stored light preferences, existing playback/sidebar
checks, practice grading/progress, and admin persistence. The 7,500 Node checks
passed. Source execution tests passed across all 35 lessons: 5,939 Python checks,
4,993 Java checks, and 5,105 compiled checks each for C and C++. C11/C++17 were
compiled with Clang into WebAssembly for the execution tests.

Visualizers display and animate the translated algorithms. Free-form practice
submission execution remains JavaScript-only; no native-language grading backend
has been added. Nothing was pushed to GitHub.
