import { MATCHDAY_PREMIUM_VERSION, MATCHDAY_PREMIUM_FLOW_V630, MATCHDAY_PREMIUM_PACKS_V630, MATCHDAY_PREMIUM_DEVICE_RULES_V630, MATCHDAY_PREMIUM_DRAMA_EVENTS_V630 } from '../../js/data/matchdayPremiumData.js';

export function validateMatchdayPremiumSystem(snapshot={}){
  const issues = [];
  if(snapshot.version !== MATCHDAY_PREMIUM_VERSION) issues.push('Versão do Matchday Premium divergente.');
  ['matchdayPremium','match','pressConference','liveWorld'].forEach(route=>{
    const key = route === 'matchdayPremium' ? 'route' : route === 'match' ? 'matchRoute' : route === 'pressConference' ? 'pressRoute' : 'liveWorldRoute';
    if(snapshot[key] !== route) issues.push(`Rota obrigatória ausente: ${route}.`);
  });
  if(snapshot.flowCount < MATCHDAY_PREMIUM_FLOW_V630.length) issues.push('Fluxo premium incompleto.');
  if(snapshot.packCount < MATCHDAY_PREMIUM_PACKS_V630.length) issues.push('Pacotes de matchday incompletos.');
  if(snapshot.deviceRuleCount < MATCHDAY_PREMIUM_DEVICE_RULES_V630.length) issues.push('Regras mobile insuficientes.');
  if(snapshot.dramaEventCount < MATCHDAY_PREMIUM_DRAMA_EVENTS_V630.length) issues.push('Eventos de drama insuficientes.');
  if(snapshot.mobileFirst !== true) issues.push('Mobile-first precisa estar ativo.');
  if(snapshot.noHeavyVideo !== true) issues.push('A fase não pode depender de vídeo pesado.');
  if(snapshot.offlineReady !== true) issues.push('A fase precisa funcionar offline/local.');
  if(snapshot.preMatchGatePreserved !== true) issues.push('Gate da coletiva pré-jogo precisa ser preservado.');
  if(snapshot.postMatchJournalLinked !== true) issues.push('Pós-jogo precisa se conectar ao jornal.');
  return { ok: issues.length === 0, status: issues.length ? 'blocked' : 'matchday-premium-ready', version: MATCHDAY_PREMIUM_VERSION, issues };
}
