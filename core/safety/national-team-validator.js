export function validateNationalTeamSnapshot(snapshot={}){
  const errors=[], warnings=[];
  if(!snapshot || typeof snapshot !== 'object') errors.push('Snapshot de seleção nacional ausente.');
  if(snapshot.active && !snapshot.job?.id) errors.push('Seleção ativa sem job.id.');
  if(snapshot.active && snapshot.dualCareer?.enabled !== true) warnings.push('Seleção ativa sem flag dualCareer.enabled; correção automática recomendada.');
  if((snapshot.selectedCount||0) < 11) errors.push('Convocação com menos de 11 jogadores.');
  if((snapshot.selectedCount||0) > 26) errors.push('Convocação acima do limite de 26 jogadores.');
  if(!Array.isArray(snapshot.calendar) || snapshot.calendar.length < 5) errors.push('Calendário internacional incompleto.');
  return {scope:'national-team', status:errors.length?'error':'ok', errors, warnings};
}
