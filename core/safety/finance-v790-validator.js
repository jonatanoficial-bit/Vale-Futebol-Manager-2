export function validateFinanceV790System(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v7.9.0') errors.push('Versão financeira inválida.');
  if(Number(snapshot.schema || 0) !== 790) errors.push('Schema 790 ausente no financeiro.');
  if(!snapshot.flags?.saveIntegrated) errors.push('Financeiro não integrado ao save.');
  if(!snapshot.flags?.sponsorshipLinked) errors.push('Patrocínio não vinculado ao motor financeiro.');
  if(!snapshot.flags?.ticketingLinked) errors.push('Bilheteria não vinculada ao motor financeiro.');
  if(!snapshot.flags?.staffPayrollLinked) errors.push('Folha do staff não integrada às despesas.');
  if(!snapshot.flags?.matchdayLinked) errors.push('Matchday não integrado à renda de estádio.');
  if(!Array.isArray(snapshot.revenues) || snapshot.revenues.length < 5) errors.push('Receitas financeiras incompletas.');
  if(!Array.isArray(snapshot.expenses) || snapshot.expenses.length < 5) errors.push('Despesas financeiras incompletas.');
  if(!Array.isArray(snapshot.sponsorshipFit) || snapshot.sponsorshipFit.length < 4) errors.push('Mercado de patrocínio incompleto.');
  if(Number(snapshot.monthlyRevenue || 0) <= 0) errors.push('Receita mensal inválida.');
  if(Number(snapshot.monthlyExpense || 0) <= 0) errors.push('Despesa mensal inválida.');
  if(Number(snapshot.wagePressure || 0) > 90) warnings.push('Folha salarial em zona crítica.');
  if(String(snapshot.health || '').includes('Crise') || String(snapshot.health || '').includes('Emergência')) warnings.push('Saúde financeira exige atenção da diretoria.');
  return { ok:errors.length===0, status:errors.length?'error':'ok', errors, warnings, phase:'v7.9.0-finance-sponsorship-ticketing', checkedAt:'runtime' };
}
