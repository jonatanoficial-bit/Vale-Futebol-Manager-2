import { matchTimeline } from '../data/matchData.js';
import { deepScoreFromState, getPostMatchReport } from './matchEngine.js';
import { teams } from '../data/gameData.js';
import { nextFixtureForClub as seasonNextFixture, simulateOtherRoundMatches } from './seasonEngine.js';
import { normalizeCareerProgression, buildCareerMissions, applyPostMatchProgression, rolloverInfiniteSeason, careerLoopSnapshot } from './careerProgressionEngine.js';
import { normalizeGuidedTutorial, completeTutorialStepPatch, guidedTutorialAutoPatchForRoute } from './guidedTutorialEngine.js';
import { transferShortlist, negotiations as baseNegotiations, outgoingList, loanTargets, aiClubProfiles, agentEvents } from '../data/transferData.js';
import { buildMarketIntelligence, createSmartIncomingOffer, createIntelligentAIDeal, nextAgentEvent } from './marketIntelligenceEngine.js';
import { scoreFromTimeline, buildBalanceSummary } from './balance.js';
import { squadPlayers as defaultRosterPlayers, rosterMeta as defaultRosterMeta, normalizeRoster } from '../data/squadData.js';
import { buildMay2026RosterForClub } from './playerDatabase2026Engine.js';
import { generateOffers, validateCareerState, validateManagerCareerState, buildManagerCareerSnapshot, buildInternationalCalendar, defaultCallUpSelection } from './careerEngine.js';
import { buildNationalCalendar, buildNationalTeamSnapshot, safeCallUpPool, simulateNationalFixture, NATIONAL_TEAM_ENGINE_VERSION } from './nationalTeamEngine.js';
import { ensureTrainingState, applyTrainingWeek, applyTrainingSession, setWeeklyTrainingPreset, buildTrainingSnapshot, TRAINING_ENGINE_VERSION } from './trainingEngine.js';
import { TRANSFER_ENGINE_VERSION, ensureTransferLedger, evaluateDealSafety, registerTransaction, buildTransferSnapshot, simulateGlobalMarketCycle, createPreContract, validateTransferIntegrity, renewalById } from './transferEngine.js';
import { SAVE_MANAGER_VERSION, SAVE_KEY, writeAutoBackup, readAutoBackup, preserveCorruptSave, exportEnvelopeText, validateSavePayload, migrateLegacyState, writeSlot, readSlot, listSlots, listPlayableSlots, deleteSlot, renameSlot, slotLabel, saveIntegritySnapshot } from './saveManager.js';
import { createPressConferenceSession, answerPressQuestion, applyPressConferenceEffects } from './pressConferenceEngine.js';
import { normalizeManagerProgression, awardManagerXpPatch, xpForMatchResult, setManagerSpecialtyPatch } from './managerProgressionEngine.js';
import { normalizeManagerJobMarket, createJobMarketPatch, registerJobDecisionPatch } from './managerJobMarketEngine.js';
import { normalizeLiveCalendarState, buildCalendarActionPatch, buildMatchCalendarPatch, LIVE_CALENDAR_VERSION } from './liveCalendarEngine.js';
import { normalizeScoutingState, createScoutReportPatch, setScoutAssignmentPatch, setScoutFocusPatch, wishlistScoutPlayerPatch, SCOUTING_VERSION } from './scoutingEngine.js';
import { ensureStaffState, hireStaffPatch, setStaffFocusPatch, runStaffMeetingPatch, buildStaffSnapshot, STAFF_VERSION } from './staffEngine.js';
import { ensureFinanceState, signSponsorPatch, setTicketPolicyPatch, simulateMatchdayRevenuePatch, applyPrizeMoneyPatch, runFinanceBoardMeetingPatch, buildFinanceMatchPatch, buildFinanceSnapshot, FINANCE_VERSION } from './financeEngine.js';

const key = SAVE_KEY;
const legacyKeys = ['vfm_gold_save_v510','vfm_gold_save_v500','vfm_gold_save_v490','vfm_gold_save_v480','vfm_gold_save_v470','vfm_gold_save_v460','vfm_gold_save_v450','vfm_gold_save_v440', 'vfm_gold_save_v430', 'vfm_gold_save_v420', 'vfm_gold_save_v410', 'vfm_gold_save_v400', 'vfm_gold_save_v390', 'vfm_gold_save_v370', 'vfm_gold_save_v360', 'vfm_gold_save_v350', 'vfm_gold_save_v340', 'vfm_gold_save_v330', 'vfm_gold_save_v320', 'vfm_gold_save_v310', 'vfm_gold_save_v300', 'vfm_gold_save_v290', 'vfm_gold_save_v280', 'vfm_gold_save_v270', 'vfm_gold_save_v262', 'vfm_gold_save_v261', 'vfm_gold_save_v260', 'vfm_gold_save_v251', 'vfm_gold_save_v240', 'vfm_gold_save_v230', 'vfm_gold_save_v220', 'vfm_gold_save_v210', 'vfm_gold_save_v200', 'vfm_gold_save_v190', 'vfm_gold_save_v180', 'vfm_gold_save_v170', 'vfm_gold_save_v160', 'vfm_gold_save_v150', 'vfm_gold_save_v140', 'vfm_gold_save_v130', 'vfm_gold_save_v120', 'vfm_gold_save_v110', 'vfm_gold_save_v100', 'vfm_gold_save_v090', 'vfm_gold_save_v080', 'vfm_gold_save_v050', 'vfm_gold_save_v040', 'vfm_gold_save_v030', 'vfm_gold_save_v020', 'vfm_gold_save_v010'];

function clubRosterPackage(clubId='santos'){
  const pack = buildMay2026RosterForClub(clubId);
  return { meta: pack.meta, players: normalizeRoster(pack.players), lastImport:null, lastExport:null, validationLog:[`Elenco Maio/2026 carregado para ${pack.meta.clubName || clubId}.`] };
}
function primaryPlayerIds(players=[]){
  const ordered = [...players].sort((a,b)=>Number(b.overall||0)-Number(a.overall||0));
  const byPos = pos => ordered.find(p=>String(p.pos||'').includes(pos)) || ordered[0] || {id:'player-1'};
  return {
    captainId: ordered[0]?.id || 'player-1',
    penaltyTakerId: byPos('ATA').id || ordered[0]?.id || 'player-1',
    freeKickTakerId: (ordered.find(p=>['MEI','MC','PE','PD'].includes(p.pos)) || ordered[0] || {id:'player-1'}).id,
    cornerTakerId: (ordered.find(p=>['MEI','PE','PD','MC'].includes(p.pos)) || ordered[0] || {id:'player-1'}).id
  };
}
function cleanLeagueStateForNewCareer(career={}, clubId='santos'){
  return {
    ...career,
    currentDate:'2026-04-13',
    matchday:1,
    completedMatches:[],
    lastResult:null,
    lastRoundResults:[],
    integrationLog:[`Carreira limpa iniciada na v5.3.0 para ${clubId}: tabela zerada, elenco do clube carregado e dados de demonstração removidos.`]
  };
}

