import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'course-reference-production.spec.ts', timeout: 90_000,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4191', reducedMotion: 'reduce' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4191', url: 'http://127.0.0.1:4191', reuseExistingServer: false },
  outputDir: 'review/four-blue-modules/production-artifacts', reporter: [['list'], ['json', { outputFile: 'review/four-blue-modules/production-results.json' }]],
});
