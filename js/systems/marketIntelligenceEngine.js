import { agentProfiles, clubMarketNeeds, marketEvents, marketVersion, playerMotivations, smartMarketTargets } from '../data/marketIntelligenceData.js';

function slug(name=''){
  return String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'item';
}
function needsForClub(clubId){ return clubMarketNeeds[clubId] || clubMarketNeeds.default || ['ATA','MEI','ZAG']; }
function agentFor(id){ return agentProfiles.find(a=>a.id===id) || agentProfiles[0]; }
function motivationFor(id){ return playerMotivations.find(m=>m.id===id) || playerMotivations[0]; }

export function getExpandedTargets(baseTargets=[]){
  const ids = new Set();
  return [...baseTargets, ...smartMarketTargets].filter(p=>{
    if(!p || !p.id || ids.has(p.id)) return false;
    ids.add(p.id);
    return true;
  });
}

export function evaluatePlayerFit(player={}, state={}){
  const clubId = state.clubId || state.ui?.selectedClub || 'santos';
  const needs = needsForClub(clubId);
  const rep = Number(state.manager?.reputation || 70);
  const budget = Number(state.transfer?.budget || 0);
  const wageRoom = Number(state.transfer?.wageRoom || 0);
  const agent = agentFor(player.agent || 'local_agent');
  const needBonus = needs.includes(player.pos) ? 18 : -4;
  const ageBonus = Number(player.age || 27) <= 23 ? 8 : Number(player.age||27) <= 29 ? 4 : -3;
  const value = Number(player.value || 0);
  const wage = Number(player.wage || 0.1) * Number(agent.wageMultiplier || 1.08);
  const budgetFit = value <= budget ? 12 : -22;
  const wageFit = wage <= wageRoom ? 10 : -18;
  const reputationFit = Math.max(-8, Math.min(16, Math.round((rep - 60) / 2.8)));
  const baseInterest = Number(player.interest || 55);
  const score = Math.max(1, Math.min(99, Math.round(baseInterest + needBonus + ageBonus + budgetFit + wageFit + reputationFit - Number(agent.pressure||50)/12)));
  const recommendation = score >= 78 ? 'Atacar agora' : score >= 60 ? 'Negociar com cautela' : score >= 42 ? 'Monitorar' : 'Evitar neste momento';
  return {score, recommendation, agent, motivation: motivationFor(player.motivation), wageDemand:Number(wage.toFixed(2)), need:needs.includes(player.pos), budgetFit:value<=budget, wageFit:wage<=wageRoom};
}

export function buildMarketIntelligence(state={}, targets=[]){
  const expanded = getExpandedTargets(targets).map(p=>({...p, intelligence:evaluatePlayerFit(p,state)})).sort((a,b)=>b.intelligence.score-a.intelligence.score);
  const budget = Number(state.transfer?.budget || 0);
  const wageRoom = Number(state.transfer?.wageRoom || 0);
  const needs = needsForClub(state.clubId || 'santos');
  const pressure = Math.max(0, Math.min(100, 100 - Number(state.transfer?.boardApproval || 82) + (state.transfer?.incomingOffers?.length || 0)*4));
  return {version:marketVersion, needs, budget, wageRoom, pressure, best:expanded[0], targets:expanded, rules:['fit tecnico','orçamento','folha','agente','motivacao','necessidade do elenco']};
}

export function createSmartIncomingOffer(state={}, outgoingList=[], aiClubProfiles=[]){
  const transfer = state.transfer || {};
  const day = Number(transfer.marketDay || 1);
  const player = outgoingList[day % Math.max(1,outgoingList.length)] || outgoingList[0] || {name:'Atleta negociavel', pos:'MEI', value:1, wage:0.1};
  const buyer = aiClubProfiles[(day + 2) % Math.max(1,aiClubProfiles.length)] || {name:'Clube interessado', country:'br', budget:20};
  const multiplier = 0.82 + ((day % 6) * 0.045) + (Number(buyer.budget || 20) > 50 ? 0.08 : 0);
  const value = Number((Number(player.value || 1) * multiplier).toFixed(1));
  const moraleRisk = value >= Number(player.value||1) * 1.05 ? 'Baixo' : 'Alto';
  return {id:`smart-${slug(player.name)}-${slug(buyer.name)}-${day}`, player:player.name, pos:player.pos, buyer:buyer.name, country:buyer.country || 'br', value, wageFree:Number(player.wage || 0.1), status:'Pendente', expiresIn:5 + (day % 5), moraleRisk, agentNote: moraleRisk==='Alto' ? 'Empresario pode reclamar se recusar valor baixo.' : 'Oferta dentro do valor de mercado.'};
}

export function createIntelligentAIDeal(state={}, targets=[], aiClubProfiles=[]){
  const allTargets = getExpandedTargets(targets);
  const day = Number(state.transfer?.marketDay || 1);
  const buyer = aiClubProfiles[(day + 1) % Math.max(1, aiClubProfiles.length)] || {name:'Clube comprador', country:'br', budget:30};
  const seller = aiClubProfiles[(day + 4) % Math.max(1, aiClubProfiles.length)] || {name:'Clube vendedor', country:'br'};
  const target = allTargets.sort((a,b)=>evaluatePlayerFit(b,state).score-evaluatePlayerFit(a,state).score)[day % Math.max(1, allTargets.length)] || allTargets[0];
  const fit = evaluatePlayerFit(target, state);
  const fee = Number((Number(target.value||1) * (0.92 + ((day%4)*0.06))).toFixed(1));
  return {id:`smart-ai-${slug(target.name)}-${Date.now()}`, player:target.name, from:seller.name, to:buyer.name, fee, type:Number(target.value||0)===0?'Livre':'Compra', date:state.career?.currentDate || '2026-05-20', reason:fit.recommendation, fit:fit.score};
}

export function nextAgentEvent(state={}){
  const index = (Number(state.transfer?.marketDay || 1) + (state.transfer?.agentEvents?.length || 0)) % marketEvents.length;
  const event = marketEvents[index];
  return {...event, id:`${event.id}-${Date.now()}`, date:state.career?.currentDate || '2026-05-20', status:'Ativo'};
}
