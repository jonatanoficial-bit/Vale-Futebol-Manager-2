import { loadAssetMap } from './systems/assets.js';
import { load, getState, advanceMatch } from './systems/state.js';
import { initRouter, register, render } from './systems/router.js';
import { cover } from './screens/cover.js';
import { mainMenu } from './screens/mainMenu.js';
import { newGame } from './screens/newGame.js';
import { teamSelect } from './screens/teamSelect.js';
import { confirmCareer } from './screens/confirmCareer.js';
import { lobby, managerMenu, PRIMARY_ACTIONS_V550, MANAGER_MENU_GROUPS_V550 } from './screens/lobby.js';
import { match } from './screens/match.js';
import { pressConference } from './screens/pressConference.js';
import { moduleScreen } from './screens/moduleScreen.js';
import { applyCommercialPolish, validateCommercialState } from './systems/commercialPolish.js';
import { applyAaaUiShell, buildUiAaaSnapshot } from './systems/uiQualityEngine.js';
import { applyMobileExperienceShell, buildMobileExperienceSnapshot } from './systems/mobileExperienceEngine.js';
import { applyMobileCertificationShell, buildMobileCertificationSnapshot } from './systems/mobileCertificationEngine.js';
import { applyMobileUxFinalShell, buildMobileUxFinalSnapshot } from './systems/mobileUxFinalEngine.js';
import { validateMobileCertificationV598 } from '../core/safety/mobile-certification-validator.js';
import { validateMobileUxFinalV599 } from '../core/safety/mobile-ux-final-validator.js';
import { applyNavigationExperienceShell } from './systems/navigationExperienceEngine.js';
import { buildMatchExperienceSnapshot } from './systems/matchExperienceEngine.js';
import { validateLobbyCompactSystem } from '../core/safety/lobby-compact-validator.js';
import { validateNavigationSystem } from '../core/safety/navigation-validator.js';
import { validateMenuHierarchy } from '../core/safety/menu-hierarchy-validator.js';
import { validateTouchTargets } from '../core/safety/touch-target-validator.js';
import { validateMatchFlowV570 } from '../core/safety/match-flow-validator.js';
import { buildDataPack2026Snapshot } from './systems/dataPack2026Engine.js';
import { buildRosterLock2026Snapshot } from './systems/rosterLock2026Engine.js';
import { validateRosterLock2026 } from '../core/safety/roster-lock-validator.js';
import { validateCareerLoopV592 } from '../core/safety/career-loop-validator.js';
import { validatePressConferenceSystem } from '../core/safety/press-conference-validator.js';
import { validateGuidedTutorialSystem } from '../core/safety/guided-tutorial-validator.js';
import { validateManagerProgressionSystem } from '../core/safety/manager-progression-validator.js';
import { validateManagerJobMarketSystem } from '../core/safety/manager-job-market-validator.js';
import { validateBalanceGeneralSystem } from '../core/safety/balance-general-validator.js';
import { validateReleaseCandidateSystem } from '../core/safety/release-candidate-validator.js';
import { buildReleaseCandidateSnapshot } from './systems/releaseCandidateEngine.js';
import { validateIntroCinematicSystem } from '../core/safety/intro-cinematic-validator.js';
import { buildIntroCinematicSnapshot } from './systems/introCinematicEngine.js';
import { validateLiveWorldSystem } from '../core/safety/live-world-validator.js';
import { buildLiveWorldSnapshot } from './systems/liveWorldEngine.js';
import { validateMatchdayPremiumSystem } from '../core/safety/matchday-premium-validator.js';
import { buildMatchdayPremiumSnapshot } from './systems/matchdayPremiumEngine.js';
import { validateSquadAiSystem } from '../core/safety/squad-ai-validator.js';
import { validateObjectivesRetentionSystem } from '../core/safety/objectives-retention-validator.js';
import { validateBoardEmotionalSystem } from '../core/safety/board-emotional-validator.js';
import { validateAgentMarketSystem } from '../core/safety/agent-market-validator.js';
import { validateContractRenewalSystem } from '../core/safety/contract-renewal-validator.js';
import { validateMoraleCrisisSystem } from '../core/safety/morale-crisis-validator.js';
import { validateMatchSimulation90System } from '../core/safety/match-simulation90-validator.js';
import { validateSoundAmbienceSystem } from '../core/safety/sound-ambience-validator.js';
import { validateRealAudioPackSystem } from '../core/safety/real-audio-pack-validator.js';
import { validateStadiumClimateSystem } from '../core/safety/stadium-climate-validator.js';
import { buildSquadAiSnapshot } from './systems/squadAiEngine.js';
import { buildObjectivesRetentionSnapshot } from './systems/objectivesRetentionEngine.js';
import { buildBoardEmotionalSnapshot } from './systems/boardEmotionalEngine.js';
import { buildAgentMarketSnapshot } from './systems/agentMarketEngine.js';
import { buildContractRenewalSnapshot } from './systems/contractRenewalEngine.js';
import { buildMoraleCrisisSnapshot } from './systems/moraleCrisisEngine.js';
import { buildMatchSimulation90Snapshot } from './systems/matchSimulation90Engine.js';
import { buildSoundAmbienceSnapshot } from './systems/soundAmbienceEngine.js';
import { buildRealAudioPackSnapshot } from './systems/realAudioPackEngine.js';
import { buildStadiumClimateSnapshot } from './systems/stadiumClimateEngine.js';
import { validateDataPack2026System } from '../core/safety/datapack-validator.js';
import { runRuntimeAudit } from './systems/auditLogger.js';
import { loadVisualLibrary } from './systems/visualAssetManager.js';
import { runtimeSafetySnapshot } from './systems/uxEngine.js';
import { runBootSafety } from '../core/safety/safe-loader.js';

