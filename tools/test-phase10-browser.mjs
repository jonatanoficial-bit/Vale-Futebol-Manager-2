import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdirSync} from 'node:fs';

const playwrightModule=await import(process.env.VFM_PLAYWRIGHT?pathToFileURL(process.env.VFM_PLAYWRIGHT).href:'playwright');
const {chromium}=playwrightModule.default||playwrightModule;
mkdirSync('.cache',{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.VFM_BROWSER?{executablePath:process.env.VFM_BROWSER}:{})});
const page=await browser.newPage({viewport:{width:1365,height:768}}),errors=[];
page.on('pageerror',error=>errors.push(String(error)));
const action=name=>page.locator('[data-action="'+name+'"]').first();
const nav=async screen=>page.locator('[data-action="navigate"][data-screen="'+screen+'"]').first().click();
const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('vale-futebol-manager-v16')).slots[0]);

try{
  await page.goto(process.env.VFM_TEST_URL||'http://127.0.0.1:8765/',{waitUntil:'domcontentloaded'});
  await action('new-career').click();await action('slot-new').click();await action('select-world-club').first().click();await action('club-next').click();await page.locator('#manager-name').fill('QA fase 10');await action('start-career').click();
  await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  await page.evaluate(async()=>{
    const store=JSON.parse(localStorage.getItem('vale-futebol-manager-v16')),career=store.slots[0],catalog=await fetch('./data/world-catalog-2026.json').then(response=>response.json());
    const team=catalog.nationalTeams.find(item=>item.rosterPath&&item.id!=='brazil')||catalog.nationalTeams.find(item=>item.rosterPath);
    const opponents=catalog.nationalTeams.filter(item=>item.id!==team.id).slice(0,4);
    const date=new Date(career.date);
    const stamp=days=>new Date(date.getTime()+days*86400000).toISOString();
    career.national={team,roster:career.roster.map(player=>({...player,clubName:career.club.name})),lineupIds:career.lineupIds.slice(),stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0},qualified:false,competitionLabel:'Teste internacional',fixtures:[
      {id:'qa-friendly',competitionId:'international-friendly',competitionName:'Amistoso internacional',type:'national',stage:'Data FIFA',round:1,date:stamp(-1),opponent:opponents[0],home:true,played:false,locked:false,score:null},
      {id:'qa-qualifier',competitionId:'world-cup-qualifiers',competitionName:'Eliminatórias da Copa do Mundo',type:'national',stage:'Fase classificatória',round:1,date:stamp(8),opponent:opponents[1],home:false,played:false,locked:false,score:null},
      {id:'qa-cup',competitionId:'continental-national-cup',competitionName:'Copa continental',type:'national',stage:'Fase de grupos',round:1,date:stamp(20),opponent:opponents[2],home:true,played:false,locked:true,score:null},
      {id:'qa-world',competitionId:'world-cup',competitionName:'Copa do Mundo',type:'national',stage:'Fase de grupos',round:1,date:stamp(30),opponent:opponents[3],home:true,played:false,locked:true,score:null}
    ]};
    career.trophies=[{id:'qa-trophy',competitionId:'brasileirao-a',competitionName:'Brasileirão Série A',label:'Campeão nacional',season:2025,club:{id:career.club.id,name:career.club.name,badge:career.club.badge},date:career.date,xp:1500,score:1200}];
    career.messages.push({id:'qa-message',from:'FIFA',subject:'Convocação confirmada',body:'A seleção entra em campo antes do próximo jogo do clube.',date:career.date,read:false,priority:'high'});
    localStorage.setItem('vale-futebol-manager-v16',JSON.stringify(store));
  });
  await page.reload({waitUntil:'domcontentloaded'});await action('load-career').click();await action('slot-load').click();
  assert.match(await page.locator('.career-command').innerText(),/Data FIFA|AMISTOSO/i);
  await action('open-next-match').click();await page.waitForFunction(()=>location.hash==='#/match');
  assert.match(await page.locator('body').innerText(),/Amistoso internacional/);
  await page.goBack();await page.waitForTimeout(250);await nav('more');await nav('national');
  assert.equal(await page.locator('.national-fixture-list article').count(),4);
  assert.equal(await page.locator('.national-table-stack .phase-table').count(),3);
  await nav('more');await nav('calendar');
  assert.equal(await page.locator('.calendar-next.is-national').count(),1);
  await nav('more');await nav('inbox');
  assert.equal(await page.locator('.mail-item.high-priority').count()>=1,true);
  await nav('more');await nav('club');
  assert.equal(await page.locator('.trophy-card').count(),1);
  assert.match(await page.locator('.trophy-room').innerText(),/Brasileirão Série A/);
  for(const [width,height] of [[390,844],[844,390]]){await page.setViewportSize({width,height});await nav('more');await nav('national');assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:'.cache/phase10-national-'+width+'.png',fullPage:true});}
  const saved=await read();
  await page.evaluate(()=>{const store=JSON.parse(localStorage.getItem('vale-futebol-manager-v16'));store.slots[0].schema=1604;store.slots[0].version='16.9.0-phase9';delete store.slots[0].trophies;localStorage.setItem('vale-futebol-manager-v16',JSON.stringify(store));});
  await page.reload({waitUntil:'domcontentloaded'});await action('load-career').click();await action('slot-load').click();const migrated=await read();
  assert.equal(migrated.schema,1800);assert.deepEqual(migrated.trophies,[]);assert.equal(migrated.national.team.id,saved.national.team.id);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',version:migrated.version,checks:['unified next match','national match routing','national calendar and tables','calendar synchronization','priority inbox','trophy room','mobile portrait and landscape','schema migration'],errors}));
}finally{await browser.close();}
