import { defineConfig } from '@playwright/test';
import base from './playwright.support-study-production.config';
export default defineConfig({ ...base, outputDir: 'review/responsive-module-actions/production-artifacts',
 reporter: [['list'], ['json', { outputFile: 'review/responsive-module-actions/production-results.json' }]],
});
