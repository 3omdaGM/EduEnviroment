import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { environmentName, lessonBase } from '../src/data/catalog';
import { STORAGE_KEY } from '../src/services/demo-adapter';
import { login, scenario, stored } from './phase3-support';

const reviewRoot = process.env.REVIEW_OUTPUT_DIR ?? 'review/phase-4';

const first = `${lessonBase}/elements/el-01-01-01`;
const screens = [['home', '/'], ['content', '/content'], ['module', '/modules/mod-01/intro'], ['lesson', `${lessonBase}/intro`], ['element', first], ['instructions', '/assessment/pre/instructions']] as const;
for (const size of [{ width: 1366, height: 768 }, { width: 1440, height: 900 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 360, height: 640 }, { width: 320, height: 740 }]) {
  test(`full content responsive ${size.width}x${size.height}`, async ({ page }) => {
    await page.setViewportSize(size); const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message)); page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await scenario(page, 'مؤهل عند 50%');
    for (const [name, url] of screens) {
      await page.goto(url); await expect(page.locator('main h1')).toBeVisible(); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(270);
      await expect(page.locator('.environment-name')).toHaveText(environmentName);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ path: `${reviewRoot}/${name}-${size.width}x${size.height}.png`, fullPage: true });
    }
    await page.getByRole('button', { name: 'بدء التقويم القبلي', exact: true }).click();
    await expect(page.locator('fieldset')).toBeVisible(); await expect(page.locator('.quiz-meta')).toContainText('من 20');
    await page.getByRole('radio').first().check(); await page.waitForTimeout(270);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `${reviewRoot}/question-${size.width}x${size.height}.png`, fullPage: true });
    expect(errors).toEqual([]);
  });
}

test('forms validate safe demo values, persist no credentials and reset sends no email', async ({ page }) => {
  await page.goto('/register'); await page.getByRole('button', { name: 'تجربة بحساب تجريبي' }).click();
  await page.evaluate(async () => { await document.fonts.ready; window.scrollTo(0, 0); }); await page.waitForTimeout(270);
  await page.screenshot({ path: `${reviewRoot}/register-validation.png`, fullPage: true });
  await expect(page.locator('#name-error')).toBeVisible(); await expect(page.locator('input[type=password]')).toHaveCount(0);
  await page.getByLabel('اسم مستعار للتجربة').fill('باحث التجربة');
  await page.getByLabel('البريد التجريبي', { exact: true }).fill('person@real.test');
  await page.getByLabel('الرمز التجريبي المعلن — DEMO', { exact: true }).fill('DEMO');
  await page.getByLabel('تأكيد الرمز التجريبي', { exact: true }).fill('DEMO');
  await page.getByRole('checkbox').check(); await page.getByRole('button', { name: 'تجربة بحساب تجريبي' }).click();
  await expect(page.locator('#email-error')).toContainText('@example.com');
  await page.getByLabel('البريد التجريبي', { exact: true }).fill('demo@example.com');
  await page.getByRole('button', { name: 'تجربة بحساب تجريبي' }).click(); await expect(page).toHaveURL('/content');
  expect(JSON.stringify(await stored(page))).not.toMatch(/email|password|DEMO|confirmation/);
  await page.getByRole('button', { name: 'تسجيل الخروج' }).click();
  await page.goto('/recover'); await page.getByRole('button', { name: 'عرض إرشادات الاستعادة' }).click();
  await expect(page.getByRole('status')).toContainText('لم يُرسل أي بريد');
});

