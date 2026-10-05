export const MATCH_ENGINE_V2_VERSION = '5.2.0';

const POSITION_ORDER = ['GOL','LD','ZAG','ZAG','LE','VOL','MC','MC','PD','ATA','PE'];
const FORMATION_ROLES = {
  '4-3-3':['GOL','LD','ZAG','ZAG','LE','VOL','MC','MC','PD','ATA','PE'],
  '4-4-2':['GOL','LD','ZAG','ZAG','LE','MD','MC','MC','ME','ATA','ATA'],
  '4-2-3-1':['GOL','LD','ZAG','ZAG','LE','VOL','VOL','PD','MEI','PE','ATA'],
  '3-5-2':['GOL','ZAG','ZAG','ZAG','ALA','VOL','MC','MEI','ALA','ATA','ATA']
};
const ATTACK_POSITIONS = new Set(['ATA','PE','PD','MEI','SA']);
const MIDFIELD_POSITIONS = new Set(['VOL','MC','MEI','MD','ME']);
const DEFENCE_POSITIONS = new Set(['GOL','ZAG','LD','LE','ALA']);
const OPPONENT_STYLES = [
  {id:'possession',label:'Posse paciente',formation:'4-3-3',mentality:'Equilibrada',pressure:57,tempo:49,width:62,defensiveLine:58,passing:'Curto',marking:'Zona',transition:'Equilibrada'},
  {id:'pressing',label:'Pressão agressiva',formation:'4-2-3-1',mentality:'Ofensiva',pressure:74,tempo:68,width:58,defensiveLine:67,passing:'Misto',marking:'Híbrida',transition:'Contra-atacar'},
  {id:'counter',label:'Bloco e contra-ataque',formation:'4-4-2',mentality:'Equilibrada',pressure:43,tempo:66,width:61,defensiveLine:43,passing:'Direto',marking:'Zona',transition:'Contra-atacar'},
  {id:'pragmatic',label:'Equilíbrio pragmático',formation:'3-5-2',mentality:'Equilibrada',pressure:52,tempo:53,width:54,defensiveLine:49,passing:'Misto',marking:'Híbrida',transition:'Reagrupar'}
];

function clamp(value,min,max){const number=Number(value);return Math.min(max,Math.max(min,Number.isFinite(number)?number:min));}
function average(values=[]){return values.length?values.reduce((sum,value)=>sum+Number(value||0),0)/values.length:0;}
function round(value,digits=0){const factor=10**digits;return Math.round(Number(value||0)*factor)/factor;}
function nextRandom(match){match.randomState=(Math.imul(match.randomState||1,1664525)+1013904223)>>>0;return match.randomState/4294967296;}
function pick(list,random){return list[Math.min(list.length-1,Math.floor(random*list.length))];}

export function opponentCoachProfile(seed='',rating=68){let value=2166136261;for(const char of String(seed)){value^=char.charCodeAt(0);value=Math.imul(value,16777619);}const style=OPPONENT_STYLES[(value>>>0)%OPPONENT_STYLES.length];return {...style,rating:clamp(rating,45,96),adaptability:clamp(50+((value>>>7)%40),45,92),name:['Renato Valença','Marcos Ávila','Sergio Duarte','Paulo Ramires','André Siqueira'][(value>>>13)%5]};}

function attribute(player,key){
  const fallback=Number(player?.overall||68);
  return clamp(player?.attributes?.[key]??fallback,1,99);
}

function normalizeTactics(value={}){
  return {
    formation:value.formation||'4-3-3',mentality:value.mentality||'Equilibrada',pressure:clamp(value.pressure??55,20,90),
    tempo:clamp(value.tempo??55,20,90),width:clamp(value.width??55,25,85),defensiveLine:clamp(value.defensiveLine??52,20,85),
    passing:value.passing||'Misto',marking:value.marking||'Zona',transition:value.transition||'Equilibrada'
  };
}

function preparePlayer(player,index,prefix='team'){
  const overall=clamp(player?.overall??68,30,99),pos=String(player?.pos||POSITION_ORDER[index]||'MC');
  return {
    ...player,id:String(player?.id||`${prefix}-${index}`),name:String(player?.name||`Jogador ${index+1}`),pos,overall,
    fitness:clamp(player?.fitness??90,1,100),morale:clamp(player?.morale??74,1,100),form:clamp(player?.form??70,1,100),
    sharpness:clamp(player?.sharpness??70,1,100),chemistry:clamp(player?.chemistry??68,1,100),workload:clamp(player?.workload??34,0,100),injuryRisk:clamp(player?.injuryRisk??10,1,40),recurrenceRisk:clamp(player?.recurrenceRisk??0,0,45),
    attributes:{...(player?.attributes||{})}
  };
}

