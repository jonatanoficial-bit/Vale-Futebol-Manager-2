import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}: {})});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',error=>errors.push(error.stack||String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('vale-futebol-manager-v16')).slots[0]);

try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').waitFor({state:'visible'});await action('new-career').click();await action('slot-new').click();
  const brazilian=page.locator('[data-action="select-world-club"][data-key^="brasileirao-a:"]').first();
  await brazilian.waitFor({state:'visible'});await brazilian.click();await action('club-next').click();
  await page.locator('#manager-name').fill('QA Fase 16');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  const career=await read(),cup=career.fixtures.filter(fixture=>fixture.competitionId==='domestic-cup');
  assert.equal(career.date.slice(0,10),'2026-01-28');
  assert.equal(career.worldState.leagues['brasileirao-a'].fixtureDates.at(-1).slice(0,10),'2026-12-02');
  assert.equal(cup[0].stage,'5ª Fase');assert.equal(cup[0].date.slice(0,10),'2026-04-22');assert.equal(cup.at(-1).date.slice(0,10),'2026-12-06');
  await nav('more');await nav('competitions');await page.locator('.competition-console').waitFor();
  await page.locator('[data-action="competition-tab"][data-tab="rules"]').click();
  const rules=await page.locator('.competition-rules-panel').innerText();assert.match(rules,/2026-01-28/);assert.match(rules,/2026-12-02/);
  await page.locator('[data-action="competition-select"]').selectOption('domestic-cup');await page.locator('[data-action="competition-tab"][data-tab="rules"]').click();
  assert.match(await page.locator('.competition-rules-panel').innerText(),/126 clubes|9 fases|5ª–8ª/i);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'A experiência brasileira não pode causar overflow móvel.');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',checks:['calendário Série A','Copa do Brasil 2026','regulamento na central','mobile sem overflow'],errors}));
}finally{await browser.close();}
