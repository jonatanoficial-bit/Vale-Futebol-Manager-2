import { currentStaff, staffBudget, staffCandidates, staffRoles, staffFocusModes, STAFF_ENGINE_VERSION } from '../data/staffData.js';

export const STAFF_VERSION = STAFF_ENGINE_VERSION;

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Math.round(Number(n||0)))); }
function avg(values=[]){ return values.length ? Math.round(values.reduce((a,b)=>a+Number(b||0),0)/values.length) : 0; }
function moneyBRL(value=0){ return `R$ ${Math.round(Number(value||0)).toLocaleString('pt-BR')}`; }
function byId(list=[], id, fallback=0){ return list.find(item=>item.id===id) || list[fallback] || {}; }
function roleById(roleId='assistant'){ return staffRoles.find(r=>r.id===roleId) || staffRoles[0]; }
function candidateById(id=''){ return staffCandidates.find(c=>c.id===id) || staffCandidates[0]; }
function gradeFrom(score=70){ return score>=92?'A+':score>=88?'A':score>=84?'A-':score>=80?'B+':score>=74?'B':score>=68?'B-':score>=62?'C+':'C'; }
function normalizeMember(member={}, index=0){
  const roleId = member.roleId || member.id || 'assistant';
  const role = roleById(roleId);
  const quality = clamp(member.quality ?? member.impact ?? 72);
  const influence = clamp(member.influence ?? member.impact ?? quality);
  return {
    id: member.id || `${roleId}-${index+1}`,
    roleId,
    role: member.role || role.role,
    name: member.name || `${role.role} do clube`,
    country: member.country || 'BR',
    grade: member.grade || gradeFrom(avg([quality,influence])),
    quality,
    influence,
    salary: Math.max(0, Number(member.salary||0)),
    style: member.style || role.area,
    effect: member.effect || role.description,
    impact: clamp(member.impact ?? avg([quality,influence])),
    photo: member.photo || `assets/staff/brazil/santos/${roleId}.png`,
    hiredAt: member.hiredAt || null
  };
}
function currentByRole(staff={}, roleId='assistant'){
  return (staff.current || []).find(m=>m.roleId===roleId) || null;
}
function roleScore(staff={}, roleId='assistant'){
  const focus = byId(staffFocusModes, staff.focus || 'balanced', 0);
  const member = currentByRole(staff, roleId);
  if(!member) return 38;
  const raw = Number(member.quality||0)*0.64 + Number(member.influence||0)*0.36;
  const weight = Number(focus.weights?.[roleId] || 1);
  return clamp(raw * weight, 24, 99);
}
function ensureRequiredRoles(current=[]){
  const normalized = current.map(normalizeMember);
  const list = normalized.slice();
  staffRoles.filter(r=>r.required).forEach(role=>{
    if(!list.some(m=>m.roleId===role.id)){
      const fallback = currentStaff.find(m=>m.roleId===role.id) || {roleId:role.id, role:role.role, name:`${role.role} interino`, quality:62, influence:58, salary:42000, effect:role.description};
      list.push(normalizeMember(fallback, list.length));
    }
  });
  return list.slice(0,10);
}

export function ensureStaffState(staff={}, state={}){
  const current = ensureRequiredRoles(Array.isArray(staff.current) && staff.current.length ? staff.current : currentStaff);
  const used = current.reduce((n,m)=>n+Number(m.salary||0),0);
  return {
    engineVersion: STAFF_VERSION,
    schema:780,
    current,
    candidates: Array.isArray(staff.candidates) && staff.candidates.length ? staff.candidates : staffCandidates,
    focus: staff.focus || 'balanced',
    monthlyLimit: Math.max(350000, Number(staff.monthlyLimit || staffBudget.monthlyLimit || 950000)),
    usedMonthly: used,
    morale: clamp(staff.morale ?? 76),
    boardConfidence: clamp(staff.boardConfidence ?? staffBudget.boardConfidence ?? 82),
    departmentLevel: staff.departmentLevel || staffBudget.departmentLevel,
    staffLog: Array.isArray(staff.staffLog) ? staff.staffLog.slice(-40) : ['Comissão técnica preparada para influenciar treino, scout e jogo.'],
    lastMeetingAt: staff.lastMeetingAt || null,
    lastHireAt: staff.lastHireAt || null
  };
}

