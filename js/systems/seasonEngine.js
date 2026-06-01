import { teams } from '../data/gameData.js';
import { clubLogo } from './assets.js';

const DAY = 24*60*60*1000;
export const SEASON_ENGINE_VERSION = 'v4.0.0';

export const BRAZILIAN_SEASON_RULES = {
  season: 2026,
  leagues: {
    'brasileirao-a': {
      name: 'Brasileirão Série A 2026',
      tier: 1,
      teams: 20,
      rounds: 38,
      matchesPerRound: 10,
      totalMatches: 380,
      relegation: { from: 17, to: 20, destination: 'brasileirao-b', label: 'Rebaixamento para Série B' },
      continental: [
        { from: 1, to: 5, destination: 'libertadores', label: 'Libertadores' },
        { from: 6, to: 12, destination: 'sulamericana', label: 'Sul-Americana' }
      ]
    },
    'brasileirao-b': {
      name: 'Brasileirão Série B 2026',
      tier: 2,
      teams: 20,
      rounds: 38,
      matchesPerRound: 10,
      totalMatches: 380,
      promotion: { from: 1, to: 4, destination: 'brasileirao-a', label: 'Acesso para Série A' },
      relegation: { from: 17, to: 20, destination: 'brasileirao-c-sim', label: 'Zona de queda para Série C simulada' }
    }
  },
  tieBreakers: ['Pontos', 'Vitórias', 'Saldo de gols', 'Gols pró', 'Nome do clube'],
  safety: { fallbackOnMissingClub: true, fallbackOnMissingFixture: true, autoRepairRound: true }
};

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
  const start = '2026-04-13';
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
  return flattenFixtures(leagueId).find(f=>(f.home===clubId||f.away===clubId)&&!done.has(f.id)) || null;
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
  return base.sort((a,b)=>(b.pts-a.pts)||(b.w-a.w)||((b.gf-b.ga)-(a.gf-a.ga))||(b.gf-a.gf)||a.club.localeCompare(b.club)).map((r,i)=>({...r,pos:i+1, logo:clubLogo(r.id)}));
}
export function leagueZones(leagueId='brasileirao-a', pos=1){
  if(leagueId==='brasileirao-b'){
    if(pos<=4) return {name:'Acesso à Série A', className:'zone-promotion'};
    if(pos>=17) return {name:'Risco de queda', className:'zone-relegation'};
    return {name:'Meio da tabela', className:'zone-neutral'};
  }
  if(pos<=5) return {name:'Libertadores', className:'zone-libertadores'};
  if(pos<=12) return {name:'Sul-Americana', className:'zone-sulamericana'};
  if(pos>=17) return {name:'Rebaixamento', className:'zone-relegation'};
  return {name:'Meio da tabela', className:'zone-neutral'};
}
export function qualificationSummary(leagueId='brasileirao-a'){
  return leagueId==='brasileirao-b'
    ? ['1º-4º sobem para a Série A', '17º-20º entram em zona de queda', 'Tabela dinâmica por rodada simulada']
    : ['1º-5º entram na Libertadores', '6º-12º disputam Sul-Americana', '17º-20º caem para a Série B'];
}
export function seasonProgress(completed=[]){
  const byLeague = completed.reduce((acc,m)=>{acc[m.competitionId]=(acc[m.competitionId]||0)+1; return acc;},{});
  return byLeague;
}


