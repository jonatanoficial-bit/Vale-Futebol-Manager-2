export const AGENT_MARKET_VERSION = 'v6.7.0';

export const AGENT_MARKET_STATUS_V670 = {
  label: 'Mercado com Empresários e Negociações Vivas',
  status: 'agent-market-ready',
  phase: 'Empresários e negociações',
  build: 'v6.7.0'
};

export const AGENT_PROFILES_V670 = [
  { id:'relationship', name:'Empresário relacional', icon:'🤝', temperament:'calmo', trust:82, pressure:38, route:'messages', note:'Valoriza projeto, minutos e transparência antes de pedir luvas.' },
  { id:'commission', name:'Empresário agressivo', icon:'💰', temperament:'duro', trust:46, pressure:84, route:'financeCenter', note:'Pede luvas altas, comissão e usa clubes rivais para acelerar decisão.' },
  { id:'career', name:'Empresário de carreira', icon:'📈', temperament:'analítico', trust:68, pressure:55, route:'careerOffers', note:'Quer plano de evolução, titularidade e vitrine continental.' },
  { id:'family', name:'Representante familiar', icon:'🏠', temperament:'sensível', trust:74, pressure:44, route:'squadAI', note:'Reage muito a moral, promessa não cumprida e ambiente de vestiário.' },
  { id:'superagent', name:'Superagente internacional', icon:'🌍', temperament:'imprevisível', trust:53, pressure:78, route:'smartMarket', note:'Abre mercado global, mas exige rapidez, imagem e bônus por metas.' }
];

export const NEGOTIATION_STAGES_V670 = [
  { id:'scout', title:'Sondagem', icon:'👀', risk:'baixo', action:'Confirmar interesse e mapear concorrência', route:'smartMarket' },
  { id:'agent', title:'Conversa com empresário', icon:'📞', risk:'médio', action:'Ajustar tom, promessa esportiva e comissão', route:'messages' },
  { id:'club', title:'Proposta ao clube', icon:'🏛️', risk:'médio', action:'Equilibrar pagamento, bônus e orçamento', route:'financeCenter' },
  { id:'player', title:'Projeto ao jogador', icon:'⭐', risk:'alto', action:'Vender função tática, minutos e vitrine', route:'formation' },
  { id:'closure', title:'Fechamento', icon:'📝', risk:'decisivo', action:'Assinar ou recuar antes de crise financeira', route:'contracts' }
];

export const LIVE_NEGOTIATION_CASES_V670 = [
  { id:'young-star', player:'Atacante jovem veloz', club:'Clube médio sul-americano', value:8.5, salary:0.42, agent:'career', rival:'Clube europeu B', mood:'quer plano de carreira', demand:'titularidade progressiva + bônus por gols', route:'academyScouting' },
  { id:'veteran-leader', player:'Zagueiro líder veterano', club:'Livre no mercado', value:1.8, salary:0.28, agent:'relationship', rival:'Rival nacional', mood:'quer contrato de 2 anos', demand:'papel de liderança + premiação por clean sheet', route:'squadAI' },
  { id:'expensive-mid', player:'Meia camisa 10 caro', club:'Grande da América', value:16.0, salary:0.88, agent:'superagent', rival:'Mercado árabe', mood:'quer projeto campeão', demand:'luvas + bônus continental + marketing', route:'financeCenter' },
  { id:'loan-gk', player:'Goleiro emprestável', club:'Clube europeu', value:4.2, salary:0.24, agent:'commission', rival:'Clube da Série A', mood:'quer jogar imediatamente', demand:'opção de compra + cláusula de minutos', route:'transfers' },
  { id:'renewal-core', player:'Volante titular em renovação', club:'Seu clube', value:11.5, salary:0.51, agent:'family', rival:'Proposta internacional', mood:'cobrança por valorização', demand:'aumento salarial + promessa de capitão', route:'contracts' }
];

export const CONTRACT_LEVERS_V670 = [
  { id:'salary', title:'Salário', effect:'Aumenta chance de aceite, mas pesa na folha e irrita diretoria se passar do teto.' },
  { id:'bonus', title:'Bônus por metas', effect:'Bom para convencer sem estourar caixa imediato; pode virar despesa se o time performar.' },
  { id:'minutes', title:'Promessa de minutos', effect:'Atrai jogador ambicioso, mas gera crise se o treinador não cumprir.' },
  { id:'release', title:'Cláusula de saída', effect:'Reduz resistência do agente, porém enfraquece proteção patrimonial.' },
  { id:'commission', title:'Comissão do empresário', effect:'Acelera acordo, mas reduz reputação com diretoria e torcida se exagerada.' },
  { id:'project', title:'Projeto esportivo', effect:'Melhora confiança e encaixa com IA de elenco, matchday e objetivos de temporada.' }
];

export const RIVAL_PRESSURE_EVENTS_V670 = [
  'Empresário avisa que recebeu proposta rival e pede resposta em 48h.',
  'Diretoria libera orçamento limitado e exige vender antes de comprar.',
  'Torcida pressiona por reforço depois de manchete no jornal esportivo.',
  'Jogador aceita ouvir proposta se o plano tático mostrar função clara.',
  'Clube vendedor aceita parcelamento, mas pede bônus por título continental.',
  'Agente ameaça encerrar conversa se promessa pública não for cumprida.'
];

export const NEGOTIATION_RULES_V670 = [
  'Nenhuma negociação pode bloquear a rolagem mobile.',
  'Toda proposta exibe risco financeiro e risco emocional antes do fechamento.',
  'Empresário, jogador, clube vendedor e diretoria possuem pressão própria.',
  'Promessas feitas ao jogador alimentam IA de elenco, objetivos e diretoria viva.',
  'O sistema preserva transferências antigas, mercado inteligente e contratos.',
  'O fechamento só é recomendado quando orçamento, moral e função tática ficam coerentes.'
];