test('real 20-item pre saves draft, question position and review; guards apply to URLs', async ({ page }) => {
  await login(page); await page.goto(`${lessonBase}/intro`); await expect(page.getByRole('heading', { name: 'المحتوى مقفل', exact: true })).toBeVisible();
  await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: 'بدء التقويم القبلي' }).click();
  const url = page.url().split('?')[0]!;
  await page.getByRole('radio').first().check(); const firstAnswer = await page.getByRole('radio').first().getAttribute('value');
  await page.getByRole('button', { name: 'التالي', exact: true }).click(); await page.reload(); await expect(page.locator('.quiz-meta')).toContainText('السؤال 2 من 20');
  await page.goBack(); await expect(page.locator('.quiz-meta')).toContainText('السؤال 1 من 20');
  await page.goForward(); await expect(page.locator('.quiz-meta')).toContainText('السؤال 2 من 20');
  await page.getByRole('button', { name: 'السابق', exact: true }).click(); await expect(page.locator(`input[value="${firstAnswer}"]`)).toBeChecked();
  await page.getByRole('radio').last().check(); await page.getByRole('button', { name: 'مراجعة الإجابات', exact: true }).click();
  await expect(page.getByRole('button', { name: 'الانتقال إلى تأكيد التسليم' })).toBeDisabled();
  await page.goto(`${url}/confirm`); await expect(page.getByRole('button', { name: 'تأكيد وتسليم المحاولة' })).toBeDisabled();
  await scenario(page, 'مؤهل عند 50%'); await page.goto(`${first}?part=el-01-01-01-part-02`);
  await expect(page.getByRole('heading', { name: 'المحتوى مقفل' })).toBeVisible();
  await page.goto(`${lessonBase}/elements/el-01-01-02`); await expect(page.getByRole('heading', { name: 'المحتوى مقفل' })).toBeVisible();
  await page.goto('/modules/mod-01/lessons/les-01-02/intro'); await expect(page.getByRole('heading', { name: 'المحتوى مقفل' })).toBeVisible();
  await page.goto('/modules/mod-02/lessons/les-02-01/intro'); await expect(page.getByRole('heading', { name: 'المحتوى مقفل' })).toBeVisible();
  await page.goto('/modules/mod-02/lessons/les-01-01/intro'); await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة' })).toBeVisible();
});

test('five tools states and explicit corrupt-state recovery', async ({ page }) => {
  await scenario(page, 'قبل القبلي'); expect((await stored(page)).attempts).toHaveLength(0);
  await scenario(page, 'مؤهل عند 50%'); await page.goto('/modules/mod-01/intro'); await expect(page.getByRole('heading', { name: 'مقدمة الموديول', exact: true })).toBeVisible();
  await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: /^سجل المحاولات/ }).click(); await page.getByRole('link', { name: 'عرض النتيجة', exact: true }).click(); await page.waitForTimeout(270); await page.screenshot({ path: `${reviewRoot}/pre-result-50.png`, fullPage: true });
  await scenario(page, 'غير مؤهل فوق 50%'); await page.goto('/content'); await expect(page.locator('.hub-eligibility')).toBeVisible();
  await scenario(page, 'درس غير مجتاز'); await page.goto(`${lessonBase}/self-assessment`); await page.getByRole('button', { name: /^سجل المحاولات/ }).click(); await page.getByRole('link', { name: 'عرض النتيجة', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'لم تجتز' })).toBeVisible();
  await page.waitForTimeout(270); await page.screenshot({ path: `${reviewRoot}/self-failed-result.png`, fullPage: true });
  await scenario(page, 'إكمال البيئة'); await page.goto('/content'); await page.getByRole('button', { name: 'تقدمك والتقويم', exact: true }).click(); await expect(page.getByText('المستوى 4', { exact: false })).toBeVisible(); expect((await stored(page)).rewards.reduce((n, r) => n + r.points, 0)).toBe(470); await page.getByRole('button', { name: 'إغلاق تقدمك والتقويم', exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 }); await page.getByRole('button', { name: 'قائمة التنقل الرئيسية', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('link', { name: 'التقويم البعدي متاح', exact: true })).toBeVisible(); await page.keyboard.press('Escape');
  await page.evaluate(key => localStorage.setItem(key, '{broken'), STORAGE_KEY); await page.reload(); await expect(page.getByRole('heading', { name: 'تعذر استعادة التجربة' })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe('{broken');
  await page.getByRole('link', { name: 'أدوات العرض واستعادة الحالة' }).click(); await page.getByRole('button', { name: 'إعادة ضبط التجربة', exact: true }).click(); await page.getByRole('button', { name: 'إلغاء', exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe('{broken');
  await page.getByRole('button', { name: 'إعادة ضبط التجربة', exact: true }).click(); await page.getByRole('button', { name: 'تأكيد الاستبدال' }).click(); expect((await stored(page)).learner.active).toBe(false);
});

test('mobile touch, keyboard, focus, long content, reduced motion and zoom', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const page = await context.newPage();
  await scenario(page, 'مؤهل عند 50%'); await page.goto('/');
  await page.locator('.skip-link').focus(); await page.keyboard.press('Enter'); await expect(page.locator('main')).toBeFocused();
  const nav = page.getByRole('button', { name: 'قائمة التنقل الرئيسية', exact: true }); await nav.tap(); await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(nav).toBeFocused();
  await page.goto(`${lessonBase}/intro`); const sections = page.getByRole('button', { name: 'أقسام الدرس', exact: true }); await sections.tap(); await page.keyboard.press('Tab'); expect(await page.getByRole('dialog').evaluate(el => el.contains(document.activeElement))).toBe(true); await page.keyboard.press('Escape'); await expect(sections).toBeFocused();
  await page.goto(first); await page.getByRole('button', { name: 'المراجع والرسم', exact: true }).click(); await page.getByRole('button', { name: 'تكبير الرسم' }).tap(); await page.keyboard.press('Escape'); await expect(page.getByRole('button', { name: 'تكبير الرسم' })).toBeFocused();
  await page.goto(`${lessonBase}/intro`); await page.setViewportSize({ width: 1366, height: 768 }); await page.evaluate(() => { document.body.style.zoom = '2'; }); await page.locator('.reading-text').evaluate(el => { el.textContent = `${el.textContent} `.repeat(18); });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); await page.screenshot({ path: `${reviewRoot}/long-content-200percent.png`, fullPage: true });
  await page.evaluate(() => { document.body.style.zoom = '1'; }); await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('/content'); expect(await page.locator('.page-transition').evaluate(el => getComputedStyle(el).animationName)).toBe('none');
  await context.close();
});

