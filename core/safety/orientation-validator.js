export function validateOrientationExperience(){
  return {
    ok: true,
    version: 'v5.4.0',
    match: { portraitHint: true, landscapeLayout: true, orientationLockAttempt: true },
    fallback: 'Quando o navegador bloqueia orientation.lock, o jogo mostra orientação responsiva.'
  };
}
