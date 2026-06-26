export const BETA_PROFESSIONAL_VERSION = 'v8.0.1';
export const BETA_PROFESSIONAL_SCHEMA = 801;
export const BETA_PROFESSIONAL_GATES = [
  {id:'career-flow', label:'Fluxo de carreira', critical:true, route:'mainMenu'},
  {id:'save-slots', label:'3 slots reais', critical:true, route:'saveSlotsV2'},
  {id:'calendar-fatigue', label:'Calendário e fadiga', critical:true, route:'calendar'},
  {id:'scouting', label:'Scout profissional', critical:true, route:'academyScouting'},
  {id:'weekly-training', label:'Treino semanal', critical:true, route:'training'},
  {id:'staff', label:'Comissão técnica', critical:true, route:'staff'},
  {id:'finance', label:'Finanças profundas', critical:true, route:'financeCenter'},
  {id:'match', label:'Partida e pós-jogo', critical:true, route:'match'},
  {id:'mobile', label:'Mobile-first', critical:true, route:'mobileAudit'},
  {id:'release', label:'Divulgação Beta', critical:false, route:'betaProfessional'}
];
export const BETA_PROFESSIONAL_MANUAL_FLOW = [
  'Abrir capa e conferir build v8.0.1 visível.',
  'Entrar na central de saves sem carregar lobby automaticamente.',
  'Criar carreira nova no slot 2 e confirmar que os 12 avatares reais aparecem e o avatar escolhido segue para a confirmação.',
  'Salvar e sair da carreira; voltar para a central sem confusão.',
  'Carregar o slot salvo e abrir lobby.',
  'Abrir calendário, aplicar treino leve/pesado e conferir fadiga.',
  'Abrir scout, gerar relatório e adicionar atleta à lista de desejos.',
  'Abrir treino semanal, trocar preset e conferir impacto.',
  'Abrir staff, contratar membro e mudar foco da comissão.',
  'Abrir finanças, alterar política de ingresso e simular bilheteria.',
  'Iniciar partida, avançar, finalizar e conferir pós-jogo/premiação.',
  'Testar menu completo no celular em retrato e paisagem.'
];
export const BETA_PROFESSIONAL_ROUTE_GATES = [
  'cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','managerMenu','match','pressConference',
  'saveSlotsV2','calendar','academyScouting','training','staff','financeCenter','finances','sponsorship','squad','formation','transfers','messages','betaProfessional'
];
