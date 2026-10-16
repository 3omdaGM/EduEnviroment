import { defineConfig } from '@playwright/test';
import base from './playwright.compact.config';
process.env.REVIEW_OUTPUT_DIR ??= 'review/compact-pages/regression';
export default defineConfig({ ...base, outputDir: 'review/compact-pages/regression-artifacts', use: { ...base.use, baseURL: 'http://127.0.0.1:4176' }, webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4176', url: 'http://127.0.0.1:4176', reuseExistingServer: false }, testMatch: ['phase4-ui.spec.ts', 'phase4-extra-pages.spec.ts'], workers: 1, grep: /forms validate|real 20-item|five tools|mobile touch|write failure|automated WCAG|presentation:|additional pages/, reporter: [['list'], ['json', { outputFile: 'review/compact-pages/regression-results.json' }]] });
