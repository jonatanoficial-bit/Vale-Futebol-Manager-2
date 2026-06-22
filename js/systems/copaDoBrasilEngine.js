import { teams } from '../data/gameData.js';
import { clubLogo } from './assets.js';

export const COPA_DO_BRASIL_ENGINE_VERSION = 'v4.1.0';

export const COPA_DO_BRASIL_RULES = {
  id: 'copa-do-brasil',
  name: 'Copa do Brasil 2026',
  season: 2026,
  participants: 64,
  championPrize: 92000000,
  championQualifiesTo: 'Libertadores',
  stages: [
    { id:'r64', name:'1ª fase', teams:64, ties:32, legs:1, date:'2026-02-18', prize:1500000, penaltyIfDraw:true },
    { id:'r32', name:'2ª fase', teams:32, ties:16, legs:1, date:'2026-03-05', prize:2100000, penaltyIfDraw:true },
    { id:'r16', name:'Oitavas de final', teams:16, ties:8, legs:2, date:'2026-05-07', prize:3300000, penaltyIfDraw:true },
    { id:'qf', name:'Quartas de final', teams:8, ties:4, legs:2, date:'2026-07-10', prize:4300000, penaltyIfDraw:true },
    { id:'sf', name:'Semifinal', teams:4, ties:2, legs:2, date:'2026-09-17', prize:9200000, penaltyIfDraw:true },
    { id:'final', name:'Final', teams:2, ties:1, legs:2, date:'2026-10-22', prize:31000000, runnerUpPrize:12500000, penaltyIfDraw:true }
  ],
  safety: {
    autoSeedMissingParticipants: true,
    preventDuplicateTie: true,
    preventClubTwiceSameStage: true,
    aggregateGuard: true,
    penaltyGuard: true,
    libertadoresSlotGuard: true
  }
};

const LOWER_DIVISION_PLACEHOLDERS = [
  ['amazonas-fc','Amazonas FC','Arena da Amazônia',68], ['remo','Remo','Baenão',67], ['paysandu','Paysandu','Curuzu',67],
  ['abc','ABC','Frasqueirão',64], ['america-rn','América-RN','Arena das Dunas',64], ['nautico','Náutico','Aflitos',66],
  ['santa-cruz','Santa Cruz','Arruda',65], ['botafogo-pb','Botafogo-PB','Almeidão',64], ['ferroviario','Ferroviário','Presidente Vargas',63],
  ['volta-redonda','Volta Redonda','Raulino de Oliveira',65], ['portuguesa','Portuguesa','Canindé',64], ['sao-bernardo','São Bernardo','Primeiro de Maio',65],
  ['caxias','Caxias','Centenário',63], ['brasil-pelotas','Brasil de Pelotas','Bento Freitas',63], ['londrina','Londrina','Estádio do Café',65],
  ['figueirense','Figueirense','Orlando Scarpelli',65], ['chapecoense','Chapecoense','Arena Condá',66], ['crb','CRB','Rei Pelé',67],
  ['csa','CSA','Rei Pelé',65], ['sampaio-correa','Sampaio Corrêa','Castelão-MA',64], ['ypiranga-rs','Ypiranga-RS','Colosso da Lagoa',63],
  ['operario-pr','Operário-PR','Germano Krüger',66], ['novorizontino','Novorizontino','Jorge Ismael de Biasi',68], ['mirassol','Mirassol','Maião',69]
];

