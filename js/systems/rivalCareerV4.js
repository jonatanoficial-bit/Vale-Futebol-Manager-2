/** Persistent rival squads, coaches, planning, negotiation pressure and transfer windows. */
export const RIVAL_CAREER_VERSION='10.0.0';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number(value)||0));
const hash=value=>{let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;};
const styles=['posse e construção','transição vertical','pressão alta','bloco compacto','jogo pelas pontas'];
const ambitions=['sobrevivência','consolidação','vaga continental','disputa de título'];
const positions=['GOL','ZAG','LD','LE','VOL','MC','MEI','PD','PE','ATA'];
const valueOf=player=>Math.max(250000,Number(player?.value||1)*1000000);
const playerIdentity=(player={},fallbackOwner='free-agents')=>String(player.marketIdentity||player.rivalId||`${player.sourceClubId||fallbackOwner}:${player.basePlayerId||player.id||player.name||'player'}`);
const afterDays=(date,days)=>new Date(new Date(date||Date.now()).getTime()+Number(days||0)*86400000).toISOString();
const COACH_BLUEPRINTS={
  'posse e construção':{label:'Posse paciente',formation:'4-3-3',mentality:'Equilibrada',pressure:57,tempo:49,width:62,defensiveLine:58,passing:'Curto',marking:'Zona',transition:'Equilibrada'},
  'transição vertical':{label:'Transição vertical',formation:'4-4-2',mentality:'Equilibrada',pressure:48,tempo:70,width:59,defensiveLine:45,passing:'Direto',marking:'Zona',transition:'Contra-atacar'},
  'pressão alta':{label:'Pressão agressiva',formation:'4-2-3-1',mentality:'Ofensiva',pressure:75,tempo:68,width:58,defensiveLine:68,passing:'Misto',marking:'Híbrida',transition:'Contra-atacar'},
  'bloco compacto':{label:'Bloco compacto',formation:'3-5-2',mentality:'Defensiva',pressure:43,tempo:50,width:52,defensiveLine:41,passing:'Misto',marking:'Zona',transition:'Reagrupar'},
  'jogo pelas pontas':{label:'Amplitude e cruzamentos',formation:'4-3-3',mentality:'Ofensiva',pressure:61,tempo:62,width:76,defensiveLine:56,passing:'Misto',marking:'Híbrida',transition:'Equilibrada'}
};

function defaultSeasonPlan(club={},season=2026){
  const budget=Math.max(2_000_000,Number(club.budget)||4_000_000),rating=Number(club.rating)||60,priorities=Array.isArray(club.needs)&&club.needs.length?club.needs:positions.slice(hash(`${season}:${club.id}:plan`)%positions.length).concat(['MC']).slice(0,2),ambition=rating>=80?'disputa de título':rating>=70?'vaga continental':'consolidação';
  return {season:Number(season)||2026,direction:'manutenção',objective:ambition,spendingLimit:Math.round(budget*.22),wageCap:Math.round(budget*.17),mustSell:false,priorityPositions:priorities.slice(0,3),boardPatience:Math.round(54+rating*.28),summary:'Manter a base e corrigir carências pontuais.'};
}

function seasonPlanFor(club={},summary={},season=2027){
  const rank=Number(summary.rank)||0,total=Math.max(1,Number(summary.total)||20),form=Number(summary.form)||50,poorFinish=rank>=Math.max(1,total-2)||form<35,eliteFinish=rank>0&&rank<=Math.max(1,Math.ceil(total*.2)),budget=Math.max(2_000_000,Number(club.budget)||2_000_000),lowCash=budget<4_500_000,boardPatience=clamp(Number(club.boardPatience||65)+(eliteFinish?16:poorFinish?-28:form>=52?4:-7),12,96),mustSell=lowCash||boardPatience<31||Boolean(poorFinish&&(hash(`${season}:${club.id}:sale`)%100)<54),direction=mustSell?'reconstrução':eliteFinish?'ataque ao título':form>=50?'crescimento':'correção de rota',objective=mustSell?'equilibrar caixa e reduzir folha':eliteFinish?'disputar o topo e manter titulares':'subir rendimento e cobrir carências',priorityPositions=(club.needs||positions.slice(hash(`${season}:${club.id}:needs`)%positions.length).concat(['MC'])).slice(0,3),spendingMultiplier=mustSell?.08:eliteFinish?.31:direction==='crescimento'?.24:.15,summaryText=mustSell?'Venda necessária antes de investir.':eliteFinish?'Investimento para manter a disputa pelo título.':direction==='crescimento'?'Reforços seletivos para evoluir.':'Elenco em revisão e contratações pontuais.';
  return {season:Number(season)||2027,direction,objective,spendingLimit:Math.round(budget*spendingMultiplier),wageCap:Math.round(budget*(mustSell?.11:eliteFinish?.22:.16)),mustSell,priorityPositions,boardPatience,summary:summaryText};
}

