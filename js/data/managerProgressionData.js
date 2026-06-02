export const MANAGER_PROGRESSION_VERSION = 'v5.9.5-manager-xp';

export const managerLevelTiers = [
  { level:1, title:'Treinador iniciante', minXp:0, license:'Licença D', repFloor:35, perk:'Primeiros passos' },
  { level:2, title:'Treinador promissor', minXp:120, license:'Licença D+', repFloor:38, perk:'Leitura de elenco' },
  { level:3, title:'Gestor de grupo', minXp:280, license:'Licença C', repFloor:42, perk:'Moral +1 em coletivas equilibradas' },
  { level:4, title:'Especialista tático', minXp:520, license:'Licença C+', repFloor:46, perk:'Boost tático inicial +1' },
  { level:5, title:'Técnico regional', minXp:850, license:'Licença B', repFloor:50, perk:'Propostas regionais melhores' },
  { level:6, title:'Técnico nacional', minXp:1250, license:'Licença B+', repFloor:56, perk:'Diretoria tolera melhor oscilações' },
  { level:7, title:'Nome continental', minXp:1780, license:'Licença A', repFloor:62, perk:'Radar CONMEBOL ampliado' },
  { level:8, title:'Líder vencedor', minXp:2450, license:'Licença A+', repFloor:68, perk:'Elenco reage melhor a derrotas' },
  { level:9, title:'Elite internacional', minXp:3300, license:'Licença Pro', repFloor:76, perk:'Convites internacionais fortes' },
  { level:10, title:'Técnico mundial', minXp:4400, license:'Licença Pro Elite', repFloor:84, perk:'Mercado global de treinadores liberado' }
];

export const managerSpecialties = [
  { id:'tactician', name:'Tático', icon:'🧩', desc:'Aumenta leitura de jogo e efeito de decisões rápidas.', unlockLevel:2 },
  { id:'motivator', name:'Motivador', icon:'🔥', desc:'Melhora moral do elenco após coletivas e vitórias.', unlockLevel:3 },
  { id:'developer', name:'Formador', icon:'🌱', desc:'Fortalece treino, base e evolução de jovens.', unlockLevel:4 },
  { id:'negotiator', name:'Negociador', icon:'🤝', desc:'Melhora contratos, propostas e mercado.', unlockLevel:5 },
  { id:'leader', name:'Líder de vestiário', icon:'🛡️', desc:'Reduz queda de confiança em fases ruins.', unlockLevel:6 },
  { id:'international', name:'Internacional', icon:'🌍', desc:'Aumenta chance de seleções e clubes estrangeiros.', unlockLevel:7 }
];

export const xpRewards = {
  matchWin:70,
  matchDraw:35,
  matchLoss:18,
  firstMatch:80,
  pressConference:35,
  tutorialStep:45,
  trainingWeek:25,
  nationalMatch:60,
  seasonCompleted:220,
  objectiveMet:180,
  cleanSheet:25,
  bigGame:90
};

export const managerAchievements = [
  { id:'first-match', title:'Estreia oficial', desc:'Concluir a primeira partida da carreira.', xp:80 },
  { id:'first-win', title:'Primeira vitória', desc:'Vencer seu primeiro jogo oficial.', xp:120 },
  { id:'press-master', title:'Boa comunicação', desc:'Concluir três coletivas de imprensa.', xp:100 },
  { id:'season-survivor', title:'Temporada completa', desc:'Encerrar um ano de carreira e iniciar outro.', xp:220 },
  { id:'continental-radar', title:'Radar continental', desc:'Alcançar nível 7 de treinador.', xp:0 },
  { id:'world-class', title:'Classe mundial', desc:'Alcançar nível 10 de treinador.', xp:0 }
];
