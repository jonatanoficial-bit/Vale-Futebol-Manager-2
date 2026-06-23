import { AGENT_MARKET_VERSION, AGENT_MARKET_STATUS_V670, AGENT_PROFILES_V670, NEGOTIATION_STAGES_V670, LIVE_NEGOTIATION_CASES_V670, CONTRACT_LEVERS_V670, RIVAL_PRESSURE_EVENTS_V670, NEGOTIATION_RULES_V670 } from '../data/agentMarketData.js';
import { teams } from '../data/gameData.js';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Math.round(Number(n) || 0))); }
function money(n){ return `€ ${Number(n || 0).toFixed(1)}M`; }
function safe(v,fallback=''){ return String(v ?? fallback).replace(/[<>]/g,''); }
function teamById(id){ return teams.find(t=>t.id===id) || teams.find(t=>t.id==='santos') || teams[0]; }
function pct(n){ return `${clamp(n)}%`; }
function agentById(id){ return AGENT_PROFILES_V670.find(a=>a.id===id) || AGENT_PROFILES_V670[0]; }

export function buildAgentMarketSnapshot(state={}){
  const club = teamById(state.clubId || state.ui?.selectedClub || 'santos');
  const budget = Number(club.budget || state.money || 12);
  const boardTrust = clamp(state.boardTrust || 76);
  const fanMood = clamp(state.fanMood || 82);
  const morale = clamp(state.squad?.morale || 74);
  const rep = clamp(state.manager?.reputation || 50);
  const boardAutonomy = clamp((boardTrust * 0.52) + (rep * 0.24) + (fanMood * 0.14) + (morale * 0.10));
  const marketPower = clamp((budget * 2.1) + rep * 0.35 + boardTrust * 0.22);
  const pressure = clamp(100 - boardAutonomy + (budget < 8 ? 18 : 0));
  const activeCase = LIVE_NEGOTIATION_CASES_V670[(state.career?.completedMatches?.length || 0) % LIVE_NEGOTIATION_CASES_V670.length];
  const agent = agentById(activeCase.agent);
  const dealRisk = clamp((activeCase.value / Math.max(1,budget)) * 36 + agent.pressure * 0.38 + (100-boardTrust) * 0.22);
  const closeChance = clamp(100 - dealRisk + agent.trust * 0.24 + rep * 0.18);
  return {
    version: AGENT_MARKET_VERSION,
    status: AGENT_MARKET_STATUS_V670.status,
    route:'agentMarket',
    transferRoute:'transfers',
    smartMarketRoute:'smartMarket',
    financeRoute:'financeCenter',
    contractRoute:'contracts',
    squadAiRoute:'squadAI',
    boardRoute:'emotionalBoard',
    mobileFirst:true,
    offlineReady:true,
    noBlockingPopup:true,
    preservesOldRoutes:true,
    agentCount: AGENT_PROFILES_V670.length,
    stageCount: NEGOTIATION_STAGES_V670.length,
    caseCount: LIVE_NEGOTIATION_CASES_V670.length,
    leverCount: CONTRACT_LEVERS_V670.length,
    eventCount: RIVAL_PRESSURE_EVENTS_V670.length,
    ruleCount: NEGOTIATION_RULES_V670.length,
    context:{
      club: club.name,
      league: club.league || 'Liga nacional',
      budget,
      boardTrust,
      fanMood,
      morale,
      managerRep: rep,
      boardAutonomy,
      marketPower,
      pressure,
      activePlayer: activeCase.player,
      activeClub: activeCase.club,
      activeValue: activeCase.value,
      activeSalary: activeCase.salary,
      activeDemand: activeCase.demand,
      activeMood: activeCase.mood,
      activeRival: activeCase.rival,
      activeAgent: agent.name,
      activeAgentType: agent.temperament,
      dealRisk,
      closeChance,
      recommendedAction: closeChance >= 68 ? 'Avançar para proposta formal com bônus por metas' : dealRisk >= 68 ? 'Recuar, vender antes ou reduzir comissão' : 'Negociar projeto esportivo antes de salário'
    }
  };
}

export function renderAgentMarketRibbon(state={}, snapOverride=null){
  const snap = snapOverride || buildAgentMarketSnapshot(state);
  const c = snap.context;
  return `<section class="agent-market-ribbon-v670 panel" aria-label="Negociações vivas">
    <div class="agent-market-orb-v670"></div>
    <div class="agent-market-copy-v670"><span class="tag">${AGENT_MARKET_VERSION} · empresários</span><h2>${safe(c.activePlayer)}</h2><p>${safe(c.activeAgent)} · rival: ${safe(c.activeRival)} · risco ${pct(c.dealRisk)}</p></div>
    <div class="agent-market-kpis-v670"><div><span>Chance</span><strong>${pct(c.closeChance)}</strong></div><div><span>Autonomia</span><strong>${pct(c.boardAutonomy)}</strong></div><div><span>Pressão</span><strong>${pct(c.pressure)}</strong></div></div>
    <div class="agent-market-actions-v670"><button class="main-btn mini" data-route="agentMarket">Negociar</button><button class="secondary-btn mini" data-route="transfers">Mercado</button></div>
  </section>`;
}

