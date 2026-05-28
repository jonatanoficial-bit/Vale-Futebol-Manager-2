import { renewalTargets } from '../../js/data/transferData.js';

export function validateContractNegotiations(state={}){
  const transfer = state.transfer || {};
  const errors = [];
  const warnings = [];
  const renewalIds = new Set((transfer.renewals || []).map(r=>r.id));
  const duplicatedRenewals = (transfer.renewals || []).filter((r,i,arr)=>arr.findIndex(x=>x.id===r.id)!==i).map(r=>r.id);
  if(duplicatedRenewals.length) errors.push(`Renovações duplicadas: ${duplicatedRenewals.join(', ')}`);
  renewalTargets.forEach(r=>{ if(Number(r.demand || 0) <= 0) warnings.push(`Demanda salarial inválida para ${r.player}`); });
  if(Number(transfer.wageRoom || 0) < 0) errors.push('Folha salarial negativa após negociação.');
  return {name:'contract-negotiation-validator', status:errors.length?'error':'ok', errors, warnings, renewed:renewalIds.size};
}
