# Separated workspace panels — 2026-10-18

The former 3px blue divider is replaced by an 8–14px white gap. Sidebar and content are independently rounded white cards with visible 1px pale-blue borders. Both cards stretch to the available height; the sidebar header follows both top corners. The workspace's shared outer border is removed while the equal page gutters remain. Other page frames and the mobile navigation drawer keep their behavior. Reading text stays at 14px; no text clipping, hidden document overflow or new pagination.

The “أدوات النسخة السابقة” link is removed from the current demo-tools page. Existing archive files, routes and local data are preserved, and current scenario replacement still requires confirmation.

Verification: demo build/typecheck, lint and 55 unit tests. The focused `npm run test:separated-panels` suite (10 passing tests) covers 16 routes at eight viewports (128 visits), independent borders/corners and the inter-column gap, equal outer gutters, no horizontal overflow, unchanged browsing storage, no previous/next outside exams, expanded support, mobile lesson selection, and scenario confirmation/cancel. The sampled routes fit without document scrolling at 1920×910, 1536×728 and 1366×768. Natural vertical flow remains available on short phones, zoom and expanded/long content.

Evidence: `measurements-*.json`, `content-*.png` (the user's lesson-4 example), `phone-objectives.png`, `expanded-support.png`, `demo-tools.png`, and `test-results.json`. Existing review evidence is unchanged. Chromium viewport simulation, not physical devices. YouTube playback is stubbed; the existing non-fatal Vite chunk-size warning remains.

Ordinary production build and static artifact check pass: demo tool chunks are excluded (`production-check.json`). Demo was rebuilt afterward.
