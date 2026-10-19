import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {login} from './phase3-support';
import {courseScenario} from '../src/course/scenarios';
import {COURSE_STORAGE_KEY} from '../src/course/store';
import {courseCatalog,courseRoute,groups} from '../src/course/catalog';
import study from '../src/course/study.json' with { type: 'json' };
import {embeddedFigures} from '../src/course/embedded-figures';
import {scenarioState} from '../src/demo/scenarios';
import {fullCatalog} from '../src/data/assessments';
const root='review/styles-support';mkdirSync(root,{recursive:true});
async function prepare(page:Page){
 await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<title>External playback not tested</title>'}));
 await login(page);await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:COURSE_STORAGE_KEY,data:courseScenario('g2')});await page.reload();
}
async function visit(page:Page,path:string){await page.goto(path,{waitUntil:'domcontentloaded'});await expect(page.locator('main h1')).toBeAttached();await page.evaluate(()=>document.fonts.ready);await page.locator('main img').evaluateAll(nodes=>Promise.all(nodes.map(n=>(n as HTMLImageElement).decode().catch(()=>{}))));const pause=page.getByRole('button',{name:'إيقاف التبديل',exact:true});if(await pause.isVisible())await pause.click();await page.evaluate(()=>scrollTo(0,0));await page.mouse.move(0,0);}
async function geometry(page:Page){return page.evaluate(()=>{
 const rect=(s:string)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{top:r.top+scrollY,bottom:r.bottom+scrollY,left:r.left,right:r.right,height:r.height};};
 const frame=rect('.content-frame')!,header=rect('.site-header')!,footer=rect('.site-footer')!,w=document.documentElement.clientWidth;
 return{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,frame,header,footer,sidebar:rect('.workspace-sidebar'),panel:rect('.workspace-panel'),panelStyles:[...document.querySelectorAll('.reference-workspace > .workspace-sidebar, .reference-workspace > .workspace-panel')].map(e=>{const s=getComputedStyle(e);return{border:s.borderInlineEndWidth,radius:s.borderTopRightRadius};}),gaps:{top:frame.top-header.bottom,bottom:footer.top-frame.bottom,left:frame.left,right:w-frame.right},radius:getComputedStyle(document.querySelector('.content-frame')!).borderTopRightRadius};
});}
const m=courseCatalog.modules[0]!,l=m.lessons[3]!;
const paths=['/','/goals','/guide','/content','/contact','/login','/learning-style','/demo-tools','/assessment/pre/instructions',...courseCatalog.modules.map(m=>courseRoute(m.id)),...['objectives','content','activity'].map(s=>courseRoute(m.id,l.id,s))];
for(const [width,height] of [[1920,910],[1536,728],[1366,768],[1280,620],[768,1024],[390,844],[320,568],[960,455]])test(`support-study identity and balanced layout at ${width}×${height}`,async({page})=>{
 await page.setViewportSize({width:width!,height:height!});await prepare(page);const before=await page.evaluate(()=>({...localStorage})),records:unknown[]=[];
 for(const path of paths){await visit(page,path);await expect(page.locator('.environment-name')).toHaveText(study.title);await expect(page).toHaveTitle(`${study.title} | جامعة الزقازيق`);const g=await geometry(page);
  if(courseCatalog.modules.some(m=>courseRoute(m.id)===path)){const module=courseCatalog.modules.find(m=>courseRoute(m.id)===path)!;await expect(page.locator('.workspace-panel-header h1')).toHaveText(`أهداف الموديول — الموديول ${module.order}`);await expect(page.locator('.course-module-objectives li p')).toHaveText(module.objectives);await expect(page.locator('.workspace-lesson-cards')).toHaveCount(0);}
  if(path==='/'){expect(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor)).toBe('rgb(204, 222, 239)');await expect(page.locator('.person-card')).toHaveCount(4);for(const card of await page.locator('.person-card').all()){const colors=await card.evaluate(e=>{const s=getComputedStyle(e);return {bg:s.backgroundColor,border:s.borderInlineEndColor};});expect(colors.bg).not.toBe('rgb(255, 255, 255)');expect(colors.border).toBe('rgb(99, 139, 176)');}await page.screenshot({path:`${root}/home-${width}.png`,fullPage:true});}records.push({path,...g});
  for(const gap of Object.values(g.gaps)){expect(gap,JSON.stringify({path,...g})).toBeGreaterThanOrEqual(7);expect(Math.abs(gap-g.gaps.top),JSON.stringify({path,...g})).toBeLessThanOrEqual(1);}
  expect(parseFloat(g.radius)).toBeGreaterThanOrEqual(14);expect(g.scrollWidth).toBeLessThanOrEqual(g.width);
  if(path.startsWith('/course/')&&width!>900){expect(g.sidebar!.left-g.panel!.right).toBeGreaterThanOrEqual(8);for(const style of g.panelStyles){expect(style.border).toBe('1px');expect(parseFloat(style.radius)).toBeGreaterThanOrEqual(14);}expect(Math.abs(g.sidebar!.top-g.frame.top)).toBeLessThanOrEqual(1);expect(Math.abs(g.sidebar!.bottom-g.frame.bottom)).toBeLessThanOrEqual(1);}
  if(path==='/demo-tools'){await expect(page.getByRole('link',{name:'أدوات النسخة السابقة',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:/^المجموعة/})).toHaveCount(4);}
  if([1920,1536,1366].includes(width!))expect(g.scrollHeight,JSON.stringify({path,...g})).toBeLessThanOrEqual(height!+1);
  await expect(page.getByRole('button',{name:/^(السابق|التالي)$/})).toHaveCount(0);
 }
 writeFileSync(`${root}/measurements-${width}.json`,'[\n'+records.map(r=>JSON.stringify(r)).join(',\n')+'\n]\n');
 await visit(page,courseRoute(m.id,l.id,'content'));await page.screenshot({path:`${root}/content-${width}.png`,fullPage:true});
 expect(await page.evaluate(()=>({...localStorage}))).toEqual(before);
});

