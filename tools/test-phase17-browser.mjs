import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}: {})});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',error=>errors.push(error.stack||String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();

try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').waitFor({state:'visible'});await action('new-career').click();await action('slot-new').click();
  await page.locator('[data-action="select-world-club"][data-key^="brasileirao-a:"]').first().click();await action('club-next').click();
  await page.locator('#manager-name').fill('QA Fase 17');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  await nav('more');await nav('market');await page.locator('.market-pressure-panel').waitFor({timeout:20000});await page.locator('.rival-market-panel').waitFor();
  assert.match(await page.locator('.market-pressure-panel').innerText(),/Risco de perder jogadores/);
  await page.locator('.market-card').first().waitFor({timeout:20000});await page.locator('.market-card [data-action="buy-player"]').first().click();
  await page.locator('.transfer-rival-interest').waitFor();assert.match(await page.locator('.transfer-rival-interest').innerText(),/Concorrência ativa/);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'O mercado aprimorado não pode causar overflow móvel.');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',checks:['pressão contratual','mercado rival','concorrência na proposta','mobile sem overflow'],errors}));
}finally{await browser.close();}
