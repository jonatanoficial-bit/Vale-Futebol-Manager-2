import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdirSync} from 'node:fs';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
mkdirSync('.cache',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:1365,height:768}}),errors=[];
page.on('pageerror',error=>errors.push(String(error)));
const action=name=>page.locator('[data-action="'+name+'"]');
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('vale-futebol-manager-v16')).slots[0]);
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();

try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').click();await action('slot-new').first().click();await action('select-world-club').first().click();await action('club-next').click();await page.locator('#manager-name').fill('QA fase 9');await action('start-career').click();
  await action('skip-onboarding').first().waitFor({state:'visible'});await action('skip-onboarding').first().click();
  await nav('more');await nav('club');await page.locator('.phase9-campus').waitFor();
  assert.equal(await page.locator('.facility-card').count(),6);
  assert.equal(await page.locator('.facility-art img').count(),6);
  await page.waitForFunction(()=>[...document.querySelectorAll('.facility-art img')].every(image=>image.complete&&image.naturalWidth>=900));
  assert.equal(await page.locator('.manager-career-panel').count(),1);
  await page.screenshot({path:'.cache/phase9-club-desktop.png',fullPage:true});

  await page.evaluate(async()=>{
    const store=JSON.parse(localStorage.getItem('vale-futebol-manager-v16')),career=store.slots[0],catalog=await fetch('./data/world-catalog-2026.json').then(response=>response.json());
    const target=catalog.clubs.find(club=>club.rosterPath&&club.id!==career.club.id);
    career.managerCareer={...career.managerCareer,status:'unemployed',clubId:null,clubName:null,dismissedAt:career.date,previousClub:{...career.club},history:[...(career.managerCareer?.history||[]),{type:'dismissed',date:career.date,season:career.season,label:'Contrato encerrado pelo '+career.club.name}]};
    career.jobOffers=[{...target,careerOffer:{salary:180000,years:2,confidence:62,objective:'Construir uma campanha competitiva',offeredAt:career.date,expiresWeek:career.week+5}}];
    localStorage.setItem('vale-futebol-manager-v16',JSON.stringify(store));
  });
  await page.reload({waitUntil:'domcontentloaded'});await action('load-career').click();await action('slot-load').first().click();await nav('more');await nav('club');
  assert.equal(await page.locator('.career-job-card').count(),1);
  assert.match(await page.locator('.manager-career-panel').innerText(),/Disponível no mercado/);
  assert.equal(await page.locator('.world-nav-btn.locked').count(),3);
  await page.screenshot({path:'.cache/phase9-unemployed-desktop.png',fullPage:true});

  const offeredClub=await page.locator('.career-job-card h3').innerText();
  await action('accept-club-job').click();await page.waitForTimeout(2500);
  const identity=await page.locator('.club-identity strong').innerText();
  if(identity==='Disponível no mercado')console.log(JSON.stringify({appointmentDebug:{toast:await page.locator('.toast').allTextContents(),errors,career:(await read()).managerCareer,offer:(await read()).jobOffers?.[0]?.name}}));
  assert.notEqual(identity,'Disponível no mercado');
  const appointed=await read();assert.equal(appointed.managerCareer.status,'employed');assert.equal(appointed.club.name,offeredClub);assert.equal(appointed.board,68);

  for(const [width,height] of [[390,844],[844,390]]){
    await page.setViewportSize({width,height});await nav('more');await nav('club');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.locator('.phase9-campus').scrollIntoViewIfNeeded();
    await page.screenshot({path:'.cache/phase9-club-'+width+'.png'});
  }

  const saved=await read();
  await page.evaluate(()=>{const store=JSON.parse(localStorage.getItem('vale-futebol-manager-v16')),career=store.slots[0];career.schema=1603;career.version='16.8.0-phase8';delete career.managerCareer;localStorage.setItem('vale-futebol-manager-v16',JSON.stringify(store));});
  await page.reload({waitUntil:'domcontentloaded'});await action('load-career').click();await action('slot-load').first().click();const migrated=await read();
  assert.equal(migrated.schema,1604);assert.equal(migrated.managerCareer.status,'employed');assert.equal(migrated.budget,saved.budget);assert.deepEqual(migrated.construction,saved.construction);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',version:migrated.version,checks:['six facility images','career status','unemployed UI','job appointment','save migration','mobile portrait','mobile landscape'],errors}));
}finally{await browser.close();}
