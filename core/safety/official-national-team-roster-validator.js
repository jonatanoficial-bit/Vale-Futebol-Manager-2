import { officialNationalTeam2026Rosters, listOfficialNationalTeam2026Coverage, countOfficialNationalTeam2026Players } from '../../js/data/officialNationalTeam2026RosterData.js';
export const NATIONAL_TEAM_2026_PRIORITY_TEAMS = Object.keys(officialNationalTeam2026Rosters);
export function validateOfficialNationalTeamRosterPass5812(){
  const issues=[]; const globalIds=new Set(); const coverage=listOfficialNationalTeam2026Coverage();
  NATIONAL_TEAM_2026_PRIORITY_TEAMS.forEach(teamId=>{
    const pkg=officialNationalTeam2026Rosters[teamId];
    if(!pkg){ issues.push(`${teamId}: sem pacote de seleção 2026`); return; }
    if(!pkg.meta?.rosterPath) issues.push(`${teamId}: sem rosterPath`);
    const players=Array.isArray(pkg.players)?pkg.players:[];
    if(players.length<23) issues.push(`${teamId}: convocação curta ${players.length}/23`);
    if(players.length>30) issues.push(`${teamId}: convocação acima do limite técnico ${players.length}/30`);
    const byPos={}; const localIds=new Set();
    players.forEach(p=>{
      const pos=p.position||p.pos; byPos[pos]=(byPos[pos]||0)+1;
      ['id','name','displayName','position','age','overall','potential','nationalTeamId','dataLock','source'].forEach(k=>{ if(p[k]===undefined||p[k]===null||p[k]==='') issues.push(`${teamId}:${p.name||'sem nome'} sem ${k}`); });
      if(localIds.has(p.id)) issues.push(`${teamId}: id duplicado local ${p.id}`); localIds.add(p.id);
      if(globalIds.has(p.id)) issues.push(`id duplicado global ${p.id}`); globalIds.add(p.id);
      if(/(GK|GOL|ZAG|MC|ATA)\s+\d+|Jogador\s+\d+|Player\s+\d+|Atleta Nacional/i.test(p.name||'')) issues.push(`${teamId}: nome genérico ${p.name}`);
      if(p.isGeneric) issues.push(`${teamId}: marcado como genérico ${p.name}`);
    });
    if((byPos.GOL||0)<2) issues.push(`${teamId}: menos de 2 goleiros`);
    if((byPos.ZAG||0)<3) issues.push(`${teamId}: menos de 3 zagueiros`);
    if(((byPos.ATA||0)+(byPos.PE||0)+(byPos.PD||0))<4) issues.push(`${teamId}: ataque/alas insuficientes`);
  });
  return {version:'v5.8.12',status:issues.length?'blocked':'ok',expectedTeams:NATIONAL_TEAM_2026_PRIORITY_TEAMS.length,officialTeams:coverage.length,players:countOfficialNationalTeam2026Players(),confederations:[...new Set(coverage.map(c=>c.confederation))],issues};
}
export default validateOfficialNationalTeamRosterPass5812;
