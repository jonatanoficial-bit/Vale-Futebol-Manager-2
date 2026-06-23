export function validateSoundAmbienceSystem(snapshot={}){
  const issues = [];
  if(snapshot.version !== 'v7.1.0') issues.push('Versão da ambiência sonora deve ser v7.1.0.');
  if(snapshot.route !== 'soundAmbience') issues.push('Rota soundAmbience não registrada no snapshot.');
  if(!snapshot.mobileFirst) issues.push('Sistema de som precisa ser mobile-first.');
  if(!snapshot.offlineReady) issues.push('Sistema de som precisa funcionar offline/PWA.');
  if(!snapshot.userGestureRequired) issues.push('Som precisa depender de toque do usuário.');
  if(!snapshot.noAutoplay) issues.push('Autoplay não é permitido no mobile.');
  if(!snapshot.noExternalAudioRequired) issues.push('Não pode depender de MP3 externo obrigatório.');
  if(!snapshot.volumeSafe) issues.push('Volume padrão acima do limite seguro.');
  if(!snapshot.noBlockingPopup) issues.push('Painel de som não pode bloquear rolagem.');
  if(Number(snapshot.presetsCount || 0) < 6) issues.push('Presets sonoros insuficientes.');
  if(Number(snapshot.channelsCount || 0) < 5) issues.push('Canais de som insuficientes.');
  if(Number(snapshot.eventsCount || 0) < 6) issues.push('Eventos sonoros de partida insuficientes.');
  if(Number(snapshot.accessibilityRulesCount || 0) < 6) issues.push('Regras de acessibilidade sonora insuficientes.');
  if(Number(snapshot.mixRulesCount || 0) < 5) issues.push('Regras de mixagem insuficientes.');
  const ctx = snapshot.context || {};
  if(!ctx.recommendedPreset || !ctx.recommendedTitle) issues.push('Contexto sem preset recomendado.');
  return {
    ok: issues.length === 0,
    status: issues.length ? 'sound-ambience-needs-fix' : 'sound-ambience-ready',
    version: 'v7.1.0',
    issues
  };
}