export const defaultState = () => ({
  route:'cover',
  manager:{ name:'Joao Victor', country:'br', avatar:'assets/avatars/manager-01.png', reputation:82, mode:'career' },
  clubId:'santos', season:2026, month:'Maio', money:92.5, coins:250, notifications:6, boardTrust:76, fanMood:82, jobSecurity:'Seguro',
  match:{ id:'2026-05-24-santos-palmeiras', date:'2026-05-24', competitionId:'brasileirao-a', competition:'Brasileirão Série A 2026', stage:'Rodada atual', minute:1, home:'santos', away:'palmeiras', homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[], postMatchReport:null, nextMatchQueued:null, reportViewed:false },
  career:{ currentDate:'2026-05-19', matchday:1, completedMatches:[], lastResult:null, promotionRelegation:{serieARelegation:4,serieBPromotion:4,libertadoresTop:5,sulamericanaRange:[6,12],serieBRelegation:4}, integrationLog:['Carreira migrada para v5.1.0 com save profissional, múltiplos slots, backups automáticos e recuperação de carreira.'], jobOffers:[], offerHistory:[], jobMarket:null, nationalTeamJob:null, dualCareer:{enabled:false, club:true, nationalTeam:null}, callUpSelection:defaultCallUpSelection(), internationalCalendar:buildNationalCalendar(2026, 'brasil'), managerProfile:null, activeContract:null, contractHistory:[], titleHistory:[], sackRiskLog:[], managerTimeline:[], unlockedMilestones:[], boardRelationship:76, fanRelationship:82, dressingRoomTrust:69, mediaPressure:54, worldCompetitionCycle:{libertadores:true,sulamericana:true,clubWorldCupCycle:4,worldCupCycle:4,lastUpdated:'v4.3.0'}, financeReport:{profile:'balanced', lastMonthlyCycle:null, crisisLog:[], boardWarnings:[], sponsorReview:'v3.5.0'}, tutorial:{seen:false, step:1, completed:false}, missions:[], completedSeasons:0, seasonHistory:[], lifetimeEarnings:0, reputationHistory:[], activeStory:['Bem-vindo ao modo carreira: jogue partidas, cumpra missões, aumente renda e reputação sem limite de temporadas.'], pressHistory:[], pressConference:null, managerProgression:null },
  gameplay:{ difficulty:'realistic', aiVersion:'v5.4.0', realism:88, variance:18, balanceLog:[] },
  stability:{ autosave:true, lastBackup:null, backupCount:0, lastExport:null, lastImport:null, safeModeEvents:0, health:'Excelente', auditVersion:SAVE_MANAGER_VERSION, saveManagerVersion:SAVE_MANAGER_VERSION, saveIntegrity:'ok', commercialAudit:'v3.7.0-ok', fullscreenMobile:true, overflowGuard:true, rosterSafeMode:true, matchEngineSafeMode:true, matchEngineVersion:'v4.7.0', matchStressTest:'passed-100', trainingEngineVersion:TRAINING_ENGINE_VERSION, trainingStressTest:'passed-4-weeks', transferEngineVersion:TRANSFER_ENGINE_VERSION, transferIntegrity:'pending' },
  save:{ version:SAVE_MANAGER_VERSION, schema:790, activeSlot:'principal', slotLabel:'Carreira principal', careerStarted:false, migratedFrom:null, lastMigrationAt:null, exportCount:0, importCount:0, autosaveCheckpoints:[] },
  roster:clubRosterPackage('santos'),
  finance:ensureFinanceState({profile:'balanced', cash:92.5, crisisLog:[], boardWarnings:[], sponsorReview:FINANCE_VERSION}, {clubId:'santos', money:92.5}),
  training:ensureTrainingState(),
  calendar:normalizeLiveCalendarState({currentDate:'2026-05-19'}),
  scouting:normalizeScoutingState({}, {clubId:'santos'}),
  staff:ensureStaffState({}, {clubId:'santos'}),
  transfer:ensureTransferLedger({ budget:42.8, wageRoom:2.4, negotiationLog:[], activeNegotiations:[], acceptedDeals:[], rejectedDeals:[], outgoingDeals:[], renewals:[], loanDeals:[], incomingOffers:[], aiDeals:[], agentEvents:[], smartReports:[], windowOpen:true, boardApproval:82, marketDay:1, intelligenceVersion:'v3.7.0' }),
  ui:{ selectedAvatar:'assets/avatars/manager-01.png', selectedMode:'career', selectedCountry:'br', selectedClub:'santos', teamCountryFilter:'all', teamLeagueFilter:'all', teamSort:'level', standingsCompetition:'brasileirao-a', selectedFormation:'433-possession', tacticalProfile:'possession', trainingTheme:'possession', transferFilter:'all', squadView:'best', captainId:'neymar', penaltyTakerId:'neymar', freeKickTakerId:'neymar', cornerTakerId:'gabriel-menino' }
});
let state = defaultState();
function sanitizeManager(manager={}){
  const cleanName = String(manager.name || '').trim().slice(0, 32) || 'Manager Vale';
  return {
    name: cleanName,
    country: String(manager.country || 'br'),
    avatar: String(manager.avatar || 'assets/avatars/manager-01.png'),
    reputation: Number(manager.reputation || 82),
    mode: String(manager.mode || 'career')
  };
}
function normalize(next){
  const base = defaultState();
  const merged = {...base, ...next};
  merged.manager = sanitizeManager({...base.manager, ...(next?.manager || {})});
  merged.ui = {...base.ui, ...(next?.ui || {})};
  merged.match = {...base.match, ...(next?.match || {})};
  if(!Array.isArray(merged.match.substitutions)) merged.match.substitutions = [];
  if(!Array.isArray(merged.match.usedSubPlayers)) merged.match.usedSubPlayers = [];
  if(!merged.match.postMatchReport) merged.match.postMatchReport = null;
  if(!merged.match.nextMatchQueued) merged.match.nextMatchQueued = null;
  if(typeof merged.match.reportViewed !== 'boolean') merged.match.reportViewed = false;
  merged.match.maxSubs = Math.max(3, Math.min(5, Number(merged.match.maxSubs || 5)));
  merged.match.decision = String(merged.match.decision || 'balanced');
  merged.match.tacticalBoost = Number(merged.match.tacticalBoost || 0);
  merged.career = validateCareerState({...base.career, ...(next?.career || {})});
  merged.career.callUpSelection = safeCallUpPool(merged.career.callUpSelection);
  const ntId = merged.career.nationalTeamJob?.id || merged.career.dualCareer?.nationalTeam || 'brasil';
  if(!Array.isArray(merged.career.internationalCalendar) || merged.career.internationalCalendar.length < 5) merged.career.internationalCalendar = buildNationalCalendar(Number(merged.season||2026), ntId);
  if(merged.career.nationalTeamJob && !merged.career.dualCareer?.enabled) merged.career.dualCareer = {enabled:true, club:true, nationalTeam:merged.career.nationalTeamJob.id};
  merged.career = validateManagerCareerState(merged.career, merged);
  const careerProgression = normalizeCareerProgression(merged.career, merged);
  merged.career = {...merged.career, ...careerProgression};
  merged.career.tutorial = normalizeGuidedTutorial(merged.career.tutorial || {});
  merged.career.missions = buildCareerMissions(merged);
  merged.career.managerProgression = normalizeManagerProgression(merged);
  merged.career.jobMarket = normalizeManagerJobMarket(merged);
  if(!Array.isArray(merged.career.completedMatches)) merged.career.completedMatches = [];
  if(!Array.isArray(merged.career.integrationLog)) merged.career.integrationLog = [];
  if(!Array.isArray(merged.career.pressHistory)) merged.career.pressHistory = [];
  if(merged.career.pressConference && typeof merged.career.pressConference !== 'object') merged.career.pressConference = null;
  merged.gameplay = {...base.gameplay, ...(next?.gameplay || {})};
  if(!Array.isArray(merged.gameplay.balanceLog)) merged.gameplay.balanceLog = [];
  if(!['easy','realistic','hardcore'].includes(merged.gameplay.difficulty)) merged.gameplay.difficulty = 'realistic';
  merged.stability = {...base.stability, ...(next?.stability || {})};
  merged.stability.backupCount = Math.max(0, Number(merged.stability.backupCount || 0));
  if(typeof merged.stability.autosave !== 'boolean') merged.stability.autosave = true;
  merged.stability.auditVersion = SAVE_MANAGER_VERSION;
  merged.stability.saveManagerVersion = SAVE_MANAGER_VERSION;
  merged.save = {...base.save, ...(next?.save || {})};
  merged.save.version = SAVE_MANAGER_VERSION;
  merged.save.schema = 790;
  merged.save.activeSlot = String(merged.save.activeSlot || 'principal').slice(0,32);
  merged.save.exportCount = Math.max(0, Number(merged.save.exportCount || 0));
  merged.save.importCount = Math.max(0, Number(merged.save.importCount || 0));
  merged.save.autosaveCheckpoints = Array.isArray(merged.save.autosaveCheckpoints) ? merged.save.autosaveCheckpoints.slice(-10) : [];
  merged.roster = {...base.roster, ...(next?.roster || {})};
  const normalizedRoster = normalizeRoster(merged.roster.players);
  if(normalizedRoster.length >= 11) merged.roster.players = normalizedRoster; else { merged.roster.players = base.roster.players; merged.roster.validationLog = [...(merged.roster.validationLog||[]), 'Roster importado recusado: menos de 11 jogadores validos.']; }
  merged.roster.meta = {...base.roster.meta, ...(merged.roster.meta || {})};
  if(!Array.isArray(merged.roster.validationLog)) merged.roster.validationLog = [];
  merged.finance = ensureFinanceState({...(base.finance||{}), ...(next?.finance || {})}, merged);
  const financeSnap = buildFinanceSnapshot(merged);
  merged.finance.health = financeSnap.health;
  merged.finance.monthlyBalance = financeSnap.monthlyBalance;
  merged.finance.sponsorSatisfaction = financeSnap.sponsorSatisfaction;
  merged.money = Number(merged.finance.cash ?? merged.money ?? 0);
  merged.stability.financeVersion = FINANCE_VERSION;
  merged.scouting = normalizeScoutingState({...(base.scouting||{}), ...(next?.scouting || {})}, merged);
  merged.stability.scoutingVersion = SCOUTING_VERSION;
  merged.staff = ensureStaffState({...(base.staff||{}), ...(next?.staff || {})}, merged);
  const staffSnapshot = buildStaffSnapshot(merged);
  merged.staff.matchImpact = staffSnapshot.matchImpact;
  merged.staff.trainingQuality = staffSnapshot.metrics.trainingQuality;
  merged.staff.scoutAccuracy = staffSnapshot.metrics.scoutAccuracy;
  merged.stability.staffVersion = STAFF_VERSION;
  merged.training = ensureTrainingState({...(base.training||{}), ...(next?.training || {})});
  merged.calendar = normalizeLiveCalendarState({...(base.calendar||{}), ...(next?.calendar || {})}, merged);
  merged.stability.trainingEngineVersion = TRAINING_ENGINE_VERSION;
  merged.stability.liveCalendarVersion = LIVE_CALENDAR_VERSION;
  merged.transfer = ensureTransferLedger({...base.transfer, ...(next?.transfer || {})});
  merged.transfer.budget = Math.max(0, Number(merged.transfer.budget || base.transfer.budget));
  merged.transfer.wageRoom = Math.max(0, Number(merged.transfer.wageRoom || base.transfer.wageRoom));
  if(!Array.isArray(merged.transfer.negotiationLog)) merged.transfer.negotiationLog = [];
  if(!Array.isArray(merged.transfer.activeNegotiations)) merged.transfer.activeNegotiations = [];
  if(!Array.isArray(merged.transfer.acceptedDeals)) merged.transfer.acceptedDeals = [];
  if(!Array.isArray(merged.transfer.rejectedDeals)) merged.transfer.rejectedDeals = [];
  if(!Array.isArray(merged.transfer.outgoingDeals)) merged.transfer.outgoingDeals = [];
  if(!Array.isArray(merged.transfer.renewals)) merged.transfer.renewals = [];
  if(!Array.isArray(merged.transfer.loanDeals)) merged.transfer.loanDeals = [];
  if(!Array.isArray(merged.transfer.incomingOffers)) merged.transfer.incomingOffers = [];
  if(!Array.isArray(merged.transfer.aiDeals)) merged.transfer.aiDeals = [];
  if(!Array.isArray(merged.transfer.agentEvents)) merged.transfer.agentEvents = [];
  if(!Array.isArray(merged.transfer.smartReports)) merged.transfer.smartReports = [];
  merged.transfer.intelligenceVersion = String(merged.transfer.intelligenceVersion || 'v3.7.0');
  merged.transfer.marketEngineVersion = TRANSFER_ENGINE_VERSION;
  merged.transfer.ledger = ensureTransferLedger(merged.transfer).ledger;
  if(typeof merged.transfer.windowOpen !== 'boolean') merged.transfer.windowOpen = true;
  merged.transfer.boardApproval = Math.max(0, Math.min(100, Number(merged.transfer.boardApproval || 82)));
  merged.transfer.marketDay = Math.max(1, Number(merged.transfer.marketDay || 1));
  merged.match.minute = Math.max(1, Math.min(90, Number(merged.match.minute || 1)));
  if(typeof merged.match.finalized !== 'boolean') merged.match.finalized = merged.match.minute >= 90 && merged.career.completedMatches.some(m=>m.id===merged.match.id);
  if(!merged.ui.selectedAvatar) merged.ui.selectedAvatar = merged.manager.avatar;
  if(!merged.ui.selectedCountry) merged.ui.selectedCountry = merged.manager.country;
  if(!merged.ui.selectedMode) merged.ui.selectedMode = merged.manager.mode;
  if(!merged.ui.selectedClub) merged.ui.selectedClub = merged.clubId || 'santos';
  if(!merged.ui.teamCountryFilter) merged.ui.teamCountryFilter = 'all';
  if(!merged.ui.teamLeagueFilter) merged.ui.teamLeagueFilter = 'all';
  if(!merged.ui.teamSort) merged.ui.teamSort = 'level';
  if(!merged.ui.standingsCompetition) merged.ui.standingsCompetition = 'brasileirao-a';
  if(!merged.ui.selectedFormation) merged.ui.selectedFormation = '433-possession';
  if(!merged.ui.tacticalProfile) merged.ui.tacticalProfile = 'possession';
  if(!merged.ui.trainingTheme) merged.ui.trainingTheme = 'possession';
  if(!merged.ui.transferFilter) merged.ui.transferFilter = 'all';
  if(!merged.ui.squadView) merged.ui.squadView = 'best';
  if(!merged.ui.captainId) merged.ui.captainId = 'neymar';
  if(!merged.ui.penaltyTakerId) merged.ui.penaltyTakerId = merged.ui.captainId || 'neymar';
  if(!merged.ui.freeKickTakerId) merged.ui.freeKickTakerId = merged.ui.penaltyTakerId || 'neymar';
  if(!merged.ui.cornerTakerId) merged.ui.cornerTakerId = 'gabriel-menino';
  const activeClub = merged.clubId || 'santos';
  const activeRosterClub = merged.roster?.meta?.clubId;
  const safeToAutoSyncRoster = !merged.roster?.lastImport || String(activeRosterClub || '') === 'santos' || !merged.career.completedMatches.length;
  if(activeRosterClub && activeRosterClub !== activeClub && safeToAutoSyncRoster){
    const repaired = clubRosterPackage(activeClub);
    merged.roster = {...repaired, validationLog:[...(merged.roster.validationLog||[]).slice(-3), `Correção v5.3.0: elenco trocado de ${activeRosterClub} para ${activeClub}.`, ...repaired.validationLog]};
    const ids = primaryPlayerIds(merged.roster.players);
    merged.ui = {...merged.ui, ...ids};
  }
  if(!merged.match || !merged.match.home || !merged.match.away || (activeClub !== 'santos' && (merged.match.home === 'santos' || merged.match.away === 'santos') && !merged.career.completedMatches.length)) {
    merged.match = buildClubFixture(activeClub, 0);
  }
  if(typeof merged.match.autoPlay !== 'boolean') merged.match.autoPlay = false;
  if(typeof merged.match.postMatchReady !== 'boolean') merged.match.postMatchReady = Boolean(merged.match.finalized);
  return merged;
}
export function getState(){ return state; }
export function setState(patch){ state = normalize({...state, ...patch}); persist(); }
export function setManager(patch){ state = normalize({...state, manager:{...state.manager, ...patch}}); persist(); }
export function setUI(patch){ state = normalize({...state, ui:{...state.ui, ...patch}}); persist(); }

