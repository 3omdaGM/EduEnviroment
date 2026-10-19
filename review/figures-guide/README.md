# Embedded figures and named guide topics — 2026-10-19

Base: main `30f676d` after PR #23. Only presentation and guide navigation labels change. Course content, figure definitions, bitmap dimensions, normalized pointer coordinates, scoring, classification, timers, eligibility, groups and storage versions remain unchanged. Manifest generation produces no diff.

The figure space is calculated from actual surrounding text, controls, header/footer and insets via ResizeObserver. The canvas keeps its aspect ratio and a practical display floor; text and page height remain unconstrained. Simple and complex figures sit together on phones. Confirm/clear and feedback/next controls remain in document flow. Resizing does not remount the question or discard an unconfirmed drawing. Guide buttons show all nine topic titles from the existing data, with current-topic indication and unchanged `?step=` URLs. The hint now describes choosing a topic. Three topic columns on desktop, two on phones; phone targets remain at least 44px. Shared frame padding is 10px instead of 12px, with unchanged outer margins and separated workspace panels.

## Evidence and limits

- `style-*.png` and `feedback-*.png`: drawing/feedback states with controls. `long-list-1536.png`: the complete question-type list in two columns. `guide-*.png`: named topics and the pre-assessment guidance.
- `measurements-*.json`: eight viewports, active drawing/feedback/next/instructions, every guide topic and a public/module/course sample. These record document dimensions, canvas aspect ratios and natural overflow rules.
- `all-lesson-sections.json`: all 16 lessons × objectives/content/activity × eight sizes, including decoded local images. The default content stage is measured, not every expanded hint or stage.
- Mouse draw/clear/confirm checks at eight sizes, retained answers/deadline after reload, resize during an unconfirmed drawing, and a CDP touch stroke followed by touchscreen button taps. Chromium needs a 350ms gap between the synthesized drawing gesture and its next tap; this is test input timing, not an application delay.
- WCAG automated checks for the drawing and guide on desktop and phone. Enlarged text remains reachable with natural scrolling. Storage is unchanged by guide/course browsing.

Chromium emulation, not physical devices. YouTube playback is stubbed. Short screens, enlarged text and expanded content can still require natural vertical scrolling; no page clipping, overflow hiding, text deletion, forced scaling or previous/next outside assessments is introduced. Previous review artifacts are preserved. The known Vite >500kB bundle warning is non-fatal.

Long numbered reading lists (at least five items) use two columns at widths ≥1200px; following paragraphs span both columns. Original reading order and full text are retained.

Complete infographic previews in the desktop media column are limited to clamp(150px,23dvh,250px); their existing zoom control and original images remain available. Phone image limits are unchanged.

## Final verification

- Manifest generation unchanged; typecheck, lint and 55 unit tests pass.
- Demo build and `npm run test:figures-guide`: all 11 browser tests pass.
- 224 sample/state/topic checks plus 384 lesson-section visits across eight viewports (608 measured cases). No horizontal overflow.
- All 48 lesson sections fit at 1920×910, 1536×728, 1366×768 and 768×1024. The drawing, feedback, next-question and instructions states, and every guide topic, also fit at 1280×620. Drawing/guide states fit the 390×844 phone; long lesson content still flows naturally on phones. The 320×568 and 960×455 cases preserve readable vertical flow. Counts and limits are recorded in `summary.json`.
- `infographic-check.json` and `infographic-*-1536.png` verify both previously overflowing infographic pages. `long-list-1536.png` verifies the complete numbered list.
- Production build, its browser smoke test (1 passing) and static demo-chunk exclusion check pass. Rebuilt demo afterward. Both demo-tool URLs are absent in production. See `production-results.json` and `production-check.json`.
