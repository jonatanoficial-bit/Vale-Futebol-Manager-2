import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:1365,height:768}}),errors=[];
page.on('pageerror',error=>errors.push(String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('vale-futebol-manager-v16')).slots[0]);

try {
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').click(); await action('slot-new').click(); await action('select-world-club').first().click(); await action('club-next').click();
  await page.locator('#manager-name').fill('QA Fase 11'); await action('start-career').click();
  await action('skip-onboarding').waitFor({state:'visible'}); await action('skip-onboarding').click();
  let career=await read();
  assert.equal(career.schema,2000);
  assert.equal(career.worldState.version,'4.0.0');
  const league=career.worldState.leagues[career.club.leagueId];
  assert.ok(league.rounds.length>0&&league.rounds.every(round=>Array.isArray(round)),'A liga deve conter rodadas completas persistidas.');

  await nav('tactics');
  assert.equal(await page.locator('.tactical-roles select[data-action="tactical-role"]').count(),11);
  const firstRole=page.locator('.tactical-roles select[data-action="tactical-role"]').first();
  const choices=await firstRole.locator('option').count(); if(choices>1) await firstRole.selectOption({index:1});
  career=await read(); assert.ok(Object.keys(career.tacticalRoles).length>=11);

  await nav('squad'); await action('player-report').first().click();
  await page.locator('[data-action="make-promise"]').click();
  career=await read(); assert.equal(career.relations.promises.filter(item=>item.status==='active').length,1);
  await nav('more'); await nav('club');
  assert.match(await page.locator('.career-relations').innerText(),/Ambiente do clube|Vestiário/);

  await page.evaluate(async()=>{
    const store=JSON.parse(localStorage.getItem('vale-futebol-manager-v16')),career=store.slots[0],catalog=await fetch('./data/world-catalog-2026.json').then(response=>response.json());
    const team=catalog.nationalTeams.find(item=>item.rosterPath)||catalog.nationalTeams[0];
    const roster=Array.from({length:26},(_,index)=>({...career.roster[index%career.roster.length],id:'national-qa-'+index,name:'Internacional '+index,clubName:career.club.name}));
    career.national={team,roster,calledUpIds:roster.map(player=>player.id),lineupIds:roster.slice(0,11).map(player=>player.id),stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0},qualified:false,competitionLabel:'Teste internacional',fixtures:[]};
    localStorage.setItem('vale-futebol-manager-v16',JSON.stringify(store));
  });
  await page.reload({waitUntil:'domcontentloaded'}); await action('load-career').click(); await action('slot-load').click(); await nav('more'); await nav('national');
  assert.match(await page.locator('.national-roster').innerText(),/POOL NACIONAL|CONVOCAÇÃO EDITÁVEL/);
  await action('toggle-national-callup').first().click();
  career=await read(); assert.equal(career.national.calledUpIds.length,25);

  await page.setViewportSize({width:390,height:844}); await nav('tactics');
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'A tela tática não pode transbordar no celular.');
  await nav('more'); await nav('settings'); await action('restore-backup').click();
  await page.waitForFunction(()=>location.hash==='#/dashboard');
  assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',checks:['world rounds persisted','individual roles','career relations and promise','editable national call-up','mobile layout','backup recovery'],errors}));
} finally { await browser.close(); }
