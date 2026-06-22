import { buildGuidedTutorialSnapshot, validateGuidedTutorialSnapshot } from '../../js/systems/guidedTutorialEngine.js';
export function validateGuidedTutorialSystem(state={}){
  const snap = buildGuidedTutorialSnapshot(state);
  return validateGuidedTutorialSnapshot(snap);
}
