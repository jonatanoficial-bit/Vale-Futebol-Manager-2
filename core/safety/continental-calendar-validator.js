
import { conmebolSeasonSnapshot } from '../../js/systems/worldCompetitionEngine.js';

export function validateContinentalCalendarSafety(state={}){
  const snap = conmebolSeasonSnapshot(state);
  const checks = [
    {name:'Libertadores com 32 clubes', ok:snap.libertadores.clubs.length===32},
    {name:'Sul-Americana com 32 clubes', ok:snap.sulamericana.clubs.length===32},
    {name:'Libertadores com 8 grupos', ok:snap.libertadores.groups.length===8},
    {name:'Sul-Americana com 8 grupos', ok:snap.sulamericana.groups.length===8},
    {name:'Mata-mata da Libertadores com 16 classificados', ok:(snap.libertadores.knockout.rounds[0]?.ties?.length||0)===8},
    {name:'Mata-mata da Sul-Americana com 16 classificados', ok:(snap.sulamericana.knockout.rounds[0]?.ties?.length||0)===8},
    {name:'Campeão da Libertadores gera rota mundial', ok:Boolean(snap.bridge.intercontinentalQualified?.id)}
  ];
  const errors = checks.filter(c=>!c.ok).map(c=>c.name);
  return {version:'v4.2.0', status:errors.length?'error':'ok', checks, errors, warnings:snap.validation.warnings};
}
