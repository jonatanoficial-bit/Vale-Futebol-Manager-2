export const DATA_PACK_2026_VERSION = 'v5.8.0';
export const DATA_PACK_LOCK_DATE = '2026-05-20';
export const DATA_PACK_LABEL = 'Data Pack 2026.05.20';

export const dataPackRosterPaths2026 = {
  brazilSerieA: 'data/rosters/2026/brazil/serie-a/{clubId}.json',
  brazilSerieB: 'data/rosters/2026/brazil/serie-b/{clubId}.json',
  europe: 'data/rosters/2026/europe/{leagueId}/{clubId}.json',
  southAmerica: 'data/rosters/2026/south-america/{leagueId}/{clubId}.json',
  nationalTeams: 'data/rosters/2026/national-teams/{countryId}.json'
};

export const dataPackPlayerRequiredFields2026 = [
  'id','name','displayName','position','secondaryPositions','age','birthDate','nationality','foot','heightCm','overall','potential','contractUntil','salary','marketValue','shirtNumber','status','clubId','dataLock','source'
];

export const dataPackPlayerTemplate2026 = {
  id: 'clubid-player-slug',
  name: 'Nome oficial do atleta',
  displayName: 'Nome de camisa/apelido',
  position: 'GOL|LD|ZAG|LE|VOL|MC|MEI|PE|PD|ATA',
  secondaryPositions: [],
  age: 24,
  birthDate: '2002-01-01',
  nationality: 'br',
  foot: 'Destro|Canhoto|Ambidestro',
  heightCm: 180,
  overall: 70,
  potential: 74,
  contractUntil: '2027-12-31',
  salary: 0,
  marketValue: 0,
  shirtNumber: 0,
  status: 'titular|reserva|base|emprestado|lesionado',
  clubId: 'clubid',
  dataLock: DATA_PACK_LOCK_DATE,
  source: 'licenciado/oficial/manual',
  photo: 'assets/players/brazil/serie-a/clubid/clubid-player-slug.png'
};

export const dataPackClubMinimums2026 = {
  playableMinPlayers: 25,
  brazilSerieA: 25,
  brazilSerieB: 25,
  worldPlayable: 23,
  simulated: 18,
  nationalTeam: 23,
  nationalTeamIdeal: 26,
  byPosition: { GOL: 2, ZAG: 4, LD: 1, LE: 1, VOL: 2, MC: 2, MEI: 1, ATA: 2 }
};

export const dataPackImportStages2026 = [
  { id:'engine', version:'v5.8.0', title:'Motor oficial de Data Packs 2026', scope:'estrutura, schema, caminhos e bloqueio anti-genérico', status:'entregue' },
  { id:'br-a', version:'v5.8.1-v5.8.4', title:'Brasileirão Série A 2026', scope:'20 clubes, mínimo 25 jogadores reais por clube', status:'em andamento' },
  { id:'br-b', version:'v5.8.2', title:'Brasileirão Série B 2026', scope:'20 clubes, mínimo 25 jogadores reais por clube', status:'planejada' },
  { id:'conmebol', version:'v5.8.3', title:'Libertadores/Sul-Americana 2026', scope:'clubes continentais prioritários', status:'planejada' },
  { id:'world', version:'v5.8.4', title:'Europa e mundo', scope:'grandes ligas, clubes fortes e simulados', status:'planejada' },
  { id:'national', version:'v5.8.5', title:'Seleções nacionais 2026', scope:'convocáveis e listas para Copa do Mundo', status:'planejada' },
  { id:'lock', version:'v5.9.0', title:'Roster Lock 20/05/2026', scope:'auditoria total e bloqueio de RC se houver genéricos', status:'planejada' }
];

export const genericNamePatterns2026 = [
  /\bGK\s?\d+/i, /\bGOL\s?\d+/i, /\bZAG\s?\d+/i, /\bLD\s?\d+/i, /\bLE\s?\d+/i,
  /\bMC\s?\d+/i, /\bMEI\s?\d+/i, /\bVOL\s?\d+/i, /\bATA\s?\d+/i,
  /player\s?\d+/i, /jogador\s?\d+/i, /template/i
];
