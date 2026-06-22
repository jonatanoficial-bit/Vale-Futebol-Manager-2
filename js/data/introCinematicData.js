export const INTRO_CINEMATIC_VERSION = 'v6.1.0';

export const INTRO_PUBLIC_STATUS_V610 = {
  phase: 'Fase 44',
  label: 'Jornada Inicial Cinematográfica',
  buildDate: '2026-06-22',
  readinessTarget: 96,
  goal: 'Transformar os primeiros 20 minutos em uma abertura emocional, guiada e comercial, sem travar o fluxo mobile.',
  promise: 'O jogador entende quem ele é, qual clube assume, qual pressão existe e por que deve jogar a primeira partida.',
  mobilePriority: ['toque simples', 'rolagem vertical', 'botões grandes', 'sem vídeo pesado', 'pode pular a qualquer momento']
};

export const INTRO_STORY_ACTS_V610 = [
  {
    id: 'dream',
    title: 'O sonho do treinador',
    subtitle: 'Você não começa como estrela. Começa com uma chance.',
    tone: 'inspiração',
    icon: '🌅',
    route: 'newGame',
    duration: '45s',
    mobileCue: 'Card vertical com texto curto e botão grande.',
    playerPromise: 'Criar o manager e dar nome à carreira.'
  },
  {
    id: 'contract',
    title: 'A ligação da diretoria',
    subtitle: 'O clube precisa de comando, resultado e identidade.',
    tone: 'pressão',
    icon: '📞',
    route: 'teamSelect',
    duration: '60s',
    mobileCue: 'Escolha do clube sem corte de tela.',
    playerPromise: 'Escolher o projeto esportivo certo.'
  },
  {
    id: 'arrival',
    title: 'Primeiro dia no CT',
    subtitle: 'Elenco, torcida, imprensa e diretoria já estão olhando.',
    tone: 'imersão',
    icon: '🏟️',
    route: 'lobby',
    duration: '90s',
    mobileCue: 'Lobby com resumo narrativo e atalhos claros.',
    playerPromise: 'Entender a situação do clube sem ler manual.'
  },
  {
    id: 'press',
    title: 'Primeira coletiva',
    subtitle: 'Sua resposta muda o clima do vestiário e da torcida.',
    tone: 'decisão',
    icon: '🎙️',
    route: 'pressConference',
    duration: '90s',
    mobileCue: 'Uma pergunta por vez, botões empilhados no celular.',
    playerPromise: 'Sentir que escolhas têm peso.'
  },
  {
    id: 'preMatch',
    title: 'Plano de jogo',
    subtitle: 'Antes da bola rolar, o treinador precisa escolher identidade.',
    tone: 'estratégia',
    icon: '🧩',
    route: 'formation',
    duration: '120s',
    mobileCue: 'Atalhos simples para tática, elenco e treino.',
    playerPromise: 'Preparar o time sem se perder nos menus.'
  },
  {
    id: 'kickoff',
    title: 'A primeira partida',
    subtitle: 'O jogo começa. Cada evento vira história da carreira.',
    tone: 'adrenalina',
    icon: '⚽',
    route: 'match',
    duration: '5-8min',
    mobileCue: 'Partida jogável em retrato e horizontal compacto.',
    playerPromise: 'Fechar o primeiro ciclo: jogo, relatório e volta ao lobby.'
  }
];

export const INTRO_SESSION_FLOW_V610 = [
  { step: 1, action: 'Abrir capa', expected: 'Entender proposta do jogo em 10 segundos.', route: 'cover' },
  { step: 2, action: 'Entrar na Jornada', expected: 'Ver arco inicial com opção de pular.', route: 'careerIntro' },
  { step: 3, action: 'Criar manager', expected: 'Avatar, nome e país sem corte no celular.', route: 'newGame' },
  { step: 4, action: 'Escolher clube', expected: 'Perceber pressão e dificuldade do projeto.', route: 'teamSelect' },
  { step: 5, action: 'Confirmar carreira', expected: 'Sentir contrato assinado e objetivo definido.', route: 'confirmCareer' },
  { step: 6, action: 'Primeiro lobby', expected: 'Receber resumo do dia e próximo jogo.', route: 'lobby' },
  { step: 7, action: 'Tutorial e missões', expected: 'Saber onde clicar sem depender do chat.', route: 'careerTutorial' },
  { step: 8, action: 'Primeira coletiva', expected: 'Responder uma pergunta e ver efeito narrativo.', route: 'pressConference' },
  { step: 9, action: 'Primeira partida', expected: 'Jogar no celular com rolagem e botões acessíveis.', route: 'match' },
  { step: 10, action: 'Pós-jogo e save', expected: 'Voltar ao lobby, salvar e continuar.', route: 'saveCenter' }
];

export const INTRO_RETENTION_HOOKS_V610 = [
  { id: 'identity', label: 'Identidade do treinador', impact: 96, note: 'O jogador precisa se sentir dono da carreira desde o primeiro minuto.' },
  { id: 'pressure', label: 'Pressão da diretoria', impact: 94, note: 'Metas claras tornam a primeira partida importante.' },
  { id: 'club-emotion', label: 'Clube com alma', impact: 92, note: 'Estádio, torcida, orçamento e dificuldade viram contexto emocional.' },
  { id: 'first-choice', label: 'Primeira escolha pública', impact: 93, note: 'A coletiva reforça consequência sem parecer tela técnica.' },
  { id: 'first-match', label: 'Primeira partida rápida', impact: 98, note: 'O jogador deve chegar no jogo antes de cansar do onboarding.' },
  { id: 'save-confidence', label: 'Confiança no save', impact: 95, note: 'Salvar e continuar fecha a promessa de carreira longa.' }
];

export const INTRO_MOBILE_RULES_V610 = [
  'Nenhum passo da jornada pode depender de hover, teclado físico ou tela larga.',
  'Todo card principal precisa ter botão grande e estar no fluxo vertical da página.',
  'Cenas cinematográficas são feitas com CSS/HTML leve, sem vídeo pesado obrigatório.',
  'O usuário pode pular a narrativa e ir direto para Novo Game ou Lobby.',
  'A jornada deve funcionar em 360×740, 390×844, 393×852, 640×360 e tablet.',
  'Inputs mantêm fonte mínima de 16px para evitar zoom automático no iPhone.'
];