function genericLineup(rating=68,prefix='rival'){
  return POSITION_ORDER.map((pos,index)=>{
    const overall=clamp(Number(rating||68)+((index*7)%5)-2,45,94);
    const positional={pace:overall,stamina:overall,passing:overall,technique:overall,vision:overall,finishing:overall,tackling:overall,positioning:overall,decisions:overall,teamwork:overall,strength:overall};
    if(ATTACK_POSITIONS.has(pos))positional.finishing=clamp(overall+4,1,99);
    if(MIDFIELD_POSITIONS.has(pos)){positional.passing=clamp(overall+3,1,99);positional.vision=clamp(overall+3,1,99);}
    if(DEFENCE_POSITIONS.has(pos)){positional.tackling=clamp(overall+4,1,99);positional.positioning=clamp(overall+3,1,99);}
    return preparePlayer({id:`${prefix}-${index}`,name:`${prefix==='rival'?'Rival':'Jogador'} ${index+1}`,pos,overall,fitness:91,morale:74,form:70,attributes:positional},index,prefix);
  });
}

function playerAttack(player){
  const role=ATTACK_POSITIONS.has(player.pos)?1:MIDFIELD_POSITIONS.has(player.pos)?.63:.28;
  return (attribute(player,'finishing')*.29+attribute(player,'technique')*.19+attribute(player,'pace')*.16+attribute(player,'decisions')*.18+attribute(player,'positioning')*.18)*role+player.overall*(1-role)*.58;
}
function playerControl(player){return attribute(player,'passing')*.29+attribute(player,'vision')*.24+attribute(player,'technique')*.18+attribute(player,'decisions')*.17+attribute(player,'teamwork')*.12;}
function playerDefence(player){
  const role=DEFENCE_POSITIONS.has(player.pos)?1:MIDFIELD_POSITIONS.has(player.pos)?.68:.25;
  return (attribute(player,'tackling')*.27+attribute(player,'positioning')*.27+attribute(player,'decisions')*.18+attribute(player,'strength')*.15+attribute(player,'teamwork')*.13)*role+player.overall*(1-role)*.54;
}

function positionalFit(player,expected){
  const actual=String(player?.pos||'MC');if(actual===expected)return 1;
  const families=[new Set(['LD','LE','ALA']),new Set(['ZAG','VOL']),new Set(['VOL','MC','MEI']),new Set(['MD','ME','PD','PE','ALA']),new Set(['ATA','SA','PD','PE'])];
  if(families.some(group=>group.has(actual)&&group.has(expected)))return .9;
  if(actual==='GOL'||expected==='GOL')return .5;
  return .72;
}

function tacticsProfile(tactics={}){
  const t=normalizeTactics(tactics),mentality=t.mentality==='Ofensiva'?1:t.mentality==='Defensiva'?-1:0;
  return {
    attack:mentality*7+(t.tempo-55)*.12+(t.width-55)*.07+(t.transition==='Contra-atacar'?2:t.transition==='Reagrupar'?-2:0),
    control:(t.passing==='Curto'?7:t.passing==='Direto'?-4:1)+(t.pressure-55)*.045-(t.tempo-55)*.035,
    defence:-mentality*6+(t.marking==='Zona'?3:t.marking==='Individual'?1:2)-(t.defensiveLine-52)*.055+(t.transition==='Reagrupar'?4:0),
    intensity:clamp((t.pressure+t.tempo)/2,20,90),risk:clamp(28+(t.pressure-50)*.22+(t.defensiveLine-50)*.25+mentality*7,8,88)
  };
}

