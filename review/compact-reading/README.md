# Compact reading pages — 2026-10-18

The shared layout now spends less height on chrome, repeated labels, padding, media and stacked activity support. Reading text remains 14px, mobile input remains 16px, and touch lesson controls remain at least 44px. The sidebar still reaches the footer; selecting a lesson still opens its objectives. There is no fixed page height, document overflow hiding, text clipping, transform scaling, new pagination, or previous/next navigation outside examinations.

Changes include a 16:9 player bounded by viewport height, complete image previews with the existing zoom action moved into the card header, a compact support strip (fixed remains visible; flexible remains optional), activity instructions/answer/support arranged together on desktop, three supervisor columns, and tighter guide/goals/contact/instruction layouts. Full image captions remain in card headers and accessible figure labels, rather than being repeated below the artwork. Original content, questions, assets, storage and eligibility rules are unchanged.

## Evidence

Baseline: `ba18e44` after PR #18, 62 public and current course routes at four sizes. After: the same routes at ten sizes (620 visits). Content pages in this matrix open their default stage with a fixed-support g2 demo state; expanded support is tested separately and may need scrolling. All 73 content stages are checked against their source text on desktop and phone (146 stage checks), including loaded images and valid fullscreen video embeds.

| Viewport | Scrolling routes before | Scrolling routes after | Sum of extra document height before → after |
| --- | ---: | ---: | ---: |
| 1920×910 | 24/62 | 0/62 | 3485 → 0px |
| 1366×768 | 33/62 | 0/62 | 6484 → 0px |
| 1280×620 | 42/62 | 34/62 | 11749 → 1882px |
| 390×844 | 34/62 | 30/62 | 14674 → 6977px |

The 62 routes also fit without document scrolling at 1536×728, 1024×768, 768×1024, and 3840×2160. Short phones (320×568) and the effective 200% zoom viewport (960×455) retain natural vertical flow. No horizontal overflow in the matrix. These figures describe the listed routes/states, not every expanded panel or arbitrary viewport.

`comparison.json` summarizes the matrix; `before-measurements.json` and `after-measurements-*.json` record document geometry. `loaded-image-measurements.json` separately checks both default image pages after artwork decoding at all ten sizes. `before-content-*.png` / `after-content-*.png` show the user's example. `final-*.png`, `activity-phone.png`, `expanded-activity-desktop.png`, `exam-phone.png`, and `drawing-*.png` show other pages and states.

## Verification and limits

- `npm run build:demo`, `npm run typecheck`, `npm run lint`, `npm test`: pass (55 unit tests).
- `npm run test:compact-reading`: 13 browser tests passed in the main verification run; `LAYOUT_REVIEW_IMAGE_CHECK=1 npm run test:compact-reading -- --grep 'image pages are measured'` passed the additional decoded-image test (14 passing in total). The current suite includes all 14 tests.
- `npm run build` and the production artifact check passed: no demo tool chunks; the workspace bundle is present (`production-check.json`). Rebuilt demo afterward.
- Browser checks cover full text/media, unchanged storage during browsing, expanded support/footer separation, activity autosave/reload/submission, flexible support, mobile lesson selection, exam previous/next/submit with unanswered confirmation, a phone exam accessibility scan, and drawing dimensions at desktop/phone sizes.

Chromium viewport simulation, not physical devices. External YouTube playback is stubbed; the embed URL and fullscreen capability are verified. Long text and expanded guidance can require vertical scrolling. The existing >500kB Vite bundle warning remains non-fatal. Previous review evidence is preserved.
