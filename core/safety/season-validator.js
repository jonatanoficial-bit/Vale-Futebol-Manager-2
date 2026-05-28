import { validateBrazilianSeasonSystem, validateLeagueSeasonIntegrity, BRAZILIAN_SEASON_RULES } from '../../js/systems/seasonEngine.js';

export function validateSeasonLight(state = {}){
  const errors = [];
  const warnings = [];
  if(!state.season) warnings.push('Temporada ausente; fallback visual será usado.');
  if(!state.career?.matchday) warnings.push('Rodada atual ausente; normalização será usada.');
  const leagueId = state.match?.competitionId || (state.clubId ? undefined : 'brasileirao-a');
  const national = validateBrazilianSeasonSystem();
  if(national.status !== 'ok') errors.push(...national.errors);
  const active = validateLeagueSeasonIntegrity(leagueId || 'brasileirao-a');
  if(active.status !== 'ok') errors.push(...active.errors);
  warnings.push(`Sistema brasileiro validado: ${national.totalRounds} rodadas totais e ${national.totalFixtures} jogos Série A/B.`);
  warnings.push(`Regra ativa: Série A com ${BRAZILIAN_SEASON_RULES.leagues['brasileirao-a'].rounds} rodadas, 4 rebaixados, 5 Libertadores e 6º-12º Sul-Americana.`);
  return {name:'season-v400', status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings, national};
}
