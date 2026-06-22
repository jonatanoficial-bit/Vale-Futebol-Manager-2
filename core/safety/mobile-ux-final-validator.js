export function validateMobileUxFinalV599(snapshot = {}){
  const issues = [];
  const required = [
    'mobileFirst',
    'masterDocumentScroll',
    'onboardingScrollUnlocked',
    'noFixedContinueButtons',
    'keyboardSafeInputs',
    'portraitMatchPlayable',
    'compactLandscapePlayable',
    'bottomNavHiddenOnOnboarding',
    'fullscreenAsProgressiveEnhancement'
  ];
  for(const key of required){
    if(snapshot[key] !== true) issues.push(`${key} não confirmado`);
  }
  if(!Array.isArray(snapshot.certifiedViewports) || snapshot.certifiedViewports.length < 8){
    issues.push('matriz de resoluções mobile insuficiente');
  }
  return {
    ok: issues.length === 0,
    status: issues.length ? 'mobile-ux-needs-review' : 'mobile-ux-certified',
    version: snapshot.version || 'v5.9.9',
    issues
  };
}
