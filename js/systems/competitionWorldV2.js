export const COMPETITION_WORLD_VERSION = '2.0.0';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

function teamLimit(league, available) {
  return clamp(league?.rules?.teams || available.length || 2, 2, Math.max(2, available.length));
}

function cleanTeam(team = {}) {
  return { id:String(team.id || ''), name:String(team.name || 'Clube'), rating:Number(team.rating) || 60, badge:team.badge || '' };
}

function selectTeams(league, clubs, managedClub) {
  const all = [...new Map(clubs.filter(team => team.leagueId === league.id).map(team => [team.id, cleanTeam(team)])).values()];
  const limit = teamLimit(league, all);
  const ranked = all.slice().sort((a,b) => b.rating - a.rating || a.name.localeCompare(b.name));
  const managed = managedClub?.leagueId === league.id ? cleanTeam(managedClub) : null;
  const selected = managed && !ranked.some(team => team.id === managed.id) ? [managed, ...ranked] : ranked;
  if (managed && !selected.slice(0, limit).some(team => team.id === managed.id)) return [managed, ...selected.filter(team => team.id !== managed.id)].slice(0, limit);
  return selected.slice(0, limit);
}

/**
 * Uses the circle method. Scores live in compact [homeIndex, awayIndex, homeGoals, awayGoals]
 * tuples, which keeps a complete world calendar safe for browser localStorage saves.
 */
export function buildRoundRobinRounds(teams = []) {
  const indexes = teams.map((_, index) => index);
  if (indexes.length % 2) indexes.push(-1);
  if (indexes.length < 2) return [];
  const rounds = [], rotation = indexes.slice(), half = rotation.length / 2;
  for (let round = 0; round < rotation.length - 1; round++) {
    const matches = [];
    for (let index = 0; index < half; index++) {
      const first = rotation[index], second = rotation[rotation.length - 1 - index];
      if (first < 0 || second < 0) continue;
      const swap = (round + index) % 2 === 1;
      matches.push(swap ? [second, first, null, null] : [first, second, null, null]);
    }
    rounds.push(matches);
    rotation.splice(1, 0, rotation.pop());
  }
  const returnLeg = rounds.map(matches => matches.map(([home, away]) => [away, home, null, null]));
  return rounds.concat(returnLeg);
}

function tableFromTeams(teams) {
  return teams.map(team => ({ id:team.id, name:team.name, rating:team.rating, badge:team.badge || '', played:0, wins:0, draws:0, losses:0, gf:0, ga:0, gd:0, points:0 }));
}

export function sortCompetitionTable(table = [], tiebreakers = ['points','wins','gd','gf','rating']) {
  const normalized = Array.isArray(tiebreakers) && tiebreakers.length ? tiebreakers : ['points','wins','gd','gf','rating'];
  return table.slice().sort((left, right) => {
    for (const key of normalized) {
      const delta = Number(right[key] || 0) - Number(left[key] || 0);
      if (delta) return delta;
    }
    return String(left.name || '').localeCompare(String(right.name || ''), 'pt-BR');
  });
}

function leagueState(league, clubs, managedClub) {
  const teams = selectTeams(league, clubs, managedClub);
  const format = league?.rules?.format || 'double-round-robin';
  const rounds = format === 'double-round-robin' ? buildRoundRobinRounds(teams) : buildRoundRobinRounds(teams);
  return {
    version:COMPETITION_WORLD_VERSION,
    id:league.id,
    name:league.name,
    country:league.country,
    format,
    rules:{ ...(league.rules || {}), tiebreakers:['points','wins','gd','gf','rating'] },
    teams,
    table:tableFromTeams(teams),
    rounds,
    nextRound:0,
    champion:null,
    completed:false
  };
}

export function createCompetitionWorld({ season = 2026, leagues = [], clubs = [], managedClub = null } = {}) {
  const states = {};
  leagues.forEach(league => { states[league.id] = leagueState(league, clubs, managedClub); });
  return { version:COMPETITION_WORLD_VERSION, season:Number(season) || 2026, week:0, leagues:states, transfers:[], champions:[], updatedAt:new Date().toISOString() };
}

