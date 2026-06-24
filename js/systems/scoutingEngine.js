import { esc } from '../utils/dom.js';
import { getActiveSquad, squadNeeds } from '../data/squadData.js';
import { transferShortlist } from '../data/transferData.js';
import { SCOUTING_VERSION, scoutingStatus, scoutingRegions, scoutObservers, recruitmentPriorities, externalRecruitmentPool } from '../data/scoutingData.js';
export { SCOUTING_VERSION };

const clamp = (value, min=0, max=100) => Math.max(min, Math.min(max, Math.round(Number(value || 0))));
const safe = value => esc(value ?? '');
const moneyM = value => `€ ${Number(value || 0).toFixed(1)}M`;
const slug = (name='') => String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'player';
const byId = (list=[], id, fallback=0) => list.find(item=>item.id===id) || list[fallback] || list[0];

function activeSquad(state={}){
  try { return getActiveSquad(state); } catch(err){ return []; }
}
function positionDepth(state={}, pos='ATA'){
  return activeSquad(state).filter(p=>String(p.pos||'').includes(pos)).length;
}
function bestOwnByPos(state={}, pos='ATA'){
  return activeSquad(state).filter(p=>String(p.pos||'').includes(pos)).sort((a,b)=>Number(b.overall||0)-Number(a.overall||0))[0] || null;
}
function needForPosition(pos='ATA'){
  const need = squadNeeds.find(n=>String(n.sector||'').toLowerCase().includes(String(pos).toLowerCase())) || squadNeeds[0] || {urgency:55, reason:'posição em monitoramento'};
  return { urgency: clamp(need.urgency || 55), reason: need.reason || 'posição em monitoramento' };
}
function transferTargetsAsReports(state={}){
  return (transferShortlist || []).slice(0,8).map((p,index)=>({
    id:p.id || slug(p.name),
    name:p.name,
    age:p.age || 24,
    pos:p.pos || 'MEI',
    club:p.club || 'Mercado',
    region:index % 2 ? 'br-sudeste' : 'arg-uru',
    overall:p.overall || p.rating || 72,
    potential:p.potential || Math.min(89, Number(p.overall||72)+8),
    value:p.value || 4.8,
    wage:p.wage || 0.32,
    style:p.trait || 'reforço monitorado',
    personality:p.personality || 'profissional',
    adaptation:72,
    injury:32,
    availability:'shortlist atual'
  }));
}
function candidatePool(state={}){
  const pool = [...externalRecruitmentPool, ...transferTargetsAsReports(state)];
  const seen = new Set();
  return pool.filter(p=>{ const id=p.id||slug(p.name); if(seen.has(id)) return false; seen.add(id); return true; });
}

export function normalizeScoutingState(scouting={}, state={}){
  const defaultAssignments = scoutObservers.slice(0,3).map((o,i)=>({observerId:o.id, regionId:o.regions[i % o.regions.length], status:'ativo', startedAt:'2026-05-20'}));
  return {
    version: SCOUTING_VERSION,
    schema:760,
    focus: scouting.focus || state.ui?.scoutingFocus || 'rotation',
    budgetMonthly: Number(scouting.budgetMonthly || 1.2),
    boardApproval: clamp(scouting.boardApproval ?? 78),
    recruitmentDay: Math.max(1, Number(scouting.recruitmentDay || 1)),
    assignments: Array.isArray(scouting.assignments) && scouting.assignments.length ? scouting.assignments.slice(-8) : defaultAssignments,
    reports: Array.isArray(scouting.reports) ? scouting.reports.slice(-24) : [],
    wishList: Array.isArray(scouting.wishList) ? scouting.wishList.slice(-18) : [],
    observerLog: Array.isArray(scouting.observerLog) ? scouting.observerLog.slice(-24) : [`${SCOUTING_VERSION}: departamento de scout profissional iniciado.`],
    lastReportAt: scouting.lastReportAt || null,
    lastRegion: scouting.lastRegion || 'br-sudeste'
  };
}

