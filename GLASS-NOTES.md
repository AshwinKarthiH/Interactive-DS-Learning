# Floating glass notes

Open **Notes** in the dashboard toolbar. Write over the question, code editor,
Practice Arena or any lesson. Close and reopen the sheet to keep your notes
during the current page session; reloading clears them.

The sheet background is `rgba(255,255,255,0.42)` with `backdrop-filter: blur(3px)`.
Only the background is translucent. The canvas has no background fill and pen
strokes use full opacity. The toolbar uses 88% white for readable controls.

Use Pen, Eraser, Color and Size to annotate. The eraser removes just the touched
area; it does not delete an entire stroke. Undo and redo include erasing and
Clear. New drawing clears the redo branch. Drag **Glass notes** to move the
sheet; drag the lower-right corner to resize it. Resizing retains original ink
coordinates, so shrinking temporarily clips notes and growing reveals them.
Mouse, stylus and touch use the same pointer controls. The sheet stays within
the viewport, and its controls wrap on phones. Focus the resize button and use
arrow keys for keyboard resizing. Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z undo and redo
when a sheet control is focused; Escape closes it.

Verification: `node test-notes.cjs` (requires Playwright and Chrome) checks
transparent pixels, opaque colored ink, partial erasure, undo/redo, clear,
dragging, resizing, reopening, viewport bounds and real browser touch input.
The existing studio and practice browser tests and all 7,500 algorithm/code
checks also pass.
