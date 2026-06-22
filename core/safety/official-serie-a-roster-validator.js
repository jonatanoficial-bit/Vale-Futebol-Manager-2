import { officialSerieA2026Rosters, listOfficialSerieA2026Coverage } from '../../js/data/officialSerieA2026RosterData.js';
const required = ['id','name','pos','overall','potential','age','nationality','value','contractUntil','shirt'];
const SERIE_A_2026_EXPECTED_CLUBS = ['fluminense','flamengo','palmeiras','corinthians','sao-paulo','santos','botafogo','vasco','internacional','gremio','atletico-mg','cruzeiro','bahia','red-bull-bragantino','vitoria','mirassol','fortaleza','ceara','juventude','sport-recife'];
export function validateOfficialSerieARosterPass584(){
  const coverage = listOfficialSerieA2026Coverage();
  const issues = [];
  const allPlayerIds = new Set();
  SERIE_A_2026_EXPECTED_CLUBS.forEach(clubId=>{
    const pkg = officialSerieA2026Rosters[clubId];
    if(!pkg) { issues.push(`${clubId}: sem pacote oficial Série A 2026`); return; }
    if(!Array.isArray(pkg.players) || pkg.players.length < 23) issues.push(`${clubId}: elenco curto`);
    const ids = new Set();
    const positions = new Set((pkg.players||[]).map(p=>p.pos || p.position));
    ['GOL','ZAG'].forEach(pos=>{ if(!positions.has(pos)) issues.push(`${clubId}: sem posição mínima ${pos}`); });
    if(!positions.has('VOL') && !positions.has('MC')) issues.push(`${clubId}: sem volante/meia central`);
    if(!positions.has('ATA') && !positions.has('PE') && !positions.has('PD') && !positions.has('SA')) issues.push(`${clubId}: sem atacante/ponta`);
    pkg.players.forEach((p,i)=>{
      required.forEach(k=>{ if(p[k] === undefined || p[k] === null || p[k] === '') issues.push(`${clubId}:${i+1}:${k}`); });
      if(ids.has(p.id)) issues.push(`${clubId}: id duplicado local ${p.id}`); ids.add(p.id);
      if(allPlayerIds.has(p.id)) issues.push(`id duplicado global ${p.id}`); allPlayerIds.add(p.id);
      if(/\b(GK|ZAG|MC|ATA)\s+\d+\b|Jogador\s+\d+|Player\s+\d+/i.test(p.name||'')) issues.push(`${clubId}: nome genérico ${p.name}`);
      if(p.isGeneric) issues.push(`${clubId}: jogador marcado como genérico ${p.name}`);
    });
  });
  return { version:'v5.8.4', status: issues.length ? 'blocked' : 'ok', expectedClubs: SERIE_A_2026_EXPECTED_CLUBS.length, officialClubs: coverage.length, players:Object.values(officialSerieA2026Rosters).reduce((s,p)=>s+p.players.length,0), issues };
}
export const validateOfficialSerieARosterPass583 = validateOfficialSerieARosterPass584;
export const validateOfficialSerieARosterPass582 = validateOfficialSerieARosterPass584;
export const validateOfficialSerieARosterPass581 = validateOfficialSerieARosterPass584;
export default validateOfficialSerieARosterPass584;
