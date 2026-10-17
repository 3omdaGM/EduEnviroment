import { test, expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import { login } from './phase3-support';
test('production excludes demo tools and permits empty pre without a shortcut', async ({ page }) => {
  const assets = await readdir('dist/assets'); expect(assets.some(f => f.includes('DemoTools'))).toBe(false);
  for (const file of assets.filter(f => f.endsWith('.js'))) expect(await readFile(`dist/assets/${file}`, 'utf8')).not.toContain('تأكيد الاستبدال');
  await page.goto('/demo-tools'); await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'أدوات العرض', exact: true })).toHaveCount(0);
  await login(page); await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: 'بدء التقويم القبلي', exact: true }).click();
  await page.getByRole('button', { name: 'تسليم', exact: true }).click();
  await page.getByRole('button', { name: 'تأكيد وتسليم المحاولة', exact: true }).click();
  await expect(page).toHaveURL(/\/result$/);
  await page.goto('/modules/mod-04/lessons/les-04-02/intro'); await expect(page.getByRole('heading', { name: 'مقدمة الدرس', exact: true })).toBeVisible();
});
