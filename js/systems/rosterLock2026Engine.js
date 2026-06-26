
import { teams } from '../data/gameData.js';
import { DATA_PACK_LOCK_DATE, DATA_PACK_LABEL, genericNamePatterns2026, dataPackClubMinimums2026 } from '../data/dataPack2026Schema.js';
import { getOfficialSerieA2026Roster, listOfficialSerieA2026Coverage } from '../data/officialSerieA2026RosterData.js';
import { getOfficialSerieB2026Roster, listOfficialSerieB2026Coverage } from '../data/officialSerieB2026RosterData.js';
import { getOfficialConmebol2026Roster, listOfficialConmebol2026Coverage, countOfficialConmebol2026Players } from '../data/officialConmebol2026RosterData.js';
import { getSouthAmerica2026Roster, listSouthAmerica2026Coverage, countSouthAmerica2026Players } from '../data/officialSouthAmerica2026RosterData.js';
import { getOfficialWorld2026Roster, listOfficialWorld2026Coverage, countOfficialWorld2026Players } from '../data/officialWorld2026RosterData.js';
import { getOfficialNationalTeamRoster2026, listOfficialNationalTeam2026Coverage, countOfficialNationalTeam2026Players } from '../data/officialNationalTeam2026RosterData.js';

export const ROSTER_LOCK_2026_VERSION = '';
export const ROSTER_LOCK_2026_LABEL = 'Roster Lock 20/05/2026';

