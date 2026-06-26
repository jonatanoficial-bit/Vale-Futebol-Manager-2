export const OBJECTIVES_RETENTION_VERSION = 'v6.5.0';

export const OBJECTIVES_RETENTION_STATUS_V650 = {
  label: 'Objetivos, Conquistas e Retenção',
  status: 'objectives-retention-ready',
  phase: 'Objetivos e conquistas',
  build: 'v6.5.0'
};

export const DAILY_OBJECTIVES_V650 = [
  { id:'open-journal', title:'Ler o jornal do dia', icon:'📰', route:'liveWorld', xp:45, reward:'Pulso do clube atualizado', progress:100, note:'Garante que o jogador veja bastidores antes de decidir.' },
  { id:'check-squad-ai', title:'Verificar vestiário', icon:'🧠', route:'squadAI', xp:65, reward:'Moral protegida', progress:72, note:'Conecta moral, liderança e rotação com a rotina diária.' },
  { id:'prepare-matchday', title:'Preparar dia de jogo', icon:'🏟️', route:'matchdayPremium', xp:80, reward:'Bônus de concentração', progress:54, note:'Leva o usuário para pré-jogo, banco e plano emocional.' },
  { id:'train-plan', title:'Ajustar treino semanal', icon:'🔶', route:'training', xp:55, reward:'Evolução segura', progress:38, note:'Incentiva retorno ao ciclo de desenvolvimento.' },
  { id:'read-mail', title:'Responder e-mails críticos', icon:'✉️', route:'messages', xp:40, reward:'Diretoria informada', progress:62, note:'Mantém diretoria, imprensa e empresário vivos no loop.' }
];

export const SEASON_OBJECTIVES_V650 = [
  { id:'board-trust', title:'Manter confiança da diretoria acima de 70%', tier:'Diretoria', route:'club', target:70, reward:'Segurança no cargo + reputação', risk:'queda de confiança bloqueia propostas melhores' },
  { id:'fan-mood', title:'Manter torcida acima de 75%', tier:'Torcida', route:'liveWorld', target:75, reward:'Bônus de apoio em casa', risk:'pressão no jornal e nas coletivas' },
  { id:'squad-morale', title:'Manter moral média acima de 72%', tier:'Elenco', route:'squadAI', target:72, reward:'Vestiário estável', risk:'crise e pedidos de saída' },
  { id:'league-run', title:'Cumprir a meta esportiva da temporada', tier:'Competição', route:'seasonCenter', target:1, reward:'Renovação e XP alto', risk:'demissão em campanhas ruins' },
  { id:'career-level', title:'Subir o nível do treinador', tier:'Carreira', route:'managerProgression', target:1, reward:'Licenças, especialidades e ofertas', risk:'carreira fica lenta sem progresso' }
];

export const ACHIEVEMENTS_V650 = [
  { id:'first-week', title:'Primeira semana completa', icon:'📅', rarity:'Comum', points:50, condition:'Concluir jornal, treino, vestiário e primeiro jogo.' },
  { id:'locker-master', title:'Gestor de vestiário', icon:'🧠', rarity:'Raro', points:120, condition:'Resolver alerta de moral sem perder liderança.' },
  { id:'matchday-boss', title:'Senhor do Matchday', icon:'🏟️', rarity:'Raro', points:140, condition:'Passar por pré-jogo, narração e pós-jogo premium.' },
  { id:'board-favorite', title:'Homem de confiança', icon:'💼', rarity:'Épico', points:220, condition:'Manter diretoria acima de 85% por 30 dias.' },
  { id:'club-identity', title:'Identidade criada', icon:'🛡️', rarity:'Épico', points:240, condition:'Combinar tática, elenco, imprensa e resultados.' },
  { id:'dynasty-seed', title:'Semente de dinastia', icon:'🏆', rarity:'Lendário', points:420, condition:'Fechar temporada com meta esportiva e moral alta.' }
];

export const RETENTION_LOOPS_V650 = [
  { id:'first-5', title:'Primeiros 5 minutos', goal:'Abrir jornada inicial, escolher clube e entender o próximo jogo.', feedback:'barra de progresso visível e botão principal claro' },
  { id:'first-20', title:'Primeiros 20 minutos', goal:'Jornal + vestiário + matchday + pós-jogo.', feedback:'recompensa de XP, conquista e meta de retorno' },
  { id:'daily-return', title:'Retorno diário', goal:'Checar notícias, moral, treino e objetivo da semana.', feedback:'missões curtas, bônus diário e mensagens novas' },
  { id:'weekly-cycle', title:'Ciclo semanal', goal:'Treinar, ajustar elenco, jogar, analisar e planejar mercado.', feedback:'metas de temporada e conquistas graduais' }
];

export const REWARD_TIERS_V650 = [
  { tier:'Bronze', min:0, max:249, label:'Aprendiz de carreira', benefit:'dicas extras e checklist guiado' },
  { tier:'Prata', min:250, max:599, label:'Treinador confiável', benefit:'bônus de reputação inicial' },
  { tier:'Ouro', min:600, max:1199, label:'Manager competitivo', benefit:'ofertas melhores e moral mais resistente' },
  { tier:'Elite', min:1200, max:9999, label:'Construtor de dinastia', benefit:'prestígio alto e objetivos avançados' }
];

export const RETENTION_MOBILE_RULES_V650 = [
  'A central de objetivos precisa abrir em celular pequeno sem cortar cards, botões ou barras de progresso.',
  'Nenhuma missão pode depender de internet, API externa ou temporizador pesado.',
  'O jogador deve sempre ter um próximo botão claro: jornal, vestiário, treino, matchday ou partida.',
  'Conquistas devem ser visuais e leves, sem vídeo, popup obrigatório ou bloqueio de rolagem.',
  'A fase precisa preservar Beta Pública, Jornada Inicial, Lobby Vivo, Matchday Premium e IA de Elenco.'
];
