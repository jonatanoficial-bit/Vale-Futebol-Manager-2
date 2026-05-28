import { validateDataIntegrity } from './data-validator.js';
import { validateRoutes } from './route-validator.js';
import { validateAssets } from './asset-validator.js';
import { createSafetySnapshot, recordSafetyEvent } from './dev-diagnostics.js';
import { validateKnockoutIntegrity } from './knockout-validator.js';
import { validateDrawSafety } from './draw-validator.js';
import { validateMatchEngineV470, runMatchEngineStressGate } from './match-engine-validator.js';

export const VFM_DEV_MODE = false;

export async function runBootSafety({ state, routes = [], assetMap = null, buildInfo = {} } = {}){
  const startedAt = new Date().toISOString();
  const checks = [
    validateDataIntegrity(state),
    validateRoutes(routes),
    validateAssets(assetMap),
    validateKnockoutIntegrity(),
    validateDrawSafety(),
    validateMatchEngineV470(state),
    runMatchEngineStressGate(state, 100)
  ];
  const errors = checks.flatMap(x => x.errors || []);
  const warnings = checks.flatMap(x => x.warnings || []);
  const snapshot = createSafetySnapshot({
    stage:'boot',
    build:buildInfo?.version || buildInfo?.buildLabel || 'v4.7.0',
    startedAt,
    finishedAt:new Date().toISOString(),
    checks,
    errors,
    warnings,
    status: errors.length ? 'safe-mode' : warnings.length ? 'ok-with-warnings' : 'ok'
  });
  recordSafetyEvent('boot-safety', snapshot);
  if(VFM_DEV_MODE) console.table(checks.map(c => ({check:c.name, status:c.status, errors:c.errors?.length || 0, warnings:c.warnings?.length || 0})));
  return snapshot;
}

export function safeExecute(label, fn, fallback){
  try { return fn(); }
  catch(error){
    recordSafetyEvent('safe-execute-recovery', {label, message:error?.message || String(error)});
    return typeof fallback === 'function' ? fallback(error) : fallback;
  }
}