function teamMetrics(lineup=[],tactics={},boost=0,roleBonus={}){
  const players=lineup.length?lineup:genericLineup(66),profile=tacticsProfile(tactics);
  const expected=FORMATION_ROLES[tactics.formation]||FORMATION_ROLES['4-3-3'],fits=players.map((player,index)=>positionalFit(player,expected[index]||player.pos));
  const fitness=average(players.map(player=>player.fitness)),morale=average(players.map(player=>player.morale)),form=average(players.map(player=>player.form));
  const sharpness=average(players.map(player=>player.sharpness)),chemistry=average(players.map(player=>player.chemistry)),workload=average(players.map(player=>player.workload));
  const readiness=(fitness-75)*.13+(morale-70)*.055+(form-70)*.045+(sharpness-70)*.035+(chemistry-68)*.03-Math.max(0,workload-74)*.05+Number(boost||0);
  return {
    attack:average(players.map((player,index)=>playerAttack(player)*(.76+fits[index]*.24)))+profile.attack+readiness+Number(roleBonus.attack||0),
    control:average(players.map((player,index)=>playerControl(player)*(.7+fits[index]*.3)))+profile.control+readiness*.68+Number(roleBonus.control||0),
    defence:average(players.map((player,index)=>playerDefence(player)*(.72+fits[index]*.28)))+profile.defence+readiness*.84+Number(roleBonus.defence||0),
    goalkeeper:average(players.filter(player=>player.pos==='GOL').map(player=>attribute(player,'positioning')*.4+attribute(player,'decisions')*.3+player.overall*.3))||average(players.map(player=>player.overall)),
    fitness,morale,form,sharpness,chemistry,workload,profile,positionalFit:average(fits)*100
  };
}

function performanceRecord(player){return {id:player.id,name:player.name,pos:player.pos,minutes:0,goals:0,assists:0,shots:0,onTarget:0,keyPasses:0,tackles:0,saves:0,rating:6.2};}
function recordFor(match,player){
  if(!player)return null;
  if(!match.playerPerformance[player.id])match.playerPerformance[player.id]=performanceRecord(player);
  return match.playerPerformance[player.id];
}
function ratingAdd(match,player,value){const record=recordFor(match,player);if(record)record.rating=clamp(record.rating+value,4.8,10);}

function weightedPlayer(match,lineup=[],purpose='attack'){
  const candidates=lineup.filter(Boolean);if(!candidates.length)return null;
  const weights=candidates.map(player=>{
    const positionWeight=purpose==='finish'?(ATTACK_POSITIONS.has(player.pos)?1.7:MIDFIELD_POSITIONS.has(player.pos)?.75:.25):purpose==='create'?(MIDFIELD_POSITIONS.has(player.pos)||ATTACK_POSITIONS.has(player.pos)?1.25:.45):1;
    const quality=purpose==='finish'?attribute(player,'finishing')*.58+attribute(player,'positioning')*.25+attribute(player,'decisions')*.17:purpose==='create'?attribute(player,'passing')*.45+attribute(player,'vision')*.37+attribute(player,'technique')*.18:player.overall;
    return Math.max(1,quality*positionWeight*(.55+player.fitness/200));
  });
  const total=weights.reduce((sum,value)=>sum+value,0);let cursor=nextRandom(match)*total;
  for(let i=0;i<candidates.length;i++){cursor-=weights[i];if(cursor<=0)return candidates[i];}
  return candidates[candidates.length-1];
}

function addEvent(match,type,text,side='neutral',extra={}){
  match.events.push({minute:match.minute,type,text,side,...extra});
  if(match.events.length>80)match.events=match.events.slice(-80);
}
function addSignal(match,side,label,detail,impact=50){
  const item={minute:match.minute,side,label,detail,impact:Math.round(impact)};
  match.tacticalSignals.push(item);if(match.tacticalSignals.length>16)match.tacticalSignals.shift();
}

function sideState(match,side){
  const ownSide=match.ownHome?'home':'away',isOwn=side===ownSide;
  return {
    isOwn,lineup:isOwn?match.ownLineup:match.opponentLineup,tactics:isOwn?match.ownTactics:match.opponentTactics,
    name:side==='home'?match.homeName:match.awayName,opponentName:side==='home'?match.awayName:match.homeName
  };
}

