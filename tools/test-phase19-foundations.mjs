import assert from 'node:assert/strict';
import { ensureRivalCareer, registerRivalPlayers, reconcileRivalRoster, rivalCoachProfile } from '../js/systems/rivalCareerV4.js';
import { createMatchEngineV2, advanceMatchEngineV2 } from '../js/systems/matchEngineV2.js';

const user={id:'user',name:'Seu Clube',rating:66,countryId:'brazil',continent:'south-america'};
const rival={id:'rival',name:'Rival persistente',rating:75,countryId:'brazil',continent:'south-america'};
const other={id:'other',name:'Outro Clube',rating:71,countryId:'brazil',continent:'south-america'};
const catalog={clubs:[user,rival,other]};
const career={season:2026,week:12,date:'2026-05-05T16:00:00.000Z',club:user,roster:[]};
const base=[
  {id:'keeper',name:'Goleiro da base',pos:'GOL',overall:72,age:27,value:4,sourceClubId:'rival'},
  {id:'sold',name:'Atleta vendido',pos:'ATA',overall:76,age:25,value:10,sourceClubId:'rival'}
];
const arrival={id:'arrival',basePlayerId:'arrival',marketIdentity:'other:arrival',name:'Reforço persistente',pos:'MEI',overall:78,age:24,value:12,sourceClubId:'other',sourceClub:other.name,marketRegion:'south-america'};

const world=ensureRivalCareer(career,catalog);
world.clubs.rival.managerStyle='bloco compacto';
world.clubs.rival.managerTenure=4;
world.clubs.rival.seasonForm=68;
const coach=rivalCoachProfile(career,catalog,rival);
assert.equal(coach.formation,'3-5-2');
assert.equal(coach.transition,'Reagrupar');
assert.ok(coach.adaptability>60,'A experiência e a forma precisam afetar a adaptação do técnico.');

registerRivalPlayers(career,catalog,base);
career.rivalWorld.players['rival:sold'].ownerId='other';
registerRivalPlayers(career,catalog,[arrival]);
career.rivalWorld.players['other:arrival'].ownerId='rival';
const roster=reconcileRivalRoster(career,catalog,rival,base);
assert.ok(roster.some(player=>player.id==='rival:keeper'),'Titulares que permanecem no clube precisam continuar disponíveis.');
assert.equal(roster.some(player=>player.id==='rival:sold'),false,'Atletas vendidos precisam deixar o elenco rival.');
assert.ok(roster.some(player=>player.id==='other:arrival'),'Reforços rastreados precisam entrar no elenco rival.');

const eleven=['GOL','ZAG','ZAG','ZAG','ALA','VOL','MC','MEI','ALA','ATA','ATA'].map((pos,index)=>({id:'own-'+index,name:'Titular '+index,pos,overall:70,fitness:90,attributes:{pace:70,stamina:72,passing:70,technique:70,vision:70,finishing:70,tackling:70,positioning:70,decisions:70,teamwork:70,strength:70}}));
const match=createMatchEngineV2({seed:19,ownName:user.name,opponentName:rival.name,ownLineup:eleven,opponentRating:rival.rating,opponentCoach:coach,opponentTactics:coach});
match.minute=27;
advanceMatchEngineV2(match,1);
assert.equal(match.opponentTactics.formation,'3-5-2');
assert.equal(match.opponentTactics.transition,'Reagrupar');
assert.equal(match.opponentCoach.managerStyle,'bloco compacto');
assert.equal(match.opponentPlan,'Bloco compacto');
console.log('Fase 19 foundations: OK');
