import { buildCopaDoBrasilBracket, validateCopaDoBrasilIntegrity } from '../../js/systems/copaDoBrasilEngine.js';

export function validateKnockoutIntegrity(){
  const bracket = buildCopaDoBrasilBracket();
  return validateCopaDoBrasilIntegrity(bracket);
}
