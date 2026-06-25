import { teams } from '../data/gameData.js';
import { FINANCE_ENGINE_VERSION, financeProfiles, revenueStreams, expenseStreams, boardMandates, sponsorPackages, defaultActiveSponsors, ticketPolicies, prizeRules, crisisScenarios, stadiumFinanceProfiles } from '../data/financeData.js';

export const FINANCE_VERSION = FINANCE_ENGINE_VERSION;

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Math.round(Number(n||0)))); }
function moneyBRL(value=0){ return `R$ ${Number(value||0).toFixed(1)} mi`; }
function pct(value=0){ return `${clamp(value)}%`; }
function activeTeam(state={}){ return teams.find(t=>t.id===(state.clubId || state.ui?.selectedClub)) || teams[0]; }
function byId(list=[], id='', fallback=0){ return list.find(item=>item.id===id) || list[fallback] || {}; }
function stadiumProfileFor(team={}){
  const level = Number(team.level || team.reputation || 70);
  if(level >= 88) return stadiumFinanceProfiles.elite;
  if(level >= 75) return stadiumFinanceProfiles.large;
  if(level >= 55) return stadiumFinanceProfiles.medium;
  return stadiumFinanceProfiles.small;
}
function uniqueSponsors(list=[]){
  const seen = new Set();
  return list.filter(s=>{ const id=s.id || s.name; if(seen.has(id)) return false; seen.add(id); return true; });
}
function normalizeSponsor(s={}){
  const pack = sponsorPackages.find(p=>p.id===s.id) || {};
  return {
    id:s.id || pack.id || `sponsor-${Date.now()}`,
    signed:Boolean(s.signed ?? true),
    name:s.name || pack.name || 'Patrocinador local',
    tier:s.tier || pack.tier || 'Regional',
    monthly:Number(s.monthly ?? pack.monthly ?? 0.35),
    annual:Number(s.annual ?? pack.annual ?? 4.2),
    remainingMonths:Math.max(1, Number(s.remainingMonths ?? pack.termMonths ?? 12)),
    bonus:Number(s.bonus ?? pack.bonus ?? 0.8),
    satisfaction:clamp(s.satisfaction ?? 76),
    signedAt:s.signedAt || null
  };
}

export function ensureFinanceState(finance={}, state={}){
  const team = activeTeam(state);
  const baseCash = Number(finance.cash ?? state.money ?? team.budget ?? 35);
  const activeSponsors = uniqueSponsors(Array.isArray(finance.activeSponsors) && finance.activeSponsors.length ? finance.activeSponsors : defaultActiveSponsors).map(normalizeSponsor);
  return {
    engineVersion:FINANCE_VERSION,
    schema:790,
    profile: finance.profile || 'balanced',
    cash:Number(Math.max(0, baseCash).toFixed(1)),
    debt:Number(Math.max(0, Number(finance.debt ?? 18.5)).toFixed(1)),
    wageBill:Number(Math.max(0, Number(finance.wageBill ?? 10.4)).toFixed(1)),
    wageCeiling:Number(Math.max(8, Number(finance.wageCeiling ?? 16.0)).toFixed(1)),
    activeSponsors,
    ticketPolicy: finance.ticketPolicy || 'balanced',
    ticketDemand:clamp(finance.ticketDemand ?? 78),
    stadiumOccupation:clamp(finance.stadiumOccupation ?? 72),
    monthlyCycle:Math.max(1, Number(finance.monthlyCycle || 1)),
    prizeMoney:Number(Math.max(0, Number(finance.prizeMoney || 0)).toFixed(1)),
    lastMatchdayRevenue:Number(Math.max(0, Number(finance.lastMatchdayRevenue || 0)).toFixed(1)),
    sponsorReview:finance.sponsorReview || FINANCE_VERSION,
    crisisLog:Array.isArray(finance.crisisLog) ? finance.crisisLog.slice(-40) : [],
    boardWarnings:Array.isArray(finance.boardWarnings) ? finance.boardWarnings.slice(-30) : [],
    ledger:Array.isArray(finance.ledger) ? finance.ledger.slice(-60) : ['Fase 62: financeiro profundo ativado com patrocínio, bilheteria, folha e premiações.'],
    lastBoardMeetingAt:finance.lastBoardMeetingAt || null,
    lastSponsorSignedAt:finance.lastSponsorSignedAt || null
  };
}

