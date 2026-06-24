import { CAREER_SLOT_DEFINITIONS, SAVE_FLOW_STEPS_V740, SAVE_SLOT_POLICIES_V740, SAVE_SLOTS_V2_VERSION } from '../data/saveSlotsData.js';
import { listPlayableSlots, slotLabel, saveIntegritySnapshot } from './saveManager.js';
import { teams } from '../data/gameData.js';
import { safeImg, clubLogo } from './assets.js';

function esc(value=''){
  return String(value ?? '').replace(/[&<>'"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function fmtDate(value){
  if(!value) return 'sem data';
  const raw = String(value);
  return raw.includes('T') ? raw.slice(0,10).split('-').reverse().join('/') : raw.slice(0,10);
}
function clubName(clubId){ return (teams.find(t=>t.id===clubId) || {}).name || clubId || 'Clube não definido'; }
function slotTitle(slot){ return esc(slot.slotLabel || slot.label || slotLabel(slot.slot)); }
function slotMeta(slot){
  if(!slot.occupied) return 'Vazio · pronto para nova carreira';
  return `${esc(slot.manager || 'Manager')} · ${esc(clubName(slot.clubId))} · Temporada ${esc(slot.season || 2026)} · ${Number(slot.completedMatches||0)} jogo(s)`;
}
function slotLogo(slot){
  const team = teams.find(t=>t.id === slot.clubId);
  return team ? safeImg(clubLogo(team.id),'club',team.name,'slot-card-logo-v740') : '<span class="slot-card-empty-ball-v740">⚽</span>';
}
function renderSlotCard(slot, activeSlot='principal'){
  const active = slot.slot === activeSlot;
  const occupied = !!slot.occupied;
  const status = active ? 'Ativo' : occupied ? 'Salvo' : 'Vazio';
  return `<article class="slot-card-v740 ${occupied?'occupied':'empty'} ${active?'active':''}">
    <div class="slot-card-head-v740">
      <span class="slot-badge-v740">${esc(slot.badge || status)}</span>
      <span class="slot-status-v740">${status}</span>
    </div>
    <div class="slot-card-body-v740">
      ${slotLogo(slot)}
      <div>
        <h3>${slotTitle(slot)}</h3>
        <p>${slotMeta(slot)}</p>
        <small>Atualizado: ${fmtDate(slot.updatedAt)} · ${esc(slot.description || '')}</small>
      </div>
    </div>
    <div class="slot-actions-v740">
      ${occupied ? `<button class="main-btn mini" data-action="load-save-slot" data-slot="${esc(slot.slot)}">Entrar</button>
      <button class="secondary-btn mini" data-action="save-current-slot" data-slot="${esc(slot.slot)}">Salvar aqui</button>
      <button class="secondary-btn mini" data-action="save-slot-rename" data-slot="${esc(slot.slot)}">Renomear</button>
      <button class="secondary-btn mini danger" data-action="save-slot-delete" data-slot="${esc(slot.slot)}">Apagar</button>` : `<button class="main-btn mini" data-action="new-career-slot" data-slot="${esc(slot.slot)}" data-occupied="false">Criar carreira</button>`}
    </div>
  </article>`;
}
export function buildSaveSlotsV2Snapshot(state={}){
  const slots = listPlayableSlots().map(slot=>({...slot, active:slot.slot === (state.save?.activeSlot || 'principal')}));
  const occupied = slots.filter(s=>s.occupied).length;
  const firstOccupied = slots.find(s=>s.occupied);
  const firstEmpty = slots.find(s=>!s.occupied);
  return {
    version:SAVE_SLOTS_V2_VERSION,
    activeSlot:state.save?.activeSlot || 'principal',
    activeSlotLabel:state.save?.slotLabel || slotLabel(state.save?.activeSlot || 'principal'),
    occupied,
    free:slots.length - occupied,
    slots,
    firstOccupied:firstOccupied?.slot || null,
    firstEmpty:firstEmpty?.slot || null,
    integrity:saveIntegritySnapshot(state)
  };
}
export function renderSlotManagerHome(state={}){
  const snap = buildSaveSlotsV2Snapshot(state);
  const activeSlot = snap.activeSlot;
  const activeCard = snap.slots.find(s=>s.slot===activeSlot && s.occupied) || snap.slots.find(s=>s.occupied);
  const firstEmpty = snap.slots.find(s=>!s.occupied);
  return `<section class="slot-manager-home-v740">
    <div class="slot-hero-v740 panel">
      <div>
        <span class="tag">Save Slots 2.0 · Fase 57</span>
        <h1>Central de carreiras</h1>
        <p class="subtitle">Escolha exatamente qual carreira abrir. Agora sair, trocar, criar, renomear e apagar slot ficam no mesmo lugar.</p>
      </div>
      <div class="slot-hero-actions-v740">
        ${activeCard ? `<button class="main-btn giant" data-action="load-save-slot" data-slot="${esc(activeCard.slot)}">Continuar ${slotTitle(activeCard)}</button>` : `<button class="main-btn giant" data-action="new-career-slot" data-slot="${esc(firstEmpty?.slot || 'principal')}">Criar primeira carreira</button>`}
        <button class="secondary-btn" data-route="cover">Voltar para capa</button>
      </div>
    </div>
    <section class="slot-summary-grid-v740">
      <article class="card kpi-card"><span>Slots ocupados</span><strong>${snap.occupied}/5</strong><small>${snap.free} livre(s)</small></article>
      <article class="card kpi-card"><span>Slot ativo</span><strong>${esc(snap.activeSlotLabel)}</strong><small>${esc(activeSlot)}</small></article>
      <article class="card kpi-card"><span>Fluxo</span><strong>Definitivo</strong><small>Capa → Slots → Lobby</small></article>
    </section>
    <section class="slot-grid-v740">${snap.slots.map(s=>renderSlotCard(s, activeSlot)).join('')}</section>
    <section class="panel slot-policy-v740">
      <div class="row space"><div><span class="tag">Regras de segurança</span><h2>Sem sobrescrever carreira sem querer</h2></div><button class="secondary-btn mini" data-route="saveCenter">Central técnica</button></div>
      <ul class="small-list">${SAVE_SLOT_POLICIES_V740.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
    </section>
  </section>`;
}
export function renderSaveSlotsV2Center(state={}){
  const snap = buildSaveSlotsV2Snapshot(state);
  const steps = SAVE_FLOW_STEPS_V740.map((s,i)=>`<article class="flow-step-v740"><strong>${i+1}</strong><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></article>`).join('');
  return `<section class="save-slots-v2-center-v740">
    ${renderSlotManagerHome(state)}
    <section class="panel"><div class="row space"><div><span class="tag">Fluxo definitivo</span><h2>Como o jogador deve navegar</h2></div><strong class="grade">v7.4</strong></div><div class="flow-steps-v740">${steps}</div></section>
    <section class="grid grid-2"><article class="panel"><span class="tag">Quality gate</span><h2>Integridade dos slots</h2><div class="candidate-list">${snap.integrity.gates.map(g=>`<div class="stat-line"><span>${esc(g.name)}</span><strong>${esc(g.status)}</strong></div>`).join('')}</div></article><article class="panel"><span class="tag">Próximo passo</span><h2>Fluxo pronto para carreira longa</h2><p class="alert">Depois desta fase, módulos novos devem entrar no Menu completo. A entrada do jogo deve continuar limpa e centrada em salvar/continuar/trocar carreira.</p></article></section>
  </section>`;
}
export function renderSlotCompactBar(state={}){
  const snap = buildSaveSlotsV2Snapshot(state);
  return `<div class="slot-compact-bar-v740"><strong>Slot ativo: ${esc(snap.activeSlotLabel)}</strong><span>${snap.occupied}/5 carreiras salvas</span><button class="secondary-btn mini" data-action="exit-career">Salvar e sair</button></div>`;
}
