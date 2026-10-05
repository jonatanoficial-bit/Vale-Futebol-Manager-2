/** National-team selection layer: scouts, form-led call-ups and tournament memory. */
export const NATIONAL_CAREER_VERSION = '3.0.0';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const hash=value=>{let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
const regionFor=player=>String(player?.marketRegion||player?.clubRegion||player?.countryId||'domestic').toLowerCase();

export function playerNationalForm(player={}, record={}) {
  const performance=Number(record.form||0), minutes=Number(record.minutes||0), goals=Number(record.goals||0), assists=Number(record.assists||0);
  const fitness=Number(player.fitness??90), morale=Number(player.morale??70), overall=Number(player.overall||60);
  return Math.round(clamp(overall*.62+fitness*.11+morale*.08+performance*.9+Math.min(9,minutes/140)+goals*1.6+assists,35,99));
}

export function ensureNationalCareer(national={}, career={}) {
  const roster=Array.isArray(national.roster)?national.roster:[];
  const existing=national.selectionIntelligence||{};
  const observations={...(existing.observations||{})};
  roster.forEach(player=>{const id=String(player.id||'');if(!id)return;const old=observations[id]||{};observations[id]={id,region:old.region||regionFor(player),knowledge:clamp(old.knowledge||52,0,100),form:Number(old.form||0),minutes:Number(old.minutes||0),goals:Number(old.goals||0),assists:Number(old.assists||0),lastSeen:old.lastSeen||career.date||new Date().toISOString()};});
  national.selectionIntelligence={version:NATIONAL_CAREER_VERSION,observations,regions:{domestic:clamp(existing.regions?.domestic||64,0,100),europe:clamp(existing.regions?.europe||42,0,100),southAmerica:clamp(existing.regions?.southAmerica||42,0,100),northAmerica:clamp(existing.regions?.northAmerica||36,0,100),asia:clamp(existing.regions?.asia||32,0,100),africa:clamp(existing.regions?.africa||32,0,100),oceania:clamp(existing.regions?.oceania||28,0,100)},tournamentHistory:Array.isArray(existing.tournamentHistory)?existing.tournamentHistory.slice(-40):[],objectives:Array.isArray(existing.objectives)&&existing.objectives.length?existing.objectives:buildObjectives(national)};
  return national.selectionIntelligence;
}

function buildObjectives(national) { const rating=Number(national?.team?.rating||70);return [{id:'qualifiers',label:'Disputar as eliminatórias com campanha competitiva',target:rating>=82?'Classificação direta':'Zona de classificação',status:'active'},{id:'continental',label:'Avançar da fase de grupos continental',target:'Mata-mata',status:'active'},{id:'world',label:'Construir ciclo para a Copa do Mundo',target:rating>=84?'Quartas de final':'Fase de grupos',status:'active'}]; }

export function nationalSelectionRanking(national={}, limit=40) {
  const intelligence=ensureNationalCareer(national,{});
  return (national.roster||[]).map(player=>{const observation=intelligence.observations[String(player.id)]||{};return {...player,nationalForm:playerNationalForm(player,observation),knowledge:observation.knowledge||0,observation};}).sort((a,b)=>b.nationalForm-a.nationalForm||b.overall-a.overall||a.name.localeCompare(b.name,'pt-BR')).slice(0,limit);
}

export function observeNationalRegion(national={}, region='domestic', date=new Date().toISOString()) {
  const intelligence=ensureNationalCareer(national,{}), key=String(region||'domestic');
  intelligence.regions[key]=clamp((intelligence.regions[key]||20)+16,0,100);
  let updated=0;
  (national.roster||[]).forEach(player=>{const record=intelligence.observations[player.id];if(!record)return;const matches=key==='domestic'||record.region===key||(key==='southAmerica'&&record.region.includes('south'))||(key==='northAmerica'&&record.region.includes('north'));if(matches){record.knowledge=clamp(record.knowledge+12,0,100);record.lastSeen=date;updated++;}});
  return {region:key,updated,knowledge:intelligence.regions[key]};
}

export function callUpByPerformance(national={}, size=26) {
  const ranking=nationalSelectionRanking(national,Math.max(23,size));
  national.selectionPoolIds=ranking.map(player=>player.id);
  national.calledUpIds=ranking.slice(0,clamp(size,23,26)).map(player=>player.id);
  return {calledUpIds:national.calledUpIds,ranking};
}

export function recordNationalPerformance(national={}, payload={}) {
  const intelligence=ensureNationalCareer(national,{}), now=payload.date||new Date().toISOString(), playerPerformance=payload.playerPerformance||{};
  Object.entries(playerPerformance).forEach(([id,performance])=>{const record=intelligence.observations[id];if(!record)return;record.minutes+=Number(performance.minutes||90);record.goals+=Number(performance.goals||0);record.assists+=Number(performance.assists||0);const rating=Number(performance.rating||6.5);record.form=clamp(record.form*.55+(rating-6)*7+(Number(performance.goals||0)*3),-12,20);record.knowledge=clamp(record.knowledge+4,0,100);record.lastSeen=now;});
  (national.calledUpIds||[]).forEach(id=>{const record=intelligence.observations[id];if(record&&!playerPerformance[id]){record.minutes+=Math.round(30+(hash(`${id}:${now}`)%60));record.form=clamp(record.form*.7+.5,-12,20);record.lastSeen=now;}});
  return intelligence;
}

export function recordNationalTournament(national={}, entry={}) {
  const intelligence=ensureNationalCareer(national,{});const duplicate=intelligence.tournamentHistory.find(item=>item.id===entry.id&&item.season===entry.season);if(duplicate)return duplicate;
  const record={id:entry.id||`national-${Date.now()}`,season:Number(entry.season)||0,name:entry.name||'Torneio internacional',stage:entry.stage||'Participação',result:entry.result||'em andamento',opponent:entry.opponent||'',date:entry.date||new Date().toISOString()};intelligence.tournamentHistory.unshift(record);intelligence.tournamentHistory=intelligence.tournamentHistory.slice(0,40);return record;
}

export function nationalSelectionBrief(national={}) { const intelligence=ensureNationalCareer(national,{}), ranking=nationalSelectionRanking(national,5);return {version:NATIONAL_CAREER_VERSION,ranking,regions:intelligence.regions,history:intelligence.tournamentHistory,objectives:intelligence.objectives}; }