function tacticalMatchup(attacking,defending,attackMetrics,defenceMetrics){
  let value=0,reason='qualidade individual entre as linhas';
  if(attacking.transition==='Contra-atacar'&&defending.defensiveLine>=64){value+=6;reason='contra-ataque nas costas da linha alta';}
  else if(attacking.passing==='Curto'&&defending.pressure<=46){value+=4;reason='troca de passes contra pressão baixa';}
  else if(attacking.passing==='Direto'&&defending.defensiveLine>=60){value+=3;reason='bola direta atacando a última linha';}
  else if(attacking.width>=66&&defending.marking==='Individual'){value+=4;reason='amplitude abrindo a marcação individual';}
  else if(attacking.tempo>=70&&defenceMetrics.fitness<72){value+=5;reason='ritmo alto contra uma defesa cansada';}
  else if(defending.transition==='Reagrupar'&&defending.mentality==='Defensiva'){value-=5;reason='bloco baixo protegendo a área';}
  if(attackMetrics.profile.risk>70){value+=2;reason+=' com muitos jogadores à frente';}
  return {value,reason};
}

function makeOpponentSubstitution(match,reason){
  if((match.opponentSubstitutions||0)>=5||!match.opponentBench?.length)return false;
  const candidates=match.opponentLineup.map((player,index)=>({player,index})).filter(item=>item.player?.pos!=='GOL').sort((a,b)=>(a.player.fitness+a.player.overall*.04)-(b.player.fitness+b.player.overall*.04));
  const outgoing=candidates[0],incoming=match.opponentBench.slice().sort((a,b)=>(b.fitness+b.overall*.05)-(a.fitness+a.overall*.05))[0];if(!outgoing||!incoming)return false;
  match.opponentLineup[outgoing.index]=incoming;match.opponentBench=match.opponentBench.filter(player=>player.id!==incoming.id);match.opponentBench.push(outgoing.player);match.opponentSubstitutions=(match.opponentSubstitutions||0)+1;recordFor(match,incoming);ratingAdd(match,incoming,.05);
  const side=match.ownHome?'away':'home';addEvent(match,'substitution',`SUBSTITUIÇÃO: ${match.opponentName} troca ${outgoing.player.name} por ${incoming.name} (${reason}).`,side);addSignal(match,side,'Banco rival',`${incoming.name} entra para ${reason}.`,61);return true;
}

function updateOpponentAI(match){
  if(![28,55,70].includes(match.minute))return;
  const ownSide=match.ownHome?'home':'away',opponentSide=match.ownHome?'away':'home';
  const opponentGoals=opponentSide==='home'?match.homeGoals:match.awayGoals,ownGoals=ownSide==='home'?match.homeGoals:match.awayGoals;
  const opponentXg=opponentSide==='home'?match.xgHome:match.xgAway,ownXg=ownSide==='home'?match.xgHome:match.xgAway;
  const coach=match.opponentCoach||opponentCoachProfile(match.opponentName,68);let plan=coach.label,reason='aplicar a identidade do treinador rival';
  if(opponentGoals<ownGoals||(match.minute>=55&&opponentXg+0.35<ownXg)){plan='Tudo ao ataque';reason='buscar o resultado com pressão, linha alta e um segundo atacante';match.opponentTactics={...match.opponentTactics,formation:'4-4-2',mentality:'Ofensiva',pressure:clamp(match.opponentTactics.pressure+12,20,90),tempo:clamp(match.opponentTactics.tempo+10,20,90),defensiveLine:clamp(match.opponentTactics.defensiveLine+8,20,85)};if(match.minute>=55)makeOpponentSubstitution(match,'dar mais presença ofensiva');}
  else if(match.minute>=70&&opponentGoals>ownGoals){plan='Fechar espaços';reason='proteger a vantagem com bloco baixo e contra-ataque';match.opponentTactics={...match.opponentTactics,formation:'3-5-2',mentality:'Defensiva',pressure:clamp(match.opponentTactics.pressure-9,20,90),tempo:clamp(match.opponentTactics.tempo-12,20,90),defensiveLine:clamp(match.opponentTactics.defensiveLine-10,20,85),transition:'Contra-atacar'};makeOpponentSubstitution(match,'reforçar a proteção defensiva');}
  else if(match.minute===28){plan=coach.label;reason='impor a identidade do treinador no meio-campo';match.opponentTactics={...match.opponentTactics,formation:coach.formation,pressure:clamp(match.opponentTactics.pressure+(coach.pressure-55)*.45,20,90),defensiveLine:clamp(match.opponentTactics.defensiveLine+(coach.defensiveLine-52)*.3,20,85)};}
  else if(match.minute===70)makeOpponentSubstitution(match,'renovar a intensidade');
  match.opponentPlan=plan;addEvent(match,'tactical',`${match.opponentName} muda o plano para ${plan.toLowerCase()}: ${reason}.`,opponentSide);addSignal(match,opponentSide,`IA: ${plan}`,reason,64);
}