export function buildFinanceSnapshot(state={}){
  const team = activeTeam(state);
  const finance = ensureFinanceState(state.finance || {}, state);
  const profile = financeProfiles[finance.profile] || financeProfiles.balanced;
  const ticketPolicy = byId(ticketPolicies, finance.ticketPolicy, 1);
  const staffMonthly = Number(state.staff?.usedMonthly || 0) / 1000000;
  const calendarFatigue = Number(state.calendar?.fatigue || state.calendar?.squadFatigue || 0);
  const travelCost = calendarFatigue > 65 ? 0.55 : calendarFatigue > 45 ? 0.28 : 0.12;
  const reputation = clamp(team.reputation || state.manager?.reputation || 70);
  const boardTrust = clamp(state.boardTrust || 70);
  const fanMood = clamp(state.fanMood || 70);
  const stadium = stadiumProfileFor(team);
  const capacity = Number(team.stadiumCapacity || stadium.capacity || 34000);
  const demand = clamp(finance.ticketDemand + ticketPolicy.attendanceBoost + fanMood*0.18 + reputation*0.10 - ticketPolicy.revenueRisk*0.18);
  const occupation = clamp((finance.stadiumOccupation*0.48) + demand*0.52);
  const attendance = Math.round(capacity * occupation / 100);
  const ticketGross = Number(((attendance * Number(ticketPolicy.price||108)) / 1000000).toFixed(2));
  const matchdayCosts = Number((stadium.fixedCost + stadium.securityCost + stadium.maintenance + travelCost).toFixed(2));
  const matchdayNet = Number(Math.max(0, ticketGross - matchdayCosts).toFixed(2));
  const sponsorMonthly = Number(finance.activeSponsors.reduce((sum,s)=>sum+Number(s.monthly||0),0).toFixed(2));
  const sponsorSatisfaction = finance.activeSponsors.length ? clamp(finance.activeSponsors.reduce((a,b)=>a+Number(b.satisfaction||0),0)/finance.activeSponsors.length) : 50;
  const revenueMultiplier = 0.72 + reputation/190 + fanMood/410 + sponsorSatisfaction/620;
  const expenseMultiplier = 0.86 + Number(team.level||70)/250 + profile.risk/1000;
  const revenues = revenueStreams.map(s=>{
    let value = s.monthly * revenueMultiplier;
    if(s.id==='ticketing') value = Math.max(value, matchdayNet * 1.7);
    if(s.id==='sponsorship') value = sponsorMonthly;
    if(s.id==='prize') value = Number(finance.prizeMoney || 0) / 6 + (state.career?.lastResult?.points === 3 ? 0.35 : 0);
    return {...s, value:Number(value.toFixed(2))};
  });
  const expenses = expenseStreams.map(s=>{
    let value = s.monthly * expenseMultiplier;
    if(s.id==='staff') value = Math.max(value, staffMonthly || 0.8);
    if(s.id==='squadWages') value = finance.wageBill;
    if(s.id==='operations') value += travelCost;
    if(s.id==='debt') value += finance.debt * 0.018;
    return {...s, value:Number(value.toFixed(2))};
  });
  const monthlyRevenue = Number(revenues.reduce((a,b)=>a+b.value,0).toFixed(2));
  const monthlyExpense = Number(expenses.reduce((a,b)=>a+b.value,0).toFixed(2));
  const monthlyBalance = Number((monthlyRevenue-monthlyExpense).toFixed(2));
  const annualProjection = Number((monthlyBalance*12 + finance.cash - finance.debt*0.15).toFixed(1));
  const wagePressure = clamp((finance.wageBill/Math.max(1,monthlyRevenue))*100);
  const cashPressure = clamp(finance.cash < monthlyExpense ? 78 - finance.cash : monthlyBalance < 0 ? 62 + Math.abs(monthlyBalance)*5 : 28 - monthlyBalance*1.3);
  const debtRisk = clamp(finance.debt*1.9 + (monthlyBalance<0?Math.abs(monthlyBalance)*4:0) + (finance.cash<10?12:0));
  const crisisRisk = clamp(cashPressure*0.34 + wagePressure*0.28 + debtRisk*0.22 + (100-sponsorSatisfaction)*0.16);
  const boardScore = clamp(boardTrust*0.35 + fanMood*0.17 + reputation*0.13 + (monthlyBalance>0?16:-12) + (wagePressure<67?10:-10) + (sponsorSatisfaction-60)*0.15);
  const transferLimit = Number(Math.max(0, Number(state.transfer?.budget || team.budget || 0) * (boardScore>74?1:boardScore>60?0.78:boardScore>45?0.52:0.24)).toFixed(1));
  const health = crisisRisk<30 && monthlyBalance>0 ? 'Excelente' : crisisRisk<48 ? 'Estável' : crisisRisk<66 ? 'Atenção' : crisisRisk<82 ? 'Crise' : 'Emergência';
  const activeCrisis = crisisScenarios.filter(c =>
    (c.id==='cash-shortage' && monthlyBalance < 0) ||
    (c.id==='wage-overload' && wagePressure > 67) ||
    (c.id==='sponsor-alert' && sponsorSatisfaction < 62) ||
    (c.id==='board-warning' && boardScore < 55) ||
    (c.id==='forced-sale' && crisisRisk > 82)
  );
  const sponsorshipFit = sponsorPackages.map(s=>{
    const signed = finance.activeSponsors.some(a=>a.id===s.id);
    const score = clamp(reputation - s.minRep + fanMood*0.23 + boardScore*0.18 + sponsorSatisfaction*0.08 - (signed?35:0));
    return {...s, signed, available:!signed && reputation >= s.minRep, score, projectedAnnual:Number((s.annual * (0.86 + reputation/240 + fanMood/700)).toFixed(1)), projectedMonthly:Number((s.monthly * (0.9 + reputation/250)).toFixed(2))};
  });
  return {
    version:FINANCE_VERSION,
    schema:790,
    team,
    finance,
    profile,
    ticketPolicy,
    stadium:{capacity, attendance, occupation, ticketGross, matchdayCosts, matchdayNet, demand},
    revenues,
    expenses,
    monthlyRevenue,
    monthlyExpense,
    monthlyBalance,
    annualProjection,
    wagePressure,
    cashPressure,
    debtRisk,
    crisisRisk,
    boardScore,
    transferLimit,
    health,
    sponsorSatisfaction,
    activeCrisis,
    sponsorshipFit,
    flags:{saveIntegrated:true,sponsorshipLinked:true,ticketingLinked:true,staffPayrollLinked:true,calendarTravelLinked:true,matchdayLinked:true,boardPressureLinked:true}
  };
}

