export function validateScoutingSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v7.6.0') errors.push('Versão do Scout inválida.');
  if(snapshot.schema !== 760) errors.push('Schema 760 ausente no Scout.');
  if(!Array.isArray(snapshot.regions) || snapshot.regions.length < 4) errors.push('Regiões de observação insuficientes.');
  if(!Array.isArray(snapshot.observers) || snapshot.observers.length < 3) errors.push('Observadores insuficientes.');
  if(!Array.isArray(snapshot.assignments) || snapshot.assignments.length < 1) errors.push('Nenhum observador designado.');
  if(!Array.isArray(snapshot.reports)) errors.push('Lista de relatórios ausente.');
  if(!snapshot.metrics || typeof snapshot.metrics !== 'object') errors.push('Métricas de recrutamento ausentes.');
  if(!snapshot.flags?.saveIntegrated) errors.push('Scout não marcado como integrado ao save.');
  if(!snapshot.flags?.recruitmentLinked) errors.push('Scout não vinculado ao recrutamento.');
  if(Number(snapshot.metrics?.monthlyCost || 0) < 0) errors.push('Custo mensal inválido.');
  if(Number(snapshot.metrics?.avgFit || 0) > 100) errors.push('Encaixe médio acima do limite.');
  if(!snapshot.flags?.mobileFirst) warnings.push('Flag mobileFirst não informada.');
  return { ok:errors.length===0, status:errors.length?'error':'ok', errors, warnings, phase:'v7.6.0-scout-observers-recruitment', checkedAt:'runtime' };
}