function fatigueMinute(match,lineup,tactics,isOwn){
  const profile=tacticsProfile(tactics),boost=isOwn&&match.managerEffect?.until>=match.minute?Number(match.managerEffect.energy||0):0;
  lineup.forEach(player=>{
    const stamina=attribute(player,'stamina'),work=.032+profile.intensity*.00062+(profile.risk>68?.009:0)-stamina*.00012;
    player.fitness=clamp(player.fitness-Math.max(.018,work)-boost*.002,1,100);
    const record=recordFor(match,player);if(record)record.minutes++;
  });
}

function simulateDiscipline(match,homeMetrics,awayMetrics){
  if(match.minute<5||nextRandom(match)>.034)return;
  const homeRisk=homeMetrics.profile.intensity+homeMetrics.profile.risk*.35,awayRisk=awayMetrics.profile.intensity+awayMetrics.profile.risk*.35;
  const side=nextRandom(match)<homeRisk/(homeRisk+awayRisk)?'home':'away',team=sideState(match,side),player=weightedPlayer(match,team.lineup,'defend');
  if(side==='home')match.cardsHome++;else match.cardsAway++;
  ratingAdd(match,player,-.08);addEvent(match,'discipline',`${player?.name||'Jogador'} recebe amarelo após interromper uma transição.`,side,{playerId:player?.id});
}

function simulateInjury(match){
  const eligible=match.ownLineup.filter(player=>player&&!player.matchInjured);if(!eligible.length)return;
  const ownFitness=average(eligible.map(player=>player.fitness)),workload=average(eligible.map(player=>player.workload)),individualRisk=average(eligible.map(player=>player.injuryRisk+player.recurrenceRisk*.6));
  const risk=.00065+Math.max(0,70-ownFitness)*.000075+Math.max(0,workload-65)*.000018+individualRisk*.000012+(match.ownTactics.pressure>=78?.00055:0);
  if(match.minute<14||match.minute>84||nextRandom(match)>risk)return;
  const weights=eligible.map(player=>1+Math.max(0,72-player.fitness)*.055+Math.max(0,player.workload-68)*.035+player.injuryRisk*.035+player.recurrenceRisk*.045),total=weights.reduce((sum,value)=>sum+value,0);let cursor=nextRandom(match)*total,player=eligible[0];
  for(let index=0;index<eligible.length;index++){cursor-=weights[index];if(cursor<=0){player=eligible[index];break;}}
  player.matchInjured=true;player.fitness=clamp(player.fitness-18,1,100);ratingAdd(match,player,-.16);
  const incident={playerId:player.id,playerName:player.name,minute:match.minute,minimumDays:ownFitness<58?5:0};match.injuryIncidents.push(incident);
  addEvent(match,'injury',`Lesão: ${player.name} sente dores e precisará passar por avaliação médica.`,match.ownHome?'home':'away',incident);
}

function chanceType(match,tactics){
  const roll=nextRandom(match);
  if(roll<.14)return {id:'setpiece',label:'bola parada',base:.11};
  if(tactics.transition==='Contra-atacar'&&roll<.43)return {id:'transition',label:'transição rápida',base:.14};
  if(tactics.width>=65&&roll<.58)return {id:'cross',label:'cruzamento',base:.09};
  if(tactics.passing==='Curto'&&roll<.70)return {id:'combination',label:'combinação curta',base:.13};
  if(tactics.passing==='Direto'&&roll<.74)return {id:'direct',label:'ataque direto',base:.105};
  return {id:'openplay',label:'jogada trabalhada',base:.115};
}

