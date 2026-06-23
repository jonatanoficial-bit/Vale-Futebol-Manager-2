export function validateRealAudioPackSystem(snapshot={}){
  const issues = [];
  if(snapshot.version !== 'v7.2.0') issues.push('Versão do pacote de áudio real deve ser v7.2.0.');
  if(snapshot.route !== 'realAudioPack') issues.push('Rota realAudioPack não registrada no snapshot.');
  if(!snapshot.mobileFirst) issues.push('Pacote de áudio real precisa ser mobile-first.');
  if(!snapshot.optionalAudio) issues.push('Áudio real precisa ser opcional.');
  if(!snapshot.userGestureRequired) issues.push('Áudio real precisa depender de toque do usuário.');
  if(!snapshot.noAutoplay) issues.push('Autoplay não é permitido.');
  if(!snapshot.fallbackWebAudio) issues.push('Fallback WebAudio v7.1.0 precisa estar ativo.');
  if(!snapshot.noExternalAudioRequired) issues.push('Nenhum arquivo externo pode ser obrigatório para abrir o jogo.');
  if(!snapshot.safeStopControl) issues.push('Controle de parar som precisa estar disponível.');
  if(snapshot.manifestRoot !== 'assets/audio') issues.push('Pasta oficial de áudio precisa ser assets/audio.');
  if(Number(snapshot.optionalTracksCount || 0) < 10) issues.push('Manifest deve ter pelo menos 10 trilhas opcionais.');
  if(Number(snapshot.formatsCount || 0) < 3) issues.push('Formatos MP3/WAV/OGG precisam estar documentados.');
  if(Number(snapshot.importStepsCount || 0) < 6) issues.push('Passos de importação insuficientes.');
  if(Number(snapshot.safetyRulesCount || 0) < 6) issues.push('Regras de segurança insuficientes.');
  if(!snapshot.volumeSafe) issues.push('Algum volume padrão passou do limite seguro.');
  if(!snapshot.allHaveFallback) issues.push('Todas as trilhas precisam ter fallback.');
  if(!snapshot.allHavePaths) issues.push('Todas as trilhas precisam ter caminhos MP3/WAV/OGG.');
  if(!snapshot.noBlockingPopup) issues.push('Painel de áudio real não pode bloquear rolagem.');
  const ctx = snapshot.context || {};
  if(!ctx.recommendedTrack || !ctx.recommendedFallback) issues.push('Contexto sem trilha recomendada/fallback.');
  return {
    ok: issues.length === 0,
    status: issues.length ? 'real-audio-pack-needs-fix' : 'real-audio-pack-ready',
    version: 'v7.2.0',
    issues
  };
}
