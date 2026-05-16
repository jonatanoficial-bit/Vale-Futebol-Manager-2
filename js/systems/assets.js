let assetMap = null;
const DEFAULT_FALLBACKS = {
  avatar:'assets/placeholders/avatar-generic.png', player:'assets/placeholders/player-generic.png', staff:'assets/placeholders/staff-generic.png', club:'assets/placeholders/club-generic.png', league:'assets/placeholders/league-generic.png', competition:'assets/placeholders/competition-generic.png', country:'assets/placeholders/country-flag-generic.png', stadium:'assets/placeholders/stadium-generic.jpg', background:'assets/placeholders/background-generic.jpg', sponsor:'assets/placeholders/sponsor-generic.png', icon:'assets/placeholders/icon-generic.png'
};
export async function loadAssetMap(){
  try { const res = await fetch('data/asset-map.json', {cache:'no-store'}); assetMap = await res.json(); }
  catch(err){ console.warn('[VFM] asset-map fallback ativado', err); assetMap = {fallbacks:DEFAULT_FALLBACKS, backgrounds:{}, clubs:{}, competitions:{}, countries:{}}; }
  return assetMap;
}
export const map = () => assetMap || {fallbacks:DEFAULT_FALLBACKS, backgrounds:{}, clubs:{}, competitions:{}, countries:{}};
export function fallback(type){ return (map().fallbacks && map().fallbacks[type]) || DEFAULT_FALLBACKS[type] || DEFAULT_FALLBACKS.icon; }
export function bg(key){ return (map().backgrounds && map().backgrounds[key]) || fallback('background'); }
export function clubLogo(id){ return (map().clubs && map().clubs[id] && map().clubs[id].logo) || fallback('club'); }
export function stadium(id){ return (map().clubs && map().clubs[id] && map().clubs[id].stadium) || fallback('stadium'); }
export function country(code){ return (map().countries && map().countries[code]) || fallback('country'); }
export function safeImg(src, type='icon', alt='', cls='') { return `<img class="${cls}" src="${src || fallback(type)}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='${fallback(type)}';" />`; }
