import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { fullCatalog as catalog } from '../src/data/assessments';
import { guideSteps } from '../src/data/catalog';
import { scenarioState } from '../src/demo/scenarios';
import { reduceCommand, lessonRoute } from '../src/domain/training';
import { STORAGE_KEY } from '../src/services/demo-adapter';

let state = scenarioState(catalog, 'completed');
for (const d of catalog.assessments) state = reduceCommand(state, catalog, { type: 'start-attempt', assessmentId: d.id }, '2026-10-16T00:00:00Z', `responsive-${d.id}`).state;
async function ready(page: Page, route: string) {
  await page.goto(route); await page.locator('h1').first().waitFor({ state: 'attached' }); await page.evaluate(() => document.fonts.ready);
}
async function size(page: Page) {
  return page.evaluate(() => ({ height: document.documentElement.scrollHeight, width: document.documentElement.scrollWidth, viewportHeight: innerHeight, viewportWidth: innerWidth }));
}
const viewports = [[1920, 910], [1366, 768], [1280, 620], [768, 1024], [390, 844], [360, 640], [320, 740], [320, 568]];
for (const [width, height] of viewports) test(`pages and all guide steps ${width}x${height}`, async ({ page }) => {
  await page.setViewportSize({ width: width!, height: height! });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const rows = [];
  for (let i = 0; i < guideSteps.length; i++) {
    await ready(page, `/guide?step=${i + 1}`);
    await expect(page.locator('.guide-body > p:last-child')).toHaveText(guideSteps[i]!.text);
    const s = await size(page); expect(s.width).toBeLessThanOrEqual(width!); expect(s.height).toBeLessThanOrEqual(height! + 1); rows.push({ route: `/guide?step=${i + 1}`, ...s });
  }
  if (width! < 768) { await page.getByLabel('اختر خطوة دليل المتدرب').selectOption('1'); await expect(page).toHaveURL(/step=1$/); }
  else { await page.getByRole('button', { name: `الخطوة 1: ${guideSteps[0]!.title}`, exact: true }).click(); }
  await page.getByRole('button', { name: 'التالي', exact: true }).click(); await expect(page).toHaveURL(/step=2$/); await page.reload(); await expect(page.locator('.guide-body h2')).toHaveText(guideSteps[1]!.title);
  for (const route of ['/', '/goals', '/contact', '/login', '/register', '/recover', '/content']) {
    await ready(page, route); const s = await size(page); expect(s.width).toBeLessThanOrEqual(width!); rows.push({ route, ...s });
    if (['/goals', '/login', '/register'].includes(route)) await page.screenshot({ path: `review/compact-pages/${width}x${height}-${route.slice(1)}.png`, fullPage: true });
  }
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: STORAGE_KEY, value: state });
  for (const route of ['/content', '/modules/mod-01/intro', '/modules/mod-01/objectives', '/modules/mod-01/lessons', '/modules/mod-01/lessons/les-01-01/intro', '/modules/mod-01/lessons/les-01-01/objectives', '/modules/mod-01/lessons/les-01-01/elements', '/modules/mod-01/lessons/les-01-01/elements/el-01-01-01', '/assessment/pre/instructions', '/assessment/pre/attempt/responsive-pre?question=pre-q-1', '/assessment/pre/attempt/responsive-pre/review']) {
    await ready(page, route); const s = await size(page); expect(s.width).toBeLessThanOrEqual(width!); rows.push({ route, ...s });
  }
  await ready(page, '/guide'); await page.screenshot({ path: `review/compact-pages/${width}x${height}-guide.png`, fullPage: true });
  expect(errors).toEqual([]); await mkdir('review/compact-pages', { recursive: true }); await writeFile(`review/compact-pages/layout-${width}x${height}.json`, JSON.stringify(rows, null, 2));
});
for (const [width, height] of [[1366, 768], [390, 844], [360, 640]]) test(`all 76 questions and saved choice ${width}x${height}`, async ({ page }) => {
  await page.setViewportSize({ width: width!, height: height! });
  await page.addInitScript(({key, value}) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(value)); }, {key: STORAGE_KEY, value: state});
  const rows = [];
  for (const d of catalog.assessments) {
    const scope = d.scope; const lesson = 'lessonId' in scope ? catalog.lessons.find(l => l.id === scope.lessonId) : undefined;
    const base = lesson ? `${lessonRoute(lesson.moduleId, lesson.id)}/${d.scope.kind === 'activity' ? 'activity' : 'self-assessment'}` : `/assessment/${d.scope.kind}`;
    for (const id of d.questionIds) {
      const q = catalog.questions.find(q => q.id === id)!;
      await ready(page, `${base}/attempt/responsive-${d.id}?question=${id}`);
      const labels = page.locator('.answer-option'); await expect(labels).toHaveCount(q.type === 'single-choice' ? 4 : 2);
      const boxes = await labels.evaluateAll(nodes => nodes.map(n => { const r = n.getBoundingClientRect(); return { x: r.x, y: r.y, bottom: r.bottom, width: r.width }; }));
      if (q.type === 'single-choice') {
        expect(boxes[0]!.x).toBeGreaterThan(boxes[2]!.x); expect(boxes[0]!.x).toBe(boxes[1]!.x); expect(boxes[2]!.x).toBe(boxes[3]!.x); expect(boxes[0]!.y).toBe(boxes[2]!.y); expect(boxes[1]!.y).toBe(boxes[3]!.y);
        await expect(page.locator('.answer-letter')).toHaveText(['أ. ', 'ب. ', 'ج. ', 'د. ']);
      }
      const s = await size(page); expect(s.width).toBeLessThanOrEqual(width!); rows.push({ id, ...s });
      if (id === 'pre-q-1') {
        await page.getByRole('radio').first().check(); await expect(page.locator('.save-indicator')).toContainText('حُفظت'); await page.reload(); await expect(page.getByRole('radio').first()).toBeChecked(); await page.screenshot({path: `review/compact-pages/${width}x${height}-quiz.png`, fullPage: true});
      }
    }
  }
  await writeFile(`review/compact-pages/questions-${width}x${height}.json`, JSON.stringify(rows, null, 2));
});
