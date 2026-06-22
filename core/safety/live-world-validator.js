import { LIVE_WORLD_VERSION, LIVE_HEADLINES_V620, LIVE_BACKSTAGE_V620, LIVE_JOURNAL_SECTIONS_V620, LIVE_WORLD_RULES_V620, LIVE_DEVICE_FOCUS_V620 } from '../../js/data/liveWorldData.js';

export function validateLiveWorldSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(LIVE_WORLD_VERSION !== 'v6.2.0') errors.push('Versão do lobby vivo divergente de v6.2.0.');
  if(snapshot.version !== LIVE_WORLD_VERSION) errors.push('Snapshot do lobby vivo não está em v6.2.0.');
  if(LIVE_HEADLINES_V620.length < 6) errors.push('Jornal esportivo precisa de ao menos 6 manchetes.');
  if(LIVE_BACKSTAGE_V620.length < 5) errors.push('Bastidores insuficientes para sensação de mundo vivo.');
  if(LIVE_JOURNAL_SECTIONS_V620.length < 5) errors.push('Editorias do jornal insuficientes.');
  if(LIVE_WORLD_RULES_V620.length < 6) errors.push('Regras anti-quebra do mundo vivo insuficientes.');
  if(LIVE_DEVICE_FOCUS_V620.length < 5) errors.push('Matriz de aparelhos mobile/tablet/desktop insuficiente.');
  const requiredRoutes = ['lobby','liveWorld','messages','pressConference','match','formation','standings','smartMarket','academyScouting','careerIntro','releaseCandidate'];
  const coverage = new Set(snapshot.routeCoverage || []);
  requiredRoutes.forEach(route=>{ if(!coverage.has(route)) errors.push(`Rota obrigatória ausente no lobby vivo: ${route}`); });
  const lowWeight = LIVE_HEADLINES_V620.filter(item=>Number(item.weight || 0) < 88);
  if(lowWeight.length) warnings.push('Algumas manchetes têm peso abaixo de 88.');
  if(Number(snapshot.score || 0) < 80) warnings.push('Score de mundo vivo abaixo de 80%.');
  return { ok: errors.length === 0, status: errors.length ? 'error' : warnings.length ? 'warning' : 'ok', errors, warnings, version: LIVE_WORLD_VERSION, headlines: LIVE_HEADLINES_V620.length, backstage: LIVE_BACKSTAGE_V620.length, sections: LIVE_JOURNAL_SECTIONS_V620.length, devices: LIVE_DEVICE_FOCUS_V620.length };
}
