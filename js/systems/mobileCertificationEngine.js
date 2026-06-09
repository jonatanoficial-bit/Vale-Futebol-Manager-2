export const MOBILE_CERTIFICATION_VERSION = 'v5.9.8';

function setViewportVars(){
  const root = document.documentElement;
  const vv = window.visualViewport;
  const height = Math.max(320, Math.round(vv?.height || window.innerHeight || 720));
  const width = Math.max(280, Math.round(vv?.width || window.innerWidth || 390));
  root.style.setProperty('--vfm-viewport-h', `${height}px`);
  root.style.setProperty('--vfm-viewport-w', `${width}px`);
  root.classList.toggle('vfm-small-height', height <= 430);
  root.classList.toggle('vfm-narrow-mobile', width <= 430);
  root.classList.toggle('vfm-landscape-compact', width > height && height <= 430);
}

function releaseScrollLocks(){
  const root = document.documentElement;
  root.classList.add('vfm-mobile-v598');
  document.body.style.removeProperty('position');
  document.body.style.removeProperty('height');
  document.body.style.removeProperty('overflow');
  document.getElementById('app')?.style.removeProperty('height');
}

function keepFocusedControlVisible(event){
  const target = event.target;
  if(!(target instanceof HTMLElement)) return;
  if(!target.matches('input,select,textarea,button')) return;
  window.setTimeout(()=>{
    target.scrollIntoView({block:'center', inline:'nearest', behavior:'smooth'});
  }, 280);
}

export function applyMobileCertificationShell(){
  releaseScrollLocks();
  setViewportVars();
  window.addEventListener('resize', setViewportVars, {passive:true});
  window.addEventListener('orientationchange', ()=>setTimeout(setViewportVars, 220), {passive:true});
  window.visualViewport?.addEventListener('resize', setViewportVars, {passive:true});
  window.visualViewport?.addEventListener('scroll', setViewportVars, {passive:true});
  document.addEventListener('focusin', keepFocusedControlVisible, {passive:true});
  document.addEventListener('touchstart', releaseScrollLocks, {passive:true});
}

export function buildMobileCertificationSnapshot(){
  return {
    version:MOBILE_CERTIFICATION_VERSION,
    documentScroll:true,
    onboardingVerticalScroll:true,
    portraitMatchFallback:true,
    compactLandscape:true,
    visualViewport:true,
    minimumTouchTarget:48,
    testedViewports:['360x740','390x844','393x852','640x360','667x375','780x360','844x390','768x1024']
  };
}
