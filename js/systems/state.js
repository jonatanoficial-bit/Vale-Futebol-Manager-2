import { matchTimeline } from '../data/matchData.js';
import { deepScoreFromState, getPostMatchReport } from './matchEngine.js';
import { teams } from '../data/gameData.js';
import { nextFixtureForClub as seasonNextFixture, simulateOtherRoundMatches } from './seasonEngine.js';
import { transferShortlist, negotiations as baseNegotiations, outgoingList, loanTargets, aiClubProfiles, agentEvents } from '../data/transferData.js';
import { scoreFromTimeline, buildBalanceSummary } from './balance.js';
import { squadPlayers as defaultRosterPlayers, rosterMeta as defaultRosterMeta, normalizeRoster } from '../data/squadData.js';
import { generateOffers, validateCareerState, buildInternationalCalendar, defaultCallUpSelection } from './careerEngine.js';

const key = 'vfm_gold_save_v330';
const legacyKeys = ['vfm_gold_save_v320', 'vfm_gold_save_v310', 'vfm_gold_save_v300', 'vfm_gold_save_v290', 'vfm_gold_save_v280', 'vfm_gold_save_v270', 'vfm_gold_save_v262', 'vfm_gold_save_v261', 'vfm_gold_save_v260', 'vfm_gold_save_v251', 'vfm_gold_save_v240', 'vfm_gold_save_v230', 'vfm_gold_save_v220', 'vfm_gold_save_v210', 'vfm_gold_save_v200', 'vfm_gold_save_v190', 'vfm_gold_save_v180', 'vfm_gold_save_v170', 'vfm_gold_save_v160', 'vfm_gold_save_v150', 'vfm_gold_save_v140', 'vfm_gold_save_v130', 'vfm_gold_save_v120', 'vfm_gold_save_v110', 'vfm_gold_save_v100', 'vfm_gold_save_v090', 'vfm_gold_save_v080', 'vfm_gold_save_v050', 'vfm_gold_save_v040', 'vfm_gold_save_v030', 'vfm_gold_save_v020', 'vfm_gold_save_v010'];
export const defaultState = () => ({
  route:'cover',
  manager:{ name:'Joao Victor', country:'br', avatar:'assets/avatars/manager-01.png', reputation:82, mode:'career' },
  clubId:'santos', season:2026, month:'Maio', money:92.5, coins:250, notifications:6, boardTrust:76, fanMood:82, jobSecurity:'Seguro',
  match:{ id:'2026-05-24-santos-palmeiras', date:'2026-05-24', competitionId:'brasileirao-a', competition:'Brasileirão Série A 2026', stage:'Rodada atual', minute:1, home:'santos', away:'palmeiras', homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[], postMatchReport:null },
  career:{ currentDate:'2026-05-19', matchday:1, completedMatches:[], lastResult:null, promotionRelegation:{serieARelegation:4,serieBPromotion:4,libertadoresTop:4}, integrationLog:['Carreira migrada para v3.2.0 com propostas de clubes, carreira internacional, convocacao e calendario FIFA.'], jobOffers:[], offerHistory:[], nationalTeamJob:null, dualCareer:{enabled:false, club:true, nationalTeam:null}, callUpSelection:defaultCallUpSelection(), internationalCalendar:buildInternationalCalendar(2026), worldCompetitionCycle:{libertadores:true,sulamericana:true,clubWorldCupCycle:4,worldCupCycle:4,lastUpdated:'v3.3.0'}, financeReport:{profile:'balanced', lastMonthlyCycle:null, crisisLog:[], boardWarnings:[], sponsorReview:'v3.3.0'} },
  gameplay:{ difficulty:'realistic', aiVersion:'v3.3.0', realism:88, variance:18, balanceLog:[] },
  stability:{ autosave:true, lastBackup:null, backupCount:0, lastExport:null, lastImport:null, safeModeEvents:0, health:'Excelente', auditVersion:'v3.3.0', commercialAudit:'ok', fullscreenMobile:true, overflowGuard:true, rosterSafeMode:true, matchEngineSafeMode:true },
  roster:{ meta: defaultRosterMeta, players: defaultRosterPlayers, lastImport:null, lastExport:null, validationLog:['Elenco base Santos 2026 carregado com proteção anti-quebra.'] },
  finance:{profile:'balanced', lastMonthlyCycle:null, crisisLog:[], boardWarnings:[], sponsorReview:'v3.3.0'},
  transfer:{ budget:42.8, wageRoom:2.4, negotiationLog:[], activeNegotiations:[], acceptedDeals:[], rejectedDeals:[], outgoingDeals:[], renewals:[], loanDeals:[], incomingOffers:[], aiDeals:[], windowOpen:true, boardApproval:82, marketDay:1 },
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
  merged.match.maxSubs = Math.max(3, Math.min(5, Number(merged.match.maxSubs || 5)));
  merged.match.decision = String(merged.match.decision || 'balanced');
  merged.match.tacticalBoost = Number(merged.match.tacticalBoost || 0);
  merged.career = validateCareerState({...base.career, ...(next?.career || {})});
  if(!Array.isArray(merged.career.completedMatches)) merged.career.completedMatches = [];
  if(!Array.isArray(merged.career.integrationLog)) merged.career.integrationLog = [];
  merged.gameplay = {...base.gameplay, ...(next?.gameplay || {})};
  if(!Array.isArray(merged.gameplay.balanceLog)) merged.gameplay.balanceLog = [];
  if(!['easy','realistic','hardcore'].includes(merged.gameplay.difficulty)) merged.gameplay.difficulty = 'realistic';
  merged.stability = {...base.stability, ...(next?.stability || {})};
  merged.stability.backupCount = Math.max(0, Number(merged.stability.backupCount || 0));
  if(typeof merged.stability.autosave !== 'boolean') merged.stability.autosave = true;
  merged.roster = {...base.roster, ...(next?.roster || {})};
  const normalizedRoster = normalizeRoster(merged.roster.players);
  if(normalizedRoster.length >= 11) merged.roster.players = normalizedRoster; else { merged.roster.players = base.roster.players; merged.roster.validationLog = [...(merged.roster.validationLog||[]), 'Roster importado recusado: menos de 11 jogadores validos.']; }
  merged.roster.meta = {...base.roster.meta, ...(merged.roster.meta || {})};
  if(!Array.isArray(merged.roster.validationLog)) merged.roster.validationLog = [];
  merged.finance = {...(base.finance||{}), ...(next?.finance || {})};
  if(!['conservative','balanced','aggressive'].includes(merged.finance.profile)) merged.finance.profile = 'balanced';
  if(!Array.isArray(merged.finance.crisisLog)) merged.finance.crisisLog = [];
  if(!Array.isArray(merged.finance.boardWarnings)) merged.finance.boardWarnings = [];
  merged.transfer = {...base.transfer, ...(next?.transfer || {})};
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
  const activeClub = merged.clubId || merged.ui.selectedClub || 'santos';
  if(merged.ui.selectedClub !== activeClub) merged.ui.selectedClub = activeClub;
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
    return {id:`fallback-${clubId}-${rival.id}`, date:'2026-05-24', competitionId:club.leagueId||'brasileirao-a', competition:matchLabelForClub(club), stage:'Rodada 1', round:1, minute:1, home:clubId, away:rival.id, homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[]};
  }
  return {...f, minute:1, homeGoals:0, awayGoals:0, speed:1, autoPlay:false, finalized:false, postMatchReady:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[]};
}
function nextFixtureForClub(clubId, afterIndex=0){ return buildClubFixture(clubId, afterIndex); }

