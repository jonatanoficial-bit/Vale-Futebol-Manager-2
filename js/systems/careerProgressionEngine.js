import { deriveStandings, qualificationSummary } from './seasonEngine.js';
import { teams } from '../data/gameData.js';

export const CAREER_PROGRESSION_VERSION = 'v5.9.2-career-loop';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n||0))); }
function clubById(id){ return teams.find(t=>t.id===id) || teams[0]; }
function resultLabel(points){ return points===3 ? 'Vitória' : points===1 ? 'Empate' : 'Derrota'; }
function objectiveForPosition(leagueId, pos){
  if(leagueId==='brasileirao-b') return pos<=4 ? 'Acesso conquistado' : pos>=17 ? 'Temporada crítica' : 'Evoluir na tabela';
  if(pos<=5) return 'Libertadores conquistada';
  if(pos<=12) return 'Sul-Americana conquistada';
  if(pos>=17) return 'Risco de rebaixamento';
  return 'Meio de tabela';
}
export function normalizeCareerProgression(career={}, state={}){
  const tutorial = career.tutorial || {};
  const missions = Array.isArray(career.missions) ? career.missions : [];
  return {
    tutorial:{seen:Boolean(tutorial.seen), step:Number(tutorial.step||1), completed:Boolean(tutorial.completed)},
    missions,
    completedSeasons:Number(career.completedSeasons||0),
    seasonHistory:Array.isArray(career.seasonHistory) ? career.seasonHistory.slice(-24) : [],
    lifetimeEarnings:Number(career.lifetimeEarnings||0),
    reputationHistory:Array.isArray(career.reputationHistory) ? career.reputationHistory.slice(-24) : [{season:state.season||2026, rep:state.manager?.reputation||50, note:'Início da carreira'}],
    activeStory:Array.isArray(career.activeStory) ? career.activeStory.slice(-12) : ['Assuma o clube, jogue sua primeira partida e construa reputação temporada após temporada.'],
    tutorialVersion: CAREER_PROGRESSION_VERSION
  };
}
export function buildCareerMissions(state={}){
  const completed = state.career?.completedMatches || [];
  const wins = completed.filter(m=>Number(m.points||0)===3).length;
  const rep = Number(state.manager?.reputation||50);
  const money = Number(state.money||0);
  const hasNational = Boolean(state.career?.dualCareer?.enabled || state.career?.nationalTeamJob);
  const club = clubById(state.clubId);
  const leagueId = club.leagueId || 'brasileirao-a';
  const standings = deriveStandings(leagueId, completed);
  const row = standings.find(r=>r.id===club.id) || {pos:20, pts:0};
  const missions = [
    {id:'tutorial-first-match', title:'Jogue sua primeira partida', desc:'Entre no próximo compromisso oficial e finalize o relatório pós-jogo.', progress:Math.min(100, completed.length>=1?100:0), reward:'+1 reputação'},
    {id:'tutorial-open-tactics', title:'Revise a tática', desc:'Acesse a tela de tática antes de uma partida importante.', progress:state.ui?.selectedFormation?100:35, reward:'+ confiança do elenco'},
    {id:'season-five-matches', title:'Consolide o início da temporada', desc:'Complete 5 jogos oficiais da liga.', progress:Math.min(100, Math.round((completed.length/5)*100)), reward:'bônus de diretoria'},
    {id:'season-three-wins', title:'Busque 3 vitórias', desc:'Vença 3 jogos para aumentar sua reputação.', progress:Math.min(100, Math.round((wins/3)*100)), reward:'+ reputação'},
    {id:'career-reputation-90', title:'Torne-se técnico de elite', desc:'Leve sua reputação até 90 para receber convites maiores.', progress:Math.min(100, Math.round((rep/90)*100)), reward:'clubes e seleções maiores'},
    {id:'finance-grow', title:'Valorize sua carreira', desc:'Aumente caixa e renda acumulada com resultados, prêmios e contratos.', progress:Math.min(100, Math.round((money/150)*100)), reward:'maior poder de mercado'},
    {id:'national-team', title:'Caminho para seleção', desc:'Aceite convite ou registre interesse por uma seleção nacional.', progress:hasNational?100:0, reward:'carreira dupla'},
    {id:'league-target', title:'Objetivo da liga', desc:`Posição atual: ${row.pos}º. ${objectiveForPosition(leagueId,row.pos)}.`, progress: leagueId==='brasileirao-b' ? (row.pos<=4?100:Math.max(10,100-row.pos*4)) : (row.pos<=12?100:Math.max(10,100-row.pos*4)), reward:qualificationSummary(leagueId)[0]}
  ];
  return missions.map(m=>({...m, done:m.progress>=100}));
}
export function applyPostMatchProgression(state={}, result={}, moneyBonus=0){
  const base = normalizeCareerProgression(state.career||{}, state);
  const points = Number(result.points||0);
  const repDelta = points===3 ? 1 : points===1 ? 0 : -1;
  const currentRep = Number(state.manager?.reputation||50);
  const nextRep = clamp(currentRep + repDelta, 1, 100);
  const story = `${result.date || ''} · ${resultLabel(points)} ${result.summary || ''} em ${result.competition || 'competição oficial'}: reputação ${currentRep} → ${nextRep}.`;
  const career = {
    ...(state.career||{}),
    tutorial:{...base.tutorial, seen:base.tutorial.seen, completed:base.tutorial.completed || (state.career?.completedMatches||[]).length >= 1},
    lifetimeEarnings:Number((base.lifetimeEarnings + Number(moneyBonus||0)).toFixed(1)),
    reputationHistory:[...base.reputationHistory, {season:state.season||2026, rep:nextRep, note:resultLabel(points)}].slice(-24),
    activeStory:[story, ...base.activeStory].slice(0,12),
    missions:buildCareerMissions({...state, manager:{...(state.manager||{}), reputation:nextRep}})
  };
  return {managerReputation:nextRep, career};
}
export function buildSeasonEndSummary(state={}){
  const club = clubById(state.clubId);
  const leagueId = club.leagueId || 'brasileirao-a';
  const standings = deriveStandings(leagueId, state.career?.completedMatches || []);
  const row = standings.find(r=>r.id===club.id) || standings[standings.length-1] || {pos:20, pts:0, w:0, d:0, l:0};
  const champion = standings[0]?.club || 'Campeão indefinido';
  const positionBonus = leagueId==='brasileirao-b' ? Math.max(2, 24 - row.pos) : Math.max(3, 42 - row.pos*1.4);
  const repBonus = row.pos<=1 ? 6 : row.pos<=4 ? 4 : row.pos<=8 ? 2 : row.pos>=17 ? -5 : 0;
  return {
    season:state.season||2026,
    clubId:club.id,
    clubName:club.name,
    leagueId,
    position:row.pos,
    points:row.pts,
    wins:row.w,
    draws:row.d,
    losses:row.l,
    champion,
    objective:objectiveForPosition(leagueId,row.pos),
    prize:Number(positionBonus.toFixed(1)),
    repBonus
  };
}
export function rolloverInfiniteSeason(state={}){
  const end = buildSeasonEndSummary(state);
  const base = normalizeCareerProgression(state.career||{}, state);
  const nextSeason = Number(state.season||2026)+1;
  const nextRep = clamp(Number(state.manager?.reputation||50) + Number(end.repBonus||0), 1, 100);
  const nextMoney = Number((Number(state.money||0) + end.prize).toFixed(1));
  const history = [...base.seasonHistory, end].slice(-24);
  const story = `Temporada ${end.season} encerrada: ${end.clubName} terminou em ${end.position}º com ${end.points} pts. ${end.objective}. Prêmio € ${end.prize}M.`;
  return {
    season:nextSeason,
    month:'Abril',
    money:nextMoney,
    manager:{...(state.manager||{}), reputation:nextRep},
    boardTrust:clamp(Number(state.boardTrust||70) + (end.position<=8?4:end.position>=17?-8:0)),
    fanMood:clamp(Number(state.fanMood||70) + (end.position<=8?5:end.position>=17?-10:0)),
    jobSecurity:end.position>=17 ? 'Pressionado' : 'Seguro',
    career:{
      ...(state.career||{}),
      currentDate:`${nextSeason}-04-13`,
      matchday:1,
      completedMatches:[],
      lastRoundResults:[],
      completedSeasons:Number(base.completedSeasons||0)+1,
      seasonHistory:history,
      lifetimeEarnings:Number((base.lifetimeEarnings + end.prize).toFixed(1)),
      reputationHistory:[...base.reputationHistory, {season:nextSeason, rep:nextRep, note:`Virada de temporada: ${end.objective}`}].slice(-24),
      activeStory:[story, ...base.activeStory].slice(0,12),
      missions:[],
      managerTimeline:[...((state.career?.managerTimeline)||[]), {date:`${nextSeason}-01-05`, title:'Virada de temporada', text:story}].slice(-24),
      integrationLog:[...((state.career?.integrationLog)||[]), story].slice(-40)
    },
    lastSeasonSummary:end
  };
}
export function careerLoopSnapshot(state={}){
  const progression = normalizeCareerProgression(state.career||{}, state);
  const missions = buildCareerMissions(state);
  return {
    version:CAREER_PROGRESSION_VERSION,
    season:state.season||2026,
    reputation:Number(state.manager?.reputation||0),
    completedSeasons:progression.completedSeasons,
    lifetimeEarnings:progression.lifetimeEarnings,
    missionCount:missions.length,
    completedMissions:missions.filter(m=>m.done).length,
    tutorialSeen:Boolean(progression.tutorial.seen),
    activeStory:progression.activeStory.slice(0,3),
    status:'ok'
  };
}
