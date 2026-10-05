import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',error=>errors.push(String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('vale-futebol-manager-v16')).slots[0]);
try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').click();await action('slot-new').click();await page.locator('[data-action="select-world-club"][data-key="mls:inter-miami"]').count().then(async count=>{if(count)await page.locator('[data-action="select-world-club"][data-key="mls:inter-miami"]').click();else await action('select-world-club').first().click();});await action('club-next').click();await page.locator('#manager-name').fill('QA Fase 14');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  const career=await read();assert.equal(career.schema,2000);assert.equal(career.worldState.version,'4.0.0');assert.ok(career.rivalWorld?.clubs);const mls=career.worldState.leagues.mls;if(mls){assert.equal(mls.fixtureDates[0].slice(0,10),'2026-02-21');assert.equal(mls.rounds.flat().filter(match=>match[0]===0||match[1]===0).length,34);}
  await nav('more');await nav('competitions');assert.match(await page.locator('.rules-strip').innerText(),/Calendário|Pausa|rodadas/i);
  await nav('more');await nav('market');await page.locator('.rival-market-panel').waitFor();assert.match(await page.locator('.rival-market-panel').innerText(),/Clubes também planejam/i);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',checks:['regulation calendar','MLS 34 matches','save migration','rival market panel','mobile layout'],errors}));
}finally{await browser.close();}
