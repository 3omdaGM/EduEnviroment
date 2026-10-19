import { test, expect } from '@playwright/test';
import { login } from './phase3-support';
import { courseScenario } from '../src/course/scenarios';
import { COURSE_STORAGE_KEY } from '../src/course/store';
import { courseCatalog, courseRoute } from '../src/course/catalog';
test('production retains mobile section links, removes the guide action and excludes demo tools', async ({ page }) => {
 await page.setViewportSize({ width: 390, height: 844 }); await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>Playback not tested</title>' })); await login(page);
 await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: COURSE_STORAGE_KEY, data: courseScenario('g2') });
 const module = courseCatalog.modules[0]!, lesson = module.lessons[0]!; await page.goto(courseRoute(module.id, lesson.id, 'objectives'));
 await page.locator('.course-lesson-flow a').click(); await expect(page).toHaveURL(courseRoute(module.id, lesson.id, 'content')); await page.locator('.course-lesson-flow a').click(); await expect(page).toHaveURL(courseRoute(module.id, lesson.id, 'activity'));
 await page.goto('/guide'); await expect(page.getByRole('link', { name: 'استعرض المحتوى', exact: true })).toHaveCount(0);
 for (const path of ['/demo-tools', '/legacy-demo-tools']) { await page.goto(path); await expect(page.getByRole('heading', { name: 'لم نعثر على هذه الصفحة', exact: true })).toBeVisible(); }
});
