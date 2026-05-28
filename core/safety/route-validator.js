export function validateRoutes(routes = []){
  const errors = [];
  const warnings = [];
  const required = ['cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','match'];
  const registered = new Set(Array.isArray(routes) ? routes : []);
  required.forEach(route => { if(!registered.has(route)) errors.push(`Rota obrigatória não registrada: ${route}`); });
  if(registered.size < required.length) warnings.push('Poucas rotas registradas no boot.');
  return {name:'route-integrity', status:errors.length?'error':warnings.length?'warning':'ok', errors, warnings};
}
