import { simulateMatchStressTest } from '../../js/systems/matchEngine.js';

export function validateMatchEngineV470(state = {}){
  const errors = [];
  const warnings = [];
  const match = state.match || {};
  if(!match.home || !match.away) errors.push('Partida sem mandante/visitante.');
  if(Number(match.minute || 1) < 1 || Number(match.minute || 1) > 90) errors.push('Minuto da partida fora do intervalo seguro 1-90.');
  if(!Array.isArray(match.substitutions)) warnings.push('Lista de substituições será normalizada.');
  if(Number(match.maxSubs || 5) < 3 || Number(match.maxSubs || 5) > 5) warnings.push('Limite de substituições será ajustado para 3-5.');
  return {name:'match-engine-v470-validator', status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings};
}

export function runMatchEngineStressGate(state = {}, iterations = 100){
  const result = simulateMatchStressTest(iterations, state);
  return {name:'match-engine-v470-stress-gate', status:result.errors?.length?'error':'ok', errors:result.errors || [], warnings:[], details:result};
}
