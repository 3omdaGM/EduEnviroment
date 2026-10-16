import { defineConfig } from '@playwright/test';
import base from './playwright.compact.config';
export default defineConfig({ ...base, workers: 1, fullyParallel: false,
  testMatch: 'phase3-journey.spec.ts',
  outputDir: 'review/compact-pages/validation-artifacts',
  use: { ...base.use, baseURL: 'http://127.0.0.1:4177' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4177', url: 'http://127.0.0.1:4177', reuseExistingServer: false },
  reporter: [['list'], ['json', { outputFile: 'review/compact-pages/journey-results.json' }]],
});
