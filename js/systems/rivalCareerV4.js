/** Persistent rival-club planning, negotiation pressure and transfer windows. */
export const RIVAL_CAREER_VERSION='5.0.0';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const hash=value=>{let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
const styles=['posse e construção','transição vertical','pressão alta','bloco compacto','jogo pelas pontas'];
const ambitions=['sobrevivência','consolidação','vaga continental','disputa de título'];
const positions=['GOL','ZAG','LD','LE','VOL','MC','MEI','PD','PE','ATA'];
const valueOf=player=>Math.max(250000,Number(player?.value||1)*1000000);

function profile(club={},season=2026){
  const key=`${season}:${club.id}`,rating=Number(club.rating)||65,budget=Math.round(Math.max(4_000_000,(rating-50)**2*18_000));
  return {id:club.id,name:club.name,leagueId:club.leagueId,rating,budget,wageRoom:Math.round(budget*.16),squadDepth:20+(hash(key)%8),squadAge:23+(hash(key+':age')%9),style:styles[hash(key)%styles.length],managerTenure:1+(hash(key+':coach')%5),managerStyle:styles[hash(key+':manager')%styles.length],ambition:ambitions[clamp(Math.floor((rating-55)/10),0,ambitions.length-1)],transferAggression:42+(hash(key+':aggression')%49),needs:positions.filter((_,index)=>(hash(key+index)%4)===0).slice(0,3),in:[],out:[],seasonForm:0};
}

function mergeProfile(club,previous,season){
  const seeded=profile(club,season),saved=previous||{};
  return {...seeded,...saved,needs:Array.isArray(saved.needs)?saved.needs:seeded.needs,in:Array.isArray(saved.in)?saved.in.slice(0,18):[],out:Array.isArray(saved.out)?saved.out.slice(0,18):[]};
}

export function transferWindow(date,club={}){
  const value=new Date(date||'2026-07-01T12:00:00Z'),month=value.getUTCMonth()+1,continent=String(club?.continent||'').toLowerCase(),south=continent==='south-america'||club?.countryId==='brazil';
  const active=south?[1,2,3,7,8,9].includes(month):[1,2,6,7,8,9].includes(month),label=south?(month<=3?'Janela inicial sul-americana':'Janela de meio de temporada'):(month<=2?'Janela de inverno':'Janela de verão');
  return {active,label,month};
}

export function ensureRivalCareer(career={},catalog={}){
  const current=career.rivalWorld||{},clubs=Array.isArray(catalog.clubs)?catalog.clubs:[],clubsState={...(current.clubs||{})};
  clubs.forEach(club=>{clubsState[club.id]=mergeProfile(club,clubsState[club.id],career.season);});
  career.rivalWorld={version:RIVAL_CAREER_VERSION,season:Number(career.season)||2026,clubs:clubsState,moves:Array.isArray(current.moves)?current.moves.slice(-220):[],news:Array.isArray(current.news)?current.news.slice(-100):[],negotiations:Array.isArray(current.negotiations)?current.negotiations.slice(-80):[],windows:Array.isArray(current.windows)?current.windows.slice(-24):[],lastWeek:Number(current.lastWeek)||0};
  return career.rivalWorld;
}

function priorityScore(club,player,seed){const needed=(club.needs||[]).includes(player.pos)?22:0,ageFit=player.age<=27?8:player.age<=31?4:0;return needed+ageFit+Number(club.transferAggression||50)*.4+Number(club.rating||60)*.3+(hash(`${seed}:${club.id}:${player.id}`)%18);}

export function transferCompetition(career={},catalog={},player={},proposal={}){
  const world=ensureRivalCareer(career,catalog),sourceId=String(player.sourceClubId||''),targetValue=valueOf(player),fee=Math.max(0,Number(proposal.fee)||0),salary=Math.max(0,Number(proposal.salary)||0),expected=Math.max(1000,Number(proposal.expectedSalary)||Math.round(Number(player.salary||10)*1000));
  const candidates=Object.values(world.clubs).filter(club=>club.id!==career.club?.id&&club.id!==sourceId&&Number(club.budget||0)>=targetValue*.25).map(club=>({club,priority:priorityScore(club,player,career.season)})).sort((a,b)=>b.priority-a.priority||b.club.budget-a.club.budget).slice(0,3);
  const rivals=candidates.map(({club,priority})=>{const feeFactor=.91+(hash(`${career.season}:${player.id}:${club.id}:fee`)%26)/100,salaryFactor=.93+(hash(`${career.season}:${player.id}:${club.id}:salary`)%25)/100,rivalFee=Math.round(Math.min(Number(club.budget)*.19,Math.max(targetValue*.78,Math.min(targetValue*1.35,targetValue*feeFactor)))/1000)*1000,rivalSalary=Math.round(expected*salaryFactor/1000)*1000,score=(rivalFee/targetValue)*48+(rivalSalary/expected)*26+Number(club.rating)*.18+priority*.34;return {id:club.id,name:club.name,fee:rivalFee,salary:rivalSalary,score:Math.round(score*10)/10,reason:(club.needs||[]).includes(player.pos)?'posição prioritária':club.ambition||'profundidade de elenco'};});
  const ownScore=(fee/targetValue)*48+(salary/expected)*26+Number(career.club?.rating||60)*.18+(Number(player.marketInterest||50)-50)*.08,best=rivals.slice().sort((a,b)=>b.score-a.score)[0]||null,playerWins=!best||ownScore>=best.score+1.5;
  return {playerWins,ownScore:Math.round(ownScore*10)/10,rivals,best,pressure:best?clamp(Math.round((best.score-ownScore+12)*5),5,100):0};
}

export function recordRivalTransfer(career={},catalog={},player={},competition={}){
  if(competition.playerWins||!competition.best)return null;
  const world=ensureRivalCareer(career,catalog),buyer=world.clubs[competition.best.id],seller=world.clubs[player.sourceClubId];if(!buyer)return null;
  const id=`rival-player-${career.season}-${career.week||0}-${player.id}-${buyer.id}`,existing=world.moves.find(move=>move.id===id);if(existing)return existing;
  const move={id,week:Number(career.week)||0,season:career.season,player:player.name,position:player.pos,from:seller?.name||player.sourceClub||'clube vendedor',to:buyer.name,fee:competition.best.fee,salary:competition.best.salary,status:'concluído',reason:competition.best.reason,competitive:true};
  buyer.budget=Math.max(0,Number(buyer.budget)-move.fee);buyer.wageRoom=Math.max(0,Number(buyer.wageRoom)-move.salary*12);buyer.squadDepth=Math.min(34,Number(buyer.squadDepth)+1);buyer.rating=clamp(Number(buyer.rating)+.16,45,95);buyer.needs=(buyer.needs||[]).filter(position=>position!==player.pos);buyer.in.unshift(move);
  if(seller){seller.budget+=move.fee;seller.squadDepth=Math.max(16,Number(seller.squadDepth)-1);seller.out.unshift(move);}
  world.moves.unshift(move);world.negotiations.unshift({id,player:player.name,winner:buyer.name,at:career.date,pressure:competition.pressure,status:'perdida'});world.news.unshift({week:move.week,season:career.season,text:buyer.name+' superou a proposta por '+player.name+' e fechou a negociação.'});world.moves=world.moves.slice(0,220);world.negotiations=world.negotiations.slice(0,80);world.news=world.news.slice(0,100);return move;
}

export function simulateRivalMarketWeek(career={},catalog={},week=0){
  const world=ensureRivalCareer(career,catalog),window=transferWindow(career.date,career.club);if(week<=world.lastWeek||week%6!==0)return {world,moves:[],window};
  world.lastWeek=week;world.windows.unshift({season:career.season,week,label:window.label,active:window.active});world.windows=world.windows.slice(0,24);if(!window.active)return {world,moves:[],window};
  const clubs=Object.values(world.clubs).sort((a,b)=>b.rating-a.rating),moves=[];
  for(let slot=0;slot<Math.min(4,clubs.length);slot++){
    const buyer=clubs[hash(`${career.season}:${week}:buyer:${slot}`)%clubs.length],seller=clubs[hash(`${career.season}:${week}:seller:${slot}`)%clubs.length];if(!buyer||!seller||buyer.id===seller.id||buyer.budget<2_000_000)continue;
    const position=buyer.needs?.[0]||positions[hash(`${buyer.id}:${week}`)%positions.length],fee=Math.round(Math.min(buyer.budget*.16,Math.max(800_000,(buyer.rating+seller.rating)*18_000))),id=`rival-${career.season}-${week}-${buyer.id}-${seller.id}`;if(world.moves.some(move=>move.id===id))continue;
    buyer.budget-=fee;seller.budget+=fee;buyer.squadDepth=Math.min(32,buyer.squadDepth+1);seller.squadDepth=Math.max(18,seller.squadDepth-1);buyer.rating=clamp(buyer.rating+.18,45,95);seller.rating=clamp(seller.rating-.08,45,95);buyer.needs=(buyer.needs||[]).filter(need=>need!==position);
    const move={id,week,season:career.season,player:`Reforço monitorado · ${position}`,position,from:seller.name,to:buyer.name,fee,status:'concluído',reason:(buyer.ambition||'planejamento')+' · '+(buyer.managerStyle||buyer.style)};buyer.in.unshift(move);seller.out.unshift(move);world.moves.unshift(move);moves.push(move);
  }
  if(moves.length)world.news.unshift({week,season:career.season,text:moves[0].to+' reforça o elenco para '+moves[0].reason+'.'});world.moves=world.moves.slice(0,220);world.news=world.news.slice(0,100);return {world,moves,window};
}

export function settleRivalSeason(career={},worldState={},catalog={}){const world=ensureRivalCareer(career,catalog),summaries=[];Object.values(worldState.leagues||{}).forEach(league=>{const table=(league.table||[]).slice().sort((a,b)=>b.points-a.points||b.gd-a.gd||b.rating-a.rating);table.forEach((row,index)=>{const club=world.clubs[row.id];if(!club)return;const swing=index===0?2:index<Math.ceil(table.length*.25)?1:index>=table.length-Number(league.rules?.relegation||0)?-2:-.25;club.rating=clamp(club.rating+swing,45,95);club.budget=Math.max(2_000_000,Math.round(club.budget+(index===0?8_000_000:index<table.length/2?1_500_000:-900_000)));club.seasonForm=Math.round((row.points/Math.max(1,row.played*3))*100);club.needs=positions.filter((_,needIndex)=>(hash(`${career.season}:${club.id}:${needIndex}`)%5)===0).slice(0,3);summaries.push({club:club.name,league:league.name,rank:index+1,form:club.seasonForm});});});world.season=Number(career.season||world.season)+1;world.lastWeek=0;world.news.unshift({season:career.season,text:'Mercado rival recalculado com premiações, desempenho, carências e estratégia de cada clube.'});return {world,summaries};}

export function rivalMarketBrief(career={}){const world=career.rivalWorld||{},moves=(world.moves||[]).slice(0,5),clubs=Object.values(world.clubs||[]),window=transferWindow(career.date,career.club);return {version:RIVAL_CAREER_VERSION,moves,clubs:clubs.length,biggestSpenders:clubs.slice().sort((a,b)=>b.budget-a.budget).slice(0,3),news:(world.news||[]).slice(0,3),negotiations:(world.negotiations||[]).slice(0,3),window};}
