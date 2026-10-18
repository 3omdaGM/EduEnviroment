import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { login } from './phase3-support';
import { COURSE_STORAGE_KEY } from '../src/course/store';
import { courseScenario } from '../src/course/scenarios';
import { courseCatalog, courseRoute } from '../src/course/catalog';
test('production excludes both tool bundles while real local course pages and empty pre remain functional', async ({ page }) => {
  const files = readdirSync('dist/assets').filter(f => f.endsWith('.js')); expect(files.some(f => /DemoTools/.test(f))).toBe(false);
  for (const file of files) { const s = readFileSync(`dist/assets/${file}`, 'utf8'); expect(s).not.toContain('تهيئة CourseLab من جديد'); expect(s).not.toContain('fixture-'); }
  await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Not a live playback test</title>' }));
  for (const path of ['/demo-tools', '/legacy-demo-tools']) { await page.goto(path); await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة' })).toBeVisible(); await expect(page.getByRole('link', { name: 'أدوات العرض', exact: true })).toHaveCount(0); }
  await login(page); await page.goto('/assessment/pre/instructions'); await page.getByRole('button', { name: 'بدء التقويم القبلي', exact: true }).click(); await page.getByRole('button', { name: 'تسليم', exact: true }).click(); await page.getByRole('button', { name: 'نعم، سلّم المحاولة', exact: true }).click(); await expect(page).toHaveURL(/result$/);
  await page.goto('/learning-style'); await expect(page.getByRole('button', { name: 'بدء اختبار أسلوب التعلم' })).toBeVisible();
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: COURSE_STORAGE_KEY, data: courseScenario('g4') });
  const m = courseCatalog.modules[1]!, l = m.lessons.at(-1)!;
  for (const section of ['objectives', 'content', 'activity']) { await page.goto(courseRoute(m.id,l.id,section)); await expect(page.locator('.workspace-panel-header')).toContainText(l.title); await expect(page.getByText('قبل فتح الدرس', { exact: true })).toHaveCount(0); }
  await page.locator('textarea').fill('تسليم محلي في بناء الإنتاج'); await page.getByRole('button', { name: 'تسليم الإجابة', exact: true }).click(); await expect(page.getByRole('status').filter({ hasText: 'حُفظ تسليم النشاط' })).toBeVisible();
});
