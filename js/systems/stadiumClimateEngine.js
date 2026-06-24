import { esc } from '../utils/dom.js';
import { teams } from '../data/gameData.js';
import {
  STADIUM_CLIMATE_VERSION,
  STADIUM_CLIMATE_STATUS_V730,
  CLIMATE_PRESETS_V730,
  PITCH_SURFACE_PROFILES_V730,
  STADIUM_CONTEXTS_V730,
  STADIUM_CLIMATE_RULES_V730
} from '../data/stadiumClimateData.js';

const safe = value => esc(value ?? '');
const clamp = value => Math.max(0, Math.min(100, Math.round(Number(value || 0))));
const pct = value => `${clamp(value)}%`;
function byId(list, id, fallback=0){ return list.find(item => item.id === id) || list[fallback] || list[0]; }
function activeTeam(state={}){ return teams.find(team => team.id === state.clubId) || teams.find(team => team.id === 'santos') || teams[0] || { name:'Clube', stadium:'Estádio Vale' }; }
function defaultClimateForState(state={}){
  const route = state.route || 'match';
  if(route === 'training') return 'hot-afternoon';
  if(route === 'worldCompetitions') return 'altitude-dry';
  if(route === 'matchdayPremium') return 'clear-night';
  if(route === 'matchSimulation90') return 'light-rain';
  return Number(state.match?.minute || 0) >= 70 ? 'clear-night' : 'clear-day';
}
function defaultPitchForClimate(climateId){
  if(climateId === 'heavy-rain') return 'heavy-mud';
  if(climateId === 'light-rain') return 'wet-fast';
  if(climateId === 'hot-afternoon') return 'dry-fast';
  if(climateId === 'cold-wind') return 'irregular';
  return 'perfect';
}
function defaultStadiumContext(state={}){
  if(state.route === 'training') return 'training-ground';
  if((state.match?.stage || '').toLowerCase().includes('final')) return 'cup-final';
  if((state.match?.away || '').includes('palmeiras') || (state.match?.away || '').includes('corinthians') || (state.match?.away || '').includes('sao-paulo')) return 'classic-night';
  if(state.match?.home && state.clubId && state.match.home !== state.clubId) return 'away-hostile';
  return 'home-packed';
}
function climateScore(climate, pitch, stadium){
  const technical = clamp(70 + Number(climate.passing || 0) + (Number(pitch.traction || 60)-60)/2 + (Number(pitch.bounce || 60)-60)/3);
  const physical = clamp(78 + Number(climate.stamina || 0) - Number(pitch.fatigue || 0)/2);
  const spectacle = clamp(65 + Number(stadium.pressure || 0)/4 + Number(stadium.attendanceBoost || 0) + Number(climate.crowdMood || 60)/8);
  const risk = clamp(Number(climate.injuryRisk || 0) + Number(pitch.injuryRisk || 0) + Number(stadium.intimidation || 0)/8);
  return { technical, physical, spectacle, risk, overall:clamp((technical + physical + spectacle + (100-risk))/4) };
}

export function buildStadiumClimateSnapshot(state={}){
  const climate = byId(CLIMATE_PRESETS_V730, state.ui?.stadiumClimateId || defaultClimateForState(state));
  const pitch = byId(PITCH_SURFACE_PROFILES_V730, state.ui?.stadiumPitchId || defaultPitchForClimate(climate.id));
  const stadium = byId(STADIUM_CONTEXTS_V730, state.ui?.stadiumContextId || defaultStadiumContext(state));
  const team = activeTeam(state);
  const score = climateScore(climate, pitch, stadium);
  const pressureIndex = clamp(Number(stadium.pressure || 0) + Number(climate.crowdMood || 0)/6 + Number(score.risk || 0)/3);
  const matchImpact = {
    tempo: clamp(62 + Number(climate.ballSpeed || 0) + (Number(pitch.speed || 60)-60)/4),
    fatigue: clamp(35 + Math.abs(Number(climate.stamina || 0)) + Number(pitch.fatigue || 0)),
    passingQuality: score.technical,
    injuryRisk: score.risk,
    crowdPressure: pressureIndex,
    revenueBoost: Number(stadium.revenue || 0)
  };
  return {
    version: STADIUM_CLIMATE_VERSION,
    status: STADIUM_CLIMATE_STATUS_V730.status,
    route: 'stadiumClimate',
    mobileFirst: true,
    noExternalWeatherRequired: true,
    dynamicPitch: true,
    dynamicStadiumContext: true,
    tacticalImpact: true,
    safeFallback: true,
    noBlockingPopup: true,
    weatherPresetsCount: CLIMATE_PRESETS_V730.length,
    surfaceProfilesCount: PITCH_SURFACE_PROFILES_V730.length,
    stadiumContextsCount: STADIUM_CONTEXTS_V730.length,
    tacticalRulesCount: STADIUM_CLIMATE_RULES_V730.length,
    allPresetsHaveImpacts: CLIMATE_PRESETS_V730.every(c => ['ballSpeed','stamina','passing','injuryRisk','crowdMood'].every(key => Object.prototype.hasOwnProperty.call(c,key))),
    allSurfacesHavePhysics: PITCH_SURFACE_PROFILES_V730.every(p => ['traction','drainage','speed','bounce','fatigue','injuryRisk'].every(key => Object.prototype.hasOwnProperty.call(p,key))),
    context: {
      club: team.name,
      stadiumName: team.stadium || 'Estádio Vale',
      selectedClimate: climate,
      selectedPitch: pitch,
      selectedStadium: stadium,
      score,
      matchImpact,
      headline: `${climate.icon} ${climate.title} · ${pitch.title}`,
      tacticalAdvice: buildClimateAdvice(climate, pitch, stadium),
      routeHint: climate.route || 'match'
    }
  };
}

