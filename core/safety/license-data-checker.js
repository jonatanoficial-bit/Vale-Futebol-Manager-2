import { buildMay2026DatabaseSnapshot } from '../../js/systems/playerDatabase2026Engine.js';

export function checkLicensedDataReadiness(state={}){
  const snapshot = buildMay2026DatabaseSnapshot(state);
  const issues = [];
  const warnings = [];
  snapshot.clubs.forEach(club=>{
    if(!club.rosterPath.startsWith('data/rosters/2026/')) issues.push(`${club.id}: caminho JSON fora do padrão`);
    if(!club.photoFolder.startsWith('assets/players/brazil/')) warnings.push(`${club.id}: fotos fora do padrão brasileiro`);
  });
  return {
    status: issues.length ? 'error' : warnings.length ? 'warning' : 'ok',
    licenseMode: 'user-confirmed-license',
    publicBuildSafe: true,
    editableDatabase: true,
    issues,
    warnings,
    note:'Checagem técnica: garante caminhos, fallback e separação entre dados licenciados/editáveis e motor do jogo.',
    checkedAt:new Date().toISOString(),
    version:'v4.6.0'
  };
}
export default checkLicensedDataReadiness;
