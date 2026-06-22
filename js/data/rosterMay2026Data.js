export const rosterMay2026Meta = {
  version: 'v4.6.0-may-2026-data-pack',
  snapshotDate: '2026-05-31',
  buildDate: '2026-05-28',
  status: 'licensed-structured-seed',
  scope: 'Brasil Série A/B + base internacional simulável',
  note: 'Pacote estrutural de Maio/2026: valida campos obrigatórios, contratos, salários, idade, overall, potencial, valor e caminhos de foto. Pode receber elencos licenciados completos por JSON sem quebrar a carreira.'
};

export const positionBlueprintMay2026 = [
  ['gk-1','GOL','Goleiro titular',72,77,29,180,5.2,30],
  ['gk-2','GOL','Goleiro reserva',64,69,25,55,0.9,24],
  ['gk-youth','GOL','Goleiro jovem',58,73,19,18,0.3,36],
  ['rb-1','LD','Lateral direito titular',69,74,27,115,2.2,28],
  ['cb-1','ZAG','Zagueiro líder',72,75,30,150,3.0,26],
  ['cb-2','ZAG','Zagueiro de cobertura',70,74,26,120,2.5,30],
  ['cb-3','ZAG','Zagueiro de rotação',65,70,24,70,1.0,20],
  ['lb-1','LE','Lateral esquerdo titular',69,74,27,110,2.1,28],
  ['dm-1','VOL','Volante marcador',71,75,28,130,2.4,28],
  ['cm-1','MC','Meia box-to-box',70,76,25,120,2.8,30],
  ['am-1','MEI','Meia criativo',72,78,24,145,3.6,30],
  ['lw-1','PE','Ponta esquerda',71,77,25,135,3.2,26],
  ['rw-1','PD','Ponta direita',70,76,24,125,2.9,26],
  ['st-1','ATA','Centroavante',72,77,27,155,3.5,28],
  ['rb-2','LD','Lateral reserva',63,69,23,45,0.7,24],
  ['lb-2','LE','Lateral reserva',63,69,23,45,0.7,24],
  ['dm-2','VOL','Volante de rotação',65,71,24,60,1.0,24],
  ['cm-2','MC','Meia de rotação',65,72,23,62,1.1,24],
  ['am-2','MEI','Meia jovem',62,76,20,28,0.8,36],
  ['wing-2','PE','Ponta de rotação',64,73,22,55,1.0,24],
  ['st-2','ATA','Atacante reserva',65,72,24,70,1.1,24],
  ['prospect-1','MC','Promessa da base',59,78,18,14,0.4,42],
  ['prospect-2','ATA','Promessa ofensiva',60,79,19,16,0.5,42]
];

export const clubTierProfilesMay2026 = [
  {match:'flamengo|palmeiras|sao-paulo|corinthians|atletico-mg|internacional|gremio|botafogo|fluminense', bump:8, budget:'elite'},
  {match:'santos|cruzeiro|vasco|bahia|fortaleza|bragantino|athletico|ceara|sport|vitoria', bump:4, budget:'strong'},
  {match:'goias|coritiba|avai|chapecoense|novorizontino|crb|paysandu|remo|amazonas|operario', bump:0, budget:'balanced'}
];

export const may2026RequiredFields = ['id','name','pos','overall','potential','age','salary','value','contract','nationality','foot','shirt','photo'];
export const may2026PositionMinimums = { GOL:2, ZAG:4, LD:1, LE:1, VOL:2, MC:2, MEI:1, PE:1, PD:1, ATA:2 };
export const may2026ValidationRules = {
  minPlayers: 23,
  maxPlayers: 35,
  minAge: 15,
  maxAge: 45,
  minOverall: 40,
  maxOverall: 99,
  minContractMonths: 0,
  maxContractMonths: 72,
  minSalary: 0,
  maxSalary: 2500,
  minValue: 0,
  maxValue: 250
};

export const licensedDataChecklistMay2026 = [
  'Cada clube precisa carregar elenco mínimo de 23 jogadores.',
  'Todo jogador precisa ter posição, idade, overall, potencial, salário, valor e contrato.',
  'Nenhum jogador pode duplicar ID dentro do mesmo clube.',
  'Fotos seguem assets/players/brazil/{clubId}/{playerId}.png com fallback automático.',
  'Se o JSON real/licenciado estiver incompleto, o motor normaliza sem quebrar o save.',
  'O banco Maio/2026 é separado da temporada ativa para permitir migração segura.'
];
