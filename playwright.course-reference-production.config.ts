import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'course-reference-production.spec.ts', timeout: 90_000,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4188', reducedMotion: 'reduce' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4188', url: 'http://127.0.0.1:4188', reuseExistingServer: false },
  outputDir: 'review/course-reference/production-artifacts', reporter: [['list'], ['json', { outputFile: 'review/course-reference/production-results.json' }]],
});
