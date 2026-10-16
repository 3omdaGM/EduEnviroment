import { defineConfig } from '@playwright/test';
import base from './playwright.module.config';
export default defineConfig({ ...base, testMatch: ['module-public-pages.spec.ts', 'module-exam-pages.spec.ts'],
  use: { ...base.use, baseURL: 'http://127.0.0.1:4181' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4181', url: 'http://127.0.0.1:4181', reuseExistingServer: false },
  outputDir: 'review/module-preview-submit/public-artifacts', reporter: [['list'], ['json', { outputFile: 'review/module-preview-submit/public-results.json' }]],
});