export function buildClimateAdvice(climate, pitch, stadium){
  const advice = [];
  if(Number(climate.rain || 0) >= 50 || pitch.id === 'heavy-mud') advice.push('Use bola parada, cruzamento e menos saída curta arriscada.');
  if(Number(climate.temperature || 20) >= 31 || climate.id === 'altitude-dry') advice.push('Planeje substituições cedo e evite pressão alta o jogo todo.');
  if(Number(climate.wind || 0) >= 25) advice.push('Cuidado com lançamento longo, bola aérea e chute de longe.');
  if(Number(stadium.pressure || 0) >= 90) advice.push('Líderes e capitão ganham peso emocional na partida.');
  if(Number(pitch.speed || 60) >= 85) advice.push('Transições e pontas rápidos ficam mais perigosos.');
  return advice.length ? advice.join(' ') : 'Cenário equilibrado: mantenha plano principal e ajuste pelo momentum.';
}

export function renderStadiumClimateStrip(state={}){
  const snap = buildStadiumClimateSnapshot(state);
  const c = snap.context;
  return `<section class="stadium-climate-v730-strip panel">
    <div><span class="tag">v7.3 · Clima e gramado</span><h3>${safe(c.headline)}</h3><p class="small">${safe(c.stadiumName)} · tempo ${pct(c.matchImpact.tempo)} · risco ${pct(c.matchImpact.injuryRisk)} · pressão ${pct(c.matchImpact.crowdPressure)}</p></div>
    <div class="row gap"><button class="secondary-btn mini" data-route="stadiumClimate">Ajustar clima</button><button class="secondary-btn mini" data-route="formation">Plano tático</button></div>
  </section>`;
}

