import assert from 'node:assert/strict';
import { createCompetitionWorld, simulateCompetitionRound } from '../js/systems/competitionWorldV2.js';
import { simulateWorldTournamentWeek, worldTournamentSummary, clubWorldQualification } from '../js/systems/worldTournamentV3.js';
import { ensureNationalCareer, observeNationalRegion, callUpByPerformance, recordNationalPerformance, nationalSelectionRanking, recordNationalTournament } from '../js/systems/nationalCareerV3.js';

const clubs=Array.from({length:16},(_,index)=>({id:`club-${index+1}`,name:`Clube ${index+1}`,leagueId:'liga-a',countryId:'brazil',country:'Brasil',confederation:'CONMEBOL',rating:84-index,badge:''}));
const league={id:'liga-a',name:'Liga QA',country:'Brasil',rules:{teams:16,format:'conferences-playoffs',relegation:2,continental:{libertadores:[1,8]}}};
const world=createCompetitionWorld({season:2026,leagues:[league],clubs,managedClub:clubs[0]});
assert.equal(world.version,'4.0.0');
assert.ok(world.tournaments?.domestic?.['cup-brazil'],'Toda nação com clubes precisa receber chave de copa persistida.');
assert.ok(world.tournaments?.continental?.libertadores,'Vagas continentais precisam gerar torneio de grupos persistido.');
assert.equal(clubWorldQualification(world.tournaments,'club-1').competition,'libertadores');

for(let week=0;week<8;week++) simulateWorldTournamentWeek(world.tournaments,`qa:${week}`);
const continental=world.tournaments.continental.libertadores;
assert.ok(continental.matchday>0,'A fase de grupos continental deve avançar em cada semana mundial.');
assert.ok(worldTournamentSummary(world.tournaments).some(item=>item.id==='cup-brazil'),'Resumo deve expor as chaves completas do mundo.');
simulateCompetitionRound(world,'liga-a',0,'qa');
assert.equal(world.leagues['liga-a'].regulation.playoffs,true,'Regulamentos de liga precisam preservar o perfil de playoffs.');
for(let round=1;round<world.leagues['liga-a'].rounds.length;round++)simulateCompetitionRound(world,'liga-a',round,'qa');
assert.ok(world.leagues['liga-a'].playoffs?.rounds?.length,'Regulamentos com playoffs precisam criar chave persistida após a fase regular.');
simulateCompetitionRound(world,'liga-a',undefined,'qa');
assert.ok(world.leagues['liga-a'].playoffs.rounds[0].complete,'A rodada de playoff deve ser simulada e salva separadamente da liga.');

const roster=Array.from({length:28},(_,index)=>({id:`p${index}`,name:`Atleta ${index}`,pos:index===0?'GOL':'MC',overall:68+(index%18),fitness:88,morale:72,marketRegion:index%2?'europe':'domestic'}));
const national={team:{id:'bra',rating:84},roster,selectionPoolIds:roster.map(player=>player.id),calledUpIds:roster.slice(0,26).map(player=>player.id)};
ensureNationalCareer(national,{date:'2026-06-01T00:00:00Z'});
assert.ok(observeNationalRegion(national,'europe').updated>0,'Observação regional deve atualizar atletas elegíveis.');
recordNationalPerformance(national,{date:'2026-06-02T00:00:00Z',playerPerformance:{p25:{minutes:90,goals:2,assists:1,rating:9.2}}});
const ranking=nationalSelectionRanking(national,28);
assert.equal(ranking[0].id,'p25','Forma internacional precisa pesar na convocação.');
assert.equal(callUpByPerformance(national,26).calledUpIds.length,26);
recordNationalTournament(national,{id:'world-cup:2026',season:2026,name:'Copa do Mundo',stage:'Quartas de final',result:'Eliminada'});
assert.equal(national.selectionIntelligence.tournamentHistory.length,1,'Histórico de torneios deve ficar no save.');

console.log('Fase 13 foundations: OK');
