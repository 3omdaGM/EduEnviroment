import { defineConfig } from '@playwright/test';
import base from './playwright.phase4.config';
export default defineConfig({ ...base, testMatch: 'phase3-production.spec.ts', reporter: [['list'], ['json', { outputFile: 'review/phase-4/production-results.json' }]] });
