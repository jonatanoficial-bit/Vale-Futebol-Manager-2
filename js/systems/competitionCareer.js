export const COMPETITION_CAREER_VERSION = '1.0.0';

function hash(value='') {
  let number=2166136261;
  for(const char of String(value)){number^=char.charCodeAt(0);number=Math.imul(number,16777619);}
  return Math.abs(number>>>0);
}

function rowFor(team={}) {
  return {team,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0};
}

function applyResult(row,gf,ga) {
  if(!row)return;
  row.played+=1;row.gf+=gf;row.ga+=ga;row.gd=row.gf-row.ga;
  if(gf>ga){row.wins+=1;row.points+=3;}
  else if(gf===ga){row.draws+=1;row.points+=1;}
  else row.losses+=1;
}

function simulatedScore(home,away,key) {
  const homeRating=Number(home?.rating||70),awayRating=Number(away?.rating||70);
  const first=hash(key+':home')%100,second=hash(key+':away')%100;
  const homeGoals=Math.max(0,Math.min(5,Math.floor((first+46+(homeRating-awayRating)*1.8)/34)));
  const awayGoals=Math.max(0,Math.min(5,Math.floor((second+36+(awayRating-homeRating)*1.8)/36)));
  return [homeGoals,awayGoals];
}

export function deriveCompetitionTable(managedTeam,fixtures=[],seed='') {
  const relevant=fixtures.filter(fixture=>!fixture.cancelled);
  const teams=[managedTeam,...relevant.map(fixture=>fixture.opponent)].filter(Boolean);
  const unique=[...new Map(teams.map(team=>[team.id||team.name,team])).values()];
  const rows=new Map(unique.map(team=>[team.id||team.name,rowFor(team)]));
  const managedKey=managedTeam?.id||managedTeam?.name;
  relevant.filter(fixture=>fixture.played&&fixture.score).forEach((fixture,index)=>{
    const opponentKey=fixture.opponent?.id||fixture.opponent?.name;
    const ownGoals=fixture.home?Number(fixture.score.home):Number(fixture.score.away);
    const opponentGoals=fixture.home?Number(fixture.score.away):Number(fixture.score.home);
    applyResult(rows.get(managedKey),ownGoals,opponentGoals);
    applyResult(rows.get(opponentKey),opponentGoals,ownGoals);

    const idle=unique.filter(team=>{const key=team.id||team.name;return key!==managedKey&&key!==opponentKey;});
    if(idle.length>1){
      const offset=(Number(fixture.round||index)+hash(seed))%idle.length;
      const rotated=[...idle.slice(offset),...idle.slice(0,offset)];
      for(let pair=0;pair+1<rotated.length;pair+=2){
        const home=rotated[pair],away=rotated[pair+1];
        const [homeGoals,awayGoals]=simulatedScore(home,away,seed+':'+fixture.id+':'+pair);
        applyResult(rows.get(home.id||home.name),homeGoals,awayGoals);
        applyResult(rows.get(away.id||away.name),awayGoals,homeGoals);
      }
    }
  });
  return [...rows.values()].sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf||Number(b.team.rating||0)-Number(a.team.rating||0)||String(a.team.name).localeCompare(String(b.team.name)));
}

export function competitionKind(fixture={}) {
  const id=fixture.competitionId;
  if(id==='international-friendly')return {id:'friendly',label:'Amistoso internacional',short:'AMISTOSO'};
  if(id==='world-cup-qualifiers')return {id:'qualifiers',label:'Eliminatórias da Copa do Mundo',short:'ELIMINATÓRIAS'};
  if(id==='continental-national-cup')return {id:'continental',label:fixture.competitionName||'Copa continental',short:'COPA CONTINENTAL'};
  if(id==='world-cup')return {id:'world',label:'Copa do Mundo',short:'COPA DO MUNDO'};
  if(fixture.type==='continental')return {id:'continental',label:fixture.competitionName||'Competição continental',short:'CONTINENTAL'};
  if(fixture.type==='cup')return {id:'cup',label:fixture.competitionName||'Copa nacional',short:'COPA'};
  return {id:fixture.type||'league',label:fixture.competitionName||'Liga',short:fixture.type==='league'?'LIGA':'JOGO'};
}

export function nextCareerEvent(career,{includeClub=true}={}) {
  const club=includeClub?(career?.fixtures||[]).map(fixture=>({...fixture,eventOwner:'club'})):[];
  const national=(career?.national?.fixtures||[]).map(fixture=>({...fixture,eventOwner:'national'}));
  return [...club,...national]
    .filter(fixture=>!fixture.played&&!fixture.locked&&!fixture.cancelled)
    .sort((a,b)=>new Date(a.date)-new Date(b.date))[0]||null;
}

export function managerCareerScore(career={}) {
  const manager=career.manager||{},stats=career.stats||{},national=career.national?.stats||{};
  return Math.max(0,Math.round(Number(manager.xp||0)+Number(manager.reputation||0)*20+Number(stats.wins||0)*35+Number(national.wins||0)*50+(career.trophies||[]).reduce((sum,trophy)=>sum+Number(trophy.score||500),0)));
}

export function seasonTrophies({season,club,league,champion,cupChampion,continentalChampion,continentalId,date}) {
  const items=[];
  if(champion)items.push({id:'league-'+season+'-'+club.id,competitionId:league.id,competitionName:league.name,label:'Campeão nacional',xp:1500,score:1200});
  if(cupChampion)items.push({id:'cup-'+season+'-'+club.id,competitionId:club.country==='Brasil'?'copa-do-brasil':'copa-nacional',competitionName:club.country==='Brasil'?'Copa do Brasil':'Copa nacional',label:'Campeão da copa',xp:800,score:850});
  if(continentalChampion)items.push({id:'continental-'+season+'-'+club.id,competitionId:continentalId||'continental',competitionName:continentalId?String(continentalId).replaceAll('-',' '):'Competição continental',label:'Campeão continental',xp:1500,score:1600});
  return items.map(item=>({...item,season,club:{id:club.id,name:club.name,badge:club.badge},date}));
}
