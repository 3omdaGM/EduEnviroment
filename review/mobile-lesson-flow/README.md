# Mobile lesson flow and guide cleanup — 2026-10-19

Base: main `aa5bcd9` after PR #26. The guide's redundant “استعرض المحتوى” action is removed. Topic buttons, text, step URLs and progress remain.

When the lesson sidebar is hidden (max-width:900px), each lesson section has a named link below its content: objectives → content → activity → next lesson's objectives. The last lesson of a module starts the first lesson of the next module, with an explicit module label. The final activity links to the module catalog. These are optional shortcuts inside the existing CourseGuard. They do not submit an activity, mark completion, require a score, or replace the stage selector/drawer. Desktop sidebar navigation is unchanged. This implements the user's latest exception to the prior no-next/previous rule for narrow lesson layouts.

## Verification

- Lint, typecheck, 55 unit tests and demo build pass.
- `npm run test:mobile-flow`: all 6 browser tests pass. Complete 16-lesson journeys at 320px and 390px validate all 48 links per journey, module boundaries, final destination and unchanged browsing storage. The drawer is used only to select the first lesson.
- All 48 desktop lesson sections are checked for the visible sidebar and hidden shortcuts. Live resizing across 900/901px and tablet/desktop/phone/short viewports verifies complementary visibility, below-content placement, 44px targets and no horizontal overflow.
- Unsubmitted activity text is retained when following the next-lesson link and revisiting; only the expected draft and storage revision change. No activity is submitted. Logged-out lesson access still shows the guard and no shortcut. All nine guide topics retain their full text with the redundant action absent.
- Automated WCAG checks pass on the phone objectives view. Screenshots and `chain-*.json`/`resize.json` record the review. Previous review artifacts remain unchanged.

Chromium emulation, not physical devices. YouTube playback is stubbed. Natural vertical scrolling is retained for long lessons, small screens and enlarged text. Content, assessments, timing, scoring, groups, eligibility and storage schemas are unchanged. No backend or new research treatment.

Production build and its browser test pass (mobile objectives→content→activity, guide action absent, both demo-tools URLs excluded); the static demo-chunk exclusion check also passes. Rebuilt demo afterward. The known Vite >500kB warning remains non-fatal.
