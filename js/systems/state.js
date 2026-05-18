import { matchTimeline } from '../data/matchData.js';
import { schedule } from '../data/seasonData.js';
import { transferShortlist, negotiations as baseNegotiations, outgoingList } from '../data/transferData.js';
import { scoreFromTimeline, buildBalanceSummary } from './balance.js';
import { squadPlayers as defaultRosterPlayers, rosterMeta as defaultRosterMeta, normalizeRoster } from '../data/squadData.js';

const key = 'vfm_gold_save_v251';
const legacyKeys = ['vfm_gold_save_v240', 'vfm_gold_save_v230', 'vfm_gold_save_v220', 'vfm_gold_save_v210', 'vfm_gold_save_v200', 'vfm_gold_save_v190', 'vfm_gold_save_v180', 'vfm_gold_save_v170', 'vfm_gold_save_v160', 'vfm_gold_save_v150', 'vfm_gold_save_v140', 'vfm_gold_save_v130', 'vfm_gold_save_v120', 'vfm_gold_save_v110', 'vfm_gold_save_v100', 'vfm_gold_save_v090', 'vfm_gold_save_v080', 'vfm_gold_save_v050', 'vfm_gold_save_v040', 'vfm_gold_save_v030', 'vfm_gold_save_v020', 'vfm_gold_save_v010'];
export const defaultState = () => ({
  route:'cover',
  manager:{ name:'Joao Victor', country:'br', avatar:'assets/avatars/manager-01.png', reputation:82, mode:'career' },
  clubId:'santos', season:2026, month:'Maio', money:92.5, coins:250, notifications:6, boardTrust:76, fanMood:82, jobSecurity:'Seguro',
  match:{ id:'2026-05-24-santos-palmeiras', date:'2026-05-24', competitionId:'brasileirao-a', competition:'Brasileirão Série A', stage:'Rodada 12', minute:57, home:'santos', away:'palmeiras', homeGoals:1, awayGoals:0, speed:1, finalized:false, substitutions:[], maxSubs:5, decision:'balanced', tacticalBoost:0, usedSubPlayers:[] },
  career:{ currentDate:'2026-05-19', matchday:12, completedMatches:[], lastResult:null, integrationLog:['Carreira migrada para v2.5.1 com central de atualização de elencos, importação JSON segura e Santos 2026 atualizado.'] },
  gameplay:{ difficulty:'realistic', aiVersion:'v2.5.1', realism:84, variance:22, balanceLog:[] },
  stability:{ autosave:true, lastBackup:null, backupCount:0, lastExport:null, lastImport:null, safeModeEvents:0, health:'Excelente', auditVersion:'v2.5.1', commercialAudit:'ok', fullscreenMobile:true, overflowGuard:true, rosterSafeMode:true },
  roster:{ meta: defaultRosterMeta, players: defaultRosterPlayers, lastImport:null, lastExport:null, validationLog:['Elenco base Santos 2026 carregado com proteção anti-quebra.'] },
  transfer:{ budget:42.8, wageRoom:2.4, negotiationLog:[], activeNegotiations:[], acceptedDeals:[], rejectedDeals:[], outgoingDeals:[], renewals:[] },
  ui:{ selectedAvatar:'assets/avatars/manager-01.png', selectedMode:'career', selectedCountry:'br', selectedClub:'santos', teamCountryFilter:'all', teamLeagueFilter:'all', teamSort:'level', standingsCompetition:'brasileirao-a', selectedFormation:'433-possession', tacticalProfile:'possession', trainingTheme:'possession', transferFilter:'all' }
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
  merged.match.maxSubs = Math.max(3, Math.min(5, Number(merged.match.maxSubs || 5)));
  merged.match.decision = String(merged.match.decision || 'balanced');
  merged.match.tacticalBoost = Number(merged.match.tacticalBoost || 0);
  merged.career = {...base.career, ...(next?.career || {})};
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
  merged.transfer = {...base.transfer, ...(next?.transfer || {})};
  merged.transfer.budget = Math.max(0, Number(merged.transfer.budget || base.transfer.budget));
  merged.transfer.wageRoom = Math.max(0, Number(merged.transfer.wageRoom || base.transfer.wageRoom));
  if(!Array.isArray(merged.transfer.negotiationLog)) merged.transfer.negotiationLog = [];
  if(!Array.isArray(merged.transfer.activeNegotiations)) merged.transfer.activeNegotiations = [];
  if(!Array.isArray(merged.transfer.acceptedDeals)) merged.transfer.acceptedDeals = [];
  if(!Array.isArray(merged.transfer.rejectedDeals)) merged.transfer.rejectedDeals = [];
  if(!Array.isArray(merged.transfer.outgoingDeals)) merged.transfer.outgoingDeals = [];
  if(!Array.isArray(merged.transfer.renewals)) merged.transfer.renewals = [];
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
  return merged;
}
export function getState(){ return state; }
export function setState(patch){ state = normalize({...state, ...patch}); persist(); }
export function setManager(patch){ state = normalize({...state, manager:{...state.manager, ...patch}}); persist(); }
export function setUI(patch){ state = normalize({...state, ui:{...state.ui, ...patch}}); persist(); }
export function startCareer(){
  state = normalize({
    ...state,
    manager:{
      ...state.manager,
      avatar: state.ui.selectedAvatar || state.manager.avatar,
      country: state.ui.selectedCountry || state.manager.country,
      mode: state.ui.selectedMode || state.manager.mode
    },
    clubId: state.ui.selectedClub || state.clubId || 'santos',
    route:'lobby'
  });
  persist();
}

function scoreUntilMinute(match){
  return scoreFromTimeline(matchTimeline, match, state);
}
function findNextMatch(afterId){
  const completed = new Set((state.career?.completedMatches || []).map(m=>m.id));
  if(afterId) completed.add(afterId);
  const next = schedule.find(ev => ev.type === 'match' && !completed.has(`${ev.date}-${slug(ev.home)}-${slug(ev.away)}`));
  if(!next) return null;
  return {
    id:`${next.date}-${slug(next.home)}-${slug(next.away)}`,
    date:next.date,
    competitionId:competitionIdFromName(next.competition),
    competition:next.competition,
    stage:next.stage,
    minute:1,
    home:slug(next.home),
    away:slug(next.away),
    homeGoals:0,
    awayGoals:0,
    speed:1,
    finalized:false,
    substitutions:[],
    maxSubs:5,
    decision:'balanced',
    tacticalBoost:0,
    usedSubPlayers:[]
  };
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
export function finishMatch(){
  const current = {...(state.match || defaultState().match), minute:90, finalized:true};
  const score = scoreUntilMinute(current);
  current.homeGoals = score.home;
  current.awayGoals = score.away;
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
    points: score.home > score.away ? 3 : score.home === score.away ? 1 : 0,
    summary: `${score.home} x ${score.away}`
  };
  const completed = already ? state.career.completedMatches : [...(state.career?.completedMatches || []), result];
  const next = findNextMatch(current.id);
  const moneyBonus = result.points === 3 ? 2.5 : result.points === 1 ? 0.8 : 0.2;
  const trustDelta = result.points === 3 ? 2 : result.points === 1 ? 0 : -2;
  const fanDelta = result.points === 3 ? 3 : result.points === 1 ? 0 : -3;
  const balanceLog = Array.isArray(state.gameplay?.balanceLog) ? state.gameplay.balanceLog.slice(-9) : [];
  balanceLog.push({date:result.date, match:result.id, report:buildBalanceSummary(current, state), result:result.summary});
  const career = {...state.career, completedMatches:completed, lastResult:result, currentDate: next?.date || result.date};
  state = normalize({
    ...state,
    match: current,
    career,
    money: Number((Number(state.money || 0) + (already ? 0 : moneyBonus)).toFixed(1)),
    boardTrust: Math.max(0, Math.min(100, Number(state.boardTrust || 76) + (already ? 0 : trustDelta))),
    fanMood: Math.max(0, Math.min(100, Number(state.fanMood || 82) + (already ? 0 : fanDelta))),
    notifications: Number(state.notifications || 0) + (already ? 0 : 1),
    gameplay:{...state.gameplay, balanceLog}
  });
  logIntegration(`Resultado integrado: ${result.competition} ${result.stage} terminou ${result.summary}. Calendário, lobby, classificação e save foram atualizados.`);
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
    const payload = JSON.stringify({...state, backupMeta:{version:'v2.5.1', createdAt:new Date().toISOString(), slot:safeSlot}});
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
    const payload = JSON.stringify({...state, exportMeta:{version:'v2.5.1', exportedAt:new Date().toISOString()}}, null, 2);
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
