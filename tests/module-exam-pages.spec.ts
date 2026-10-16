import {test,expect}from'@playwright/test';
import {mkdir,writeFile}from'node:fs/promises';
import {fullCatalog as catalog}from'../src/data/assessments';
import {scenarioState}from'../src/demo/scenarios';
import {reduceCommand}from'../src/domain/training';
import {STORAGE_KEY}from'../src/services/demo-adapter';
const out='review/module-preview-submit';
let state=scenarioState(catalog,'completed');
state=reduceCommand(state,catalog,{type:'start-attempt',assessmentId:'pre'},'2026-10-16T00:00:00Z','exam-pre').state;
for(const id of catalog.assessments.find(d=>d.id==='pre')!.questionIds.slice(0,5)){const q=catalog.questions.find(q=>q.id===id)!;state=reduceCommand(state,catalog,{type:'answer',attemptId:'exam-pre',questionId:id,optionId:q.answerKey.correctOptionId},'2026-10-16T00:00:00Z','unused').state;}
const draft=structuredClone(state);state=reduceCommand(state,catalog,{type:'submit',attemptId:'exam-pre'},'2026-10-16T00:00:00Z','unused').state;
state=reduceCommand(state,catalog,{type:'start-attempt',assessmentId:'post'},'2026-10-16T00:00:00Z','exam-post').state;
for(const id of catalog.assessments.find(d=>d.id==='post')!.questionIds.slice(0,5)){const q=catalog.questions.find(q=>q.id===id)!;state=reduceCommand(state,catalog,{type:'answer',attemptId:'exam-post',questionId:id,optionId:q.options.find(o=>o.id!==q.answerKey.correctOptionId)!.id},'2026-10-16T00:00:00Z','unused').state;}
state=reduceCommand(state,catalog,{type:'submit',attemptId:'exam-post'},'2026-10-16T00:00:00Z','unused').state;
for(const[width,height]of[[1366,768],[390,844],[360,640],[320,568]])test(`exam review, confirmation, results and feedback ${width}x${height}`,async({page})=>{
  await page.setViewportSize({width:width!,height:height!});const rows:unknown[]=[];
  async function ready(route:string,value=state){await page.goto('/');await page.locator('main h1').waitFor({state:'attached'});await page.evaluate(({key,value})=>localStorage.setItem(key,JSON.stringify(value)),{key:STORAGE_KEY,value});await page.goto(route);await page.locator('main h1').waitFor({state:'attached'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);}
  async function fit(route:string){await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollHeight-innerHeight)).toBeLessThanOrEqual(1);const m=await page.evaluate(()=>({width:innerWidth,height:innerHeight,pageWidth:document.documentElement.scrollWidth,pageHeight:document.documentElement.scrollHeight}));expect(m.pageWidth).toBeLessThanOrEqual(width!);rows.push({route,...m});}
  for(const stage of['review','confirm']){const route=`/assessment/pre/attempt/exam-pre/${stage}`;await ready(route,draft);await fit(route);if(stage==='confirm')await expect(page.getByRole('alert')).toContainText('15');}
  const lesson=catalog.lessons[0]!,base=`/modules/${lesson.moduleId}/lessons/${lesson.id}`;
  const routes=['/assessment/pre/attempt/exam-pre/result','/assessment/post/attempt/exam-post/result',`${base}/activity/attempt/${state.attempts.find(a=>a.assessmentId===lesson.activityAssessmentId&&a.status==='submitted')!.id}/result`,`${base}/self-assessment/attempt/${state.attempts.find(a=>a.assessmentId===lesson.selfAssessmentId&&a.status==='submitted')!.id}/result`];
  for(const route of routes){await ready(route);if(width!<=360 && route===routes[0]){const menu=page.getByRole('button',{name:'قائمة التنقل الرئيسية',exact:true});await menu.click();const dialog=page.getByRole('dialog');await expect.poll(()=>dialog.evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);await expect(dialog.getByRole('button',{name:'خروج تجريبي',exact:true})).toBeVisible();await page.keyboard.press('Escape');await expect(menu).toBeFocused();}const region=page.getByRole('region',{name:'تفاصيل النتيجة',exact:true});await expect(page.locator('.score-display strong')).toBeVisible();
    for(let i=0;i<10;i++){await fit(route);const next=region.getByRole('button',{name:'التالي',exact:true});if(!await next.count()||await next.isDisabled())break;await next.click();}
    if(route.includes('self-assessment')){await page.getByRole('button',{name:'مراجعة التصحيح',exact:true}).click();const dialog=page.getByRole('dialog'),feedback=dialog.getByRole('region',{name:'التغذية الراجعة التعليمية',exact:true});const seen=[];
      for(let i=0;i<12;i++){await expect.poll(()=>dialog.evaluate(e=>e.scrollHeight-e.clientHeight)).toBeLessThanOrEqual(1);seen.push(await feedback.innerText());const next=feedback.locator(':scope > .fit-pagination').getByRole('button',{name:'التالي',exact:true});if(!await next.count()||await next.isDisabled())break;await next.click();}
      for(const id of catalog.assessments.find(d=>d.id===lesson.selfAssessmentId)!.questionIds){const q=catalog.questions.find(q=>q.id===id)!;expect(seen.join(' ')).toContain(q.prompt);expect(seen.join(' ')).toContain(q.answerKey.rationale);}
      await page.keyboard.press('Escape');await expect(page.getByRole('button',{name:'مراجعة التصحيح',exact:true})).toBeFocused();
    }
    if(route.includes('/assessment/pre/')) { await page.reload(); await page.locator('.score-display strong').waitFor(); await fit(route); await page.screenshot({path:`${out}/${width}x${height}-pre-result.png`,animations:'disabled'}); }
  }
  await mkdir(out,{recursive:true});await writeFile(`${out}/exam-stages-${width}x${height}.json`,JSON.stringify(rows,null,2));
});
