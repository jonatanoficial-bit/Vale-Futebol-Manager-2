import { validateRosterPackage2026 } from '../../js/systems/dataPack2026Engine.js';

export function blockGenericRosterForRelease(pkg={}, options={}){
  const validation = validateRosterPackage2026(pkg, options);
  const blocked = validation.genericCount > 0 || validation.errors.length > 0;
  return {
    status: blocked ? 'blocked' : 'ready',
    blocked,
    genericCount: validation.genericCount,
    errors: validation.errors,
    missingFields: validation.missingFields,
    message: blocked ? 'Elenco bloqueado para Release Candidate: contém genéricos, campos ausentes ou jogadores insuficientes.' : 'Elenco aprovado para Release Candidate.'
  };
}
