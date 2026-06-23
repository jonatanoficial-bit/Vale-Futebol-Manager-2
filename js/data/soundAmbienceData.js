export const SOUND_AMBIENCE_VERSION = 'v7.1.0';

export const SOUND_AMBIENCE_STATUS_V710 = {
  label: 'Sons, Ambiência e Torcida',
  status: 'sound-ambience-ready',
  phase: 'Fase 54 — sons leves, estádio vivo, torcida, apito e clima controlado',
  build: 'v7.1.0'
};

export const AMBIENCE_PRESETS_V710 = [
  { id:'stadium-home', title:'Estádio cheio em casa', mood:'torcida empurrando', volume:32, crowd:72, tension:48, whistle:18, tempo:84, route:'match', description:'cama de torcida baixa, pulsação de arquibancada e tensão de jogo grande sem depender de arquivo pesado.' },
  { id:'pre-match', title:'Pré-jogo tenso', mood:'entrada no gramado', volume:26, crowd:54, tension:70, whistle:10, tempo:62, route:'matchdayPremium', description:'ambiente cinematográfico antes da bola rolar, com grave leve e murmúrio crescente.' },
  { id:'final-pressure', title:'Abafa dos 15 finais', mood:'drama final', volume:36, crowd:86, tension:82, whistle:24, tempo:112, route:'matchSimulation90', description:'crescimento de torcida e batida sutil para simular pressão nos minutos decisivos.' },
  { id:'away-hostile', title:'Fora de casa hostil', mood:'pressão adversária', volume:30, crowd:80, tension:76, whistle:22, tempo:94, route:'squadMorale', description:'arquibancada rival pressionando, útil para jogos difíceis e crise emocional.' },
  { id:'training-ground', title:'CT e treino', mood:'rotina do clube', volume:18, crowd:18, tension:20, whistle:34, tempo:58, route:'training', description:'apitos leves, campo aberto e clima de treino para telas de preparação.' },
  { id:'board-room', title:'Sala da diretoria', mood:'reunião séria', volume:14, crowd:0, tension:62, whistle:0, tempo:44, route:'emotionalBoard', description:'textura discreta para reunião de pressão, finanças e promessas cobradas.' }
];

export const SOUND_CHANNELS_V710 = [
  { id:'crowd-bed', title:'Torcida base', purpose:'preenche o estádio sem ocupar memória', safeVolume:36 },
  { id:'tension-bed', title:'Tensão de partida', purpose:'grave e pulso leve para momentos decisivos', safeVolume:26 },
  { id:'whistle-cue', title:'Apito e gatilhos', purpose:'efeitos curtos acionados por botão/rota', safeVolume:22 },
  { id:'drum-pulse', title:'Pulso de arquibancada', purpose:'ritmo discreto para abafa e fim de jogo', safeVolume:20 },
  { id:'ui-cue', title:'Clique premium', purpose:'retorno sonoro leve sem irritar no mobile', safeVolume:12 }
];

export const MATCH_SOUND_EVENTS_V710 = [
  { id:'kickoff', minute:1, title:'Apito inicial', preset:'stadium-home', intensity:42, trigger:'entrada na partida' },
  { id:'big-chance', minute:22, title:'Chance clara', preset:'stadium-home', intensity:70, trigger:'evento importante no texto 2D' },
  { id:'goal-roar', minute:37, title:'Gol e explosão da torcida', preset:'final-pressure', intensity:88, trigger:'gol do time da casa' },
  { id:'halftime', minute:45, title:'Intervalo', preset:'pre-match', intensity:38, trigger:'pausa tática' },
  { id:'away-pressure', minute:64, title:'Pressão adversária', preset:'away-hostile', intensity:76, trigger:'sequência ruim ou jogo fora' },
  { id:'final-whistle', minute:90, title:'Apito final', preset:'stadium-home', intensity:55, trigger:'fim da partida e relatório' }
];

export const AUDIO_ACCESSIBILITY_RULES_V710 = [
  'Som nunca inicia sozinho: precisa de toque do usuário para respeitar celular e navegador.',
  'Volume padrão precisa ser baixo para não incomodar e para funcionar bem em fone simples.',
  'Todos os controles precisam ter botão de parar som claramente visível.',
  'A experiência sonora precisa funcionar sem arquivos MP3 externos obrigatórios.',
  'Se o navegador bloquear WebAudio, o jogo continua normal e exibe a central visual.',
  'Nenhum áudio pode travar rolagem, fullscreen, partida, save ou navegação mobile.'
];

export const SOUND_MIX_RULES_V710 = [
  { id:'mobile-safe', title:'Mobile seguro', rule:'usar síntese leve e volume baixo, sem autoplay e sem loop pesado' },
  { id:'offline', title:'Offline/PWA', rule:'usar WebAudio gerado no navegador, sem depender de CDN ou internet' },
  { id:'no-break', title:'Anti-quebra', rule:'falha de áudio retorna silêncio seguro e mantém o jogo jogável' },
  { id:'contextual', title:'Contextual', rule:'presets ligados a partida, diretoria, treino e vestiário' },
  { id:'commercial', title:'Comercial', rule:'ambiente deve enriquecer o jogo sem parecer arcade exagerado' }
];
