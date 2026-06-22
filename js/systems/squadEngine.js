import { formations, tacticalProfiles } from '../data/tacticsData.js';

const POSITION_GROUPS = {
  GK:['GOL','GK'],
  DC:['ZAG','DC','CB'], DL:['LE','DL','LB','ALA'], DR:['LD','DR','RB','ALA'], DMC:['VOL','DMC','MC'],
  MC:['MC','VOL','MEI','DMC'], AMC:['MEI','AMC','MC'], AML:['PE','MEI','PD','ATA'], AMR:['PD','MEI','PE','ATA'],
  LM:['LE','PE','ALA','MC'], RM:['LD','PD','ALA','MC'], LW:['PE','PD','ATA'], RW:['PD','PE','ATA'], ST:['ATA','PE','PD']
};
const ROLE_LABELS = {GK:'Goleiro',DC:'Zagueiro',DL:'Lateral esq.',DR:'Lateral dir.',DMC:'Volante',MC:'Meia',AMC:'Meia ofensivo',AML:'Meia/ponta esq.',AMR:'Meia/ponta dir.',LM:'Ala esq.',RM:'Ala dir.',LW:'Ponta esq.',RW:'Ponta dir.',ST:'Centroavante'};

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n)||0)); }
export function roleLabel(role){ return ROLE_LABELS[role] || role || 'Posição'; }
export function positionScore(player={}, slot={}){
  const p = String(player.pos || '').toUpperCase();
  const allowed = POSITION_GROUPS[slot.role] || [slot.role];
  if(allowed.includes(p)) return 100;
  const sector = {GOL:'gk',GK:'gk',ZAG:'def',DC:'def',LE:'def',LD:'def',VOL:'mid',MC:'mid',MEI:'mid',PE:'att',PD:'att',ATA:'att'}[p] || 'mid';
  const want = ['GK'].includes(slot.role) ? 'gk' : ['DC','DL','DR'].includes(slot.role) ? 'def' : ['DMC','MC','AMC','AML','AMR','LM','RM'].includes(slot.role) ? 'mid' : 'att';
  if(sector === want) return 72;
  if((sector === 'mid' && want !== 'gk') || (want === 'mid' && sector !== 'gk')) return 55;
  return 28;
}
export function playerReadiness(player={}){
  const fitness = clamp(player.fitness ?? 85);
  const morale = clamp(player.morale ?? 70);
  const form = clamp(player.form ?? 70);
  const injuryPenalty = player.injury ? 30 : 0;
  const suspendPenalty = player.suspended ? 45 : 0;
  return clamp(Math.round((fitness*0.42)+(morale*0.23)+(form*0.25)+(Number(player.overall||65)*0.10)-injuryPenalty-suspendPenalty));
}
export function playerMatchScore(player={}, slot={}){
  const pos = positionScore(player, slot);
  const ready = playerReadiness(player);
  const overall = clamp(player.overall || 65, 40, 99);
  const potential = clamp(player.potential || overall, 40, 99);
  const age = Number(player.age || 24);
  const ageBonus = age < 20 ? -2 : age > 33 ? -1 : 2;
  return Math.round((overall*0.54)+(ready*0.24)+(pos*0.18)+(potential*0.04)+ageBonus);
}
export function buildBestLineup(players=[], formationId='433-possession'){
  const formation = formations.find(f=>f.id===formationId) || formations[0];
  const available = (Array.isArray(players) ? players : []).map((p,i)=>({...p,_index:i}));
  const used = new Set();
  const starters = formation.slots.map(slot=>{
    let best = null;
    for(const p of available){
      if(used.has(p.id)) continue;
      const score = playerMatchScore(p, slot);
      if(!best || score > best.score) best = {player:p, slot, score, compatibility:positionScore(p, slot), readiness:playerReadiness(p)};
    }
    if(best) used.add(best.player.id);
    return best || {player:{id:`empty-${slot.role}`, name:'Vaga aberta', pos:slot.role, overall:0, fitness:0, morale:0, form:0}, slot, score:0, compatibility:0, readiness:0};
  });
  const bench = available.filter(p=>!used.has(p.id)).sort((a,b)=>playerMatchScore(b,{role:b.pos})-playerMatchScore(a,{role:a.pos})).slice(0,12);
  return {formation, starters, bench};
}
export function evaluateTactic(players=[], formationId='433-possession', profileId='possession'){
  const lineup = buildBestLineup(players, formationId);
  const profile = tacticalProfiles[profileId] || tacticalProfiles.possession;
  const avg = arr => Math.round(arr.reduce((s,x)=>s+x,0)/Math.max(1,arr.length));
  const ratings = lineup.starters.map(s=>s.score);
  const fit = avg(lineup.starters.map(s=>s.compatibility));
  const readiness = avg(lineup.starters.map(s=>s.readiness));
  const fatigueRisk = clamp(100-readiness + Math.round((profile.tempo + profile.press)/12));
  const chemistry = clamp(Math.round((lineup.formation.chemistry||75)*0.55 + fit*0.30 + readiness*0.15));
  const attack = clamp(avg(ratings) + (lineup.formation.attackBonus||0) + Math.round((profile.tempo + profile.directness)/18) - Math.round(fatigueRisk/18));
  const defense = clamp(avg(ratings) + (lineup.formation.defenseBonus||0) + Math.round((100-profile.risk + 100-profile.line)/22) - Math.round(fatigueRisk/20));
  const control = clamp(Math.round((profile.passing + profile.width + fit)/3));
  const risk = clamp(Math.round((profile.risk*0.55) + (fatigueRisk*0.30) + ((100-fit)*0.15)));
  return {lineup, fit, readiness, fatigueRisk, chemistry, attack, defense, control, risk, grade:Math.round((attack+defense+control+chemistry-risk*0.35)/3.65)};
}
export function squadAlerts(players=[], formationId='433-possession'){
  const report = evaluateTactic(players, formationId);
  const alerts = [];
  const lowFit = report.lineup.starters.filter(s=>s.compatibility < 75);
  const tired = report.lineup.starters.filter(s=>s.readiness < 68);
  const contracts = players.filter(p=>Number(p.contract||0)<=12).slice(0,4);
  if(lowFit.length) alerts.push({type:'position', title:'Improvisações no onze', detail:`${lowFit.length} titular(es) fora da função ideal.`, level:Math.min(95, 55+lowFit.length*10)});
  if(tired.length) alerts.push({type:'fitness', title:'Risco físico', detail:`${tired.length} atleta(s) pedem rotação antes da partida.`, level:Math.min(95, 50+tired.length*9)});
  if(contracts.length) alerts.push({type:'contract', title:'Contratos sensíveis', detail:`${contracts.length} atleta(s) com menos de 12 meses.`, level:74});
  if(report.risk > 65) alerts.push({type:'tactical', title:'Plano arriscado', detail:'Perfil tático gera alta exposição e desgaste.', level:report.risk});
  if(!alerts.length) alerts.push({type:'ok', title:'Elenco estável', detail:'Escalação, moral, forma e contratos em faixa segura.', level:38});
  return alerts;
}
export function recommendedCaptain(players=[]){
  return [...players].sort((a,b)=>(Number(b.overall||0)+Number(b.age||0)*0.35+Number(b.morale||0)*0.25)-(Number(a.overall||0)+Number(a.age||0)*0.35+Number(a.morale||0)*0.25))[0];
}
export function recommendedSetPieceTakers(players=[]){
  const sorted = [...players].sort((a,b)=>(Number(b.overall||0)+Number(b.form||0)*0.35+Number(b.morale||0)*0.2)-(Number(a.overall||0)+Number(a.form||0)*0.35+Number(a.morale||0)*0.2));
  return {penalty:sorted[0], freeKick:sorted.find(p=>['MEI','PE','PD','ATA','MC'].includes(String(p.pos).toUpperCase()))||sorted[0], corner:sorted.find(p=>['MEI','PE','PD','MC'].includes(String(p.pos).toUpperCase()))||sorted[1]||sorted[0]};
}
export function applySafeRotation(players=[]){
  return (Array.isArray(players)?players:[]).map(p=>{
    const tired = Number(p.fitness||85) < 72;
    const moraleBoost = Number(p.morale||70) < 60 ? 2 : 0;
    return {...p, fitness:clamp(Number(p.fitness||85)+(tired?8:2)), morale:clamp(Number(p.morale||70)+moraleBoost), form:clamp(Number(p.form||70)+(tired?0:1))};
  });
}
