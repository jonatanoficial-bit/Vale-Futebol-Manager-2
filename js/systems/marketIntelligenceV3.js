export const MARKET_INTELLIGENCE_VERSION = '4.0.0';

const REGIONS = [
  ['south-america','América do Sul'],['europe','Europa'],['north-america','América do Norte'],['africa','África'],['asia','Ásia'],['oceania','Oceania']
];
const AGENCIES=['Atlas Sports','Ponto de Jogo','Prime Eleven','Orbe Football','Nexo Talentos','Vértice Agency'];
const DAY=86400000;
const hash = (value='') => { let n=2166136261; for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);} return n>>>0; };
const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||min));

export function scoutRegions(){ return REGIONS.map(([id,label])=>({id,label})); }

export function ensureMarketIntelligence(career={}) {
  career.scoutingNetwork ??= { focus:'south-america', regions:{} };
  career.scoutingNetwork.regions ??= {};
  REGIONS.forEach(([id])=>{career.scoutingNetwork.regions[id]=clamp(career.scoutingNetwork.regions[id]??(id==='south-america'?58:id==='europe'?48:22),1,100);});
  career.marketHistory=Array.isArray(career.marketHistory)?career.marketHistory.slice(-50):[];
  career.marketPressure=Array.isArray(career.marketPressure)?career.marketPressure.slice(-18):[];
  (career.roster||[]).forEach(player=>hydrateMarketProfile(player,career));
  return career.scoutingNetwork;
}

export function contractRisk(player={},career={}) {
  hydrateMarketProfile(player,career);
  const now=new Date(career.date||Date.now()).getTime(),contract=new Date(player.contractUntil||'').getTime(),days=Number.isFinite(contract)?Math.round((contract-now)/DAY):730,satisfaction=Number(player.contractSatisfaction||70),interest=Number(player.marketInterest||50),influence=Number(player.agentInfluence||55);
  const contractRisk=days<0?38:days<120?30:days<240?18:days<365?8:0,satisfactionRisk=Math.max(0,55-satisfaction)*1.15,interestRisk=Math.max(0,interest-52)*.72,agentRisk=Math.max(0,influence-65)*.28,risk=clamp(Math.round(contractRisk+satisfactionRisk+interestRisk+agentRisk),0,100);
  const level=risk>=72?'crítico':risk>=52?'alto':risk>=32?'atenção':'estável',reasons=[];
  if(days<240)reasons.push(days<0?'contrato vencido':'contrato perto do fim');
  if(satisfaction<48)reasons.push('insatisfação com o papel');
  if(interest>65)reasons.push('mercado atento');
  if(influence>78)reasons.push('agente pressiona por condições melhores');
  return {risk,level,days,reasons:reasons.length?reasons:['situação contratual controlada'],renewalPriority:risk>=52};
}

export function refreshMarketPressure(career={},week=0) {
  ensureMarketIntelligence(career);
  const previous=new Map((career.marketPressure||[]).map(item=>[item.playerId,item]));
  const entries=(career.roster||[]).map(player=>{const status=contractRisk(player,career);return {playerId:player.id,playerName:player.name,position:player.pos,risk:status.risk,level:status.level,reasons:status.reasons,renewalPriority:status.renewalPriority,lastWeek:Number(week)||0};}).filter(item=>item.risk>=32).sort((a,b)=>b.risk-a.risk).slice(0,18);
  const alerts=entries.filter(item=>{const old=previous.get(item.playerId);return item.risk>=52&&(!old||item.risk>=old.risk+12||old.level!==item.level);});
  career.marketPressure=entries;
  return {entries,alerts};
}

export function regionFor(player={}, club={}) {
  const direct=String(player.marketRegion||club.continent||'').toLowerCase();
  return REGIONS.some(([id])=>id===direct)?direct:'south-america';
}