test('support identity and four-group explanations preserve archived progress and do not expose game rewards',async({page})=>{
 await prepare(page);const archive=scenarioState(fullCatalog,'completed');archive.learner.active=false;archive.announcedRewardIds=[];
 await page.evaluate(data=>localStorage.setItem('edu-training-demo:v1',JSON.stringify(data)),archive);await page.goto('/login');await page.getByLabel('الرمز التجريبي المعلن — DEMO',{exact:true}).fill('DEMO');await page.getByRole('button',{name:'تجربة بحساب تجريبي',exact:true}).click();await expect(page).toHaveURL('/content');await expect(page.locator('.celebration')).toHaveCount(0);
 const saved=await page.evaluate(()=>({...localStorage}));await visit(page,'/');await expect(page.locator('.home-thesis-title')).toHaveText(study.title);await expect(page.locator('.environment-name')).not.toContainText('محفزات');await expect(page.locator('.celebration,.journey-meta')).toHaveCount(0);
 await visit(page,'/content');const g=groups.g2;await expect(page.locator('.course-hub-status')).toContainText(`${g.label} · ${g.styleLabel} · ${g.supportLabel}`);
 await page.getByRole('button',{name:'معلومات المسار',exact:true}).click();const dialog=page.getByRole('dialog',{name:'معلومات المسار التدريبي',exact:true});await expect(dialog.locator('.support-study-groups li')).toHaveCount(4);await expect(dialog.locator('.support-study-groups .is-selected')).toContainText('المجموعة الثانية — مجموعتك');
 for(const text of [study.styleExplanation,study.fixedExplanation,study.flexExplanation,study.timingExplanation])await expect(dialog.getByText(text,{exact:true})).toBeVisible();
 const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
 await page.screenshot({path:`${root}/group-explanation.png`,fullPage:true});await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'معلومات المسار',exact:true})).toBeFocused();
 await visit(page,'/guide?step=5');await expect(page.locator('.guide-body')).toContainText('أربع مجموعات');await visit(page,'/guide?step=6');await expect(page.locator('.guide-body')).toContainText('يفتح أهدافه مباشرة');
 expect(await page.evaluate(()=>({...localStorage}))).toEqual(saved);
});
for(const mobile of [false,true])test(`all four assignments retain their classification and fixed/flexible support (${mobile?'phone':'desktop'})`,async({page})=>{
 if(mobile)await page.setViewportSize({width:390,height:844});await prepare(page);
 for(const id of ['g1','g2','g3','g4'] as const){
  const data=courseScenario(id),g=groups[id];await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:COURSE_STORAGE_KEY,data});await page.reload();const saved=await page.evaluate(()=>({...localStorage}));
  await visit(page,'/content');await expect(page.locator('.course-hub-status')).toContainText(g.styleLabel);await expect(page.locator('.course-hub-status')).toContainText(g.supportLabel);
  await page.locator('.reference-module-card').first().click();if(mobile)await page.getByRole('button',{name:'عرض قائمة الدروس',exact:true}).click();const nav=mobile?page.getByRole('dialog',{name:'قائمة الدروس',exact:true}):page.locator('.workspace-sidebar');
  await expect(nav.locator('.course-group-label')).toHaveText(`${g.label} · ${g.styleLabel} · ${g.supportLabel}`);await nav.locator('.workspace-lesson-toggle').first().click();await expect(page).toHaveURL(courseRoute(m.id,m.lessons[0]!.id,'objectives'));
  await visit(page,courseRoute(m.id,m.lessons[0]!.id,'content'));
  if(g.support==='fixed'){await expect(page.locator('.course-support-message')).toBeVisible();await expect(page.getByRole('button',{name:'عرض الدعم',exact:true})).toHaveCount(0);}
  else{await expect(page.locator('.course-support-message')).toHaveCount(0);await page.getByRole('button',{name:'عرض الدعم',exact:true}).click();await expect(page.locator('.course-support-message')).toBeVisible();await page.getByRole('button',{name:'إخفاء الدعم',exact:true}).click();await expect(page.locator('.course-support-message')).toHaveCount(0);}
  await page.screenshot({path:`${root}/${id}-${mobile?'phone':'desktop'}.png`,fullPage:true});expect(await page.evaluate(()=>({...localStorage}))).toEqual(saved);
 }
});
test('empty pre leads to style instructions, 25 actual drawings allocate g1 and survive reload',async({page})=>{
 await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<title>External playback not tested</title>'}));
 await login(page);await page.goto('/assessment/pre/instructions');await page.getByRole('button',{name:'بدء التقويم القبلي',exact:true}).click();await page.getByRole('button',{name:'تسليم',exact:true}).click();await expect(page.getByRole('alert')).toContainText('160');await page.getByRole('button',{name:'نعم، سلّم المحاولة',exact:true}).click();await page.getByRole('link',{name:'اختبار أسلوب التعلم',exact:true}).last().click();
 await expect(page.locator('.assessment-instructions > p').filter({hasText:study.styleExplanation})).toBeVisible();await page.getByRole('button',{name:'عن الاختبار والمجموعات',exact:true}).click();await expect(page.getByRole('dialog').locator('.support-study-groups li')).toHaveCount(4);await page.keyboard.press('Escape');
 const a=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(a.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);await page.screenshot({path:`${root}/style-instructions.png`,fullPage:true});
 await page.getByRole('button',{name:'بدء اختبار أسلوب التعلم',exact:true}).click();const deadline=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).styleAttempts[0].deadline,COURSE_STORAGE_KEY);await page.reload();expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).styleAttempts[0].deadline,COURSE_STORAGE_KEY)).toBe(deadline);
 for(let i=0;i<25;i++){
  if(i===7||i===16)await page.getByRole('button',{name:'بدء القسم',exact:true}).click();const canvas=page.getByLabel('مساحة رسم حدود الشكل داخل الشكل المعقد',{exact:true});await canvas.scrollIntoViewIfNeeded();const b=(await canvas.boundingBox())!;const points=i<12?embeddedFigures[i]!.ans:[{x:.01,y:.01},{x:.03,y:.03},{x:.03,y:.01}];
  await page.mouse.move(b.x+points[0]!.x*b.width,b.y+points[0]!.y*b.height);await page.mouse.down();for(let j=1;j<=points.length;j++){const p=points[j%points.length]!;await page.mouse.move(b.x+p.x*b.width,b.y+p.y*b.height,{steps:6});}await page.mouse.up();await page.getByRole('button',{name:'تأكيد الإجابة',exact:true}).click();await page.getByRole('button',{name:i===24?'إظهار النتيجة وتحديد المجموعة':'السؤال التالي',exact:true}).click();
 }
 expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)!).assignment,COURSE_STORAGE_KEY)).toMatchObject({group:'g1',score:5});await expect(page.getByText(study.fixedExplanation,{exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:'نتيجة أسلوب التعلم والمجموعة',exact:true})).toBeVisible();await page.goto('/content');await expect(page.locator('.course-hub-status')).toContainText('معتمد على المجال · الدعم الثابت');
});
