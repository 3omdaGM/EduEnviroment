import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { login } from './phase3-support';
import { COURSE_STORAGE_KEY, freshCourse, reduceCourse } from '../src/course/store';
import { courseScenario } from '../src/course/scenarios';
import { courseCatalog, courseGuideSteps, courseRoute } from '../src/course/catalog';
import { embeddedFigures } from '../src/course/embedded-figures';
const root = 'review/figures-guide'; mkdirSync(root, { recursive: true });
function startedStyle() {
 let state = freshCourse(); const now = Date.now();
 let result = reduceCourse(state, { type: 'start-exam', kind: 'pre' }, true, now, 'pre'); state = result.state;
 result = reduceCourse(state, { type: 'submit-exam', id: result.id! }, true, now, 'submit'); state = result.state;
 return reduceCourse(state, { type: 'start-style' }, true, now, 'style').state;
}
async function seed(page: Page, data = startedStyle()) {
 await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: COURSE_STORAGE_KEY, data });
}
async function visit(page: Page, path: string) {
 await page.goto(path, { waitUntil: 'domcontentloaded' }); await expect(page.locator('main h1')).toBeAttached();
 await page.evaluate(() => document.fonts.ready); await page.evaluate(() => scrollTo(0, 0));
 const pause = page.getByRole('button', { name: 'إيقاف التبديل', exact: true }); if (await pause.isVisible()) await pause.click();
}
async function geometry(page: Page) {
 return page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight,
  canvases: [...document.querySelectorAll('canvas')].map(e => { const r = e.getBoundingClientRect(); return { width: r.width, height: r.height, top: r.top, bottom: r.bottom }; }),
  overflow: ['body', 'main', '.content-frame', '.course-style', '.course-style-test'].flatMap(s => { const e = document.querySelector(s); return e ? [{ selector: s, y: getComputedStyle(e).overflowY }] : []; }),
 }));
}
async function draw(page: Page, index = 0) {
 const canvas = page.getByLabel('مساحة رسم حدود الشكل داخل الشكل المعقد', { exact: true }); await canvas.scrollIntoViewIfNeeded(); const box = (await canvas.boundingBox())!;
 const points = embeddedFigures[index]!.ans;
 await page.mouse.move(box.x + points[0]!.x * box.width, box.y + points[0]!.y * box.height); await page.mouse.down();
 for (let i = 1; i <= points.length; i++) { const p = points[i % points.length]!; await page.mouse.move(box.x + p.x * box.width, box.y + p.y * box.height, { steps: 6 }); }
 await page.mouse.up();
}
const module = courseCatalog.modules[0]!, lesson = module.lessons[3]!;
const paths = ['/', '/goals', '/content', '/contact', '/login', '/demo-tools', '/assessment/pre/instructions', '/assessment/post/instructions', ...courseCatalog.modules.map(m => courseRoute(m.id)), ...['objectives', 'content', 'activity'].map(s => courseRoute(module.id, lesson.id, s))];
for (const [width, height] of [[1920, 910], [1536, 728], [1366, 768], [1280, 620], [768, 1024], [390, 844], [320, 568], [960, 455]]) test(`figures, named guide topics and page layout ${width}×${height}`, async ({ page }) => {
 await page.setViewportSize({ width: width!, height: height! });
 await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Playback not tested</title>' }));
 await login(page); await seed(page); await visit(page, '/learning-style');
 const records: unknown[] = []; const record = async (path: string, fit = false) => {
  const g = await geometry(page); expect(g.scrollWidth, path).toBeLessThanOrEqual(width! + 1);
  for (const item of g.overflow) expect(['hidden', 'clip']).not.toContain(item.y);
  if (fit) expect(g.scrollHeight, `${path}: ${JSON.stringify(g)}`).toBeLessThanOrEqual(height! + 1); records.push({ path, ...g });
 };
 const fit = width! >= 768 && height! >= 620;
 await record('/learning-style/drawing', fit);
 const boxes = (await geometry(page)).canvases; expect(boxes[1]!.width / boxes[1]!.height).toBeCloseTo(1.2, 1);
 expect(boxes[1]!.width).toBeGreaterThan(170);
 await page.screenshot({ path: `${root}/style-${width}.png`, fullPage: true });
 await draw(page); await page.getByRole('button', { name: 'مسح الرسم', exact: true }).click(); await expect(page.getByRole('button', { name: 'تأكيد الإجابة', exact: true })).toBeDisabled();
 await draw(page); await page.getByRole('button', { name: 'تأكيد الإجابة', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'إجابة صحيحة وفق' })).toBeVisible();
 await page.evaluate(() => scrollTo(0, 0)); await record('/learning-style/feedback', fit);
 if (width === 1366 || width === 390) await page.screenshot({ path: `${root}/feedback-${width}.png`, fullPage: true });
 const deadline = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).styleAttempts[0].deadline, COURSE_STORAGE_KEY);
 await page.reload(); await expect(page.getByRole('button', { name: 'السؤال التالي', exact: true })).toBeVisible();
 expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).styleAttempts[0].deadline, COURSE_STORAGE_KEY)).toBe(deadline);
 await page.getByRole('button', { name: 'السؤال التالي', exact: true }).click(); await record('/learning-style/next', fit);
 if (width === 1366 || width === 390) {
  const violations = (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations;
  expect(violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
 }
 const instructions = startedStyle(); instructions.styleAttempts = []; await seed(page, instructions); await visit(page, '/learning-style'); await record('/learning-style/instructions', fit);
 await seed(page, courseScenario('g2')); await visit(page, '/guide'); const saved = await page.evaluate(() => ({ ...localStorage }));
 for (let i = 0; i < courseGuideSteps.length; i++) {
  const item = courseGuideSteps[i]!; const button = page.locator('.guide-steps').getByRole('button', { name: item.title, exact: true });
  await button.click(); await expect(button).toHaveAttribute('aria-current', 'step'); await expect(page.locator('.guide-body h2')).toHaveText(item.title);
  await expect(page.locator('.guide-body > p:last-child')).toHaveText(item.text);
  expect(await page.locator('.guide-steps button').allTextContents()).toEqual(courseGuideSteps.map(s => s.title));
  await page.evaluate(() => scrollTo(0, 0)); await record(`/guide?step=${i + 1}`, fit);
 }
 await visit(page, '/guide?step=2'); await expect(page.locator('.guide-body h2')).toHaveText('التقويم القبلي');
 await page.screenshot({ path: `${root}/guide-${width}.png`, fullPage: true });
 if (width === 1366 || width === 390) expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations.map(v => v.id)).toEqual([]);
 for (const path of paths) { await visit(page, path); await record(path, width! >= 1366 && height! >= 728); await expect(page.getByRole('button', { name: /^(السابق|التالي)$/ })).toHaveCount(0); }
 expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(saved);
 writeFileSync(`${root}/measurements-${width}.json`, '[\n' + records.map(row => JSON.stringify(row)).join(',\n') + '\n]\n');
});

