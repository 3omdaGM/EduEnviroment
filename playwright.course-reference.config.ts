import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'course-reference.spec.ts', fullyParallel: true, workers: 2, timeout: 180_000,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4187', reducedMotion: 'reduce' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4187', url: 'http://127.0.0.1:4187', reuseExistingServer: false },
  outputDir: 'review/course-reference/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/course-reference/test-results.json' }]],
});
