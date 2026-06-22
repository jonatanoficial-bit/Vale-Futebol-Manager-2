export function validateMobileCertificationV598(snapshot={}){
  const errors=[];
  if(snapshot.version!=='v5.9.8') errors.push('Versão mobile incorreta');
  if(!snapshot.documentScroll) errors.push('Scroll principal não certificado');
  if(!snapshot.onboardingVerticalScroll) errors.push('Onboarding sem scroll vertical');
  if(!snapshot.portraitMatchFallback) errors.push('Partida sem fallback portrait');
  if(!snapshot.compactLandscape) errors.push('Landscape compacto ausente');
  if(Number(snapshot.minimumTouchTarget||0)<44) errors.push('Touch target abaixo de 44px');
  return {ok:errors.length===0, errors, snapshot};
}
