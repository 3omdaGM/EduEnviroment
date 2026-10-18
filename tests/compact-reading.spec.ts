import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { login } from './phase3-support';
import { courseScenario } from '../src/course/scenarios';
import { COURSE_STORAGE_KEY, freshCourse, reduceCourse } from '../src/course/store';
import AxeBuilder from '@axe-core/playwright';
import { courseCatalog, courseRoute } from '../src/course/catalog';
const root='review/compact-reading'; mkdirSync(root,{recursive:true});
const baseline=Boolean(process.env.LAYOUT_REVIEW_BASELINE);
function saveMeasurements(file:string,records:unknown[]) {writeFileSync(file,'[\n'+records.map(r=>JSON.stringify(r)).join(',\n')+'\n]\n');}
async function prepare(page:Page) {
 await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<title>External playback not tested</title>'}));
 await login(page); await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:COURSE_STORAGE_KEY,data:courseScenario('g2')}); await page.reload();
}
async function visit(page:Page,path:string) {
 await page.goto(path,{waitUntil:'domcontentloaded'}); await expect(page.locator('main h1')).toBeAttached(); await page.evaluate(()=>document.fonts.ready);
 await page.locator('main img').evaluateAll(images=>Promise.all(images.map(n=>(n as HTMLImageElement).decode().catch(()=>{}))));
 const pause=page.getByRole('button',{name:'إيقاف التبديل',exact:true}); if(await pause.isVisible()) await pause.click();
 await page.evaluate(()=>scrollTo(0,0));
 await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
}
async function measure(page:Page) {return page.evaluate(()=>{
 const rect=(s:string)=>{const el=document.querySelector(s);if(!el)return null;const r=el.getBoundingClientRect();return {top:r.top+scrollY,bottom:r.bottom+scrollY,height:r.height};};
 return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,header:rect('.site-header'),footer:rect('.site-footer'),sidebar:rect('.workspace-sidebar'),frame:rect('.content-frame'),panel:rect('.workspace-panel'),media:rect('.course-video-card iframe')};
});}
const sizes=baseline?[[1920,910],[1366,768],[1280,620],[390,844]]:[[1920,910],[1536,728],[1366,768],[1280,620],[1024,768],[768,1024],[390,844],[320,568],[960,455],[3840,2160]];
for(const [width,height] of sizes) test(`page layout at ${width}×${height}`,async({page})=>{
 await prepare(page); const saved=await page.evaluate(()=>({...localStorage}));
 const paths=['/','/goals','/guide','/contact','/content','/login','/demo-tools','/learning-style','/assessment/pre/instructions','/assessment/post/instructions',...courseCatalog.modules.flatMap(m=>[courseRoute(m.id),...m.lessons.flatMap(l=>['objectives','content','activity'].map(s=>courseRoute(m.id,l.id,s)))])];
 const records:unknown[]=[];
 {
  await page.setViewportSize({width:width!,height:height!});
  for(const path of paths) {
   await visit(page,path); const g=await measure(page); records.push({path,...g}); saveMeasurements(`${root}/${baseline?'before':'after'}-measurements-${width}.json`,records);
   expect(g.scrollWidth,JSON.stringify({path,...g})).toBeLessThanOrEqual(g.width);
   if(g.sidebar && width!>900) {expect(Math.abs(g.sidebar.top-g.frame!.top-1)).toBeLessThanOrEqual(1);expect(Math.abs(g.sidebar.bottom-g.frame!.bottom+1)).toBeLessThanOrEqual(1);expect(g.panel!.bottom).toBeLessThanOrEqual(g.footer!.top+1);}
   if(!path.startsWith('/assessment/')) await expect(page.getByRole('button',{name:/^(السابق|التالي)$/})).toHaveCount(0);
  }
  await visit(page,courseRoute('cl-mod-03','cl-les-03-03','content')); await page.screenshot({path:`${root}/${baseline?'before':'after'}-content-${width}.png`,fullPage:true});
 }
 saveMeasurements(`${root}/${baseline?'before':'after'}-measurements-${width}.json`,records);
 expect(await page.evaluate(()=>({...localStorage}))).toEqual(saved);
});

test('all 73 content stages retain their text and media on desktop and phone',async({page})=>{
 await prepare(page); let checked=0;
 for(const width of [1366,390]) {
  await page.setViewportSize({width,height:width===390?844:768});
  for(const m of courseCatalog.modules) for(const l of m.lessons) {
   await visit(page,courseRoute(m.id,l.id,'content'));
   const stages=l.sections.content.stages??(l.sections.content.content??'').split(/(?=<h4>)/).filter(v=>v.trim()).map(raw=>({body:raw.replace(/^\s*<h4>[\s\S]*?<\/h4>/,'')}));
   for(let i=0;i<stages.length;i++) {
    await page.selectOption('#course-stage',String(i));
    expect(await page.locator('.course-html').evaluate((node,raw)=>{
     const body=new DOMParser().parseFromString(raw,'text/html').body;body.querySelectorAll('obj').forEach(o=>o.prepend(o.getAttribute('n')??''));return node.textContent!.replace(/\s/g,'')===body.textContent!.replace(/\s/g,'');
    },stages[i]!.body)).toBe(true);
    for(const image of await page.locator('.course-image img').all()) {await expect(image).toBeVisible();await expect.poll(()=>image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);}
    for(const frame of await page.locator('iframe').all()) {await expect(frame).toHaveAttribute('allowfullscreen','');const r=await frame.boundingBox();expect(r!.width).toBeGreaterThan(200);expect(r!.height).toBeGreaterThan(100);}
    expect((await measure(page)).scrollWidth).toBeLessThanOrEqual(width);checked++;
   }
  }
 }
 expect(checked).toBe(146);
 await page.goto(courseRoute('cl-mod-04','cl-les-04-03','content'));await page.getByRole('button',{name:/تكبير:/}).click();await expect(page.getByRole('dialog',{name:'تكبير الصورة التوضيحية'})).toBeVisible();await page.keyboard.press('Escape');
});

