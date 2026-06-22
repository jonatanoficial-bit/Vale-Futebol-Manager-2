
import { teams } from '../data/gameData.js';
import { nationalTeams, callUpPool } from '../data/careerData.js';
import { managerLicenses, managerStyles, managerContractTemplates, boardReviewRules, careerMilestones } from '../data/managerCareerData.js';

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


export function currentLicenseForReputation(rep=42){
  const sorted = managerLicenses.slice().sort((a,b)=>b.minRep-a.minRep);
  return sorted.find(l=>Number(rep||0) >= l.minRep) || managerLicenses[0];
}
export function contractTemplateForScore(score=50){
  if(score >= 86) return managerContractTemplates[3];
  if(score >= 72) return managerContractTemplates[2];
  if(score >= 55) return managerContractTemplates[1];
  return managerContractTemplates[0];
}
export function jobSecurityReview(state={}){
  const rep = Number(state.manager?.reputation || 42);
  const board = Number(state.boardTrust || state.career?.boardRelationship || 68);
  const fans = Number(state.fanMood || state.career?.fanRelationship || 70);
  const dressing = Number(state.career?.dressingRoomTrust || 68);
  const last = state.career?.lastResult;
  const resultBias = last ? Number(last.points||0) === 3 ? 6 : Number(last.points||0) === 1 ? 1 : -7 : 0;
  const completed = Array.isArray(state.career?.completedMatches) ? state.career.completedMatches : [];
  const recent = completed.slice(-5);
  const recentPts = recent.reduce((a,m)=>a+Number(m.points||0),0);
  const recentBias = recent.length ? Math.round((recentPts/(recent.length*3))*18)-8 : 0;
  const score = clamp(Math.round(board*0.38 + fans*0.21 + dressing*0.17 + rep*0.12 + 12 + resultBias + recentBias),0,100);
  const rule = boardReviewRules.find(r=>score>=r.min) || boardReviewRules[boardReviewRules.length-1];
  return {score, label:rule.label, decision:rule.decision, risk:clamp(100-score), resultBias, recentPts, recentMatches:recent.length};
}
export function defaultManagerCareerProfile(state={}){
  const rep = Number(state.manager?.reputation || 42);
  const license = currentLicenseForReputation(rep);
  const score = careerScore(state);
  const contract = contractTemplateForScore(score);
  return {
    version:'v4.4.0',
    style: state.ui?.tacticalProfile || 'possession',
    licenseId: license.id,
    licenseName: license.name,
    reputation: rep,
    salaryMonthly: contract.wage,
    contractLengthMonths: contract.lengthMonths,
    contractRemainingMonths: Math.max(1, contract.lengthMonths-1),
    releaseClause: contract.releaseClause,
    bonusTarget: contract.bonus,
    contractLevel: contract.level,
    objective: contract.objective,
    signedAt: state.career?.currentDate || '2026-05-19',
    status:'Ativo',
    trophies:0,
    clubsManaged:1,
    nationalTeamsManaged: state.career?.nationalTeamJob ? 1 : 0
  };
}
export function buildManagerCareerSnapshot(state={}){
  const profile = {...defaultManagerCareerProfile(state), ...(state.career?.managerProfile || {})};
  const rep = Number(state.manager?.reputation || profile.reputation || 42);
  const license = currentLicenseForReputation(rep);
  const style = managerStyles.find(s=>s.id===profile.style) || managerStyles[0];
  const security = jobSecurityReview(state);
  const completed = state.career?.completedMatches || [];
  const wins = completed.filter(m=>Number(m.points||0)===3).length;
  const draws = completed.filter(m=>Number(m.points||0)===1).length;
  const losses = completed.filter(m=>Number(m.points||0)===0).length;
  const winRate = completed.length ? Math.round((wins/completed.length)*100) : 0;
  const timeline = Array.isArray(state.career?.managerTimeline) ? state.career.managerTimeline.slice(-8).reverse() : [];
  const milestones = careerMilestones.map(m=>({...m, unlocked:(state.career?.unlockedMilestones||[]).includes(m.id)}));
  const contract = state.career?.activeContract || {
    clubId:state.clubId || 'santos',
    role:'Treinador principal',
    signedAt:profile.signedAt,
    remainingMonths:profile.contractRemainingMonths,
    wageMonthly:profile.salaryMonthly,
    releaseClause:profile.releaseClause,
    bonusTarget:profile.bonusTarget,
    objective:profile.objective,
    status:profile.status
  };
  return {
    profile:{...profile, reputation:rep, licenseName:license.name, licenseId:license.id, styleName:style.name},
    style,
    security,
    contract,
    record:{matches:completed.length, wins, draws, losses, winRate},
    relationships:{board:Number(state.boardTrust||state.career?.boardRelationship||68), fans:Number(state.fanMood||state.career?.fanRelationship||70), dressing:Number(state.career?.dressingRoomTrust||68), media:Number(state.career?.mediaPressure||54)},
    timeline,
    milestones,
    titleHistory:Array.isArray(state.career?.titleHistory) ? state.career.titleHistory : [],
    contractHistory:Array.isArray(state.career?.contractHistory) ? state.career.contractHistory : []
  };
}
export function validateManagerCareerState(career={}, state={}){
  const c = {...career};
  if(!c.managerProfile) c.managerProfile = defaultManagerCareerProfile({...state, career:c});
  if(!c.activeContract){
    const p = c.managerProfile;
    c.activeContract = {clubId:state.clubId||'santos', role:'Treinador principal', signedAt:p.signedAt||'2026-05-19', remainingMonths:Number(p.contractRemainingMonths||24), wageMonthly:Number(p.salaryMonthly||0.9), releaseClause:Number(p.releaseClause||5.8), bonusTarget:p.bonusTarget||'G-6', objective:p.objective||'campanha competitiva', status:'Ativo'};
  }
  if(!Array.isArray(c.contractHistory)) c.contractHistory = [];
  if(!Array.isArray(c.titleHistory)) c.titleHistory = [];
  if(!Array.isArray(c.sackRiskLog)) c.sackRiskLog = [];
  if(!Array.isArray(c.managerTimeline)) c.managerTimeline = [{date:c.currentDate||'2026-05-19', title:'Contrato inicial validado', text:'Perfil do treinador migrado para carreira profissional v4.4.0.'}];
  if(!Array.isArray(c.unlockedMilestones)) c.unlockedMilestones = [];
  c.boardRelationship = clamp(c.boardRelationship ?? state.boardTrust ?? 68);
  c.fanRelationship = clamp(c.fanRelationship ?? state.fanMood ?? 70);
  c.dressingRoomTrust = clamp(c.dressingRoomTrust ?? 68);
  c.mediaPressure = clamp(c.mediaPressure ?? 54);
  return c;
}