export function boardObjectiveStatus(state={}){
  const snap = buildFinanceSnapshot(state);
  return boardMandates.map(m=>{
    let score = snap.boardScore;
    if(m.id==='finance') score = 100 - snap.crisisRisk;
    if(m.id==='sponsors') score = snap.sponsorSatisfaction;
    if(m.id==='fans') score = clamp((state.fanMood || 70)*0.7 + snap.stadium.occupation*0.3);
    if(m.id==='league') score = clamp((state.boardTrust||70) + (state.career?.lastResult?.points||0)*5);
    if(m.id==='academy') score = 62 + (snap.health==='Excelente'?18:0);
    if(m.id==='debt') score = 100 - snap.debtRisk;
    return {...m, score:clamp(score), status: score>=75?'No caminho':score>=55?'Monitorar':'Risco'};
  });
}

export function financeEventFeed(state={}){
  const snap = buildFinanceSnapshot(state);
  const feed = [];
  feed.push({type:'board', title:'Relatório financeiro mensal', text:`Saldo mensal projetado: ${moneyBRL(snap.monthlyBalance)}. Saúde: ${snap.health}.`});
  feed.push({type:'ticket', title:'Bilheteria', text:`Ocupação ${pct(snap.stadium.occupation)}, público ${snap.stadium.attendance.toLocaleString('pt-BR')} e renda líquida ${moneyBRL(snap.stadium.matchdayNet)}.`});
  feed.push({type:'sponsor', title:'Mercado de patrocínio', text:`Satisfação média ${pct(snap.sponsorSatisfaction)}. Melhor proposta livre: ${snap.sponsorshipFit.find(s=>s.available)?.name || 'nenhuma compatível agora'}.`});
  if(snap.activeCrisis.length) snap.activeCrisis.forEach(c=>feed.push({type:'crisis', title:c.name, text:`Gatilho: ${c.trigger}. Ação sugerida: ${c.action}.`}));
  else feed.push({type:'stability', title:'Nenhuma crise ativa', text:'Diretoria mantém operação estável e autoriza planejamento esportivo.'});
  return feed;
}

