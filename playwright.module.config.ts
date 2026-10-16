import { defineConfig } from '@playwright/test';
import base from './playwright.compact.config';
export default defineConfig({ ...base, testMatch: 'module-preview-submit.spec.ts', timeout: 180_000,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4178' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4178', url: 'http://127.0.0.1:4178', reuseExistingServer: false },
  outputDir: 'review/module-preview-submit/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/module-preview-submit/test-results.json' }]],
});
