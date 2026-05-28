export function validateAssets(assetMap = null){
  const errors = [];
  const warnings = [];
  if(!assetMap) warnings.push('Mapa de assets não informado no boot; fallbacks continuam ativos.');
  if(assetMap && typeof assetMap !== 'object') errors.push('Mapa de assets inválido.');
  return {name:'asset-integrity', status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings};
}
