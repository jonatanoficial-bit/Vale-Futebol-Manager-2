import { trainingThemes, developmentFocus, trainingStaffImpact, realisticMicrocycleSessions, weeklyTrainingPresets, WEEKLY_TRAINING_VERSION } from '../data/trainingData.js';
import { getActiveSquad } from '../data/squadData.js';

export const TRAINING_ENGINE_VERSION = WEEKLY_TRAINING_VERSION;

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Math.round(Number(n||0)))); }
function avg(values=[]){ return values.length ? Math.round(values.reduce((a,b)=>a+Number(b||0),0)/values.length) : 0; }
function themeById(id='possession'){ return trainingThemes.find(t=>t.id===id) || trainingThemes[0]; }
function presetById(id='balanced'){ return weeklyTrainingPresets.find(p=>p.id===id) || weeklyTrainingPresets[0]; }
function sessionById(id='tactical'){ return realisticMicrocycleSessions.find(s=>s.id===id) || realisticMicrocycleSessions[1] || realisticMicrocycleSessions[0]; }
function sumEffects(sessions=[], key){ return sessions.reduce((n,s)=>n+Number(s.effects?.[key]||0),0); }
function sumImpact(sessions=[], key){ return sessions.reduce((n,s)=>n+Number(s.matchImpact?.[key]||0),0); }
function logLine(session){ return `${session.day} · ${session.type}: ${session.title} · carga ${session.load}%`; }
function activePresetId(state={}, training={}){
  const calendar = state.calendar || {};
  const risk = Math.max(Number(calendar.injuryRisk||0), Number(training.injuryRisk||0));
  const fatigue = Number(calendar.teamFatigue||0);
  const uiPreset = state.ui?.weeklyTrainingPreset || training.weeklyPreset;
  if(uiPreset && weeklyTrainingPresets.some(p=>p.id===uiPreset)) return uiPreset;
  if(risk >= 60 || fatigue >= 72) return 'recovery';
  if(Number(calendar.weekLoad||0) >= 68) return 'congested';
  return 'balanced';
}
function planSessions(training={}, state={}){
  const preset = presetById(activePresetId(state, training));
  const saved = Array.isArray(training.weeklyPlan) && training.weeklyPlan.length === 7 ? training.weeklyPlan : preset.sessions;
  return saved.map((id,i)=> ({...sessionById(id), day:realisticMicrocycleSessions[i]?.day || sessionById(id).day, slot:i+1}));
}

export function ensureTrainingState(training={}){
  return {
    engineVersion: TRAINING_ENGINE_VERSION,
    schema:770,
    selectedTheme: training.selectedTheme || 'possession',
    weeklyPreset: training.weeklyPreset || 'balanced',
    weeklyPlan: Array.isArray(training.weeklyPlan) && training.weeklyPlan.length === 7 ? training.weeklyPlan.slice(0,7) : presetById(training.weeklyPreset || 'balanced').sessions.slice(),
    week: Math.max(1, Number(training.week||1)),
    microcycleHistory: Array.isArray(training.microcycleHistory) ? training.microcycleHistory.slice(-30) : [],
    sessionHistory: Array.isArray(training.sessionHistory) ? training.sessionHistory.slice(-40) : [],
    playerDevelopment: training.playerDevelopment && typeof training.playerDevelopment === 'object' ? training.playerDevelopment : {},
    medicalLog: Array.isArray(training.medicalLog) ? training.medicalLog.slice(-30) : [],
    academyIntake: Array.isArray(training.academyIntake) ? training.academyIntake.slice(-20) : [],
    recoveryScore: clamp(training.recoveryScore ?? 78),
    teamSharpness: clamp(training.teamSharpness ?? 74),
    tacticalFamiliarity: clamp(training.tacticalFamiliarity ?? 70),
    physicalCondition: clamp(training.physicalCondition ?? 76),
    setPieceEfficiency: clamp(training.setPieceEfficiency ?? 64),
    finishingConfidence: clamp(training.finishingConfidence ?? 67),
    collectiveChemistry: clamp(training.collectiveChemistry ?? 70),
    weeklyLoad: clamp(training.weeklyLoad ?? 46),
    injuryRisk: clamp(training.injuryRisk ?? 18),
    moraleEffect: clamp(training.moraleEffect ?? 6, -30, 30),
    matchReadiness: clamp(training.matchReadiness ?? 74),
    matchImpact: training.matchImpact && typeof training.matchImpact === 'object' ? training.matchImpact : {attack:2, defense:2, setPieces:1, tacticalControl:2, fitness:0, injury:0},
    lastAppliedAt: training.lastAppliedAt || null
  };
}

