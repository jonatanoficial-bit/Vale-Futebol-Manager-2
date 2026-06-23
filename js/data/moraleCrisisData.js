export const MORALE_CRISIS_VERSION = 'v6.9.0';

export const MORALE_CRISIS_STATUS_V690 = {
  label: 'Moral Avançada e Crises de Vestiário',
  status: 'morale-crisis-ready',
  phase: 'Fase 52 — moral avançada, promessas quebradas, salário, banco e liderança',
  build: 'v6.9.0'
};

export const MORALE_GROUPS_V690 = [
  { id:'leaders', title:'Núcleo de líderes', mood:78, influence:92, risk:'baixo', trigger:'capitão respeitado cobra coerência nas promessas' },
  { id:'starters', title:'Titulares pressionados', mood:64, influence:82, risk:'moderado', trigger:'sequência de jogos aumenta desgaste e cobrança por resultado' },
  { id:'bench', title:'Reservas insatisfeitos', mood:43, influence:58, risk:'alto', trigger:'minutos prometidos ainda não viraram oportunidade real' },
  { id:'youth', title:'Jovens da base', mood:69, influence:46, risk:'moderado', trigger:'promessas querem plano de evolução e minutos controlados' },
  { id:'newsignings', title:'Contratações recentes', mood:61, influence:67, risk:'moderado', trigger:'adaptação ao clube depende de respaldo público e tático' }
];

export const CRISIS_TRIGGERS_V690 = [
  { id:'broken-promise', title:'Promessa quebrada', severity:86, source:'Renovação contratual', action:'chamar o jogador para conversa individual', linkedRoute:'contractRenewal' },
  { id:'salary-gap', title:'Diferença salarial exposta', severity:74, source:'Empresário', action:'proteger teto salarial e explicar plano ao grupo', linkedRoute:'agentMarket' },
  { id:'bench-streak', title:'Sequência no banco', severity:71, source:'Matchday', action:'usar 20 minutos ou comunicar papel tático', linkedRoute:'matchdayPremium' },
  { id:'captain-pressure', title:'Capitão cobrando padrão', severity:63, source:'Vestiário', action:'reforçar liderança e definir mensagem ao elenco', linkedRoute:'squadAI' },
  { id:'bad-run', title:'Derrotas consecutivas', severity:82, source:'Jornal esportivo', action:'fechar ambiente e priorizar confiança', linkedRoute:'liveWorld' },
  { id:'board-leak', title:'Cobrança vazada da diretoria', severity:68, source:'Diretoria viva', action:'alinhar discurso antes da coletiva', linkedRoute:'emotionalBoard' }
];

export const PLAYER_MORALE_CASES_V690 = [
  { id:'captain', player:'Capitão experiente', role:'Líder do grupo', morale:76, trust:84, concern:'quer transparência nas promessas ao elenco', demand:'reunião curta antes do próximo treino' },
  { id:'star', player:'Atacante estrela', role:'Referência ofensiva', morale:58, trust:61, concern:'quer contrato compatível com protagonismo', demand:'projeto esportivo e bônus por gols' },
  { id:'bench-mid', player:'Meia reserva', role:'Reserva imediato', morale:39, trust:44, concern:'foi prometido mais tempo de jogo', demand:'minutos reais na próxima partida' },
  { id:'young-def', player:'Zagueiro jovem', role:'Promessa da base', morale:66, trust:70, concern:'não sabe se terá espaço no elenco principal', demand:'plano de evolução mensal' },
  { id:'new-winger', player:'Ponta recém-chegado', role:'Contratação recente', morale:62, trust:59, concern:'imprensa questiona custo da contratação', demand:'apoio público do treinador' }
];

export const COACH_RESPONSES_V690 = [
  { id:'private-talk', title:'Conversa individual', effect:'reduz crise imediata', morale:12, board:-2, press:0, route:'messages' },
  { id:'team-meeting', title:'Reunião com o grupo', effect:'aumenta coesão, mas expõe liderança', morale:9, board:1, press:-3, route:'squadAI' },
  { id:'give-minutes', title:'Dar minutos no matchday', effect:'cumpre promessa esportiva', morale:15, board:0, press:4, route:'matchdayPremium' },
  { id:'public-defense', title:'Defesa pública na coletiva', effect:'protege jogador e reduz imprensa', morale:7, board:-1, press:8, route:'pressConference' },
  { id:'firm-line', title:'Linha dura disciplinar', effect:'organiza hierarquia, mas aumenta risco interno', morale:-6, board:7, press:2, route:'emotionalBoard' }
];

export const DRESSING_ROOM_EVENTS_V690 = [
  'Reserva importante pediu explicação após ficar três jogos sem entrar.',
  'Capitão pediu uma fala do treinador antes do treino regenerativo.',
  'Empresário de atleta valorizado vazou que há interesse de rival direto.',
  'Grupo reagiu bem à vitória, mas cobra coerência na rotação.',
  'Jovem da base ganhou apoio dos líderes após bom treino.',
  'Diretoria quer evitar que salários altos contaminem a negociação coletiva.'
];

export const MORALE_CRISIS_RULES_V690 = [
  'Nenhum popup fixo pode bloquear rolagem no mobile.',
  'Crises precisam ser exibidas como leitura e decisão, sem quebrar rotas antigas.',
  'A rota squadMorale deve preservar Squad AI, Matchday, Diretoria, Contratos e Jornal.',
  'Todo evento de moral precisa ter ação sugerida e rota conectada.',
  'Promessas quebradas devem apontar para contratos, objetivos ou minutos de jogo.',
  'O sistema deve funcionar offline com dados internos e fallback seguro.'
];
