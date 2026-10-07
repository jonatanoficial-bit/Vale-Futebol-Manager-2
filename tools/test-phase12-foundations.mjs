import assert from 'node:assert/strict';
import { buildDomesticCupPath, buildContinentalPath, groupProgress, tieOutcome } from '../js/systems/competitionFormatsV3.js';
import { ensureMarketIntelligence, hydrateMarketProfile, marketNegotiationProfile, scoutInvestment, applyContractMatchBonuses } from '../js/systems/marketIntelligenceV3.js';
import { createMatchEngineV2, advanceMatchEngineV2 } from '../js/systems/matchEngineV2.js';

const club={id:'club-a',countryId:'brazil',leagueId:'brasileirao-a',confederation:'CONMEBOL',rating:75};
const teams=[club,...Array.from({length:15},(_,index)=>({id:'club-'+index,name:'Clube '+index,rating:60+index,badge:''}))];
const cup=buildDomesticCupPath({club,participants:teams,startDate:'2026-04-01T12:00:00Z',competitionName:'Copa do Brasil'});
assert.equal(cup.fixtures.length,9,'Série A deve entrar na 5ª fase da Copa do Brasil de 2026');
assert.equal(cup.fixtures[0].stage,'5ª Fase');
assert.ok(cup.fixtures.slice(0,-1).every(fixture=>fixture.tieId&&fixture.legs===2));
assert.equal(cup.fixtures.at(-1).legs,1,'A final da Copa do Brasil de 2026 é em jogo único');

const continental=buildContinentalPath({club,startDate:'2026-04-01T12:00:00Z',competitionId:'libertadores',competitionName:'Libertadores',candidates:teams});
assert.equal(continental.fixtures.filter(fixture=>fixture.phase==='group').length,6,'Grupo continental deve ter ida e volta contra três adversários');
assert.equal(continental.fixtures.filter(fixture=>fixture.phase==='knockout'&&fixture.twoLegged).length,6,'Oitavas, quartas e semifinal devem ter dois jogos');
const group=continental.fixtures.filter(fixture=>fixture.phase==='group').map((fixture,index)=>({...fixture,played:true,score:index<3?{home:2,away:0}:{home:0,away:1}}));
assert.equal(groupProgress(group).complete,true);
assert.equal(groupProgress(group).qualified,true);
const tie=[{tieId:'x',home:true,played:true,score:{home:1,away:0}},{tieId:'x',home:false,played:true,score:{home:1,away:0}}];
assert.equal(tieOutcome(tie,tie[1],club.id,'seed').resolved,true);

const career={budget:20000000,date:'2026-04-01T12:00:00Z',roster:[],ledger:[]};
ensureMarketIntelligence(career);assert.equal(career.scoutingNetwork.regions.europe,48);
const player=hydrateMarketProfile({id:'p1',name:'Teste',value:4,marketRegion:'europe',overall:72},career);
assert.ok(player.agent&&player.releaseClause>0&&player.appearanceBonus>0);
assert.ok(marketNegotiationProfile(player,career).agentFeeRate>.03);
assert.ok(scoutInvestment(career,'europe').knowledge>48);
career.roster=[player];const bonuses=applyContractMatchBonuses(career,{ownLineup:[player],playerPerformance:{p1:{id:'p1',goals:2}}});
assert.ok(bonuses.total>=player.appearanceBonus+player.goalBonus*2);

const match=createMatchEngineV2({seed:91,ownName:'Mandante',opponentName:'Visitante',opponentRating:72});
match.homeGoals=2;advanceMatchEngineV2(match,56);
assert.ok(match.opponentCoach?.label,'Todo rival precisa ter perfil de treinador');
assert.ok(match.opponentSubstitutions>=1,'Rival em desvantagem deve usar o banco');
console.log('Fase 12 foundations: OK');
