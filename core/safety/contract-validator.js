export function validateManagerContract(contract={}){
  const safe = {
    clubId: contract.clubId || 'santos',
    role: contract.role || 'Treinador principal',
    remainingMonths: Math.max(0, Number(contract.remainingMonths || 1)),
    wageMonthly: Math.max(0, Number(contract.wageMonthly || 0.45)),
    releaseClause: Math.max(0, Number(contract.releaseClause || 1.0)),
    bonusTarget: contract.bonusTarget || 'campanha competitiva',
    objective: contract.objective || 'manter o projeto esportivo',
    status: contract.status || 'Ativo'
  };
  return {status:'ok', contract:safe};
}
