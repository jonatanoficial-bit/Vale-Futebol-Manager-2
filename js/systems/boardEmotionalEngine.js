import { BOARD_EMOTIONAL_VERSION, BOARD_EMOTIONAL_STATUS_V660, BOARD_PILLARS_V660, BOARD_SCENARIOS_V660, BOARD_PROMISES_V660, BOARD_MEETING_TYPES_V660, EMOTIONAL_FINANCE_RULES_V660 } from '../data/boardEmotionalData.js';
import { teams } from '../data/gameData.js';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Math.round(Number(n) || 0))); }
function safe(v,fallback=''){ return String(v ?? fallback).replace(/[<>]/g,''); }
function teamById(id){ return teams.find(t=>t.id===id) || teams.find(t=>t.id==='santos') || teams[0]; }
function pct(n){ return `${clamp(n)}%`; }
function scenarioFor(score){
  if(score >= 75) return BOARD_SCENARIOS_V660[0];
  if(score >= 55) return BOARD_SCENARIOS_V660[1];
  if(score >= 35) return BOARD_SCENARIOS_V660[2];
  return BOARD_SCENARIOS_V660[3];
}

export function buildBoardEmotionalSnapshot(state={}){
  const club = teamById(state.clubId || state.ui?.selectedClub || 'santos');
  const boardTrust = clamp(state.boardTrust || 76);
  const fanMood = clamp(state.fanMood || 82);
  const managerRep = clamp(state.manager?.reputation || 50);
  const morale = clamp(state.squad?.morale || 74);
  const finance = clamp((state.finance?.health || state.clubFinance?.health || 72));
  const recent = state.career?.completedMatches || [];
  const wins = recent.slice(-5).filter(m => Number(m.homeGoals || 0) > Number(m.awayGoals || 0)).length;
  const formScore = clamp(54 + wins * 9 + Math.min(10, recent.length * 2));
  const emotionalEconomyScore = clamp((boardTrust * 0.28) + (finance * 0.22) + (fanMood * 0.18) + (morale * 0.16) + (managerRep * 0.10) + (formScore * 0.06));
  const autonomy = clamp((emotionalEconomyScore * 0.72) + (finance * 0.28));
  const pressure = clamp(100 - emotionalEconomyScore + Math.max(0, 70 - formScore) * 0.25);
  const scenario = scenarioFor(emotionalEconomyScore);
  return {
    version: BOARD_EMOTIONAL_VERSION,
    status: BOARD_EMOTIONAL_STATUS_V660.status,
    route:'emotionalBoard',
    financeRoute:'financeCenter',
    clubRoute:'club',
    objectivesRoute:'objectivesHub',
    pressRoute:'pressConference',
    liveWorldRoute:'liveWorld',
    squadAiRoute:'squadAI',
    matchdayRoute:'matchdayPremium',
    mobileFirst:true,
    offlineReady:true,
    noBlockingPopup:true,
    preservesOldRoutes:true,
    pillarCount: BOARD_PILLARS_V660.length,
    scenarioCount: BOARD_SCENARIOS_V660.length,
    promiseCount: BOARD_PROMISES_V660.length,
    meetingCount: BOARD_MEETING_TYPES_V660.length,
    ruleCount: EMOTIONAL_FINANCE_RULES_V660.length,
    context:{
      club: club.name,
      league: club.league || 'Liga nacional',
      boardTrust,
      fanMood,
      managerRep,
      morale,
      finance,
      formScore,
      emotionalEconomyScore,
      autonomy,
      pressure,
      scenario: scenario.title,
      mood: scenario.mood,
      risk: scenario.risk,
      nextMeeting: pressure > 65 ? 'Reunião de crise' : emotionalEconomyScore > 78 ? 'Reunião de projeto' : 'Reunião semanal',
      nextAction: pressure > 65 ? 'Responder diretoria antes do próximo jogo' : finance < 58 ? 'Rever orçamento e promessas' : 'Manter projeto e cumprir objetivos'
    }
  };
}

export function renderBoardEmotionalRibbon(state={}, snapOverride=null){
  const snap = snapOverride || buildBoardEmotionalSnapshot(state);
  const c = snap.context;
  return `<section class="board-emotional-ribbon-v660 panel" aria-label="Diretoria viva">
    <div class="board-emotional-orb-v660"></div>
    <div class="board-emotional-copy-v660"><span class="tag">${BOARD_EMOTIONAL_VERSION} · diretoria viva</span><h2>${safe(c.nextAction)}</h2><p>${safe(c.club)} · ${safe(c.scenario)} · risco ${safe(c.risk)}</p></div>
    <div class="board-emotional-kpis-v660"><div><span>Confiança</span><strong>${pct(c.boardTrust)}</strong></div><div><span>Autonomia</span><strong>${pct(c.autonomy)}</strong></div><div><span>Pressão</span><strong>${pct(c.pressure)}</strong></div></div>
    <div class="board-emotional-actions-v660"><button class="main-btn mini" data-route="emotionalBoard">Diretoria</button><button class="secondary-btn mini" data-route="financeCenter">Finanças</button></div>
  </section>`;
}

