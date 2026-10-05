/**
 * Persistent, world-wide cup and continental tournament simulation.
 * It deliberately stores every draw, result and winner in the save rather than
 * resolving competitions only around the club controlled by the player.
 */
export const WORLD_TOURNAMENT_VERSION = '3.0.0';

const hash = value => { let n=2166136261; for(const c of String(value)){ n^=c.charCodeAt(0); n=Math.imul(n,16777619); } return n>>>0; };
const clean = team => ({id:String(team?.id||''),name:String(team?.name||'Clube'),rating:Number(team?.rating)||60,badge:team?.badge||'',countryId:String(team?.countryId||''),confederation:String(team?.confederation||'')});
const powerOfTwo = count => { let n=1; while(n*2<=count)n*=2; return n; };
const nextPowerOfTwo = count => { let n=1; while(n<count)n*=2; return n; };
const stageName = count => ({2:'Final',4:'Semifinal',8:'Quartas de final',16:'Oitavas de final',32:'16 avos de final'})[count] || `Rodada de ${count}`;
const random = (seed,offset) => (hash(`${seed}:${offset}`)%1000)/1000;
const score = (home,away,seed) => { const edge=(Number(home?.rating||60)-Number(away?.rating||60))/20+.23; return {home:Math.max(0,Math.floor(random(seed,'h')*2.5+Math.max(0,edge))),away:Math.max(0,Math.floor(random(seed,'a')*2.35+Math.max(0,-edge)))}; };

function cupLegs(countryId, remaining) {
  const country=String(countryId||'').toLowerCase();
  if(country==='brazil') return remaining>=16?2:2;
  if(country==='italy') return remaining===4?2:1;
  if(['england','argentina','chile','uruguay','colombia','ecuador'].includes(country)) return 1;
  return remaining===2?1:2;
}

function seededTeams(teams, seed, limit=32) {
  const ordered=teams.map(clean).filter(team=>team.id).sort((a,b)=>b.rating-a.rating || hash(`${seed}:${a.id}`)-hash(`${seed}:${b.id}`));
  const size=Math.min(limit,powerOfTwo(ordered.length));
  const picked=ordered.slice(0,Math.max(0,size));
  const pairs=[];
  for(let i=0;i<Math.floor(picked.length/2);i++)pairs.push([picked[i],picked[picked.length-1-i]]);
  return pairs;
}

function makeTie(home,away,legs,id) { return {id,homeId:home?.id||null,awayId:away?.id||null,legs,results:Array.from({length:legs},()=>null),winnerId:null,penalties:null}; }
function emptyRound(count, legs, id) { return {stage:stageName(count),legs,ties:Array.from({length:Math.floor(count/2)},(_,i)=>makeTie(null,null,legs,`${id}-tie-${i+1}`)),complete:false}; }

function createKnockout({id,name,kind,countryId='',confederation='',teams=[],seed='',limit=32}) {
  const ordered=teams.map(clean).filter(team=>team.id).sort((a,b)=>b.rating-a.rating || hash(`${seed}:${a.id}`)-hash(`${seed}:${b.id}`)).slice(0,limit);
  if(ordered.length<2)return null;
  const total=nextPowerOfTwo(ordered.length),draw=[...ordered,...Array.from({length:total-ordered.length},()=>null)],pairs=[];
  for(let index=0;index<total/2;index++)pairs.push([draw[index],draw[draw.length-1-index]]);
  const rounds=[];
  let count=total,index=0;
  while(count>=2){
    const legs=cupLegs(countryId,count);
    const round=index===0?{stage:stageName(count),legs,ties:pairs.map(([home,away],i)=>makeTie(home,away,legs,`${id}-r1-${i+1}`)),complete:false}:emptyRound(count,legs,`${id}-r${index+1}`);
    rounds.push(round);count/=2;index++;
  }
  return {id,name,kind,countryId,confederation,format:'knockout',participants:ordered.length,drawSize:total,teams:ordered,rounds,currentRound:0,champion:null,completed:false,draw:{method:'seeding por coeficiente e sorteio determinístico',seed}};
}

