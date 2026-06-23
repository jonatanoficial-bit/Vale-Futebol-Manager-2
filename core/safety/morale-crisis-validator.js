export function validateMoraleCrisisSystem(snapshot={}){
  const issues = [];
  if(snapshot.version !== 'v6.9.0') issues.push('Versão da moral avançada deve ser v6.9.0.');
  if(snapshot.route !== 'squadMorale') issues.push('Rota squadMorale não registrada no snapshot.');
  if(!snapshot.mobileFirst) issues.push('Módulo precisa ser mobile-first.');
  if(!snapshot.offlineReady) issues.push('Módulo precisa funcionar offline.');
  if(!snapshot.noBlockingPopup) issues.push('Popups bloqueantes não são permitidos.');
  if(!snapshot.preservesOldRoutes) issues.push('Rotas anteriores precisam ser preservadas.');
  if(Number(snapshot.groupsCount || 0) < 5) issues.push('Mapa do vestiário precisa de pelo menos 5 grupos.');
  if(Number(snapshot.triggersCount || 0) < 6) issues.push('Crises precisam de pelo menos 6 gatilhos.');
  if(Number(snapshot.casesCount || 0) < 5) issues.push('Casos individuais insuficientes.');
  if(Number(snapshot.responsesCount || 0) < 5) issues.push('Respostas do treinador insuficientes.');
  if(Number(snapshot.rulesCount || 0) < 6) issues.push('Regras anti-quebra insuficientes.');
  const ctx = snapshot.context || {};
  if(!ctx.activePlayer || !ctx.recommendedAction) issues.push('Contexto da crise sem jogador ativo ou recomendação.');
  if(Number(ctx.crisisIndex || 0) < 1) issues.push('Índice de crise inválido.');
  return {
    ok: issues.length === 0,
    status: issues.length ? 'morale-crisis-needs-fix' : 'morale-crisis-ready',
    version: 'v6.9.0',
    issues
  };
}
