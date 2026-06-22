import { teams } from '../data/gameData.js';
import { brazilianLeagueTeams2026, leagueRules2026, rosterCoverage2026, dataMaintenanceChecklist, realDataVersion } from '../data/realData2026.js';
import { clubLogo } from './assets.js';

export function buildDataAudit(){
  const issues = [];
  const leagues = Object.entries(brazilianLeagueTeams2026).map(([leagueId, list])=>{
    const rule = leagueRules2026[leagueId] || {};
    const gameTeams = teams.filter(t=>t.leagueId===leagueId);
    const missingInGame = list.filter(t=>!gameTeams.some(g=>g.id===t.id));
    const extraInGame = gameTeams.filter(g=>!list.some(t=>t.id===g.id));
    if(list.length !== rule.teams) issues.push(`${leagueId}: esperado ${rule.teams}, encontrado ${list.length}`);
    if(missingInGame.length) issues.push(`${leagueId}: faltando no jogo ${missingInGame.map(t=>t.name).join(', ')}`);
    if(extraInGame.length) issues.push(`${leagueId}: extras no jogo ${extraInGame.map(t=>t.name).join(', ')}`);
    return {leagueId, expected:rule.teams, listed:list.length, inGame:gameTeams.length, missingInGame, extraInGame, ok:list.length===rule.teams && !missingInGame.length && !extraInGame.length};
  });
  const coverage = rosterCoverage2026.map(item=>({
    ...item,
    logo: clubLogo(item.clubId),
    ready: item.players >= 11,
    avatarFolder:`assets/players/brazil/${item.clubId}/`,
    importPath:item.rosterPath
  }));
  const verified = coverage.filter(c=>c.status==='verified').length;
  const templates = coverage.filter(c=>c.status==='template').length;
  return {version:realDataVersion, leagues, coverage, verified, templates, issues, score: Math.max(70, 100 - issues.length*8), checklist:dataMaintenanceChecklist};
}

export function rosterTemplateForClub(clubId='santos', clubName='Clube'){
  const base = [
    ['goleiro-titular','GOL',72],['goleiro-reserva','GOL',64],['lateral-direito','LD',68],['zagueiro-lider','ZAG',72],['zagueiro-jovem','ZAG',65],['lateral-esquerdo','LE',68],['volante-marcador','VOL',70],['meia-box-to-box','MC',70],['meia-criativo','MEI',71],['ponta-esquerda','PE',70],['centroavante','ATA',72],['ponta-direita','PD',69],['reserva-zagueiro','ZAG',64],['reserva-volante','VOL',65],['reserva-meia','MC',66],['reserva-atacante','ATA',66],['jovem-goleiro','GOL',58],['jovem-lateral','LD',59],['jovem-zagueiro','ZAG',60],['jovem-meia','MEI',61],['jovem-ponta','PD',62],['jovem-atacante','ATA',62],['promessa-base','MC',60]
  ];
  return {meta:{clubId, clubName, season:2026, version:`${clubId}-2026-template-v1`, updatedAt:'2026-05-20', status:'template'}, players: base.map((r,idx)=>({
    id:r[0], name:`${clubName} ${idx+1}`, pos:r[1], role:idx<11?'Titular/rotação':'Elenco', overall:r[2], potential:Math.min(85,r[2]+(idx>15?14:6)), age:idx>15?19+idx%4:22+idx%12, morale:70, form:70, fitness:88, salary:idx<11?120:35, value:Number((r[2]/10).toFixed(1)), contract:24, status:idx<11?'Principal':'Rotação', nationality:'br', foot:idx%3===0?'Canhoto':'Destro', shirt:idx+1, photo:`assets/players/brazil/${clubId}/${r[0]}.png`
  }))};
}

export function exportRosterTemplateText(clubId='santos'){
  const club = teams.find(t=>t.id===clubId) || teams[0];
  return JSON.stringify(rosterTemplateForClub(club.id, club.name), null, 2);
}

export function dataQualityLabel(status){
  if(status==='verified') return 'Conferido';
  if(status==='curated') return 'Curado';
  return 'Template seguro';
}
