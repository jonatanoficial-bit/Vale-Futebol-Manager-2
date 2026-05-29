
import { buildRosterLock2026Snapshot } from '../../js/systems/rosterLock2026Engine.js';

export function validateRosterLock2026(state={}){
  const snap = buildRosterLock2026Snapshot(state);
  const errors = [];
  if(snap.groups.serieA.ready !== 20) errors.push(`serie-a:${snap.groups.serieA.ready}/20`);
  if(snap.groups.serieB.ready !== 20) errors.push(`serie-b:${snap.groups.serieB.ready}/20`);
  if(snap.groups.conmebol.ready < 16) errors.push(`conmebol:${snap.groups.conmebol.ready}/16`);
  if(snap.groups.world.ready < 28) errors.push(`world:${snap.groups.world.ready}/28`);
  if(snap.groups.national.ready < 16) errors.push(`national:${snap.groups.national.ready}/16`);
  if(snap.totals.totalGeneric > 0) errors.push(`generic:${snap.totals.totalGeneric}`);
  if(snap.totals.totalIssues > 0) errors.push(`issues:${snap.totals.totalIssues}`);
  return {
    status: errors.length ? 'blocked' : 'ready',
    errors,
    releaseCandidateReady: snap.releaseCandidateReady,
    totals: snap.totals,
    groups: snap.groups
  };
}
