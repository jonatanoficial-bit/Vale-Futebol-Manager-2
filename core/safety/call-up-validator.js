export function validateCallUpList(players=[]){
  const errors=[], warnings=[];
  if(!Array.isArray(players)) errors.push('Lista de convocados inválida.');
  const selected = (players||[]).filter(p=>p.selected);
  if(selected.length < 11) errors.push('Menos de 11 convocados selecionados.');
  if(selected.length > 26) errors.push('Mais de 26 convocados selecionados.');
  const ids = new Set();
  (players||[]).forEach(p=>{ if(!p.id) warnings.push(`Jogador sem id: ${p.name||'sem nome'}`); if(ids.has(p.id)) errors.push(`Jogador duplicado na convocação: ${p.id}`); ids.add(p.id); });
  return {scope:'call-up', status:errors.length?'error':'ok', errors, warnings, selected:selected.length};
}
