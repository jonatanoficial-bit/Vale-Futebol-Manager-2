export const MATCHDAY_PREMIUM_VERSION = 'v6.3.0';

export const MATCHDAY_PREMIUM_STATUS_V630 = {
  label: 'Matchday Premium',
  status: 'matchday-premium-ready',
  phase: 'Fase 46 — Matchday premium, tensão pré-jogo e pós-jogo emocional',
  build: 'v6.3.0'
};

export const MATCHDAY_PREMIUM_FLOW_V630 = [
  { id:'pre-match', title:'Pré-jogo narrativo', route:'pressConference', icon:'🎙️', focus:'Gancho de imprensa, pressão da torcida, expectativa da diretoria e clima do estádio.' },
  { id:'team-plan', title:'Plano de jogo', route:'formation', icon:'🧩', focus:'Última revisão de escalação, mentalidade, capitão, bolas paradas e banco.' },
  { id:'tunnel', title:'Túnel e entrada', route:'match', icon:'🏟️', focus:'A partida abre com contexto de estádio, árbitro, público e risco emocional.' },
  { id:'live-drama', title:'Drama ao vivo', route:'match', icon:'⚽', focus:'Momentos-chave, VAR, lesão, cartões, momentum, xG e comandos de banco.' },
  { id:'bench-read', title:'Leitura do banco', route:'match', icon:'🔁', focus:'Sugestões de substituição, fadiga e risco de perda de controle.' },
  { id:'post-match', title:'Pós-jogo emocional', route:'liveWorld', icon:'📰', focus:'Manchetes, reação da torcida, diretoria, moral do elenco e gancho do próximo dia.' }
];

export const MATCHDAY_PREMIUM_PACKS_V630 = [
  { id:'broadcast', title:'Transmissão premium', items:['placar com tensão', 'tarja de contexto', 'clima de estádio', 'pílulas de status'] },
  { id:'assistant', title:'Assistente de jogo', items:['alerta de risco', 'troca recomendada', 'tática rápida', 'diagnóstico de momentum'] },
  { id:'emotion', title:'Camada emocional', items:['pressão da torcida', 'nota da imprensa', 'confiança da diretoria', 'moral pós-jogo'] },
  { id:'mobile', title:'Mobile jogável', items:['botões grandes', 'rolagem livre', 'painel compacto', 'sem vídeo pesado'] }
];

export const MATCHDAY_PREMIUM_DEVICE_RULES_V630 = [
  'A partida precisa funcionar em retrato sem cortar placar, botões ou narração.',
  'O modo horizontal compacto continua suportado para quem gira o celular.',
  'Nenhum painel de pré-jogo ou pós-jogo pode ficar fixo bloqueando rolagem.',
  'A fase não adiciona vídeo pesado, internet externa ou dependência de API.',
  'O botão de jogar continua levando à coletiva pré-jogo quando necessário.'
];

export const MATCHDAY_PREMIUM_DRAMA_EVENTS_V630 = [
  { minute:'00', title:'Chegada ao estádio', tone:'Expectativa da torcida e recado da diretoria.' },
  { minute:'15', title:'Primeira leitura', tone:'Assistant coach mede posse, pressão e risco nas costas dos laterais.' },
  { minute:'45', title:'Intervalo', tone:'Resumo tático e decisão entre controlar, pressionar ou preservar físico.' },
  { minute:'70', title:'Janela crítica', tone:'Banco entra em evidência; fadiga e cartões pesam no resultado.' },
  { minute:'90', title:'Coletiva pós-jogo', tone:'Jornal e bastidores reagem ao placar e ao desempenho.' }
];
