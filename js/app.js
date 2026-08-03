const VERSION = '9.0.1';
const SCHEMA = 900;
const STORE_KEY = 'vale-futebol-manager-v9';
const BACKUP_KEY = 'vale-futebol-manager-v9-backup';
const MAX_SLOTS = 3;

const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');
const bootScreen = document.querySelector('#boot-screen');

const session = {
  screen: 'cover',
  slot: null,
  career: null,
  teams: [],
  selectedTeam: null,
  setupStep: 1,
  selectedAvatar: 1,
  market: [],
  marketLoading: false,
  squadFilter: '',
  positionFilter: 'TODOS',
  match: null,
  matchTimer: null,
  matchWasRunningBeforeGate: false,
  modalReturnFocus: null
};

let store = loadStore();

const icons = {
  home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8v9H6v-9"/><path d="M9 20v-6h6v6"/></svg>',
  squad: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c0-4 2-7 6-7s6 3 6 7M15 14c3 0 5 2 5 5"/></svg>',
  tactics: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 3v18M3 12h18"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="16" r="1.5"/></svg>',
  training: '<svg viewBox="0 0 24 24"><path d="M6 20 18 4M4 8h5M15 16h5M8 4v5M16 15v5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/></svg>',
  market: '<svg viewBox="0 0 24 24"><path d="M4 7h16M7 3v4M17 3v4M5 7l1 14h12l1-14"/><path d="M9 12h6M9 16h6"/></svg>',
  finance: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.8-.7-1.8-1-3-1-1.7 0-3 1-3 2.3 0 3.6 6 1.3 6 4.7 0 1.3-1.3 2.5-3.2 2.5-1.3 0-2.5-.5-3.3-1.3M12 5v14"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 13.5a7 7 0 0 0 0-3l2-1.5-2-3.4-2.4 1A8 8 0 0 0 14 5l-.3-2.5h-4L9.4 5a8 8 0 0 0-2.6 1.5l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 3l-2 1.5 2 3.5 2.4-1A8 8 0 0 0 9.4 19l.3 2.5h4L14 19a8 8 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5Z"/></svg>'
};

const navItems = [
  ['dashboard', 'Início', 'home'],
  ['squad', 'Elenco', 'squad'],
  ['tactics', 'Tática', 'tactics'],
  ['training', 'Treino', 'training'],
  ['calendar', 'Agenda', 'calendar'],
  ['market', 'Mercado', 'market'],
  ['finances', 'Finanças', 'finance'],
  ['settings', 'Ajustes', 'settings']
];

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function clamp(value, min, max) {
  const number = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(number) ? number : min));
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(Number(value) || 0);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function badgePath(teamId) {
  return './assets/clubs/brazil/' + teamId + '/badge.png';
}

function rosterPaths(teamId) {
  return [
    './data/rosters/2026/brazil/serie-a/' + teamId + '.json',
    './data/rosters/2026/brazil/serie-b/' + teamId + '.json',
    './data/rosters/2026/' + teamId + '.json'
  ];
}

async function loadRoster(teamId) {
  for (const path of rosterPaths(teamId)) {
    try {
      const response = await fetch(path);
      if (!response.ok) continue;
      const data = await response.json();
      const players = Array.isArray(data.players) ? data.players.map(normalizePlayer) : [];
      if (players.length) return players;
    } catch {}
  }
  return [];
}

