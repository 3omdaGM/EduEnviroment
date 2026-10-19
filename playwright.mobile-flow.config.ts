import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'mobile-flow.spec.ts', fullyParallel: true, workers: 2, timeout: 150_000,
 use: { ...base.use, baseURL: 'http://127.0.0.1:4204', reducedMotion: 'reduce', trace: 'off' },
 webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4204', url: 'http://127.0.0.1:4204', reuseExistingServer: false },
 outputDir: 'review/mobile-lesson-flow/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/mobile-lesson-flow/test-results.json' }]],
});
