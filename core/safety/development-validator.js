import { buildTrainingSnapshot } from '../../js/systems/trainingEngine.js';
export function validateDevelopmentProgression(state={}){
  const snap = buildTrainingSnapshot(state); const issues=[];
  snap.progress.forEach(p=>{ if(p.progress<0||p.progress>100) issues.push(`progress-invalid:${p.player}`); });
  if(snap.youthGrowth < 20) issues.push('youth-growth-too-low');
  if(snap.veteranDeclineRisk > 85) issues.push('veteran-decline-critical');
  return {ok:issues.length===0, issues, youthGrowth:snap.youthGrowth, veteranDeclineRisk:snap.veteranDeclineRisk, tracked:snap.progress.length};
}
export default validateDevelopmentProgression;
