import { buildMay2026DatabaseSnapshot, buildMay2026RosterForClub, normalizeMay2026Player } from '../../js/systems/playerDatabase2026Engine.js';
import { may2026RequiredFields, may2026ValidationRules } from '../../js/data/rosterMay2026Data.js';

export function validatePlayerDatabase2026(state={}){
  const snapshot = buildMay2026DatabaseSnapshot(state);
  const issues = [];
  const warnings = [];
  if(snapshot.totals.clubs < 40) warnings.push(`Banco brasileiro com ${snapshot.totals.clubs} clubes; recomendável 40+.`);
  if(snapshot.totals.totalPlayers < snapshot.totals.clubs * may2026ValidationRules.minPlayers) issues.push('Total de jogadores abaixo do mínimo por clube.');
  snapshot.clubs.forEach(club=>{
    const roster = buildMay2026RosterForClub(club.id);
    if(roster.players.length < may2026ValidationRules.minPlayers) issues.push(`${club.id}: elenco abaixo de ${may2026ValidationRules.minPlayers}`);
    const ids = new Set();
    roster.players.forEach((raw,index)=>{
      const p = normalizeMay2026Player(raw,index,club.id);
      may2026RequiredFields.forEach(field=>{ if(p[field] === undefined || p[field] === null || p[field] === '') issues.push(`${club.id}/${p.id}: campo ausente ${field}`); });
      if(ids.has(p.id)) issues.push(`${club.id}: jogador duplicado ${p.id}`);
      ids.add(p.id);
      if(p.overall < may2026ValidationRules.minOverall || p.overall > may2026ValidationRules.maxOverall) issues.push(`${club.id}/${p.id}: overall inválido`);
      if(p.age < may2026ValidationRules.minAge || p.age > may2026ValidationRules.maxAge) issues.push(`${club.id}/${p.id}: idade inválida`);
      if(p.salary < may2026ValidationRules.minSalary || p.salary > may2026ValidationRules.maxSalary) warnings.push(`${club.id}/${p.id}: salário fora da curva segura`);
      if(p.contract < may2026ValidationRules.minContractMonths || p.contract > may2026ValidationRules.maxContractMonths) issues.push(`${club.id}/${p.id}: contrato inválido`);
    });
  });
  return { status: issues.length ? 'error' : warnings.length ? 'warning' : 'ok', issues, warnings, snapshot, checkedAt: new Date().toISOString(), version:'v4.6.0' };
}
export default validatePlayerDatabase2026;
