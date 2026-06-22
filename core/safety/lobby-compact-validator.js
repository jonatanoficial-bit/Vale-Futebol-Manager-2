export function validateLobbyCompactSystem({primaryActions=[], menuGroups=[]}={}){
  const requiredPrimary = ['match','formation','squad','messages','managerMenu'];
  const actualPrimary = primaryActions.map(item => item[0]);
  const missingPrimary = requiredPrimary.filter(route => !actualPrimary.includes(route));
  const groupedRoutes = menuGroups.flatMap(group => Array.isArray(group[1]) ? group[1].map(item => item[0]) : []);
  const hasMailOutsideLobby = groupedRoutes.includes('messages');
  const hasAdvancedMenu = groupedRoutes.includes('saveCenter') && groupedRoutes.includes('worldComplete') && groupedRoutes.includes('database2026');
  return {
    ok: missingPrimary.length === 0 && hasMailOutsideLobby && hasAdvancedMenu,
    version: 'v5.5.0',
    missingPrimary,
    primaryCount: actualPrimary.length,
    groupCount: menuGroups.length,
    groupedRouteCount: groupedRoutes.length,
    hasMailOutsideLobby,
    hasAdvancedMenu,
    mobileLobbyTarget: 'home executiva enxuta'
  };
}