test('resizing during a drawing preserves normalized points and timer; enlarged text remains reachable', async ({ page }) => {
 await login(page); await seed(page); await visit(page, '/learning-style'); await draw(page);
 const stored = await page.evaluate(() => ({ ...localStorage }));
 await page.setViewportSize({ width: 390, height: 844 }); await page.getByRole('button', { name: 'تأكيد الإجابة', exact: true }).click();
 await expect(page.getByRole('status').filter({ hasText: 'إجابة صحيحة وفق' })).toBeVisible();
 await page.getByRole('button', { name: 'السؤال التالي', exact: true }).click();
 await page.addStyleTag({ content: 'body, .course-style p, .course-figures figcaption, .course-style button { font-size: 24px !important; }' });
 await page.getByRole('button', { name: 'مسح الرسم', exact: true }).scrollIntoViewIfNeeded();
 expect((await geometry(page)).scrollWidth).toBeLessThanOrEqual(391); await expect(page.locator('.course-drawing-hint')).toBeVisible();
 expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).styleAttempts[0].deadline, COURSE_STORAGE_KEY)).toBe(JSON.parse(stored[COURSE_STORAGE_KEY]!).styleAttempts[0].deadline);
});

test.describe('touch drawing', () => {
 test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
 test('phone touch strokes are scored after compact layout', async ({ page }) => {
  await login(page); await seed(page); await visit(page, '/learning-style');
  const canvas = page.getByLabel('مساحة رسم حدود الشكل داخل الشكل المعقد', { exact: true }); await canvas.scrollIntoViewIfNeeded(); const box = (await canvas.boundingBox())!;
  const client = await page.context().newCDPSession(page); const points = embeddedFigures[0]!.ans;
  const touch = (x: number, y: number) => [{ x: box.x + x * box.width, y: box.y + y * box.height }];
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touch(points[0]!.x, points[0]!.y) });
  for (let i = 0; i < points.length; i++) {
   const a = points[i]!, b = points[(i + 1) % points.length]!;
   for (let j = 1; j <= 6; j++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touch(a.x + (b.x - a.x) * j / 6, a.y + (b.y - a.y) * j / 6) });
  }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await client.detach();
  await expect(page.getByRole('button', { name: 'تأكيد الإجابة', exact: true })).toBeEnabled();
  // Let Chromium finish the synthesized drawing gesture before a separate tap.
  await page.waitForTimeout(350);
  await page.getByRole('button', { name: 'تأكيد الإجابة', exact: true }).tap(); await expect(page.getByRole('status').filter({ hasText: 'إجابة صحيحة وفق' })).toBeVisible();
  await page.getByRole('button', { name: 'السؤال التالي', exact: true }).tap(); await expect(page.locator('.quiz-meta')).toContainText('الشكل 2 من 25');
 });
});

test('every lesson section keeps natural flow at all eight sizes', async ({ page }) => {
 test.setTimeout(360_000);
 await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Playback not tested</title>' }));
 await login(page); await seed(page, courseScenario('g2')); await visit(page, '/content'); const saved = await page.evaluate(() => ({ ...localStorage })); const records: unknown[] = [];
 for (const [width, height] of [[1920, 910], [1536, 728], [1366, 768], [1280, 620], [768, 1024], [390, 844], [320, 568], [960, 455]]) {
  await page.setViewportSize({ width: width!, height: height! });
  for (const m of courseCatalog.modules) for (const l of m.lessons) for (const section of ['objectives', 'content', 'activity']) {
   const path = courseRoute(m.id, l.id, section); await visit(page, path);
   await page.locator('main img').evaluateAll(nodes => Promise.all(nodes.map(n => (n as HTMLImageElement).decode().catch(() => {}))));
   const g = await geometry(page); expect(g.scrollWidth, path).toBeLessThanOrEqual(width! + 1);

   await expect(page.getByRole('button', { name: /^(السابق|التالي)$/ })).toHaveCount(0);
   records.push({ path, ...g });
  }
 }
 expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(saved);
 writeFileSync(`${root}/all-lesson-sections.json`, '[\n' + records.map(row => JSON.stringify(row)).join(',\n') + '\n]\n');
 const overflow = (records as {path: string; width: number; height: number; scrollHeight: number}[]).filter(r => r.width >= 1366 && r.height >= 728 && r.scrollHeight > r.height + 1);
 expect(overflow).toEqual([]);
});
