export function validateMatchSimulation90System(snapshot={}){
  const issues = [];
  if(snapshot.version !== 'v7.0.0') issues.push('Versão da simulação 90 minutos deve ser v7.0.0.');
  if(snapshot.route !== 'matchSimulation90') issues.push('Rota matchSimulation90 não registrada no snapshot.');
  if(!snapshot.mobileFirst) issues.push('Camada de partida precisa ser mobile-first.');
  if(!snapshot.offlineReady) issues.push('Camada precisa funcionar offline.');
  if(!snapshot.noBlockingPopup) issues.push('Popups bloqueantes não são permitidos.');
  if(!snapshot.preservesMatchRoute) issues.push('A rota match antiga precisa ser preservada.');
  if(Number(snapshot.phasesCount || 0) < 6) issues.push('Simulação precisa de 6 fases de jogo.');
  if(Number(snapshot.eventsCount || 0) < 6) issues.push('Eventos 2D/texto insuficientes.');
  if(Number(snapshot.readsCount || 0) < 5) issues.push('Leituras táticas insuficientes.');
  if(Number(snapshot.interventionsCount || 0) < 5) issues.push('Intervenções do treinador insuficientes.');
  if(Number(snapshot.commentaryCount || 0) < 5) issues.push('Blocos de narração insuficientes.');
  if(Number(snapshot.rulesCount || 0) < 6) issues.push('Regras anti-quebra insuficientes.');
  const ctx = snapshot.context || {};
  if(!ctx.activePhase || !ctx.recommendedAdvice || !ctx.coachCommand) issues.push('Contexto da simulação sem fase, conselho ou comando.');
  if(Number(ctx.pressureIndex || 0) < 1) issues.push('Índice de pressão inválido.');
  return {
    ok: issues.length === 0,
    status: issues.length ? 'match-simulation90-needs-fix' : 'match-simulation90-ready',
    version: 'v7.0.0',
    issues
  };
}
