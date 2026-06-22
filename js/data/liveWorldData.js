export const LIVE_WORLD_VERSION = 'v6.2.0';

export const LIVE_WORLD_STATUS_V620 = {
  phase: 'Fase 45 — Lobby Vivo e Jornal Esportivo',
  label: 'Mundo em movimento',
  goal: 'Fazer o lobby parecer um centro de futebol vivo, com manchetes, bastidores, pressão da torcida, diretoria e mercado.',
  promise: 'O jogador deve sentir que há um mundo acontecendo mesmo antes de clicar em jogar partida.',
  readinessTarget: 94,
  mobilePromise: 'Tudo precisa caber em cards verticais, com rolagem natural e sem travar a tela no celular.'
};

export const LIVE_HEADLINES_V620 = [
  {scope:'Clube', title:'Diretoria quer resposta imediata no próximo compromisso', tone:'pressao', weight:95, route:'messages', impact:'Aumenta a importância da coletiva e do plano tático.'},
  {scope:'Torcida', title:'Arquibancada cobra intensidade e identidade em campo', tone:'emocao', weight:92, route:'formation', impact:'Torcida reage melhor a escalações coerentes e vitórias em casa.'},
  {scope:'Mercado', title:'Empresários oferecem nomes para reforçar posições carentes', tone:'oportunidade', weight:89, route:'smartMarket', impact:'Conecta lobby vivo ao mercado inteligente sem gerar compra automática.'},
  {scope:'Base', title:'Olheiros destacam promessa que pode treinar com o elenco principal', tone:'esperanca', weight:91, route:'academyScouting', impact:'Liga jornal esportivo à base e à evolução de talentos.'},
  {scope:'Competição', title:'Rivais diretos tropeçam e abrem margem para reação na tabela', tone:'competitivo', weight:88, route:'standings', impact:'Cria motivo para olhar classificação antes da partida.'},
  {scope:'Imprensa', title:'Repórteres preparam perguntas sobre ambiente do vestiário', tone:'bastidor', weight:94, route:'pressConference', impact:'A coletiva passa a ter contexto antes e depois do jogo.'}
];

export const LIVE_BACKSTAGE_V620 = [
  {department:'Vestiário', signal:'Lideranças pedem clareza no plano de jogo.', mood:'+3 moral se o técnico mantiver coerência tática.', risk:'Confusão tática reduz confiança.'},
  {department:'Diretoria', signal:'Conselho avalia desempenho, não apenas resultado.', mood:'+2 confiança se cumprir objetivo da rodada.', risk:'Derrota sem reação aumenta pressão.'},
  {department:'Torcida', signal:'Redes sociais pedem postura ofensiva em casa.', mood:'+4 torcida se vencer com bom volume.', risk:'Partida apática pesa mesmo com empate.'},
  {department:'Comissão', signal:'Preparador recomenda controlar fadiga no segundo tempo.', mood:'Menos lesões se usar substituições.', risk:'Atletas cansados perdem intensidade.'},
  {department:'Imprensa', signal:'Narrativa do jogo será “primeira prova real do treinador”.', mood:'+reputação se responder bem.', risk:'Resposta ruim vira manchete negativa.'}
];

export const LIVE_JOURNAL_SECTIONS_V620 = [
  {id:'breaking', title:'Últimas notícias', icon:'📰', description:'Manchetes curtas que explicam o que está acontecendo hoje.'},
  {id:'clubPulse', title:'Pulso do clube', icon:'📡', description:'Diretoria, torcida, vestiário e comissão técnica em tempo de lobby.'},
  {id:'marketDesk', title:'Mesa de mercado', icon:'💼', description:'Rumores controlados, empresários e oportunidades sem quebrar orçamento.'},
  {id:'matchday', title:'Clima de jogo', icon:'⚽', description:'Contexto para partida, coletiva, tática e pós-jogo.'},
  {id:'world', title:'Mundo do futebol', icon:'🌎', description:'Rivais, competições, calendário e manchetes externas.'}
];

export const LIVE_WORLD_RULES_V620 = [
  'Nenhuma notícia pode bloquear o botão de jogar partida.',
  'Cards do jornal devem ficar em uma coluna no mobile pequeno.',
  'Toda manchete importante deve apontar para uma rota existente.',
  'O lobby precisa continuar rápido, sem vídeo pesado e sem dependência online.',
  'A leitura do jornal deve ser opcional, mas gerar vontade de avançar o save.',
  'O sistema deve preservar Beta Pública v6.0.0 e Jornada Inicial v6.1.0.',
  'O mundo vivo não pode alterar placar ou finanças automaticamente sem ação do jogador.'
];

export const LIVE_DEVICE_FOCUS_V620 = [
  {device:'Android pequeno', viewport:'360x740', must:'cards 1 coluna, botões 48px, jornal rolável'},
  {device:'iPhone padrão', viewport:'390x844', must:'lobby sem corte, manchetes tocáveis, bottom nav livre'},
  {device:'Paisagem compacta', viewport:'667x375', must:'painel compacto, sem travar partida'},
  {device:'Tablet', viewport:'768x1024', must:'grid 2 colunas, jornal e pulso lado a lado'},
  {device:'Desktop', viewport:'1366x768', must:'layout premium com cards largos e mapa de bastidores'}
];
