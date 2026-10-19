import { defineConfig } from '@playwright/test';
import base from './playwright.support-study-production.config';
export default defineConfig({ ...base, testMatch: 'mobile-flow-production.spec.ts', outputDir: 'review/mobile-lesson-flow/production-artifacts',
 reporter: [['list'], ['json', { outputFile: 'review/mobile-lesson-flow/production-results.json' }]],
});
