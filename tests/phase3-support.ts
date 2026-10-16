import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import type { DemoState, TrainingCatalog } from '../src/domain/models';
import { STORAGE_KEY } from '../src/services/demo-adapter';

export async function login(page: Page) {
  await page.goto('/login'); await page.getByLabel('الرمز التجريبي المعلن — DEMO', { exact: true }).fill('DEMO');
  await page.getByRole('button', { name: 'تجربة بحساب تجريبي', exact: true }).click(); await expect(page).toHaveURL('/content');
}
export async function scenario(page: Page, name: string) {
  await page.goto('/demo-tools'); await page.getByRole('button', { name, exact: true }).click();
  await page.getByRole('button', { name: 'تأكيد الاستبدال', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('حُفظت حالة العرض');
}
export async function stored(page: Page): Promise<DemoState> {
  return page.evaluate(key => JSON.parse(localStorage.getItem(key)!), STORAGE_KEY);
}
export async function exam(page: Page, catalog: TrainingCatalog, id: string, correct: number, options: { refresh?: boolean } = {}) {
  const d = catalog.assessments.find(d => d.id === id)!;
  await page.getByRole('button', { name: new RegExp(`^(بدء ${d.title}|استكمال المحاولة)$`) }).click();
  await expect(page.locator('fieldset')).toBeVisible();
  for (let index = 0; index < d.questionIds.length; index++) {
    const q = catalog.questions.find(q => q.id === d.questionIds[index])!;
    const value = index < correct ? q.answerKey.correctOptionId : q.options.find(o => o.id !== q.answerKey.correctOptionId)!.id;
    const text = q.options.find(o => o.id === value)!.text;
    await page.getByRole('radio', { name: text, exact: true }).check();
    await expect(page.getByRole('status').filter({ hasText: 'حُفظت الإجابة' })).toBeVisible();
    if (index === 0 && options.refresh) { await page.reload(); await expect(page.getByRole('radio', { name: text, exact: true })).toBeChecked(); }
    if (index < d.questionIds.length - 1) await page.getByRole('button', { name: 'التالي', exact: true }).click();
  }
  await page.getByRole('button', { name: 'مراجعة الإجابات', exact: true }).click();
  await page.getByRole('button', { name: 'الانتقال إلى تأكيد التسليم', exact: true }).click();
  await page.getByRole('button', { name: 'تأكيد وتسليم المحاولة', exact: true }).click();
  await expect(page).toHaveURL(/\/result$/);
  await expect(page.getByRole('heading', { name: `نتيجة ${d.title}`, exact: true })).toBeVisible();
}
