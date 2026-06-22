import { INTRO_CINEMATIC_VERSION, INTRO_STORY_ACTS_V610, INTRO_SESSION_FLOW_V610, INTRO_RETENTION_HOOKS_V610, INTRO_MOBILE_RULES_V610 } from '../../js/data/introCinematicData.js';

export function validateIntroCinematicSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(INTRO_CINEMATIC_VERSION !== 'v6.1.0') errors.push('Versão cinematográfica divergente de v6.1.0.');
  if(snapshot.version !== INTRO_CINEMATIC_VERSION) errors.push('Snapshot da jornada não está em v6.1.0.');
  if(INTRO_STORY_ACTS_V610.length < 6) errors.push('A jornada precisa de ao menos 6 atos narrativos.');
  if(INTRO_SESSION_FLOW_V610.length < 10) errors.push('Fluxo de primeira sessão insuficiente.');
  if(INTRO_RETENTION_HOOKS_V610.length < 6) errors.push('Ganchos de retenção insuficientes.');
  if(INTRO_MOBILE_RULES_V610.length < 6) errors.push('Regras mobile insuficientes.');
  const requiredRoutes = ['cover','careerIntro','newGame','teamSelect','confirmCareer','lobby','careerTutorial','pressConference','match','saveCenter'];
  const coverage = new Set(snapshot.routeCoverage || []);
  requiredRoutes.forEach(route=>{ if(!coverage.has(route)) errors.push(`Rota obrigatória ausente na jornada: ${route}`); });
  const lowHooks = INTRO_RETENTION_HOOKS_V610.filter(item=>Number(item.impact || 0) < 90);
  if(lowHooks.length) warnings.push('Alguns ganchos de retenção estão abaixo de 90%.');
  const score = Number(snapshot.score || 0);
  if(score < 95) warnings.push('Pontuação de jornada abaixo de 95%.');
  return { ok: errors.length === 0, status: errors.length ? 'error' : warnings.length ? 'warning' : 'ok', errors, warnings, version: INTRO_CINEMATIC_VERSION, acts: INTRO_STORY_ACTS_V610.length, flow: INTRO_SESSION_FLOW_V610.length, mobileRules: INTRO_MOBILE_RULES_V610.length };
}
