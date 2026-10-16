import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { environmentName, lessonBase } from '../src/data/catalog';

const firstElement = `${lessonBase}/elements/el-01-01-01`;
const secondElement = `${lessonBase}/elements/el-01-01-02`;
const sizes = [
  { width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 768, height: 1024 },
  { width: 390, height: 844 }, { width: 360, height: 640 }, { width: 320, height: 740 },
];
const screens = [
  ['home', '/'], ['content', '/content'], ['module', '/modules/mod-01/intro'],
  ['lesson', `${lessonBase}/intro`], ['element', firstElement],
] as const;

for (const size of sizes) {
  test(`responsive screens ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    for (const [name, url] of screens) {
      const response = await page.goto(url);
      expect(response?.status()).toBe(200);
      await expect(page.locator('main h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(280);
      await expect(page.locator('.environment-name')).toHaveText(environmentName);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const title = await page.locator('.environment-name').evaluate(el => ({ client: el.clientHeight, scroll: el.scrollHeight, rect: el.getBoundingClientRect().toJSON() }));
      expect(title.scroll).toBeLessThanOrEqual(title.client + 1);
      expect(title.rect.x).toBeGreaterThanOrEqual(0);
      expect(title.rect.right).toBeLessThanOrEqual(size.width);
      await page.screenshot({ path: `review/phase-2/${name}-${size.width}x${size.height}.png`, fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test('mobile touch and keyboard navigation, Escape and focus restoration', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'قائمة التنقل الرئيسية', exact: true });
  await trigger.tap();
  const menu = page.getByRole('dialog', { name: 'قائمة التنقل الرئيسية' });
  await expect(menu).toBeVisible();
  await page.keyboard.press('Tab');
  expect(await menu.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Enter');
  await menu.getByRole('link', { name: 'المحتوى التعليمي', exact: true }).tap();
  await expect(page).toHaveURL('/content');
  await expect(menu).not.toBeVisible();
  await page.goto(`${lessonBase}/intro`);
  const sections = page.getByRole('button', { name: 'أقسام الدرس', exact: true });
  await sections.tap();
  const drawer = page.getByRole('dialog', { name: 'أقسام الدرس' });
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sections).toBeFocused();
  await sections.focus(); await page.keyboard.press('Enter');
  await drawer.getByRole('link', { name: 'عناصر الدرس' }).tap();
  await expect(page).toHaveURL(`${lessonBase}/elements`);
  await expect(drawer).not.toBeVisible();
  await context.close();
});

test('assessment dropdown works by keyboard and pointer, without fabricated attempts', async ({ page }) => {
  await page.goto('/');
  const menu = page.getByRole('button', { name: 'التقويم', exact: true });
  await menu.focus(); await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.hover();
  await page.locator('.assessment-dropdown').getByRole('link', { name: /التقويم القبلي/ }).click();
  await expect(page.getByRole('button', { name: 'بدء التقويم القبلي' })).toBeDisabled();
  await expect(page.getByRole('heading', { name: 'التقويم القبلي', exact: true })).toBeVisible();
});

test('ordered element acknowledgement, reading parts, zoom, history, refresh and locks', async ({ page }) => {
  await page.goto(secondElement);
  await expect(page.getByRole('heading', { name: 'العنصر مقفل' })).toBeVisible();
  await page.goto(firstElement);
  await page.getByRole('button', { name: 'تكبير الرسم' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'تكبير الرسم' })).toBeFocused();
  await page.getByRole('button', { name: 'الجزء التالي' }).click();
  await expect(page).toHaveURL(/part=el-01-01-01-part-02/);
  await page.getByRole('button', { name: 'تم الاطلاع — التالي' }).click();
  await expect(page).toHaveURL(secondElement);
  await expect(page.getByRole('heading', { name: 'الأهمية', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/part=el-01-01-01-part-02/);
  await page.goForward();
  await expect(page).toHaveURL(secondElement);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'العنصر مقفل' })).toBeVisible();
  await page.goto('/modules/mod-02/intro');
  await expect(page.getByRole('heading', { name: 'المحتوى مقفل' })).toBeVisible();
  await page.goto('/modules/mod-02/lessons/les-01-01/intro');
  await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة' })).toBeVisible();
  await page.goto(`${lessonBase}/bad-section`);
  await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة' })).toBeVisible();
  await page.goto('/goals/mod-01/not-a-page');
  await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة' })).toBeVisible();
  await page.goto('/modules/mod-01');
  await expect(page).toHaveURL('/modules/mod-01/intro');
  await page.goto(lessonBase);
  await expect(page).toHaveURL(`${lessonBase}/intro`);
});

test('public goals, guide and intentional preliminary pages', async ({ page }) => {
  for (const url of ['/goals/mod-04', '/guide?step=9', '/contact', '/login', '/register', '/recover', '/assessment/post/instructions', `${lessonBase}/activity`, `${lessonBase}/self-assessment`, '/missing']) {
    await page.goto(url);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('.environment-name')).toHaveText(environmentName);
  }
  await page.goto('/guide');
  await page.getByRole('button', { name: 'التالي', exact: true }).click();
  await expect(page).toHaveURL('/guide?step=2');
  await expect(page.getByRole('heading', { name: 'التقويم القبلي', exact: true })).toBeVisible();
});

test('long content, 200% zoom, variable viewport and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto(`${lessonBase}/intro`);
  await page.evaluate(() => { document.body.style.zoom = '2'; });
  await page.locator('.reading-text').evaluate(el => { el.textContent = `${el.textContent} `.repeat(18); });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'review/phase-2/lesson-200percent-long-content.png', fullPage: true });
  await page.evaluate(() => { document.body.style.zoom = '1'; });
  await page.setViewportSize({ width: 360, height: 460 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const text = page.locator('.reading-text');
  expect(await text.evaluate(el => el.scrollHeight <= el.clientHeight + 1)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/content');
  await page.locator('.module-card').first().hover();
  expect(await page.locator('.page-transition').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  expect(await page.locator('.module-card').first().evaluate(el => getComputedStyle(el).transform)).toBe('none');
});

test('WCAG A/AA automated checks on desktop and mobile core screens', async ({ page }) => {
  const violations: unknown[] = [];
  for (const viewport of [{ width: 1366, height: 768 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(viewport);
    for (const [, url] of screens) {
      await page.goto(url);
      await expect(page.locator('main h1')).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(260);
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      if (result.violations.length) violations.push({ viewport, url, issues: result.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) })) });
    }
  }
  await mkdir('review/phase-2', { recursive: true });
  await writeFile('review/phase-2/axe-results.json', JSON.stringify({ violations }, null, 2));
  expect(violations).toEqual([]);
});