export function evaluateRecruitmentCandidate(player={}, state={}, observer={}, region={}, priority={}){
  const own = bestOwnByPos(state, player.pos);
  const need = needForPosition(player.pos);
  const depth = positionDepth(state, player.pos);
  const potentialGap = Math.max(0, Number(player.potential||70) - Number(own?.potential || own?.overall || 68));
  const immediateGap = Number(player.overall||70) - Number(own?.overall || 68);
  const observerBoost = Number(observer.quality||70) * 0.18 + Number(observer.reliability||70) * 0.12;
  const regionalBoost = Number(region.chance||65) * 0.16;
  const fit = clamp(44 + Number(player.adaptation||65)*0.22 + need.urgency*0.18 + Math.max(0, immediateGap)*4 + Math.max(0,potentialGap)*2 + observerBoost + regionalBoost - Math.max(0, depth-3)*4);
  const risk = clamp(Number(player.injury||30)*0.4 + Number(region.risk||35)*0.34 + Math.max(0, 72-Number(player.adaptation||65))*0.28 + (String(player.personality||'').includes('temper') ? 8 : 0));
  const costPressure = clamp((Number(player.value||0) / Math.max(1, Number(state.transfer?.budget || 40))) * 100 + (Number(player.wage||0) / Math.max(0.1, Number(state.transfer?.wageRoom || 2.4))) * 24);
  const scoutConfidence = clamp(48 + observerBoost + regionalBoost - risk*0.22 + Number(observer.patience||70)*0.06);
  const recommendation = risk > Number(priority.riskLimit || 58)
    ? 'Monitorar mais antes de avançar'
    : costPressure > Number(priority.costTolerance || 62)
      ? 'Bom jogador, mas exige negociação dura'
      : fit >= 78
        ? 'Prioridade alta para proposta'
        : fit >= 66
          ? 'Adicionar à lista de desejos'
          : 'Acompanhar sem pressa';
  const grade = fit>=82 && risk<=45 ? 'A' : fit>=74 ? 'B+' : fit>=66 ? 'B' : fit>=58 ? 'C+' : 'C';
  return { own, need, depth, fit, risk, costPressure, scoutConfidence, recommendation, grade, immediateGap, potentialGap };
}

export function buildScoutReport(state={}, regionId=null, observerId=null){
  const scouting = normalizeScoutingState(state.scouting || {}, state);
  const region = byId(scoutingRegions, regionId || scouting.lastRegion || scouting.assignments[0]?.regionId, 0);
  const assignment = scouting.assignments.find(a=>a.regionId===region.id) || scouting.assignments[0] || {observerId:observerId || scoutObservers[0].id};
  const observer = byId(scoutObservers, observerId || assignment.observerId, 0);
  const priority = byId(recruitmentPriorities, scouting.focus, 1);
  const pool = candidatePool(state).filter(p=>p.region===region.id || (region.positions||[]).includes(p.pos));
  const index = (Number(scouting.recruitmentDay || 1) + scouting.reports.length + region.id.length + observer.id.length) % Math.max(1, pool.length);
  const player = pool[index] || candidatePool(state)[0];
  const evaluation = evaluateRecruitmentCandidate(player, state, observer, region, priority);
  return {
    id:`report-${player.id || slug(player.name)}-${scouting.recruitmentDay}-${Date.now().toString(36)}`,
    generatedAt:new Date().toISOString(),
    playerId:player.id || slug(player.name),
    name:player.name,
    age:player.age,
    pos:player.pos,
    club:player.club,
    regionId:region.id,
    regionName:region.name,
    observerId:observer.id,
    observerName:observer.name,
    overall:Number(player.overall||70),
    potential:Number(player.potential||75),
    value:Number(player.value||0),
    wage:Number(player.wage||0),
    style:player.style,
    personality:player.personality,
    availability:player.availability,
    grade:evaluation.grade,
    fit:evaluation.fit,
    risk:evaluation.risk,
    costPressure:evaluation.costPressure,
    confidence:evaluation.scoutConfidence,
    recommendation:evaluation.recommendation,
    ownComparison:evaluation.own ? `${evaluation.own.name}: OVR ${evaluation.own.overall}` : 'Sem referência clara no elenco',
    depth:evaluation.depth,
    squadNeed:evaluation.need.reason,
    immediateGap:evaluation.immediateGap,
    potentialGap:evaluation.potentialGap
  };
}

