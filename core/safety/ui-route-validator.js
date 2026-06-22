export function validateUiRoutes(routes=[]){
  const required = ['lobby','match','championship','formation','transfers','club','polishCenter'];
  const missing = required.filter(route => !routes.includes(route));
  return { ok: missing.length === 0, status: missing.length ? 'warn' : 'ok', missing, required, version:'v5.0.0' };
}
