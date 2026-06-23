import { esc } from '../utils/dom.js';
import {
  MORALE_CRISIS_VERSION,
  MORALE_CRISIS_STATUS_V690,
  MORALE_GROUPS_V690,
  CRISIS_TRIGGERS_V690,
  PLAYER_MORALE_CASES_V690,
  COACH_RESPONSES_V690,
  DRESSING_ROOM_EVENTS_V690,
  MORALE_CRISIS_RULES_V690
} from '../data/moraleCrisisData.js';

const safe = value => esc(value ?? '');
const pct = value => `${Math.max(0, Math.min(100, Math.round(Number(value || 0))))}%`;

function activeCase(state={}){
  const seed = String(state.clubId || state.ui?.selectedClub || 'santos').length + Number(state.season || 1) + Number(state.boardTrust || 0);
  return PLAYER_MORALE_CASES_V690[seed % PLAYER_MORALE_CASES_V690.length] || PLAYER_MORALE_CASES_V690[0];
}

function roomTemperature(){
  const moodAvg = MORALE_GROUPS_V690.reduce((sum,g)=>sum + Number(g.mood || 0),0) / Math.max(1, MORALE_GROUPS_V690.length);
  const triggerAvg = CRISIS_TRIGGERS_V690.reduce((sum,t)=>sum + Number(t.severity || 0),0) / Math.max(1, CRISIS_TRIGGERS_V690.length);
  return Math.round(Math.max(1, Math.min(99, moodAvg - (triggerAvg - 55) * 0.35)));
}

function crisisIndex(active){
  const caseRisk = Math.max(0, 100 - Number(active.morale || 0)) * 0.55 + Math.max(0, 100 - Number(active.trust || 0)) * 0.35;
  const triggerRisk = CRISIS_TRIGGERS_V690.slice(0,3).reduce((sum,t)=>sum + Number(t.severity || 0),0) / 3;
  return Math.round(Math.min(96, 18 + caseRisk + triggerRisk * 0.35));
}

function recommendedResponse(active, crisis){
  if(crisis > 78) return 'Conversa individual imediata, minutos planejados e fala pública controlada.';
  if(Number(active.morale || 0) < 50) return 'Promessa concreta para o próximo matchday e acompanhamento no jornal interno.';
  if(Number(active.trust || 0) < 58) return 'Reunião curta com líderes para reconstruir confiança antes do treino.';
  return 'Manter monitoramento, rodar elenco com transparência e preservar hierarquia.';
}

export function buildMoraleCrisisSnapshot(state={}){
  const focus = activeCase(state);
  const crisis = crisisIndex(focus);
  const temperature = roomTemperature();
  return {
    version: MORALE_CRISIS_VERSION,
    status: MORALE_CRISIS_STATUS_V690.status,
    route: 'squadMorale',
    mobileFirst: true,
    offlineReady: true,
    noBlockingPopup: true,
    preservesOldRoutes: true,
    groupsCount: MORALE_GROUPS_V690.length,
    triggersCount: CRISIS_TRIGGERS_V690.length,
    casesCount: PLAYER_MORALE_CASES_V690.length,
    responsesCount: COACH_RESPONSES_V690.length,
    rulesCount: MORALE_CRISIS_RULES_V690.length,
    context: {
      roomTemperature: temperature,
      crisisIndex: crisis,
      activePlayer: focus.player,
      activeRole: focus.role,
      activeMorale: focus.morale,
      activeTrust: focus.trust,
      activeConcern: focus.concern,
      activeDemand: focus.demand,
      recommendedAction: recommendedResponse(focus, crisis)
    }
  };
}

export function renderMoraleCrisisRibbon(state={}){
  const snap = buildMoraleCrisisSnapshot(state);
  const c = snap.context;
  return `<section class="morale-crisis-ribbon-v690 panel">
    <div><span class="tag">v6.9 · Moral avançada</span><h3>${safe(c.activePlayer)}</h3><p class="small">${safe(c.activeRole)} · crise ${pct(c.crisisIndex)} · ${safe(c.recommendedAction)}</p></div>
    <div class="morale-ribbon-kpis-v690"><span>Ambiente ${pct(c.roomTemperature)}</span><span>Moral ${pct(c.activeMorale)}</span><span>Confiança ${pct(c.activeTrust)}</span></div>
    <button class="main-btn mini" data-route="squadMorale">Resolver crise</button>
  </section>`;
}

