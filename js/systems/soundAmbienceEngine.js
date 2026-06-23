import { esc } from '../utils/dom.js';
import {
  SOUND_AMBIENCE_VERSION,
  SOUND_AMBIENCE_STATUS_V710,
  AMBIENCE_PRESETS_V710,
  SOUND_CHANNELS_V710,
  MATCH_SOUND_EVENTS_V710,
  AUDIO_ACCESSIBILITY_RULES_V710,
  SOUND_MIX_RULES_V710
} from '../data/soundAmbienceData.js';

const safe = value => esc(value ?? '');
const pct = value => `${Math.max(0, Math.min(100, Math.round(Number(value || 0))))}%`;
let audioRuntime = { ctx:null, master:null, nodes:[], activePreset:null, active:false, lastError:null };

function getAudioContextClass(){
  if(typeof window === 'undefined') return null;
  return window.AudioContext || window.webkitAudioContext || null;
}

function selectedPreset(id){
  return AMBIENCE_PRESETS_V710.find(p => p.id === id) || AMBIENCE_PRESETS_V710[0];
}

function safeVolume(value){
  return Math.max(0.02, Math.min(0.38, Number(value || 20) / 100));
}

function makeNoiseBuffer(ctx){
  const length = Math.max(1, Math.floor(ctx.sampleRate * 1.2));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<length;i+=1){ data[i] = (Math.random() * 2 - 1) * 0.18; }
  return buffer;
}

function connectTone(ctx, destination, freq, gainValue, type='sine'){
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainValue;
  osc.connect(gain).connect(destination);
  osc.start();
  audioRuntime.nodes.push(osc, gain);
  return osc;
}

function connectNoise(ctx, destination, gainValue){
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  source.buffer = makeNoiseBuffer(ctx);
  source.loop = true;
  filter.type = 'lowpass';
  filter.frequency.value = 720;
  gain.gain.value = gainValue;
  source.connect(filter).connect(gain).connect(destination);
  source.start();
  audioRuntime.nodes.push(source, filter, gain);
  return source;
}

export function stopSoundAmbience(){
  try{
    audioRuntime.nodes.forEach(node => { try{ if(node.stop) node.stop(); if(node.disconnect) node.disconnect(); }catch(err){} });
    if(audioRuntime.master?.disconnect) audioRuntime.master.disconnect();
  }catch(err){ audioRuntime.lastError = err?.message || String(err); }
  audioRuntime.nodes = [];
  audioRuntime.master = null;
  audioRuntime.activePreset = null;
  audioRuntime.active = false;
  return {ok:true, status:'sound-stopped'};
}

export async function activateSoundAmbiencePreset(presetId='stadium-home'){
  const AudioCtx = getAudioContextClass();
  const preset = selectedPreset(presetId);
  if(!AudioCtx){
    audioRuntime.lastError = 'WebAudio indisponível neste navegador.';
    return {ok:false, status:'audio-unavailable', preset:preset.id, message:audioRuntime.lastError};
  }
  try{
    stopSoundAmbience();
    const ctx = audioRuntime.ctx || new AudioCtx();
    audioRuntime.ctx = ctx;
    if(ctx.state === 'suspended') await ctx.resume();
    const master = ctx.createGain();
    master.gain.value = safeVolume(preset.volume);
    master.connect(ctx.destination);
    audioRuntime.master = master;
    if(Number(preset.crowd || 0) > 0) connectNoise(ctx, master, Math.min(.22, Number(preset.crowd)/520));
    if(Number(preset.tension || 0) > 0) connectTone(ctx, master, 48 + Number(preset.tension)/2.4, Math.min(.08, Number(preset.tension)/1600), 'sine');
    if(Number(preset.tempo || 0) > 0) connectTone(ctx, master, 96 + Number(preset.tempo)/1.8, Math.min(.045, Number(preset.tempo)/2400), 'triangle');
    if(Number(preset.whistle || 0) > 0){
      const whistle = connectTone(ctx, master, 880, Math.min(.025, Number(preset.whistle)/2200), 'sine');
      setTimeout(()=>{ try{ whistle.stop(); }catch(err){} }, 180);
    }
    audioRuntime.activePreset = preset.id;
    audioRuntime.active = true;
    audioRuntime.lastError = null;
    return {ok:true, status:'sound-playing', preset:preset.id, label:preset.title};
  }catch(err){
    audioRuntime.lastError = err?.message || String(err);
    stopSoundAmbience();
    return {ok:false, status:'sound-failed-safe', preset:preset.id, message:audioRuntime.lastError};
  }
}

