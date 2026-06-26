export function validateBetaQaSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v8.2.0') errors.push('Versão do QA Final deve ser v8.2.0.');
  if(Number(snapshot.schema || 0) < 820) errors.push('Schema do QA Final inferior a 820.');
  if(Number(snapshot.totalCriticalRoutes || 0) < 16) errors.push('Matriz de rotas críticas incompleta.');
  if(Number(snapshot.routesOk || 0) < Number(snapshot.totalCriticalRoutes || 1)) errors.push('Há rota crítica ausente no gate de QA.');
  if(Number(snapshot.deviceProfiles || 0) < 5) warnings.push('Matriz de dispositivos menor que o recomendado para beta público.');
  if(Number(snapshot.noGoItems || 0) < 5) warnings.push('Lista de bloqueios No-Go muito curta.');
  if(!snapshot.hasAssetGate) errors.push('QA final precisa apontar para Assets & Cache.');
  if(!snapshot.hasSaveGate) errors.push('QA final precisa apontar para Save Slots 2.0.');
  if(!snapshot.hasMatchGate) errors.push('QA final precisa apontar para Partida.');
  if(!snapshot.hasMobileGate) warnings.push('QA final deve manter rota mobileAudit no roteiro complementar.');
  return {
    ok: errors.length === 0,
    status: errors.length ? 'error' : warnings.length ? 'warning' : 'ok',
    errors,
    warnings,
    phase:'v8.2.0-beta-final-qa-validator',
    checkedAt:'runtime'
  };
}