export function renderBoardEmotionalCenter(state={}){
  const snap = buildBoardEmotionalSnapshot(state);
  const c = snap.context;
  const pillars = BOARD_PILLARS_V660.map(p=>`<article class="card board-pillar-v660"><div class="row space"><span class="board-icon-v660">${p.icon}</span><strong>${p.weight}%</strong></div><h3>${p.title}</h3><p>${p.note}</p><button class="secondary-btn mini" data-route="${p.route}">abrir</button></article>`).join('');
  const scenarios = BOARD_SCENARIOS_V660.map(s=>`<div class="fixture-row board-scenario-v660 ${s.title===c.scenario?'active-board-scenario-v660':''}"><div class="fixture-date"><strong>${s.range}</strong><small>${s.risk}</small></div><div class="fixture-main"><strong>${s.title}</strong><span>Tom: ${s.mood}</span><small>${s.action}</small></div></div>`).join('');
  const promises = BOARD_PROMISES_V660.map(p=>`<article class="panel board-promise-v660"><div class="row space"><span class="tag">prazo: ${p.deadline}</span><strong>+${p.trustImpact}</strong></div><h3>${p.title}</h3><p class="small">${p.failure}</p><div class="row space"><small>Torcida +${p.fanImpact}</small><button class="secondary-btn mini" data-route="${p.route}">agir</button></div></article>`).join('');
  const meetings = BOARD_MEETING_TYPES_V660.map(m=>`<article class="card board-meeting-v660"><span class="tag">${m.tone}</span><h3>${m.title}</h3><p>${m.trigger}</p><small>${m.output}</small><button class="secondary-btn mini" data-route="${m.route}">preparar</button></article>`).join('');
  const rules = EMOTIONAL_FINANCE_RULES_V660.map(rule=>`<li>${rule}</li>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="board-emotional-center-v660 stack">
    <div class="panel championship-hero board-emotional-hero-v660"><div><span class="tag">${BOARD_EMOTIONAL_VERSION} · ${BOARD_EMOTIONAL_STATUS_V660.status}</span><h1>Economia Emocional e Diretoria Viva</h1><p class="small">A diretoria deixa de ser número frio: resultados, caixa, promessas, torcida e vestiário agora formam uma leitura viva da sua permanência e autonomia.</p></div><div class="release-score"><strong>${pct(c.emotionalEconomyScore)}</strong><small>${safe(c.mood)}</small></div></div>
    ${renderBoardEmotionalRibbon(state, snap)}
    <section class="grid desktop-4 board-score-grid-v660"><div class="card kpi-card"><span>Economia emocional</span><strong>${pct(c.emotionalEconomyScore)}</strong><div class="meter"><span style="width:${pct(c.emotionalEconomyScore)}"></span></div></div><div class="card kpi-card"><span>Autonomia de mercado</span><strong>${pct(c.autonomy)}</strong><div class="meter"><span style="width:${pct(c.autonomy)}"></span></div></div><div class="card kpi-card"><span>Pressão no cargo</span><strong>${pct(c.pressure)}</strong><div class="meter"><span style="width:${pct(c.pressure)}"></span></div></div><div class="card kpi-card"><span>Próxima reunião</span><strong>${safe(c.nextMeeting)}</strong><small>${safe(c.nextAction)}</small></div></section>
    <section class="panel"><div class="row space"><div><span class="tag">Leitura da diretoria</span><h2>Pilares que mudam sua autonomia</h2></div><button class="main-btn mini" data-route="objectivesHub">Ver metas</button></div><div class="board-pillars-grid-v660">${pillars}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Cenários</span><h2>Humor institucional</h2></div><strong>${safe(c.scenario)}</strong></div><div class="fixture-list">${scenarios}</div></article><article class="panel"><div class="row space"><div><span class="tag">Promessas</span><h2>Discurso vira cobrança</h2></div><button class="secondary-btn mini" data-route="pressConference">Coletiva</button></div><div class="board-promises-grid-v660">${promises}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Reuniões</span><h2>Diretoria em movimento</h2></div><button class="secondary-btn mini" data-route="messages">E-mails</button></div><div class="board-meetings-grid-v660">${meetings}</div></article><article class="panel"><div class="row space"><div><span class="tag">Anti-quebra</span><h2>Regras da fase</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria</button></div><ul class="small-list board-rules-v660">${rules}</ul></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação v6.6.0</h2></div><span class="status-pill">${snap.status}</span></div><textarea class="code-box" readonly>${report}</textarea></section>
  </section>`;
}