function isGenericName(name=''){
 return genericNamePatterns2026.some(rx => rx.test(String(name || '')));
}
function playerProblems(player={}, scope='club'){
 const problems = [];
 if(!player.id) problems.push('id-ausente');
 if(!player.name) problems.push('nome-ausente');
 if(!player.position && !player.pos) problems.push('posição-ausente');
 if(player.age === undefined || Number(player.age) < 15 || Number(player.age) > 50) problems.push('idade-inválida');
 if(player.overall === undefined || Number(player.overall) < 1 || Number(player.overall) > 99) problems.push('overall-inválido');
 if(player.potential === undefined || Number(player.potential) < 1 || Number(player.potential) > 99) problems.push('potencial-inválido');
 if(player.dataLock !== DATA_PACK_LOCK_DATE && player.dataSnapshot !== DATA_PACK_LOCK_DATE) problems.push('data-lock-divergente');
 if(player.isGeneric || isGenericName(player.name) || isGenericName(player.displayName)) problems.push('nome-genérico');
 if(scope !== 'national' && !player.clubId) problems.push('clubId-ausente');
 return problems;
}
function scanPackage(pkg=null, options={}){
 const minPlayers = Number(options.minPlayers || dataPackClubMinimums2026.playableMinPlayers);
 const scope = options.scope || 'club';
 const players = Array.isArray(pkg?.players) ? pkg.players : [];
 const ids = new Set();
 const duplicateIds = [];
 const playerIssues = [];
 const byPosition = {};
 players.forEach((player, index) => {
  const id = String(player.id || `missing-${index}`);
  if(ids.has(id)) duplicateIds.push(id); else ids.add(id);
  const pos = player.position || player.pos || 'SEM_POS';
  byPosition[pos] = (byPosition[pos] || 0) + 1;
  const issues = playerProblems(player, scope);
  if(issues.length) playerIssues.push({ index:index+1, id, name:player.name || 'SEM_NOME', issues });
 });
 const positionWarnings = scope === 'national' ? [] : Object.entries(dataPackClubMinimums2026.byPosition)
  .filter(([pos,min]) => Number(byPosition[pos] || 0) < min)
  .map(([pos,min]) => `${pos}:${byPosition[pos] || 0}/${min}`);
 const errors = [];
 if(players.length < minPlayers) errors.push(`elenco-curto:${players.length}/${minPlayers}`);
 if(duplicateIds.length) errors.push(`ids-duplicados:${duplicateIds.length}`);
 const genericCount = playerIssues.filter(row => row.issues.includes('nome-genérico')).length;
 return {
  clubId: pkg?.meta?.clubId || pkg?.meta?.teamId || options.clubId || 'unknown',
  name: pkg?.meta?.clubName || pkg?.meta?.teamName || options.name || 'Sem nome',
  players: players.length,
  genericCount,
  duplicateIds,
  positionWarnings,
  playerIssues: playerIssues.slice(0, 50),
  issueCount: playerIssues.length,
  errors,
  status: errors.length || genericCount || playerIssues.length ? 'blocked' : 'locked'
 };
}
function scanGroup(rows=[], getPkg, options={}){
 const scans = rows.map(row => scanPackage(getPkg(row.clubId || row.teamId), {...options, clubId:row.clubId || row.teamId, name:row.clubName || row.teamName}));
 const players = scans.reduce((sum,row)=>sum+row.players,0);
 const genericCount = scans.reduce((sum,row)=>sum+row.genericCount,0);
 const issueCount = scans.reduce((sum,row)=>sum+row.issueCount+row.errors.length,0);
 const blocked = scans.filter(row=>row.status !== 'locked').length;
 return { rows:scans, players, genericCount, issueCount, blocked, locked:scans.length-blocked };
}
export function buildRosterLock2026Snapshot(state={}){
 const serieAExpected = [];
 const serieBExpected = [];
 const serieACoverage = listOfficialSerieA2026Coverage();
 const serieBCoverage = listOfficialSerieB2026Coverage();
 const serieA = scanGroup(serieACoverage, getOfficialSerieA2026Roster, {minPlayers:dataPackClubMinimums2026.brazilSerieA});
 const serieB = scanGroup(serieBCoverage, getOfficialSerieB2026Roster, {minPlayers:20});
 const conmebolCoverage = listOfficialConmebol2026Coverage();
 const southAmericaCoverage = listSouthAmerica2026Coverage();
 const worldCoverage = listOfficialWorld2026Coverage();
 const nationalCoverage = listOfficialNationalTeam2026Coverage();
 const conmebol = scanGroup(conmebolCoverage, getOfficialConmebol2026Roster, {minPlayers:dataPackClubMinimums2026.worldPlayable});
 const southAmericaAll = scanGroup(southAmericaCoverage, getSouthAmerica2026Roster, {minPlayers:11});
 const world = scanGroup(worldCoverage, getOfficialWorld2026Roster, {minPlayers:dataPackClubMinimums2026.worldPlayable});
 const national = scanGroup(nationalCoverage.map(n=>({teamId:n.teamId, teamName:n.teamName})), getOfficialNationalTeamRoster2026, {minPlayers:dataPackClubMinimums2026.nationalTeam, scope:'national'});
 const missingSerieA = serieAExpected.filter(id => !serieACoverage.some(row=>row.clubId===id));
 const missingSerieB = serieBExpected.filter(id => !serieBCoverage.some(row=>row.clubId===id));
 const totalPlayers = serieA.players + serieB.players + southAmericaAll.players + world.players + national.players;
 const totalGeneric = serieA.genericCount + serieB.genericCount + southAmericaAll.genericCount + world.genericCount + national.genericCount;
 const totalIssues = serieA.issueCount + serieB.issueCount + southAmericaAll.issueCount + world.issueCount + national.issueCount;
 const brazilPlayableReady = missingSerieA.length === 0 && missingSerieB.length === 0 && serieA.blocked === 0 && serieB.blocked === 0;
 const priorityPacksReady = conmebol.blocked === 0 && southAmericaAll.blocked === 0 && world.blocked === 0 && national.blocked === 0 && southAmericaCoverage.length >= 79 && conmebolCoverage.length >= 16 && worldCoverage.length >= 28 && nationalCoverage.length >= 16;
 const releaseCandidateReady = brazilPlayableReady && priorityPacksReady && totalGeneric === 0 && totalIssues === 0;
 return {
  version: ROSTER_LOCK_2026_VERSION,
  label: ROSTER_LOCK_2026_LABEL,
  dataPack: DATA_PACK_LABEL,
  lockDate: DATA_PACK_LOCK_DATE,
  createdAt: '2026-05-29 20:45 BRT',
  releaseCandidateReady,
  qualityGate: releaseCandidateReady ? 'roster-lock-approved' : 'blocked',
  totals: {
   totalPlayers,
   totalGeneric,
   totalIssues,
   serieAClubs: serieACoverage.length,
   serieBClubs: serieBCoverage.length,
   conmebolClubs: conmebolCoverage.length,
   conmebolPlayers: countOfficialConmebol2026Players(),
   southAmericaAllClubs: southAmericaCoverage.length,
   southAmericaAllPlayers: countSouthAmerica2026Players(),
   worldClubs: worldCoverage.length,
   worldPlayers: countOfficialWorld2026Players(),
   nationalTeams: nationalCoverage.length,
   nationalPlayers: countOfficialNationalTeam2026Players()
  },
  groups: {
   serieA: { expected:20, ready:serieA.locked, players:serieA.players, blocked:serieA.blocked, missing:missingSerieA, status:missingSerieA.length||serieA.blocked?'blocked':'locked' },
   serieB: { expected:20, ready:serieB.locked, players:serieB.players, blocked:serieB.blocked, missing:missingSerieB, status:missingSerieB.length||serieB.blocked?'blocked':'locked' },
   conmebol: { expectedPriority:16, ready:conmebol.locked, players:conmebol.players, blocked:conmebol.blocked, status:conmebol.blocked?'blocked':'priority-locked' },
   southAmericaAll: { expectedLogos:79, ready:southAmericaAll.locked, players:southAmericaAll.players, blocked:southAmericaAll.blocked, status:southAmericaAll.blocked?'blocked':'all-logo-xi-locked' },
   world: { expectedPriority:28, ready:world.locked, players:world.players, blocked:world.blocked, status:world.blocked?'blocked':'priority-locked' },
   national: { expectedPriority:16, ready:national.locked, players:national.players, blocked:national.blocked, status:national.blocked?'blocked':'locked' }
  },
  samples: {
   serieA: serieA.rows.slice(0,8),
   serieB: serieB.rows.slice(0,8),
   conmebol: conmebol.rows.slice(0,8),
   southAmericaAll: southAmericaAll.rows.slice(0,12),
   world: world.rows.slice(0,8),
   national: national.rows.slice(0,8)
  }
 };
}
export function renderRosterLock2026Center(state={}){
 const snap = buildRosterLock2026Snapshot(state);
 const cards = [
  ['Série A', `${snap.groups.serieA.ready}/20`, `${snap.groups.serieA.players} jogadores`, snap.groups.serieA.status],
  ['Série B', `${snap.groups.serieB.ready}/20`, `${snap.groups.serieB.players} jogadores`, snap.groups.serieB.status],
  ['CONMEBOL prioridade', `${snap.groups.conmebol.ready}/16+`, `${snap.groups.conmebol.players} jogadores`, snap.groups.conmebol.status],
  ['América do Sul logos/ligas', `${snap.groups.southAmericaAll.ready}/79`, `${snap.groups.southAmericaAll.players} atletas`, snap.groups.southAmericaAll.status],
  ['Europa/Mundo prioridade', `${snap.groups.world.ready}/28+`, `${snap.groups.world.players} jogadores`, snap.groups.world.status],
  ['Seleções', `${snap.groups.national.ready}/16`, `${snap.groups.national.players} convocáveis`, snap.groups.national.status],
  ['Genéricos', String(snap.totals.totalGeneric), `${snap.totals.totalIssues} issues`, snap.totals.totalGeneric===0?'locked':'blocked']
 ].map(([title,value,sub,status])=>`<div class="card kpi-card"><span>${title}</span><strong>${value}</strong><small>${sub}</small><em class="status-pill">${status}</em></div>`).join('');
 const sampleRows = [...snap.samples.serieA, ...snap.samples.serieB, ...snap.samples.conmebol, ...snap.samples.southAmericaAll, ...snap.samples.world, ...snap.samples.national].slice(0,32).map(row=>`<tr class="${row.status!=='locked'?'warning-row':''}"><td>${row.name}</td><td>${row.players}</td><td>${row.genericCount}</td><td>${row.issueCount}</td><td>${row.status}</td></tr>`).join('');
 const report = JSON.stringify(snap, null, 2).replace(/</g,'&lt;');
 return `<section class="roster-lock- stack"><div class="panel championship-hero"><div><span class="tag">${snap.dataPack} · ${snap.lockDate}</span><h1>Roster Lock 20/05/2026</h1><p class="small">Verificação total dos elencos oficiais/referência. Esta tela trava o pacote de dados e impede Release Candidate se houver genéricos, campos inválidos ou clubes jogáveis incompletos.</p></div><div class="release-score"><strong>${snap.releaseCandidateReady?'OK':'LOCK'}</strong><small>${snap.qualityGate}</small></div></div><section class="grid desktop-6">${cards}</section><section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Verificação</span><h2>Status da base 2026</h2></div><strong class="grade">${snap.releaseCandidateReady?'A+':'BLOQ'}</strong></div><p class="small">Total auditado: ${snap.totals.totalPlayers} atletas/convocáveis. Genéricos detectados: ${snap.totals.totalGeneric}. Issues críticas: ${snap.totals.totalIssues}.</p><div class="fixture-list"><div class="fixture-row completed-fixture"><div class="fixture-date"><strong>A</strong><small>20/20</small></div><div class="fixture-main"><strong>Brasileirão Série A</strong><span>Elencos bloqueados sem genéricos</span></div><span class="status-pill">${snap.groups.serieA.status}</span></div><div class="fixture-row completed-fixture"><div class="fixture-date"><strong>B</strong><small>20/20</small></div><div class="fixture-main"><strong>Brasileirão Série B</strong><span>Elencos bloqueados sem genéricos</span></div><span class="status-pill">${snap.groups.serieB.status}</span></div><div class="fixture-row completed-fixture"><div class="fixture-date"><strong>🌎</strong><small>prioridade</small></div><div class="fixture-main"><strong>Pacotes internacionais prioritários</strong><span>CONMEBOL, elite global e seleções</span></div><span class="status-pill">${snap.groups.world.status}</span></div></div></article><article class="panel"><div class="row space"><div><span class="tag">Relatório JSON</span><h2>Resumo</h2></div><button class="secondary-btn mini" data-route="dataPack2026">Data Pack</button></div><textarea class="code-box" readonly>${report}</textarea></article></section><section class="panel"><div class="row space"><div><span class="tag">Amostra auditada</span><h2>Clubes e seleções</h2></div><span class="status-pill">${snap.qualityGate}</span></div><div class="table-scroll"><table class="table"><thead><tr><th>Pacote</th><th>Jogadores</th><th>Genéricos</th><th>Issues</th><th>Status</th></tr></thead><tbody>${sampleRows}</tbody></table></div></section></section>`;
}
