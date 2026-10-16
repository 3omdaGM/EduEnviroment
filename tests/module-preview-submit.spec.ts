import { test, expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';
import { fullCatalog as catalog } from '../src/data/assessments';
import { scenarioState } from '../src/demo/scenarios';
import { lessonRoute, reduceCommand } from '../src/domain/training';
import type { DemoState } from '../src/domain/models';
import { STORAGE_KEY } from '../src/services/demo-adapter';
import { stored } from './phase3-support';
const out = 'review/module-preview-submit';
let completed = scenarioState(catalog, 'completed');
for (const d of catalog.assessments) completed = reduceCommand(completed, catalog, { type: 'start-attempt', assessmentId: d.id }, '2026-10-16T00:00:00Z', `viewport-${d.id}`).state;
async function ready(page: Page, route: string) {
  await page.goto(route); await page.locator('main h1').waitFor({ state: 'attached' }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(180);
}
async function seed(page: Page, state: DemoState) { await ready(page, '/'); await page.evaluate(({key, state}) => localStorage.setItem(key, JSON.stringify(state)), { key: STORAGE_KEY, state }); }
async function metrics(page: Page) { return page.evaluate(() => ({ width: innerWidth, height: innerHeight, pageWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight, scrollY })); }
async function fits(page: Page) {
  await expect.poll(async () => { const m = await metrics(page); return m.pageHeight - m.height; }).toBeLessThanOrEqual(1);
  const m = await metrics(page); expect(m.pageWidth).toBeLessThanOrEqual(m.width); expect(m.scrollY).toBe(0); return m;
}
async function walk(region: Locator, visit: () => Promise<void>) {
  for (let i = 0; i < 30; i++) {
    await visit(); const next = region.locator(':scope > .fit-pagination').getByRole('button', { name: 'التالي', exact: true });
    if (!await next.count() || await next.isDisabled()) return;
    await next.click(); await region.page().waitForTimeout(60);
  }
  throw new Error('Pagination did not terminate');
}
for (const [width, height] of [[1920, 910], [1366, 768], [1280, 620], [768, 1024], [390, 844], [360, 640], [320, 740], [320, 568]]) test(`viewport ${width}x${height}: catalog, metadata, lesson sections`, async ({page}) => {
  await page.setViewportSize({width: width!, height: height!});
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  const rows = [];
  await ready(page, '/content');
  const before = await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY), names: string[] = [];
  const hub = page.getByRole('region', { name: 'الموديولات التدريبية', exact: true });
  await walk(hub, async () => { rows.push({route: '/content', ...await fits(page)}); names.push(await hub.innerText()); });
  for (const module of catalog.modules) expect(names.join(' ')).toContain(module.title);
  for (const section of ['intro', 'objectives', 'lessons']) {
    await ready(page, `/modules/mod-01/${section}`);
    const region = page.getByRole('region', { name: section === 'intro' ? 'نص المحتوى' : section === 'objectives' ? 'الأهداف' : 'دروس الموديول', exact: true });
    const seen: string[] = [];
    await walk(region, async () => { rows.push({route: `/modules/mod-01/${section}`, ...await fits(page)}); seen.push(await region.innerText()); });
    if (section === 'objectives') for (const goal of catalog.modules[0]!.objectives) expect(seen.join(' ')).toContain(goal);
    if (section === 'lessons') for (const id of catalog.modules[0]!.lessonIds) expect(seen.join(' ')).toContain(catalog.lessons.find(l => l.id === id)!.title);
  }
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe(before);
  await ready(page, '/modules/mod-01/lessons/les-01-01/intro'); await expect(page.getByRole('heading', {name: 'المحتوى مقفل', exact: true})).toBeVisible(); rows.push({route: 'visitor lesson lock', ...await fits(page)});
  await seed(page, completed);
  for (const suffix of ['elements', 'activity', 'self-assessment', 'elements/el-01-01-01']) {
    const route = `/modules/mod-01/lessons/les-01-01/${suffix}`; await ready(page, route);
    const region = page.getByRole('region', { name: suffix === 'elements' ? 'عناصر الدرس' : suffix.startsWith('elements/') ? 'نص المحتوى' : 'تعليمات التقويم', exact: true });
    const seen: string[] = [];
    await walk(region, async () => { rows.push({route, ...await fits(page)}); seen.push(await region.innerText()); });
    if (suffix === 'elements') for (const id of catalog.lessons[0]!.elementIds) expect(seen.join(' ')).toContain(catalog.elements.find(e => e.id === id)!.title);
    if (['elements', 'activity'].includes(suffix)) await page.screenshot({ path: `${out}/${width}x${height}-${suffix}.png`, animations: 'disabled' });
  }
  await ready(page, '/assessment/pre/instructions'); await walk(page.getByRole('region', {name: 'تعليمات التقويم', exact: true}), async () => { rows.push({route: '/assessment/pre/instructions', ...await fits(page)}); });
  await ready(page, '/content'); await page.screenshot({path: `${out}/${width}x${height}-content.png`, animations: 'disabled'});
  expect(errors).toEqual([]); await mkdir(out, {recursive: true}); await writeFile(`${out}/layout-${width}x${height}.json`, JSON.stringify(rows, null, 2));
});

test('public module metadata, lesson gates and gentle hover preserve progress', async ({page}) => {
  await ready(page, '/content'); const raw = await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY);
  const card = page.locator('.hub-module-card').first(); const color = await card.evaluate(e => getComputedStyle(e).backgroundColor);
  await card.hover(); await expect.poll(() => card.evaluate(e => getComputedStyle(e).backgroundColor)).not.toBe(color);
  await expect.poll(() => card.evaluate(e => getComputedStyle(e).boxShadow)).not.toBe('none');
  for (const m of catalog.modules) {
    for (const section of ['intro', 'objectives', 'lessons']) { await ready(page, `/modules/${m.id}/${section}`); await expect(page.getByRole('heading', {name: 'المحتوى مقفل', exact: true})).toHaveCount(0); }
    for (const id of m.lessonIds) { await ready(page, `${lessonRoute(m.id, id)}/intro`); await expect(page.getByRole('heading', {name: 'المحتوى مقفل', exact: true})).toBeVisible(); }
  }
  expect(await page.evaluate(key => localStorage.getItem(key), STORAGE_KEY)).toBe(raw);
  await seed(page, scenarioState(catalog, 'eligible-50')); await ready(page, '/modules/mod-01/lessons/les-01-01/intro'); await expect(page.getByRole('heading', {name: 'مقدمة الدرس', exact: true})).toBeVisible();
  await ready(page, '/modules/mod-02/lessons'); await expect(page.getByRole('region', {name: 'دروس الموديول', exact: true})).toBeVisible();
  await ready(page, '/modules/mod-02/lessons/les-02-01/intro'); await expect(page.getByRole('heading', {name: 'المحتوى مقفل', exact: true})).toBeVisible();
});

