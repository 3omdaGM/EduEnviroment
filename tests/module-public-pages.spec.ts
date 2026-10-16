import {test,expect} from '@playwright/test';
import {mkdir,writeFile}from'node:fs/promises';
import {people,guideSteps}from'../src/data/catalog';
const out='review/module-preview-submit';
for(const[width,height]of[[1920,910],[1366,768],[1280,620],[768,1024],[390,844],[360,640],[320,740],[320,568]])test(`public pages ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width:width!,height:height!});const rows=[];
  for(const route of ['/','/guide','/goals','/contact','/login','/register','/recover']){
    await page.goto(route);await page.locator('main h1').waitFor({state:'attached'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
    await expect(page.getByRole('heading',{name:'تعذر عرض الصفحة',exact:true})).toHaveCount(0);
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)).toBeLessThanOrEqual(1);
    const m=await page.evaluate(()=>({height:innerHeight,width:innerWidth,pageHeight:document.documentElement.scrollHeight,pageWidth:document.documentElement.scrollWidth}));expect(m.pageWidth).toBeLessThanOrEqual(width!);rows.push({route,...m});
    if(route==='/'){
      const region=page.getByRole('region',{name:'أعضاء الإشراف',exact:true}),seen=[];
      for(let i=0;i<10;i++){seen.push(await region.innerText());const next=region.getByRole('button',{name:'التالي',exact:true});if(!await next.count()||await next.isDisabled())break;await next.click();await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)).toBeLessThanOrEqual(1);}
      for(const p of people.slice(1))expect(seen.join(' ')).toContain(p.displayName);
    }
    if(route==='/guide'){
      for(let i=1;i<=guideSteps.length;i++){await page.goto(`/guide?step=${i}`);await expect(page.locator('.guide-body > p:last-child')).toHaveText(guideSteps[i-1]!.text);await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)).toBeLessThanOrEqual(1);}
    }
    if(['/', '/register'].includes(route))await page.screenshot({path:`${out}/${width}x${height}-${route==='/'?'home':'register'}.png`,animations:'disabled'});
  }
  await mkdir(out,{recursive:true});await writeFile(`${out}/public-${width}x${height}.json`,JSON.stringify(rows,null,2));
});
