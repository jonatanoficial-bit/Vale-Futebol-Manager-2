export const MOBILE_EXPERIENCE_VERSION = 'v5.4.0';

export function applyMobileExperienceShell(){
  const root = document.documentElement;
  root.classList.add('vfm-mobile-v540');
  root.style.setProperty('--vfm-viewport-h', `${window.innerHeight}px`);
  const sync = () => {
    root.style.setProperty('--vfm-viewport-h', `${window.innerHeight}px`);
    root.classList.toggle('is-landscape', window.innerWidth > window.innerHeight);
    root.classList.toggle('is-portrait', window.innerHeight >= window.innerWidth);
    root.classList.toggle('is-mobile-size', window.innerWidth <= 920);
  };
  sync();
  window.addEventListener('resize', sync, {passive:true});
  window.addEventListener('orientationchange', () => setTimeout(sync, 180), {passive:true});
}

export async function requestFullscreenMode(){
  const el = document.documentElement;
  try{
    if(!document.fullscreenElement && el.requestFullscreen){ await el.requestFullscreen({navigationUI:'hide'}); }
    else if(document.exitFullscreen){ await document.exitFullscreen(); }
  }catch(err){
    console.warn('[VFM] fullscreen indisponível neste navegador', err);
  }
}

export async function requestLandscapeForMatch(route=''){
  if(route !== 'match') return false;
  try{
    if(screen.orientation?.lock){ await screen.orientation.lock('landscape'); return true; }
  }catch(err){
    console.info('[VFM] orientação não pôde ser bloqueada; exibindo layout responsivo.', err);
  }
  return false;
}

export function buildMobileExperienceSnapshot(){
  return {
    version: MOBILE_EXPERIENCE_VERSION,
    fullscreenButton: true,
    scrollGuard: true,
    safeArea: true,
    matchLandscape: true,
    orientationHint: true,
    touchTargets: '>=44px',
    mobileBreakpoints: ['920px','760px','520px','landscape']
  };
}