test('submit from any question requires five, confirms skipped questions and grades all twenty', async ({page}) => {
  await seed(page, scenarioState(catalog, 'before-pre')); await ready(page, '/assessment/pre/instructions'); await page.getByRole('button', {name:'بدء التقويم القبلي', exact:true}).click();
  const attempt = (await stored(page)).attempts[0]!, base = `/assessment/pre/attempt/${attempt.id}`;
  for (const id of attempt.questionIds.slice(1,5)) { const q = catalog.questions.find(q=>q.id===id)!; await ready(page, `${base}?question=${id}`); await page.locator(`input[value="${q.answerKey.correctOptionId}"]`).check(); }
  await page.getByRole('button', {name:'تسليم', exact:true}).click(); await expect(page.getByRole('button', {name:'تأكيد وتسليم المحاولة', exact:true})).toBeDisabled(); await expect(page.getByRole('alert')).toContainText('5');
  const q = catalog.questions.find(q=>q.id===attempt.questionIds[5])!; await ready(page,`${base}?question=${q.id}`); await page.locator(`input[value="${q.answerKey.correctOptionId}"]`).check();
  await page.getByRole('button',{name:'تسليم',exact:true}).click(); await expect(page.getByRole('alert')).toContainText('15');
  await page.getByRole('link',{name:'لا،العودة إلى المراجعة',exact:true}).click(); expect((await stored(page)).attempts[0]!.status).toBe('draft');
  await ready(page,`${base}/confirm`); await page.getByRole('button',{name:'تأكيد وتسليم المحاولة',exact:true}).click();
  await expect(page.locator('.score-display strong')).toHaveText('25.00%'); await expect(page.locator('.feedback-list')).toHaveCount(0);
  const result = await stored(page); expect(result.attempts[0]!.score).toEqual({earned:5,possible:20}); expect(result.attempts[0]!.answers[attempt.questionIds[0]!]).toBeUndefined(); expect(result.rewards).toHaveLength(0);
  await page.reload(); await expect(page.locator('.score-display strong')).toHaveText('25.00%');
});

