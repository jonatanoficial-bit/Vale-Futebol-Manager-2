import { buildDataPack2026Snapshot } from '../../js/systems/dataPack2026Engine.js';

export function validateDataPack2026System(state={}){
  const snap = buildDataPack2026Snapshot(state);
  const errors = [];
  const warnings = [];
  if(snap.lockDate !== '2026-05-20') errors.push('lock-date-invalid');
  if(!snap.paths?.brazilSerieA?.includes('serie-a/{clubId}.json')) errors.push('serie-a-path-invalid');
  if(!snap.paths?.brazilSerieB?.includes('serie-b/{clubId}.json')) errors.push('serie-b-path-invalid');
  if(snap.totals.brazilSerieA !== 20) warnings.push(`serie-a-count:${snap.totals.brazilSerieA}`);
  if(snap.totals.brazilSerieB !== 20) warnings.push(`serie-b-count:${snap.totals.brazilSerieB}`);
  if(snap.requiredFields.length < 12) errors.push('required-fields-too-small');
  return { status: errors.length ? 'fail' : 'ok', errors, warnings, qualityGate:snap.qualityGate, lockDate:snap.lockDate, blockedClubs:snap.totals.blockedClubs, genericTotal:snap.totals.genericTotal };
}
