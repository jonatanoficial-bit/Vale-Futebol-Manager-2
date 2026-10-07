import assert from 'node:assert/strict';
import { createCompetitionWorld } from '../js/systems/competitionWorldV2.js';
import { regulationForLeague, fixtureDates } from '../js/systems/regulationEngineV4.js';
import { buildDomesticCupPath, domesticCupFormat } from '../js/systems/competitionFormatsV3.js';
import { buildWorldTournaments } from '../js/systems/worldTournamentV3.js';

const serieA={id:'brasileirao-a',name:'Brasileirão Série A',countryId:'brazil',rules:{teams:20,format:'double-round-robin',relegation:4}};
const serieB={id:'brasileirao-b',name:'Brasileirão Série B',countryId:'brazil',rules:{teams:20,format:'double-round-robin',promotionDirect:2,promotionPlayoff:[3,6],relegation:4}};

const profileA=regulationForLeague(serieA,2026),profileB=regulationForLeague(serieB,2026);
assert.equal(profileA.calendar.start,'2026-01-28');
assert.equal(profileA.calendar.regularEnd,'2026-12-02');
assert.equal(fixtureDates(profileA,38).at(-1).slice(0,10),'2026-12-02');
assert.equal(profileB.calendar.start,'2026-03-21');
assert.equal(profileB.calendar.regularEnd,'2026-11-14');
assert.equal(profileB.calendar.end,'2026-11-28');
assert.deepEqual(profileB.calendar.playoffs.map(item=>item[0]),['2026-11-21','2026-11-28']);
assert.equal(fixtureDates(profileB,38).at(-1).slice(0,10),'2026-11-14');

const clubs=Array.from({length:40},(_,index)=>({id:`br-${index}`,name:`Clube Brasil ${index}`,leagueId:index<20?'brasileirao-a':'brasileirao-b',countryId:'brazil',country:'Brasil',rating:85-index/2,badge:''}));
const path=buildDomesticCupPath({club:clubs[0],participants:clubs,startDate:'2026-01-28T16:00:00.000Z',competitionId:'copa-do-brasil',competitionName:'Copa do Brasil'});
assert.equal(domesticCupFormat('brazil').stages.length,9);
assert.equal(path.fixtures.length,9);
assert.equal(path.fixtures[0].stage,'5ª Fase');
assert.equal(path.fixtures[0].date.slice(0,10),'2026-04-22');
assert.equal(path.fixtures[0].legs,2);
assert.equal(path.fixtures.at(-1).stage,'Final');
assert.equal(path.fixtures.at(-1).legs,1);
assert.equal(path.fixtures.at(-1).date.slice(0,10),'2026-12-06');

const brazilWorld=buildWorldTournaments({season:2026,leagues:[serieA,serieB],clubs});
const cup=brazilWorld.domestic['cup-brazil'];
assert.ok(cup,'A Copa nacional brasileira precisa existir no mundo persistente.');
assert.equal(cup.rounds.at(-1).legs,1);
assert.equal(cup.rounds.find(round=>round.ties.length===16)?.legs,2);
assert.equal(cup.rounds.find(round=>round.ties.length===32)?.legs,1);

const world=createCompetitionWorld({season:2026,leagues:[serieA,serieB],clubs,managedClub:clubs[0]});
assert.equal(world.leagues['brasileirao-a'].fixtureDates[0].slice(0,10),'2026-01-28');
assert.equal(world.leagues['brasileirao-b'].fixtureDates.at(-1).slice(0,10),'2026-11-14');
console.log('Fase 16 foundations: OK');
