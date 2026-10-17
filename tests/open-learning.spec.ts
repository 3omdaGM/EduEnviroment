import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { fullCatalog } from '../src/data/assessments';
import { people, environmentGoals, guideSteps } from '../src/data/catalog';
import { scenarioState } from '../src/demo/scenarios';
import { STORAGE_KEY } from '../src/services/demo-adapter';
import { login, stored } from './phase3-support';
const out = 'review/open-learning';
async function settled(page: Page) {
  await page.locator('main h1').waitFor({ state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { name: 'تعذر عرض الصفحة' })).toHaveCount(0);
}
async function seed(page: Page, scenario = 'eligible-50') {
  const state = scenarioState(fullCatalog, scenario as 'eligible-50');
  await page.addInitScript(({ key, state }) => { if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify(state)); }, { key: STORAGE_KEY, state });
}
for (const [width, height] of [[1920, 1080], [1366, 768], [1280, 620], [768, 1024], [390, 844], [360, 640], [320, 568]]) {
  test(`complete content and direct navigation ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width: width!, height: height! }); await seed(page);
    const routes = ['/', '/goals', '/guide', '/content', '/contact'];
    for (const module of fullCatalog.modules) for (const section of ['intro', 'objectives', 'lessons']) routes.push(`/modules/${module.id}/${section}`);
    for (const lesson of fullCatalog.lessons) for (const section of ['intro', 'objectives', 'elements', 'activity', 'self-assessment']) routes.push(`/modules/${lesson.moduleId}/lessons/${lesson.id}/${section}`);
    const rows = [];
    for (const route of routes) {
      await page.goto(route); await settled(page);
      await expect(page.getByRole('button', { name: /^(السابق|التالي)$/ })).toHaveCount(0);
      await expect(page.locator('.fit-pagination')).toHaveCount(0);
      if (route === '/') for (const person of people) await expect(page.getByRole('heading', { name: person.displayName, exact: true })).toBeVisible();
      if (route === '/goals') for (const goal of environmentGoals) await expect(page.getByRole('heading', { name: goal, exact: true })).toBeVisible();
      if (route === '/content') await expect(page.locator('.hub-module-card')).toHaveCount(4);
      if (route.endsWith('/elements')) {
        const lesson = fullCatalog.lessons.find(l => route.includes(l.id))!;
        await expect(page.locator('.element-row')).toHaveCount(lesson.elementIds.length);
        await expect(page.locator('.element-row.is-locked')).toHaveCount(0);
      }
      const geometry = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, pageWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight }));
      expect(geometry.pageWidth, route).toBeLessThanOrEqual(width!);
      rows.push({ route, ...geometry, verticalOverflow: Math.max(0, geometry.pageHeight - height!) });
      if (['/', '/goals', '/content', '/guide', '/modules/mod-01/lessons', '/modules/mod-01/lessons/les-01-01/elements'].includes(route)) await page.screenshot({ path: `${out}/${width}x${height}-${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}.png` });
    }
    await page.goto('/guide');
    for (let i = 0; i < guideSteps.length; i++) {
      await page.getByRole('button', { name: `الخطوة ${i + 1}: ${guideSteps[i]!.title}`, exact: true }).click();
      await expect(page.locator('.guide-body > p:last-child')).toHaveText(guideSteps[i]!.text);
      await expect(page.getByRole('button', { name: `الخطوة ${i + 1}: ${guideSteps[i]!.title}`, exact: true })).toHaveText(String(i + 1));
    }
    for (const e of fullCatalog.elements) {
      const base = `/modules/${e.moduleId}/lessons/${e.lessonId}/elements/${e.id}`;
      await page.goto(`${base}?part=${e.parts[1]!.id}`); await settled(page);
      for (const part of [...e.parts].reverse()) {
        await page.getByRole('button', { name: part.title, exact: true }).click();
        for (const node of part.nodes) if (node.kind === 'paragraph') await expect(page.locator('.reading-text')).toContainText(node.text);
        await expect(page.getByRole('button', { name: /السابق|التالي/ })).toHaveCount(0);
      }
    }
    await mkdir(out, { recursive: true }); await writeFile(`${out}/layout-${width}x${height}.json`, JSON.stringify(rows, null, 2));
  });
}
for (const [width, height] of [[1366, 768], [390, 844], [320, 568]]) test(`empty pre submit and free choice ${width}x${height}`, async ({ page }) => {
  await page.setViewportSize({ width: width!, height: height! }); await login(page);
  await page.goto('/modules/mod-04/lessons/les-04-02/intro');
  await expect(page.getByText('المحتوى مقفل حتى تسليم التقويم القبلي.', { exact: true })).toBeVisible();
  await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: 'بدء التقويم القبلي', exact: true }).click();
  await expect(page.locator('.quiz-navigation .button')).toHaveCount(3);
  await expect(page.locator('.answer-option')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: `${out}/${width}x${height}-pre-question.png` });
  await expect(page.getByRole('button', { name: /مراجعة/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'تسليم', exact: true }).click();
  await expect(page.locator('.submission-warning')).toContainText('20');
  await page.getByRole('link', { name: 'لا،العودة إلى الأسئلة', exact: true }).click();
  expect((await stored(page)).attempts[0]!.status).toBe('draft');
  await page.getByRole('button', { name: 'تسليم', exact: true }).click();
  await page.getByRole('button', { name: 'تأكيد وتسليم المحاولة', exact: true }).click();
  await expect(page).toHaveURL(/\/result$/); await page.reload();
  const state = await stored(page); expect(state.attempts[0]!.score).toEqual({ earned: 0, possible: 20 }); expect(state.rewards).toEqual([]);
  await page.goto('/modules/mod-04/lessons/les-04-02/self-assessment'); await expect(page.getByRole('button', { name: /بدء التقويم الذاتي/ })).toBeVisible();
  await page.goto('/assessment/post/instructions'); await expect(page.getByRole('button', { name: 'بدء التقويم البعدي', exact: true })).toBeVisible();
});
test('accessibility and text zoom keep all names and goals reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/', '/goals', '/guide', '/content']) {
    await page.goto(route); await settled(page);
    const a11y = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    expect(a11y.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]);
  }
  await page.goto('/'); await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  for (const person of people) await expect(page.getByRole('heading', { name: person.displayName, exact: true })).toBeVisible();
  await expect(page.locator('.fit-pagination')).toHaveCount(0);
});

test('post minimum, unanswered warning, navigation and saved score', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 }); await seed(page);
  await page.goto('/assessment/post/instructions'); await page.getByRole('button', { name: 'بدء التقويم البعدي', exact: true }).click();
  const definition = fullCatalog.assessments.find(d => d.id === 'post')!;
  for (let i = 0; i < 4; i++) {
    const q = fullCatalog.questions.find(q => q.id === definition.questionIds[i])!;
    await page.locator(`input[value="${q.answerKey.correctOptionId}"]`).check();
    await expect(page.getByRole('status').filter({ hasText: 'حُفظت الإجابة' })).toBeVisible();
    await page.getByRole('button', { name: 'التالي', exact: true }).click();
  }
  await page.getByRole('button', { name: 'تسليم', exact: true }).click();
  await expect(page.getByRole('button', { name: 'تأكيد وتسليم المحاولة', exact: true })).toBeDisabled();
  await expect(page.getByRole('alert')).toContainText('5');
  await page.getByRole('link', { name: 'لا،العودة إلى الأسئلة', exact: true }).click();
  const q = fullCatalog.questions.find(q => q.id === definition.questionIds[4])!;
  await page.locator(`input[value="${q.answerKey.correctOptionId}"]`).check();
  await page.getByRole('button', { name: 'السابق', exact: true }).click();
  await expect(page.locator('input:checked')).toHaveValue(fullCatalog.questions.find(q => q.id === definition.questionIds[3])!.answerKey.correctOptionId);
  await page.getByRole('button', { name: 'تسليم', exact: true }).click();
  await expect(page.locator('.submission-warning')).toContainText('15');
  await page.getByRole('button', { name: 'تأكيد وتسليم المحاولة', exact: true }).click();
  await expect(page).toHaveURL(/\/result$/); await page.reload();
  expect((await stored(page)).attempts.find(a => a.assessmentId === 'post')!.score).toEqual({ earned: 5, possible: 20 });
});

test('short assessments need every answer and failure never locks other lessons', async ({ page }) => {
  await seed(page); await page.goto('/modules/mod-04/lessons/les-04-02/self-assessment');
  await page.getByRole('button', { name: /بدء التقويم الذاتي/ }).click();
  const d = fullCatalog.assessments.find(d => d.id === 'self-les-04-02')!;
  const first = fullCatalog.questions.find(q => q.id === d.questionIds[0])!;
  await page.locator(`input[value="${first.options.find(o => o.id !== first.answerKey.correctOptionId)!.id}"]`).check();
  await page.getByRole('button', { name: 'تسليم', exact: true }).click();
  await expect(page.getByRole('button', { name: 'تأكيد وتسليم المحاولة', exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'لا،العودة إلى الأسئلة', exact: true }).click();
  await page.getByRole('button', { name: 'التالي', exact: true }).click();
  const second = fullCatalog.questions.find(q => q.id === d.questionIds[1])!;
  await page.locator(`input[value="${second.options.find(o => o.id !== second.answerKey.correctOptionId)!.id}"]`).check();
  await page.getByRole('button', { name: 'تسليم', exact: true }).click();
  await expect(page.locator('.submission-warning')).toHaveCount(0);
  await page.getByRole('button', { name: 'تأكيد وتسليم المحاولة', exact: true }).click();
  await expect(page).toHaveURL(/\/result$/);
  expect((await stored(page)).attempts.find(a => a.assessmentId === d.id)!.score).toEqual({ earned: 0, possible: 2 });
  await page.goto('/modules/mod-02/lessons/les-02-02/elements'); await expect(page.locator('.element-row.is-locked')).toHaveCount(0);
  await expect(page.locator('.element-row')).toHaveCount(3);
});

test('higher resolutions never paginate supervisors; touch opens arbitrary steps and lessons', async ({ browser, page }) => {
  for (const width of [1366, 1920, 2560, 3840]) {
    await page.setViewportSize({ width, height: Math.round(width * 9 / 16) }); await page.goto('/'); await settled(page);
    for (const person of people) await expect(page.getByRole('heading', { name: person.displayName, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /السابق|التالي/ })).toHaveCount(0);
  }
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:4182', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  try {
    const touch = await context.newPage(); await seed(touch); await touch.goto('/guide');
    const step = touch.getByRole('button', { name: `الخطوة 8: ${guideSteps[7]!.title}`, exact: true }); await step.tap();
    await expect(touch.locator('.guide-body h2')).toHaveText(guideSteps[7]!.title);
    const box = await step.boundingBox(); expect(box!.width).toBeGreaterThanOrEqual(44); expect(box!.height).toBeGreaterThanOrEqual(44);
    await touch.goto('/modules/mod-04/lessons'); await touch.locator('.lesson-row').last().tap();
    await expect(touch).toHaveURL('/modules/mod-04/lessons/les-04-02/intro');
    await touch.getByRole('button', { name: 'أقسام الدرس', exact: true }).tap();
    await touch.getByRole('link', { name: 'عناصر الدرس', exact: true }).tap();
    await expect(touch.locator('.element-row.is-locked')).toHaveCount(0);
  } finally { await context.close(); }
});