test('write failure preserves previous state and does not falsely report a saved answer', async ({ page }) => {
  await login(page); await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: 'بدء التقويم القبلي' }).click();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('quota', 'QuotaExceededError'); }; });
  await page.getByRole('radio').first().check(); await expect(page.getByRole('alert')).toContainText('تعذر حفظ'); await expect(page.getByRole('radio').first()).toBeChecked(); await expect(page.getByRole('button', { name: 'التالي', exact: true })).toBeDisabled(); await expect(page.getByRole('button', { name: 'تسليم', exact: true })).toBeDisabled();
  expect(Object.keys((await stored(page)).attempts[0]!.answers)).toHaveLength(0);
});

test('automated WCAG A/AA for the extended screens', async ({ page }) => {
  const violations: unknown[] = [];
  await scenario(page, 'مؤهل عند 50%');
  for (const viewport of [{ width: 1366, height: 768 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(viewport);
    for (const url of ['/login', '/register', '/assessment/pre/instructions', `${lessonBase}/intro`, '/content']) {
      await page.goto(url); await expect(page.locator('main h1')).toBeVisible(); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(260);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze(); if (r.violations.length) violations.push({ viewport, url, issues: r.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => n.target) })) });
    }
  }
  await mkdir(reviewRoot, { recursive: true }); await writeFile(`${reviewRoot}/axe-results.json`, JSON.stringify({ violations }, null, 2)); expect(violations).toEqual([]);
});

