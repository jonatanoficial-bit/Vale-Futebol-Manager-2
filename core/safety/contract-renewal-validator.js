export function validateContractRenewalSystem(snapshot={}){
  const issues = [];
  if(!snapshot || typeof snapshot !== 'object') issues.push('snapshot ausente');
  if(snapshot.version !== 'v6.8.0') issues.push('versão v6.8.0 ausente');
  if(snapshot.status !== 'contract-renewal-ready') issues.push('status contract-renewal-ready ausente');
  if(snapshot.route !== 'contractRenewal') issues.push('rota contractRenewal não registrada no snapshot');
  if(!snapshot.mobileFirst) issues.push('mobileFirst precisa ser true');
  if(!snapshot.offlineReady) issues.push('offlineReady precisa ser true');
  if(!snapshot.noBlockingPopup) issues.push('noBlockingPopup precisa ser true');
  if(!snapshot.preservesOldRoutes) issues.push('rotas antigas devem ser preservadas');
  if(Number(snapshot.targetCount || 0) < 5) issues.push('mínimo de 5 alvos de renovação');
  if(Number(snapshot.packageCount || 0) < 5) issues.push('mínimo de 5 pacotes contratuais');
  if(Number(snapshot.promiseCount || 0) < 6) issues.push('mínimo de 6 promessas contratuais');
  if(Number(snapshot.clauseCount || 0) < 6) issues.push('mínimo de 6 cláusulas');
  if(Number(snapshot.ruleCount || 0) < 6) issues.push('mínimo de 6 regras anti-quebra');
  if(!snapshot.context?.activePlayer) issues.push('renovação ativa sem jogador');
  if(!snapshot.context?.agent) issues.push('renovação ativa sem empresário');
  if(Number(snapshot.context?.monthsLeft || 0) <= 0) issues.push('meses restantes inválidos');
  if(Number(snapshot.context?.requestedSalary || 0) <= Number(snapshot.context?.currentSalary || 0)) issues.push('salário pedido precisa superar salário atual no cenário de pressão');
  if(Number(snapshot.context?.renewalPressure || 0) < 0 || Number(snapshot.context?.renewalPressure || 0) > 100) issues.push('pressão de renovação fora de 0-100');
  if(Number(snapshot.context?.boardComfort || 0) < 0 || Number(snapshot.context?.boardComfort || 0) > 100) issues.push('conforto da diretoria fora de 0-100');
  return {
    ok: issues.length === 0,
    status: issues.length ? 'contract-renewal-attention' : 'contract-renewal-ready',
    version: 'v6.8.0',
    checkedAt: new Date().toISOString(),
    issues
  };
}
