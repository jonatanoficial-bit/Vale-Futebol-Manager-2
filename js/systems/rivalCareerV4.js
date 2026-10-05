/** Persistent rival-club finances, transfer windows and squad planning. */
export const RIVAL_CAREER_VERSION='4.0.0';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const hash=value=>{let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
const styles=['posse e construção','transição vertical','pressão alta','bloco compacto','jogo pelas pontas'];

function profile(club={},season=2026){const key=`${season}:${club.id}`,rating=Number(club.rating)||65,budget=Math.round(Math.max(4_000_000,(rating-50)**2*18_000));return {id:club.id,name:club.name,leagueId:club.leagueId,rating,budget,wageRoom:Math.round(budget*.16),squadDepth:20+(hash(key)%8),squadAge:23+(hash(key+':age')%9),style:styles[hash(key)%styles.length],managerTenure:1+(hash(key+':coach')%5),needs:['GOL','ZAG','MC','ATA'].filter((_,index)=>(hash(key+index)%3)===0),in:[],out:[],seasonForm:0};}

export function ensureRivalCareer(career={},catalog={}){
  const current=career.rivalWorld||{},clubs=Array.isArray(catalog.clubs)?catalog.clubs:[];
  const clubsState={...(current.clubs||{})};clubs.forEach(club=>{if(!clubsState[club.id])clubsState[club.id]=profile(club,career.season);});
  career.rivalWorld={version:RIVAL_CAREER_VERSION,season:Number(career.season)||2026,clubs:clubsState,moves:Array.isArray(current.moves)?current.moves.slice(-180):[],news:Array.isArray(current.news)?current.news.slice(-80):[],windows:Array.isArray(current.windows)?current.windows:[],lastWeek:Number(current.lastWeek)||0};return career.rivalWorld;
}

export function simulateRivalMarketWeek(career={},catalog={},week=0){
  const world=ensureRivalCareer(career,catalog);if(week<=world.lastWeek||week%6!==0)return {world,moves:[]};world.lastWeek=week;
  const clubs=Object.values(world.clubs).sort((a,b)=>b.rating-a.rating),moves=[];
  for(let slot=0;slot<Math.min(4,clubs.length);slot++){
    const buyer=clubs[(hash(`${career.season}:${week}:buyer:${slot}`)%clubs.length)],seller=clubs[(hash(`${career.season}:${week}:seller:${slot}`)%clubs.length)];
    if(!buyer||!seller||buyer.id===seller.id||buyer.budget<2_000_000)continue;
    const fee=Math.round(Math.min(buyer.budget*.16,Math.max(800_000,(buyer.rating+seller.rating)*18_000)));
    const id=`rival-${career.season}-${week}-${buyer.id}-${seller.id}`;if(world.moves.some(move=>move.id===id))continue;
    buyer.budget-=fee;seller.budget+=fee;buyer.squadDepth=Math.min(32,buyer.squadDepth+1);seller.squadDepth=Math.max(18,seller.squadDepth-1);buyer.rating=clamp(buyer.rating+.18,45,95);seller.rating=clamp(seller.rating-.08,45,95);
    const move={id,week,season:career.season,player:`Talento observado · ${['GOL','ZAG','MC','ATA'][hash(id)%4]}`,from:seller.name,to:buyer.name,fee,status:'concluído',reason:buyer.needs[0]||'profundidade de elenco'};buyer.in.unshift(move);seller.out.unshift(move);world.moves.unshift(move);moves.push(move);
  }
  if(moves.length)world.news.unshift({week,season:career.season,text:moves[0].to+' investe no mercado e pressiona concorrentes diretos.'});world.moves=world.moves.slice(0,180);world.news=world.news.slice(0,80);return {world,moves};
}

export function settleRivalSeason(career={},worldState={},catalog={}){const world=ensureRivalCareer(career,catalog),summaries=[];Object.values(worldState.leagues||{}).forEach(league=>{const table=(league.table||[]).slice().sort((a,b)=>b.points-a.points||b.gd-a.gd||b.rating-a.rating);table.forEach((row,index)=>{const club=world.clubs[row.id];if(!club)return;const swing=index===0?2:index<Math.ceil(table.length*.25)?1:index>=table.length-Number(league.rules?.relegation||0)?-2:-.25;club.rating=clamp(club.rating+swing,45,95);club.budget=Math.max(2_000_000,Math.round(club.budget+(index===0?8_000_000:index<table.length/2?1_500_000:-900_000)));club.seasonForm=Math.round((row.points/Math.max(1,row.played*3))*100);summaries.push({club:club.name,league:league.name,rank:index+1,form:club.seasonForm});});});world.season=Number(career.season||world.season)+1;world.lastWeek=0;world.news.unshift({season:career.season,text:'Mercado rival recalculado com premiações, desempenho e necessidades de elenco.'});return {world,summaries};}

export function rivalMarketBrief(career={}){const world=career.rivalWorld||{},moves=(world.moves||[]).slice(0,5),clubs=Object.values(world.clubs||{});return {version:RIVAL_CAREER_VERSION,moves,clubs:clubs.length,biggestSpenders:clubs.slice().sort((a,b)=>a.budget-b.budget).slice(0,3),news:(world.news||[]).slice(0,3)};}
