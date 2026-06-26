export function validateAssetIntegritySystem(snapshot={}){
  const errors = [];
  const warnings = [];
  if(snapshot.version !== 'v8.1.0') errors.push('Versão da auditoria de assets deve ser v8.1.0.');
  if(Number(snapshot.schema || 0) < 810) errors.push('Schema de assets inferior a 810.');
  if(!Array.isArray(snapshot.avatars) || snapshot.avatars.length !== 12) errors.push('Pacote de avatares v810 deve ter exatamente 12 entradas.');
  const avatarPaths = (snapshot.avatars || []).map(a=>a.path).filter(Boolean);
  const unique = new Set(avatarPaths);
  if(unique.size !== 12) errors.push('Avatares v810 precisam ter 12 paths únicos.');
  if(avatarPaths.some(p=>!String(p).includes('manager-v810-'))) errors.push('Todos os avatares da criação precisam usar nomes manager-v810.');
  if(!snapshot.selectedIsV810) warnings.push('Avatar selecionado veio de save antigo; será normalizado para v810 no próximo ciclo.');
  if(Number(snapshot.assetMapTotal || 0) < 50) warnings.push('Asset-map parece pequeno para a build atual.');
  if(!Array.isArray(snapshot.criticalGroups) || snapshot.criticalGroups.length < 4) errors.push('Quality gates de assets críticos ausentes.');
  return { ok:errors.length===0, status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings, phase:'v8.1.0-asset-integrity-cache', checkedAt:'runtime' };
}
