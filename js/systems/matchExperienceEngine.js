// v5.7.0 - Match Experience Engine
// Mantem a partida intuitiva em PC/mobile sem expor paineis tecnicos ao jogador.
export const MATCH_EXPERIENCE_VERSION = 'v5.7.0';

export const MATCH_QUICK_ACTIONS_V570 = [
  { id:'playPause', label:'Pausar/retomar', critical:true },
  { id:'speed', label:'Velocidade', critical:true },
  { id:'decision', label:'Tatica rapida', critical:true },
  { id:'substitution', label:'Substituicao', critical:true },
  { id:'finish', label:'Relatorio final', critical:true }
];

export function isImportantMatchEvent(event={}){
  return ['goal','penalty','var','card','injury','save','danger','fulltime'].includes(event.type);
}

export function buildMatchExperienceSnapshot(state={}){
  const match = state.match || {};
  const minute = Number(match.minute || 1);
  const isOver = minute >= 90 || Boolean(match.finalized);
  return {
    version:MATCH_EXPERIENCE_VERSION,
    route:state.route || 'lobby',
    autoStartReady:!isOver && (state.route === 'match'),
    autoPlay:Boolean(match.autoPlay),
    speed:Number(match.speed || 1),
    minute,
    isOver,
    commandDock:true,
    landscapeOptimized:true,
    postMatchCTA:isOver,
    quickActions:MATCH_QUICK_ACTIONS_V570.map(x=>x.id)
  };
}

export function recommendedMatchCopy(snapshot={}){
  if(snapshot.isOver) return 'Partida encerrada. Analise o relatorio e salve para voltar ao lobby.';
  if(snapshot.autoPlay) return `Partida em andamento automaticamente em ${snapshot.speed || 1}x.`;
  return 'Partida pausada. Use Retomar para continuar sem perder o controle tatico.';
}
