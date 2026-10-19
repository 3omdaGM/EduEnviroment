import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { login } from './phase3-support';
import { courseScenario } from '../src/course/scenarios';
import { COURSE_STORAGE_KEY } from '../src/course/store';
import { courseCatalog, courseRoute } from '../src/course/catalog';
const root = 'review/module-actions'; mkdirSync(root, { recursive: true });
for (const [width, height] of [[1920, 910], [1536, 728], [1366, 768], [1280, 620], [768, 1024], [390, 844], [320, 568], [960, 455]]) test(`module lesson button and footer at ${width}×${height}`, async ({ page }) => {
 await page.setViewportSize({ width: width!, height: height! }); await login(page);
 await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: COURSE_STORAGE_KEY, data: courseScenario('g2') }); await page.reload();
 const saved = await page.evaluate(() => ({ ...localStorage })); const records = [];
 for (const module of courseCatalog.modules) {
  await page.goto(courseRoute(module.id)); await expect(page.locator('.course-module-objectives li p')).toHaveText(module.objectives); await page.evaluate(() => document.fonts.ready);
  const opener = page.getByRole('button', { name: 'عرض دروس الموديول', exact: true }); await expect(opener).toBeVisible();
  const buttonBox = (await opener.boundingBox())!, cardBox = (await page.locator('.course-module-objectives').boundingBox())!;
  expect(buttonBox.y).toBeGreaterThanOrEqual(cardBox.y + cardBox.height); expect(buttonBox.height).toBeGreaterThanOrEqual(44);
  const geometry = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight }));
  expect(geometry.scrollWidth).toBeLessThanOrEqual(width! + 1); if ((width! >= 1366 && height! >= 728) || width === 768) expect(geometry.scrollHeight).toBeLessThanOrEqual(height! + 1);
  await expect(page.locator('footer')).toHaveText('تسجيل الخروج'); await expect(page.locator('footer a')).toHaveCount(0);
  if (module.order === 1) await page.screenshot({ path: `${root}/overview-${width}.png`, fullPage: true });
  await opener.click(); const dialog = page.getByRole('dialog', { name: 'قائمة الدروس', exact: true }); await expect(dialog).toBeVisible(); await expect(opener).toHaveAttribute('aria-expanded', 'true');
  await expect(dialog.locator('.workspace-lesson-toggle')).toHaveCount(module.lessons.length);
  for (const lesson of module.lessons) await expect(dialog.getByRole('button', { name: `الدرس ${lesson.order}: ${lesson.title}`, exact: true })).toBeVisible();
  if (module.order === 1) {
   if (width === 1366 || width === 390) expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.map(v => v.id)).toEqual([]);
   await page.screenshot({ path: `${root}/lessons-${width}.png`, fullPage: true }); await page.keyboard.press('Escape'); await expect(opener).toBeFocused(); await expect(opener).toHaveAttribute('aria-expanded', 'false'); await opener.click();
  }
  const lesson = module.lessons.at(-1)!; await dialog.getByRole('button', { name: `الدرس ${lesson.order}: ${lesson.title}`, exact: true }).click(); await expect(page).toHaveURL(courseRoute(module.id, lesson.id, 'objectives'));
  await expect(page.getByRole('dialog', { name: 'قائمة الدروس', exact: true })).not.toBeVisible(); await expect(page.locator('.workspace-panel-header h1')).toHaveText(`أهداف الدرس — الدرس ${lesson.order}`);
  await expect(page.getByRole('button', { name: 'عرض دروس الموديول', exact: true })).toHaveCount(0); records.push({ module: module.id, ...geometry });
 }
 expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(saved);
 writeFileSync(`${root}/measurements-${width}.json`, JSON.stringify(records, null, 2) + '\n');
});
test('footer login/logout works, preserves course progress, and public lesson browsing keeps its guard', async ({ page }) => {
 await page.goto('/'); await expect(page.locator('footer')).toHaveText('تسجيل الدخول'); await page.locator('footer').getByRole('link', { name: 'تسجيل الدخول', exact: true }).click(); await expect(page).toHaveURL('/login');
 await page.getByLabel('الرمز التجريبي المعلن — DEMO', { exact: true }).fill('DEMO'); await page.getByRole('button', { name: 'تجربة بحساب تجريبي', exact: true }).click(); await expect(page).toHaveURL('/content');
 await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: COURSE_STORAGE_KEY, data: courseScenario('g4') }); await page.reload(); const before = await page.evaluate(key => localStorage.getItem(key), COURSE_STORAGE_KEY);
 await page.locator('footer').getByRole('button', { name: 'تسجيل الخروج', exact: true }).click(); await expect(page).toHaveURL('/login'); await expect(page.locator('footer')).toHaveText('تسجيل الدخول');
 expect(await page.evaluate(key => localStorage.getItem(key), COURSE_STORAGE_KEY)).toBe(before);
 const module = courseCatalog.modules[0]!, lesson = module.lessons[0]!; await page.goto(courseRoute(module.id)); await page.getByRole('button', { name: 'عرض دروس الموديول', exact: true }).click();
 await page.getByRole('dialog', { name: 'قائمة الدروس', exact: true }).getByRole('button', { name: `الدرس ${lesson.order}: ${lesson.title}`, exact: true }).click(); await expect(page.getByRole('heading', { name: 'قبل فتح الدرس', exact: true })).toBeVisible();
 await page.goto('/demo-tools'); await expect(page.getByRole('heading', { name: 'أدوات عرض أساليب التعلم والدعم', exact: true })).toBeVisible(); await expect(page.locator('footer')).toHaveText('تسجيل الدخول');
});
