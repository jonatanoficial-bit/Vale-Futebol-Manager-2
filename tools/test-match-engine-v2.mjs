import assert from 'node:assert/strict';
import { MATCH_ENGINE_V2_VERSION, createMatchEngineV2, advanceMatchEngineV2, simulateMatchV2, applyManagerShoutV2 } from '../js/systems/matchEngineV2.js';

const positions=['GOL','LD','ZAG','ZAG','LE','VOL','MC','MC','PD','ATA','PE'];
function lineup(rating=72,prefix='time'){
  return positions.map((pos,index)=>({
    id:`${prefix}-${index}`,name:`${prefix} ${index+1}`,pos,overall:rating,fitness:92,morale:76,form:74,
    attributes:{pace:rating,stamina:rating,passing:rating,technique:rating,vision:rating,finishing:rating,tackling:rating,positioning:rating,decisions:rating,teamwork:rating,strength:rating}
  }));
}
const balanced={formation:'4-3-3',mentality:'Equilibrada',pressure:55,tempo:55,width:55,defensiveLine:52,passing:'Misto',marking:'Zona',transition:'Equilibrada'};
const attack={...balanced,mentality:'Ofensiva',pressure:82,tempo:78,width:68,defensiveLine:68,passing:'Curto',transition:'Contra-atacar'};
const lowBlock={...balanced,mentality:'Defensiva',pressure:38,tempo:38,width:48,defensiveLine:34,passing:'Direto',transition:'Reagrupar'};

function config(seed,tactics=balanced,ownRating=74,opponentRating=74){
  return {seed,ownHome:true,ownName:'Vale FC',opponentName:'Rival FC',ownLineup:lineup(ownRating,'vale'),opponentLineup:lineup(opponentRating,'rival'),ownTactics:tactics,opponentRating};
}
function result(match){return {homeGoals:match.homeGoals,awayGoals:match.awayGoals,xgHome:Number(match.xgHome.toFixed(6)),xgAway:Number(match.xgAway.toFixed(6)),shotsHome:match.shotsHome,shotsAway:match.shotsAway,possessionHome:match.possessionHome,events:match.events.map(event=>`${event.minute}:${event.type}:${event.text}`)};}

const oneByOne=simulateMatchV2(config(20261001),1);
const sixAtOnce=simulateMatchV2(config(20261001),6);
assert.deepEqual(result(oneByOne),result(sixAtOnce),'A velocidade não pode alterar o resultado da simulação.');
assert.equal(oneByOne.minute,90);
assert.equal(oneByOne.finished,true);
assert.equal(oneByOne.engineVersion,MATCH_ENGINE_V2_VERSION);
assert.equal(Object.keys(oneByOne.playerPerformance).length,22);
assert.ok(oneByOne.postMatchReport?.verdict);

const shout=createMatchEngineV2(config(14));
advanceMatchEngineV2(shout,15);
assert.equal(applyManagerShoutV2(shout,'focus'),true);
assert.equal(applyManagerShoutV2(shout,'calm'),false,'O intervalo entre orientações deve ser respeitado.');
advanceMatchEngineV2(shout,12);
assert.equal(applyManagerShoutV2(shout,'calm'),true);

function batch(tactics,ownRating=74,opponentRating=74,total=400){
  const totals={goalsFor:0,goalsAgainst:0,xgFor:0,xgAgainst:0,shotsFor:0,fitness:0,cards:0,errors:0};
  for(let seed=1;seed<=total;seed++){
    const match=simulateMatchV2(config(seed,tactics,ownRating,opponentRating),seed%3===0?6:seed%2===0?3:1);
    if(match.minute!==90||!Number.isFinite(match.xgHome)||match.possessionHome<20||match.possessionHome>80)totals.errors++;
    totals.goalsFor+=match.homeGoals;totals.goalsAgainst+=match.awayGoals;totals.xgFor+=match.xgHome;totals.xgAgainst+=match.xgAway;totals.shotsFor+=match.shotsHome;
    totals.fitness+=match.ownLineup.reduce((sum,player)=>sum+player.fitness,0)/match.ownLineup.length;totals.cards+=match.cardsHome+match.cardsAway;
  }
  Object.keys(totals).forEach(key=>{if(key!=='errors')totals[key]=Number((totals[key]/total).toFixed(3));});
  return totals;
}

const balancedBatch=batch(balanced);
const attackBatch=batch(attack);
const lowBlockBatch=batch(lowBlock);
const eliteBatch=batch(balanced,84,70);
const weakBatch=batch(balanced,64,70);

function positionalBatch(misplaced=false,total=200){
  let xg=0,goals=0;
  for(let seed=1;seed<=total;seed++){
    const players=lineup(74,'positional');
    const ownLineup=misplaced?[...players.slice(5),...players.slice(0,5)]:players;
    const match=simulateMatchV2({...config(10000+seed,balanced,74,74),ownLineup},6);
    xg+=match.xgHome;goals+=match.homeGoals;
  }
  return {xg:Number((xg/total).toFixed(3)),goals:Number((goals/total).toFixed(3))};
}
const correctPositions=positionalBatch(false),wrongPositions=positionalBatch(true);

assert.equal(balancedBatch.errors,0);
assert.ok(balancedBatch.goalsFor>0.55&&balancedBatch.goalsFor<3.6,`Média de gols fora da faixa: ${balancedBatch.goalsFor}`);
assert.ok(balancedBatch.xgFor>0.65&&balancedBatch.xgFor<3.5,`Média de xG fora da faixa: ${balancedBatch.xgFor}`);
assert.ok(attackBatch.shotsFor>balancedBatch.shotsFor,'Plano ofensivo deve produzir mais volume.');
assert.ok(attackBatch.fitness<balancedBatch.fitness,'Pressão e ritmo altos devem consumir mais físico.');
assert.ok(lowBlockBatch.xgAgainst<attackBatch.xgAgainst,'Bloco baixo deve conceder menos xG que linha agressiva.');
assert.ok(eliteBatch.xgFor>weakBatch.xgFor*.98,'Atributos superiores precisam melhorar a criação ofensiva.');
assert.ok(eliteBatch.goalsFor>weakBatch.goalsFor,'Atributos superiores precisam gerar mais gols em amostra ampla.');
assert.ok(correctPositions.xg>wrongPositions.xg,'Jogadores fora de posição precisam reduzir a produção coletiva.');

console.log(JSON.stringify({engine:MATCH_ENGINE_V2_VERSION,determinism:'ok',samples:2400,balanced:balancedBatch,attack:attackBatch,lowBlock:lowBlockBatch,elite:eliteBatch,weak:weakBatch,positions:{correct:correctPositions,misplaced:wrongPositions}},null,2));
