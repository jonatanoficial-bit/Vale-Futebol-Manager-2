import { teams } from '../data/gameData.js';
import { squadPlayers } from '../data/squadData.js';
import { rosterMay2026Meta, positionBlueprintMay2026, clubTierProfilesMay2026, may2026RequiredFields, may2026PositionMinimums, may2026ValidationRules, licensedDataChecklistMay2026 } from '../data/rosterMay2026Data.js';

export const PLAYER_DATABASE_2026_VERSION = 'v4.6.0';

function slug(value=''){
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'clube';
}
function tierForClub(club={}){
  const key = slug(`${club.id} ${club.name}`);
  return clubTierProfilesMay2026.find(p=>new RegExp(p.match).test(key)) || {bump:1,budget:'balanced'};
}
function clamp(n,min,max){ return Math.max(min, Math.min(max, Number(n)||0)); }
function makePlayer(club={}, blueprint=[], index=0){
  const [roleId,pos,role,overall,potential,age,salary,value,contract] = blueprint;
  const tier = tierForClub(club);
  const bump = tier.bump || 0;
  const baseId = `${slug(club.id || club.name)}-${roleId}`;
  const playerName = `${club.shortName || club.name} ${String(pos).replace('GOL','GK')} ${index+1}`;
  return {
    id: baseId,
    name: playerName,
    pos,
    role,
    overall: clamp(overall + Math.round(bump*0.75), may2026ValidationRules.minOverall, may2026ValidationRules.maxOverall),
    potential: clamp(potential + Math.round(bump*0.65), may2026ValidationRules.minOverall, may2026ValidationRules.maxOverall),
    age: clamp(age, may2026ValidationRules.minAge, may2026ValidationRules.maxAge),
    morale: 70 + Math.min(12,bump),
    form: 68 + Math.min(10,bump),
    fitness: 86,
    salary: clamp(Math.round(salary * (1 + bump/18)), may2026ValidationRules.minSalary, may2026ValidationRules.maxSalary),
    value: Number(clamp(Number(value) * (1 + bump/14), may2026ValidationRules.minValue, may2026ValidationRules.maxValue).toFixed(1)),
    contract: clamp(contract, may2026ValidationRules.minContractMonths, may2026ValidationRules.maxContractMonths),
    status: index < 14 ? 'Principal' : index < 21 ? 'Rotação' : 'Base',
    nationality: club.country || 'br',
    foot: index % 4 === 0 ? 'Canhoto' : 'Destro',
    shirt: index + 1,
    photo: `assets/players/brazil/${club.id || slug(club.name)}/${baseId}.png`,
    dataSnapshot: '2026-05'
  };
}
export function buildMay2026RosterForClub(clubId='santos'){
  const club = teams.find(t=>t.id===clubId) || teams[0] || {id:'santos',name:'Santos FC',country:'br'};
  const isSantos = club.id === 'santos';
  const basePlayers = isSantos && Array.isArray(squadPlayers) && squadPlayers.length >= 23
    ? squadPlayers.slice(0, 30).map((p, index)=>({
        ...p,
        id: p.id || `${club.id}-${index+1}`,
        dataSnapshot: '2026-05',
        photo: p.photo || `assets/players/brazil/${club.id}/${p.id}.png`,
        contract: clamp(p.contract ?? 24, may2026ValidationRules.minContractMonths, may2026ValidationRules.maxContractMonths)
      }))
    : positionBlueprintMay2026.map((bp, index)=>makePlayer(club, bp, index));
  return {
    meta: {
      clubId: club.id,
      clubName: club.name,
      country: club.country || 'br',
      leagueId: club.leagueId || 'unknown',
      season: 2026,
      snapshot: 'Maio/2026',
      version: `${club.id}-may-2026-v1`,
      sourceStatus: isSantos ? 'curated-seed' : 'licensed-template-ready',
      updatedAt: '2026-05-28',
      rosterPath: `data/rosters/2026/${club.id}.json`,
      photoFolder: `assets/players/brazil/${club.id}/`
    },
    players: basePlayers
  };
}
export function buildMay2026DatabaseSnapshot(state={}){
  const brazilian = teams.filter(t=>t.country === 'br');
  const selectedClub = state.ui?.may2026Club || state.clubId || 'santos';
  const selectedRoster = buildMay2026RosterForClub(selectedClub);
  const rosters = brazilian.map(t=>buildMay2026RosterForClub(t.id));
  const totalPlayers = rosters.reduce((sum,r)=>sum+r.players.length,0);
  const clubsReady = rosters.filter(r=>r.players.length >= may2026ValidationRules.minPlayers).length;
  const values = rosters.flatMap(r=>r.players.map(p=>Number(p.value||0)));
  const overallValues = rosters.flatMap(r=>r.players.map(p=>Number(p.overall||0)));
  const totalValue = Number(values.reduce((a,b)=>a+b,0).toFixed(1));
  const avgOverall = Math.round(overallValues.reduce((a,b)=>a+b,0)/Math.max(1,overallValues.length));
  return {
    version: PLAYER_DATABASE_2026_VERSION,
    meta: rosterMay2026Meta,
    checklist: licensedDataChecklistMay2026,
    selectedClub,
    selectedRoster,
    clubs: brazilian.map(t=>({ id:t.id, name:t.name, leagueId:t.leagueId, country:t.country, rosterPath:`data/rosters/2026/${t.id}.json`, photoFolder:`assets/players/brazil/${t.id}/`, players: buildMay2026RosterForClub(t.id).players.length })),
    totals: { clubs:brazilian.length, clubsReady, totalPlayers, totalValue, avgOverall, minPlayers:may2026ValidationRules.minPlayers },
    rules: may2026ValidationRules,
    requiredFields: may2026RequiredFields,
    positionMinimums: may2026PositionMinimums
  };
}
export function exportMay2026RosterText(clubId='santos'){
  return JSON.stringify(buildMay2026RosterForClub(clubId), null, 2);
}
export function normalizeMay2026Player(player={}, index=0, clubId='free-agent'){
  const fallbackId = `${clubId}-player-${index+1}`;
  return {
    id: player.id || fallbackId,
    name: player.name || `Jogador ${index+1}`,
    pos: player.pos || player.position || 'MC',
    role: player.role || 'Jogador do elenco',
    overall: clamp(player.overall ?? 65, may2026ValidationRules.minOverall, may2026ValidationRules.maxOverall),
    potential: clamp(player.potential ?? player.overall ?? 70, may2026ValidationRules.minOverall, may2026ValidationRules.maxOverall),
    age: clamp(player.age ?? 24, may2026ValidationRules.minAge, may2026ValidationRules.maxAge),
    salary: clamp(player.salary ?? 50, may2026ValidationRules.minSalary, may2026ValidationRules.maxSalary),
    value: clamp(player.value ?? 1, may2026ValidationRules.minValue, may2026ValidationRules.maxValue),
    contract: clamp(player.contract ?? 24, may2026ValidationRules.minContractMonths, may2026ValidationRules.maxContractMonths),
    nationality: player.nationality || 'br',
    foot: player.foot || 'Destro',
    shirt: player.shirt || index+1,
    photo: player.photo || `assets/players/brazil/${clubId}/${fallbackId}.png`,
    morale: clamp(player.morale ?? 70, 0, 100),
    form: clamp(player.form ?? 70, 0, 100),
    fitness: clamp(player.fitness ?? 85, 0, 100),
    status: player.status || 'Elenco',
    dataSnapshot: player.dataSnapshot || '2026-05'
  };
}
