import { defineConfig } from '@playwright/test';
import base from './playwright.phase4.config';
export default defineConfig({ ...base, testMatch: 'phase3-journey.spec.ts', reporter: [['list'], ['json', { outputFile: 'review/phase-4/journey-results.json' }]] });
