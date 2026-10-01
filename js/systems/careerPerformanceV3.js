export const CAREER_PERFORMANCE_VERSION = '7.0.0';

export const FORMATION_ROLES = {
  '4-3-3':['GOL','LD','ZAG','ZAG','LE','VOL','MC','MC','PD','ATA','PE'],
  '4-4-2':['GOL','LD','ZAG','ZAG','LE','MD','MC','MC','ME','ATA','ATA'],
  '4-2-3-1':['GOL','LD','ZAG','ZAG','LE','VOL','VOL','PD','MEI','PE','ATA'],
  '3-5-2':['GOL','ZAG','ZAG','ZAG','ALA','VOL','MC','MEI','ALA','ATA','ATA']
};

const POSITION_WEIGHTS = {
  GOL:{positioning:.26,decisions:.20,technique:.12,strength:.15,passing:.10,leadership:.12,pace:.05},
  ZAG:{tackling:.28,positioning:.24,strength:.16,decisions:.14,pace:.08,teamwork:.10},
  LD:{tackling:.20,positioning:.14,pace:.20,stamina:.14,passing:.10,technique:.08,teamwork:.08,decisions:.06},
  LE:{tackling:.20,positioning:.14,pace:.20,stamina:.14,passing:.10,technique:.08,teamwork:.08,decisions:.06},
  ALA:{pace:.21,stamina:.17,tackling:.14,positioning:.11,passing:.12,technique:.10,teamwork:.08,decisions:.07},
  VOL:{tackling:.18,positioning:.15,passing:.17,decisions:.14,teamwork:.12,stamina:.10,strength:.08,technique:.06},
  MC:{passing:.22,vision:.18,technique:.15,decisions:.14,teamwork:.12,stamina:.10,positioning:.09},
  MEI:{passing:.18,vision:.22,technique:.20,decisions:.14,finishing:.08,pace:.07,positioning:.06,teamwork:.05},
  MD:{pace:.22,technique:.18,finishing:.16,passing:.12,vision:.08,decisions:.09,positioning:.09,stamina:.06},
  ME:{pace:.22,technique:.18,finishing:.16,passing:.12,vision:.08,decisions:.09,positioning:.09,stamina:.06},
  PD:{pace:.22,technique:.18,finishing:.16,passing:.12,vision:.08,decisions:.09,positioning:.09,stamina:.06},
  PE:{pace:.22,technique:.18,finishing:.16,passing:.12,vision:.08,decisions:.09,positioning:.09,stamina:.06},
  ATA:{finishing:.27,positioning:.21,technique:.13,pace:.13,decisions:.12,strength:.07,teamwork:.04,vision:.03},
  SA:{finishing:.23,positioning:.18,technique:.17,pace:.12,decisions:.12,vision:.09,passing:.06,teamwork:.03}
};

const POSITION_FAMILIES = [
  new Set(['LD','LE','ALA']), new Set(['ZAG','VOL']), new Set(['VOL','MC','MEI']),
  new Set(['MD','ME','PD','PE','ALA']), new Set(['ATA','SA','PD','PE'])
];

const TRAINING_PROFILES = {
  recovery:{fitness:11,workload:-19,sharpness:-1,chemistry:1,morale:2,risk:.0005,attributes:['stamina']},
  tactical:{fitness:2,workload:4,sharpness:3,chemistry:5,morale:3,risk:.0015,attributes:['decisions','teamwork','passing','positioning']},
  intensity:{fitness:-8,workload:18,sharpness:6,chemistry:1,morale:3,risk:.007,attributes:['stamina','pace','strength']},
  finishing:{fitness:-3,workload:10,sharpness:4,chemistry:1,morale:4,risk:.003,attributes:['finishing','technique','decisions']},
  setpieces:{fitness:-2,workload:7,sharpness:3,chemistry:3,morale:3,risk:.002,attributes:['passing','positioning','finishing','leadership']}
};

function clamp(value,min,max){const number=Number(value);return Math.min(max,Math.max(min,Number.isFinite(number)?number:min));}
function average(values=[]){return values.length?values.reduce((sum,value)=>sum+Number(value||0),0)/values.length:0;}
function hash(value=''){let state=2166136261;for(let index=0;index<String(value).length;index++){state^=String(value).charCodeAt(index);state=Math.imul(state,16777619);}return state>>>0;}
function randomFor(seed){let state=hash(String(seed))||1;return()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};}
function attribute(player,key){return clamp(player?.attributes?.[key]??player?.sourceOverall??player?.overall??60,1,99);}
function naturalPosition(player){const value=String(player?.pos||'MC');return POSITION_WEIGHTS[value]?value:'MC';}

