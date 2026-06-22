export const WORLD_COMPLETE_VERSION = 'v5.2.0';

export const worldLeagueCatalog = [
  {id:'premier-league', name:'Premier League', country:'Inglaterra', confederation:'UEFA', clubs:20, level:94, reputation:98, calendar:'Agosto-Maio', playable:'simulada', slots:{champions:4, europa:2, relegation:3}, marketWeight:1.0},
  {id:'laliga', name:'LaLiga', country:'Espanha', confederation:'UEFA', clubs:20, level:91, reputation:95, calendar:'Agosto-Maio', playable:'simulada', slots:{champions:4, europa:2, relegation:3}, marketWeight:.92},
  {id:'serie-a-italia', name:'Serie A Itália', country:'Itália', confederation:'UEFA', clubs:20, level:89, reputation:92, calendar:'Agosto-Maio', playable:'simulada', slots:{champions:4, europa:2, relegation:3}, marketWeight:.86},
  {id:'bundesliga', name:'Bundesliga', country:'Alemanha', confederation:'UEFA', clubs:18, level:88, reputation:91, calendar:'Agosto-Maio', playable:'simulada', slots:{champions:4, europa:2, relegation:3}, marketWeight:.84},
  {id:'ligue-1', name:'Ligue 1', country:'França', confederation:'UEFA', clubs:18, level:85, reputation:88, calendar:'Agosto-Maio', playable:'simulada', slots:{champions:3, europa:2, relegation:3}, marketWeight:.76},
  {id:'liga-portugal', name:'Liga Portugal', country:'Portugal', confederation:'UEFA', clubs:18, level:80, reputation:83, calendar:'Agosto-Maio', playable:'simulada', slots:{champions:2, europa:2, relegation:3}, marketWeight:.64},
  {id:'brasileirao-a', name:'Brasileirão Série A', country:'Brasil', confederation:'CONMEBOL', clubs:20, level:82, reputation:86, calendar:'Abril-Dezembro', playable:'jogável', slots:{libertadores:5, sulamericana:7, relegation:4}, marketWeight:.72},
  {id:'argentina-primera', name:'Liga Argentina', country:'Argentina', confederation:'CONMEBOL', clubs:28, level:78, reputation:80, calendar:'Fevereiro-Dezembro', playable:'simulada', slots:{libertadores:4, sulamericana:6, relegation:2}, marketWeight:.58},
  {id:'mls', name:'MLS', country:'Estados Unidos', confederation:'CONCACAF', clubs:29, level:74, reputation:76, calendar:'Fevereiro-Dezembro', playable:'simulada', slots:{continental:5, playoffs:18, relegation:0}, marketWeight:.62},
  {id:'saudi-pro-league', name:'Saudi Pro League', country:'Arábia Saudita', confederation:'AFC', clubs:18, level:76, reputation:78, calendar:'Agosto-Maio', playable:'simulada', slots:{continental:4, relegation:3}, marketWeight:.70},
  {id:'j1-league', name:'J1 League', country:'Japão', confederation:'AFC', clubs:20, level:72, reputation:73, calendar:'Fevereiro-Dezembro', playable:'simulada', slots:{continental:3, relegation:3}, marketWeight:.42},
  {id:'liga-mx', name:'Liga MX', country:'México', confederation:'CONCACAF', clubs:18, level:75, reputation:77, calendar:'Julho-Maio', playable:'simulada', slots:{continental:4, playoffs:12, relegation:0}, marketWeight:.55}
];

