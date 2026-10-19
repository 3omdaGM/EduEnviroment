import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'figures-guide.spec.ts', fullyParallel: true, workers: 2, timeout: 180_000,
 use: { ...base.use, baseURL: 'http://127.0.0.1:4201', reducedMotion: 'reduce', trace: 'off' },
 webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4201', url: 'http://127.0.0.1:4201', reuseExistingServer: false },
 outputDir: 'review/figures-guide/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/figures-guide/test-results.json' }]],
});
