
import { officialSerieB2026Rosters, listOfficialSerieB2026Coverage } from '../../js/data/officialSerieB2026RosterData.js';
const requiredFields = ['id','name','pos','overall','potential','age','nationality','value','contractUntil','shirt'];
export const SERIE_B_2026_PASS_4_CLUBS = ["fortaleza", "ceara", "novorizontino", "avai", "athletic-club", "goias", "cuiaba", "criciuma", "america-mg", "juventude", "atletico-go", "vila-nova", "crb", "nautico", "sao-bernardo", "operario", "botafogo-sp", "sport-recife", "londrina", "ponte-preta"];
export function validateOfficialSerieBRosterPass588(){
  const coverage = listOfficialSerieB2026Coverage(); const issues=[]; const globalIds=new Set();
  SERIE_B_2026_PASS_4_CLUBS.forEach(clubId=>{
    const pkg=officialSerieB2026Rosters[clubId]; if(!pkg){issues.push(`${clubId}: sem pacote oficial Série B 2026`); return;}
    if(!Array.isArray(pkg.players)||pkg.players.length<20) issues.push(`${clubId}: elenco curto`);
    const positions=new Set((pkg.players||[]).map(p=>p.pos||p.position));
    ['GOL','ZAG'].forEach(pos=>{if(!positions.has(pos)) issues.push(`${clubId}: sem posição mínima ${pos}`);});
    if(!positions.has('VOL')&&!positions.has('MC')) issues.push(`${clubId}: sem volante/meia central`);
    if(!positions.has('ATA')&&!positions.has('PE')&&!positions.has('PD')&&!positions.has('SA')) issues.push(`${clubId}: sem atacante/ponta`);
    const localIds=new Set(); pkg.players.forEach((p,i)=>{ requiredFields.forEach(k=>{if(p[k]===undefined||p[k]===null||p[k]==='') issues.push(`${clubId}:${i+1}:${k}`);}); if(localIds.has(p.id)) issues.push(`${clubId}: id duplicado local ${p.id}`); localIds.add(p.id); if(globalIds.has(p.id)) issues.push(`id duplicado global ${p.id}`); globalIds.add(p.id); if(/(GK|ZAG|MC|ATA)\s+\d+|Jogador\s+\d+|Player\s+\d+/i.test(p.name||'')) issues.push(`${clubId}: nome genérico ${p.name}`); if(p.isGeneric) issues.push(`${clubId}: jogador marcado como genérico ${p.name}`); });
  });
  return {version:'v5.8.8',status:issues.length?'blocked':'ok',expectedClubs:SERIE_B_2026_PASS_4_CLUBS.length,officialClubs:coverage.length,players:Object.values(officialSerieB2026Rosters).reduce((s,p)=>s+p.players.length,0),issues};
}
export const validateOfficialSerieBRosterPass587 = validateOfficialSerieBRosterPass588;
export const validateOfficialSerieBRosterPass586 = validateOfficialSerieBRosterPass588;
export const validateOfficialSerieBRosterPass585 = validateOfficialSerieBRosterPass588;
export default validateOfficialSerieBRosterPass588;