export function renderMoraleCrisisCenter(state={}){
  const snap = buildMoraleCrisisSnapshot(state);
  const c = snap.context;
  const groups = MORALE_GROUPS_V690.map(g=>`<article class="card morale-group-v690 risk-${safe(g.risk)}"><div class="row space"><strong>${safe(g.title)}</strong><span>${safe(g.risk)}</span></div><p>${safe(g.trigger)}</p><div class="meter"><span style="width:${pct(g.mood)}"></span></div><small>Humor ${pct(g.mood)} · influência ${pct(g.influence)}</small></article>`).join('');
  const triggers = CRISIS_TRIGGERS_V690.map(t=>`<article class="card crisis-trigger-v690"><div class="row space"><strong>${safe(t.title)}</strong><span>${pct(t.severity)}</span></div><p>${safe(t.source)} · ${safe(t.action)}</p><button class="secondary-btn mini" data-route="${safe(t.linkedRoute)}">Agir</button></article>`).join('');
  const cases = PLAYER_MORALE_CASES_V690.map(p=>`<div class="player-morale-row-v690"><div><strong>${safe(p.player)}</strong><small>${safe(p.role)} · ${safe(p.concern)}</small></div><div class="morale-mini-meter-v690"><span>${pct(p.morale)}</span><div class="meter"><span style="width:${pct(p.morale)}"></span></div></div><button class="secondary-btn mini" data-route="messages">Conversar</button></div>`).join('');
  const responses = COACH_RESPONSES_V690.map(r=>`<article class="card coach-response-v690"><strong>${safe(r.title)}</strong><p>${safe(r.effect)}</p><div class="response-impact-v690"><span>Moral ${r.morale>0?'+':''}${r.morale}</span><span>Diretoria ${r.board>0?'+':''}${r.board}</span><span>Imprensa ${r.press>0?'+':''}${r.press}</span></div><button class="secondary-btn mini" data-route="${safe(r.route)}">Aplicar</button></article>`).join('');
  const events = DRESSING_ROOM_EVENTS_V690.map((ev,i)=>`<div class="news-item"><strong>${i+1}. Vestiário</strong><span>${safe(ev)}</span></div>`).join('');
  const rules = MORALE_CRISIS_RULES_V690.map(r=>`<li>${safe(r)}</li>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="morale-crisis-shell-v690">
    <section class="panel morale-crisis-hero-v690">
      <div><span class="tag">${safe(MORALE_CRISIS_STATUS_V690.phase)}</span><h1>${safe(MORALE_CRISIS_STATUS_V690.label)}</h1><p class="subtitle">Transforma banco, salário, capitão, promessas quebradas, derrotas e imprensa em crises reais de vestiário com decisões conectadas ao restante do jogo.</p></div>
      <div class="row gap"><button class="main-btn" data-route="squadAI">IA de elenco</button><button class="secondary-btn" data-route="contractRenewal">Contratos</button><button class="secondary-btn" data-route="matchdayPremium">Matchday</button></div>
    </section>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Temperatura do vestiário</span><strong>${pct(c.roomTemperature)}</strong><div class="meter"><span style="width:${pct(c.roomTemperature)}"></span></div></div><div class="card kpi-card"><span>Índice de crise</span><strong>${pct(c.crisisIndex)}</strong><div class="meter"><span style="width:${pct(c.crisisIndex)}"></span></div></div><div class="card kpi-card"><span>Confiança do foco</span><strong>${pct(c.activeTrust)}</strong><small>${safe(c.activePlayer)}</small></div><div class="card kpi-card"><span>Moral do foco</span><strong>${pct(c.activeMorale)}</strong><small>${safe(c.activeDemand)}</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Caso ativo</span><h2>${safe(c.activePlayer)}</h2></div><button class="main-btn mini" data-route="messages">Chamar conversa</button></div><div class="morale-focus-v690"><p><strong>Papel:</strong> ${safe(c.activeRole)}</p><p><strong>Preocupação:</strong> ${safe(c.activeConcern)}</p><p><strong>Pedido:</strong> ${safe(c.activeDemand)}</p><p><strong>Ação recomendada:</strong> ${safe(c.recommendedAction)}</p></div></article><article class="panel"><div class="row space"><div><span class="tag">Grupos</span><h2>Mapa do vestiário</h2></div><button class="secondary-btn mini" data-route="squad">Elenco</button></div><div class="morale-group-grid-v690">${groups}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Gatilhos</span><h2>Crises em formação</h2></div><button class="secondary-btn mini" data-route="liveWorld">Jornal</button></div><div class="crisis-trigger-grid-v690">${triggers}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Jogadores</span><h2>Casos individuais</h2></div><button class="secondary-btn mini" data-route="contractRenewal">Promessas</button></div><div class="player-morale-list-v690">${cases}</div></article><article class="panel"><div class="row space"><div><span class="tag">Respostas</span><h2>Decisões do treinador</h2></div><button class="secondary-btn mini" data-route="pressConference">Coletiva</button></div><div class="coach-response-grid-v690">${responses}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Mundo vivo</span><h2>Bastidores de hoje</h2></div><button class="secondary-btn mini" data-route="emotionalBoard">Diretoria</button></div><div class="news-list compact">${events}</div></article><article class="panel"><div class="row space"><div><span class="tag">Anti-quebra</span><h2>Regras v6.9.0</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria</button></div><ul class="small-list morale-rules-v690">${rules}</ul></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação v6.9.0</h2></div><span class="status-pill">${safe(snap.status)}</span></div><textarea class="code-box" readonly>${safe(report)}</textarea></section>
  </section>`;
}
