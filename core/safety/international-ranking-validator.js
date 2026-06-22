import { buildIntercontinentalSnapshot } from '../../js/systems/worldCompetitionEngine.js';

export function validateInternationalRankingImpact(state={}){
  const snapshot = buildIntercontinentalSnapshot(state);
  const errors=[];
  const warnings=[];
  const championBonus = Number(snapshot.reputationImpact?.championBonus || 0);
  const runnerUpBonus = Number(snapshot.reputationImpact?.runnerUpBonus || 0);
  if(championBonus <= runnerUpBonus) errors.push('Bônus do campeão mundial precisa ser maior que o do vice.');
  if(!snapshot.reputationImpact?.globalHeadline) errors.push('Headline global ausente.');
  if(!errors.length) warnings.push(`Reputação global validada para ${snapshot.champion.name}: +${championBonus}.`);
  return {scope:'international-ranking-v4.3.0', status:errors.length?'error':'ok', errors, warnings, champion:snapshot.champion, runnerUp:snapshot.runnerUp};
}
