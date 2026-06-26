export const SQUAD_AI_VERSION = 'v6.4.0';

export const SQUAD_AI_STATUS_V640 = {
  label: 'IA de Elenco e Vestiário',
  status: 'squad-ai-dressing-room-ready',
  phase: 'IA de elenco',
  build: 'v6.4.0'
};

export const SQUAD_AI_PILLARS_V640 = [
  { id:'morale', title:'Moral dinâmica', icon:'💬', route:'squad', focus:'Leitura de confiança, minutos em campo, forma recente, salário, imprensa e relação com o técnico.' },
  { id:'leadership', title:'Hierarquia e capitães', icon:'🧭', route:'formation', focus:'Capitão, líderes positivos, veteranos, jovens influenciáveis e risco de panelinha.' },
  { id:'minutes', title:'Gestão de minutos', icon:'⏱️', route:'training', focus:'Atletas insatisfeitos por banco, fadiga alta, promessa de oportunidade e rotação planejada.' },
  { id:'locker', title:'Clima do vestiário', icon:'🚪', route:'messages', focus:'Bastidores, boatos, confiança coletiva, cobrança interna e resposta após derrota.' },
  { id:'press', title:'Reação à imprensa', icon:'🎙️', route:'pressConference', focus:'Coletivas alteram moral, proteção do grupo, cobrança pública e pressão da torcida.' },
  { id:'matchday', title:'Resposta em jogo', icon:'🏟️', route:'matchdayPremium', focus:'Leitura antes da partida, intervalo, banco e pós-jogo emocional.' }
];

export const SQUAD_AI_PLAYER_PROFILES_V640 = [
  { role:'Líder técnico', mood:88, influence:94, risk:12, note:'eleva confiança do elenco quando recebe responsabilidade e elogio público.' },
  { role:'Veterano respeitado', mood:78, influence:87, risk:22, note:'segura crise, mas cobra coerência em escalação e plano de jogo.' },
  { role:'Jovem promessa', mood:72, influence:48, risk:38, note:'precisa de minutos ou feedback para não perder evolução e foco.' },
  { role:'Reserva insatisfeito', mood:55, influence:61, risk:64, note:'pode contaminar clima se ficar sem plano de rotação.' },
  { role:'Contratado caro', mood:68, influence:74, risk:49, note:'gera pressão de diretoria e torcida quando fica no banco.' }
];

export const SQUAD_AI_EVENTS_V640 = [
  { trigger:'derrota-classico', title:'Cobrança interna após clássico', action:'Falar com líderes antes do próximo treino.', route:'training', severity:'alta' },
  { trigger:'reserva-sem-minuto', title:'Reserva pede conversa', action:'Prometer rotação ou explicar hierarquia.', route:'squad', severity:'média' },
  { trigger:'jovem-em-alta', title:'Promessa ganha apoio da torcida', action:'Avaliar entrada gradual sem queimar etapa.', route:'academyScouting', severity:'positiva' },
  { trigger:'imprensa-pressiona', title:'Pergunta dura na coletiva', action:'Proteger o grupo ou cobrar reação publicamente.', route:'pressConference', severity:'média' },
  { trigger:'capitao-decisivo', title:'Capitão assume liderança', action:'Manter braçadeira e reforçar confiança.', route:'formation', severity:'positiva' }
];

export const SQUAD_AI_DECISIONS_V640 = [
  { id:'protect', title:'Proteger o elenco', impact:'moral +6 · imprensa -2', bestFor:'pós-derrota ou elenco jovem' },
  { id:'demand', title:'Cobrar publicamente', impact:'diretoria +4 · risco de moral -5', bestFor:'time acomodado ou sequência ruim' },
  { id:'rotate', title:'Prometer rotação', impact:'reservas +8 · titulares -2', bestFor:'calendário cheio e fadiga alta' },
  { id:'captain', title:'Reforçar capitão', impact:'liderança +7 · panelinha -3', bestFor:'crise de vestiário' }
];

export const SQUAD_AI_MOBILE_RULES_V640 = [
  'A central de vestiário precisa abrir em retrato sem cortar cards, botões ou relatório.',
  'Nenhum painel da IA pode ficar fixo bloqueando a rolagem do celular.',
  'A fase não usa API externa, vídeo pesado ou cálculo infinito em tempo real.',
  'O sistema deve se conectar a elenco, treino, coletiva, matchday e jornal sem quebrar rotas antigas.',
  'Todas as decisões precisam ter texto curto e botões tocáveis em telas pequenas.'
];