function profile(club={},season=2026){
  const key=`${season}:${club.id}`,rating=Number(club.rating)||65,budget=Math.round(Math.max(4_000_000,(rating-50)**2*18_000));
  const seeded={id:club.id,name:club.name,leagueId:club.leagueId,rating,budget,wageRoom:Math.round(budget*.16),squadDepth:20+(hash(key)%8),squadAge:23+(hash(key+':age')%9),style:styles[hash(key)%styles.length],managerTenure:1+(hash(key+':coach')%5),managerStyle:styles[hash(key+':manager')%styles.length],ambition:ambitions[clamp(Math.floor((rating-55)/10),0,ambitions.length-1)],transferAggression:42+(hash(key+':aggression')%49),needs:positions.filter((_,index)=>(hash(key+index)%4)===0).slice(0,3),in:[],out:[],seasonForm:0,boardPatience:Math.round(54+rating*.28)};
  return {...seeded,seasonPlan:defaultSeasonPlan(seeded,season)};
}

function mergeProfile(club,previous,season){
  const seeded=profile(club,season),saved=previous||{};
  return {...seeded,...saved,needs:Array.isArray(saved.needs)?saved.needs:seeded.needs,in:Array.isArray(saved.in)?saved.in.slice(0,18):[],out:Array.isArray(saved.out)?saved.out.slice(0,18):[],seasonPlan:{...seeded.seasonPlan,...(saved.seasonPlan||{})}};
}

export function transferWindow(date,club={}){
  const value=new Date(date||'2026-07-01T12:00:00Z'),month=value.getUTCMonth()+1,continent=String(club?.continent||'').toLowerCase(),south=continent==='south-america'||club?.countryId==='brazil';
  const active=south?[1,2,3,7,8,9].includes(month):[1,2,6,7,8,9].includes(month),label=south?(month<=3?'Janela inicial sul-americana':'Janela de meio de temporada'):(month<=2?'Janela de inverno':'Janela de verão');
  return {active,label,month};
}

export function ensureRivalCareer(career={},catalog={}){
  const current=career.rivalWorld||{},clubs=Array.isArray(catalog.clubs)?catalog.clubs:[],clubsState={...(current.clubs||{})};
  clubs.forEach(club=>{clubsState[club.id]=mergeProfile(club,clubsState[club.id],career.season);});
  career.rivalWorld={version:RIVAL_CAREER_VERSION,season:Number(career.season)||2026,clubs:clubsState,players:{...(current.players||{})},moves:Array.isArray(current.moves)?current.moves.slice(-220):[],news:Array.isArray(current.news)?current.news.slice(-100):[],negotiations:Array.isArray(current.negotiations)?current.negotiations.slice(-80):[],windows:Array.isArray(current.windows)?current.windows.slice(-24):[],loans:Array.isArray(current.loans)?current.loans.slice(-100):[],contractEvents:Array.isArray(current.contractEvents)?current.contractEvents.slice(-80):[],managerChanges:Array.isArray(current.managerChanges)?current.managerChanges.slice(-80):[],seasonPlans:Array.isArray(current.seasonPlans)?current.seasonPlans.slice(-80):[],lastWeek:Number(current.lastWeek)||0};
  career.transferTalks=Array.isArray(career.transferTalks)?career.transferTalks.slice(-50):[];
  return career.rivalWorld;
}

function playerSnapshot(player={},ownerId,career={}){
  const contractYear=Number(String(player.contractUntil||'').slice(0,4)),months=Number(player.contractMonths||player.contract||0),fallbackEnd=(Number(career.season)||2026)+(months?Math.max(1,Math.ceil(months/12)):2);
  return {id:playerIdentity(player,ownerId),basePlayerId:String(player.basePlayerId||player.id||''),name:player.name||'Jogador monitorado',pos:player.pos||'MC',overall:Number(player.overall)||60,potential:Number(player.potential||player.overall)||60,age:Number(player.age)||24,salary:Number(player.salary)||35,value:Number(player.value)||1,nationality:player.nationality||'',foot:player.foot||'',height:Number(player.height)||0,personality:player.personality||'Profissional',attributes:player.attributes||{},contractUntil:player.contractUntil||'',contractEndSeason:Number.isFinite(contractYear)&&contractYear>2000?contractYear:fallbackEnd,originClubId:player.originClubId||player.sourceClubId||ownerId||null,ownerId:ownerId||null,freeAgent:!ownerId,lastMoveSeason:Number(career.season)||2026};
}

function trackedPlayer(world,player,ownerId,career){
  const id=playerIdentity(player,ownerId),existing=world.players[id],snapshot=playerSnapshot(player,ownerId,career);
  world.players[id]=existing?{...snapshot,...existing,id,basePlayerId:snapshot.basePlayerId||existing.basePlayerId,name:snapshot.name||existing.name,pos:snapshot.pos||existing.pos,overall:snapshot.overall||existing.overall,potential:snapshot.potential||existing.potential,age:snapshot.age||existing.age,value:snapshot.value||existing.value}:snapshot;
  return world.players[id];
}

export function registerRivalPlayers(career={},catalog={},players=[],fallbackOwner){
  const world=ensureRivalCareer(career,catalog);
  (players||[]).forEach(player=>{const ownerId=player.sourceClubId||fallbackOwner;if(!ownerId)return;const record=trackedPlayer(world,player,ownerId,career);if(!record.originClubId)record.originClubId=ownerId;});
  return world;
}

