import { test, expect } from '@playwright/test';
import { fullCatalog } from '../src/data/assessments';
import { createE2eFixture } from '../src/demo/e2e-fixture';
import { lessonRoute } from '../src/domain/training';
import { exam, login, stored } from './phase3-support';

const fixture = createE2eFixture(fullCatalog);
test('demo account to post through all four stations with independent attempts and immutable rewards', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await login(page); await page.goto('/assessment/pre/instructions'); await exam(page, fixture, 'pre', 1, { refresh: true });
  await expect(page.getByText('عزيزي المتدرب، لم تتجاوز نسبتك 50%', { exact: false })).toBeVisible();
  for (const [index, lesson] of fixture.lessons.entries()) {
    const base = lessonRoute(lesson.moduleId, lesson.id);
    await page.goto(`${base}/elements/${lesson.elementIds[0]}`);
    await page.getByRole('button', { name: 'تم الاطلاع — التالي', exact: true }).click();
    await expect(page).toHaveURL(`${base}/activity`);
    await exam(page, fixture, lesson.activityAssessmentId, 0);
    await expect(page.getByText('اكتمل تسليم النشاط وأصبح التقويم الذاتي متاحًا', { exact: false })).toBeVisible();
    await page.getByRole('link', { name: 'الانتقال إلى الخطوة التالية', exact: false }).click();
    await exam(page, fixture, lesson.selfAssessmentId, index === 0 ? 1 : 2);
    if (index === 0) {
      const points = (await stored(page)).rewards.reduce((n, r) => n + r.points, 0);
      await page.getByRole('button', { name: 'محاولة جديدة', exact: true }).click();
      // The helper starts on instructions, so finish this explicitly entered attempt.
      for (const [qindex, id] of fixture.assessments.find(d => d.id === lesson.selfAssessmentId)!.questionIds.entries()) {
        const q = fixture.questions.find(q => q.id === id)!;
        await page.locator(`input[type="radio"][value="${q.options.find(o => o.id !== q.answerKey.correctOptionId)!.id}"]`).check();
        if (qindex === 0) await page.getByRole('button', { name: 'التالي', exact: true }).click();
      }
      await page.getByRole('button', { name: 'مراجعة الإجابات' }).click(); await page.getByRole('button', { name: 'الانتقال إلى تأكيد التسليم' }).click(); await page.getByRole('button', { name: 'تأكيد وتسليم المحاولة' }).click();
      await expect(page.getByRole('status').filter({ hasText: 'يبقى اجتيازك السابق' })).toBeVisible();
      expect((await stored(page)).rewards.reduce((n, r) => n + r.points, 0)).toBe(points);
    }
  }
  await page.getByRole('link', { name: 'الانتقال إلى الخطوة التالية', exact: false }).click();
  await expect(page).toHaveURL('/assessment/post/instructions');
  await exam(page, fixture, 'post', 2);
  await expect(page.getByText('لا حد نجاح أو شهادة معتمدة', { exact: false })).toBeVisible();
  const state = await stored(page); expect(state.rewards).toHaveLength(12); expect(state.rewards.reduce((n, r) => n + r.points, 0)).toBe(320);
  expect(new Set(state.attempts.map(a => a.id)).size).toBe(state.attempts.length);
  const url = page.url(); await page.reload(); await expect(page).toHaveURL(url); await expect(page.locator('.celebration')).toHaveCount(0);
  await page.goto(url.replace('/result', '')); await expect(page).toHaveURL(url); await expect(page.locator('input[type=radio]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('ineligible first pre remains ineligible on a later 0% attempt with zero XP', async ({ page }) => {
  await login(page); await page.goto('/assessment/pre/instructions'); await exam(page, fixture, 'pre', 2);
  await page.getByRole('link', { name: 'سجل المحاولات والتعليمات' }).click(); await exam(page, fixture, 'pre', 0);
  await page.goto('/modules/mod-01/lessons/les-01-01/intro'); await expect(page.getByRole('heading', { name: 'المحتوى مقفل' })).toBeVisible();
  const state = await stored(page); expect(state.attempts).toHaveLength(2); expect(state.rewards).toHaveLength(0);
});

test('failed self stays locked until a new 50% attempt; activity needs no passing grade', async ({ page }) => {
  await login(page); await page.goto('/assessment/pre/instructions'); await exam(page, fixture, 'pre', 1);
  const lesson = fixture.lessons[0]!, base = lessonRoute(lesson.moduleId, lesson.id);
  await page.goto(`${base}/elements/${lesson.elementIds[0]}`); await page.getByRole('button', { name: 'تم الاطلاع — التالي', exact: true }).click();
  await exam(page, fixture, lesson.activityAssessmentId, 0); await page.getByRole('link', { name: 'الانتقال إلى الخطوة التالية', exact: false }).click();
  await exam(page, fixture, lesson.selfAssessmentId, 0); await page.goto('/modules/mod-02/lessons/les-02-01/intro'); await expect(page.getByRole('heading', { name: 'المحتوى مقفل' })).toBeVisible();
  await page.goto(`${base}/self-assessment`); await exam(page, fixture, lesson.selfAssessmentId, 1); await page.goto('/modules/mod-02/lessons/les-02-01/intro'); await expect(page.getByRole('heading', { name: 'مقدمة الدرس', exact: true })).toBeVisible();
});