function getTeam(id){ return teams.find(t => t.id === id) || teams.find(t=>t.id==='santos') || teams[0]; }
function leagueTeams(leagueId){ return teams.filter(t => t.leagueId === leagueId); }
function matchLabelForClub(team){ return team?.leagueId === 'brasileirao-b' ? 'Brasileirão Série B 2026' : 'Brasileirão Série A 2026'; }
function buildClubFixture(clubId='santos', index=0){
  const completed = Array.isArray(state?.career?.completedMatches) ? state.career.completedMatches : [];
  const f = seasonNextFixture(clubId, completed);
  const club = getTeam(clubId);
  if(!f){
    const rival = teams.find(t=>t.id!==clubId) || club;
    return {id:`fallback-${clubId}-${rival.id}`, date:'2026-05-24', competitionId:club.leagueId||'brasileirao-a', competition:matchLabelForClub(club), stage:'Rodada 1', round:1, minute:1, home:clubId, away:rival.id, homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[], postMatchReport:null, nextMatchQueued:null, reportViewed:false};
  }
  return {...f, minute:1, homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[], postMatchReport:null, nextMatchQueued:null, reportViewed:false};
}
function nextFixtureForClub(clubId, afterIndex=0){ return buildClubFixture(clubId, afterIndex); }

export function startCareer(){
  const chosenClub = state.ui.selectedClub || state.clubId || 'santos';
  const chosenTeam = getTeam(chosenClub);
  const rosterPack = clubRosterPackage(chosenClub);
  const starters = primaryPlayerIds(rosterPack.players);
  const firstMatch = buildClubFixture(chosenClub, 0);
  const transferBudget = Math.max(0, Number(chosenTeam?.budget || 30));
  state = normalize({
    ...state,
    manager:{
      ...state.manager,
      avatar: state.ui.selectedAvatar || state.manager.avatar,
      country: state.ui.selectedCountry || state.manager.country,
      mode: state.ui.selectedMode || state.manager.mode
    },
    clubId: chosenClub,
    money: transferBudget,
    boardTrust: 76,
    fanMood: 76,
    jobSecurity:'Seguro',
    match: firstMatch,
    career: {...cleanLeagueStateForNewCareer({...state.career}, chosenClub), tutorial:{seen:false, step:1, completed:false}, missions:[], completedSeasons:0, seasonHistory:[], lifetimeEarnings:0, reputationHistory:[{season:state.season||2026, rep:state.manager?.reputation||82, note:'Início da carreira'}], activeStory:['Primeira missão: participe da coletiva, revise o elenco, ajuste a tática e jogue sua estreia oficial.'], pressHistory:[], pressConference:null, managerProgression:null},
    roster: rosterPack,
    calendar: normalizeLiveCalendarState({currentDate:firstMatch.date || '2026-05-24', calendarLog:[`Fase 58: calendário vivo iniciado para ${chosenTeam?.name || chosenClub}.`]}),
    transfer: ensureTransferLedger({...(state.transfer || {}), budget: Number((transferBudget * 0.45).toFixed(1)), wageRoom: Math.max(0.8, Number((transferBudget/40).toFixed(2))), acceptedDeals:[], rejectedDeals:[], outgoingDeals:[], renewals:[], loanDeals:[], incomingOffers:[], aiDeals:[], agentEvents:[], smartReports:[], marketDay:1}),
    ui:{...state.ui, selectedClub:chosenClub, standingsCompetition:chosenTeam?.leagueId || 'brasileirao-a', ...starters},
    route:'lobby',
    finance: ensureFinanceState({cash:Number(chosenTeam?.budget || state.money || 40), profile:'balanced', ledger:[`Fase 62: financeiro profundo iniciado para ${chosenTeam?.name || chosenClub}.`]}, {clubId:chosenClub, ui:{selectedClub:chosenClub}, money:Number(chosenTeam?.budget || state.money || 40)}),
    scouting: normalizeScoutingState({observerLog:[`Fase 59: scout profissional iniciado para ${chosenTeam?.name || chosenClub}.`]}, {clubId:chosenClub, ui:{selectedClub:chosenClub}}),
    staff: ensureStaffState({staffLog:[`Fase 61: comissão técnica viva iniciada para ${chosenTeam?.name || chosenClub}.`]}, {clubId:chosenClub, ui:{selectedClub:chosenClub}}),
    save:{...(state.save||{}), version:SAVE_MANAGER_VERSION, schema:790, activeSlot:state.save?.activeSlot || 'principal', slotLabel:state.save?.slotLabel || slotLabel(state.save?.activeSlot || 'principal'), careerStarted:true}
  });
  persist();
}


function scoreUntilMinute(match){
  return deepScoreFromState(match, state);
}
function findNextMatch(afterId){
  const completedCount = Array.isArray(state.career?.completedMatches) ? state.career.completedMatches.length : 0;
  return nextFixtureForClub(state.clubId || state.ui?.selectedClub || 'santos', completedCount + 1);
}
function slug(name=''){
  return String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/fc|futebol clube|club de regatas|sport club/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'santos';
}
function competitionIdFromName(name=''){
  const n = String(name).toLowerCase();
  if(n.includes('copa do brasil')) return 'copa-do-brasil';
  if(n.includes('sul')) return 'sulamericana';
  if(n.includes('paul')) return 'paulistao';
  return 'brasileirao-a';
}
function logIntegration(message){
  const list = Array.isArray(state.career?.integrationLog) ? state.career.integrationLog.slice(-5) : [];
  list.push(message);
  state.career.integrationLog = list;
}
export function advanceMatch(minutes=5){
  const current = {...(state.match || defaultState().match)};
  if(current.finalized) return finishMatch();
  current.minute = Math.min(90, Math.max(1, Number(current.minute || 1) + Number(minutes || 5)));
  state = normalize({...state, match:current});
  if(current.minute >= 90) finishMatch(); else persist();
  return state.match;
}
export function setMatchSpeed(speed=1){
  state = normalize({...state, match:{...state.match, speed:Number(speed)||1}});
  persist();
}
export function setMatchAutoPlay(enabled=true){
  state = normalize({...state, match:{...state.match, autoPlay:Boolean(enabled)}});
  persist();
}
function pointsForClub(match, score){
  const club = state.clubId || 'santos';
  const isHome = match.home === club;
  const gf = isHome ? score.home : score.away;
  const ga = isHome ? score.away : score.home;
  return gf > ga ? 3 : gf === ga ? 1 : 0;
}
export function finishMatch(){
  const current = {...(state.match || defaultState().match), minute:90, finalized:true, postMatchReady:true, autoPlay:false};
  const score = scoreUntilMinute(current);
  current.homeGoals = score.home;
  current.awayGoals = score.away;
  current.postMatchReport = current.postMatchReport || getPostMatchReport(current, state);
  const already = (state.career?.completedMatches || []).some(m => m.id === current.id);
  const result = {
    id: current.id,
    date: current.date || state.career?.currentDate || '2026-05-19',
    competitionId: current.competitionId || 'brasileirao-a',
    competition: current.competition || 'Brasileirão Série A',
    stage: current.stage || 'Rodada',
    home: current.home || 'santos',
    away: current.away || 'palmeiras',
    homeGoals: score.home,
    awayGoals: score.away,
    points: pointsForClub(current, score),
    summary: `${score.home} x ${score.away}`,
    report: current.postMatchReport
  };
  const otherResults = already ? [] : simulateOtherRoundMatches({...state, match:current}, Number(current.round || state.career?.matchday || 1));
  const completed = already ? state.career.completedMatches : [...(state.career?.completedMatches || []), result, ...otherResults];
  const next = seasonNextFixture(state.clubId || state.ui?.selectedClub || 'santos', completed);
  const moneyBonus = result.points === 3 ? 2.5 : result.points === 1 ? 0.8 : 0.2;
  const trustDelta = result.points === 3 ? 2 : result.points === 1 ? 0 : -2;
  const fanDelta = result.points === 3 ? 3 : result.points === 1 ? 0 : -3;
  const dressingDelta = result.points === 3 ? 2 : result.points === 1 ? 0 : -2;
  const mediaDelta = result.points === 3 ? -1 : result.points === 1 ? 0 : 3;
  const balanceLog = Array.isArray(state.gameplay?.balanceLog) ? state.gameplay.balanceLog.slice(-9) : [];
  balanceLog.push({date:result.date, match:result.id, report:buildBalanceSummary(current, state), result:result.summary});
  const reviewBefore = buildManagerCareerSnapshot(state).security;
  let career = {...state.career, completedMatches:completed, lastResult:result, lastPostMatchReport:current.postMatchReport, currentDate: next?.date || result.date, matchday:Number(current.round || state.career?.matchday || 1)+1, lastRoundResults:[result, ...otherResults].slice(0,10), dressingRoomTrust:Math.max(0, Math.min(100, Number(state.career?.dressingRoomTrust||68) + (already?0:dressingDelta))), mediaPressure:Math.max(0, Math.min(100, Number(state.career?.mediaPressure||54) + (already?0:mediaDelta))), managerTimeline:[...((state.career?.managerTimeline)||[]), {date:result.date, title:`${result.competition} · ${result.stage}`, text:`Resultado ${result.summary}. Segurança no cargo antes da atualização: ${reviewBefore.label}.`}].slice(-24)};
  const progressionPatch = already ? {managerReputation:state.manager?.reputation||82, career} : applyPostMatchProgression({...state, career}, result, moneyBonus);
  career = progressionPatch.career;
  const xpPatch = already ? {} : awardManagerXpPatch({...state, manager:{...(state.manager||{}), reputation:progressionPatch.managerReputation}, career}, xpForMatchResult(result), `partida: ${result.summary}`, {match:result.id});
  const liveCalendarPatch = already ? {} : buildMatchCalendarPatch(state, result, current);
  const financePatch = already ? {} : buildFinanceMatchPatch({...state, calendar:liveCalendarPatch.calendar || state.calendar}, result);
  state = normalize({
    ...state,
    match: {...current, nextMatchQueued:next || null, reportViewed:false},
    manager:{...(state.manager||{}), reputation:xpPatch.manager?.reputation ?? progressionPatch.managerReputation},
    career: {...(xpPatch.career || career), integrationLog:[...(((xpPatch.career || career).integrationLog)||[]), ...((liveCalendarPatch.integrationLog)||[]), ...((financePatch.integrationLog)||[])].slice(-12)},
    training: liveCalendarPatch.training || state.training,
    calendar: liveCalendarPatch.calendar || state.calendar,
    finance: financePatch.finance || state.finance,
    money: Number((Number(financePatch.money ?? state.money ?? 0) + (already ? 0 : moneyBonus)).toFixed(1)),
    boardTrust: Math.max(0, Math.min(100, Number(state.boardTrust || 76) + (already ? 0 : trustDelta))),
    fanMood: Math.max(0, Math.min(100, Number(state.fanMood || 82) + (already ? 0 : fanDelta))),
    notifications: Number(state.notifications || 0) + (already ? 0 : 1),
    gameplay:{...state.gameplay, balanceLog},
    stability:{...(state.stability||{}), health:'Pós-jogo salvo com segurança', auditVersion:'v7.9.0', financeVersion:FINANCE_VERSION}
  });
  logIntegration(`Resultado integrado: ${result.competition} ${result.stage} terminou ${result.summary}. Relatório pós-jogo preservado antes do retorno ao lobby.`);
  persist();
  return result;
}