export function rivalMarketCandidates(career={},catalog={},candidateClubIds=[]){
  const world=ensureRivalCareer(career,catalog),clubs=new Map((catalog.clubs||[]).map(club=>[club.id,club])),candidates=new Set(candidateClubIds),userId=career.club?.id;
  return Object.values(world.players||{}).filter(player=>player.ownerId!==userId&&(!player.ownerId||((player.ownerId!==player.originClubId)&&candidates.has(player.ownerId)))).sort((a,b)=>b.overall-a.overall||a.age-b.age).slice(0,18).map(player=>{const club=clubs.get(player.ownerId),freeAgent=!player.ownerId;return {...player,id:player.id,marketIdentity:player.id,sourceClubId:player.ownerId||'free-agents',sourceClub:freeAgent?'Agente livre':club?.name||'Clube rival',marketRegion:club?.continent||'south-america',freeAgent};});
}

export function reconcileRivalRoster(career={},catalog={},club={},roster=[]){
  const clubId=club.id;
  const base=(roster||[]).map(player=>{const identity=playerIdentity(player,clubId);return {...player,id:identity,marketIdentity:identity,basePlayerId:player.basePlayerId||player.id,sourceClubId:clubId,sourceClub:club.name};});
  const world=registerRivalPlayers(career,catalog,base,clubId);
  const current=new Date(career.date||Date.now()).getTime(),loanActive=player=>Boolean(player.loanClubId)&&new Date(player.loanUntil||0).getTime()>current;
  const retained=base.filter(player=>{const record=world.players[player.marketIdentity||player.id];return !record||(record.ownerId===clubId&&!loanActive(record));});
  const arrivals=Object.values(world.players||{}).filter(player=>(player.ownerId===clubId&&player.originClubId!==clubId)||loanActive(player)&&player.loanClubId===clubId).map(player=>({...player,id:player.id,marketIdentity:player.id,sourceClubId:clubId,sourceClub:club.name,marketRegion:club.continent||'south-america',freeAgent:false,loanedIn:player.loanClubId===clubId}));
  const byId=new Map();[...retained,...arrivals].forEach(player=>{if(!byId.has(player.id))byId.set(player.id,player);});
  return [...byId.values()].slice(0,40);
}

export function rivalCoachProfile(career={},catalog={},club={}){
  const world=ensureRivalCareer(career,catalog),rival=world.clubs?.[club.id],style=rival?.managerStyle||rival?.style||'posse e construção',blueprint=COACH_BLUEPRINTS[style]||COACH_BLUEPRINTS['posse e construção'],tenure=Math.max(1,Number(rival?.managerTenure)||1),rating=Number(rival?.rating||club.rating||65),form=Number(rival?.seasonForm||50);
  return {...blueprint,id:`coach:${club.id||'rival'}:${tenure}`,name:'Comissão técnica de '+(club.name||rival?.name||'rival'),managerStyle:style,managerTenure:tenure,rating:clamp(rating,45,96),adaptability:clamp(42+tenure*5+form*.16,45,92)};
}

export function recordUserTransfer(career={},catalog={},player={}){
  const world=ensureRivalCareer(career,catalog),record=trackedPlayer(world,player,player.sourceClubId,career),from=record.ownerId;
  record.ownerId=career.club?.id||'user';record.ownerName=career.club?.name||'Seu clube';record.freeAgent=false;record.lastMoveSeason=career.season;record.lastMoveWeek=career.week;
  return {record,from};
}

export function loanTerms(career={},player={},proposal={}){
  const durationDays=[180,360].includes(Number(proposal.durationDays))?Number(proposal.durationDays):180,wageShare=clamp(Number(proposal.wageShare??70),50,100),value=valueOf(player),interest=Number(player.marketInterest||50),feeRate=durationDays===360?.095:.06,fee=Math.max(75000,Math.round(value*feeRate/1000)*1000),optionMultiplier=interest>=72?1.06:interest<=42?.88:.96,optionFee=Math.max(250000,Math.round(value*optionMultiplier/1000)*1000),monthlySalary=Math.max(1000,Math.round(Number(player.salary||10)*1000*wageShare/100));
  return {durationDays,wageShare,fee,optionFee,monthlySalary,loanUntil:new Date(new Date(career.date||Date.now()).getTime()+durationDays*86400000).toISOString(),mandatory:false};
}

export function recordUserLoan(career={},catalog={},player={},terms={}){
  const world=ensureRivalCareer(career,catalog),record=trackedPlayer(world,player,player.sourceClubId,career),sourceId=record.ownerId||player.sourceClubId,userId=career.club?.id||'user',id=`loan-${career.season}-${career.week||0}-${record.id}-${userId}`,existing=world.loans.find(loan=>loan.id===id&&loan.status==='active');if(existing)return existing;
  const agreement={id,playerId:record.id,player:record.name,fromId:sourceId,from:record.ownerName||player.sourceClub||'Clube de origem',toId:userId,to:career.club?.name||'Seu clube',fee:Number(terms.fee)||0,wageShare:Number(terms.wageShare)||70,optionFee:Number(terms.optionFee)||0,endsAt:terms.loanUntil,status:'active',season:career.season,week:Number(career.week)||0};
  record.loanClubId=userId;record.loanClubName=agreement.to;record.loanUntil=agreement.endsAt;record.loanOptionFee=agreement.optionFee;record.loanWageShare=agreement.wageShare;record.loanAgreementId=id;world.loans.unshift(agreement);world.loans=world.loans.slice(0,100);world.news.unshift({week:agreement.week,season:career.season,text:agreement.to+' recebe '+record.name+' por empréstimo até '+String(agreement.endsAt).slice(0,10)+'.'});world.news=world.news.slice(0,100);return agreement;
}

