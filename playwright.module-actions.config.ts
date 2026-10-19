import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'module-actions.spec.ts', fullyParallel: true, workers: 2, timeout: 90_000,
 use: { ...base.use, baseURL: 'http://127.0.0.1:4203', reducedMotion: 'reduce', trace: 'off' },
 webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4203', url: 'http://127.0.0.1:4203', reuseExistingServer: false },
 outputDir: 'review/responsive-module-actions/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/responsive-module-actions/test-results.json' }]],
});
