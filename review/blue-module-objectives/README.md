# Cool blue canvas and module objectives

The home page and general page frame use a cool blue palette with darker, outlined researcher/supervisor cards. The navbar stays #145da0. Reading and sidebar cards remain white to distinguish content from the canvas.

Opening any module now displays its own general objectives rather than a second lesson index. The sidebar/drawer retains the lessons; choosing a lesson opens that lesson’s objectives and sections. Module objectives are 18 newly authored draft outcomes derived from the 16 existing lesson topics (6/4/4/4), stored separately in `src/course/module-overviews.json`. Their authorship, lesson IDs and hash are recorded in the course manifest. Existing lesson text, questions, source assets, access rules and stored progress are unchanged.

## Verification

- `npm run course:manifest`
- `npm run build:demo` (includes type checking)
- `npm run lint`
- `npm test`
- `npm run test:blue-objectives`
- Production build and static inspection for excluded demo-tools chunks; then restore demo build.

Browser coverage: 16 route entries at 1920×910, 1536×728, 1366×768, 1280×620, 768×1024, 390×844, 320×568 and 960×455 (128 visits). Assertions cover complete module objective text, no duplicate lesson cards, independent rounded panels/gap, equal outer gutters, no horizontal overflow, no previous/next outside exams and unchanged local storage. The three common desktop sizes assert no vertical scrolling for all sampled routes. Additional journeys check entry from the content index into every module, sidebar/drawer selection into lesson objectives, return to module objectives, public metadata, guarded lessons, and automated WCAG checks including text contrast on home and module overview.

Screenshots: `home-*.png`, `module-*-desktop.png`, `module-*-phone.png`, lesson content and mobile objectives. Measurements and test-results JSON retain the detailed evidence.

Limits: Chromium viewport simulation, not physical devices. External video is stubbed; real playback is not validated. Natural vertical scrolling is preserved for long text, small screens, expanded support and zoom. The known JS bundle-size warning is non-fatal. No automatic merge or deployment was performed.
