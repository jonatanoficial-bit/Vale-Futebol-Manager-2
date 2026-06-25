export const FINANCE_ENGINE_VERSION = 'v7.9.0';

export const financeProfiles = {
  conservative:{id:'conservative', name:'Controle conservador', risk:24, board:'Diretoria prioriza caixa positivo, folha controlada e contratações sem risco.'},
  balanced:{id:'balanced', name:'Crescimento equilibrado', risk:43, board:'Diretoria aceita investimento se houver retorno esportivo e comercial.'},
  aggressive:{id:'aggressive', name:'Projeto agressivo', risk:68, board:'Diretoria aceita pressão financeira por acesso, título ou Libertadores.'}
};

export const ticketPolicies = [
  {id:'popular', name:'Popular e estádio cheio', price:72, attendanceBoost:16, moodBoost:6, revenueRisk:10, note:'Preço menor, mais torcida, melhor clima e renda estável.'},
  {id:'balanced', name:'Equilibrada', price:108, attendanceBoost:4, moodBoost:2, revenueRisk:18, note:'Boa renda sem irritar a torcida.'},
  {id:'premium', name:'Premium', price:165, attendanceBoost:-10, moodBoost:-5, revenueRisk:30, note:'Maior ticket médio, porém público menor e pressão se o time perder.'},
  {id:'finals', name:'Jogo decisivo', price:210, attendanceBoost:-4, moodBoost:-2, revenueRisk:42, note:'Ideal para clássico, mata-mata e disputa de título.'}
];

export const sponsorPackages = [
  {id:'master-global', tier:'Master', name:'ValeBank Global', annual:46.0, monthly:3.83, bonus:11.5, minRep:82, exposure:'Nacional + continental', termMonths:24, clause:'bônus por Libertadores/título', risk:'cobra performance e exposição TV'},
  {id:'regional-bank', tier:'Master', name:'Banco Regional Premium', annual:28.0, monthly:2.33, bonus:6.2, minRep:66, exposure:'Nacional', termMonths:18, clause:'bônus por G4 e clássicos', risk:'reduz valor se torcida cair'},
  {id:'sportswear', tier:'Material esportivo', name:'Forge Sportswear', annual:21.5, monthly:1.79, bonus:8.0, minRep:70, exposure:'Uniforme + loja', termMonths:36, clause:'royalties por camisa vendida', risk:'depende de ídolos e vitórias'},
  {id:'digital-payments', tier:'Manga', name:'PIX Arena Pay', annual:11.2, monthly:0.93, bonus:3.5, minRep:54, exposure:'Digital e estádio', termMonths:12, clause:'engajamento nas redes', risk:'bônus instável'},
  {id:'local-industry', tier:'CT/Placas', name:'Indústria Paulista', annual:5.6, monthly:0.47, bonus:1.2, minRep:32, exposure:'Regional', termMonths:12, clause:'baixo risco', risk:'seguro, mas com teto baixo'},
  {id:'youth-partner', tier:'Base', name:'Educação & Futuro', annual:4.8, monthly:0.40, bonus:2.4, minRep:45, exposure:'Base + comunidade', termMonths:24, clause:'bônus por jovem promovido', risk:'retorno lento'}
];

export const defaultActiveSponsors = [
  {id:'regional-bank', signed:true, name:'Banco Regional Premium', tier:'Master', monthly:2.05, annual:24.6, remainingMonths:14, bonus:4.2, satisfaction:78},
  {id:'digital-payments', signed:true, name:'PIX Arena Pay', tier:'Manga', monthly:0.72, annual:8.6, remainingMonths:8, bonus:1.6, satisfaction:72},
  {id:'local-industry', signed:true, name:'Indústria Paulista', tier:'CT/Placas', monthly:0.35, annual:4.2, remainingMonths:10, bonus:0.8, satisfaction:84}
];

export const revenueStreams = [
  {id:'broadcast', name:'Direitos de transmissão', monthly:8.6, volatility:8, note:'Receita recorrente conforme divisão, reputação e exposição nacional.'},
  {id:'ticketing', name:'Bilheteria e sócio-torcedor', monthly:4.9, volatility:22, note:'Sobe com vitórias, clássicos, preço e ocupação do estádio.'},
  {id:'sponsorship', name:'Patrocínios ativos', monthly:3.2, volatility:12, note:'Contrato ativo, bônus e satisfação dos parceiros.'},
  {id:'prize', name:'Premiações esportivas', monthly:1.1, volatility:40, note:'Bônus por fase de Copa, continental, título e metas da diretoria.'},
  {id:'commerce', name:'Loja, licenciamento e matchday', monthly:2.6, volatility:26, note:'Depende de torcida, ídolos, fase e calendário.'},
  {id:'membership', name:'Sócio-torcedor', monthly:2.2, volatility:14, note:'Sensível a resultados, preço e confiança no projeto.'}
];

