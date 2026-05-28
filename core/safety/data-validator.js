function isObj(v){ return v && typeof v === 'object'; }
function list(v){ return Array.isArray(v) ? v : []; }

export function validateDataIntegrity(state = {}){
  const errors = [];
  const warnings = [];
  if(!isObj(state)) errors.push('Estado principal ausente.');
  if(!isObj(state.manager)) errors.push('Manager ausente.');
  if(!isObj(state.match)) errors.push('Partida ausente.');
  if(!isObj(state.career)) errors.push('Carreira ausente.');
  if(!state.clubId) warnings.push('Clube ativo ausente; fallback será aplicado.');
  if(!list(state.career?.completedMatches).every(m => m && m.id)) warnings.push('Há resultado concluído sem id; será ignorado em cálculos futuros.');
  const match = state.match || {};
  if(match.minute !== undefined && (Number(match.minute) < 1 || Number(match.minute) > 90)) warnings.push('Minuto da partida fora do intervalo; normalização aplicada.');
  if(match.finalized && !match.postMatchReport && !match.nextMatchQueued) warnings.push('Partida encerrada sem relatório persistido; relatório será reconstruído.');
  return {name:'data-integrity', status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings};
}
