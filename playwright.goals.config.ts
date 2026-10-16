import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({ ...base, testMatch: 'goals-cards.spec.ts', outputDir: 'review/goals-cards/test-artifacts', reporter: [['list'], ['json', { outputFile: 'review/goals-cards/test-results.json' }]] });
