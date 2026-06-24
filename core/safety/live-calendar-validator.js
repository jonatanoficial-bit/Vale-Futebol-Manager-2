export function validateLiveCalendarSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v7.5.0') errors.push('Versão do Calendário Vivo inválida.');
  if(snapshot.schema !== 750) errors.push('Schema 750 ausente no calendário vivo.');
  if(!Array.isArray(snapshot.sequence) || snapshot.sequence.length < 4) errors.push('Sequência de calendário insuficiente.');
  if(!snapshot.metrics || typeof snapshot.metrics !== 'object') errors.push('Métricas de fadiga/recuperação ausentes.');
  if(!snapshot.metrics?.recommendedPlan) errors.push('Plano semanal recomendado ausente.');
  if(!snapshot.flags?.saveIntegrated) errors.push('Calendário não está marcado como integrado ao save.');
  if(!snapshot.flags?.mobileFirst) warnings.push('Flag mobileFirst não informada.');
  if(Number(snapshot.metrics?.injuryRisk || 0) > 100) errors.push('Risco de lesão acima do limite seguro.');
  if(Number(snapshot.metrics?.teamFatigue || 0) > 100) errors.push('Fadiga acima do limite seguro.');
  return { ok:errors.length===0, status:errors.length?'error':'ok', errors, warnings, phase:'v7.5.0-live-calendar-travel-fatigue', checkedAt:'runtime' };
}
