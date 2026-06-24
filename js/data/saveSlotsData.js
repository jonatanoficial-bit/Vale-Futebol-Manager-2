export const SAVE_SLOTS_V2_VERSION = 'v7.4.0';
export const MAX_PLAYABLE_SLOTS_V740 = 3;

export const CAREER_SLOT_DEFINITIONS = [
  { id:'principal', label:'Carreira principal', badge:'Principal', order:1, description:'Slot oficial 1: carreira principal do jogador.' },
  { id:'career-2', label:'Carreira 2', badge:'Slot 2', order:2, description:'Slot oficial 2: outra carreira sem apagar a principal.' },
  { id:'career-3', label:'Carreira 3', badge:'Slot 3', order:3, description:'Slot oficial 3: desafio paralelo, seleção ou clube menor.' }
];

export const SAVE_FLOW_STEPS_V740 = [
  { id:'cover', title:'Capa limpa', text:'A primeira tela não entra direto no lobby; ela leva para continuar, criar ou trocar carreira.' },
  { id:'slots', title:'Central de 3 slots', text:'O jogador escolhe exatamente qual save abrir, criar, renomear ou apagar.' },
  { id:'create', title:'Criação guiada', text:'Nova carreira sempre nasce dentro do slot escolhido e não usa dados antigos.' },
  { id:'lobby', title:'Lobby da carreira', text:'O lobby só abre depois de carregar ou confirmar uma carreira real.' },
  { id:'exit', title:'Salvar e sair', text:'O botão de saída salva o slot ativo e volta para a central sem apagar nada.' }
];

export const SAVE_SLOT_POLICIES_V740 = [
  'Apenas 3 slots jogáveis oficiais: Principal, Carreira 2 e Carreira 3.',
  'Nunca entrar direto no lobby ao abrir o jogo; a entrada sempre volta para capa/central.',
  'Nunca sobrescrever um slot ocupado sem confirmação do usuário.',
  'Sempre salvar o slot ativo antes de trocar de carreira.',
  'Separar slots jogáveis de backups técnicos e exportação JSON.',
  'Resetar dados locais somente em Configurações ou ação explícita de apagar slot.'
];