for (const [width,height] of [[1366,768],[390,844],[360,640],[320,568]]) test(`all 76 question layouts and submit ${width}x${height}`, async ({page}) => {
  await page.setViewportSize({width:width!,height:height!}); await seed(page, completed); const rows=[];
  for (const d of catalog.assessments) {
    const scope=d.scope, lesson='lessonId' in scope?catalog.lessons.find(l=>l.id===scope.lessonId):undefined;
    const base=lesson?`${lessonRoute(lesson.moduleId,lesson.id)}/${scope.kind==='activity'?'activity':'self-assessment'}`:`/assessment/${scope.kind}`;
    for(const id of d.questionIds){ await ready(page,`${base}/attempt/viewport-${d.id}?question=${id}`); const q=catalog.questions.find(q=>q.id===id)!;
      await expect(page.getByRole('radio')).toHaveCount(q.type==='single-choice'?4:2); await expect(page.getByRole('button',{name:'تسليم',exact:true})).toBeVisible();
      const m=await fits(page); rows.push({id,...m});
      if(q.type==='single-choice'){const r=await page.locator('.answer-option').evaluateAll(nodes=>nodes.map(e=>({x:e.getBoundingClientRect().x,y:e.getBoundingClientRect().y})));expect(r[0]!.x).toBe(r[1]!.x);expect(r[0]!.x).toBeGreaterThan(r[2]!.x);expect(r[0]!.y).toBe(r[2]!.y);expect(r[1]!.y).toBe(r[3]!.y);}
      if(id==='pre-q-1')await page.screenshot({path:`${out}/${width}x${height}-quiz.png`,animations:'disabled'});
    }
  }
  await writeFile(`${out}/questions-${width}x${height}.json`,JSON.stringify(rows,null,2));
});

test('WCAG, touch, focus and viewport resizing', async ({browser}) => {
  const context=await browser.newContext({viewport:{width:360,height:640},hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();const violations=[];
  await ready(page,'/content'); await page.getByRole('button',{name:'تقدمك والتقويم',exact:true}).tap(); await expect(page.getByRole('dialog')).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('button',{name:'تقدمك والتقويم',exact:true})).toBeFocused();
  for(const route of ['/content','/modules/mod-01/objectives','/modules/mod-01/lessons/les-01-01/activity']){await ready(page,route);const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();violations.push(...r.violations.map(v=>({route,id:v.id,targets:v.nodes.map(n=>n.target)})));}
  await seed(page,completed);await ready(page,'/modules/mod-01/lessons/les-01-01/elements');await fits(page);await page.setViewportSize({width:1366,height:768});await fits(page);await page.setViewportSize({width:320,height:568});await fits(page);
  await page.getByRole('button',{name:'أقسام الدرس',exact:true}).tap();await expect(page.locator('.drawer-course-title')).toContainText(catalog.lessons[0]!.title);await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'أقسام الدرس',exact:true})).toBeFocused();
  await writeFile(`${out}/axe-results.json`,JSON.stringify({violations},null,2));expect(violations).toEqual([]);await context.close();
});

