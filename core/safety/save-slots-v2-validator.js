export function validateSaveSlotsV2System(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v7.4.0') errors.push('Versão Save Slots 2.0 inválida.');
  if(!Array.isArray(snapshot.slots) || snapshot.slots.length !== 3) errors.push('A Fase 57 deve expor exatamente 3 slots jogáveis.');
  const ids = new Set((snapshot.slots || []).map(s=>s.slot));
  ['principal','career-2','career-3'].forEach(id=>{ if(!ids.has(id)) errors.push(`Slot obrigatório ausente: ${id}`); });
  ['career-4','career-5'].forEach(id=>{ if(ids.has(id)) errors.push(`Slot extra não permitido nesta fase: ${id}`); });
  if(!snapshot.activeSlot) warnings.push('Slot ativo não informado.');
  if(Number(snapshot.free ?? 0) < 0) errors.push('Contagem de slots livres inválida.');
  if(snapshot.occupied > 3) errors.push('Mais carreiras ocupadas que o limite oficial de 3 slots.');
  return { ok:errors.length===0, errors, warnings, phase:'v7.4.0-save-slots-2-3-slots-definitive', checkedAt:'runtime' };
}
