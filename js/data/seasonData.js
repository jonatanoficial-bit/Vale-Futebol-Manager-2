export const competitions = [
  {
    "id": "brasileirao-a",
    "name": "Brasileirão Série A 2026",
    "short": "BRA",
    "type": "Liga",
    "scope": "Nacional",
    "status": "Em andamento",
    "round": "Temporada 2026",
    "priority": "Alta",
    "objective": "Top 4: Libertadores; últimos 4: Série B",
    "prize": "Premiação por posição",
    "color": "gold"
  },
  {
    "id": "brasileirao-b",
    "name": "Brasileirão Série B 2026",
    "short": "BRB",
    "type": "Liga",
    "scope": "Nacional",
    "status": "Em andamento",
    "round": "Temporada 2026",
    "priority": "Alta",
    "objective": "Top 4: acesso; últimos 4: Série C",
    "prize": "Acesso e premiação",
    "color": "blue"
  },
  {
    "id": "copa-do-brasil",
    "name": "Copa do Brasil",
    "short": "CDB",
    "type": "Copa",
    "scope": "Nacional",
    "status": "Em andamento",
    "round": "Fases eliminatórias",
    "priority": "Alta",
    "objective": "Avançar fases",
    "prize": "Bônus por fase",
    "color": "blue"
  },
  {
    "id": "libertadores",
    "name": "Libertadores",
    "short": "LIB",
    "type": "Continental",
    "scope": "América do Sul",
    "status": "Classificação por desempenho",
    "round": "Temporada continental",
    "priority": "Muito alta",
    "objective": "Top 4 da Série A garante caminho principal",
    "prize": "Mundial de Clubes para campeão continental",
    "color": "gold"
  },
  {
    "id": "sulamericana",
    "name": "Sul-Americana",
    "short": "SUL",
    "type": "Continental",
    "scope": "América do Sul",
    "status": "Classificação por desempenho",
    "round": "Temporada continental",
    "priority": "Alta",
    "objective": "Faixa intermediária nacional",
    "prize": "Vaga continental e projeção internacional",
    "color": "green"
  },
  {
    "id": "mundial-interclubes",
    "name": "Mundial de Clubes",
    "short": "MUN",
    "type": "Mundial",
    "scope": "Global",
    "status": "Ciclo de 4 anos",
    "round": "Próximo ciclo internacional",
    "priority": "Elite",
    "objective": "Campeões continentais entram no ciclo",
    "prize": "Título mundial",
    "color": "dark"
  }
];
export const seasonMonths = [
  {
    "id": "jan",
    "name": "Janeiro",
    "focus": "Pré-temporada",
    "matches": 2,
    "intensity": "Média"
  },
  {
    "id": "fev",
    "name": "Fevereiro",
    "focus": "Estaduais e ajustes",
    "matches": 5,
    "intensity": "Alta"
  },
  {
    "id": "mar",
    "name": "Março",
    "focus": "Copas e preparação nacional",
    "matches": 5,
    "intensity": "Alta"
  },
  {
    "id": "abr",
    "name": "Abril",
    "focus": "Início nacional",
    "matches": 6,
    "intensity": "Alta"
  },
  {
    "id": "mai",
    "name": "Maio",
    "focus": "Sequência nacional",
    "matches": 7,
    "intensity": "Muito alta"
  },
  {
    "id": "jun",
    "name": "Junho",
    "focus": "Janela e calendário FIFA",
    "matches": 5,
    "intensity": "Média"
  },
  {
    "id": "jul",
    "name": "Julho",
    "focus": "Copas e liga",
    "matches": 8,
    "intensity": "Muito alta"
  },
  {
    "id": "ago",
    "name": "Agosto",
    "focus": "Reta continental",
    "matches": 7,
    "intensity": "Muito alta"
  },
  {
    "id": "set",
    "name": "Setembro",
    "focus": "Eliminatórias e liga",
    "matches": 6,
    "intensity": "Alta"
  },
  {
    "id": "out",
    "name": "Outubro",
    "focus": "Pressão por objetivos",
    "matches": 7,
    "intensity": "Muito alta"
  },
  {
    "id": "nov",
    "name": "Novembro",
    "focus": "Decisões",
    "matches": 6,
    "intensity": "Máxima"
  },
  {
    "id": "dez",
    "name": "Dezembro",
    "focus": "Relatórios e finalização",
    "matches": 3,
    "intensity": "Média"
  }
];
export const schedule = [
  {
    "date": "2026-05-24",
    "day": "Dom",
    "home": "CLUBE_USUARIO",
    "away": "RIVAL_1",
    "competition": "LIGA_DO_CLUBE",
    "stage": "Rodada atual",
    "venue": "ESTADIO_CLUBE",
    "type": "match",
    "importance": 88,
    "status": "Próximo jogo"
  },
  {
    "date": "2026-05-31",
    "day": "Dom",
    "home": "RIVAL_2",
    "away": "CLUBE_USUARIO",
    "competition": "LIGA_DO_CLUBE",
    "stage": "Rodada seguinte",
    "venue": "Estádio rival",
    "type": "match",
    "importance": 82,
    "status": "Agendado"
  },
  {
    "date": "2026-06-04",
    "day": "Qui",
    "home": "CLUBE_USUARIO",
    "away": "RIVAL_3",
    "competition": "Copa do Brasil",
    "stage": "Jogo eliminatório",
    "venue": "ESTADIO_CLUBE",
    "type": "match",
    "importance": 86,
    "status": "Copa"
  },
  {
    "date": "2026-06-07",
    "day": "Dom",
    "home": "CLUBE_USUARIO",
    "away": "RIVAL_4",
    "competition": "LIGA_DO_CLUBE",
    "stage": "Rodada nacional",
    "venue": "ESTADIO_CLUBE",
    "type": "match",
    "importance": 79,
    "status": "Agendado"
  },
  {
    "date": "2026-06-11",
    "day": "Qui",
    "home": "RIVAL_5",
    "away": "CLUBE_USUARIO",
    "competition": "LIGA_DO_CLUBE",
    "stage": "Rodada nacional",
    "venue": "Estádio rival",
    "type": "match",
    "importance": 80,
    "status": "Agendado"
  },
  {
    "date": "2026-06-15",
    "day": "Seg",
    "title": "Treino regenerativo",
    "competition": "Treino",
    "stage": "Recuperação",
    "venue": "CT",
    "type": "training",
    "importance": 55,
    "status": "Planejado"
  },
  {
    "date": "2026-06-20",
    "day": "Sáb",
    "title": "Coletiva e relatório",
    "competition": "Imprensa",
    "stage": "Pré-jogo",
    "venue": "Auditório",
    "type": "media",
    "importance": 50,
    "status": "Opcional"
  }
];
export const seasonRules = {
  "serieA": {
    "teams": 20,
    "relegation": 4,
    "libertadoresDirect": 4,
    "sudamericanaWindow": "5º ao 12º conforme vagas não usadas por copas"
  },
  "serieB": {
    "teams": 20,
    "promotion": 4,
    "relegation": 4
  },
  "continental": {
    "libertadores": "Top 4 da Série A recebem vaga continental principal no jogo; campeões de Copa do Brasil/Libertadores/Sul-Americana podem liberar vagas extras em futuras builds.",
    "sulamericana": "Faixa intermediária da Série A entra na Sul-Americana no modo carreira.",
    "interclubWorldCup": "Campeões continentais podem entrar no Mundial de Clubes, tratado como ciclo internacional de 4 anos no jogo."
  },
  "nationalTeam": {
    "continentalCupCycle": 4,
    "worldCupQualifiers": true,
    "worldCupCycle": 4,
    "clubWorldCupCycle": 4
  }
};
export const calendarDays = Array.from({length:31}, (_,i)=>{ const day=i+1; const events=schedule.filter(ev=>Number(ev.date.slice(-2))===day); return {day,events}; });
export function eventTitle(ev){ if(ev.type==='match') return `${ev.home} x ${ev.away}`; return ev.title || ev.stage || ev.competition; }
export function eventClass(ev){ return ev.type==='match' ? 'event-match' : ev.type==='training' ? 'event-training' : ev.type==='board' ? 'event-board' : ev.type==='market' ? 'event-market' : 'event-soft'; }
