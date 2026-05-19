// Vale Futebol Manager Gold Edition - gameData v2.6.1
// Brasil 2025: Série A/Série B atualizadas com 20 clubes cada; Athletic corrigido para Série B.
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
    "name": "Brasileirão Série A 2025",
    "tier": 1
  },
  {
    "id": "brasileirao-b",
    "country": "br",
    "name": "Brasileirão Série B 2025",
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
    "id": "atletico-mg",
    "name": "Atlético-MG",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 83,
    "budget": 98,
    "value": 150,
    "stadium": "Arena MRV",
    "reputation": 84,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "bahia",
    "name": "Bahia",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 77,
    "budget": 68,
    "value": 96,
    "stadium": "Fonte Nova",
    "reputation": 75,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "botafogo",
    "name": "Botafogo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 80,
    "budget": 90,
    "value": 135,
    "stadium": "Nilton Santos",
    "reputation": 81,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "ceara",
    "name": "Ceará",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 72,
    "budget": 38,
    "value": 48,
    "stadium": "Castelão",
    "reputation": 69,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Desafiador",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil"
    ]
  },
  {
    "id": "corinthians",
    "name": "Corinthians",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 80,
    "budget": 78,
    "value": 112,
    "stadium": "Neo Química Arena",
    "reputation": 83,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Desafiador",
    "competitions": [
      "Brasileirão Série A",
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
    "league": "Brasileirão Série A",
    "level": 79,
    "budget": 82,
    "value": 116,
    "stadium": "Mineirão",
    "reputation": 80,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "flamengo",
    "name": "Flamengo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 88,
    "budget": 160,
    "value": 245,
    "stadium": "Maracanã",
    "reputation": 91,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Pressão máxima",
    "competitions": [
      "Brasileirão Série A",
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
    "league": "Brasileirão Série A",
    "level": 81,
    "budget": 86,
    "value": 124,
    "stadium": "Maracanã",
    "reputation": 82,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "fortaleza",
    "name": "Fortaleza",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 77,
    "budget": 62,
    "value": 84,
    "stadium": "Castelão",
    "reputation": 75,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "gremio",
    "name": "Grêmio",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 79,
    "budget": 74,
    "value": 108,
    "stadium": "Arena do Grêmio",
    "reputation": 80,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "internacional",
    "name": "Internacional",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 80,
    "budget": 80,
    "value": 116,
    "stadium": "Beira-Rio",
    "reputation": 81,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "juventude",
    "name": "Juventude",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 70,
    "budget": 34,
    "value": 42,
    "stadium": "Alfredo Jaconi",
    "reputation": 68,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Difícil",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil"
    ]
  },
  {
    "id": "mirassol",
    "name": "Mirassol",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 69,
    "budget": 30,
    "value": 40,
    "stadium": "Maião",
    "reputation": 66,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Estreante",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil"
    ]
  },
  {
    "id": "palmeiras",
    "name": "Palmeiras",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 87,
    "budget": 145,
    "value": 220,
    "stadium": "Allianz Parque",
    "reputation": 89,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "bragantino",
    "name": "Red Bull Bragantino",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 78,
    "budget": 86,
    "value": 128,
    "stadium": "Nabi Abi Chedid",
    "reputation": 76,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Projeto jovem",
    "competitions": [
      "Brasileirão Série A",
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
    "league": "Brasileirão Série A",
    "level": 82,
    "budget": 92.5,
    "value": 123.8,
    "stadium": "Vila Belmiro",
    "reputation": 78,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Sul-Americana"
    ]
  },
  {
    "id": "sao-paulo",
    "name": "São Paulo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 81,
    "budget": 92,
    "value": 124,
    "stadium": "Morumbi",
    "reputation": 83,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil",
      "Libertadores"
    ]
  },
  {
    "id": "sport",
    "name": "Sport Recife",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 71,
    "budget": 36,
    "value": 45,
    "stadium": "Ilha do Retiro",
    "reputation": 69,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Difícil",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil"
    ]
  },
  {
    "id": "vasco",
    "name": "Vasco",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-a",
    "league": "Brasileirão Série A",
    "level": 76,
    "budget": 58,
    "value": 78,
    "stadium": "São Januário",
    "reputation": 75,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Desafiador",
    "competitions": [
      "Brasileirão Série A",
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
    "league": "Brasileirão Série A",
    "level": 71,
    "budget": 37,
    "value": 46,
    "stadium": "Barradão",
    "reputation": 68,
    "board": "Cumprir meta nacional e evoluir elenco",
    "difficulty": "Difícil",
    "competitions": [
      "Brasileirão Série A",
      "Copa do Brasil"
    ]
  },
  {
    "id": "america-mg",
    "name": "América-MG",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 72,
    "budget": 42,
    "value": 56,
    "stadium": "Independência",
    "reputation": 70,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Acesso obrigatório",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "amazonas",
    "name": "Amazonas FC",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 65,
    "budget": 24,
    "value": 32,
    "stadium": "Carlos Zamith",
    "reputation": 61,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Sobrevivência",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "athletico-pr",
    "name": "Athletico-PR",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 76,
    "budget": 70,
    "value": 96,
    "stadium": "Arena da Baixada",
    "reputation": 78,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Acesso obrigatório",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "atletico-go",
    "name": "Atlético-GO",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 70,
    "budget": 36,
    "value": 47,
    "stadium": "Antônio Accioly",
    "reputation": 69,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Briga pelo acesso",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "avai",
    "name": "Avaí",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 68,
    "budget": 30,
    "value": 40,
    "stadium": "Ressacada",
    "reputation": 66,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "botafogo-sp",
    "name": "Botafogo-SP",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 66,
    "budget": 26,
    "value": 34,
    "stadium": "Santa Cruz",
    "reputation": 64,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Desafiador",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "chapecoense",
    "name": "Chapecoense",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 68,
    "budget": 28,
    "value": 38,
    "stadium": "Arena Condá",
    "reputation": 66,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "coritiba",
    "name": "Coritiba",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 73,
    "budget": 46,
    "value": 64,
    "stadium": "Couto Pereira",
    "reputation": 73,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Acesso obrigatório",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "crb",
    "name": "CRB",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 68,
    "budget": 30,
    "value": 39,
    "stadium": "Rei Pelé",
    "reputation": 66,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "criciuma",
    "name": "Criciúma",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 71,
    "budget": 38,
    "value": 52,
    "stadium": "Heriberto Hülse",
    "reputation": 70,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Briga pelo acesso",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "cuiaba",
    "name": "Cuiabá",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 72,
    "budget": 42,
    "value": 58,
    "stadium": "Arena Pantanal",
    "reputation": 71,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Briga pelo acesso",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "ferroviaria",
    "name": "Ferroviária",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 65,
    "budget": 22,
    "value": 31,
    "stadium": "Fonte Luminosa",
    "reputation": 62,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Sobrevivência",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "goias",
    "name": "Goiás",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 72,
    "budget": 43,
    "value": 59,
    "stadium": "Serrinha",
    "reputation": 72,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Briga pelo acesso",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "novorizontino",
    "name": "Novorizontino",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 70,
    "budget": 32,
    "value": 45,
    "stadium": "Jorge Ismael de Biasi",
    "reputation": 68,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Acesso possível",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "operario-pr",
    "name": "Operário-PR",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 67,
    "budget": 27,
    "value": 35,
    "stadium": "Germano Krüger",
    "reputation": 65,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "paysandu",
    "name": "Paysandu",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 66,
    "budget": 26,
    "value": 35,
    "stadium": "Curuzu",
    "reputation": 65,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "remo",
    "name": "Remo",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 68,
    "budget": 31,
    "value": 43,
    "stadium": "Mangueirão",
    "reputation": 67,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Pressão popular",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "vila-nova",
    "name": "Vila Nova",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 68,
    "budget": 30,
    "value": 41,
    "stadium": "Onésio Brasileiro Alvarenga",
    "reputation": 67,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Médio",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "volta-redonda",
    "name": "Volta Redonda",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 65,
    "budget": 22,
    "value": 30,
    "stadium": "Raulino de Oliveira",
    "reputation": 62,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Sobrevivência",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "athletic-mg",
    "name": "Athletic Club",
    "country": "br",
    "countryName": "Brasil",
    "leagueId": "brasileirao-b",
    "league": "Brasileirão Série B",
    "level": 66,
    "budget": 24,
    "value": 33,
    "stadium": "Arena Sicredi",
    "reputation": 63,
    "board": "Disputar acesso e organizar elenco",
    "difficulty": "Estreante",
    "competitions": [
      "Brasileirão Série B",
      "Copa do Brasil"
    ]
  },
  {
    "id": "real-madrid",
    "name": "Real Madrid",
    "country": "es",
    "countryName": "Espanha",
    "leagueId": "laliga",
    "league": "LaLiga",
    "level": 92,
    "budget": 310,
    "value": 980,
    "stadium": "Santiago Bernabéu",
    "reputation": 98,
    "board": "Disputar títulos",
    "difficulty": "Pressão mundial",
    "competitions": [
      "LaLiga",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "barcelona",
    "name": "Barcelona",
    "country": "es",
    "countryName": "Espanha",
    "leagueId": "laliga",
    "league": "LaLiga",
    "level": 89,
    "budget": 240,
    "value": 820,
    "stadium": "Camp Nou",
    "reputation": 95,
    "board": "Disputar títulos",
    "difficulty": "Alta cobrança",
    "competitions": [
      "LaLiga",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "manchester-city",
    "name": "Manchester City",
    "country": "gb",
    "countryName": "Inglaterra",
    "leagueId": "premier-league",
    "league": "Premier League",
    "level": 92,
    "budget": 320,
    "value": 960,
    "stadium": "Etihad Stadium",
    "reputation": 96,
    "board": "Disputar títulos",
    "difficulty": "Pressão máxima",
    "competitions": [
      "Premier League",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "liverpool",
    "name": "Liverpool",
    "country": "gb",
    "countryName": "Inglaterra",
    "leagueId": "premier-league",
    "league": "Premier League",
    "level": 89,
    "budget": 250,
    "value": 790,
    "stadium": "Anfield",
    "reputation": 94,
    "board": "Disputar títulos",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Premier League",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "arsenal",
    "name": "Arsenal",
    "country": "gb",
    "countryName": "Inglaterra",
    "leagueId": "premier-league",
    "league": "Premier League",
    "level": 88,
    "budget": 235,
    "value": 760,
    "stadium": "Emirates Stadium",
    "reputation": 91,
    "board": "Disputar títulos",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Premier League",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "inter-milan",
    "name": "Inter de Milão",
    "country": "it",
    "countryName": "Itália",
    "leagueId": "serie-a-italia",
    "league": "Serie A Itália",
    "level": 88,
    "budget": 205,
    "value": 610,
    "stadium": "San Siro",
    "reputation": 91,
    "board": "Disputar títulos",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Serie A Itália",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "ac-milan",
    "name": "AC Milan",
    "country": "it",
    "countryName": "Itália",
    "leagueId": "serie-a-italia",
    "league": "Serie A Itália",
    "level": 86,
    "budget": 190,
    "value": 550,
    "stadium": "San Siro",
    "reputation": 90,
    "board": "Disputar títulos",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Serie A Itália",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "bayern-munich",
    "name": "Bayern Munich",
    "country": "de",
    "countryName": "Alemanha",
    "leagueId": "bundesliga",
    "league": "Bundesliga",
    "level": 90,
    "budget": 260,
    "value": 760,
    "stadium": "Allianz Arena",
    "reputation": 95,
    "board": "Disputar títulos",
    "difficulty": "Pressão máxima",
    "competitions": [
      "Bundesliga",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "borussia-dortmund",
    "name": "Borussia Dortmund",
    "country": "de",
    "countryName": "Alemanha",
    "leagueId": "bundesliga",
    "league": "Bundesliga",
    "level": 85,
    "budget": 170,
    "value": 480,
    "stadium": "Signal Iduna Park",
    "reputation": 88,
    "board": "Disputar títulos",
    "difficulty": "Médio-alto",
    "competitions": [
      "Bundesliga",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "psg",
    "name": "Paris Saint-Germain",
    "country": "fr",
    "countryName": "França",
    "leagueId": "ligue-1",
    "league": "Ligue 1",
    "level": 88,
    "budget": 270,
    "value": 720,
    "stadium": "Parc des Princes",
    "reputation": 93,
    "board": "Disputar títulos",
    "difficulty": "Pressão máxima",
    "competitions": [
      "Ligue 1",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "benfica",
    "name": "Benfica",
    "country": "pt",
    "countryName": "Portugal",
    "leagueId": "liga-portugal",
    "league": "Liga Portugal",
    "level": 84,
    "budget": 135,
    "value": 380,
    "stadium": "Estádio da Luz",
    "reputation": 86,
    "board": "Disputar títulos",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Liga Portugal",
      "Copa nacional",
      "Champions League"
    ]
  },
  {
    "id": "boca-juniors",
    "name": "Boca Juniors",
    "country": "ar",
    "countryName": "Argentina",
    "leagueId": "argentina-liga",
    "league": "Liga Profesional Argentina",
    "level": 81,
    "budget": 80,
    "value": 140,
    "stadium": "La Bombonera",
    "reputation": 86,
    "board": "Disputar títulos",
    "difficulty": "Alta pressão",
    "competitions": [
      "Liga Profesional Argentina",
      "Copa nacional",
      "Libertadores"
    ]
  },
  {
    "id": "river-plate",
    "name": "River Plate",
    "country": "ar",
    "countryName": "Argentina",
    "leagueId": "argentina-liga",
    "league": "Liga Profesional Argentina",
    "level": 82,
    "budget": 86,
    "value": 155,
    "stadium": "Monumental",
    "reputation": 87,
    "board": "Disputar títulos",
    "difficulty": "Alta pressão",
    "competitions": [
      "Liga Profesional Argentina",
      "Copa nacional",
      "Libertadores"
    ]
  },
  {
    "id": "inter-miami",
    "name": "Inter Miami",
    "country": "us",
    "countryName": "Estados Unidos",
    "leagueId": "mls",
    "league": "MLS",
    "level": 78,
    "budget": 95,
    "value": 180,
    "stadium": "DRV PNK Stadium",
    "reputation": 82,
    "board": "Disputar títulos",
    "difficulty": "Projeto especial",
    "competitions": [
      "MLS",
      "Copa nacional",
      "Competição continental"
    ]
  },
  {
    "id": "al-hilal",
    "name": "Al-Hilal",
    "country": "sa",
    "countryName": "Arábia Saudita",
    "leagueId": "saudi-pro-league",
    "league": "Saudi Pro League",
    "level": 84,
    "budget": 210,
    "value": 430,
    "stadium": "Kingdom Arena",
    "reputation": 84,
    "board": "Disputar títulos",
    "difficulty": "Alta cobrança",
    "competitions": [
      "Saudi Pro League",
      "Copa nacional",
      "Competição continental"
    ]
  }
];
export const screens = [["lobby", "Lobby", "🏠"], ["championship", "Campeonato", "🏆"], ["calendar", "Agenda", "📅"], ["formation", "Tatica", "🧩"], ["training", "Treino", "🔶"], ["standings", "Tabela", "📊"], ["transfers", "Transferencias", "🔁"], ["staff", "Staff", "👥"], ["sponsorship", "Patrocinio", "🤝"], ["club", "Clube", "🛡️"], ["settings", "Config", "⚙️"]];
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
    "Zé Rafael",
    "MC",
    76
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
    "Luan Peres",
    "ZAG",
    73
  ],
  [
    "Gabriel Brazão",
    "GOL",
    76
  ],
  [
    "Álvaro Barreal",
    "MEI",
    75
  ],
  [
    "João Schmidt",
    "VOL",
    76
  ]
];
export const tableRows = [
  "Atlético-MG",
  "Bahia",
  "Botafogo",
  "Ceará",
  "Corinthians",
  "Cruzeiro",
  "Flamengo",
  "Fluminense",
  "Fortaleza",
  "Grêmio",
  "Internacional",
  "Juventude",
  "Mirassol",
  "Palmeiras",
  "Red Bull Bragantino",
  "Santos FC",
  "São Paulo",
  "Sport Recife",
  "Vasco",
  "Vitória"
];
export const commentary = [
  "Começa o jogo na Vila Belmiro.",
  "Santos tenta controlar a posse no meio campo.",
  "A equipe pressiona alto e força erro na saída.",
  "Escanteio pela direita.",
  "GOOOOL! A rede balança depois de boa troca de passes.",
  "Segundo tempo iniciado.",
  "O treinador reduz a intensidade para preservar o elenco."
];