function roundRobin(teams) {
  const ids=teams.map(team=>team.id);if(ids.length%2)ids.push(null);const rotation=ids.slice(),rounds=[],half=rotation.length/2;
  for(let r=0;r<rotation.length-1;r++){const matches=[];for(let i=0;i<half;i++){const home=rotation[i],away=rotation[rotation.length-1-i];if(home&&away)matches.push([((r+i)%2)?away:home,((r+i)%2)?home:away]);}rounds.push(matches);rotation.splice(1,0,rotation.pop());}
  return rounds.concat(rounds.map(matches=>matches.map(([home,away])=>[away,home])));
}

function tableFor(teamIds, teams) { return teamIds.map(id=>{const t=teams.find(item=>item.id===id)||{};return {id,name:t.name||id,rating:t.rating||60,points:0,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0};}); }
function sorted(table) { return table.slice().sort((a,b)=>b.points-a.points||b.gd-a.gd||b.gf-a.gf||b.wins-a.wins||b.rating-a.rating||a.name.localeCompare(b.name,'pt-BR')); }
function updateTable(table,homeId,awayId,homeGoals,awayGoals) { const home=table.find(x=>x.id===homeId),away=table.find(x=>x.id===awayId);if(!home||!away)return;for(const [row,gf,ga] of [[home,homeGoals,awayGoals],[away,awayGoals,homeGoals]]){row.played++;row.gf+=gf;row.ga+=ga;row.gd=row.gf-row.ga;if(gf>ga){row.wins++;row.points+=3;}else if(gf===ga){row.draws++;row.points++;}else row.losses++;} }

function createContinental({id,name,confederation,teams,seed}) {
  const picked=seededTeams(teams,seed,32).flat();const size=Math.min(32,powerOfTwo(picked.length));const participants=picked.slice(0,size);
  if(participants.length<4)return null;
  const groupsCount=participants.length>=32?8:participants.length>=16?4:2;
  const groups=Array.from({length:groupsCount},(_,index)=>{const members=[];for(let slot=0;slot<participants.length/groupsCount;slot++)members.push(participants[slot*groupsCount+index]);const ids=members.map(t=>t.id);return {id:String.fromCharCode(65+index),teamIds:ids,fixtures:roundRobin(members).map((matches,matchday)=>({matchday:matchday+1,matches:matches.map(([homeId,awayId])=>({homeId,awayId,homeGoals:null,awayGoals:null}))})),table:tableFor(ids,participants)};});
  return {id,name,kind:'continental',confederation,format:'groups-knockout',participants:participants.length,teams:participants,groups,matchday:0,knockout:null,currentStage:'Fase de grupos',champion:null,completed:false,draw:{method:'potes continentais persistidos',seed}};
}

function allocationEntries(leagues=[],clubs=[],leagueStates={}) {
  const entries=[];
  leagues.forEach(league=>{const state=leagueStates?.[league.id];const eligible=state?.table?.length?sorted(state.table).map(row=>clubs.find(team=>team.id===row.id&&team.leagueId===league.id)||state.teams.find(team=>team.id===row.id)):clubs.filter(team=>team.leagueId===league.id).slice().sort((a,b)=>b.rating-a.rating);const allocations=league?.rules?.continental||{};Object.entries(allocations).forEach(([competition,range])=>{const start=Math.max(1,Number(range?.[0])||1),end=Math.max(start,Number(range?.[1])||start);for(let pos=start;pos<=end;pos++){const team=eligible[pos-1];if(team)entries.push({competition,team:clean(team),leagueId:league.id,rank:pos});}});});
  const byClub={};const competitions={};
  entries.sort((a,b)=>a.rank-b.rank||b.team.rating-a.team.rating).forEach(entry=>{if(!byClub[entry.team.id])byClub[entry.team.id]=[];if(!byClub[entry.team.id].some(item=>item.competition===entry.competition))byClub[entry.team.id].push({competition:entry.competition,leagueId:entry.leagueId,rank:entry.rank});if(!competitions[entry.competition])competitions[entry.competition]=[];if(!competitions[entry.competition].some(team=>team.id===entry.team.id))competitions[entry.competition].push(entry.team);});
  return {byClub,competitions,generatedAt:new Date().toISOString()};
}

