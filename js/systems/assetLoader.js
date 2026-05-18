import { DEFAULT_FALLBACKS, fallbackFrom, safeAssetPath, normalizeAssetType, onErrorAttribute, installGlobalImageFallback, validateAssetMap } from './fallbackManager.js';

let assetMap = null;
const imageCache = new Map();
const existsCache = new Map();

function mergeMap(map={}){
  return {
    fallbacks:{...DEFAULT_FALLBACKS, ...(map.fallbacks || {})},
    backgrounds:{...(map.backgrounds || {})},
    countries:{...(map.countries || {})},
    competitions:{...(map.competitions || {})},
    leagues:{...(map.leagues || {})},
    clubs:{...(map.clubs || {})},
    players:{...(map.players || {})},
    staff:{...(map.staff || {})},
    sponsors:{...(map.sponsors || {})},
    stadiums:{...(map.stadiums || {})},
    icons:{...(map.icons || {})},
    meta:{...(map.meta || {})}
  };
}

export async function loadAssetMap(){
  try {
    const res = await fetch('data/asset-map.json', {cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    assetMap = mergeMap(await res.json());
  } catch(err){
    console.warn('[VFM] asset-map fallback ativado', err);
    assetMap = mergeMap({fallbacks:DEFAULT_FALLBACKS});
  }
  const issues = validateAssetMap(assetMap);
  if(issues.length) console.warn('[VFM] asset-map normalizado', issues);
  installGlobalImageFallback(()=>assetMap);
  preloadCriticalAssets();
  return assetMap;
}

export const map = () => assetMap || mergeMap({fallbacks:DEFAULT_FALLBACKS});
export const fallback = (type='icon') => fallbackFrom(map(), type);

export function resolveAsset(src='', type='icon'){
  return safeAssetPath(src, normalizeAssetType(type), map());
}

export function bg(key='lobby'){
  return resolveAsset(map().backgrounds?.[key], 'background');
}

export function clubLogo(id='santos'){
  return resolveAsset(map().clubs?.[id]?.logo || map().clubs?.[id]?.badge, 'club');
}

export function clubBadge(id='santos'){
  return resolveAsset(map().clubs?.[id]?.badge || map().clubs?.[id]?.logo, 'club');
}

export function stadium(id='santos'){
  return resolveAsset(map().clubs?.[id]?.stadium || map().stadiums?.[id], 'stadium');
}

export function country(code='br'){
  return resolveAsset(map().countries?.[code], 'country');
}

export function competitionLogo(id='brasileirao_a'){
  const key = String(id || '').replace(/-/g,'_');
  return resolveAsset(map().competitions?.[id] || map().competitions?.[key], 'competition');
}

export function leagueLogo(id='brasileirao_serie_a'){
  const key = String(id || '').replace(/-/g,'_');
  return resolveAsset(map().leagues?.[id] || map().leagues?.[key], 'league');
}

export function playerPhoto(pathOrId='', clubId='santos'){
  const players = map().players || {};
  if(players[pathOrId]) return resolveAsset(players[pathOrId], 'player');
  if(pathOrId && String(pathOrId).includes('/')) return resolveAsset(pathOrId, 'player');
  return resolveAsset(`assets/players/brazil/${clubId}/${pathOrId}.png`, 'player');
}

export function staffPhoto(pathOrId='', clubId='santos'){
  const staff = map().staff || {};
  if(staff[pathOrId]) return resolveAsset(staff[pathOrId], 'staff');
  if(pathOrId && String(pathOrId).includes('/')) return resolveAsset(pathOrId, 'staff');
  return resolveAsset(`assets/staff/brazil/${clubId}/${pathOrId}.png`, 'staff');
}

export function sponsorLogo(id='generic'){
  return resolveAsset(map().sponsors?.[id] || `assets/sponsors/${id}.png`, 'sponsor');
}

export function icon(id='home'){
  return resolveAsset(map().icons?.[id] || `assets/icons/${id}.png`, 'icon');
}

export function safeImg(src, type='icon', alt='', cls=''){
  const normalized = normalizeAssetType(type);
  const resolved = resolveAsset(src, normalized);
  const fb = fallback(normalized);
  return `<img class="${cls || ''}" src="${resolved}" alt="${String(alt || '').replace(/"/g,'&quot;')}" loading="lazy" decoding="async" data-asset-type="${normalized}" onerror="${onErrorAttribute(normalized, fb)}" />`;
}

export function cacheImage(src, type='icon'){
  const resolved = resolveAsset(src, type);
  if(imageCache.has(resolved)) return imageCache.get(resolved);
  const promise = new Promise((resolve)=>{
    if(typeof Image === 'undefined') return resolve({src:resolved, ok:true});
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve({src:resolved, ok:true});
    img.onerror = () => resolve({src:resolved, ok:false, fallback:fallback(type)});
    img.src = resolved;
  });
  imageCache.set(resolved, promise);
  return promise;
}

export async function assetExists(src, type='icon'){
  const resolved = resolveAsset(src, type);
  if(existsCache.has(resolved)) return existsCache.get(resolved);
  const result = await cacheImage(resolved, type);
  existsCache.set(resolved, !!result.ok);
  return !!result.ok;
}

export function preloadCriticalAssets(){
  const critical = [bg('cover'), bg('mainMenu'), bg('lobby'), bg('match'), fallback('club'), fallback('player'), fallback('country'), fallback('background')];
  critical.forEach(src=>cacheImage(src, 'background'));
}

export function flattenAssetMap(){
  const out = [];
  const walk = (node, prefix='')=>{
    Object.entries(node || {}).forEach(([key,value])=>{
      const next = prefix ? `${prefix}.${key}` : key;
      if(typeof value === 'string') out.push({key:next, path:value});
      else if(value && typeof value === 'object') walk(value, next);
    });
  };
  walk(map());
  return out;
}

export function assetStatusSummary(){
  const manifest = flattenAssetMap();
  const byFolder = manifest.reduce((acc,item)=>{
    const folder = item.path.split('/').slice(0,2).join('/') || 'assets';
    acc[folder] = (acc[folder] || 0) + 1;
    return acc;
  },{});
  return {total:manifest.length, byFolder, cached:imageCache.size, fallbacks:Object.keys(map().fallbacks || {}).length};
}
