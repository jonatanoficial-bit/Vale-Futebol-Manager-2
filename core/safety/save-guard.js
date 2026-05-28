export function readSafeJSON(raw, fallback = null){
  try { return JSON.parse(raw); } catch(_){ return fallback; }
}

export function writeSafeJSON(key, value){
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch(error){ console.warn('[VFM SaveGuard] gravação recusada', error); return false; }
}
