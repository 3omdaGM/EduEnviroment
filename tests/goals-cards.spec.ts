import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { modules } from '../src/data/catalog';

const output = 'review/goals-cards';
const sizes = [[1920, 910], [1440, 900], [1366, 768], [768, 1024], [390, 844], [360, 640], [320, 740], [320, 568]] as const;

for (const [width, height] of sizes) test.describe(`${width}x${height}`, () => {
  test.use({ viewport: { width, height }, hasTouch: width < 900, isMobile: width < 900 });
  test('2×2 goals reveal by hover, click and keyboard without scrolling or changing training state', async ({ page }) => {
    await mkdir(output, { recursive: true });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.goto('/goals');
    await expect(page.getByRole('heading', { name: 'أهداف البيئة', exact: true, level: 1 })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const initialState = await page.evaluate(() => localStorage.getItem('edu-training-demo:v1'));
    const snapshots: unknown[] = [];
    const accessibility: unknown[] = [];
    const measure = async (phase: string) => {
      await page.waitForTimeout(250);
      const layout = await page.evaluate(() => {
        const rect = (e: Element) => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom, right: r.right }; };
        const tile = document.querySelector('.goal-slot--active .goal-tile');
        return { viewport: { width: innerWidth, height: innerHeight }, page: { width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight, scrollY }, slots: [...document.querySelectorAll('.goal-slot')].map(rect), tiles: [...document.querySelectorAll<HTMLElement>('.goal-tile')].map(e => ({ ...rect(e), scrollHeight: e.scrollHeight, clientHeight: e.clientHeight })), active: tile ? { ...rect(tile), heading: rect(tile.querySelector('h2')!), objectives: rect(tile.querySelector('.goal-card-objectives')!), items: [...tile.querySelectorAll('li')].map(rect), shadow: getComputedStyle(tile).boxShadow } : null };
      });
      expect(layout.page.width, phase).toBe(width);
      expect(layout.page.height, phase).toBe(height);
      expect(layout.page.scrollY, phase).toBe(0);
      for (const tile of layout.tiles) expect(tile.scrollHeight, phase).toBeLessThanOrEqual(tile.clientHeight + 1);
      if (layout.active) {
        const active = layout.active;
        expect(active.objectives.y, phase).toBeGreaterThanOrEqual(active.heading.bottom + 4);
        for (const item of active.items) {
          expect(item.bottom, phase).toBeLessThanOrEqual(active.bottom - 5);
          expect(item.y, phase).toBeGreaterThanOrEqual(active.objectives.y);
          expect(item.x, phase).toBeGreaterThanOrEqual(active.x);
          expect(item.right, phase).toBeLessThanOrEqual(active.right);
        }
      }
      snapshots.push({ phase, ...layout });
      return layout;
    };
    const audit = async (phase: string) => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      accessibility.push({ phase, violations: result.violations });
      expect(result.violations).toEqual([]);
    };
    const initial = await measure('closed');
    expect(initial.slots).toHaveLength(4);
    expect(initial.slots[0]!.y).toBeCloseTo(initial.slots[1]!.y, 0);
    expect(initial.slots[2]!.y).toBeCloseTo(initial.slots[3]!.y, 0);
    expect(initial.slots[0]!.x).toBeCloseTo(initial.slots[2]!.x, 0);
    expect(initial.slots[2]!.y).toBeGreaterThan(initial.slots[0]!.bottom);
    await expect(page.locator('.goal-card-objectives:visible')).toHaveCount(0);
    await page.screenshot({ path: `${output}/closed-${width}x${height}.png`, fullPage: true });
    if ([1366, 360].includes(width)) await audit('closed');
    for (const [index, module] of modules.entries()) {
      const slot = page.locator('.goal-slot').nth(index);
      const trigger = page.getByRole('button', { name: `عرض أهداف الموديول ${module.order}: ${module.title}`, exact: true });
      const region = page.getByRole('region', { name: `أهداف ${module.title}`, exact: true });
      if (width >= 900) {
        await slot.hover();
        await expect(region).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        const hovered = await measure(`hover-${module.id}`);
        expect(hovered.active?.shadow).not.toBe('none');
        await page.mouse.move(0, 0);
        await expect(region).toBeHidden();
      }
      if (width < 900) await slot.tap(); else await slot.click();
      await page.mouse.move(0, 0);
      await expect(trigger).toHaveAttribute('aria-expanded', 'true');
      await expect(region.getByRole('listitem')).toHaveCount(module.objectives.length);
      for (const objective of module.objectives) await expect(region).toContainText(objective);
      await measure(`pinned-${module.id}`);
      if (index === 1) await page.screenshot({ path: `${output}/expanded-${width}x${height}.png`, fullPage: true });
      if (index === 0 && [1366, 360].includes(width)) await audit('expanded');
      await page.getByRole('button', { name: `إغلاق أهداف ${module.title}`, exact: true }).click();
      await expect(trigger).toBeFocused();
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      await page.mouse.move(0, 0);
    }
    const keyboardTrigger = page.getByRole('button', { name: `عرض أهداف الموديول ${modules[2]!.order}: ${modules[2]!.title}`, exact: true });
    await keyboardTrigger.focus(); await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: `إغلاق أهداف ${modules[2]!.title}`, exact: true })).toBeFocused();
    await page.keyboard.press('Escape'); await expect(keyboardTrigger).toBeFocused();
    await expect(keyboardTrigger).toHaveAttribute('aria-expanded', 'false');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await keyboardTrigger.press('Space');
    await expect(page.locator('.goal-slot--active .goal-tile')).toHaveCSS('transform', 'none');
    await expect(page.locator('.goal-slot--active .goal-card-objectives')).toHaveCSS('animation-name', 'none');
    await measure('reduced-motion');
    await page.keyboard.press('Escape');
    for (const module of modules) {
      await page.goto(`/goals/${module.id}`);
      await expect(page.getByRole('region', { name: `أهداف ${module.title}`, exact: true })).toBeVisible();
      await measure(`deep-link-${module.id}`);
    }
    await page.reload();
    await expect(page.getByRole('region', { name: `أهداف ${modules[3]!.title}`, exact: true })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('edu-training-demo:v1'))).toBe(initialState);
    await page.goto('/goals/not-a-module');
    await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة', exact: true })).toBeVisible();
    await page.goto('/modules/mod-01/intro');
    await expect(page.getByRole('heading', { name: 'المحتوى مقفل', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
    await writeFile(`${output}/layout-${width}x${height}.json`, JSON.stringify({ snapshots, accessibility, errors }, null, 2) + '\n');
  });
});
