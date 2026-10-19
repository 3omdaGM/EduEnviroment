import {test,expect} from '@playwright/test';
import study from '../src/course/study.json' with { type: 'json' };
test('production has the support-study identity and excludes both tools pages',async({page})=>{
 await page.goto('/');await expect(page.locator('.environment-name')).toHaveText(study.title);await expect(page.locator('.home-thesis-title')).toHaveText(study.title);await expect(page.locator('meta[name=description]')).toHaveAttribute('content',study.description);
 await page.goto('/content');await expect(page.locator('.reference-module-card')).toHaveCount(4);await expect(page.getByRole('link',{name:'أدوات العرض',exact:true})).toHaveCount(0);
 for(const path of ['/demo-tools','/legacy-demo-tools']){await page.goto(path);await expect(page.getByRole('heading',{name:'لم نعثر على هذه الصفحة',exact:true})).toBeVisible();}
});
