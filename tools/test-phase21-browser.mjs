import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',error=>errors.push(error.stack||String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();

try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').click();await action('slot-new').click();await page.locator('[data-action="select-world-club"][data-key^="brasileirao-a:"]').first().click();await action('club-next').click();await page.locator('#manager-name').fill('QA Fase 21');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  await nav('more');await nav('market');const negotiate=page.locator('.market-card [data-action="buy-player"]').first();await negotiate.waitFor({timeout:20000});await negotiate.click();await action('confirm-transfer').click();
  await page.locator('.transfer-talks-panel').waitFor({timeout:5000});const career=await page.evaluate(()=>JSON.parse(localStorage.getItem('vale-futebol-manager-v16')).slots[0]);
  assert.equal(career.transferTalks[0].status,'pending');assert.ok(career.transferTalks[0].responseAt);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'A mesa não pode transbordar no celular.');assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',checks:['proposta pendente','prazo persistente','mesa de negociação mobile'],errors}));
}finally{await browser.close();}
