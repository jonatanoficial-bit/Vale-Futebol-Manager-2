import assert from 'node:assert/strict';
import { ensureRivalCareer, registerRivalPlayers, settleRivalSeason, rivalMarketBrief } from '../js/systems/rivalCareerV4.js';

const user={id:'user',name:'Seu Clube',rating:68,countryId:'brazil',continent:'south-america'};
const pressured={id:'pressured',name:'Clube pressionado',rating:64,countryId:'brazil',continent:'south-america'};
const buyer={id:'buyer',name:'Clube estruturado',rating:84,countryId:'brazil',continent:'south-america'};
const catalog={clubs:[user,pressured,buyer]};
const career={season:2026,week:37,date:'2026-12-01T16:00:00.000Z',club:user,budget:55_000_000,messages:[]};
const player={id:'sale-star',basePlayerId:'sale-star',marketIdentity:'pressured:sale-star',name:'Titular negociável',pos:'MEI',overall:76,potential:79,age:28,value:11,salary:85,contractUntil:'2029-12-31',sourceClubId:'pressured',sourceClub:pressured.name};

registerRivalPlayers(career,catalog,[player]);
const world=ensureRivalCareer(career,catalog);world.clubs.pressured.budget=2_100_000;world.clubs.pressured.boardPatience=24;world.clubs.buyer.budget=35_000_000;
const settlement=settleRivalSeason(career,{leagues:{test:{name:'Liga de teste',rules:{relegation:1},table:[{id:'buyer',points:27,played:10,gd:16,rating:84},{id:'user',points:15,played:10,gd:1,rating:68},{id:'pressured',points:3,played:10,gd:-17,rating:64}]}}},catalog);

assert.equal(settlement.seasonPlans.some(plan=>plan.club===pressured.name&&plan.direction==='reconstrução'),true);
assert.equal(settlement.forcedSales.some(move=>move.player===player.name&&move.from===pressured.name),true);
assert.equal(career.rivalWorld.players['pressured:sale-star'].ownerId,'buyer','A venda financeira precisa trocar o proprietário persistente.');
assert.equal(settlement.managerChanges.some(change=>change.club===pressured.name&&change.reason==='pressão da diretoria'),true);
const brief=rivalMarketBrief(career);
assert.ok(brief.seasonPlans.some(plan=>plan.club===pressured.name));
assert.ok(brief.forcedSales.some(move=>move.player===player.name));
assert.equal(world.version,'10.0.0');
console.log('Fase 22 foundations: OK');
