import { defineConfig } from '@playwright/test';
import base from './playwright.support-study-production.config';
export default defineConfig({ ...base,
 outputDir: 'review/figures-guide/production-artifacts',
 reporter: [['list'], ['json', { outputFile: 'review/figures-guide/production-results.json' }]],
});