export const expenseStreams = [
  {id:'squadWages', name:'Folha salarial do elenco', monthly:9.8, pressure:84, fixed:true, note:'Principal custo fixo do clube.'},
  {id:'staff', name:'Comissão técnica e staff', monthly:2.1, pressure:54, fixed:true, note:'Impacta treino, scouting, médico e recuperação.'},
  {id:'operations', name:'Operação, viagens e estádio', monthly:3.6, pressure:49, fixed:false, note:'Sobe em calendário continental, viagens e sequência fora de casa.'},
  {id:'debt', name:'Dívidas, parcelas e encargos', monthly:1.9, pressure:42, fixed:true, note:'Pode virar crise se caixa ficar negativo.'},
  {id:'academy', name:'Base e estrutura', monthly:1.3, pressure:24, fixed:false, note:'Investimento de longo prazo em jovens.'},
  {id:'bonuses', name:'Bônus contratuais', monthly:0.9, pressure:32, fixed:false, note:'Vitórias, gols, luvas parceladas e metas esportivas.'}
];

export const prizeRules = [
  {id:'league-win', name:'Vitória no Brasileirão', amount:1.8, condition:'3 pontos em liga'},
  {id:'league-draw', name:'Empate no Brasileirão', amount:0.55, condition:'1 ponto em liga'},
  {id:'cup-round', name:'Avanço em mata-mata', amount:4.0, condition:'classificação em Copa'},
  {id:'classic-win', name:'Bônus de clássico', amount:2.4, condition:'vitória contra rival'},
  {id:'continental-stage', name:'Fase continental', amount:7.5, condition:'Libertadores/Sul-Americana'}
];

export const boardMandates = [
  {id:'league', area:'Esportivo', target:'Terminar acima da meta mínima da divisão', weight:27, riskIfFail:'Pressão imediata da diretoria'},
  {id:'finance', area:'Financeiro', target:'Manter caixa projetado positivo e folha abaixo do teto seguro', weight:31, riskIfFail:'Bloqueio de contratações'},
  {id:'sponsors', area:'Comercial', target:'Manter parceiros satisfeitos e renovar contrato master', weight:17, riskIfFail:'Perda de receita comercial'},
  {id:'fans', area:'Torcida', target:'Preservar estádio cheio e preço aceito pela torcida', weight:13, riskIfFail:'Queda de bilheteria e protestos'},
  {id:'academy', area:'Base', target:'Manter investimento mínimo em estrutura e jovens', weight:7, riskIfFail:'Redução de potencial futuro'},
  {id:'debt', area:'Dívida', target:'Evitar caixa negativo por dois ciclos seguidos', weight:5, riskIfFail:'Venda forçada de atleta'}
];

export const crisisScenarios = [
  {id:'cash-shortage', name:'Caixa pressionado', trigger:'saldo projetado negativo', severity:70, action:'reduzir folha, vender jogador ou renegociar patrocinador'},
  {id:'wage-overload', name:'Folha acima do teto', trigger:'folha maior que 67% da receita', severity:78, action:'bloqueio de novas contratações até aliviar salários'},
  {id:'sponsor-alert', name:'Patrocinador insatisfeito', trigger:'exposição baixa ou torcida em queda', severity:58, action:'melhorar resultados, preço e presença no estádio'},
  {id:'board-warning', name:'Alerta da diretoria', trigger:'sequência ruim + meta financeira distante', severity:62, action:'reunião obrigatória e plano de recuperação'},
  {id:'forced-sale', name:'Venda forçada', trigger:'crise grave persistente', severity:88, action:'diretoria pode aceitar proposta por atleta valorizado'}
];

export const stadiumFinanceProfiles = {
  small:{capacity:18000, fixedCost:0.42, securityCost:0.18, maintenance:0.22},
  medium:{capacity:34000, fixedCost:0.74, securityCost:0.30, maintenance:0.38},
  large:{capacity:52000, fixedCost:1.08, securityCost:0.46, maintenance:0.62},
  elite:{capacity:68000, fixedCost:1.45, securityCost:0.60, maintenance:0.88}
};
