import { defineConfig } from '@playwright/test';
import base from './playwright.open-learning.config';
export default defineConfig({ ...base, testMatch: 'open-learning-production.spec.ts',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4183' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4183', url: 'http://127.0.0.1:4183', reuseExistingServer: false },
  outputDir: 'review/open-learning/production-artifacts', reporter: [['list'], ['json', { outputFile: 'review/open-learning/production-results.json' }]],
});
