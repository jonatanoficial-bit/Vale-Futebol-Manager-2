export const financeProfiles = {
  conservative:{id:'conservative', name:'Controle conservador', risk:24, board:'Diretoria prioriza caixa positivo, folha controlada e contratações sem risco.'},
  balanced:{id:'balanced', name:'Crescimento equilibrado', risk:43, board:'Diretoria aceita investimento se houver retorno esportivo e comercial.'},
  aggressive:{id:'aggressive', name:'Projeto agressivo', risk:68, board:'Diretoria aceita pressão financeira por acesso, título ou Libertadores.'}
};

export const revenueStreams = [
  {id:'broadcast', name:'Direitos de transmissão', monthly:7.8, volatility:8, note:'Receita recorrente conforme divisão e exposição nacional.'},
  {id:'ticketing', name:'Bilheteria e sócio-torcedor', monthly:4.2, volatility:18, note:'Sobe com vitórias, clássicos e fases decisivas.'},
  {id:'sponsorship', name:'Patrocínios ativos', monthly:5.6, volatility:12, note:'Afetado por reputação, posição na tabela e mídia.'},
  {id:'prize', name:'Premiações esportivas', monthly:1.4, volatility:35, note:'Bônus por fase de Copa, continental e metas de diretoria.'},
  {id:'commerce', name:'Loja, licenciamento e matchday', monthly:2.1, volatility:22, note:'Depende de torcida, ídolos e calendário.'}
];

export const expenseStreams = [
  {id:'wages', name:'Folha salarial do elenco', monthly:8.9, pressure:82, note:'Principal custo fixo do clube.'},
  {id:'staff', name:'Comissão técnica e staff', monthly:2.3, pressure:54, note:'Impacta treino, scouting, médico e recuperação.'},
  {id:'operations', name:'Operação, viagens e estádio', monthly:3.2, pressure:47, note:'Sobe em calendário continental e viagens longas.'},
  {id:'debt', name:'Dívidas, parcelas e encargos', monthly:1.6, pressure:36, note:'Pode virar crise se caixa ficar negativo.'},
  {id:'academy', name:'Base e estrutura', monthly:1.1, pressure:22, note:'Investimento de longo prazo em jovens.'}
];

export const boardMandates = [
  {id:'league', area:'Esportivo', target:'Terminar acima da meta mínima da divisão', weight:32, riskIfFail:'Pressão imediata da diretoria'},
  {id:'finance', area:'Financeiro', target:'Manter saldo projetado positivo e folha abaixo do teto seguro', weight:28, riskIfFail:'Bloqueio de contratações'},
  {id:'market', area:'Mercado', target:'Valorizar ativos e evitar contratos longos acima do orçamento', weight:18, riskIfFail:'Venda forçada de jogador'},
  {id:'fans', area:'Torcida', target:'Preservar competitividade em clássicos e copas', weight:14, riskIfFail:'Queda de popularidade'},
  {id:'academy', area:'Base', target:'Promover ao menos um jovem ou manter investimento mínimo', weight:8, riskIfFail:'Menor avaliação de projeto'}
];

export const sponsorMarket = [
  {id:'master-global', tier:'Master', name:'Patrocinador Master Global', annual:38, bonus:9, fit:'internacional', minRep:82, risk:'exige Libertadores ou luta por título'},
  {id:'regional-bank', tier:'Master', name:'Banco regional premium', annual:22, bonus:5, fit:'nacional', minRep:68, risk:'cobra exposição em TV'},
  {id:'sportswear', tier:'Material esportivo', name:'Fornecedor esportivo elite', annual:18, bonus:7, fit:'uniforme', minRep:72, risk:'renovação depende de vendas'},
  {id:'digital-payments', tier:'Manga', name:'Pagamentos digitais', annual:9.5, bonus:3.2, fit:'jovem', minRep:58, risk:'bônus por engajamento'},
  {id:'local-industry', tier:'Placas e CT', name:'Indústria local', annual:4.4, bonus:1.1, fit:'regional', minRep:35, risk:'seguro para clubes menores'}
];

export const crisisScenarios = [
  {id:'cash-shortage', name:'Caixa pressionado', trigger:'saldo projetado negativo', severity:70, action:'reduzir folha, vender jogador ou renegociar patrocinador'},
  {id:'wage-overload', name:'Folha acima do teto', trigger:'folha maior que 70% da receita', severity:78, action:'bloqueio de novas contratações até aliviar salários'},
  {id:'board-warning', name:'Alerta da diretoria', trigger:'sequência ruim + meta financeira distante', severity:62, action:'reunião obrigatória e plano de recuperação'},
  {id:'forced-sale', name:'Venda forçada', trigger:'crise grave persistente', severity:88, action:'diretoria pode aceitar proposta por atleta valorizado'}
];
