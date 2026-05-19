import { teams } from '../data/gameData.js';
import { revenueStreams, expenseStreams, boardMandates, sponsorMarket, crisisScenarios } from '../data/financeData.js';

function activeTeam(state={}){
  return teams.find(t=>t.id===(state.clubId || state.ui?.selectedClub)) || teams[0];
}
function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n)||0)); }
export function buildFinanceSnapshot(state={}){
  const team = activeTeam(state);
  const reputation = clamp(team.reputation || state.manager?.reputation || 70);
  const boardTrust = clamp(state.boardTrust || 70);
  const fanMood = clamp(state.fanMood || 70);
  const marketBudget = Number(state.transfer?.budget || team.budget || 30);
  const wageRoom = Number(state.transfer?.wageRoom || 1.5);
  const revenueMultiplier = (0.74 + reputation/180 + fanMood/360);
  const expenseMultiplier = 0.88 + (Number(team.level||70)/240);
  const revenues = revenueStreams.map(s=>({...s, value:Number((s.monthly*revenueMultiplier).toFixed(2))}));
  const expenses = expenseStreams.map(s=>({...s, value:Number((s.monthly*expenseMultiplier).toFixed(2))}));
  const monthlyRevenue = Number(revenues.reduce((a,b)=>a+b.value,0).toFixed(2));
  const monthlyExpense = Number(expenses.reduce((a,b)=>a+b.value,0).toFixed(2));
  const monthlyBalance = Number((monthlyRevenue-monthlyExpense).toFixed(2));
  const annualProjection = Number((monthlyBalance*12 + marketBudget*0.18).toFixed(2));
  const wagePressure = clamp(100 - wageRoom*18 + (monthlyExpense/monthlyRevenue)*35);
  const debtRisk = clamp(monthlyBalance < 0 ? 62 + Math.abs(monthlyBalance)*4 : 26 - monthlyBalance*1.4);
  const boardScore = clamp(boardTrust*0.45 + fanMood*0.22 + reputation*0.18 + (monthlyBalance>0?12:-10) + (wagePressure<70?6:-8));
  const transferLimit = Number(Math.max(0, marketBudget * (boardScore>70?1:boardScore>55?0.72:0.45)).toFixed(1));
  const health = boardScore>78 && debtRisk<35 ? 'Excelente' : boardScore>65 ? 'Estável' : boardScore>50 ? 'Atenção' : 'Crise';
  const activeCrisis = crisisScenarios.filter(c => (c.id==='cash-shortage' && monthlyBalance < 0) || (c.id==='wage-overload' && wagePressure>72) || (c.id==='board-warning' && boardScore<55) || (c.id==='forced-sale' && boardScore<42));
  const sponsorshipFit = sponsorMarket.map(s=>({
    ...s,
    available: reputation >= s.minRep,
    score: clamp(reputation - s.minRep + fanMood*0.25 + boardScore*0.18),
    projectedAnnual: Number((s.annual * (0.85 + reputation/220)).toFixed(1))
  }));
  return {team, revenues, expenses, monthlyRevenue, monthlyExpense, monthlyBalance, annualProjection, wagePressure, debtRisk, boardScore, transferLimit, health, activeCrisis, sponsorshipFit};
}
export function boardObjectiveStatus(state={}){
  const snap = buildFinanceSnapshot(state);
  return boardMandates.map(m=>{
    let score = snap.boardScore;
    if(m.id==='finance') score = 100 - snap.debtRisk;
    if(m.id==='market') score = 100 - snap.wagePressure + 20;
    if(m.id==='fans') score = clamp(state.fanMood || 70);
    if(m.id==='league') score = clamp((state.boardTrust||70) + (state.career?.lastResult?.points||0)*4);
    if(m.id==='academy') score = 62 + (snap.health==='Excelente'?16:0);
    return {...m, score:clamp(score), status: score>=75?'No caminho':score>=55?'Monitorar':'Risco'};
  });
}
export function financeEventFeed(state={}){
  const snap = buildFinanceSnapshot(state);
  const feed = [];
  feed.push({type:'board', title:'Relatório financeiro mensal', text:`Saldo mensal projetado: € ${snap.monthlyBalance}M. Saúde: ${snap.health}.`});
  feed.push({type:'sponsor', title:'Mercado de patrocínio', text:`Melhor proposta disponível: ${snap.sponsorshipFit.find(s=>s.available)?.name || 'sem proposta compatível'}.'`});
  if(snap.activeCrisis.length) snap.activeCrisis.forEach(c=>feed.push({type:'crisis', title:c.name, text:`Gatilho: ${c.trigger}. Ação sugerida: ${c.action}.`}));
  else feed.push({type:'stability', title:'Nenhuma crise ativa', text:'Diretoria mantém operação estável e autoriza planejamento esportivo.'});
  return feed;
}