export function calculatePositionRating(player,position=player?.pos){
  const role=POSITION_WEIGHTS[position]?position:naturalPosition(player),weights=POSITION_WEIGHTS[role];
  const attributes=Object.entries(weights).reduce((sum,[key,weight])=>sum+attribute(player,key)*weight,0);
  const anchor=clamp(player?.sourceOverall??player?.overall??attributes,1,99),offset=Number(player?.ratingOffset||0);
  return clamp(Math.round(attributes*.64+anchor*.36+offset),1,99);
}

export function refreshPlayerRatings(player){
  const ratings={};
  Object.keys(POSITION_WEIGHTS).forEach(position=>{ratings[position]=calculatePositionRating(player,position);});
  player.positionRatings=ratings;
  player.overall=clamp(ratings[naturalPosition(player)],1,Math.max(1,Number(player.potential||99)));
  return player;
}

export function hydratePlayerPerformance(player){
  const result={...player,attributes:{...(player?.attributes||{})}};
  result.sourceOverall=clamp(player?.sourceOverall??player?.overall??60,1,99);
  result.ratingOffset=clamp(player?.ratingOffset??0,-15,15);
  result.workload=clamp(player?.workload??34,0,100);
  result.sharpness=clamp(player?.sharpness??72,1,100);
  result.chemistry=clamp(player?.chemistry??68,1,100);
  result.minutesLast28=Math.max(0,Number(player?.minutesLast28)||0);
  result.seasonMinutes=Math.max(0,Number(player?.seasonMinutes)||0);
  result.appearances=Math.max(0,Number(player?.appearances)||0);
  result.starts=Math.max(0,Number(player?.starts)||0);
  result.developmentProgress=clamp(player?.developmentProgress??0,0,99.99);
  result.injuryHistory=Array.isArray(player?.injuryHistory)?player.injuryHistory.slice(-12):[];
  result.recurrenceRisk=clamp(player?.recurrenceRisk??result.injuryHistory.at(-1)?.recurrenceRisk??0,0,45);
  result.injury=player?.injury&&Number(player.injury.daysRemaining)>0?{
    type:String(player.injury.type||'Lesão em avaliação'),severity:String(player.injury.severity||'leve'),
    daysRemaining:Math.max(1,Math.ceil(Number(player.injury.daysRemaining)||1)),
    recurrenceRisk:clamp(player.injury.recurrenceRisk??8,0,45),cause:String(player.injury.cause||'partida'),occurredAt:player.injury.occurredAt||null
  }:null;
  if(!result.injury&&player?.injuredUntil)result.injury={type:'Lesão em recuperação',severity:'leve',daysRemaining:5,recurrenceRisk:6,cause:'save anterior',occurredAt:null};
  refreshPlayerRatings(result);
  return result;
}

export function positionFit(actual,expected){
  if(actual===expected)return 1;
  if(POSITION_FAMILIES.some(group=>group.has(String(actual))&&group.has(String(expected))))return .91;
  if(actual==='GOL'||expected==='GOL')return .42;
  return .72;
}

export function isPlayerAvailable(player){return Boolean(player)&&!player.suspended&&!(player.injury&&Number(player.injury.daysRemaining)>0);}

export function effectiveOverall(player,role=player?.pos){
  if(!player)return 0;
  const base=Number(player.positionRatings?.[role]??calculatePositionRating(player,role));
  const fit=positionFit(player.pos,role);
  const condition=(clamp(player.fitness??85,1,100)-82)*.075+(clamp(player.form??70,1,100)-70)*.045+
    (clamp(player.sharpness??70,1,100)-70)*.032+(clamp(player.morale??70,1,100)-70)*.022+
    (clamp(player.chemistry??68,1,100)-68)*.018-Math.max(0,clamp(player.workload??30,0,100)-72)*.07;
  return clamp(Math.round((base*fit+condition)*10)/10,1,99);
}

export function selectBestLineup(roster=[],formation='4-3-3'){
  const roles=FORMATION_ROLES[formation]||FORMATION_ROLES['4-3-3'],available=roster.filter(isPlayerAvailable),picked=[];
  roles.forEach(role=>{
    const choice=available.filter(player=>!picked.includes(player)).sort((a,b)=>{
      const score=player=>effectiveOverall(player,role)+positionFit(player.pos,role)*3-Math.max(0,player.workload-82)*.08;
      return score(b)-score(a)||Number(b.overall)-Number(a.overall);
    })[0];
    if(choice)picked.push(choice);
  });
  return picked.slice(0,11);
}

