export function validateWeeklyTrainingSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v7.7.0') errors.push('Versão do Treino Semanal inválida.');
  if(Number(snapshot.schema || 0) !== 770) errors.push('Schema 770 ausente no treino semanal.');
  if(!Array.isArray(snapshot.sessions) || snapshot.sessions.length !== 7) errors.push('Microciclo precisa ter 7 sessões.');
  const required = ['Recuperação','Tático','Físico','Bola parada','Finalização','Coletivo','Descanso'];
  const types = (snapshot.sessions || []).map(s=>s.type);
  required.forEach(type => { if(!types.includes(type)) warnings.push(`Sessão ${type} não está no preset atual.`); });
  if(!snapshot.matchImpact || typeof snapshot.matchImpact !== 'object') errors.push('Impacto direto no jogo ausente.');
  if(Number(snapshot.weeklyLoad || 0) > 100) errors.push('Carga semanal acima do limite.');
  if(Number(snapshot.injuryRisk || 0) > 100) errors.push('Risco de lesão acima do limite.');
  if(!snapshot.flags?.saveIntegrated) errors.push('Treino semanal não integrado ao save.');
  if(!snapshot.flags?.calendarLinked) errors.push('Treino semanal não vinculado ao calendário vivo.');
  if(!snapshot.flags?.matchLinked) errors.push('Treino semanal não vinculado ao jogo.');
  return { ok:errors.length===0, status:errors.length?'error':'ok', errors, warnings, phase:'v7.7.0-weekly-training-realistic', checkedAt:'runtime' };
}
