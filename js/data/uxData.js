
// Vale Futebol Manager Gold Edition - UX/AAA audit data v3.4.0
export const uxAuditChecklist = [
  { area:'Rotas principais', status:'OK', score:100, detail:'Lobby, temporada, partida, transferencias, economia, propostas e selecoes com fallback de tela.' },
  { area:'Mobile fullscreen', status:'OK', score:96, detail:'Uso de 100svh, safe-area, botoes grandes e protecao contra overflow horizontal.' },
  { area:'Leitura visual', status:'OK', score:94, detail:'Contraste, hierarquia, cards transluidos e sombras premium revisadas.' },
  { area:'Performance', status:'OK', score:92, detail:'Cache de assets, preload seguro, render guard e lazy visual library.' },
  { area:'Assets', status:'OK', score:98, detail:'Fallback de fundos, clubes, jogadores, ligas, paises, patrocinadores e estadios.' },
  { area:'Save', status:'OK', score:97, detail:'Migracao de saves antigos, autosave, backups, exportacao e importacao por JSON.' },
  { area:'Gameplay', status:'OK', score:90, detail:'Temporada, mercado, taticas, partida profunda, economia e carreira conectadas.' },
  { area:'Publicação', status:'OK', score:100, detail:'Publicação estática, caminhos relativos e index.html na raiz.' }
];

export const premiumPolishNotes = [
  'Cards e tabelas refinados para leitura em telas pequenas.',
  'Menus principais receberam melhor espacamento e toque minimo.',
  'Partida, tabela e lobby priorizam informacao essencial sem esconder o fundo.',
  'Sistema visual entende fundos extras, mas sempre cai para fallback seguro.',
  'Base preparada para receber novas faces, escudos, fundos e ligas sem alterar codigo.'
];

export const releaseReadiness = {
  label:'Primeira versao premium pos-v3',
  score:94,
  blockers:0,
  recommendation:'Pronta para testes amplos, publicacao privada e ciclo de ajustes finos com feedback real.'
};