export function hydrateMarketProfile(player={}, career={}, sourceClub={}) {
  const seed=hash(player.id||player.name||'player'), region=regionFor(player,sourceClub);
  const network=ensureNetworkOnly(career);
  const knowledge=clamp((network.regions?.[region]||30) + (seed%19)-9,12,99);
  player.marketRegion=region;
  player.agent=player.agent||AGENCIES[seed%AGENCIES.length];
  player.agentInfluence=clamp(player.agentInfluence??(42+seed%47),35,90);
  player.marketInterest=clamp(player.marketInterest??(35+(seed>>4)%55),20,95);
  player.contractSatisfaction=clamp(player.contractSatisfaction??(62+(seed>>9)%28),15,96);
  player.appearanceBonus=Math.round(Number(player.appearanceBonus??(1200+(seed%14)*350)));
  player.goalBonus=Math.round(Number(player.goalBonus??(1800+(seed%17)*420)));
  player.loyaltyBonus=Math.round(Number(player.loyaltyBonus??(9000+(seed%20)*1400)));
  player.releaseClause=Math.round(Number(player.releaseClause??Math.max(0,Number(player.value||1)*1000000*2.2)));
  player.knowledge=clamp(Math.max(Number(player.knowledge||0),knowledge),1,100);
  return player;
}

function ensureNetworkOnly(career={}) {
  career.scoutingNetwork ??={focus:'south-america',regions:{}};
  career.scoutingNetwork.regions ??={};
  REGIONS.forEach(([id])=>{career.scoutingNetwork.regions[id]=clamp(career.scoutingNetwork.regions[id]??(id==='south-america'?58:id==='europe'?48:22),1,100);});
  return career.scoutingNetwork;
}

export function scoutInvestment(career, region, amount=1) {
  const network=ensureNetworkOnly(career); if(!network.regions[region])return {error:'Região de scouting inválida.'};
  const levels=Math.max(1,Math.min(3,Number(amount)||1)), cost=levels*650000;
  if(Number(career.budget||0)<cost)return {error:'Saldo insuficiente para ampliar a observação regional.'};
  career.budget-=cost;network.focus=region;network.regions[region]=clamp(network.regions[region]+levels*7,1,100);
  career.marketHistory=(career.marketHistory||[]).concat({date:career.date,kind:'scouting',region,cost,knowledge:network.regions[region]}).slice(-50);
  return {cost,knowledge:network.regions[region]};
}

export function marketNegotiationProfile(player={}, career={}) {
  hydrateMarketProfile(player,career);
  const influence=Number(player.agentInfluence||55),satisfaction=Number(player.contractSatisfaction||70),interest=Number(player.marketInterest||55),risk=contractRisk(player,career);
  return {
    agentFeeRate:Math.round((.035+influence/2500)*1000)/1000,
    minimumSalaryMultiplier:Math.round((.86+influence/900-interest/2600)*100)/100,
    clubFlexibility:clamp(1-(satisfaction-50)/190,0.55,1.18),
    summary:`${player.agent} · influência ${influence}/100 · interesse ${interest}/100 · risco ${risk.level}`,
    contractRisk:risk
  };
}

export function applyContractMatchBonuses(career, match={}) {
  const ownIds=new Set([...(match.ownLineup||[]),...(match.substitutedOut||[])].map(player=>player.id)); let total=0,entries=[];
  Object.values(match.playerPerformance||{}).forEach(record=>{
    if(!ownIds.has(record.id))return;
    const player=(career.roster||[]).find(item=>item.id===record.id);if(!player)return;
    const fee=Math.max(0,Number(player.appearanceBonus||0)) + Math.max(0,Number(record.goals||0))*Math.max(0,Number(player.goalBonus||0));
    if(fee){total+=fee;entries.push(`${player.name}: ${fee}`);player.contractSatisfaction=clamp(Number(player.contractSatisfaction||70)+1,1,100);}
  });
  if(total){career.budget-=total;career.ledger?.push({date:career.date,label:'Bônus de desempenho contratual',amount:-total,type:'expense'});}
  return {total,entries};
}

export function updateContractMood(career,{result='draw',lineupIds=[]}={}) {
  const chosen=new Set(lineupIds);(career.roster||[]).forEach(player=>{
    const minutes=chosen.has(player.id); const resultShift=result==='win'?1:result==='loss'?-1:0;
    player.contractSatisfaction=clamp(Number(player.contractSatisfaction||70)+(minutes?1:-.8)+resultShift,1,100);
    if(!minutes&&Number(player.contractSatisfaction)<38)player.marketInterest=clamp(Number(player.marketInterest||50)+5,1,100);
  });
  return refreshMarketPressure(career,career.week);
}
