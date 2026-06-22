import { SQUAD_AI_VERSION, SQUAD_AI_PILLARS_V640, SQUAD_AI_PLAYER_PROFILES_V640, SQUAD_AI_EVENTS_V640, SQUAD_AI_DECISIONS_V640, SQUAD_AI_MOBILE_RULES_V640 } from '../../js/data/squadAiData.js';

export function validateSquadAiSystem(snapshot={}){
  const issues = [];
  if(snapshot.version !== SQUAD_AI_VERSION) issues.push('Versão da IA de elenco divergente.');
  const routes = { route:'squadAI', squadRoute:'squad', trainingRoute:'training', pressRoute:'pressConference', matchdayRoute:'matchdayPremium', liveWorldRoute:'liveWorld' };
  Object.entries(routes).forEach(([key, expected])=>{ if(snapshot[key] !== expected) issues.push(`Rota obrigatória ausente: ${expected}.`); });
  if(snapshot.pillarCount < SQUAD_AI_PILLARS_V640.length) issues.push('Pilares da IA de elenco incompletos.');
  if(snapshot.profileCount < SQUAD_AI_PLAYER_PROFILES_V640.length) issues.push('Perfis de jogador insuficientes.');
  if(snapshot.eventCount < SQUAD_AI_EVENTS_V640.length) issues.push('Eventos de vestiário insuficientes.');
  if(snapshot.decisionCount < SQUAD_AI_DECISIONS_V640.length) issues.push('Decisões do técnico insuficientes.');
  if(snapshot.mobileRuleCount < SQUAD_AI_MOBILE_RULES_V640.length) issues.push('Regras mobile insuficientes.');
  if(snapshot.mobileFirst !== true) issues.push('Mobile-first precisa estar ativo.');
  if(snapshot.offlineReady !== true) issues.push('A fase precisa funcionar offline/local.');
  if(snapshot.noHeavySimulation !== true) issues.push('A fase não pode usar simulação pesada ou loop infinito.');
  if(snapshot.preservesOldRoutes !== true) issues.push('Rotas antigas precisam ser preservadas.');
  return { ok: issues.length === 0, status: issues.length ? 'blocked' : 'squad-ai-dressing-room-ready', version: SQUAD_AI_VERSION, issues };
}
