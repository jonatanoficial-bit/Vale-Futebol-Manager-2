import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',error=>errors.push(error.stack||String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();

try {
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').waitFor({state:'visible',timeout:5000});
  await action('new-career').click();await action('slot-new').click();await action('select-world-club').first().click();await action('club-next').click();
  await page.locator('#manager-name').fill('QA Fase 15');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  await page.locator('.home-match-card').waitFor();
  assert.equal(await page.locator('.home-shortcuts > button').count(),4,'A home precisa manter quatro atalhos claros.');
  assert.equal(await page.locator('.manager-scorecard').count(),0,'A home não deve repetir painéis de progressão.');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'A home móvel não pode transbordar.');
  await page.screenshot({path:'build/phase15-mobile-home.png',fullPage:true});
  await nav('more');await nav('competitions');await page.locator('.competition-console').waitFor();
  const competitionCrest=await page.locator('.competition-focus-title>.competition-logo').boundingBox(),competitionGlyph=await page.locator('.competition-focus-title>.competition-logo .competition-logo-image').boundingBox();assert.ok(competitionCrest?.width<=52&&competitionCrest?.height<=52&&competitionGlyph?.width<=30&&competitionGlyph?.height<=30,'O emblema da competição precisa permanecer compacto.');
  assert.ok(await page.locator('[data-action="competition-select"] option').count()>=1);
  await page.locator('[data-action="competition-tab"][data-tab="fixtures"]').click();await page.locator('.competition-fixtures').waitFor();
  await page.locator('[data-action="competition-tab"][data-tab="rules"]').click();await page.locator('.competition-rules-panel').waitFor();
  await page.locator('[data-action="competition-tab"][data-tab="overview"]').click();await page.locator('.competition-focus').waitFor();
  await page.screenshot({path:'build/phase15-mobile-competitions.png',fullPage:true});
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'A central de competições não pode transbordar no celular.');
  await page.setViewportSize({width:1365,height:768});await page.reload({waitUntil:'domcontentloaded'});await action('load-career').click();await action('slot-load').click();
  await page.locator('.home-match-card').waitFor();assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'A home não pode transbordar no desktop.');
  console.log(JSON.stringify({status:'ok',checks:['home simplificada','atalhos compactos','central de competições','abas de tabela/jogos/regras','mobile sem overflow'],errors}));
} finally { await browser.close(); }
