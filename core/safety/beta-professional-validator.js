export function validateBetaProfessionalSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(!['v8.0.0','v8.0.1'].includes(snapshot.version)) errors.push('Versão Beta Profissional divergente de v8.0.x.');
  if(Number(snapshot.schema || 0) < 800) errors.push('Schema Beta Profissional inferior a 800.');
  if(Number(snapshot.overallScore || 0) < 90) errors.push('Score geral abaixo de 90 para divulgar beta.');
  if(!Array.isArray(snapshot.systems) || snapshot.systems.length < 8) errors.push('Poucos sistemas críticos auditados.');
  const failing = (snapshot.systems || []).filter(s => s.status === 'error' || s.ok === false);
  failing.forEach(s => errors.push(`Sistema crítico falhou: ${s.label || s.id}`));
  if(Number(snapshot.duplicateRoutesRemoved || 0) < 1) warnings.push('Nenhum atalho duplicado foi removido visualmente do menu.');
  if(Number(snapshot.requiredRoutesOk || 0) < Number(snapshot.requiredRoutesTotal || 1)) errors.push('Nem todas as rotas obrigatórias estão registradas no gate beta.');
  if(!snapshot.mobileReady) errors.push('Gate mobile-first não aprovado.');
  if(!snapshot.saveSlotsLocked) errors.push('Gate de 3 slots oficiais não aprovado.');
  return { ok:errors.length===0, status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings, phase:'v8.0.1-beta-professional-avatar-hotfix', checkedAt:'runtime' };
}