export function buildStaffSnapshot(state={}){
  const staff = ensureStaffState(state.staff || {}, state);
  const scores = {
    tactical: avg([roleScore(staff,'assistant'), roleScore(staff,'analyst')]),
    physical: roleScore(staff,'fitness'),
    medical: avg([roleScore(staff,'doctor'), roleScore(staff,'physio')]),
    scouting: roleScore(staff,'scout'),
    analysis: roleScore(staff,'analyst'),
    goalkeeper: roleScore(staff,'goalkeeper')
  };
  const overall = avg(Object.values(scores));
  const usedMonthly = staff.current.reduce((n,m)=>n+Number(m.salary||0),0);
  const remaining = Math.max(0, Number(staff.monthlyLimit||0)-usedMonthly);
  const weakest = Object.entries(scores).sort((a,b)=>a[1]-b[1])[0] || ['tactical',70];
  const strongest = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0] || ['medical',80];
  const focus = byId(staffFocusModes, staff.focus, 0);
  const trainingQuality = clamp(overall*0.55 + scores.physical*0.18 + scores.medical*0.16 + scores.tactical*0.11);
  const injuryReduction = clamp((scores.medical-60)*0.35 + (scores.physical-60)*0.15, 0, 22);
  const scoutAccuracy = clamp(scores.scouting*0.74 + scores.analysis*0.18 + overall*0.08);
  const matchPrep = clamp(scores.tactical*0.42 + scores.analysis*0.38 + scores.goalkeeper*0.10 + overall*0.10);
  const goalkeeperBoost = clamp((scores.goalkeeper-70)/3, -5, 10);
  const matchImpact = {
    attack: clamp((scores.tactical-70)/6 + (scores.analysis-70)/10, -5, 8),
    defense: clamp((scores.tactical-70)/7 + (scores.goalkeeper-70)/8 + (scores.analysis-70)/12, -5, 9),
    fitness: clamp((scores.physical-70)/5 + (scores.medical-70)/14, -6, 10),
    injury: clamp(8 - injuryReduction/2, -8, 8),
    goalkeeper: goalkeeperBoost,
    tacticalControl: clamp((matchPrep-70)/3, -7, 12)
  };
  const recommendation = weakest[1] < 68
    ? `Prioridade: contratar/reforçar ${roleById(weakest[0]).role || weakest[0]}.`
    : remaining < 120000
      ? 'Departamento forte, mas sem folga salarial. Evite contratar antes de melhorar finanças.'
      : 'Comissão equilibrada. Use foco técnico conforme calendário e adversário.';
  const roleCards = staffRoles.map(role=>{
    const member = currentByRole(staff, role.id);
    return { ...role, score: roleScore(staff, role.id), member, status: roleScore(staff, role.id)>=84?'Elite':roleScore(staff, role.id)>=74?'Bom':roleScore(staff, role.id)>=64?'Regular':'Frágil' };
  });
  return {
    version: STAFF_VERSION,
    schema:780,
    staff,
    focus,
    roles:roleCards,
    candidates:staff.candidates,
    scores,
    metrics:{ overall, usedMonthly, remaining, monthlyLimit:staff.monthlyLimit, morale:staff.morale, boardConfidence:staff.boardConfidence, trainingQuality, injuryReduction, scoutAccuracy, matchPrep, goalkeeperBoost, currentCount:staff.current.length, candidateCount:staff.candidates.length },
    matchImpact,
    strongest:{id:strongest[0], score:strongest[1], role:roleById(strongest[0]).role || strongest[0]},
    weakest:{id:weakest[0], score:weakest[1], role:roleById(weakest[0]).role || weakest[0]},
    recommendation,
    flags:{saveIntegrated:true, trainingLinked:true, scoutingLinked:true, matchLinked:true, hasGoalkeeperCoach:!!currentByRole(staff,'goalkeeper'), mobileFirst:true}
  };
}

