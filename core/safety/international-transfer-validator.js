import { buildWorldLeagueSnapshot } from '../../js/systems/globalWorldEngine.js';
export function validateInternationalTransferMarket(state={}){
  const snapshot = buildWorldLeagueSnapshot(state);
  const errors=[]; const warnings=[];
  if(!snapshot.marketPulse || snapshot.marketPulse.totalMarketValue <= 0) errors.push('Pulso de mercado global inválido.');
  if(snapshot.leagues.some(l=>!Number.isFinite(l.marketWeight) || l.marketWeight <= 0)) errors.push('Peso de mercado inválido em liga internacional.');
  if(snapshot.globalRanking.length < 20) warnings.push('Ranking mundial reduzido em modo seguro.');
  if(!errors.length) warnings.push(`Mercado global validado: ${snapshot.marketPulse.activeLeagues} ligas e € ${snapshot.marketPulse.totalMarketValue}M simulados.`);
  return { version:'v5.2.0', status:errors.length?'error':'ok', errors, warnings, checks:{leagues:snapshot.marketPulse.activeLeagues, totalMarketValue:snapshot.marketPulse.totalMarketValue, demand:snapshot.marketPulse.globalDemand} };
}
