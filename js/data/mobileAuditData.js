export const mobileAuditFlows = [
  {
    id:'new-career-flow',
    title:'Novo jogo até lobby',
    scope:'Fluxo crítico',
    steps:['Menu inicial','Criação do manager','Escolha de clube','Confirmação','Lobby'],
    expected:'Criar carreira sem erro, sem tela branca e com build visível.'
  },
  {
    id:'club-selection-flow',
    title:'Escolha de clubes Série A/B',
    scope:'Dados 2026',
    steps:['Selecionar Série A','Selecionar Série B','Escolher Juventude','Iniciar carreira','Validar liga do clube'],
    expected:'O clube escolhido precisa controlar calendário, lobby, tabela e partida.'
  },
  {
    id:'match-flow',
    title:'Partida automática e pós-jogo',
    scope:'Gameplay',
    steps:['Iniciar jogo','Ativar automático','Acelerar 2x/5x','Finalizar','Voltar ao lobby'],
    expected:'Partida chega aos 90 minutos, salva placar e retorna ao lobby com um clique.'
  },
  {
    id:'season-flow',
    title:'Rodada, tabela e calendário',
    scope:'Temporada',
    steps:['Abrir Temporada','Ver rodada atual','Finalizar jogo','Simular rodada','Ver tabela'],
    expected:'Tabela deve recalcular pontos, saldo e zonas com logos dos clubes.'
  },
  {
    id:'market-flow',
    title:'Mercado e contratos',
    scope:'Transferências',
    steps:['Abrir Transferências','Negociar','Comprar/Vender/Emprestar','Renovar','Voltar ao lobby'],
    expected:'Orçamento, folha e diário de mercado devem atualizar sem quebrar save.'
  },
  {
    id:'save-flow',
    title:'Save, continuar e backups',
    scope:'Persistência',
    steps:['Autosave','Backup manual','Exportar JSON','Importar JSON','Continuar carreira'],
    expected:'Carreira deve sobreviver a reload, erro de JSON e migração de versão.'
  },
  {
    id:'mobile-flow',
    title:'Mobile vertical e toque',
    scope:'UX mobile',
    steps:['360x740','390x844','412x915','Safe-area','Scroll'],
    expected:'Sem overflow horizontal, botões tocáveis e telas com rolagem natural.'
  }
];

export const mobileDeviceProfiles = [
  { id:'small-android', name:'Android pequeno', width:360, height:740, minTap:44, priority:'Alta' },
  { id:'iphone-standard', name:'iPhone padrão', width:390, height:844, minTap:44, priority:'Alta' },
  { id:'large-android', name:'Android grande', width:412, height:915, minTap:44, priority:'Alta' },
  { id:'tablet-portrait', name:'Tablet vertical', width:768, height:1024, minTap:44, priority:'Média' },
  { id:'desktop', name:'Desktop web', width:1366, height:768, minTap:40, priority:'Média' }
];

export const criticalRoutes = [
  'cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','match','seasonCenter','standings','transfers','formation','training','financeCenter','careerOffers','nationalTeam','settings','saveCenter','visualLibrary','polishCenter'
];

export const regressionFixesV350 = [
  'Fluxo visual testável dentro do próprio jogo.',
  'Checklist mobile por dispositivo e rota crítica.',
  'Botões de teste rápido para caminhos de maior risco.',
  'Relatório de riscos com severidade e recomendação objetiva.',
  'Fallback de auditoria: se algum dado estiver ausente, a central ainda abre.',
  'Documentação de teste manual para GitHub Pages e Vercel.'
];
