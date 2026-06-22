import { OBJECTIVES_RETENTION_VERSION, DAILY_OBJECTIVES_V650, SEASON_OBJECTIVES_V650, ACHIEVEMENTS_V650, RETENTION_LOOPS_V650, REWARD_TIERS_V650, RETENTION_MOBILE_RULES_V650 } from '../../js/data/objectivesRetentionData.js';

export function validateObjectivesRetentionSystem(snapshot={}){
  const issues = [];
  if(snapshot.version !== OBJECTIVES_RETENTION_VERSION) issues.push('Versão de objetivos/retenção divergente.');
  const routes = { route:'objectivesHub', tutorialRoute:'careerTutorial', progressionRoute:'managerProgression', liveWorldRoute:'liveWorld', squadAiRoute:'squadAI', matchdayRoute:'matchdayPremium' };
  Object.entries(routes).forEach(([key, expected])=>{ if(snapshot[key] !== expected) issues.push(`Rota obrigatória ausente: ${expected}.`); });
  if(snapshot.objectiveCount < DAILY_OBJECTIVES_V650.length + SEASON_OBJECTIVES_V650.length) issues.push('Objetivos diários/sazonais incompletos.');
  if(snapshot.achievementCount < ACHIEVEMENTS_V650.length) issues.push('Conquistas insuficientes.');
  if(snapshot.loopCount < RETENTION_LOOPS_V650.length) issues.push('Loops de retenção insuficientes.');
  if(snapshot.tierCount < REWARD_TIERS_V650.length) issues.push('Camadas de recompensa insuficientes.');
  if(snapshot.mobileRuleCount < RETENTION_MOBILE_RULES_V650.length) issues.push('Regras mobile insuficientes.');
  if(snapshot.mobileFirst !== true) issues.push('Mobile-first precisa estar ativo.');
  if(snapshot.offlineReady !== true) issues.push('A fase precisa funcionar offline/local.');
  if(snapshot.noBlockingPopup !== true) issues.push('Conquistas não podem bloquear rolagem com popup obrigatório.');
  if(snapshot.noHeavyTimer !== true) issues.push('A fase não pode depender de temporizador pesado.');
  if(snapshot.preservesOldRoutes !== true) issues.push('Rotas antigas precisam ser preservadas.');
  return { ok: issues.length === 0, status: issues.length ? 'blocked' : 'objectives-retention-ready', version: OBJECTIVES_RETENTION_VERSION, issues };
}