export function completePostMatchAndReturnLobby(){
  const current = state.match || defaultState().match;
  const queued = current.nextMatchQueued || seasonNextFixture(state.clubId || state.ui?.selectedClub || 'santos', state.career?.completedMatches || []);
  let seasonPatch = {};
  let nextMatch = queued ? {...queued, minute:1, homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[], postMatchReport:null, nextMatchQueued:null, reportViewed:false} : null;
  if(!nextMatch){
    seasonPatch = rolloverInfiniteSeason(state);
    const first = seasonNextFixture(state.clubId || state.ui?.selectedClub || 'santos', []);
    nextMatch = first ? {...first, date:(first.date || '2026-04-13').replace(/^2026/, String(seasonPatch.season)), competition:(first.competition || '').replace(/2026/g, String(seasonPatch.season)), minute:1, homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[], postMatchReport:null, nextMatchQueued:null, reportViewed:false} : {...current, reportViewed:true, autoPlay:false};
  }
  state = normalize({
    ...state,
    ...seasonPatch,
    route:'lobby',
    match:nextMatch,
    calendar: normalizeLiveCalendarState({...(state.calendar||{}), currentDate: nextMatch?.date || state.calendar?.currentDate || state.career?.currentDate, calendarLog:[...((state.calendar?.calendarLog)||[]), `Próximo compromisso carregado no calendário vivo: ${nextMatch?.date || 'sem data'}.`].slice(-30)}, state),
    stability:{...(state.stability||{}), health: seasonPatch.season ? 'Nova temporada iniciada com segurança' : 'Fluxo pós-jogo concluído', auditVersion:'v7.5.0'}
  });
  logIntegration('Relatório pós-jogo confirmado: save protegido e retorno ao lobby executado.');
  persist();
  return state.match;
}


export function openPreMatchPressConference(){
  const current = state.match || defaultState().match;
  if(current.finalized || current.prePressDoneFor === current.id){
    state = normalize({...state, route:'match'});
    persist();
    return state.career?.pressConference;
  }
  const session = createPressConferenceSession(state, 'pre');
  state = normalize({...state, route:'pressConference', career:{...state.career, pressConference:session}});
  logIntegration(`Coletiva pré-jogo aberta para ${current.competition || 'competição'} ${current.stage || ''}.`);
  persist();
  return session;
}

export function openPostMatchPressConference(){
  const current = state.match || defaultState().match;
  if(!current.finalized){
    return openPreMatchPressConference();
  }
  if(current.postPressDoneFor === current.id){
    return completePostMatchAndReturnLobby();
  }
  const session = createPressConferenceSession(state, 'post');
  state = normalize({...state, route:'pressConference', career:{...state.career, pressConference:session}});
  logIntegration(`Coletiva pós-jogo aberta para ${current.competition || 'competição'} ${current.stage || ''}.`);
  persist();
  return session;
}

export function answerPressConference(answerId){
  const session = state.career?.pressConference || createPressConferenceSession(state, state.match?.finalized ? 'post' : 'pre');
  const updated = answerPressQuestion(session, answerId);
  state = normalize({...state, career:{...state.career, pressConference:updated}});
  logIntegration(`Resposta de coletiva registrada: ${updated.answers?.slice(-1)?.[0]?.tone || 'sem tom definido'}.`);
  persist();
  return updated;
}

export function completePressConference(){
  const session = state.career?.pressConference;
  if(!session?.completed){
    state = normalize({...state, route:'lobby'});
    persist();
    return state;
  }
  state = normalize(applyPressConferenceEffects(state, session));
  state = normalize({...state, ...awardManagerXpPatch(state, 35, 'coletiva de imprensa concluída', {pressType:session.type})});
  const nextRoute = session.nextRoute || (session.type === 'post' ? 'lobby' : 'match');
  if(session.type === 'post'){
    state = normalize({...state, career:{...state.career, pressConference:{...state.career.pressConference, applied:true, active:false}}});
    persist();
    completePostMatchAndReturnLobby();
    return state;
  }
  state = normalize({...state, route:nextRoute, career:{...state.career, pressConference:{...state.career.pressConference, applied:true, active:false}}});
  logIntegration(`Coletiva ${session.type === 'post' ? 'pós-jogo' : 'pré-jogo'} concluída. Próxima tela: ${state.route}.`);
  persist();
  return state;
}

export function setMatchDecision(decision='balanced'){
  const allowed = {
    possession:{label:'Manter posse', boost:2, note:'Time reduz risco, preserva energia e controla melhor o relógio.'},
    pressure:{label:'Pressionar saída', boost:3, note:'Time sobe a marcação, cria mais roubadas e aumenta fadiga.'},
    right:{label:'Explorar direita', boost:2, note:'Ataques passam a buscar o corredor direito contra lateral cansado.'},
    lowblock:{label:'Baixar bloco', boost:-1, note:'Time protege a área e aceita menos posse para defender vantagem.'},
    balanced:{label:'Equilibrado', boost:0, note:'Time mantém plano base sem exposição extra.'}
  };
  const item = allowed[decision] || allowed.balanced;
  const current = {...(state.match || defaultState().match)};
  current.decision = decision in allowed ? decision : 'balanced';
  current.tacticalBoost = item.boost;
  const log = Array.isArray(current.decisionLog) ? current.decisionLog.slice(-4) : [];
  log.push({minute:Number(current.minute||1), label:item.label, note:item.note});
  current.decisionLog = log;
  state = normalize({...state, match:current});
  logIntegration(`Decisão em jogo aplicada aos ${current.minute}': ${item.label}.`);
  persist();
}

export function makeSubstitution(outPlayer='giuliano', inPlayer='miguelito'){
  const current = {...(state.match || defaultState().match)};
  const substitutions = Array.isArray(current.substitutions) ? current.substitutions.slice() : [];
  const used = new Set(Array.isArray(current.usedSubPlayers) ? current.usedSubPlayers : []);
  const minute = Math.max(1, Math.min(90, Number(current.minute || 1)));
  const maxSubs = Math.max(3, Math.min(5, Number(current.maxSubs || 5)));
  if(current.finalized || minute >= 90){
    logIntegration('Substituição bloqueada com segurança: partida encerrada.');
    return false;
  }
  if(substitutions.length >= maxSubs){
    logIntegration('Substituição bloqueada com segurança: limite máximo atingido.');
    return false;
  }
  if(!outPlayer || !inPlayer || outPlayer === inPlayer || used.has(inPlayer)){
    logIntegration('Substituição ignorada: combinação inválida ou atleta já utilizado.');
    return false;
  }
  const record = {minute, out:outPlayer, in:inPlayer, id:`sub-${minute}-${outPlayer}-${inPlayer}`};
  substitutions.push(record);
  used.add(inPlayer);
  current.substitutions = substitutions;
  current.usedSubPlayers = [...used];
  current.tacticalBoost = Number(current.tacticalBoost || 0) + 1;
  const subLog = Array.isArray(current.subLog) ? current.subLog.slice(-4) : [];
  subLog.push(record);
  current.subLog = subLog;
  state = normalize({...state, match:current});
  logIntegration(`Substituição realizada aos ${minute}': ${outPlayer} por ${inPlayer}.`);
  persist();
  return true;
}

export function getCompletedMatchMap(){
  return new Map((state.career?.completedMatches || []).map(m => [m.id, m]));
}


function transferLog(message){
  const transfer = {...(state.transfer || defaultState().transfer)};
  const log = Array.isArray(transfer.negotiationLog) ? transfer.negotiationLog.slice(-7) : [];
  log.push({time:new Date().toISOString(), message});
  transfer.negotiationLog = log;
  state = normalize({...state, transfer});
  logIntegration(message);
}
function findTarget(playerId){
  return transferShortlist.find(p => p.id === playerId) || null;
}
function findOutgoing(name){
  return outgoingList.find(p => slug(p.name) === slug(name) || p.name === name) || null;
}
export function openTransferNegotiation(playerId){
  const target = findTarget(playerId);
  if(!target){ transferLog('Negociação bloqueada: atleta não encontrado.'); persist(); return false; }
  const transfer = ensureTransferLedger({...state.transfer});
  if(!transfer.windowOpen){ transferLog('Negociação bloqueada: janela de transferências fechada.'); persist(); return false; }
  const existing = (transfer.activeNegotiations || []).find(n=>n.id===target.id);
  const baseOffer = existing ? Number(existing.offer || target.value || 0) + 0.6 : Number(target.value || 0) * 0.86;
  const wageOffer = existing ? Number(existing.wageOffer || target.wage || 0) + 0.03 : Number(target.wage || 0.2) * 0.92;
  const safety = evaluateDealSafety(state, target, target.value === 0 ? 'free' : 'buy', {fee:baseOffer, wage:wageOffer});
  if(!safety.ok){ transferLog(`Negociação bloqueada com ${target.name}: ${safety.errors.join(' ')}`); persist(); return false; }
  const chance = Math.max(18, Math.min(96, Number(target.interest || 60) + (existing ? 7 : 0) - safety.warnings.length * 3));
  const negotiation = {id:target.id, player:target.name, type:target.value===0?'Livre':'Compra', stage:existing?'Oferta melhorada':'Conversas abertas', chance, offer:safety.fee, wageOffer:safety.wage, demand:Number(target.value || 0), next:safety.warnings[0] || 'Aguardar contraproposta e aprovação do atleta'};
  transfer.activeNegotiations = [...(transfer.activeNegotiations || []).filter(n=>n.id!==target.id), negotiation].slice(-12);
  transfer.ledger.budgetLocks = [...(transfer.ledger.budgetLocks || []).filter(l=>l.playerId!==target.id), {playerId:target.id, player:target.name, fee:safety.fee, wage:safety.wage, kind:negotiation.type}].slice(-12);
  state = normalize({...state, transfer});
  transferLog(`${negotiation.stage} com ${target.name}. Segurança ${safety.score}/100. Oferta € ${safety.fee.toFixed(1)}M, salário € ${safety.wage.toFixed(2)}M.`);
  persist();
  return true;
}

export function acceptTransferDeal(playerId){
  const target = findTarget(playerId);
  if(!target){ transferLog('Compra bloqueada: atleta não encontrado.'); persist(); return false; }
  let transfer = ensureTransferLedger({...state.transfer});
  if(!transfer.windowOpen){ transferLog('Compra bloqueada: janela de transferências fechada.'); persist(); return false; }
  const active = Array.isArray(transfer.activeNegotiations) ? transfer.activeNegotiations : [];
  const deal = active.find(n=>n.id===target.id) || {offer:Number(target.value||0), wageOffer:Number(target.wage||0.2), chance:target.interest||55};
  const safety = evaluateDealSafety({...state, transfer}, target, target.value === 0 ? 'free' : 'buy', {fee:deal.offer, wage:deal.wageOffer});
  if(!safety.ok){ transferLog(`Compra bloqueada com ${target.name}: ${safety.errors.join(' ')}`); persist(); return false; }
  const fee = safety.fee;
  const wage = safety.wage;
  transfer.budget = Number((Number(transfer.budget||0) - fee).toFixed(1));
  transfer.wageRoom = Number((Number(transfer.wageRoom||0) - wage).toFixed(2));
  transfer.acceptedDeals = [...(transfer.acceptedDeals || []), {...deal, id:target.id, player:target.name, finalFee:fee, finalWage:wage, status:'Assinado'}];
  transfer.activeNegotiations = active.filter(n=>n.id!==target.id);
  transfer.ledger.budgetLocks = (transfer.ledger.budgetLocks || []).filter(l=>l.playerId!==target.id);
  transfer = registerTransaction(transfer, {date:state.career?.currentDate, type:target.value===0?'livre':'compra', playerId:target.id, player:target.name, from:target.club, to:state.clubId || 'santos', fee, wage, status:'Assinado'});
  state = normalize({...state, transfer, notifications:Number(state.notifications||0)+1, stability:{...(state.stability||{}), transferIntegrity:validateTransferIntegrity({...state, transfer}).status, transferEngineVersion:TRANSFER_ENGINE_VERSION}});
  transferLog(`Contrato fechado com ${target.name}: taxa € ${fee.toFixed(1)}M e salário € ${wage.toFixed(2)}M. Registro anti-duplicação ativado.`);
  persist();
  return true;
}

