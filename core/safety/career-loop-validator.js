import { buildCareerMissions, careerLoopSnapshot, buildSeasonEndSummary } from '../../js/systems/careerProgressionEngine.js';

export function validateCareerLoopV592(state={}){
  const errors=[]; const warnings=[];
  const snap = careerLoopSnapshot(state);
  const missions = buildCareerMissions(state);
  if(!Number.isFinite(snap.reputation)) errors.push('Reputação do usuário inválida.');
  if(snap.reputation < 1 || snap.reputation > 100) errors.push('Reputação fora da faixa 1-100.');
  if(missions.length < 6) errors.push('Missões/tutorial insuficientes para engajamento.');
  if(!Array.isArray(state.career?.seasonHistory)) warnings.push('Histórico de temporadas será inicializado no normalize.');
  if(!Array.isArray(state.career?.activeStory)) warnings.push('Linha narrativa será inicializada no normalize.');
  const end = buildSeasonEndSummary(state);
  if(!end.clubId || !end.leagueId) errors.push('Resumo de fim de temporada não identifica clube/liga.');
  return {version:'v5.9.2', status:errors.length?'error':'ok', errors, warnings, snapshot:snap, missions:missions.length};
}