function simulateChance(match,side,attackMetrics,defenceMetrics){
  const team=sideState(match,side),opponent=sideState(match,side==='home'?'away':'home'),type=chanceType(match,team.tactics);
  const matchup=tacticalMatchup(team.tactics,opponent.tactics,attackMetrics,defenceMetrics),quality=(attackMetrics.attack-defenceMetrics.defence)*.0027;
  const randomQuality=(nextRandom(match)-.5)*.11,shotXg=clamp(type.base+quality+matchup.value*.004+randomQuality,.025,.58);
  const finisher=weightedPlayer(match,team.lineup,'finish'),creator=weightedPlayer(match,team.lineup.filter(player=>player.id!==finisher?.id),'create');
  const record=recordFor(match,finisher);if(record)record.shots++;
  if(side==='home'){match.shotsHome++;match.xgHome+=shotXg;}else{match.shotsAway++;match.xgAway+=shotXg;}
  const onTargetChance=clamp(.31+shotXg*.72+(attribute(finisher,'technique')-70)*.0022,.22,.82),onTarget=nextRandom(match)<onTargetChance;
  if(onTarget){if(record)record.onTarget++;if(side==='home')match.shotsOnTargetHome++;else match.shotsOnTargetAway++;}
  const finishingFactor=clamp(.86+(attribute(finisher,'finishing')-65)*.006+(attribute(finisher,'decisions')-65)*.003,.66,1.34),keeperFactor=clamp(1-(defenceMetrics.goalkeeper-68)*.004,.76,1.16);
  const goal=onTarget&&nextRandom(match)<clamp(shotXg*finishingFactor*keeperFactor/onTargetChance,.035,.78);
  if(type.id==='setpiece'){if(side==='home')match.cornersHome++;else match.cornersAway++;}
  match.ball={x:side==='home'?clamp(70+nextRandom(match)*20,0,100):clamp(30-nextRandom(match)*20,0,100),y:clamp(22+nextRandom(match)*56,0,100)};
  const tacticalDetail=`${type.label}: ${matchup.reason}`;
  if(goal){
    if(side==='home')match.homeGoals++;else match.awayGoals++;
    if(record){record.goals++;record.rating=clamp(record.rating+1.05+shotXg*.45,4.8,10);}
    const assist=recordFor(match,creator);if(assist&&creator?.id!==finisher?.id){assist.assists++;assist.keyPasses++;assist.rating=clamp(assist.rating+.5,4.8,10);}
    addEvent(match,'goal',`GOL! ${finisher?.name||team.name} finaliza após ${type.label}${creator?` criada por ${creator.name}`:''}.`,side,{playerId:finisher?.id,xg:round(shotXg,2),reason:tacticalDetail});
    addSignal(match,side,'Gol construído',tacticalDetail,78+shotXg*25);
  }else{
    if(creator&&recordFor(match,creator)){recordFor(match,creator).keyPasses++;ratingAdd(match,creator,.08);}
    ratingAdd(match,finisher,onTarget?.06:-.025);
    const defender=weightedPlayer(match,opponent.lineup.filter(player=>DEFENCE_POSITIONS.has(player.pos)),'defend');
    if(onTarget){const goalkeeper=opponent.lineup.find(player=>player.pos==='GOL')||defender,keeperRecord=recordFor(match,goalkeeper);if(keeperRecord){keeperRecord.saves++;keeperRecord.rating=clamp(keeperRecord.rating+.14+shotXg*.12,4.8,10);}}
    else if(defender){const defenderRecord=recordFor(match,defender);if(defenderRecord){defenderRecord.tackles++;defenderRecord.rating=clamp(defenderRecord.rating+.045,4.8,10);}}
    const outcome=onTarget?'o goleiro defende':'a finalização sai sem direção';
    addEvent(match,'chance',`${team.name}: ${type.label} com ${finisher?.name||'o atacante'}; ${outcome}.`,side,{playerId:finisher?.id,xg:round(shotXg,2),reason:tacticalDetail});
    if(shotXg>=.18)addSignal(match,side,'Chance clara',tacticalDetail,58+shotXg*60);
  }
}