function photoPath(player) {
  return player && player.photo ? './' + String(player.photo).replace(/^\.\//, '') : './assets/placeholders/player-generic.png';
}

function imageFallback(event, kind, label) {
  const img = event.target;
  if (!img || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  if (kind === 'avatar') img.src = './assets/avatars/manager-01.png';
  else if (kind === 'player') img.src = './assets/placeholders/player-generic.png';
  else img.src = './assets/placeholders/club-generic.png';
  img.alt = label || '';
}

window.__vfmImageFallback = imageFallback;

function safeParse(text, fallback) {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function storageGet(key) {
  try { return window.localStorage.getItem(key); }
  catch { return null; }
}

function storageSet(key, value) {
  try { window.localStorage.setItem(key, value); return true; }
  catch { return false; }
}

function emptyStore() {
  return { schema: SCHEMA, version: VERSION, slots: {}, updatedAt: new Date().toISOString() };
}

function normalizeCareer(raw) {
  if (!raw || typeof raw !== 'object' || !raw.club || !raw.manager) return null;
  const career = { ...raw };
  career.schema = SCHEMA;
  career.version = VERSION;
  career.week = clamp(career.week || 1, 1, 60);
  career.budget = Math.max(0, Number(career.budget) || 0);
  career.board = clamp(career.board || 70, 0, 100);
  career.morale = clamp(career.morale || 72, 0, 100);
  career.fitness = clamp(career.fitness || 86, 0, 100);
  career.stats = { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0, ...(career.stats || {}) };
  career.tactics = { formation: '4-3-3', mentality: 'Equilibrada', pressure: 58, tempo: 55, ...(career.tactics || {}) };
  career.roster = Array.isArray(career.roster) ? career.roster.filter(Boolean) : [];
  career.fixtures = Array.isArray(career.fixtures) ? career.fixtures : [];
  career.ledger = Array.isArray(career.ledger) ? career.ledger.slice(-50) : [];
  career.messages = Array.isArray(career.messages) ? career.messages.slice(-30) : [];
  career.lineupIds = Array.isArray(career.lineupIds) ? career.lineupIds.slice(0, 11) : career.roster.slice(0, 11).map(player => player.id);
  return career;
}

function loadStore() {
  const parsed = safeParse(storageGet(STORE_KEY), null);
  const backup = safeParse(storageGet(BACKUP_KEY), null);
  const source = parsed || backup || emptyStore();
  const normalized = emptyStore();
  const slots = source.slots && typeof source.slots === 'object' ? source.slots : {};
  for (let slot = 1; slot <= MAX_SLOTS; slot += 1) {
    const career = normalizeCareer(slots[slot]);
    if (career) normalized.slots[slot] = career;
  }
  migrateLegacySave(normalized);
  return normalized;
}

function migrateLegacySave(target) {
  if (Object.keys(target.slots).length) return;
  const legacyKeys = ['valeFutebolSave', 'vfm_save', 'vale-futebol-save', 'vale-futebol-manager'];
  for (const key of legacyKeys) {
    const career = normalizeCareer(safeParse(storageGet(key), null));
    if (career) {
      target.slots[1] = career;
      return;
    }
  }
}

function persist(silent) {
  if (session.career && session.slot) {
    session.career.updatedAt = new Date().toISOString();
    store.slots[session.slot] = session.career;
  }
  store.updatedAt = new Date().toISOString();
  store.schema = SCHEMA;
  store.version = VERSION;
  try {
    const previous = localStorage.getItem(STORE_KEY);
    if (previous) localStorage.setItem(BACKUP_KEY, previous);
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    if (!silent) toast('Carreira salva com segurança.', 'success');
    return true;
  } catch {
    toast('Não foi possível salvar agora. Libere espaço no navegador e tente novamente.', 'error');
    return false;
  }
}

function toast(message, type) {
  const item = document.createElement('div');
  item.className = 'toast ' + (type || '');
  item.textContent = message;
  toastRoot.append(item);
  window.setTimeout(() => item.remove(), 3200);
}

function showModal(title, body, actions) {
  session.modalReturnFocus = document.activeElement;
  document.body.classList.add('modal-open');
  modalRoot.innerHTML = '<section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
    '<h2 id="modal-title">' + escapeHtml(title) + '</h2>' + body +
    '<div class="modal-actions">' + actions + '</div></section>';
  const focusable = modalRoot.querySelector('button, input, select');
  if (focusable) focusable.focus();
}

function closeModal() {
  modalRoot.innerHTML = '';
  document.body.classList.remove('modal-open');
  if (session.modalReturnFocus && session.modalReturnFocus.focus) session.modalReturnFocus.focus();
}

function slotSummary(slot, mode) {
  const career = store.slots[slot];
  if (!career) {
    return '<div class="slot-card"><img src="./assets/icons/club.png" alt="">' +
      '<div><strong>Espaço ' + slot + '</strong><small>Disponível para uma nova carreira</small></div>' +
      '<button class="btn btn-primary btn-small" data-action="slot-select" data-slot="' + slot + '" data-mode="' + mode + '">' + (mode === 'load' ? 'Vazio' : 'Escolher') + '</button></div>';
  }
  return '<div class="slot-card"><img src="' + badgePath(career.club.id) + '" alt="" onerror="__vfmImageFallback(event,\'badge\')">' +
    '<div><strong>' + escapeHtml(career.manager.name) + ' · ' + escapeHtml(career.club.name) + '</strong><small>Semana ' + career.week + ' · ' + career.stats.points + ' pts · ' + formatDate(career.updatedAt) + '</small></div>' +
    '<button class="btn btn-small ' + (mode === 'load' ? 'btn-primary' : '') + '" data-action="slot-select" data-slot="' + slot + '" data-mode="' + mode + '">' + (mode === 'load' ? 'Carregar' : 'Substituir') + '</button></div>';
}

function openSlots(mode) {
  const slots = Array.from({ length: MAX_SLOTS }, (_, index) => slotSummary(index + 1, mode)).join('');
  showModal(mode === 'load' ? 'Carregar carreira' : 'Escolha um espaço', '<div class="save-slots">' + slots + '</div>',
    '<button class="btn" data-action="close-modal">Voltar</button>');
}

async function init() {
  try {
    const response = await fetch('./data/brazilian-leagues-2026.json', { cache: 'no-cache' });
    const data = response.ok ? await response.json() : null;
    session.teams = data && Array.isArray(data.serieA) ? data.serieA : fallbackTeams();
  } catch {
    session.teams = fallbackTeams();
  }
  registerServiceWorker();
  bindGlobalEvents();
  handleOrientation();
  renderCover();
  window.setTimeout(() => bootScreen.classList.add('is-ready'), 260);
}

function fallbackTeams() {
  return [
    ['palmeiras', 'Palmeiras'], ['flamengo', 'Flamengo'], ['fluminense', 'Fluminense'], ['sao-paulo', 'São Paulo'],
    ['botafogo', 'Botafogo'], ['atletico-mg', 'Atlético-MG'], ['internacional', 'Internacional'], ['cruzeiro', 'Cruzeiro'],
    ['gremio', 'Grêmio'], ['santos', 'Santos FC'], ['corinthians', 'Corinthians'], ['bahia', 'Bahia']
  ].map(team => ({ id: team[0], name: team[1] }));
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function bindGlobalEvents() {
  app.addEventListener('click', handleClick);
  modalRoot.addEventListener('click', handleClick);
  app.addEventListener('input', handleInput);
  app.addEventListener('change', handleChange);
  window.addEventListener('popstate', () => {
    if (session.career && session.screen !== 'dashboard') navigate('dashboard', false);
    else if (!session.career) renderCover();
  });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (modalRoot.children.length) closeModal();
      else if (session.match && session.screen === 'match') toggleMatchPause();
      else if (session.career && session.screen !== 'dashboard') navigate('dashboard');
    }
    if (event.key === ' ' && session.screen === 'match' && !event.target.matches('input, select, textarea, button')) {
      event.preventDefault();
      toggleMatchPause();
    }
  });
  const orientationQuery = matchMedia('(orientation: portrait) and (max-width: 1024px)');
  orientationQuery.addEventListener('change', handleOrientation);
  window.addEventListener('resize', debounce(handleOrientation, 120), { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (session.matchTimer) session.matchWasRunningBeforeGate = true;
      pauseMatch();
      if (session.career) persist(true);
    } else if (!isPortraitGateActive() && session.matchWasRunningBeforeGate && session.match && !session.match.ended) {
      session.matchWasRunningBeforeGate = false;
      resumeMatch();
    }
  });
  window.addEventListener('pagehide', () => session.career && persist(true));
}

