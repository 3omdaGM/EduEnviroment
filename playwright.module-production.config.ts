import { defineConfig } from '@playwright/test';
import base from './playwright.module-validation.config';
export default defineConfig({ ...base, testMatch: 'phase3-production.spec.ts', reporter: [['list'], ['json', { outputFile: 'review/module-preview-submit/production-results.json' }]] });
