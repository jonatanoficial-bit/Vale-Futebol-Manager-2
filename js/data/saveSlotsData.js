export const SAVE_SLOTS_V2_VERSION = 'v7.4.0';

export const CAREER_SLOT_DEFINITIONS = [
  { id:'principal', label:'Carreira principal', badge:'Principal', order:1, description:'Slot recomendado para a carreira principal do jogador.' },
  { id:'career-2', label:'Carreira 2', badge:'Slot 2', order:2, description:'Espaço para testar outro clube sem apagar a carreira principal.' },
  { id:'career-3', label:'Carreira 3', badge:'Slot 3', order:3, description:'Espaço para uma carreira paralela, seleção, clube menor ou desafio.' },
  { id:'career-4', label:'Carreira 4', badge:'Slot 4', order:4, description:'Reserva segura para testes de builds futuras.' },
  { id:'career-5', label:'Carreira 5', badge:'Slot 5', order:5, description:'Último slot jogável antes de usar exportação JSON.' }
];

export const SAVE_FLOW_STEPS_V740 = [
  { id:'cover', title:'Capa limpa', text:'A primeira tela só abre a central inicial; ela não mistura módulos premium com carreira.' },
  { id:'slots', title:'Central de slots', text:'O jogador escolhe continuar, criar, renomear ou apagar uma carreira.' },
  { id:'create', title:'Criação guiada', text:'Nova carreira sempre nasce dentro de um slot escolhido.' },
  { id:'lobby', title:'Lobby da carreira', text:'Depois de entrar no save, o lobby mostra apenas ações essenciais.' },
  { id:'exit', title:'Sair da carreira', text:'O botão de saída salva o slot ativo e volta para a central inicial.' }
];

export const SAVE_SLOT_POLICIES_V740 = [
  'Nunca sobrescrever um slot ocupado sem confirmação do usuário.',
  'Sempre salvar o slot ativo antes de trocar de carreira.',
  'Manter exportação/importação JSON como camada de segurança fora do navegador.',
  'Separar slots jogáveis de backups técnicos.',
  'Resetar dados locais somente em Configurações ou ação explícita de apagar slot.'
];
