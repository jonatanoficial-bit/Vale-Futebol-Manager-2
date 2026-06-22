// Vale Futebol Manager Gold Edition - Real Data Pack v3.6.0
// Pacote de dados 2026 criado para manter ligas, elencos, logos e manutenção futura sem quebrar o jogo.
// Observação: divisões 2026 consolidadas; elencos não verificados individualmente aparecem como template seguro editável.

export const realDataVersion = {
  version: 'v3.6.0',
  season: 2026,
  updatedAt: '2026-05-20',
  sourceNote: 'Divisões brasileiras 2026 baseadas em listas públicas de Série A/Série B consultadas em maio de 2026; elencos são editáveis e possuem níveis de confiança por clube.',
  rosterPolicy: 'verified = conferido manualmente; curated = base inicial parcialmente conferida; template = elenco seguro gerado para jogabilidade até substituição pelo usuário.'
};

export const brazilianLeagueTeams2026 = {
  'brasileirao-a': [
  {
    "id": "palmeiras",
    "name": "Palmeiras"
  },
  {
    "id": "flamengo",
    "name": "Flamengo"
  },
  {
    "id": "fluminense",
    "name": "Fluminense"
  },
  {
    "id": "sao-paulo",
    "name": "São Paulo"
  },
  {
    "id": "athletico-pr",
    "name": "Athletico Paranaense"
  },
  {
    "id": "red-bull-bragantino",
    "name": "Red Bull Bragantino"
  },
  {
    "id": "bahia",
    "name": "Bahia"
  },
  {
    "id": "coritiba",
    "name": "Coritiba SAF"
  },
  {
    "id": "botafogo",
    "name": "Botafogo"
  },
  {
    "id": "atletico-mg",
    "name": "Atlético-MG"
  },
  {
    "id": "internacional",
    "name": "Internacional"
  },
  {
    "id": "vasco",
    "name": "Vasco da Gama SAF"
  },
  {
    "id": "cruzeiro",
    "name": "Cruzeiro"
  },
  {
    "id": "vitoria",
    "name": "Vitória"
  },
  {
    "id": "gremio",
    "name": "Grêmio"
  },
  {
    "id": "santos",
    "name": "Santos FC"
  },
  {
    "id": "corinthians",
    "name": "Corinthians"
  },
  {
    "id": "remo",
    "name": "Remo"
  },
  {
    "id": "mirassol",
    "name": "Mirassol"
  },
  {
    "id": "chapecoense",
    "name": "Chapecoense"
  }
],
  'brasileirao-b': [
  {
    "id": "vila-nova",
    "name": "Vila Nova"
  },
  {
    "id": "fortaleza",
    "name": "Fortaleza SAF"
  },
  {
    "id": "ceara",
    "name": "Ceará"
  },
  {
    "id": "novorizontino",
    "name": "Novorizontino SAF"
  },
  {
    "id": "avai",
    "name": "Avaí"
  },
  {
    "id": "athletic-club",
    "name": "Athletic Club"
  },
  {
    "id": "operario",
    "name": "Operário"
  },
  {
    "id": "botafogo-sp",
    "name": "Botafogo-SP"
  },
  {
    "id": "sao-bernardo",
    "name": "São Bernardo"
  },
  {
    "id": "criciuma",
    "name": "Criciúma"
  },
  {
    "id": "juventude",
    "name": "Juventude"
  },
  {
    "id": "goias",
    "name": "Goiás"
  },
  {
    "id": "sport-recife",
    "name": "Sport Recife"
  },
  {
    "id": "nautico",
    "name": "Náutico"
  },
  {
    "id": "cuiaba",
    "name": "Cuiabá SAF"
  },
  {
    "id": "londrina",
    "name": "Londrina SAF"
  },
  {
    "id": "atletico-go",
    "name": "Atlético-GO SAF"
  },
  {
    "id": "ponte-preta",
    "name": "Ponte Preta"
  },
  {
    "id": "crb",
    "name": "CRB"
  },
  {
    "id": "america-mg",
    "name": "América-MG"
  }
]
};

export const leagueRules2026 = {
  'brasileirao-a': { teams:20, rounds:38, relegation:4, libertadoresDirect:4, sulamericanaRange:[5,12], tiebreakers:['points','wins','goalDifference','goalsFor'] },
  'brasileirao-b': { teams:20, rounds:38, promotion:4, relegation:4, tiebreakers:['points','wins','goalDifference','goalsFor'] }
};

export const rosterCoverage2026 = [
  { clubId:'santos', leagueId:'brasileirao-a', status:'verified', players:37, rosterPath:'data/rosters/2026/santos.json', note:'Base ampliada com Neymar, Gabriel Barbosa, Rony, Gabriel Menino, Zé Rafael, Lucas Veríssimo e outros.'},
  ...brazilianLeagueTeams2026['brasileirao-a'].filter(t=>t.id!=='santos').map(t=>({ clubId:t.id, leagueId:'brasileirao-a', status:'template', players:23, rosterPath:`data/rosters/2026/${t.id}.json`, note:'Elenco template seguro para jogabilidade; substituível por JSON real sem mexer no código.' })),
  ...brazilianLeagueTeams2026['brasileirao-b'].map(t=>({ clubId:t.id, leagueId:'brasileirao-b', status:'template', players:23, rosterPath:`data/rosters/2026/${t.id}.json`, note:'Elenco template seguro para jogabilidade; substituível por JSON real sem mexer no código.' }))
];

export const dataMaintenanceChecklist = [
  'Conferir se cada liga possui 20 clubes.',
  'Conferir se cada clube possui ao menos 11 jogadores válidos.',
  'Preferir 23 a 35 atletas por clube para temporada completa.',
  'Manter foto do jogador em assets/players/<pais>/<clube>/<id>.png.',
  'Nunca apagar placeholders: eles impedem travamento quando a imagem real falta.',
  'Atualizar data/rosters/2026/<clube>.json e testar pela tela Atualizar elenco.',
  'Usar status verified apenas quando o elenco for conferido manualmente.'
];

export const clubDataSchema = {
  required:['id','name','pos','overall','potential','age'],
  optional:['role','morale','form','fitness','salary','value','contract','status','nationality','foot','shirt','photo'],
  positions:['GOL','LD','LE','ZAG','VOL','MC','MEI','PE','PD','ATA']
};
