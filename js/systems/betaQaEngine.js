import { BETA_QA_VERSION, BETA_QA_SCHEMA, BETA_QA_BUILD_TIME, BETA_QA_CRITICAL_ROUTES, BETA_QA_DEVICE_MATRIX, BETA_QA_FIRST_SESSION, BETA_QA_NO_GO_ITEMS } from '../data/betaQaData.js';
import { validateBetaQaSystem } from '../../core/safety/beta-qa-validator.js';

function routeSetFromMenu(menuGroups=[]){
  const set = new Set(['cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','managerMenu','match','pressConference']);
  menuGroups.forEach(([,items=[]])=>items.forEach(item=>set.add(item[0])));
  return set;
}
function statusIcon(ok){ return ok ? '✅' : '⛔'; }
export function buildBetaQaSnapshot(state={}, menuGroups=[]){
  const routes = routeSetFromMenu(menuGroups);
  const routeRows = BETA_QA_CRITICAL_ROUTES.map(item => ({...item, ok:routes.has(item.route)}));
  const routesOk = routeRows.filter(r=>r.ok).length;
  const hasAssetGate = routeRows.some(r=>r.route==='assetChecklist' && r.ok);
  const hasSaveGate = routeRows.some(r=>r.route==='saveSlotsV2' && r.ok);
  const hasMatchGate = routeRows.some(r=>r.route==='match' && r.ok);
  const hasMobileGate = routes.has('mobileAudit');
  const careerStarted = state?.save?.careerStarted !== false;
  const activeSlot = state?.save?.activeSlot || 'principal';
  const score = Math.round((routesOk / Math.max(1, routeRows.length)) * 100);
  return {
    version:BETA_QA_VERSION,
    schema:BETA_QA_SCHEMA,
    generatedAt:BETA_QA_BUILD_TIME,
    routeRows,
    routesOk,
    totalCriticalRoutes:routeRows.length,
    score,
    deviceProfiles:BETA_QA_DEVICE_MATRIX.length,
    firstSessionSteps:BETA_QA_FIRST_SESSION.length,
    noGoItems:BETA_QA_NO_GO_ITEMS.length,
    hasAssetGate,
    hasSaveGate,
    hasMatchGate,
    hasMobileGate,
    careerStarted,
    activeSlot,
    currentRoute:state?.route || 'cover',
    status:score >= 98 && hasAssetGate && hasSaveGate && hasMatchGate ? 'ok' : score >= 90 ? 'warning' : 'error'
  };
}
export function renderBetaQaRibbon(state={}){
  const snap = buildBetaQaSnapshot(state, (typeof window !== 'undefined' && window.__VFM_MANAGER_MENU_GROUPS__) || []);
  return `<section class="panel beta-qa-ribbon-v820"><div><span class="tag">QA Final v8.2</span><strong>${snap.routesOk}/${snap.totalCriticalRoutes} rotas críticas</strong><small>Use antes de divulgar: slots, avatares, mobile, partida e financeiro.</small></div><button class="secondary-btn mini" data-route="betaQaCenter">Abrir QA</button></section>`;
}
export function renderBetaQaCenter(state={}, menuGroups=[]){
  const snap = buildBetaQaSnapshot(state, menuGroups);
  const validation = validateBetaQaSystem(snap);
  const routeRows = snap.routeRows.map(r=>`<div class="beta-qa-route-v820 ${r.ok?'ok':'error'}"><strong>${statusIcon(r.ok)} ${r.label}</strong><span class="tag">${r.route}</span><small>${r.step}</small></div>`).join('');
  const devices = BETA_QA_DEVICE_MATRIX.map(d=>`<article class="beta-qa-device-v820"><strong>${d.label}</strong><span>${d.width}</span><small>${d.target}</small></article>`).join('');
  const session = BETA_QA_FIRST_SESSION.map((s,i)=>`<div class="beta-qa-step-v820"><b>${String(i+1).padStart(2,'0')}</b><span>${s}</span></div>`).join('');
  const noGo = BETA_QA_NO_GO_ITEMS.map(item=>`<div class="beta-qa-nogo-v820">${item}</div>`).join('');
  const validationRows = [...(validation.errors||[]).map(e=>['error',e]), ...(validation.warnings||[]).map(w=>['warning',w])];
  const validationHtml = validationRows.length ? validationRows.map(([kind,msg])=>`<div class="beta-qa-validation-v820 ${kind}">${kind==='error'?'⛔':'⚠️'} ${msg}</div>`).join('') : '<div class="beta-qa-validation-v820 ok">✅ QA automatizado sem erro crítico.</div>';
  return `<section class="beta-qa-v820">
    <div class="panel beta-qa-hero-v820"><div><span class="tag">v8.2.0 · Fase 65</span><h1>Homologação Final do Beta Profissional</h1><p class="small">Painel criado para testar a primeira sessão real do jogador: capa, 3 slots, criação de manager, avatares, clube, lobby, menus, calendário, treino, scout, staff, finanças, partida, save e mobile antes de divulgar.</p></div><div class="beta-qa-score-v820 ${snap.status}"><strong>${snap.score}</strong><span>score QA</span><small>${snap.routesOk}/${snap.totalCriticalRoutes} rotas</small></div><div class="beta-qa-actions-v820"><button class="main-btn" data-route="mainMenu">Testar entrada</button><button class="secondary-btn" data-route="newGame">Testar avatares</button><button class="secondary-btn" data-route="match">Testar partida</button></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Slot ativo</span><strong>${snap.activeSlot}</strong><small>${snap.careerStarted?'Carreira iniciada':'Na central inicial'}</small></div><div class="card kpi-card"><span>Assets</span><strong>${snap.hasAssetGate?'OK':'Falha'}</strong><small>Gate de avatares/cache</small></div><div class="card kpi-card"><span>Save</span><strong>${snap.hasSaveGate?'OK':'Falha'}</strong><small>3 slots obrigatórios</small></div><div class="card kpi-card"><span>Mobile</span><strong>${snap.hasMobileGate?'OK':'Aviso'}</strong><small>Auditoria complementar</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Rotas críticas</span><h2>Mapa de teste obrigatório</h2></div><strong class="grade">${snap.routesOk}/${snap.totalCriticalRoutes}</strong></div><div class="beta-qa-route-list-v820">${routeRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Dispositivos</span><h2>Matriz PC + celular</h2></div><span class="status-pill">${snap.deviceProfiles} perfis</span></div><div class="beta-qa-device-grid-v820">${devices}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Primeira sessão</span><h2>Roteiro de homologação manual</h2></div><button class="secondary-btn mini" data-route="saveSlotsV2">Abrir slots</button></div><div class="beta-qa-steps-v820">${session}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">No-Go</span><h2>Bloqueios que impedem divulgação</h2></div><span class="status-pill">Não aceitar</span></div><div class="beta-qa-nogo-list-v820">${noGo}</div></article><article class="panel"><div class="row space"><div><span class="tag">Validação automática</span><h2>Resultado do gate v8.2</h2></div><strong class="grade">${validation.status.toUpperCase()}</strong></div><div class="beta-qa-validation-list-v820">${validationHtml}</div><div class="beta-qa-shortcuts-v820"><button class="secondary-btn mini" data-route="assetChecklist">Assets</button><button class="secondary-btn mini" data-route="betaProfessional">Beta Profissional</button><button class="secondary-btn mini" data-route="managerMenu">Menu</button><button class="secondary-btn mini" data-route="lobby">Lobby</button></div></article></section>
    <p class="beta-qa-footer-v820">Build v8.2.0 · Schema 820 · Gerado em ${BETA_QA_BUILD_TIME} · Base v8.1 preservada com cache buster novo.</p>
  </section>`;
}