export function signSponsorPatch(state={}, sponsorId=''){
  const finance = ensureFinanceState(state.finance || {}, state);
  const snap = buildFinanceSnapshot({...state, finance});
  const proposal = snap.sponsorshipFit.find(s=>s.id===sponsorId);
  if(!proposal) return {finance, integrationLog:[`Financeiro ${FINANCE_VERSION}: proposta não encontrada.`]};
  if(!proposal.available){
    const log = `Patrocínio bloqueado: ${proposal.name} exige reputação ${proposal.minRep} e ainda não está negociável ou já está ativo.`;
    return {finance:{...finance, ledger:[...finance.ledger, log].slice(-60)}, integrationLog:[`Financeiro ${FINANCE_VERSION}: ${log}`]};
  }
  const signed = normalizeSponsor({...proposal, signed:true, monthly:proposal.projectedMonthly, annual:proposal.projectedAnnual, satisfaction:78, signedAt:new Date().toISOString()});
  const activeSponsors = uniqueSponsors([signed, ...finance.activeSponsors]).slice(0,5);
  const cash = Number((finance.cash + Number(proposal.projectedAnnual||0)*0.12).toFixed(1));
  const log = `${signed.name} fechado como ${signed.tier}: ${moneyBRL(signed.annual)}/ano, ${moneyBRL(signed.monthly)}/mês, bônus ${moneyBRL(signed.bonus)}.`;
  return {finance:{...finance, activeSponsors, cash, lastSponsorSignedAt:new Date().toISOString(), ledger:[...finance.ledger, log].slice(-60)}, money:cash, notifications:Number(state.notifications||0)+1, integrationLog:[`Financeiro ${FINANCE_VERSION}: ${log}`]};
}

export function setTicketPolicyPatch(state={}, policyId='balanced'){
  const finance = ensureFinanceState(state.finance || {}, state);
  const policy = byId(ticketPolicies, policyId, 1);
  const log = `Política de ingresso alterada para ${policy.name}: preço médio R$ ${policy.price}, ${policy.note}`;
  const moodDelta = Number(policy.moodBoost || 0) > 0 ? 1 : Number(policy.moodBoost || 0) < 0 ? -1 : 0;
  return {finance:{...finance, ticketPolicy:policy.id, ledger:[...finance.ledger, log].slice(-60)}, fanMood:clamp(Number(state.fanMood||70)+moodDelta), ui:{...(state.ui||{}), financeTicketPolicy:policy.id}, integrationLog:[`Financeiro ${FINANCE_VERSION}: ${log}`]};
}

