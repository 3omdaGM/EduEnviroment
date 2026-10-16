import { defineConfig } from '@playwright/test';
import base from './playwright.module.config';
process.env.REVIEW_OUTPUT_DIR ??= 'review/module-preview-submit/regression';
export default defineConfig({ ...base, workers: 1, fullyParallel: false, testMatch: ['phase4-ui.spec.ts', 'phase4-extra-pages.spec.ts'],
  grep: /forms validate|real 20-item|five tools|mobile touch|write failure|automated WCAG|presentation:|additional pages/,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4179' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4179', url: 'http://127.0.0.1:4179', reuseExistingServer: false },
  outputDir: 'review/module-preview-submit/regression-artifacts', reporter: [['list'], ['json', { outputFile: 'review/module-preview-submit/regression-results.json' }]],
});
