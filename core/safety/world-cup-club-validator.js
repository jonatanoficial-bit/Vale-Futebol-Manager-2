import { buildIntercontinentalSnapshot, validateIntercontinentalIntegrity } from '../../js/systems/worldCompetitionEngine.js';

export function validateWorldClubCup(state={}){
  const snapshot = buildIntercontinentalSnapshot(state);
  const validation = validateIntercontinentalIntegrity(snapshot);
  return {
    scope:'world-club-cup-v4.3.0',
    status:validation.status,
    errors:validation.errors,
    warnings:validation.warnings,
    checks:{
      libertadoresChampion:Boolean(snapshot.participants?.libertadoresChampion?.id),
      uefaReference:Boolean(snapshot.participants?.uefaChampion?.id),
      rounds:snapshot.rounds?.length || 0,
      champion:Boolean(snapshot.champion?.id),
      financialImpact:Number(snapshot.financialImpact?.championPrize || 0) > 0,
      reputationImpact:Number(snapshot.reputationImpact?.championBonus || 0) > 0
    }
  };
}
