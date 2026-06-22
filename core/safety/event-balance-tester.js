export function validateEventBalance(snapshot = {}){
  const errors = [];
  const warnings = [];
  const stats = snapshot.stats || {};
  const goals = Number(snapshot.score?.home || 0) + Number(snapshot.score?.away || 0);
  const shots = Number(stats.shots?.[0] || 0) + Number(stats.shots?.[1] || 0);
  const xg = Number(stats.xg?.[0] || 0) + Number(stats.xg?.[1] || 0);
  if(shots < goals) errors.push('Mais gols que chutes: estatística inválida.');
  if(xg > 8.8) warnings.push('xG muito alto; revisar balanceamento se recorrente.');
  if(goals > 10) warnings.push('Placar extremo detectado; aceitável apenas como exceção.');
  return {name:'event-balance-v470', status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings};
}