export function rejectTransferDeal(playerId){
  const target = findTarget(playerId);
  if(!target){ transferLog('Recusa bloqueada: atleta não encontrado.'); persist(); return false; }
  const transfer = ensureTransferLedger({...state.transfer});
  const active = Array.isArray(transfer.activeNegotiations) ? transfer.activeNegotiations : [];
  transfer.rejectedDeals = [...(transfer.rejectedDeals || []), {id:target.id, player:target.name, reason:'Encerrado pelo manager'}].slice(-12);
  transfer.activeNegotiations = active.filter(n=>n.id!==target.id);
  transfer.ledger.budgetLocks = (transfer.ledger.budgetLocks || []).filter(l=>l.playerId!==target.id);
  state = normalize({...state, transfer});
  transferLog(`Negociação encerrada com ${target.name}.`);
  persist();
  return true;
}

export function sellOutgoingPlayer(name){
  const player = findOutgoing(name);
  if(!player){ transferLog('Venda bloqueada: jogador não encontrado na lista de saídas.'); persist(); return false; }
  let transfer = ensureTransferLedger({...state.transfer});
  if(transfer.outgoingDeals.some(d=>d.name===player.name)){ transferLog(`${player.name} já possui venda/empréstimo registrado.`); persist(); return false; }
  const revenue = Number((player.value * 0.92).toFixed(1));
  transfer.budget = Number((Number(transfer.budget||0) + revenue).toFixed(1));
  transfer.wageRoom = Number((Number(transfer.wageRoom||0) + Number(player.wage || 0)).toFixed(2));
  transfer.outgoingDeals = [...(transfer.outgoingDeals || []), {...player, revenue, status:'Negociação concluída'}];
  transfer = registerTransaction(transfer, {date:state.career?.currentDate, type:'venda', playerId:slug(player.name), player:player.name, from:state.clubId || 'santos', to:player.market, fee:revenue, wage:player.wage || 0, status:'Vendido'});
  state = normalize({...state, transfer, money:Number((Number(state.money||0)+revenue).toFixed(1))});
  transferLog(`Saída concluída: ${player.name}. Receita € ${revenue.toFixed(1)}M e folha liberada.`);
  persist();
  return true;
}

export function renewPlayerContract(playerId='giuliano'){
  let transfer = ensureTransferLedger({...state.transfer});
  const id = String(playerId || 'giuliano');
  const target = renewalById(id);
  if(transfer.renewals.some(r=>r.id===id)){ transferLog('Renovação já registrada para este atleta.'); persist(); return false; }
  const cost = Number((target?.demand ? Math.max(0.06, target.demand - (target.wage || 0.2)) : 0.12).toFixed(2));
  if(Number(transfer.wageRoom||0) < cost){ transferLog('Renovação bloqueada: folha salarial livre insuficiente.'); persist(); return false; }
  transfer.wageRoom = Number((Number(transfer.wageRoom||0) - cost).toFixed(2));
  transfer.renewals = [...(transfer.renewals || []), {id, player:target?.player || id, years:2, wageIncrease:cost, status:'Renovado'}];
  transfer = registerTransaction(transfer, {date:state.career?.currentDate, type:'renovação', playerId:id, player:target?.player || id, from:state.clubId || 'santos', to:state.clubId || 'santos', fee:0, wage:cost, status:'Renovado'});
  state = normalize({...state, transfer});
  transferLog(`Renovação registrada para ${target?.player || id}: +2 anos de contrato.`);
  persist();
  return true;
}

export function loanTransferPlayer(playerId){
  const target = findTarget(playerId) || loanTargets.find(p => p.id === playerId);
  if(!target){ transferLog('Empréstimo bloqueado: atleta não encontrado no radar.'); persist(); return false; }
  let transfer = ensureTransferLedger({...state.transfer});
  if(!transfer.windowOpen){ transferLog('Empréstimo bloqueado: janela de transferências fechada.'); persist(); return false; }
  const safety = evaluateDealSafety({...state, transfer}, target, 'loan', {fee:0, wage:Number(target.wage || 0.22) * 0.45});
  if(!safety.ok){ transferLog(`Empréstimo bloqueado com ${target.name}: ${safety.errors.join(' ')}`); persist(); return false; }
  transfer.wageRoom = Number((Number(transfer.wageRoom||0) - safety.wage).toFixed(2));
  transfer.loanDeals = [...(transfer.loanDeals||[]), {id:target.id, player:target.name, club:target.club, wageShare:safety.wage, months:12, status:'Empréstimo aprovado'}];
  transfer = registerTransaction(transfer, {date:state.career?.currentDate, type:'empréstimo', playerId:target.id, player:target.name, from:target.club, to:state.clubId || 'santos', fee:0, wage:safety.wage, status:'Emprestado'});
  state = normalize({...state, transfer, notifications:Number(state.notifications||0)+1});
  transferLog(`Empréstimo fechado com ${target.name}: clube pagará € ${safety.wage.toFixed(2)}M/mês.`);
  persist();
  return true;
}

export function generateIncomingOffer(){
  let transfer = ensureTransferLedger({...state.transfer});
  const base = findOutgoingTargetByCycle(transfer.marketDay || 1);
  const buyer = aiClubProfiles[Math.floor(((transfer.marketDay || 1) + 1) % aiClubProfiles.length)] || aiClubProfiles[0];
  const id = `${slug(base.name)}-${slug(buyer.name)}-${transfer.marketDay || 1}`;
  if((transfer.incomingOffers||[]).some(o=>o.id===id)){ transferLog('Nenhuma nova proposta recebida neste ciclo.'); persist(); return false; }
  const value = Number((base.value * (0.84 + (((transfer.marketDay||1)%5)*0.04))).toFixed(1));
  transfer.incomingOffers = [...(transfer.incomingOffers||[]), {id, player:base.name, pos:base.pos, buyer:buyer.name, country:buyer.country, value, wageFree:base.wage, status:'Pendente', expiresIn:7}].slice(-8);
  transfer.marketDay = Number(transfer.marketDay || 1) + 1;
  state = normalize({...state, transfer, notifications:Number(state.notifications||0)+1});
  transferLog(`Proposta recebida: ${buyer.name} ofereceu € ${value.toFixed(1)}M por ${base.name}.`);
  persist();
  return true;
}

function findOutgoingTargetByCycle(cycle=1){
  return outgoingList[Math.floor(Number(cycle || 1) % outgoingList.length)] || outgoingList[0];
}

export function respondIncomingOffer(offerId, decision='accept'){
  let transfer = ensureTransferLedger({...state.transfer});
  const offers = Array.isArray(transfer.incomingOffers) ? transfer.incomingOffers.slice() : [];
  const offer = offers.find(o=>o.id===offerId);
  if(!offer){ transferLog('Resposta bloqueada: proposta não encontrada.'); persist(); return false; }
  if(offer.status !== 'Pendente'){ transferLog('Proposta já respondida anteriormente.'); persist(); return false; }
  if(decision === 'accept'){
    offer.status = 'Aceita';
    transfer.budget = Number((Number(transfer.budget||0) + Number(offer.value||0)).toFixed(1));
    transfer.wageRoom = Number((Number(transfer.wageRoom||0) + Number(offer.wageFree||0)).toFixed(2));
    transfer.outgoingDeals = [...(transfer.outgoingDeals||[]), {name:offer.player, value:offer.value, revenue:offer.value, wage:offer.wageFree, market:offer.buyer, status:'Venda aceita'}];
    transfer = registerTransaction(transfer, {date:state.career?.currentDate, type:'venda', playerId:slug(offer.player), player:offer.player, from:state.clubId || 'santos', to:offer.buyer, fee:offer.value, wage:offer.wageFree || 0, status:'Venda aceita'});
    transferLog(`Proposta aceita: ${offer.player} vendido para ${offer.buyer} por € ${Number(offer.value).toFixed(1)}M.`);
  } else {
    offer.status = 'Recusada';
    transfer.boardApproval = Math.max(0, Number(transfer.boardApproval||82) - 2);
    transferLog(`Proposta recusada por ${offer.player}. Empresário e diretoria foram notificados.`);
  }
  transfer.incomingOffers = offers;
  state = normalize({...state, transfer, stability:{...(state.stability||{}), transferIntegrity:validateTransferIntegrity({...state, transfer}).status}});
  persist();
  return true;
}

export function simulateAIMarket(){
  const result = simulateGlobalMarketCycle(state);
  state = normalize({...state, transfer:result.transfer});
  if(result.deal) transferLog(`Mercado IA: ${result.deal.to} acertou ${result.deal.type.toLowerCase()} de ${result.deal.player} por € ${Number(result.deal.fee||0).toFixed(1)}M.`);
  else transferLog('Mercado IA sem alvo disponível.');
  persist();
  return Boolean(result.deal);
}

export function signPreContract(playerId){
  const result = createPreContract(state.transfer || {}, playerId, state);
  state = normalize({...state, transfer:result.transfer, notifications:Number(state.notifications||0)+(result.ok?1:0)});
  transferLog(result.message);
  persist();
  return result.ok;
}

export function getTransferMarketSnapshot(){
  return buildTransferSnapshot(state);
}

export function toggleTransferWindow(){
  const transfer = {...(state.transfer || defaultState().transfer)};
  transfer.windowOpen = !transfer.windowOpen;
  state = normalize({...state, transfer});
  transferLog(`Janela de transferências ${transfer.windowOpen ? 'aberta' : 'fechada'} pelo modo de teste seguro.`);
  persist();
}


export function generateSmartIncomingOffer(){
  const transfer = {...(state.transfer || defaultState().transfer)};
  const offer = createSmartIncomingOffer(state, outgoingList, aiClubProfiles);
  if((transfer.incomingOffers||[]).some(o=>o.id===offer.id)){
    transferLog('Radar inteligente não encontrou nova proposta neste ciclo.');
    persist();
    return false;
  }
  transfer.incomingOffers = [...(transfer.incomingOffers||[]), offer].slice(-10);
  transfer.marketDay = Number(transfer.marketDay || 1) + 1;
  transfer.smartReports = [...(transfer.smartReports||[]), {type:'incoming', title:`Proposta inteligente por ${offer.player}`, detail:`${offer.buyer} oferece € ${Number(offer.value||0).toFixed(1)}M. Risco moral: ${offer.moraleRisk}.`, date:offer.id}].slice(-12);
  state = normalize({...state, transfer, notifications:Number(state.notifications||0)+1});
  transferLog(`Proposta inteligente recebida: ${offer.buyer} por ${offer.player}.`);
  persist();
  return true;
}

export function simulateSmartAIMarket(){
  const transfer = {...(state.transfer || defaultState().transfer)};
  const deal = createIntelligentAIDeal(state, transferShortlist.concat(loanTargets||[]), aiClubProfiles);
  transfer.aiDeals = [...(transfer.aiDeals||[]), deal].slice(-14);
  transfer.marketDay = Number(transfer.marketDay || 1) + 1;
  transfer.smartReports = [...(transfer.smartReports||[]), {type:'ai', title:`IA: ${deal.to} contratou ${deal.player}`, detail:`Motivo: ${deal.reason}. Encaixe ${deal.fit}%.`, date:deal.id}].slice(-12);
  state = normalize({...state, transfer});
  transferLog(`Mercado inteligente IA: ${deal.to} fechou ${deal.player} por € ${Number(deal.fee||0).toFixed(1)}M.`);
  persist();
  return true;
}

