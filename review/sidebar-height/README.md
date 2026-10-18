# Full-height lesson sidebar — 2026-10-18

The desktop lesson column now fills the actual space from the navbar bottom to the footer top. Flex sizing connects the existing app shell to the workspace grid; the sidebar stretches with the grid. No hardcoded header/footer subtraction, fixed page height, clipping, new pagination, data or route changes.

Validation: `npm run build:demo`, `npm run lint`, `npm test` (55 passing), and `npm run test:sidebar-height` (3 passing). The focused suite visits all four module overviews and first-lesson objectives at 1920×910, 1366×768, 1280×620, 1024×768, and 3840×2160 (40 route visits). Both sidebar endpoints match header/footer edges within 1px, with no horizontal overflow. `measurements.json` records the rectangles. It also checks long expanded support content, footer separation after scrolling, lesson selection, and the mobile drawer at 390×844.

Screenshots: `sidebar-*.png`, `long-content.png`, and `phone.png`. Machine results: `test-results.json`. Chromium viewport simulation, not physical device testing. External YouTube playback is stubbed. Natural vertical scrolling remains available when text needs it. The existing Vite chunk-size warning persists; the build succeeds.
