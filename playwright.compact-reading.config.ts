import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({ ...base, testMatch:'compact-reading.spec.ts', fullyParallel:true, workers:2, timeout:240_000,
 use:{...base.use,baseURL:'http://127.0.0.1:4194',reducedMotion:'reduce'},
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4194',url:'http://127.0.0.1:4194',reuseExistingServer:false},
 outputDir:'review/compact-reading/test-artifacts',reporter:[['list'],['json',{outputFile:`review/compact-reading/${process.env.LAYOUT_REVIEW_BASELINE ? 'baseline' : process.env.LAYOUT_REVIEW_IMAGE_CHECK ? 'image' : 'test'}-results.json`}]],
});
