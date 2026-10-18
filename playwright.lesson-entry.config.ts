import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'lesson-entry.spec.ts', fullyParallel: true, workers: 2, timeout: 90_000,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4192', reducedMotion: 'reduce' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4192', url: 'http://127.0.0.1:4192', reuseExistingServer: false },
  outputDir: 'review/lesson-entry/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/lesson-entry/test-results.json' }]],
});