export function deriveWorldQualifications({leagues=[],clubs=[],leagueStates={}}={}) { return allocationEntries(leagues,clubs,leagueStates); }

export function buildWorldTournaments({season=2026,leagues=[],clubs=[],leagueStates={},qualificationSeeds=null}={}) {
  const domestic={};const countries=[...new Set(clubs.map(team=>team.countryId).filter(Boolean))];
  countries.forEach(countryId=>{const teams=clubs.filter(team=>team.countryId===countryId);const cup=createKnockout({id:`cup-${countryId}`,name:`Copa nacional · ${teams[0]?.country||countryId}`,kind:'domestic-cup',countryId,teams,seed:`${season}:${countryId}:cup`,limit:Number.POSITIVE_INFINITY});if(cup)domestic[cup.id]=cup;});
  const qualifications=qualificationSeeds?.competitions?qualificationSeeds:allocationEntries(leagues,clubs,leagueStates);
  const continental={};Object.entries(qualifications.competitions||{}).forEach(([id,teams])=>{const exemplar=teams[0]||{};const item=createContinental({id,name:id.replaceAll('-',' ').replace(/\b\w/g,char=>char.toUpperCase()),confederation:exemplar.confederation,teams,seed:`${season}:${id}`});if(item)continental[id]=item;});
  return {version:WORLD_TOURNAMENT_VERSION,season:Number(season)||2026,domestic,continental,qualifications,history:[],updatedAt:new Date().toISOString()};
}

function resolveTie(tie,teams,seed) { let homeTotal=0,awayTotal=0;tie.results.forEach((result,index)=>{if(result)return;const home=teams.find(team=>team.id===tie.homeId),away=teams.find(team=>team.id===tie.awayId);const finalScore=score(home,away,`${seed}:${index}`);tie.results[index]=finalScore;});tie.results.forEach(result=>{homeTotal+=result.home;awayTotal+=result.away;});if(homeTotal===awayTotal){const homePens=3+(hash(`${seed}:home`) % 3),awayPens=3+(hash(`${seed}:away`) % 3);tie.penalties={home:homePens===awayPens?homePens+1:homePens,away:awayPens};}tie.winnerId=tie.penalties?(tie.penalties.home>tie.penalties.away?tie.homeId:tie.awayId):(homeTotal>awayTotal?tie.homeId:tie.awayId);return {winnerId:tie.winnerId,homeTotal,awayTotal}; }
function promoteKnockout(round,nextRound) { if(!nextRound)return;const winners=round.ties.map(tie=>tie.winnerId);nextRound.ties.forEach((tie,index)=>{tie.homeId=winners[index*2]||null;tie.awayId=winners[index*2+1]||null;}); }
function simulateKnockout(tournament,seed) { const round=tournament.rounds[tournament.currentRound];if(!round||round.complete)return null;const teams=tournament.teams||[];const results=[];round.ties.forEach((tie,index)=>{if(tie.homeId&&tie.awayId)results.push(resolveTie(tie,teams,`${seed}:${tournament.id}:${tournament.currentRound}:${index}`));else if(tie.homeId||tie.awayId)tie.winnerId=tie.homeId||tie.awayId;});round.complete=true;promoteKnockout(round,tournament.rounds[tournament.currentRound+1]);if(tournament.currentRound===tournament.rounds.length-1){const champion=teams.find(team=>team.id===round.ties[0]?.winnerId);tournament.champion=champion?{id:champion.id,name:champion.name,badge:champion.badge}:null;tournament.completed=true;}else tournament.currentRound++;return {id:tournament.id,stage:round.stage,results,champion:tournament.champion}; }

