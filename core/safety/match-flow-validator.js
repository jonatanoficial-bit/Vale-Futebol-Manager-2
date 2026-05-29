import { MATCH_QUICK_ACTIONS_V570 } from '../../js/systems/matchExperienceEngine.js';
export function validateMatchFlowV570(snapshot={}){
  const errors = [];
  if(snapshot.route === 'match' && snapshot.isOver && !snapshot.postMatchCTA) errors.push('Partida encerrada sem CTA de pos-jogo.');
  if(snapshot.route === 'match' && !Array.isArray(snapshot.quickActions)) errors.push('Acoes rapidas ausentes.');
  const required = MATCH_QUICK_ACTIONS_V570.map(x=>x.id);
  const present = new Set(snapshot.quickActions || []);
  required.forEach(id=>{ if(!present.has(id)) errors.push(`Acao rapida ausente: ${id}`); });
  return { ok:errors.length===0, version:'v5.7.0', errors, requiredActions:required.length };
}