export function soundAmbienceRuntimeStatus(){
  return {
    active: audioRuntime.active,
    activePreset: audioRuntime.activePreset,
    lastError: audioRuntime.lastError,
    webAudioAvailable: Boolean(getAudioContextClass())
  };
}

export function buildSoundAmbienceSnapshot(state={}){
  const minute = Math.max(1, Math.min(90, Math.round(Number(state.match?.minute || 1))));
  const presetId = state.ui?.soundPreset || (minute >= 75 ? 'final-pressure' : state.route === 'emotionalBoard' ? 'board-room' : state.route === 'training' ? 'training-ground' : 'stadium-home');
  const preset = selectedPreset(presetId);
  const runtime = soundAmbienceRuntimeStatus();
  return {
    version: SOUND_AMBIENCE_VERSION,
    status: SOUND_AMBIENCE_STATUS_V710.status,
    route: 'soundAmbience',
    mobileFirst: true,
    offlineReady: true,
    userGestureRequired: true,
    noAutoplay: true,
    noExternalAudioRequired: true,
    volumeSafe: preset.volume <= 38,
    noBlockingPopup: true,
    presetsCount: AMBIENCE_PRESETS_V710.length,
    channelsCount: SOUND_CHANNELS_V710.length,
    eventsCount: MATCH_SOUND_EVENTS_V710.length,
    accessibilityRulesCount: AUDIO_ACCESSIBILITY_RULES_V710.length,
    mixRulesCount: SOUND_MIX_RULES_V710.length,
    runtime,
    context: {
      minute,
      recommendedPreset: preset.id,
      recommendedTitle: preset.title,
      recommendedMood: preset.mood,
      recommendedVolume: preset.volume,
      recommendedRoute: preset.route,
      description: preset.description,
      activePreset: runtime.activePreset || 'nenhum',
      webAudioAvailable: runtime.webAudioAvailable
    }
  };
}

export function renderSoundAmbienceStrip(state={}){
  const snap = buildSoundAmbienceSnapshot(state);
  const c = snap.context;
  return `<section class="sound-v710-strip panel">
    <div><span class="tag">v7.1 · Sons e torcida</span><h3>${safe(c.recommendedTitle)}</h3><p class="small">${safe(c.recommendedMood)} · volume seguro ${pct(c.recommendedVolume)} · ${c.webAudioAvailable ? 'WebAudio pronto' : 'modo silencioso seguro'}</p></div>
    <div class="sound-v710-actions"><button class="main-btn mini" data-action="sound-ambience-play" data-preset="${safe(c.recommendedPreset)}">Ativar clima</button><button class="secondary-btn mini" data-action="sound-ambience-stop">Parar som</button><button class="secondary-btn mini" data-route="soundAmbience">Central</button></div>
  </section>`;
}

