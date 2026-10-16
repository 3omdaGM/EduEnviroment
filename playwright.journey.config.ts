import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: 'phase3-journey.spec.ts', reporter: [['list'], ['json', { outputFile: 'review/phase-3/journey-results.json' }]] });