export function triggerAgentEvent(){
  const transfer = {...(state.transfer || defaultState().transfer)};
  const ev = nextAgentEvent(state);
  transfer.agentEvents = [...(transfer.agentEvents||[]), ev].slice(-8);
  if(ev.effect === 'morale') state.fanMood = Math.max(0, Number(state.fanMood||80) - 1);
  if(ev.effect === 'board') transfer.boardApproval = Math.max(0, Number(transfer.boardApproval||82) - 2);
  transfer.smartReports = [...(transfer.smartReports||[]), {type:'agent', title:ev.title, detail:`Evento de mercado: ${ev.effect} · severidade ${ev.severity}.`, date:ev.id}].slice(-12);
  state = normalize({...state, transfer, notifications:Number(state.notifications||0)+1});
  transferLog(`Evento de empresário: ${ev.title}.`);
  persist();
  return true;
}


export function exportRosterText(){
  try {
    const payload = JSON.stringify({meta:{...(state.roster?.meta||defaultRosterMeta), exportedAt:new Date().toISOString()}, players: normalizeRoster(state.roster?.players || defaultRosterPlayers)}, null, 2);
    state = normalize({...state, roster:{...(state.roster||{}), lastExport:new Date().toISOString()}});
    persist();
    return payload;
  } catch(err){ console.warn('[VFM] exportacao de elenco falhou', err); return ''; }
}
export function importRosterText(text=''){
  try {
    const parsed = JSON.parse(String(text || '{}'));
    const players = normalizeRoster(parsed.players || parsed);
    if(players.length < 11) throw new Error('Elenco precisa de pelo menos 11 jogadores validos.');
    const ids = new Set(players.map(p=>p.id));
    if(ids.size !== players.length) throw new Error('IDs duplicados detectados apos normalizacao.');
    state = normalize({...state, roster:{meta:{...defaultRosterMeta, ...(parsed.meta||{}), importedAt:new Date().toISOString()}, players, lastImport:new Date().toISOString(), validationLog:[`Importacao OK: ${players.length} jogadores validados.`]}, stability:{...(state.stability||{}), health:'Elenco importado com seguranca'}});
    persist();
    return true;
  } catch(err){
    console.warn('[VFM] importacao de elenco invalida bloqueada', err);
    state = normalize({...state, roster:{...(state.roster||{}), validationLog:[...((state.roster||{}).validationLog||[]).slice(-5), `Importacao bloqueada: ${err.message}`]}, stability:{...(state.stability||{}), health:'Importacao de elenco bloqueada com seguranca'}});
    persist();
    return false;
  }
}
export function resetRosterToDefault(){
  state = normalize({...state, roster:{meta: defaultRosterMeta, players: defaultRosterPlayers, lastImport:null, validationLog:['Elenco restaurado para Santos 2026 base.']}, stability:{...(state.stability||{}), health:'Elenco base 2026 restaurado'}});
  persist();
  return true;
}
export function sampleRosterText(){
  return JSON.stringify({meta:{clubId:'santos', season:2026, version:'exemplo-edicao'}, players: defaultRosterPlayers.slice(0,11)}, null, 2);
}


export function autoSelectBestLineup(){
  state = normalize({...state, ui:{...(state.ui||{}), squadView:'best'}});
  logIntegration('Onze ideal recalculado com base em posição, overall, moral, forma e condição física.');
  persist();
  return true;
}
export function setCaptain(playerId=''){
  const valid = (state.roster?.players || []).some(p=>p.id===playerId);
  if(!valid) return false;
  state = normalize({...state, ui:{...(state.ui||{}), captainId:playerId}});
  logIntegration(`Capitão atualizado: ${playerId}.`);
  persist();
  return true;
}
export function setSetPieceTaker(kind='penalty', playerId=''){
  const valid = (state.roster?.players || []).some(p=>p.id===playerId);
  if(!valid) return false;
  const keyMap = {penalty:'penaltyTakerId', freekick:'freeKickTakerId', freeKick:'freeKickTakerId', corner:'cornerTakerId'};
  const keyName = keyMap[kind] || 'penaltyTakerId';
  state = normalize({...state, ui:{...(state.ui||{}), [keyName]:playerId}});
  logIntegration(`Batedor atualizado: ${kind} -> ${playerId}.`);
  persist();
  return true;
}
export function applyRotationPlan(){
  const players = (state.roster?.players || []).map(p=>{
    const tired = Number(p.fitness||85) < 72;
    return {...p, fitness:Math.max(0, Math.min(100, Number(p.fitness||85)+(tired?8:2))), morale:Math.max(0, Math.min(100, Number(p.morale||70)+(tired?1:0))), form:Math.max(0, Math.min(100, Number(p.form||70)+(tired?0:1)))};
  });
  state = normalize({...state, roster:{...(state.roster||{}), players, validationLog:[...((state.roster||{}).validationLog||[]).slice(-5), 'Plano de rotação seguro aplicado: recuperação física sem quebrar elenco.']}});
  logIntegration('Plano de rotação aplicado ao elenco: condição física e moral normalizadas com segurança.');
  persist();
  return true;
}


export function generateCareerOffers(){
  const marketPatch = createJobMarketPatch(state);
  state = normalize({...state, career:{...(state.career||{}), ...marketPatch, offerHistory:[...((state.career||{}).offerHistory||[]), `Radar de treinadores v5.9.6 atualizado: ${marketPatch.jobOffers.length} oportunidades reais/sondagens.`].slice(-30)}, notifications:Number(state.notifications||0)+1});
  logIntegration(`Mercado de treinadores v5.9.6 atualizado com ${marketPatch.jobOffers.length} oportunidades.`);
  persist();
  return marketPatch.jobOffers;
}
export function respondCareerOffer(offerId='', decision='reject'){
  const offers = state.career?.jobOffers || [];
  const offer = offers.find(o=>o.id===offerId);
  if(!offer) return false;
  const accepted = decision === 'accept';
  const historyMsg = `${accepted?'Aceitou':'Recusou'} ${offer.type==='national'?'seleção':'clube'}: ${offer.name}.`;
  const jobMarketPatch = registerJobDecisionPatch(state, offer, accepted ? 'accept' : 'reject');
  let patch = { career:{...(state.career||{}), offerHistory:[...((state.career||{}).offerHistory||[]), historyMsg].slice(-40), jobOffers:offers.filter(o=>o.id!==offerId), jobMarket:jobMarketPatch} };
  if(accepted && offer.type === 'club'){
    const fixture = buildClubFixture(offer.targetId, 0);
    const newTeam = getTeam(offer.targetId);
    const rosterPack = clubRosterPackage(offer.targetId);
    const starters = primaryPlayerIds(rosterPack.players);
    const transferBudget = Math.max(0, Number(newTeam?.budget || state.money || 30));
    patch = {...patch, clubId:offer.targetId, match:fixture, roster:rosterPack, transfer:ensureTransferLedger({...(state.transfer||{}), budget:Number((transferBudget*0.45).toFixed(1)), wageRoom:Math.max(0.8, Number((transferBudget/40).toFixed(2)))}), ui:{...(state.ui||{}), selectedClub:offer.targetId, standingsCompetition:newTeam?.leagueId || 'brasileirao-a', ...starters}, money:transferBudget, boardTrust:68, fanMood:72, route:'lobby'};
    patch.career = {...patch.career, completedMatches:[], lastResult:null, matchday:1, activeContract:{clubId:offer.targetId, role:offer.role, signedAt:new Date().toISOString().slice(0,10), remainingMonths:Number(offer.months||24), wageMonthly:Number(offer.wage||0.8), releaseClause:Number(offer.releaseClause || (Number(offer.wage||0.8)*6)).toFixed(1), bonusTarget:offer.objective, objective:offer.objective, status:'Ativo'}, contractHistory:[...((state.career||{}).contractHistory||[]), `Contrato assinado com ${offer.name}: € ${Number(offer.wage||0.8).toFixed(2)}M/mês, ${Number(offer.months||24)} meses.`].slice(-20), managerTimeline:[...((state.career||{}).managerTimeline||[]), {date:new Date().toISOString().slice(0,10), title:'Novo clube', text:`Contrato aceito com ${offer.name}.`}].slice(-24), integrationLog:[...((state.career||{}).integrationLog||[]), `Novo trabalho aceito: ${offer.name}. Elenco, orçamento, calendário e titulares foram sincronizados pela v5.9.6.`].slice(-40)};
  }
  if(accepted && offer.type === 'national'){
    patch.career = {...patch.career, nationalTeamJob:{id:offer.targetId, name:offer.name, country:offer.country, role:offer.role, acceptedAt:new Date().toISOString(), objective:offer.objective, engineVersion:NATIONAL_TEAM_ENGINE_VERSION}, dualCareer:{enabled:true, club:true, nationalTeam:offer.targetId}, internationalCalendar:buildNationalCalendar(Number(state.season||2026), offer.targetId), callUpSelection:safeCallUpPool(defaultCallUpSelection()), integrationLog:[...((state.career||{}).integrationLog||[]), `Carreira dupla ativada: clube + ${offer.name}. Calendário FIFA v4.5.0 sincronizado.`].slice(-40)};
    patch.route = 'nationalTeam';
  }
  state = normalize({...state, ...patch});
  persist();
  return true;
}
export function registerNationalInterest(teamId=''){
  const offers = generateOffers(state).filter(o=>o.type==='national' && o.targetId===teamId);
  const offer = offers[0];
  const current = state.career?.jobOffers || [];
  const exists = current.some(o=>o.id===offer?.id);
  const nextOffers = offer && !exists ? [offer, ...current] : current;
  state = normalize({...state, career:{...(state.career||{}), jobOffers:nextOffers, offerHistory:[...((state.career||{}).offerHistory||[]), `Interesse registrado em seleção: ${teamId}.`].slice(-40)}, notifications:Number(state.notifications||0)+1});
  persist();
  return true;
}
export function toggleCallUpPlayer(playerId=''){
  const list = safeCallUpPool(state.career?.callUpSelection || defaultCallUpSelection());
  const selectedCount = list.filter(p=>p.selected).length;
  const next = list.map(p=>{
    if(p.id !== playerId) return p;
    if(!p.selected && selectedCount >= 26) return p;
    return {...p, selected:!p.selected, role:!p.selected?'Convocado':'Pré-lista'};
  });
  state = normalize({...state, career:{...(state.career||{}), callUpSelection:next, offerHistory:[...((state.career||{}).offerHistory||[]), `Lista de convocação atualizada: ${next.filter(p=>p.selected).length} jogadores.`].slice(-40)}});
  persist();
  return true;
}
export function finalizeNationalCallUp(){
  const safeList = safeCallUpPool(state.career?.callUpSelection || []);
  const selected = safeList.filter(p=>p.selected);
  if(!state.career?.nationalTeamJob || selected.length < 11){
    state = normalize({...state, career:{...(state.career||{}), offerHistory:[...((state.career||{}).offerHistory||[]), 'Convocação bloqueada: é preciso ter seleção ativa e ao menos 11 atletas.'].slice(-40)}});
    persist();
    return false;
  }
  state = normalize({...state, career:{...(state.career||{}), callUpSelection:safeList, offerHistory:[...((state.career||{}).offerHistory||[]), `Convocação final enviada para ${state.career.nationalTeamJob.name}: ${selected.length} atletas.`].slice(-40)}, notifications:Number(state.notifications||0)+1});
  persist();
  return true;
}


