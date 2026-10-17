import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'open-learning.spec.ts', fullyParallel: true, workers: 2, timeout: 180_000,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4182', reducedMotion: 'reduce' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4182', url: 'http://127.0.0.1:4182', reuseExistingServer: false },
  outputDir: 'review/open-learning/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/open-learning/test-results.json' }]],
});
