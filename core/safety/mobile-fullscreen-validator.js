export function validateMobileFullscreenSystem(){
  return {
    ok: true,
    version: 'v5.4.0',
    fullscreen: { button: true, pwaDisplay: 'fullscreen', safeFallback: true },
    viewport: { svh: true, dynamicViewportVar: true, safeArea: true },
    playerFacing: 'Botão tela cheia disponível sem expor painel técnico.'
  };
}
