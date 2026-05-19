
import { continentalCompetitions, worldCompetitions, nationalTeamCompetitions, globalCalendarTemplates, qualificationRules } from '../data/worldCompetitionData.js';
import { deriveStandings } from './seasonEngine.js';
import { clubLogo, safeImg } from './assets.js';
import { teams } from '../data/gameData.js';

export const WORLD_COMPETITION_ENGINE_VERSION = 'v3.2.0';

export function currentLeaguePosition(state={}, leagueId=null){
  const clubId = state.clubId || state.ui?.selectedClub || 'santos';
  const club = teams.find(t=>t.id===clubId) || teams[0];
  const targetLeague = leagueId || club.leagueId || 'brasileirao-a';
  const table = deriveStandings(targetLeague, state.career?.completedMatches || []);
  const row = table.find(r=>r.id===clubId) || table[0] || {pos:1, pts:0, club:club.name};
  return {...row, leagueId:targetLeague, logo:clubLogo(clubId)};
}

export function qualificationForPosition(leagueId='brasileirao-a', pos=1){
  if(leagueId==='brasileirao-b'){
    if(pos<=4) return {label:'Acesso para Série A', level:'excellent', destination:'brasileirao-a'};
    if(pos>=17) return {label:'Zona de queda nacional', level:'danger', destination:'serie-c'};
    return {label:'Permanece na Série B', level:'neutral', destination:'brasileirao-b'};
  }
  if(pos<=4) return {label:'Vaga para Libertadores', level:'excellent', destination:'libertadores'};
  if(pos<=12) return {label:'Vaga para Sul-Americana', level:'good', destination:'sulamericana'};
  if(pos>=17) return {label:'Zona de rebaixamento', level:'danger', destination:'brasileirao-b'};
  return {label:'Meio da tabela', level:'neutral', destination:'none'};
}

export function buildWorldCalendar(state={}){
  const season = Number(state.season || 2026);
  const activeNationalTeam = state.career?.nationalTeamJob?.name || state.career?.dualCareer?.nationalTeam || null;
  return globalCalendarTemplates.map((m,idx)=>({
    id:`world-${season}-${idx+1}`,
    season,
    month:m.month,
    type:m.type,
    title:m.title,
    competitions:m.competitions,
    activeForClub:true,
    activeForNationalTeam:Boolean(activeNationalTeam) && ['international','mixed','world'].includes(m.type),
    pressure: ['finals','pressure','world'].includes(m.type) ? 'Alta' : ['mixed','international'].includes(m.type) ? 'Média' : 'Controlada'
  }));
}

export function nextGlobalCycle(state={}){
  const season = Number(state.season || 2026);
  return {
    worldCup: nextCycleYear(season, 2026, 4),
    clubWorldCup: nextCycleYear(season, 2029, 4),
    copaContinental: nextCycleYear(season, 2028, 4),
    intercontinental: season,
    qualifiersActive: true
  };
}
function nextCycleYear(season, base, step){
  let year = base;
  while(year < season) year += step;
  return year;
}

export function continentalStatusForClub(state={}){
  const pos = currentLeaguePosition(state);
  const q = qualificationForPosition(pos.leagueId, pos.pos);
  const active = [];
  if(q.destination==='libertadores') active.push(continentalCompetitions.find(c=>c.id==='libertadores'));
  if(q.destination==='sulamericana') active.push(continentalCompetitions.find(c=>c.id==='sulamericana'));
  return {position:pos, qualification:q, active:active.filter(Boolean)};
}

export function worldCompetitionSummary(state={}){
  const status = continentalStatusForClub(state);
  const cycle = nextGlobalCycle(state);
  return {
    version:WORLD_COMPETITION_ENGINE_VERSION,
    activeClubDestination: status.qualification.label,
    currentPosition: status.position.pos,
    currentLeague: status.position.leagueId,
    nextWorldCup: cycle.worldCup,
    nextClubWorldCup: cycle.clubWorldCup,
    activeContinental: status.active.map(c=>c.name),
    totalCompetitions: continentalCompetitions.length + worldCompetitions.length + nationalTeamCompetitions.length
  };
}

export function renderCompetitionLogo(path, name, cls='competition-logo'){
  return safeImg(path || 'assets/placeholders/competition-generic.png', 'competition', name || 'Competição', cls);
}

export { continentalCompetitions, worldCompetitions, nationalTeamCompetitions, qualificationRules };