function simulateMinute(match){
  match.minute=Math.min(90,match.minute+1);
  updateOpponentAI(match);
  fatigueMinute(match,match.ownLineup,match.ownTactics,true);fatigueMinute(match,match.opponentLineup,match.opponentTactics,false);
  const ownBoost=match.managerEffect?.until>=match.minute?Number(match.managerEffect.tactical||0):0;
  const ownMetrics=teamMetrics(match.ownLineup,match.ownTactics,ownBoost,match.ownRoleEffects),opponentMetrics=teamMetrics(match.opponentLineup,match.opponentTactics,0,match.opponentRoleEffects);
  const homeMetrics=match.ownHome?ownMetrics:opponentMetrics,awayMetrics=match.ownHome?opponentMetrics:ownMetrics;
  const controlDiff=homeMetrics.control-awayMetrics.control,homePossession=clamp(50+3.2+controlDiff*.38+(nextRandom(match)-.5)*8,27,73);
  match.possessionSamples++;match.possessionHome=Math.round(((match.possessionHome*(match.possessionSamples-1))+homePossession)/match.possessionSamples);
  match.momentum=clamp(match.momentum*.82+homePossession*.18+(match.homeGoals-match.awayGoals)*1.4,16,84);
  const homePasses=Math.round(3.4+homePossession*.055),awayPasses=Math.round(3.4+(100-homePossession)*.055);
  match.passesHome+=homePasses;match.passesAway+=awayPasses;
  match.completedPassesHome+=Math.round(homePasses*clamp((homeMetrics.control+18)/110,.62,.93));match.completedPassesAway+=Math.round(awayPasses*clamp((awayMetrics.control+18)/110,.62,.93));
  const attackingSide=nextRandom(match)<homePossession/100?'home':'away',attackingMetrics=attackingSide==='home'?homeMetrics:awayMetrics,defendingMetrics=attackingSide==='home'?awayMetrics:homeMetrics;
  match.attacking=attackingSide;
  const tempo=sideState(match,attackingSide).tactics.tempo,chanceProbability=clamp(.155+tempo*.0012+(attackingMetrics.attack-defendingMetrics.defence)*.0011,.1,.31);
  if(nextRandom(match)<chanceProbability)simulateChance(match,attackingSide,attackingMetrics,defendingMetrics);
  else if(match.minute%15===0&&match.minute!==90){const side=homePossession>=50?'home':'away',team=sideState(match,side);addEvent(match,'tactical',`${team.name} ocupa melhor os espaços neste período e tenta transformar controle em profundidade.`,side);}
  simulateDiscipline(match,homeMetrics,awayMetrics);simulateInjury(match);
  if(match.minute===45)addEvent(match,'tactical','Intervalo: a comissão compara qualidade das chances, fadiga e encaixes entre as linhas.','neutral');
  if(match.minute>=90){match.finished=true;match.running=false;addEvent(match,'tactical','Fim de jogo. O relatório tático está pronto.','neutral');match.postMatchReport=buildMatchReport(match);}
}

export function createMatchEngineV2(config={}){
  const ownLineup=(config.ownLineup||[]).map((player,index)=>preparePlayer(player,index,'own'));
  const opponentLineup=(config.opponentLineup||[]).length?(config.opponentLineup||[]).map((player,index)=>preparePlayer(player,index,'rival')):genericLineup(config.opponentRating||68,'rival');
  const ownHome=config.ownHome!==false,homeName=ownHome?(config.ownName||'Seu time'):(config.opponentName||'Adversário'),awayName=ownHome?(config.opponentName||'Adversário'):(config.ownName||'Seu time');
  const opponentCoach=config.opponentCoach||opponentCoachProfile(config.opponentName||'Adversário',config.opponentRating||68);
  const opponentTactics=normalizeTactics(config.opponentTactics||opponentCoach);
  const opponentBench=(config.opponentBench||genericLineup(config.opponentRating||68,'rival-bench')).map((player,index)=>preparePlayer(player,index,'rival-bench'));
  const match={
    engineVersion:MATCH_ENGINE_V2_VERSION,randomState:Number(config.seed)||1,ownHome,homeName,awayName,ownName:config.ownName||'Seu time',opponentName:config.opponentName||'Adversário',
    minute:0,homeGoals:0,awayGoals:0,possessionHome:50,possessionSamples:0,shotsHome:0,shotsAway:0,shotsOnTargetHome:0,shotsOnTargetAway:0,
    xgHome:0,xgAway:0,cardsHome:0,cardsAway:0,cornersHome:0,cornersAway:0,passesHome:0,passesAway:0,completedPassesHome:0,completedPassesAway:0,
    momentum:50,opponentPlan:opponentCoach.label,opponentCoach,opponentSubstitutions:0,opponentBench,ownLineup,opponentLineup,ownTactics:normalizeTactics(config.ownTactics),opponentTactics,ownRoleEffects:{...(config.ownRoleEffects||{})},opponentRoleEffects:{...(config.opponentRoleEffects||{})},
    events:[],tacticalSignals:[],injuryIncidents:[],playerPerformance:{},managerEffect:null,ball:{x:50,y:50},attacking:'home',running:false,finished:false
  };
  ownLineup.forEach(player=>recordFor(match,player));opponentLineup.forEach(player=>recordFor(match,player));
  const rolesActive=Object.values(match.ownRoleEffects).some(value=>Number(value));
  addEvent(match,'tactical','As equipes estão posicionadas. A simulação considera atributos, '+(rolesActive?'funções individuais, ':'')+'fadiga e instruções.','neutral');
  return match;
}

