import { bg, fallback } from './assets.js';
let library = null;
const broken = new Set();
function todaySeed(){
  const d = new Date();
  return Number(`${d.getUTCFullYear()}${String(d.getUTCMonth()+1).padStart(2,'0')}${String(d.getUTCDate()).padStart(2,'0')}`);
}
function hash(input=''){
  let h = 0;
  for(let i=0;i<String(input).length;i++) h = ((h<<5)-h) + String(input).charCodeAt(i) | 0;
  return Math.abs(h);
}
export async function loadVisualLibrary(){
  try{
    const res = await fetch('data/asset-library.json', {cache:'no-store'});
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    library = await res.json();
  }catch(err){
    console.warn('[VFM] biblioteca visual fallback ativado', err);
    library = {version:'fallback', backgrounds:{}, routeAliases:{}};
  }
  return library;
}
export function visualLibrary(){ return library || {backgrounds:{}, routeAliases:{}}; }
export function routeVisualKey(route='lobby'){
  const lib = visualLibrary();
  return lib.routeAliases?.[route] || route;
}
export function getVisualAsset(route='lobby', context={}){
  const lib = visualLibrary();
  const key = routeVisualKey(route);
  const candidates = Array.isArray(lib.backgrounds?.[key]) ? lib.backgrounds[key] : [];
  const clean = candidates.filter(Boolean).filter(p=>!broken.has(p));
  if(!clean.length) return bg(route) || fallback('background');
  const dynamic = context.dynamic !== false && localStorage.getItem('vfm_visual_rotation') !== 'off';
  const index = dynamic ? ((todaySeed() + hash(route) + hash(context.mood || '') + hash(context.event || '')) % clean.length) : 0;
  return clean[index] || clean[0] || bg(route) || fallback('background');
}
export function visualBackground(route='lobby', context={}){ return getVisualAsset(route, context); }
export function markVisualBroken(path=''){ if(path) broken.add(path); }
export function visualSummary(){
  const lib = visualLibrary();
  const backgrounds = lib.backgrounds || {};
  const categories = Object.keys(backgrounds).map(key=>({key,total:(backgrounds[key]||[]).length,first:(backgrounds[key]||[])[0]}));
  const clubCountries = Object.keys(lib.clubs || {}).length;
  const clubs = Object.values(lib.clubs || {}).reduce((n,country)=>n+Object.keys(country||{}).length,0);
  const leagues = Object.keys(lib.leagues || {}).length;
  const countries = Object.keys(lib.countries || {}).length;
  return {version:lib.version || 'fallback', categories, clubs, clubCountries, leagues, countries, broken:broken.size};
}
export function setVisualRotation(enabled=true){ localStorage.setItem('vfm_visual_rotation', enabled ? 'on':'off'); }