export function simulateNextInternationalMatch(){
  const sim = simulateNationalFixture(state);
  if(!sim.ok){
    state = normalize({...state, career:{...(state.career||{}), offerHistory:[...((state.career||{}).offerHistory||[]), `Jogo internacional bloqueado: ${sim.reason}`].slice(-40)}});
    persist();
    return false;
  }
  const repDelta = sim.result.points === 3 ? 2 : sim.result.points === 1 ? 1 : -1;
  const nextRep = Math.max(1, Math.min(100, Number(state.manager?.reputation||50)+repDelta));
  const msg = `${sim.event.title}: ${sim.result.label}. ${sim.result.points} ponto(s) no ciclo internacional.`;
  state = normalize({...state,
    manager:{...(state.manager||{}), reputation:nextRep},
    career:{...(state.career||{}), internationalCalendar:sim.calendar, offerHistory:[...((state.career||{}).offerHistory||[]), msg].slice(-40), managerTimeline:[...((state.career||{}).managerTimeline||[]), {date:sim.event.date, title:'Jogo da seleção', text:msg}].slice(-24)},
    notifications:Number(state.notifications||0)+1
  });
  logIntegration(`Seleção nacional: ${msg}`);
  persist();
  return true;
}

export function simulateBoardReview(){
  const snap = buildManagerCareerSnapshot(state);
  const log = `Revisão da diretoria: ${snap.security.label} (${snap.security.score}/100). ${snap.security.decision}`;
  state = normalize({...state, career:{...(state.career||{}), sackRiskLog:[...((state.career||{}).sackRiskLog||[]), log].slice(-20), managerTimeline:[...((state.career||{}).managerTimeline||[]), {date:state.career?.currentDate || '2026-05-19', title:'Revisão da diretoria', text:log}].slice(-24)}, jobSecurity:snap.security.label, notifications:Number(state.notifications||0)+1});
  logIntegration(log);
  persist();
  return snap;
}
export function renewManagerContract(){
  const snap = buildManagerCareerSnapshot(state);
  const allowed = snap.security.score >= 55;
  const current = snap.contract;
  const nextContract = allowed ? {...current, remainingMonths:Math.max(18, Number(current.remainingMonths||18)+12), wageMonthly:Number((Number(current.wageMonthly||0.8)*1.12).toFixed(2)), releaseClause:Number((Number(current.releaseClause||5.8)*1.15).toFixed(1)), status:'Renovado'} : current;
  const msg = allowed ? `Contrato renovado: +12 meses, salário € ${nextContract.wageMonthly}M/mês e multa € ${nextContract.releaseClause}M.` : `Renovação bloqueada: segurança no cargo ${snap.security.label}.`;
  state = normalize({...state, career:{...(state.career||{}), activeContract:nextContract, contractHistory:[...((state.career||{}).contractHistory||[]), msg].slice(-20), managerTimeline:[...((state.career||{}).managerTimeline||[]), {date:state.career?.currentDate || '2026-05-19', title:'Contrato do treinador', text:msg}].slice(-24)}});
  logIntegration(msg);
  persist();
  return allowed;
}
export function simulateManagerDismissalRisk(){
  const snap = buildManagerCareerSnapshot(state);
  const highRisk = snap.security.score < 42;
  const msg = highRisk ? 'Ultimato ativado: diretoria exige reação imediata nas próximas partidas.' : `Cargo preservado: risco atual ${snap.security.risk}%.`;
  state = normalize({...state, career:{...(state.career||{}), sackRiskLog:[...((state.career||{}).sackRiskLog||[]), msg].slice(-20), managerTimeline:[...((state.career||{}).managerTimeline||[]), {date:state.career?.currentDate || '2026-05-19', title:'Risco de demissão', text:msg}].slice(-24)}, jobSecurity: highRisk ? 'Ultimato' : snap.security.label});
  logIntegration(msg);
  persist();
  return highRisk;
}

export function applyTrainingMicrocycle(){
  const nextTraining = applyTrainingWeek(state);
  const impact = nextTraining.matchImpact || {};
  state = normalize({
    ...state,
    training: nextTraining,
    fanMood: Math.max(0, Math.min(100, Number(state.fanMood||75) + Math.round((nextTraining.moraleEffect||0)/2))),
    calendar: normalizeLiveCalendarState({
      ...(state.calendar||{}),
      teamFatigue:Math.max(0, Number(state.calendar?.teamFatigue||24)+Math.round(Number(nextTraining.weeklyLoad||46)/9)),
      recoveryScore:nextTraining.recoveryScore,
      injuryRisk:nextTraining.injuryRisk,
      weekLoad:nextTraining.weeklyLoad,
      trainingLog:[...((state.calendar?.trainingLog)||[]), `Microciclo v7.7 aplicado · prontidão ${nextTraining.matchReadiness}% · impacto jogo ATQ ${impact.attack>=0?'+':''}${impact.attack}/DEF ${impact.defense>=0?'+':''}${impact.defense}.`].slice(-30),
      calendarLog:[...((state.calendar?.calendarLog)||[]), `Treino Semanal Realista: semana ${Math.max(1, Number(nextTraining.week||2)-1)} · carga ${nextTraining.weeklyLoad}% · risco ${nextTraining.injuryRisk}%.`].slice(-30)
    }, state),
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), `Treino v7.7.0 aplicado: microciclo semanal realista integrado ao calendário e ao motor de jogo.`].slice(-12)},
    stability:{...(state.stability||{}), health:'Treino semanal realista aplicado', trainingEngineVersion:TRAINING_ENGINE_VERSION}
  });
  persist();
  return state.training;
}

export function applyWeeklyTrainingSession(sessionId='tactical'){
  const nextTraining = applyTrainingSession(state, sessionId);
  state = normalize({
    ...state,
    training: nextTraining,
    fanMood: Math.max(0, Math.min(100, Number(state.fanMood||75) + Math.round((nextTraining.moraleEffect||0)/5))),
    calendar: normalizeLiveCalendarState({
      ...(state.calendar||{}),
      teamFatigue:Math.max(0, Number(state.calendar?.teamFatigue||24)+Math.round(Number(nextTraining.weeklyLoad||46)/18)),
      recoveryScore:nextTraining.recoveryScore,
      injuryRisk:nextTraining.injuryRisk,
      weekLoad:nextTraining.weeklyLoad,
      trainingLog:[...((state.calendar?.trainingLog)||[]), `Sessão de treino aplicada: ${sessionId} · prontidão ${nextTraining.matchReadiness || buildTrainingSnapshot({...state, training:nextTraining}).readiness}%.`].slice(-30),
      calendarLog:[...((state.calendar?.calendarLog)||[]), `Sessão individual de treino: ${sessionId}.`].slice(-30)
    }, state),
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), `Sessão semanal v7.7.0 aplicada: ${sessionId}.`].slice(-12)},
    stability:{...(state.stability||{}), health:'Sessão do microciclo aplicada', trainingEngineVersion:TRAINING_ENGINE_VERSION}
  });
  persist();
  return state.training;
}

export function setTrainingWeeklyPreset(presetId='balanced'){
  const nextTraining = setWeeklyTrainingPreset(state.training || {}, presetId);
  state = normalize({
    ...state,
    training:nextTraining,
    ui:{...(state.ui||{}), weeklyTrainingPreset:presetId},
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), `Preset de treino semanal definido: ${presetId}.`].slice(-12)},
    stability:{...(state.stability||{}), health:'Preset de treino semanal atualizado', trainingEngineVersion:TRAINING_ENGINE_VERSION}
  });
  persist();
  return state.training;
}



export function applyCalendarAction(action='advance-day'){
  const patch = buildCalendarActionPatch(state, action);
  state = normalize({
    ...state,
    calendar: patch.calendar,
    training: patch.training,
    fanMood: patch.fanMood ?? state.fanMood,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Calendário vivo atualizado', liveCalendarVersion:LIVE_CALENDAR_VERSION}
  });
  persist();
  return state.calendar;
}

export function generateScoutReport(){
  const regionId = state.ui?.scoutingRegion || state.scouting?.lastRegion || 'br-sudeste';
  const observerId = state.ui?.scoutingObserver || state.scouting?.assignments?.[0]?.observerId || 'carlos-araujo';
  const patch = createScoutReportPatch(state, regionId, observerId);
  state = normalize({
    ...state,
    scouting:patch.scouting,
    notifications:patch.notifications ?? state.notifications,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Relatório de scout gerado', scoutingVersion:SCOUTING_VERSION}
  });
  persist();
  return state.scouting;
}

export function assignScoutRegion(regionId='br-sudeste'){
  const observerId = state.ui?.scoutingObserver || state.scouting?.assignments?.[0]?.observerId || 'carlos-araujo';
  const patch = setScoutAssignmentPatch(state, observerId, regionId || state.ui?.scoutingRegion || 'br-sudeste');
  state = normalize({
    ...state,
    scouting:patch.scouting,
    ui:{...(state.ui||{}), scoutingRegion:regionId || state.ui?.scoutingRegion || 'br-sudeste'},
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Observador designado para região', scoutingVersion:SCOUTING_VERSION}
  });
  persist();
  return state.scouting;
}

export function setScoutFocus(focus='rotation'){
  const patch = setScoutFocusPatch(state, focus);
  state = normalize({
    ...state,
    scouting:patch.scouting,
    ui:patch.ui || state.ui,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Prioridade de scout atualizada', scoutingVersion:SCOUTING_VERSION}
  });
  persist();
  return state.scouting;
}

export function addScoutWishlist(reportId=''){
  const patch = wishlistScoutPlayerPatch(state, reportId, 'add');
  state = normalize({
    ...state,
    scouting:patch.scouting,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Lista de desejos de scout atualizada', scoutingVersion:SCOUTING_VERSION}
  });
  persist();
  return state.scouting;
}

export function removeScoutWishlist(reportId=''){
  const patch = wishlistScoutPlayerPatch(state, reportId, 'remove');
  state = normalize({
    ...state,
    scouting:patch.scouting,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Atleta removido da lista de desejos', scoutingVersion:SCOUTING_VERSION}
  });
  persist();
  return state.scouting;
}

export function hireStaffMember(candidateId=''){
  const patch = hireStaffPatch(state, candidateId);
  state = normalize({
    ...state,
    staff:patch.staff,
    transfer:patch.transfer || state.transfer,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Comissão técnica atualizada', staffVersion:STAFF_VERSION}
  });
  persist();
  return state.staff;
}

export function setStaffFocus(focusId='balanced'){
  const patch = setStaffFocusPatch(state, focusId);
  state = normalize({
    ...state,
    staff:patch.staff,
    ui:patch.ui || state.ui,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Foco da comissão técnica atualizado', staffVersion:STAFF_VERSION}
  });
  persist();
  return state.staff;
}

export function runStaffMeeting(){
  const patch = runStaffMeetingPatch(state);
  state = normalize({
    ...state,
    staff:patch.staff,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Reunião de comissão técnica realizada', staffVersion:STAFF_VERSION}
  });
  persist();
  return state.staff;
}

export function signFinanceSponsor(sponsorId=''){
  const patch = signSponsorPatch(state, sponsorId);
  state = normalize({
    ...state,
    finance:patch.finance,
    money:patch.money ?? state.money,
    notifications:patch.notifications ?? state.notifications,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Patrocínio atualizado', financeVersion:FINANCE_VERSION}
  });
  persist();
  return state.finance;
}

export function setFinanceTicketPolicy(policyId='balanced'){
  const patch = setTicketPolicyPatch(state, policyId);
  state = normalize({
    ...state,
    finance:patch.finance,
    fanMood:patch.fanMood ?? state.fanMood,
    ui:patch.ui || state.ui,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Política de bilheteria atualizada', financeVersion:FINANCE_VERSION}
  });
  persist();
  return state.finance;
}

