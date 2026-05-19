// Vale Futebol Manager Gold Edition - gameData v2.6.2
// Brasil 2026: Série A/Série B atualizadas por tabela CBF consultada em 19/05/2026.
export const countries = [
  {
    "code": "br",
    "name": "Brasil",
    "continent": "América do Sul"
  },
  {
    "code": "ar",
    "name": "Argentina",
    "continent": "América do Sul"
  },
  {
    "code": "uy",
    "name": "Uruguai",
    "continent": "América do Sul"
  },
  {
    "code": "cl",
    "name": "Chile",
    "continent": "América do Sul"
  },
  {
    "code": "co",
    "name": "Colômbia",
    "continent": "América do Sul"
  },
  {
    "code": "py",
    "name": "Paraguai",
    "continent": "América do Sul"
  },
  {
    "code": "ec",
    "name": "Equador",
    "continent": "América do Sul"
  },
  {
    "code": "pe",
    "name": "Peru",
    "continent": "América do Sul"
  },
  {
    "code": "mx",
    "name": "México",
    "continent": "América do Norte"
  },
  {
    "code": "us",
    "name": "Estados Unidos",
    "continent": "América do Norte"
  },
  {
    "code": "gb",
    "name": "Inglaterra",
    "continent": "Europa"
  },
  {
    "code": "es",
    "name": "Espanha",
    "continent": "Europa"
  },
  {
    "code": "pt",
    "name": "Portugal",
    "continent": "Europa"
  },
  {
    "code": "it",
    "name": "Itália",
    "continent": "Europa"
  },
  {
    "code": "de",
    "name": "Alemanha",
    "continent": "Europa"
  },
  {
    "code": "fr",
    "name": "França",
    "continent": "Europa"
  },
  {
    "code": "nl",
    "name": "Holanda",
    "continent": "Europa"
  },
  {
    "code": "be",
    "name": "Bélgica",
    "continent": "Europa"
  },
  {
    "code": "tr",
    "name": "Turquia",
    "continent": "Europa"
  },
  {
    "code": "sa",
    "name": "Arábia Saudita",
    "continent": "Ásia"
  },
  {
    "code": "ve",
    "name": "Venezuela",
    "continent": "América do Sul"
  },
  {
    "code": "bo",
    "name": "Bolívia",
    "continent": "América do Sul"
  }
];
export const gameModes = [
  {
    "id": "career",
    "name": "Carreira esportiva completa",
    "short": "Carreira",
    "desc": "Comece com metas reais, pressão de diretoria, reputação, propostas de clubes e seleção nacional."
  },
  {
    "id": "sandbox",
    "name": "Sandbox livre",
    "short": "Sandbox",
    "desc": "Liberdade para testar clubes, competições, elencos e partidas sem travas rígidas de reputação."
  }
];
export const leagueCatalog = [
  {
    "id": "brasileirao-a",
    "country": "br",
    "name": "Brasileirão Série A 2026",
    "tier": 1
  },
  {
    "id": "brasileirao-b",
    "country": "br",
    "name": "Brasileirão Série B 2026",
    "tier": 2
  },
  {
    "id": "argentina-liga",
    "country": "ar",
    "name": "Liga Profesional Argentina",
    "tier": 1
  },
  {
    "id": "premier-league",
    "country": "gb",
    "name": "Premier League",
    "tier": 1
  },
  {
    "id": "laliga",
    "country": "es",
    "name": "LaLiga",
    "tier": 1
  },
  {
    "id": "serie-a-italia",
    "country": "it",
    "name": "Serie A Itália",
    "tier": 1
  },
  {
    "id": "bundesliga",
    "country": "de",
    "name": "Bundesliga",
    "tier": 1
  },
  {
    "id": "ligue-1",
    "country": "fr",
    "name": "Ligue 1",
    "tier": 1
  },
  {
    "id": "liga-portugal",
    "country": "pt",
    "name": "Liga Portugal",
    "tier": 1
  },
  {
    "id": "eredivisie",
    "country": "nl",
    "name": "Eredivisie",
    "tier": 1
  },
  {
    "id": "mls",
    "country": "us",
    "name": "MLS",
    "tier": 1
  },
  {
    "id": "saudi-pro-league",
    "country": "sa",
    "name": "Saudi Pro League",
    "tier": 1
  }
];
export const teams = [
  {
    "id": "palmeiras",
    "name": "Palmeiras",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 88,
    "budget": 165,
    "value": 450,
    "stadium": "Allianz Parque",
    "reputation": 88,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "flamengo",
    "name": "Flamengo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 89,
    "budget": 185,
    "value": 520,
    "stadium": "Maracanã",
    "reputation": 89,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "fluminense",
    "name": "Fluminense",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 84,
    "budget": 112,
    "value": 270,
    "stadium": "Maracanã",
    "reputation": 84,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "sao-paulo",
    "name": "São Paulo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 82,
    "budget": 96,
    "value": 235,
    "stadium": "Morumbis",
    "reputation": 82,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "athletico-pr",
    "name": "Athletico Paranaense",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 82,
    "budget": 93,
    "value": 225,
    "stadium": "Ligga Arena",
    "reputation": 82,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "red-bull-bragantino",
    "name": "Red Bull Bragantino",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 78,
    "budget": 74,
    "value": 170,
    "stadium": "Cícero de Souza Marques",
    "reputation": 78,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "bahia",
    "name": "Bahia",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 79,
    "budget": 86,
    "value": 195,
    "stadium": "Arena Fonte Nova",
    "reputation": 79,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "coritiba",
    "name": "Coritiba SAF",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 74,
    "budget": 50,
    "value": 95,
    "stadium": "Couto Pereira",
    "reputation": 74,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "botafogo",
    "name": "Botafogo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 83,
    "budget": 118,
    "value": 280,
    "stadium": "Nilton Santos",
    "reputation": 83,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "atletico-mg",
    "name": "Atlético-MG",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 83,
    "budget": 120,
    "value": 290,
    "stadium": "Arena MRV",
    "reputation": 83,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "internacional",
    "name": "Internacional",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 81,
    "budget": 92,
    "value": 230,
    "stadium": "Beira-Rio",
    "reputation": 81,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "vasco",
    "name": "Vasco da Gama SAF",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 78,
    "budget": 72,
    "value": 180,
    "stadium": "São Januário",
    "reputation": 78,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "cruzeiro",
    "name": "Cruzeiro",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 80,
    "budget": 84,
    "value": 210,
    "stadium": "Mineirão",
    "reputation": 80,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "vitoria",
    "name": "Vitória",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 73,
    "budget": 42,
    "value": 88,
    "stadium": "Barradão",
    "reputation": 73,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "gremio",
    "name": "Grêmio",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 81,
    "budget": 86,
    "value": 220,
    "stadium": "Arena do Grêmio",
    "reputation": 81,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "santos",
    "name": "Santos FC",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 79,
    "budget": 92,
    "value": 210,
    "stadium": "Vila Belmiro",
    "reputation": 79,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "corinthians",
    "name": "Corinthians",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 80,
    "budget": 94,
    "value": 240,
    "stadium": "Neo Química Arena",
    "reputation": 80,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "remo",
    "name": "Remo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 70,
    "budget": 32,
    "value": 64,
    "stadium": "Baenão",
    "reputation": 70,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "mirassol",
    "name": "Mirassol",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 71,
    "budget": 36,
    "value": 72,
    "stadium": "Maião",
    "reputation": 71,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "chapecoense",
    "name": "Chapecoense",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A 2026",
    "season": 2026,
    "level": 69,
    "budget": 30,
    "value": 58,
    "stadium": "Arena Condá",
    "reputation": 69,
    "board": "Classificar para competições compatíveis com a força do elenco",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série A 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "vila-nova",
    "name": "Vila Nova",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 69,
    "budget": 30,
    "value": 60,
    "stadium": "Onésio Brasileiro Alvarenga",
    "reputation": 69,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "fortaleza",
    "name": "Fortaleza SAF",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 77,
    "budget": 67,
    "value": 150,
    "stadium": "Castelão",
    "reputation": 77,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "ceara",
    "name": "Ceará",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 74,
    "budget": 48,
    "value": 100,
    "stadium": "Castelão",
    "reputation": 74,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "novorizontino",
    "name": "Novorizontino SAF",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 71,
    "budget": 38,
    "value": 75,
    "stadium": "Jorge Ismael de Biasi",
    "reputation": 71,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "avai",
    "name": "Avaí",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 70,
    "budget": 36,
    "value": 70,
    "stadium": "Ressacada",
    "reputation": 70,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "athletic-club",
    "name": "Athletic Club",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 68,
    "budget": 31,
    "value": 58,
    "stadium": "Arena Sicredi",
    "reputation": 68,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "operario",
    "name": "Operário",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 69,
    "budget": 33,
    "value": 62,
    "stadium": "Germano Krüger",
    "reputation": 69,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "botafogo-sp",
    "name": "Botafogo-SP",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 68,
    "budget": 30,
    "value": 55,
    "stadium": "Santa Cruz",
    "reputation": 68,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "sao-bernardo",
    "name": "São Bernardo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 68,
    "budget": 30,
    "value": 56,
    "stadium": "Primeiro de Maio",
    "reputation": 68,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "criciuma",
    "name": "Criciúma",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 71,
    "budget": 39,
    "value": 78,
    "stadium": "Heriberto Hülse",
    "reputation": 71,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "juventude",
    "name": "Juventude",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 72,
    "budget": 42,
    "value": 82,
    "stadium": "Alfredo Jaconi",
    "reputation": 72,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "goias",
    "name": "Goiás",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 73,
    "budget": 45,
    "value": 90,
    "stadium": "Serrinha",
    "reputation": 73,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "sport-recife",
    "name": "Sport Recife",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 74,
    "budget": 48,
    "value": 98,
    "stadium": "Ilha do Retiro",
    "reputation": 74,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "nautico",
    "name": "Náutico",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 67,
    "budget": 28,
    "value": 52,
    "stadium": "Aflitos",
    "reputation": 67,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "cuiaba",
    "name": "Cuiabá SAF",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 71,
    "budget": 40,
    "value": 80,
    "stadium": "Arena Pantanal",
    "reputation": 71,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "londrina",
    "name": "Londrina SAF",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 67,
    "budget": 27,
    "value": 50,
    "stadium": "Estádio do Café",
    "reputation": 67,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "atletico-go",
    "name": "Atlético-GO SAF",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 71,
    "budget": 39,
    "value": 78,
    "stadium": "Antônio Accioly",
    "reputation": 71,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "ponte-preta",
    "name": "Ponte Preta",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 68,
    "budget": 30,
    "value": 58,
    "stadium": "Moisés Lucarelli",
    "reputation": 68,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "crb",
    "name": "CRB",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 68,
    "budget": 31,
    "value": 60,
    "stadium": "Rei Pelé",
    "reputation": 68,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "america-mg",
    "name": "América-MG",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B 2026",
    "season": 2026,
    "level": 72,
    "budget": 42,
    "value": 84,
    "stadium": "Independência",
    "reputation": 72,
    "board": "Disputar acesso ou estabilizar a temporada",
    "difficulty": "Desafio",
    "competitions": [
      "Brasileirão Série B 2026",
      "Copa do Brasil"
    ]
  },
  {
    "id": "river-plate",
    "name": "River Plate",
    "country": "ar",
    "countryName": "Argentina",
    "leagueId": "argentina-liga",
    "league": "Liga Profesional Argentina",
    "season": 2026,
    "level": 84,
    "budget": 110,
    "value": 260,
    "stadium": "Monumental",
    "reputation": 84,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Liga Profesional Argentina",
      "Copa nacional"
    ]
  },
  {
    "id": "boca-juniors",
    "name": "Boca Juniors",
    "country": "ar",
    "countryName": "Argentina",
    "leagueId": "argentina-liga",
    "league": "Liga Profesional Argentina",
    "season": 2026,
    "level": 83,
    "budget": 105,
    "value": 245,
    "stadium": "La Bombonera",
    "reputation": 83,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Liga Profesional Argentina",
      "Copa nacional"
    ]
  },
  {
    "id": "manchester-city",
    "name": "Manchester City",
    "country": "gb",
    "countryName": "Inglaterra",
    "leagueId": "premier-league",
    "league": "Premier League",
    "season": 2026,
    "level": 92,
    "budget": 300,
    "value": 980,
    "stadium": "Etihad Stadium",
    "reputation": 92,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Premier League",
      "Copa nacional"
    ]
  },
  {
    "id": "liverpool",
    "name": "Liverpool",
    "country": "gb",
    "countryName": "Inglaterra",
    "leagueId": "premier-league",
    "league": "Premier League",
    "season": 2026,
    "level": 91,
    "budget": 285,
    "value": 900,
    "stadium": "Anfield",
    "reputation": 91,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Premier League",
      "Copa nacional"
    ]
  },
  {
    "id": "real-madrid",
    "name": "Real Madrid",
    "country": "es",
    "countryName": "Espanha",
    "leagueId": "laliga",
    "league": "LaLiga",
    "season": 2026,
    "level": 94,
    "budget": 330,
    "value": 1100,
    "stadium": "Santiago Bernabéu",
    "reputation": 94,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "LaLiga",
      "Copa nacional"
    ]
  },
  {
    "id": "barcelona",
    "name": "Barcelona",
    "country": "es",
    "countryName": "Espanha",
    "leagueId": "laliga",
    "league": "LaLiga",
    "season": 2026,
    "level": 92,
    "budget": 300,
    "value": 950,
    "stadium": "Camp Nou",
    "reputation": 92,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "LaLiga",
      "Copa nacional"
    ]
  },
  {
    "id": "internazionale",
    "name": "Internazionale",
    "country": "it",
    "countryName": "Itália",
    "leagueId": "serie-a-italia",
    "league": "Serie A Itália",
    "season": 2026,
    "level": 90,
    "budget": 230,
    "value": 720,
    "stadium": "San Siro",
    "reputation": 90,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Serie A Itália",
      "Copa nacional"
    ]
  },
  {
    "id": "juventus",
    "name": "Juventus",
    "country": "it",
    "countryName": "Itália",
    "leagueId": "serie-a-italia",
    "league": "Serie A Itália",
    "season": 2026,
    "level": 88,
    "budget": 215,
    "value": 650,
    "stadium": "Allianz Stadium",
    "reputation": 88,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Serie A Itália",
      "Copa nacional"
    ]
  },
  {
    "id": "bayern-munchen",
    "name": "Bayern München",
    "country": "de",
    "countryName": "Alemanha",
    "leagueId": "bundesliga",
    "league": "Bundesliga",
    "season": 2026,
    "level": 93,
    "budget": 300,
    "value": 980,
    "stadium": "Allianz Arena",
    "reputation": 93,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Bundesliga",
      "Copa nacional"
    ]
  },
  {
    "id": "borussia-dortmund",
    "name": "Borussia Dortmund",
    "country": "de",
    "countryName": "Alemanha",
    "leagueId": "bundesliga",
    "league": "Bundesliga",
    "season": 2026,
    "level": 87,
    "budget": 180,
    "value": 560,
    "stadium": "Signal Iduna Park",
    "reputation": 87,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Bundesliga",
      "Copa nacional"
    ]
  },
  {
    "id": "paris-sg",
    "name": "Paris SG",
    "country": "fr",
    "countryName": "França",
    "leagueId": "ligue-1",
    "league": "Ligue 1",
    "season": 2026,
    "level": 92,
    "budget": 310,
    "value": 1000,
    "stadium": "Parc des Princes",
    "reputation": 92,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Ligue 1",
      "Copa nacional"
    ]
  },
  {
    "id": "benfica",
    "name": "Benfica",
    "country": "pt",
    "countryName": "Portugal",
    "leagueId": "liga-portugal",
    "league": "Liga Portugal",
    "season": 2026,
    "level": 86,
    "budget": 150,
    "value": 430,
    "stadium": "Estádio da Luz",
    "reputation": 86,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Liga Portugal",
      "Copa nacional"
    ]
  },
  {
    "id": "ajax",
    "name": "Ajax",
    "country": "nl",
    "countryName": "Holanda",
    "leagueId": "eredivisie",
    "league": "Eredivisie",
    "season": 2026,
    "level": 83,
    "budget": 105,
    "value": 300,
    "stadium": "Johan Cruijff Arena",
    "reputation": 83,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Eredivisie",
      "Copa nacional"
    ]
  },
  {
    "id": "inter-miami",
    "name": "Inter Miami",
    "country": "us",
    "countryName": "Estados Unidos",
    "leagueId": "mls",
    "league": "MLS",
    "season": 2026,
    "level": 80,
    "budget": 90,
    "value": 250,
    "stadium": "Chase Stadium",
    "reputation": 80,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "MLS",
      "Copa nacional"
    ]
  },
  {
    "id": "al-hilal",
    "name": "Al Hilal",
    "country": "sa",
    "countryName": "Arábia Saudita",
    "leagueId": "saudi-pro-league",
    "league": "Saudi Pro League",
    "season": 2026,
    "level": 86,
    "budget": 220,
    "value": 520,
    "stadium": "Kingdom Arena",
    "reputation": 86,
    "board": "Projeto internacional",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Saudi Pro League",
      "Copa nacional"
    ]
  }
];
export const screens = [
  [
    "lobby",
    "Lobby",
    "🏠"
  ],
  [
    "championship",
    "Campeonato",
    "🏆"
  ],
  [
    "calendar",
    "Agenda",
    "📅"
  ],
  [
    "formation",
    "Tática",
    "🧩"
  ],
  [
    "training",
    "Treino",
    "🔶"
  ],
  [
    "standings",
    "Tabela",
    "📊"
  ],
  [
    "transfers",
    "Transferências",
    "🔁"
  ],
  [
    "staff",
    "Staff",
    "👥"
  ],
  [
    "sponsorship",
    "Patrocínio",
    "🤝"
  ],
  [
    "club",
    "Clube",
    "🛡️"
  ],
  [
    "settings",
    "Config",
    "⚙️"
  ]
];
export const players = [
  [
    "Neymar",
    "PE",
    84
  ],
  [
    "Gabriel Barbosa",
    "ATA",
    79
  ],
  [
    "Rony",
    "ATA",
    76
  ],
  [
    "Gabriel Menino",
    "MC",
    75
  ],
  [
    "Lucas Veríssimo",
    "ZAG",
    77
  ],
  [
    "Mayke",
    "LD",
    71
  ],
  [
    "Zé Rafael",
    "MC",
    76
  ],
  [
    "Álvaro Barreal",
    "MEI",
    75
  ]
];
export const tableRows = [
  "Palmeiras",
  "Flamengo",
  "Fluminense",
  "São Paulo",
  "Athletico Paranaense",
  "Red Bull Bragantino",
  "Bahia",
  "Coritiba SAF",
  "Botafogo",
  "Atlético-MG",
  "Internacional",
  "Vasco da Gama SAF",
  "Cruzeiro",
  "Vitória",
  "Grêmio",
  "Santos FC",
  "Corinthians",
  "Remo",
  "Mirassol",
  "Chapecoense"
];
export const commentary = [
  "Carreira 2026 iniciada.",
  "Calendário gerado conforme clube escolhido.",
  "Partida avança automaticamente quando o modo auto estiver ativo.",
  "Quatro melhores da Série A entram na Libertadores.",
  "Quatro piores da Série A caem para a Série B.",
  "Quatro melhores da Série B sobem para a Série A."
];