export function buildTrainingSnapshot(state={}){
  const training = ensureTrainingState(state.training || {});
  const theme = themeById(state.ui?.trainingTheme || training.selectedTheme);
  const preset = presetById(activePresetId(state, training));
  const sessions = planSessions({...training, weeklyPreset:preset.id}, state);
  const squad = getActiveSquad(state);
  const avgAge = avg(squad.map(p=>p.age || 24));
  const young = squad.filter(p=>Number(p.age||99)<=21).length;
  const veterans = squad.filter(p=>Number(p.age||0)>=31).length;
  const staffQuality = avg(trainingStaffImpact.map(s=>s.value));
  const weeklyLoad = clamp(avg(sessions.map(s=>s.load)) + Math.round(theme.fatigue/10));
  const recoveryDelta = sumEffects(sessions,'recovery') - Math.round(sumEffects(sessions,'fatigue')/8) + Math.round((staffQuality-72)/4);
  const fatigueDelta = sumEffects(sessions,'fatigue') + Math.round(theme.fatigue/4) - Math.round(staffQuality/14);
  const tacticalDelta = sumEffects(sessions,'tactical') + (['possession','defense','pressing'].includes(theme.id) ? 4 : 1);
  const sharpnessDelta = sumEffects(sessions,'sharpness') + Math.round(theme.intensity/16);
  const physicalDelta = sumEffects(sessions,'physical');
  const setPieceDelta = sumEffects(sessions,'setPieces') + (theme.id==='setpieces' ? 5 : 0);
  const finishingDelta = sumEffects(sessions,'finishing') + (theme.id==='finishing' ? 5 : 0);
  const collectiveDelta = sumEffects(sessions,'collective');
  const calendarFatigue = Number(state.calendar?.teamFatigue || 24);
  const calendarRisk = Number(state.calendar?.injuryRisk || 18);
  const recovery = clamp(training.recoveryScore + Math.round(recoveryDelta/7) - Math.max(0, calendarFatigue-60)/8);
  const teamSharpness = clamp(training.teamSharpness + Math.round(sharpnessDelta/7));
  const tacticalFamiliarity = clamp(training.tacticalFamiliarity + Math.round(tacticalDelta/7));
  const physicalCondition = clamp(training.physicalCondition + Math.round(physicalDelta/7) - Math.max(0, weeklyLoad-62)/10);
  const setPieceEfficiency = clamp(training.setPieceEfficiency + Math.round(setPieceDelta/7));
  const finishingConfidence = clamp(training.finishingConfidence + Math.round(finishingDelta/7));
  const collectiveChemistry = clamp(training.collectiveChemistry + Math.round(collectiveDelta/7));
  const injuryRisk = clamp(10 + calendarRisk*0.28 + weeklyLoad*0.34 + veterans*1.7 - staffQuality/8 - recovery/10 + Math.max(0, fatigueDelta)/14);
  const readiness = clamp(Math.round(recovery*0.24 + teamSharpness*0.18 + tacticalFamiliarity*0.18 + physicalCondition*0.14 + setPieceEfficiency*0.08 + finishingConfidence*0.08 + collectiveChemistry*0.10 - injuryRisk*0.20), 35, 98);
  const youthGrowth = clamp(42 + young*7 + Math.round(staffQuality/5) + (theme.id==='possession'?5:0) + Math.round(collectiveDelta/12));
  const veteranDeclineRisk = clamp(10 + veterans*6 + Math.max(0, weeklyLoad-55)/2 - recovery/8);
  const medicalStatus = injuryRisk > 59 ? 'Zona vermelha' : injuryRisk > 34 ? 'Zona amarela' : 'Zona verde';
  const attackImpact = clamp(sumImpact(sessions,'attack') + Math.round((finishingConfidence-65)/6) + (theme.id==='finishing'?4:0), -12, 20);
  const defenseImpact = clamp(sumImpact(sessions,'defense') + Math.round((tacticalFamiliarity-68)/7) + (theme.id==='defense'?4:0), -12, 20);
  const setPieceImpact = clamp(sumImpact(sessions,'setPieces') + Math.round((setPieceEfficiency-62)/6), -8, 22);
  const tacticalControl = clamp(sumImpact(sessions,'control') + Math.round((tacticalFamiliarity-68)/5) + Math.round((collectiveChemistry-68)/7), -12, 24);
  const fitnessImpact = clamp(sumImpact(sessions,'fitness') + Math.round((physicalCondition-72)/8) - Math.max(0, calendarFatigue-66)/10, -10, 14);
  const injuryImpact = clamp(sumImpact(sessions,'injury') + Math.round((injuryRisk-32)/8), -12, 16);
  const matchImpact = {attack:attackImpact, defense:defenseImpact, setPieces:setPieceImpact, tacticalControl, fitness:fitnessImpact, injury:injuryImpact, readiness};
  const progress = developmentFocus.map((p)=>{
    const stored = training.playerDevelopment[p.player] || {};
    const ageBoost = Number(p.age||24)<=21 ? 8 : Number(p.age||24)>=30 ? -4 : 2;
    const focusBoost = p.focus.toLowerCase().includes('final') ? finishingDelta/20 : p.focus.toLowerCase().includes('resist') ? physicalDelta/20 : tacticalDelta/25;
    const nextProgress = clamp((stored.progress ?? p.progress) + Math.round(theme.intensity/22) + Math.round(ageBoost/2) + Math.round(focusBoost));
    return {...p, progress: nextProgress, delta: Math.round(nextProgress - p.progress), status: nextProgress>=85?'Pronto para subir nível': nextProgress>=70?'Evolução forte':'Em desenvolvimento'};
  });
  const academyProspects = [
    {name:'Davi Vale', pos:'MEI', age:16, potential:82, focus:'Visão e último passe', readiness:clamp(youthGrowth+6)},
    {name:'Kauã Ribeiro', pos:'ATA', age:17, potential:79, focus:'Finalização e aceleração', readiness:clamp(youthGrowth-2)},
    {name:'Luan Costa', pos:'VOL', age:18, potential:77, focus:'Marcação e passe vertical', readiness:clamp(youthGrowth-5)}
  ];
  const recommendation = injuryRisk>59 ? 'Semana pesada demais: trocar físico/coletivo por recuperação antes do jogo.' : readiness<70 ? 'Prontidão média: manter tático e bola parada sem aumentar carga física.' : tacticalControl<5 ? 'Falta automação coletiva: priorizar tático e coletivo.' : 'Microciclo aprovado para jogo oficial.';
  return { version: TRAINING_ENGINE_VERSION, schema:770, theme, preset, sessions, training, squadSize:squad.length, avgAge, young, veterans, staffQuality, weekLoad:weeklyLoad, weeklyLoad, recovery, injuryRisk, teamSharpness, tacticalFamiliarity, physicalCondition, setPieceEfficiency, finishingConfidence, collectiveChemistry, readiness, matchReadiness:readiness, matchImpact, youthGrowth, veteranDeclineRisk, medicalStatus, progress, academyProspects, recommendation, flags:{saveIntegrated:true, calendarLinked:true, matchLinked:true, mobileFirst:true} };
}

