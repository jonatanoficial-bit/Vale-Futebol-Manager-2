import { dataPackPlayerRequiredFields2026, dataPackClubMinimums2026, DATA_PACK_LOCK_DATE } from '../../js/data/dataPack2026Schema.js';

export function validateOfficialRosterSchema2026(pkg={}){
  const errors = [];
  const players = Array.isArray(pkg.players) ? pkg.players : [];
  const clubId = pkg.meta?.clubId || pkg.clubId || 'unknown';
  if(players.length < dataPackClubMinimums2026.playableMinPlayers) errors.push(`min-players:${players.length}/${dataPackClubMinimums2026.playableMinPlayers}`);
  players.forEach((p,index)=>{
    dataPackPlayerRequiredFields2026.forEach(field => { if(p[field] === undefined || p[field] === null || p[field] === '') errors.push(`p${index+1}:${field}`); });
    if(p.dataLock && p.dataLock !== DATA_PACK_LOCK_DATE) errors.push(`p${index+1}:dataLock:${p.dataLock}`);
  });
  return { status: errors.length ? 'fail' : 'ok', clubId, players: players.length, errors: errors.slice(0, 80), requiredFields:dataPackPlayerRequiredFields2026.length };
}
