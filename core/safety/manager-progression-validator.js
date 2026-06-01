import { buildManagerProgressionSnapshot, normalizeManagerProgression } from '../../js/systems/managerProgressionEngine.js';
export function validateManagerProgressionSystem(state={}){
  const errors=[]; const warnings=[];
  const p = normalizeManagerProgression(state);
  const snap = buildManagerProgressionSnapshot(state);
  if(!p.version) errors.push('Versão da progressão ausente.');
  if(!Number.isFinite(Number(p.xp)) || Number(p.xp)<0) errors.push('XP inválido.');
  if(!Number.isFinite(Number(p.level)) || Number(p.level)<1 || Number(p.level)>10) errors.push('Nível do treinador inválido.');
  if(!p.license) errors.push('Licença do treinador ausente.');
  if(!Array.isArray(p.unlockedSpecialties)) errors.push('Especialidades desbloqueadas inválidas.');
  if(!Array.isArray(p.history)) warnings.push('Histórico de XP não encontrado.');
  if(!snap.availableSpecialties?.length) errors.push('Especialidades não renderizadas.');
  return { status: errors.length ? 'error' : 'ok', errors, warnings, level:p.level, xp:p.xp, license:p.license, ranking:snap.ranking, specialties:snap.availableSpecialties.length };
}
