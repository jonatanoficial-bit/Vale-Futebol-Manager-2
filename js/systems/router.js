import { safeScreenFallback } from '../../core/safety/error-recovery.js';
import { requestFullscreenMode, requestLandscapeForMatch } from './mobileExperienceEngine.js';
import { getNavigationRouteForActive } from './navigationExperienceEngine.js';
import { activateSoundAmbiencePreset, stopSoundAmbience } from './soundAmbienceEngine.js';
import { playRealAudioCue, stopRealAudioPack, scanRealAudioAssets } from './realAudioPackEngine.js';
import { getState, setState, setManager, setUI, startCareer, advanceMatch, finishMatch, setMatchSpeed, makeSubstitution, setMatchDecision, openTransferNegotiation, acceptTransferDeal, rejectTransferDeal, sellOutgoingPlayer, renewPlayerContract, loanTransferPlayer, generateIncomingOffer, respondIncomingOffer, simulateAIMarket, toggleTransferWindow, generateSmartIncomingOffer, simulateSmartAIMarket, triggerAgentEvent, setMatchAutoPlay, autoSelectBestLineup, setCaptain, setSetPieceTaker, applyRotationPlan, createManualBackup, restoreManualBackup, exportSaveText, importSaveText, toggleAutosave, exportRosterText, importRosterText, resetRosterToDefault, sampleRosterText, generateCareerOffers, respondCareerOffer, registerNationalInterest, toggleCallUpPlayer, finalizeNationalCallUp, completePostMatchAndReturnLobby, simulateBoardReview, renewManagerContract, simulateManagerDismissalRisk, simulateNextInternationalMatch, applyTrainingMicrocycle, signPreContract, openPreMatchPressConference, openPostMatchPressConference, answerPressConference, completePressConference, completeGuidedTutorialStep, completeGuidedTutorialForRoute, addManagerXp, setManagerSpecialty, loadSaveSlot, createNewCareerSlot, saveCurrentCareerSlot, deleteSaveSlot, renameSaveSlot, listSaveSlots, applyCalendarAction } from './state.js';
const routes = new Map(); let rootEl = null; let buildInfo = null;
const PUBLIC_ROUTES_V740 = new Set(['cover','mainMenu','newGame','teamSelect','confirmCareer','saveSlotsV2','saveCenter','settings','assetChecklist','visualLibrary']);
export function register(name, renderer){ routes.set(name, renderer); }
export function initRouter(root, build){ rootEl = root; buildInfo = build; }
function requiresCareer(route){ return !PUBLIC_ROUTES_V740.has(route); }
export function go(route){
  let target = routes.has(route) ? route : 'mainMenu';
  const state = getState();
  if(requiresCareer(target) && state?.save?.careerStarted === false){
    setState({route:'mainMenu', stability:{...(state.stability||{}), health:'Abra ou crie uma carreira antes de entrar no lobby.'}});
    render();
    return;
  }
  if(target !== 'match') completeGuidedTutorialForRoute(target);
  if(target === 'match'){
    const s=getState();
    if(!s.match?.finalized && s.match?.prePressDoneFor !== s.match?.id){ openPreMatchPressConference(); render(); return; }
  }
  setState({route:target});
  if(target === 'match'){
    const s=getState();
    if(!s.match?.finalized){ setMatchSpeed(s.match?.speed || 2); setMatchAutoPlay(true); requestLandscapeForMatch('match'); }
  }
  render();
}
export function render(){
  const state = getState(); const renderer = routes.get(state.route) || routes.get('lobby');
  try { rootEl.innerHTML = renderer(state); wire(rootEl); fillBuildBadges(); }
  catch(err){ console.error('[VFM] erro na tela, tela segura acionada', err); rootEl.innerHTML = safeScreenFallback(buildInfo?.buildLabel || 'Build v5.7.0'); wire(rootEl); }
}
function build(){ return `<div class="build-badge">${buildInfo?.buildLabel || 'Build v5.7.0'}</div>`; }
function fillBuildBadges(){ rootEl.querySelectorAll('#buildBadge,.build-badge').forEach(el=>{ if(!el.textContent.trim()) el.textContent = buildInfo?.buildLabel || 'Build v5.7.0'; }); markActiveNavigation(); }
function markActiveNavigation(){ const active = getNavigationRouteForActive(getState()?.route || 'lobby'); rootEl.querySelectorAll('[data-nav-route]').forEach(btn => { const isActive = btn.dataset.navRoute === active; btn.classList.toggle('active', isActive); if(isActive) btn.setAttribute('aria-current','page'); else btn.removeAttribute('aria-current'); }); }
function wire(scope){
  scope.querySelectorAll('[data-route]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.route)));

  scope.querySelectorAll('[data-action="ui-fullscreen"]').forEach(btn => btn.addEventListener('click', async () => { await requestFullscreenMode(); requestLandscapeForMatch(getState()?.route); }));
  scope.querySelectorAll('[data-action="sound-ambience-play"]').forEach(btn => btn.addEventListener('click', async () => { await activateSoundAmbiencePreset(btn.dataset.preset || 'stadium-home'); }));
  scope.querySelectorAll('[data-action="sound-ambience-stop"]').forEach(btn => btn.addEventListener('click', () => { stopSoundAmbience(); }));
  scope.querySelectorAll('[data-action="real-audio-play"]').forEach(btn => btn.addEventListener('click', async () => { await playRealAudioCue(btn.dataset.cue || 'crowd-home'); render(); }));
  scope.querySelectorAll('[data-action="real-audio-stop"]').forEach(btn => btn.addEventListener('click', () => { stopRealAudioPack(); render(); }));
  scope.querySelectorAll('[data-action="real-audio-scan"]').forEach(btn => btn.addEventListener('click', async () => { await scanRealAudioAssets(); render(); }));

  scope.querySelectorAll('[data-action="press-answer"]').forEach(btn => btn.addEventListener('click', () => { answerPressConference(btn.dataset.answer); render(); }));
  scope.querySelectorAll('[data-action="press-complete"]').forEach(btn => btn.addEventListener('click', () => { completeGuidedTutorialStep('press-first'); completePressConference(); render(); }));

  scope.querySelectorAll('[data-action="manager-xp-simulate"]').forEach(btn => btn.addEventListener('click', () => { addManagerXp(Number(btn.dataset.xp||60), btn.dataset.reason || 'teste de progressão'); render(); }));
  scope.querySelectorAll('[data-action="manager-specialty"]').forEach(btn => btn.addEventListener('click', () => { setManagerSpecialty(btn.dataset.specialty || 'tactician'); render(); }));

  scope.querySelectorAll('[data-action="tutorial-complete"]').forEach(btn => btn.addEventListener('click', () => { completeGuidedTutorialStep(btn.dataset.step); render(); }));


  scope.querySelectorAll('[data-action="save-backup"]').forEach(btn => btn.addEventListener('click', () => { createManualBackup(btn.dataset.slot || 1); render(); }));
  scope.querySelectorAll('[data-action="save-restore"]').forEach(btn => btn.addEventListener('click', () => { restoreManualBackup(btn.dataset.slot || 1); render(); }));
  scope.querySelectorAll('[data-action="save-export"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#saveExportBox'); if(box){ box.value = exportSaveText(); box.focus(); box.select(); } render(); }));
  scope.querySelectorAll('[data-action="save-import"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#saveImportBox'); importSaveText(box?.value || ''); render(); }));

  scope.querySelectorAll('[data-action="roster-export"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#rosterExportBox'); if(box){ box.value = exportRosterText(); box.focus(); box.select(); } render(); }));
  scope.querySelectorAll('[data-action="roster-import"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#rosterImportBox'); importRosterText(box?.value || ''); render(); }));
  scope.querySelectorAll('[data-action="roster-reset"]').forEach(btn => btn.addEventListener('click', () => { resetRosterToDefault(); render(); }));
  scope.querySelectorAll('[data-action="roster-sample"]').forEach(btn => btn.addEventListener('click', () => { const box = scope.querySelector('#rosterImportBox'); if(box){ box.value = sampleRosterText(); box.focus(); } }));

  scope.querySelectorAll('[data-action="career-offers-generate"]').forEach(btn => btn.addEventListener('click', () => { generateCareerOffers(); render(); }));
  scope.querySelectorAll('[data-action="manager-board-review"]').forEach(btn => btn.addEventListener('click', () => { simulateBoardReview(); render(); }));
  scope.querySelectorAll('[data-action="manager-contract-renew"]').forEach(btn => btn.addEventListener('click', () => { renewManagerContract(); render(); }));
  scope.querySelectorAll('[data-action="manager-dismissal-risk"]').forEach(btn => btn.addEventListener('click', () => { simulateManagerDismissalRisk(); render(); }));
  scope.querySelectorAll('[data-action="career-offer-accept"]').forEach(btn => btn.addEventListener('click', () => { respondCareerOffer(btn.dataset.offer, 'accept'); render(); }));
  scope.querySelectorAll('[data-action="career-offer-reject"]').forEach(btn => btn.addEventListener('click', () => { respondCareerOffer(btn.dataset.offer, 'reject'); render(); }));
  scope.querySelectorAll('[data-action="national-interest"]').forEach(btn => btn.addEventListener('click', () => { registerNationalInterest(btn.dataset.team); render(); }));
  scope.querySelectorAll('[data-action="callup-toggle"]').forEach(btn => btn.addEventListener('click', () => { toggleCallUpPlayer(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="callup-finalize"]').forEach(btn => btn.addEventListener('click', () => { finalizeNationalCallUp(); render(); }));
  scope.querySelectorAll('[data-action="training-apply-week"]').forEach(btn => btn.addEventListener('click', () => { applyTrainingMicrocycle(); render(); }));
  scope.querySelectorAll('[data-action="calendar-action"]').forEach(btn => btn.addEventListener('click', () => { applyCalendarAction(btn.dataset.calendarAction || 'advance-day'); render(); }));
  scope.querySelectorAll('[data-action="national-play-next"]').forEach(btn => btn.addEventListener('click', () => { simulateNextInternationalMatch(); render(); }));

  scope.querySelectorAll('[data-action="toggle-autosave"]').forEach(btn => btn.addEventListener('click', () => { toggleAutosave(); render(); }));
  scope.querySelectorAll('[data-action="reset-save"]').forEach(btn => btn.addEventListener('click', () => { localStorage.clear(); location.reload(); }));
  scope.querySelectorAll('[data-action="load-save-slot"]').forEach(btn => btn.addEventListener('click', () => {
    const targetSlot = btn.dataset.slot || 'principal';
    const current = getState();
    if(current?.save?.careerStarted !== false && current?.save?.activeSlot !== targetSlot) saveCurrentCareerSlot();
    const ok = loadSaveSlot(targetSlot);
    if(ok) go('lobby'); else go('mainMenu');
  }));
  scope.querySelectorAll('[data-action="new-career-slot"]').forEach(btn => btn.addEventListener('click', () => {
    const targetSlot = btn.dataset.slot || 'career-2';
    const occupied = btn.dataset.occupied === 'true' || listSaveSlots().some(s=>s.slot===targetSlot && s.occupied);
    if(occupied && typeof confirm === 'function' && !confirm('Este slot já tem carreira. Criar nova carreira aqui vai substituir este slot somente quando você confirmar a nova carreira. Continuar?')) return;
    createNewCareerSlot(targetSlot);
    go('newGame');
  }));
  scope.querySelectorAll('[data-action="save-current-slot"]').forEach(btn => btn.addEventListener('click', () => {
    const targetSlot = btn.dataset.slot || getState()?.save?.activeSlot || 'principal';
    const currentSlot = getState()?.save?.activeSlot || 'principal';
    const occupied = listSaveSlots().some(s=>s.slot===targetSlot && s.occupied);
    if(targetSlot !== currentSlot && occupied && typeof confirm === 'function' && !confirm('Salvar a carreira atual neste slot ocupado vai substituir a carreira que está nele. Continuar?')) return;
    saveCurrentCareerSlot(targetSlot);
    render();
  }));
  scope.querySelectorAll('[data-action="copy-current-to-empty-slot"]').forEach(btn => btn.addEventListener('click', () => {
    const targetSlot = btn.dataset.slot || 'career-2';
    if(typeof confirm === 'function' && !confirm('Copiar a carreira atual para este slot vazio? O slot ativo passará a ser a cópia.')) return;
    saveCurrentCareerSlot(targetSlot);
    render();
  }));
  scope.querySelectorAll('[data-action="save-slot-delete"]').forEach(btn => btn.addEventListener('click', () => { const slot = btn.dataset.slot || 'principal'; if(typeof confirm === 'function' && !confirm('Apagar este slot? Esta ação remove apenas esta carreira local.')) return; deleteSaveSlot(slot); go('mainMenu'); }));
  scope.querySelectorAll('[data-action="save-slot-rename"]').forEach(btn => btn.addEventListener('click', () => {
    const slot = btn.dataset.slot || 'principal';
    const item = listSaveSlots().find(s=>s.slot===slot);
    const label = typeof prompt === 'function' ? prompt('Nome do slot:', item?.slotLabel || '') : '';
    if(label && label.trim()){ renameSaveSlot(slot, label.trim()); render(); }
  }));
  scope.querySelectorAll('[data-action="exit-career"]').forEach(btn => btn.addEventListener('click', () => { saveCurrentCareerSlot(); go('mainMenu'); }));
  scope.querySelectorAll('[data-action="select-avatar"]').forEach(btn => btn.addEventListener('click', () => { setUI({selectedAvatar:btn.dataset.avatar}); render(); }));
  scope.querySelectorAll('[data-action="select-mode"]').forEach(btn => btn.addEventListener('click', () => { setUI({selectedMode:btn.dataset.mode}); render(); }));

  scope.querySelectorAll('[data-action="select-team"]').forEach(btn => btn.addEventListener('click', () => { setUI({selectedClub:btn.dataset.team}); render(); }));
  scope.querySelectorAll('[data-action="team-country-filter"]').forEach(sel => sel.addEventListener('change', () => { setUI({teamCountryFilter:sel.value, teamLeagueFilter:'all'}); render(); }));
  scope.querySelectorAll('[data-action="team-league-filter"]').forEach(sel => sel.addEventListener('change', () => { setUI({teamLeagueFilter:sel.value}); render(); }));
  scope.querySelectorAll('[data-action="team-sort"]').forEach(sel => sel.addEventListener('change', () => { setUI({teamSort:sel.value}); render(); }));
  scope.querySelectorAll('[data-action="standings-select"]').forEach(sel => sel.addEventListener('change', () => { setUI({standingsCompetition:sel.value}); render(); }));
  scope.querySelectorAll('[data-action="set-ui"]').forEach(btn => btn.addEventListener('click', () => { const key=btn.dataset.uiKey; const value=btn.dataset.uiValue; if(key) { setUI({[key]:value}); render(); } }));
  scope.querySelectorAll('[data-action="auto-lineup"]').forEach(btn => btn.addEventListener('click', () => { autoSelectBestLineup(); render(); }));
  scope.querySelectorAll('[data-action="apply-rotation"]').forEach(btn => btn.addEventListener('click', () => { applyRotationPlan(); render(); }));
  scope.querySelectorAll('[data-action="set-captain"]').forEach(sel => sel.addEventListener('change', () => { setCaptain(sel.value); render(); }));
  scope.querySelectorAll('[data-action="set-setpiece"]').forEach(sel => sel.addEventListener('change', () => { setSetPieceTaker(sel.dataset.kind || 'penalty', sel.value); render(); }));
  scope.querySelectorAll('[data-action="safe-toast"]').forEach(btn => btn.addEventListener('click', () => { const msg = btn.dataset.message || 'Acao registrada.'; const original = btn.textContent || 'Acao'; console.info('[VFM]', msg); btn.textContent = 'Registrado'; btn.disabled = true; setTimeout(()=>{ btn.disabled=false; btn.textContent = original; }, 1200); }));
  scope.querySelectorAll('[data-action="match-advance"]').forEach(btn => btn.addEventListener('click', () => { advanceMatch(5); render(); }));
  scope.querySelectorAll('[data-action="match-finish"]').forEach(btn => btn.addEventListener('click', () => { finishMatch(); completeGuidedTutorialStep('play-first-match'); render(); }));
  scope.querySelectorAll('[data-action="post-match-lobby"]').forEach(btn => btn.addEventListener('click', () => { completeGuidedTutorialStep('read-report'); openPostMatchPressConference(); render(); }));
  scope.querySelectorAll('[data-action="match-autoplay"]').forEach(btn => btn.addEventListener('click', () => { setMatchAutoPlay(btn.dataset.enabled !== 'false'); render(); }));
  scope.querySelectorAll('[data-action="match-speed"]').forEach(btn => btn.addEventListener('click', () => { setMatchSpeed(btn.dataset.speed || 1); render(); }));
  scope.querySelectorAll('[data-action="match-substitution"]').forEach(btn => btn.addEventListener('click', () => { makeSubstitution(btn.dataset.out, btn.dataset.in); render(); }));
  scope.querySelectorAll('[data-action="transfer-negotiate"]').forEach(btn => btn.addEventListener('click', () => { openTransferNegotiation(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-accept"]').forEach(btn => btn.addEventListener('click', () => { acceptTransferDeal(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-reject"]').forEach(btn => btn.addEventListener('click', () => { rejectTransferDeal(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-sell"]').forEach(btn => btn.addEventListener('click', () => { sellOutgoingPlayer(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-renew"]').forEach(btn => btn.addEventListener('click', () => { renewPlayerContract(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-loan"]').forEach(btn => btn.addEventListener('click', () => { loanTransferPlayer(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-precontract"]').forEach(btn => btn.addEventListener('click', () => { signPreContract(btn.dataset.player); render(); }));
  scope.querySelectorAll('[data-action="transfer-offer-generate"]').forEach(btn => btn.addEventListener('click', () => { generateIncomingOffer(); render(); }));
  scope.querySelectorAll('[data-action="transfer-offer-accept"]').forEach(btn => btn.addEventListener('click', () => { respondIncomingOffer(btn.dataset.offer, 'accept'); render(); }));
  scope.querySelectorAll('[data-action="transfer-offer-reject"]').forEach(btn => btn.addEventListener('click', () => { respondIncomingOffer(btn.dataset.offer, 'reject'); render(); }));
  scope.querySelectorAll('[data-action="transfer-ai-sim"]').forEach(btn => btn.addEventListener('click', () => { simulateAIMarket(); render(); }));
  scope.querySelectorAll('[data-action="transfer-window-toggle"]').forEach(btn => btn.addEventListener('click', () => { toggleTransferWindow(); render(); }));
  scope.querySelectorAll('[data-action="transfer-smart-offer"]').forEach(btn => btn.addEventListener('click', () => { generateSmartIncomingOffer(); render(); }));
  scope.querySelectorAll('[data-action="transfer-smart-ai"]').forEach(btn => btn.addEventListener('click', () => { simulateSmartAIMarket(); render(); }));
  scope.querySelectorAll('[data-action="transfer-agent-event"]').forEach(btn => btn.addEventListener('click', () => { triggerAgentEvent(); render(); }));

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
