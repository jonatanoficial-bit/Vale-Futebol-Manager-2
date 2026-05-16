export const countries = [
  { code:'br', name:'Brasil', continent:'América do Sul' },
  { code:'ar', name:'Argentina', continent:'América do Sul' },
  { code:'uy', name:'Uruguai', continent:'América do Sul' },
  { code:'cl', name:'Chile', continent:'América do Sul' },
  { code:'co', name:'Colômbia', continent:'América do Sul' },
  { code:'py', name:'Paraguai', continent:'América do Sul' },
  { code:'ec', name:'Equador', continent:'América do Sul' },
  { code:'pe', name:'Peru', continent:'América do Sul' },
  { code:'mx', name:'México', continent:'América do Norte' },
  { code:'us', name:'Estados Unidos', continent:'América do Norte' },
  { code:'gb', name:'Inglaterra', continent:'Europa' },
  { code:'es', name:'Espanha', continent:'Europa' },
  { code:'pt', name:'Portugal', continent:'Europa' },
  { code:'it', name:'Itália', continent:'Europa' },
  { code:'de', name:'Alemanha', continent:'Europa' },
  { code:'fr', name:'França', continent:'Europa' },
  { code:'nl', name:'Holanda', continent:'Europa' },
  { code:'be', name:'Bélgica', continent:'Europa' },
  { code:'tr', name:'Turquia', continent:'Europa' },
  { code:'sa', name:'Arábia Saudita', continent:'Ásia' }
];
export const gameModes = [
  { id:'career', name:'Carreira esportiva completa', short:'Carreira', desc:'Comece com metas reais, pressão de diretoria, reputação, propostas de clubes e seleção nacional.' },
  { id:'sandbox', name:'Sandbox livre', short:'Sandbox', desc:'Liberdade para testar clubes, competições, elencos e partidas sem travas rígidas de reputação.' }
];
export const leagueCatalog = [
  { id:'brasileirao-a', country:'br', name:'Brasileirão Série A', tier:1 },
  { id:'brasileirao-b', country:'br', name:'Brasileirão Série B', tier:2 },
  { id:'argentina-liga', country:'ar', name:'Liga Profesional Argentina', tier:1 },
  { id:'premier-league', country:'gb', name:'Premier League', tier:1 },
  { id:'laliga', country:'es', name:'LaLiga', tier:1 },
  { id:'serie-a-italia', country:'it', name:'Serie A Itália', tier:1 },
  { id:'bundesliga', country:'de', name:'Bundesliga', tier:1 },
  { id:'ligue-1', country:'fr', name:'Ligue 1', tier:1 },
  { id:'liga-portugal', country:'pt', name:'Liga Portugal', tier:1 },
  { id:'eredivisie', country:'nl', name:'Eredivisie', tier:1 },
  { id:'mls', country:'us', name:'MLS', tier:1 },
  { id:'saudi-pro-league', country:'sa', name:'Saudi Pro League', tier:1 }
];
export const teams = [
  { id:'santos', name:'Santos FC', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:82, budget:92.5, value:123.8, stadium:'Vila Belmiro', reputation:78, board:'Classificar para competição continental', difficulty:'Médio', competitions:['Brasileirão Série A','Copa do Brasil','Sul-Americana','Paulistão'] },
  { id:'palmeiras', name:'Palmeiras', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:86, budget:140.0, value:210.0, stadium:'Allianz Parque', reputation:88, board:'Disputar títulos nacionais e continentais', difficulty:'Alta cobrança', competitions:['Brasileirão Série A','Copa do Brasil','Libertadores','Paulistão'] },
  { id:'flamengo', name:'Flamengo', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:87, budget:155.0, value:240.0, stadium:'Maracanã', reputation:90, board:'Vencer títulos e valorizar o elenco', difficulty:'Pressão máxima', competitions:['Brasileirão Série A','Copa do Brasil','Libertadores','Carioca'] },
  { id:'sao-paulo', name:'São Paulo', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:80, budget:88.0, value:118.0, stadium:'Morumbi', reputation:82, board:'Retomar protagonismo nacional', difficulty:'Médio', competitions:['Brasileirão Série A','Copa do Brasil','Sul-Americana','Paulistão'] },
  { id:'corinthians', name:'Corinthians', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:80, budget:76.0, value:110.0, stadium:'Neo Química Arena', reputation:83, board:'Equilibrar finanças e brigar por vaga continental', difficulty:'Desafiador', competitions:['Brasileirão Série A','Copa do Brasil','Sul-Americana','Paulistão'] },
  { id:'gremio', name:'Grêmio', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:79, budget:72.0, value:105.0, stadium:'Arena do Grêmio', reputation:80, board:'Campanha segura e base forte', difficulty:'Médio', competitions:['Brasileirão Série A','Copa do Brasil'] },
  { id:'internacional', name:'Internacional', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:79, budget:74.0, value:107.0, stadium:'Beira-Rio', reputation:80, board:'Classificar para torneios continentais', difficulty:'Médio', competitions:['Brasileirão Série A','Copa do Brasil'] },
  { id:'atletico-mg', name:'Atlético-MG', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:83, budget:98.0, value:150.0, stadium:'Arena MRV', reputation:84, board:'Brigar pelo G4 e copa', difficulty:'Alta cobrança', competitions:['Brasileirão Série A','Copa do Brasil','Libertadores'] },
  { id:'cruzeiro', name:'Cruzeiro', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:77, budget:61.0, value:82.0, stadium:'Mineirão', reputation:76, board:'Consolidar projeto esportivo', difficulty:'Reconstrução', competitions:['Brasileirão Série A','Copa do Brasil'] },
  { id:'botafogo', name:'Botafogo', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:78, budget:70.0, value:96.0, stadium:'Nilton Santos', reputation:77, board:'Competir por parte alta da tabela', difficulty:'Médio', competitions:['Brasileirão Série A','Copa do Brasil'] },
  { id:'fluminense', name:'Fluminense', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:81, budget:82.0, value:121.0, stadium:'Maracanã', reputation:81, board:'Manter futebol competitivo', difficulty:'Médio', competitions:['Brasileirão Série A','Copa do Brasil','Libertadores'] },
  { id:'vasco', name:'Vasco', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:75, budget:54.0, value:72.0, stadium:'São Januário', reputation:74, board:'Evoluir sem risco de queda', difficulty:'Difícil', competitions:['Brasileirão Série A','Copa do Brasil'] },
  { id:'bahia', name:'Bahia', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:76, budget:60.0, value:86.0, stadium:'Fonte Nova', reputation:73, board:'Crescimento sustentável', difficulty:'Médio', competitions:['Brasileirão Série A','Copa do Brasil'] },
  { id:'fortaleza', name:'Fortaleza', country:'br', countryName:'Brasil', leagueId:'brasileirao-a', league:'Brasileirão Série A', level:76, budget:58.0, value:78.0, stadium:'Castelão', reputation:72, board:'Campanha competitiva', difficulty:'Médio', competitions:['Brasileirão Série A','Copa do Brasil','Nordestão'] },
  { id:'real-madrid', name:'Real Madrid', country:'es', countryName:'Espanha', leagueId:'laliga', league:'LaLiga', level:92, budget:310.0, value:980.0, stadium:'Santiago Bernabéu', reputation:98, board:'Vencer tudo', difficulty:'Pressão mundial', competitions:['LaLiga','Copa del Rey','Champions League'] },
  { id:'barcelona', name:'Barcelona', country:'es', countryName:'Espanha', leagueId:'laliga', league:'LaLiga', level:89, budget:240.0, value:820.0, stadium:'Camp Nou', reputation:95, board:'Reconstruir domínio europeu', difficulty:'Alta cobrança', competitions:['LaLiga','Copa del Rey','Champions League'] },
  { id:'manchester-city', name:'Manchester City', country:'gb', countryName:'Inglaterra', leagueId:'premier-league', league:'Premier League', level:92, budget:320.0, value:960.0, stadium:'Etihad Stadium', reputation:96, board:'Dominar Inglaterra e Europa', difficulty:'Pressão máxima', competitions:['Premier League','FA Cup','Champions League'] },
  { id:'liverpool', name:'Liverpool', country:'gb', countryName:'Inglaterra', leagueId:'premier-league', league:'Premier League', level:89, budget:250.0, value:790.0, stadium:'Anfield', reputation:94, board:'Disputar títulos', difficulty:'Alta cobrança', competitions:['Premier League','FA Cup','Champions League'] },
  { id:'arsenal', name:'Arsenal', country:'gb', countryName:'Inglaterra', leagueId:'premier-league', league:'Premier League', level:88, budget:235.0, value:760.0, stadium:'Emirates Stadium', reputation:91, board:'Vencer liga em médio prazo', difficulty:'Alta cobrança', competitions:['Premier League','FA Cup','Champions League'] },
  { id:'inter-milan', name:'Inter de Milão', country:'it', countryName:'Itália', leagueId:'serie-a-italia', league:'Serie A Itália', level:88, budget:205.0, value:610.0, stadium:'San Siro', reputation:91, board:'Manter domínio nacional', difficulty:'Alta cobrança', competitions:['Serie A','Coppa Italia','Champions League'] },
  { id:'ac-milan', name:'AC Milan', country:'it', countryName:'Itália', leagueId:'serie-a-italia', league:'Serie A Itália', level:86, budget:190.0, value:550.0, stadium:'San Siro', reputation:90, board:'Voltar ao topo europeu', difficulty:'Alta cobrança', competitions:['Serie A','Coppa Italia','Champions League'] },
  { id:'bayern-munich', name:'Bayern Munich', country:'de', countryName:'Alemanha', leagueId:'bundesliga', league:'Bundesliga', level:90, budget:260.0, value:760.0, stadium:'Allianz Arena', reputation:95, board:'Campeão nacional obrigatório', difficulty:'Pressão máxima', competitions:['Bundesliga','DFB Pokal','Champions League'] },
  { id:'borussia-dortmund', name:'Borussia Dortmund', country:'de', countryName:'Alemanha', leagueId:'bundesliga', league:'Bundesliga', level:85, budget:170.0, value:480.0, stadium:'Signal Iduna Park', reputation:88, board:'Formar talentos e disputar topo', difficulty:'Médio-alto', competitions:['Bundesliga','DFB Pokal','Champions League'] },
  { id:'psg', name:'Paris Saint-Germain', country:'fr', countryName:'França', leagueId:'ligue-1', league:'Ligue 1', level:88, budget:270.0, value:720.0, stadium:'Parc des Princes', reputation:93, board:'Dominar França e vencer Europa', difficulty:'Pressão máxima', competitions:['Ligue 1','Coupe de France','Champions League'] },
  { id:'benfica', name:'Benfica', country:'pt', countryName:'Portugal', leagueId:'liga-portugal', league:'Liga Portugal', level:84, budget:135.0, value:380.0, stadium:'Estádio da Luz', reputation:86, board:'Título nacional e boa Europa', difficulty:'Alta cobrança', competitions:['Liga Portugal','Taça de Portugal','Champions League'] },
  { id:'boca-juniors', name:'Boca Juniors', country:'ar', countryName:'Argentina', leagueId:'argentina-liga', league:'Liga Profesional Argentina', level:81, budget:80.0, value:140.0, stadium:'La Bombonera', reputation:86, board:'Brigar por títulos continentais', difficulty:'Alta pressão', competitions:['Liga Profesional','Copa Argentina','Libertadores'] },
  { id:'river-plate', name:'River Plate', country:'ar', countryName:'Argentina', leagueId:'argentina-liga', league:'Liga Profesional Argentina', level:82, budget:86.0, value:155.0, stadium:'Monumental', reputation:87, board:'Dominar competições nacionais', difficulty:'Alta pressão', competitions:['Liga Profesional','Copa Argentina','Libertadores'] },
  { id:'inter-miami', name:'Inter Miami', country:'us', countryName:'Estados Unidos', leagueId:'mls', league:'MLS', level:78, budget:95.0, value:180.0, stadium:'DRV PNK Stadium', reputation:82, board:'Crescer marca global', difficulty:'Projeto especial', competitions:['MLS','Leagues Cup'] },
  { id:'al-hilal', name:'Al-Hilal', country:'sa', countryName:'Arábia Saudita', leagueId:'saudi-pro-league', league:'Saudi Pro League', level:84, budget:210.0, value:430.0, stadium:'Kingdom Arena', reputation:84, board:'Dominar liga e Ásia', difficulty:'Alta cobrança', competitions:['Saudi Pro League','King Cup','AFC Champions League'] }
];
export const screens = [
  ['lobby','Lobby','🏠'],['championship','Campeonato','🏆'],['calendar','Agenda','📅'],['formation','Tatica','🧩'],['training','Treino','🔶'],['standings','Tabela','📊'],['transfers','Transferencias','🔁'],['staff','Staff','👥'],['sponsorship','Patrocinio','🤝'],['club','Clube','🛡️'],['settings','Config','⚙️']
];
export const players = [
  ['Joao Paulo','GOL',83],['Madson','LD',79],['Gil','ZAG',81],['Joaquim','ZAG',83],['Escobar','LE',78],['Tomas Rincon','VOL',80],['Joao Schmidt','MC',78],['Lucas Lima','MEI',77],['Soteldo','PE',79],['Marcos Leonardo','ATA',82],['Angelo','PD',81]
];
export const tableRows = ['Palmeiras','Flamengo','Sao Paulo','Atletico-MG','Santos FC','Bahia','Internacional','Cruzeiro','Botafogo','Corinthians','Gremio','Fortaleza'];
export const commentary = ['Comeca o jogo na Vila Belmiro.','Santos tenta controlar a posse no meio campo.','Palmeiras fecha as linhas e espera contra-ataque.','Escanteio para o Santos pela direita.','GOOOOL DO SANTOS! Marcos Leonardo abre o placar.','Segundo tempo iniciado.','Santos troca passes e diminui o ritmo.'];
