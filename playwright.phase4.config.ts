import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch: ['phase4-ui.spec.ts', 'phase4-extra-pages.spec.ts'], reporter: [['list'], ['json', { outputFile: 'review/phase-4/ui-results.json' }]], outputDir: 'review/phase-4/test-artifacts' });
