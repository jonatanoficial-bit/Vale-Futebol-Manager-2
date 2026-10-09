import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];
page.on('pageerror',error=>errors.push(error.stack||String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('vale-futebol-manager-v16')).slots[0]);

try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').waitFor({state:'visible'});await action('new-career').click();await action('slot-new').click();
  await page.locator('[data-action="select-world-club"][data-key^="brasileirao-a:"]').first().click();await action('club-next').click();
  await page.locator('#manager-name').fill('QA Fase 20');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  await nav('more');await nav('market');await page.locator('.market-card [data-action="loan-player"]:not([disabled])').first().waitFor({timeout:20000});
  await page.locator('.market-card [data-action="loan-player"]:not([disabled])').first().click();await page.locator('#loan-duration').waitFor();
  await page.locator('#loan-duration').selectOption('360');await page.locator('#loan-wage-share').selectOption('50');await action('confirm-loan').click();
  await page.waitForFunction(()=>{const save=JSON.parse(localStorage.getItem('vale-futebol-manager-v16')||'{}');return Boolean(save.slots?.[0]?.roster?.some(player=>player.onLoan));},null,{timeout:5000});
  const career=await read(),loaned=career.roster.find(player=>player.onLoan);
  assert.ok(loaned,'O empréstimo precisa colocar o jogador no elenco.');
  assert.equal(loaned.loanWageShare,50);
  assert.ok(new Date(loaned.loanUntil)>new Date(career.date));
  assert.equal(career.rivalWorld.players[loaned.id].loanClubId,career.club.id,'O mundo rival precisa registrar o clube de destino.');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'O mercado com empréstimos não pode transbordar no celular.');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',checks:['proposta de empréstimo','prazo e salário negociáveis','estado persistente do rival','mobile sem overflow'],errors}));
}finally{await browser.close();}
