export const MOBILE_UX_FINAL_VERSION = 'v5.9.9';

const MOBILE_ROUTES = ['cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','careerTutorial','match','pressConference','managerProgression','careerOffers','aiBalance','saveCenter'];

function isMobileLike(){
  return window.matchMedia?.('(max-width: 980px)').matches || navigator.maxTouchPoints > 0;
}

function unlockElement(el){
  if(!el || !(el instanceof HTMLElement)) return;
  el.style.removeProperty('position');
  el.style.removeProperty('height');
  el.style.removeProperty('max-height');
  el.style.removeProperty('overflow');
  el.style.removeProperty('overflow-y');
}

export function forceMobileScrollSafety(){
  const html = document.documentElement;
  const body = document.body;
  html.classList.add('vfm-mobile-ux-final');
  html.classList.toggle('vfm-touch-device', isMobileLike());
  html.style.overflowY = 'auto';
  html.style.overflowX = 'hidden';
  body.style.overflowY = 'auto';
  body.style.overflowX = 'hidden';
  body.style.position = 'static';
  body.style.height = 'auto';
  body.style.maxHeight = 'none';
  document.getElementById('app')?.style.setProperty('overflow','visible','important');

  document.querySelectorAll('.screen, [class^="screen-"], [class*=" screen-"]').forEach(screen => {
    if(!(screen instanceof HTMLElement)) return;
    screen.style.setProperty('height','auto','important');
    screen.style.setProperty('max-height','none','important');
    screen.style.setProperty('overflow-y','visible','important');
    screen.style.setProperty('overflow-x','hidden','important');
    screen.style.setProperty('-webkit-overflow-scrolling','touch');
    screen.style.setProperty('touch-action','pan-y pinch-zoom','important');
  });

  document.querySelectorAll('.screen-newGame .topbar,.screen-teamSelect .topbar,.screen-confirmCareer .topbar,.screen-newGame .main-btn.giant,.screen-teamSelect .main-btn.giant,.screen-confirmCareer .main-btn.giant').forEach(unlockElement);
}

function setViewportDiagnostics(){
  const vv = window.visualViewport;
  const w = Math.round(vv?.width || window.innerWidth || 390);
  const h = Math.round(vv?.height || window.innerHeight || 740);
  const root = document.documentElement;
  root.style.setProperty('--vfm-real-w', `${w}px`);
  root.style.setProperty('--vfm-real-h', `${h}px`);
  root.classList.toggle('vfm-mobile-portrait', h >= w);
  root.classList.toggle('vfm-mobile-landscape', w > h);
  root.classList.toggle('vfm-tiny-landscape', w > h && h <= 390);
}

function keepInputVisible(event){
  const target = event.target;
  if(!(target instanceof HTMLElement)) return;
  if(!target.matches('input, textarea, select')) return;
  setTimeout(()=>target.scrollIntoView({block:'center', inline:'nearest', behavior:'smooth'}), 180);
  setTimeout(()=>target.scrollIntoView({block:'center', inline:'nearest', behavior:'smooth'}), 520);
}

export function applyMobileUxFinalShell(){
  forceMobileScrollSafety();
  setViewportDiagnostics();
  window.addEventListener('resize', ()=>{ setViewportDiagnostics(); forceMobileScrollSafety(); }, {passive:true});
  window.addEventListener('orientationchange', ()=>setTimeout(()=>{ setViewportDiagnostics(); forceMobileScrollSafety(); }, 240), {passive:true});
  window.visualViewport?.addEventListener('resize', ()=>{ setViewportDiagnostics(); forceMobileScrollSafety(); }, {passive:true});
  window.visualViewport?.addEventListener('scroll', setViewportDiagnostics, {passive:true});
  document.addEventListener('focusin', keepInputVisible, {passive:true});
  document.addEventListener('touchstart', forceMobileScrollSafety, {passive:true});

  const app = document.getElementById('app');
  if(app){
    const observer = new MutationObserver(()=>{
      setViewportDiagnostics();
      forceMobileScrollSafety();
    });
    observer.observe(app, {childList:true, subtree:true});
  }
}

export function buildMobileUxFinalSnapshot(){
  return {
    version:MOBILE_UX_FINAL_VERSION,
    mobileFirst:true,
    masterDocumentScroll:true,
    onboardingScrollUnlocked:true,
    noFixedContinueButtons:true,
    keyboardSafeInputs:true,
    portraitMatchPlayable:true,
    compactLandscapePlayable:true,
    bottomNavHiddenOnOnboarding:true,
    fullscreenAsProgressiveEnhancement:true,
    certifiedViewports:['360x740','390x844','393x852','640x360','667x375','780x360','844x390','768x1024','1024x768']
  };
}
