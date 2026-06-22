import { transferWindow } from '../../js/data/transferData.js';

export function validateBudgetGuard(state={}){
  const transfer = state.transfer || {};
  const errors = [];
  const warnings = [];
  const budget = Number(transfer.budget || 0);
  const wageRoom = Number(transfer.wageRoom || 0);
  if(budget < 0) errors.push('Orçamento de transferências ficou negativo.');
  if(wageRoom < 0) errors.push('Folha livre ficou negativa.');
  if(budget > Number(transferWindow.boardLimit || 58) * 1.25) warnings.push('Orçamento muito acima do limite previsto; revisar receitas extraordinárias.');
  if(Number(transfer.boardApproval || 0) < 35) warnings.push('Aprovação da diretoria baixa para novas negociações.');
  return {name:'budget-guard', status:errors.length?'error':'ok', errors, warnings, budget, wageRoom};
}
