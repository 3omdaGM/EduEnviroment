# Balanced rounded content frame — 2026-10-18

The page body now has one shared outer inset on all four sides: `clamp(8px, 1vw, 16px)`. The rounded frame contains the lesson sidebar and panel together, separated from the navbar, footer and viewport edges by equal gaps. Radius is 18px on desktop and 14px on phones. The frame grows naturally with long content; no overflow hiding, fixed page height, text clipping or new pagination.

The existing transition wrapper receives a presentation class. The shared main explicitly resets the old container max-width so breakpoint-specific widths cannot leave a larger gap on one side. Course pages keep their existing internal padding; the sidebar fills the inner frame height and its outer top corner follows the frame curve. Home and goals remain centered inside their frame.

Verification: demo build/typecheck, lint, 55 unit tests, production build (demo tool chunks excluded), and the focused `npm run test:content-frame` browser suite (9 passing tests). The suite measures all four gaps on 16 route entries across eight viewports (128 visits): 1920×910, 1536×728, 1366×768, 1280×620, 768×1024, 390×844, 320×568 and effective zoom 960×455. It checks gap equality within 1px, rounded corners, no horizontal overflow, sidebar alignment to the inner frame, unchanged storage while browsing, and no previous/next outside exams. Expanded guidance and mobile lesson selection are checked separately.

Evidence: `measurements-*.json`, `module-*.png`, `expanded-support.png`, `phone-objectives.png`, and `test-results.json`. Previous review screenshots and reports remain unchanged. Old sidebar/compact audit assertions now use the frame boundary, matching the latest spacing request.

Chromium viewport simulation, not physical devices; external YouTube playback is stubbed. Long text, short phones and zoom retain natural vertical scrolling. Existing Vite chunk-size warning is non-fatal. No content, assets, assessment rules, routes, progress or storage format changes.
