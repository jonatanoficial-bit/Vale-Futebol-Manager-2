import { esc } from '../utils/dom.js';
import { activateSoundAmbiencePreset, stopSoundAmbience } from './soundAmbienceEngine.js';
import {
 REAL_AUDIO_PACK_VERSION,
 REAL_AUDIO_PACK_STATUS_V720,
 REAL_AUDIO_ASSET_ROOT_V720,
 REAL_AUDIO_TRACKS_V720,
 REAL_AUDIO_FORMAT_RULES_V720,
 REAL_AUDIO_IMPORT_STEPS_V720,
 REAL_AUDIO_SAFETY_RULES_V720
} from '../data/realAudioPackData.js';

const safe = value => esc(value ?? '');
const pct = value => `${Math.max(0, Math.min(100, Math.round(Number(value || 0))))}%`;
let realAudioRuntime = { active:false, activeTrack:null, activePath:null, mode:'silent', lastError:null, detected:{}, element:null, scanCompleted:false };

function browserAudioAvailable(){ return typeof window !== 'undefined' && typeof Audio !== 'undefined'; }
function trackById(id){ return REAL_AUDIO_TRACKS_V720.find(track => track.id === id) || REAL_AUDIO_TRACKS_V720[0]; }
function chooseTrackForRoute(route='match'){
 return REAL_AUDIO_TRACKS_V720.find(track => (track.contextRoutes || []).includes(route)) || REAL_AUDIO_TRACKS_V720[0];
}
function safeVolume(value){ return Math.max(0.02, Math.min(0.38, Number(value || 20) / 100)); }

async function probePath(path){
 if(typeof fetch !== 'function') return false;
 try{
  const res = await fetch(path, { method:'HEAD', cache:'no-store' });
  if(res.ok) return true;
 }catch(err){}
 try{
  const res = await fetch(path, { method:'GET', cache:'no-store' });
  return Boolean(res.ok);
 }catch(err){ return false; }
}

export async function scanRealAudioAssets(){
 const detected = {};
 for(const track of REAL_AUDIO_TRACKS_V720){
  let found = null;
  for(const path of track.paths || []){
   const ok = await probePath(path);
   if(ok){ found = path; break; }
  }
  detected[track.id] = { found:Boolean(found), path:found, fallbackPreset:track.fallbackPreset };
 }
 realAudioRuntime.detected = detected;
 realAudioRuntime.scanCompleted = true;
 return { ok:true, detected, foundCount:Object.values(detected).filter(x=>x.found).length, total:REAL_AUDIO_TRACKS_V720.length };
}

export function stopRealAudioPack(){
 try{
  if(realAudioRuntime.element){
   realAudioRuntime.element.pause();
   realAudioRuntime.element.removeAttribute('src');
   realAudioRuntime.element.load?.();
  }
 }catch(err){ realAudioRuntime.lastError = err?.message || String(err); }
 realAudioRuntime.element = null;
 realAudioRuntime.active = false;
 realAudioRuntime.activeTrack = null;
 realAudioRuntime.activePath = null;
 realAudioRuntime.mode = 'silent';
 stopSoundAmbience();
 return { ok:true, status:'real-audio-stopped' };
}

export async function playRealAudioCue(trackId='crowd-home'){
 const track = trackById(trackId);
 if(!browserAudioAvailable()){
  realAudioRuntime.lastError = 'HTMLAudio indisponível; fallback WebAudio acionado.';
  const fallback = await activateSoundAmbiencePreset(track.fallbackPreset || 'stadium-home');
  realAudioRuntime.mode = 'webaudio-fallback';
  realAudioRuntime.activeTrack = track.id;
  return { ok:fallback.ok, status:'fallback-webaudio', track:track.id, fallbackPreset:track.fallbackPreset, message:realAudioRuntime.lastError };
 }
 try{
  stopRealAudioPack();
  const known = realAudioRuntime.detected?.[track.id];
  const candidatePaths = known?.path ? [known.path] : (track.paths || []);
  for(const path of candidatePaths){
   try{
    const audio = new Audio(path);
    audio.loop = Boolean(track.loop);
    audio.preload = 'auto';
    audio.volume = safeVolume(track.volume);
    await audio.play();
    realAudioRuntime.element = audio;
    realAudioRuntime.active = true;
    realAudioRuntime.activeTrack = track.id;
    realAudioRuntime.activePath = path;
    realAudioRuntime.mode = 'file';
    realAudioRuntime.lastError = null;
    return { ok:true, status:'real-audio-playing', track:track.id, path, loop:track.loop };
   }catch(err){ realAudioRuntime.lastError = err?.message || String(err); }
  }
  const fallback = await activateSoundAmbiencePreset(track.fallbackPreset || 'stadium-home');
  realAudioRuntime.active = Boolean(fallback.ok);
  realAudioRuntime.activeTrack = track.id;
  realAudioRuntime.activePath = null;
  realAudioRuntime.mode = 'webaudio-fallback';
  return { ok:fallback.ok, status:'fallback-webaudio', track:track.id, fallbackPreset:track.fallbackPreset, message:'Arquivo real ausente ou bloqueado; fallback seguro usado.' };
 }catch(err){
  realAudioRuntime.lastError = err?.message || String(err);
  stopRealAudioPack();
  return { ok:false, status:'real-audio-failed-safe', track:track.id, message:realAudioRuntime.lastError };
 }
}

