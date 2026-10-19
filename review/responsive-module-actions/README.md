# Show the module lesson button only with a collapsed sidebar — 2026-10-19

Base: main `7eb4253` after PR #25. The only application change is the bottom module-overview action's responsive visibility. Its default display is none; it becomes flex at max-width:900px, matching the existing sidebar-hiding breakpoint. Wide layouts use the visible sidebar. Narrow layouts retain both the top list opener and the explicit button below the objectives. Dialog navigation, content, footer, session handling and storage are unchanged.

`npm run lint`, typecheck and demo build pass. `npm run test:module-actions` passes all 11 browser tests. The four modules are exercised at ten sizes (40 flows), including 900px and 901px: the button and sidebar have complementary visibility; lesson selection works through the sidebar or dialog as appropriate. Narrow layouts retain dialog focus return and 44px button targets. Objectives, complete lesson names, footer contents, unchanged browsing storage, login/logout data preservation and the public lesson guard are verified. Automated WCAG checks pass at desktop and phone sizes. No horizontal overflow; primary desktop/tablet overview checks still fit the viewport.

`overview-*.png`, narrow `lessons-*.png`, measurements and the JSON test report record this review. Older artifacts under review/module-actions are preserved. Chromium viewport simulation, not physical devices. Natural scrolling remains available when needed.

Production build, production browser smoke test (1 passing) and static demo-chunk exclusion pass. Rebuilt demo afterward. The existing Vite >500kB bundle warning is non-fatal.
