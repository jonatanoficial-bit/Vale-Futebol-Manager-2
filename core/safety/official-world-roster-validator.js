import { officialWorld2026Rosters, listOfficialWorld2026Coverage } from '../../js/data/officialWorld2026RosterData.js';
export const WORLD_2026_ELITE_CLUBS = Object.keys(officialWorld2026Rosters);
export function validateOfficialWorldRosterPass5811(){
  const issues=[]; const globalIds=new Set(); const coverage=listOfficialWorld2026Coverage();
  WORLD_2026_ELITE_CLUBS.forEach(clubId=>{
    const pkg=officialWorld2026Rosters[clubId]; if(!pkg){issues.push(`${clubId}: sem pacote mundial 2026`); return;}
    if(!pkg.meta?.rosterPath) issues.push(`${clubId}: sem rosterPath`);
    const players=Array.isArray(pkg.players)?pkg.players:[];
    if(players.length<25) issues.push(`${clubId}: elenco curto ${players.length}/25`);
    const byPos={}; const localIds=new Set();
    players.forEach(p=>{
      byPos[p.position||p.pos]=(byPos[p.position||p.pos]||0)+1;
      ['id','name','displayName','position','age','overall','potential','clubId','dataLock','source'].forEach(k=>{ if(p[k]===undefined||p[k]===null||p[k]==='') issues.push(`${clubId}:${p.name||'sem nome'} sem ${k}`); });
      if(localIds.has(p.id)) issues.push(`${clubId}: id duplicado local ${p.id}`); localIds.add(p.id);
      if(globalIds.has(p.id)) issues.push(`id duplicado global ${p.id}`); globalIds.add(p.id);
      if(/\b(GK|GOL|ZAG|MC|ATA)\s+\d+\b|Jogador\s+\d+|Player\s+\d+/i.test(p.name||'')) issues.push(`${clubId}: nome genérico ${p.name}`);
      if(p.isGeneric) issues.push(`${clubId}: marcado como genérico ${p.name}`);
    });
    if((byPos.GOL||0)<2) issues.push(`${clubId}: menos de 2 goleiros`);
    if((byPos.ZAG||0)<4) issues.push(`${clubId}: menos de 4 zagueiros`);
    if(((byPos.ATA||0)+(byPos.SA||0))<2) issues.push(`${clubId}: menos de 2 atacantes`);
  });
  return {version:'v5.8.11',status:issues.length?'blocked':'ok',expectedClubs:WORLD_2026_ELITE_CLUBS.length,officialClubs:coverage.length,players:Object.values(officialWorld2026Rosters).reduce((s,p)=>s+p.players.length,0),competitions:[...new Set(coverage.map(c=>c.competition))],issues};
}
export const validateOfficialWorldRosterPass5810 = validateOfficialWorldRosterPass5811;
export default validateOfficialWorldRosterPass5811;
