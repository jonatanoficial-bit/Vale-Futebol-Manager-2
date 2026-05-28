import { buildMay2026RosterForClub } from '../../js/systems/playerDatabase2026Engine.js';
import { may2026PositionMinimums, may2026ValidationRules } from '../../js/data/rosterMay2026Data.js';

export function validateSquadDepth2026(clubId='santos'){
  const roster = buildMay2026RosterForClub(clubId);
  const counts = roster.players.reduce((map,p)=>{ map[p.pos]=(map[p.pos]||0)+1; return map; },{});
  const issues = [];
  Object.entries(may2026PositionMinimums).forEach(([pos,min])=>{ if((counts[pos]||0) < min) issues.push(`${clubId}: posição ${pos} com ${counts[pos]||0}/${min}`); });
  if(roster.players.length < may2026ValidationRules.minPlayers) issues.push(`${clubId}: elenco curto ${roster.players.length}/${may2026ValidationRules.minPlayers}`);
  const avgOverall = Math.round(roster.players.reduce((s,p)=>s+Number(p.overall||0),0)/Math.max(1,roster.players.length));
  return { status: issues.length ? 'warning' : 'ok', issues, counts, avgOverall, players:roster.players.length, clubId, checkedAt:new Date().toISOString(), version:'v4.6.0' };
}
export default validateSquadDepth2026;
