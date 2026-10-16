import { test, expect } from '@playwright/test';
import { environmentName, modules } from '../src/data/catalog';

for (const width of [1366, 390]) {
  test(`additional pages: goals, guide, contact and accounts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 768 });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    for (const route of ['goals', 'guide', 'contact', 'login', 'register', 'recover']) {
      await page.goto(`/${route}`); await expect(page.locator('main h1')).toBeVisible();
      await expect(page.locator('.environment-name')).toHaveText(environmentName);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `review/phase-4/extra-${route}-${width}.png`, fullPage: true, animations: 'disabled' });
    }
    for (const module of modules) {
      await page.goto(`/goals/${module.id}`);
      for (const objective of module.objectives) await expect(page.getByRole('region', { name: `أهداف ${module.title}`, exact: true })).toContainText(objective);
    }
    await page.goto('/contact'); await expect(page.getByRole('button', { name: /إرسال/ })).toHaveCount(0);
    await page.goto('/login'); await expect(page.locator('input[type=password]')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
