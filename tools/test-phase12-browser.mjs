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

try {
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').click();await action('slot-new').click();await action('select-world-club').first().click();await action('club-next').click();await page.locator('#manager-name').fill('QA Fase 12');await action('start-career').click();
  await action('onboarding-next').waitFor({state:'visible'});assert.equal(await action('onboarding-next').isDisabled(),true);
  await nav('squad');assert.equal(await action('onboarding-next').isDisabled(),false);await action('skip-onboarding').click();
  let career=await read();assert.equal(career.schema,1900);assert.ok(career.scoutingNetwork?.regions?.europe>=48);
  const cup=career.fixtures.filter(item=>item.type==='cup'),continental=career.fixtures.filter(item=>item.type==='continental');
  assert.ok(cup.some(item=>item.twoLegged),'A copa precisa manter chaves de ida e volta quando a regra exige.');
  if(continental.length)assert.equal(continental.filter(item=>item.phase==='group').length,6,'O clube classificado precisa disputar seis jogos na fase de grupos continental.');

  await nav('more');await nav('market');await page.locator('.market-scout-network').waitFor();
  await page.locator('[data-action="invest-scout"][data-region="europe"]').click();career=await read();assert.equal(career.scoutingNetwork.focus,'europe');
  await nav('more');await nav('competitions');assert.match(await page.locator('.rules-strip').innerText(),/ida e volta|jogo único/i);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'A Fase 12 não pode transbordar em tela móvel.');

  await page.goto((process.env.VFM_TEST_URL||'http://127.0.0.1:8765/')+'loja.html',{waitUntil:'domcontentloaded'});
  assert.match(await page.locator('h1').innerText(),/O clube é seu/);assert.equal(await page.locator('.feature').count(),3);
  assert.deepEqual(errors,[]);console.log(JSON.stringify({status:'ok',checks:['tutorial by action','cup regulations','continental group home-away','regional scouting','mobile layout','store page'],errors}));
} finally { await browser.close(); }
