
import { brazilContinentalQualifiers } from '../../js/systems/worldCompetitionEngine.js';

export function validateQualificationSafety(state={}){
  const q = brazilContinentalQualifiers(state);
  const errors = [];
  const seen = new Set();
  q.libertadores.concat(q.sulamericana).forEach(team=>{
    if(seen.has(team.id)) errors.push(`Clube duplicado entre vagas continentais: ${team.name}`);
    seen.add(team.id);
  });
  if(q.libertadores.length < 5) errors.push('Libertadores com menos de 5 vagas brasileiras.');
  if(q.sulamericana.length < 7) errors.push('Sul-Americana com menos de 7 vagas brasileiras.');
  if(!q.cupChampion?.id) errors.push('Campeão da Copa do Brasil não encontrado para vaga protegida.');
  return {version:'v4.2.0', status:errors.length?'error':'ok', errors, libertadores:q.libertadores.map(t=>t.name), sulamericana:q.sulamericana.map(t=>t.name), cupChampion:q.cupChampion?.name};
}
