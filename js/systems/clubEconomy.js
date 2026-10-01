export const FACILITIES={
  stadium:{name:'Estádio',icon:'trophy',base:2400000,days:35,benefit:'Mais receita por partida em casa',color:'#e8bb5b'},
  training:{name:'Centro de treinamento',icon:'tactics',base:950000,days:21,benefit:'Acelera o desenvolvimento nos treinos',color:'#8d9dff'},
  youth:{name:'Academia de base',icon:'squad',base:700000,days:28,benefit:'Melhora a próxima geração de jovens',color:'#58e2a4'},
  medical:{name:'Departamento médico',icon:'plus',base:800000,days:18,benefit:'Melhora recuperação física e prevenção',color:'#ff8899'},
  scouting:{name:'Rede de observação',icon:'globe',base:550000,days:14,benefit:'Amplia a variedade de atletas encontrados',color:'#55c5ff'},
  commercial:{name:'Centro comercial',icon:'club',base:1100000,days:24,benefit:'Aumenta receitas comerciais e patrocínios',color:'#dc79e7'}
};
const day=86400000;
const finite=(n,fallback=0)=>Number.isFinite(Number(n))?Number(n):fallback;
const clamp=(n,min,max)=>Math.min(max,Math.max(min,finite(n,min)));
const monthKey=date=>new Date(date).toISOString().slice(0,7);
export const payroll=c=>(c.roster||[]).reduce((sum,p)=>sum+Math.max(0,finite(p.salary))*1000,0);
export function ensureEconomy(c){
  c.ledger??=[];c.messages??=[];c.construction??=[];c.transferOffers??=[];
  c.economy??={lastMonth:monthKey(c.date),history:[]};
  c.economy.history??=[];
  return c;
}
export function monthlyCosts(c){return {wages:Math.round(payroll(c)),maintenance:Math.round(Object.values(c.facilities||{}).reduce((s,n)=>s+finite(n)*22000,0)),staff:Math.round(Object.values(c.staff||{}).reduce((s,n)=>s+finite(n)*350,0))};}
export function commercialRevenue(c){return Math.round(Math.max(180000,(finite(c.club?.rating,65)-45)*20000)*(1+(finite(c.facilities?.commercial,2)-1)*.15));}
export function financeForecast(c){
  const costs=monthlyCosts(c),expenses=Object.values(costs).reduce((s,n)=>s+n,0),recurring=commercialRevenue(c);
  const end=new Date(c.date).getTime()+90*day;
  const installments=(c.transferObligations||[]).reduce((sum,o)=>{
    const due=new Date(o.nextDue).getTime();
    const count=Number.isFinite(due)?Math.max(0,Math.min(finite(o.remainingInstallments),Math.floor((end-due)/(30*day))+1)):0;
    return sum+Math.min(finite(o.remainingBalance),count*finite(o.installmentAmount));
  },0);
  return {...costs,expenses,recurring,monthlyNet:recurring-expenses,installments,projected:finite(c.budget)+(recurring-expenses)*3-installments};
}
function entry(c,date,label,amount){c.budget=finite(c.budget)+amount;c.ledger.push({date,label,amount,type:amount>=0?'income':'expense'});}
export function processEconomy(c){
  ensureEconomy(c);const target=monthKey(c.date),completed=[];
  let cursor=new Date(c.economy.lastMonth+'-01T12:00:00Z');
  while(monthKey(cursor)<target){
    cursor.setUTCMonth(cursor.getUTCMonth()+1);const key=monthKey(cursor),date=cursor.toISOString(),costs=monthlyCosts(c),income=commercialRevenue(c);
    entry(c,date,'Receita comercial · '+key,income);
    for(const [id,label] of [['wages','Folha salarial'],['maintenance','Manutenção das instalações'],['staff','Comissão técnica']])entry(c,date,label+' · '+key,-costs[id]);
    c.economy.history.push({month:key,income,...costs,net:income-Object.values(costs).reduce((s,n)=>s+n,0)});
    c.economy.history=c.economy.history.slice(-24);c.economy.lastMonth=key;
  }
  c.construction=c.construction.filter(project=>{
    if(new Date(project.finishAt)>new Date(c.date))return true;
    c.facilities[project.id]=project.level;completed.push(project.id);
    c.messages.push({id:'construction-'+project.id+'-'+project.finishAt,from:'Diretoria de infraestrutura',subject:FACILITIES[project.id].name+' entregue',body:'Nível '+project.level+' em operação. '+FACILITIES[project.id].benefit+'.',date:c.date,read:false,priority:'normal'});return false;
  });
  c.transferOffers=c.transferOffers.filter(o=>new Date(o.expiresAt)>=new Date(c.date));
  return {completed};
}
export function facilityQuote(c,id){
  const spec=FACILITIES[id];if(!spec)return null;
  const level=finite(c.facilities[id],1);
  return {...spec,id,level:level+1,cost:Math.round(spec.base*level*1.35),duration:spec.days+level*7,maintenance:22000};
}
export function startConstruction(c,id){
  ensureEconomy(c);const q=facilityQuote(c,id);
  if(!q||q.level>5)return {error:'Esta instalação já está no nível máximo.'};
  if(c.construction.some(p=>p.id===id))return {error:'Esta instalação já está em obras.'};
  if(c.budget<q.cost)return {error:'Saldo insuficiente para iniciar a obra.'};
  const project={id,level:q.level,cost:q.cost,startedAt:c.date,finishAt:new Date(new Date(c.date).getTime()+q.duration*day).toISOString()};
  entry(c,c.date,'Obra · '+q.name+' · nível '+q.level,-q.cost);c.construction.push(project);return {project};
}
export function marketValue(p,date){
  const age=finite(p.age,24),ageFactor=age<=23?1.15:age>=33?.70:age>=30?.85:1;
  const potential=1+clamp((finite(p.potential)-finite(p.overall))*.018,0,.35);
  const remaining=(new Date(p.contractUntil)-new Date(date))/day;
  const contract=remaining<0?.55:remaining<180?.7:remaining<365?.85:1;
  const form=1+(clamp(p.form??70,0,100)-70)*.003;
  return Math.max(50000,Math.round(Math.max(.05,finite(p.value,1))*1000000*ageFactor*potential*contract*form/1000)*1000);
}
export function validateDeal(c,p,{fee,salary,years=1,signing=0,installments=1,releaseClause=0,renewal=false}){
  if(![fee,salary,years,signing,installments,releaseClause].every(Number.isFinite)||fee<0||salary<1000||signing<0||releaseClause<0||!Number.isInteger(years)||years<1||years>5||![1,2,3].includes(installments))return 'Condições inválidas. Revise os valores da proposta.';
  if(!renewal&&(c.roster.some(item=>item.id===p.id)||c.roster.length>=c.transferPolicy.maxSquad))return 'Sem vaga no elenco ou jogador já contratado.';
  if(payroll(c)+salary-(renewal?finite(p.salary)*1000:0)>c.transferPolicy.wageBudget)return 'A proposta ultrapassa o limite da folha salarial.';
  if(c.budget<Math.ceil(fee/installments)+Math.round(fee*.05)+signing)return 'Saldo insuficiente para entrada, luvas e comissão.';
  return null;
}
export function createSaleOffer(c,p,buyer){
  ensureEconomy(c);
  if(!p||p.onLoan)return {error:'Atletas emprestados não podem ser vendidos.'};
  const existing=c.transferOffers.find(o=>o.playerId===p.id);if(existing)return {offer:existing};
  const offer={id:'sale-'+p.id+'-'+c.date,playerId:p.id,playerName:p.name,buyer,fee:Math.round(marketValue(p,c.date)*.9),expiresAt:new Date(new Date(c.date).getTime()+14*day).toISOString()};
  c.transferOffers.push(offer);return {offer};
}
export function acceptSale(c,id){
  ensureEconomy(c);const offer=c.transferOffers.find(o=>o.id===id),p=c.roster.find(p=>p.id===offer?.playerId);
  if(!offer||!p||p.onLoan||new Date(offer.expiresAt)<new Date(c.date))return {error:'Proposta indisponível ou expirada.'};
  if(c.roster.length<=16)return {error:'Mantenha pelo menos 16 jogadores no elenco.'};
  if(p.pos==='GOL'&&c.roster.filter(p=>p.pos==='GOL').length<=2)return {error:'Mantenha pelo menos dois goleiros.'};
  entry(c,c.date,'Venda · '+p.name+' para '+offer.buyer,offer.fee);
  c.roster=c.roster.filter(item=>item.id!==p.id);c.lineupIds=c.lineupIds.filter(pid=>pid!==p.id);c.transferOffers=c.transferOffers.filter(o=>o.playerId!==p.id);return {offer};
}
