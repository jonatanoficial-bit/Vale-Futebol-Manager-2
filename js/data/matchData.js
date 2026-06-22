export const matchTimeline = [
  { minute: 1, type:'kickoff', team:'neutral', title:'Bola rolando', text:'Começa a partida na Vila Belmiro. O Santos inicia tentando controlar a posse.' },
  { minute: 8, type:'chance', team:'santos', x:62, y:48, title:'Primeira chegada', text:'Santos triangula pela direita e finaliza travado dentro da área.' },
  { minute: 15, type:'danger', team:'palmeiras', x:38, y:42, title:'Resposta visitante', text:'Palmeiras acelera em transição e obriga a defesa a cortar para escanteio.' },
  { minute: 18, type:'goal', team:'santos', x:72, y:50, title:'GOOOL DO SANTOS', text:'Marcos Leonardo ataca o espaço entre os zagueiros e abre o placar.' },
  { minute: 27, type:'card', team:'palmeiras', x:48, y:57, title:'Cartão amarelo', text:'Volante visitante para contra-ataque com falta tática no meio.' },
  { minute: 36, type:'chance', team:'santos', x:69, y:33, title:'Pressão no ataque', text:'Soteldo recebe em profundidade e cruza rasteiro, mas a defesa afasta.' },
  { minute: 45, type:'halftime', team:'neutral', title:'Intervalo', text:'Santos vai para o vestiário em vantagem, com mais posse e controle territorial.' },
  { minute: 51, type:'chance', team:'palmeiras', x:31, y:60, title:'Defesa importante', text:'João Paulo espalma chute forte de média distância.' },
  { minute: 63, type:'goal', team:'palmeiras', x:25, y:44, title:'Gol do Palmeiras', text:'O visitante empata após jogada aérea e desvio na pequena área.' },
  { minute: 68, type:'sub', team:'santos', title:'Substituição preparada', text:'O banco do Santos aquece. A comissão recomenda renovar o lado direito.' },
  { minute: 74, type:'goal', team:'santos', x:76, y:38, title:'GOOOL DO SANTOS', text:'Ângelo corta para dentro e cruza na cabeça do centroavante: 2 a 1.' },
  { minute: 82, type:'pressure', team:'palmeiras', x:30, y:51, title:'Pressão final', text:'Palmeiras adianta as linhas e força o Santos a defender mais baixo.' },
  { minute: 90, type:'fulltime', team:'neutral', title:'Fim de jogo', text:'Apita o árbitro. Vitória importante do Santos em noite de pressão.' }
];

export const matchActionTips = [
  { label:'Manter posse', impact:'Reduz risco e preserva energia nos minutos finais.' },
  { label:'Pressionar saída', impact:'Aumenta roubadas, mas eleva fadiga dos atacantes.' },
  { label:'Explorar direita', impact:'Busca velocidade do ponta contra lateral amarelado.' },
  { label:'Baixar bloco', impact:'Protege resultado, reduz volume ofensivo.' }
];

export const playerRatings = [
  { name:'Marcos Leonardo', role:'ATA', rating:8.3, note:'Gol e presença de área' },
  { name:'Soteldo', role:'PE', rating:7.7, note:'Criação pelo lado esquerdo' },
  { name:'João Paulo', role:'GOL', rating:7.4, note:'Defesa decisiva no 2º tempo' },
  { name:'Joaquim', role:'ZAG', rating:7.1, note:'Cortes e liderança defensiva' },
  { name:'Ângelo', role:'PD', rating:7.9, note:'Assistência e profundidade' }
];
