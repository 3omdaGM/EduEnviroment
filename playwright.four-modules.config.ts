import { defineConfig } from '@playwright/test';
import base from './playwright.config';
process.env.COURSE_REVIEW_DIR = 'review/four-blue-modules';
export default defineConfig({ ...base, testMatch: ['course-reference.spec.ts', 'four-blue-modules.spec.ts'], fullyParallel: true, workers: 2, timeout: 180_000,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4190', reducedMotion: 'reduce' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4190', url: 'http://127.0.0.1:4190', reuseExistingServer: false },
  outputDir: 'review/four-blue-modules/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/four-blue-modules/test-results.json' }]],
});
