export function validateAgentMarketSystem(snapshot={}){
  const issues = [];
  if(!snapshot || typeof snapshot !== 'object') issues.push('snapshot ausente');
  if(snapshot.version !== 'v6.7.0') issues.push('versão v6.7.0 ausente');
  if(snapshot.status !== 'agent-market-ready') issues.push('status agent-market-ready ausente');
  if(snapshot.route !== 'agentMarket') issues.push('rota agentMarket não registrada no snapshot');
  if(!snapshot.mobileFirst) issues.push('mobileFirst precisa ser true');
  if(!snapshot.offlineReady) issues.push('offlineReady precisa ser true');
  if(!snapshot.noBlockingPopup) issues.push('noBlockingPopup precisa ser true');
  if(!snapshot.preservesOldRoutes) issues.push('rotas antigas devem ser preservadas');
  if(Number(snapshot.agentCount || 0) < 5) issues.push('mínimo de 5 perfis de empresário');
  if(Number(snapshot.stageCount || 0) < 5) issues.push('mínimo de 5 etapas de negociação');
  if(Number(snapshot.caseCount || 0) < 5) issues.push('mínimo de 5 casos vivos');
  if(Number(snapshot.leverCount || 0) < 6) issues.push('mínimo de 6 alavancas contratuais');
  if(!snapshot.context?.activePlayer) issues.push('negociação ativa sem jogador');
  if(!snapshot.context?.activeAgent) issues.push('negociação ativa sem empresário');
  if(Number(snapshot.context?.dealRisk || 0) < 0 || Number(snapshot.context?.dealRisk || 0) > 100) issues.push('risco de negócio fora de 0-100');
  if(Number(snapshot.context?.closeChance || 0) < 0 || Number(snapshot.context?.closeChance || 0) > 100) issues.push('chance de fechamento fora de 0-100');
  return {
    ok: issues.length === 0,
    status: issues.length ? 'agent-market-attention' : 'agent-market-ready',
    version: 'v6.7.0',
    checkedAt: new Date().toISOString(),
    issues
  };
}
