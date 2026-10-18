import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:'content-frame.spec.ts',fullyParallel:true,workers:2,timeout:120_000,
 use:{...base.use,baseURL:'http://127.0.0.1:4196',reducedMotion:'reduce'},
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4196',url:'http://127.0.0.1:4196',reuseExistingServer:false},
 outputDir:'review/content-frame/test-artifacts',reporter:[['list'],['json',{outputFile:'review/content-frame/test-results.json'}]],
});