export function simulateFinanceMatchday(){
  const patch = simulateMatchdayRevenuePatch(state);
  state = normalize({
    ...state,
    finance:patch.finance,
    money:patch.money ?? state.money,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Bilheteria processada', financeVersion:FINANCE_VERSION}
  });
  persist();
  return state.finance;
}

export function applyFinancePrize(prizeId='league-win'){
  const patch = applyPrizeMoneyPatch(state, prizeId);
  state = normalize({
    ...state,
    finance:patch.finance,
    money:patch.money ?? state.money,
    notifications:patch.notifications ?? state.notifications,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Premiação financeira aplicada', financeVersion:FINANCE_VERSION}
  });
  persist();
  return state.finance;
}

export function runFinanceBoardMeeting(){
  const patch = runFinanceBoardMeetingPatch(state);
  state = normalize({
    ...state,
    finance:patch.finance,
    transfer:patch.transfer || state.transfer,
    boardTrust:patch.boardTrust ?? state.boardTrust,
    career:{...(state.career||{}), integrationLog:[...((state.career||{}).integrationLog||[]), ...((patch.integrationLog)||[])].slice(-12)},
    stability:{...(state.stability||{}), health:'Reunião financeira realizada', financeVersion:FINANCE_VERSION}
  });
  persist();
  return state.finance;
}

export function getCareerLoopSnapshot(){
  return careerLoopSnapshot(state);
}
export function markTutorialSeen(){
  state = normalize({...state, career:{...(state.career||{}), tutorial:{...(state.career?.tutorial||{}), seen:true}}});
  persist();
}
export function completeGuidedTutorialStep(stepId){
  const patch = completeTutorialStepPatch(state, stepId);
  state = normalize({...state, ...patch});
  state = normalize({...state, ...awardManagerXpPatch(state, 45, `tutorial: ${stepId}`, {step:stepId})});
  persist();
  return state.career?.tutorial;
}

export function addManagerXp(amount=30, reason='ação do treinador'){
  state = normalize({...state, ...awardManagerXpPatch(state, amount, reason)});
  persist();
  return state.career?.managerProgression;
}
export function setManagerSpecialty(specialtyId='tactician'){
  const patch = setManagerSpecialtyPatch(state, specialtyId);
  if(Object.keys(patch).length){ state = normalize({...state, ...patch}); persist(); }
  return state.career?.managerProgression;
}

export function completeGuidedTutorialForRoute(route){
  const patch = guidedTutorialAutoPatchForRoute(state, route);
  if(patch){ state = normalize({...state, ...patch}); persist(); }
  return state.career?.tutorial;
}

export function persist(){
  try {
    const careerStarted = state?.save?.careerStarted !== false;
    if(state?.stability?.autosave !== false && careerStarted){
      const checkpoints = Array.isArray(state.save?.autosaveCheckpoints) ? state.save.autosaveCheckpoints.slice(-9) : [];
      state = normalize({...state, save:{...(state.save||{}), autosaveCheckpoints:[...checkpoints, new Date().toISOString()]}});
      writeAutoBackup(state);
    }
    if(careerStarted){
      const migrated = migrateLegacyState(state);
      localStorage.setItem(key, JSON.stringify(migrated));
      try { writeSlot(state.save?.activeSlot || 'principal', migrated); } catch(slotErr){ console.warn('[VFM] slot save indisponivel', slotErr); }
    }
  } catch(err){ console.warn('[VFM] save local indisponivel', err); }
}
export function hasSave(){ try { return listSlots().some(s=>s.careerStarted !== false) || legacyKeys.some(k=>!!localStorage.getItem(k)); } catch(err){ return false; } }
export function load(){
  try {
    let raw = localStorage.getItem(key);
    if(!raw){
      const playable = listPlayableSlots().filter(s=>s.occupied);
      if(playable[0]){
        const slotState = readSlot(playable[0].slot);
        if(slotState) raw = JSON.stringify({state:slotState});
      }
    }
    if(!raw){ const legacy = legacyKeys.find(k=>localStorage.getItem(k)); raw = legacy ? localStorage.getItem(legacy) : null; }
    let parsed = raw ? JSON.parse(raw) : null;
    if(parsed?.state) parsed = parsed.state;
    state = parsed ? normalize(migrateLegacyState(parsed)) : defaultState();
    // Fase 57: o jogo nunca deve abrir direto dentro da carreira salva.
    // O save é carregado em memória para saber qual é o último slot, mas a rota inicial volta para a capa limpa.
    state = normalize({...state, route:'cover'});
    if(parsed){
      try {
        const migrated = migrateLegacyState({...state, route:'cover'});
        localStorage.setItem(key, JSON.stringify(migrated));
        writeSlot(migrated.save?.activeSlot || 'principal', migrated);
      } catch(migrationErr){ console.warn('[VFM] migracao de slot sem auto-start falhou', migrationErr); }
    }
  } catch(err){
    console.warn('[VFM] save corrompido, tentando backup automatico', err);
    try { preserveCorruptSave(localStorage.getItem(key) || ''); } catch(e){}
    const backup = readAutoBackup();
    state = backup ? normalize(migrateLegacyState(backup)) : defaultState();
    state.stability = {...(state.stability||{}), safeModeEvents:Number(state.stability?.safeModeEvents||0)+1, health:backup?'Save recuperado do backup automatico':'Save recriado com seguranca', saveIntegrity:backup?'recovered':'reset'};
    if(backup) persist();
  }
  return state;
}
export function reset(){ state = defaultState(); persist(); }

export function createManualBackup(slot=1){
  try {
    const safeSlot = Math.max(1, Math.min(5, Number(slot || 1)));
    writeSlot(`backup-${safeSlot}`, state);
    state = normalize({...state, stability:{...(state.stability||{}), lastBackup:new Date().toISOString(), backupCount:Number(state.stability?.backupCount||0)+1, health:`Backup ${safeSlot} atualizado`}});
    persist();
    return true;
  } catch(err){ console.warn('[VFM] backup manual falhou', err); return false; }
}
export function restoreManualBackup(slot=1){
  try {
    const safeSlot = Math.max(1, Math.min(5, Number(slot || 1)));
    const restored = readSlot(`backup-${safeSlot}`);
    if(!restored) return false;
    state = normalize(migrateLegacyState(restored));
    state.stability = {...(state.stability||{}), health:`Backup ${safeSlot} restaurado`, lastImport:new Date().toISOString()};
    persist();
    return true;
  } catch(err){ console.warn('[VFM] restauracao falhou', err); state = normalize({...state, stability:{...(state.stability||{}), health:'Restauracao bloqueada com seguranca'}}); persist(); return false; }
}
export function exportSaveText(){
  try {
    const payload = exportEnvelopeText(state);
    state = normalize({...state, save:{...(state.save||{}), exportCount:Number(state.save?.exportCount||0)+1}, stability:{...(state.stability||{}), lastExport:new Date().toISOString(), health:'Exportacao profissional pronta'}});
    persist();
    return payload;
  } catch(err){ console.warn('[VFM] exportacao falhou', err); return ''; }
}
export function importSaveText(text=''){
  try {
    const validation = validateSavePayload(text);
    if(!validation.ok) throw new Error(validation.errors.join(' | '));
    const parsed = JSON.parse(String(text || '{}'));
    const payload = parsed?.state ? parsed.state : parsed;
    state = normalize(migrateLegacyState(payload));
    state.save = {...(state.save||{}), importCount:Number(state.save?.importCount||0)+1};
    state.stability = {...(state.stability||{}), lastImport:new Date().toISOString(), health:'Save importado, migrado e normalizado', saveIntegrity:'ok'};
    persist();
    return true;
  } catch(err){ console.warn('[VFM] importacao invalida bloqueada', err); state = normalize({...state, stability:{...(state.stability||{}), health:'Importacao invalida bloqueada', saveIntegrity:'blocked-import'}}); persist(); return false; }
}

export function createNewCareerSlot(slot='career-2'){
  try {
    const safeSlot = String(slot || 'career-2').replace(/[^a-z0-9_-]/gi,'_').slice(0,32) || 'career-2';
    const base = defaultState();
    state = normalize({
      ...base,
      manager:{...base.manager, name:'Manager Vale', country:'br', avatar:'assets/avatars/manager-01.png', mode:'career', reputation:50},
      clubId:'santos',
      ui:{...base.ui, selectedAvatar:'assets/avatars/manager-01.png', selectedCountry:'br', selectedMode:'career', selectedClub:'santos'},
      career:{...base.career, completedMatches:[], lastResult:null, matchday:1, currentDate:'2026-04-13', integrationLog:[`Novo slot ${safeSlot} criado na Fase 57: dados antigos isolados até confirmação da carreira.`]},
      save:{...base.save, activeSlot:safeSlot, slotLabel:slotLabel(safeSlot), careerStarted:false, createdAt:new Date().toISOString()},
      route:'newGame'
    });
    return true;
  } catch(err){ console.warn('[VFM] novo slot bloqueado', err); return false; }
}
export function saveCurrentCareerSlot(slot=null){
  try {
    if(state?.save?.careerStarted === false) return false;
    const safeSlot = String(slot || state?.save?.activeSlot || 'principal').replace(/[^a-z0-9_-]/gi,'_').slice(0,32) || 'principal';
    const currentSlot = String(state?.save?.activeSlot || safeSlot);
    const nextLabel = safeSlot === currentSlot ? (state.save?.slotLabel || slotLabel(safeSlot)) : slotLabel(safeSlot);
    state = normalize({...state, save:{...(state.save||{}), activeSlot:safeSlot, slotLabel:nextLabel, careerStarted:true}, stability:{...(state.stability||{}), health:`Slot ${safeSlot} salvo`}});
    writeSlot(safeSlot, state);
    persist();
    return true;
  } catch(err){ console.warn('[VFM] salvar slot falhou', err); return false; }
}

export function loadSaveSlot(slot='principal'){
  try {
    const restored = readSlot(slot);
    if(!restored) return false;
    state = normalize(migrateLegacyState(restored));
    state.save = {...(state.save||{}), activeSlot:String(slot||'principal'), slotLabel:state.save?.slotLabel || slotLabel(slot), careerStarted:true};
    state.stability = {...(state.stability||{}), lastImport:new Date().toISOString(), health:`Slot ${slot} carregado`};
    state.route = 'lobby';
    persist();
    return true;
  } catch(err){ console.warn('[VFM] slot invalido bloqueado', err); return false; }
}
export function deleteSaveSlot(slot='principal'){
  try {
    const safeSlot = String(slot || 'principal').replace(/[^a-z0-9_-]/gi,'_').slice(0,32) || 'principal';
    deleteSlot(safeSlot);
    if(state?.save?.activeSlot === safeSlot){
      state = normalize({...defaultState(), route:'mainMenu', save:{...defaultState().save, careerStarted:false}});
      try { localStorage.removeItem(key); } catch(e){}
    } else {
      state = normalize({...state, stability:{...(state.stability||{}), health:`Slot ${safeSlot} apagado`}});
    }
    return true;
  } catch(err){ console.warn('[VFM] apagar slot falhou', err); return false; }
}
export function renameSaveSlot(slot='principal', label='Carreira'){
  try {
    const clean = renameSlot(slot, label);
    if(state?.save?.activeSlot === slot){ state = normalize({...state, save:{...(state.save||{}), slotLabel:clean}}); persist(); }
    return clean;
  } catch(err){ console.warn('[VFM] renomear slot falhou', err); return false; }
}
export function listSaveSlots(){
  try { return listPlayableSlots(); } catch(err){ return []; }
}
export function getSaveIntegritySnapshot(){ return saveIntegritySnapshot(state); }
export function toggleAutosave(){
  state = normalize({...state, stability:{...(state.stability||{}), autosave:!state.stability?.autosave, health:'Preferencia de autosave atualizada'}});
  persist();
  return state.stability.autosave;
}
