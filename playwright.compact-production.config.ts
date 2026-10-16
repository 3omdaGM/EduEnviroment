import { defineConfig } from '@playwright/test';
import base from './playwright.compact-validation.config';
export default defineConfig({ ...base, testMatch: 'phase3-production.spec.ts', reporter: [['list'], ['json', { outputFile: 'review/compact-pages/production-results.json' }]] });