function stableHash(s=''){
  let h=0; for(const ch of String(s)) h=((h<<5)-h)+ch.charCodeAt(0)|0; return Math.abs(h);
}
function dateAdd(date, days){
  const d = new Date(`${date}T12:00:00`); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10);
}
function normalizeTeam(t){
  return { id:t.id, name:t.name, level:Number(t.level||62), stadium:t.stadium||'Estádio', leagueId:t.leagueId||'estadual', country:t.country||'br', logo:clubLogo(t.id) };
}
export function copaParticipants(){
  const existing = teams.filter(t=>t.country==='br').map(normalizeTeam);
  const byId = new Map(existing.map(t=>[t.id,t]));
  LOWER_DIVISION_PLACEHOLDERS.forEach(([id,name,stadium,level])=>{ if(!byId.has(id)) byId.set(id,{id,name,stadium,level,country:'br',leagueId:'copa-seeded',logo:clubLogo(id)}); });
  const sorted = Array.from(byId.values()).sort((a,b)=>(b.level-a.level)||a.name.localeCompare(b.name));
  let idx = 1;
  while(sorted.length < COPA_DO_BRASIL_RULES.participants){
    sorted.push({ id:`copa-estadual-${idx}`, name:`Classificado Estadual ${idx}`, level:58+(idx%9), stadium:'Estádio Estadual', country:'br', leagueId:'estadual', logo:clubLogo('generic') });
    idx++;
  }
  return sorted.slice(0, COPA_DO_BRASIL_RULES.participants);
}
function scoreFor(team, opponent, seed, home=false){
  const raw = (stableHash(`${seed}-${team.id}`)%100)/100;
  const diff = (Number(team.level||62)-Number(opponent.level||62))/20;
  const expected = 1.05 + diff + (home?.22:0) + raw*.9;
  return Math.max(0, Math.min(5, Math.round(expected + (raw>.82?1:0) - (raw<.16?1:0))));
}
function penalties(a,b,seed){
  const aRaw = stableHash(`${seed}-${a.id}-pen`)%3;
  const bRaw = stableHash(`${seed}-${b.id}-pen`)%3;
  let aPen = 3+aRaw;
  let bPen = 3+bRaw;
  if(aPen===bPen) aPen += stableHash(`${seed}-sudden-${a.id}`)%2 ? 1 : 0, bPen += aPen===bPen ? 1 : 0;
  return { aPen, bPen, winner:aPen>bPen?a:b };
}
function createTie(stage, tieIndex, a, b){
  const legs = [];
  for(let leg=1; leg<=stage.legs; leg++){
    const home = leg===1 ? a : b;
    const away = leg===1 ? b : a;
    const date = dateAdd(stage.date, leg===1 ? tieIndex%4 : 7+(tieIndex%4));
    const seed = `${stage.id}-${tieIndex}-leg-${leg}-${home.id}-${away.id}`;
    const homeGoals = scoreFor(home, away, seed, true);
    const awayGoals = scoreFor(away, home, seed, false);
    legs.push({ id:`cdb-${stage.id}-${tieIndex}-l${leg}`, date, leg, home:home.id, away:away.id, homeName:home.name, awayName:away.name, homeGoals, awayGoals, summary:`${homeGoals} x ${awayGoals}`, venue:home.stadium });
  }
  const aGoals = legs.reduce((sum,l)=>sum + (l.home===a.id?l.homeGoals:l.awayGoals),0);
  const bGoals = legs.reduce((sum,l)=>sum + (l.home===b.id?l.homeGoals:l.awayGoals),0);
  let winner = aGoals>bGoals ? a : bGoals>aGoals ? b : null;
  let penalty = null;
  if(!winner && stage.penaltyIfDraw){ penalty = penalties(a,b,`${stage.id}-${tieIndex}`); winner = penalty.winner; }
  return { id:`cdb-${stage.id}-${tieIndex}`, stageId:stage.id, stageName:stage.name, a, b, legs, aggregate:`${aGoals} x ${bGoals}`, aGoals, bGoals, penalty, winner, prize:stage.prize };
}
export function buildCopaDoBrasilBracket(){
  let pool = copaParticipants();
  const stages = [];
  COPA_DO_BRASIL_RULES.stages.forEach(stage=>{
    const stageTeams = pool.slice(0, stage.teams);
    const high = stageTeams.slice(0, stage.ties);
    const low = stageTeams.slice(stage.ties, stage.ties*2).reverse();
    const ties = high.map((a,i)=>createTie(stage, i+1, a, low[i] || stageTeams[stageTeams.length-1-i] || high[i]));
    stages.push({...stage, ties});
    pool = ties.map(t=>t.winner).sort((a,b)=>(b.level-a.level)||a.name.localeCompare(b.name));
  });
  const finalStage = stages[stages.length-1];
  const champion = finalStage?.ties?.[0]?.winner || pool[0] || copaParticipants()[0];
  return { rules:COPA_DO_BRASIL_RULES, stages, champion, libertadoresQualified:{ id:champion.id, name:champion.name, source:'Campeão da Copa do Brasil 2026', destination:'Libertadores' } };
}
export function validateCopaDoBrasilIntegrity(bracket=buildCopaDoBrasilBracket()){
  const errors=[]; const warnings=[];
  const participants = copaParticipants();
  const participantIds = new Set(participants.map(p=>p.id));
  if(participants.length !== COPA_DO_BRASIL_RULES.participants) errors.push(`Esperado ${COPA_DO_BRASIL_RULES.participants} participantes, encontrado ${participants.length}.`);
  if(participantIds.size !== participants.length) errors.push('Participantes duplicados na lista inicial da Copa do Brasil.');
  COPA_DO_BRASIL_RULES.stages.forEach((rule,idx)=>{
    const stage = bracket.stages[idx];
    if(!stage) { errors.push(`Fase ausente: ${rule.name}.`); return; }
    if(stage.ties.length !== rule.ties) errors.push(`${rule.name}: esperado ${rule.ties} confrontos, encontrado ${stage.ties.length}.`);
    const seen = new Set();
    stage.ties.forEach(tie=>{
      if(!tie.a?.id || !tie.b?.id || tie.a.id===tie.b.id) errors.push(`${rule.name}: confronto inválido ${tie.id}.`);
      [tie.a.id,tie.b.id].forEach(id=>{ if(seen.has(id)) errors.push(`${rule.name}: clube repetido na fase (${id}).`); seen.add(id); });
      if(tie.legs.length !== rule.legs) errors.push(`${rule.name}: ${tie.id} deveria ter ${rule.legs} perna(s).`);
      if(!tie.winner?.id) errors.push(`${rule.name}: ${tie.id} sem vencedor.`);
      if(tie.aGoals===tie.bGoals && rule.penaltyIfDraw && !tie.penalty) errors.push(`${rule.name}: empate agregado sem pênaltis em ${tie.id}.`);
    });
  });
  if(!bracket.champion?.id) errors.push('Campeão da Copa do Brasil não registrado.');
  if(!bracket.libertadoresQualified?.id) errors.push('Vaga do campeão na Libertadores não registrada.');
  if(!errors.length) warnings.push('Copa do Brasil validada: sorteio, fases, agregado, pênaltis e vaga continental protegidos.');
  return { version:COPA_DO_BRASIL_ENGINE_VERSION, status:errors.length?'error':'ok', errors, warnings, participants:participants.length, stages:bracket.stages.length, champion:bracket.champion?.name, libertadoresQualified:bracket.libertadoresQualified };
}
export function copaDoBrasilSnapshot(state={}){
  const bracket = buildCopaDoBrasilBracket();
  const validation = validateCopaDoBrasilIntegrity(bracket);
  const clubId = state.clubId || state.ui?.selectedClub || 'santos';
  const clubPath = bracket.stages.map(stage=>{
    const tie = stage.ties.find(t=>t.a.id===clubId || t.b.id===clubId);
    return tie ? { stage:stage.name, opponent:tie.a.id===clubId?tie.b:tie.a, aggregate:tie.aggregate, winner:tie.winner, alive:tie.winner.id===clubId, legs:tie.legs } : null;
  }).filter(Boolean);
  const nextUserTie = clubPath.find(p=>p.alive) || clubPath[clubPath.length-1] || null;
  return { bracket, validation, clubPath, nextUserTie, rules:COPA_DO_BRASIL_RULES };
}
