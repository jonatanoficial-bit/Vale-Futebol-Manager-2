export function validateXGIntegrity(stats = {}){
  const errors = [];
  const warnings = [];
  const hxg = Number(stats.xg?.[0]);
  const axg = Number(stats.xg?.[1]);
  if(!Number.isFinite(hxg) || !Number.isFinite(axg)) errors.push('xG inválido ou ausente.');
  if(hxg < 0 || axg < 0) errors.push('xG negativo detectado.');
  if(hxg > 5 || axg > 5) warnings.push('xG individual acima do limite esperado.');
  return {name:'xg-integrity-v470', status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings};
}
