export const BOARD_EMOTIONAL_VERSION = 'v6.6.0';

export const BOARD_EMOTIONAL_STATUS_V660 = {
  label: 'Economia Emocional e Diretoria Viva',
  status: 'board-emotional-ready',
  phase: 'Diretoria viva',
  build: 'v6.6.0'
};

export const BOARD_PILLARS_V660 = [
  { id:'sport', title:'Resultado esportivo', icon:'🏆', route:'seasonCenter', weight:32, note:'Forma recente, sequência de jogos e distância da meta da competição.' },
  { id:'finance', title:'Saúde financeira', icon:'💼', route:'financeCenter', weight:24, note:'Caixa, folha, orçamento, risco de crise e retorno dos patrocinadores.' },
  { id:'promise', title:'Promessas e discurso', icon:'🎙️', route:'pressConference', weight:18, note:'O que foi prometido em coletiva passa a influenciar cobrança e confiança.' },
  { id:'fans', title:'Humor da torcida', icon:'🔥', route:'liveWorld', weight:14, note:'Jornal, resultados e identidade de jogo moldam pressão externa.' },
  { id:'locker', title:'Clima do vestiário', icon:'🧠', route:'squadAI', weight:12, note:'Moral, liderança e crise interna entram na régua da diretoria.' }
];

export const BOARD_SCENARIOS_V660 = [
  { id:'stable-board', title:'Diretoria estável', range:'75-100', mood:'confiante', risk:'baixo', action:'Autoriza planejamento longo e protege o cargo.' },
  { id:'watching-board', title:'Diretoria observando', range:'55-74', mood:'cautelosa', risk:'moderado', action:'Pede respostas nos próximos jogos e cobra coerência no discurso.' },
  { id:'pressure-board', title:'Diretoria pressionada', range:'35-54', mood:'tensa', risk:'alto', action:'Pode bloquear orçamento, exigir reunião ou gerar ultimato.' },
  { id:'crisis-board', title:'Crise institucional', range:'0-34', mood:'emergencial', risk:'crítico', action:'Risco real de demissão, protesto da torcida e corte financeiro.' }
];

export const BOARD_PROMISES_V660 = [
  { id:'youth', title:'Dar espaço para jovens', route:'academyScouting', trustImpact:8, fanImpact:4, deadline:'4 jogos', failure:'Perde confiança da base e da torcida se não usar promessas.' },
  { id:'balance', title:'Organizar as finanças', route:'financeCenter', trustImpact:10, fanImpact:2, deadline:'30 dias', failure:'Diretoria reduz autonomia de mercado.' },
  { id:'identity', title:'Criar identidade de jogo', route:'formation', trustImpact:6, fanImpact:8, deadline:'5 jogos', failure:'Jornal questiona falta de padrão e aumenta pressão.' },
  { id:'locker', title:'Pacificar o vestiário', route:'squadAI', trustImpact:7, fanImpact:3, deadline:'2 semanas', failure:'Líderes cobram conversa e reservas ficam insatisfeitos.' },
  { id:'result', title:'Reagir no próximo jogo', route:'matchdayPremium', trustImpact:9, fanImpact:7, deadline:'próxima rodada', failure:'Ultimato da diretoria pode ser ativado.' }
];

export const BOARD_MEETING_TYPES_V660 = [
  { id:'weekly', title:'Reunião semanal', trigger:'fim de semana', tone:'analítica', route:'objectivesHub', output:'Resumo de metas e ajustes de confiança.' },
  { id:'budget', title:'Reunião de orçamento', trigger:'queda de caixa ou janela', tone:'financeira', route:'financeCenter', output:'Liberação, bloqueio ou revisão de verba.' },
  { id:'crisis', title:'Reunião de crise', trigger:'3 derrotas, moral baixa ou promessa quebrada', tone:'dura', route:'matchdayPremium', output:'Ultimato, meta curta e pressão pública.' },
  { id:'renewal', title:'Reunião de projeto', trigger:'boa sequência e metas cumpridas', tone:'positiva', route:'careerOffers', output:'Renovação, bônus e mais autonomia.' }
];

export const EMOTIONAL_FINANCE_RULES_V660 = [
  'A confiança da diretoria influencia autonomia de mercado, pressão no cargo e paciência com derrotas.',
  'Promessas feitas ao clube precisam ter prazo, rota de ação e impacto claro em torcida/diretoria.',
  'Torcida e jornal não podem ser apenas texto decorativo: precisam alimentar risco, moral e cobrança.',
  'Toda decisão econômica deve permanecer leve, local/offline e sem API externa.',
  'A tela precisa funcionar em celular pequeno com cards roláveis e sem modal bloqueante.'
];