export function applyTrainingSession(state={}, sessionId='tactical'){
  const training = ensureTrainingState(state.training || {});
  const session = sessionById(sessionId);
  const e = session.effects || {};
  const currentPlan = Array.isArray(training.weeklyPlan) && training.weeklyPlan.length===7 ? training.weeklyPlan.slice() : presetById(training.weeklyPreset).sessions.slice();
  const dayIndex = Math.max(0, realisticMicrocycleSessions.findIndex(s=>s.id===session.id));
  if(dayIndex >= 0) currentPlan[dayIndex] = session.id;
  const snapshotBefore = buildTrainingSnapshot({...state, training:{...training, weeklyPlan:currentPlan}});
  const line = logLine(session);
  return {
    ...training,
    weeklyPlan:currentPlan,
    weeklyPreset:'custom',
    recoveryScore:clamp(training.recoveryScore + Number(e.recovery||0)),
    teamSharpness:clamp(training.teamSharpness + Number(e.sharpness||0)),
    tacticalFamiliarity:clamp(training.tacticalFamiliarity + Number(e.tactical||0)),
    physicalCondition:clamp(training.physicalCondition + Number(e.physical||0)),
    setPieceEfficiency:clamp(training.setPieceEfficiency + Number(e.setPieces||0)),
    finishingConfidence:clamp(training.finishingConfidence + Number(e.finishing||0)),
    collectiveChemistry:clamp(training.collectiveChemistry + Number(e.collective||0)),
    weeklyLoad:clamp((training.weeklyLoad||46)*0.72 + session.load*0.28),
    injuryRisk:clamp(training.injuryRisk + Number(e.injuryRisk||0)),
    moraleEffect:clamp(Number(training.moraleEffect||0)+Number(e.morale||0), -30, 30),
    matchReadiness:snapshotBefore.readiness,
    matchImpact:snapshotBefore.matchImpact,
    sessionHistory:[...(training.sessionHistory||[]), `${new Date().toISOString()} · ${line}`].slice(-40),
    medicalLog:[...(training.medicalLog||[]), `${session.type}: carga ${session.load}% · risco ${Number(e.injuryRisk||0)>=0?'+':''}${Number(e.injuryRisk||0)}.`].slice(-30),
    lastAppliedAt:new Date().toISOString(),
    engineVersion:TRAINING_ENGINE_VERSION,
    schema:770
  };
}

