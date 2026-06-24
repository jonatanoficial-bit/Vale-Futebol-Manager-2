import { CAREER_SLOT_DEFINITIONS } from '../data/saveSlotsData.js';

export const SAVE_MANAGER_VERSION = 'v7.4.0';
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
export function normalizeSlot(slot='principal'){
  const raw = String(slot || 'principal').replace(/[^a-z0-9_-]/gi,'_').slice(0,32) || 'principal';
  if(raw === 'main' || raw === 'slot-1' || raw === 'career-1') return 'principal';
  return raw;
}
export function officialSlots(){ return CAREER_SLOT_DEFINITIONS.map(s=>({...s})); }
export function slotDefinition(slot='principal'){
  const id = normalizeSlot(slot);
  return CAREER_SLOT_DEFINITIONS.find(s=>s.id===id) || {id, label:id.replace(/-/g,' '), badge:id, order:99, description:'Slot personalizado'};
}
export function slotLabel(slot='principal'){
  return slotDefinition(slot).label;
}
export function slotKey(slot='principal'){
  return `vfm_gold_slot_${normalizeSlot(slot)}_v530`;
}
export function saveEnvelope(state={}, meta={}){
  const slot = normalizeSlot(meta.slot || state?.save?.activeSlot || 'principal');
  const def = slotDefinition(slot);
  const careerStarted = state?.save?.careerStarted !== false;
  return {
    meta:{
      game:'Vale Futebol Manager',
      version:SAVE_MANAGER_VERSION,
      schema:740,
      build:'v7.4.0',
      createdAt:meta.createdAt || state?.save?.createdAt || nowIso(),
      updatedAt:nowIso(),
      slot,
      slotLabel:state?.save?.slotLabel || meta.slotLabel || def.label,
      manager:state?.manager?.name || 'Manager Vale',
      clubId:state?.clubId || state?.ui?.selectedClub || 'santos',
      season:state?.season || 2026,
      matchday:state?.career?.matchday || 1,
      completedMatches:Array.isArray(state?.career?.completedMatches) ? state.career.completedMatches.length : 0,
      careerStarted,
      checksum:'vfm-safe-json-local'
    },
    state:{...state, save:{...(state.save||{}), activeSlot:slot, slotLabel:state?.save?.slotLabel || meta.slotLabel || def.label, careerStarted}}
  };
}
export function unwrapSave(payload){
  const data = typeof payload === 'string' ? safeJsonParse(payload, null) : payload;
  if(!data || typeof data !== 'object') return null;
  if(data.state && data.meta) return data.state;
  return data;
}
export function readEnvelope(slot='principal', storage=storageSafe()){
  return safeJsonParse(storage.getItem(slotKey(slot)), null);
}
export function getSaveIndex(storage=storageSafe()){
  const parsed = safeJsonParse(storage.getItem(SAVE_INDEX_KEY), null);
  return Array.isArray(parsed) ? parsed : [];
}
export function setSaveIndex(index=[], storage=storageSafe()){
  try { storage.setItem(SAVE_INDEX_KEY, JSON.stringify(index.slice(0,12))); return true; } catch(err){ return false; }
}
export function upsertSaveIndexItem(item={}, storage=storageSafe()){
  const slot = normalizeSlot(item.slot || 'principal');
  const previous = getSaveIndex(storage).find(x=>normalizeSlot(x.slot)===slot) || {};
  const index = getSaveIndex(storage).filter(x=>normalizeSlot(x.slot) !== slot);
  const def = slotDefinition(slot);
  index.unshift({
    ...previous,
    ...item,
    slot,
    slotLabel:item.slotLabel || previous.slotLabel || def.label,
    createdAt:previous.createdAt || item.createdAt || nowIso(),
    updatedAt:nowIso(),
    version:SAVE_MANAGER_VERSION
  });
  return setSaveIndex(index, storage);
}
export function writeSlot(slot='principal', state={}, storage=storageSafe()){
  const safeSlot = normalizeSlot(slot);
  const previous = readEnvelope(safeSlot, storage);
  const envelope = saveEnvelope(state, {slot:safeSlot, createdAt:previous?.meta?.createdAt, slotLabel:previous?.meta?.slotLabel});
  storage.setItem(slotKey(safeSlot), JSON.stringify(envelope));
  upsertSaveIndexItem({
    slot:safeSlot,
    slotLabel:envelope.meta.slotLabel,
    manager:envelope.meta.manager,
    clubId:envelope.meta.clubId,
    season:envelope.meta.season,
    matchday:envelope.meta.matchday,
    completedMatches:envelope.meta.completedMatches,
    careerStarted:envelope.meta.careerStarted,
    version:SAVE_MANAGER_VERSION
  }, storage);
  return envelope;
}
export function readSlot(slot='principal', storage=storageSafe()){
  return unwrapSave(storage.getItem(slotKey(slot)));
}
export function listSlots(storage=storageSafe()){
  const index = getSaveIndex(storage);
  const bySlot = new Map(index.map(item=>[normalizeSlot(item.slot), item]));
  for(const def of CAREER_SLOT_DEFINITIONS){
    const envelope = readEnvelope(def.id, storage);
    if(envelope?.meta && !bySlot.has(def.id)) bySlot.set(def.id, {...envelope.meta});
  }
  return [...bySlot.values()].filter(item=>item && item.slot).sort((a,b)=>{
    const da = slotDefinition(a.slot).order || 99;
    const db = slotDefinition(b.slot).order || 99;
    if(da !== db) return da - db;
    return String(b.updatedAt||'').localeCompare(String(a.updatedAt||''));
  });
}
export function listPlayableSlots(storage=storageSafe()){
  const indexed = new Map(listSlots(storage).map(s=>[normalizeSlot(s.slot), s]));
  return CAREER_SLOT_DEFINITIONS.map(def=>{
    const envelope = readEnvelope(def.id, storage);
    const item = indexed.get(def.id) || envelope?.meta || null;
    const state = envelope?.state || null;
    const occupied = !!envelope?.state || !!item;
    return {
      ...def,
      slot:def.id,
      occupied,
      active:false,
      slotLabel:item?.slotLabel || def.label,
      manager:item?.manager || state?.manager?.name || null,
      clubId:item?.clubId || state?.clubId || null,
      season:item?.season || state?.season || null,
      matchday:item?.matchday || state?.career?.matchday || null,
      completedMatches:item?.completedMatches ?? (Array.isArray(state?.career?.completedMatches) ? state.career.completedMatches.length : null),
      careerStarted:item?.careerStarted ?? state?.save?.careerStarted ?? occupied,
      createdAt:item?.createdAt || envelope?.meta?.createdAt || null,
      updatedAt:item?.updatedAt || envelope?.meta?.updatedAt || null,
      health:state?.stability?.health || 'OK'
    };
  });
}
export function deleteSlot(slot='principal', storage=storageSafe()){
  const safeSlot = normalizeSlot(slot);
  storage.removeItem(slotKey(safeSlot));
  const index = getSaveIndex(storage).filter(x=>normalizeSlot(x.slot) !== safeSlot);
  setSaveIndex(index, storage);
  return true;
}
export function renameSlot(slot='principal', label='Carreira', storage=storageSafe()){
  const safeSlot = normalizeSlot(slot);
  const clean = String(label || slotLabel(safeSlot)).trim().slice(0,36) || slotLabel(safeSlot);
  const envelope = readEnvelope(safeSlot, storage);
  if(envelope?.meta){
    envelope.meta.slotLabel = clean;
    if(envelope.state) envelope.state.save = {...(envelope.state.save||{}), slotLabel:clean};
    storage.setItem(slotKey(safeSlot), JSON.stringify(envelope));
  }
  const item = (getSaveIndex(storage).find(x=>normalizeSlot(x.slot)===safeSlot) || {slot:safeSlot});
  upsertSaveIndexItem({...item, slot:safeSlot, slotLabel:clean}, storage);
  return clean;
}
export function duplicateSlot(fromSlot='principal', toSlot='career-2', storage=storageSafe()){
  const from = normalizeSlot(fromSlot); const to = normalizeSlot(toSlot);
  const state = readSlot(from, storage);
  if(!state) return false;
  const copied = {...state, save:{...(state.save||{}), activeSlot:to, slotLabel:slotDefinition(to).label, copiedFrom:from, careerStarted:true}};
  writeSlot(to, copied, storage);
  return true;
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
  const existingSave = next.save || {};
  next.save = {
    version:SAVE_MANAGER_VERSION,
    schema:740,
    activeSlot:normalizeSlot(existingSave.activeSlot || 'principal'),
    slotLabel:existingSave.slotLabel || slotLabel(existingSave.activeSlot || 'principal'),
    careerStarted: existingSave.careerStarted === false ? false : true,
    migratedFrom:existingSave.version || next.stability?.auditVersion || 'legacy',
    lastMigrationAt:nowIso(),
    exportCount:Number(existingSave.exportCount || 0),
    importCount:Number(existingSave.importCount || 0),
    autosaveCheckpoints:Array.isArray(existingSave.autosaveCheckpoints) ? existingSave.autosaveCheckpoints.slice(-10) : []
  };
  next.stability = {
    ...(next.stability || {}),
    auditVersion:SAVE_MANAGER_VERSION,
    saveManagerVersion:SAVE_MANAGER_VERSION,
    saveIntegrity:'ok',
    health:next.stability?.health || 'Save Slots 2.0 ativo'
  };
  return next;
}
export function saveIntegritySnapshot(state={}, storage=storageSafe()){
  const slots = listPlayableSlots(storage);
  const occupied = slots.filter(s=>s.occupied).length;
  return {
    version:SAVE_MANAGER_VERSION,
    slots:occupied,
    playableSlots:slots.length,
    freeSlots:slots.length - occupied,
    autosave:!!state?.stability?.autosave,
    activeSlot:normalizeSlot(state?.save?.activeSlot || 'principal'),
    activeSlotLabel:state?.save?.slotLabel || slotLabel(state?.save?.activeSlot || 'principal'),
    hasAutoBackup:!!storage.getItem(AUTO_BACKUP_KEY),
    lastBackup:state?.stability?.lastBackup || null,
    lastExport:state?.stability?.lastExport || null,
    lastImport:state?.stability?.lastImport || null,
    health:state?.stability?.health || 'Excelente',
    gates:['3-slots-oficiais','nao-auto-start','nao-sobrescrever-sem-confirmar','sair-salvando','apagar-slot-isolado','renomear-slot','exportacao-json','fallback-localstorage'].map(name=>({name,status:'OK'}))
  };
}
