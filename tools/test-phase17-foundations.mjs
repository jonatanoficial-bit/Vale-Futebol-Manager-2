import assert from 'node:assert/strict';
import { ensureMarketIntelligence, contractRisk, refreshMarketPressure, updateContractMood } from '../js/systems/marketIntelligenceV3.js';
import { ensureRivalCareer, transferWindow, transferCompetition, recordRivalTransfer, simulateRivalMarketWeek, rivalMarketBrief } from '../js/systems/rivalCareerV4.js';

const user={id:'user',name:'Clube do usuário',rating:64,countryId:'brazil',continent:'south-america'};
const source={id:'source',name:'Clube vendedor',rating:72,countryId:'brazil',continent:'south-america'};
const rivalA={id:'rival-a',name:'Rival ambicioso',rating:84,countryId:'brazil',continent:'south-america'};
const rivalB={id:'rival-b',name:'Rival estruturado',rating:78,countryId:'brazil',continent:'south-america'};
const catalog={clubs:[user,source,rivalA,rivalB]};
const atRisk={id:'at-risk',name:'Titular insatisfeito',pos:'ATA',value:15,salary:40,contractUntil:'2026-04-01',contractSatisfaction:23,marketInterest:92,agentInfluence:89};
const target={id:'target',name:'Alvo disputado',pos:'ATA',value:18,salary:45,sourceClubId:'source',sourceClub:source.name,marketInterest:60};
const career={season:2026,week:6,date:'2026-01-31T16:00:00.000Z',club:user,budget:80_000_000,roster:[atRisk],messages:[]};

ensureMarketIntelligence(career);
const risk=contractRisk(atRisk,career);
assert.ok(risk.risk>=72,'Contrato curto, insatisfação e empresário devem criar risco crítico.');
assert.equal(risk.level,'crítico');
const pressure=refreshMarketPressure(career,career.week);
assert.equal(pressure.entries[0].playerId,'at-risk');
assert.equal(pressure.alerts[0].playerId,'at-risk');
updateContractMood(career,{result:'loss',lineupIds:[]});
assert.ok(atRisk.marketInterest>=92,'Reserva insatisfeito deve manter ou elevar o interesse externo.');

const world=ensureRivalCareer(career,catalog);
assert.equal(world.version,'8.0.0');
assert.equal(transferWindow(career.date,user).active,true,'Janeiro deve permitir a janela sul-americana.');
const competition=transferCompetition(career,catalog,target,{fee:1_000_000,salary:10_000,expectedSalary:50_000});
assert.ok(competition.rivals.length>0,'O mercado precisa produzir concorrentes plausíveis.');
assert.equal(competition.playerWins,false,'Uma proposta muito abaixo do mercado deve perder a disputa.');
const move=recordRivalTransfer(career,catalog,target,competition);
assert.ok(move?.competitive,'A perda precisa virar movimento persistente de rival.');
assert.equal(career.rivalWorld.negotiations[0].status,'perdida');

const cycle=simulateRivalMarketWeek(career,catalog,6);
assert.equal(cycle.window.active,true);
assert.ok(cycle.moves.length>0,'Clubes rivais precisam executar planejamento durante a janela.');
const brief=rivalMarketBrief(career);
assert.ok(brief.biggestSpenders.length>0);
assert.ok(brief.negotiations.some(item=>item.player===target.name));
console.log('Fase 17 foundations: OK');
