import { transferShortlist, outgoingList, loanTargets, aiClubProfiles, renewalTargets } from '../data/transferData.js';

export const TRANSFER_ENGINE_VERSION = 'v4.9.0';

const ALL_TARGETS = [...transferShortlist, ...loanTargets];

function slug(name=''){
  return String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'item';
}

function nowStamp(state={}){
  return state.career?.currentDate || '2026-05-19';
}

export function defaultTransferLedger(){
  return {
    engineVersion: TRANSFER_ENGINE_VERSION,
    transactions: [],
    playerRegistry: {},
    preContracts: [],
    budgetLocks: [],
    duplicateGuard: true,
    lastIntegrity: 'pending'
  };
}

export function ensureTransferLedger(transfer={}){
  const ledger = {...defaultTransferLedger(), ...(transfer.ledger || {})};
  if(!Array.isArray(ledger.transactions)) ledger.transactions = [];
  if(!Array.isArray(ledger.preContracts)) ledger.preContracts = [];
  if(!Array.isArray(ledger.budgetLocks)) ledger.budgetLocks = [];
  if(!ledger.playerRegistry || typeof ledger.playerRegistry !== 'object') ledger.playerRegistry = {};
  ledger.engineVersion = TRANSFER_ENGINE_VERSION;
  ledger.duplicateGuard = ledger.duplicateGuard !== false;
  return {...transfer, ledger, marketEngineVersion: TRANSFER_ENGINE_VERSION};
}

export function findTransferTarget(playerId){
  const id = String(playerId || '');
  return ALL_TARGETS.find(p => p.id === id || slug(p.name) === id || p.name === id) || null;
}

export function findOutgoingTarget(name){
  return outgoingList.find(p => p.name === name || slug(p.name) === String(name || '')) || null;
}

export function registerTransaction(transfer={}, transaction={}){
  const safe = ensureTransferLedger(transfer);
  const tx = {
    id: transaction.id || `tx-${transaction.type || 'deal'}-${Date.now()}`,
    date: transaction.date || transaction.timestamp || '2026-05-19',
    type: transaction.type || 'registro',
    playerId: transaction.playerId || slug(transaction.player || transaction.name || 'jogador'),
    player: transaction.player || transaction.name || 'Jogador',
    from: transaction.from || 'Indefinido',
    to: transaction.to || 'Indefinido',
    fee: Number(transaction.fee || 0),
    wage: Number(transaction.wage || 0),
    status: transaction.status || 'Registrado',
    notes: transaction.notes || ''
  };
  safe.ledger.transactions = [...safe.ledger.transactions, tx].slice(-60);
  safe.ledger.playerRegistry[tx.playerId] = {club:tx.to, status:tx.status, lastMove:tx.id, date:tx.date};
  return safe;
}

export function hasPlayerMove(transfer={}, playerId){
  const safe = ensureTransferLedger(transfer);
  const id = String(playerId || '');
  const registryHit = Boolean(safe.ledger.playerRegistry[id]);
  const acceptedHit = (safe.acceptedDeals || []).some(d => d.id === id || d.playerId === id);
  const loanHit = (safe.loanDeals || []).some(d => d.id === id || d.playerId === id);
  return registryHit || acceptedHit || loanHit;
}

export function evaluateDealSafety(state={}, target={}, kind='buy', proposal={}){
  const transfer = ensureTransferLedger(state.transfer || {});
  const fee = kind === 'loan' ? Number(proposal.fee || 0) : Number(proposal.fee ?? proposal.offer ?? target.value ?? 0);
  const wage = kind === 'loan' ? Number(proposal.wage ?? ((target.wage || 0.22) * 0.45)) : Number(proposal.wage ?? target.wage ?? 0);
  const errors = [];
  const warnings = [];
  if(!transfer.windowOpen && kind !== 'precontract') errors.push('Janela de transferências fechada.');
  if(kind !== 'precontract' && fee > Number(transfer.budget || 0)) errors.push('Orçamento insuficiente.');
  if(wage > Number(transfer.wageRoom || 0)) errors.push('Folha salarial livre insuficiente.');
  if(hasPlayerMove(transfer, target.id)) errors.push('Jogador já possui movimentação registrada nesta carreira.');
  if(Number(target.age || 0) > 31 && kind === 'buy') warnings.push('Idade alta reduz valor de revenda.');
  if(Number(target.interest || 0) < 55 && kind !== 'loan') warnings.push('Interesse baixo pode elevar salário e luvas.');
  if(fee > Number(transfer.budget || 0) * 0.82) warnings.push('Negócio consumirá quase todo o orçamento disponível.');
  const score = Math.max(0, Math.min(100, 100 - errors.length * 40 - warnings.length * 8));
  return {ok: errors.length === 0, score, fee:Number(fee.toFixed(2)), wage:Number(wage.toFixed(2)), errors, warnings, kind};
}

