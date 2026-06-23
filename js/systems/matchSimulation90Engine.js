import { esc } from '../utils/dom.js';
import {
  MATCH_SIMULATION_90_VERSION,
  MATCH_SIMULATION_90_STATUS_V700,
  MATCH_PHASES_V700,
  MOMENTUM_EVENTS_V700,
  TACTICAL_READS_V700,
  COACH_INTERVENTIONS_V700,
  COMMENTARY_BEATS_V700,
  SIMULATION_90_RULES_V700
} from '../data/matchSimulation90Data.js';

const safe = value => esc(value ?? '');
const pct = value => `${Math.max(0, Math.min(100, Math.round(Number(value || 0))))}%`;

function currentMinute(state={}){
  return Math.max(1, Math.min(90, Math.round(Number(state.match?.minute || 1))));
}

function currentPhase(minute){
  return MATCH_PHASES_V700.find(p => minute >= p.minuteStart && minute <= p.minuteEnd) || MATCH_PHASES_V700[0];
}

function pressureIndex(minute, state={}){
  const base = currentPhase(minute).intensity;
  const scoreDelta = Number(state.match?.score?.home || 0) - Number(state.match?.score?.away || 0);
  const lateBoost = minute > 75 ? 10 : minute > 60 ? 5 : 0;
  const resultTension = Math.abs(scoreDelta) <= 1 ? 9 : -4;
  return Math.max(8, Math.min(98, Math.round(base + lateBoost + resultTension)));
}

function selectedEvent(minute){
  const sorted = MOMENTUM_EVENTS_V700.slice().sort((a,b)=>Math.abs(a.minute-minute)-Math.abs(b.minute-minute));
  return sorted[0] || MOMENTUM_EVENTS_V700[0];
}

function recommendedRead(minute){
  if(minute >= 76) return TACTICAL_READS_V700.find(r=>r.id==='protect-lead') || TACTICAL_READS_V700[0];
  if(minute >= 55) return TACTICAL_READS_V700.find(r=>r.id==='late-sub') || TACTICAL_READS_V700[0];
  if(minute >= 25) return TACTICAL_READS_V700.find(r=>r.id==='press-trap') || TACTICAL_READS_V700[0];
  return TACTICAL_READS_V700[0];
}

function coachCommand(minute){
  if(minute < 35) return COACH_INTERVENTIONS_V700[0];
  if(minute < 50) return COACH_INTERVENTIONS_V700[1];
  if(minute < 70) return COACH_INTERVENTIONS_V700[2];
  return COACH_INTERVENTIONS_V700[4];
}

export function buildMatchSimulation90Snapshot(state={}){
  const minute = currentMinute(state);
  const phase = currentPhase(minute);
  const event = selectedEvent(minute);
  const read = recommendedRead(minute);
  const command = coachCommand(minute);
  return {
    version: MATCH_SIMULATION_90_VERSION,
    status: MATCH_SIMULATION_90_STATUS_V700.status,
    route: 'matchSimulation90',
    mobileFirst: true,
    offlineReady: true,
    noBlockingPopup: true,
    preservesMatchRoute: true,
    phasesCount: MATCH_PHASES_V700.length,
    eventsCount: MOMENTUM_EVENTS_V700.length,
    readsCount: TACTICAL_READS_V700.length,
    interventionsCount: COACH_INTERVENTIONS_V700.length,
    commentaryCount: COMMENTARY_BEATS_V700.length,
    rulesCount: SIMULATION_90_RULES_V700.length,
    context: {
      minute,
      activePhase: phase.title,
      phaseIntensity: phase.intensity,
      tacticalFocus: phase.tactical,
      coachCue: phase.coachCue,
      pressureIndex: pressureIndex(minute, state),
      keyEvent: event.title,
      keyEventText: event.text,
      recommendedRead: read.title,
      recommendedAdvice: read.advice,
      recommendedRoute: read.route,
      coachCommand: command.title,
      coachCommandEffect: command.effect,
      commandRoute: command.route
    }
  };
}

export function renderMatchSimulation90Strip(state={}){
  const snap = buildMatchSimulation90Snapshot(state);
  const c = snap.context;
  return `<section class="match-sim90-strip-v700 panel">
    <div><span class="tag">v7.0 · Simulação 90 minutos</span><h3>${safe(c.activePhase)}</h3><p class="small">${safe(c.tacticalFocus)} · pressão ${pct(c.pressureIndex)}</p></div>
    <div class="sim90-strip-kpis-v700"><span>${safe(c.keyEvent)}</span><span>${safe(c.coachCommand)}</span></div>
    <button class="main-btn mini" data-route="matchSimulation90">Abrir análise 90'</button>
  </section>`;
}

