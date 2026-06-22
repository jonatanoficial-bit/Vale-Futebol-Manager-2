import { SQUAD_AI_VERSION, SQUAD_AI_STATUS_V640, SQUAD_AI_PILLARS_V640, SQUAD_AI_PLAYER_PROFILES_V640, SQUAD_AI_EVENTS_V640, SQUAD_AI_DECISIONS_V640, SQUAD_AI_MOBILE_RULES_V640 } from '../data/squadAiData.js';
import { teams } from '../data/gameData.js';

function clamp(n, min=0, max=100){ return Math.max(min, Math.min(max, Math.round(Number(n) || 0))); }
function safe(v, fallback=''){ return String(v ?? fallback).replace(/[<>]/g, ''); }
function teamById(id){ return teams.find(t=>t.id===id) || teams.find(t=>t.id==='santos') || teams[0]; }
function pct(n){ return `${clamp(n)}%`; }

export function buildSquadAiSnapshot(state={}){
  const club = teamById(state.clubId || 'santos');
  const fanMood = clamp(state.fanMood || 80);
  const boardTrust = clamp(state.boardTrust || 76);
  const moraleBase = clamp((fanMood * 0.45) + (boardTrust * 0.25) + 24);
  const matchFinalized = Boolean(state.match?.finalized);
  const crisisRisk = clamp(100 - moraleBase + (matchFinalized ? 4 : 0));
  const leadership = clamp(72 + Number(state.manager?.reputation || 50) * 0.18);
  const rotationStress = clamp(44 + (state.match?.minute > 65 ? 15 : 0) + (state.career?.matchday || 0) % 12);
  return {
    version: SQUAD_AI_VERSION,
    status: SQUAD_AI_STATUS_V640.status,
    route: 'squadAI',
    squadRoute: 'squad',
    trainingRoute: 'training',
    pressRoute: 'pressConference',
    matchdayRoute: 'matchdayPremium',
    liveWorldRoute: 'liveWorld',
    mobileFirst: true,
    offlineReady: true,
    noHeavySimulation: true,
    preservesOldRoutes: true,
    pillarCount: SQUAD_AI_PILLARS_V640.length,
    profileCount: SQUAD_AI_PLAYER_PROFILES_V640.length,
    eventCount: SQUAD_AI_EVENTS_V640.length,
    decisionCount: SQUAD_AI_DECISIONS_V640.length,
    mobileRuleCount: SQUAD_AI_MOBILE_RULES_V640.length,
    context: {
      club: club.name,
      league: club.league || 'Liga nacional',
      morale: moraleBase,
      leadership,
      crisisRisk,
      rotationStress,
      dressingRoom: crisisRisk > 58 ? 'alerta' : moraleBase > 78 ? 'positivo' : 'estável',
      lastResult: safe(state.career?.lastResult, matchFinalized ? 'partida finalizada' : 'pré-jogo')
    }
  };
}

export function renderSquadAiRibbon(state={}, snapOverride=null){
  const snap = snapOverride || buildSquadAiSnapshot(state);
  const c = snap.context;
  const call = c.crisisRisk > 58 ? 'Resolver crise' : c.rotationStress > 64 ? 'Planejar rotação' : 'Abrir vestiário';
  return `<section class="squad-ai-ribbon-v640 panel" aria-label="IA de elenco e vestiário">
    <div class="squad-ai-orb-v640"></div>
    <div class="squad-ai-ribbon-copy-v640"><span class="tag">${SQUAD_AI_VERSION} · IA de Vestiário</span><h2>${safe(c.club)}</h2><p>${safe(c.league)} · clima ${safe(c.dressingRoom)} · ${safe(c.lastResult)}</p></div>
    <div class="squad-ai-ribbon-kpis-v640"><div><span>Moral</span><strong>${pct(c.morale)}</strong></div><div><span>Liderança</span><strong>${pct(c.leadership)}</strong></div><div><span>Risco</span><strong>${pct(c.crisisRisk)}</strong></div></div>
    <div class="squad-ai-ribbon-actions-v640"><button class="main-btn mini" data-route="squadAI">${call}</button><button class="secondary-btn mini" data-route="squad">Elenco</button></div>
  </section>`;
}

export function renderSquadAiCenter(state={}){
  const snap = buildSquadAiSnapshot(state);
  const pillars = SQUAD_AI_PILLARS_V640.map((p,i)=>`<button class="card squad-ai-pillar-v640" data-route="${p.route}"><span>${p.icon}</span><strong>${i+1}. ${p.title}</strong><small>${p.focus}</small></button>`).join('');
  const profiles = SQUAD_AI_PLAYER_PROFILES_V640.map(p=>`<article class="panel squad-ai-profile-v640"><div class="row space"><div><span class="tag">${p.role}</span><h3>${p.mood}% moral</h3></div><strong>${p.risk}% risco</strong></div><div class="squad-ai-bars-v640"><label>Influência<span>${p.influence}%</span></label><div class="meter"><span style="width:${p.influence}%"></span></div><label>Risco<span>${p.risk}%</span></label><div class="meter danger-meter-v640"><span style="width:${p.risk}%"></span></div></div><p class="small">${p.note}</p></article>`).join('');
  const events = SQUAD_AI_EVENTS_V640.map(ev=>`<div class="fixture-row squad-ai-event-v640 ${ev.severity==='alta'?'danger-row-v640':''}"><div class="fixture-date"><strong>${ev.severity}</strong><small>evento</small></div><div class="fixture-main"><strong>${ev.title}</strong><span>${ev.action}</span></div><button class="secondary-btn mini" data-route="${ev.route}">agir</button></div>`).join('');
  const decisions = SQUAD_AI_DECISIONS_V640.map(d=>`<article class="card squad-ai-decision-v640"><strong>${d.title}</strong><span>${d.impact}</span><small>${d.bestFor}</small></article>`).join('');
  const rules = SQUAD_AI_MOBILE_RULES_V640.map(rule=>`<li>${rule}</li>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="squad-ai-center-v640 stack">
    <div class="panel championship-hero squad-ai-hero-v640"><div><span class="tag">${SQUAD_AI_VERSION} · ${SQUAD_AI_STATUS_V640.status}</span><h1>IA de Elenco e Vestiário</h1><p class="small">A fase adiciona leitura de moral, liderança, crise, rotação e reação do grupo para transformar elenco em sistema vivo.</p></div><div class="release-score"><strong>${pct(snap.context.morale)}</strong><small>${snap.context.dressingRoom}</small></div></div>
    ${renderSquadAiRibbon(state, snap)}
    <section class="panel"><div class="row space"><div><span class="tag">Pilares da IA</span><h2>Como o elenco reage</h2></div><button class="main-btn mini" data-route="squad">Ver elenco</button></div><div class="squad-ai-grid-v640">${pillars}</div></section>
    <section class="grid desktop-5">${profiles}</section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Eventos de vestiário</span><h2>Alertas vivos</h2></div><button class="secondary-btn mini" data-route="messages">E-mail</button></div><div class="fixture-list">${events}</div></article><article class="panel"><div class="row space"><div><span class="tag">Decisões do técnico</span><h2>Impacto imediato</h2></div><button class="secondary-btn mini" data-route="pressConference">Coletiva</button></div><div class="squad-ai-decision-grid-v640">${decisions}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Mobile safety</span><h2>Regras anti-quebra</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria</button></div><ul class="small-list squad-ai-rules-v640">${rules}</ul></section>
    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação da fase</h2></div><span class="status-pill">${snap.status}</span></div><textarea class="code-box" readonly>${report}</textarea></section>
  </section>`;
}