for (const [width,height] of [[1366,768],[360,640],[320,568]]) test(`all lesson sections and 58 reading parts ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width:width!,height:height!});await seed(page,completed);const rows: ({route:string}&Awaited<ReturnType<typeof metrics>>)[]=[];
  for(const lesson of catalog.lessons){
    const base=lessonRoute(lesson.moduleId,lesson.id);
    for(const suffix of ['intro','objectives','elements','activity','self-assessment']){
      await ready(page,`${base}/${suffix}`);const region=page.getByRole('region',{name:suffix==='intro'?'نص المحتوى':suffix==='objectives'?'الأهداف':suffix==='elements'?'عناصر الدرس':'تعليمات التقويم',exact:true});
      await walk(region,async()=>{rows.push({route:`${base}/${suffix}`,...await fits(page)});});
    }
    for(const id of lesson.elementIds){const e=catalog.elements.find(e=>e.id===id)!;
      for(const part of e.parts){const route=`${base}/elements/${id}?part=${part.id}`;await ready(page,route);const region=page.getByRole('region',{name:'نص المحتوى',exact:true}),seen:string[]=[];
        await walk(region,async()=>{rows.push({route,...await fits(page)});seen.push(await region.locator(':scope > .reading-text').innerText());});
        for(const node of part.nodes){const texts=node.kind==='paragraph'?[node.text]:node.kind==='list'?node.items:[];for(const text of texts)expect(seen.join(' ').replace(/\s+/g,' ')).toContain(text.replace(/\s+/g,' '));}
      }
    }
  }
  await writeFile(`${out}/reading-${width}x${height}.json`,JSON.stringify(rows,null,2));
});

test('post can score zero with five wrong answers; short self requires both and keeps rewards',async({page})=>{
  await seed(page,completed);await ready(page,'/assessment/post/instructions');await page.getByRole('button',{name:'استكمال المحاولة',exact:true}).click();
  const d=catalog.assessments.find(d=>d.id==='post')!,base='/assessment/post/attempt/viewport-post';
  for(const id of d.questionIds.slice(0,5)){const q=catalog.questions.find(q=>q.id===id)!;await ready(page,`${base}?question=${id}`);await page.locator(`input[value="${q.options.find(o=>o.id!==q.answerKey.correctOptionId)!.id}"]`).check();}
  await page.getByRole('button',{name:'تسليم',exact:true}).click();await expect(page.getByRole('alert')).toContainText('15');await page.getByRole('button',{name:'تأكيد وتسليم المحاولة',exact:true}).click();await expect(page.locator('.score-display strong')).toHaveText('0.00%');expect((await stored(page)).rewards.reduce((n,r)=>n+r.points,0)).toBe(470);await expect(page.locator('.feedback-list')).toHaveCount(0);
  await seed(page,completed);const self=catalog.assessments.find(d=>d.id==='self-les-01-01')!,sbase='/modules/mod-01/lessons/les-01-01/self-assessment/attempt/viewport-self-les-01-01';
  const q1=catalog.questions.find(q=>q.id===self.questionIds[0])!,q2=catalog.questions.find(q=>q.id===self.questionIds[1])!;
  await ready(page,`${sbase}?question=${q1.id}`);await page.locator(`input[value="${q1.answerKey.correctOptionId}"]`).check();await page.getByRole('button',{name:'تسليم',exact:true}).click();await expect(page.getByRole('button',{name:'تأكيد وتسليم المحاولة',exact:true})).toBeDisabled();await expect(page.getByRole('alert')).toContainText('2');
  await ready(page,`${sbase}?question=${q2.id}`);await page.locator(`input[value="${q2.options.find(o=>o.id!==q2.answerKey.correctOptionId)!.id}"]`).check();await page.getByRole('button',{name:'تسليم',exact:true}).click();await page.getByRole('button',{name:'تأكيد وتسليم المحاولة',exact:true}).click();await expect(page.locator('.score-display strong')).toHaveText('50.00%');expect((await stored(page)).rewards.reduce((n,r)=>n+r.points,0)).toBe(470);
});
