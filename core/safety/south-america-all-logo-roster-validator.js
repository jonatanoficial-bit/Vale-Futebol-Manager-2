import { allSouthAmerica2026Rosters, listSouthAmerica2026Coverage } from '../../js/data/officialSouthAmerica2026RosterData.js';
import { genericNamePatterns2026 } from '../../js/data/dataPack2026Schema.js';

export function validateSouthAmericaAllLogoRosterPass591(){
  const issues=[];
  const ids=new Set();
  const coverage=listSouthAmerica2026Coverage();
  Object.entries(allSouthAmerica2026Rosters).forEach(([clubId,pkg])=>{
    const players=Array.isArray(pkg.players)?pkg.players:[];
    if(players.length < 11) issues.push(`${clubId}: menos de 11 titulares (${players.length})`);
    const hasGoalkeeper=players.some(p=>(p.pos||p.position)==='GOL');
    const defenders=players.filter(p=>['ZAG','LD','LE'].includes(p.pos||p.position)).length;
    const mids=players.filter(p=>['VOL','MC','MEI'].includes(p.pos||p.position)).length;
    const attackers=players.filter(p=>['PE','PD','ATA','SA'].includes(p.pos||p.position)).length;
    if(!hasGoalkeeper) issues.push(`${clubId}: sem goleiro`);
    if(defenders < 4) issues.push(`${clubId}: defesa insuficiente`);
    if(mids < 3) issues.push(`${clubId}: meio insuficiente`);
    if(attackers < 2) issues.push(`${clubId}: ataque insuficiente`);
    players.forEach(p=>{
      if(ids.has(p.id)) issues.push(`${clubId}: id duplicado ${p.id}`);
      ids.add(p.id);
      if(!p.name || genericNamePatterns2026.some(rx=>rx.test(String(p.name)))) issues.push(`${clubId}: nome genérico ${p.name}`);
      if(p.isGeneric) issues.push(`${clubId}: marcado genérico ${p.name}`);
      if(p.dataLock !== '2026-05-20' && p.dataSnapshot !== '2026-05-20') issues.push(`${clubId}: data lock divergente ${p.name}`);
    });
  });
  return { version:'v5.9.1', status:issues.length?'blocked':'ok', clubs:coverage.length, players:Object.values(allSouthAmerica2026Rosters).reduce((s,p)=>s+p.players.length,0), starterXiOnly:coverage.filter(c=>c.players===11).length, issues };
}
export default validateSouthAmericaAllLogoRosterPass591;
