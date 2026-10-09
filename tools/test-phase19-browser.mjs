import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',error=>errors.push(error.stack||String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();

try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').waitFor({state:'visible'});await action('new-career').click();await action('slot-new').click();
  await page.locator('[data-action="select-world-club"][data-key^="brasileirao-a:"]').first().click();await action('club-next').click();
  await page.locator('#manager-name').fill('QA Fase 19');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  await action('open-next-match').click();await page.locator('.world-match').waitFor({timeout:20000});
  assert.match(await page.locator('.stats-panel').innerText(),/Rival ·/,'A partida precisa exibir o plano persistente do técnico rival.');
  await page.locator('[data-action="match-speed"][data-speed="6"]').click();
  await page.waitForFunction(()=>Number(document.querySelector('.clock')?.textContent?.match(/\d+/)?.[0]||0)>=28,null,{timeout:7000});
  assert.match(await page.locator('.commentary-panel').innerText(),/IA:/,'A identidade do técnico rival precisa acionar a IA durante o jogo.');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'A partida móvel não pode transbordar horizontalmente.');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',checks:['perfil técnico rival','IA aos 28 minutos','partida móvel sem overflow'],errors}));
}finally{await browser.close();}
