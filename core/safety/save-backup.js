import { saveIntegritySnapshot } from '../../js/systems/saveManager.js';
export function validateSaveBackup(state={}){
  const snap = saveIntegritySnapshot(state);
  return { ok:true, validator:'save-backup', version:snap.version, slots:snap.slots, hasAutoBackup:snap.hasAutoBackup };
}
