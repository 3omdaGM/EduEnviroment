import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { login } from './phase3-support';
import { courseCatalog, courseRoute, groups } from '../src/course/catalog';
import { courseScenario } from '../src/course/scenarios';
import { COURSE_STORAGE_KEY, freshCourse } from '../src/course/store';
import type { CourseState } from '../src/course/store';
import { embeddedFigures } from '../src/course/embedded-figures';
import { mkdirSync, writeFileSync } from 'node:fs';
const root = 'review/course-reference';
mkdirSync(root, { recursive: true });
const lesson = courseCatalog.modules[0]!.lessons[0]!;
const url = (section = 'content') => courseRoute(courseCatalog.modules[0]!.id, lesson.id, section);
async function state(page: Page): Promise<CourseState> { return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), COURSE_STORAGE_KEY); }
async function seed(page: Page, data: CourseState) { await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: COURSE_STORAGE_KEY, data }); await page.reload(); }
async function axe(page: Page) { const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze(); expect(r.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) }))).toEqual([]); }
async function overflow(page: Page) { const result = await page.evaluate(() => ({ width: innerWidth, actual: document.documentElement.scrollWidth, outside: [...document.querySelectorAll('main *')].filter(n => { const r = n.getBoundingClientRect(); return r.width > 0 && (r.left < -1 || r.right > innerWidth + 1); }).slice(0,10).map(n => ({ tag: n.tagName, class: n.className, text: n.textContent?.slice(0,70), rect: n.getBoundingClientRect().toJSON() })) })); expect(result.actual, JSON.stringify({ url: page.url(), ...result })).toBeLessThanOrEqual(result.width + 1); }
test.beforeEach(async ({ page }) => {
  await page.route('**/*', route => { const u = new URL(route.request().url()); return ['127.0.0.1', 'localhost'].includes(u.hostname) || ['data:', 'blob:'].includes(u.protocol) ? route.continue() : route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>External playback not tested</title>' }); });
});
test('public module metadata and deep-link guards retain old data; empty pre confirms and persists', async ({ page }) => {
  await page.goto('/content'); await expect(page.locator('.reference-module-card')).toHaveCount(2);
  await page.locator('.reference-module-card').first().click(); await expect(page.locator('.workspace-lesson-card')).toHaveCount(7);
  await page.goto(url()); await expect(page.getByText('ابدأ التجربة بحساب تجريبي أولًا.', { exact: true })).toBeVisible();
  await login(page); const legacy = await page.evaluate(() => localStorage.getItem('edu-training-demo:v1'));
  await page.goto('/assessment/pre/instructions'); await axe(page);
  await page.getByRole('button', { name: 'بدء التقويم القبلي', exact: true }).click();
  await expect(page.locator('input[type=radio]')).toHaveCount(4); await page.getByRole('button', { name: 'تسليم', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('160'); await page.getByRole('link', { name: 'لا، العودة إلى الأسئلة' }).click(); expect((await state(page)).attempts[0]!.submittedAt).toBeNull();
  await page.getByRole('button', { name: 'تسليم', exact: true }).click(); await page.getByRole('button', { name: 'نعم، سلّم المحاولة' }).click();
  await expect(page).toHaveURL(/result$/); expect((await state(page)).attempts[0]!.score).toBe(0); await page.reload();
  await expect(page.getByRole('heading', { name: 'نتيجة التقويم القبلي', exact: true })).toBeVisible();
  await page.goto(url()); await expect(page.getByText('أكمل اختبار أسلوب التعلم لتحديد مجموعتك ونمط الدعم.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('edu-training-demo:v1'))).toBe(legacy);
});
test('25 real canvas drawings classify and allocate a dependent fixed group; deadline survives reload', async ({ page }) => {
  await login(page); await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: 'بدء التقويم القبلي', exact: true }).click(); await page.getByRole('button', { name: 'تسليم', exact: true }).click(); await page.getByRole('button', { name: 'نعم، سلّم المحاولة' }).click(); await page.getByRole('link', { name: 'اختبار أسلوب التعلم', exact: true }).last().click();
  await page.getByRole('button', { name: 'بدء اختبار أسلوب التعلم', exact: true }).click();
  const deadline = (await state(page)).styleAttempts[0]!.deadline; await page.reload(); expect((await state(page)).styleAttempts[0]!.deadline).toBe(deadline);
  for (let i = 0; i < 25; i++) {
    if (i === 7 || i === 16) await page.getByRole('button', { name: 'بدء القسم', exact: true }).click();
    const canvas = page.getByLabel('مساحة رسم حدود الشكل داخل الشكل المعقد', { exact: true }); await canvas.scrollIntoViewIfNeeded(); const b = (await canvas.boundingBox())!;
    const points = i < 12 ? embeddedFigures[i]!.ans : [{ x: .01, y: .01 }, { x: .03, y: .03 }, { x: .03, y: .01 }];
    await page.mouse.move(b.x + points[0]!.x * b.width, b.y + points[0]!.y * b.height); await page.mouse.down();
    for (let j = 1; j <= points.length; j++) { const p = points[j % points.length]!; await page.mouse.move(b.x + p.x * b.width, b.y + p.y * b.height, { steps: 6 }); } await page.mouse.up();
    await page.getByRole('button', { name: 'تأكيد الإجابة', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'يظهر الحد الصحيح' })).toBeVisible();
    await page.getByRole('button', { name: i === 24 ? 'إظهار النتيجة وتحديد المجموعة' : 'السؤال التالي', exact: true }).click();
  }
  expect((await state(page)).assignment).toMatchObject({ group: 'g1', score: 5 }); await expect(page.getByRole('heading', { name: 'نتيجة أسلوب التعلم والمجموعة' })).toBeVisible();
  await page.screenshot({ path: `${root}/style-group-result.png`, fullPage: true }); await page.goto('/content'); await expect(page.getByText('المجموعة الأولى — الدعم الثابت', { exact: true })).toBeVisible();
});
for (const group of ['g1', 'g2', 'g3', 'g4'] as const) test(`${group}: content, support, free lessons, activity autosave and actual download`, async ({ page }) => {
  await login(page); await seed(page, courseScenario(group)); const legacy = await page.evaluate(() => localStorage.getItem('edu-training-demo:v1'));
  await page.goto(url()); await expect(page.locator('.workspace-panel-header')).toContainText(lesson.title);
  if (groups[group].support === 'flex') { await expect(page.locator('.course-support-message')).toHaveCount(0); await page.getByRole('button', { name: 'عرض الدعم', exact: true }).click(); }
  await expect(page.locator('.course-support-message')).toBeVisible(); await page.getByRole('button', { name: 'إيقاف التبديل', exact: true }).click(); await page.getByText(/^كل الإرشادات/).click();
  await axe(page); await page.screenshot({ path: `${root}/${group}-content-desktop.png`, fullPage: true });
  await page.goto(url('activity')); if (groups[group].support === 'flex') await page.getByRole('button', { name: 'عرض الدعم', exact: true }).click();
  await page.getByLabel('اكتب إجابتك ثم اضغط «تسليم الإجابة». الحفظ والتسليم محليان في هذه النسخة.').fill('إجابة نشاط محلية محفوظة — اختبار'); await page.reload(); await expect(page.locator('textarea')).toHaveValue('إجابة نشاط محلية محفوظة — اختبار');
  await page.getByRole('button', { name: 'تسليم الإجابة', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'حُفظ تسليم النشاط' })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('link', { name: 'تنزيل الإجابة المسلّمة' }).click(); expect((await download).suggestedFilename()).toBe(`${lesson.id}-answer.txt`);
  await page.locator('textarea').fill('مسودة جديدة لم تسلم'); expect((await state(page)).activitySubmissions).toHaveLength(1); expect((await state(page)).activitySubmissions[0]!.text).toContain('إجابة نشاط');
  await axe(page); await page.screenshot({ path: `${root}/${group}-activity-desktop.png`, fullPage: true });
  const last = courseCatalog.modules[1]!, lastLesson = last.lessons.at(-1)!; await page.goto(courseRoute(last.id, lastLesson.id, 'content')); await expect(page.locator('.course-stage-picker')).toBeVisible();
  expect(await page.getByRole('button', { name: /^(السابق|التالي)$/ }).count()).toBe(0); expect(await page.evaluate(() => localStorage.getItem('edu-training-demo:v1'))).toBe(legacy);
});
test('post minimum, unanswered warning, score over full bank and immutable result; quota errors are honest', async ({ page }) => {
  await login(page); await seed(page, courseScenario('g4')); await page.goto('/assessment/post/instructions'); await page.getByRole('button', { name: 'بدء التقويم البعدي', exact: true }).click();
  for (let i = 0; i < 5; i++) { const q = courseCatalog.exams.post[i]!; await page.locator(`input[value="${q.correct}"]`).check(); if (i === 3) { await page.getByRole('button', { name: 'تسليم', exact: true }).click(); await expect(page.getByRole('button', { name: 'نعم، سلّم المحاولة' })).toBeDisabled(); await page.getByRole('link', { name: 'لا، العودة إلى الأسئلة' }).click(); } if (i < 4) await page.getByRole('button', { name: 'التالي', exact: true }).click(); }
  await page.getByRole('button', { name: 'تسليم', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('155'); await page.getByRole('button', { name: 'نعم، سلّم المحاولة' }).click(); expect((await state(page)).attempts.at(-1)!.score).toBe(5);
  const result = await state(page); await page.goBack(); await expect(page).toHaveURL(/result$/); expect(await state(page)).toEqual(result);
  await page.goto(url('activity')); await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('test quota exceeded'); }; }); await page.locator('textarea').fill('لم يتم الحفظ'); await expect(page.getByRole('alert')).toContainText('quota'); await expect(page.getByRole('button', { name: 'تسليم الإجابة', exact: true })).toBeDisabled(); expect((await state(page)).activitySubmissions).toHaveLength(0);
});
test('all lesson stages/media at five viewports: complete source text, no horizontal overflow or non-exam pagination', async ({ page }) => {
  test.setTimeout(300_000); await login(page); await seed(page, courseScenario('g3')); const measurements: unknown[] = [];
  for (const [width, height] of [[390,844],[320,568],[768,1024],[1280,620],[1366,768]]) {
    await page.setViewportSize({ width: width!, height: height! });
    for (const path of ['/', '/goals', '/guide', '/content', ...courseCatalog.modules.flatMap(m => [courseRoute(m.id), ...m.lessons.flatMap(l => ['objectives', 'content', 'activity'].map(s => courseRoute(m.id, l.id, s)))])]) {
      await page.goto(path); await expect(page.locator('main h1')).toHaveCount(1); await overflow(page); expect(await page.getByRole('button', { name: /^(السابق|التالي)$/ }).count()).toBe(0);
      measurements.push({ width, height, path, ...await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, viewportHeight: innerHeight })) });
    }
    await page.goto(url('objectives')); await expect(page.locator('.course-html')).toBeVisible(); await axe(page); await page.screenshot({ path: `${root}/objectives-${width}.png`, fullPage: true });
    await page.goto(url('content')); await expect(page.locator('.course-stage-picker')).toBeVisible(); await page.screenshot({ path: `${root}/content-${width}.png`, fullPage: true });
    if (width! < 900) { await page.getByRole('button', { name: 'عرض قائمة الدروس' }).click(); await expect(page.getByRole('dialog')).toBeVisible(); await axe(page); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).not.toBeVisible(); await expect(page.getByRole('button', { name: 'عرض قائمة الدروس' })).toBeFocused(); }
  }
  writeFileSync(`${root}/viewport-measurements.json`, JSON.stringify(measurements, null, 2));
  await page.setViewportSize({ width: 1366, height: 768 }); let count = 0;
  for (const m of courseCatalog.modules) for (const l of m.lessons) { await page.goto(courseRoute(m.id,l.id,'content')); await expect(page.locator('#course-stage')).toBeVisible(); const options = await page.locator('#course-stage option').count(); const sections = l.sections.content.stages ?? (l.sections.content.content ?? '').split(/(?=<h4>)/).filter(v => v.trim()).map(raw => ({ body: raw.replace(/^\s*<h4>[\s\S]*?<\/h4>/, '') })); for (let i = 0; i < options; i++) { await page.selectOption('#course-stage', String(i)); await expect(page.locator('.course-stage-picker > span')).toHaveText(`${i+1} / ${options}`); for (const image of await page.locator('.course-image img').all()) { await expect(image).toBeVisible(); await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0); } for (const frame of await page.locator('iframe').all()) expect(await frame.getAttribute('src')).toMatch(/^https:\/\/www.youtube-nocookie.com\/embed\/[\w-]{11}$/); const textMatches = await page.locator('.course-html').evaluate((node, raw) => { const body = new DOMParser().parseFromString(raw, 'text/html').body; body.querySelectorAll('obj').forEach(o => o.prepend(o.getAttribute('n') ?? '')); return node.textContent!.replace(/\s/g, '') === body.textContent!.replace(/\s/g, ''); }, sections[i]!.body); expect(textMatches, `${l.id} stage ${i}`).toBe(true); await overflow(page); count++; } }
  expect(count).toBeGreaterThan(30);
});
test('corruption remains intact and blocks data commands; demo reset is explicit and legacy data untouched', async ({ page }) => {
  await login(page); const legacy = await page.evaluate(() => localStorage.getItem('edu-training-demo:v1')); await page.evaluate(key => localStorage.setItem(key, 'broken-course-data'), COURSE_STORAGE_KEY); await page.goto('/content'); await expect(page.getByRole('alert')).toContainText('تعذر استعادة'); expect(await page.evaluate(key => localStorage.getItem(key), COURSE_STORAGE_KEY)).toBe('broken-course-data');
  await page.goto('/demo-tools'); await page.getByRole('button', { name: 'تهيئة CourseLab من جديد' }).click(); expect(await page.evaluate(key => localStorage.getItem(key), COURSE_STORAGE_KEY)).toBe('broken-course-data'); await page.getByRole('button', { name: 'تأكيد الاستبدال' }).click(); expect(await state(page)).toEqual(freshCourse()); expect(await page.evaluate(() => localStorage.getItem('edu-training-demo:v1'))).toBe(legacy);
});
test('expired pre and post submit empty attempts once, restore deadlines, and surface failed timed submission', async ({ page }) => {
  await page.clock.install(); await login(page); await seed(page, courseScenario('g1'));
  for (const kind of ['pre', 'post']) {
    await page.goto(`/assessment/${kind}/instructions`); await page.getByRole('button', { name: `بدء التقويم ${kind === 'pre' ? 'القبلي' : 'البعدي'}`, exact: true }).click();
    const deadline = (await state(page)).attempts.at(-1)!.deadline; await page.reload(); expect((await state(page)).attempts.at(-1)!.deadline).toBe(deadline);
    await page.clock.fastForward(90 * 60000 + 1000); await expect(page).toHaveURL(/result$/); expect((await state(page)).attempts.at(-1)!.score).toBe(0);
  }
  await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: 'بدء التقويم القبلي', exact: true }).click();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('test timed quota'); }; }); await page.clock.fastForward(90 * 60000 + 1000);
  await expect(page.getByRole('alert')).toContainText('تعذر حفظ التسليم'); expect((await state(page)).attempts.at(-1)!.submittedAt).toBeNull();
});
test('phone touch drawing, mobile navigation, and drawer focus return', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }); const page = await context.newPage();
  await login(page); const data = courseScenario('g1'); data.assignment = null; data.styleAttempts = []; data.counters.dependent = 0; await seed(page, data); await page.goto('/learning-style'); await page.getByRole('button', { name: 'بدء اختبار أسلوب التعلم' }).tap();
  const c = page.getByLabel('مساحة رسم حدود الشكل داخل الشكل المعقد', { exact: true }); await c.scrollIntoViewIfNeeded(); const box = (await c.boundingBox())!, points = embeddedFigures[0]!.ans;
  const client = await context.newCDPSession(page); const touch = (p: {x:number;y:number}) => ({ x: box.x + p.x * box.width, y: box.y + p.y * box.height, id: 1 });
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [touch(points[0]!)] });
  for (let j = 0; j < points.length; j++) { const a = points[j]!, b = points[(j+1)%points.length]!; for (let k = 1; k <= 6; k++) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [touch({ x: a.x+(b.x-a.x)*k/6, y: a.y+(b.y-a.y)*k/6 })] }); }
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  // Chromium suppresses taps immediately following a CDP-injected drag. Let that gesture finish.
  await page.waitForTimeout(700); await page.getByRole('button', { name: 'تأكيد الإجابة', exact: true }).tap(); await expect.poll(async () => (await state(page)).styleAttempts[0]!.answers[0]).toBe(true); await overflow(page); await page.screenshot({ path: `${root}/style-phone-touch.png`, fullPage: true }); await axe(page);
  await page.getByRole('button', { name: 'قائمة التنقل الرئيسية', exact: true }).tap(); await expect(page.getByRole('dialog')).toBeVisible(); await axe(page); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'قائمة التنقل الرئيسية', exact: true })).toBeFocused(); await context.close();
});