export const globalClubPools = {
  'premier-league':['Manchester City','Liverpool','Arsenal','Chelsea','Manchester United','Tottenham','Newcastle','Aston Villa'],
  'laliga':['Real Madrid','Barcelona','Atlético de Madrid','Sevilla','Real Sociedad','Athletic Club','Villarreal','Betis'],
  'serie-a-italia':['Inter de Milão','Milan','Juventus','Napoli','Roma','Lazio','Atalanta','Fiorentina'],
  'bundesliga':['Bayern de Munique','Borussia Dortmund','Bayer Leverkusen','RB Leipzig','Stuttgart','Eintracht Frankfurt','Wolfsburg','Freiburg'],
  'ligue-1':['Paris Saint-Germain','Olympique Marseille','Lyon','Monaco','Lille','Nice','Rennes','Lens'],
  'liga-portugal':['Benfica','Porto','Sporting','Braga','Vitória SC','Boavista','Famalicão','Rio Ave'],
  'argentina-primera':['River Plate','Boca Juniors','Racing','Independiente','San Lorenzo','Estudiantes','Vélez','Talleres'],
  'mls':['Inter Miami','LAFC','Seattle Sounders','Atlanta United','LA Galaxy','Columbus Crew','New York City','Orlando City'],
  'saudi-pro-league':['Al Hilal','Al Nassr','Al Ittihad','Al Ahli','Al Shabab','Al Ettifaq','Al Taawoun','Al Fateh'],
  'j1-league':['Urawa Reds','Kawasaki Frontale','Yokohama F. Marinos','Vissel Kobe','Sanfrecce Hiroshima','Gamba Osaka','FC Tokyo','Kashima Antlers'],
  'liga-mx':['América','Monterrey','Tigres','Cruz Azul','Chivas','Pumas','Toluca','Pachuca']
};

export const europeanCompetitions = [
  {id:'uefa-champions-league', name:'UEFA Champions League', participants:36, phase:'Liga + mata-mata', prize:'€ 120M+', prestige:100, months:'Setembro-Maio'},
  {id:'uefa-europa-league', name:'UEFA Europa League', participants:36, phase:'Liga + mata-mata', prize:'€ 45M+', prestige:88, months:'Setembro-Maio'},
  {id:'uefa-conference-league', name:'UEFA Conference League', participants:36, phase:'Liga + mata-mata', prize:'€ 18M+', prestige:75, months:'Setembro-Maio'}
];

export const globalCalendarWindows = [
  {month:'Janeiro', focus:'janela internacional secundária', risk:'mercado europeu ativo', clubLoad:62, internationalLoad:12},
  {month:'Fevereiro', focus:'início de ligas americanas/asiáticas', risk:'pré-temporada e estaduais', clubLoad:72, internationalLoad:18},
  {month:'Março', focus:'Data FIFA e eliminatórias', risk:'desfalques por seleção', clubLoad:68, internationalLoad:76},
  {month:'Abril', focus:'arranque do Brasileirão e fases continentais', risk:'calendário misto', clubLoad:86, internationalLoad:34},
  {month:'Maio', focus:'finais europeias e rodada nacional', risk:'mercado começa a aquecer', clubLoad:90, internationalLoad:22},
  {month:'Junho', focus:'janela de meio de ano e torneios de seleção', risk:'Copa América/Copa do Mundo quando houver', clubLoad:74, internationalLoad:88},
  {month:'Julho', focus:'pré-temporada europeia e janela global', risk:'assédio internacional', clubLoad:70, internationalLoad:46},
  {month:'Agosto', focus:'início da temporada europeia', risk:'últimos dias de janela', clubLoad:82, internationalLoad:28},
  {month:'Setembro', focus:'UEFA/CONMEBOL + Data FIFA', risk:'viagens e fadiga', clubLoad:88, internationalLoad:72},
  {month:'Outubro', focus:'reta decisiva continental', risk:'rodadas críticas', clubLoad:92, internationalLoad:70},
  {month:'Novembro', focus:'finais sul-americanas e decisão de ligas', risk:'pressão máxima', clubLoad:96, internationalLoad:50},
  {month:'Dezembro', focus:'Mundial/Intercontinental e encerramento', risk:'finais e transição de temporada', clubLoad:84, internationalLoad:20}
];

export const worldCompleteRules = {
  season: 2026,
  mode: 'simulação global integrada',
  minimumLeagues: 12,
  minimumEuropeanCompetitions: 3,
  simulatedDepth: 'clubes principais + tabela compacta + campeões + vagas continentais',
  safety: {
    globalCalendarGuard: true,
    duplicateClubGuard: true,
    marketWeightGuard: true,
    continentalSlotGuard: true,
    rankingFallback: true,
    hiddenDevDiagnostics: true
  }
};