export function buildScoutingSnapshot(state={}){
  const scouting = normalizeScoutingState(state.scouting || {}, state);
  const reports = scouting.reports.length ? scouting.reports : [buildScoutReport({...state, scouting:{...scouting, reports:[]}}, scouting.lastRegion, scouting.assignments[0]?.observerId)];
  const assignments = scouting.assignments.map(a=>{
    const observer = byId(scoutObservers, a.observerId, 0);
    const region = byId(scoutingRegions, a.regionId, 0);
    return {...a, observer, region, efficiency:clamp((observer.quality*0.45)+(observer.reliability*0.32)+(region.chance*0.23)-region.risk*0.16)};
  });
  const avgConfidence = clamp(reports.reduce((n,r)=>n+Number(r.confidence||0),0)/Math.max(1,reports.length));
  const avgFit = clamp(reports.reduce((n,r)=>n+Number(r.fit||0),0)/Math.max(1,reports.length));
  const highPriority = reports.filter(r=>['A','B+'].includes(r.grade) && Number(r.risk||100) <= 55).length;
  const monthlyCost = Number((assignments.reduce((n,a)=>n+Number(a.observer.salary||0)+Number(a.region.cost||0),0)).toFixed(2));
  const wishValue = scouting.wishList.reduce((n,w)=>n+Number(w.value||0),0);
  const focus = byId(recruitmentPriorities, scouting.focus, 1);
  return {
    version:SCOUTING_VERSION,
    route:'scoutingCenter',
    status:scoutingStatus.status,
    schema:760,
    scouting,
    focus,
    regions:scoutingRegions,
    observers:scoutObservers,
    assignments,
    reports:reports.slice(-12).reverse(),
    wishList:scouting.wishList,
    metrics:{ avgConfidence, avgFit, highPriority, monthlyCost, wishValue:Number(wishValue.toFixed(1)), reports:scouting.reports.length, activeObservers:assignments.length, boardApproval:scouting.boardApproval, budgetMonthly:scouting.budgetMonthly },
    flags:{ playable:true, mobileFirst:true, saveIntegrated:true, recruitmentLinked:true, hasWishlist:scouting.wishList.length>0, hasRealComparison:true }
  };
}

export function createScoutReportPatch(state={}, regionId=null, observerId=null){
  const scouting = normalizeScoutingState(state.scouting || {}, state);
  const report = buildScoutReport({...state, scouting}, regionId || scouting.lastRegion, observerId || null);
  const log = `${report.observerName} entregou relatório de ${report.name} (${report.pos}) em ${report.regionName}: nota ${report.grade}, encaixe ${report.fit}%, risco ${report.risk}%.`;
  return {
    scouting:{
      ...scouting,
      recruitmentDay:Number(scouting.recruitmentDay||1)+1,
      reports:[...scouting.reports, report].slice(-24),
      lastReportAt:report.generatedAt,
      lastRegion:report.regionId,
      observerLog:[...scouting.observerLog, log].slice(-24)
    },
    notifications:Number(state.notifications||0)+1,
    integrationLog:[`Scout ${SCOUTING_VERSION}: ${log}`]
  };
}

export function setScoutAssignmentPatch(state={}, observerId='carlos-araujo', regionId='br-sudeste'){
  const scouting = normalizeScoutingState(state.scouting || {}, state);
  const observer = byId(scoutObservers, observerId, 0);
  const region = byId(scoutingRegions, regionId, 0);
  const others = scouting.assignments.filter(a=>a.observerId !== observer.id);
  const assignment = { observerId:observer.id, regionId:region.id, status:'ativo', startedAt:new Date().toISOString().slice(0,10) };
  const log = `${observer.name} designado para ${region.name}. Custo mensal estimado ${moneyM(Number(observer.salary||0)+Number(region.cost||0))}.`;
  return { scouting:{...scouting, assignments:[...others, assignment].slice(-8), lastRegion:region.id, observerLog:[...scouting.observerLog, log].slice(-24)}, integrationLog:[`Scout ${SCOUTING_VERSION}: ${log}`] };
}

export function setScoutFocusPatch(state={}, focus='rotation'){
  const scouting = normalizeScoutingState(state.scouting || {}, state);
  const priority = byId(recruitmentPriorities, focus, 1);
  const log = `Prioridade de recrutamento alterada para ${priority.label}.`;
  return { scouting:{...scouting, focus:priority.id, observerLog:[...scouting.observerLog, log].slice(-24)}, ui:{...(state.ui||{}), scoutingFocus:priority.id}, integrationLog:[`Scout ${SCOUTING_VERSION}: ${log}`] };
}

