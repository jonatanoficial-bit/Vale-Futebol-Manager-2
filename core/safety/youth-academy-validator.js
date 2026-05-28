import { buildTrainingSnapshot } from '../../js/systems/trainingEngine.js';
export function validateYouthAcademyProgression(state={}){
  const snap = buildTrainingSnapshot(state); const issues=[];
  if(!Array.isArray(snap.academyProspects) || snap.academyProspects.length<3) issues.push('academy-prospects-missing');
  snap.academyProspects.forEach(p=>{ if(!p.name||!p.pos||p.potential<50) issues.push(`academy-invalid:${p.name||'unknown'}`); });
  return {ok:issues.length===0, issues, prospects:snap.academyProspects.length, ready:snap.academyProspects.filter(p=>p.readiness>=78).length};
}
export default validateYouthAcademyProgression;
