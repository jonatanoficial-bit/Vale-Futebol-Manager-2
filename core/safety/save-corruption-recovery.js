import { readAutoBackup } from '../../js/systems/saveManager.js';
export function validateSaveCorruptionRecovery(){
  let hasRecovery = false;
  try { hasRecovery = !!readAutoBackup(); } catch(err){ hasRecovery = false; }
  return { ok:true, validator:'save-corruption-recovery', hasRecovery, fallback:'default-state-safe-mode' };
}
