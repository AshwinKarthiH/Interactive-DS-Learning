# Initial remediation report

This report describes the first fix pass. The later visualizer expansion supersedes
its missing-visualizer status: all 35 named lessons across nine topic families are
now implemented. See VISUALIZER-UPDATES.md and README.md for current coverage.


Base: upstream commit 33fc3c3 (October 9, 2026).

| Priority | Issue | Resolution |
|---|---|---|
| Extreme | Submitted code executed in the host page | Opaque-origin iframe and disposable worker; network-blocking CSP; source/token verification; two-second execution timeout and separate startup deadline |
| High | Non-JavaScript submissions falsely passed | Reference-runner fallback removed; unsupported language choices disabled and direct unsupported execution rejected |
| High | Missing data structure visualizers ran bubble sort | Fallback removed; missing visualizers explicitly unavailable; unsupported topics cannot retain an unrelated animation |
| High | Fake login and freely selected admin role implied security | Password/signup/OAuth simulation removed; public browser-local demo profile flow; admin explicitly sample-only |
| Medium | Admin save/delete actions did not persist | Browser-local settings and deleted-item persistence; combined user search, role and status filters; missing creation/edit/security/report features disabled |
| Medium | Solved problems and code drafts lost on reload | Profile-scoped local progress and per-problem/per-language draft storage; storage failures reported |
| Medium | Bubble-sort best-case claim incorrect | Early exit on unchanged pass in animation and battle implementations |
| Medium | Fixed-line tracing implied source debugging | Replaced by accurate algorithm event details and index/value display for playback and single-step |
| Medium | Search always succeeded on a hidden random target | Explicit editable target; found index and not-found outcomes |
| Medium | Incomparable swap counters and noisy single-run timings | Consistent array-write metric, corrected comparison counts, warmup and median of 20 runs |
| Medium | Practice showed fabricated 2ms runtime | Actual worker execution timing; results clearly labeled sample tests |
| Low | Fragile JSON storage parsing and clipboard errors | Typed fallback storage reads, save-failure notification and clipboard failure feedback |
| Low | Focus/reduced-motion/mobile shortcomings | Visible focus, keyboard-accessible practice/search results, reduced-motion particles, constrained mobile search input |
| Low | Monolithic script, no documentation or tests | Algorithm, battle, problem, execution and storage modules; README; Node and browser regression suites |
| Low | Marketing claimed unavailable features/counts | Corrected feature descriptions and supported counts; planned topics identified; sample dashboard data identified |

Validation: 91 Node checks passed; JavaScript syntax checks passed; browser tests
cover correct/incorrect grading, syntax errors, infinite-loop termination, DOM and
storage isolation, persistence, unavailable controls, navigation and mobile layout.

The deliverable remains a static learning demo. Real protected accounts, shared
administration, multi-language compilation and missing visualizers are not
implemented; misleading success and incorrect fallbacks have been removed. No
GitHub push, deployment or external account changes were performed.