async function boot(){
  const app = document.getElementById('app');
  let buildInfo = { buildLabel:'Build v5.8.0' };
  try { buildInfo = await (await fetch('build/build-info.json', {cache:'no-store'})).json(); } catch(err) { console.warn('[VFM] build-info fallback', err); }
  const loadedAssetMap = await loadAssetMap();
  await loadVisualLibrary();
  applyCommercialPolish();
  applyAaaUiShell();
  applyMobileExperienceShell();
  applyMobileCertificationShell();
  applyMobileUxFinalShell();
  applyNavigationExperienceShell();
  load();
  runRuntimeAudit(getState(), {phase:'v7.3.1 flow save hotfix boot', stadiumClimate: validateStadiumClimateSystem(buildStadiumClimateSnapshot(getState())), realAudioPack: validateRealAudioPackSystem(buildRealAudioPackSnapshot(getState())), soundAmbience: validateSoundAmbienceSystem(buildSoundAmbienceSnapshot(getState())), matchSimulation90: validateMatchSimulation90System(buildMatchSimulation90Snapshot(getState())), moraleCrisis: validateMoraleCrisisSystem(buildMoraleCrisisSnapshot(getState())), contractRenewal: validateContractRenewalSystem(buildContractRenewalSnapshot(getState())), agentMarket: validateAgentMarketSystem(buildAgentMarketSnapshot(getState())), boardEmotional: validateBoardEmotionalSystem(buildBoardEmotionalSnapshot(getState())), objectivesRetention: validateObjectivesRetentionSystem(buildObjectivesRetentionSnapshot(getState())), squadAI: validateSquadAiSystem(buildSquadAiSnapshot(getState())), matchdayPremium: validateMatchdayPremiumSystem(buildMatchdayPremiumSnapshot(getState())), liveWorld: validateLiveWorldSystem(buildLiveWorldSnapshot(getState())), introCinematic: validateIntroCinematicSystem(buildIntroCinematicSnapshot(getState())), releaseCandidate: validateReleaseCandidateSystem(buildReleaseCandidateSnapshot(getState())), balanceGeneral: validateBalanceGeneralSystem(getState()), guidedTutorial: validateGuidedTutorialSystem(getState()), managerProgression: validateManagerProgressionSystem(getState()), managerJobMarket: validateManagerJobMarketSystem(getState()), pressConference: validatePressConferenceSystem(getState()), careerLoop: validateCareerLoopV592(getState()), rosterLock2026: validateRosterLock2026(getState()), rosterLockSnapshot: buildRosterLock2026Snapshot(getState()), dataPack2026: validateDataPack2026System(getState()), dataPackSnapshot: buildDataPack2026Snapshot(getState()), matchFlow: validateMatchFlowV570(buildMatchExperienceSnapshot(getState())), ux: runtimeSafetySnapshot(getState()), aaa: buildUiAaaSnapshot(getState()), mobile: buildMobileExperienceSnapshot(), mobileCertification: validateMobileCertificationV598(buildMobileCertificationSnapshot()), mobileUxFinal: validateMobileUxFinalV599(buildMobileUxFinalSnapshot()), navigation: validateNavigationSystem({currentRoute:getState().route}), menuHierarchy: validateMenuHierarchy({primaryActions:PRIMARY_ACTIONS_V550, menuGroups:MANAGER_MENU_GROUPS_V550}), touchTargets: validateTouchTargets(), lobby: validateLobbyCompactSystem({primaryActions:PRIMARY_ACTIONS_V550, menuGroups:MANAGER_MENU_GROUPS_V550})});
  validateCommercialState(getState());
  initRouter(app, buildInfo);
  register('cover', cover);
  register('mainMenu', mainMenu);
  register('newGame', newGame);
  register('teamSelect', teamSelect);
  register('confirmCareer', confirmCareer);
  register('lobby', lobby);
  register('managerMenu', managerMenu);
  register('match', match);
  register('pressConference', pressConference);
  const modules = {
    seasonCenter:['Temporada','Tabela viva, rodada completa, acesso, queda e vagas continentais'],
    copaDoBrasil:['Copa do Brasil','Mata-mata, agregado, pênaltis, premiação e vaga na Libertadores'],
    financeCenter:['Economia','Diretoria, orçamento, patrocínio e crise financeira realista'],
    polishCenter:['UI AAA','Polimento visual, responsividade, performance e prontidão comercial'],
    mobileAudit:['Auditoria Mobile','Fluxo real, smoke test de rotas, pós-jogo, save e estabilidade'],
    data2026:['Dados 2026','Divisões, elencos, avatares de jogadores e manutenção segura'],
    database2026:['Banco Maio/2026','Elencos, atributos, contratos, valores, fotos e auditoria pesada'],
    worldCompetitions:['Mundial/Intercontinental','Libertadores, Sul-Americana, rota mundial, finanças e reputação global'],
    worldComplete:['Mundo Completo','Ligas internacionais, competições europeias, calendário global, ranking mundial e mercado global'],
    championship:['Campeonato','Competições e agenda anual'],
    calendar:['Calendário','Agenda completa da temporada'],
    formation:['Formação','Escalação e desenho tático'],
    instructions:['Instruções','Comportamento coletivo e individual'],
    training:['Treino','Plano semanal, evolução, recuperação, base e departamento médico'],
    standings:['Classificação','Tabelas e estatísticas'],
    transfers:['Transferências','Mercado internacional, contratos, pré-contratos, orçamento seguro e IA global'],
    smartMarket:['Mercado Inteligente','Empresários, propostas rivais, IA de clubes e disputa por atletas'],
    academyScouting:['Base & Scouting','Categorias de base, promessas, olheiros e captação global'],
    staff:['Staff','Comissão técnica e funcionários'],
    sponsorship:['Patrocínio','Receitas comerciais e propostas'],
    club:['Clube','Resumo institucional e financeiro'],
    finances:['Financeiro','Orçamento, receitas e despesas'],
    contracts:['Contratos','Contratos de jogadores e renovações'],
    messages:['E-mail','Diretoria, imprensa, empresários, propostas e seleção nacional'],
    careerOffers:['Mercado de treinadores','Propostas, sondagens, contratos, rumores e troca de clube/seleção'],
    nationalTeam:['Seleções','Carreira dupla, convocação, Datas FIFA, Copa América e Copa do Mundo'],
    squad:['Elenco','Jogadores, forma, moral e contratos'],
    settings:['Configurações','Preferências e segurança'],
    aiBalance:['Balanceamento geral','Dificuldade, reputação, XP, economia, propostas e estabilidade da carreira'],
    releaseCandidate:['Beta Pública','Checklist público, matriz mobile, fluxo de teste e prontidão v6.0.0'],
    careerIntro:['Jornada Inicial','Abertura cinematográfica, arco emocional, onboarding guiado e primeira partida'],
    liveWorld:['Lobby Vivo','Jornal esportivo, bastidores, manchetes, torcida e mundo em movimento'],
    matchdayPremium:['Matchday Premium','Dia de jogo premium, pré-jogo, transmissão, banco e pós-jogo emocional'],
    squadAI:['IA de Elenco','Moral, liderança, vestiário, rotação, crise e reação dos jogadores'],
    objectivesHub:['Objetivos e Conquistas','Metas diárias, conquistas, recompensas, retenção e progresso do treinador'],
    emotionalBoard:['Diretoria Viva','Economia emocional, promessas, reuniões, torcida e autonomia no cargo'],
    agentMarket:['Empresários','Negociações vivas, pressão rival, propostas e fechamento seguro'],
    contractRenewal:['Renovação Contratual','Salários, luvas, multas, promessas, moral e efeito dominó'],
    squadMorale:['Moral Avançada','Crises de vestiário, promessas quebradas, salário, banco e capitão'],
    matchSimulation90:['Simulação 90 Minutos','Camada premium 2D/texto, fases táticas, pressão, comandos e drama final'],
    soundAmbience:['Sons e Torcida','Ambiência leve, torcida, apito, tensão e controles seguros de áudio'],
    realAudioPack:['Efeitos Reais','Pacote opcional MP3/WAV/OGG, manifest de áudio e fallback seguro'],
    stadiumClimate:['Clima e Gramado','Clima, estádio, gramado, horário, pressão e impacto tático dinâmico'],
    flowSaveHotfix:['Fluxo Inicial','Capa limpa, central de slots, sair da carreira e menu organizado'],
    saveCenter:['Central de Save','Autosave, backups, exportação, importação e proteção de carreira'],
    assetChecklist:['Assets','Checklist visual, caminhos oficiais, cache e fallbacks'],
    rosterUpdate:['Atualização de Elenco','Importar, exportar e validar elencos por JSON'],
    visualLibrary:['Biblioteca Visual','Fundos dinâmicos, logos, países, ligas e extras integrados'],
    dataPack2026:['Data Pack 2026','Schema oficial, bloqueio anti-genérico, caminhos e plano de elencos 20/05/2026'],
    rosterLock2026:['Roster Lock','Auditoria total, quality gate e travamento dos elencos 20/05/2026'],
    careerTutorial:['Tutorial guiado','Missões iniciais, recompensas, reputação e guia premium do modo carreira'],
    managerProgression:['Evolução do treinador','XP, nível, licença, especialidades e conquistas do manager']
  };
  Object.entries(modules).forEach(([route,[title,sub]]) => register(route, (state)=> moduleScreen(route,title,sub,state)));
  await runBootSafety({ state:getState(), routes:['cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','managerMenu','match','pressConference', ...Object.keys(modules)], assetMap:loadedAssetMap, buildInfo });
  render();
  setInterval(()=>{ document.querySelectorAll('#buildBadge,.build-badge').forEach(el=>{ if(!el.textContent.trim()) el.textContent = buildInfo.buildLabel; }); }, 500);
  setInterval(()=>{ const s=getState(); if(s.route==='match' && s.match?.autoPlay && !s.match?.finalized){ const step = Math.max(5, Math.min(25, Number(s.match.speed || 1) * 5)); advanceMatch(step); render(); } }, 2200);
}
window.addEventListener('error', event => {
  console.error('[VFM] erro global capturado', event.error || event.message);
});
window.addEventListener('unhandledrejection', event => {
  console.error('[VFM] promessa rejeitada capturada', event.reason);
});
boot();
