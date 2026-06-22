
import { officialConmebol2026Rosters, listOfficialConmebol2026Coverage } from '../../js/data/officialConmebol2026RosterData.js';
const requiredFields = ['id','name','displayName','pos','position','overall','potential','age','nationality','marketValue','contractUntil','shirtNumber','clubId','dataLock','source'];
export const CONMEBOL_2026_PRIORITY_CLUBS = ["boca-juniors", "river-plate", "rosario-central", "racing-club", "independiente-del-valle", "ldu-quito", "penarol", "nacional-uruguay", "colo-colo", "olimpia", "cerro-porteno", "atletico-nacional", "junior-barranquilla", "bolivar", "universitario", "alianza-lima"];
export function validateOfficialConmebolRosterPass589(){
  const coverage = listOfficialConmebol2026Coverage(); const issues=[]; const globalIds=new Set();
  CONMEBOL_2026_PRIORITY_CLUBS.forEach(clubId=>{
    const pkg=officialConmebol2026Rosters[clubId]; if(!pkg){issues.push(`${clubId}: sem pacote CONMEBOL 2026`); return;}
    if(!Array.isArray(pkg.players)||pkg.players.length<23) issues.push(`${clubId}: elenco curto`);
    const positions=new Set((pkg.players||[]).map(p=>p.pos||p.position));
    ['GOL','ZAG'].forEach(pos=>{ if(!positions.has(pos)) issues.push(`${clubId}: sem ${pos}`); });
    if(!positions.has('VOL')&&!positions.has('MC')) issues.push(`${clubId}: sem meio-campo central`);
    if(!positions.has('ATA')&&!positions.has('PE')&&!positions.has('PD')&&!positions.has('SA')) issues.push(`${clubId}: sem ataque`);
    const localIds=new Set(); pkg.players.forEach((p,i)=>{
      requiredFields.forEach(k=>{ if(p[k]===undefined||p[k]===null||p[k]==='') issues.push(`${clubId}:${i+1}:${k}`); });
      if(localIds.has(p.id)) issues.push(`${clubId}: id duplicado local ${p.id}`); localIds.add(p.id);
      if(globalIds.has(p.id)) issues.push(`id duplicado global ${p.id}`); globalIds.add(p.id);
      if(/(GK|GOL|ZAG|MC|ATA)\s+\d+|Jogador\s+\d+|Player\s+\d+/i.test(p.name||'')) issues.push(`${clubId}: nome genérico ${p.name}`);
      if(p.isGeneric) issues.push(`${clubId}: marcado como genérico ${p.name}`);
    });
  });
  return {version:'v5.8.10',status:issues.length?'blocked':'ok',expectedClubs:CONMEBOL_2026_PRIORITY_CLUBS.length,officialClubs:coverage.length,players:Object.values(officialConmebol2026Rosters).reduce((s,p)=>s+p.players.length,0),libertadores:coverage.filter(c=>c.competition==='libertadores').length,sulamericana:coverage.filter(c=>c.competition==='sudamericana').length,issues};
}
export default validateOfficialConmebolRosterPass589;
