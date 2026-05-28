import { SAVE_MANAGER_VERSION, validateSavePayload } from '../../js/systems/saveManager.js';
export function validateSaveMigration(payload={}){
  const report = validateSavePayload(payload);
  return { ...report, validator:'save-migration', target:SAVE_MANAGER_VERSION };
}