export function completeLoanPurchase(career={},catalog={},player={},fee=0){
  const world=ensureRivalCareer(career,catalog),id=playerIdentity(player,player.sourceClubId),record=world.players[id]||trackedPlayer(world,player,player.sourceClubId,career),agreement=world.loans.find(loan=>loan.playerId===record.id&&loan.status==='active'),buyerId=career.club?.id||'user',seller=world.clubs[record.ownerId],buyer=world.clubs[buyerId],amount=Math.max(0,Number(fee||agreement?.optionFee||record.loanOptionFee||0)),moveId=`loan-buy-${career.season}-${career.week||0}-${record.id}`;
  record.ownerId=buyerId;record.ownerName=career.club?.name||'Seu clube';record.freeAgent=false;record.lastMoveSeason=career.season;record.lastMoveWeek=career.week;delete record.loanClubId;delete record.loanClubName;delete record.loanUntil;delete record.loanOptionFee;delete record.loanWageShare;delete record.loanAgreementId;
  if(agreement){agreement.status='comprado';agreement.completedAt=career.date;agreement.purchaseFee=amount;}
  const move={id:moveId,week:Number(career.week)||0,season:career.season,player:record.name,position:record.pos,from:seller?.name||player.sourceClub||'Clube vendedor',to:career.club?.name||'Seu clube',fee:amount,status:'concluído',reason:'opção de compra exercida',kind:'loan-option'};
  if(!world.moves.some(item=>item.id===moveId)){world.moves.unshift(move);world.moves=world.moves.slice(0,220);if(seller){seller.budget+=amount;seller.squadDepth=Math.max(16,Number(seller.squadDepth)-1);seller.out.unshift(move);}if(buyer){buyer.budget=Math.max(0,Number(buyer.budget)-amount);buyer.squadDepth=Math.min(34,Number(buyer.squadDepth)+1);buyer.in.unshift(move);}world.news.unshift({week:move.week,season:career.season,text:move.to+' exerceu a opção de compra por '+move.player+'.'});world.news=world.news.slice(0,100);}
  return {record,agreement,move};
}

export function resolveRivalLoans(career={},catalog={}){
  const world=ensureRivalCareer(career,catalog),now=new Date(career.date||Date.now()).getTime(),ended=[];
  Object.values(world.players||{}).forEach(record=>{if(!record.loanClubId||new Date(record.loanUntil||0).getTime()>now)return;const agreement=world.loans.find(loan=>loan.playerId===record.id&&loan.status==='active');if(agreement){agreement.status='encerrado';agreement.completedAt=career.date;}ended.push({player:record.name,from:record.ownerName||'Clube de origem',to:record.loanClubName||'Clube de destino'});delete record.loanClubId;delete record.loanClubName;delete record.loanUntil;delete record.loanOptionFee;delete record.loanWageShare;delete record.loanAgreementId;});
  if(ended.length){world.news.unshift({season:career.season,text:ended.map(item=>item.player).join(', ')+' retornou de empréstimo.'});world.news=world.news.slice(0,100);}return {world,ended};
}

function talkMessage(career,talk,subject,body,priority='normal'){
  career.messages??=[];career.messages.push({id:`talk-${talk.id}-${talk.status}-${Date.now()}`,from:'Diretor de futebol',subject,body,date:career.date||new Date().toISOString(),read:false,priority});career.messages=career.messages.slice(-160);
}

export function openTransferTalk(career={},catalog={},player={},proposal={}){
  ensureRivalCareer(career,catalog);const active=['pending','countered','accepted'],identity=playerIdentity(player,player.sourceClubId),current=(career.transferTalks||[]).find(talk=>talk.playerId===identity&&active.includes(talk.status));
  if(current?.status==='pending')return {talk:current,unchanged:true};
  const offer={fee:Math.max(0,Number(proposal.fee)||0),salary:Math.max(0,Number(proposal.salary)||0),years:Number(proposal.years)||4,signing:Math.max(0,Number(proposal.signing)||0),installments:Number(proposal.installments)||1,releaseClause:Math.max(0,Number(proposal.releaseClause)||0),appearanceBonus:Math.max(0,Number(proposal.appearanceBonus)||0),goalBonus:Math.max(0,Number(proposal.goalBonus)||0),agentFeeRate:Number(proposal.agentFeeRate)||.05,asking:Math.max(0,Number(proposal.asking)||0),expectedSalary:Math.max(1000,Number(proposal.expectedSalary)||Math.max(1000,Number(player.salary||10)*1000))};
  const id=current?.id||`talk-${career.season}-${career.week||0}-${identity}`,talk={...(current||{}),id,playerId:identity,player:{...player,id:identity,marketIdentity:identity},playerName:player.name,sourceClubId:player.sourceClubId,sourceClub:player.sourceClub||'Clube vendedor',offer,status:'pending',round:Number(current?.round||0)+1,submittedAt:career.date,responseAt:afterDays(career.date,current?2:3),expiresAt:null,counter:null,history:[...(current?.history||[]),{round:Number(current?.round||0)+1,status:'enviada',at:career.date,fee:offer.fee,salary:offer.salary}]};
  career.transferTalks=(career.transferTalks||[]).filter(item=>item.id!==id);career.transferTalks.unshift(talk);career.transferTalks=career.transferTalks.slice(0,50);talkMessage(career,talk,'Proposta enviada: '+talk.playerName,'A proposta foi enviada a '+talk.sourceClub+'. Resposta prevista até '+String(talk.responseAt).slice(0,10)+'.');return {talk,unchanged:false};
}

