import assert from 'node:assert/strict';
import { ensureRivalCareer, registerRivalPlayers, rivalMarketCandidates, transferCompetition, recordRivalTransfer, recordUserTransfer, settleRivalSeason, rivalMarketBrief } from '../js/systems/rivalCareerV4.js';

const user={id:'user',name:'Seu Clube',rating:66,countryId:'brazil',continent:'south-america'};
const source={id:'source',name:'Clube de origem',rating:70,countryId:'brazil',continent:'south-america'};
const buyer={id:'buyer',name:'Clube comprador',rating:83,countryId:'brazil',continent:'south-america'};
const catalog={clubs:[user,source,buyer]};
const career={season:2026,week:8,date:'2026-07-20T16:00:00.000Z',club:user,budget:70_000_000,roster:[]};
const player={id:'nine',basePlayerId:'nine',marketIdentity:'source:nine',name:'Centroavante rastreado',pos:'ATA',overall:79,potential:84,age:24,value:16,salary:55,contractUntil:'2027-12-31',sourceClubId:'source',sourceClub:source.name,marketRegion:'south-america'};
const expiring={id:'left',basePlayerId:'left',marketIdentity:'buyer:left',name:'Lateral em fim de vínculo',pos:'LE',overall:68,potential:71,age:29,value:3,salary:18,contractUntil:'2026-12-31',sourceClubId:'buyer',sourceClub:buyer.name,marketRegion:'south-america'};

const world=registerRivalPlayers(career,catalog,[player,expiring]);
assert.equal(world.players['source:nine'].ownerId,'source');
const competition=transferCompetition(career,catalog,player,{fee:1_000_000,salary:10_000,expectedSalary:60_000});
assert.equal(competition.playerWins,false);
const move=recordRivalTransfer(career,catalog,player,competition);
assert.equal(move.to,'Clube comprador');
assert.equal(career.rivalWorld.players['source:nine'].ownerId,'buyer');
assert.equal(rivalMarketCandidates(career,catalog,['source']).some(item=>item.id==='source:nine'),false,'O jogador não pode continuar na vitrine do clube antigo.');
assert.equal(rivalMarketCandidates(career,catalog,['buyer']).some(item=>item.id==='source:nine'),true,'O jogador precisa reaparecer quando o novo clube for observado.');

recordUserTransfer(career,catalog,{...player,id:'source:nine',marketIdentity:'source:nine',sourceClubId:'buyer',sourceClub:buyer.name});
assert.equal(career.rivalWorld.players['source:nine'].ownerId,'user');
assert.equal(rivalMarketCandidates(career,catalog,['buyer']).some(item=>item.id==='source:nine'),false,'Contratação do usuário remove o atleta da vitrine rival.');

ensureRivalCareer(career,catalog).clubs.buyer.rating=45;
const settlement=settleRivalSeason(career,{leagues:{test:{name:'Liga de teste',rules:{relegation:1},table:[{id:'buyer',points:2,played:10,gd:-12,rating:45},{id:'source',points:24,played:10,gd:8,rating:70}]}}},catalog);
assert.ok(settlement.contractEvents.some(event=>event.player==='Lateral em fim de vínculo'),'Vencimentos rivais devem ser processados na virada.');
assert.ok(career.rivalWorld.contractEvents.length>0);
const brief=rivalMarketBrief(career);
assert.ok(Array.isArray(brief.freeAgents));
assert.ok(Array.isArray(brief.managerChanges));
console.log('Fase 18 foundations: OK');