export function simulateMatchdayRevenuePatch(state={}){
  const finance = ensureFinanceState(state.finance || {}, state);
  const snap = buildFinanceSnapshot({...state, finance});
  const resultPoints = Number(state.career?.lastResult?.points ?? 1);
  const performanceBonus = resultPoints===3 ? 0.42 : resultPoints===1 ? 0.12 : -0.08;
  const matchdayRevenue = Number(Math.max(0, snap.stadium.matchdayNet + performanceBonus).toFixed(1));
  const cash = Number((finance.cash + matchdayRevenue).toFixed(1));
  const demandDelta = resultPoints===3 ? 4 : resultPoints===1 ? 1 : -3;
  const sponsorDelta = resultPoints===3 ? 2 : resultPoints===1 ? 0 : -2;
  const activeSponsors = finance.activeSponsors.map(s=>({...s, satisfaction:clamp(Number(s.satisfaction||70)+sponsorDelta)}));
  const log = `Bilheteria processada: ${snap.stadium.attendance.toLocaleString('pt-BR')} torcedores, ocupação ${snap.stadium.occupation}%, líquido ${moneyBRL(matchdayRevenue)}.`;
  return {finance:{...finance, cash, activeSponsors, ticketDemand:clamp(finance.ticketDemand+demandDelta), stadiumOccupation:snap.stadium.occupation, lastMatchdayRevenue:matchdayRevenue, ledger:[...finance.ledger, log].slice(-60)}, money:cash, integrationLog:[`Financeiro ${FINANCE_VERSION}: ${log}`]};
}

export function applyPrizeMoneyPatch(state={}, prizeId='league-win'){
  const finance = ensureFinanceState(state.finance || {}, state);
  const prize = byId(prizeRules, prizeId, 0);
  const amount = Number(prize.amount || 0);
  const cash = Number((finance.cash + amount).toFixed(1));
  const log = `Premiação recebida: ${prize.name} · ${moneyBRL(amount)} (${prize.condition}).`;
  return {finance:{...finance, cash, prizeMoney:Number((Number(finance.prizeMoney||0)+amount).toFixed(1)), ledger:[...finance.ledger, log].slice(-60)}, money:cash, notifications:Number(state.notifications||0)+1, integrationLog:[`Financeiro ${FINANCE_VERSION}: ${log}`]};
}

export function runFinanceBoardMeetingPatch(state={}){
  const finance = ensureFinanceState(state.finance || {}, state);
  const snap = buildFinanceSnapshot({...state, finance});
  const warning = snap.activeCrisis.length ? `Crise discutida: ${snap.activeCrisis.map(c=>c.name).join(', ')}.` : 'Sem crise ativa. Diretoria autoriza continuidade do plano.';
  const boardDelta = snap.health==='Excelente' ? 3 : snap.health==='Estável' ? 1 : snap.health==='Atenção' ? -1 : -3;
  const transfer = {...(state.transfer||{}), budget:snap.transferLimit};
  const log = `Reunião financeira: saúde ${snap.health}, saldo mensal ${moneyBRL(snap.monthlyBalance)}, limite de mercado ${moneyBRL(snap.transferLimit)}. ${warning}`;
  return {finance:{...finance, lastBoardMeetingAt:new Date().toISOString(), boardWarnings:[...finance.boardWarnings, log].slice(-30), ledger:[...finance.ledger, log].slice(-60)}, transfer, boardTrust:clamp(Number(state.boardTrust||70)+boardDelta), integrationLog:[`Financeiro ${FINANCE_VERSION}: ${log}`]};
}

export function buildFinanceMatchPatch(state={}, result={}){
  const finance = ensureFinanceState(state.finance || {}, state);
  const points = Number(result.points ?? 0);
  const prizeId = points===3 ? 'league-win' : points===1 ? 'league-draw' : null;
  let patch = simulateMatchdayRevenuePatch({...state, finance, career:{...(state.career||{}), lastResult:result}});
  if(prizeId){
    const prizePatch = applyPrizeMoneyPatch({...state, finance:patch.finance, money:patch.money}, prizeId);
    patch = {...patch, ...prizePatch, integrationLog:[...(patch.integrationLog||[]), ...(prizePatch.integrationLog||[])]};
  }
  return patch;
}

