import assert from 'node:assert/strict';
import { deriveCompetitionTable, competitionKind, nextCareerEvent, managerCareerScore, seasonTrophies } from '../js/systems/competitionCareer.js';

const club={id:'vale',name:'Vale FC',rating:77,badge:'vale.svg',country:'Brasil'};
const rivals=[
  {id:'rio',name:'Rio Clube',rating:74,badge:'rio.svg'},
  {id:'serra',name:'Serra AC',rating:71,badge:'serra.svg'},
  {id:'litoral',name:'Litoral FC',rating:69,badge:'litoral.svg'}
];
const fixtures=[
  {id:'c1',round:1,opponent:rivals[0],home:true,played:true,score:{home:2,away:0}},
  {id:'c2',round:2,opponent:rivals[1],home:false,played:true,score:{home:1,away:1}},
  {id:'c3',round:3,opponent:rivals[2],home:true,played:false,score:null}
];
const table=deriveCompetitionTable(club,fixtures,'qa-continental');
assert.equal(table.length,4);
const own=table.find(row=>row.team.id==='vale');
assert.deepEqual({played:own.played,wins:own.wins,draws:own.draws,losses:own.losses,points:own.points,gf:own.gf,ga:own.ga},{played:2,wins:1,draws:1,losses:0,points:4,gf:3,ga:1});
assert.deepEqual(table,deriveCompetitionTable(club,fixtures,'qa-continental'));

assert.equal(competitionKind({competitionId:'international-friendly'}).short,'AMISTOSO');
assert.equal(competitionKind({competitionId:'world-cup-qualifiers'}).short,'ELIMINATÓRIAS');
assert.equal(competitionKind({competitionId:'world-cup'}).short,'COPA DO MUNDO');

const career={
  fixtures:[{id:'club-later',date:'2026-06-10T15:00:00.000Z',played:false,locked:false,cancelled:false,opponent:rivals[0]}],
  national:{fixtures:[{id:'national-first',date:'2026-06-04T15:00:00.000Z',played:false,locked:false,cancelled:false,opponent:rivals[1]}]},
  manager:{xp:900,reputation:67},stats:{wins:12},trophies:[{score:1200}]
};
assert.equal(nextCareerEvent(career).id,'national-first');
assert.equal(nextCareerEvent(career,{includeClub:false}).id,'national-first');
assert.equal(managerCareerScore(career),3860);

const titles=seasonTrophies({season:2026,club,league:{id:'brasileirao-a',name:'Brasileirão Série A'},champion:true,cupChampion:true,continentalChampion:true,continentalId:'libertadores',date:'2026-12-20T12:00:00.000Z'});
assert.equal(titles.length,3);
assert.equal(titles.reduce((sum,title)=>sum+title.xp,0),3800);
assert.ok(titles.every(title=>title.club.id==='vale'&&title.season===2026));

console.log('competition career: all tests passed');
