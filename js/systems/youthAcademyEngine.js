import { academyProfile, academyDepartments, youthProspects, scoutingRegions, academyEvents, academyPolicies } from '../data/youthAcademyData.js';

export function buildAcademySnapshot(state={}){
  const policyId = state.academy?.policy || state.ui?.academyPolicy || 'balanced';
  const policy = academyPolicies.find(p=>p.id===policyId) || academyPolicies[0];
  const boardTrust = Number(state.boardTrust || 72);
  const money = Number(state.money || 0);
  const financePressure = money < 10 ? 18 : money < 25 ? 8 : 0;
  const developmentIndex = Math.max(35, Math.min(99, Math.round((academyProfile.level + academyProfile.facilities + academyProfile.coaching + academyProfile.education - policy.risk - financePressure) / 3.2)));
  const promotionReady = youthProspects.filter(p=>p.readiness >= 60).length;
  const elitePotential = youthProspects.filter(p=>p.potential >= 82).length;
  const marketValue = youthProspects.reduce((sum,p)=>sum + Number(p.value || 0),0);
  const boardSignal = promotionReady >= 2 ? 'Diretoria satisfeita com a base' : boardTrust < 55 ? 'Diretoria cobra retorno rápido' : 'Monitoramento normal';
  return {
    profile: academyProfile,
    policy,
    departments: academyDepartments,
    prospects: youthProspects.map(p=>scoreProspect(p, policy)),
    regions: scoutingRegions.map(r=>scoreRegion(r, state)),
    events: academyEvents,
    developmentIndex,
    promotionReady,
    elitePotential,
    marketValue: Number(marketValue.toFixed(1)),
    boardSignal,
    alerts: buildAcademyAlerts(developmentIndex, promotionReady, policy, financePressure)
  };
}

export function scoreProspect(player, policy){
  const policyBoost = policy.id === 'aggressive' ? 5 : policy.id === 'elite' ? 3 : policy.id === 'sales' ? 1 : 2;
  const readiness = Math.max(1, Math.min(99, Number(player.readiness || 50) + policyBoost));
  const promotion = readiness >= 68 ? 'pronto para minutos' : readiness >= 58 ? 'relacionável' : 'desenvolvimento';
  const upside = Math.max(0, Number(player.potential||70) - Number(player.overall||50));
  const risk = policy.risk + (player.age <= 16 ? 8 : 0) - (player.personality === 'Disciplinado' ? 6 : 0);
  return {...player, readiness, promotion, upside, risk: Math.max(5, Math.min(85, risk))};
}

export function scoreRegion(region, state={}){
  const scouting = Number(state.staffImpact?.scouting || 0);
  const chance = Math.max(20, Math.min(95, Number(region.chance || 55) + Math.round(scouting/6)));
  const recommended = chance >= 68 && Number(region.cost || 0) <= 0.2;
  return {...region, chance, recommended};
}

export function buildAcademyAlerts(index, promotionReady, policy, financePressure){
  const alerts = [];
  if(index >= 75) alerts.push({level:'ok', title:'Base competitiva', text:'A estrutura já consegue abastecer o profissional com segurança.'});
  if(promotionReady < 2) alerts.push({level:'warn', title:'Poucos atletas prontos', text:'A comissão recomenda paciência ou rodagem por empréstimo.'});
  if(policy.risk >= 45) alerts.push({level:'danger', title:'Política agressiva', text:'Risco físico e mental aumentado nas promessas.'});
  if(financePressure > 0) alerts.push({level:'warn', title:'Caixa pressiona a base', text:'Diretoria pode exigir venda futura de promessa.'});
  if(!alerts.length) alerts.push({level:'ok', title:'Academia estável', text:'Nenhum bloqueio crítico detectado.'});
  return alerts;
}

export function exportAcademyTemplate(){
  return JSON.stringify({
    version: 'v3.8.0',
    instructions: 'Edite nomes, posicoes, overall, potencial e caminho de foto. O jogo usa fallback se a foto nao existir.',
    prospects: youthProspects
  }, null, 2);
}
