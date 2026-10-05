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
  await action('new-career').click();await action('slot-new').click();await action('select-world-club').first().click();await action('club-next').click();await page.locator('#manager-name').fill('QA Fase 13');await action('start-career').click();await action('skip-onboarding').waitFor({state:'visible'});await action('skip-onboarding').click();
  let career=await read();assert.equal(career.schema,1900);assert.equal(career.worldState.version,'3.0.0');assert.ok(Object.keys(career.worldState.tournaments.domestic).length>0);assert.ok(Object.keys(career.worldState.tournaments.continental).length>0);
  await nav('more');await nav('competitions');await page.locator('.world-tournaments').waitFor();assert.ok(await page.locator('.world-tournament-card').count()>3);
  await page.evaluate(async()=>{
    const store=JSON.parse(localStorage.getItem('vale-futebol-manager-v16')),career=store.slots[0],catalog=await fetch('./data/world-catalog-2026.json').then(response=>response.json());
    const team=catalog.nationalTeams.find(item=>item.rosterPath&&item.id!=='brazil')||catalog.nationalTeams.find(item=>item.rosterPath),opponents=catalog.nationalTeams.filter(item=>item.id!==team.id);
    const roster=career.roster.concat(career.roster.slice(0,4).map((player,index)=>({...player,id:'qa-extra-'+index,name:'Observado '+index,marketRegion:index%2?'europe':'domestic'})));
    career.national={team,roster,selectionPoolIds:roster.map(player=>player.id),calledUpIds:roster.slice(0,26).map(player=>player.id),lineupIds:roster.slice(0,11).map(player=>player.id),stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0},qualified:false,competitionLabel:'Ciclo internacional',fixtures:[{id:'qa-friendly',competitionId:'international-friendly',competitionName:'Amistoso internacional',type:'national',stage:'Data FIFA',round:1,date:new Date(Date.now()+86400000).toISOString(),opponent:opponents[0],home:true,played:false,locked:false,score:null}]};
    localStorage.setItem('vale-futebol-manager-v16',JSON.stringify(store));
  });
  await page.reload({waitUntil:'domcontentloaded'});await action('load-career').click();await action('slot-load').click();await nav('more');await nav('national');await page.locator('.national-intelligence').waitFor();
  await action('national-scout').first().click();await action('national-callup-form').click();career=await read();assert.ok(career.national.selectionIntelligence?.observations);assert.ok(career.national.calledUpIds.length>=23);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
  console.log(JSON.stringify({status:'ok',checks:['persistent global cups','continental qualifications','mobile tournament view','national observations','form call-up'],errors}));
} finally { await browser.close(); }
