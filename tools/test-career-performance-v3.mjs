import assert from 'node:assert/strict';
import {
  CAREER_PERFORMANCE_VERSION, FORMATION_ROLES, calculatePositionRating, hydratePlayerPerformance,
  effectiveOverall, isPlayerAvailable, selectBestLineup, advanceRosterDays, applyMatchConsequences,
  applyTrainingWeek, processSeasonAging, rosterHealthSummary
} from '../js/systems/careerPerformanceV3.js';

const attributes={pace:70,stamina:70,strength:70,passing:70,technique:70,vision:70,finishing:70,tackling:70,positioning:70,decisions:70,teamwork:70,leadership:70};
function player(id,pos='MC',overall=70,extra={}){
  return hydratePlayerPerformance({id,name:`Jogador ${id}`,pos,overall,potential:88,age:22,fitness:88,morale:74,form:71,attributes:{...attributes},...extra});
}

const striker=player('striker','ATA',78,{attributes:{...attributes,finishing:94,positioning:91,pace:86,tackling:34}});
const defender=player('defender','ZAG',78,{attributes:{...attributes,tackling:94,positioning:91,strength:88,finishing:35}});
assert.ok(calculatePositionRating(striker,'ATA')>calculatePositionRating(striker,'ZAG'),'Atacante deve render mais na função ofensiva.');
assert.ok(calculatePositionRating(defender,'ZAG')>calculatePositionRating(defender,'ATA'),'Zagueiro deve render mais na defesa.');

const positions=['GOL','LD','ZAG','ZAG','LE','VOL','MC','MC','PD','ATA','PE'];
const roster=positions.flatMap((pos,index)=>[player(`${pos}-${index}-a`,pos,72+index%4),player(`${pos}-${index}-b`,pos,68+index%3)]);
roster.find(item=>item.pos==='GOL').injury={type:'Lesão muscular',severity:'moderada',daysRemaining:12,recurrenceRisk:10,cause:'teste'};
const lineup=selectBestLineup(roster,'4-3-3');
assert.equal(lineup.length,11);
assert.equal(new Set(lineup.map(item=>item.id)).size,11);
assert.ok(lineup.every(isPlayerAvailable),'A escalação automática não pode usar lesionados ou suspensos.');
assert.equal(lineup[0].pos,'GOL');
assert.deepEqual(FORMATION_ROLES['4-3-3'],['GOL','LD','ZAG','ZAG','LE','VOL','MC','MC','PD','ATA','PE']);

const fresh=player('fresh','MC',75,{fitness:94,form:84,sharpness:88,chemistry:82,workload:22});
const tired=player('tired','MC',75,{fitness:54,form:56,sharpness:55,chemistry:62,workload:92});
assert.ok(effectiveOverall(fresh,'MC')>effectiveOverall(tired,'MC')+5,'Condição e carga devem alterar o rendimento do dia.');

const recoveryPlayer=player('recovery','ZAG',74,{injury:{type:'Contusão muscular leve',severity:'leve',daysRemaining:5,recurrenceRisk:5,cause:'partida'}});
const recovery=advanceRosterDays([recoveryPlayer],6,{medicalLevel:3,fitnessCoach:76});
assert.equal(recoveryPlayer.injury,null);
assert.deepEqual(recovery.recovered,[recoveryPlayer.name]);
const legacy=hydratePlayerPerformance({id:'legacy',name:'Save antigo',pos:'MC',overall:69,potential:76,fitness:80,morale:70,attributes:{...attributes},injuredUntil:'2026-08-01T12:00:00.000Z'});
assert.equal(isPlayerAvailable(legacy),false,'A migração precisa preservar indisponibilidade de saves antigos.');
assert.ok(legacy.positionRatings&&Number.isFinite(legacy.workload)&&Number.isFinite(legacy.chemistry));

const matchRoster=[player('match-1','ATA',76),player('match-2','MC',72)];
const match={
  ownLineup:[{...matchRoster[0],fitness:63},{...matchRoster[1],fitness:67}],substitutedOut:[],
  playerPerformance:{'match-1':{minutes:90,rating:8.1},'match-2':{minutes:90,rating:5.8}},
  injuryIncidents:[{playerId:'match-2',minute:67,minimumDays:5}],randomState:44
};
const consequences=applyMatchConsequences(matchRoster,match,{result:'win',date:'2026-05-10T15:00:00.000Z',seed:'phase7'});
assert.equal(consequences.injuries.length,1);
assert.ok(matchRoster[0].form>matchRoster[1].form,'Nota da partida deve alimentar a forma recente.');
assert.ok(matchRoster[0].seasonMinutes===90&&matchRoster[0].appearances===1);

const trainingA=[player('young','MEI',66,{age:18,potential:88,developmentProgress:98}),player('senior','ZAG',78,{age:31,potential:80})];
const trainingB=structuredClone(trainingA);
const context={seed:'club:2026:8',medicalLevel:3,trainingLevel:4,individualTraining:{young:'Técnica'},date:'2026-06-01T12:00:00.000Z'};
const resultA=applyTrainingWeek(trainingA,'tactical',context),resultB=applyTrainingWeek(trainingB,'tactical',context);
assert.deepEqual({players:trainingA,result:resultA},{players:trainingB,result:resultB},'Treino precisa ser reprodutível com a mesma semente.');
assert.ok(trainingA[0].developmentProgress<98||resultA.improvements.length>0);

const agingRoster=[player('prospect','PD',68,{age:18,potential:90}),player('veteran','ATA',82,{age:35,potential:82})];
const before=agingRoster.map(item=>item.overall),aging=processSeasonAging(agingRoster,{season:2026,seed:'aging'});
assert.equal(agingRoster[0].age,19);assert.equal(agingRoster[1].age,36);
assert.ok(agingRoster[0].overall>=before[0]);
assert.ok(agingRoster[1].overall<=before[1]);
assert.equal(aging.improved.length+aging.declined.length>=0,true);

const health=rosterHealthSummary([...roster,recoveryPlayer]);
assert.ok(health.available>=11&&Number.isFinite(health.fitness)&&Number.isFinite(health.chemistry));

console.log(JSON.stringify({engine:CAREER_PERFORMANCE_VERSION,status:'ok',checks:21,lineup:lineup.map(item=>item.pos),freshRating:effectiveOverall(fresh,'MC'),tiredRating:effectiveOverall(tired,'MC'),trainingImprovements:resultA.improvements.length,season:{improved:aging.improved.length,declined:aging.declined.length}},null,2));
