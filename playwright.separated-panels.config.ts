import { defineConfig } from '@playwright/test';
import base from './playwright.config';
export default defineConfig({...base,testMatch:'separated-panels.spec.ts',fullyParallel:true,workers:2,timeout:120_000,
 use:{...base.use,baseURL:'http://127.0.0.1:4197',reducedMotion:'reduce'},
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4197',url:'http://127.0.0.1:4197',reuseExistingServer:false},
 outputDir:'review/separated-panels/test-artifacts',reporter:[['list'],['json',{outputFile:'review/separated-panels/test-results.json'}]],
});