export function hireStaffPatch(state={}, candidateId=''){
  const staff = ensureStaffState(state.staff || {}, state);
  const candidate = candidateById(candidateId);
  if(!candidate?.id) return {staff, integrationLog:[`Staff ${STAFF_VERSION}: candidato não encontrado.`]};
  const replacement = currentByRole(staff, candidate.roleId);
  const projectedUsed = staff.usedMonthly - Number(replacement?.salary||0) + Number(candidate.salary||0);
  const canAffordMonthly = projectedUsed <= staff.monthlyLimit;
  const feeMillions = Number(candidate.fee||0)/1000000;
  const currentBudget = Number(state.transfer?.budget || 0);
  const canAffordFee = currentBudget <= 0 || currentBudget >= feeMillions;
  if(!canAffordMonthly){
    const log = `Contratação bloqueada: ${candidate.name} estouraria o teto mensal da comissão (${moneyBRL(projectedUsed)} / ${moneyBRL(staff.monthlyLimit)}).`;
    return {staff:{...staff, staffLog:[...staff.staffLog, log].slice(-40)}, integrationLog:[`Staff ${STAFF_VERSION}: ${log}`]};
  }
  const hired = normalizeMember({...candidate, id:`hired-${candidate.id}`, hiredAt:new Date().toISOString()}, staff.current.length);
  const current = staff.current.filter(m=>m.roleId !== candidate.roleId).concat(hired);
  const log = `${hired.name} contratado para ${hired.role}. Salário ${moneyBRL(hired.salary)}/mês · encaixe ${candidate.fit}%.`;
  return {
    staff:{...staff, current, usedMonthly:projectedUsed, lastHireAt:new Date().toISOString(), staffLog:[...staff.staffLog, log].slice(-40)},
    transfer: canAffordFee ? {...(state.transfer||{}), budget:Number((currentBudget-feeMillions).toFixed(2))} : state.transfer,
    integrationLog:[`Staff ${STAFF_VERSION}: ${log}`]
  };
}

export function setStaffFocusPatch(state={}, focusId='balanced'){
  const staff = ensureStaffState(state.staff || {}, state);
  const focus = byId(staffFocusModes, focusId, 0);
  const log = `Foco da comissão alterado para ${focus.name}. ${focus.description}`;
  return { staff:{...staff, focus:focus.id, staffLog:[...staff.staffLog, log].slice(-40)}, ui:{...(state.ui||{}), staffFocus:focus.id}, integrationLog:[`Staff ${STAFF_VERSION}: ${log}`] };
}

export function runStaffMeetingPatch(state={}){
  const staff = ensureStaffState(state.staff || {}, state);
  const snap = buildStaffSnapshot({...state, staff});
  const moraleGain = snap.metrics.overall >= 80 ? 4 : 2;
  const boardGain = snap.weakest.score < 66 ? -1 : 1;
  const log = `Reunião de comissão: força geral ${snap.metrics.overall}%, ponto forte ${snap.strongest.role}, ponto fraco ${snap.weakest.role}. ${snap.recommendation}`;
  return {
    staff:{...staff, morale:clamp(staff.morale+moraleGain), boardConfidence:clamp(staff.boardConfidence+boardGain), lastMeetingAt:new Date().toISOString(), staffLog:[...staff.staffLog, log].slice(-40)},
    integrationLog:[`Staff ${STAFF_VERSION}: ${log}`]
  };
}

export function renderStaffRibbon(state={}){
  const snap = buildStaffSnapshot(state);
  return `<section class="staff-ribbon-v780 panel"><div><span class="tag">Comissão técnica</span><h3>Staff ${snap.metrics.overall}% · foco ${snap.focus.name}</h3><p class="small">Treino ${snap.metrics.trainingQuality}% · Scout ${snap.metrics.scoutAccuracy}% · Jogo ${snap.metrics.matchPrep}% · ponto fraco: ${snap.weakest.role}</p></div><div class="row gap"><button class="secondary-btn mini" data-route="staff">Gerir staff</button><button class="secondary-btn mini" data-action="staff-meeting">Reunião</button></div></section>`;
}