export function wishlistScoutPlayerPatch(state={}, reportId='', mode='add'){
  const scouting = normalizeScoutingState(state.scouting || {}, state);
  const report = scouting.reports.find(r=>r.id===reportId) || scouting.reports[scouting.reports.length-1];
  if(!report){ return { scouting, integrationLog:[`Scout ${SCOUTING_VERSION}: nenhum relatório disponível para lista de desejos.`] }; }
  let wishList = Array.isArray(scouting.wishList) ? scouting.wishList.slice() : [];
  if(mode === 'remove'){
    wishList = wishList.filter(w=>w.playerId !== report.playerId && w.reportId !== report.id);
  } else if(!wishList.some(w=>w.playerId === report.playerId)){
    wishList.push({ reportId:report.id, playerId:report.playerId, name:report.name, pos:report.pos, club:report.club, value:report.value, wage:report.wage, grade:report.grade, fit:report.fit, risk:report.risk, addedAt:new Date().toISOString() });
  }
  const log = mode === 'remove' ? `${report.name} removido da lista de desejos.` : `${report.name} adicionado à lista de desejos para comparação com elenco e orçamento.`;
  return { scouting:{...scouting, wishList:wishList.slice(-18), observerLog:[...scouting.observerLog, log].slice(-24)}, integrationLog:[`Scout ${SCOUTING_VERSION}: ${log}`] };
}

export function renderScoutingRibbon(state={}){
  const snap = buildScoutingSnapshot(state);
  return `<section class="scouting-ribbon-v760 panel"><div><span class="tag">v7.6 · Scout</span><h3>${snap.metrics.highPriority} alvo(s) fortes · confiança ${snap.metrics.avgConfidence}%</h3><p class="small">Lista de desejos ${snap.wishList.length} · custo mensal ${moneyM(snap.metrics.monthlyCost)} · foco ${safe(snap.focus.label)}</p></div><div class="row gap"><button class="secondary-btn mini" data-route="academyScouting">Abrir scout</button><button class="secondary-btn mini" data-action="scout-generate-report">Novo relatório</button></div></section>`;
}

