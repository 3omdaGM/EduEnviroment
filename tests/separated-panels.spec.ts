import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
import {login} from './phase3-support';
import {courseScenario} from '../src/course/scenarios';
import {COURSE_STORAGE_KEY} from '../src/course/store';
import {courseCatalog,courseRoute} from '../src/course/catalog';
const root='review/separated-panels';mkdirSync(root,{recursive:true});
async function prepare(page:Page){
 await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<title>External playback not tested</title>'}));
 await login(page);await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:COURSE_STORAGE_KEY,data:courseScenario('g2')});await page.reload();
}
async function visit(page:Page,path:string){await page.goto(path,{waitUntil:'domcontentloaded'});await expect(page.locator('main h1')).toBeAttached();await page.evaluate(()=>document.fonts.ready);await page.locator('main img').evaluateAll(nodes=>Promise.all(nodes.map(n=>(n as HTMLImageElement).decode().catch(()=>{}))));const pause=page.getByRole('button',{name:'إيقاف التبديل',exact:true});if(await pause.isVisible())await pause.click();await page.evaluate(()=>scrollTo(0,0));}
async function geometry(page:Page){return page.evaluate(()=>{
 const rect=(s:string)=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return{top:r.top+scrollY,bottom:r.bottom+scrollY,left:r.left,right:r.right,height:r.height};};
 const frame=rect('.content-frame')!,header=rect('.site-header')!,footer=rect('.site-footer')!,w=document.documentElement.clientWidth;
 return{width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,frame,header,footer,sidebar:rect('.workspace-sidebar'),panel:rect('.workspace-panel'),panelStyles:[...document.querySelectorAll('.reference-workspace > .workspace-sidebar, .reference-workspace > .workspace-panel')].map(e=>{const s=getComputedStyle(e);return{border:s.borderInlineEndWidth,radius:s.borderTopRightRadius};}),gaps:{top:frame.top-header.bottom,bottom:footer.top-frame.bottom,left:frame.left,right:w-frame.right},radius:getComputedStyle(document.querySelector('.content-frame')!).borderTopRightRadius};
});}
const m=courseCatalog.modules[0]!,l=m.lessons[3]!;
const paths=['/','/goals','/guide','/content','/contact','/login','/learning-style','/demo-tools','/assessment/pre/instructions',...courseCatalog.modules.map(m=>courseRoute(m.id)),...['objectives','content','activity'].map(s=>courseRoute(m.id,l.id,s))];
for(const [width,height] of [[1920,910],[1536,728],[1366,768],[1280,620],[768,1024],[390,844],[320,568],[960,455]])test(`separated panels and equal outer gutters at ${width}×${height}`,async({page})=>{
 await page.setViewportSize({width:width!,height:height!});await prepare(page);const before=await page.evaluate(()=>({...localStorage})),records:unknown[]=[];
 for(const path of paths){await visit(page,path);const g=await geometry(page);records.push({path,...g});
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
test('long content remains inside the frame and mobile drawer still opens objectives',async({page})=>{
 await prepare(page);await visit(page,courseRoute(m.id,l.id,'content'));await page.getByText(/^كل الإرشادات/).click();await page.locator('.site-footer').scrollIntoViewIfNeeded();const g=await geometry(page);expect(Math.abs(g.sidebar!.bottom-g.frame.bottom)).toBeLessThanOrEqual(1);expect(g.frame.bottom).toBeLessThan(g.footer.top);
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${root}/expanded-support.png`,fullPage:true});
 await page.setViewportSize({width:390,height:844});await visit(page,courseRoute(m.id));await page.getByRole('button',{name:'عرض قائمة الدروس',exact:true}).click();const drawer=page.getByRole('dialog',{name:'قائمة الدروس',exact:true});await expect(drawer).toBeVisible();await drawer.getByRole('button',{name:`الدرس ${l.order}: ${l.title}`,exact:true}).click();await expect(page).toHaveURL(courseRoute(m.id,l.id,'objectives'));await expect(drawer).not.toBeVisible();await expect(page.locator('.course-objectives-card')).toBeVisible();await page.screenshot({path:`${root}/phone-objectives.png`,fullPage:true});
});

test('demo controls still require confirmation after removing the legacy link',async({page})=>{
 await prepare(page);await visit(page,'/demo-tools');const saved=await page.evaluate(()=>({...localStorage}));
 await page.getByRole('button',{name:/^المجموعة الأولى/}).click();await expect(page.getByText('هل تؤكد استبدال بيانات CourseLab المحلية الحالية؟',{exact:true})).toBeVisible();await page.getByRole('button',{name:'إلغاء',exact:true}).click();await expect(page.locator('.course-demo-confirm')).toHaveCount(0);expect(await page.evaluate(()=>({...localStorage}))).toEqual(saved);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`${root}/demo-tools.png`,fullPage:true});
});
