import { buildWorldLeagueSnapshot } from '../../js/systems/globalWorldEngine.js';
export function validateGlobalCalendar(state={}){
  const snapshot = buildWorldLeagueSnapshot(state);
  const errors=[]; const warnings=[];
  if(snapshot.globalCalendar.length !== 12) errors.push('Calendário global precisa conter 12 janelas mensais.');
  const high = snapshot.globalCalendar.filter(w=>w.conflictRisk==='alto');
  if(high.length) warnings.push(`Janelas de alto conflito monitoradas: ${high.map(w=>w.month).join(', ')}.`);
  if(!snapshot.globalCalendar.every(w=>Number.isFinite(w.clubLoad) && Number.isFinite(w.internationalLoad))) errors.push('Carga de calendário inválida.');
  if(!errors.length) warnings.push('Calendário global integrado validado com carga de clube/seleção.');
  return { version:'v5.2.0', status:errors.length?'error':'ok', errors, warnings, checks:{months:snapshot.globalCalendar.length, highRisk:high.length} };
}
