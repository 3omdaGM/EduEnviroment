import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { login } from './phase3-support';
import { courseScenario } from '../src/course/scenarios';
import { COURSE_STORAGE_KEY } from '../src/course/store';
import { courseCatalog, courseRoute } from '../src/course/catalog';
mkdirSync('review/lesson-entry', { recursive: true });
async function prepare(page: Page) {
  await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({status:200, contentType:'text/html', body:'<title>External playback not tested</title>'}));
  await login(page); await page.evaluate(({key,data}) => localStorage.setItem(key,JSON.stringify(data)),{key:COURSE_STORAGE_KEY,data:courseScenario('g2')}); await page.reload();
}
async function navigation(page: Page, mobile: boolean) {
  if (!mobile) return page.locator('.workspace-sidebar');
  const dialog = page.getByRole('dialog',{name:'قائمة الدروس',exact:true});
  if (!await dialog.isVisible()) await page.getByRole('button',{name:'عرض قائمة الدروس',exact:true}).click();
  return dialog;
}
async function checkEveryLesson(page: Page, mobile: boolean) {
  await prepare(page); const before=await page.evaluate(()=>({course:localStorage.getItem('edu-courselab-reference:v1'),legacy:localStorage.getItem('edu-training-demo:v1')}));
  for (const module of courseCatalog.modules) {
    await page.goto(courseRoute(module.id));
    for (const lesson of module.lessons) {
      let nav=await navigation(page,mobile); const name=lesson.title;
      if (mobile) await nav.locator('.workspace-lesson-toggle').filter({hasText:name}).tap(); else await nav.locator('.workspace-lesson-toggle').filter({hasText:name}).click();
      await expect(page).toHaveURL(courseRoute(module.id,lesson.id,'objectives')); await expect(page.locator('.workspace-panel-header h1')).toHaveText(`أهداف الدرس — الدرس ${lesson.order}`); await expect(page.locator('.course-objectives-card')).toBeVisible();
      if (mobile) await expect(page.getByRole('dialog',{name:'قائمة الدروس',exact:true})).not.toBeVisible();
      nav=await navigation(page,mobile); await expect(nav.locator('.workspace-lesson-toggle').filter({hasText:name})).toHaveAttribute('aria-expanded','true'); await expect(nav.locator('.workspace-lesson-toggle[aria-expanded=true]')).toHaveCount(1); await expect(nav.getByRole('link',{name:'أهداف الدرس',exact:true})).toHaveAttribute('aria-current','page');
      if(module.order===4 && lesson.order===1) { if(mobile)await page.keyboard.press('Escape'); await page.screenshot({path:`review/lesson-entry/objectives-${mobile?'phone':'desktop'}.png`,fullPage:true}); }
    }
  }
  expect(await page.evaluate(()=>({course:localStorage.getItem('edu-courselab-reference:v1'),legacy:localStorage.getItem('edu-training-demo:v1')}))).toEqual(before);
}
test('desktop: one click on every lesson opens its objectives and sections without writing progress',async({page})=>{await checkEveryLesson(page,false);});
test.describe('phone touch',()=>{
  test.use({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  test('every lesson opens objectives and closes the drawer; reopening shows the selected sections',async({page})=>{await checkEveryLesson(page,true);});
});
test('keyboard and repeat selection return to objectives without collapsing or adding duplicate history',async({page})=>{
  await prepare(page); const module=courseCatalog.modules[3]!,first=module.lessons[0]!,second=module.lessons[1]!; await page.goto(courseRoute(module.id)); const nav=page.locator('.workspace-sidebar');
  const firstButton=nav.locator('.workspace-lesson-toggle').filter({hasText:first.title}); await firstButton.focus(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(courseRoute(module.id,first.id,'objectives'));
  await nav.getByRole('link',{name:'محتوى الدرس',exact:true}).click(); await expect(page).toHaveURL(courseRoute(module.id,first.id,'content')); await firstButton.focus(); await page.keyboard.press('Space'); await expect(page).toHaveURL(courseRoute(module.id,first.id,'objectives'));
  await firstButton.click(); await expect(firstButton).toHaveAttribute('aria-expanded','true'); await page.goBack(); await expect(page).toHaveURL(courseRoute(module.id,first.id,'content'));
  await nav.locator('.workspace-lesson-toggle').filter({hasText:second.title}).click(); await expect(page).toHaveURL(courseRoute(module.id,second.id,'objectives')); await page.reload(); await expect(nav.locator('.workspace-lesson-toggle').filter({hasText:second.title})).toHaveAttribute('aria-expanded','true');
});
test('direct entry still respects the existing session guard',async({page})=>{
  const module=courseCatalog.modules[3]!,lesson=module.lessons[0]!; await page.goto(courseRoute(module.id)); await page.locator('.workspace-sidebar .workspace-lesson-toggle').filter({hasText:lesson.title}).click();
  await expect(page).toHaveURL(courseRoute(module.id,lesson.id,'objectives')); await expect(page.getByText('ابدأ التجربة بحساب تجريبي أولًا.',{exact:true})).toBeVisible(); await expect(page.locator('.course-objectives-card')).toHaveCount(0);
});