export function renderStadiumClimateCenter(state={}){
  const snap = buildStadiumClimateSnapshot(state);
  const c = snap.context;
  const climateCards = CLIMATE_PRESETS_V730.map(item => `<article class="card climate-card-v730 ${item.id===c.selectedClimate.id?'active':''}"><div class="row space"><div><span class="tag">${safe(item.icon)} ${safe(item.title)}</span><h3>${safe(item.note)}</h3></div><span class="status-pill">${item.temperature}°C</span></div><div class="climate-bars-v730"><div><span>Chuva</span><b style="width:${pct(item.rain)}"></b><em>${pct(item.rain)}</em></div><div><span>Vento</span><b style="width:${pct(item.wind*2)}"></b><em>${item.wind} km/h</em></div><div><span>Passe</span><b style="width:${pct(60+item.passing)}"></b><em>${item.passing>0?'+':''}${item.passing}</em></div></div><button class="secondary-btn mini" data-action="set-ui" data-ui-key="stadiumClimateId" data-ui-value="${safe(item.id)}">Usar clima</button></article>`).join('');
  const pitchCards = PITCH_SURFACE_PROFILES_V730.map(item => `<article class="card pitch-card-v730 ${item.id===c.selectedPitch.id?'active':''}"><div class="row space"><div><span class="tag">${safe(item.icon)} ${safe(item.title)}</span><h3>${safe(item.style)}</h3></div><span class="status-pill">risco ${pct(item.injuryRisk)}</span></div><div class="grid compact-stats"><div class="stat-line"><span>Tração</span><strong>${pct(item.traction)}</strong></div><div class="stat-line"><span>Drenagem</span><strong>${pct(item.drainage)}</strong></div><div class="stat-line"><span>Velocidade</span><strong>${pct(item.speed)}</strong></div><div class="stat-line"><span>Quique</span><strong>${pct(item.bounce)}</strong></div></div><button class="secondary-btn mini" data-action="set-ui" data-ui-key="stadiumPitchId" data-ui-value="${safe(item.id)}">Usar gramado</button></article>`).join('');
  const stadiumCards = STADIUM_CONTEXTS_V730.map(item => `<article class="card stadium-context-v730 ${item.id===c.selectedStadium.id?'active':''}"><div class="row space"><div><span class="tag">${safe(item.icon)} ${safe(item.title)}</span><h3>${safe(item.mood)}</h3></div><span class="status-pill">pressão ${pct(item.pressure)}</span></div><div class="stat-line"><span>Receita</span><strong>${item.revenue>0?'+':''}${item.revenue}%</strong></div><div class="stat-line"><span>Intimidação</span><strong>${pct(item.intimidation)}</strong></div><button class="secondary-btn mini" data-action="set-ui" data-ui-key="stadiumContextId" data-ui-value="${safe(item.id)}">Usar contexto</button></article>`).join('');
  const rules = STADIUM_CLIMATE_RULES_V730.map(rule => `<div class="news-item"><strong>${safe(rule.title)}</strong><span>${safe(rule.advice)}</span><small>Bom: ${safe(rule.good.join(', '))} · Ruim: ${safe(rule.bad.join(', '))}</small></div>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="stadium-climate-shell-v730">
    <section class="panel stadium-climate-hero-v730"><div><span class="tag">${safe(STADIUM_CLIMATE_STATUS_V730.phase)}</span><h1>${safe(STADIUM_CLIMATE_STATUS_V730.label)}</h1><p class="subtitle">Clima, horário, estádio e gramado agora entram na leitura da partida sem depender de internet ou API externa. Tudo funciona com fallback seguro e escolha manual mobile-first.</p></div><div class="row gap"><button class="main-btn" data-route="match">Testar na partida</button><button class="secondary-btn" data-route="matchSimulation90">Simulação 90</button><button class="secondary-btn" data-route="soundAmbience">Sons</button></div></section>

    <section class="grid desktop-4"><div class="card kpi-card"><span>Clima atual</span><strong>${safe(c.selectedClimate.icon)} ${safe(c.selectedClimate.title)}</strong><small>${safe(c.selectedClimate.temperature)}°C · umidade ${pct(c.selectedClimate.humidity)}</small></div><div class="card kpi-card"><span>Gramado</span><strong>${safe(c.selectedPitch.title)}</strong><small>${safe(c.selectedPitch.style)}</small></div><div class="card kpi-card"><span>Estádio</span><strong>${safe(c.selectedStadium.title)}</strong><small>${safe(c.stadiumName)}</small></div><div class="card kpi-card"><span>Leitura geral</span><strong>${pct(c.score.overall)}</strong><small>técnica ${pct(c.score.technical)} · físico ${pct(c.score.physical)}</small></div></section>

    <section class="panel"><div class="row space"><div><span class="tag">Impacto tático</span><h2>Leitura do treinador</h2></div><span class="status-pill">${safe(snap.status)}</span></div><p class="alert"><b>Conselho:</b> ${safe(c.tacticalAdvice)}</p><div class="grid desktop-4"><div class="stat-line"><span>Ritmo da bola</span><strong>${pct(c.matchImpact.tempo)}</strong></div><div class="stat-line"><span>Fadiga</span><strong>${pct(c.matchImpact.fatigue)}</strong></div><div class="stat-line"><span>Qualidade de passe</span><strong>${pct(c.matchImpact.passingQuality)}</strong></div><div class="stat-line"><span>Pressão ambiente</span><strong>${pct(c.matchImpact.crowdPressure)}</strong></div></div></section>

    <section class="panel"><div class="row space"><div><span class="tag">Clima</span><h2>Escolha o cenário</h2></div><span class="status-pill">offline seguro</span></div><div class="climate-grid-v730">${climateCards}</div></section>
    <section class="panel"><div class="row space"><div><span class="tag">Gramado</span><h2>Física do campo</h2></div><span class="status-pill">dinâmico</span></div><div class="climate-grid-v730">${pitchCards}</div></section>
    <section class="panel"><div class="row space"><div><span class="tag">Estádio</span><h2>Pressão e renda</h2></div><span class="status-pill">contexto</span></div><div class="climate-grid-v730">${stadiumCards}</div></section>

    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Regras</span><h2>Como afeta o jogo</h2></div><span class="status-pill">tático</span></div><div class="news-list compact">${rules}</div></article><article class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação v7.3.0</h2></div><span class="status-pill">anti-quebra</span></div><textarea class="code-box" readonly>${safe(report)}</textarea></article></section>
  </section>`;
}
