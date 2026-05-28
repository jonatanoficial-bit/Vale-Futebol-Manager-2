
import { conmebolSeasonSnapshot } from '../../js/systems/worldCompetitionEngine.js';

export function validateTravelFatigueSafety(state={}){
  const snap = conmebolSeasonSnapshot(state);
  const user = snap.user;
  const longTravelCountries = ['ar','uy','cl','py','ec','co','pe','bo','ve'];
  const userMatches = (user.group?.matches || []).filter(m=>m.home===state.clubId || m.away===state.clubId);
  const pressure = userMatches.length >= 6 ? 'Alta' : userMatches.length ? 'Média' : 'Baixa';
  const travelBlocks = user.group?.teams?.filter(t=>t.id!==state.clubId && longTravelCountries.includes(t.country)).length || 0;
  return {version:'v4.2.0', status:'ok', pressure, travelBlocks, matches:userMatches.length, recommendation: travelBlocks>=2 ? 'Rodar elenco em semanas continentais.' : 'Calendário continental controlado.'};
}