test('expanded support, activity save and phone lesson selection stay usable',async({page})=>{
 await prepare(page);const m=courseCatalog.modules[0]!,l=m.lessons[2]!;
 await visit(page,courseRoute(m.id,l.id,'activity'));await page.locator('textarea').fill('إجابة نشاط محفوظة بعد ضغط التخطيط');await page.reload();await expect(page.locator('textarea')).toHaveValue('إجابة نشاط محفوظة بعد ضغط التخطيط');
 await page.getByRole('button',{name:'تسليم الإجابة',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'حُفظ تسليم النشاط'})).toBeVisible();await page.getByText(/^كل الإرشادات/).click();
 await page.locator('.site-footer').scrollIntoViewIfNeeded();const g=await measure(page);expect(g.panel!.bottom).toBeLessThanOrEqual(g.footer!.top+1);expect(Math.abs(g.sidebar!.bottom-g.frame!.bottom+1)).toBeLessThanOrEqual(1);
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${root}/expanded-activity-desktop.png`,fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.goto(courseRoute(m.id));await page.getByRole('button',{name:'عرض قائمة الدروس',exact:true}).click();const dialog=page.getByRole('dialog',{name:'قائمة الدروس',exact:true});await dialog.getByRole('button',{name:`الدرس ${l.order}: ${l.title}`,exact:true}).click();await expect(page).toHaveURL(courseRoute(m.id,l.id,'objectives'));await expect(dialog).not.toBeVisible();
 const flex=courseScenario('g3');await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:COURSE_STORAGE_KEY,data:flex});await page.reload();await visit(page,courseRoute(m.id,l.id,'activity'));await expect(page.locator('.course-support-message')).toHaveCount(0);await page.getByRole('button',{name:'عرض الدعم',exact:true}).click();await expect(page.locator('.course-support-message')).toBeVisible();await page.screenshot({path:`${root}/activity-phone.png`,fullPage:true});
});


test('exam controls and drawing remain usable on phone and desktop',async({page})=>{
 await prepare(page);await page.setViewportSize({width:390,height:844});await visit(page,'/assessment/post/instructions');await page.getByRole('button',{name:'بدء التقويم البعدي',exact:true}).click();
 for(let i=0;i<5;i++) {await expect(page.locator('.answer-options label')).toHaveCount(4);await page.locator('input[type=radio]').first().check();if(i<4)await page.getByRole('button',{name:'التالي',exact:true}).click();}
 await expect(page.getByRole('button',{name:'السابق',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'تسليم',exact:true})).toBeVisible();await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${root}/exam-phone.png`,fullPage:true});
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations.map(v=>v.id)).toEqual([]);
 await page.getByRole('button',{name:'تسليم',exact:true}).click();await expect(page.getByRole('alert')).toContainText('155');await page.getByRole('button',{name:'نعم، سلّم المحاولة'}).click();await expect(page).toHaveURL(/result$/);
 let state=freshCourse();const now=Date.now();const start=reduceCourse(state,{type:'start-exam',kind:'pre'},true,now,'layout-pre');state=start.state;state=reduceCourse(state,{type:'submit-exam',id:start.id!},true,now,'layout-submit').state;
 await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:COURSE_STORAGE_KEY,data:state});await page.reload();await visit(page,'/learning-style');await page.getByRole('button',{name:'بدء اختبار أسلوب التعلم',exact:true}).click();
 for(const [width,height] of [[1366,768],[390,844],[320,568]]) {await page.setViewportSize({width:width!,height:height!});const canvas=page.getByLabel('مساحة رسم حدود الشكل داخل الشكل المعقد',{exact:true});await expect(canvas).toBeVisible();const r=await canvas.boundingBox();expect(r!.width).toBeGreaterThan(220);expect(r!.height).toBeGreaterThan(180);expect((await measure(page)).scrollWidth).toBeLessThanOrEqual(width!);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${root}/drawing-${width}.png`,fullPage:true});}
});

test('image pages are measured after their artwork has decoded',async({page})=>{
 await prepare(page);const records:unknown[]=[];
 for(const [width,height] of sizes) {
  await page.setViewportSize({width:width!,height:height!});
  for(const lessonId of ['cl-les-04-02','cl-les-04-03']) {
   const path=courseRoute('cl-mod-04',lessonId,'content');await visit(page,path);const g=await measure(page);records.push({path,...g});
   expect(g.scrollWidth).toBeLessThanOrEqual(width!);for(const image of await page.locator('.course-image img').all()) expect(await image.evaluate(n=>(n as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
   if([1920,1536,1366,3840].includes(width!))expect(g.scrollHeight).toBeLessThanOrEqual(height!+1);
  }
 }
 saveMeasurements(`${root}/loaded-image-measurements.json`,records);
});
