import { esc } from '../utils/dom.js';
import { teams } from '../data/gameData.js';
import { schedule } from '../data/seasonData.js';
import { LIVE_CALENDAR_VERSION, liveCalendarStatus, travelProfiles, trainingLoadPresets, calendarMedicalRules, liveCalendarMicrocycle } from '../data/liveCalendarData.js';
export { LIVE_CALENDAR_VERSION };

const safe = value => esc(value ?? '');
const clamp = (value, min=0, max=100) => Math.max(min, Math.min(max, Math.round(Number(value || 0))));
const pct = value => `${clamp(value)}%`;
const dayMs = 24 * 60 * 60 * 1000;
function parseDate(value='2026-05-19'){
  const d = new Date(`${String(value).slice(0,10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? new Date('2026-05-19T12:00:00') : d;
}
function isoDate(date){ return date.toISOString().slice(0,10); }
function addDays(value, days=1){ const d = parseDate(value); d.setDate(d.getDate()+Number(days||0)); return isoDate(d); }
function daysBetween(a,b){ return Math.max(0, Math.round((parseDate(b)-parseDate(a))/dayMs)); }
function byId(list=[], id, fallback=0){ return list.find(item => item.id === id) || list[fallback] || list[0]; }
function teamById(id){ return teams.find(t=>t.id===id) || teams.find(t=>t.id==='santos') || teams[0] || {id:'santos', name:'Santos', stadium:'Vila Belmiro', country:'br'}; }
function activeClub(state={}){ return teamById(state.clubId || state.ui?.selectedClub || 'santos'); }
function rivalPool(club){
  const league = teams.filter(t=>t.leagueId === club.leagueId && t.id !== club.id);
  return league.length ? league : teams.filter(t=>t.id !== club.id);
}
function travelProfileFor(home={}, away={}, clubId='santos'){
  const awayTrip = away.id === clubId;
  if(!awayTrip) return {...travelProfiles[0], awayTrip:false, homeName:home.name, awayName:away.name};
  const sameCountry = String(home.country || 'br') === String(away.country || 'br');
  const sameLeague = String(home.leagueId || '') === String(away.leagueId || '');
  const continental = !sameCountry;
  const id = continental ? 'continental-flight' : sameLeague ? 'national-flight' : 'regional-bus';
  return {...byId(travelProfiles, id), awayTrip:true, homeName:home.name, awayName:away.name};
}
function defaultCalendarDate(state={}){ return state.career?.currentDate || state.match?.date || '2026-05-19'; }

export function normalizeLiveCalendarState(calendar={}, state={}){
  const baseDate = calendar.currentDate || defaultCalendarDate(state);
  const fatigue = clamp(calendar.teamFatigue ?? 24);
  const recovery = clamp(calendar.recoveryScore ?? 78);
  const load = clamp(calendar.weekLoad ?? 42);
  const risk = clamp(calendar.injuryRisk ?? 18);
  return {
    version: LIVE_CALENDAR_VERSION,
    schema: 750,
    currentDate: String(baseDate).slice(0,10),
    dayIndex: Math.max(1, Number(calendar.dayIndex || 1)),
    teamFatigue: fatigue,
    recoveryScore: recovery,
    weekLoad: load,
    injuryRisk: risk,
    lastTrainingPlan: calendar.lastTrainingPlan || 'balanced',
    lastTravelProfile: calendar.lastTravelProfile || null,
    travelLog: Array.isArray(calendar.travelLog) ? calendar.travelLog.slice(-20) : [],
    medicalLog: Array.isArray(calendar.medicalLog) ? calendar.medicalLog.slice(-20) : [],
    trainingLog: Array.isArray(calendar.trainingLog) ? calendar.trainingLog.slice(-20) : [],
    calendarLog: Array.isArray(calendar.calendarLog) ? calendar.calendarLog.slice(-30) : [],
    lastAppliedAt: calendar.lastAppliedAt || null
  };
}

export function buildLiveFixtureSequence(state={}, max=10){
  const club = activeClub(state);
  const rivals = rivalPool(club);
  const completedIds = new Set((state.career?.completedMatches || []).map(m=>m.id));
  const currentMatch = state.match && !state.match.finalized ? state.match : null;
  const events = schedule.map((ev,index)=>{
    if(ev.type !== 'match'){
      return {...ev, id:`${ev.date}-${ev.type}-${index}`, title:ev.title || ev.stage || ev.competition, venue:ev.venue === 'CT' ? `CT ${club.name}` : ev.venue, load: ev.type === 'training' ? 32 : 18, completed:false};
    }
    const rival = rivals[index % Math.max(1,rivals.length)] || teamById('palmeiras');
    const homeUser = index % 2 === 0;
    const home = homeUser ? club : rival;
    const away = homeUser ? rival : club;
    const matchId = `${ev.date}-${home.id}-${away.id}`;
    return {
      ...ev,
      id:matchId,
      homeId:home.id,
      awayId:away.id,
      home:home.name,
      away:away.name,
      competition: ev.competition === 'LIGA_DO_CLUBE' ? club.league : ev.competition,
      venue: ev.venue === 'ESTADIO_CLUBE' ? club.stadium : (home.stadium || ev.venue),
      title:`${home.name} x ${away.name}`,
      completed:completedIds.has(matchId),
      travel:travelProfileFor(home, away, club.id),
      load:ev.importance || 70
    };
  });
  if(currentMatch){
    const h = teamById(currentMatch.home);
    const a = teamById(currentMatch.away);
    events[0] = {
      id:currentMatch.id,
      date:currentMatch.date,
      day:'Jogo',
      type:'match',
      title:`${h.name} x ${a.name}`,
      home:h.name,
      away:a.name,
      homeId:h.id,
      awayId:a.id,
      competition:currentMatch.competition,
      stage:currentMatch.stage,
      venue:h.stadium || club.stadium,
      importance:86,
      status:'Próximo jogo',
      completed:false,
      travel:travelProfileFor(h, a, club.id),
      load:88
    };
  }
  const sorted = events.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).slice(0,max);
  return sorted.map((ev,i)=>{
    const prev = sorted[i-1];
    const restDays = prev ? Math.max(0, daysBetween(prev.date, ev.date)-1) : Math.max(0, daysBetween(defaultCalendarDate(state), ev.date));
    const density = ev.type === 'match' ? clamp(100 - restDays*18 + Number(ev.travel?.fatigue || 0), 0, 100) : clamp(Number(ev.load||20),0,100);
    return {...ev, restDays, density, awayTrip:Boolean(ev.travel?.awayTrip)};
  });
}

export function buildLiveCalendarSnapshot(state={}){
  const calendar = normalizeLiveCalendarState(state.calendar || {}, state);
  const training = state.training || {};
  const sequence = buildLiveFixtureSequence(state, 12);
  const nextMatch = sequence.find(e=>e.type==='match' && !e.completed) || sequence.find(e=>e.type==='match') || null;
  const nextAway = sequence.find(e=>e.type==='match' && e.awayTrip && !e.completed) || null;
  const weekMatches = sequence.filter(e=>e.type==='match' && daysBetween(calendar.currentDate, e.date) <= 14).length;
  const travelFatigue = sequence.filter(e=>e.awayTrip && daysBetween(calendar.currentDate, e.date) <= 14).reduce((n,e)=>n+Number(e.travel?.fatigue||0),0);
  const trainingRisk = Number(training.injuryRisk || calendar.injuryRisk || 18);
  const recovery = clamp((Number(calendar.recoveryScore||78)*0.65) + (Number(training.recoveryScore||78)*0.35));
  const teamFatigue = clamp(Number(calendar.teamFatigue||24) + Math.max(0, weekMatches-2)*7 + Math.round(travelFatigue/3));
  const injuryRisk = clamp(8 + trainingRisk*0.38 + teamFatigue*0.34 + Math.max(0, 58-recovery)*0.28 + Math.max(0, weekMatches-2)*5);
  const sharpness = clamp(Number(training.teamSharpness || 74) + Number(training.tacticalFamiliarity || 70)/5 - teamFatigue/5);
  const readiness = clamp(68 + sharpness*0.28 + recovery*0.35 - teamFatigue*0.24 - injuryRisk*0.18);
  const congestion = clamp(weekMatches*20 + travelFatigue + (nextMatch?.restDays <= 2 ? 18 : 0));
  const medicalRule = calendarMedicalRules.find(r=>injuryRisk>=r.min && injuryRisk<=r.max) || calendarMedicalRules[1];
  const nextPlan = injuryRisk > 58 ? 'recovery' : congestion > 70 ? 'light' : readiness < 70 ? 'balanced' : 'light';
  const plan = byId(trainingLoadPresets, nextPlan, 1);
  const headline = nextMatch ? `${nextMatch.title} em ${nextMatch.restDays} dia(s)` : 'Sem jogo oficial imediato';
  const recommendation = injuryRisk > 58
    ? 'Zona vermelha: use recuperação/descanso e evite treino pesado antes do próximo jogo.'
    : congestion > 70
      ? 'Sequência apertada: treino leve, viagem antecipada e rotação são recomendados.'
      : readiness < 70
        ? 'Prontidão média: treino equilibrado curto pode melhorar ritmo sem estourar carga.'
        : 'Elenco em boa zona: manter carga leve e conservar titulares para a partida.';
  return {
    version: LIVE_CALENDAR_VERSION,
    status: liveCalendarStatus.status,
    route:'calendar',
    schema:750,
    calendar,
    sequence,
    microcycle:liveCalendarMicrocycle,
    trainingLoadPresets,
    nextMatch,
    nextAway,
    metrics:{ weekMatches, travelFatigue, recovery, teamFatigue, injuryRisk, sharpness, readiness, congestion, medicalRule, recommendedPlan:plan, headline, recommendation },
    flags:{ hasTravel:!!nextAway, congested:congestion>=65, danger:injuryRisk>=59, playable:true, mobileFirst:true, saveIntegrated:true }
  };
}

export function buildCalendarActionPatch(state={}, action='advance-day'){
  const snap = buildLiveCalendarSnapshot(state);
  const calendar = normalizeLiveCalendarState(snap.calendar, state);
  const currentTraining = state.training || {};
  const planId = action === 'training-heavy' ? 'heavy' : action === 'training-light' ? 'light' : action === 'training-recovery' ? 'recovery' : action === 'training-rest' ? 'rest' : calendar.lastTrainingPlan || 'balanced';
  let plan = byId(trainingLoadPresets, planId, 2);
  let date = calendar.currentDate;
  let logTitle = '';
  let travelProfile = null;
  if(action === 'advance-day'){
    date = addDays(date, 1);
    plan = { id:'advance-day', label:'Avanço de dia', fatigue:-5, recovery:5, sharpness:0, tactical:0, injuryRisk:-2, morale:0, load:12, description:'Rotina diária processada.' };
    logTitle = `Dia avançado para ${date}: recuperação natural aplicada.`;
  } else if(action === 'apply-travel'){
    travelProfile = snap.nextAway?.travel || byId(travelProfiles, 'national-flight', 2);
    plan = { id:'travel', label:travelProfile.label, fatigue:travelProfile.fatigue, recovery:-travelProfile.recoveryCost, sharpness:-2, tactical:0, injuryRisk:travelProfile.risk, morale:-1, load:45, description:travelProfile.note };
    date = snap.nextAway ? addDays(snap.nextAway.date, -1) : addDays(date, 1);
    logTitle = `Viagem aplicada: ${travelProfile.label} (${travelProfile.km} km / ${travelProfile.hours}h).`;
  } else {
    logTitle = `${plan.label} aplicado em ${date}: ${plan.description}`;
  }
  const nextFatigue = clamp(Number(calendar.teamFatigue||24) + Number(plan.fatigue||0));
  const nextRecovery = clamp(Number(calendar.recoveryScore||78) + Number(plan.recovery||0));
  const nextInjury = clamp(Number(calendar.injuryRisk||18) + Number(plan.injuryRisk||0) + Math.max(0, nextFatigue-70)/6 - Math.max(0, nextRecovery-75)/8);
  const nextLoad = clamp(Number(plan.load||calendar.weekLoad||42));
  const now = new Date().toISOString();
  const trainingPatch = {
    ...currentTraining,
    recoveryScore:clamp(Number(currentTraining.recoveryScore||78) + Number(plan.recovery||0)),
    teamSharpness:clamp(Number(currentTraining.teamSharpness||74) + Number(plan.sharpness||0)),
    tacticalFamiliarity:clamp(Number(currentTraining.tacticalFamiliarity||70) + Number(plan.tactical||0)),
    injuryRisk:clamp(Number(currentTraining.injuryRisk||18) + Number(plan.injuryRisk||0)),
    moraleEffect:clamp(Number(currentTraining.moraleEffect||0) + Number(plan.morale||0), -30, 30),
    medicalLog:[...((currentTraining.medicalLog||[]).slice(-18)), logTitle]
  };
  return {
    calendar:{
      ...calendar,
      currentDate:date,
      dayIndex:Number(calendar.dayIndex||1)+1,
      teamFatigue:nextFatigue,
      recoveryScore:nextRecovery,
      weekLoad:nextLoad,
      injuryRisk:nextInjury,
      lastTrainingPlan:plan.id,
      lastTravelProfile:travelProfile ? travelProfile.id : calendar.lastTravelProfile,
      travelLog:travelProfile ? [...calendar.travelLog, `${date}: ${travelProfile.label} para ${travelProfile.homeName || 'fora de casa'} (${travelProfile.km} km).`].slice(-20) : calendar.travelLog,
      trainingLog: action.startsWith('training-') ? [...calendar.trainingLog, logTitle].slice(-20) : calendar.trainingLog,
      medicalLog:[...calendar.medicalLog, `Fadiga ${nextFatigue}% · recuperação ${nextRecovery}% · risco ${nextInjury}%.`].slice(-20),
      calendarLog:[...calendar.calendarLog, logTitle].slice(-30),
      lastAppliedAt:now
    },
    training:trainingPatch,
    fanMood:clamp(Number(state.fanMood||76) + Number(plan.morale||0)),
    integrationLog:[`Calendário Vivo ${LIVE_CALENDAR_VERSION}: ${logTitle}`]
  };
}

export function buildMatchCalendarPatch(state={}, result={}, match={}){
  const snap = buildLiveCalendarSnapshot(state);
  const calendar = normalizeLiveCalendarState(state.calendar || {}, state);
  const travel = match?.home === (state.clubId || 'santos') ? travelProfiles[0] : (snap.nextMatch?.travel || byId(travelProfiles, 'national-flight', 2));
  const points = Number(result.points || 0);
  const fatigueGain = 18 + Number(travel.fatigue || 0) + (points === 0 ? 3 : 0);
  const riskGain = 4 + Number(travel.risk || 0) + (Number(state.match?.tacticalBoost||0)>8 ? 2 : 0);
  const log = `Pós-jogo ${result.summary || ''}: carga +${fatigueGain}, risco +${riskGain}, ${travel.awayTrip ? travel.label : 'sem viagem pesada'}.`;
  const training = state.training || {};
  return {
    calendar:{
      ...calendar,
      currentDate:result.date || match.date || calendar.currentDate,
      teamFatigue:clamp(Number(calendar.teamFatigue||24)+fatigueGain),
      recoveryScore:clamp(Number(calendar.recoveryScore||78)-Math.round(fatigueGain/3)),
      injuryRisk:clamp(Number(calendar.injuryRisk||18)+riskGain),
      weekLoad:clamp(Number(calendar.weekLoad||42)+16),
      travelLog:travel.awayTrip ? [...calendar.travelLog, `${result.date || match.date}: retorno de ${travel.label}.`].slice(-20) : calendar.travelLog,
      medicalLog:[...calendar.medicalLog, log].slice(-20),
      calendarLog:[...calendar.calendarLog, log].slice(-30),
      lastAppliedAt:new Date().toISOString()
    },
    training:{...training, recoveryScore:clamp(Number(training.recoveryScore||78)-Math.round(fatigueGain/4)), injuryRisk:clamp(Number(training.injuryRisk||18)+riskGain), medicalLog:[...((training.medicalLog||[]).slice(-18)), log]},
    integrationLog:[`Calendário Vivo pós-jogo: ${log}`]
  };
}

export function renderLiveCalendarStrip(state={}){
  const snap = buildLiveCalendarSnapshot(state);
  const m = snap.metrics;
  return `<section class="live-calendar-strip-v750 panel">
    <div><span class="tag">v7.5 · Calendário Vivo</span><h3>${safe(m.headline)}</h3><p class="small">Fadiga ${pct(m.teamFatigue)} · recuperação ${pct(m.recovery)} · risco ${pct(m.injuryRisk)} · jogos/14d ${m.weekMatches}</p></div>
    <div class="row gap"><button class="secondary-btn mini" data-route="calendar">Gerir calendário</button><button class="secondary-btn mini" data-action="calendar-action" data-calendar-action="training-recovery">Recuperar</button></div>
  </section>`;
}

export function renderLiveCalendarCenter(state={}){
  const snap = buildLiveCalendarSnapshot(state);
  const m = snap.metrics;
  const sequence = snap.sequence.map(ev=>`<article class="calendar-event-card-v750 ${ev.type} ${ev.awayTrip?'away-trip':''} ${ev.completed?'completed':''}">
    <div class="calendar-event-date-v750"><strong>${safe(String(ev.date||'').slice(8,10))}</strong><small>${safe(ev.day || '')}</small></div>
    <div class="calendar-event-body-v750"><span class="tag">${safe(ev.type==='match' ? ev.competition : ev.competition || ev.type)}</span><h3>${safe(ev.title || `${ev.home || ''} x ${ev.away || ''}`)}</h3><p>${safe(ev.stage || ev.status || 'Planejado')} · ${safe(ev.venue || 'CT')}</p>${ev.awayTrip ? `<small>✈ ${safe(ev.travel.label)} · ${ev.travel.km} km · recuperação -${ev.travel.recoveryCost}</small>` : `<small>${ev.type==='match'?'🏟 Mando/viagem leve':'Carga planejada'} · descanso ${ev.restDays} dia(s)</small>`}</div>
    <div class="calendar-density-v750"><span>${pct(ev.density)}</span><div class="meter"><span style="width:${pct(ev.density)}"></span></div></div>
  </article>`).join('');
  const presets = trainingLoadPresets.map(p=>`<button class="calendar-plan-card-v750 ${p.id===m.recommendedPlan.id?'recommended':''}" data-action="calendar-action" data-calendar-action="${p.id==='heavy'?'training-heavy':p.id==='recovery'?'training-recovery':p.id==='rest'?'training-rest':'training-light'}">
    <span>${safe(p.icon)}</span><strong>${safe(p.label)}</strong><small>${safe(p.description)}</small><em>Carga ${pct(p.load)} · fadiga ${p.fatigue>0?'+':''}${p.fatigue}</em>
  </button>`).join('');
  const micro = snap.microcycle.map(d=>`<div class="micro-row-v750"><strong>${safe(d.day)}</strong><span>${safe(d.type)}</span><small>${safe(d.goal)}</small><div class="meter"><span style="width:${pct(d.load)}"></span></div></div>`).join('');
  const logs = (snap.calendar.calendarLog || []).slice(-8).reverse().map(l=>`<div class="mail-row compact"><strong>${safe(l)}</strong><small>registro salvo no slot atual</small></div>`).join('') || '<p class="small">Nenhum evento aplicado ainda. Use os botões de treino, viagem ou avançar dia.</p>';
  const travel = snap.nextAway ? `<strong>${safe(snap.nextAway.travel.label)}</strong><span>${safe(snap.nextAway.title)} · ${snap.nextAway.travel.km} km · ${snap.nextAway.travel.hours}h</span><small>${safe(snap.nextAway.travel.note)}</small>` : '<strong>Sem viagem pesada imediata</strong><span>Próximo compromisso não exige logística especial.</span><small>Continue monitorando sequência e treinos.</small>';
  return `<section class="calendar-v750">
    <div class="panel live-calendar-hero-v750"><div><span class="tag">${safe(liveCalendarStatus.phase)}</span><h1>Calendário Vivo, viagens e fadiga</h1><p class="small">Agora a agenda calcula sequência de jogos, viagem fora de casa, descanso entre partidas, treino leve/pesado, recuperação e risco físico antes do jogo.</p></div><div class="row gap"><button class="main-btn" data-action="calendar-action" data-calendar-action="${safe(m.recommendedPlan.id==='recovery'?'training-recovery':m.recommendedPlan.id==='heavy'?'training-heavy':'training-light')}">Aplicar recomendado</button><button class="secondary-btn" data-action="calendar-action" data-calendar-action="advance-day">Avançar dia</button><button class="secondary-btn" data-route="training">Treino</button></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Prontidão</span><strong>${pct(m.readiness)}</strong><small>${safe(m.headline)}</small></div><div class="card kpi-card"><span>Fadiga</span><strong>${pct(m.teamFatigue)}</strong><div class="meter"><span style="width:${pct(m.teamFatigue)}"></span></div></div><div class="card kpi-card"><span>Recuperação</span><strong>${pct(m.recovery)}</strong><div class="meter"><span style="width:${pct(m.recovery)}"></span></div></div><div class="card kpi-card"><span>Risco lesão</span><strong>${pct(m.injuryRisk)}</strong><small>${safe(m.medicalRule.label)}</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Agenda integrada</span><h2>Próximos compromissos</h2></div><span class="status-pill">${snap.sequence.length} eventos</span></div><div class="calendar-sequence-v750">${sequence}</div></article><article class="panel"><div class="row space"><div><span class="tag">Centro médico</span><h2>Recomendação da semana</h2></div><strong class="grade">${pct(m.congestion)}</strong></div><p class="alert">${safe(m.recommendation)}</p><div class="medical-rule-v750"><strong>${safe(m.medicalRule.label)}</strong><span>${safe(m.medicalRule.advice)}</span></div><div class="travel-box-v750">${travel}</div><div class="row gap"><button class="secondary-btn" data-action="calendar-action" data-calendar-action="apply-travel">Aplicar viagem</button><button class="secondary-btn" data-action="calendar-action" data-calendar-action="training-recovery">Recuperação</button><button class="secondary-btn" data-action="calendar-action" data-calendar-action="training-heavy">Treino pesado</button></div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Treino semanal</span><h2>Carga por decisão</h2></div><span class="status-pill">Recomendado: ${safe(m.recommendedPlan.label)}</span></div><div class="calendar-plan-grid-v750">${presets}</div></article><article class="panel"><div class="row space"><div><span class="tag">Microciclo realista</span><h2>Modelo da semana</h2></div><button class="secondary-btn mini" data-route="training">Detalhar treino</button></div><div class="microcycle-v750">${micro}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Save integrado</span><h2>Registro de calendário</h2></div><button class="secondary-btn mini" data-route="saveSlotsV2">Slots</button></div><div class="premium-list">${logs}</div></section>
  </section>`;
}
