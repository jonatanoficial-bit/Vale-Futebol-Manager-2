import { getState, setState, setManager, setUI, startCareer, advanceMatch, finishMatch, setMatchSpeed, makeSubstitution, setMatchDecision, openTransferNegotiation, acceptTransferDeal, rejectTransferDeal, sellOutgoingPlayer, renewPlayerContract, createManualBackup, restoreManualBackup, exportSaveText, importSaveText, toggleAutosave, exportRosterText, importRosterText, resetRosterToDefault, sampleRosterText } from './state.js';
const routes = new Map(); let rootEl = null; let buildInfo = null;
export function register(name, renderer){ routes.set(name, renderer); }
export function initRouter(root, build){ rootEl = root; buildInfo = build; }
export function go(route){ const target = routes.has(route) ? route : 'lobby'; setState({route:target}); render(); }
export function render(){
  const state = getState(); const renderer = routes.get(state.route) || routes.get('lobby');
  try { rootEl.innerHTML = renderer(state); wire(rootEl); fillBuildBadges(); }
  catch(err){ console.error('[VFM] erro na tela, tela segura acionada', err); rootEl.innerHTML = `<main class="screen"><div class="module-placeholder"><h1>Modo seguro</h1><p>Uma tela apresentou erro, mas o jogo continua funcionando.</p><button class="main-btn" data-route="lobby">Voltar ao lobby</button></div>${build()}</main>`; wire(rootEl); }
}
function build(){ return `<div class="build-badge">${buildInfo?.buildLabel || 'Build v2.5.0'}</div>`; }
function fillBuildBadges(){ rootEl.querySelectorAll('#buildBadge,.build-badge').forEach(el=>{ if(!el.textContent.trim()) el.textContent = buildInfo?.buildLabel || 'Build v2.5.0'; }); }
function wire(scope){
  scope.querySelectorAll('[data-route]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.route)));

  scope.querySelectorAll('[data-action="save-backup"]').forEach(btn => btn.addEventListener('click', () => { createManualBackup(btn.dataset.slot || 1); render(); }));
  scope.querySelectorAll('[data-action="save-restore"]').forEach(btn => btn.addEventListener('click', () => { restoreManualBackup(btn.dataset.slot || 1); render(); }));
  scope.querySelectorAll('[data-action="save-export"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#saveExportBox'); if(box){ box.value = exportSaveText(); box.focus(); box.select(); } render(); }));
  scope.querySelectorAll('[data-action="save-import"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#saveImportBox'); importSaveText(box?.value || ''); render(); }));

  scope.querySelectorAll('[data-action="roster-export"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#rosterExportBox'); if(box){ box.value = exportRosterText(); box.focus(); box.select(); } render(); }));
  scope.querySelectorAll('[data-action="roster-import"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#rosterImportBox'); importRosterText(box?.value || ''); render(); }));
  scope.querySelectorAll('[data-action="roster-reset"]').forEach(btn => btn.addEventListener('click', () => { resetRosterToDefault(); render(); }));
  scope.querySelectorAll('[data-action="roster-sample"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#rosterImportBox'); if(box){ box.value = sampleRosterText(); box.focus(); } }));
  scope.querySelectorAll('[data-action="toggle-autosave"]'.forEach(btn => btn.addEventListener('click', () => { toggleAutosave(); render(); }));
  scope.querySelectorAll('[data-action="reset-save"]').forEach(btn => btn.addEventListener('click', () => { localStorage.clear(); location.reload(); }));
  scope.querySelectorAll('[data-action="select-avatar"]').forEach(btn => btn.addEventListener('click', () => { setUI({selectedAvatar:btn.dataset.avatar}); render(); }));
  scope.querySelectorAll('[data-action="select-mode"]').forEach(btn => btn.addEventListener('click', () => { setUI({selectedMode:btn.dataset.mode}); render(); }));

  scope.querySelectorAll('[data-action="select-team"]').forEach(btn => btn.addEventListener('click', () => { setState({clubId:btn.dataset.team}); setUI({selectedClub:btn.dataset.team}); render(); }));
  scope.querySelectorAll('[data-action="team-country-filter"]').forEach(sel => sel.addEventListener('change', () => { setUI({teamCountryFilter:sel.value, teamLeagueFilter:'all'}); render(); }));
  scope.querySelectorAll('[data-action="team-league-filter"]').forEach(sel => sel.addEventListener('change', () => { setUI({teamLeagueFilter:sel.value}); render(); }));
  scope.querySelectorAll('[data-action="team-sort"]').forEach(sel => sel.addEventListener('change', () => { setUI({teamSort:sel.value}); render(); }));
  scope.querySelectorAll('[data-action="standings-select"]').forEach(sel => sel.addEventListener('change', () => { setUI({standingsCompetition:sel.value}); render(); }));
  scope.querySelectorAll('[data-action="set-ui"]').forEach(btn => btn.addEventListener('click', () => { const key=btn.dataset.uiKey; const value=btn.dataset.uiValue; if(key) { setUI({[key]:value}); render(); } }));
  scope.querySelectorAll('[data-action="safe-toast"]').forEach(btn => btn.addEventListener('click', () => { const msg = btn.dataset.message || 'Acao registrada.'; const original = btn.textContent || 'Acao'; console.info('[VFM]', msg); btn.textContent = 'Registrado'; btn.disabled = true; setTimeout(()=>{ btn.disabled=false; btn.textContent = original; }, 1200); }));
  scope.querySelectorAll('[data-action="match-advance"]').forEach(btn => btn.addEventListener('click', () => { advanceMatch(5); render(); }));
  scope.querySelectorAll('[data-action="match-finish"]').forEach(btn => btn.addEventListener('click', () => { finishMatch(); render(); }));
  scope.querySelectorAll('[data-action="match-speed"]').forEach(btn => btn.addEventListener('click', () => { setMatchSpeed(btn.dataset.speed || 1); render(); }));
  scope.querySelectorAll('[data-action="match-substitution"]').forEach(btn => btn.addEventListener('click', () => { makeSubstitution(btn.dataset.out, btn.dataset.in); render(); }));
  scope.querySelectorAll('[data-action="transfer-negotiate"]').forEach(btn => btn.addEventListener('click', () => { openTransferNegotiation(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-accept"]').forEach(btn => btn.addEventListener('click', () => { acceptTransferDeal(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-reject"]').forEach(btn => btn.addEventListener('click', () => { rejectTransferDeal(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-sell"]').forEach(btn => btn.addEventListener('click', () => { sellOutgoingPlayer(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-renew"]').forEach(btn => btn.addEventListener('click', () => { renewPlayerContract(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="match-decision"]').forEach(btn => btn.addEventListener('click', () => { setMatchDecision(btn.dataset.decision); render(); }));

  scope.querySelectorAll('[data-action="set-ui-select"]').forEach(sel => sel.addEventListener('change', () => { const key=sel.dataset.uiKey; if(key) { setUI({[key]:sel.value}); render(); } }));
  scope.querySelectorAll('[data-action="select-country"]').forEach(sel => sel.addEventListener('change', () => { setUI({selectedCountry:sel.value}); render(); }));
  scope.querySelectorAll('[data-action="manager-next"]').forEach(btn => btn.addEventListener('click', () => {
    const name = scope.querySelector('#managerName')?.value || 'Manager Vale';
    const country = scope.querySelector('#managerCountry')?.value || getState().ui?.selectedCountry || 'br';
    const selectedAvatar = getState().ui?.selectedAvatar || getState().manager.avatar;
    const selectedMode = getState().ui?.selectedMode || getState().manager.mode;
    setManager({name, country, avatar:selectedAvatar, mode:selectedMode});
    go('teamSelect');
  }));
  scope.querySelectorAll('[data-action="start-career"]').forEach(btn => btn.addEventListener('click', () => { startCareer(); render(); }));
}
export function buildBadge(){ return build(); }