function groupResult(group,fixture,seed) { fixture.matches.forEach((match,index)=>{if(match.homeGoals!==null)return;const home=group.table.find(team=>team.id===match.homeId),away=group.table.find(team=>team.id===match.awayId),result=score(home,away,`${seed}:${group.id}:${fixture.matchday}:${index}`);match.homeGoals=result.home;match.awayGoals=result.away;updateTable(group.table,match.homeId,match.awayId,result.home,result.away);}); }
function beginContinentalKnockout(tournament) { const qualifiers=tournament.groups.flatMap(group=>sorted(group.table).slice(0,2).map(row=>tournament.teams.find(team=>team.id===row.id))).filter(Boolean);const bracket=createKnockout({id:`${tournament.id}-ko`,name:tournament.name,kind:'continental-knockout',confederation:tournament.confederation,teams:qualifiers,seed:`${tournament.id}:knockout`,limit:qualifiers.length});tournament.knockout=bracket?{...bracket,teams:qualifiers}:null;tournament.currentStage=tournament.knockout?.rounds?.[0]?.stage||'Concluído'; }
function simulateContinental(tournament,seed) { if(tournament.completed)return null;if(tournament.matchday < (tournament.groups[0]?.fixtures?.length||0)){tournament.groups.forEach(group=>groupResult(group,group.fixtures[tournament.matchday],`${seed}:${tournament.id}`));tournament.matchday++;if(tournament.matchday===tournament.groups[0].fixtures.length)beginContinentalKnockout(tournament);return {id:tournament.id,stage:`Grupos · rodada ${tournament.matchday}`,results:[]};}if(!tournament.knockout)return null;const update=simulateKnockout(tournament.knockout,seed);tournament.currentStage=tournament.knockout.completed?'Concluído':tournament.knockout.rounds[tournament.knockout.currentRound]?.stage||'Mata-mata';if(tournament.knockout.completed){tournament.completed=true;tournament.champion=tournament.knockout.champion;}return update?{...update,id:tournament.id,stage:update.stage,champion:tournament.champion}:null; }

export function simulateWorldTournamentWeek(tournaments,seed='') { if(!tournaments)return [];const updates=[];Object.values(tournaments.domestic||{}).forEach(item=>{if(!item.completed){const update=simulateKnockout(item,`${seed}:cup`);if(update)updates.push(update);}});Object.values(tournaments.continental||{}).forEach(item=>{const update=simulateContinental(item,`${seed}:continental`);if(update)updates.push(update);});tournaments.updatedAt=new Date().toISOString();updates.filter(item=>item.champion).forEach(item=>tournaments.history.unshift({season:tournaments.season,id:item.id,name:(tournaments.domestic?.[item.id]||tournaments.continental?.[item.id])?.name||item.id,champion:item.champion,at:tournaments.updatedAt}));tournaments.history=tournaments.history.slice(0,120);return updates; }

export function worldTournamentSummary(tournaments) { if(!tournaments)return [];return [...Object.values(tournaments.domestic||{}),...Object.values(tournaments.continental||{})].map(item=>({id:item.id,name:item.name,kind:item.kind,participants:item.participants,stage:item.completed?'Concluído':(item.currentStage||item.rounds?.[item.currentRound]?.stage||'Em andamento'),champion:item.champion,completed:item.completed})); }
export function clubWorldQualification(tournaments,clubId) { const entries=tournaments?.qualifications?.byClub?.[clubId]||[];return entries[0]||null; }

export function hydrateWorldTournaments(existing,config={}) { if(existing?.version===WORLD_TOURNAMENT_VERSION&&existing.domestic&&existing.continental)return existing;return buildWorldTournaments(config); }
