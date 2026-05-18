export const stabilityChecklist = [
  {area:'Save local', status:'Protegido', detail:'Normalização automática, migração de versões antigas e fallback para estado padrão.'},
  {area:'Backups', status:'Ativo', detail:'Três slots de backup manual usando localStorage, com restauração segura.'},
  {area:'Exportação', status:'Ativo', detail:'Save pode ser copiado em JSON para guardar fora do navegador.'},
  {area:'Importação', status:'Ativo', detail:'JSON colado é validado e normalizado antes de entrar no jogo.'},
  {area:'Rotas', status:'Seguro', detail:'Se uma tela quebrar, o modo seguro leva o usuário de volta ao lobby.'},
  {area:'Assets', status:'Fallback', detail:'Qualquer imagem ausente usa placeholder sem travar a interface.'},
  {area:'Mobile', status:'Reforçado', detail:'Altura dinâmica e rolagem protegida para evitar tela presa em navegadores móveis.'},
  {area:'Auditoria', status:'0 bloqueios', detail:'Sintaxe, links internos, manifest e arquivos essenciais verificados.'}
];
export const savePolicies = [
  'Autosave após ações críticas de carreira, mercado, partida, treino e configurações.',
  'Migração automática de saves v0.1 até v2.2 sem exigir ação do jogador.',
  'Backup manual antes de testes grandes ou troca de assets no GitHub.',
  'Exportação JSON para guardar carreira fora do navegador.',
  'Importação validada com correção de campos ausentes e bloqueio de JSON inválido.'
];