export function buildTransferSnapshot(state={}){
  const transfer = ensureTransferLedger(state.transfer || {});
  const spent = [...(transfer.acceptedDeals || []), ...(transfer.loanDeals || [])].reduce((sum,d)=>sum + Number(d.finalFee || d.fee || 0),0);
  const revenue = (transfer.outgoingDeals || []).reduce((sum,d)=>sum + Number(d.revenue || d.value || 0),0);
  const salaryCommitted = [...(transfer.acceptedDeals || []), ...(transfer.loanDeals || []), ...(transfer.renewals || [])].reduce((sum,d)=>sum + Number(d.finalWage || d.wageShare || d.wageIncrease || 0),0);
  const pending = (transfer.activeNegotiations || []).length + (transfer.incomingOffers || []).filter(o=>o.status === 'Pendente').length;
  const registrySize = Object.keys(transfer.ledger.playerRegistry || {}).length;
  const health = Number(transfer.budget || 0) >= 0 && Number(transfer.wageRoom || 0) >= 0 && registrySize === new Set(Object.keys(transfer.ledger.playerRegistry || {})).size;
  return {
    engineVersion: TRANSFER_ENGINE_VERSION,
    windowOpen: transfer.windowOpen !== false,
    budget:Number(transfer.budget || 0),
    wageRoom:Number(transfer.wageRoom || 0),
    spent:Number(spent.toFixed(1)),
    revenue:Number(revenue.toFixed(1)),
    net:Number((revenue - spent).toFixed(1)),
    salaryCommitted:Number(salaryCommitted.toFixed(2)),
    pending,
    registrySize,
    preContracts:(transfer.ledger.preContracts || []).length,
    transactions:(transfer.ledger.transactions || []).slice(-8).reverse(),
    health: health ? 'OK' : 'Atenção'
  };
}

export function createPreContract(transfer={}, playerId, state={}){
  const target = findTransferTarget(playerId);
  const safe = ensureTransferLedger(transfer);
  if(!target) return {transfer:safe, ok:false, message:'Pré-contrato bloqueado: atleta não encontrado.'};
  if(hasPlayerMove(safe, target.id)) return {transfer:safe, ok:false, message:`${target.name} já possui movimentação registrada.`};
  const safety = evaluateDealSafety({...state, transfer:safe}, target, 'precontract', {fee:0, wage:target.wage});
  if(!safety.ok) return {transfer:safe, ok:false, message:`Pré-contrato bloqueado: ${safety.errors.join(' ')}`};
  const record = {id:`pre-${target.id}`, playerId:target.id, player:target.name, club:target.club, wage:safety.wage, arrival:'Fim do contrato atual', status:'Pré-contrato assinado'};
  safe.ledger.preContracts = [...safe.ledger.preContracts, record].filter((item,index,arr)=>arr.findIndex(x=>x.id===item.id)===index).slice(-20);
  const updated = registerTransaction(safe, {id:record.id, date:nowStamp(state), type:'pré-contrato', playerId:target.id, player:target.name, from:target.club, to:state.clubId || 'santos', fee:0, wage:safety.wage, status:'Pré-contrato'});
  return {transfer:updated, ok:true, message:`Pré-contrato assinado com ${target.name}. Chegada programada para o fim do vínculo.`};
}

export function simulateGlobalMarketCycle(state={}){
  let transfer = ensureTransferLedger(state.transfer || {});
  const index = (transfer.ledger.transactions?.length || 0) + Number(transfer.marketDay || 1);
  const buyer = aiClubProfiles[index % aiClubProfiles.length] || aiClubProfiles[0];
  const seller = aiClubProfiles[(index + 2) % aiClubProfiles.length] || aiClubProfiles[1] || buyer;
  const target = ALL_TARGETS.slice(index).concat(ALL_TARGETS.slice(0,index)).find(candidate => !hasPlayerMove(transfer, candidate.id));
  if(!target) return {transfer, deal:null};
  const fee = Number(((target.value || 1.5) * (0.78 + (index % 6) * 0.05)).toFixed(1));
  const deal = {id:`global-${slug(target.name)}-${index}`, date:nowStamp(state), type:target.value === 0 ? 'livre' : 'compra IA', playerId:target.id, player:target.name, from:seller.name, to:buyer.name, fee, wage:target.wage || 0.22, status:'IA concluído', notes:`${buyer.style || 'mercado'} · ${seller.country || 'global'}`};
  transfer = registerTransaction(transfer, deal);
  transfer.aiDeals = [...(transfer.aiDeals || []), {id:deal.id, player:deal.player, from:deal.from, to:deal.to, fee:deal.fee, type:deal.type, date:deal.date}].slice(-16);
  transfer.marketDay = Number(transfer.marketDay || 1) + 1;
  return {transfer, deal};
}

export function validateTransferIntegrity(state={}){
  const transfer = ensureTransferLedger(state.transfer || {});
  const errors = [];
  const warnings = [];
  if(Number(transfer.budget || 0) < 0) errors.push('Orçamento negativo.');
  if(Number(transfer.wageRoom || 0) < 0) errors.push('Folha livre negativa.');
  const movedIds = [];
  (transfer.acceptedDeals || []).forEach(d=>movedIds.push(d.id || d.playerId));
  (transfer.loanDeals || []).forEach(d=>movedIds.push(d.id || d.playerId));
  const duplicates = movedIds.filter((id,index,arr)=>id && arr.indexOf(id)!==index);
  if(duplicates.length) errors.push(`Jogador duplicado em negociações: ${[...new Set(duplicates)].join(', ')}`);
  if((transfer.incomingOffers || []).some(o=>!o.id || !o.player || !o.buyer)) warnings.push('Há proposta recebida com dado incompleto.');
  if((transfer.activeNegotiations || []).some(n=>Number(n.chance || 0) < 0 || Number(n.chance || 0) > 100)) warnings.push('Chance de negociação fora do intervalo 0-100.');
  return {status: errors.length ? 'error' : 'ok', errors, warnings, checkedAt: nowStamp(state), version: TRANSFER_ENGINE_VERSION};
}

export function renewalById(id){
  return renewalTargets.find(r=>r.id === id || slug(r.player) === id) || null;
}
