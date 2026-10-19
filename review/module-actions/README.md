# Module lesson entry and compact footer — 2026-10-19

Base: main `d01e838` after PR #24. Each module overview now has an explicit “عرض دروس الموديول” button below its objectives. It opens the existing lesson-list dialog at every viewport size. The desktop sidebar and mobile top opener remain available. Selecting a lesson closes the dialog and opens its objectives. Escape restores focus to the opener. The button has a 44px minimum height and appears only on the module overview.

The footer contains one session action: “تسجيل الدخول” for visitors or “تسجيل الخروج” for an active session. It omits the learner alias, demo label and tools link. The demo tools page itself remains available in demo builds, including its existing mobile navigation access; production still excludes it. Logout preserves saved CourseLab data and lesson guards remain enforced.

## Verification

- Typecheck, lint, 55 unit tests and demo build pass.
- `npm run test:module-actions`: all 9 browser tests pass. All four modules at eight viewport sizes (32 entry flows), complete objectives/lesson names, lesson navigation, dialog close/focus return, unchanged storage and footer contents are checked.
- No horizontal overflow at any tested size; module overviews remain within the viewport at 1920×910, 1536×728, 1366×768 and 768×1024. Natural scrolling remains available at smaller sizes. No new pagination or previous/next controls.
- Automated WCAG checks on the open dialog pass at 1366×768 and 390×844. Full login/logout is exercised through the footer, preserving course data. A logged-out visitor can see the list but receives the existing lesson guard. The demo tools URL remains available in the demo build.
- `overview-*.png`, `lessons-*.png` and `measurements-*.json` record the eight viewport checks. Chromium emulation, not physical devices.

Course content, eligibility, assessment rules, group assignments and storage schema are unchanged. Earlier review evidence is preserved.
- Production build, production browser smoke test (1 passing) and static demo-chunk exclusion pass. Rebuilt demo afterward. Both demo-tools URLs remain excluded in production. The known Vite >500kB bundle warning is non-fatal.