export function validateLeagueSeasonIntegrity(leagueId='brasileirao-a'){
  const rules = BRAZILIAN_SEASON_RULES.leagues[leagueId] || BRAZILIAN_SEASON_RULES.leagues['brasileirao-a'];
  const leagueClubList = leagueTeams(leagueId).slice(0, rules.teams);
  const rounds = buildRoundRobin(leagueId);
  const fixtures = rounds.flat();
  const seen = new Set();
  const pairCount = new Map();
  const errors = [];
  const warnings = [];
  if(leagueClubList.length !== rules.teams) errors.push(`${rules.name}: esperado ${rules.teams} clubes, encontrado ${leagueClubList.length}.`);
  if(rounds.length !== rules.rounds) errors.push(`${rules.name}: esperado ${rules.rounds} rodadas, encontrado ${rounds.length}.`);
  rounds.forEach((round,idx)=>{
    if(round.length !== rules.matchesPerRound) errors.push(`${rules.name}: rodada ${idx+1} deveria ter ${rules.matchesPerRound} jogos, encontrou ${round.length}.`);
    const clubsInRound = new Set();
    round.forEach(f=>{
      if(seen.has(f.id)) errors.push(`${rules.name}: fixture duplicado ${f.id}.`);
      seen.add(f.id);
      if(!f.home || !f.away || f.home === f.away) errors.push(`${rules.name}: confronto inválido na rodada ${idx+1}.`);
      if(clubsInRound.has(f.home) || clubsInRound.has(f.away)) errors.push(`${rules.name}: clube repetido na rodada ${idx+1}.`);
      clubsInRound.add(f.home); clubsInRound.add(f.away);
      const key = [f.home, f.away].sort().join('::');
      pairCount.set(key, (pairCount.get(key)||0)+1);
    });
  });
  if(fixtures.length !== rules.totalMatches) errors.push(`${rules.name}: esperado ${rules.totalMatches} jogos, encontrado ${fixtures.length}.`);
  pairCount.forEach((count,key)=>{ if(count !== 2) errors.push(`${rules.name}: par ${key} aparece ${count} vez(es), esperado ida e volta.`); });
  if(!errors.length && !warnings.length) warnings.push(`${rules.name}: integridade aprovada com ${rules.rounds} rodadas e ${fixtures.length} jogos.`);
  return { leagueId, name: rules.name, status: errors.length ? 'error' : 'ok', errors, warnings, rounds: rounds.length, fixtures: fixtures.length, clubs: leagueClubList.length };
}

export function validateBrazilianSeasonSystem(){
  const serieA = validateLeagueSeasonIntegrity('brasileirao-a');
  const serieB = validateLeagueSeasonIntegrity('brasileirao-b');
  const errors = [...serieA.errors, ...serieB.errors];
  return { version: SEASON_ENGINE_VERSION, status: errors.length ? 'error' : 'ok', leagues: [serieA, serieB], errors, totalFixtures: serieA.fixtures + serieB.fixtures, totalRounds: serieA.rounds + serieB.rounds };
}

export function promotionRelegationSnapshot(completed=[]){
  const serieA = deriveStandings('brasileirao-a', completed);
  const serieB = deriveStandings('brasileirao-b', completed);
  const sliceNames = (rows, from, to)=> rows.filter(r=>r.pos>=from && r.pos<=to).map(r=>({id:r.id, club:r.club, pos:r.pos, pts:r.pts}));
  return {
    libertadores: sliceNames(serieA,1,5),
    sulamericana: sliceNames(serieA,6,12),
    relegatedToB: sliceNames(serieA,17,20),
    promotedToA: sliceNames(serieB,1,4),
    relegatedToCSim: sliceNames(serieB,17,20),
    rules: BRAZILIAN_SEASON_RULES
  };
}

export function seasonDashboardSnapshot(state={}){
  const completed = state.career?.completedMatches || [];
  const club = teamById(state.clubId || 'santos');
  const leagueId = club.leagueId || 'brasileirao-a';
  const rules = BRAZILIAN_SEASON_RULES.leagues[leagueId] || BRAZILIAN_SEASON_RULES.leagues['brasileirao-a'];
  const playedInLeague = completed.filter(m=>m.competitionId===leagueId).length;
  const currentRound = Math.min(rules.rounds, Math.max(1, Number(state.career?.matchday || state.match?.round || 1)));
  return {
    club, leagueId, rules, currentRound,
    playedInLeague,
    progressPct: Math.round((playedInLeague / Math.max(1, rules.totalMatches))*100),
    integrity: validateLeagueSeasonIntegrity(leagueId),
    nationalIntegrity: validateBrazilianSeasonSystem(),
    destinations: promotionRelegationSnapshot(completed)
  };
}
