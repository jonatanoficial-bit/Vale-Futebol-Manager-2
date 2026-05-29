export function validateMenuHierarchy({primaryActions=[], menuGroups=[]}={}){
  const errors = [];
  if(primaryActions.length > 6) errors.push('Lobby deve manter no máximo 6 ações principais.');
  if(menuGroups.length < 4) errors.push('Menu completo precisa estar agrupado em áreas claras.');
  const allRoutes = menuGroups.flatMap(group => group[1] || []).map(item => item[0]);
  ['messages','transfers','training','saveCenter','worldComplete','settings'].forEach(route => {
    if(!allRoutes.includes(route)) errors.push(`Menu completo sem rota importante: ${route}`);
  });
  const duplicates = allRoutes.filter((route, index) => allRoutes.indexOf(route) !== index);
  if(duplicates.length) errors.push(`Rotas duplicadas no menu: ${[...new Set(duplicates)].join(', ')}`);
  return { ok: errors.length === 0, errors, routes: allRoutes.length, groups: menuGroups.length };
}
