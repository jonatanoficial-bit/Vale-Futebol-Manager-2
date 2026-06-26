export const CONTRACT_RENEWAL_VERSION = 'v6.8.0';

export const CONTRACT_RENEWAL_STATUS_V680 = {
  label: 'Renovação Contratual Profunda',
  status: 'contract-renewal-ready',
  phase: 'Renovação contratual',
  build: 'v6.8.0'
};

export const RENEWAL_TARGETS_V680 = [
  { id:'core-mid', player:'Volante titular valorizado', role:'Peça-chave', monthsLeft:7, currentSalary:0.51, requestedSalary:0.72, releaseClause:24, morale:74, agent:'Representante familiar', risk:'proposta internacional', route:'agentMarket' },
  { id:'young-wing', player:'Ponta jovem em ascensão', role:'Promessa do elenco', monthsLeft:11, currentSalary:0.18, requestedSalary:0.36, releaseClause:18, morale:82, agent:'Empresário de carreira', risk:'promessa de minutos', route:'academyScouting' },
  { id:'captain-cb', player:'Zagueiro capitão', role:'Líder do vestiário', monthsLeft:5, currentSalary:0.44, requestedSalary:0.53, releaseClause:12, morale:88, agent:'Empresário relacional', risk:'perda de liderança', route:'squadAI' },
  { id:'luxury-ten', player:'Meia criativo caro', role:'Estrela midiática', monthsLeft:14, currentSalary:0.88, requestedSalary:1.08, releaseClause:40, morale:69, agent:'Superagente internacional', risk:'teto salarial', route:'financeCenter' },
  { id:'rotation-gk', player:'Goleiro reserva confiável', role:'Rotação segura', monthsLeft:9, currentSalary:0.20, requestedSalary:0.26, releaseClause:8, morale:64, agent:'Empresário agressivo', risk:'quer jogar mais', route:'matchdayPremium' }
];

export const CONTRACT_PACKAGES_V680 = [
  { id:'safe', title:'Renovação segura', icon:'🛡️', salaryBoost:12, signingFee:0.2, bonus:'bônus baixo por metas coletivas', moraleImpact:8, boardImpact:10, route:'emotionalBoard' },
  { id:'ambition', title:'Projeto ambicioso', icon:'📈', salaryBoost:22, signingFee:0.6, bonus:'bônus por titularidade e classificação continental', moraleImpact:16, boardImpact:-2, route:'objectivesHub' },
  { id:'star', title:'Contrato de estrela', icon:'⭐', salaryBoost:35, signingFee:1.2, bonus:'luvas altas, marketing e bônus por gols/assistências', moraleImpact:22, boardImpact:-14, route:'financeCenter' },
  { id:'youth', title:'Plano de jovem', icon:'🌱', salaryBoost:18, signingFee:0.25, bonus:'gatilhos por jogos, evolução e convocação', moraleImpact:18, boardImpact:8, route:'academyScouting' },
  { id:'lastchance', title:'Última oferta', icon:'⏳', salaryBoost:8, signingFee:0.1, bonus:'multa maior e promessa limitada', moraleImpact:-4, boardImpact:14, route:'agentMarket' }
];

export const CONTRACT_PROMISES_V680 = [
  { id:'minutes', title:'Minutos em campo', area:'elenco', consequence:'Se não cumprir, moral cai e empresário pressiona no jornal.' },
  { id:'captaincy', title:'Liderança/capitão', area:'vestiário', consequence:'Pode estabilizar líderes ou criar ciúmes internos.' },
  { id:'continental', title:'Projeto continental', area:'diretoria', consequence:'Gera cobrança por vaga e premiação internacional.' },
  { id:'sale-window', title:'Janela de saída futura', area:'mercado', consequence:'Ajuda no aceite, mas fragiliza proteção patrimonial.' },
  { id:'development', title:'Plano de evolução', area:'base', consequence:'Jovens cobram treino, minutos e acompanhamento.' },
  { id:'wage-parity', title:'Valorização salarial', area:'finanças', consequence:'Pode abrir efeito dominó na folha.' }
];

export const CONTRACT_CLAUSES_V680 = [
  { id:'release', title:'Multa rescisória', risk:'proteção baixa gera assédio; proteção alta dificulta aceite.' },
  { id:'signing-fee', title:'Luvas', risk:'impacta caixa imediato e humor da diretoria.' },
  { id:'agent-fee', title:'Comissão do empresário', risk:'acelera acordo, mas aumenta custo invisível.' },
  { id:'performance', title:'Bônus por performance', risk:'bom no curto prazo, caro se o time render muito.' },
  { id:'renewal-trigger', title:'Renovação automática', risk:'protege elenco, mas pode prender salário alto.' },
  { id:'status', title:'Status no elenco', risk:'promessa errada vira crise de vestiário.' }
];

export const RENEWAL_EVENTS_V680 = [
  'Empresário pede valorização antes da reta decisiva da temporada.',
  'Diretoria avisa que o teto salarial não pode ser quebrado sem venda compensatória.',
  'Jogador aceita reduzir luvas se receber promessa clara de minutos.',
  'Torcida cobra renovação de líder após manchete positiva no jornal esportivo.',
  'Reserva ameaça ouvir propostas se continuar sem sequência de jogos.',
  'Superagente exige multa menor para manter porta aberta ao mercado europeu.'
];

export const CONTRACT_RENEWAL_RULES_V680 = [
  'Toda renovação mostra impacto financeiro, emocional e esportivo antes da assinatura.',
  'Promessas contratuais alimentam IA de elenco, Diretoria Viva, Objetivos e Jornal Esportivo.',
  'Nenhum painel usa modal fixo bloqueante no mobile.',
  'O sistema preserva Mercado com Empresários v6.7.0 e Transferências existentes.',
  'Contratos com salário alto alertam sobre efeito dominó no vestiário.',
  'Renovação recomendada só aparece quando salário, moral e papel tático ficam coerentes.'
];
