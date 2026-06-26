export const STADIUM_CLIMATE_VERSION = 'v7.3.0';

export const STADIUM_CLIMATE_STATUS_V730 = {
  label: 'Clima, Estádio e Gramado Dinâmicos',
  status: 'stadium-climate-ready',
  phase: 'Clima e gramado',
  build: 'v7.3.0'
};

export const CLIMATE_PRESETS_V730 = [
  { id:'clear-day', title:'Dia aberto', icon:'☀️', temperature:27, humidity:42, wind:12, rain:0, visibility:96, ballSpeed:8, stamina:-2, passing:6, injuryRisk:2, crowdMood:74, route:'match', note:'gramado rápido, bom passe e torcida mais presente.' },
  { id:'clear-night', title:'Noite limpa', icon:'🌙', temperature:21, humidity:51, wind:8, rain:0, visibility:90, ballSpeed:5, stamina:2, passing:5, injuryRisk:1, crowdMood:82, route:'matchdayPremium', note:'ambiente premium para clássico ou jogo decisivo.' },
  { id:'light-rain', title:'Chuva leve', icon:'🌦️', temperature:20, humidity:78, wind:15, rain:28, visibility:73, ballSpeed:-4, stamina:-5, passing:-5, injuryRisk:8, crowdMood:68, route:'matchSimulation90', note:'bola mais viva em alguns setores e erros técnicos controlados.' },
  { id:'heavy-rain', title:'Chuva forte', icon:'🌧️', temperature:18, humidity:92, wind:22, rain:76, visibility:52, ballSpeed:-13, stamina:-10, passing:-14, injuryRisk:17, crowdMood:61, route:'matchSimulation90', note:'partida truncada, cruzamentos perigosos e risco de escorregão.' },
  { id:'hot-afternoon', title:'Calor de tarde', icon:'🔥', temperature:34, humidity:58, wind:9, rain:0, visibility:88, ballSpeed:3, stamina:-16, passing:1, injuryRisk:11, crowdMood:70, route:'training', note:'cobra rotação, hidratação e menor pressão alta por 90 minutos.' },
  { id:'cold-wind', title:'Frio com vento', icon:'💨', temperature:11, humidity:64, wind:34, rain:4, visibility:70, ballSpeed:-7, stamina:-4, passing:-10, injuryRisk:9, crowdMood:65, route:'match', note:'bola longa e finalizações de fora ficam menos previsíveis.' },
  { id:'altitude-dry', title:'Altitude seca', icon:'⛰️', temperature:16, humidity:30, wind:18, rain:0, visibility:85, ballSpeed:10, stamina:-18, passing:-3, injuryRisk:12, crowdMood:78, route:'worldCompetitions', note:'fôlego vira fator crítico, principalmente fora de casa.' },
  { id:'foggy-night', title:'Neblina noturna', icon:'🌫️', temperature:14, humidity:88, wind:6, rain:8, visibility:38, ballSpeed:-5, stamina:-3, passing:-12, injuryRisk:10, crowdMood:58, route:'matchdayPremium', note:'visibilidade ruim, jogo mais mental e menos vertical.' }
];

export const PITCH_SURFACE_PROFILES_V730 = [
  { id:'perfect', title:'Gramado perfeito', icon:'🟩', traction:92, drainage:88, speed:82, bounce:76, fatigue:8, injuryRisk:3, style:'passe curto, triangulações e pressão organizada' },
  { id:'dry-fast', title:'Seco e rápido', icon:'🟨', traction:78, drainage:70, speed:90, bounce:84, fatigue:14, injuryRisk:7, style:'transições rápidas e bolas nas costas da defesa' },
  { id:'wet-fast', title:'Molhado e veloz', icon:'💧', traction:61, drainage:78, speed:88, bounce:65, fatigue:18, injuryRisk:13, style:'chutes de média distância e cruzamentos venenosos' },
  { id:'heavy-mud', title:'Pesado e enlameado', icon:'🟫', traction:46, drainage:39, speed:48, bounce:42, fatigue:27, injuryRisk:20, style:'duelos físicos, bolas paradas e jogo direto' },
  { id:'synthetic', title:'Sintético moderno', icon:'🔷', traction:84, drainage:92, speed:86, bounce:82, fatigue:12, injuryRisk:9, style:'jogo acelerado, pressão e troca curta' },
  { id:'irregular', title:'Irregular', icon:'⚠️', traction:55, drainage:52, speed:58, bounce:38, fatigue:19, injuryRisk:18, style:'erros técnicos, segunda bola e maior imprevisibilidade' }
];

export const STADIUM_CONTEXTS_V730 = [
  { id:'home-packed', title:'Casa lotada', icon:'🏟️', attendanceBoost:18, pressure:74, intimidation:41, revenue:12, mood:'torcida empurra, mas cobra intensidade.' },
  { id:'away-hostile', title:'Fora hostil', icon:'🛡️', attendanceBoost:-8, pressure:82, intimidation:78, revenue:0, mood:'ambiente pesa para jovens e reservas.' },
  { id:'classic-night', title:'Clássico à noite', icon:'🌃', attendanceBoost:22, pressure:91, intimidation:66, revenue:18, mood:'rivalidade aumenta narrativa, moral e risco.' },
  { id:'cup-final', title:'Final de copa', icon:'🏆', attendanceBoost:28, pressure:96, intimidation:71, revenue:30, mood:'jogo de nervos, cada decisão vira manchete.' },
  { id:'training-ground', title:'CT fechado', icon:'🏋️', attendanceBoost:0, pressure:34, intimidation:10, revenue:0, mood:'ambiente ideal para preparação e ajuste fino.' },
  { id:'small-stadium', title:'Estádio pequeno', icon:'🥁', attendanceBoost:-4, pressure:67, intimidation:54, revenue:-8, mood:'barulho próximo ao campo e jogo muito físico.' }
];

export const STADIUM_CLIMATE_RULES_V730 = [
  { id:'pressing', title:'Pressão alta', good:['clear-night','clear-day'], bad:['heavy-rain','hot-afternoon','altitude-dry'], advice:'reduza pressão em calor, altitude ou gramado pesado.' },
  { id:'short-pass', title:'Passe curto', good:['clear-day','clear-night'], bad:['heavy-rain','foggy-night'], advice:'em chuva forte, prefira menos risco na saída.' },
  { id:'long-ball', title:'Bola longa', good:['cold-wind','heavy-rain'], bad:['foggy-night'], advice:'vento muda trajetória; use alvo físico e segunda bola.' },
  { id:'wing-play', title:'Jogo pelos lados', good:['wet-fast','clear-day'], bad:['heavy-mud','irregular'], advice:'gramado pesado reduz ultrapassagens e cruzamentos baixos.' },
  { id:'set-piece', title:'Bola parada', good:['heavy-rain','cold-wind','cup-final'], bad:['perfect'], advice:'em clima ruim, falta lateral e escanteio ganham valor.' },
  { id:'rotation', title:'Rotação física', good:['hot-afternoon','altitude-dry','heavy-mud'], bad:['clear-night'], advice:'escale banco forte quando fadiga e clima cobrarem o elenco.' }
];