export function resolveTransferTalks(career={},catalog={}){
  ensureRivalCareer(career,catalog);const now=new Date(career.date||Date.now()).getTime(),results=[];
  (career.transferTalks||[]).forEach(talk=>{
    if(talk.status==='pending'&&new Date(talk.responseAt||0).getTime()<=now){
      const offer=talk.offer||{},asking=Math.max(0,Number(offer.asking)||0),expected=Math.max(1000,Number(offer.expectedSalary)||Math.max(1000,Number(talk.player?.salary||10)*1000));
      if(asking>0&&Number(offer.fee||0)<asking*.9){
        talk.status='countered';talk.counter={...offer,fee:Math.max(Math.round(asking*1.02),Math.round(Number(offer.fee||0)*1.1)),salary:Math.max(expected,Number(offer.salary||0))};talk.expiresAt=afterDays(career.date,7);talk.history=[...(talk.history||[]),{status:'contraproposta',at:career.date,fee:talk.counter.fee,salary:talk.counter.salary}];talkMessage(career,talk,'Contraproposta: '+talk.playerName,talk.sourceClub+' pede '+talk.counter.fee+' pela transferência. A resposta expira em '+String(talk.expiresAt).slice(0,10)+'.','high');results.push({talk,status:talk.status});return;
      }
      if(Number(offer.salary||0)<expected*.88){
        talk.status='countered';talk.counter={...offer,fee:Number(offer.fee)||0,salary:expected};talk.expiresAt=afterDays(career.date,7);talk.history=[...(talk.history||[]),{status:'contraproposta',at:career.date,fee:talk.counter.fee,salary:talk.counter.salary}];talkMessage(career,talk,'Exigência do agente: '+talk.playerName,'O agente pede salário mensal de '+expected+'. A resposta expira em '+String(talk.expiresAt).slice(0,10)+'.','high');results.push({talk,status:talk.status});return;
      }
      const competition=transferCompetition(career,catalog,talk.player,{fee:offer.fee,salary:offer.salary,expectedSalary:expected});
      if(!competition.playerWins){const move=recordRivalTransfer(career,catalog,talk.player,competition);talk.status='lost';talk.winner=move?.to||competition.best?.name||'Um rival';talk.history=[...(talk.history||[]),{status:'perdida',at:career.date,winner:talk.winner}];talkMessage(career,talk,'Negociação perdida: '+talk.playerName,talk.winner+' superou sua proposta. O atleta saiu do mercado.','high');results.push({talk,status:talk.status,move});return;}
      talk.status='accepted';talk.expiresAt=afterDays(career.date,7);talk.history=[...(talk.history||[]),{status:'aceita',at:career.date,fee:offer.fee,salary:offer.salary}];talkMessage(career,talk,'Proposta aceita: '+talk.playerName,talk.sourceClub+' aceitou os termos. Assine até '+String(talk.expiresAt).slice(0,10)+' para concluir a contratação.','high');results.push({talk,status:talk.status});return;
    }
    if(['countered','accepted'].includes(talk.status)&&new Date(talk.expiresAt||0).getTime()<=now){talk.status='expired';talk.history=[...(talk.history||[]),{status:'expirada',at:career.date}];talkMessage(career,talk,'Negociação encerrada: '+talk.playerName,'O prazo de resposta terminou e a negociação foi encerrada.');results.push({talk,status:talk.status});}
  });
  return results;
}

export function withdrawTransferTalk(career={},talkId=''){
  const talk=(career.transferTalks||[]).find(item=>item.id===talkId);if(!talk||!['pending','countered','accepted'].includes(talk.status))return null;
  talk.status='withdrawn';talk.withdrawnAt=career.date;talk.history=[...(talk.history||[]),{status:'retirada',at:career.date}];talkMessage(career,talk,'Proposta retirada: '+talk.playerName,'A negociação foi encerrada a seu pedido.');return talk;
}

function priorityScore(club,player,seed){const needed=(club.needs||[]).includes(player.pos)?22:0,ageFit=player.age<=27?8:player.age<=31?4:0;return needed+ageFit+Number(club.transferAggression||50)*.4+Number(club.rating||60)*.3+(hash(`${seed}:${club.id}:${player.id}`)%18);}