export function setWeeklyTrainingPreset(training={}, presetId='balanced'){
  const preset = presetById(presetId);
  const current = ensureTrainingState(training);
  return {...current, weeklyPreset:preset.id, weeklyPlan:preset.sessions.slice(), engineVersion:TRAINING_ENGINE_VERSION, schema:770};
}

export function applyTrainingWeek(state={}){
  const snap = buildTrainingSnapshot(state);
  const nextDevelopment = {};
  snap.progress.forEach(p=>{ nextDevelopment[p.player] = {progress:p.progress, focus:p.focus, updatedAt:new Date().toISOString()}; });
  const sessionSummary = snap.sessions.map(logLine).join(' | ');
  const log = `Semana ${snap.training.week}: ${snap.preset.name} · prontidão ${snap.readiness}% · risco ${snap.injuryRisk}% · carga ${snap.weeklyLoad}%`;
  return {
    ...snap.training,
    selectedTheme: snap.theme.id,
    weeklyPreset: snap.preset.id,
    weeklyPlan: snap.sessions.map(s=>s.id),
    week: snap.training.week + 1,
    playerDevelopment: {...snap.training.playerDevelopment, ...nextDevelopment},
    recoveryScore: snap.recovery,
    teamSharpness: snap.teamSharpness,
    tacticalFamiliarity: snap.tacticalFamiliarity,
    physicalCondition: snap.physicalCondition,
    setPieceEfficiency: snap.setPieceEfficiency,
    finishingConfidence: snap.finishingConfidence,
    collectiveChemistry: snap.collectiveChemistry,
    weeklyLoad: snap.weeklyLoad,
    injuryRisk: snap.injuryRisk,
    moraleEffect: snap.readiness>=78 ? 8 : snap.readiness<60 ? -5 : 3,
    matchReadiness:snap.readiness,
    matchImpact:snap.matchImpact,
    microcycleHistory: [...snap.training.microcycleHistory, log, sessionSummary].slice(-30),
    medicalLog: [...snap.training.medicalLog, `${snap.medicalStatus}: risco ${snap.injuryRisk}% após microciclo realista.`].slice(-30),
    academyIntake: [...snap.training.academyIntake, ...snap.academyProspects.filter(p=>p.readiness>=78).map(p=>`${p.name} (${p.pos}) pronto para observação profissional.`)].slice(-20),
    lastAppliedAt: new Date().toISOString(),
    engineVersion: TRAINING_ENGINE_VERSION,
    schema:770
  };
}

export function simulateDevelopmentCycle(state={}, weeks=4){
  let mock = {...state, training: ensureTrainingState(state.training||{})};
  const logs=[];
  for(let i=0;i<Math.max(1, Number(weeks||1));i+=1){
    const next = applyTrainingWeek(mock);
    logs.push(next.microcycleHistory[next.microcycleHistory.length-2] || next.microcycleHistory[next.microcycleHistory.length-1]);
    mock = {...mock, training:next};
  }
  const snap = buildTrainingSnapshot(mock);
  return {ok:true, version:TRAINING_ENGINE_VERSION, weeks:Number(weeks||1), logs, readiness:snap.readiness, injuryRisk:snap.injuryRisk, youthGrowth:snap.youthGrowth, veteranDeclineRisk:snap.veteranDeclineRisk, matchImpact:snap.matchImpact};
}

export function buildWeeklyTrainingSnapshot(state={}){ return buildTrainingSnapshot(state); }