export function renderAgentMarketCenter(state={}){
  const snap = buildAgentMarketSnapshot(state);
  const c = snap.context;
  const agents = AGENT_PROFILES_V670.map(a=>`<article class="card agent-card-v670"><div class="row space"><span class="agent-icon-v670">${a.icon}</span><strong>${a.trust}%</strong></div><h3>${a.name}</h3><p>${a.note}</p><div class="meter"><span style="width:${pct(a.pressure)}"></span></div><small>pressão ${a.pressure}% · tom ${a.temperament}</small><button class="secondary-btn mini" data-route="${a.route}">agir</button></article>`).join('');
  const stages = NEGOTIATION_STAGES_V670.map((s,i)=>`<div class="fixture-row negotiation-stage-v670 ${i===1?'active-agent-stage-v670':''}"><div class="fixture-date"><strong>${s.icon}</strong><small>${s.risk}</small></div><div class="fixture-main"><strong>${s.title}</strong><span>${s.action}</span></div><button class="secondary-btn mini" data-route="${s.route}">abrir</button></div>`).join('');
  const cases = LIVE_NEGOTIATION_CASES_V670.map(deal=>{ const ag=agentById(deal.agent); return `<article class="panel live-deal-v670 ${deal.player===c.activePlayer?'active-live-deal-v670':''}"><div class="row space"><span class="tag">${ag.name}</span><strong>${money(deal.value)}</strong></div><h3>${deal.player}</h3><p class="small">${deal.club} · ${deal.mood}</p><div class="stat-line"><span>Pedido</span><strong>${deal.demand}</strong></div><div class="stat-line"><span>Concorrência</span><strong>${deal.rival}</strong></div><button class="main-btn mini" data-route="${deal.route}">responder</button></article>`; }).join('');
  const levers = CONTRACT_LEVERS_V670.map(l=>`<article class="card contract-lever-v670"><h3>${l.title}</h3><p>${l.effect}</p></article>`).join('');
  const events = RIVAL_PRESSURE_EVENTS_V670.map((ev,i)=>`<div class="news-item"><strong>Alerta ${i+1}</strong><span>${ev}</span></div>`).join('');
  const rules = NEGOTIATION_RULES_V670.map(rule=>`<li>${rule}</li>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="agent-market-center-v670 stack">
    <div class="panel championship-hero agent-market-hero-v670"><div><span class="tag">${AGENT_MARKET_VERSION} · ${AGENT_MARKET_STATUS_V670.status}</span><h1>Mercado com Empresários e Negociações Vivas</h1><p class="small">O mercado deixa de ser botão seco: agora cada contratação tem agente, rival, promessa esportiva, risco financeiro e consequência no vestiário.</p></div><div class="release-score"><strong>${pct(c.closeChance)}</strong><small>chance de acordo</small></div></div>
    ${renderAgentMarketRibbon(state, snap)}
    <section class="grid desktop-4 agent-market-score-grid-v670"><div class="card kpi-card"><span>Poder de mercado</span><strong>${pct(c.marketPower)}</strong><div class="meter"><span style="width:${pct(c.marketPower)}"></span></div></div><div class="card kpi-card"><span>Autonomia da diretoria</span><strong>${pct(c.boardAutonomy)}</strong><div class="meter"><span style="width:${pct(c.boardAutonomy)}"></span></div></div><div class="card kpi-card"><span>Risco do negócio</span><strong>${pct(c.dealRisk)}</strong><div class="meter"><span style="width:${pct(c.dealRisk)}"></span></div></div><div class="card kpi-card"><span>Orçamento</span><strong>${money(c.budget)}</strong><small>${safe(c.recommendedAction)}</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Negociação ativa</span><h2>${safe(c.activePlayer)}</h2></div><button class="main-btn mini" data-route="contracts">Contrato</button></div><div class="deal-focus-v670"><p><strong>Origem:</strong> ${safe(c.activeClub)}</p><p><strong>Empresário:</strong> ${safe(c.activeAgent)} (${safe(c.activeAgentType)})</p><p><strong>Pedido:</strong> ${safe(c.activeDemand)}</p><p><strong>Rival:</strong> ${safe(c.activeRival)}</p><p><strong>Ação recomendada:</strong> ${safe(c.recommendedAction)}</p></div></article><article class="panel"><div class="row space"><div><span class="tag">Funil vivo</span><h2>Etapas da conversa</h2></div><button class="secondary-btn mini" data-route="smartMarket">Radar</button></div><div class="fixture-list">${stages}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Empresários</span><h2>Personalidades e pressão</h2></div><button class="secondary-btn mini" data-route="messages">Mensagens</button></div><div class="agent-profile-grid-v670">${agents}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Casos vivos</span><h2>Negócios em andamento</h2></div><button class="secondary-btn mini" data-route="transfers">Transferências</button></div><div class="live-deal-grid-v670">${cases}</div></article><article class="panel"><div class="row space"><div><span class="tag">Pressão rival</span><h2>O mercado reage</h2></div><button class="secondary-btn mini" data-route="liveWorld">Jornal</button></div><div class="news-list compact">${events}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Alavancas</span><h2>Como fechar sem quebrar o clube</h2></div><button class="secondary-btn mini" data-route="financeCenter">Finanças</button></div><div class="contract-lever-grid-v670">${levers}</div></article><article class="panel"><div class="row space"><div><span class="tag">Anti-quebra</span><h2>Regras da fase</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria</button></div><ul class="small-list agent-rules-v670">${rules}</ul></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação v6.7.0</h2></div><span class="status-pill">${snap.status}</span></div><textarea class="code-box" readonly>${report}</textarea></section>
  </section>`;
}