function injuryEndDate(currentDate,days){const date=new Date(currentDate||Date.now());if(Number.isNaN(date.getTime()))return null;date.setDate(date.getDate()+days);return date.toISOString();}
function injuryFromRoll(player,random,cause,currentDate,minimumDays=0){
  const roll=random();let type,severity,days,recurrenceRisk;
  if(roll<.57){type='Contusão muscular leve';severity='leve';days=3+Math.floor(random()*5);recurrenceRisk=5;}
  else if(roll<.9){type='Lesão muscular';severity='moderada';days=9+Math.floor(random()*13);recurrenceRisk=11;}
  else{type='Lesão ligamentar';severity='grave';days=32+Math.floor(random()*45);recurrenceRisk=19;}
  days=Math.max(days,minimumDays);
  const injury={type,severity,daysRemaining:days,recurrenceRisk,cause,occurredAt:currentDate||null};
  player.injury=injury;player.injuredUntil=injuryEndDate(currentDate,days);player.injuryHistory=[...(player.injuryHistory||[]),{...injury}].slice(-12);
  player.recurrenceRisk=recurrenceRisk;
  return injury;
}

export function advanceRosterDays(roster=[],days=1,context={}){
  const elapsed=clamp(Math.floor(Number(days)||0),0,90),medical=clamp(context.medicalLevel??2,1,5),fitnessCoach=clamp(context.fitnessCoach??65,1,99),recovered=[];
  roster.forEach(player=>{
    if(player.injury?.daysRemaining>0){
      player.injury.daysRemaining=Math.max(0,player.injury.daysRemaining-elapsed);
      player.fitness=clamp(player.fitness+elapsed*(.22+medical*.09),1,100);
      if(player.injury.daysRemaining===0){recovered.push(player.name);player.injury=null;player.injuredUntil=null;player.fitness=clamp(player.fitness,62,91);player.sharpness=clamp(player.sharpness-8,1,100);}
    }else{
      player.fitness=clamp(player.fitness+elapsed*(.58+medical*.13+fitnessCoach*.002),1,100);
    }
    player.workload=clamp(player.workload-elapsed*(1.05+medical*.11),0,100);
    player.minutesLast28=Math.max(0,player.minutesLast28-elapsed*3.2);
    player.sharpness=clamp(player.sharpness-elapsed*.08,1,100);
    player.recurrenceRisk=clamp((player.recurrenceRisk||0)-elapsed*.06,0,45);
  });
  return {days:elapsed,recovered};
}

export function applyMatchConsequences(roster=[],match={},context={}){
  const performance=match.playerPerformance||{},usedIds=new Set([...match.ownLineup||[],...match.substitutedOut||[]].map(player=>player.id));
  const result=context.result||'draw',moraleDelta=result==='win'?3:result==='loss'?-2:1,injuries=[];
  roster.forEach(player=>{
    const record=performance[player.id],used=usedIds.has(player.id)||Number(record?.minutes)>0;
    if(used){
      const live=[...match.ownLineup||[],...match.substitutedOut||[]].find(item=>item.id===player.id),minutes=clamp(record?.minutes??90,0,120),rating=clamp(record?.rating??6.2,4.5,10);
      player.fitness=clamp(Math.min(player.fitness,live?.fitness??player.fitness)-1,20,100);
      player.form=clamp(player.form*.72+(rating-4)*16.67*.28,1,100);
      player.workload=clamp(player.workload+minutes/90*24,0,100);player.minutesLast28+=minutes;player.seasonMinutes+=minutes;
      player.appearances+=1;if(minutes>=60)player.starts+=1;
      player.sharpness=clamp(player.sharpness+Math.min(5,minutes/22),1,100);player.chemistry=clamp(player.chemistry+(minutes>=45?1.2:.5),1,100);
      player.morale=clamp(player.morale+moraleDelta+(rating>=7.5?2:rating<5.8?-2:0),1,100);
    }else{
      player.fitness=clamp(player.fitness+1,1,100);player.workload=clamp(player.workload-4,0,100);player.sharpness=clamp(player.sharpness-1.2,1,100);player.morale=clamp(player.morale+moraleDelta*.35,1,100);
    }
  });
  (match.injuryIncidents||[]).forEach(incident=>{
    const player=roster.find(item=>item.id===incident.playerId);if(!player)return;
    const random=randomFor(`${context.seed||match.randomState}:${player.id}:${incident.minute}`);
    const injury=injuryFromRoll(player,random,'partida',context.date,Number(incident.minimumDays||0));
    injuries.push({playerId:player.id,name:player.name,...injury});
  });
  return {injuries,used:usedIds.size};
}

