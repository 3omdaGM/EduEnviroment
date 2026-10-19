import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:'support-study.spec.ts',fullyParallel:true,workers:2,timeout:120_000,
 use:{...base.use,baseURL:'http://127.0.0.1:4199',reducedMotion:'reduce'},
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4199',url:'http://127.0.0.1:4199',reuseExistingServer:false},
 outputDir:'review/styles-support/test-artifacts',reporter:[['list'],['json',{outputFile:'review/styles-support/test-results.json'}]],
});
