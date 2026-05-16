import { matchTimeline } from '../data/matchData.js';
import { schedule } from '../data/seasonData.js';

const key = 'vfm_gold_save_v160';
const legacyKeys = ['vfm_gold_save_v150', 'vfm_gold_save_v140', 'vfm_gold_save_v130', 'vfm_gold_save_v120', 'vfm_gold_save_v110', 'vfm_gold_save_v100', 'vfm_gold_save_v090', 'vfm_gold_save_v080', 'vfm_gold_save_v050', 'vfm_gold_save_v040', 'vfm_gold_save_v030', 'vfm_gold_save_v020', 'vfm_gold_save_v010'];
export const defaultState = () => ({
  route:'cover',
  manager:{ name:'Joao Victor', country:'br', avatar:'assets/avatars/manager-01.png', reputation:82, mode:'career' },
  clubId:'santos', season:2024, month:'Julho', money:92.5, coins:250, notifications:6, boardTrust:76, fanMood:82, jobSecurity:'Seguro',
  match:{ id:'2024-07-03-santos-palmeiras', date:'2024-07-03', competitionId:'brasileirao-a', competition:'Brasileirão Série A', stage:'Rodada 12', minute:57, home:'santos', away:'palmeiras', homeGoals:1, awayGoals:0, speed:1, finalized:false },
  career:{ currentDate:'2024-07-03', matchday:12, completedMatches:[], lastResult:null, integrationLog:['Carreira carregada com integração segura v1.6.0.'] },
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
  merged.career = {...base.career, ...(next?.career || {})};
  if(!Array.isArray(merged.career.completedMatches)) merged.career.completedMatches = [];
  if(!Array.isArray(merged.career.integrationLog)) merged.career.integrationLog = [];
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
  const minute = Math.max(1, Math.min(90, Number(match?.minute || 1)));
  const homeId = match?.home || 'santos';
  const awayId = match?.away || 'palmeiras';
  return matchTimeline.filter(e => e.type === 'goal' && e.minute <= minute).reduce((acc,e)=>{
    if(e.team === homeId) acc.home += 1;
    if(e.team === awayId) acc.away += 1;
    return acc;
  }, {home:0, away:0});
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
    finalized:false
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
    date: current.date || state.career?.currentDate || '2024-07-03',
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
  const career = {...state.career, completedMatches:completed, lastResult:result, currentDate: next?.date || result.date};
  state = normalize({
    ...state,
    match: current,
    career,
    money: Number((Number(state.money || 0) + (already ? 0 : moneyBonus)).toFixed(1)),
    boardTrust: Math.max(0, Math.min(100, Number(state.boardTrust || 76) + (already ? 0 : trustDelta))),
    fanMood: Math.max(0, Math.min(100, Number(state.fanMood || 82) + (already ? 0 : fanDelta))),
    notifications: Number(state.notifications || 0) + (already ? 0 : 1)
  });
  logIntegration(`Resultado integrado: ${result.competition} ${result.stage} terminou ${result.summary}. Calendário, lobby, classificação e save foram atualizados.`);
  persist();
  return result;
}
export function getCompletedMatchMap(){
  return new Map((state.career?.completedMatches || []).map(m => [m.id, m]));
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
