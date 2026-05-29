import fs from 'fs';
import path from 'path';
import { officialSerieA2026Rosters } from '../js/data/officialSerieA2026RosterData.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const LOCK = '2026-05-20';
const today = '2026-05-29';
const roleMap = { GOL:'Goleiro', ZAG:'Zagueiro', LE:'Lateral Esquerdo', LD:'Lateral Direito', VOL:'Volante', MC:'Meia Central', MEI:'Meia Ofensivo', PE:'Ponta Esquerda', PD:'Ponta Direita', ATA:'Centroavante' };
function slug(value=''){
  return String(value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'jogador';
}
function overallFromValue(value=1,pos='MC',age=24){
  const v = Number(value)||1;
  let base = 62 + Math.min(28, Math.round(Math.log10(v+1)*15));
  if(v >= 20) base += 5;
  if(v >= 8) base += 3;
  if(age < 22) base -= 1;
  if(age > 34) base -= 2;
  if(pos === 'GOL' && value >= 5) base += 2;
  return Math.max(58, Math.min(92, base));
}
function p(clubId, data, idx){
  const [shirt, name, pos, age, nat='br', value=1, contract='2027-12-31', foot='Destro'] = data;
  const overall = overallFromValue(value,pos,age);
  const potential = Math.max(overall, Math.min(94, overall + (age <= 21 ? 8 : age <= 24 ? 5 : age <= 28 ? 2 : 0)));
  const id = `${clubId}-${slug(name)}`;
  return {
    id, name, displayName:name, pos, position:pos, role:roleMap[pos] || 'Jogador', secondaryPositions:[],
    overall, potential, age, nationality:nat, foot, shirt: shirt || idx+1, shirtNumber: shirt || idx+1,
    salary: Math.max(20, Math.round((Number(value)||1)*22 + overall*1.3)), value:Number(value), marketValue:Number(value),
    contract: 24, contractUntil: contract, status: idx < 15 ? 'Principal' : idx < 24 ? 'Rotação' : 'Base/Profissional',
    clubId, dataLock:LOCK, dataSnapshot:LOCK, source:'serie-a-2026-roster-pass-2/public-reference-lock-2026-05-20',
    sourceStatus:'official-reference-pass-2', photo:`assets/players/brazil/serie-a/${clubId}/${id}.png`, isGeneric:false,
    morale:72, form:70, fitness:86
  };
}
function pkg(clubId, clubName, players, source){
  return {
    meta:{ clubId, clubName, leagueId:'brasileirao-a', season:2026, snapshot:'20/05/2026', version:`${clubId}-serie-a-2026-v582`, sourceStatus:'official-locked-pass-2', source, updatedAt:today, rosterPath:`data/rosters/2026/brazil/serie-a/${clubId}.json`, photoFolder:`assets/players/brazil/serie-a/${clubId}/` },
    players: players.map((x,i)=>p(clubId,x,i))
  };
}

const corinthians = pkg('corinthians','Corinthians',[
  [1,'Hugo Souza','GOL',27,'br',11,'2030-12-31'],[32,'Matheus Donelli','GOL',24,'br',2.2,'2028-12-31'],[40,'Felipe Longo','GOL',21,'br',1.2,'2028-12-31'],
  [5,'André Ramalho','ZAG',34,'br',1.5,'2026-12-31'],[4,'Tchoca','ZAG',22,'br',4,'2030-12-31'],[25,'Cacá','ZAG',27,'br',3.5,'2028-12-31'],[3,'Félix Torres','ZAG',29,'ec',3.8,'2027-12-31'],[13,'Gustavo Henrique','ZAG',33,'br',1.2,'2026-12-31'],
  [2,'Matheuzinho','LD',25,'br',5,'2028-12-31'],[23,'Fagner','LD',36,'br',0.6,'2026-12-31'],[46,'Hugo','LE',28,'br',1,'2026-12-31'],[21,'Matheus Bidu','LE',27,'br',2,'2027-12-31'],
  [14,'Raniele','VOL',29,'br',4.5,'2028-12-31'],[8,'Maycon','VOL',28,'br',5,'2027-12-31'],[37,'Ryan','VOL',22,'br',3,'2028-12-31'],[35,'Charles','VOL',30,'br',2.5,'2027-12-31'],
  [27,'Breno Bidon','MC',21,'br',8,'2029-12-31'],[19,'André Carrillo','MC',34,'pe',0.9,'2026-12-31'],[77,'Jesse Lingard','MEI',33,'eng',2.2,'2026-12-31'],[10,'Rodrigo Garro','MEI',28,'ar',12,'2028-12-31'],
  [7,'Memphis Depay','ATA',32,'nl',8,'2026-07-31'],[9,'Yuri Alberto','ATA',25,'br',23,'2030-06-30'],[56,'Gui Negão','ATA',19,'br',7,'2030-06-30'],[37,'Kaio César','PD',22,'br',4,'2027-12-31'],[43,'Talles Magno','PE',24,'br',5,'2027-12-31'],[11,'Ángel Romero','PD',33,'py',1.5,'2026-12-31'],[49,'Kayke','ATA',21,'br',1.2,'2027-12-31']
],'Transfermarkt Corinthians 2026 + notícias públicas de contratação + conferência manual');

const saoPaulo = pkg('sao-paulo','São Paulo FC',[
  [31,'Carlos Coronel','GOL',29,'py',1.5,'2028-12-31'],[23,'Rafael','GOL',36,'br',0.4,'2027-12-31'],[50,'Young','GOL',24,'br',0.1,'2026-12-31'],[52,'Felipe Preis','GOL',20,'br',0.1,'2026-12-31'],
  [28,'Alan Franco','ZAG',29,'ar',4,'2028-12-31'],[4,'Matheus Dória','ZAG',31,'br',1,'2027-12-31'],[35,'Sabino','ZAG',29,'br',1,'2028-12-31'],[2,'Rafael Tolói','ZAG',35,'it',0.8,'2026-12-31'],[5,'Robert Arboleda','ZAG',34,'ec',0.4,'2027-12-31'],[56,'Nicolas','LE',19,'br',0.4,'2029-12-31'],[13,'Enzo Díaz','LE',30,'ar',3,'2028-12-31'],[18,'Wendell','LE',32,'br',1.5,'2027-12-31'],[42,'Maik','LD',21,'br',1.5,'2028-05-31'],[15,'João Moreira','LD',22,'br',1,'2027-06-30'],[19,'Lucas Ramon','LD',32,'br',0.7,'2027-12-31'],[21,'Cédric Soares','LD',34,'pt',0.5,'2027-12-31'],
  [29,'Pablo Maia','VOL',24,'br',5,'2029-12-31'],[30,'Felipe Negrucci','VOL',22,'br',1,'2029-12-31'],[33,'Luan','VOL',27,'br',1,'2026-12-31'],[38,'Hugo Leonardo','VOL',22,'br',0.5,'2028-12-31'],[8,'Marcos Antônio','MC',25,'br',12,'2030-12-31'],[16,'Damián Bobadilla','MC',24,'py',6,'2027-12-31'],[94,'Danielzinho','MC',31,'br',1,'2027-12-31'],[48,'Djhordney','MC',18,'br',0.5,'2030-01-31'],[80,'Cauly','MEI',30,'br',3,'2026-12-31'],[46,'Pedro Ferreira','MEI',19,'br',0.4,'2029-04-30'],
  [11,'Ferreirinha','PE',28,'br',4,'2027-12-31'],[45,'Lucca','PE',18,'br',3,'2028-04-30'],[34,'Tetê','PE',19,'br',1,'2029-09-30'],[37,'Artur','PD',28,'br',8,'2026-12-31'],[7,'Lucas Moura','PD',33,'br',2,'2026-12-31'],[17,'Gonzalo Tapia','ATA',24,'cl',2.5,'2028-12-31'],[9,'Jonathan Calleri','ATA',32,'ar',5,'2027-12-31'],[10,'Oscar','MEI',34,'br',4,'2027-12-31'],[39,'Luciano','ATA',33,'br',1.3,'2028-12-31'],[14,'Paulinho','ATA',21,'br',0.4,'2027-12-31']
],'Transfermarkt São Paulo 2026 + conferência manual');

const santos = pkg('santos','Santos FC',[
  [77,'Gabriel Brazão','GOL',25,'br',12,'2028-12-31'],[12,'Diógenes','GOL',25,'br',0.6,'2027-12-31'],[50,'Rodrigo Falcão','GOL',21,'br',0.4,'2028-12-31'],[45,'João Pedro','GOL',20,'br',0.3,'2028-12-31'],
  [4,'Luan Peres','ZAG',31,'br',2.5,'2027-12-31'],[2,'Adonís Frías','ZAG',28,'ar',3,'2028-12-31'],[26,'João Ananias','ZAG',22,'br',1.2,'2029-12-31'],[3,'Zé Ivaldo','ZAG',29,'br',2,'2027-12-31'],[14,'Lucas Veríssimo','ZAG',30,'br',4,'2027-12-31'],[18,'Igor Vinícius','LD',29,'br',2,'2027-12-31'],[12,'Mayke','LD',33,'br',2,'2027-12-31'],[31,'Gonzalo Escobar','LE',29,'ar',2,'2027-12-31'],[3,'Vinicius Lira','LE',22,'br',0.8,'2028-12-31'],
  [15,'Willian Arão','VOL',34,'br',1.3,'2026-12-31'],[6,'Zé Rafael','VOL',32,'br',2.5,'2027-12-31'],[5,'João Schmidt','VOL',33,'br',1,'2027-12-31'],[8,'Tomás Rincón','VOL',38,'ve',0.1,'2026-12-31'],[25,'Gabriel Menino','VOL',25,'br',6,'2028-12-31'],[28,'Christian Oliva','VOL',29,'uy',2.5,'2027-12-31'],[48,'Gustavinho','MC',20,'br',1,'2029-12-31'],
  [10,'Neymar','MEI',34,'br',8,'2026-12-31'],[49,'Gabriel Bontempo','MC',21,'br',5,'2029-12-31'],[32,'Benjamín Rollheiser','PD',26,'ar',9,'2028-12-31'],[16,'Thaciano','MEI',31,'br',2,'2027-12-31'],[30,'Miguelito','MEI',22,'bo',5,'2027-12-31'],[22,'Álvaro Barreal','PE',25,'ar',4,'2027-12-31'],[11,'Rony','ATA',31,'br',3,'2027-12-31'],[7,'Robinho Junior','PD',18,'br',5,'2031-04-30'],[21,'Moisés','PE',29,'br',3,'2027-12-31'],[47,'Mateus Xavier','PE',19,'br',1.5,'2029-12-31'],[9,'Gabriel Barbosa','ATA',29,'br',3,'2026-12-31'],[19,'Lautaro Díaz','ATA',28,'ar',2.5,'2027-12-31'],[99,'Enzo Boer','PD',21,'br',0.2,'2026-12-31']
],'GE/Transfermarkt/Santos FC 2026 + conferência manual');

const botafogo = pkg('botafogo','Botafogo FR',[
  [24,'Léo Linck','GOL',25,'br',2.5,'2028-12-31'],[22,'Neto','GOL',36,'br',0.9,'2027-06-30'],[1,'Raul','GOL',28,'br',0.4,'2027-12-31'],[40,'Cristhian Loor','GOL',20,'ec',0.35,'2028-12-31'],
  [20,'Alexander Barboza','ZAG',31,'ar',5,'2026-12-31'],[5,'Nahuel Ferraresi','ZAG',27,'ve',4.5,'2026-12-31'],[31,'Kaio','ZAG',30,'br',1.8,'2028-06-30'],[15,'Bastos','ZAG',35,'ao',0.6,'2026-12-31'],[3,'Ythallo','ZAG',21,'br',0.3,'2027-12-31'],[26,'Anthony','ZAG',20,'br',0.3,'2030-03-23'],[13,'Alex Telles','LE',33,'br',2.8,'2026-12-31'],[21,'Marçal','LE',37,'br',0.2,'2026-12-31'],[67,'Jhoan Hernández','LE',20,'co',0.15,'2026-12-31'],[27,'Caio Roque','LE',24,'br',0.2,'2026-12-31'],[2,'Vitinho','LD',26,'br',9,'2029-12-31'],[4,'Mateo Ponte','LD',23,'uy',2,'2028-06-30'],
  [28,'Newton','VOL',26,'br',3,'2027-12-31'],[25,'Allan','VOL',35,'br',1,'2026-12-31'],[55,'Wallace Davi','VOL',19,'br',1,'2029-12-31'],[75,'Huguinho','VOL',18,'br',0.3,'2030-03-31'],[8,'Danilo','MC',25,'br',32,'2029-06-30'],[6,'Cristian Medina','MC',23,'ar',9,'2029-12-31'],[88,'Edenilson','MC',36,'br',0.25,'2026-12-31'],[23,'Santiago Rodríguez','MEI',26,'uy',6,'2028-12-31'],[14,'Jordan Barrera','MEI',20,'co',2.5,'2029-12-31'],
  [10,'Álvaro Montoro','PE',19,'ar',10,'2029-12-31'],[11,'Matheus Martins','PE',22,'br',6,'2028-12-31'],[16,'Nathan Fernandes','PD',21,'br',4,'2029-12-31'],[17,'Júnior Santos','PD',31,'br',3,'2026-12-31'],[77,'Lucas Villalba','PD',25,'uy',1.5,'2029-12-31'],[30,'Joaquín Correa','ATA',31,'ar',1.5,'2027-12-31'],[19,'Arthur Cabral','ATA',28,'br',9,'2028-12-31'],[9,'Chris Ramos','ATA',29,'es',2.5,'2026-06-30'],[37,'Kadir Barría','ATA',18,'pa',2,'2029-12-31']
],'Transfermarkt Botafogo 2026 + conferência manual');

const vasco = pkg('vasco','Vasco da Gama SAF',[
  [1,'Léo Jardim','GOL',31,'br',7,'2028-12-31'],[13,'Daniel Fuzato','GOL',28,'br',0.9,'2026-12-31'],[37,'Pablo','GOL',23,'br',0.05,'2026-12-31'],
  [30,'Robert Renan','ZAG',22,'br',10,'2026-06-30'],[46,'Carlos Cuesta','ZAG',27,'co',8,'2026-12-31'],[4,'Alan Saldivia','ZAG',24,'uy',1.2,'2028-12-31'],[43,'Lucas Freitas','ZAG',25,'br',1,'2027-12-31'],[64,'Walace Falcão','ZAG',21,'br',0.2,'2027-12-31'],[66,'Cuiabano','LE',23,'br',10,'2026-12-31'],[6,'Lucas Piton','LE',25,'br',6,'2028-12-31'],[96,'Paulo Henrique','LD',29,'br',6,'2027-12-31'],[2,'José Luis Rodríguez','LD',29,'uy',1.5,'2027-12-31'],
  [88,'Cauan Barros','VOL',22,'br',5,'2027-12-31'],[23,'Thiago Mendes','VOL',34,'br',1.3,'2027-12-31'],[83,'Ramon Rique','VOL',21,'br',0.4,'2028-12-31'],[3,'Tchê Tchê','MC',33,'br',0.8,'2026-12-31'],[8,'Jair','VOL',31,'br',0.8,'2026-12-31'],[25,'Hugo Moura','VOL',28,'br',1,'2026-12-31'],[85,'Mateus Carvalho','VOL',24,'br',1.2,'2027-12-31'],[98,'JP','MC',21,'br',2,'2027-12-31'],[10,'Johan Rojas','MEI',23,'co',3.8,'2026-12-31'],
  [77,'Spinelli','ATA',20,'br',0.5,'2028-12-31'],[20,'Brenner','ATA',26,'br',4,'2029-12-31'],[18,'Marino Hinestroza','PD',23,'co',4.8,'2029-12-31'],[9,'Matheus França','MEI',22,'br',6,'2026-06-30'],[11,'Andrés Gómez','PE',23,'co',11,'2031-01-31'],[60,'João Vitor','ATA',19,'br',0.8,'2028-12-31'],[17,'Nuno Moreira','PD',26,'pt',7,'2027-12-31'],[7,'David','PE',30,'br',1.5,'2027-12-31'],[28,'Adson','PD',25,'br',2.5,'2027-12-31']
],'Site oficial Vasco + Transfermarkt 2026 + conferência manual');

const merged = { ...officialSerieA2026Rosters, corinthians, 'sao-paulo':saoPaulo, santos, botafogo, vasco };
const source = `export const OFFICIAL_SERIE_A_2026_VERSION = 'v5.8.2-serie-a-pass-2';\nexport const OFFICIAL_SERIE_A_2026_LOCK_DATE = '${LOCK}';\nexport const OFFICIAL_SERIE_A_2026_SOURCE_NOTE = 'Passo 2: Fluminense, Flamengo, Palmeiras, Corinthians, São Paulo, Santos, Botafogo e Vasco com elencos de referência pública/licenciada travados em 20/05/2026; demais clubes seguem bloqueados para RC até conferência.';\nexport const officialSerieA2026Rosters = ${JSON.stringify(merged,null,2)};\nexport function getOfficialSerieA2026Roster(clubId){ return officialSerieA2026Rosters[clubId] || null; }\nexport function listOfficialSerieA2026Coverage(){ return Object.keys(officialSerieA2026Rosters).map(id=>({clubId:id, players:officialSerieA2026Rosters[id].players.length, status:officialSerieA2026Rosters[id].meta.sourceStatus})); }\n`;
fs.writeFileSync(path.join(root,'js/data/officialSerieA2026RosterData.js'), source);
for(const id of ['corinthians','sao-paulo','santos','botafogo','vasco']){
  const dir = path.join(root,'data/rosters/2026/brazil/serie-a');
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,`${id}.json`), JSON.stringify(merged[id],null,2));
}
console.log('updated', Object.keys(merged).length, Object.values(merged).reduce((s,p)=>s+p.players.length,0));
