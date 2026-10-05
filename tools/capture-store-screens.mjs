import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
mkdirSync('assets/store',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();
try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').click();await action('slot-new').click();await action('select-world-club').first().click();await action('club-next').click();await page.locator('#manager-name').fill('Diretor VFM');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  await page.screenshot({path:'assets/store/screenshot-dashboard.jpg',type:'jpeg',quality:82});
  await nav('tactics');await page.screenshot({path:'assets/store/screenshot-tactics.jpg',type:'jpeg',quality:82});
  await nav('more');await nav('market');await page.locator('.market-scout-network').waitFor();await page.screenshot({path:'assets/store/screenshot-market.jpg',type:'jpeg',quality:82});
  await nav('more');await nav('calendar');await page.screenshot({path:'assets/store/screenshot-calendar.jpg',type:'jpeg',quality:82});
  console.log('Store screenshots: OK');
}finally{await browser.close();}
