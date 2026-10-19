import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { login } from './phase3-support';
import { courseCatalog, courseGuideSteps, courseRoute } from '../src/course/catalog';
import { COURSE_STORAGE_KEY } from '../src/course/store';
import { courseScenario } from '../src/course/scenarios';
const root = 'review/mobile-lesson-flow'; mkdirSync(root, { recursive: true });
const lessons = courseCatalog.modules.flatMap(module => module.lessons.map(lesson => ({ module, lesson })));
async function prepare(page: Page, group: 'g2' | 'g4' = 'g2') {
 await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>External playback not tested</title>' }));
 await login(page); await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: COURSE_STORAGE_KEY, data: courseScenario(group) }); await page.reload();
}
async function geometry(page: Page) { return page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight })); }
for (const width of [390, 320]) test(`follow all 16 lessons without reopening the drawer at ${width}px`, async ({ page }) => {
 await page.setViewportSize({ width, height: width === 390 ? 844 : 568 }); await prepare(page); const saved = await page.evaluate(() => ({ ...localStorage }));
 const first = lessons[0]!; await page.goto(courseRoute(first.module.id)); await page.getByRole('button', { name: 'عرض دروس الموديول', exact: true }).click(); await page.getByRole('dialog', { name: 'قائمة الدروس', exact: true }).getByRole('button', { name: `الدرس ${first.lesson.order}: ${first.lesson.title}`, exact: true }).click();
 const records = [];
 for (let index = 0; index < lessons.length; index++) {
  const { module, lesson } = lessons[index]!;
  for (const section of ['objectives', 'content', 'activity']) {
   await expect(page).toHaveURL(courseRoute(module.id, lesson.id, section)); await expect(page.getByRole('dialog', { name: 'قائمة الدروس', exact: true })).not.toBeVisible();
   const next = page.locator('.course-lesson-flow a'); await expect(next).toBeVisible();
   const target = section === 'objectives' ? courseRoute(module.id, lesson.id, 'content') : section === 'content' ? courseRoute(module.id, lesson.id, 'activity') : lessons[index + 1] ? courseRoute(lessons[index + 1]!.module.id, lessons[index + 1]!.lesson.id, 'objectives') : '/content';
   await expect(next).toHaveAttribute('href', target); const g = await geometry(page); expect(g.scrollWidth).toBeLessThanOrEqual(width + 1); records.push({ module: module.id, lesson: lesson.id, section, target, ...g });
   if (index === 0 && width === 390) {
    const pause = page.getByRole('button', { name: 'إيقاف التبديل', exact: true }); if (await pause.isVisible()) await pause.click();
    await page.screenshot({ path: `${root}/${section}-phone.png`, fullPage: true });
    if (section === 'objectives') expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.map(v => v.id)).toEqual([]);
   }
   await next.click();
  }
 }
 await expect(page).toHaveURL('/content'); expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(saved); writeFileSync(`${root}/chain-${width}.json`, '[\n' + records.map(r => JSON.stringify(r)).join(',\n') + '\n]\n');
});

test('desktop keeps all 48 lesson sections on sidebar navigation', async ({ page }) => {
 await prepare(page);
 for (const { module, lesson } of lessons) for (const section of ['objectives', 'content', 'activity']) {
  await page.goto(courseRoute(module.id, lesson.id, section)); await expect(page.locator('.workspace-panel-header h1')).toBeVisible(); await expect(page.locator('.workspace-sidebar')).toBeVisible(); await expect(page.locator('.course-lesson-flow')).not.toBeVisible();
 }
 await page.screenshot({ path: `${root}/desktop.png`, fullPage: true });
});

test('flow visibility follows sidebar collapse during resizing and remains after content', async ({ page }) => {
 await prepare(page); const { module, lesson } = lessons[0]!; await page.goto(courseRoute(module.id, lesson.id, 'objectives')); const saved = await page.evaluate(() => ({ ...localStorage })); const records = [];
 for (const [width, height] of [[900, 768], [901, 768], [768, 1024], [1280, 620], [960, 455], [390, 844]]) {
  await page.setViewportSize({ width: width!, height: height! }); const flow = page.locator('.course-lesson-flow'), sidebar = page.locator('.workspace-sidebar');
  if (width! <= 900) {
   await expect(flow).toBeVisible(); await expect(sidebar).not.toBeVisible(); const link = (await flow.locator('a').boundingBox())!, card = (await page.locator('.course-objectives-card').boundingBox())!; expect(link.y).toBeGreaterThanOrEqual(card.y + card.height); expect(link.height).toBeGreaterThanOrEqual(44);
  } else { await expect(flow).not.toBeVisible(); await expect(sidebar).toBeVisible(); }
  const g = await geometry(page); expect(g.scrollWidth).toBeLessThanOrEqual(width! + 1); records.push(g);
 }
 expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(saved); writeFileSync(`${root}/resize.json`, JSON.stringify(records, null, 2) + '\n');
});

test('forward navigation preserves unsent drafts and remains inside the lesson guard', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 }); await prepare(page, 'g4'); const { module, lesson } = lessons[0]!, second = lessons[1]!;
 await page.goto(courseRoute(module.id, lesson.id, 'activity')); const before = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), COURSE_STORAGE_KEY);
 await page.getByLabel('اكتب إجابتك ثم اضغط «تسليم الإجابة». الحفظ والتسليم محليان في هذه النسخة.', { exact: true }).fill('مسودة محفوظة دون تسليم'); await page.locator('.course-lesson-flow a').click(); await expect(page).toHaveURL(courseRoute(second.module.id, second.lesson.id, 'objectives'));
 const after = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), COURSE_STORAGE_KEY); expect(after).toEqual({ ...before, revision: before.revision + 1, activityDrafts: { ...before.activityDrafts, [lesson.id]: 'مسودة محفوظة دون تسليم' } });
 await page.goto(courseRoute(module.id, lesson.id, 'activity')); await expect(page.locator('textarea')).toHaveValue('مسودة محفوظة دون تسليم');
 await page.locator('footer').getByRole('button', { name: 'تسجيل الخروج', exact: true }).click(); await page.goto(courseRoute(module.id, lesson.id, 'objectives')); await expect(page.getByRole('heading', { name: 'قبل فتح الدرس', exact: true })).toBeVisible(); await expect(page.locator('.course-lesson-flow')).toHaveCount(0);
});

test('guide topics remain directly accessible with no browse-content button', async ({ page }) => {
 for (const width of [1366, 390]) {
  await page.setViewportSize({ width, height: 844 }); await page.goto('/guide');
  for (const topic of courseGuideSteps) { await page.locator('.guide-steps').getByRole('button', { name: topic.title, exact: true }).click(); await expect(page.locator('.guide-body h2')).toHaveText(topic.title); await expect(page.locator('.guide-body > p:last-child')).toHaveText(topic.text); await expect(page.getByRole('link', { name: 'استعرض المحتوى', exact: true })).toHaveCount(0); }
 }
 await page.screenshot({ path: `${root}/guide-phone.png`, fullPage: true });
});
