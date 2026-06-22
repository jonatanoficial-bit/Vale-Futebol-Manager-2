import { buildTrainingSnapshot, simulateDevelopmentCycle } from '../../js/systems/trainingEngine.js';
export function validateTrainingSystem(state={}){
  const issues=[]; const snap = buildTrainingSnapshot(state);
  if(!snap.theme?.id) issues.push('training-theme-missing');
  if(snap.squadSize < 11) issues.push('training-squad-too-small');
  if(snap.readiness < 0 || snap.readiness > 100) issues.push('readiness-out-of-range');
  if(snap.injuryRisk < 0 || snap.injuryRisk > 100) issues.push('injury-risk-out-of-range');
  if(!Array.isArray(snap.progress) || snap.progress.length < 3) issues.push('development-focus-missing');
  const stress = simulateDevelopmentCycle(state, 4);
  if(!stress.ok || stress.injuryRisk > 90) issues.push('training-stress-risk');
  return {ok:issues.length===0, issues, version:snap.version, readiness:snap.readiness, injuryRisk:snap.injuryRisk, stress};
}
export default validateTrainingSystem;