function applyResult(state, homeIndex, awayIndex, homeGoals, awayGoals) {
  const home = state.table[homeIndex], away = state.table[awayIndex];
  if (!home || !away) return false;
  const apply = (row, goalsFor, goalsAgainst) => {
    row.played++; row.gf += goalsFor; row.ga += goalsAgainst; row.gd = row.gf - row.ga;
    if (goalsFor > goalsAgainst) { row.wins++; row.points += 3; }
    else if (goalsFor === goalsAgainst) { row.draws++; row.points++; }
    else row.losses++;
  };
  apply(home, homeGoals, awayGoals); apply(away, awayGoals, homeGoals);
  return true;
}

function scoreFor(home, away, seed) {
  const hash = value => { let state = 2166136261; for (const char of String(value)) { state ^= char.charCodeAt(0); state = Math.imul(state, 16777619); } return state >>> 0; };
  const random = offset => (hash(seed + ':' + offset) % 1000) / 1000;
  const advantage = (Number(home.rating || 60) - Number(away.rating || 60)) / 18 + .28;
  return { home:Math.max(0, Math.floor(random(1) * 2.5 + Math.max(0, advantage))), away:Math.max(0, Math.floor(random(2) * 2.3 + Math.max(0, -advantage))) };
}

function finishLeagueIfNeeded(state) {
  if (state.rounds.some(round => round.some(match => match[2] === null || match[3] === null))) return;
  state.completed = true;
  const table = sortCompetitionTable(state.table, state.rules?.tiebreakers);
  state.champion = table[0] ? { id:table[0].id, name:table[0].name } : null;
}

export function simulateCompetitionRound(world, leagueId, requestedRound, seedPrefix = '') {
  const state = world?.leagues?.[leagueId];
  if (!state || !Array.isArray(state.rounds)) return { state:null, results:[], round:-1 };
  const round = Number.isInteger(requestedRound) ? requestedRound : state.rounds.findIndex(matches => matches.some(match => match[2] === null || match[3] === null));
  if (round < 0 || !state.rounds[round]) return { state, results:[], round };
  const results = [];
  state.rounds[round].forEach((match, matchIndex) => {
    if (match[2] !== null && match[3] !== null) return;
    const home = state.teams[match[0]], away = state.teams[match[1]];
    const score = scoreFor(home, away, seedPrefix + ':' + leagueId + ':' + round + ':' + matchIndex);
    match[2] = score.home; match[3] = score.away;
    applyResult(state, match[0], match[1], score.home, score.away);
    results.push({ homeTeam:home, awayTeam:away, homeGoals:score.home, awayGoals:score.away });
  });
  while (state.nextRound < state.rounds.length && state.rounds[state.nextRound].every(match => match[2] !== null && match[3] !== null)) state.nextRound++;
  finishLeagueIfNeeded(state);
  return { state, results, round };
}

export function findWorldMatch(state, homeId, awayId, preferredRound = null) {
  if (!state?.rounds) return null;
  const ordered = Number.isInteger(preferredRound) ? [preferredRound, ...state.rounds.map((_, index) => index).filter(index => index !== preferredRound)] : state.rounds.map((_, index) => index);
  for (const round of ordered) {
    const matchIndex = state.rounds[round].findIndex(match => state.teams[match[0]]?.id === homeId && state.teams[match[1]]?.id === awayId && match[2] === null && match[3] === null);
    if (matchIndex >= 0) return { round, matchIndex, exact:true };
  }
  for (const round of ordered) {
    const matchIndex = state.rounds[round].findIndex(match => {
      const first = state.teams[match[0]]?.id, second = state.teams[match[1]]?.id;
      return ((first === homeId && second === awayId) || (first === awayId && second === homeId)) && match[2] === null && match[3] === null;
    });
    if (matchIndex >= 0) return { round, matchIndex, exact:false };
  }
  return null;
}

