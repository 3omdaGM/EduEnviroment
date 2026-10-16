import { defineConfig } from '@playwright/test';
import base from './playwright.module.config';
export default defineConfig({ ...base, workers: 1, fullyParallel: false, testMatch: 'phase3-journey.spec.ts',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4180' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4180', url: 'http://127.0.0.1:4180', reuseExistingServer: false },
  outputDir: 'review/module-preview-submit/validation-artifacts', reporter: [['list'], ['json', { outputFile: 'review/module-preview-submit/journey-results.json' }]],
});