export function startCareer(){
  const chosenClub = state.ui.selectedClub || state.clubId || 'santos';
  const firstMatch = buildClubFixture(chosenClub, 0);
  state = normalize({
    ...state,
    manager:{
      ...state.manager,
      avatar: state.ui.selectedAvatar || state.manager.avatar,
      country: state.ui.selectedCountry || state.manager.country,
      mode: state.ui.selectedMode || state.manager.mode
    },
    clubId: chosenClub,
    match: firstMatch,
    career:{...state.career, currentDate:'2026-05-19', matchday:1, completedMatches:[], lastResult:null, lastRoundResults:[], promotionRelegation:{serieARelegation:4,serieBPromotion:4,libertadoresTop:4,sulamericanaRange:[5,12]}, integrationLog:['Carreira iniciada na v3.2.0: temporada, transferencias, tática, motor de partida e propostas de carreira conectados.']},
    route:'lobby'
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
  const current = {...(state.match || defaultState().match), minute:90, finalized:true};
  const score = scoreUntilMinute(current);
  current.homeGoals = score.home;
  current.awayGoals = score.away;
  current.postMatchReport = getPostMatchReport(current, state);
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
    summary: `${score.home} x ${score.away}`
  };
  const otherResults = already ? [] : simulateOtherRoundMatches({...state, match:current}, Number(current.round || state.career?.matchday || 1));
  const completed = already ? state.career.completedMatches : [...(state.career?.completedMatches || []), result, ...otherResults];
  const next = seasonNextFixture(state.clubId || state.ui?.selectedClub || 'santos', completed);
  const moneyBonus = result.points === 3 ? 2.5 : result.points === 1 ? 0.8 : 0.2;
  const trustDelta = result.points === 3 ? 2 : result.points === 1 ? 0 : -2;
  const fanDelta = result.points === 3 ? 3 : result.points === 1 ? 0 : -3;
  const balanceLog = Array.isArray(state.gameplay?.balanceLog) ? state.gameplay.balanceLog.slice(-9) : [];
  balanceLog.push({date:result.date, match:result.id, report:buildBalanceSummary(current, state), result:result.summary});
  const career = {...state.career, completedMatches:completed, lastResult:result, currentDate: next?.date || result.date, matchday:Number(current.round || state.career?.matchday || 1)+1, lastRoundResults:[result, ...otherResults].slice(0,10)};
  state = normalize({
    ...state,
    match: next ? {...next, postMatchReady:false, autoPlay:false, postMatchReport:null} : {...current, postMatchReady:true, autoPlay:false},
    career,
    money: Number((Number(state.money || 0) + (already ? 0 : moneyBonus)).toFixed(1)),
    boardTrust: Math.max(0, Math.min(100, Number(state.boardTrust || 76) + (already ? 0 : trustDelta))),
    fanMood: Math.max(0, Math.min(100, Number(state.fanMood || 82) + (already ? 0 : fanDelta))),
    notifications: Number(state.notifications || 0) + (already ? 0 : 1),
    gameplay:{...state.gameplay, balanceLog}
  });
  logIntegration(`Resultado integrado: ${result.competition} ${result.stage} terminou ${result.summary}. Rodada simulada, calendário, tabela com logos e save foram atualizados.`);
  persist();
  return result;
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
  if(!target){ transferLog('Negociação bloqueada: atleta não encontrado no radar.'); persist(); return false; }
  const transfer = {...(state.transfer || defaultState().transfer)};
  if(transfer.acceptedDeals.some(d=>d.id===target.id)){ transferLog(`Negociação bloqueada: ${target.name} já foi contratado.`); persist(); return false; }
  let active = Array.isArray(transfer.activeNegotiations) ? [...transfer.activeNegotiations] : [];
  const existing = active.find(n=>n.id===target.id);
  const baseOffer = target.value === 0 ? 0 : Number((target.value * 0.82).toFixed(1));
  const wageOffer = Number((target.wage * 0.88).toFixed(2));
  if(existing){
    existing.offer = Number(Math.min(target.value || existing.offer + 0.1, existing.offer + Math.max(0.3, (target.value||1)*0.08)).toFixed(1));
    existing.wageOffer = Number(Math.min(target.wage, existing.wageOffer + 0.04).toFixed(2));
    existing.chance = Math.min(96, existing.chance + 7);
    existing.stage = 'Contraproposta enviada';
    existing.next = existing.chance >= 78 ? 'Pode aceitar com bônus por metas' : 'Aumentar luvas ou reduzir risco';
  } else {
    active.push({id:target.id, player:target.name, type:target.value===0?'Livre':'Compra', stage:'Proposta formal enviada', chance:Math.max(35, Math.min(92, target.interest - 8)), offer:baseOffer, demand:target.value, wageOffer, wageDemand:target.wage, next:'Aguardar resposta do empresário'});
  }
  transfer.activeNegotiations = active;
  transferLog(`Proposta enviada por ${target.name}.`);
  persist();
  return true;
}
export function acceptTransferDeal(playerId){
  const target = findTarget(playerId);
  if(!target){ transferLog('Aceite bloqueado: atleta não encontrado.'); persist(); return false; }
  const transfer = {...(state.transfer || defaultState().transfer)};
  const active = Array.isArray(transfer.activeNegotiations) ? transfer.activeNegotiations : [];
  const deal = active.find(n=>n.id===target.id) || {id:target.id, player:target.name, offer:target.value, wageOffer:target.wage, chance:target.interest, type:target.value===0?'Livre':'Compra'};
  if(transfer.acceptedDeals.some(d=>d.id===target.id)){ transferLog(`${target.name} já está marcado como contratado.`); persist(); return false; }
  const fee = Number(deal.offer || 0);
  const wage = Number(deal.wageOffer || target.wage || 0);
  if(fee > transfer.budget || wage > transfer.wageRoom){ transferLog(`Diretoria bloqueou ${target.name}: orçamento ou folha insuficiente.`); persist(); return false; }
  transfer.budget = Number((transfer.budget - fee).toFixed(1));
  transfer.wageRoom = Number((transfer.wageRoom - wage).toFixed(2));
  transfer.acceptedDeals = [...(transfer.acceptedDeals || []), {...deal, finalFee:fee, finalWage:wage, status:'Assinado'}];
  transfer.activeNegotiations = active.filter(n=>n.id!==target.id);
  state = normalize({...state, transfer, notifications:Number(state.notifications||0)+1});
  transferLog(`Contrato fechado com ${target.name}: taxa € ${fee.toFixed(1)}M e salário € ${wage.toFixed(2)}M.`);
  persist();
  return true;
}
export function rejectTransferDeal(playerId){
  const target = findTarget(playerId);
  if(!target){ transferLog('Recusa bloqueada: atleta não encontrado.'); persist(); return false; }
  const transfer = {...(state.transfer || defaultState().transfer)};
  const active = Array.isArray(transfer.activeNegotiations) ? transfer.activeNegotiations : [];
  transfer.rejectedDeals = [...(transfer.rejectedDeals || []), {id:target.id, player:target.name, reason:'Encerrado pelo manager'}].slice(-12);
  transfer.activeNegotiations = active.filter(n=>n.id!==target.id);
  state = normalize({...state, transfer});
  transferLog(`Negociação encerrada com ${target.name}.`);
  persist();
  return true;
}
export function sellOutgoingPlayer(name){
  const player = findOutgoing(name);
  if(!player){ transferLog('Venda bloqueada: jogador não encontrado na lista de saídas.'); persist(); return false; }
  const transfer = {...(state.transfer || defaultState().transfer)};
  if(transfer.outgoingDeals.some(d=>d.name===player.name)){ transferLog(`${player.name} já possui venda/empréstimo registrado.`); persist(); return false; }
  const revenue = Number((player.value * 0.92).toFixed(1));
  transfer.budget = Number((transfer.budget + revenue).toFixed(1));
  transfer.wageRoom = Number((transfer.wageRoom + Number(player.wage || 0)).toFixed(2));
  transfer.outgoingDeals = [...(transfer.outgoingDeals || []), {...player, revenue, status:'Negociação concluída'}];
  state = normalize({...state, transfer, money:Number((Number(state.money||0)+revenue).toFixed(1))});
  transferLog(`Saída concluída: ${player.name}. Receita € ${revenue.toFixed(1)}M e folha liberada.`);
  persist();
  return true;
}
export function renewPlayerContract(playerId='giuliano'){
  const transfer = {...(state.transfer || defaultState().transfer)};
  const id = String(playerId || 'giuliano');
  if(transfer.renewals.some(r=>r.id===id)){ transferLog('Renovação já registrada para este atleta.'); persist(); return false; }
  const cost = 0.12;
  if(transfer.wageRoom < cost){ transferLog('Renovação bloqueada: folha salarial livre insuficiente.'); persist(); return false; }
  transfer.wageRoom = Number((transfer.wageRoom - cost).toFixed(2));
  transfer.renewals = [...(transfer.renewals || []), {id, years:2, wageIncrease:cost, status:'Renovado'}];
  state = normalize({...state, transfer});
  transferLog(`Renovação registrada para ${id}: +2 anos de contrato.`);
  persist();
  return true;
}
export function loanTransferPlayer(playerId){
  const target = findTarget(playerId) || loanTargets.find(p => p.id === playerId);
  if(!target){ transferLog('Empréstimo bloqueado: atleta não encontrado no radar.'); persist(); return false; }
  const transfer = {...(state.transfer || defaultState().transfer)};
  if(!transfer.windowOpen){ transferLog('Empréstimo bloqueado: janela de transferências fechada.'); persist(); return false; }
  if((transfer.loanDeals||[]).some(d=>d.id===target.id)){ transferLog(`${target.name} já possui empréstimo registrado.`); persist(); return false; }
  const wageShare = Number((Number(target.wage || 0.22) * 0.45).toFixed(2));
  if(wageShare > transfer.wageRoom){ transferLog(`Empréstimo bloqueado: folha insuficiente para ${target.name}.`); persist(); return false; }
  transfer.wageRoom = Number((transfer.wageRoom - wageShare).toFixed(2));
  transfer.loanDeals = [...(transfer.loanDeals||[]), {id:target.id, player:target.name, club:target.club, wageShare, months:12, status:'Empréstimo aprovado'}];
  state = normalize({...state, transfer, notifications:Number(state.notifications||0)+1});
  transferLog(`Empréstimo fechado com ${target.name}: clube pagará € ${wageShare.toFixed(2)}M/mês.`);
  persist();
  return true;
}

export function generateIncomingOffer(){
  const transfer = {...(state.transfer || defaultState().transfer)};
  const base = outgoingList[Math.floor((transfer.marketDay || 1) % outgoingList.length)] || outgoingList[0];
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

export function respondIncomingOffer(offerId, decision='accept'){
  const transfer = {...(state.transfer || defaultState().transfer)};
  const offers = Array.isArray(transfer.incomingOffers) ? transfer.incomingOffers.slice() : [];
  const offer = offers.find(o=>o.id===offerId);
  if(!offer){ transferLog('Resposta bloqueada: proposta não encontrada.'); persist(); return false; }
  if(offer.status !== 'Pendente'){ transferLog('Proposta já respondida anteriormente.'); persist(); return false; }
  if(decision === 'accept'){
    offer.status = 'Aceita';
    transfer.budget = Number((Number(transfer.budget||0) + Number(offer.value||0)).toFixed(1));
    transfer.wageRoom = Number((Number(transfer.wageRoom||0) + Number(offer.wageFree||0)).toFixed(2));
    transfer.outgoingDeals = [...(transfer.outgoingDeals||[]), {name:offer.player, value:offer.value, revenue:offer.value, wage:offer.wageFree, market:offer.buyer, status:'Venda aceita'}];
    transferLog(`Proposta aceita: ${offer.player} vendido para ${offer.buyer} por € ${Number(offer.value).toFixed(1)}M.`);
  } else {
    offer.status = 'Recusada';
    transfer.boardApproval = Math.max(0, Number(transfer.boardApproval||82) - 2);
    transferLog(`Proposta recusada por ${offer.player}. Empresário e diretoria foram notificados.`);
  }
  transfer.incomingOffers = offers;
  state = normalize({...state, transfer});
  persist();
  return true;
}

export function simulateAIMarket(){
  const transfer = {...(state.transfer || defaultState().transfer)};
  const buyer = aiClubProfiles[(transfer.aiDeals?.length || 0) % aiClubProfiles.length] || aiClubProfiles[0];
  const seller = aiClubProfiles[((transfer.aiDeals?.length || 0) + 3) % aiClubProfiles.length] || aiClubProfiles[1] || buyer;
  const pool = transferShortlist.concat(loanTargets||[]);
  const p = pool[((transfer.aiDeals?.length || 0) + Number(transfer.marketDay||1)) % pool.length];
  if(!p){ transferLog('Mercado IA sem alvo disponível.'); persist(); return false; }
  const fee = Number(((p.value || 1.2) * (0.9 + ((transfer.aiDeals?.length||0)%4)*0.08)).toFixed(1));
  const deal = {id:`ai-${slug(p.name)}-${Date.now()}`, player:p.name, from:seller.name, to:buyer.name, fee, type:p.value===0?'Livre':'Compra', date:state.career?.currentDate || '2026-05-19'};
  transfer.aiDeals = [...(transfer.aiDeals||[]), deal].slice(-12);
  transfer.marketDay = Number(transfer.marketDay || 1) + 1;
  state = normalize({...state, transfer});
  transferLog(`Mercado IA: ${buyer.name} acertou ${deal.type.toLowerCase()} de ${p.name} por € ${fee.toFixed(1)}M.`);
  persist();
  return true;
}

export function toggleTransferWindow(){
  const transfer = {...(state.transfer || defaultState().transfer)};
  transfer.windowOpen = !transfer.windowOpen;
  state = normalize({...state, transfer});
  transferLog(`Janela de transferências ${transfer.windowOpen ? 'aberta' : 'fechada'} pelo modo de teste seguro.`);
  persist();
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
  const offers = generateOffers(state);
  state = normalize({...state, career:{...(state.career||{}), jobOffers:offers, offerHistory:[...((state.career||{}).offerHistory||[]), `Geradas ${offers.length} propostas/sondagens de carreira.`].slice(-30)}, notifications:Number(state.notifications||0)+1});
  logIntegration(`Mercado de trabalho atualizado com ${offers.length} oportunidades.`);
  persist();
  return offers;
}
export function respondCareerOffer(offerId='', decision='reject'){
  const offers = state.career?.jobOffers || [];
  const offer = offers.find(o=>o.id===offerId);
  if(!offer) return false;
  const accepted = decision === 'accept';
  const historyMsg = `${accepted?'Aceitou':'Recusou'} ${offer.type==='national'?'seleção':'clube'}: ${offer.name}.`;
  let patch = { career:{...(state.career||{}), offerHistory:[...((state.career||{}).offerHistory||[]), historyMsg].slice(-40), jobOffers:offers.filter(o=>o.id!==offerId)} };
  if(accepted && offer.type === 'club'){
    const fixture = buildClubFixture(offer.targetId, 0);
    patch = {...patch, clubId:offer.targetId, match:fixture, ui:{...(state.ui||{}), selectedClub:offer.targetId}, boardTrust:68, fanMood:72, route:'lobby'};
    patch.career = {...patch.career, completedMatches:[], lastResult:null, matchday:1, integrationLog:[...((state.career||{}).integrationLog||[]), `Novo trabalho aceito: ${offer.name}. Temporada reiniciada para o clube escolhido.`].slice(-40)};
  }
  if(accepted && offer.type === 'national'){
    patch.career = {...patch.career, nationalTeamJob:{id:offer.targetId, name:offer.name, country:offer.country, role:offer.role, acceptedAt:new Date().toISOString(), objective:offer.objective}, dualCareer:{enabled:true, club:true, nationalTeam:offer.targetId}, internationalCalendar:buildInternationalCalendar(Number(state.season||2026)), callUpSelection:defaultCallUpSelection(), integrationLog:[...((state.career||{}).integrationLog||[]), `Carreira dupla ativada: clube + ${offer.name}.`].slice(-40)};
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
  const list = state.career?.callUpSelection || defaultCallUpSelection();
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
  const selected = (state.career?.callUpSelection || []).filter(p=>p.selected);
  if(!state.career?.nationalTeamJob || selected.length < 11){
    state = normalize({...state, career:{...(state.career||{}), offerHistory:[...((state.career||{}).offerHistory||[]), 'Convocação bloqueada: é preciso ter seleção ativa e ao menos 11 atletas.'].slice(-40)}});
    persist();
    return false;
  }
  state = normalize({...state, career:{...(state.career||{}), offerHistory:[...((state.career||{}).offerHistory||[]), `Convocação final enviada para ${state.career.nationalTeamJob.name}: ${selected.length} atletas.`].slice(-40)}, notifications:Number(state.notifications||0)+1});
  persist();
  return true;
}

export function persist(){ try { localStorage.setItem(key, JSON.stringify(state)); } catch(err){ console.warn('[VFM] save local indisponivel', err); } }
export function hasSave(){ try { return !!localStorage.getItem(key) || legacyKeys.some(k=>!!localStorage.getItem(k)); } catch(err){ return false; } }
export function load(){
  try {
    let raw = localStorage.getItem(key);
    if(!raw){ const legacy = legacyKeys.find(k=>localStorage.getItem(k)); raw = legacy ? localStorage.getItem(legacy) : null; }
    state = raw ? normalize(JSON.parse(raw)) : defaultState();
  } catch(err){ console.warn('[VFM] save corrompido, reset seguro', err); state = defaultState(); }
  return state;
}
export function reset(){ state = defaultState(); persist(); }


export function createManualBackup(slot=1){
  try {
    const safeSlot = Math.max(1, Math.min(3, Number(slot || 1)));
    const payload = JSON.stringify({...state, backupMeta:{version:'v2.6.2', createdAt:new Date().toISOString(), slot:safeSlot}});
    localStorage.setItem(`vfm_gold_backup_${safeSlot}`, payload);
    state = normalize({...state, stability:{...(state.stability||{}), lastBackup:new Date().toISOString(), backupCount:Number(state.stability?.backupCount||0)+1, health:'Backup atualizado'}});
    persist();
    return true;
  } catch(err){ console.warn('[VFM] backup manual falhou', err); return false; }
}
export function restoreManualBackup(slot=1){
  try {
    const safeSlot = Math.max(1, Math.min(3, Number(slot || 1)));
    const raw = localStorage.getItem(`vfm_gold_backup_${safeSlot}`);
    if(!raw) return false;
    state = normalize(JSON.parse(raw));
    state.stability = {...(state.stability||{}), health:`Backup ${safeSlot} restaurado`, lastImport:new Date().toISOString()};
    persist();
    return true;
  } catch(err){ console.warn('[VFM] restauracao falhou', err); state = normalize({...state, stability:{...(state.stability||{}), health:'Restauracao bloqueada com seguranca'}}); persist(); return false; }
}
export function exportSaveText(){
  try {
    const payload = JSON.stringify({...state, exportMeta:{version:'v2.6.2', exportedAt:new Date().toISOString()}}, null, 2);
    state = normalize({...state, stability:{...(state.stability||{}), lastExport:new Date().toISOString(), health:'Exportacao pronta'}});
    persist();
    return payload;
  } catch(err){ console.warn('[VFM] exportacao falhou', err); return ''; }
}
export function importSaveText(text=''){
  try {
    const parsed = JSON.parse(String(text || '{}'));
    state = normalize(parsed);
    state.stability = {...(state.stability||{}), lastImport:new Date().toISOString(), health:'Save importado e normalizado'};
    persist();
    return true;
  } catch(err){ console.warn('[VFM] importacao invalida bloqueada', err); state = normalize({...state, stability:{...(state.stability||{}), health:'Importacao invalida bloqueada'}}); persist(); return false; }
}
export function toggleAutosave(){
  state = normalize({...state, stability:{...(state.stability||{}), autosave:!state.stability?.autosave, health:'Preferencia de autosave atualizada'}});
  persist();
  return state.stability.autosave;
}
