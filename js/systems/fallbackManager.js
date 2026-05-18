export const DEFAULT_FALLBACKS = Object.freeze({
  avatar:'assets/placeholders/avatar-generic.png',
  player:'assets/placeholders/player-generic.png',
  staff:'assets/placeholders/staff-generic.png',
  club:'assets/placeholders/club-generic.png',
  league:'assets/placeholders/league-generic.png',
  competition:'assets/placeholders/competition-generic.png',
  country:'assets/placeholders/country-flag-generic.png',
  stadium:'assets/placeholders/stadium-generic.jpg',
  background:'assets/placeholders/background-generic.jpg',
  sponsor:'assets/placeholders/sponsor-generic.png',
  icon:'assets/placeholders/icon-generic.png',
  kit:'assets/placeholders/club-generic.png'
});

const ALIASES = Object.freeze({
  badge:'club', logo:'club', clubLogo:'club', flag:'country', countryFlag:'country',
  bg:'background', backdrop:'background', pitch:'background', arena:'stadium',
  sponsorLogo:'sponsor', staffPhoto:'staff', playerPhoto:'player', avatarPhoto:'avatar'
});

export function normalizeAssetType(type='icon'){
  const raw = String(type || 'icon').trim();
  const clean = ALIASES[raw] || raw;
  return Object.prototype.hasOwnProperty.call(DEFAULT_FALLBACKS, clean) ? clean : 'icon';
}

export function fallbackFrom(map={}, type='icon'){
  const normalized = normalizeAssetType(type);
  const custom = map?.fallbacks?.[normalized];
  return custom || DEFAULT_FALLBACKS[normalized] || DEFAULT_FALLBACKS.icon;
}

export function sanitizePath(path=''){
  return String(path || '').replace(/\\/g,'/').replace(/^\.\//,'').replace(/\s+/g,'-');
}

export function safeAssetPath(src='', type='icon', map={}){
  const clean = sanitizePath(src);
  if(!clean || clean === 'undefined' || clean === 'null') return fallbackFrom(map, type);
  return clean;
}

export function onErrorAttribute(type='icon', fallbackSrc=''){
  const normalized = normalizeAssetType(type);
  const fallback = sanitizePath(fallbackSrc || DEFAULT_FALLBACKS[normalized] || DEFAULT_FALLBACKS.icon);
  return `this.onerror=null;this.dataset.assetBroken='true';this.src='${fallback}';`;
}

export function installGlobalImageFallback(getMap){
  if(typeof window === 'undefined' || window.__vfmFallbackInstalled) return;
  window.__vfmFallbackInstalled = true;
  window.addEventListener('error', (event)=>{
    const target = event.target;
    if(!target || target.tagName !== 'IMG') return;
    if(target.dataset.assetBroken === 'true') return;
    const type = normalizeAssetType(target.dataset.assetType || target.getAttribute('data-fallback-type') || 'icon');
    const map = typeof getMap === 'function' ? getMap() : {};
    target.dataset.assetBroken = 'true';
    target.src = fallbackFrom(map, type);
  }, true);
}

export function validateAssetMap(map={}){
  const issues = [];
  if(!map || typeof map !== 'object') issues.push('asset-map ausente ou invalido');
  ['fallbacks','backgrounds','countries','competitions','clubs'].forEach(section=>{
    if(!map?.[section] || typeof map[section] !== 'object') issues.push(`secao obrigatoria ausente: ${section}`);
  });
  Object.entries(DEFAULT_FALLBACKS).forEach(([type,path])=>{
    if(!map?.fallbacks?.[type]) issues.push(`fallback nao definido para ${type}; sera usado ${path}`);
  });
  return issues;
}