export function renderScoutingCenter(state={}){
  const snap = buildScoutingSnapshot(state);
  const regionOptions = snap.regions.map(r=>`<option value="${safe(r.id)}" ${r.id===snap.scouting.lastRegion?'selected':''}>${safe(r.name)} · ${moneyM(r.cost)}</option>`).join('');
  const observerOptions = snap.observers.map(o=>`<option value="${safe(o.id)}">${safe(o.name)} · ${o.quality}%</option>`).join('');
  const focusOptions = recruitmentPriorities.map(p=>`<option value="${safe(p.id)}" ${p.id===snap.scouting.focus?'selected':''}>${safe(p.label)}</option>`).join('');
  const assignmentCards = snap.assignments.map(a=>`<article class="scout-assignment-v760"><div><span class="tag">${safe(a.observer.role)}</span><h3>${safe(a.observer.name)}</h3><p>${safe(a.region.name)} · ${safe(a.region.style)}</p><small>${safe(a.observer.bias)}</small></div><div><strong>${a.efficiency}%</strong><div class="meter"><span style="width:${a.efficiency}%"></span></div></div></article>`).join('');
  const reportCards = snap.reports.map(r=>`<article class="scout-report-v760 grade-${safe(r.grade).replace('+','p').toLowerCase()}"><div class="row space"><div><span class="tag">Relatório ${safe(r.grade)} · ${safe(r.regionName)}</span><h3>${safe(r.name)}</h3><p>${safe(r.age)} anos · ${safe(r.pos)} · ${safe(r.club)} · ${safe(r.availability)}</p></div><strong>${safe(r.grade)}</strong></div><div class="scout-report-metrics-v760"><span>OVR <b>${r.overall}</b></span><span>POT <b>${r.potential}</b></span><span>Encaixe <b>${r.fit}%</b></span><span>Risco <b>${r.risk}%</b></span><span>Custo <b>${moneyM(r.value)}</b></span></div><p class="small">${safe(r.style)} · personalidade ${safe(r.personality)} · salário ${moneyM(r.wage)} / mês</p><p class="alert">Comparação: ${safe(r.ownComparison)} · Profundidade da posição: ${r.depth} · ${safe(r.squadNeed)}</p><div class="row gap"><button class="main-btn mini" data-action="scout-wishlist-add" data-report="${safe(r.id)}">Adicionar à lista</button><button class="secondary-btn mini" data-route="transfers">Negociar no mercado</button></div></article>`).join('');
  const regionCards = snap.regions.map(r=>`<article class="scout-region-card-v760 ${r.id===snap.scouting.lastRegion?'active':''}"><div class="row space"><div><span class="tag">${safe(r.country)}</span><h3>${safe(r.name)}</h3></div><strong>${r.chance}%</strong></div><p>${safe(r.note)}</p><small>${safe(r.style)} · ${r.days} dias · risco ${r.risk}% · custo ${moneyM(r.cost)}</small><button class="secondary-btn mini" data-action="scout-assign-region" data-region="${safe(r.id)}">Enviar observador</button></article>`).join('');
  const wishRows = snap.wishList.length ? snap.wishList.slice().reverse().map(w=>`<div class="wishlist-row-v760"><div><strong>${safe(w.name)}</strong><small>${safe(w.pos)} · ${safe(w.club)} · nota ${safe(w.grade)} · encaixe ${w.fit}% · risco ${w.risk}%</small></div><b>${moneyM(w.value)}</b><button class="secondary-btn mini danger" data-action="scout-wishlist-remove" data-report="${safe(w.reportId)}">Remover</button></div>`).join('') : '<p class="small">Nenhum atleta na lista de desejos. Gere relatórios e adicione os melhores alvos.</p>';
  const logs = snap.scouting.observerLog.slice(-8).reverse().map(l=>`<div class="news-item"><strong>Scout</strong><span>${safe(l)}</span></div>`).join('');
  return `<section class="scouting-v760 stack">
    <div class="panel scouting-hero-v760"><div><span class="tag">${safe(scoutingStatus.phase)}</span><h1>Scout, observadores e recrutamento profundo</h1><p class="small">Observadores por região, relatórios de jogadores, potencial, risco, custo, comparação com o elenco e lista de desejos persistente no save atual.</p></div><div class="release-score"><strong>${snap.metrics.avgFit}%</strong><small>encaixe médio</small></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Relatórios</span><strong>${snap.metrics.reports}</strong><small>salvos no slot</small></div><div class="card kpi-card"><span>Prioridade alta</span><strong>${snap.metrics.highPriority}</strong><small>nota A/B+ com risco aceitável</small></div><div class="card kpi-card"><span>Custo mensal</span><strong>${moneyM(snap.metrics.monthlyCost)}</strong><small>observadores + regiões</small></div><div class="card kpi-card"><span>Lista de desejos</span><strong>${snap.wishList.length}</strong><small>${moneyM(snap.metrics.wishValue)} monitorados</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Comando do departamento</span><h2>Gerar relatório real</h2></div><button class="main-btn mini" data-action="scout-generate-report">Gerar relatório</button></div><label class="form-label">Região<select class="select" data-action="set-ui-select" data-ui-key="scoutingRegion">${regionOptions}</select></label><label class="form-label">Observador<select class="select" data-action="set-ui-select" data-ui-key="scoutingObserver">${observerOptions}</select></label><label class="form-label">Prioridade<select class="select" data-action="scout-focus">${focusOptions}</select></label><p class="alert">O relatório usa região, qualidade do observador, posição carente, orçamento e comparação com o melhor jogador do elenco.</p></article><article class="panel"><div class="row space"><div><span class="tag">Observadores ativos</span><h2>Rede de scout</h2></div><span class="status-pill">${snap.metrics.activeObservers} ativos</span></div><div class="scout-assignment-list-v760">${assignmentCards}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Relatórios técnicos</span><h2>Jogadores monitorados</h2></div><button class="secondary-btn mini" data-route="smartMarket">Mercado inteligente</button></div><div class="scout-report-grid-v760">${reportCards}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Regiões</span><h2>Mapeamento mundial</h2></div><span class="small">clique para enviar o observador selecionado</span></div><div class="scout-region-grid-v760">${regionCards}</div></article><article class="panel"><div class="row space"><div><span class="tag">Lista de desejos</span><h2>Alvos para recrutamento</h2></div><button class="secondary-btn mini" data-route="transfers">Abrir transferências</button></div><div class="wishlist-list-v760">${wishRows}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Diário do departamento</span><h2>Histórico salvo</h2></div><span class="status-pill">schema 760</span></div><div class="news-list compact">${logs}</div></section>
  </section>`;
}
