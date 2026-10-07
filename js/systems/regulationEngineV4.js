/** Executable season regulations and calendar windows for the 2026 database. */
export const REGULATION_ENGINE_VERSION='5.0.0';

const DAY=86400000;
const hash=value=>{let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
const startOf=(season,month,day)=>new Date(Date.UTC(Number(season)||2026,month-1,day,16));

const CORE={
  standard:{system:'league',phases:['Temporada regular'],tiebreakers:['points','wins','gd','gf','fairPlay','rating'],cadence:7},
  'brasileirao-a':{system:'league',phases:['38 rodadas · pontos corridos'],tiebreakers:['points','wins','gd','gf','fairPlay','rating'],cadence:308/37,windows:{start:'2026-01-28',regularEnd:'2026-12-02',end:'2026-12-02',breaks:[]}},
  'brasileirao-b':{system:'league',phases:['38 rodadas · pontos corridos','Playoff de acesso · 3º–6º · ida e volta'],tiebreakers:['points','wins','gd','gf','fairPlay','rating'],cadence:238/37,promotionPlayoffLegs:2,windows:{start:'2026-03-21',regularEnd:'2026-11-14',end:'2026-11-28',breaks:[],playoffs:[['2026-11-21','Playoff de acesso · ida'],['2026-11-28','Playoff de acesso · volta']]}},
  'k-league':{system:'split',phases:['33 rodadas regulares','Split final em dois grupos'],tiebreakers:['points','gd','gf','wins','fairPlay','rating'],cadence:7,splitAt:33,splitSize:6},
  mls:{system:'conferences',phases:['Temporada regular · 34 jogos','Wild Card','Série melhor de três','Finais de conferência e MLS Cup'],tiebreakers:['points','wins','gd','gf','headToHead','fairPlay','awayGd','awayGf','rating'],cadence:7,regularMatches:34,conferences:2,playoffTeams:9,windows:{start:'2026-02-21',end:'2026-11-07',breaks:[['2026-05-25','2026-07-16']],playoffs:[['2026-11-18','Wild Card'],['2026-11-20','Melhor de três'],['2026-12-05','Semifinais'],['2026-12-11','Finais de conferência'],['2026-12-18','MLS Cup']]}},
  'liga-mx':{system:'apertura-clausura',phases:['Apertura · 17 rodadas','Play-in · 7º ao 10º','Liguilla','Clausura · 17 rodadas','Play-in e Liguilla'],tiebreakers:['points','gd','gf','wins','fairPlay','rating'],cadence:7,stages:2,playIn:[7,10],playoffTeams:8},
  argentina:{system:'two-group-tournaments',phases:['Apertura · grupos','Mata-mata Apertura','Clausura · grupos','Mata-mata Clausura'],tiebreakers:['points','gd','gf','wins','fairPlay','rating'],cadence:7,groups:2,stages:2,playoffTeams:8},
  colombia:{system:'apertura-finalizacion',phases:['Todos contra todos · Apertura','Quadrangulares','Final Apertura','Todos contra todos · Finalización','Quadrangulares','Final Finalización'],tiebreakers:['points','gd','gf','wins','fairPlay','rating'],cadence:7,stages:2,groups:2,playoffTeams:8,relegationMethod:'promedio'}
};

export function regulationForLeague(league={},season=2026){
  const rules=league.rules||{},id=String(league.id||'');
  let base=CORE.standard;
  if(id==='brasileirao-a')base=CORE['brasileirao-a'];
  else if(id==='brasileirao-b')base=CORE['brasileirao-b'];
  else if(id==='mls')base=CORE.mls;
  else if(id==='liga-mx')base=CORE['liga-mx'];
  else if(id==='argentina-primera')base=CORE.argentina;
  else if(id==='colombia-primera-a')base=CORE.colombia;
  else if(id==='k-league-1')base=CORE['k-league'];
  else if(String(rules.format).includes('conferences'))base=CORE.mls;
  else if(String(rules.format).includes('apertura-clausura-play'))base=CORE['liga-mx'];
  else if(String(rules.format).includes('apertura-clausura-groups'))base=CORE.argentina;
  else if(String(rules.format).includes('quadrangular'))base=CORE.colombia;
  else if(String(rules.format).includes('split'))base=CORE['k-league'];
  const north=['usa','canada','mexico','brazil','argentina','colombia','chile','ecuador','paraguay','peru','uruguay','venezuela','bolivia'];
  const reyear=value=>String(value||'').replaceAll('2026',String(season));
  const calendar=base.windows?{...base.windows,start:reyear(base.windows.start),regularEnd:reyear(base.windows.regularEnd||base.windows.end),end:reyear(base.windows.end),breaks:(base.windows.breaks||[]).map(([start,end])=>[reyear(start),reyear(end)]),playoffs:(base.windows.playoffs||[]).map(([date,label])=>[reyear(date),label])}:{start:`${season}-${north.includes(league.countryId)?'02-10':'08-08'}`,regularEnd:`${Number(season)+(north.includes(league.countryId)?0:1)}-${north.includes(league.countryId)?'12-07':'05-24'}`,end:`${Number(season)+(north.includes(league.countryId)?0:1)}-${north.includes(league.countryId)?'12-07':'05-24'}`,breaks:[]};
  return {version:REGULATION_ENGINE_VERSION,leagueId:id,name:league.name||id,system:base.system,phases:base.phases,tiebreakers:rules.tiebreakers||base.tiebreakers,cadence:base.cadence,regularMatches:base.regularMatches||null,groups:base.groups||null,stages:base.stages||null,splitAt:base.splitAt||null,splitSize:base.splitSize||null,playIn:base.playIn||null,playoffTeams:base.playoffTeams||null,promotionPlayoffLegs:base.promotionPlayoffLegs||null,relegationMethod:base.relegationMethod||'season-table',promotionDirect:Number(rules.promotionDirect||rules.promotion||0),promotionPlayoff:rules.promotionPlayoff||null,relegation:Number(rules.relegation||0),relegationPlayoff:rules.relegationPlayoff||null,continental:rules.continental||{},calendar,source:rules.source||null,verification:rules.verification||'engine-profiled'};
}

function blocked(date,breaks=[]){const time=date.getTime();return breaks.some(([start,end])=>time>=new Date(start+'T00:00:00Z').getTime()&&time<=new Date(end+'T23:59:59Z').getTime());}
export function fixtureDates(profile={},rounds=0){
  const start=new Date(`${profile.calendar?.start||'2026-02-10'}T16:00:00Z`),cadence=Number(profile.cadence)||7,breaks=profile.calendar?.breaks||[];
  const dates=[];let date=new Date(start);
  while(dates.length<rounds){if(!blocked(date,breaks))dates.push(date.toISOString());date=new Date(date.getTime()+cadence*DAY);}
  return dates;
}

export function regulationCalendarSummary(profile={}){const window=profile.calendar||{};return {start:window.start||'',regularEnd:window.regularEnd||window.end||'',end:window.end||'',breaks:window.breaks||[],playoffs:window.playoffs||[],phases:profile.phases||[],source:profile.source||'',method:profile.relegationMethod||'season-table'};}

export function resolveRelegationTable(table=[],profile={}){
  const ranked=table.slice();
  if(profile.relegationMethod!=='promedio')return ranked.slice(-Number(profile.relegation||0)).map(row=>row.id);
  return ranked.slice().map(row=>({...row,average:Number(row.points||0)/Math.max(1,Number(row.played||0))})).sort((a,b)=>a.average-b.average||a.gd-b.gd||a.rating-b.rating).slice(0,Number(profile.relegation||0)).map(row=>row.id);
}

export function regulationAudit(leagues=[],season=2026){return leagues.map(league=>{const profile=regulationForLeague(league,season);return {leagueId:league.id,system:profile.system,phases:profile.phases.length,calendar:profile.calendar,start:profile.calendar.start,end:profile.calendar.end,verified:Boolean(profile.source),special:profile.system!=='league'};});}
