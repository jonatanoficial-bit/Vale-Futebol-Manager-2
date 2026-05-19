
import { teams } from '../data/gameData.js';
import { nationalTeams, callUpPool } from '../data/careerData.js';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n||0))); }
function slug(text=''){ return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'oferta'; }
function countryForTeam(team){
  const c = String(team.country || team.countryCode || '').toLowerCase();
  if(c.includes('brazil') || c === 'br') return 'br';
  if(c.includes('argentina') || c === 'ar') return 'ar';
  if(c.includes('spain') || c === 'es') return 'es';
  if(c.includes('england') || c === 'gb') return 'gb';
  if(c.includes('italy') || c === 'it') return 'it';
  if(c.includes('germany') || c === 'de') return 'de';
  if(c.includes('france') || c === 'fr') return 'fr';
  if(c.includes('portugal') || c === 'pt') return 'pt';
  return 'br';
}
export function careerScore(state={}){
  const rep = Number(state.manager?.reputation || 50);
  const board = Number(state.boardTrust || 60);
  const fan = Number(state.fanMood || 60);
  const completed = Array.isArray(state.career?.completedMatches) ? state.career.completedMatches.length : 0;
  const wins = (state.career?.completedMatches || []).filter(m=>{
    const club = state.clubId;
    if(m.home===club) return Number(m.homeGoals)>Number(m.awayGoals);
    if(m.away===club) return Number(m.awayGoals)>Number(m.homeGoals);
    return false;
  }).length;
  return clamp(Math.round(rep*0.45 + board*0.22 + fan*0.16 + completed*1.5 + wins*4), 1, 100);
}
export function buildClubOffers(state={}){
  const score = careerScore(state);
  const current = state.clubId || 'santos';
  const pool = teams.filter(t=>t.id!==current).sort((a,b)=>Math.abs((Number(a.reputation||a.level||50))-score)-Math.abs((Number(b.reputation||b.level||50))-score));
  return pool.slice(0,4).map((t,i)=>({
    id:`club-${slug(t.id||t.name)}-${i+1}`,
    type:'club',
    targetId:t.id,
    name:t.name,
    country:countryForTeam(t),
    league:t.league || 'Liga nacional',
    role:'Treinador principal',
    status:i===0?'Proposta formal':'Sondagem',
    requiredRep:Math.max(35, Number(t.reputation||t.level||60)-12),
    fit:clamp(60 + score - Number(t.reputation||t.level||60) + i*4, 20, 96),
    objective:Number(t.level||50)>78?'classificar para torneio continental':'reconstruir o elenco e subir a tabela',
    wage: Number(t.level||60)>80 ? 1.8 : 0.8,
    budget:Number(t.budget||30),
    pressure:Number(t.level||60)>80?'Alta':'Media'
  }));
}
export function buildNationalOffers(state={}){
  const score = careerScore(state);
  return nationalTeams.map((n,i)=>({
    id:`nat-${n.id}`,
    type:'national',
    targetId:n.id,
    name:n.name,
    country:String(n.flag||'').split('/').pop()?.replace('.png','') || 'br',
    role: score >= n.reputationRequired ? 'Treinador principal' : 'Radar futuro',
    status: score >= n.reputationRequired ? (i<2?'Proposta condicionada':'Proposta formal') : 'Monitorando',
    requiredRep:n.reputationRequired,
    fit:clamp(score - n.reputationRequired + 64 + Math.round(Number(n.level||70)/10), 15, 98),
    objective:n.expectation,
    pressure:Number(n.level||70)>85?'Muito alta':Number(n.level||70)>78?'Alta':'Media',
    calendar:'Datas FIFA, eliminatorias, copa continental e mundial a cada 4 anos',
    pool:n.pool
  }));
}
export function generateOffers(state={}){
  const all = [...buildClubOffers(state), ...buildNationalOffers(state)];
  const score = careerScore(state);
  return all.filter(o=>score+8 >= Number(o.requiredRep||0)).slice(0,8).map(o=>({...o, generatedAt:new Date().toISOString(), scoreAtOffer:score}));
}
export function buildInternationalCalendar(year=2026){
  return [
    {id:`${year}-fifa-03`, date:`${year}-03-24`, type:'data-fifa', title:'Data FIFA de marco', phase:'amistosos e observacao'},
    {id:`${year}-qual-06`, date:`${year}-06-10`, type:'eliminatorias', title:'Eliminatorias continentais', phase:'rodada dupla'},
    {id:`${year}-cup-07`, date:`${year}-07-04`, type:'copa-continental', title:'Copa continental', phase:'fase de grupos'},
    {id:`${year}-fifa-09`, date:`${year}-09-08`, type:'data-fifa', title:'Data FIFA de setembro', phase:'ajustes de convocacao'},
    {id:`${year}-qual-11`, date:`${year}-11-16`, type:'eliminatorias', title:'Eliminatorias continentais', phase:'rodada decisiva'},
    {id:`${year+2}-world-club`, date:`${year+2}-06-15`, type:'mundial-clubes', title:'Mundial de Clubes', phase:'ciclo internacional'},
    {id:`${year+4}-world-cup`, date:`${year+4}-06-12`, type:'copa-mundo', title:'Mundial de Selecoes', phase:'a cada 4 anos'}
  ];
}
export function defaultCallUpSelection(){
  const templates = callUpPool.length ? callUpPool : [{name:'Atleta Nacional', pos:'MEI', club:'Liga Nacional', overall:76, form:75, status:'Observação'}];
  const expanded = Array.from({length:26}, (_,i)=>{
    const base = templates[i % templates.length];
    const cloneRound = Math.floor(i / templates.length);
    const suffix = cloneRound ? ` ${cloneRound+1}` : '';
    return {...base, name:`${base.name}${suffix}`, overall:Math.max(60, Number(base.overall||75) - cloneRound), form:Math.max(55, Number(base.form||75) - (cloneRound*2)), status: i<23 ? (base.status || 'Monitorado') : 'Suplente ampliado'};
  });
  return expanded.map((p,i)=>({id:slug(`${p.name}-${i+1}`), ...p, selected:i<23, role:i<11?'Titular':i<23?'Convocado':'Pre-lista'}));
}
export function validateCareerState(career={}){
  const c = {...career};
  if(!Array.isArray(c.jobOffers)) c.jobOffers = [];
  if(!Array.isArray(c.offerHistory)) c.offerHistory = [];
  if(!Array.isArray(c.callUpSelection)) c.callUpSelection = defaultCallUpSelection();
  if(!Array.isArray(c.internationalCalendar)) c.internationalCalendar = buildInternationalCalendar(2026);
  if(!c.nationalTeamJob) c.nationalTeamJob = null;
  if(!c.dualCareer) c.dualCareer = {enabled:false, club:true, nationalTeam:null};
  return c;
}
