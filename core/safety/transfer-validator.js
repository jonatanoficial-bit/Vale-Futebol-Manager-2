import { validateTransferIntegrity, buildTransferSnapshot, TRANSFER_ENGINE_VERSION } from '../../js/systems/transferEngine.js';

export function validateTransferSystem(state={}){
  const integrity = validateTransferIntegrity(state);
  const snapshot = buildTransferSnapshot(state);
  return {
    name:'transfer-validator',
    version:TRANSFER_ENGINE_VERSION,
    status:integrity.status,
    errors:integrity.errors,
    warnings:integrity.warnings,
    snapshot
  };
}
