export const GUIDED_TUTORIAL_VERSION = 'v5.9.4-guided-missions';

export const guidedTutorialSteps = [
  {
    id:'welcome-club',
    order:1,
    title:'Conheça seu clube',
    short:'Veja a reputação do técnico, próximo jogo e situação da diretoria.',
    route:'lobby',
    cta:'Ir ao lobby',
    trigger:'manual',
    reward:{reputation:1, boardTrust:1, fanMood:1, coins:10},
    rewardText:'+1 reputação · +1 diretoria · +10 moedas',
    guide:'O lobby é sua mesa de trabalho. Nele você acompanha reputação, confiança da diretoria, humor da torcida, próximo jogo e missões ativas.'
  },
  {
    id:'open-squad',
    order:2,
    title:'Analise o elenco',
    short:'Abra o elenco e confira titulares, reservas, moral e contratos.',
    route:'squad',
    cta:'Ver elenco',
    trigger:'route:squad',
    reward:{dressingRoomTrust:2, coins:15},
    rewardText:'+2 confiança do elenco · +15 moedas',
    guide:'Antes de jogar, entenda quem está em melhor fase e quais posições precisam de reforço. Elenco forte reduz risco de resultados ruins.'
  },
  {
    id:'open-tactics',
    order:3,
    title:'Ajuste a tática',
    short:'Confira formação, instruções e cobradores antes da estreia.',
    route:'formation',
    cta:'Ajustar tática',
    trigger:'route:formation',
    reward:{dressingRoomTrust:2, tacticalBoost:1, coins:15},
    rewardText:'+2 elenco · boost tático inicial · +15 moedas',
    guide:'A tática afeta posse, transição, bola parada e risco defensivo. Comece com uma proposta equilibrada se ainda não conhece o elenco.'
  },
  {
    id:'press-first',
    order:4,
    title:'Participe da coletiva',
    short:'Responda a coletiva pré-jogo com cuidado: suas falas mudam reputação e moral.',
    route:'pressConference',
    cta:'Abrir coletiva',
    trigger:'press',
    reward:{reputation:1, fanMood:1, coins:20},
    rewardText:'+1 reputação · +1 torcida · +20 moedas',
    guide:'A coletiva é curta, mas suas respostas têm impacto. Promessas ousadas aumentam torcida, respostas equilibradas agradam diretoria.'
  },
  {
    id:'play-first-match',
    order:5,
    title:'Jogue sua primeira partida',
    short:'Entre em campo, acompanhe os momentos-chave e finalize o relatório.',
    route:'match',
    cta:'Jogar partida',
    trigger:'match-completed',
    reward:{reputation:1, coins:25},
    rewardText:'+1 reputação · +25 moedas',
    guide:'A partida inicia automaticamente. Use pausa, velocidade, pressão ou bloco baixo conforme o momento do jogo.'
  },
  {
    id:'read-report',
    order:6,
    title:'Leia o relatório pós-jogo',
    short:'Use o relatório para decidir treino, tática e discurso para o elenco.',
    route:'match',
    cta:'Ver relatório',
    trigger:'report-viewed',
    reward:{boardTrust:2, reputation:1, coins:30},
    rewardText:'+2 diretoria · +1 reputação · +30 moedas',
    guide:'O relatório mostra placar, xG, posse, moral, imprensa e direção tática. Ele fecha o ciclo antes de voltar ao lobby.'
  },
  {
    id:'save-career',
    order:7,
    title:'Proteja sua carreira',
    short:'Abra a central de save para conhecer backup, exportação e recuperação.',
    route:'saveCenter',
    cta:'Abrir save',
    trigger:'route:saveCenter',
    reward:{coins:20},
    rewardText:'+20 moedas',
    guide:'O save profissional protege sua carreira de corrupção e permite exportar sua história para continuar depois.'
  }
];

export const tutorialBadges = [
  {id:'first-week', name:'Primeira semana', condition:'complete-3', text:'Complete 3 missões iniciais'},
  {id:'media-ready', name:'Treinador midiático', condition:'press', text:'Conclua uma coletiva'},
  {id:'career-safe', name:'Carreira protegida', condition:'save', text:'Abra a central de save'}
];
