import { listOfficialSerieA2026Coverage } from '../data/officialSerieA2026RosterData.js';
import { listOfficialSerieB2026Coverage } from '../data/officialSerieB2026RosterData.js';
import { listOfficialConmebol2026Coverage, countOfficialConmebol2026Players } from '../data/officialConmebol2026RosterData.js';
import { listSouthAmerica2026Coverage, countSouthAmerica2026Players } from '../data/officialSouthAmerica2026RosterData.js';
import { listOfficialWorld2026Coverage, countOfficialWorld2026Players } from '../data/officialWorld2026RosterData.js';
import { listOfficialNationalTeam2026Coverage, countOfficialNationalTeam2026Players } from '../data/officialNationalTeam2026RosterData.js';
import { teams } from '../data/gameData.js';
import { buildMay2026RosterForClub } from './playerDatabase2026Engine.js';
import { DATA_PACK_2026_VERSION, DATA_PACK_LOCK_DATE, DATA_PACK_LABEL, dataPackRosterPaths2026, dataPackPlayerRequiredFields2026, dataPackPlayerTemplate2026, dataPackClubMinimums2026, dataPackImportStages2026, genericNamePatterns2026 } from '../data/dataPack2026Schema.js';

export { DATA_PACK_2026_VERSION, DATA_PACK_LOCK_DATE, DATA_PACK_LABEL };

