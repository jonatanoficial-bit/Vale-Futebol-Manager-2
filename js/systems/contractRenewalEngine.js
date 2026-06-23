import { esc, money } from '../utils/dom.js';
import {
  CONTRACT_RENEWAL_VERSION,
  CONTRACT_RENEWAL_STATUS_V680,
  RENEWAL_TARGETS_V680,
  CONTRACT_PACKAGES_V680,
  CONTRACT_PROMISES_V680,
  CONTRACT_CLAUSES_V680,
  RENEWAL_EVENTS_V680,
  CONTRACT_RENEWAL_RULES_V680
} from '../data/contractRenewalData.js';

const pct = value => `${Math.max(0, Math.min(100, Number(value || 0)))}%`;
const safe = value => esc(value ?? '');

function activeTarget(state={}){
  const seed = String(state.clubId || state.ui?.selectedClub || 'santos').length + Number(state.season || 1);
  return RENEWAL_TARGETS_V680[seed % RENEWAL_TARGETS_V680.length] || RENEWAL_TARGETS_V680[0];
}

function renewalPressure(target){
  const salaryGap = Math.max(0, Number(target.requestedSalary || 0) - Number(target.currentSalary || 0));
  const contractRisk = Math.max(0, 24 - Number(target.monthsLeft || 0)) * 2.2;
  const moraleFactor = Math.max(0, 100 - Number(target.morale || 0)) * 0.45;
  return Math.round(Math.min(96, 24 + salaryGap * 42 + contractRisk + moraleFactor));
}

function boardComfort(target, state={}){
  const trust = Number(state.boardTrust || 76);
  const salaryWeight = Number(target.requestedSalary || 0) * 18;
  return Math.round(Math.max(8, Math.min(96, trust - salaryWeight + Number(target.morale || 0) * 0.25)));
}

function buildRecommendation(target, pressure, board){
  if(pressure > 78 && board < 45) return 'Negociar venda ou contrato com multa alta antes de aceitar salário elevado.';
  if(pressure > 70) return 'Abrir conversa hoje: use promessa esportiva e bônus por metas para evitar crise.';
  if(board > 72) return 'Renovação segura recomendada: preservar ativo sem quebrar teto salarial.';
  return 'Manter conversa ativa e preparar proposta equilibrada com luvas controladas.';
}

export function buildContractRenewalSnapshot(state={}){
  const target = activeTarget(state);
  const pressure = renewalPressure(target);
  const board = boardComfort(target, state);
  const projectedSalaryImpact = Math.round(((target.requestedSalary - target.currentSalary) / Math.max(0.01, target.currentSalary)) * 100);
  return {
    version: CONTRACT_RENEWAL_VERSION,
    status: CONTRACT_RENEWAL_STATUS_V680.status,
    route: 'contractRenewal',
    mobileFirst: true,
    offlineReady: true,
    noBlockingPopup: true,
    preservesOldRoutes: true,
    targetCount: RENEWAL_TARGETS_V680.length,
    packageCount: CONTRACT_PACKAGES_V680.length,
    promiseCount: CONTRACT_PROMISES_V680.length,
    clauseCount: CONTRACT_CLAUSES_V680.length,
    ruleCount: CONTRACT_RENEWAL_RULES_V680.length,
    context: {
      activePlayer: target.player,
      activeRole: target.role,
      monthsLeft: target.monthsLeft,
      currentSalary: target.currentSalary,
      requestedSalary: target.requestedSalary,
      projectedSalaryImpact,
      renewalPressure: pressure,
      boardComfort: board,
      morale: target.morale,
      agent: target.agent,
      risk: target.risk,
      recommendedAction: buildRecommendation(target, pressure, board)
    }
  };
}

export function renderContractRenewalRibbon(state={}){
  const snap = buildContractRenewalSnapshot(state);
  const c = snap.context;
  return `<section class="contract-renewal-ribbon-v680 panel">
    <div><span class="tag">v6.8 · Contratos profundos</span><h3>${safe(c.activePlayer)}</h3><p class="small">${safe(c.activeRole)} · ${c.monthsLeft} meses · ${safe(c.recommendedAction)}</p></div>
    <div class="contract-ribbon-kpis-v680"><span>Pressão ${pct(c.renewalPressure)}</span><span>Diretoria ${pct(c.boardComfort)}</span><span>Impacto salarial +${c.projectedSalaryImpact}%</span></div>
    <button class="main-btn mini" data-route="contractRenewal">Renovar</button>
  </section>`;
}