function debounce(fn, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

function isPortraitGateActive() {
  return matchMedia('(orientation: portrait) and (max-width: 1024px)').matches;
}

function handleOrientation() {
  const gated = isPortraitGateActive();
  const main = document.querySelector('#app');
  if (gated) {
    if (session.matchTimer) session.matchWasRunningBeforeGate = true;
    pauseMatch();
    main.setAttribute('inert', '');
  } else {
    main.removeAttribute('inert');
    if (session.matchWasRunningBeforeGate && session.match && !session.match.ended && !document.hidden) {
      session.matchWasRunningBeforeGate = false;
      resumeMatch();
    }
  }
}

function renderCover() {
  stopMatchTimer();
  session.screen = 'cover';
  session.career = null;
  session.slot = null;
  app.innerHTML = '<main class="screen cover-screen">' +
    '<section class="cover-copy">' +
    '<p class="eyebrow">Gold Edition</p><h1 class="cover-title">Vale Futebol <span>Manager</span></h1>' +
    '<p class="cover-lead">Assuma o comando, construa um elenco vencedor e escreva sua história à beira do campo.</p>' +
    '<div class="cover-actions">' +
    '<button class="btn btn-primary" data-action="new-career">Nova carreira</button>' +
    '<button class="btn" data-action="load-career" ' + (Object.keys(store.slots).length ? '' : 'disabled') + '>Continuar</button>' +
    '<button class="btn" data-action="show-help">Como jogar</button>' +
    '<button class="btn" data-action="cover-settings">Ajustes</button></div>' +
    '<p class="version-label">Versão ' + VERSION + '</p></section></main>';
}

function renderTeamSetup() {
  session.screen = 'setup';
  const cards = session.teams.map(team =>
    '<button class="team-card ' + (session.selectedTeam && session.selectedTeam.id === team.id ? 'selected' : '') + '" data-action="select-team" data-team="' + escapeHtml(team.id) + '">' +
    '<img src="' + badgePath(team.id) + '" alt="" onerror="__vfmImageFallback(event,\'badge\')">' +
    '<span><strong>' + escapeHtml(team.name) + '</strong><small>Brasileirão Série A</small></span></button>'
  ).join('');
  app.innerHTML = '<main class="screen setup-screen"><header class="setup-header">' +
    '<button class="btn btn-icon" data-action="back-cover" aria-label="Voltar">←</button>' +
    '<div><p class="eyebrow">Nova carreira</p><h1>Escolha seu clube</h1></div><span class="step-label">1 de 2</span></header>' +
    '<section class="setup-body"><div class="team-grid">' + cards + '</div></section>' +
    '<footer class="setup-footer"><button class="btn btn-primary" data-action="setup-next" ' + (session.selectedTeam ? '' : 'disabled') + '>Continuar</button></footer></main>';
}

function renderManagerSetup() {
  session.setupStep = 2;
  const avatars = Array.from({ length: 8 }, (_, index) => {
    const number = index + 1;
    return '<button class="avatar-btn ' + (session.selectedAvatar === number ? 'selected' : '') + '" data-action="select-avatar" data-avatar="' + number + '" aria-label="Avatar ' + number + '">' +
      '<img src="./assets/avatars/manager-' + String(number).padStart(2, '0') + '.png" alt="" onerror="__vfmImageFallback(event,\'avatar\')"></button>';
  }).join('');
  app.innerHTML = '<main class="screen setup-screen"><header class="setup-header">' +
    '<button class="btn btn-icon" data-action="setup-back" aria-label="Voltar">←</button>' +
    '<div><p class="eyebrow">Seu perfil</p><h1>Apresente-se à torcida</h1></div><span class="step-label">2 de 2</span></header>' +
    '<section class="setup-body"><div class="manager-form"><div class="avatar-choice">' + avatars + '</div>' +
    '<div class="form-card"><div class="field"><label for="manager-name">Nome do treinador</label><input id="manager-name" maxlength="32" autocomplete="name" placeholder="Como você quer ser chamado?"></div>' +
    '<div class="field"><label for="difficulty">Nível de desafio</label><select id="difficulty"><option value="Acessível">Acessível</option><option value="Equilibrado" selected>Equilibrado</option><option value="Especialista">Especialista</option></select></div>' +
    '<div class="career-summary"><img src="' + badgePath(session.selectedTeam.id) + '" alt="" onerror="__vfmImageFallback(event,\'badge\')"><div><strong>' + escapeHtml(session.selectedTeam.name) + '</strong><small>Contrato de uma temporada · Objetivo: classificação continental</small></div></div></div></div></section>' +
    '<footer class="setup-footer"><button class="btn btn-primary" data-action="start-career">Assinar contrato</button></footer></main>';
  const input = document.querySelector('#manager-name');
  if (input) input.focus({ preventScroll: true });
}

async function createCareer() {
  const nameInput = document.querySelector('#manager-name');
  const difficultyInput = document.querySelector('#difficulty');
  const managerName = nameInput ? nameInput.value.trim() : '';
  if (managerName.length < 2) {
    toast('Digite um nome com pelo menos 2 caracteres.', 'error');
    if (nameInput) nameInput.focus();
    return;
  }
  const button = document.querySelector('[data-action="start-career"]');
  if (button) { button.disabled = true; button.textContent = 'Preparando elenco…'; }
  let roster = [];
  roster = await loadRoster(session.selectedTeam.id);
  if (roster.length < 11) roster = genericRoster(session.selectedTeam.id);
  const average = roster.reduce((sum, player) => sum + player.overall, 0) / roster.length;
  const budget = Math.round((42 + (85 - average) * 2.2) * 1000000);
  const fixtures = buildFixtures(session.selectedTeam);
  session.career = {
    schema: SCHEMA, version: VERSION, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    manager: { name: managerName, avatar: session.selectedAvatar, difficulty: difficultyInput ? difficultyInput.value : 'Equilibrado' },
    club: { id: session.selectedTeam.id, name: session.selectedTeam.name },
    season: 2026, week: 1, budget, board: 72, morale: 72, fitness: 86,
    roster, lineupIds: pickStartingLineup(roster).map(player => player.id),
    tactics: { formation: '4-3-3', mentality: 'Equilibrada', pressure: 58, tempo: 55 },
    stats: { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, points: 0 },
    fixtures, ledger: [{ date: new Date().toISOString(), label: 'Orçamento da temporada', amount: budget, type: 'income' }],
    messages: [{ title: 'Boas-vindas ao clube', body: 'A diretoria deseja uma campanha competitiva e uma vaga continental.', read: false }],
    lastTrainingWeek: 0
  };
  persist(true);
  toast('Contrato assinado. Boa temporada!', 'success');
  navigate('dashboard');
}

function normalizePlayer(player, index) {
  return {
    id: String(player.id || 'player-' + index),
    name: String(player.displayName || player.name || 'Jogador'),
    pos: String(player.pos || player.position || 'MC'),
    role: String(player.role || player.pos || 'Jogador'),
    overall: clamp(player.overall || 65, 40, 99),
    potential: clamp(player.potential || player.overall || 65, 40, 99),
    age: clamp(player.age || 24, 16, 45),
    salary: Math.max(1, Number(player.salary) || 25),
    value: Math.max(.05, Number(player.marketValue || player.value) || 1),
    morale: clamp(player.morale || 72, 0, 100),
    fitness: clamp(player.fitness || 86, 0, 100),
    photo: player.photo || ''
  };
}

function genericRoster(teamId) {
  const positions = ['GOL','GOL','LD','ZAG','ZAG','ZAG','LE','VOL','VOL','MC','MC','MEI','PD','PE','ATA','ATA','MC','LD'];
  return positions.map((pos, index) => normalizePlayer({
    id: teamId + '-jogador-' + (index + 1), name: 'Jogador ' + (index + 1), pos,
    overall: 68 + (index * 7) % 13, potential: 72 + (index * 5) % 15, age: 19 + (index * 3) % 15,
    salary: 35 + index * 7, value: 1.2 + index * .45
  }, index));
}

function pickStartingLineup(roster) {
  const wanted = [['GOL',1],['ZAG',2],['LD',1],['LE',1],['VOL',1],['MC',2],['PD',1],['PE',1],['ATA',1]];
  const picked = [];
  wanted.forEach(([position, count]) => {
    roster.filter(player => player.pos === position && !picked.includes(player)).sort((a,b) => b.overall-a.overall).slice(0,count).forEach(player => picked.push(player));
  });
  roster.filter(player => !picked.includes(player)).sort((a,b) => b.overall-a.overall).slice(0,11-picked.length).forEach(player => picked.push(player));
  return picked.slice(0,11);
}

function buildFixtures(team) {
  const opponents = session.teams.filter(item => item.id !== team.id);
  return opponents.slice(0, 14).map((opponent, index) => {
    const date = new Date(2026, 7, 2 + index * 7, 16, 0, 0);
    return { id: 'fixture-' + (index + 1), round: index + 1, date: date.toISOString(), opponent, home: index % 2 === 0, played: false, score: null };
  });
}

function navigate(screen, push) {
  if (!session.career) { renderCover(); return; }
  if (screen !== 'match') stopMatchTimer();
  session.screen = screen;
  if (push !== false) history.pushState({ screen }, '', '#/' + screen);
  if (screen === 'dashboard') renderGame(renderDashboard());
  else if (screen === 'squad') renderGame(renderSquad());
  else if (screen === 'tactics') renderGame(renderTactics());
  else if (screen === 'training') renderGame(renderTraining());
  else if (screen === 'calendar') renderGame(renderCalendar());
  else if (screen === 'market') { renderGame(renderMarket()); loadMarket(); }
  else if (screen === 'finances') renderGame(renderFinances());
  else if (screen === 'settings') renderGame(renderSettings());
}

function renderGame(content) {
  const career = session.career;
  const nav = navItems.map(item =>
    '<button class="nav-button ' + (session.screen === item[0] ? 'active' : '') + '" data-action="navigate" data-screen="' + item[0] + '" aria-label="' + item[1] + '">' +
    icons[item[2]] + '<span>' + item[1] + '</span></button>'
  ).join('');
  app.innerHTML = '<main class="screen game-screen"><nav class="side-nav" aria-label="Menu principal"><div class="nav-brand" aria-hidden="true">V</div>' + nav + '</nav>' +
    '<header class="app-header"><div class="club-lockup"><img src="' + badgePath(career.club.id) + '" alt="" onerror="__vfmImageFallback(event,\'badge\')"><div><strong>' + escapeHtml(career.club.name) + '</strong><small>' + escapeHtml(career.manager.name) + ' · Semana ' + career.week + '</small></div></div>' +
    '<div class="header-stats"><div class="header-stat"><span>Orçamento</span><strong>' + money(career.budget) + '</strong></div><div class="header-stat"><span>Confiança</span><strong>' + career.board + '%</strong></div><div class="header-stat"><span>Pontos</span><strong>' + career.stats.points + '</strong></div></div>' +
    '<div class="header-actions"><button class="btn btn-icon btn-small" data-action="save" aria-label="Salvar">✓</button><button class="btn btn-icon btn-small" data-action="show-help" aria-label="Ajuda">?</button></div></header>' +
    '<section class="content-area" id="main-content" tabindex="-1">' + content + '</section></main>';
}

function sectionHead(title, subtitle, actions) {
  return '<header class="content-head"><div><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(subtitle) + '</p></div><div class="section-actions">' + (actions || '') + '</div></header>';
}

function nextFixture() {
  return session.career.fixtures.find(fixture => !fixture.played) || null;
}

function teamRating() {
  const lineup = session.career.roster.filter(player => session.career.lineupIds.includes(player.id));
  if (!lineup.length) return 65;
  return Math.round(lineup.reduce((sum, player) => sum + player.overall * (.7 + player.fitness / 330), 0) / lineup.length);
}

function renderDashboard() {
  const career = session.career;
  const fixture = nextFixture();
  const opponent = fixture ? fixture.opponent : { id: 'championship', name: 'Temporada concluída' };
  const unread = career.messages.filter(message => !message.read).slice(0, 3);
  const recent = career.fixtures.filter(item => item.played).slice(-3).reverse();
  return sectionHead('Sala do treinador', 'Visão geral da sua temporada e decisões prioritárias.') +
    '<div class="metric-grid"><div class="metric"><span>Classificação</span><strong class="gold">' + estimatedPosition() + 'º</strong></div>' +
    '<div class="metric"><span>Aproveitamento</span><strong>' + performancePercent() + '%</strong></div><div class="metric"><span>Elenco</span><strong>' + career.roster.length + '</strong></div>' +
    '<div class="metric"><span>Força titular</span><strong class="good">' + teamRating() + '</strong></div></div>' +
    '<div class="dashboard-grid"><article class="panel next-match"><div class="panel-head"><h2>Próximo compromisso</h2><span class="tag">' + (fixture ? 'Rodada ' + fixture.round : 'Encerrado') + '</span></div>' +
    '<div class="matchup"><div class="match-team"><img src="' + badgePath(career.club.id) + '" alt=""><strong>' + escapeHtml(career.club.name) + '</strong></div><div class="match-vs">VS</div>' +
    '<div class="match-team"><img src="' + badgePath(opponent.id) + '" alt="" onerror="__vfmImageFallback(event,\'badge\')"><strong>' + escapeHtml(opponent.name) + '</strong></div></div>' +
    '<div class="match-meta"><span>' + (fixture ? formatDate(fixture.date) : 'Calendário finalizado') + '</span><span>' + (fixture && fixture.home ? 'Em casa' : 'Fora de casa') + '</span></div>' +
    '<button class="btn btn-primary" style="width:100%;margin-top:10px" data-action="prepare-match" ' + (fixture ? '' : 'disabled') + '>Ir para a partida</button></article>' +
    '<article class="panel"><div class="panel-head"><h2>Vestiário</h2><span class="panel-note">Estado atual</span></div>' +
    '<ul class="list-clean"><li class="list-row"><span class="status-dot"></span><div class="grow"><strong>Moral do grupo</strong><small>' + moodLabel(career.morale) + '</small></div><strong>' + career.morale + '%</strong></li>' +
    '<li class="list-row"><span class="status-dot" style="background:var(--blue)"></span><div class="grow"><strong>Condição física</strong><small>Disponibilidade média</small></div><strong>' + career.fitness + '%</strong></li>' +
    '<li class="list-row"><span class="status-dot" style="background:var(--gold)"></span><div class="grow"><strong>Diretoria</strong><small>' + boardLabel(career.board) + '</small></div><strong>' + career.board + '%</strong></li></ul>' +
    '<div style="margin-top:10px"><div class="panel-head"><h2>Forma recente</h2></div>' + (recent.length ? recent.map(renderRecent).join('') : '<p class="panel-note">A temporada começa no próximo jogo.</p>') + '</div></article>' +
    '<article class="panel"><div class="panel-head"><h2>Central de decisões</h2><span class="panel-note">' + unread.length + ' novas</span></div>' +
    '<ul class="list-clean">' + (unread.length ? unread.map(message => '<li class="list-row"><div class="grow"><strong>' + escapeHtml(message.title) + '</strong><small>' + escapeHtml(message.body) + '</small></div></li>').join('') : '<li class="list-row"><div class="grow"><strong>Tudo em dia</strong><small>Não há decisões pendentes.</small></div></li>') + '</ul>' +
    '<div class="quick-grid" style="margin-top:9px">' + quickButton('training','training.png','Planejar treino') + quickButton('tactics','tactics.png','Ajustar tática') + quickButton('market','transfers.png','Buscar reforços') + quickButton('calendar','calendar.png','Ver agenda') + '</div></article></div>';
}

function quickButton(screen, icon, label) {
  return '<button class="btn quick-card" data-action="navigate" data-screen="' + screen + '"><img src="./assets/icons/' + icon + '" alt="">' + label + '</button>';
}

function renderRecent(fixture) {
  const ours = fixture.home ? fixture.score.home : fixture.score.away;
  const theirs = fixture.home ? fixture.score.away : fixture.score.home;
  const color = ours > theirs ? 'var(--green)' : ours < theirs ? 'var(--red)' : 'var(--gold)';
  return '<div class="list-row"><span class="status-dot" style="background:' + color + '"></span><div class="grow"><strong>' + escapeHtml(fixture.opponent.name) + '</strong><small>Rodada ' + fixture.round + '</small></div><strong>' + ours + '–' + theirs + '</strong></div>';
}

function estimatedPosition() {
  const points = session.career.stats.points;
  const played = Math.max(1, session.career.stats.played);
  const pace = points / played;
  return clamp(Math.round(20 - pace * 5.2), 1, 20);
}

function performancePercent() {
  const stats = session.career.stats;
  return stats.played ? Math.round(stats.points / (stats.played * 3) * 100) : 0;
}

function moodLabel(value) {
  return value >= 80 ? 'Grupo muito confiante' : value >= 65 ? 'Ambiente positivo' : value >= 45 ? 'Atenção necessária' : 'Ambiente pressionado';
}

function boardLabel(value) {
  return value >= 80 ? 'Diretoria entusiasmada' : value >= 60 ? 'Trabalho respaldado' : value >= 40 ? 'Resultados cobrados' : 'Pressão elevada';
}

function renderSquad() {
  const career = session.career;
  const filter = session.squadFilter.toLocaleLowerCase('pt-BR');
  const players = career.roster.filter(player =>
    (!filter || player.name.toLocaleLowerCase('pt-BR').includes(filter)) &&
    (session.positionFilter === 'TODOS' || player.pos === session.positionFilter)
  ).sort((a,b) => b.overall - a.overall);
  const positions = [...new Set(career.roster.map(player => player.pos))].sort();
  const rows = players.map(player => '<tr><td><div class="player-cell"><img src="' + photoPath(player) + '" alt="" loading="lazy" onerror="__vfmImageFallback(event,\'player\')"><div><strong>' + escapeHtml(player.name) + '</strong><small>' + escapeHtml(player.role) + '</small></div></div></td>' +
    '<td><span class="tag">' + escapeHtml(player.pos) + '</span></td><td><span class="rating">' + player.overall + '</span></td><td>' + player.age + '</td><td>' + player.fitness + '%</td><td>' + player.morale + '%</td><td>' + money(player.value * 1000000) + '</td>' +
    '<td><button class="btn btn-small" data-action="toggle-lineup" data-player="' + escapeHtml(player.id) + '">' + (career.lineupIds.includes(player.id) ? 'Titular' : 'Escalar') + '</button></td></tr>').join('');
  return sectionHead('Elenco', 'Gerencie a equipe e os onze titulares.', '<span class="tag">' + career.lineupIds.length + '/11 titulares</span>') +
    '<div class="toolbar"><label class="sr-only" for="squad-search">Buscar jogador</label><input id="squad-search" data-input="squad-search" value="' + escapeHtml(session.squadFilter) + '" placeholder="Buscar jogador">' +
    '<label class="sr-only" for="position-filter">Filtrar posição</label><select id="position-filter" data-change="position-filter"><option value="TODOS">Todas as posições</option>' + positions.map(pos => '<option ' + (pos === session.positionFilter ? 'selected' : '') + '>' + escapeHtml(pos) + '</option>').join('') + '</select>' +
    '<button class="btn btn-small" data-action="best-lineup">Melhor formação</button></div>' +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>Jogador</th><th>Pos.</th><th>GER</th><th>Idade</th><th>Condição</th><th>Moral</th><th>Valor</th><th>Escalação</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

const formationPositions = {
  '4-3-3': [[50,90],[16,72],[39,76],[61,76],[84,72],[28,50],[50,56],[72,50],[19,24],[50,18],[81,24]],
  '4-2-3-1': [[50,90],[16,72],[39,76],[61,76],[84,72],[38,56],[62,56],[18,35],[50,39],[82,35],[50,16]],
  '4-4-2': [[50,90],[16,72],[39,76],[61,76],[84,72],[15,46],[38,53],[62,53],[85,46],[36,20],[64,20]]
};

function renderTactics() {
  const career = session.career;
  const lineup = career.lineupIds.map(id => career.roster.find(player => player.id === id)).filter(Boolean);
  const coords = formationPositions[career.tactics.formation] || formationPositions['4-3-3'];
  const players = lineup.slice(0,11).map((player,index) => '<div class="pitch-player" style="left:' + coords[index][0] + '%;top:' + coords[index][1] + '%"><span>' + escapeHtml(player.pos) + '</span><small>' + escapeHtml(player.name.split(' ').slice(-1)[0]) + '</small></div>').join('');
  return sectionHead('Prancheta tática', 'Defina a estrutura e a identidade da equipe.', '<span class="tag">Força ' + teamRating() + '</span>') +
    '<div class="tactics-layout"><div class="pitch" aria-label="Campo com a escalação titular">' + players + '</div><aside class="control-stack">' +
    '<div class="panel"><div class="panel-head"><h2>Formação</h2></div><div class="choice-row">' + ['4-3-3','4-2-3-1','4-4-2'].map(value => '<button class="choice ' + (career.tactics.formation === value ? 'active' : '') + '" data-action="set-formation" data-value="' + value + '">' + value + '</button>').join('') + '</div></div>' +
    '<div class="panel"><div class="panel-head"><h2>Mentalidade</h2></div><div class="choice-row">' + ['Cautelosa','Equilibrada','Ofensiva'].map(value => '<button class="choice ' + (career.tactics.mentality === value ? 'active' : '') + '" data-action="set-mentality" data-value="' + value + '">' + value + '</button>').join('') + '</div></div>' +
    '<div class="panel"><div class="range-row"><label for="pressure">Pressão <strong>' + career.tactics.pressure + '</strong></label><input id="pressure" type="range" min="20" max="90" value="' + career.tactics.pressure + '" data-change="tactic-range" data-key="pressure"></div>' +
    '<div class="range-row" style="margin-top:10px"><label for="tempo">Ritmo <strong>' + career.tactics.tempo + '</strong></label><input id="tempo" type="range" min="20" max="90" value="' + career.tactics.tempo + '" data-change="tactic-range" data-key="tempo"></div></div>' +
    '<button class="btn btn-primary" data-action="save-tactics">Confirmar estratégia</button></aside></div>';
}

function renderTraining() {
  const plans = [
    ['Recuperação', 'Reduz a carga e melhora a condição do elenco.', 6, 1],
    ['Posse e controle', 'Aprimora entrosamento e segurança com a bola.', 2, 4],
    ['Intensidade', 'Aumenta competitividade com maior desgaste físico.', -4, 7],
    ['Finalização', 'Trabalha decisões no último terço do campo.', -1, 5]
  ];
  const already = session.career.lastTrainingWeek === session.career.week;
  return sectionHead('Centro de treinamento', already ? 'A programação desta semana já foi concluída.' : 'Escolha a prioridade da semana.') +
    '<div class="training-grid">' + plans.map(plan => '<article class="training-card"><h2>' + plan[0] + '</h2><p>' + plan[1] + '</p><div class="impact-row"><span class="tag">Condição ' + (plan[2] >= 0 ? '+' : '') + plan[2] + '</span><span class="tag">Moral +' + plan[3] + '</span></div>' +
    '<button class="btn ' + (already ? '' : 'btn-primary') + '" data-action="apply-training" data-plan="' + plan[0] + '" data-fitness="' + plan[2] + '" data-morale="' + plan[3] + '" ' + (already ? 'disabled' : '') + '>' + (already ? 'Concluído' : 'Aplicar plano') + '</button></article>').join('') + '</div>';
}

function renderCalendar() {
  const cards = session.career.fixtures.map(fixture => {
    const result = fixture.played ? fixture.score.home + '–' + fixture.score.away : '—';
    return '<article class="fixture-card ' + (!fixture.played && fixture === nextFixture() ? 'is-next' : '') + '"><div class="fixture-date"><strong>' + new Date(fixture.date).getDate() + '</strong>' + new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(new Date(fixture.date)) + '</div>' +
      '<img src="' + badgePath(fixture.opponent.id) + '" alt="" width="38" height="38" onerror="__vfmImageFallback(event,\'badge\')"><div class="fixture-teams"><strong>' + escapeHtml(fixture.opponent.name) + '</strong><small>Rodada ' + fixture.round + ' · ' + (fixture.home ? 'Casa' : 'Fora') + '</small></div><div class="fixture-score">' + result + '</div></article>';
  }).join('');
  return sectionHead('Calendário', 'Acompanhe compromissos e resultados da temporada.') + '<div class="cards-list">' + cards + '</div>';
}

function renderMarket() {
  const cards = session.market.map(player => '<article class="market-card"><div class="market-player"><img src="' + photoPath(player) + '" alt="" loading="lazy" onerror="__vfmImageFallback(event,\'player\')"><div><strong>' + escapeHtml(player.name) + '</strong><small>' + escapeHtml(player.pos) + ' · ' + player.age + ' anos</small></div></div>' +
    '<div class="market-value"><span>GER <strong>' + player.overall + '</strong></span><span>' + money(player.value * 1000000) + '</span></div><button class="btn btn-primary btn-small" style="width:100%" data-action="buy-player" data-player="' + escapeHtml(player.id) + '">Fazer proposta</button></article>').join('');
  return sectionHead('Mercado', 'Encontre reforços compatíveis com seu orçamento.', '<span class="tag">' + money(session.career.budget) + '</span>') +
    (session.marketLoading && !cards ? '<div class="panel"><p>Consultando oportunidades…</p></div>' : '<div class="market-grid">' + (cards || '<div class="panel"><p>Nenhuma oportunidade disponível agora.</p></div>') + '</div>');
}

async function loadMarket() {
  if (session.market.length || session.marketLoading) return;
  session.marketLoading = true;
  renderGame(renderMarket());
  const opponents = session.teams.filter(team => team.id !== session.career.club.id).slice(0, 6);
  const rosters = await Promise.all(opponents.map(async team => {
    try {
      const players = await loadRoster(team.id);
      return players.filter(player => player.overall >= 70).slice(0, 4);
    } catch { return []; }
  }));
  const ownedIds = new Set(session.career.roster.map(player => player.id));
  session.market = rosters.flat().filter(player => !ownedIds.has(player.id)).sort((a,b) => b.potential - a.potential).slice(0, 18);
  session.marketLoading = false;
  if (session.screen === 'market') renderGame(renderMarket());
}

function renderFinances() {
  const career = session.career;
  const payroll = career.roster.reduce((sum, player) => sum + player.salary * 1000, 0);
  const rows = career.ledger.slice().reverse().map(item => '<tr><td>' + formatDate(item.date) + '</td><td>' + escapeHtml(item.label) + '</td><td style="color:' + (item.amount >= 0 ? 'var(--green)' : 'var(--red)') + '">' + (item.amount >= 0 ? '+' : '') + money(item.amount) + '</td></tr>').join('');
  return sectionHead('Finanças', 'Controle caixa, folha salarial e investimentos.') +
    '<div class="metric-grid"><div class="metric"><span>Saldo disponível</span><strong class="gold">' + money(career.budget) + '</strong></div><div class="metric"><span>Folha mensal</span><strong>' + money(payroll) + '</strong></div><div class="metric"><span>Valor do elenco</span><strong>' + money(career.roster.reduce((sum,p)=>sum+p.value*1000000,0)) + '</strong></div><div class="metric"><span>Saúde financeira</span><strong class="good">' + (career.budget > payroll * 8 ? 'Estável' : 'Atenção') + '</strong></div></div>' +
    '<div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Movimentação</th><th>Valor</th></tr></thead><tbody>' + rows + '</tbody></table></div>';
}

function renderSettings() {
  return sectionHead('Ajustes', 'Personalize a experiência e gerencie sua carreira.') +
    '<div class="dashboard-grid"><article class="panel"><h2>Experiência</h2><div class="list-clean"><label class="list-row"><div class="grow"><strong>Reduzir animações</strong><small>Minimiza movimentos da interface</small></div><input type="checkbox" data-change="reduce-motion" ' + (document.body.classList.contains('reduce-motion') ? 'checked' : '') + '></label>' +
    '<label class="list-row"><div class="grow"><strong>Texto ampliado</strong><small>Aumenta a leitura de informações</small></div><input type="checkbox" data-change="large-text" ' + (document.body.classList.contains('large-text') ? 'checked' : '') + '></label></div></article>' +
    '<article class="panel"><h2>Carreira</h2><div class="quick-grid"><button class="btn" data-action="save">Salvar agora</button><button class="btn" data-action="export-save">Exportar carreira</button><button class="btn" data-action="import-save">Importar carreira</button><button class="btn btn-danger" data-action="confirm-reset">Apagar carreira</button></div><input id="import-file" class="sr-only" type="file" accept="application/json"></article>' +
    '<article class="panel"><h2>Aplicativo</h2><ul class="list-clean"><li class="list-row"><div class="grow"><strong>Vale Futebol Manager</strong><small>Versão ' + VERSION + '</small></div><span class="tag">Offline</span></li><li class="list-row"><div class="grow"><strong>Orientação</strong><small>Otimizado para uso horizontal</small></div><span class="tag">Paisagem</span></li></ul><button class="btn" style="width:100%;margin-top:9px" data-action="back-cover">Voltar à capa</button></article></div>';
}

function prepareMatch() {
  const fixture = nextFixture();
  if (!fixture) return;
  const difficulty = session.career.manager.difficulty;
  const modifier = difficulty === 'Especialista' ? 4 : difficulty === 'Acessível' ? -3 : 0;
  session.match = {
    fixtureId: fixture.id, minute: 0, homeGoals: 0, awayGoals: 0, homeShots: 0, awayShots: 0,
    homePossession: 50, events: [{ minute: 0, text: 'As equipes estão prontas para entrar em campo.' }],
    speed: 1, running: false, ended: false, opponentRating: 73 + (fixture.round * 3) % 10 + modifier
  };
  session.screen = 'match';
  history.pushState({ screen: 'match' }, '', '#/match');
  renderMatch();
}

function renderMatch() {
  const match = session.match;
  const fixture = session.career.fixtures.find(item => item.id === match.fixtureId);
  const homeClub = fixture.home ? session.career.club : fixture.opponent;
  const awayClub = fixture.home ? fixture.opponent : session.career.club;
  const events = match.events.slice().reverse().map(event => '<div class="event"><strong>' + event.minute + '\'</strong><span>' + escapeHtml(event.text) + '</span></div>').join('');
  const possession = clamp(match.homePossession, 30, 70);
  app.innerHTML = '<main class="screen match-screen"><div class="match-layout"><header class="scoreboard"><div class="score-team"><img src="' + badgePath(homeClub.id) + '" alt="" onerror="__vfmImageFallback(event,\'badge\')"><strong>' + escapeHtml(homeClub.name) + '</strong></div>' +
    '<div class="score-center"><strong>' + match.homeGoals + ' · ' + match.awayGoals + '</strong><span>' + match.minute + '\'</span></div><div class="score-team"><strong>' + escapeHtml(awayClub.name) + '</strong><img src="' + badgePath(awayClub.id) + '" alt="" onerror="__vfmImageFallback(event,\'badge\')"></div></header>' +
    '<aside class="match-panel"><h2>Narração</h2><div class="event-feed">' + events + '</div></aside><div class="match-pitch" aria-label="Representação visual da partida"><span class="ball" style="left:' + (28 + Math.random()*44) + '%;top:' + (24 + Math.random()*52) + '%"></span></div>' +
    '<aside class="match-panel"><h2>Estatísticas</h2><div class="stats-bars"><div class="stat-line"><strong>' + possession + '%</strong><div class="stat-bar"><i style="width:' + possession + '%"></i></div><strong>' + (100-possession) + '%</strong></div><div class="panel-note" style="text-align:center">Posse de bola</div>' +
    '<div class="stat-line"><strong>' + match.homeShots + '</strong><div class="stat-bar"><i style="width:' + (match.homeShots + match.awayShots ? match.homeShots/(match.homeShots+match.awayShots)*100 : 50) + '%"></i></div><strong>' + match.awayShots + '</strong></div><div class="panel-note" style="text-align:center">Finalizações</div></div>' +
    '<div class="panel" style="margin-top:10px"><small class="panel-note">Estratégia</small><strong style="display:block;margin-top:3px">' + escapeHtml(session.career.tactics.formation) + ' · ' + escapeHtml(session.career.tactics.mentality) + '</strong></div></aside>' +
    '<footer class="match-controls"><button class="btn btn-small" data-action="leave-match">' + (match.ended ? 'Voltar ao clube' : 'Sair') + '</button>' +
    (match.ended ? '<button class="btn btn-primary btn-small" data-action="finish-match">Continuar temporada</button>' : '<button class="btn btn-primary btn-small" data-action="toggle-match">' + (match.running ? 'Pausar' : match.minute ? 'Continuar' : 'Começar') + '</button><button class="btn btn-small" data-action="match-speed" data-speed="1">1×</button><button class="btn btn-small" data-action="match-speed" data-speed="3">3×</button><button class="btn btn-small" data-action="match-speed" data-speed="6">6×</button>') + '</footer></div></main>';
}

function resumeMatch() {
  if (!session.match || session.match.ended || session.matchTimer || isPortraitGateActive() || document.hidden) return;
  session.match.running = true;
  session.matchTimer = window.setInterval(tickMatch, 720);
  if (session.screen === 'match') renderMatch();
}

function pauseMatch() {
  if (session.match) session.match.running = false;
  stopMatchTimer();
  if (session.screen === 'match' && session.match) renderMatch();
}

function stopMatchTimer() {
  if (session.matchTimer) window.clearInterval(session.matchTimer);
  session.matchTimer = null;
}

function toggleMatchPause() {
  if (!session.match || session.match.ended) return;
  if (session.matchTimer) pauseMatch(); else resumeMatch();
}

function tickMatch() {
  const match = session.match;
  if (!match || match.ended || isPortraitGateActive() || document.hidden) { pauseMatch(); return; }
  match.minute = Math.min(90, match.minute + match.speed);
  const fixture = session.career.fixtures.find(item => item.id === match.fixtureId);
  const oursHome = fixture.home;
  const ourPower = teamRating() + (session.career.tactics.mentality === 'Ofensiva' ? 2 : session.career.tactics.mentality === 'Cautelosa' ? -1 : 0);
  const homePower = oursHome ? ourPower + 3 : match.opponentRating + 3;
  const awayPower = oursHome ? match.opponentRating : ourPower;
  match.homePossession = clamp(Math.round(50 + (homePower-awayPower)*.65 + (Math.random()-.5)*7), 34, 66);
  if (Math.random() < .22 * match.speed) {
    const homeAttack = Math.random() < homePower / (homePower + awayPower);
    if (homeAttack) match.homeShots += 1; else match.awayShots += 1;
    const scorerSide = homeAttack ? homeClubName(fixture) : awayClubName(fixture);
    if (Math.random() < .17) {
      if (homeAttack) match.homeGoals += 1; else match.awayGoals += 1;
      match.events.push({ minute: match.minute, text: 'GOL! ' + scorerSide + ' transforma a pressão em vantagem.' });
    } else {
      const texts = ['Finalização perigosa, defendida pelo goleiro.', 'A bola passa perto da trave.', 'A defesa bloqueia no momento decisivo.', 'Boa chegada pelo corredor lateral.'];
      match.events.push({ minute: match.minute, text: scorerSide + ': ' + texts[Math.floor(Math.random()*texts.length)] });
    }
  } else if (Math.random() < .06 * match.speed) {
    match.events.push({ minute: match.minute, text: 'O jogo fica concentrado no meio-campo.' });
  }
  if (match.events.length > 40) match.events = match.events.slice(-40);
  if (match.minute >= 90) {
    match.ended = true;
    match.running = false;
    stopMatchTimer();
    match.events.push({ minute: 90, text: 'Fim de jogo.' });
  }
  if (session.screen === 'match') renderMatch();
}

function homeClubName(fixture) {
  return fixture.home ? session.career.club.name : fixture.opponent.name;
}
function awayClubName(fixture) {
  return fixture.home ? fixture.opponent.name : session.career.club.name;
}

function commitMatch() {
  const match = session.match;
  if (!match || !match.ended || match.committed) return;
  const fixture = session.career.fixtures.find(item => item.id === match.fixtureId);
  fixture.played = true;
  fixture.score = { home: match.homeGoals, away: match.awayGoals };
  const ours = fixture.home ? match.homeGoals : match.awayGoals;
  const theirs = fixture.home ? match.awayGoals : match.homeGoals;
  const stats = session.career.stats;
  stats.played += 1; stats.gf += ours; stats.ga += theirs;
  if (ours > theirs) { stats.wins += 1; stats.points += 3; session.career.morale = clamp(session.career.morale + 5,0,100); session.career.board = clamp(session.career.board + 3,0,100); }
  else if (ours === theirs) { stats.draws += 1; stats.points += 1; session.career.morale = clamp(session.career.morale + 1,0,100); }
  else { stats.losses += 1; session.career.morale = clamp(session.career.morale - 4,0,100); session.career.board = clamp(session.career.board - 3,0,100); }
  const attendanceIncome = fixture.home ? 1100000 + Math.round(Math.random()*700000) : 320000;
  session.career.budget += attendanceIncome;
  session.career.ledger.push({ date: new Date().toISOString(), label: fixture.home ? 'Bilheteria e operação de jogo' : 'Cota da rodada', amount: attendanceIncome, type: 'income' });
  session.career.fitness = clamp(session.career.fitness - 5, 35, 100);
  session.career.roster.forEach(player => { player.fitness = clamp(player.fitness - (session.career.lineupIds.includes(player.id) ? 7 : 1), 30, 100); });
  session.career.week += 1;
  match.committed = true;
  persist(true);
  toast(ours > theirs ? 'Vitória confirmada e carreira salva.' : ours === theirs ? 'Empate registrado e carreira salva.' : 'Resultado registrado. A temporada continua.', ours > theirs ? 'success' : '');
  session.match = null;
  navigate('dashboard');
}

async function buyPlayer(playerId) {
  const player = session.market.find(item => item.id === playerId);
  if (!player) return;
  const price = Math.round(player.value * 1000000 * 1.08);
  if (session.career.budget < price) { toast('O orçamento atual não cobre esta contratação.', 'error'); return; }
  if (session.career.roster.some(item => item.id === player.id)) { toast('Este atleta já está no seu elenco.'); return; }
  session.career.budget -= price;
  session.career.roster.push({ ...player, morale: 76, fitness: 88 });
  session.career.ledger.push({ date: new Date().toISOString(), label: 'Contratação de ' + player.name, amount: -price, type: 'expense' });
  session.market = session.market.filter(item => item.id !== player.id);
  persist(true);
  toast(player.name + ' assinou com o clube.', 'success');
  renderGame(renderMarket());
}

function applyTraining(button) {
  const career = session.career;
  if (career.lastTrainingWeek === career.week) return;
  const fitness = Number(button.dataset.fitness) || 0;
  const morale = Number(button.dataset.morale) || 0;
  career.fitness = clamp(career.fitness + fitness, 35, 100);
  career.morale = clamp(career.morale + morale, 0, 100);
  career.roster.forEach(player => {
    player.fitness = clamp(player.fitness + fitness, 30, 100);
    player.morale = clamp(player.morale + morale, 0, 100);
  });
  career.lastTrainingWeek = career.week;
  career.messages.push({ title: 'Treino concluído', body: button.dataset.plan + ' foi aplicado ao elenco.', read: true });
  persist(true);
  toast('Sessão de ' + button.dataset.plan.toLowerCase() + ' concluída.', 'success');
  renderGame(renderTraining());
}

function showHelp() {
  showModal('Como jogar', '<p>Você é responsável por montar o time, planejar treinos, administrar o orçamento e conduzir as partidas.</p>' +
    '<ul><li>Escolha onze titulares em <strong>Elenco</strong>.</li><li>Ajuste formação e estilo em <strong>Tática</strong>.</li><li>Recupere ou desenvolva o grupo em <strong>Treino</strong>.</li><li>Contrate reforços sem comprometer o caixa.</li><li>Dispute as rodadas e alcance uma vaga continental.</li></ul><p>A carreira é salva automaticamente após decisões importantes.</p>',
    '<button class="btn btn-primary" data-action="close-modal">Entendi</button>');
}

function coverSettings() {
  showModal('Ajustes', '<div class="list-clean"><label class="list-row"><div class="grow"><strong>Reduzir animações</strong><small>Minimiza movimentos da interface</small></div><input type="checkbox" data-change="reduce-motion" ' + (document.body.classList.contains('reduce-motion') ? 'checked' : '') + '></label>' +
    '<label class="list-row"><div class="grow"><strong>Texto ampliado</strong><small>Aumenta a leitura das informações</small></div><input type="checkbox" data-change="large-text" ' + (document.body.classList.contains('large-text') ? 'checked' : '') + '></label></div>',
    '<button class="btn btn-primary" data-action="close-modal">Concluir</button>');
}

function exportSave() {
  const blob = new Blob([JSON.stringify({ product: 'Vale Futebol Manager', schema: SCHEMA, version: VERSION, career: session.career }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'vale-futebol-carreira-' + session.slot + '.json';
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast('Arquivo da carreira exportado.', 'success');
}

function importSave(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const parsed = safeParse(reader.result, null);
    const career = normalizeCareer(parsed && (parsed.career || parsed));
    if (!career) { toast('O arquivo selecionado não contém uma carreira válida.', 'error'); return; }
    session.career = career;
    store.slots[session.slot] = career;
    persist(true);
    toast('Carreira importada com sucesso.', 'success');
    navigate('dashboard');
  };
  reader.onerror = () => toast('Não foi possível ler o arquivo selecionado.', 'error');
  reader.readAsText(file);
}

function requestOrientationLock() {
  if (screen.orientation && screen.orientation.lock && (window.matchMedia('(display-mode: standalone)').matches || document.fullscreenElement)) {
    screen.orientation.lock('landscape').catch(() => {});
  }
}

async function handleClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'close-modal') closeModal();
  else if (action === 'new-career') { requestOrientationLock(); openSlots('new'); }
  else if (action === 'load-career') openSlots('load');
  else if (action === 'slot-select') {
    const slot = Number(button.dataset.slot);
    if (button.dataset.mode === 'load') {
      if (!store.slots[slot]) return;
      session.slot = slot; session.career = normalizeCareer(store.slots[slot]); closeModal(); navigate('dashboard');
    } else if (store.slots[slot]) {
      showModal('Substituir carreira?', '<p>A carreira atual deste espaço será substituída. Os outros espaços não serão alterados.</p>',
        '<button class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-danger" data-action="confirm-new-slot" data-slot="' + slot + '">Substituir</button>');
    } else {
      session.slot = slot; session.selectedTeam = null; closeModal(); renderTeamSetup();
    }
  }
  else if (action === 'confirm-new-slot') { session.slot = Number(button.dataset.slot); session.selectedTeam = null; closeModal(); renderTeamSetup(); }
  else if (action === 'select-team') { session.selectedTeam = session.teams.find(team => team.id === button.dataset.team); renderTeamSetup(); }
  else if (action === 'setup-next') renderManagerSetup();
  else if (action === 'setup-back') { session.setupStep = 1; renderTeamSetup(); }
  else if (action === 'select-avatar') { session.selectedAvatar = Number(button.dataset.avatar); renderManagerSetup(); }
  else if (action === 'start-career') createCareer();
  else if (action === 'back-cover') {
    if (session.career) persist(true);
    renderCover();
  }
  else if (action === 'navigate') navigate(button.dataset.screen);
  else if (action === 'save') persist(false);
  else if (action === 'show-help') showHelp();
  else if (action === 'cover-settings') coverSettings();
  else if (action === 'toggle-lineup') {
    const id = button.dataset.player;
    const list = session.career.lineupIds;
    if (list.includes(id)) {
      if (list.length <= 1) return;
      session.career.lineupIds = list.filter(item => item !== id);
    } else if (list.length >= 11) toast('Retire um titular antes de escalar outro.', 'error');
    else session.career.lineupIds.push(id);
    persist(true); renderGame(renderSquad());
  }
  else if (action === 'best-lineup') { session.career.lineupIds = pickStartingLineup(session.career.roster).map(player => player.id); persist(true); renderGame(renderSquad()); toast('Melhor equipe disponível selecionada.', 'success'); }
  else if (action === 'set-formation') { session.career.tactics.formation = button.dataset.value; renderGame(renderTactics()); }
  else if (action === 'set-mentality') { session.career.tactics.mentality = button.dataset.value; renderGame(renderTactics()); }
  else if (action === 'save-tactics') { persist(true); toast('Estratégia confirmada.', 'success'); }
  else if (action === 'apply-training') applyTraining(button);
  else if (action === 'buy-player') {
    const player = session.market.find(item => item.id === button.dataset.player);
    if (!player) return;
    showModal('Confirmar contratação', '<p>Investir <strong>' + money(player.value * 1000000 * 1.08) + '</strong> na contratação de ' + escapeHtml(player.name) + '?</p>',
      '<button class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-buy" data-player="' + escapeHtml(player.id) + '">Confirmar</button>');
  }
  else if (action === 'confirm-buy') { const id = button.dataset.player; closeModal(); buyPlayer(id); }
  else if (action === 'prepare-match') prepareMatch();
  else if (action === 'toggle-match') toggleMatchPause();
  else if (action === 'match-speed') { session.match.speed = Number(button.dataset.speed); if (!session.matchTimer) resumeMatch(); else renderMatch(); }
  else if (action === 'finish-match') commitMatch();
  else if (action === 'leave-match') {
    if (session.match && session.match.ended) commitMatch();
    else {
      pauseMatch();
      showModal('Sair da partida?', '<p>O jogo atual será interrompido sem registrar resultado.</p>', '<button class="btn" data-action="resume-match-modal">Continuar partida</button><button class="btn btn-danger" data-action="abandon-match">Sair</button>');
    }
  }
  else if (action === 'resume-match-modal') { closeModal(); resumeMatch(); }
  else if (action === 'abandon-match') { session.match = null; closeModal(); navigate('dashboard'); }
  else if (action === 'export-save') exportSave();
  else if (action === 'import-save') document.querySelector('#import-file').click();
  else if (action === 'confirm-reset') showModal('Apagar carreira?', '<p>Esta ação remove somente a carreira do espaço atual e não pode ser desfeita.</p>', '<button class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-danger" data-action="reset-career">Apagar</button>');
  else if (action === 'reset-career') { delete store.slots[session.slot]; session.career = null; persist(true); closeModal(); renderCover(); toast('Carreira removida.'); }
}

function handleInput(event) {
  if (event.target.dataset.input === 'squad-search') {
    session.squadFilter = event.target.value;
    const cursor = event.target.selectionStart;
    renderGame(renderSquad());
    const input = document.querySelector('#squad-search');
    if (input) { input.focus(); input.setSelectionRange(cursor, cursor); }
  }
}

function handleChange(event) {
  const type = event.target.dataset.change;
  if (type === 'position-filter') { session.positionFilter = event.target.value; renderGame(renderSquad()); }
  else if (type === 'tactic-range') { session.career.tactics[event.target.dataset.key] = Number(event.target.value); renderGame(renderTactics()); }
  else if (type === 'reduce-motion') { document.body.classList.toggle('reduce-motion', event.target.checked); storageSet('vfm-reduce-motion', event.target.checked ? '1' : '0'); }
  else if (type === 'large-text') { document.body.classList.toggle('large-text', event.target.checked); storageSet('vfm-large-text', event.target.checked ? '1' : '0'); }
  if (event.target.id === 'import-file') importSave(event.target.files[0]);
}

document.body.classList.toggle('reduce-motion', storageGet('vfm-reduce-motion') === '1');
document.body.classList.toggle('large-text', storageGet('vfm-large-text') === '1');
init().catch(() => {
  bootScreen.classList.add('is-ready');
  app.innerHTML = '<main class="screen cover-screen"><section class="cover-copy"><h1 class="cover-title">Vale Futebol <span>Manager</span></h1><p class="cover-lead">Não foi possível iniciar agora. Atualize a página para tentar novamente.</p><button class="btn btn-primary" onclick="location.reload()">Tentar novamente</button></section></main>';
});
