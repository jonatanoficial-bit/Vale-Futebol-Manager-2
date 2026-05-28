import { nationalTeams, callUpPool } from '../data/careerData.js';

export const NATIONAL_TEAM_ENGINE_VERSION = 'v4.5.0';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n||0))); }
function slug(text=''){ return String(text).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'item'; }
function stableHash(text=''){
  let h=2166136261;
  for(const ch of String(text)){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return Math.abs(h>>>0);
}
const opponents = {
  brasil:['Argentina','Uruguai','Colômbia','Chile','Paraguai','Peru','Equador','Bolívia','Venezuela'],
  argentina:['Brasil','Uruguai','Colômbia','Chile','Peru','Equador','Paraguai','Bolívia','Venezuela'],
  uruguai:['Brasil','Argentina','Colômbia','Chile','Paraguai','Peru','Equador'],
  colombia:['Brasil','Argentina','Uruguai','Chile','Equador','Peru','Paraguai'],
  chile:['Brasil','Argentina','Uruguai','Colômbia','Peru','Equador','Paraguai'],
  usa:['México','Canadá','Costa Rica','Jamaica','Panamá','Honduras']
};
const competitionPlan = [
  {month:'Março', type:'data-fifa', title:'Data FIFA de março', phase:'Amistosos e observação', weight:0.45},
  {month:'Junho', type:'eliminatorias', title:'Eliminatórias continentais', phase:'Rodada dupla', weight:0.72},
  {month:'Julho', type:'copa-america', title:'Copa América', phase:'Fase de grupos', weight:0.86},
  {month:'Setembro', type:'data-fifa', title:'Data FIFA de setembro', phase:'Ajustes táticos', weight:0.52},
  {month:'Novembro', type:'eliminatorias', title:'Eliminatórias continentais', phase:'Rodada decisiva', weight:0.78},
  {month:'Junho', type:'world-cup', title:'Copa do Mundo', phase:'Ciclo mundial', weight:1.00, plusYears:4}
];
export function buildNationalCalendar(year=2026, teamId='brasil'){
  const pool = opponents[teamId] || opponents.brasil;
  return competitionPlan.map((item,idx)=>{
    const eventYear = Number(year||2026) + Number(item.plusYears||0);
    const opponent = pool[idx % pool.length];
    const day = [24,10,4,8,16,12][idx] || 12;
    const monthNum = item.month === 'Março' ? '03' : item.month === 'Junho' ? '06' : item.month === 'Julho' ? '07' : item.month === 'Setembro' ? '09' : '11';
    return { id:`${eventYear}-${teamId}-${item.type}-${idx+1}`, date:`${eventYear}-${monthNum}-${String(day).padStart(2,'0')}`, type:item.type, title:item.title, phase:item.phase, opponent, month:item.month, importance:Math.round(item.weight*100), played:false, result:null };
  });
}
export function safeCallUpPool(selection){
  const source = Array.isArray(selection) && selection.length ? selection : callUpPool;
  const expanded = Array.from({length:26}, (_,i)=>{
    const base = source[i % source.length] || {name:'Atleta Nacional', pos:'MEI', club:'Liga Nacional', overall:75, form:75};
    const suffix = i >= source.length ? ` ${Math.floor(i/source.length)+1}` : '';
    return { id:base.id || slug(`${base.name}-${i+1}`), name:`${base.name}${suffix}`, pos:base.pos || 'MEI', club:base.club || 'Clube nacional', overall:clamp(base.overall||75,50,99), form:clamp(base.form||75,40,100), selected: typeof base.selected === 'boolean' ? base.selected : i<23, role: base.role || (i<11?'Titular':i<23?'Convocado':'Pré-lista'), status:base.status || 'Monitorado' };
  });
  const selected = expanded.filter(p=>p.selected).length;
  if(selected < 11) expanded.slice(0,11).forEach(p=>p.selected=true);
  if(selected > 26) expanded.slice(26).forEach(p=>p.selected=false);
  return expanded;
}
export function getNationalTeamMeta(teamId='brasil'){
  return nationalTeams.find(t=>t.id===teamId) || nationalTeams[0];
}
export function buildNationalTeamSnapshot(state={}){
  const job = state.career?.nationalTeamJob || null;
  const teamId = job?.id || 'brasil';
  const meta = getNationalTeamMeta(teamId);
  const calendar = Array.isArray(state.career?.internationalCalendar) && state.career.internationalCalendar.length ? state.career.internationalCalendar : buildNationalCalendar(Number(state.season||2026), teamId);
  const callUps = safeCallUpPool(state.career?.callUpSelection);
  const selected = callUps.filter(p=>p.selected);
  const nextEvent = calendar.find(e=>!e.played) || calendar[calendar.length-1] || null;
  const dual = state.career?.dualCareer || {enabled:false, club:true, nationalTeam:null};
  const played = calendar.filter(e=>e.played);
  const wins = played.filter(e=>e.result?.points===3).length;
  const draws = played.filter(e=>e.result?.points===1).length;
  const losses = played.filter(e=>e.result?.points===0).length;
  const rankingScore = clamp(Math.round((meta.level||80)*0.64 + selected.reduce((a,p)=>a+Number(p.overall||70),0)/Math.max(1,selected.length)*0.26 + wins*3 + draws - losses*2),1,100);
  return {version:NATIONAL_TEAM_ENGINE_VERSION, active:!!job, job, meta, teamId, calendar, callUps, selected, selectedCount:selected.length, nextEvent, dualCareer:{enabled:!!dual.enabled, club:dual.club!==false, nationalTeam:dual.nationalTeam || job?.id || null}, record:{played:played.length,wins,draws,losses}, rankingScore, readiness:clamp(Math.round(selected.reduce((a,p)=>a+Number(p.form||70),0)/Math.max(1,selected.length)),0,100)};
}
export function validateNationalTeamCycle(snapshot={}){
  const errors=[], warnings=[];
  if(!snapshot.version) errors.push('Snapshot de seleção sem versão.');
  if(snapshot.active && !snapshot.job?.id) errors.push('Carreira dupla ativa sem seleção identificada.');
  if(snapshot.active && snapshot.dualCareer?.club === false) errors.push('Carreira dupla perdeu vínculo com clube.');
  if(!Array.isArray(snapshot.calendar) || snapshot.calendar.length < 5) errors.push('Calendário internacional insuficiente.');
  if(!Array.isArray(snapshot.callUps) || snapshot.callUps.length < 11) errors.push('Pool de convocação com menos de 11 atletas.');
  if(snapshot.selectedCount < 11) errors.push('Convocação final com menos de 11 atletas.');
  if(snapshot.selectedCount > 26) errors.push('Convocação final acima de 26 atletas.');
  if(!snapshot.calendar?.some(e=>e.type==='eliminatorias')) warnings.push('Calendário sem eliminatórias; usando rota segura.');
  if(!snapshot.calendar?.some(e=>e.type==='copa-america')) warnings.push('Calendário sem Copa América; usando rota segura.');
  if(!snapshot.calendar?.some(e=>e.type==='world-cup')) warnings.push('Calendário sem Copa do Mundo; usando rota segura.');
  return {version:NATIONAL_TEAM_ENGINE_VERSION, status:errors.length?'error':'ok', errors, warnings, selectedCount:snapshot.selectedCount||0, events:snapshot.calendar?.length||0};
}
export function simulateNationalFixture(state={}){
  const snap = buildNationalTeamSnapshot(state);
  if(!snap.active || !snap.nextEvent) return {ok:false, reason:'Sem seleção ativa ou calendário concluído.', snapshot:snap};
  const seed = stableHash(`${snap.teamId}-${snap.nextEvent.id}-${snap.selectedCount}-${snap.readiness}`);
  const teamPower = Number(snap.meta.level||80) + (snap.readiness-70)*0.18 + (snap.selectedCount>=23?2:0);
  const oppPower = 70 + (stableHash(snap.nextEvent.opponent)%22);
  const homeGoals = Math.max(0, Math.min(5, Math.round(1 + (teamPower-oppPower)/18 + (seed%100)/80)));
  const awayGoals = Math.max(0, Math.min(5, Math.round(1 + (oppPower-teamPower)/20 + ((seed/100)%100)/110)));
  const points = homeGoals>awayGoals ? 3 : homeGoals===awayGoals ? 1 : 0;
  const result = { homeGoals, awayGoals, points, opponent:snap.nextEvent.opponent, label:`${snap.meta.name} ${homeGoals} x ${awayGoals} ${snap.nextEvent.opponent}` };
  const calendar = snap.calendar.map(e=>e.id===snap.nextEvent.id ? {...e, played:true, result} : e);
  return {ok:true, result, event:{...snap.nextEvent, result, played:true}, calendar, snapshot:snap};
}
