import { test, expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
test('default build has no demo-tools route or entry point, and no preview bypass', async ({ page }) => {
  const assets = await readdir('dist/assets');
  expect(assets.some(name => name.includes('DemoToolsPage'))).toBe(false);
  for (const file of assets.filter(name => name.endsWith('.js'))) {
    expect(await readFile(`dist/assets/${file}`, 'utf8')).not.toContain('حالات التجربة المحلية');
  }
  await page.goto('/demo-tools'); await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'أدوات العرض', exact: true })).toHaveCount(0);
  await page.goto('/modules/mod-01/intro'); await expect(page.getByRole('heading', { name: 'المحتوى مقفل', exact: true })).toBeVisible();
  await page.goto('/login'); await expect(page.getByRole('button', { name: 'تجربة بحساب تجريبي' })).toBeVisible();
});
