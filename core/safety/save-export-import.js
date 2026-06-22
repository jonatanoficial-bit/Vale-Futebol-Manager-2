import { exportEnvelopeText, validateSavePayload } from '../../js/systems/saveManager.js';
export function validateSaveExportImport(state={}){
  const text = exportEnvelopeText(state);
  const validation = validateSavePayload(text);
  return { ok:validation.ok, validator:'save-export-import', bytes:text.length, errors:validation.errors, warnings:validation.warnings };
}