export function renderSoundAmbienceCenter(state={}){
  const snap = buildSoundAmbienceSnapshot(state);
  const c = snap.context;
  const presets = AMBIENCE_PRESETS_V710.map(p=>`<article class="card sound-preset-v710 ${p.id===c.recommendedPreset?'recommended':''}"><div class="row space"><strong>${safe(p.title)}</strong><span>${pct(p.volume)}</span></div><p>${safe(p.description)}</p><div class="sound-bars-v710"><span style="height:${pct(p.crowd)}"></span><span style="height:${pct(p.tension)}"></span><span style="height:${pct(p.whistle)}"></span><span style="height:${pct(p.tempo)}"></span></div><small>${safe(p.mood)}</small><div class="row gap"><button class="main-btn mini" data-action="sound-ambience-play" data-preset="${safe(p.id)}">Tocar</button><button class="secondary-btn mini" data-route="${safe(p.route)}">Usar no contexto</button></div></article>`).join('');
  const channels = SOUND_CHANNELS_V710.map(ch=>`<div class="stat-line"><span>${safe(ch.title)}</span><strong>${pct(ch.safeVolume)}</strong><small>${safe(ch.purpose)}</small></div>`).join('');
  const events = MATCH_SOUND_EVENTS_V710.map(e=>`<div class="news-item"><strong>${safe(e.minute)}' · ${safe(e.title)}</strong><span>${safe(e.trigger)} · preset ${safe(e.preset)} · intensidade ${pct(e.intensity)}</span></div>`).join('');
  const rules = AUDIO_ACCESSIBILITY_RULES_V710.map(r=>`<li>${safe(r)}</li>`).join('');
  const mixRules = SOUND_MIX_RULES_V710.map(r=>`<div class="news-item"><strong>${safe(r.title)}</strong><span>${safe(r.rule)}</span></div>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="sound-ambience-shell-v710">
    <section class="panel sound-hero-v710">
      <div><span class="tag">${safe(SOUND_AMBIENCE_STATUS_V710.phase)}</span><h1>${safe(SOUND_AMBIENCE_STATUS_V710.label)}</h1><p class="subtitle">Ambiência leve para estádio vivo: torcida, apito, tensão, treino e sala da diretoria com WebAudio gerado no navegador, sem MP3 obrigatório e sem autoplay.</p></div>
      <div class="row gap"><button class="main-btn" data-action="sound-ambience-play" data-preset="${safe(c.recommendedPreset)}">Ativar recomendado</button><button class="secondary-btn" data-action="sound-ambience-stop">Parar som</button><button class="secondary-btn" data-route="match">Partida</button></div>
    </section>

    <section class="grid desktop-4"><div class="card kpi-card"><span>Preset recomendado</span><strong>${safe(c.recommendedTitle)}</strong><small>${safe(c.description)}</small></div><div class="card kpi-card"><span>Volume seguro</span><strong>${pct(c.recommendedVolume)}</strong><div class="meter"><span style="width:${pct(c.recommendedVolume)}"></span></div></div><div class="card kpi-card"><span>Áudio ativo</span><strong>${safe(c.activePreset)}</strong><small>${snap.runtime.active ? 'rodando após toque do usuário' : 'silencioso até o jogador ativar'}</small></div><div class="card kpi-card"><span>Compatibilidade</span><strong>${c.webAudioAvailable ? 'OK' : 'fallback'}</strong><small>se falhar, o jogo continua normal</small></div></section>

    <section class="panel"><div class="row space"><div><span class="tag">Presets</span><h2>Climas sonoros do jogo</h2></div><button class="secondary-btn mini" data-action="sound-ambience-stop">Silenciar</button></div><div class="sound-preset-grid-v710">${presets}</div></section>

    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Canais</span><h2>Mesa de som leve</h2></div><span class="status-pill">mobile safe</span></div>${channels}</article><article class="panel"><div class="row space"><div><span class="tag">Eventos</span><h2>Gatilhos de partida</h2></div><button class="secondary-btn mini" data-route="matchSimulation90">90 min</button></div><div class="news-list compact">${events}</div></article></section>

    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Acessibilidade</span><h2>Regras anti-incômodo</h2></div><button class="secondary-btn mini" data-route="settings">Configurações</button></div><ul class="small-list sound-rules-v710">${rules}</ul></article><article class="panel"><div class="row space"><div><span class="tag">Mixagem</span><h2>Regras comerciais</h2></div><span class="status-pill">sem arquivo pesado</span></div><div class="news-list compact">${mixRules}</div></article></section>

    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação v7.1.0</h2></div><span class="status-pill">${safe(snap.status)}</span></div><textarea class="code-box" readonly>${safe(report)}</textarea></section>
  </section>`;
}