export function transferCompetition(career={},catalog={},player={},proposal={}){
  const world=ensureRivalCareer(career,catalog),sourceId=String(player.sourceClubId||''),targetValue=valueOf(player),fee=Math.max(0,Number(proposal.fee)||0),salary=Math.max(0,Number(proposal.salary)||0),expected=Math.max(1000,Number(proposal.expectedSalary)||Math.round(Number(player.salary||10)*1000));
  const candidates=Object.values(world.clubs).filter(club=>club.id!==career.club?.id&&club.id!==sourceId&&!club.seasonPlan?.mustSell&&Number(club.budget||0)>=targetValue*.25).map(club=>({club,priority:priorityScore(club,player,career.season)})).sort((a,b)=>b.priority-a.priority||b.club.budget-a.club.budget).slice(0,3);
  const rivals=candidates.map(({club,priority})=>{const plan=club.seasonPlan||defaultSeasonPlan(club,career.season),feeFactor=.91+(hash(`${career.season}:${player.id}:${club.id}:fee`)%26)/100,salaryFactor=.93+(hash(`${career.season}:${player.id}:${club.id}:salary`)%25)/100,rivalFee=Math.round(Math.min(Number(club.budget)*.19,Number(plan.spendingLimit||Number(club.budget)*.19),Math.max(targetValue*.78,Math.min(targetValue*1.35,targetValue*feeFactor)))/1000)*1000,rivalSalary=Math.round(expected*salaryFactor/1000)*1000,score=(rivalFee/targetValue)*48+(rivalSalary/expected)*26+Number(club.rating)*.18+priority*.34;return {id:club.id,name:club.name,fee:rivalFee,salary:rivalSalary,score:Math.round(score*10)/10,reason:(plan.priorityPositions||club.needs||[]).includes(player.pos)?'posição prioritária':plan.direction||club.ambition||'profundidade de elenco'};});
  const ownScore=(fee/targetValue)*48+(salary/expected)*26+Number(career.club?.rating||60)*.18+(Number(player.marketInterest||50)-50)*.08,best=rivals.slice().sort((a,b)=>b.score-a.score)[0]||null,playerWins=!best||ownScore>=best.score+1.5;
  return {playerWins,ownScore:Math.round(ownScore*10)/10,rivals,best,pressure:best?clamp(Math.round((best.score-ownScore+12)*5),5,100):0};
}

export function recordRivalTransfer(career={},catalog={},player={},competition={}){
  if(competition.playerWins||!competition.best)return null;
  const world=ensureRivalCareer(career,catalog),buyer=world.clubs[competition.best.id],seller=world.clubs[player.sourceClubId];if(!buyer)return null;
  const id=`rival-player-${career.season}-${career.week||0}-${player.id}-${buyer.id}`,existing=world.moves.find(move=>move.id===id);if(existing)return existing;
  const move={id,week:Number(career.week)||0,season:career.season,player:player.name,position:player.pos,from:seller?.name||player.sourceClub||'clube vendedor',to:buyer.name,fee:competition.best.fee,salary:competition.best.salary,status:'concluído',reason:competition.best.reason,competitive:true};
  const record=trackedPlayer(world,player,player.sourceClubId,career);record.ownerId=buyer.id;record.ownerName=buyer.name;record.freeAgent=false;record.lastMoveSeason=career.season;record.lastMoveWeek=career.week;record.lastMoveId=id;
  buyer.budget=Math.max(0,Number(buyer.budget)-move.fee);buyer.wageRoom=Math.max(0,Number(buyer.wageRoom)-move.salary*12);buyer.squadDepth=Math.min(34,Number(buyer.squadDepth)+1);buyer.rating=clamp(Number(buyer.rating)+.16,45,95);buyer.needs=(buyer.needs||[]).filter(position=>position!==player.pos);buyer.seasonPlan={...(buyer.seasonPlan||defaultSeasonPlan(buyer,career.season)),spendingLimit:Math.max(0,Number(buyer.seasonPlan?.spendingLimit||buyer.budget*.2)-move.fee)};buyer.in.unshift(move);
  if(seller){seller.budget+=move.fee;seller.squadDepth=Math.max(16,Number(seller.squadDepth)-1);seller.out.unshift(move);}
  world.moves.unshift(move);world.negotiations.unshift({id,player:player.name,winner:buyer.name,at:career.date,pressure:competition.pressure,status:'perdida'});world.news.unshift({week:move.week,season:career.season,text:buyer.name+' superou a proposta por '+player.name+' e fechou a negociação.'});world.moves=world.moves.slice(0,220);world.negotiations=world.negotiations.slice(0,80);world.news=world.news.slice(0,100);return move;
}

