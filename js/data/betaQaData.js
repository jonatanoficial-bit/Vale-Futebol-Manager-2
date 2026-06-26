export const BETA_QA_VERSION = 'v8.2.0';
export const BETA_QA_SCHEMA = 820;
export const BETA_QA_BUILD_TIME = '2026-06-26 11:13:18 BRT';

export const BETA_QA_CRITICAL_ROUTES = [
  {route:'cover', label:'Capa', step:'abrir jogo sem pular para lobby'},
  {route:'mainMenu', label:'Central inicial', step:'continuar/criar/gerenciar 3 slots'},
  {route:'newGame', label:'Novo Game', step:'avatar, nome, país e modo'},
  {route:'teamSelect', label:'Escolha do clube', step:'filtros, escudos e seleção'},
  {route:'confirmCareer', label:'Confirmação', step:'manager + clube + iniciar carreira'},
  {route:'lobby', label:'Lobby', step:'resumo, próximo jogo, ribbons e menu limpo'},
  {route:'calendar', label:'Calendário Vivo', step:'viagem, carga, fadiga e recuperação'},
  {route:'training', label:'Treino Semanal', step:'presets e sessão individual'},
  {route:'academyScouting', label:'Scout', step:'relatório, região e lista de desejos'},
  {route:'staff', label:'Staff Vivo', step:'contratar e mudar foco'},
  {route:'financeCenter', label:'Finanças', step:'patrocínio, bilheteria e risco'},
  {route:'match', label:'Partida', step:'pré-jogo, simulação e pós-jogo'},
  {route:'saveSlotsV2', label:'Slots', step:'renomear, apagar e trocar carreira'},
  {route:'assetChecklist', label:'Assets', step:'avatares e placeholders sem 404'},
  {route:'betaProfessional', label:'Beta Profissional', step:'quality gate geral'},
  {route:'betaQaCenter', label:'QA Final', step:'roteiro de homologação final'}
];

export const BETA_QA_DEVICE_MATRIX = [
  {id:'desktop-chrome', label:'PC Chrome/Edge', width:'1366×768+', target:'menu completo, hover, scroll e rotas principais'},
  {id:'android-portrait', label:'Android retrato', width:'360×740', target:'Novo Game, avatares, lobby e menu inferior'},
  {id:'android-landscape', label:'Android paisagem', width:'740×360', target:'partida, comandos e orientação'},
  {id:'ios-safari', label:'iPhone Safari/PWA', width:'390×844', target:'viewport safe-area, botões e fullscreen'},
  {id:'slow-network', label:'Rede lenta/cache Vercel', width:'no-store + versão', target:'build nova, assets versionados e fallback'}
];

export const BETA_QA_FIRST_SESSION = [
  'Abrir a URL publicada e confirmar que a build no rodapé mostra v8.2.0.',
  'Entrar em Novo Game e confirmar que os 12 avatares aparecem diferentes, sem bolinha genérica.',
  'Escolher avatar, nome, país e modo carreira; voltar e avançar novamente para testar persistência visual.',
  'Escolher clube, confirmar carreira e chegar ao lobby sem tela travada.',
  'Abrir Menu completo e validar que as áreas principais estão agrupadas sem duplicar botões críticos.',
  'Abrir Calendário Vivo, Treino, Scout, Staff e Finanças; voltar ao lobby em cada tela.',
  'Iniciar partida, confirmar pré-jogo, avançar minutos, finalizar e retornar ao pós-jogo/lobby.',
  'Salvar e sair; carregar o mesmo slot; testar renomear e trocar para outro slot.',
  'No celular, repetir Novo Game, lobby, menu e partida em retrato e paisagem.',
  'Depois do deploy, usar Ctrl+F5 apenas uma vez se o Vercel ainda servir cache antigo.'
];

export const BETA_QA_NO_GO_ITEMS = [
  'Avatar genérico repetido na criação de carreira.',
  'Abrir o jogo e cair direto no lobby sem o usuário escolher slot.',
  'Botão principal sem resposta no Novo Game, confirmação, lobby ou partida.',
  'Tela mobile sem rolagem ou com botão escondido atrás da barra inferior.',
  'Erro 404 em assets críticos do index, avatares, logos, fundos ou placeholders.',
  'Partida travar sem conseguir finalizar ou voltar ao lobby.',
  'Salvar/sair perder carreira ou carregar slot errado.'
];
