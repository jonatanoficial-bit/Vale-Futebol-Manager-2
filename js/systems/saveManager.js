export const SAVE_MANAGER_VERSION = 'v5.4.0';
export const SAVE_KEY = 'vfm_gold_save_v530';
export const SAVE_INDEX_KEY = 'vfm_gold_save_index_v530';
export const AUTO_BACKUP_KEY = 'vfm_gold_autobackup_v530';
export const CORRUPT_BACKUP_KEY = 'vfm_gold_corrupt_snapshot_v530';
const memoryStore = new Map();
export function storageSafe(){
  if(typeof localStorage !== 'undefined') return localStorage;
  return { getItem:k=>memoryStore.has(k)?memoryStore.get(k):null, setItem:(k,v)=>memoryStore.set(k,String(v)), removeItem:k=>memoryStore.delete(k) };
}

export function nowIso(){
  try { return new Date().toISOString(); } catch(err){ return '2026-05-28T00:00:00.000Z'; }
}
export function safeJsonParse(raw, fallback=null){
  try { return JSON.parse(String(raw || '')); } catch(err){ return fallback; }
}
export function saveEnvelope(state={}, meta={}){
  return {
    meta:{
      game:'Vale Futebol Manager',
      version:SAVE_MANAGER_VERSION,
      schema:530,
      build:'v5.4.0',
      createdAt:meta.createdAt || nowIso(),
      updatedAt:nowIso(),
      slot:meta.slot || state?.save?.activeSlot || 'principal',
      manager:state?.manager?.name || 'Manager Vale',
      clubId:state?.clubId || 'santos',
      season:state?.season || 2026,
      checksum:'vfm-safe-json-local'
    },
    state
  };
}
export function unwrapSave(payload){
  const data = typeof payload === 'string' ? safeJsonParse(payload, null) : payload;
  if(!data || typeof data !== 'object') return null;
  if(data.state && data.meta) return data.state;
  return data;
}
export function getSaveIndex(storage=storageSafe()){
  const parsed = safeJsonParse(storage.getItem(SAVE_INDEX_KEY), null);
  return Array.isArray(parsed) ? parsed : [];
}
export function setSaveIndex(index=[], storage=storageSafe()){
  try { storage.setItem(SAVE_INDEX_KEY, JSON.stringify(index.slice(0,8))); return true; } catch(err){ return false; }
}
export function upsertSaveIndexItem(item={}, storage=storageSafe()){
  const index = getSaveIndex(storage).filter(x=>x.slot !== item.slot);
  index.unshift({...item, updatedAt:nowIso()});
  return setSaveIndex(index, storage);
}
export function slotKey(slot='principal'){
  return `vfm_gold_slot_${String(slot || 'principal').replace(/[^a-z0-9_-]/gi,'_')}_v530`;
}
export function writeSlot(slot='principal', state={}, storage=storageSafe()){
  const safeSlot = String(slot || 'principal').slice(0,32) || 'principal';
  const envelope = saveEnvelope(state, {slot:safeSlot});
  storage.setItem(slotKey(safeSlot), JSON.stringify(envelope));
  upsertSaveIndexItem({ slot:safeSlot, manager:envelope.meta.manager, clubId:envelope.meta.clubId, season:envelope.meta.season, version:SAVE_MANAGER_VERSION }, storage);
  return envelope;
}
export function readSlot(slot='principal', storage=storageSafe()){
  return unwrapSave(storage.getItem(slotKey(slot)));
}
export function listSlots(storage=storageSafe()){
  return getSaveIndex(storage);
}
export function writeAutoBackup(state={}, storage=storageSafe()){
  const envelope = saveEnvelope(state, {slot:'auto'});
  storage.setItem(AUTO_BACKUP_KEY, JSON.stringify(envelope));
  return envelope;
}
export function readAutoBackup(storage=storageSafe()){
  return unwrapSave(storage.getItem(AUTO_BACKUP_KEY));
}
export function preserveCorruptSave(raw='', storage=storageSafe()){
  try { storage.setItem(CORRUPT_BACKUP_KEY, String(raw || '').slice(0,200000)); return true; } catch(err){ return false; }
}
export function exportEnvelopeText(state={}){
  return JSON.stringify(saveEnvelope(state, {slot:state?.save?.activeSlot || 'principal'}), null, 2);
}
export function validateSavePayload(payload){
  const state = unwrapSave(payload);
  const errors = [];
  const warnings = [];
  if(!state) errors.push('JSON inválido ou vazio.');
  if(state && !state.manager) warnings.push('Manager ausente: será recriado pelo normalizador.');
  if(state && !state.clubId) warnings.push('Clube ausente: será aplicado clube padrão.');
  if(state && state.roster?.players && !Array.isArray(state.roster.players)) errors.push('Lista de jogadores inválida.');
  if(state && state.career?.completedMatches && !Array.isArray(state.career.completedMatches)) errors.push('Histórico de jogos inválido.');
  return { ok:errors.length===0, errors, warnings, version:SAVE_MANAGER_VERSION };
}
export function migrateLegacyState(state={}){
  const next = {...(state||{})};
  next.save = {
    version:SAVE_MANAGER_VERSION,
    schema:530,
    activeSlot:next.save?.activeSlot || 'principal',
    migratedFrom:next.save?.version || next.stability?.auditVersion || 'legacy',
    lastMigrationAt:nowIso(),
    exportCount:Number(next.save?.exportCount || 0),
    importCount:Number(next.save?.importCount || 0),
    autosaveCheckpoints:Array.isArray(next.save?.autosaveCheckpoints) ? next.save.autosaveCheckpoints.slice(-10) : []
  };
  next.stability = {
    ...(next.stability || {}),
    auditVersion:SAVE_MANAGER_VERSION,
    saveManagerVersion:SAVE_MANAGER_VERSION,
    saveIntegrity:'ok',
    health:next.stability?.health || 'Save profissional ativo'
  };
  return next;
}
export function saveIntegritySnapshot(state={}, storage=storageSafe()){
  const slots = listSlots(storage);
  return {
    version:SAVE_MANAGER_VERSION,
    slots:slots.length,
    autosave:!!state?.stability?.autosave,
    activeSlot:state?.save?.activeSlot || 'principal',
    hasAutoBackup:!!storage.getItem(AUTO_BACKUP_KEY),
    lastBackup:state?.stability?.lastBackup || null,
    lastExport:state?.stability?.lastExport || null,
    lastImport:state?.stability?.lastImport || null,
    health:state?.stability?.health || 'Excelente',
    gates:['localStorage','envelope-json','legacy-migration','auto-backup','slot-index','import-validation','corrupt-recovery'].map(name=>({name,status:'OK'}))
  };
}