export function simulateRivalMarketWeek(career={},catalog={},week=0){
  const world=ensureRivalCareer(career,catalog),window=transferWindow(career.date,career.club);if(week<=world.lastWeek||week%6!==0)return {world,moves:[],window};
  world.lastWeek=week;world.windows.unshift({season:career.season,week,label:window.label,active:window.active});world.windows=world.windows.slice(0,24);if(!window.active)return {world,moves:[],window};
  const clubs=Object.values(world.clubs).sort((a,b)=>b.rating-a.rating),moves=[];
  for(let slot=0;slot<Math.min(4,clubs.length);slot++){
    const buyer=clubs[hash(`${career.season}:${week}:buyer:${slot}`)%clubs.length],seller=clubs[hash(`${career.season}:${week}:seller:${slot}`)%clubs.length],plan=buyer?.seasonPlan||defaultSeasonPlan(buyer,career.season);if(!buyer||!seller||buyer.id===seller.id||buyer.budget<2_000_000||plan.mustSell)continue;
    const position=plan.priorityPositions?.[0]||buyer.needs?.[0]||positions[hash(`${buyer.id}:${week}`)%positions.length],fee=Math.round(Math.min(buyer.budget*.16,Number(plan.spendingLimit||buyer.budget*.16),Math.max(800_000,(buyer.rating+seller.rating)*18_000))),id=`rival-${career.season}-${week}-${buyer.id}-${seller.id}`;if(fee<800_000||world.moves.some(move=>move.id===id))continue;
    buyer.budget-=fee;seller.budget+=fee;buyer.squadDepth=Math.min(32,buyer.squadDepth+1);seller.squadDepth=Math.max(18,seller.squadDepth-1);buyer.rating=clamp(buyer.rating+.18,45,95);seller.rating=clamp(seller.rating-.08,45,95);buyer.needs=(buyer.needs||[]).filter(need=>need!==position);
    buyer.seasonPlan={...plan,spendingLimit:Math.max(0,Number(plan.spendingLimit||0)-fee),priorityPositions:(plan.priorityPositions||[]).filter(need=>need!==position)};
    const move={id,week,season:career.season,player:`Reforço monitorado · ${position}`,position,from:seller.name,to:buyer.name,fee,status:'concluído',reason:(buyer.seasonPlan.direction||buyer.ambition||'planejamento')+' · '+(buyer.managerStyle||buyer.style)};buyer.in.unshift(move);seller.out.unshift(move);world.moves.unshift(move);moves.push(move);
  }
  if(moves.length)world.news.unshift({week,season:career.season,text:moves[0].to+' reforça o elenco para '+moves[0].reason+'.'});world.moves=world.moves.slice(0,220);world.news=world.news.slice(0,100);return {world,moves,window};
}

function forceRivalSale(career,world,club){
  const plan=club.seasonPlan||defaultSeasonPlan(club,Number(career.season)+1);if(!plan.mustSell)return null;
  const player=Object.values(world.players||{}).filter(item=>item.ownerId===club.id&&item.id!==career.club?.id).sort((a,b)=>valueOf(b)-valueOf(a)||b.age-a.age)[0],buyers=Object.values(world.clubs||{}).filter(item=>item.id!==club.id&&item.id!==career.club?.id&&!item.seasonPlan?.mustSell&&Number(item.budget)>valueOf(player)*.45).sort((a,b)=>b.budget-a.budget);if(!player||!buyers.length)return null;
  const buyer=buyers[hash(`${career.season}:${club.id}:${player.id}:buyer`)%buyers.length],fee=Math.max(300_000,Math.round(Math.min(Number(buyer.budget)*.12,valueOf(player)*(.76+(hash(player.id)%12)/100))/1000)*1000),id=`mandatory-sale-${career.season}-${club.id}-${player.id}`;if(world.moves.some(move=>move.id===id))return null;
  player.ownerId=buyer.id;player.ownerName=buyer.name;player.freeAgent=false;player.lastMoveSeason=career.season;player.lastMoveWeek=Number(career.week)||0;club.budget+=fee;club.wageRoom=Number(club.wageRoom||0)+Number(player.salary||0)*12_000;club.squadDepth=Math.max(16,Number(club.squadDepth)-1);buyer.budget=Math.max(0,Number(buyer.budget)-fee);buyer.wageRoom=Math.max(0,Number(buyer.wageRoom||0)-Number(player.salary||0)*12_000);buyer.squadDepth=Math.min(34,Number(buyer.squadDepth)+1);buyer.needs=(buyer.needs||[]).filter(position=>position!==player.pos);buyer.seasonPlan={...(buyer.seasonPlan||defaultSeasonPlan(buyer,Number(career.season)+1)),spendingLimit:Math.max(0,Number(buyer.seasonPlan?.spendingLimit||buyer.budget*.2)-fee)};club.seasonPlan={...plan,mustSell:false,summary:'Venda necessária concluída; orçamento reequilibrado.'};
  const move={id,week:Number(career.week)||0,season:career.season,player:player.name,position:player.pos,from:club.name,to:buyer.name,fee,status:'concluído',reason:'ajuste financeiro obrigatório',forced:true};club.out.unshift(move);buyer.in.unshift(move);world.moves.unshift(move);world.news.unshift({season:career.season,text:club.name+' vendeu '+player.name+' para reequilibrar o orçamento.'});return move;
}