export function renderMatchSimulation90Center(state={}){
  const snap = buildMatchSimulation90Snapshot(state);
  const c = snap.context;
  const phases = MATCH_PHASES_V700.map(p=>`<article class="card sim90-phase-v700 ${p.title===c.activePhase?'active':''}"><div class="row space"><strong>${safe(p.title)}</strong><span>${pct(p.intensity)}</span></div><p>${safe(p.tactical)}</p><small>${safe(p.coachCue)}</small><div class="meter"><span style="width:${pct(p.intensity)}"></span></div></article>`).join('');
  const events = MOMENTUM_EVENTS_V700.map(e=>`<div class="sim90-event-dot-v700 ${safe(e.type)}" style="left:${pct(e.x)};top:${pct(e.y)}"><span>${safe(e.minute)}'</span><small>${safe(e.title)}</small></div>`).join('');
  const eventRows = MOMENTUM_EVENTS_V700.map(e=>`<div class="news-item"><strong>${safe(e.minute)}' · ${safe(e.title)}</strong><span>${safe(e.text)}</span></div>`).join('');
  const reads = TACTICAL_READS_V700.map(r=>`<article class="card sim90-read-v700"><div class="row space"><strong>${safe(r.title)}</strong><span>risco ${pct(r.risk)}</span></div><p>${safe(r.advice)}</p><div class="response-impact-v690"><span>Risco ${pct(r.risk)}</span><span>Recompensa ${pct(r.reward)}</span></div><button class="secondary-btn mini" data-route="${safe(r.route)}">Aplicar leitura</button></article>`).join('');
  const commands = COACH_INTERVENTIONS_V700.map(i=>`<article class="card sim90-command-v700"><div class="row space"><strong>${safe(i.title)}</strong><span>${safe(i.minuteWindow)}</span></div><p>${safe(i.effect)}</p><div class="response-impact-v690"><span>Moral ${i.morale>0?'+':''}${i.morale}</span><span>Tática ${i.tactical>0?'+':''}${i.tactical}</span><span>Risco ${i.risk>0?'+':''}${i.risk}</span></div><button class="secondary-btn mini" data-route="${safe(i.route)}">Comandar</button></article>`).join('');
  const commentary = COMMENTARY_BEATS_V700.map((b,i)=>`<div class="news-item"><strong>${i+1}. Camada premium</strong><span>${safe(b)}</span></div>`).join('');
  const rules = SIMULATION_90_RULES_V700.map(r=>`<li>${safe(r)}</li>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="match-sim90-shell-v700">
    <section class="panel sim90-hero-v700">
      <div><span class="tag">${safe(MATCH_SIMULATION_90_STATUS_V700.phase)}</span><h1>${safe(MATCH_SIMULATION_90_STATUS_V700.label)}</h1><p class="subtitle">Camada premium para transformar a partida em leitura de 90 minutos: fases táticas, pressão, microdecisões do treinador, eventos no campo e narrativa pós-jogo.</p></div>
      <div class="row gap"><button class="main-btn" data-route="match">Ir para partida</button><button class="secondary-btn" data-route="matchdayPremium">Matchday</button><button class="secondary-btn" data-route="squadMorale">Moral</button></div>
    </section>

    <section class="grid desktop-4"><div class="card kpi-card"><span>Minuto atual</span><strong>${safe(c.minute)}'</strong><small>${safe(c.activePhase)}</small></div><div class="card kpi-card"><span>Pressão do jogo</span><strong>${pct(c.pressureIndex)}</strong><div class="meter"><span style="width:${pct(c.pressureIndex)}"></span></div></div><div class="card kpi-card"><span>Evento-chave</span><strong>${safe(c.keyEvent)}</strong><small>${safe(c.keyEventText)}</small></div><div class="card kpi-card"><span>Comando ideal</span><strong>${safe(c.coachCommand)}</strong><small>${safe(c.coachCommandEffect)}</small></div></section>

    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Mapa 2D textual</span><h2>Momentos no campo</h2></div><button class="secondary-btn mini" data-route="match">Partida ao vivo</button></div><div class="sim90-pitch-v700"><div class="pitch-lines"><span class="center-circle"></span><span class="box left"></span><span class="box right"></span></div>${events}</div><div class="news-list compact">${eventRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Fases da partida</span><h2>Roteiro dos 90 minutos</h2></div><span class="status-pill">${safe(snap.status)}</span></div><div class="sim90-phase-grid-v700">${phases}</div></article></section>

    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Leitura tática</span><h2>O que o assistente enxerga</h2></div><button class="secondary-btn mini" data-route="formation">Tática</button></div><div class="sim90-read-grid-v700">${reads}</div></article><article class="panel"><div class="row space"><div><span class="tag">Decisão do treinador</span><h2>Microcomandos premium</h2></div><button class="secondary-btn mini" data-route="instructions">Instruções</button></div><div class="sim90-command-grid-v700">${commands}</div></article></section>

    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Narração premium</span><h2>Como a partida ganha vida</h2></div><button class="secondary-btn mini" data-route="liveWorld">Jornal</button></div><div class="news-list compact">${commentary}</div></article><article class="panel"><div class="row space"><div><span class="tag">Anti-quebra</span><h2>Regras v7.0.0</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria</button></div><ul class="small-list sim90-rules-v700">${rules}</ul></article></section>

    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação v7.0.0</h2></div><span class="status-pill">${safe(snap.status)}</span></div><textarea class="code-box" readonly>${safe(report)}</textarea></section>
  </section>`;
}
