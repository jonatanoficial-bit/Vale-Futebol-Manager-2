import { MATCHDAY_PREMIUM_VERSION, MATCHDAY_PREMIUM_STATUS_V630, MATCHDAY_PREMIUM_FLOW_V630, MATCHDAY_PREMIUM_PACKS_V630, MATCHDAY_PREMIUM_DEVICE_RULES_V630, MATCHDAY_PREMIUM_DRAMA_EVENTS_V630 } from '../data/matchdayPremiumData.js';
import { teams } from '../data/gameData.js';

function teamById(id){ return teams.find(t=>t.id===id) || teams.find(t=>t.id==='santos') || teams[0]; }
function pct(n){ return `${Math.max(0, Math.min(100, Math.round(n)))}%`; }
function safeText(v, fallback=''){ return String(v ?? fallback).replace(/[<>]/g, ''); }

export function buildMatchdayPremiumSnapshot(state={}){
  const home = teamById(state.match?.home || state.clubId || 'santos');
  const away = teamById(state.match?.away || 'palmeiras');
  const minute = Math.max(1, Math.min(90, Number(state.match?.minute || 1)));
  const phase = minute < 15 ? 'aquecimento' : minute < 46 ? 'primeiro tempo' : minute < 75 ? 'leitura de banco' : 'decisão final';
  const pressure = Math.max(35, Math.min(98, Number(state.fanMood || 78) + (minute > 70 ? 8 : 0) - (state.match?.finalized ? 6 : 0)));
  const boardPressure = Math.max(20, Math.min(96, 100 - Number(state.boardTrust || 76) + 45));
  return {
    version: MATCHDAY_PREMIUM_VERSION,
    status: MATCHDAY_PREMIUM_STATUS_V630.status,
    route: 'matchdayPremium',
    matchRoute: 'match',
    pressRoute: 'pressConference',
    liveWorldRoute: 'liveWorld',
    mobileFirst: true,
    noHeavyVideo: true,
    offlineReady: true,
    preMatchGatePreserved: true,
    postMatchJournalLinked: true,
    flowCount: MATCHDAY_PREMIUM_FLOW_V630.length,
    packCount: MATCHDAY_PREMIUM_PACKS_V630.length,
    deviceRuleCount: MATCHDAY_PREMIUM_DEVICE_RULES_V630.length,
    dramaEventCount: MATCHDAY_PREMIUM_DRAMA_EVENTS_V630.length,
    context: {
      home: home.name,
      away: away.name,
      stadium: home.stadium || 'Estádio do clube',
      competition: state.match?.competition || home.league || 'Competição oficial',
      stage: state.match?.stage || 'Rodada',
      minute,
      phase,
      pressure,
      boardPressure,
      autoPlay: Boolean(state.match?.autoPlay),
      finalized: Boolean(state.match?.finalized)
    }
  };
}

export function renderMatchdayPremiumStrip(state={}, snapOverride=null){
  const snap = snapOverride || buildMatchdayPremiumSnapshot(state);
  const c = snap.context;
  const mainCall = c.finalized ? 'Levar reação para o jornal' : c.minute < 5 ? 'Abrir transmissão premium' : 'Continuar leitura do banco';
  return `<section class="matchday-premium-strip-v630 panel" aria-label="Matchday premium">
    <div class="matchday-premium-glow-v630"></div>
    <div class="matchday-premium-copy-v630">
      <span class="tag">${MATCHDAY_PREMIUM_VERSION} · Matchday Premium</span>
      <h2>${safeText(c.home)} x ${safeText(c.away)}</h2>
      <p>${safeText(c.competition)} · ${safeText(c.stage)} · ${safeText(c.stadium)} · fase: ${safeText(c.phase)}</p>
    </div>
    <div class="matchday-premium-kpis-v630">
      <div><span>Pressão da torcida</span><strong>${pct(c.pressure)}</strong></div>
      <div><span>Diretoria</span><strong>${pct(c.boardPressure)}</strong></div>
      <div><span>Minuto</span><strong>${String(c.minute).padStart(2,'0')}'</strong></div>
    </div>
    <div class="matchday-premium-actions-v630">
      <button class="main-btn mini" data-route="match">${mainCall}</button>
      <button class="secondary-btn mini" data-route="matchdayPremium">Central matchday</button>
    </div>
  </section>`;
}

export function renderMatchdayPremiumCenter(state={}){
  const snap = buildMatchdayPremiumSnapshot(state);
  const flow = MATCHDAY_PREMIUM_FLOW_V630.map((item, index)=>`<button class="card matchday-flow-card-v630" data-route="${item.route}"><span>${item.icon}</span><strong>${index+1}. ${item.title}</strong><small>${item.focus}</small></button>`).join('');
  const packs = MATCHDAY_PREMIUM_PACKS_V630.map(pack=>`<article class="panel matchday-pack-v630"><div class="row space"><div><span class="tag">${pack.id}</span><h3>${pack.title}</h3></div><strong>${pack.items.length}/4</strong></div><ul class="small-list">${pack.items.map(x=>`<li>${x}</li>`).join('')}</ul></article>`).join('');
  const rules = MATCHDAY_PREMIUM_DEVICE_RULES_V630.map(rule=>`<li>${rule}</li>`).join('');
  const drama = MATCHDAY_PREMIUM_DRAMA_EVENTS_V630.map(ev=>`<div class="fixture-row matchday-drama-row-v630"><div class="fixture-date"><strong>${ev.minute}'</strong><small>drama</small></div><div class="fixture-main"><strong>${ev.title}</strong><span>${ev.tone}</span></div><span class="status-pill">ativo</span></div>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="matchday-premium-center-v630 stack">
    <div class="panel championship-hero matchday-hero-v630">
      <div><span class="tag">${MATCHDAY_PREMIUM_VERSION} · ${MATCHDAY_PREMIUM_STATUS_V630.status}</span><h1>Matchday Premium</h1><p class="small">A fase transforma o dia de jogo em ritual: pré-jogo, túnel, narração, banco, pós-jogo e jornal conectados sem quebrar mobile.</p></div>
      <div class="release-score"><strong>${snap.context.minute}'</strong><small>${snap.context.phase}</small></div>
    </div>
    ${renderMatchdayPremiumStrip(state, snap)}
    <section class="panel"><div class="row space"><div><span class="tag">Fluxo do dia de jogo</span><h2>Do pré-jogo ao jornal</h2></div><button class="main-btn mini" data-route="match">Jogar agora</button></div><div class="matchday-flow-grid-v630">${flow}</div></section>
    <section class="grid desktop-4">${packs}</section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Drama programado</span><h2>Momentos de tensão</h2></div><button class="secondary-btn mini" data-route="liveWorld">Jornal</button></div><div class="fixture-list">${drama}</div></article><article class="panel"><div class="row space"><div><span class="tag">Mobile safety</span><h2>Regras anti-quebra</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria</button></div><ul class="small-list matchday-rules-v630">${rules}</ul></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação da fase</h2></div><span class="status-pill">${snap.status}</span></div><textarea class="code-box" readonly>${report}</textarea></section>
  </section>`;
}
