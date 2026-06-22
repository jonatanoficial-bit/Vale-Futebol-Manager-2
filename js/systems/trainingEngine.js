import { trainingThemes, weeklyPlan, developmentFocus, trainingStaffImpact } from '../data/trainingData.js';
import { getActiveSquad } from '../data/squadData.js';

export const TRAINING_ENGINE_VERSION = 'v4.8.0';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n||0))); }
function avg(values=[]){ return values.length ? Math.round(values.reduce((a,b)=>a+Number(b||0),0)/values.length) : 0; }
function themeById(id='possession'){ return trainingThemes.find(t=>t.id===id) || trainingThemes[0]; }

export function ensureTrainingState(training={}){
  return {
    engineVersion: TRAINING_ENGINE_VERSION,
    selectedTheme: training.selectedTheme || 'possession',
    week: Math.max(1, Number(training.week||1)),
    microcycleHistory: Array.isArray(training.microcycleHistory) ? training.microcycleHistory.slice(-20) : [],
    playerDevelopment: training.playerDevelopment && typeof training.playerDevelopment === 'object' ? training.playerDevelopment : {},
    medicalLog: Array.isArray(training.medicalLog) ? training.medicalLog.slice(-20) : [],
    academyIntake: Array.isArray(training.academyIntake) ? training.academyIntake.slice(-20) : [],
    recoveryScore: clamp(training.recoveryScore ?? 78),
    teamSharpness: clamp(training.teamSharpness ?? 74),
    tacticalFamiliarity: clamp(training.tacticalFamiliarity ?? 70),
    injuryRisk: clamp(training.injuryRisk ?? 18),
    moraleEffect: clamp(training.moraleEffect ?? 6, -30, 30),
    lastAppliedAt: training.lastAppliedAt || null
  };
}

export function buildTrainingSnapshot(state={}){
  const training = ensureTrainingState(state.training || {});
  const theme = themeById(state.ui?.trainingTheme || training.selectedTheme);
  const squad = getActiveSquad(state);
  const avgAge = avg(squad.map(p=>p.age || 24));
  const young = squad.filter(p=>Number(p.age||99)<=21).length;
  const veterans = squad.filter(p=>Number(p.age||0)>=31).length;
  const staffQuality = avg(trainingStaffImpact.map(s=>s.value));
  const weekLoad = avg(weeklyPlan.map(d=>d.load));
  const recovery = clamp(training.recoveryScore + Math.round((staffQuality-70)/6) - Math.round(theme.fatigue/10));
  const injuryRisk = clamp(Math.round(theme.risk + weekLoad/5 + veterans*1.5 - staffQuality/8 - recovery/12));
  const teamSharpness = clamp(training.teamSharpness + Math.round(theme.intensity/12) + Math.round((staffQuality-70)/8) - Math.round(injuryRisk/14));
  const tacticalFamiliarity = clamp(training.tacticalFamiliarity + (theme.id==='possession'||theme.id==='defense'?4:2));
  const readiness = clamp(Math.round((recovery*0.35)+(teamSharpness*0.35)+(tacticalFamiliarity*0.2)+(Number(state.fanMood||75)*0.1)-injuryRisk*0.25), 35, 98);
  const youthGrowth = clamp(42 + young*7 + Math.round(staffQuality/5) + (theme.id==='possession'?5:0));
  const veteranDeclineRisk = clamp(10 + veterans*6 + Math.max(0, theme.fatigue-35)/2 - recovery/8);
  const medicalStatus = injuryRisk > 44 ? 'Alerta alto' : injuryRisk > 28 ? 'Atenção controlada' : 'Sob controle';
  const progress = developmentFocus.map((p,idx)=>{
    const stored = training.playerDevelopment[p.player] || {};
    const ageBoost = Number(p.age||24)<=21 ? 8 : Number(p.age||24)>=30 ? -4 : 2;
    const nextProgress = clamp((stored.progress ?? p.progress) + Math.round(theme.intensity/18) + ageBoost/2);
    return {...p, progress: nextProgress, delta: Math.round(nextProgress - p.progress), status: nextProgress>=85?'Pronto para subir nível': nextProgress>=70?'Evolução forte':'Em desenvolvimento'};
  });
  const academyProspects = [
    {name:'Davi Vale', pos:'MEI', age:16, potential:82, focus:'Visão e último passe', readiness:clamp(youthGrowth+6)},
    {name:'Kauã Ribeiro', pos:'ATA', age:17, potential:79, focus:'Finalização e aceleração', readiness:clamp(youthGrowth-2)},
    {name:'Luan Costa', pos:'VOL', age:18, potential:77, focus:'Marcação e passe vertical', readiness:clamp(youthGrowth-5)}
  ];
  return { version: TRAINING_ENGINE_VERSION, theme, training, squadSize:squad.length, avgAge, young, veterans, staffQuality, weekLoad, recovery, injuryRisk, teamSharpness, tacticalFamiliarity, readiness, youthGrowth, veteranDeclineRisk, medicalStatus, progress, academyProspects,
    recommendation: injuryRisk>42 ? 'Reduzir carga e priorizar recuperação ativa.' : readiness<70 ? 'Aumentar foco tático sem elevar risco físico.' : 'Microciclo aprovado para jogo oficial.' };
}

export function applyTrainingWeek(state={}){
  const snap = buildTrainingSnapshot(state);
  const nextDevelopment = {};
  snap.progress.forEach(p=>{ nextDevelopment[p.player] = {progress:p.progress, focus:p.focus, updatedAt:new Date().toISOString()}; });
  const log = `Semana ${snap.training.week}: ${snap.theme.name} aplicado · prontidão ${snap.readiness}% · risco ${snap.injuryRisk}%`;
  return {
    ...snap.training,
    selectedTheme: snap.theme.id,
    week: snap.training.week + 1,
    playerDevelopment: {...snap.training.playerDevelopment, ...nextDevelopment},
    recoveryScore: snap.recovery,
    teamSharpness: snap.teamSharpness,
    tacticalFamiliarity: snap.tacticalFamiliarity,
    injuryRisk: snap.injuryRisk,
    moraleEffect: snap.readiness>=78 ? 8 : snap.readiness<60 ? -5 : 3,
    microcycleHistory: [...snap.training.microcycleHistory, log].slice(-20),
    medicalLog: [...snap.training.medicalLog, `${snap.medicalStatus}: risco ${snap.injuryRisk}% após ${snap.theme.name}.`].slice(-20),
    academyIntake: [...snap.training.academyIntake, ...snap.academyProspects.filter(p=>p.readiness>=78).map(p=>`${p.name} (${p.pos}) pronto para observação profissional.`)].slice(-20),
    lastAppliedAt: new Date().toISOString(),
    engineVersion: TRAINING_ENGINE_VERSION
  };
}

export function simulateDevelopmentCycle(state={}, weeks=4){
  let mock = {...state, training: ensureTrainingState(state.training||{})};
  const logs=[];
  for(let i=0;i<Math.max(1, Number(weeks||1));i+=1){
    const next = applyTrainingWeek(mock);
    logs.push(next.microcycleHistory[next.microcycleHistory.length-1]);
    mock = {...mock, training:next};
  }
  const snap = buildTrainingSnapshot(mock);
  return {ok:true, weeks:Number(weeks||1), logs, readiness:snap.readiness, injuryRisk:snap.injuryRisk, youthGrowth:snap.youthGrowth, veteranDeclineRisk:snap.veteranDeclineRisk};
}
