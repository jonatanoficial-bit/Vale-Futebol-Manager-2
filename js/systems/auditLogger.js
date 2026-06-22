const storageKey = 'vfm_gold_audit_log_v251';

export function auditLog(event='boot', payload={}){
  try {
    const row = {event, payload, at:new Date().toISOString(), version:'v3.5.0'};
    const current = JSON.parse(localStorage.getItem(storageKey) || '[]');
    current.push(row);
    localStorage.setItem(storageKey, JSON.stringify(current.slice(-50)));
    return row;
  } catch(err){
    console.warn('[VFM Audit] log indisponivel', err);
    return {event, payload, at:'offline', version:'v3.5.0'};
  }
}

export function runRuntimeAudit(state={}, assetSummary={}){
  const checks = [
    ['estado', !!state && !!state.manager && !!state.match],
    ['rotas', !!state.route || state.route === 'cover'],
    ['save', typeof localStorage !== 'undefined'],
    ['assets', !!assetSummary],
    ['mobile', typeof window !== 'undefined' && window.innerWidth > 0]
  ];
  const failed = checks.filter(([,ok])=>!ok).map(([name])=>name);
  return auditLog('runtime-audit', {status: failed.length ? 'atenção' : 'ok', failed, checks: checks.map(([name,ok])=>({name, ok}))});
}
