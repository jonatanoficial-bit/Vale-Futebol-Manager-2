export function validateFifaCalendar(events=[]){
  const errors=[], warnings=[];
  if(!Array.isArray(events) || events.length < 5) errors.push('Calendário FIFA insuficiente.');
  const types = new Set((events||[]).map(e=>e.type));
  ['data-fifa','eliminatorias','copa-america','world-cup'].forEach(t=>{ if(!types.has(t)) warnings.push(`Evento internacional ausente: ${t}`); });
  const ids = new Set();
  (events||[]).forEach(e=>{ if(ids.has(e.id)) errors.push(`Evento FIFA duplicado: ${e.id}`); ids.add(e.id); if(!e.date) errors.push(`Evento sem data: ${e.title||e.id}`); });
  return {scope:'fifa-date', status:errors.length?'error':'ok', errors, warnings, events:(events||[]).length};
}
