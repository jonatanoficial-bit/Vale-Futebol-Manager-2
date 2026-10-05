import assert from 'node:assert/strict';
import { createCompetitionWorld } from '../js/systems/competitionWorldV2.js';
import { regulationForLeague, fixtureDates, resolveRelegationTable } from '../js/systems/regulationEngineV4.js';
import { ensureRivalCareer, simulateRivalMarketWeek, settleRivalSeason, rivalMarketBrief } from '../js/systems/rivalCareerV4.js';

const mls={id:'mls',name:'MLS',countryId:'usa',rules:{teams:30,format:'conferences-playoffs',relegation:0}};
const clubs=Array.from({length:30},(_,index)=>({id:`m${index}`,name:`Clube ${index}`,leagueId:'mls',countryId:'usa',rating:82-index/2,badge:''}));
const world=createCompetitionWorld({season:2026,leagues:[mls],clubs});
const state=world.leagues.mls;
assert.equal(state.regulation.system,'conferences');
assert.equal(state.fixtureDates[0].slice(0,10),'2026-02-21');
assert.equal(state.fixtureDates.length,36);
assert.ok(state.rounds.flat().filter(match=>match[0]===0||match[1]===0).length===34,'Cada clube MLS deve receber 34 partidas na fase regular.');
assert.ok(fixtureDates(regulationForLeague(mls,2026),36).some(date=>date.slice(0,10)==='2026-07-18'),'A agenda precisa retomar depois da pausa oficial da Copa.');

const colombia={id:'colombia-primera-a',name:'Colômbia',countryId:'colombia',rules:{teams:4,format:'apertura-finalizacion-quadrangular',relegation:2}};
const colProfile=regulationForLeague(colombia,2026);
assert.equal(colProfile.relegationMethod,'promedio');
assert.deepEqual(resolveRelegationTable([{id:'a',points:20,played:20,rating:70,gd:1},{id:'b',points:10,played:20,rating:70,gd:1},{id:'c',points:13,played:20,rating:70,gd:1},{id:'d',points:18,played:20,rating:70,gd:1}],colProfile),['b','c']);

const career={season:2026};const catalog={clubs:clubs.concat([{id:'other',name:'Outro',leagueId:'mls',countryId:'usa',rating:65}])};
ensureRivalCareer(career,catalog);assert.equal(Object.keys(career.rivalWorld.clubs).length,31);
const cycle=simulateRivalMarketWeek(career,catalog,6);assert.ok(cycle.moves.length>0,'Rivais precisam concluir transferências em janela.');
const settlement=settleRivalSeason(career,world,catalog);assert.ok(settlement.summaries.length>0);assert.ok(rivalMarketBrief(career).moves.length>0);
console.log('Fase 14 foundations: OK');
