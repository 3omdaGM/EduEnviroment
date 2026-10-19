import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:'support-study-production.spec.ts',fullyParallel:true,workers:2,timeout:120_000,
 use:{...base.use,baseURL:'http://127.0.0.1:4200',reducedMotion:'reduce'},
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4200',url:'http://127.0.0.1:4200',reuseExistingServer:false},
 outputDir:'review/styles-support/production-artifacts',reporter:[['list'],['json',{outputFile:'review/styles-support/production-results.json'}]],
});
