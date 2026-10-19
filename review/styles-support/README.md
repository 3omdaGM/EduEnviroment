# Learning styles and support study

The user explicitly corrected the requested direction to learning styles with support before any gamification conversion was implemented. The existing CourseLab pathway, four modules, embedded-figures classifier, group allocation and support behavior remain active. This change aligns the shared title, homepage thesis title, document metadata, guide, navigation descriptions and demo-tools name with that study.

`src/course/study.json` is the shared identity/explanation data and is recorded with its hash in the reference manifest. Content status and eligibility rules remain as previously implemented. The hub and sidebar now show the group, field-dependence classification and support mode together. Read-only explanations of all four groups are available in the path information dialog and the style-test instructions. They do not let learners choose a group manually.

Archived gamification rewards are retained and their notification is confined to archived `/modules/` pages. No storage keys, schemas, assessments, scoring thresholds, deadline algorithms, group assignment rules, CourseLab content, or source assets were changed. No points or challenge modes were added.

## Verification

- `npm run course:manifest`
- `npm run build:demo` (includes type checking)
- `npm run lint`
- `npm test`
- `npm run test:support-study`
- `npm run build`
- `npm run test:support-study:production`
- Static production chunk check, followed by restoring `npm run build:demo`.

Demo browser cases cover 16 route entries across 8 viewports (128 visits): 1920×910, 1536×728, 1366×768, 1280×620, 768×1024, 390×844, 320×568 and 960×455. The common three desktop sizes assert no vertical scrolling on sampled routes; all sizes assert no horizontal overflow, complete title, equal outer gutters and separate rounded workspace panels. Natural scrolling remains available on short screens and expanded dialogs.

Additional cases cover title/metadata consistency, guide text, archived progress preservation, suppression of an actual archived reward notification at login, read-only group explanations and focus return, all four assignments on desktop and phone with fixed/flexible support, and the full empty-pre → style instructions → 25 real canvas drawings → g1 assignment → reload journey. Automated WCAG checks run on the information dialog and style instructions. Production checks ensure both demo-tools routes are excluded.

Screenshots and measurement JSON are retained here; transient traces/artifacts are ignored. Chromium viewport simulation is not a physical-device test. External videos are stubbed, and external playback was not tested. Classification/marking remains the reference approximation and needs researcher validation. Allocation and persistence remain local to the device. The known bundle-size warning is non-fatal. No automatic merge or deployment was performed.