export function realAudioRuntimeStatus(){
 return {
  active: realAudioRuntime.active,
  activeTrack: realAudioRuntime.activeTrack,
  activePath: realAudioRuntime.activePath,
  mode: realAudioRuntime.mode,
  lastError: realAudioRuntime.lastError,
  scanCompleted: realAudioRuntime.scanCompleted,
  detected: realAudioRuntime.detected,
  browserAudioAvailable: browserAudioAvailable()
 };
}

export function buildRealAudioPackSnapshot(state={}){
 const route = state.route || 'match';
 const recommended = chooseTrackForRoute(route);
 const runtime = realAudioRuntimeStatus();
 const foundCount = Object.values(runtime.detected || {}).filter(item => item?.found).length;
 const optionalCount = REAL_AUDIO_TRACKS_V720.length;
 const maxVolume = Math.max(...REAL_AUDIO_TRACKS_V720.map(track => Number(track.volume || 0)));
 const allHaveFallback = REAL_AUDIO_TRACKS_V720.every(track => Boolean(track.fallbackPreset));
 const allHavePaths = REAL_AUDIO_TRACKS_V720.every(track => Array.isArray(track.paths) && track.paths.length >= 2);
 return {
  version: REAL_AUDIO_PACK_VERSION,
  status: REAL_AUDIO_PACK_STATUS_V720.status,
  route: 'realAudioPack',
  mobileFirst: true,
  optionalAudio: true,
  userGestureRequired: true,
  noAutoplay: true,
  fallbackWebAudio: true,
  noExternalAudioRequired: true,
  safeStopControl: true,
  listaRoot: REAL_AUDIO_ASSET_ROOT_V720,
  optionalTracksCount: optionalCount,
  detectedTracksCount: foundCount,
  formatsCount: REAL_AUDIO_FORMAT_RULES_V720.length,
  importStepsCount: REAL_AUDIO_IMPORT_STEPS_V720.length,
  safetyRulesCount: REAL_AUDIO_SAFETY_RULES_V720.length,
  volumeSafe: maxVolume <= 40,
  allHaveFallback,
  allHavePaths,
  noBlockingPopup: true,
  runtime,
  context: {
   currentRoute: route,
   recommendedTrack: recommended.id,
   recommendedTitle: recommended.title,
   recommendedCategory: recommended.category,
   recommendedVolume: recommended.volume,
   recommendedFallback: recommended.fallbackPreset,
   recommendedPaths: recommended.paths,
   activeTrack: runtime.activeTrack || 'nenhum',
   activeMode: runtime.mode,
   scanLabel: runtime.scanCompleted ? `${foundCount}/${optionalCount} encontrados` : 'aguardando varredura'
  }
 };
}

export function renderRealAudioPackStrip(state={}){
 const snap = buildRealAudioPackSnapshot(state);
 const c = snap.context;
 return `<section class="real-audio--strip panel">
  <div><span class="tag">Efeitos reais opcionais</span><h3>${safe(c.recommendedTitle)}</h3><p class="small">${safe(c.recommendedCategory)} · ${safe(c.scanLabel)} · fallback ${safe(c.recommendedFallback)}</p></div>
  <div class="real-audio--actions"><button class="main-btn mini" data-action="real-audio-play" data-cue="${safe(c.recommendedTrack)}">Tocar real/fallback</button><button class="secondary-btn mini" data-action="real-audio-stop">Parar</button><button class="secondary-btn mini" data-route="realAudioPack">Pacote</button></div>
 </section>`;
}

