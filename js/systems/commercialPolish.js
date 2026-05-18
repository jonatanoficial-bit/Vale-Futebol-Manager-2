export const commercialQuality = {
  version: 'v2.5.1',
  status: 'Primeira versão comercial sólida',
  mobile: { fullscreen: true, safeArea: true, touchMinimum: 44, overflowGuard: true },
  visual: { cards: 'premium', contrast: 'high', hierarchy: 'commercial', shadows: 'soft-gold' },
  performance: { assetCache: true, progressiveLoading: true, renderGuard: true, safePreload: true },
  gameplay: { momentum: 'balanced', morale: 'stable', tacticalImpact: 'visible', fanPressure: 'refined' }
};

export function applyCommercialPolish(){
  try {
    document.documentElement.classList.add('vfm-commercial-v251');
    document.documentElement.style.setProperty('--touch-min', '44px');
    document.documentElement.style.setProperty('--screen-max-mobile', '540px');
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if(metaViewport){
      metaViewport.setAttribute('content','width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1');
    }
    installScrollGuards();
    installButtonGuards();
    return true;
  } catch(err){
    console.warn('[VFM v2.5.1] polimento comercial aplicado em modo seguro', err);
    return false;
  }
}

export function installScrollGuards(){
  try {
    const style = document.createElement('style');
    style.dataset.vfmRuntime = 'commercial-polish';
    style.textContent = `
      html.vfm-commercial-v251, html.vfm-commercial-v251 body { min-height: 100%; overflow-x: hidden; overscroll-behavior-y: contain; }
      html.vfm-commercial-v251 .screen { overflow-x: hidden; touch-action: manipulation; }
      html.vfm-commercial-v251 button, html.vfm-commercial-v251 [data-route], html.vfm-commercial-v251 [data-action] { min-height: var(--touch-min, 44px); }
      html.vfm-commercial-v251 img { max-width: 100%; height: auto; }
    `;
    if(!document.querySelector('style[data-vfm-runtime="commercial-polish"]')) document.head.appendChild(style);
  } catch(err){ console.warn('[VFM] scroll guard fallback', err); }
}

export function installButtonGuards(){
  try {
    document.addEventListener('click', event => {
      const action = event.target.closest('[data-action], [data-route]');
      if(!action) return;
      action.classList.add('tap-feedback');
      setTimeout(()=>action.classList.remove('tap-feedback'), 180);
    }, {passive:true});
  } catch(err){ console.warn('[VFM] button guard fallback', err); }
}

export function validateCommercialState(state={}){
  const issues = [];
  if(!state.manager) issues.push('manager ausente');
  if(!state.clubId) issues.push('clubId ausente');
  if(!state.match) issues.push('match ausente');
  if(!state.career) issues.push('career ausente');
  if(!state.ui) issues.push('ui ausente');
  return { ok: issues.length === 0, issues, checkedAt: new Date().toISOString(), version:'v2.5.1' };
}
