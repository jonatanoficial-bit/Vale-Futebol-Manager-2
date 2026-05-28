export function validatePostMatchFlow(match = {}, career = {}){
  const errors = [];
  const warnings = [];
  if(match.finalized && !match.postMatchReady) warnings.push('Partida finalizada sem flag postMatchReady.');
  if(match.finalized && !match.postMatchReport) warnings.push('Relatório pós-jogo será reconstruído pela tela.');
  if(match.finalized && !Array.isArray(career.completedMatches)) errors.push('Histórico de partidas concluídas inválido.');
  return {name:'post-match-flow', status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings};
}