// Full authored content is checked independently of the reduced journey fixture.
for (const width of [1366, 390]) {
  test(`all module and lesson content at ${width}px`, async ({ page }) => {
    test.setTimeout(180_000);
    const { fullCatalog } = await import('../src/data/assessments');
    await page.setViewportSize({ width, height: width === 390 ? 844 : 768 });
    const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await scenario(page, 'إكمال البيئة');
    const inspect = async (url: string) => {
      await page.goto(url); await expect(page.locator('main h1')).toBeVisible();
      await expect(page.getByRole('heading', { name: 'المحتوى مقفل', exact: true })).toHaveCount(0);
      await expect(page.locator('.environment-name')).toHaveText(environmentName);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    };
    for (const module of fullCatalog.modules) {
      for (const section of ['intro', 'objectives', 'lessons']) await inspect(`/modules/${module.id}/${section}`);
      await page.screenshot({ path: `${reviewRoot}/${module.id}-${width}.png`, fullPage: true, animations: 'disabled' });
      for (const lesson of fullCatalog.lessons.filter(l => l.moduleId === module.id)) {
        const base = `/modules/${module.id}/lessons/${lesson.id}`;
        for (const section of ['intro', 'objectives', 'elements', 'activity', 'self-assessment']) await inspect(`${base}/${section}`);
        for (const id of lesson.elementIds) {
          const element = fullCatalog.elements.find(e => e.id === id)!;
          for (const part of element.parts) {
            await inspect(`${base}/elements/${id}?part=${part.id}`);
            await expect(page.locator('.reading-text')).toContainText(part.nodes.filter(n => n.kind === 'paragraph').map(n => n.text));
          }
        }
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `${reviewRoot}/${lesson.id}-${width}.png`, fullPage: true, animations: 'disabled' });
      }
    }
    expect(errors).toEqual([]);
  });
}

test('presentation: full content failed self then exactly 50% opens the next lesson', async ({ page }) => {
  const { fullCatalog } = await import('../src/data/assessments');
  const { exam } = await import('./phase3-support');
  await scenario(page, 'مؤهل عند 50%');
  await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: /^سجل المحاولات/ }).click(); await page.getByRole('link', { name: 'عرض النتيجة', exact: true }).click();
  await expect(page.locator('.score-display strong')).toHaveText('50.00%');
  await scenario(page, 'درس غير مجتاز');
  await page.goto(`${lessonBase}/self-assessment`); await page.getByRole('button', { name: /^سجل المحاولات/ }).click(); await page.getByRole('link', { name: 'عرض النتيجة', exact: true }).click();
  await expect(page.locator('.score-display strong')).toHaveText('0.00%');
  await page.goto(`${lessonBase}/self-assessment`); await exam(page, fullCatalog, 'self-les-01-01', 1, { refresh: true });
  await expect(page.locator('.score-display strong')).toHaveText('50.00%');
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(270);
  await expect(page.locator('.celebration')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `${reviewRoot}/researcher-self-50-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('link', { name: 'الانتقال إلى الخطوة التالية', exact: false }).click();
  await expect(page).toHaveURL('/modules/mod-01/lessons/les-01-02/intro');
  await page.goto('/modules/mod-02/lessons/les-02-01/intro'); await expect(page.getByRole('heading', { name: 'المحتوى مقفل' })).toBeVisible();
  const xp = (await stored(page)).rewards.reduce((n, r) => n + r.points, 0); expect(xp).toBe(30);
  await page.goto(`${lessonBase}/self-assessment`); await exam(page, fullCatalog, 'self-les-01-01', 0);
  await expect(page.getByRole('status').filter({ hasText: 'يبقى اجتيازك السابق' })).toBeVisible();
  expect((await stored(page)).rewards.reduce((n, r) => n + r.points, 0)).toBe(xp);
});

test('presentation: full 20-item post result has no passing label, keys or extra XP', async ({ page }) => {
  const { fullCatalog } = await import('../src/data/assessments');
  const { exam } = await import('./phase3-support');
  await scenario(page, 'إكمال البيئة'); await page.goto('/assessment/post/instructions');
  await exam(page, fullCatalog, 'post', 10, { refresh: true });
  await expect(page.locator('.score-display strong')).toHaveText('50.00%');
  await expect(page.getByText('لا حد نجاح أو شهادة معتمدة', { exact: false })).toBeVisible();
  await expect(page.locator('.feedback-list')).toHaveCount(0);
  expect((await stored(page)).rewards.reduce((n, r) => n + r.points, 0)).toBe(470);
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(270);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `${reviewRoot}/researcher-post-result-mobile.png`, fullPage: true });
  await page.setViewportSize({ width: 320, height: 740 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
