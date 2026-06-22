import { NAVIGATION_ROUTES_V560, getNavigationRouteForActive, buildNavigationSnapshot } from '../../js/systems/navigationExperienceEngine.js';

export function validateNavigationSystem({routes=[], currentRoute='lobby'}={}){
  const errors = [];
  const required = ['lobby','squad','formation','match','managerMenu'];
  const navRoutes = NAVIGATION_ROUTES_V560.map(item => item.route);
  required.forEach(route => { if(!navRoutes.includes(route)) errors.push(`Navegação sem rota essencial: ${route}`); });
  NAVIGATION_ROUTES_V560.forEach(item => {
    if(!item.route || !item.label || !item.icon) errors.push(`Item de navegação incompleto: ${JSON.stringify(item)}`);
  });
  if(NAVIGATION_ROUTES_V560.length !== 5) errors.push('Navegação mobile deve ter exatamente 5 ações principais.');
  if(!NAVIGATION_ROUTES_V560.some(item => item.primary && item.route === 'match')) errors.push('Botão principal Jogar não encontrado.');
  const active = getNavigationRouteForActive(currentRoute);
  if(!navRoutes.includes(active)) errors.push(`Rota ativa inválida: ${active}`);
  const missingRuntime = routes.filter(route => !route).length;
  if(missingRuntime) errors.push('Lista de rotas runtime contém item vazio.');
  return { ok: errors.length === 0, errors, snapshot: buildNavigationSnapshot(currentRoute) };
}
