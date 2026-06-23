export const MATCH_SIMULATION_90_VERSION = 'v7.0.0';

export const MATCH_SIMULATION_90_STATUS_V700 = {
  label: 'Simulação 90 Minutos 2D/Texto Premium',
  status: 'match-simulation90-ready',
  phase: 'Fase 53 — simulação 90 minutos, leitura tática, pressão e eventos premium',
  build: 'v7.0.0'
};

export const MATCH_PHASES_V700 = [
  { id:'opening', title:'0–15 min · Estudo inicial', minuteStart:0, minuteEnd:15, intensity:42, tactical:'encaixar marcação, medir pressão rival e proteger transição', coachCue:'não queimar substituição cedo' },
  { id:'control', title:'16–30 min · Controle territorial', minuteStart:16, minuteEnd:30, intensity:58, tactical:'aproximar linhas, acelerar inversões e atacar lado frágil', coachCue:'pedir mais amplitude se o rival fechar o meio' },
  { id:'pre-halftime', title:'31–45 min · Pressão antes do intervalo', minuteStart:31, minuteEnd:45, intensity:73, tactical:'buscar gol psicológico ou sobreviver ao abafa', coachCue:'avaliar amarelos e fadiga antes do intervalo' },
  { id:'adjustments', title:'46–60 min · Ajustes do treinador', minuteStart:46, minuteEnd:60, intensity:67, tactical:'mudar ritmo, corrigir encaixes e preparar banco', coachCue:'primeira janela de troca inteligente' },
  { id:'decisive-window', title:'61–75 min · Janela decisiva', minuteStart:61, minuteEnd:75, intensity:84, tactical:'explorar cansaço rival, mexer na frente ou fechar bloco', coachCue:'decidir entre pressionar ou controlar vantagem' },
  { id:'final-push', title:'76–90 min · Drama final', minuteStart:76, minuteEnd:90, intensity:93, tactical:'última pressão, bolas paradas, contra-ataque e gestão emocional', coachCue:'evitar pânico e proteger moral do elenco' }
];

export const MOMENTUM_EVENTS_V700 = [
  { id:'high-press', minute:8, title:'Pressão alta encaixou', type:'pressure', impact:62, x:38, y:44, text:'O time força erro na saída e ganha território sem se expor.' },
  { id:'wide-overload', minute:18, title:'Superioridade pelo lado', type:'chance', impact:71, x:66, y:24, text:'O lateral recebe apoio do meia e cria cruzamento perigoso.' },
  { id:'lost-zone', minute:29, title:'Espaço entre linhas', type:'danger', impact:76, x:51, y:55, text:'O adversário começa a receber livre atrás dos volantes.' },
  { id:'set-piece', minute:41, title:'Bola parada decisiva', type:'setpiece', impact:68, x:78, y:49, text:'Escanteio gera confusão e exige atenção no rebote.' },
  { id:'bench-trigger', minute:58, title:'Banco pede leitura', type:'sub', impact:64, x:45, y:70, text:'O ponta reserva aquece e muda o plano para atacar profundidade.' },
  { id:'final-pressure', minute:82, title:'Abafa final', type:'pressure', impact:88, x:72, y:41, text:'A torcida empurra, a linha sobe e cada decisão do treinador pesa.' }
];

export const TACTICAL_READS_V700 = [
  { id:'mid-block', title:'Bloco médio seguro', risk:38, reward:54, route:'instructions', advice:'manter compactação e evitar passe vertical forçado' },
  { id:'press-trap', title:'Armadilha de pressão', risk:62, reward:78, route:'match', advice:'pressionar no gatilho do zagueiro pior tecnicamente' },
  { id:'right-channel', title:'Canal direito vulnerável', risk:49, reward:73, route:'formation', advice:'atacar costas do lateral com ponta veloz' },
  { id:'late-sub', title:'Troca no minuto certo', risk:44, reward:81, route:'matchdayPremium', advice:'usar banco entre 58 e 72 para mudar energia da partida' },
  { id:'protect-lead', title:'Proteger vantagem', risk:52, reward:69, route:'squadMorale', advice:'não recuar demais para não contaminar confiança do vestiário' }
];

export const COACH_INTERVENTIONS_V700 = [
  { id:'tempo-up', title:'Aumentar ritmo', minuteWindow:'20–35', effect:'mais volume e risco físico moderado', morale:4, tactical:9, risk:6, route:'match' },
  { id:'calm-down', title:'Esfriar o jogo', minuteWindow:'35–50', effect:'reduz pressão rival e protege cartões', morale:2, tactical:5, risk:-7, route:'instructions' },
  { id:'early-sub', title:'Troca agressiva', minuteWindow:'55–70', effect:'abre chance de virada, mas cobra o banco', morale:7, tactical:12, risk:10, route:'matchdayPremium' },
  { id:'leader-talk', title:'Chamar capitão', minuteWindow:'intervalo', effect:'reorganiza o vestiário e sustenta foco', morale:10, tactical:4, risk:-3, route:'squadMorale' },
  { id:'set-piece-focus', title:'Bola parada total', minuteWindow:'70–90', effect:'aumenta perigo final e emoção da narração', morale:3, tactical:8, risk:5, route:'training' }
];

export const COMMENTARY_BEATS_V700 = [
  'A partida respira como jogo real: começo estudado, pressão crescente e drama final.',
  'O assistente tático passa a explicar o motivo dos eventos, não apenas mostrar estatísticas.',
  'Cada fase de 15 minutos tem leitura própria, com risco, recompensa e ação recomendada.',
  'O treinador ganha microdecisões: acelerar, esfriar, trocar, proteger moral ou atacar espaço.',
  'O pós-jogo usa os momentos-chave para alimentar imprensa, diretoria, moral e objetivos.'
];

export const SIMULATION_90_RULES_V700 = [
  'A simulação 90 minutos deve preservar a tela de partida antiga e apenas adicionar camada premium.',
  'Nenhum evento 2D pode depender de imagem externa obrigatória.',
  'A rota matchSimulation90 deve funcionar offline e com save antigo.',
  'Os botões precisam direcionar para rotas já existentes e seguras.',
  'A camada v7.0.0 não pode bloquear rolagem no mobile nem fixar painel sobre conteúdo.',
  'O relatório deve expor snapshot técnico para auditoria e regressão.'
];
