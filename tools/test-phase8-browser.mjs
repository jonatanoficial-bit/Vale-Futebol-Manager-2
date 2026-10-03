import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdirSync} from 'node:fs';
const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
mkdirSync('.cache',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:1365,height:768}}),errors=[];
page.on('pageerror',e=>errors.push(String(e)));
const action=(a)=>page.locator('[data-action="'+a+'"]');
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('vale-futebol-manager-v16')).slots[0]);
const nav=async screen=>{await page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();};
try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').click();await action('slot-new').first().click();await action('select-world-club').first().click();await action('club-next').click();await page.locator('#manager-name').fill('QA fase 8');await action('start-career').click();
  await action('skip-onboarding').first().waitFor({state:'visible'});await action('skip-onboarding').first().click();
  await nav('more');await nav('club');await page.locator('.facility-cards').waitFor();
  assert.equal(await page.locator('.facility-card').count(),6);
  const before=await read();await page.locator('[data-action="upgrade-facility"][data-facility="training"]').first().click();await action('confirm-facility').click();
  const after=await read();assert.equal(after.construction.length,1);assert.equal(after.facilities.training,2);assert.ok(after.budget<before.budget);
  await page.screenshot({path:'.cache/phase8-club-desktop.png'});
  await nav('squad');await action('player-report').first().click();await action('renew-player').click();await action('confirm-renewal').click();
  const renewed=await read();assert.ok(renewed.ledger.some(item=>item.label.includes('Luvas de renovação')));
  await action('player-report').first().click();await action('sale-player').click();await action('accept-sale').click();
  assert.equal((await read()).roster.length,before.roster.length-1);
  await nav('more');await nav('market');await page.waitForFunction(()=>document.querySelectorAll('.market-card').length>0);
  assert.ok(await page.locator('.market-card').count()>0);await page.locator('[data-action="market-budget"]').selectOption('affordable');
  await action('buy-player').first().click();await page.locator('#neg-signing').fill('-100');const cash=(await read()).budget;await action('confirm-transfer').click();assert.equal((await read()).budget,cash);await action('close-modal').first().click();
  for(const [width,height] of [[390,844],[844,390]]){
    await page.setViewportSize({width,height});await nav('more');await nav('club');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:'.cache/phase8-club-'+width+'.png'});
    await page.locator('.facility-copy').first().scrollIntoViewIfNeeded();await page.screenshot({path:'.cache/phase8-campus-'+width+'.png'});
    await nav('more');await nav('market');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
  // Save reload retains projects, offers and the accounting cursor.
  const saved=await read();await page.reload({waitUntil:'domcontentloaded'});await action('load-career').click();await action('slot-load').first().click();const loaded=await read();
  assert.equal(loaded.budget,saved.budget);assert.deepEqual(loaded.construction,saved.construction);assert.deepEqual(loaded.economy,saved.economy);assert.equal(loaded.schema,1605);assert.deepEqual(errors,[]);
  await page.evaluate(()=>{const store=JSON.parse(localStorage.getItem('vale-futebol-manager-v16')),c=store.slots[0];c.schema=1602;c.version='16.7.0-phase7';delete c.economy;delete c.construction;delete c.transferOffers;c.roster[0].onLoan=true;c.roster[0].loanUntil='2027-01-01';c.roster[0].purchaseOption=1000000;localStorage.setItem('vale-futebol-manager-v16',JSON.stringify(store));});
  await page.reload({waitUntil:'domcontentloaded'});await action('load-career').click();await action('slot-load').first().click();const migrated=await read();assert.equal(migrated.budget,saved.budget);assert.equal(migrated.economy.history.length,0);assert.equal(migrated.roster[0].onLoan,true);assert.equal(migrated.roster[0].purchaseOption,1000000);
  console.log(JSON.stringify({status:'ok',version:loaded.version,checks:['construction UI','renew contract','sell player','market filtering','negative amount rejected','save reload','desktop','mobile portrait','mobile landscape'],errors}));
}finally{await browser.close();}

