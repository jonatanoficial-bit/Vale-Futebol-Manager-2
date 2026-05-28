const DIAG_KEY = 'vfm_gold_dev_diagnostics_v390';

export function createSafetySnapshot(payload = {}){
  return { ...payload, schema:'vfm-safety-snapshot-v1' };
}

export function recordSafetyEvent(event, payload = {}){
  try {
    const row = {event, payload, at:new Date().toISOString()};
    const current = JSON.parse(localStorage.getItem(DIAG_KEY) || '[]');
    current.push(row);
    localStorage.setItem(DIAG_KEY, JSON.stringify(current.slice(-80)));
    return row;
  } catch(error){
    console.warn('[VFM Diagnostics] indisponível', error);
    return {event, payload, at:'offline'};
  }
}

export function getDevDiagnostics(){
  try { return JSON.parse(localStorage.getItem(DIAG_KEY) || '[]'); }
  catch(_){ return []; }
}
