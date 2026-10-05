import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCompetitionWorld, recordManagedCompetitionResult, simulateCompetitionRound, sortCompetitionTable } from '../js/systems/competitionWorldV2.js';
import { ensureCareerRelations, makeCareerPromise, resolveCareerRelationsAfterMatch } from '../js/systems/careerRelations.js';
import { ensureTacticalRoles, roleEffects } from '../js/systems/tacticalRoles.js';

const catalog=JSON.parse(await readFile(new URL('../data/world-catalog-2026.json',import.meta.url),'utf8'));
const clubs=catalog.clubs||[];
const league={id:'qa-league',name:'Liga QA',country:'Brasil',rules:{teams:4,format:'double-round-robin',relegation:1}};
const teams=[
  {id:'a',name:'Aurora',leagueId:'qa-league',rating:76},
  {id:'b',name:'Boreal',leagueId:'qa-league',rating:73},
  {id:'c',name:'Central',leagueId:'qa-league',rating:70},
  {id:'d',name:'Delta',leagueId:'qa-league',rating:68}
];
const world=createCompetitionWorld({season:2026,leagues:[league],clubs:teams,managedClub:teams[0]});
const state=world.leagues['qa-league'];
assert.equal(state.rounds.length,6,'A liga com quatro clubes deve ter ida e volta em seis rodadas.');
assert.equal(state.rounds.flat().length,12,'Cada par deve se enfrentar duas vezes.');
assert.equal(state.rounds.flat().filter(match=>match.includes(0)).length,6,'O clube gerenciado deve disputar seis partidas.');

const opening=state.rounds[0].find(match=>match[0]===0||match[1]===0);
const opponent=state.teams[opening[0]===0?opening[1]:opening[0]];
const managedHome=opening[0]===0;
const recorded=recordManagedCompetitionResult(world,'qa-league','a',opponent.id,managedHome,2,1,0);
assert.equal(recorded.recorded,true,'O resultado do usuário deve ocupar sua vaga na rodada persistida.');
simulateCompetitionRound(world,'qa-league',0,'qa');
assert.ok(state.table.every(row=>row.played===1),'Uma rodada inteira deve ser resolvida para todas as equipes.');
assert.equal(sortCompetitionTable(state.table)[0].points >= 0,true);

const firstLeague=catalog.leagues[0];
const fullWorld=createCompetitionWorld({season:2026,leagues:catalog.leagues,clubs,managedClub:clubs[0]});
assert.ok(fullWorld.leagues[firstLeague.id]?.rounds?.length>0,'Cada liga do catálogo recebe uma agenda completa.');
assert.ok(JSON.stringify(fullWorld).length<4_500_000,'O calendário mundial compactado deve caber com folga em saves locais.');

const roster=teams.map((team,index)=>({id:'p'+index,name:'Jogador '+index,pos:index===0?'GOL':index===1?'ZAG':'MC',overall:70+index,morale:70,attributes:{leadership:66+index}}));
const career={date:'2026-05-01T12:00:00.000Z',morale:72,board:70,roster,lineupIds:['p0','p1','p2']};
ensureCareerRelations(career);
const promise=makeCareerPromise(career,roster[1]);
assert.equal(promise.status,'active');
resolveCareerRelationsAfterMatch(career,{result:'win',lineupIds:['p0','p1'],date:career.date});
assert.ok(career.relations.fanConfidence>58,'Vitórias precisam afetar a confiança da torcida.');
assert.ok(career.relations.memory.length>0,'Decisões e jogos precisam deixar memória persistente.');

ensureTacticalRoles(career);
const effects=roleEffects(roster,career.tacticalRoles);
assert.ok(Object.values(effects).some(value=>Number(value)!==0),'Funções individuais precisam produzir efeito no motor.');

console.log(JSON.stringify({status:'ok',worldBytes:JSON.stringify(fullWorld).length,rounds:state.rounds.length,relations:career.relations.version},null,2));
