import { BOARD_EMOTIONAL_VERSION, BOARD_PILLARS_V660, BOARD_SCENARIOS_V660, BOARD_PROMISES_V660, BOARD_MEETING_TYPES_V660, EMOTIONAL_FINANCE_RULES_V660 } from '../../js/data/boardEmotionalData.js';

export function validateBoardEmotionalSystem(snapshot={}){
  const issues = [];
  if(snapshot.version !== BOARD_EMOTIONAL_VERSION) issues.push('Versão da diretoria viva divergente.');
  const routes = { route:'emotionalBoard', financeRoute:'financeCenter', clubRoute:'club', objectivesRoute:'objectivesHub', pressRoute:'pressConference', liveWorldRoute:'liveWorld', squadAiRoute:'squadAI', matchdayRoute:'matchdayPremium' };
  Object.entries(routes).forEach(([key, expected])=>{ if(snapshot[key] !== expected) issues.push(`Rota obrigatória ausente: ${expected}.`); });
  if(snapshot.pillarCount < BOARD_PILLARS_V660.length) issues.push('Pilares da economia emocional insuficientes.');
  if(snapshot.scenarioCount < BOARD_SCENARIOS_V660.length) issues.push('Cenários da diretoria insuficientes.');
  if(snapshot.promiseCount < BOARD_PROMISES_V660.length) issues.push('Promessas gerenciáveis insuficientes.');
  if(snapshot.meetingCount < BOARD_MEETING_TYPES_V660.length) issues.push('Tipos de reunião insuficientes.');
  if(snapshot.ruleCount < EMOTIONAL_FINANCE_RULES_V660.length) issues.push('Regras anti-quebra insuficientes.');
  if(snapshot.mobileFirst !== true) issues.push('Mobile-first precisa estar ativo.');
  if(snapshot.offlineReady !== true) issues.push('Sistema precisa funcionar offline/local.');
  if(snapshot.noBlockingPopup !== true) issues.push('Diretoria não pode bloquear rolagem com popup obrigatório.');
  if(snapshot.preservesOldRoutes !== true) issues.push('Rotas antigas precisam ser preservadas.');
  const c = snapshot.context || {};
  ['boardTrust','fanMood','finance','emotionalEconomyScore','autonomy','pressure'].forEach(key=>{ if(typeof c[key] !== 'number') issues.push(`Indicador numérico ausente: ${key}.`); });
  return { ok: issues.length === 0, status: issues.length ? 'blocked' : 'board-emotional-ready', version: BOARD_EMOTIONAL_VERSION, issues };
}
