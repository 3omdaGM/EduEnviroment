import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:'blue-objectives.spec.ts',fullyParallel:true,workers:2,timeout:120_000,
 use:{...base.use,baseURL:'http://127.0.0.1:4198',reducedMotion:'reduce'},
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4198',url:'http://127.0.0.1:4198',reuseExistingServer:false},
 outputDir:'review/blue-module-objectives/test-artifacts',reporter:[['list'],['json',{outputFile:'review/blue-module-objectives/test-results.json'}]],
});
