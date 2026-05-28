import { buildCopaDoBrasilBracket } from '../../js/systems/copaDoBrasilEngine.js';

export function recoverCupState(cupState){
  if(cupState && Array.isArray(cupState.stages) && cupState.stages.length) return cupState;
  return buildCopaDoBrasilBracket();
}