export function renderFinanceRibbon(state={}){
  const snap = buildFinanceSnapshot(state);
  return `<section class="finance-ribbon-v790 panel"><div><span class="tag">v7.9 · Finanças profundas</span><h3>${snap.health} · saldo mensal ${moneyBRL(snap.monthlyBalance)}</h3><p class="small">Caixa ${moneyBRL(snap.finance.cash)} · folha ${snap.wagePressure}% da receita · patrocínio ${snap.sponsorSatisfaction}% · estádio ${snap.stadium.occupation}%</p></div><div class="row gap"><button class="secondary-btn mini" data-route="financeCenter">Centro financeiro</button><button class="secondary-btn mini" data-action="finance-board-meeting">Reunião</button></div></section>`;
}

function kpi(label,value,small=''){
  return `<div class="card kpi-card"><span>${label}</span><strong>${value}</strong><small>${small}</small></div>`;
}
function rows(list=[]){
  return list.map(item=>`<div class="finance-row-v790"><div><strong>${item.name}</strong><small>${item.note || item.condition || ''}</small></div><b>${moneyBRL(item.value ?? item.monthly ?? item.amount ?? 0)}</b></div>`).join('');
}

export function renderFinanceCenterV790(state={}, tab='overview'){
  const snap = buildFinanceSnapshot(state);
  const objectives = boardObjectiveStatus(state).map(o=>`<div class="finance-objective-v790"><div><span class="tag">${o.area}</span><strong>${o.target}</strong><small>${o.riskIfFail}</small></div><div><b>${o.score}%</b><em>${o.status}</em></div></div>`).join('');
  const active = snap.finance.activeSponsors.map(s=>`<div class="finance-sponsor-card-v790"><div><span class="tag">${s.tier}</span><h3>${s.name}</h3><p class="small">Restam ${s.remainingMonths} meses · satisfação ${s.satisfaction}% · bônus ${moneyBRL(s.bonus)}</p></div><strong>${moneyBRL(s.monthly)}/mês</strong></div>`).join('');
  const proposals = snap.sponsorshipFit.map(s=>`<article class="finance-proposal-v790 ${s.available?'available':'locked'}"><div><span class="tag">${s.tier} · ${s.exposure}</span><h3>${s.name}</h3><p class="small">${s.clause} · risco: ${s.risk}</p><small>Rep. mínima ${s.minRep} · score ${s.score}%</small></div><div><strong>${moneyBRL(s.projectedAnnual)}/ano</strong><button class="secondary-btn mini" ${s.available?'':'disabled'} data-action="finance-sign-sponsor" data-sponsor="${s.id}">${s.signed?'Ativo':s.available?'Fechar':'Bloqueado'}</button></div></article>`).join('');
  const ticketButtons = ticketPolicies.map(p=>`<button class="finance-ticket-card-v790 ${snap.ticketPolicy.id===p.id?'active':''}" data-action="finance-ticket-policy" data-policy="${p.id}"><strong>${p.name}</strong><span>R$ ${p.price}</span><small>${p.note}</small></button>`).join('');
  const crises = snap.activeCrisis.length ? snap.activeCrisis.map(c=>`<div class="finance-crisis-v790"><strong>${c.name}</strong><span>${c.trigger}</span><small>${c.action}</small></div>`).join('') : '<div class="finance-crisis-v790 safe"><strong>Nenhuma crise ativa</strong><span>Operação estável</span><small>Continue acompanhando folha, caixa e satisfação dos patrocinadores.</small></div>';
  const feed = financeEventFeed(state).map(f=>`<div class="news-item"><strong>${f.title}</strong><span>${f.text}</span></div>`).join('');
  const ledger = (snap.finance.ledger || []).slice(-10).reverse().map(l=>`<div class="finance-ledger-line-v790">${l}</div>`).join('');
  return `<section class="finance-v790">
    <div class="panel finance-hero-v790"><div><span class="tag">v7.9.0 · Fase 62</span><h1>Finanças, Patrocínio e Bilheteria Profunda</h1><p class="small">Patrocínios, folha salarial, premiações, renda de estádio, bônus por competição, pressão financeira e risco de crise agora funcionam no save e influenciam mercado/diretoria.</p></div><div class="finance-hero-actions-v790"><button class="main-btn" data-action="finance-board-meeting">Reunião financeira</button><button class="secondary-btn" data-action="finance-matchday">Processar bilheteria</button><button class="secondary-btn" data-action="finance-prize" data-prize="league-win">Simular premiação</button></div></div>
    <section class="grid desktop-4">${kpi('Saúde financeira',snap.health,`risco ${snap.crisisRisk}%`)}${kpi('Caixa',moneyBRL(snap.finance.cash),`dívida ${moneyBRL(snap.finance.debt)}`)}${kpi('Saldo mensal',moneyBRL(snap.monthlyBalance),`receita ${moneyBRL(snap.monthlyRevenue)} · despesa ${moneyBRL(snap.monthlyExpense)}`)}${kpi('Limite de mercado',moneyBRL(snap.transferLimit),`score diretoria ${snap.boardScore}%`)}</section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Fluxo de caixa</span><h2>Receitas mensais</h2></div><strong class="grade">${moneyBRL(snap.monthlyRevenue)}</strong></div><div class="finance-list-v790">${rows(snap.revenues)}</div></article><article class="panel"><div class="row space"><div><span class="tag">Custos</span><h2>Despesas e pressão</h2></div><strong class="grade">${moneyBRL(snap.monthlyExpense)}</strong></div><div class="finance-list-v790">${rows(snap.expenses)}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Bilheteria</span><h2>Estádio e política de ingresso</h2></div><strong class="grade">${snap.stadium.occupation}%</strong></div><div class="finance-stadium-v790"><div><span>Público estimado</span><strong>${snap.stadium.attendance.toLocaleString('pt-BR')}</strong></div><div><span>Receita bruta</span><strong>${moneyBRL(snap.stadium.ticketGross)}</strong></div><div><span>Custo de operação</span><strong>${moneyBRL(snap.stadium.matchdayCosts)}</strong></div><div><span>Líquido matchday</span><strong>${moneyBRL(snap.stadium.matchdayNet)}</strong></div></div><div class="finance-ticket-grid-v790">${ticketButtons}</div></article><article class="panel"><div class="row space"><div><span class="tag">Risco</span><h2>Pressão financeira</h2></div><strong class="grade">${snap.crisisRisk}%</strong></div><div class="finance-pressure-v790"><div><span>Folha/receita</span><b>${snap.wagePressure}%</b><div class="meter"><span style="width:${snap.wagePressure}%"></span></div></div><div><span>Caixa</span><b>${snap.cashPressure}%</b><div class="meter"><span style="width:${snap.cashPressure}%"></span></div></div><div><span>Dívida</span><b>${snap.debtRisk}%</b><div class="meter"><span style="width:${snap.debtRisk}%"></span></div></div></div><div class="finance-crisis-list-v790">${crises}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Patrocinadores ativos</span><h2>Contratos comerciais</h2></div><strong class="grade">${snap.sponsorSatisfaction}%</strong></div><div class="finance-sponsor-list-v790">${active}</div></article><article class="panel"><div class="row space"><div><span class="tag">Mercado comercial</span><h2>Propostas negociáveis</h2></div><span class="status-pill">Reputação + torcida</span></div><div class="finance-proposal-list-v790">${proposals}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Mandatos</span><h2>Diretoria e metas</h2></div><strong class="grade">${snap.boardScore}%</strong></div><div class="finance-objective-list-v790">${objectives}</div></article><article class="panel"><div class="row space"><div><span class="tag">Feed financeiro</span><h2>Alertas e recomendações</h2></div><button class="secondary-btn mini" data-route="emotionalBoard">Diretoria viva</button></div><div class="news-list compact">${feed}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Livro financeiro</span><h2>Últimas decisões salvas</h2></div><button class="secondary-btn mini" data-route="managerMenu">Menu</button></div><div class="finance-ledger-v790">${ledger}</div></section>
  </section>`;
}
