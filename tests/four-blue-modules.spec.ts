import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { login } from './phase3-support';
import { courseScenario } from '../src/course/scenarios';
import { COURSE_STORAGE_KEY } from '../src/course/store';
import { courseCatalog, courseRoute } from '../src/course/catalog';
const root = 'review/four-blue-modules'; mkdirSync(root, { recursive: true });
async function measure(page: Page) { return page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight })); }
async function seed(page: Page, group: 'g1' | 'g2' | 'g3' | 'g4') { await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: COURSE_STORAGE_KEY, state: courseScenario(group) }); await page.reload(); }
async function axe(page: Page) { expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]); }
test.beforeEach(async ({ page }) => { await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({ status: 200, contentType: 'text/html', body: '<title>External playback not tested</title>' })); });
test('four complete blue cards fit without document scrolling across desktop, phone and effective zoom sizes', async ({ page }) => {
  await login(page); await seed(page,'g2'); const records: unknown[] = [];
  for (const [width,height] of [[1920,910],[1536,728],[1366,768],[1280,620],[768,1024],[390,844],[360,640],[320,568],[3840,2160]]) {
    await page.setViewportSize({ width: width!, height: height! }); await page.goto('/content'); const cards = page.locator('.reference-module-card'); await expect(cards).toHaveCount(4);
    const data = await measure(page); records.push(data); expect(data.scrollWidth).toBeLessThanOrEqual(data.width); expect(data.scrollHeight, JSON.stringify(data)).toBeLessThanOrEqual(data.height+1);
    const boxes = await cards.evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().toJSON())); expect(Math.abs(boxes[0]!.y-boxes[1]!.y)).toBeLessThan(1); expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y);
    for (let i=0; i<4; i++) { await expect(cards.nth(i)).toContainText(`الموديول ${i+1}`); await expect(cards.nth(i).getByRole('heading')).toHaveText(courseCatalog.modules[i]!.title); }
    expect(await page.locator('.reference-module-card').first().evaluate(node => getComputedStyle(node).borderTopColor)).toBe('rgb(20, 93, 160)');
    await expect(page.getByRole('button',{name:/^(السابق|التالي)$/})).toHaveCount(0); await axe(page); await page.screenshot({path:`${root}/hub-${width}.png`,fullPage:true});
  }
  writeFileSync(`${root}/hub-measurements.json`,JSON.stringify(records,null,2));
  // A 200% desktop zoom can reduce the effective viewport to this size: allow natural vertical flow.
  await page.setViewportSize({width:960,height:455}); await page.goto('/content'); await expect(page.locator('.reference-module-card')).toHaveCount(4);
  const zoom = await measure(page); expect(zoom.scrollWidth).toBeLessThanOrEqual(zoom.width); await expect(page.getByRole('button',{name:/^(السابق|التالي)$/})).toHaveCount(0);
  await axe(page); await page.screenshot({path:`${root}/hub-effective-zoom-200.png`,fullPage:true});

});
test('guest and every assigned group have compact cards; path information opens accessibly and returns focus', async ({ page }) => {
  await page.setViewportSize({width:320,height:568}); await page.goto('/content'); await expect(page.locator('.reference-module-card')).toHaveCount(4); let data=await measure(page); expect(data.scrollHeight).toBeLessThanOrEqual(data.height+1); await axe(page); await page.screenshot({path:`${root}/hub-guest-320.png`,fullPage:true});
  await login(page);
  for (const g of ['g1','g2','g3','g4'] as const) {
    await seed(page,g); await page.goto('/content'); await expect(page.locator('.reference-module-card')).toHaveCount(4); data=await measure(page); expect(data.scrollHeight).toBeLessThanOrEqual(data.height+1);
    await page.getByRole('button',{name:'معلومات المسار',exact:true}).click(); await expect(page.getByRole('dialog')).toBeVisible(); await expect(page.getByRole('dialog').getByRole('link',{name:/التقويم القبلي/})).toBeVisible(); await axe(page); await page.keyboard.press('Escape'); await expect(page.getByRole('button',{name:'معلومات المسار',exact:true})).toBeFocused();
  }
});
test('six new lessons have objectives, three full stages, activity submission and local restoration; old drafts survive', async ({ page }) => {
  await login(page); const initial=courseScenario('g3'); initial.activityDrafts['cl-les-03-02']='مسودة سابقة قبل تغيير الترقيم';
  await page.evaluate(({key,state})=>localStorage.setItem(key,JSON.stringify(state)),{key:COURSE_STORAGE_KEY,state:initial}); await page.reload(); const legacy=await page.evaluate(()=>localStorage.getItem('edu-training-demo:v1'));
  for (const m of courseCatalog.modules.slice(2)) for (const l of m.lessons) {
    await page.goto(courseRoute(m.id,l.id,'objectives')); await expect(page.locator('.course-html .course-objective')).toHaveCount(3); await page.getByText('مصادر الدرس ومراجعة المحتوى',{exact:true}).click(); await expect(page.locator('.course-lesson-references a').first()).toBeVisible();
    await page.goto(courseRoute(m.id,l.id,'content')); await expect(page.locator('#course-stage option')).toHaveCount(3); await expect(page.locator('iframe')).toHaveCount(0);
    for (let i=0;i<3;i++) {await page.selectOption('#course-stage',String(i)); await expect(page.locator('.course-html')).toContainText(l.sections.content.stages![i]!.body.replace(/<[^>]+>/g,''));}
    await page.goto(courseRoute(m.id,l.id,'activity')); await expect(page.locator('.course-activity-main')).toContainText('معايير مراجعة إجابتك'); await page.locator('textarea').fill(`إجابة النشاط ${l.id}`); await page.getByRole('button',{name:'تسليم الإجابة',exact:true}).click(); await expect(page.getByRole('status').filter({hasText:'حُفظ تسليم النشاط'})).toBeVisible(); await page.reload(); await expect(page.locator('textarea')).toHaveValue(`إجابة النشاط ${l.id}`); await axe(page);
  }
  const stored=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!),COURSE_STORAGE_KEY); expect(stored.activitySubmissions).toHaveLength(6); expect(stored.activityDrafts['cl-les-03-02']).toBe(initial.activityDrafts['cl-les-03-02']); expect(await page.evaluate(()=>localStorage.getItem('edu-training-demo:v1'))).toBe(legacy);
  await page.setViewportSize({width:390,height:844}); await page.goto(courseRoute('cl-mod-quality','cl-les-quality-01','content')); await expect(page.locator('.course-html')).toBeVisible(); await page.screenshot({path:`${root}/new-content-phone.png`,fullPage:true});
});
