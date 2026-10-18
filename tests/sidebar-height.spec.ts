import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { login } from './phase3-support';
import { courseScenario } from '../src/course/scenarios';
import { COURSE_STORAGE_KEY } from '../src/course/store';
import { courseCatalog, courseRoute } from '../src/course/catalog';
const root='review/sidebar-height'; mkdirSync(root,{recursive:true});
async function prepare(page:Page) {
  await page.route('https://www.youtube-nocookie.com/**',r=>r.fulfill({status:200,contentType:'text/html',body:'<title>External playback not tested</title>'}));
  await login(page); await page.evaluate(({key,data})=>localStorage.setItem(key,JSON.stringify(data)),{key:COURSE_STORAGE_KEY,data:courseScenario('g2')}); await page.reload();
}
async function geometry(page:Page) {return page.evaluate(()=>{const rect=(s:string)=>{const r=document.querySelector(s)!.getBoundingClientRect();return {top:r.top+scrollY,bottom:r.bottom+scrollY,height:r.height};}; return {header:rect('.site-header'),sidebar:rect('.workspace-sidebar'),frame:rect('.content-frame'),workspace:rect('.reference-workspace'),footer:rect('.site-footer'),width:innerWidth,scrollWidth:document.documentElement.scrollWidth};});}
test('sidebar fills the framed workspace for every module at five desktop sizes',async({page})=>{
  await prepare(page); const records:unknown[]=[];
  for(const [width,height] of [[1920,910],[1366,768],[1280,620],[1024,768],[3840,2160]]) {
    await page.setViewportSize({width:width!,height:height!});
    for(const module of courseCatalog.modules) for(const path of [courseRoute(module.id),courseRoute(module.id,module.lessons[0]!.id,'objectives')]) {
      await page.goto(path); await expect(page.locator('.workspace-sidebar')).toBeVisible(); await expect(page.locator('.workspace-panel-header h1')).toBeVisible(); const g=await geometry(page); records.push({path,height,...g});
      expect(Math.abs(g.sidebar.top-g.frame.top-1),JSON.stringify(g)).toBeLessThanOrEqual(1); expect(Math.abs(g.sidebar.bottom-g.frame.bottom+1),JSON.stringify(g)).toBeLessThanOrEqual(1); expect(g.scrollWidth).toBeLessThanOrEqual(g.width);
    }
    await page.screenshot({path:`${root}/sidebar-${width}.png`,fullPage:true});
  }
  writeFileSync(`${root}/measurements.json`,JSON.stringify(records,null,2));
});
test('long content stretches the framed column and lesson selection still opens objectives',async({page})=>{
  await prepare(page); const module=courseCatalog.modules[0]!,lesson=module.lessons[0]!;
  await page.goto(courseRoute(module.id,lesson.id,'content')); await expect(page.locator('.course-stage-picker')).toBeVisible(); await page.getByText(/^كل الإرشادات/).click();
  const g=await geometry(page); expect(Math.abs(g.sidebar.bottom-g.frame.bottom+1)).toBeLessThanOrEqual(1);
  await page.locator('.site-footer').scrollIntoViewIfNeeded(); const after=await geometry(page); expect(Math.abs(after.sidebar.bottom-after.frame.bottom+1)).toBeLessThanOrEqual(1);
  const panelBottom=await page.locator('.workspace-panel').evaluate(el=>el.getBoundingClientRect().bottom+scrollY); expect(panelBottom).toBeLessThanOrEqual(after.footer.top+1);
  await page.evaluate(()=>scrollTo(0,0)); await page.screenshot({path:`${root}/long-content.png`,fullPage:true});
  await page.locator('.workspace-sidebar .workspace-lesson-toggle').filter({hasText:lesson.title}).click(); await expect(page).toHaveURL(courseRoute(module.id,lesson.id,'objectives'));
});
test('phone retains its drawer and navigation without horizontal overflow',async({page})=>{
  await page.setViewportSize({width:390,height:844}); await prepare(page); const module=courseCatalog.modules[1]!,lesson=module.lessons[0]!;
  await page.goto(courseRoute(module.id)); await expect(page.locator('.workspace-sidebar')).not.toBeVisible(); await page.getByRole('button',{name:'عرض قائمة الدروس',exact:true}).click();
  const drawer=page.getByRole('dialog',{name:'قائمة الدروس',exact:true}); await expect(drawer).toBeVisible(); await drawer.locator('.workspace-lesson-toggle').filter({hasText:lesson.title}).click();
  await expect(page).toHaveURL(courseRoute(module.id,lesson.id,'objectives')); await expect(drawer).not.toBeVisible(); await expect(page.locator('.course-objectives-card')).toBeVisible(); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true); await page.screenshot({path:`${root}/phone.png`,fullPage:true});
});
