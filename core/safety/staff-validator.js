export function validateStaffSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v7.8.0') errors.push('Versão da Comissão Técnica inválida.');
  if(Number(snapshot.schema || 0) !== 780) errors.push('Schema 780 ausente no staff.');
  const required = ['assistant','fitness','analyst','doctor','scout','goalkeeper'];
  const roles = Array.isArray(snapshot.roles) ? snapshot.roles.map(r=>r.id) : [];
  required.forEach(role => { if(!roles.includes(role)) errors.push(`Função obrigatória ausente: ${role}`); });
  if(!snapshot.flags?.saveIntegrated) errors.push('Staff não integrado ao save.');
  if(!snapshot.flags?.trainingLinked) errors.push('Staff não vinculado ao treino.');
  if(!snapshot.flags?.scoutingLinked) errors.push('Staff não vinculado ao scout.');
  if(!snapshot.flags?.matchLinked) errors.push('Staff não vinculado ao jogo.');
  if(!snapshot.flags?.hasGoalkeeperCoach) warnings.push('Preparador de goleiros não está ativo.');
  if(Number(snapshot.metrics?.overall || 0) <= 0) errors.push('Força geral da comissão inválida.');
  if(Number(snapshot.metrics?.usedMonthly || 0) > Number(snapshot.metrics?.monthlyLimit || 1)) warnings.push('Comissão acima do teto mensal.');
  return { ok:errors.length===0, status:errors.length?'error':'ok', errors, warnings, phase:'v7.8.0-staff-technical-commission', checkedAt:'runtime' };
}
