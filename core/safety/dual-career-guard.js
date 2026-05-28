export function validateDualCareer(career={}){
  const errors=[], warnings=[];
  if(career?.nationalTeamJob && !career?.dualCareer?.enabled) warnings.push('Job de seleção encontrado sem dualCareer.enabled.');
  if(career?.dualCareer?.enabled && !career?.nationalTeamJob?.id) errors.push('Carreira dupla ativa sem seleção nacional.');
  if(career?.dualCareer?.enabled && career?.dualCareer?.club === false) errors.push('Carreira dupla sem vínculo de clube.');
  return {scope:'dual-career', status:errors.length?'error':'ok', errors, warnings};
}
