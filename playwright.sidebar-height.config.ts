import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'sidebar-height.spec.ts', fullyParallel: true, workers: 2, timeout: 90_000,
  use: { ...base.use, baseURL: 'http://127.0.0.1:4193', reducedMotion: 'reduce' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4193', url: 'http://127.0.0.1:4193', reuseExistingServer: false },
  outputDir: 'review/sidebar-height/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/sidebar-height/test-results.json' }]],
});
