export function validateSaveSlotsV2System(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v7.4.0') errors.push('Versão Save Slots 2.0 inválida.');
  if(!Array.isArray(snapshot.slots) || snapshot.slots.length < 5) errors.push('Menos de 5 slots jogáveis detectados.');
  const ids = new Set((snapshot.slots || []).map(s=>s.slot));
  ['principal','career-2','career-3','career-4','career-5'].forEach(id=>{ if(!ids.has(id)) errors.push(`Slot obrigatório ausente: ${id}`); });
  if(!snapshot.activeSlot) warnings.push('Slot ativo não informado.');
  if(Number(snapshot.free ?? 0) < 0) errors.push('Contagem de slots livres inválida.');
  return { ok:errors.length===0, errors, warnings, phase:'v7.4.0-save-slots-2', checkedAt:'runtime' };
}