export function recordManagedCompetitionResult(world, leagueId, managedId, opponentId, managedHome, managedGoals, opponentGoals, preferredRound = null) {
  const state = world?.leagues?.[leagueId];
  if (!state) return { recorded:false, round:-1, state:null };
  const homeId = managedHome ? managedId : opponentId, awayId = managedHome ? opponentId : managedId;
  const found = findWorldMatch(state, homeId, awayId, preferredRound);
  if (!found) return { recorded:false, round:-1, state };
  const match = state.rounds[found.round][found.matchIndex];
  if (!found.exact && state.teams[match[0]]?.id !== homeId) { const currentHome = match[0]; match[0] = match[1]; match[1] = currentHome; }
  const homeGoals = managedHome ? Number(managedGoals) : Number(opponentGoals);
  const awayGoals = managedHome ? Number(opponentGoals) : Number(managedGoals);
  match[2] = Math.max(0, homeGoals); match[3] = Math.max(0, awayGoals);
  applyResult(state, match[0], match[1], match[2], match[3]);
  while (state.nextRound < state.rounds.length && state.rounds[state.nextRound].every(item => item[2] !== null && item[3] !== null)) state.nextRound++;
  finishLeagueIfNeeded(state);
  return { recorded:true, round:found.round, matchIndex:found.matchIndex, state };
}

export function managedLeagueFixtures(world, leagueId, managedId, competitionName, startDate) {
  const state = world?.leagues?.[leagueId];
  if (!state) return [];
  const start = new Date(startDate);
  return state.rounds.flatMap((matches, round) => matches.map((match, matchIndex) => ({ match, round, matchIndex })).filter(({ match }) => state.teams[match[0]]?.id === managedId || state.teams[match[1]]?.id === managedId).map(({ match, round, matchIndex }) => {
    const home = state.teams[match[0]]?.id === managedId;
    const opponent = state.teams[home ? match[1] : match[0]];
    return { id:'league-'+(round + 1), worldFixtureRef:leagueId+':'+round+':'+matchIndex, competitionId:leagueId, competitionName, type:'league', round:round + 1, date:new Date(start.getTime() + round * 7 * 86400000).toISOString(), opponent, home, played:match[2] !== null && match[3] !== null, score:match[2] === null ? null : { home:match[2], away:match[3] } };
  })).sort((a,b) => a.round - b.round);
}

export function hydrateCompetitionWorld(existing, config = {}) {
  if (existing?.version === COMPETITION_WORLD_VERSION && Object.values(existing.leagues || {}).every(state => Array.isArray(state.rounds))) return existing;
  const world = createCompetitionWorld(config);
  Object.entries(existing?.leagues || {}).forEach(([id, oldState]) => {
    const state = world.leagues[id];
    if (!state || !Array.isArray(oldState?.table)) return;
    oldState.table.forEach(oldRow => {
      const row = state.table.find(item => item.id === oldRow.id);
      if (row) Object.assign(row, { played:Number(oldRow.played) || 0, wins:Number(oldRow.wins) || 0, draws:Number(oldRow.draws) || 0, losses:Number(oldRow.losses) || 0, gf:Number(oldRow.gf) || 0, ga:Number(oldRow.ga) || 0, gd:Number(oldRow.gd) || 0, points:Number(oldRow.points) || 0 });
    });
    const seedRounds = Math.min(state.rounds.length, Math.floor(Math.min(...state.table.map(row => row.played || 0))));
    for (let round = 0; round < seedRounds; round++) state.rounds[round].forEach(match => { match[2] = 0; match[3] = 0; });
    state.nextRound = seedRounds;
  });
  world.week = Number(existing?.week) || 0;
  world.transfers = Array.isArray(existing?.transfers) ? existing.transfers : [];
  world.champions = Array.isArray(existing?.champions) ? existing.champions : [];
  return world;
}

export function competitionRuleSummary(state) {
  if (!state) return [];
  const rules = state.rules || {}, items = ['Pontos', 'Vitórias', 'Saldo de gols', 'Gols pró'];
  if (rules.promotion) items.push('Acesso: '+rules.promotion);
  if (rules.relegation) items.push('Rebaixamento: '+rules.relegation);
  return items;
}