export function applyTrainingWeek(roster=[],plan='tactical',context={}){
  const profile=TRAINING_PROFILES[plan]||TRAINING_PROFILES.tactical,medical=clamp(context.medicalLevel??2,1,5),training=clamp(context.trainingLevel??2,1,5),improvements=[],injuries=[];
  roster.forEach(player=>{
    const random=randomFor(`${context.seed||'training'}:${player.id}:${plan}`);
    if(player.injury?.daysRemaining>0){player.fitness=clamp(player.fitness+3+medical,1,100);player.workload=clamp(player.workload-9,0,100);return;}
    player.fitness=clamp(player.fitness+profile.fitness+medical*.8,1,100);player.workload=clamp(player.workload+profile.workload,0,100);
    player.sharpness=clamp(player.sharpness+profile.sharpness,1,100);player.chemistry=clamp(player.chemistry+profile.chemistry,1,100);player.morale=clamp(player.morale+profile.morale,1,100);
    const focus=context.individualTraining?.[player.id],focusAttribute={Físico:'stamina',Técnica:'technique',Passe:'passing',Finalização:'finishing',Defesa:'tackling'}[focus];
    const ageFactor=player.age<=20?1.45:player.age<=24?1.12:player.age<=28?.7:player.age<=31?.4:.18;
    const potentialRoom=Math.max(0,Number(player.potential||player.overall)-Number(player.overall));
    player.developmentProgress=clamp(player.developmentProgress+(2.6+training*.72)*ageFactor*Math.min(1.25,.45+potentialRoom*.09),0,199);
    if(player.developmentProgress>=100&&potentialRoom>0){
      const choices=focusAttribute?[focusAttribute,...profile.attributes]:profile.attributes,key=choices[Math.floor(random()*choices.length)];
      player.attributes[key]=clamp(attribute(player,key)+1,1,99);player.developmentProgress-=100;improvements.push({playerId:player.id,name:player.name,attribute:key});refreshPlayerRatings(player);
    }
    const overload=Math.max(0,player.workload-72)*.00022,recurrence=Number(player.recurrenceRisk||0)*.00012;
    const risk=Math.max(.0002,profile.risk+player.injuryRisk*.00011+overload+recurrence-medical*.00045);
    if(random()<risk){const injury=injuryFromRoll(player,random,'treino',context.date);injuries.push({playerId:player.id,name:player.name,...injury});}
  });
  return {plan,improvements,injuries};
}

export function processSeasonAging(roster=[],context={}){
  const improved=[],declined=[];
  roster.forEach(player=>{
    const random=randomFor(`${context.seed||context.season||'season'}:${player.id}`),previous=player.overall;
    player.age=clamp(player.age+1,15,50);player.seasonMinutes=0;player.appearances=0;player.starts=0;player.minutesLast28=0;player.workload=clamp(player.workload-18,0,100);
    if(player.age<=24&&player.overall<player.potential){
      const gains=player.age<=20?2+Math.floor(random()*3):1+Math.floor(random()*2);
      const keys=Object.keys(player.attributes||{});for(let index=0;index<gains&&keys.length;index++){const key=keys[Math.floor(random()*keys.length)];player.attributes[key]=clamp(attribute(player,key)+1,1,99);}
      if(random()<.42)player.ratingOffset=clamp(player.ratingOffset+1,-15,15);
    }else if(player.age>=31){
      const physical=['pace','stamina','strength'],drops=player.age>=35?3:player.age>=33?2:1;
      for(let index=0;index<drops;index++){const key=physical[Math.floor(random()*physical.length)];player.attributes[key]=clamp(attribute(player,key)-1,1,99);}
      if(player.age>=33||random()<.45)player.ratingOffset=clamp(player.ratingOffset-1,-15,15);
    }
    refreshPlayerRatings(player);if(player.overall>previous)improved.push({name:player.name,from:previous,to:player.overall});if(player.overall<previous)declined.push({name:player.name,from:previous,to:player.overall});
  });
  return {improved,declined};
}

export function rosterHealthSummary(roster=[]){
  const injured=roster.filter(player=>!isPlayerAvailable(player)&&!player.suspended),suspended=roster.filter(player=>player.suspended),overloaded=roster.filter(player=>player.workload>=78&&!player.injury);
  return {available:roster.length-injured.length-suspended.length,injured,suspended,overloaded,fitness:Math.round(average(roster.map(player=>player.fitness))),form:Math.round(average(roster.map(player=>player.form))),chemistry:Math.round(average(roster.map(player=>player.chemistry)))};
}
