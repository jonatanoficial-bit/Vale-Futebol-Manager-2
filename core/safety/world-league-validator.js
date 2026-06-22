import { buildWorldLeagueSnapshot, validateWorldCompleteSnapshot } from '../../js/systems/globalWorldEngine.js';
export function validateWorldLeagueSystem(state={}){
  const snapshot = buildWorldLeagueSnapshot(state);
  const base = validateWorldCompleteSnapshot(snapshot);
  const errors = [...base.errors];
  const warnings = [...base.warnings];
  const bad = snapshot.leagues.filter(l => !l.table?.length || !l.champion?.club);
  if(bad.length) errors.push(`Ligas sem tabela/campeão: ${bad.map(l=>l.name).join(', ')}`);
  return { version:'v5.2.0', status:errors.length?'error':'ok', errors, warnings, checks:{...base.checks, completeLeagues:snapshot.leagues.length-bad.length} };
}