export function advanceMatchEngineV2(match,minutes=1){
  const steps=Math.max(0,Math.min(90-match.minute,Math.floor(Number(minutes)||1)));
  for(let index=0;index<steps&&!match.finished;index++)simulateMinute(match);
  return match;
}

export function applyMatchSubstitutionV2(match,outgoing,incoming){
  if(!match||!incoming)return;
  const record=recordFor(match,incoming);if(record)record.rating=6.25;
  match.substitutionFreshness=clamp(Number(match.substitutionFreshness||0)+Math.max(0,(incoming.fitness||85)-(outgoing?.fitness||65))*.08,0,8);
  addSignal(match,match.ownHome?'home':'away','Banco acionado',`${incoming.name} entra com mais energia no lugar de ${outgoing?.name||'um companheiro'}.`,58+match.substitutionFreshness*3);
}

export function applyManagerShoutV2(match,type='encourage'){
  if(!match||match.finished)return false;
  if(Number(match.lastShoutMinute??-20)+12>match.minute)return false;
  const options={encourage:{label:'Incentivar',tactical:2.5,energy:1.5,text:'O treinador incentiva o time e recupera confiança.'},focus:{label:'Pedir foco',tactical:3.2,energy:0,text:'O treinador pede concentração para reduzir erros.'},calm:{label:'Acalmar',tactical:1.8,energy:2.2,text:'O treinador baixa a ansiedade e organiza a posse.'}};
  const selected=options[type]||options.encourage;match.lastShoutMinute=match.minute;match.managerEffect={...selected,until:match.minute+12};
  addEvent(match,'tactical',selected.text,match.ownHome?'home':'away');addSignal(match,match.ownHome?'home':'away',selected.label,'Efeito temporário de 12 minutos sobre execução e energia.',54+selected.tactical*4);return true;
}

export function buildMatchReport(match){
  const ownSide=match.ownHome?'home':'away',ownGoals=match.ownHome?match.homeGoals:match.awayGoals,opponentGoals=match.ownHome?match.awayGoals:match.homeGoals;
  const ownXg=match.ownHome?match.xgHome:match.xgAway,opponentXg=match.ownHome?match.xgAway:match.xgHome;
  const ownPossession=match.ownHome?match.possessionHome:100-match.possessionHome;
  const performers=Object.values(match.playerPerformance).filter(item=>match.ownLineup.some(player=>player.id===item.id)||match.substitutedOut?.some(player=>player.id===item.id)).map(item=>({...item,rating:round(item.rating+item.goals*.18+item.assists*.1,1)})).sort((a,b)=>b.rating-a.rating);
  const signals=match.tacticalSignals.filter(item=>item.side===ownSide).sort((a,b)=>b.impact-a.impact).slice(0,3);
  const result=ownGoals>opponentGoals?'vitória':ownGoals<opponentGoals?'derrota':'empate';
  let verdict=result==='vitória'?'A vitória foi construída em uma partida equilibrada.':result==='derrota'?'A derrota veio nos detalhes de uma partida equilibrada.':'O empate refletiu uma partida equilibrada.';
  if(ownXg>opponentXg+.45)verdict=`A equipe criou chances melhores (${round(ownXg,1)} xG) e o plano ofensivo funcionou.`;
  else if(opponentXg>ownXg+.45)verdict=`O adversário criou chances mais perigosas; a proteção da área precisa evoluir.`;
  else if(ownPossession>=58)verdict='A equipe controlou a posse, mas a qualidade das finalizações decidiu o resultado.';
  return {engineVersion:MATCH_ENGINE_V2_VERSION,result,verdict,ownGoals,opponentGoals,ownXg:round(ownXg,2),opponentXg:round(opponentXg,2),ownPossession,bestPlayer:performers[0]||null,performers:performers.slice(0,5),signals,injuries:(match.injuryIncidents||[]).map(item=>({...item}))};
}

export function simulateMatchV2(config={},chunk=1){
  const match=createMatchEngineV2(config);while(!match.finished)advanceMatchEngineV2(match,chunk);return match;
}
