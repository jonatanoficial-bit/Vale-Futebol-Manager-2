export const REAL_AUDIO_PACK_VERSION = 'v7.2.0';

export const REAL_AUDIO_PACK_STATUS_V720 = {
  label: 'Pacote de Efeitos Reais Opcionais',
  status: 'real-audio-pack-ready',
  phase: 'Efeitos de áudio',
  build: 'v7.2.0'
};

export const REAL_AUDIO_ASSET_ROOT_V720 = 'assets/audio';

export const REAL_AUDIO_TRACKS_V720 = [
  { id:'crowd-home', title:'Torcida casa cheia', category:'torcida', mood:'empurra o time mandante', loop:true, volume:34, fallbackPreset:'stadium-home', durationHint:'loop 30-90s', paths:['assets/audio/crowd/crowd-home.mp3','assets/audio/crowd/crowd-home.wav','assets/audio/crowd/crowd-home.ogg'], contextRoutes:['match','matchdayPremium','matchSimulation90'] },
  { id:'crowd-away', title:'Torcida visitante hostil', category:'torcida', mood:'pressão fora de casa', loop:true, volume:30, fallbackPreset:'away-hostile', durationHint:'loop 30-90s', paths:['assets/audio/crowd/crowd-away.mp3','assets/audio/crowd/crowd-away.wav','assets/audio/crowd/crowd-away.ogg'], contextRoutes:['match','squadMorale'] },
  { id:'final-pressure', title:'Abafa final', category:'tensão', mood:'15 minutos finais', loop:true, volume:34, fallbackPreset:'final-pressure', durationHint:'loop 20-60s', paths:['assets/audio/crowd/final-pressure.mp3','assets/audio/crowd/final-pressure.wav','assets/audio/crowd/final-pressure.ogg'], contextRoutes:['matchSimulation90','match'] },
  { id:'kickoff-whistle', title:'Apito inicial', category:'efeito', mood:'começo da partida', loop:false, volume:24, fallbackPreset:'pre-match', durationHint:'1-3s', paths:['assets/audio/effects/kickoff-whistle.mp3','assets/audio/effects/kickoff-whistle.wav','assets/audio/effects/kickoff-whistle.ogg'], contextRoutes:['match','matchdayPremium'] },
  { id:'final-whistle', title:'Apito final', category:'efeito', mood:'fim de jogo', loop:false, volume:24, fallbackPreset:'stadium-home', durationHint:'1-4s', paths:['assets/audio/effects/final-whistle.mp3','assets/audio/effects/final-whistle.wav','assets/audio/effects/final-whistle.ogg'], contextRoutes:['match','pressConference'] },
  { id:'goal-roar', title:'Explosão do gol', category:'efeito', mood:'gol do clube', loop:false, volume:36, fallbackPreset:'final-pressure', durationHint:'3-8s', paths:['assets/audio/effects/goal-roar.mp3','assets/audio/effects/goal-roar.wav','assets/audio/effects/goal-roar.ogg'], contextRoutes:['match','liveWorld'] },
  { id:'stadium-anthem', title:'Entrada em campo', category:'trilha', mood:'pré-jogo cinematográfico', loop:false, volume:28, fallbackPreset:'pre-match', durationHint:'15-45s', paths:['assets/audio/music/stadium-anthem.mp3','assets/audio/music/stadium-anthem.wav','assets/audio/music/stadium-anthem.ogg'], contextRoutes:['matchdayPremium','careerIntro'] },
  { id:'training-field', title:'Ambiente de treino', category:'ambiente', mood:'CT e preparação', loop:true, volume:18, fallbackPreset:'training-ground', durationHint:'loop 20-60s', paths:['assets/audio/ambience/training-field.mp3','assets/audio/ambience/training-field.wav','assets/audio/ambience/training-field.ogg'], contextRoutes:['training'] },
  { id:'board-room', title:'Sala da diretoria', category:'ambiente', mood:'reunião séria', loop:true, volume:14, fallbackPreset:'board-room', durationHint:'loop 20-60s', paths:['assets/audio/ambience/board-room.mp3','assets/audio/ambience/board-room.wav','assets/audio/ambience/board-room.ogg'], contextRoutes:['emotionalBoard'] },
  { id:'ui-confirm', title:'Clique premium', category:'interface', mood:'confirmação leve', loop:false, volume:10, fallbackPreset:'training-ground', durationHint:'0.2-1s', paths:['assets/audio/ui/ui-confirm.mp3','assets/audio/ui/ui-confirm.wav','assets/audio/ui/ui-confirm.ogg'], contextRoutes:['lobby','settings'] }
];

export const REAL_AUDIO_FORMAT_RULES_V720 = [
  { id:'mp3', title:'MP3', rule:'melhor compatibilidade mobile; recomendado para torcida, apito e trilha curta' },
  { id:'wav', title:'WAV', rule:'aceito para efeitos curtos; pode ficar pesado se usado em loops longos' },
  { id:'ogg', title:'OGG', rule:'opcional; ótimo em alguns navegadores, mas não deve ser o único formato' }
];

export const REAL_AUDIO_IMPORT_STEPS_V720 = [
  'Coloque os arquivos dentro das pastas oficiais em assets/audio/.',
  'Use exatamente os nomes do manifest para o jogo encontrar automaticamente.',
  'Prefira MP3 para celular e mantenha volume já normalizado antes do upload.',
  'Loops de torcida devem ter corte limpo para não dar estalo quando repetir.',
  'Nunca remova o fallback WebAudio: se o arquivo faltar, o jogo continua funcionando.',
  'Teste em Android, iPhone/PWA e desktop depois do upload.'
];

export const REAL_AUDIO_SAFETY_RULES_V720 = [
  'Áudio real é sempre opcional: nenhum MP3/WAV é obrigatório para abrir o jogo.',
  'Autoplay continua bloqueado: tocar áudio exige clique/toque do usuário.',
  'Se um arquivo não existir, o jogo usa o preset áudio seguro correspondente.',
  'Botão de parar som deve interromper MP3/WAV e também o fallback sintético.',
  'Volume padrão precisa ficar abaixo de 40% para proteger experiência mobile.',
  'Falha de decode, formato ou caminho errado não pode travar partida, save ou navegação.'
];
