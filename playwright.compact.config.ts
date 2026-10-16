import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'compact-pages.spec.ts', workers: 2, fullyParallel: true, use: { ...base.use, baseURL: 'http://127.0.0.1:4175', reducedMotion: 'reduce' }, timeout: 180_000, webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4175', url: 'http://127.0.0.1:4175', reuseExistingServer: false }, reporter: [['list'], ['json', { outputFile: 'review/compact-pages/test-results.json' }]], outputDir: 'review/compact-pages/test-artifacts' });
