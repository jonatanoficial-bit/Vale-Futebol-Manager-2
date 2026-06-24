export function validateStadiumClimateSystem(snapshot={}){
  const issues = [];
  if(snapshot.version !== 'v7.3.0') issues.push('Versão do sistema de clima deve ser v7.3.0.');
  if(snapshot.route !== 'stadiumClimate') issues.push('Rota stadiumClimate não registrada no snapshot.');
  if(!snapshot.mobileFirst) issues.push('Sistema de clima precisa ser mobile-first.');
  if(!snapshot.noExternalWeatherRequired) issues.push('Clima não pode depender de API externa para abrir o jogo.');
  if(!snapshot.dynamicPitch) issues.push('Gramado dinâmico precisa estar ativo.');
  if(!snapshot.dynamicStadiumContext) issues.push('Contexto de estádio precisa estar ativo.');
  if(!snapshot.tacticalImpact) issues.push('Clima precisa gerar impacto tático.');
  if(!snapshot.safeFallback) issues.push('Fallback seguro precisa existir.');
  if(!snapshot.noBlockingPopup) issues.push('Tela não pode bloquear rolagem no mobile.');
  if(Number(snapshot.weatherPresetsCount || 0) < 8) issues.push('É necessário ter pelo menos 8 presets climáticos.');
  if(Number(snapshot.surfaceProfilesCount || 0) < 6) issues.push('É necessário ter pelo menos 6 perfis de gramado.');
  if(Number(snapshot.stadiumContextsCount || 0) < 6) issues.push('É necessário ter pelo menos 6 contextos de estádio.');
  if(Number(snapshot.tacticalRulesCount || 0) < 6) issues.push('Regras táticas de clima insuficientes.');
  if(!snapshot.allPresetsHaveImpacts) issues.push('Todos os climas precisam ter impactos de bola, fôlego, passe, lesão e torcida.');
  if(!snapshot.allSurfacesHavePhysics) issues.push('Todos os gramados precisam ter física mínima.');
  const ctx = snapshot.context || {};
  if(!ctx.selectedClimate?.id || !ctx.selectedPitch?.id || !ctx.selectedStadium?.id) issues.push('Contexto atual incompleto.');
  if(!ctx.matchImpact || !ctx.tacticalAdvice) issues.push('Leitura tática ou impacto de partida ausente.');
  return { ok: issues.length === 0, status: issues.length ? 'stadium-climate-needs-fix' : 'stadium-climate-ready', version:'v7.3.0', issues };
}
