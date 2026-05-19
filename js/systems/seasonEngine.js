import { teams } from '../data/gameData.js';
import { standingsTables } from '../data/standingsData.js';
import { clubLogo } from './assets.js';

const DAY = 24*60*60*1000;
export const SEASON_ENGINE_VERSION = 'v2.7.0';

export function teamById(id){ return teams.find(t=>t.id===id) || teams[0]; }
export function leagueTeams(leagueId='brasileirao-a'){
  const list = teams.filter(t=>t.leagueId===leagueId);
  return list.length ? list : teams.filter(t=>t.country==='br').slice(0,20);
}
function dateAdd(base, days){ return new Date(new Date(base).getTime()+days*DAY).toISOString().slice(0,10); }
function stableHash(s=''){
  let h=0; for(const ch of String(s)) h=((h<<5)-h)+ch.charCodeAt(0)|0; return Math.abs(h);
}
function goalsFor(team, opp, seed, home=false){
  const diff = Number(team.level||70)-Number(opp.level||70);
  const raw = (stableHash(`${seed}-${team.id}`)%100)/100;
  const boost = home ? 0.25 : 0;
  const expected = 1.15 + diff/22 + boost + raw*.8;
  return Math.max(0, Math.min(5, Math.round(expected + (raw>.76?1:0) - (raw<.18?1:0))));
}
function fixtureDate(round, slot=0){
  const start = '2026-05-24';
  return dateAdd(start, (round-1)*7 + Math.floor(slot/10));
}
export function buildRoundRobin(leagueId='brasileirao-a'){
  const clubs = leagueTeams(leagueId).slice(0,20);
  if(clubs.length < 2) return [];
  const arr = clubs.length % 2 ? [...clubs, {id:'bye', name:'Folga'}] : [...clubs];
  const n = arr.length;
  const rounds = [];
  let rotation = arr.slice(1);
  for(let r=1;r<n;r++){
    const round=[];
    const left=[arr[0], ...rotation.slice(0,(n/2)-1)];
    const right=rotation.slice((n/2)-1).reverse();
    for(let i=0;i<n/2;i++){
      const a=left[i], b=right[i];
      if(a.id==='bye'||b.id==='bye') continue;
      const homeFirst = (r+i)%2===0;
      round.push({home:homeFirst?a.id:b.id, away:homeFirst?b.id:a.id});
    }
    rounds.push(round);
    rotation=[rotation[rotation.length-1], ...rotation.slice(0,-1)];
  }
  const returnRounds = rounds.map((round)=>round.map(m=>({home:m.away, away:m.home})));
  return [...rounds, ...returnRounds].map((round,idx)=>round.map((m,slot)=>({
    id:`${leagueId}-r${idx+1}-${m.home}-${m.away}`,
    round:idx+1,
    date:fixtureDate(idx+1, slot),
    competitionId:leagueId,
    competition: leagueId==='brasileirao-b' ? 'Brasileirão Série B 2026' : 'Brasileirão Série A 2026',
    stage:`Rodada ${idx+1}`,
    home:m.home,
    away:m.away,
    venue:teamById(m.home).stadium || 'Estádio'
  })));
}
export function flattenFixtures(leagueId='brasileirao-a'){
  return buildRoundRobin(leagueId).flat();
}
export function nextFixtureForClub(clubId='santos', completed=[]){
  const club=teamById(clubId); const leagueId=club.leagueId || 'brasileirao-a';
  const done = new Set((completed||[]).map(m=>m.id));
  return flattenFixtures(leagueId).find(f=>(f.home===clubId||f.away===clubId)&&!done.has(f.id)) || flattenFixtures(leagueId).find(f=>f.home===clubId||f.away===clubId);
}
export function fixturesByRound(leagueId='brasileirao-a', round=1){
  return (buildRoundRobin(leagueId)[Math.max(0, round-1)] || []);
}
export function simulateFixture(fixture){
  const home=teamById(fixture.home), away=teamById(fixture.away);
  const seed=fixture.id || `${home.id}-${away.id}`;
  const hg=goalsFor(home, away, seed, true);
  const ag=goalsFor(away, home, seed, false);
  return {...fixture, homeGoals:hg, awayGoals:ag, summary:`${hg} x ${ag}`, simulated:true};
}
export function simulateOtherRoundMatches(state={}, round=null){
  const club=teamById(state.clubId || 'santos'); const leagueId=club.leagueId || 'brasileirao-a';
  const currentRound = round || Number(state.career?.matchday || state.match?.round || 1);
  const completedIds = new Set((state.career?.completedMatches||[]).map(m=>m.id));
  const userId = state.clubId || club.id;
  return fixturesByRound(leagueId, currentRound)
    .filter(f=>f.home!==userId && f.away!==userId && !completedIds.has(f.id))
    .map(simulateFixture);
}
export function deriveStandings(leagueId='brasileirao-a', completed=[]){
  const base = leagueTeams(leagueId).slice(0,20).map((t,i)=>({pos:i+1, club:t.name, id:t.id, logo:clubLogo(t.id), p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0, form:[]}));
  const by = new Map(base.map(r=>[r.id,r]));
  const relevant = (completed||[]).filter(m=>m.competitionId===leagueId);
  relevant.forEach(m=>{
    const h=by.get(m.home), a=by.get(m.away); if(!h||!a) return;
    const hg=Number(m.homeGoals||0), ag=Number(m.awayGoals||0);
    h.p++; a.p++; h.gf+=hg; h.ga+=ag; a.gf+=ag; a.ga+=hg;
    if(hg>ag){ h.w++; a.l++; h.pts+=3; h.form=['V',...h.form].slice(0,5); a.form=['D',...a.form].slice(0,5); }
    else if(hg<ag){ a.w++; h.l++; a.pts+=3; a.form=['V',...a.form].slice(0,5); h.form=['D',...h.form].slice(0,5); }
    else { h.d++; a.d++; h.pts++; a.pts++; h.form=['E',...h.form].slice(0,5); a.form=['E',...a.form].slice(0,5); }
  });
  if(!relevant.length && standingsTables[leagueId]) return standingsTables[leagueId].map((r,i)=>({...r,pos:i+1,logo:clubLogo(r.id)}));
  return base.sort((a,b)=>(b.pts-a.pts)||((b.gf-b.ga)-(a.gf-a.ga))||(b.gf-a.gf)||a.club.localeCompare(b.club)).map((r,i)=>({...r,pos:i+1, logo:clubLogo(r.id)}));
}
export function leagueZones(leagueId='brasileirao-a', pos=1){
  if(leagueId==='brasileirao-b'){
    if(pos<=4) return {name:'Acesso à Série A', className:'zone-promotion'};
    if(pos>=17) return {name:'Risco de queda', className:'zone-relegation'};
    return {name:'Meio da tabela', className:'zone-neutral'};
  }
  if(pos<=4) return {name:'Libertadores', className:'zone-libertadores'};
  if(pos<=12) return {name:'Sul-Americana', className:'zone-sulamericana'};
  if(pos>=17) return {name:'Rebaixamento', className:'zone-relegation'};
  return {name:'Meio da tabela', className:'zone-neutral'};
}
export function qualificationSummary(leagueId='brasileirao-a'){
  return leagueId==='brasileirao-b'
    ? ['1º-4º sobem para a Série A', '17º-20º entram em zona de queda', 'Tabela dinâmica por rodada simulada']
    : ['1º-4º entram na Libertadores', '5º-12º disputam Sul-Americana', '17º-20º caem para a Série B'];
}
export function seasonProgress(completed=[]){
  const byLeague = completed.reduce((acc,m)=>{acc[m.competitionId]=(acc[m.competitionId]||0)+1; return acc;},{});
  return byLeague;
}