function leaguePathForClub(club={}){
 const leagueId = club.leagueId || '';
 if(leagueId === 'brasileirao-a') return dataPackRosterPaths2026.brazilSerieA.replace('{clubId}', club.id);
 if(leagueId === 'brasileirao-b') return dataPackRosterPaths2026.brazilSerieB.replace('{clubId}', club.id);
 if((club.country || '') === 'br') return `data/rosters/2026/brazil/${club.id}.json`;
 return dataPackRosterPaths2026.europe.replace('{leagueId}', leagueId || 'world').replace('{clubId}', club.id || 'club');
}
function isGenericName(name=''){
 return genericNamePatterns2026.some(rx => rx.test(String(name || '')));
}
function normalizeDataPackPlayer(player={}, clubId='club', index=0){
 const id = player.id || `${clubId}-pending-${index+1}`;
 const position = player.position || player.pos || 'MC';
 const name = player.name || player.displayName || `PENDENTE OFICIAL ${index+1}`;
 return {
  ...dataPackPlayerTemplate2026,
  ...player,
  id,
  name,
  displayName: player.displayName || name,
  position,
  secondaryPositions: Array.isArray(player.secondaryPositions) ? player.secondaryPositions : [],
  age: Number(player.age || 24),
  nationality: player.nationality || 'br',
  foot: player.foot || 'Destro',
  overall: Number(player.overall || 65),
  potential: Number(player.potential || player.overall || 70),
  contractUntil: player.contractUntil || '2027-12-31',
  salary: Number(player.salary || 0),
  marketValue: Number(player.marketValue ?? player.value ?? 0),
  shirtNumber: Number(player.shirtNumber || player.shirt || index+1),
  status: player.status || 'pendente-oficial',
  clubId,
  dataLock: player.dataLock || DATA_PACK_LOCK_DATE,
  source: player.source || 'pending-official-import',
  photo: player.photo || `assets/players/2026/${clubId}/${id}.png`,
  isGeneric: Boolean(player.isGeneric || isGenericName(name) || String(player.source||'').includes('template'))
 };
}
export function validateRosterPackage2026(pkg={}, options={}){
 const clubId = pkg.meta?.clubId || options.clubId || 'club';
 const players = Array.isArray(pkg.players) ? pkg.players.map((p,i)=>normalizeDataPackPlayer(p, clubId, i)) : [];
 const ids = new Set();
 const duplicateIds = [];
 const missingFields = [];
 const genericPlayers = [];
 const byPos = {};
 players.forEach((p, index)=>{
  if(ids.has(p.id)) duplicateIds.push(p.id); else ids.add(p.id);
  dataPackPlayerRequiredFields2026.forEach(field => { if(p[field] === undefined || p[field] === null || p[field] === '') missingFields.push(`${index+1}:${field}`); });
  if(p.isGeneric) genericPlayers.push(p.name);
  byPos[p.position] = (byPos[p.position] || 0) + 1;
 });
 const minPlayers = options.minPlayers || dataPackClubMinimums2026.playableMinPlayers;
 const positionWarnings = Object.entries(dataPackClubMinimums2026.byPosition).filter(([pos,min]) => Number(byPos[pos] || 0) < min).map(([pos,min])=>`${pos}:${byPos[pos]||0}/${min}`);
 const errors = [];
 if(players.length < minPlayers) errors.push(`elenco-curto:${players.length}/${minPlayers}`);
 if(duplicateIds.length) errors.push(`ids-duplicados:${duplicateIds.length}`);
 if(missingFields.length) errors.push(`campos-ausentes:${missingFields.length}`);
 return {
  status: errors.length ? 'blocked' : genericPlayers.length ? 'pending-official-data' : 'ready',
  clubId,
  playerCount: players.length,
  genericCount: genericPlayers.length,
  duplicateIds,
  missingFields: missingFields.slice(0, 40),
  positionWarnings,
  errors,
  players
 };
}
export function buildDataPack2026Snapshot(state={}){
 const brazilA = teams.filter(t => t.leagueId === 'brasileirao-a');
 const brazilB = teams.filter(t => t.leagueId === 'brasileirao-b');
 const otherBrazil = teams.filter(t => t.country === 'br' && !['brasileirao-a','brasileirao-b'].includes(t.leagueId));
 const international = teams.filter(t => t.country !== 'br');
 const playable = [...brazilA, ...brazilB];
 const officialCoverage = listOfficialSerieA2026Coverage();
 const officialBCoverage = listOfficialSerieB2026Coverage();
 const clubRows = playable.map(club => {
  const pkg = buildMay2026RosterForClub(club.id);
  const validation = validateRosterPackage2026(pkg, {clubId: club.id, minPlayers: dataPackClubMinimums2026.playableMinPlayers});
  const officialLocked = String(pkg.meta?.sourceStatus || '').includes('official-locked');
  const status = officialLocked && validation.status === 'ready' ? 'ready' : validation.status === 'ready' ? 'pending-official-lock' : validation.status;
  return {
   id: club.id,
   name: club.name,
   leagueId: club.leagueId,
   expectedPath: leaguePathForClub(club),
   players: validation.playerCount,
   genericCount: validation.genericCount,
   status,
   blocked: status !== 'ready'
  };
 });
 const genericTotal = clubRows.reduce((sum,c)=>sum+c.genericCount,0);
 const blockedClubs = clubRows.filter(c=>c.blocked).length;
 return {
  version: DATA_PACK_2026_VERSION,
  label: DATA_PACK_LABEL,
  lockDate: DATA_PACK_LOCK_DATE,
  paths: dataPackRosterPaths2026,
  playerTemplate: dataPackPlayerTemplate2026,
  requiredFields: dataPackPlayerRequiredFields2026,
  minimums: dataPackClubMinimums2026,
  stages: dataPackImportStages2026,
  totals: {
   brazilSerieA: brazilA.length,
   brazilSerieB: brazilB.length,
   otherBrazil: otherBrazil.length,
   international: international.length,
   playable: playable.length,
   blockedClubs,
   officialSerieAReady: officialCoverage.length,
   officialSerieBReady: officialBCoverage.length,
   officialConmebolReady: listOfficialConmebol2026Coverage().length,
   officialConmebolPlayers: countOfficialConmebol2026Players(),
   southAmericaAllLogoReady: listSouthAmerica2026Coverage().length,
   southAmericaAllLogoPlayers: countSouthAmerica2026Players(),
   officialWorldReady: listOfficialWorld2026Coverage().length,
   officialWorldPlayers: countOfficialWorld2026Players(),
   officialNationalReady: listOfficialNationalTeam2026Coverage().length,
   officialNationalPlayers: countOfficialNationalTeam2026Players(),
   genericTotal
  },
  clubs: clubRows,
  qualityGate: blockedClubs === 0 && genericTotal === 0 ? 'release-ready' : 'blocked-until-official-rosters',
  message: blockedClubs === 0 ? 'Todos os clubes jogáveis estão prontos.' : 'Release Candidate bloqueada até substituir templates por elencos oficiais/licenciados.'
 };
}
export function exportDataPackManifest2026(){
 return JSON.stringify({
  version: DATA_PACK_2026_VERSION,
  label: DATA_PACK_LABEL,
  lockDate: DATA_PACK_LOCK_DATE,
  paths: dataPackRosterPaths2026,
  requiredFields: dataPackPlayerRequiredFields2026,
  minimums: dataPackClubMinimums2026,
  stages: dataPackImportStages2026
 }, null, 2);
}
export function renderDataPack2026Center(state={}){
 const snap = buildDataPack2026Snapshot(state);
 const stageRows = snap.stages.map(s=>`<div class="fixture-row ${s.status==='entregue'?'completed-fixture':''}"><div class="fixture-date"><strong>${s.version.replace('v','')}</strong><small>${s.status}</small></div><div class="fixture-main"><strong>${s.title}</strong><span>${s.scope}</span></div><span class="status-pill">${s.id}</span></div>`).join('');
 const rows = snap.clubs.slice(0, 40).map(c=>`<tr class="${c.blocked?'warning-row':''}"><td>${c.name}</td><td>${c.leagueId}</td><td>${c.players}</td><td>${c.genericCount}</td><td><code>${c.expectedPath}</code></td><td>${c.status}</td></tr>`).join('');
 const lista = exportDataPackManifest2026().replace(/</g,'&lt;');
 return `<section class="datapack- stack">
  <div class="panel championship-hero"><div><span class="tag">${snap.label} · ${snap.version}</span><h1>Motor oficial de Data Packs 2026</h1><p class="small">Esta build prepara o jogo para receber elencos oficiais/licenciados travados em ${snap.lockDate}. A Release Candidate fica bloqueada enquanto houver jogador genérico em clube jogável.</p></div><div class="release-score"><strong>${snap.qualityGate === 'release-ready' ? 'OK' : 'LOCK'}</strong><small>${snap.qualityGate}</small></div></div>
  <section class="grid desktop-5"><div class="card kpi-card"><span>Série A</span><strong>${snap.totals.brazilSerieA}</strong><small>clubes mapeados</small></div><div class="card kpi-card"><span>Série B</span><strong>${snap.totals.brazilSerieB}</strong><small>clubes mapeados</small></div><div class="card kpi-card"><span>Série A oficiais</span><strong>${snap.totals.officialSerieAReady}</strong><small>20/20</small></div><div class="card kpi-card"><span>Série B oficiais</span><strong>${snap.totals.officialSerieBReady}</strong><small>20/20</small></div><div class="card kpi-card"><span>CONMEBOL prioridade</span><strong>${snap.totals.officialConmebolReady}</strong><small>${snap.totals.officialConmebolPlayers} jogadores</small></div><div class="card kpi-card"><span>América do Sul</span><strong>${snap.totals.southAmericaAllLogoReady}</strong><small>${snap.totals.southAmericaAllLogoPlayers} atletas · logos/ligas</small></div><div class="card kpi-card"><span>Europa/Mundo</span><strong>${snap.totals.officialWorldReady}</strong><small>${snap.totals.officialWorldPlayers} jogadores</small></div><div class="card kpi-card"><span>Seleções</span><strong>${snap.totals.officialNationalReady}</strong><small>${snap.totals.officialNationalPlayers} convocáveis</small></div><div class="card kpi-card"><span>Bloqueados</span><strong>${snap.totals.blockedClubs}</strong><small>aguardam seleções/lock</small></div></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Fases de importação</span><h2>Roteiro de elencos</h2></div><strong class="grade">20/05/2026</strong></div><div class="fixture-list">${stageRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Base oficial</span><h2>Manifesto importável</h2></div><button class="secondary-btn mini" data-route="database2026">Banco atual</button></div><textarea class="code-box" readonly>${lista}</textarea></article></section>
  <section class="panel"><div class="row space"><div><span class="tag">Bloqueio anti-genérico</span><h2>Clubes jogáveis Série A/B</h2></div><span class="status-pill">${snap.message}</span></div><div class="table-scroll"><table class="table"><thead><tr><th>Clube</th><th>Liga</th><th>Jogadores</th><th>Genéricos</th><th>Caminho</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></section>
 </section>`;
}
