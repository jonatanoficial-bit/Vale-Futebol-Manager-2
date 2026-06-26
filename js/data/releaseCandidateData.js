export const RELEASE_CANDIDATE_VERSION = 'v6.0.0';

export const RC_PUBLIC_STATUS_V600 = {
  label: 'Beta Pública',
  phase: 'Primeiros passos',
  readinessTarget: 94,
  buildDate: '2026-06-22',
  publicGoal: 'Primeira build limpa para teste controlado com jogadores reais em celular.',
  testersTarget: '5 a 10 jogadores no Android/iPhone antes da RC comercial',
  recommendedSession: '15 a 25 minutos por jogador',
  feedbackPriority: ['rolagem mobile', 'primeira carreira', 'primeira partida', 'save/continuar', 'legibilidade']
};

export const RC_CHECKPOINTS_V600 = [
  { id:'boot', area:'Inicialização', label:'Abrir jogo sem erro branco', score:100, critical:true, note:'A capa, build badge e rotas principais precisam carregar sem travar.' },
  { id:'onboarding', area:'Onboarding', label:'Avatar, nome, modo e clube no celular', score:98, critical:true, note:'Usuário precisa conseguir criar carreira apenas deslizando a tela com o dedo.' },
  { id:'mobile-scroll', area:'Mobile', label:'Rolagem vertical total', score:99, critical:true, note:'Nenhuma tela inicial deve prender o toque ou cortar botão principal.' },
  { id:'matchday', area:'Partida', label:'Partida jogável em retrato e horizontal', score:94, critical:true, note:'Campo, placar, comandos e narração devem permanecer acessíveis mesmo sem fullscreen.' },
  { id:'save', area:'Save', label:'Salvar, fechar e continuar carreira', score:96, critical:true, note:'LocalStorage, backup, import/export e migração devem permanecer intactos.' },
  { id:'career-loop', area:'Carreira', label:'Coletiva, jogo, relatório e lobby', score:92, critical:true, note:'O fluxo mínimo de diversão precisa fechar um ciclo completo.' },
  { id:'data-pack', area:'Dados', label:'Elencos e logos preservados', score:95, critical:false, note:'Data Pack 2026, roster lock, Série A/B, CONMEBOL e Mundo seguem preservados.' },
  { id:'performance', area:'Performance', label:'Peso aceitável para GitHub Pages/PWA', score:88, critical:false, note:'Ainda precisa teste real em celular fraco e conexão móvel antes da versão comercial.' },
  { id:'visual-polish', area:'Visual', label:'Visual consistente de build pública', score:90, critical:false, note:'Ainda há telas técnicas, mas a Beta já pode receber feedback de jogadores.' },
  { id:'feedback-loop', area:'Feedback', label:'Checklist de relato do testador', score:97, critical:false, note:'O jogador deve saber exatamente o que testar e como reportar problema.' }
];

export const RC_DEVICE_MATRIX_V600 = [
  { device:'Android pequeno', viewport:'360×740', orientation:'Retrato', mustPass:['onboarding','lobby','partida retrato','save'] },
  { device:'Android médio', viewport:'390×844', orientation:'Retrato', mustPass:['avatar','clube','lobby','coletiva'] },
  { device:'iPhone padrão', viewport:'393×852', orientation:'Retrato/PWA', mustPass:['teclado','safe area','scroll','continuar'] },
  { device:'Android horizontal pequeno', viewport:'640×360', orientation:'Horizontal', mustPass:['campo compacto','comandos','narração'] },
  { device:'iPhone horizontal menor', viewport:'667×375', orientation:'Horizontal', mustPass:['placar','rolagem','sem cortes'] },
  { device:'Celular grande horizontal', viewport:'844×390', orientation:'Horizontal', mustPass:['matchday completo','painéis laterais'] },
  { device:'Tablet', viewport:'768×1024', orientation:'Retrato', mustPass:['menu completo','tabelas','mercado'] },
  { device:'Desktop secundário', viewport:'1366×768', orientation:'Livre', mustPass:['teclado/mouse','layout amplo'] }
];

export const RC_ROUTE_GATES_V600 = [
  'cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','managerMenu','match','pressConference','squad','formation','training','standings','transfers','messages','careerTutorial','managerProgression','careerOffers','aiBalance','saveCenter','releaseCandidate'
];

export const RC_MANUAL_TEST_FLOW_V600 = [
  'Abrir o jogo no celular pelo navegador ou PWA.',
  'Criar nova carreira: escolher avatar, escrever nome e avançar sem corte de tela.',
  'Escolher clube e confirmar carreira.',
  'Entrar no lobby e abrir menu do treinador.',
  'Abrir tutorial guiado e voltar ao lobby.',
  'Abrir coletiva de imprensa e responder uma pergunta.',
  'Iniciar partida em retrato; confirmar que a tela rola com o dedo.',
  'Girar o celular; confirmar que campo e comandos continuam acessíveis.',
  'Encerrar partida, abrir relatório pós-jogo e retornar ao lobby.',
  'Salvar, fechar o navegador, abrir novamente e continuar.'
];

export const RC_KNOWN_LIMITS_V600 = [
  { level:'atenção', item:'Fullscreen iPhone', note:'Safari comum pode negar fullscreen real; PWA instalado é o caminho ideal.' },
  { level:'atenção', item:'Celular fraco', note:'A pasta de assets é grande; precisa medir abertura em 4G e Android básico.' },
  { level:'não bloqueante', item:'Visual interno', note:'Alguns módulos avançados ainda parecem central técnica; serão polidos nas fases v6.1–v6.6.' },
  { level:'não bloqueante', item:'Som', note:'Feedback sonoro e trilha ainda não fazem parte da Beta Pública.' }
];
