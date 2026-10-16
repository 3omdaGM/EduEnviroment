import { defineConfig } from '@playwright/test';

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? (process.platform === 'linux' ? '/usr/bin/chromium' : undefined);
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: [['list'], ['json', { outputFile: 'review/phase-2/test-results.json' }]],
  outputDir: 'review/phase-2/test-artifacts',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 1366, height: 768 },
    launchOptions: { ...(executablePath ? { executablePath } : {}), args: ['--no-sandbox'] },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
  },
});
