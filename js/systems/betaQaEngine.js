import { BETA_OK_VERSION, BETA_OK_SCHEMA, BETA_OK_BUILD_TIME, BETA_OK_CRITICAL_ROUTES, BETA_OK_DEVICE_MATRIX, BETA_OK_FIRST_SESSION, BETA_OK_NO_GO_ITEMS } from '../data/betaQaData.js';
import { validateBetaQaSystem } from '../../core/safety/beta-qa-validator.js';

function routeSetFromMenu(menuGroups=[]){
  const set = new Set(['cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','managerMenu','match','pressConference']);
  menuGroups.forEach(([,items=[]])=>items.forEach(item=>set.add(item[0])));
  return set;
}
function statusIcon(ok){ return ok ? '✅' : '⛔'; }
export function buildBetaQaSnapshot(state={}, menuGroups=[]){
  const routes = routeSetFromMenu(menuGroups);
  const routeRows = BETA_OK_CRITICAL_ROUTES.map(item => ({...item, ok:routes.has(item.route)}));
  const routesOk = routeRows.filter(r=>r.ok).length;
  const hasAssetGate = routeRows.some(r=>r.route==='assetChecklist' && r.ok);
  const hasSaveGate = routeRows.some(r=>r.route==='saveSlotsV2' && r.ok);
  const hasMatchGate = routeRows.some(r=>r.route==='match' && r.ok);
  const hasMobileGate = routes.has('mobileAudit');
  const careerStarted = state?.save?.careerStarted !== false;
  const activeSlot = state?.save?.activeSlot || 'principal';
  const score = Math.round((routesOk / Math.max(1, routeRows.length)) * 100);
  return {
    version:BETA_OK_VERSION,
    schema:BETA_OK_SCHEMA,
    generatedAt:BETA_OK_BUILD_TIME,
    routeRows,
    routesOk,
    totalCriticalRoutes:routeRows.length,
    score,
    deviceProfiles:BETA_OK_DEVICE_MATRIX.length,
    firstSessionSteps:BETA_OK_FIRST_SESSION.length,
    noGoItems:BETA_OK_NO_GO_ITEMS.length,
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
  return `<section class="panel beta-qa-ribbon-v820"><div><span class="tag">Ajuda</span><strong>${snap.routesOk}/${snap.totalCriticalRoutes} itens importantes</strong><small>Use antes de divulgar: slots, avatares, mobile, partida e financeiro.</small></div><button class="secondary-btn mini" data-route="betaQaCenter">Abrir</button></section>`;
}
export function renderBetaQaCenter(state={}, menuGroups=[]){
  const snap = buildBetaQaSnapshot(state, menuGroups);
  const validation = validateBetaQaSystem(snap);
  const routeRows = snap.routeRows.map(r=>`<div class="beta-qa-route-v820 ${r.ok?'ok':'error'}"><strong>${statusIcon(r.ok)} ${r.label}</strong><span class="tag">${r.route}</span><small>${r.step}</small></div>`).join('');
  const devices = BETA_OK_DEVICE_MATRIX.map(d=>`<article class="beta-qa-device-v820"><strong>${d.label}</strong><span>${d.width}</span><small>${d.target}</small></article>`).join('');
  const session = BETA_OK_FIRST_SESSION.map((s,i)=>`<div class="beta-qa-step-v820"><b>${String(i+1).padStart(2,'0')}</b><span>${s}</span></div>`).join('');
  const noGo = BETA_OK_NO_GO_ITEMS.map(item=>`<div class="beta-qa-nogo-v820">${item}</div>`).join('');
  const validationRows = [...(validation.errors||[]).map(e=>['error',e]), ...(validation.warnings||[]).map(w=>['warning',w])];
  const validationHtml = validationRows.length ? validationRows.map(([kind,msg])=>`<div class="beta-qa-validation-v820 ${kind}">${kind==='error'?'⛔':'⚠️'} ${msg}</div>`).join('') : '<div class="beta-qa-validation-v820 ok">✅ Verificação automática sem erro crítico.</div>';
  return `<section class="beta-qa-v820">
    <div class="panel beta-qa-hero-v820"><div><span class="tag">Verificação rápida</span><h1>Teste do jogo</h1><p class="small">Confira entrada, carreiras salvas, criação de manager, avatares, clube, lobby, menus, calendário, treino, scout, staff, finanças, partida e save.</p></div><div class="beta-qa-score-v820 ${snap.status}"><strong>${snap.score}</strong><span>pronto</span><small>${snap.routesOk}/${snap.totalCriticalRoutes} itens</small></div><div class="beta-qa-actions-v820"><button class="main-btn" data-route="mainMenu">Entrada</button><button class="secondary-btn" data-route="newGame">Avatares</button><button class="secondary-btn" data-route="match">Partida</button></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Slot ativo</span><strong>${snap.activeSlot}</strong><small>${snap.careerStarted?'Carreira iniciada':'Na central inicial'}</small></div><div class="card kpi-card"><span>Avatares</span><strong>${snap.hasAssetGate?'OK':'Falha'}</strong><small>Avatares e imagens</small></div><div class="card kpi-card"><span>Save</span><strong>${snap.hasSaveGate?'OK':'Falha'}</strong><small>3 slots obrigatórios</small></div><div class="card kpi-card"><span>Mobile</span><strong>${snap.hasMobileGate?'OK':'Aviso'}</strong><small>Verificação complementar</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Telas críticas</span><h2>Mapa de teste obrigatório</h2></div><strong class="grade">${snap.routesOk}/${snap.totalCriticalRoutes}</strong></div><div class="beta-qa-route-list-v820">${routeRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Dispositivos</span><h2>Matriz PC + celular</h2></div><span class="status-pill">${snap.deviceProfiles} perfis</span></div><div class="beta-qa-device-grid-v820">${devices}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Primeira sessão</span><h2>Roteiro de teste</h2></div><button class="secondary-btn mini" data-route="saveSlotsV2">Abrir slots</button></div><div class="beta-qa-steps-v820">${session}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Atenção</span><h2>Problemas que precisam ser corrigidos</h2></div><span class="status-pill">Não aceitar</span></div><div class="beta-qa-nogo-list-v820">${noGo}</div></article><article class="panel"><div class="row space"><div><span class="tag">Validação</span><h2>Resultado da verificação</h2></div><strong class="grade">${validation.status.toUpperCase()}</strong></div><div class="beta-qa-validation-list-v820">${validationHtml}</div><div class="beta-qa-shortcuts-v820"><button class="secondary-btn mini" data-route="assetChecklist">Avatares</button><button class="secondary-btn mini" data-route="betaProfessional">Carreiras</button><button class="secondary-btn mini" data-route="managerMenu">Menu</button><button class="secondary-btn mini" data-route="lobby">Lobby</button></div></article></section>
    <p class="beta-qa-footer-v820">Verificação concluída para jogar.</p>
  </section>`;
}