export function renderRealAudioPackCenter(state={}){
 const snap = buildRealAudioPackSnapshot(state);
 const c = snap.context;
 const runtime = snap.runtime;
 const tracks = REAL_AUDIO_TRACKS_V720.map(track => {
  const detected = runtime.detected?.[track.id];
  const badge = detected?.found ? 'arquivo detectado' : 'fallback seguro';
  const paths = (track.paths || []).map(path => `<code>${safe(path)}</code>`).join('<br>');
  return `<article class="card real-track- ${detected?.found?'found':'fallback'}"><div class="row space"><div><span class="tag">${safe(track.category)} · ${track.loop?'loop':'efeito curto'}</span><h3>${safe(track.title)}</h3></div><span class="status-pill">${safe(badge)}</span></div><p>${safe(track.mood)} · volume ${pct(track.volume)} · ${safe(track.durationHint)}</p><div class="real-paths-">${paths}</div><div class="row gap"><button class="main-btn mini" data-action="real-audio-play" data-cue="${safe(track.id)}">Tocar</button><button class="secondary-btn mini" data-route="${safe((track.contextRoutes||['match'])[0])}">Contexto</button></div></article>`;
 }).join('');
 const formats = REAL_AUDIO_FORMAT_RULES_V720.map(rule => `<div class="stat-line"><span>${safe(rule.title)}</span><strong>OK</strong><small>${safe(rule.rule)}</small></div>`).join('');
 const steps = REAL_AUDIO_IMPORT_STEPS_V720.map((step,index)=>`<li><strong>${index+1}.</strong> ${safe(step)}</li>`).join('');
 const safety = REAL_AUDIO_SAFETY_RULES_V720.map(rule => `<div class="news-item"><strong>Regra</strong><span>${safe(rule)}</span></div>`).join('');
 const lista = JSON.stringify({ version:REAL_AUDIO_PACK_VERSION, root:REAL_AUDIO_ASSET_ROOT_V720, tracks:REAL_AUDIO_TRACKS_V720.map(t=>({id:t.id,title:t.title,loop:t.loop,volume:t.volume,paths:t.paths,fallbackPreset:t.fallbackPreset})) }, null, 2);
 const report = JSON.stringify(snap, null, 2);
 return `<section class="real-audio-shell-">
  <section class="panel real-audio-hero-"><div><span class="tag">${safe(REAL_AUDIO_PACK_STATUS_V720.phase)}</span><h1>${safe(REAL_AUDIO_PACK_STATUS_V720.label)}</h1><p class="subtitle">Agora o jogo aceita MP3/WAV/OGG reais de torcida, apito, estádio, trilha e interface. Se o arquivo ainda não existir, o fallback WebAudio entra automaticamente sem quebrar a partida.</p></div><div class="row gap"><button class="main-btn" data-action="real-audio-play" data-cue="${safe(c.recommendedTrack)}">Tocar recomendado</button><button class="secondary-btn" data-action="real-audio-scan">Verificar arquivos</button><button class="secondary-btn danger" data-action="real-audio-stop">Parar tudo</button></div></section>

  <section class="grid desktop-4"><div class="card kpi-card"><span>Recomendado</span><strong>${safe(c.recommendedTitle)}</strong><small>${safe(c.recommendedCategory)} · ${safe(c.recommendedFallback)}</small></div><div class="card kpi-card"><span>Arquivos detectados</span><strong>${safe(c.scanLabel)}</strong><small>todos são opcionais</small></div><div class="card kpi-card"><span>Modo ativo</span><strong>${safe(c.activeMode)}</strong><small>${safe(c.activeTrack)}</small></div><div class="card kpi-card"><span>Segurança</span><strong>${snap.volumeSafe?'OK':'Revisar'}</strong><small>sem autoplay · toque obrigatório</small></div></section>

  <section class="panel"><div class="row space"><div><span class="tag">Manifest de áudio</span><h2>Arquivos reais aceitos</h2></div><button class="secondary-btn mini" data-action="real-audio-scan">Escanear</button></div><div class="real-track-grid-">${tracks}</div></section>

  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Formatos</span><h2>Compatibilidade mobile</h2></div><span class="status-pill">MP3 recomendado</span></div>${formats}</article><article class="panel"><div class="row space"><div><span class="tag">Importação</span><h2>Como inserir seus sons</h2></div><button class="secondary-btn mini" data-route="settings">Configurações</button></div><ul class="real-steps-">${steps}</ul></article></section>

  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Segurança</span><h2>Regras de segurança</h2></div><span class="status-pill">fallback ativo</span></div><div class="news-list compact">${safety}</div></article><article class="panel"><div class="row space"><div><span class="tag">Manifest JSON</span><h2>Mapa técnico</h2></div><span class="status-pill">assets/audio</span></div><textarea class="code-box" readonly>${safe(lista)}</textarea></article></section>

  <section class="panel"><div class="row space"><div><span class="tag">Resumo</span><h2>Validação </h2></div><span class="status-pill">${safe(snap.status)}</span></div><textarea class="code-box" readonly>${safe(report)}</textarea></section>
 </section>`;
}