function resolveRivalContracts(career,world){
  const events=[];Object.values(world.players||{}).forEach(player=>{if(!player.ownerId||player.ownerId===career.club?.id||Number(player.contractEndSeason)>Number(career.season))return;const club=world.clubs[player.ownerId],plan=club?.seasonPlan||defaultSeasonPlan(club,Number(career.season)+1),salaryPressure=Number(player.salary||0)*12_000>Number(plan.wageCap||0)*.38,renewalChance=clamp(42+Number(club?.rating||60)*.34+Number(plan.boardPatience||55)*.12+(plan.mustSell?-18:6)-(salaryPressure?18:0)+(hash(`${career.season}:${player.id}:renewal`)%22),12,94),renew=Boolean(club)&&renewalChance>=72;
    if(renew){player.contractEndSeason=Number(career.season)+1+(hash(`${player.id}:term`)%3);events.push({id:`contract-${career.season}-${player.id}`,player:player.name,club:club.name,status:'renovado',season:career.season,reason:salaryPressure?'ajuste de folha':'planejamento do elenco'});}
    else {const former=club?.name||'Clube rival';player.ownerId=null;player.ownerName='Agente livre';player.freeAgent=true;player.contractEndSeason=Number(career.season)+1;if(club)club.squadDepth=Math.max(16,Number(club.squadDepth)-1);events.push({id:`contract-${career.season}-${player.id}`,player:player.name,club:former,status:'livre',season:career.season,reason:plan.mustSell?'corte de custos':'sem acordo de renovação'});}
  });world.contractEvents=[...events,...(world.contractEvents||[])].slice(0,80);return events;
}

export function settleRivalSeason(career={},worldState={},catalog={}){
  const world=ensureRivalCareer(career,catalog),summaries=[],managerChanges=[],seasonPlans=[];Object.values(worldState.leagues||{}).forEach(league=>{const table=(league.table||[]).slice().sort((a,b)=>b.points-a.points||b.gd-a.gd||b.rating-a.rating);table.forEach((row,index)=>{const club=world.clubs[row.id];if(!club)return;const swing=index===0?2:index<Math.ceil(table.length*.25)?1:index>=table.length-Number(league.rules?.relegation||0)?-2:-.25;club.rating=clamp(club.rating+swing,45,95);club.budget=Math.max(2_000_000,Math.round(club.budget+(index===0?8_000_000:index<table.length/2?1_500_000:-900_000)));club.seasonForm=Math.round((row.points/Math.max(1,row.played*3))*100);club.needs=positions.filter((_,needIndex)=>(hash(`${career.season}:${club.id}:${needIndex}`)%5)===0).slice(0,3);const summary={club:club.name,league:league.name,rank:index+1,form:club.seasonForm,total:table.length},plan=seasonPlanFor(club,summary,Number(career.season)+1);club.seasonPlan=plan;club.boardPatience=plan.boardPatience;seasonPlans.push({club:club.name,league:league.name,...plan});const changeCoach=plan.boardPatience<31||Boolean(plan.mustSell&&club.seasonForm<38&&(hash(`${career.season}:${club.id}:coach`)%100)<54);if(changeCoach){const previous=club.managerStyle;club.managerStyle=styles[(styles.indexOf(previous)+1+hash(club.id)%4)%styles.length];club.managerTenure=1;managerChanges.push({id:`manager-${career.season}-${club.id}`,club:club.name,previous,next:club.managerStyle,season:career.season,reason:plan.boardPatience<31?'pressão da diretoria':'reconstrução esportiva'});}else club.managerTenure=Number(club.managerTenure||0)+1;summaries.push(summary);});});
  world.seasonPlans=[...seasonPlans,...(world.seasonPlans||[])].slice(0,80);const forcedSales=Object.values(world.clubs||{}).map(club=>forceRivalSale(career,world,club)).filter(Boolean),contractEvents=resolveRivalContracts(career,world);world.managerChanges=[...managerChanges,...(world.managerChanges||[])].slice(0,80);world.moves=world.moves.slice(0,220);world.news=world.news.slice(0,100);world.season=Number(career.season||world.season)+1;world.lastWeek=0;world.news.unshift({season:career.season,text:'Rivais definiram planos, ajustaram a folha, renovaram contratos e reorganizaram seus elencos.'});return {world,summaries,contractEvents,managerChanges,seasonPlans,forcedSales};
}

export function rivalMarketBrief(career={}){const world=career.rivalWorld||{},moves=(world.moves||[]).slice(0,5),clubs=Object.values(world.clubs||[]),window=transferWindow(career.date,career.club),freeAgents=Object.values(world.players||{}).filter(player=>!player.ownerId).sort((a,b)=>b.overall-a.overall).slice(0,4),loans=(world.loans||[]).filter(loan=>loan.status==='active').slice(0,4),seasonPlans=(world.seasonPlans||[]).slice(0,4),forcedSales=(world.moves||[]).filter(move=>move.forced).slice(0,4);return {version:RIVAL_CAREER_VERSION,moves,clubs:clubs.length,biggestSpenders:clubs.slice().sort((a,b)=>b.budget-a.budget).slice(0,3),news:(world.news||[]).slice(0,3),negotiations:(world.negotiations||[]).slice(0,3),loans,contractEvents:(world.contractEvents||[]).slice(0,4),managerChanges:(world.managerChanges||[]).slice(0,4),seasonPlans,forcedSales,freeAgents,window};}