export function renderContractRenewalCenter(state={}){
  const snap = buildContractRenewalSnapshot(state);
  const c = snap.context;
  const target = activeTarget(state);
  const targets = RENEWAL_TARGETS_V680.map(t => `<article class="card renewal-target-v680 ${t.id===target.id?'active':''}"><div class="row space"><strong>${safe(t.player)}</strong><span>${t.monthsLeft}m</span></div><p>${safe(t.role)} · ${safe(t.agent)}</p><div class="meter"><span style="width:${pct(t.morale)}"></span></div><small>Risco: ${safe(t.risk)} · salário ${money(t.currentSalary)} → ${money(t.requestedSalary)}</small><button class="secondary-btn mini" data-route="${t.route}">Contexto</button></article>`).join('');
  const packages = CONTRACT_PACKAGES_V680.map(p => `<article class="card contract-package-v680"><span class="contract-icon-v680">${p.icon}</span><strong>${safe(p.title)}</strong><p>Salário +${p.salaryBoost}% · luvas ${money(p.signingFee)}</p><small>${safe(p.bonus)}</small><div class="contract-impact-row-v680"><span>Moral +${p.moraleImpact}</span><span>Diretoria ${p.boardImpact>0?'+':''}${p.boardImpact}</span></div><button class="secondary-btn mini" data-route="${p.route}">Avaliar</button></article>`).join('');
  const promises = CONTRACT_PROMISES_V680.map(p => `<div class="promise-row-v680"><div><strong>${safe(p.title)}</strong><small>${safe(p.area)} · ${safe(p.consequence)}</small></div><button class="secondary-btn mini" data-route="objectivesHub">Vincular</button></div>`).join('');
  const clauses = CONTRACT_CLAUSES_V680.map(cl => `<div class="clause-chip-v680"><strong>${safe(cl.title)}</strong><span>${safe(cl.risk)}</span></div>`).join('');
  const events = RENEWAL_EVENTS_V680.map((ev,i)=>`<div class="news-item"><strong>${i+1}. Mercado</strong><span>${safe(ev)}</span></div>`).join('');
  const rules = CONTRACT_RENEWAL_RULES_V680.map(r=>`<li>${safe(r)}</li>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="contract-renewal-shell-v680">
    <section class="panel contract-renewal-hero-v680">
      <div><span class="tag">${CONTRACT_RENEWAL_STATUS_V680.phase}</span><h1>${CONTRACT_RENEWAL_STATUS_V680.label}</h1><p class="subtitle">Renove contratos considerando salário, luvas, multa, promessa esportiva, moral, empresário, diretoria e risco de efeito dominó no vestiário.</p></div>
      <div class="row gap"><button class="main-btn" data-route="contracts">Contratos</button><button class="secondary-btn" data-route="agentMarket">Empresários</button><button class="secondary-btn" data-route="emotionalBoard">Diretoria</button></div>
    </section>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Pressão da renovação</span><strong>${pct(c.renewalPressure)}</strong><div class="meter"><span style="width:${pct(c.renewalPressure)}"></span></div></div><div class="card kpi-card"><span>Conforto da diretoria</span><strong>${pct(c.boardComfort)}</strong><div class="meter"><span style="width:${pct(c.boardComfort)}"></span></div></div><div class="card kpi-card"><span>Impacto salarial</span><strong>+${c.projectedSalaryImpact}%</strong><small>${money(c.currentSalary)} para ${money(c.requestedSalary)}</small></div><div class="card kpi-card"><span>Meses restantes</span><strong>${c.monthsLeft}</strong><small>${safe(c.risk)}</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Alvo ativo</span><h2>${safe(c.activePlayer)}</h2></div><button class="main-btn mini" data-route="matchdayPremium">Dar minutos</button></div><div class="renewal-focus-v680"><p><strong>Papel:</strong> ${safe(c.activeRole)}</p><p><strong>Empresário:</strong> ${safe(c.agent)}</p><p><strong>Moral:</strong> ${pct(c.morale)}</p><p><strong>Ação recomendada:</strong> ${safe(c.recommendedAction)}</p></div></article><article class="panel"><div class="row space"><div><span class="tag">Lista crítica</span><h2>Renovações prioritárias</h2></div><button class="secondary-btn mini" data-route="squadAI">Vestiário</button></div><div class="renewal-target-grid-v680">${targets}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Pacotes</span><h2>Modelos de proposta</h2></div><button class="secondary-btn mini" data-route="financeCenter">Finanças</button></div><div class="contract-package-grid-v680">${packages}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Promessas</span><h2>O que fica registrado</h2></div><button class="secondary-btn mini" data-route="objectivesHub">Objetivos</button></div><div class="promise-list-v680">${promises}</div></article><article class="panel"><div class="row space"><div><span class="tag">Cláusulas</span><h2>Detalhes que mudam o jogo</h2></div><button class="secondary-btn mini" data-route="agentMarket">Negociar</button></div><div class="clause-grid-v680">${clauses}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Mundo vivo</span><h2>Eventos de contrato</h2></div><button class="secondary-btn mini" data-route="liveWorld">Jornal</button></div><div class="news-list compact">${events}</div></article><article class="panel"><div class="row space"><div><span class="tag">Anti-quebra</span><h2>Regras v6.8.0</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria</button></div><ul class="small-list renewal-rules-v680">${rules}</ul></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação v6.8.0</h2></div><span class="status-pill">${snap.status}</span></div><textarea class="code-box" readonly>${safe(report)}</textarea></section>
  </section>`;
}
