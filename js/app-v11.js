const VERSION = '11.0.0';
const SCHEMA = 1100;
const STORE_KEY = 'vale-futebol-manager-v11';
const LEGACY_KEY = 'vale-futebol-manager-v10';
const MAX_SLOTS = 3;

const app = document.querySelector('#app');
const modalRoot = document.querySelector('#modal-root');
const toastRoot = document.querySelector('#toast-root');
const bootScreen = document.querySelector('#boot-screen');
const orientationGate = document.querySelector('#orientation-gate');

const session = {
  screen: 'cover', slot: null, career: null, catalog: null, selectedClub: null,
  selectedAvatar: 1, clubFilters: { continent: 'all', country: 'all', league: 'all', search: '' },
  nationalFilter: 'official', nationalSearch: '',
  squadSearch: '', positionFilter: 'TODOS', market: [], marketLoading: false,
  match: null, matchTimer: null, matchWasRunningBeforeGate: false, modalReturnFocus: null
};

const FORMATIONS = {
  '4-3-3': [[50,91],[18,75],[39,79],[61,79],[82,75],[28,57],[50,62],[72,57],[18,31],[50,20],[82,31]],
  '4-4-2': [[50,91],[18,75],[39,79],[61,79],[82,75],[16,51],[38,59],[62,59],[84,51],[36,24],[64,24]],
  '4-2-3-1': [[50,91],[18,75],[39,79],[61,79],[82,75],[36,62],[64,62],[18,42],[50,43],[82,42],[50,18]],
  '3-5-2': [[50,91],[25,78],[50,81],[75,78],[12,53],[34,61],[50,50],[66,61],[88,53],[36,24],[64,24]]
};

const NAV_ITEMS = [
  ['dashboard','⌂','Início'], ['squad','♟','Elenco'], ['tactics','⌁','Tática'], ['competitions','◆','Competições'],
  ['calendar','▦','Agenda'], ['match-center','▶','Jogar'], ['training','⌁','Treino'], ['market','⇄','Mercado'],
  ['club','▥','Clube'], ['inbox','✉','E-mail'], ['national','★','Seleção'], ['settings','⚙','Ajustes']
];

let store = loadStore();

function escapeHtml(value = '') {
  return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#039;');
}

function clamp(value, min, max) {
  const number = Number(value);
  return Math.min(max, Math.max(min, Number.isFinite(number) ? number : min));
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', notation:'compact', maximumFractionDigits:1 }).format(Number(value) || 0);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Data indisponível' : new Intl.DateTimeFormat('pt-BR', { day:'2-digit', month:'short', year:'numeric' }).format(date);
}

function storageGet(key) { try { return localStorage.getItem(key); } catch { return null; } }
function storageSet(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
function safeParse(value, fallback) { try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' ? parsed : fallback; } catch { return fallback; } }

function loadStore() {
  const fallback = { schema: SCHEMA, slots: Array(MAX_SLOTS).fill(null), settings: { reducedMotion:false } };
  const current = safeParse(storageGet(STORE_KEY), null);
  if (current?.slots) return normalizeStore(current);
  const legacy = safeParse(storageGet(LEGACY_KEY), null);
  if (legacy?.slots) {
    const migrated = normalizeStore({ ...fallback, slots: legacy.slots.map(migrateCareer) });
    storageSet(STORE_KEY, JSON.stringify(migrated));
    return migrated;
  }
  return fallback;
}

function normalizeStore(value) {
  const slots = Array(MAX_SLOTS).fill(null).map((_, index) => value.slots?.[index] ? migrateCareer(value.slots[index]) : null);
  return { schema: SCHEMA, slots, settings: { reducedMotion: Boolean(value.settings?.reducedMotion) } };
}

function migrateCareer(career) {
  if (!career || typeof career !== 'object') return null;
  career.schema = SCHEMA;
  career.version = VERSION;
  career.manager = career.manager || { name:'Treinador', avatar:1, difficulty:'Equilibrado' };
  career.manager.reputation = clamp(career.manager.reputation || 45, 1, 100);
  career.manager.xp = Math.max(0, Number(career.manager.xp) || 0);
  career.manager.level = Math.max(1, Number(career.manager.level) || 1);
  career.manager.license = career.manager.license || managerLicense(career.manager.reputation);
  career.manager.awards = Array.isArray(career.manager.awards) ? career.manager.awards : [];
  career.tactics = { formation:'4-3-3', mentality:'Equilibrada', pressure:58, tempo:55, width:55, defensiveLine:52, passing:'Misto', marking:'Zona', transition:'Equilibrada', ...(career.tactics || {}) };
  career.stats = { played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,...(career.stats || {}) };
  career.messages = Array.isArray(career.messages) ? career.messages : [];
  career.national = career.national || null;
  career.facilities = { training:2, youth:2, medical:2, scouting:2, ...(career.facilities || {}) };
  career.seasonHistory = Array.isArray(career.seasonHistory) ? career.seasonHistory : [];
  career.jobOffers = Array.isArray(career.jobOffers) ? career.jobOffers : [];
  career.transferPolicy = { wageBudget:Math.round((career.budget||50000000)*.18), maxSquad:35, foreignLimit:null, ...(career.transferPolicy || {}) };
  return career;
}

function managerLicense(reputation) {
  if(reputation>=88)return 'Licença Continental Pro';
  if(reputation>=76)return 'Licença Continental A';
  if(reputation>=64)return 'Licença Continental B';
  if(reputation>=52)return 'Licença Continental C';
  return 'Licença Nacional';
}

function persist(showToast = false) {
  if (session.career && session.slot) {
    session.career.updatedAt = new Date().toISOString();
    store.slots[session.slot - 1] = session.career;
  }
  storageSet(STORE_KEY, JSON.stringify(store));
  if (showToast) toast('Carreira salva.', 'success');
}

function toast(message, type = '') {
  const item = document.createElement('div');
  item.className = 'toast ' + type;
  item.textContent = message;
  toastRoot.append(item);
  setTimeout(() => item.remove(), 2800);
}

function imageFallback(event, kind = 'club') {
  const img = event.target;
  if (!img || img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = '1';
  img.src = kind === 'player' ? './assets/placeholders/player-generic.png' : kind === 'avatar' ? './assets/avatars/manager-01.png' : './assets/placeholders/club-generic.png';
}
window.__vfmFallback = imageFallback;

async function fetchJson(path) {
  const response = await fetch('./' + String(path).replace(/^\.\//,''));
  if (!response.ok) throw new Error('Falha ao carregar ' + path);
  return response.json();
}

function normalizePlayer(player, index = 0) {
  return {
    id:String(player.id || 'player-' + index), name:String(player.displayName || player.name || 'Jogador'),
    role:String(player.role || player.positionName || player.pos || 'Jogador'), pos:String(player.pos || player.position || 'MC'),
    overall:clamp(player.overall || 60, 1, 99), potential:clamp(player.potential || player.overall || 60, 1, 99),
    age:clamp(player.age || 24, 15, 50), salary:Number(player.salary) || 35, value:Number(player.marketValue ?? player.value) || 1,
    fitness:clamp(player.fitness ?? 88, 1, 100), morale:clamp(player.morale ?? 74, 1, 100),
    photo:player.photo || '', clubName:player.clubName || '', contractUntil:player.contractUntil || '2027-12-31'
  };
}

function playerPhoto(player) {
  return player?.photo ? './' + String(player.photo).replace(/^\.\//,'') : './assets/placeholders/player-generic.png';
}

function pickLineup(roster) {
  const wanted = [['GOL',1],['ZAG',2],['LD',1],['LE',1],['VOL',1],['MC',2],['PD',1],['PE',1],['ATA',1]];
  const picked = [];
  wanted.forEach(([pos,count]) => roster.filter(p => p.pos === pos && !picked.includes(p)).sort((a,b)=>b.overall-a.overall).slice(0,count).forEach(p=>picked.push(p)));
  roster.filter(p=>!picked.includes(p)).sort((a,b)=>b.overall-a.overall).slice(0,11-picked.length).forEach(p=>picked.push(p));
  return picked.slice(0,11);
}

function clubKey(club) { return club.leagueId + ':' + club.id; }
function findClub(id, leagueId) { return session.catalog.clubs.find(club => club.id === id && (!leagueId || club.leagueId === leagueId)); }
function findLeague(id) { return session.catalog.leagues.find(league => league.id === id); }

function showModal(title, body, actions = '<button class="btn" data-action="close-modal">Fechar</button>') {
  session.modalReturnFocus = document.activeElement;
  modalRoot.innerHTML = '<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="' + escapeHtml(title) + '"><h2>' + escapeHtml(title) + '</h2><div class="modal-body">' + body + '</div><div class="modal-actions">' + actions + '</div></section></div>';
  const focus = modalRoot.querySelector('button,input,select');
  if (focus) focus.focus({ preventScroll:true });
}

function closeModal() {
  modalRoot.innerHTML = '';
  if (session.modalReturnFocus?.focus) session.modalReturnFocus.focus({ preventScroll:true });
  session.modalReturnFocus = null;
}

function renderCover() {
  stopMatchTimer();
  session.screen = 'cover'; session.career = null; session.slot = null;
  const canContinue = store.slots.some(Boolean);
  app.innerHTML = '<main class="screen cover-screen"><section class="cover-copy"><p class="eyebrow">Gold World Edition</p>' +
    '<h1 class="cover-title">Vale Futebol <span>Manager</span></h1><p class="cover-lead">Construa uma carreira mundial. Comande clubes e seleções, dispute ligas, copas nacionais e torneios continentais.</p>' +
    '<div class="cover-actions"><button class="btn btn-primary" data-action="new-career">Nova carreira</button><button class="btn" data-action="load-career" ' + (canContinue?'':'disabled') + '>Continuar</button><button class="btn" data-action="world-database">Base mundial</button><button class="btn" data-action="show-help">Como jogar</button></div>' +
    '<p class="world-counts">' + session.catalog.stats.simulationClubs + ' clubes · ' + session.catalog.stats.clubPlayers.toLocaleString('pt-BR') + ' jogadores de clubes · ' + session.catalog.stats.nationalTeams + ' seleções</p>' +
    '<p class="version-label">Versão ' + VERSION + '</p></section></main>';
}

function slotModal(mode) {
  const cards = store.slots.map((career,index) => {
    const slot = index + 1;
    return '<article class="slot-card"><div><strong>Espaço ' + slot + '</strong><small>' + (career ? escapeHtml(career.manager?.name || 'Treinador') + ' · ' + escapeHtml(career.club?.name || 'Clube') + '<br>Temporada ' + (career.season || 2026) + ' · Reputação ' + (career.manager?.reputation || 45) : 'Disponível para uma nova carreira') + '</small></div>' +
      (mode === 'load' ? '<button class="btn btn-small" data-action="slot-load" data-slot="' + slot + '" ' + (career?'':'disabled') + '>' + (career?'Carregar':'Vazio') + '</button>' : '<button class="btn btn-small" data-action="slot-new" data-slot="' + slot + '">' + (career?'Substituir':'Escolher') + '</button>') + '</article>';
  }).join('');
  showModal(mode === 'load' ? 'Carregar carreira' : 'Escolha um espaço', '<div class="slot-list">' + cards + '</div>');
}

function worldDatabaseModal() {
  const stats = session.catalog.stats;
  const countries = new Set(session.catalog.leagues.map(l=>l.country)).size;
  showModal('Base mundial 2026', '<div class="world-stats"><div><strong>' + stats.playableClubs + '</strong><span>clubes comandáveis</span></div><div><strong>' + stats.simulationClubs + '</strong><span>clubes no mundo</span></div><div><strong>' + stats.clubPlayers.toLocaleString('pt-BR') + '</strong><span>jogadores de clubes</span></div><div><strong>' + stats.nationalTeams + '</strong><span>associações FIFA</span></div><div><strong>' + stats.commandableNationalTeams + '</strong><span>seleções comandáveis</span></div><div><strong>' + stats.nationalPlayers.toLocaleString('pt-BR') + '</strong><span>jogadores de seleções</span></div><div><strong>' + countries + '</strong><span>países com liga</span></div><div><strong>16</strong><span>faces fotorealistas</span></div></div><p class="muted">As 211 seleções participam da simulação. Há 48 listas oficiais da Copa de 2026 e pools profissionais atuais para outras seleções; GER e potencial são índices próprios do VFM.</p>');
}

function renderClubSelect() {
  const f = session.clubFilters;
  const playable = session.catalog.clubs.filter(club => club.rosterPath);
  const continents = [['all','Todos'],['south-america','América do Sul'],['north-america','América do Norte'],['europe','Europa'],['asia','Ásia'],['africa','África'],['oceania','Oceania']];
  const countries = [...new Map(playable.filter(c=>f.continent==='all'||c.continent===f.continent).map(c=>[c.countryId,c.country])).entries()].sort((a,b)=>a[1].localeCompare(b[1],'pt-BR'));
  const leagues = session.catalog.leagues.filter(l=>(f.continent==='all'||l.continent===f.continent)&&(f.country==='all'||l.countryId===f.country));
  const clubs = playable.filter(club => (f.continent==='all'||club.continent===f.continent) && (f.country==='all'||club.countryId===f.country) && (f.league==='all'||club.leagueId===f.league) && (!f.search||club.name.toLowerCase().includes(f.search.toLowerCase())));
  const cards = clubs.map(club => '<button class="world-club-card ' + (session.selectedClub && clubKey(session.selectedClub)===clubKey(club)?'selected':'') + '" data-action="select-world-club" data-key="' + escapeHtml(clubKey(club)) + '"><img src="./' + escapeHtml(club.badge) + '" alt="" onerror="__vfmFallback(event)"><span><strong>' + escapeHtml(club.name) + '</strong><small>' + escapeHtml(club.country) + ' · ' + escapeHtml(club.leagueName) + '</small></span><em>GER ' + club.rating + '</em></button>').join('');
  app.innerHTML = '<main class="screen world-select-screen"><header class="setup-header"><button class="btn btn-icon" data-action="back-cover" aria-label="Voltar">←</button><div><p class="eyebrow">Nova carreira mundial</p><h1>Escolha seu clube</h1></div><span class="step-label">1 de 2 · ' + clubs.length + ' clubes</span></header>' +
    '<section class="world-filter-bar"><select aria-label="Continente" data-action="filter-continent">' + continents.map(([id,name])=>'<option value="'+id+'" '+(f.continent===id?'selected':'')+'>'+name+'</option>').join('') + '</select>' +
    '<select aria-label="País" data-action="filter-country"><option value="all">Todos os países</option>' + countries.map(([id,name])=>'<option value="'+id+'" '+(f.country===id?'selected':'')+'>'+escapeHtml(name)+'</option>').join('') + '</select>' +
    '<select aria-label="Liga" data-action="filter-league"><option value="all">Todas as ligas</option>' + leagues.map(l=>'<option value="'+l.id+'" '+(f.league===l.id?'selected':'')+'>'+escapeHtml(l.name)+'</option>').join('') + '</select>' +
    '<input aria-label="Buscar clube" data-action="filter-club-search" value="' + escapeHtml(f.search) + '" placeholder="Buscar clube"></section>' +
    '<section class="world-club-grid">' + (cards || '<div class="empty-state"><strong>Nenhum clube encontrado</strong><span>Ajuste os filtros.</span></div>') + '</section>' +
    '<footer class="setup-footer"><div class="selected-club-summary">' + (session.selectedClub ? '<img src="./'+escapeHtml(session.selectedClub.badge)+'" alt="" onerror="__vfmFallback(event)"><span><strong>'+escapeHtml(session.selectedClub.name)+'</strong><small>'+escapeHtml(session.selectedClub.leagueName)+'</small></span>' : '<span><strong>Selecione um clube</strong><small>Somente equipes com elenco nominal completo aparecem aqui.</small></span>') + '</div><button class="btn btn-primary" data-action="club-next" ' + (session.selectedClub?'':'disabled') + '>Continuar</button></footer></main>';
}

function renderManagerSetup() {
  const avatarLabels=['Homem negro sênior','Mulher leste-asiática','Homem sul-asiático','Mulher latina','Homem latino','Mulher negra','Homem branco sênior','Mulher árabe','Homem leste-asiático','Mulher branca','Homem negro','Homem árabe','Mulher latina','Homem branco','Mulher sul-asiática','Homem branco sênior'];
  const avatars = Array.from({length:16},(_,i)=>i+1).map(number => '<button class="avatar-btn photoreal ' + (session.selectedAvatar===number?'selected':'') + '" data-action="select-avatar" data-avatar="' + number + '" aria-label="'+avatarLabels[number-1]+'"><span class="avatar-sprite avatar-sprite-'+number+'" aria-hidden="true"></span><small>'+avatarLabels[number-1]+'</small></button>').join('');
  const club = session.selectedClub;
  app.innerHTML = '<main class="screen setup-screen"><header class="setup-header"><button class="btn btn-icon" data-action="manager-back" aria-label="Voltar">←</button><div><p class="eyebrow">Seu perfil</p><h1>Assine o primeiro contrato</h1></div><span class="step-label">2 de 2</span></header>' +
    '<section class="setup-body manager-world-body"><div class="avatar-world-list">' + avatars + '</div><div class="form-card"><div class="field"><label for="manager-name">Nome do treinador</label><input id="manager-name" maxlength="32" placeholder="Como você quer ser chamado?"></div><div class="field"><label for="difficulty">Nível de desafio</label><select id="difficulty"><option>Acessível</option><option selected>Equilibrado</option><option>Especialista</option></select></div><div class="career-summary"><img src="./'+escapeHtml(club.badge)+'" alt="" onerror="__vfmFallback(event)"><div><strong>'+escapeHtml(club.name)+'</strong><small>'+escapeHtml(club.country)+' · '+escapeHtml(club.leagueName)+' · GER '+club.rating+'</small></div></div></div></section>' +
    '<footer class="setup-footer"><button class="btn btn-primary" data-action="start-career">Assinar contrato</button></footer></main>';
  document.querySelector('#manager-name')?.focus({preventScroll:true});
}

function leagueSize(leagueId) {
  return Number(findLeague(leagueId)?.rules?.teams) || ({'brasileirao-a':20,'brasileirao-b':20,'premier-league':20,'laliga':20,'bundesliga':18,'ligue-1':18,'liga-portugal':18,'serie-a-italia':20,'argentina-primera':28,'chile-primera':16,'colombia-primera-a':20,'ecuador-serie-a':16,'uruguay-primera':16})[leagueId] || 16;
}

function selectLeagueParticipants(club) {
  const pool = session.catalog.clubs.filter(item=>item.leagueId===club.leagueId);
  const unique = [...new Map(pool.map(item=>[item.id,item])).values()];
  const selected = unique.find(item=>item.id===club.id) || club;
  return [selected, ...unique.filter(item=>item.id!==club.id).sort((a,b)=>b.rating-a.rating)].slice(0,leagueSize(club.leagueId));
}

function addDays(date, days) { const next = new Date(date); next.setDate(next.getDate()+days); return next.toISOString(); }

function buildLeagueFixtures(club, participants, startDate) {
  const opponents = participants.filter(item=>item.id!==club.id);
  const first = opponents.map((opponent,index)=>({ id:'league-'+(index+1), competitionId:club.leagueId, competitionName:club.leagueName, type:'league', round:index+1, date:addDays(startDate,index*7), opponent, home:index%2===0, played:false, score:null }));
  return first.concat(opponents.map((opponent,index)=>({ id:'league-'+(opponents.length+index+1), competitionId:club.leagueId, competitionName:club.leagueName, type:'league', round:opponents.length+index+1, date:addDays(startDate,(opponents.length+index)*7), opponent, home:index%2!==0, played:false, score:null })));
}

function buildCupFixtures(club, participants, startDate) {
  const opponents = participants.filter(item=>item.id!==club.id).sort(()=>Math.random()-.5);
  const countryCup = club.countryId==='brazil' ? 'Copa do Brasil' : 'Copa de ' + club.country;
  const stages = ['Primeira fase','Oitavas de final','Quartas de final','Semifinal','Final'];
  return stages.map((stage,index)=>({ id:'cup-'+(index+1), competitionId:'domestic-cup', competitionName:countryCup, type:'cup', stage, round:index+1, date:addDays(startDate,18+index*42), opponent:opponents[index%opponents.length], home:index%2===0, played:false, locked:index>0, score:null }));
}

function buildContinentalFixtures(club, startDate, participants, forcedCompetitionId=null) {
  const leaguePool = session.catalog.clubs.filter(item=>item.confederation===club.confederation&&item.leagueId!==club.leagueId);
  const rated = leaguePool.sort((a,b)=>b.rating-a.rating);
  const league=findLeague(club.leagueId),ranking=[...participants].sort((a,b)=>b.rating-a.rating),seed=ranking.findIndex(team=>team.id===club.id)+1;
  const allocations=league?.rules?.continental||{};
  const id=forcedCompetitionId||Object.entries(allocations).find(([,range])=>seed>=Number(range[0])&&seed<=Number(range[1]))?.[0];
  if(!id)return [];
  const names = {'champions-league':'UEFA Champions League','europa-league':'UEFA Europa League','libertadores':'CONMEBOL Libertadores','sulamericana':'CONMEBOL Sul-Americana','concacaf-champions-cup':'CONCACAF Champions Cup','afc-champions-league':'AFC Champions League Elite','caf-champions-league':'CAF Champions League','ofc-champions-league':'OFC Champions League','continental-cup':'Copa continental'};
  return rated.slice(0,club.confederation==='UEFA'?8:6).map((opponent,index)=>({ id:'continental-'+(index+1), competitionId:id, competitionName:names[id]||'Copa continental', type:'continental', qualificationSeed:seed, stage:club.confederation==='UEFA'?'Fase de liga':'Fase de grupos', round:index+1, date:addDays(startDate,10+index*21), opponent, home:index%2===0, played:false, score:null }));
}

function buildWorldFixtures(club, startDate) {
  const confederations = ['UEFA','CONMEBOL','CONCACAF','AFC','CAF','OFC'].filter(id=>id!==club.confederation);
  const opponents = confederations.map(confederation=>session.catalog.clubs.filter(item=>item.confederation===confederation).sort((a,b)=>b.rating-a.rating)[0]).filter(Boolean).slice(0,3);
  return opponents.map((opponent,index)=>({id:'world-club-'+(index+1),competitionId:'club-world-cup',competitionName:'Mundial de Clubes',type:'world',stage:'Fase de grupos',round:index+1,date:addDays(startDate,430+index*5),opponent,home:index%2===0,played:false,score:null}));
}

function initialTable(participants) {
  return participants.map(team=>({ team, played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0 })).sort((a,b)=>b.team.rating-a.team.rating);
}

function initialMessages(club) {
  return [
    {id:'welcome',from:'Presidência',subject:'Bem-vindo ao '+club.name,body:'A diretoria espera competitividade em todas as frentes e evolução sustentável do elenco.',date:new Date().toISOString(),read:false,priority:'high'},
    {id:'season-goals',from:'Diretor de futebol',subject:'Metas da temporada',body:'Objetivo nacional: terminar na metade superior. Na copa, a meta é alcançar as quartas de final.',date:new Date().toISOString(),read:false,priority:'normal'},
    {id:'scouting',from:'Chefe de scout',subject:'Rede internacional ativa',body:'Nossa rede cobre América do Sul e Europa. O mercado exibirá apenas atletas nominais presentes na base 2026.',date:new Date().toISOString(),read:false,priority:'normal'}
  ];
}

async function createCareer() {
  const name = document.querySelector('#manager-name')?.value.trim() || '';
  if (name.length < 2) { toast('Digite um nome com pelo menos 2 caracteres.','error'); return; }
  const button = document.querySelector('[data-action="start-career"]');
  if (button) { button.disabled=true; button.textContent='Carregando mundo…'; }
  try {
    const data = await fetchJson(session.selectedClub.rosterPath);
    const roster = (data.players || []).map(normalizePlayer);
    if (roster.length < 11) throw new Error('Elenco insuficiente');
    const league = findLeague(session.selectedClub.leagueId);
    const participants = selectLeagueParticipants(session.selectedClub);
    const startDate = session.selectedClub.continent==='europe' ? new Date(2026,7,8,15) : session.selectedClub.countryId==='brazil' ? new Date(2026,3,11,16) : new Date(2026,1,7,16);
    const fixtures = [...buildLeagueFixtures(session.selectedClub,participants,startDate),...buildCupFixtures(session.selectedClub,participants,startDate),...buildContinentalFixtures(session.selectedClub,startDate,participants)].sort((a,b)=>new Date(a.date)-new Date(b.date));
    const reputation = clamp(Math.round(session.selectedClub.rating*.78),45,72);
    const budget = Math.round((35 + (session.selectedClub.rating-65)*3.2)*1000000);
    session.career = {
      schema:SCHEMA,version:VERSION,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
      manager:{name,avatar:session.selectedAvatar,difficulty:document.querySelector('#difficulty')?.value||'Equilibrado',reputation,xp:0,level:1,license:managerLicense(reputation),awards:[]},
      club:{...session.selectedClub},season:2026,date:startDate.toISOString(),week:1,budget,board:72,morale:74,fitness:88,
      roster,lineupIds:pickLineup(roster).map(p=>p.id),tactics:{formation:'4-3-3',mentality:'Equilibrada',pressure:58,tempo:55,width:55,defensiveLine:52,passing:'Misto',marking:'Zona',transition:'Equilibrada'},
      stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0},participants,table:initialTable(participants),fixtures,
      ledger:[{date:new Date().toISOString(),label:'Orçamento da temporada',amount:budget,type:'income'}],messages:initialMessages(session.selectedClub),
      staff:{assistant:68,fitnessCoach:66,scout:64,medical:65},facilities:{training:2,youth:2,medical:2,scouting:2},transferPolicy:{wageBudget:Math.round(budget*.18),maxSquad:35,foreignLimit:null},seasonHistory:[],jobOffers:[],lastTrainingWeek:0,national:null,seasonSummary:null
    };
    persist(); toast('Contrato assinado. O mundo do futebol está ativo.','success'); navigate('dashboard');
  } catch (error) {
    if (button) { button.disabled=false; button.textContent='Assinar contrato'; }
    toast('Não foi possível carregar o elenco completo deste clube.','error');
  }
}

function currentCompetitionFixtures(id) { return session.career.fixtures.filter(f=>f.competitionId===id); }
function nextFixture() { return session.career.fixtures.find(f=>!f.played&&!f.locked) || null; }

function renderGame(content) {
  const c = session.career;
  const unread = c.messages.filter(m=>!m.read).length;
  const nav = NAV_ITEMS.map(([screen,icon,label])=>'<button class="world-nav-btn '+(session.screen===screen?'active':'')+'" data-action="navigate" data-screen="'+screen+'" aria-label="'+label+'"><span>'+icon+'</span><small>'+label+(screen==='inbox'&&unread?'<b>'+unread+'</b>':'')+'</small></button>').join('');
  app.innerHTML = '<main class="screen game-screen world-game"><nav class="world-nav" aria-label="Menu principal"><div class="nav-brand">V</div>'+nav+'</nav><section class="game-stage"><header class="world-topbar"><div class="club-identity"><img src="./'+escapeHtml(c.club.badge)+'" alt="" onerror="__vfmFallback(event)"><span><strong>'+escapeHtml(c.club.name)+'</strong><small>'+escapeHtml(c.manager.name)+' · '+escapeHtml(c.club.leagueName)+'</small></span><i class="manager-face-small avatar-sprite avatar-sprite-'+clamp(c.manager.avatar,1,16)+'" aria-label="Retrato do treinador"></i></div><div class="top-metrics"><span>Data <strong>'+formatDate(c.date)+'</strong></span><span>Reputação <strong>'+c.manager.reputation+'</strong></span><span>Licença <strong>'+escapeHtml(c.manager.license)+'</strong></span><span>Saldo <strong>'+money(c.budget)+'</strong></span></div><button class="btn btn-small" data-action="save">Salvar</button></header><div class="game-content world-screen-'+escapeHtml(session.screen)+'">'+content+'</div></section></main>';
}

function sectionHead(title,subtitle,extra='') { return '<header class="section-head"><div><p class="eyebrow">Carreira mundial</p><h1>'+escapeHtml(title)+'</h1><p>'+escapeHtml(subtitle)+'</p></div>'+extra+'</header>'; }

function confederationClubLabel(confederation) {
  return {UEFA:'Champions League e Europa League',CONMEBOL:'Libertadores e Sul-Americana',CONCACAF:'CONCACAF Champions Cup',AFC:'AFC Champions League Elite',CAF:'CAF Champions League',OFC:'OFC Champions League'}[confederation]||'Competições continentais';
}

function renderDashboard() {
  const c=session.career, next=nextFixture(), recent=c.fixtures.filter(f=>f.played).slice(-5).reverse();
  const unread=c.messages.filter(m=>!m.read).length;
  const leagueFinished=c.fixtures.filter(f=>f.type==='league').length>0&&c.fixtures.filter(f=>f.type==='league').every(f=>f.played);
  return sectionHead('Central do treinador','Todas as decisões do clube e da seleção em um só lugar.','<span class="tag">Nível '+c.manager.level+'</span>') +
    '<div class="dashboard-world-grid"><article class="hero-fixture panel">'+(next?'<div><span class="competition-pill">'+escapeHtml(next.competitionName)+'</span><h2>Próximo jogo</h2><div class="versus-row"><div><img src="./'+escapeHtml(c.club.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(c.club.name)+'</strong></div><b>VS</b><div><img src="./'+escapeHtml(next.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(next.opponent.name)+'</strong></div></div><p>'+formatDate(next.date)+' · '+(next.home?'Casa':'Fora')+'</p><button class="btn btn-primary" data-action="open-next-match">Preparar partida</button></div>':'<div class="empty-state"><strong>Calendário concluído</strong>'+(leagueFinished?'<button class="btn btn-primary" data-action="advance-season">Encerrar temporada e aplicar regras</button>':'<span>Ainda há jogos de liga pendentes.</span>')+'</div>')+'</article>' +
    '<article class="panel"><h2>Desempenho</h2><div class="world-metric-grid"><div><span>Jogos</span><strong>'+c.stats.played+'</strong></div><div><span>Pontos</span><strong>'+c.stats.points+'</strong></div><div><span>Saldo</span><strong>'+(c.stats.gf-c.stats.ga)+'</strong></div><div><span>Diretoria</span><strong>'+c.board+'%</strong></div></div><div class="form-strip">'+(recent.length?recent.map(f=>'<span class="'+resultClass(f)+'">'+resultLetter(f)+'</span>').join(''):'<small>A temporada começa no próximo jogo.</small>')+'</div></article>' +
    '<article class="panel"><h2>Caixa de entrada</h2><p class="big-number">'+unread+'</p><p>mensagens aguardando leitura</p><button class="btn" data-action="navigate" data-screen="inbox">Abrir e-mail</button></article>' +
    '<article class="panel"><h2>Carreira internacional</h2>'+(c.national?'<div class="national-mini"><img src="./'+escapeHtml(c.national.team.badge)+'" alt="" onerror="__vfmFallback(event)"><span><strong>'+escapeHtml(c.national.team.name)+'</strong><small>'+escapeHtml(c.national.competitionLabel)+'</small></span></div><button class="btn" data-action="navigate" data-screen="national">Abrir seleção</button>':'<p>Receba propostas de seleções conforme sua reputação cresce.</p><button class="btn" data-action="navigate" data-screen="national">Ver oportunidades</button>')+'</article>' +
    '<article class="panel news-panel"><h2>Mundo do futebol</h2><ul><li><strong>'+escapeHtml(c.club.leagueName)+'</strong><span>A temporada nacional está em andamento.</span></li><li><strong>'+escapeHtml(c.club.confederation)+'</strong><span>'+escapeHtml(confederationClubLabel(c.club.confederation))+' movimenta o continente.</span></li><li><strong>Mercado global</strong><span>Clubes de '+new Set(session.catalog.clubs.map(x=>x.country)).size+' países estão monitorando atletas.</span></li></ul></article></div>';
}

function resultClass(f) { const own=f.home?f.score?.home:f.score?.away, opp=f.home?f.score?.away:f.score?.home; return own>opp?'win':own<opp?'loss':'draw'; }
function resultLetter(f) { return resultClass(f)==='win'?'V':resultClass(f)==='loss'?'D':'E'; }

function renderSquad() {
  const c=session.career, filtered=c.roster.filter(p=>(session.positionFilter==='TODOS'||p.pos===session.positionFilter)&&(!session.squadSearch||p.name.toLowerCase().includes(session.squadSearch.toLowerCase()))).sort((a,b)=>b.overall-a.overall);
  const positions=['TODOS',...new Set(c.roster.map(p=>p.pos))];
  const rows=filtered.map(p=>'<tr><td><div class="player-cell"><img src="'+escapeHtml(playerPhoto(p))+'" alt="" loading="lazy" onerror="__vfmFallback(event,\'player\')"><span><strong>'+escapeHtml(p.name)+'</strong><small>'+escapeHtml(p.role)+'</small></span></div></td><td><span class="pos-tag">'+escapeHtml(p.pos)+'</span></td><td><strong>'+p.overall+'</strong></td><td>'+p.age+'</td><td>'+p.fitness+'%</td><td>'+p.morale+'%</td><td>'+money(p.value*1000000)+'</td><td><button class="btn btn-small '+(c.lineupIds.includes(p.id)?'btn-primary':'')+'" data-action="toggle-lineup" data-player="'+escapeHtml(p.id)+'">'+(c.lineupIds.includes(p.id)?'Titular':'Escalar')+'</button></td></tr>').join('');
  return sectionHead('Elenco','Jogadores nominais, atributos 2026, contratos, forma e moral.','<span class="tag">'+c.lineupIds.length+'/11 titulares</span>')+'<div class="toolbar"><input data-action="squad-search" aria-label="Buscar jogador" placeholder="Buscar jogador" value="'+escapeHtml(session.squadSearch)+'"><select data-action="position-filter" aria-label="Filtrar posição">'+positions.map(p=>'<option '+(p===session.positionFilter?'selected':'')+'>'+p+'</option>').join('')+'</select><button class="btn" data-action="best-lineup">Melhor equipe</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Jogador</th><th>Pos.</th><th>GER</th><th>Idade</th><th>Físico</th><th>Moral</th><th>Valor</th><th>Escalação</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function formationPreview(roster,lineupIds,formation) {
  const players=lineupIds.map(id=>roster.find(p=>p.id===id)).filter(Boolean).slice(0,11);
  const coords=FORMATIONS[formation]||FORMATIONS['4-3-3'];
  return '<div class="formation-pitch">'+coords.map(([x,y],i)=>'<div class="formation-player" style="left:'+x+'%;top:'+y+'%"><span>'+escapeHtml(players[i]?.pos||'–')+'</span><small>'+escapeHtml((players[i]?.name||'Vaga').split(' ').slice(-1)[0])+'</small></div>').join('')+'</div>';
}

function renderTactics() {
  const c=session.career,t=c.tactics;
  const options=(values,current)=>values.map(value=>'<option '+(value===current?'selected':'')+'>'+value+'</option>').join('');
  return sectionHead('Tática e formação','Defina estrutura, transição, pressão, ritmo e comportamento coletivo.')+'<div class="tactics-layout"><article class="panel">'+formationPreview(c.roster,c.lineupIds,t.formation)+'</article><article class="panel tactics-controls"><div class="tactics-select-grid"><div class="field"><label>Formação</label><select data-action="formation-select">'+options(Object.keys(FORMATIONS),t.formation)+'</select></div><div class="field"><label>Mentalidade</label><select data-action="mentality-select">'+options(['Defensiva','Equilibrada','Ofensiva'],t.mentality)+'</select></div><div class="field"><label>Construção</label><select data-action="passing-select">'+options(['Curto','Misto','Direto'],t.passing)+'</select></div><div class="field"><label>Marcação</label><select data-action="marking-select">'+options(['Zona','Individual','Híbrida'],t.marking)+'</select></div><div class="field"><label>Transição</label><select data-action="transition-select">'+options(['Reagrupar','Equilibrada','Contra-atacar'],t.transition)+'</select></div></div><label>Pressão <output>'+t.pressure+'</output><input type="range" min="20" max="90" value="'+t.pressure+'" data-action="pressure-range"></label><label>Ritmo <output>'+t.tempo+'</output><input type="range" min="20" max="90" value="'+t.tempo+'" data-action="tempo-range"></label><label>Largura <output>'+t.width+'</output><input type="range" min="25" max="85" value="'+t.width+'" data-action="width-range"></label><label>Linha defensiva <output>'+t.defensiveLine+'</output><input type="range" min="20" max="85" value="'+t.defensiveLine+'" data-action="line-range"></label><p class="muted">A formação organiza visualmente os 22 jogadores; as instruções afetam posse, criação de chances, desgaste e risco defensivo.</p></article></div>';
}

function zoneFor(row,index,total,rules) {
  if (rules.promotion && index<rules.promotion) return 'promotion';
  const continental=rules.continental||{};
  for (const [id,range] of Object.entries(continental)) if(index+1>=range[0]&&index+1<=range[1]) return id;
  if (rules.relegation && index>=total-rules.relegation) return 'relegation';
  return '';
}

function sortedTable() { return session.career.table.slice().sort((a,b)=>b.points-a.points||b.wins-a.wins||b.gd-a.gd||b.gf-a.gf||b.team.rating-a.team.rating); }

function renderCompetitions() {
  const c=session.career, league=findLeague(c.club.leagueId), table=sortedTable();
  const compIds=[...new Set(c.fixtures.map(f=>f.competitionId))];
  const compCards=compIds.map(id=>{const list=currentCompetitionFixtures(id), played=list.filter(f=>f.played).length,next=list.find(f=>!f.played&&!f.locked);return '<article class="competition-card"><span class="competition-logo">◆</span><div><strong>'+escapeHtml(list[0]?.competitionName||id)+'</strong><small>'+played+'/'+list.length+' jogos · '+(next?formatDate(next.date):'concluída')+'</small></div></article>';}).join('');
  const rows=table.map((row,index)=>'<tr class="'+zoneFor(row,index,table.length,league.rules)+'"><td>'+(index+1)+'</td><td><div class="mini-club"><img src="./'+escapeHtml(row.team.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(row.team.name)+'</strong></div></td><td>'+row.played+'</td><td>'+row.wins+'</td><td>'+row.draws+'</td><td>'+row.losses+'</td><td>'+row.gf+'</td><td>'+row.ga+'</td><td>'+row.gd+'</td><td><strong>'+row.points+'</strong></td></tr>').join('');
  return sectionHead('Competições','Liga, copa nacional e torneios continentais conectados ao calendário.')+'<div class="competition-grid">'+compCards+'</div><div class="rules-strip">'+rulesText(league).map(item=>'<span>'+escapeHtml(item)+'</span>').join('')+'</div><div class="table-wrap"><table class="data-table standings-table"><thead><tr><th>#</th><th>'+escapeHtml(league.name)+'</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>PTS</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function rulesText(league) {
  const rules=league.rules||{}, result=[];
  if(rules.promotionDirect)result.push('1º–'+rules.promotionDirect+'º: acesso direto');
  else if(rules.promotion)result.push('1º–'+rules.promotion+'º: acesso');
  if(rules.promotionPlayoff)result.push(rules.promotionPlayoff[0]+'º–'+rules.promotionPlayoff[1]+'º: playoff de acesso');
  if(rules.continental)Object.entries(rules.continental).forEach(([id,range])=>result.push(range[0]+'º–'+range[1]+'º: '+id.replaceAll('-',' ')));
  if(rules.relegation)result.push('Últimos '+rules.relegation+': rebaixamento');
  if(rules.verification)result.push('Regra: '+rules.verification.replaceAll('-',' '));
  return result;
}

function renderCalendar() {
  const c=session.career;
  const cards=c.fixtures.map(f=>'<article class="fixture-card '+(f===nextFixture()?'is-next':'')+' '+(f.locked?'locked':'')+'"><div class="fixture-date"><strong>'+new Date(f.date).getDate()+'</strong>'+new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(new Date(f.date))+'</div><img src="./'+escapeHtml(f.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><div class="fixture-teams"><span class="competition-pill">'+escapeHtml(f.competitionName)+'</span><strong>'+escapeHtml(f.opponent.name)+'</strong><small>'+(f.stage?escapeHtml(f.stage)+' · ':'')+(f.home?'Casa':'Fora')+'</small></div><div class="fixture-score">'+(f.played?f.score.home+'–'+f.score.away:f.locked?'A definir':'—')+'</div></article>').join('');
  return sectionHead('Calendário mundial','Compromissos nacionais e continentais coexistem na temporada.')+'<div class="calendar-summary"><span><strong>'+c.fixtures.filter(f=>!f.played).length+'</strong> jogos restantes</span><span><strong>'+new Set(c.fixtures.map(f=>f.competitionId)).size+'</strong> competições</span><span><strong>'+c.fixtures.filter(f=>f.played).length+'</strong> concluídos</span></div><div class="cards-list world-calendar">'+cards+'</div>';
}

function renderMatchCenter() {
  const next=nextFixture();
  return sectionHead('Centro de partida','Prepare escalação, formação e estratégia antes do apito inicial.')+(next?'<div class="match-prep"><article class="panel match-poster" style="background-image:linear-gradient(rgba(5,12,22,.82),rgba(5,12,22,.94)),url(\'./'+escapeHtml(next.opponent.stadium||'assets/placeholders/stadium-generic.jpg')+'\')"><span class="competition-pill">'+escapeHtml(next.competitionName)+'</span><div class="versus-row large"><div><img src="./'+escapeHtml(session.career.club.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(session.career.club.name)+'</strong></div><b>VS</b><div><img src="./'+escapeHtml(next.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(next.opponent.name)+'</strong></div></div><p>'+formatDate(next.date)+' · '+(next.home?'Em casa':'Fora de casa')+'</p><button class="btn btn-primary" data-action="start-match">Entrar em campo</button></article><article class="panel"><h2>Plano de jogo</h2><p><strong>'+session.career.tactics.formation+'</strong> · '+escapeHtml(session.career.tactics.mentality)+'</p><p>Pressão '+session.career.tactics.pressure+' · Ritmo '+session.career.tactics.tempo+'</p><p>'+session.career.lineupIds.length+' titulares confirmados.</p><button class="btn" data-action="navigate" data-screen="tactics">Ajustar tática</button></article></div>':'<div class="panel empty-state"><strong>Temporada concluída</strong><span>Consulte o resumo e avance para a próxima época.</span></div>');
}

function renderTraining() {
  const c=session.career, trained=c.lastTrainingWeek===c.week;
  const plans=[['recovery','Recuperação','Físico +8 · Moral +2'],['tactical','Tático','Entrosamento e organização'],['intensity','Alta intensidade','GER temporário · Físico -8'],['finishing','Finalização','Ataque e confiança'],['setpieces','Bola parada','Chance extra em jogos equilibrados']];
  return sectionHead('Centro de treinamento','Defina o microciclo e desenvolva atletas com o nível das instalações.','<span class="tag">Físico '+c.fitness+'%</span>')+'<div class="facility-summary"><span>Centro de treino <strong>Nível '+c.facilities.training+'</strong></span><span>Base <strong>Nível '+c.facilities.youth+'</strong></span><span>Medicina <strong>Nível '+c.facilities.medical+'</strong></span></div><div class="training-grid">'+plans.map(([id,name,effect])=>'<button class="training-card" data-action="apply-training" data-plan="'+id+'" '+(trained?'disabled':'')+'><span>◎</span><strong>'+name+'</strong><small>'+effect+'</small></button>').join('')+'</div>'+(trained?'<div class="notice success">O treino desta semana já foi aplicado.</div>':'');
}

async function loadMarket() {
  if(session.market.length||session.marketLoading)return;
  session.marketLoading=true; if(session.screen==='market')renderGame(renderMarket());
  const candidates=session.catalog.clubs.filter(club=>club.rosterPath&&club.id!==session.career.club.id).sort(()=>Math.random()-.5).slice(0,10);
  const rosters=await Promise.all(candidates.map(async club=>{try{const data=await fetchJson(club.rosterPath);return (data.players||[]).map(normalizePlayer).filter(p=>p.overall>=72).slice(0,3).map(p=>({...p,sourceClub:club.name}));}catch{return[];}}));
  const owned=new Set(session.career.roster.map(p=>p.id));
  session.market=rosters.flat().filter(p=>!owned.has(p.id)).sort((a,b)=>b.overall-a.overall).slice(0,24);
  session.marketLoading=false;if(session.screen==='market')renderGame(renderMarket());
}

function renderMarket() {
  const cards=session.market.map(p=>'<article class="market-card"><div class="market-player"><img src="'+escapeHtml(playerPhoto(p))+'" alt="" onerror="__vfmFallback(event,\'player\')"><div><strong>'+escapeHtml(p.name)+'</strong><small>'+escapeHtml(p.pos)+' · '+p.age+' anos · '+escapeHtml(p.sourceClub||'')+'</small></div></div><div class="market-value"><span>GER <strong>'+p.overall+'</strong></span><span>'+money(p.value*1000000)+'</span></div><button class="btn btn-primary btn-small" data-action="buy-player" data-player="'+escapeHtml(p.id)+'">Fazer proposta</button></article>').join('');
  return sectionHead('Mercado internacional','Atletas nominais da base 2026, filtrados por desempenho e valor.','<span class="tag">'+money(session.career.budget)+'</span>')+'<div class="market-grid">'+(session.marketLoading?'<div class="panel">Carregando rede mundial…</div>':cards||'<div class="panel">Nenhuma oportunidade disponível.</div>')+'</div>';
}

function renderClub() {
  const c=session.career,payroll=c.roster.reduce((sum,p)=>sum+p.salary*1000,0),value=c.roster.reduce((sum,p)=>sum+p.value*1000000,0);
  const ledger=c.ledger.slice().reverse().map(item=>'<tr><td>'+formatDate(item.date)+'</td><td>'+escapeHtml(item.label)+'</td><td class="'+(item.amount>=0?'positive':'negative')+'">'+(item.amount>=0?'+':'')+money(item.amount)+'</td></tr>').join('');
  const facilityNames={training:'Centro de treinamento',youth:'Academia de base',medical:'Departamento médico',scouting:'Rede de observação'};
  const offers=c.jobOffers.length?'<article class="panel job-offers"><h2>Propostas de trabalho</h2><p class="muted">Ofertas liberadas pela reputação conquistada na última temporada.</p>'+c.jobOffers.map(club=>'<div class="staff-row"><span><strong>'+escapeHtml(club.name)+'</strong><small>'+escapeHtml(club.leagueName)+' · GER VFM '+club.rating+'</small></span><img class="job-club-badge" src="./'+escapeHtml(club.badge)+'" alt="" onerror="__vfmFallback(event)"><button class="btn btn-small btn-primary" data-action="accept-club-job" data-club="'+escapeHtml(club.id)+'">Aceitar</button></div>').join('')+'</article>':'';
  return sectionHead('Gestão do clube','Finanças, diretoria, instalações e comissão técnica.')+'<div class="world-metric-grid club-metrics"><div><span>Saldo</span><strong>'+money(c.budget)+'</strong></div><div><span>Folha mensal</span><strong>'+money(payroll)+'</strong></div><div><span>Valor do elenco</span><strong>'+money(value)+'</strong></div><div><span>Diretoria</span><strong>'+c.board+'%</strong></div></div><div class="club-admin-grid"><article class="panel"><h2>Comissão técnica</h2>'+Object.entries(c.staff).map(([id,rating])=>'<div class="staff-row"><span>'+({assistant:'Auxiliar',fitnessCoach:'Preparador físico',scout:'Chefe de scout',medical:'Departamento médico'})[id]+'</span><strong>'+rating+'</strong><button class="btn btn-small" data-action="upgrade-staff" data-staff="'+id+'">Melhorar</button></div>').join('')+'</article><article class="panel"><h2>Instalações</h2>'+Object.entries(c.facilities).map(([id,level])=>'<div class="staff-row"><span>'+facilityNames[id]+'</span><strong>Nível '+level+'/5</strong><button class="btn btn-small" data-action="upgrade-facility" data-facility="'+id+'" '+(level>=5?'disabled':'')+'>Evoluir</button></div>').join('')+'</article><article class="panel"><h2>Carreira do treinador</h2><p><strong>Nível '+c.manager.level+'</strong> · '+escapeHtml(c.manager.license)+'</p><p>'+c.manager.xp+' XP · '+c.manager.awards.length+' prêmio(s)</p><ul class="objective-list">'+c.manager.awards.slice(-4).map(a=>'<li>'+escapeHtml(a)+'</li>').join('')+'</ul></article><article class="panel"><h2>Objetivos da diretoria</h2><ul class="objective-list"><li>Metade superior da '+escapeHtml(c.club.leagueName)+'</li><li>Quartas de final da copa nacional</li><li>Manter folha salarial sustentável</li><li>Desenvolver a reputação do treinador</li></ul></article>'+offers+'</div><div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Movimentação</th><th>Valor</th></tr></thead><tbody>'+ledger+'</tbody></table></div>';
}

function renderInbox() {
  const c=session.career;
  return sectionHead('E-mail','Diretoria, imprensa, empresários, competições e seleções nacionais.','<span class="tag">'+c.messages.filter(m=>!m.read).length+' novas</span>')+'<div class="mail-layout"><div class="mail-list">'+c.messages.slice().reverse().map(m=>'<button class="mail-item '+(!m.read?'unread':'')+'" data-action="open-mail" data-mail="'+escapeHtml(m.id)+'"><span>'+escapeHtml(m.from)+'</span><strong>'+escapeHtml(m.subject)+'</strong><small>'+formatDate(m.date)+'</small></button>').join('')+'</div><article class="panel mail-preview"><h2>Central de comunicações</h2><p>Selecione uma mensagem. Propostas de emprego, cobranças da diretoria e negociações chegam aqui.</p></article></div>';
}

function nationalCompetitionLabel(team) {
  if(team.confederation==='CONMEBOL')return 'Eliminatórias Sul-Americanas · Copa América · Copa do Mundo';
  if(team.confederation==='UEFA')return 'Eliminatórias Europeias · Euro · Copa do Mundo';
  return 'Eliminatórias continentais · Copa continental · Copa do Mundo';
}

function buildNationalFixtures(team) {
  const pool=session.catalog.nationalTeams.filter(item=>item.id!==team.id);
  const regional=pool.filter(item=>item.confederation===team.confederation);
  const seeded=regional.slice().sort((a,b)=>b.rating-a.rating);
  const groupSize=team.confederation==='CONMEBOL'?seeded.length:Math.min(5,seeded.length);
  const opponents=seeded.slice(0,groupSize);
  const start=new Date(2026,2,20,20);
  const qualifierOpponents=[...opponents,...opponents.map(opponent=>opponent)];
  const qualifiers=qualifierOpponents.map((opponent,index)=>({id:'national-q-'+(index+1),competitionId:'world-cup-qualifiers',competitionName:'Eliminatórias da Copa',type:'national',round:index+1,date:addDays(start,index*28),opponent,home:index<opponents.length,played:false,score:null}));
  const cupOpp=seeded.filter(item=>item.id!==team.id).slice(0,3);
  const cupNames={CONMEBOL:'Copa América',UEFA:'Euro',CONCACAF:'Copa Ouro',AFC:'Copa da Ásia',CAF:'Copa Africana de Nações',OFC:'Copa das Nações da OFC'};
  const cup=cupOpp.map((opponent,index)=>({id:'national-cup-'+(index+1),competitionId:'continental-national-cup',competitionName:cupNames[team.confederation]||'Copa continental',type:'national',stage:'Fase de grupos',round:index+1,date:addDays(start,qualifiers.length*28+35+index*6),opponent,home:index%2===0,played:false,locked:true,score:null}));
  const worldOpp=pool.filter(item=>item.confederation!==team.confederation).sort((a,b)=>b.rating-a.rating).slice(0,3);
  const world=worldOpp.map((opponent,index)=>({id:'national-world-'+(index+1),competitionId:'world-cup',competitionName:'Copa do Mundo',type:'national',stage:'Fase de grupos',round:index+1,date:addDays(start,qualifiers.length*28+180+index*5),opponent,home:index%2===0,played:false,locked:true,score:null}));
  return [...qualifiers,...cup,...world];
}

async function acceptNationalJob(teamId) {
  const team=session.catalog.nationalTeams.find(item=>item.id===teamId);
  if(!team?.rosterPath){toast('Esta seleção participa da simulação, mas ainda não tem convocação nominal oficial disponível.','error');return;}
  if(session.career.manager.reputation<team.reputationRequired){toast('Sua reputação ainda não atende a esta seleção.','error');return;}
  try{
    const data=await fetchJson(team.rosterPath),roster=(data.players||[]).map(normalizePlayer);
    session.career.national={team,roster,lineupIds:pickLineup(roster).map(p=>p.id),fixtures:buildNationalFixtures(team),stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0},qualified:false,competitionLabel:nationalCompetitionLabel(team)};
    session.career.messages.push({id:'national-'+Date.now(),from:team.name,subject:'Contrato de seleção assinado',body:'Você agora acumula o comando do clube e da seleção. As Datas FIFA aparecem no centro internacional.',date:new Date().toISOString(),read:false,priority:'high'});
    persist();renderGame(renderNational());toast('Você assumiu '+team.name+'.','success');
  }catch{toast('Não foi possível carregar a convocação.','error');}
}

function renderNational() {
  const c=session.career,n=c.national;
  if(!n){
    const filters=[['official','48 listas oficiais da Copa'],['all','Todas as 211'],['CONMEBOL','CONMEBOL'],['UEFA','UEFA'],['CONCACAF','CONCACAF'],['AFC','AFC'],['CAF','CAF'],['OFC','OFC']];
    const shown=session.catalog.nationalTeams.filter(team=>(session.nationalFilter==='official'?team.officialSquad:session.nationalFilter==='all'||team.confederation===session.nationalFilter)&&(!session.nationalSearch||team.name.toLowerCase().includes(session.nationalSearch.toLowerCase())));
    const offers=shown.map(team=>{const sourced=Boolean(team.rosterPath),available=sourced&&c.manager.reputation>=team.reputationRequired,label=!sourced?'Simulação':available?'Assumir':'Bloqueada';return '<article class="national-offer '+(available?'available':'locked')+'"><img src="./'+escapeHtml(team.badge)+'" alt="" onerror="__vfmFallback(event)"><div><strong>'+escapeHtml(team.name)+'</strong><small>'+escapeHtml(team.confederation)+' · GER VFM '+team.rating+'</small><span>'+(sourced?'Reputação exigida: '+team.reputationRequired:'Participa das eliminatórias pela IA')+'</span></div><button class="btn btn-small '+(available?'btn-primary':'')+'" data-action="accept-national" data-team="'+team.id+'" '+(available?'':'disabled')+'>'+label+'</button></article>';}).join('');
    return sectionHead('Seleções nacionais','211 associações em seis confederações, com eliminatórias e carreira dupla.','<span class="tag">Sua reputação: '+c.manager.reputation+'</span>')+'<div class="notice">Todas participam da simulação; '+session.catalog.stats.commandableNationalTeams+' possuem lista nominal comandável. As 48 listas oficiais da Copa são preservadas e os demais pools usam profissionais atuais da base CC0. GER é índice próprio do VFM.</div><div class="toolbar"><select data-action="national-filter" aria-label="Filtrar seleções">'+filters.map(([id,label])=>'<option value="'+id+'" '+(session.nationalFilter===id?'selected':'')+'>'+label+'</option>').join('')+'</select><input data-action="national-search" aria-label="Buscar seleção" placeholder="Buscar seleção" value="'+escapeHtml(session.nationalSearch)+'"><span class="tag">'+shown.length+' seleções</span></div><div class="national-grid">'+offers+'</div>';
  }
  const next=n.fixtures.find(f=>!f.played&&!f.locked),played=n.fixtures.filter(f=>f.played).length;
  const roster=n.roster.slice().sort((a,b)=>b.overall-a.overall).slice(0,26).map(p=>'<tr><td>'+escapeHtml(p.name)+'</td><td>'+p.pos+'</td><td><strong>'+p.overall+'</strong></td><td>'+escapeHtml(p.clubName||'—')+'</td><td>'+(n.lineupIds.includes(p.id)?'Titular':'Convocado')+'</td></tr>').join('');
  return sectionHead(n.team.name,'Carreira internacional paralela ao clube.','<span class="tag">'+escapeHtml(n.team.confederation)+'</span>')+'<div class="national-hero panel"><img src="./'+escapeHtml(n.team.badge)+'" alt="" onerror="__vfmFallback(event)"><div><h2>'+escapeHtml(n.competitionLabel)+'</h2><p>'+played+' jogos disputados · '+n.stats.points+' pontos nas eliminatórias</p>'+(next?'<p>Próximo: <strong>'+escapeHtml(next.opponent.name)+'</strong> · '+formatDate(next.date)+'</p><button class="btn btn-primary" data-action="start-national-match">Jogar pela seleção</button>':'<p>Calendário internacional concluído.</p>')+'</div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Convocado</th><th>Pos.</th><th>GER</th><th>Clube</th><th>Status</th></tr></thead><tbody>'+roster+'</tbody></table></div>';
}

function renderSettings() {
  return sectionHead('Ajustes e carreira','Preferências, proteção do save e retorno ao menu.')+'<div class="settings-grid"><article class="panel"><h2>Preferências</h2><label class="switch-row"><span>Reduzir animações</span><input type="checkbox" data-action="reduced-motion" '+(store.settings.reducedMotion?'checked':'')+'></label><p class="muted">A orientação horizontal é preservada automaticamente em celulares.</p></article><article class="panel"><h2>Carreira</h2><button class="btn" data-action="save">Salvar agora</button><button class="btn" data-action="export-save">Exportar save</button><button class="btn btn-danger" data-action="exit-career">Salvar e sair</button></article></div>';
}

function navigate(screen,push=true) {
  if(!session.career){renderCover();return;}
  if(screen!=='match')stopMatchTimer();
  session.screen=screen;
  if(push)history.pushState({screen},'', '#/'+screen);
  const renderers={dashboard:renderDashboard,squad:renderSquad,tactics:renderTactics,competitions:renderCompetitions,calendar:renderCalendar,'match-center':renderMatchCenter,training:renderTraining,market:renderMarket,club:renderClub,inbox:renderInbox,national:renderNational,settings:renderSettings};
  renderGame((renderers[screen]||renderDashboard)());
  if(screen==='market')loadMarket();
}

function lineupFor(roster,ids) { return ids.map(id=>roster.find(p=>p.id===id)).filter(Boolean).slice(0,11); }

async function startMatch(source='club') {
  const c=session.career;
  const national=source==='national' ? c.national : null;
  const fixture=national ? national.fixtures.find(f=>!f.played&&!f.locked) : nextFixture();
  if(!fixture){toast('Não há partida disponível.','error');return;}
  let opponentRoster=[];
  if(fixture.opponent.rosterPath){try{opponentRoster=(await fetchJson(fixture.opponent.rosterPath)).players.map(normalizePlayer);}catch{}}
  const ownRoster=national?national.roster:c.roster, ownIds=national?national.lineupIds:c.lineupIds;
  session.match={source,fixture,minute:0,homeGoals:0,awayGoals:0,possessionHome:50,shotsHome:0,shotsAway:0,speed:1,running:false,finished:false,events:[{minute:0,text:'As equipes estão posicionadas. O árbitro autoriza o início.'}],ownLineup:lineupFor(ownRoster,ownIds),opponentLineup:opponentRoster.length?pickLineup(opponentRoster):[],ball:{x:50,y:50},attacking:'home'};
  session.screen='match';history.pushState({screen:'match'},'','#/match');renderMatch();
}

function teamOnHome() { return session.match.fixture.home; }

function matchTeams() {
  const m=session.match,c=session.career;
  const own=m.source==='national'?c.national.team:c.club;
  return m.fixture.home?{home:own,away:m.fixture.opponent}:{home:m.fixture.opponent,away:own};
}

function pitchPlayers() {
  const m=session.match,c=session.career,coords=FORMATIONS[c.tactics.formation]||FORMATIONS['4-3-3'];
  const ownHome=teamOnHome();
  const own=m.ownLineup;
  const opponent=m.opponentLineup;
  const side=(players,isHome,isOwn)=>coords.map(([x,y],index)=>{
    const px=isHome?x:100-x, py=isHome?y:100-y, player=players[index];
    const label=player?.name ? player.name.split(' ').slice(-1)[0] : '#'+(index+1);
    return '<div class="pitch-player '+(isHome?'home':'away')+' '+(isOwn?'managed':'')+'" style="left:'+px+'%;top:'+py+'%"><span>'+(index+1)+'</span><small>'+escapeHtml(label)+'</small></div>';
  }).join('');
  return side(own,ownHome,true)+side(opponent,!ownHome,false);
}

function renderMatch() {
  const m=session.match,teams=matchTeams();
  const commentary=m.events.slice().reverse().slice(0,9).map(e=>'<li><strong>'+e.minute+'’</strong><span>'+escapeHtml(e.text)+'</span></li>').join('');
  app.innerHTML='<main class="screen match-screen world-match"><header class="match-scoreboard"><div><img src="./'+escapeHtml(teams.home.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(teams.home.name)+'</strong></div><span class="score">'+m.homeGoals+' · '+m.awayGoals+'</span><span class="clock">'+m.minute+'’</span><div><strong>'+escapeHtml(teams.away.name)+'</strong><img src="./'+escapeHtml(teams.away.badge)+'" alt="" onerror="__vfmFallback(event)"></div></header><section class="match-world-layout"><aside class="match-side"><h2>Narração</h2><ul class="commentary-list">'+commentary+'</ul></aside><div class="visual-pitch" aria-label="Campo com vinte e dois jogadores"><div class="pitch-markings"></div>'+pitchPlayers()+'<div class="match-ball" style="left:'+m.ball.x+'%;top:'+m.ball.y+'%"></div></div><aside class="match-side"><h2>Estatísticas</h2><div class="stat-row"><strong>'+m.possessionHome+'%</strong><span>Posse</span><strong>'+(100-m.possessionHome)+'%</strong></div><div class="stat-row"><strong>'+m.shotsHome+'</strong><span>Finalizações</span><strong>'+m.shotsAway+'</strong></div><div class="tactic-live"><span>Formação</span><strong>'+escapeHtml(session.career.tactics.formation)+'</strong><span>Mentalidade</span><strong>'+escapeHtml(session.career.tactics.mentality)+'</strong></div></aside></section><footer class="match-controls"><button class="btn" data-action="exit-match">Sair</button>'+(m.finished?'<button class="btn btn-primary" data-action="finish-match">Continuar temporada</button>':'<button class="btn btn-primary" data-action="toggle-match">'+(m.running?'Pausar':'Começar')+'</button><button class="btn '+(m.speed===1?'active':'')+'" data-action="match-speed" data-speed="1">1×</button><button class="btn '+(m.speed===3?'active':'')+'" data-action="match-speed" data-speed="3">3×</button><button class="btn '+(m.speed===6?'active':'')+'" data-action="match-speed" data-speed="6">6×</button>')+'</footer></main>';
}

function startMatchTimer() {
  stopMatchTimer();
  if(!session.match||session.match.finished)return;
  session.match.running=true;
  session.matchTimer=setInterval(tickMatch,700);
}

function stopMatchTimer() { if(session.matchTimer){clearInterval(session.matchTimer);session.matchTimer=null;} if(session.match)session.match.running=false; }

function tickMatch() {
  const m=session.match;if(!m||!m.running||m.finished)return;
  m.minute=Math.min(90,m.minute+m.speed);
  const t=session.career.tactics;
  const tacticBias=(t.mentality==='Ofensiva'?5:t.mentality==='Defensiva'?-3:0)+(t.passing==='Curto'?2:t.passing==='Direto'?-1:0)+(t.width-55)/15;
  const bias=tacticBias+(teamOnHome()?3:-3);
  m.possessionHome=clamp(Math.round(50+(teamOnHome()?bias:-bias)+Math.sin(m.minute/8)*5),34,66);
  const homeAttack=Math.random()<(m.possessionHome/100);
  m.attacking=homeAttack?'home':'away';
  const coords=FORMATIONS[session.career.tactics.formation]||FORMATIONS['4-3-3'];
  const idx=Math.floor(Math.random()*coords.length),point=coords[idx];
  m.ball={x:homeAttack?point[0]:100-point[0],y:homeAttack?point[1]:100-point[1]};
  if(m.minute>0&&(m.minute%6<=m.speed-1||Math.random()<.09)){
    if(homeAttack)m.shotsHome++;else m.shotsAway++;
    const teams=matchTeams(),team=homeAttack?teams.home:teams.away;
    const creation=(t.tempo-55)/500+(t.transition==='Contra-atacar'?.018:t.transition==='Reagrupar'?-.012:0)+(t.pressure-55)/800;
    const defensiveRisk=(t.defensiveLine-52)/900+(t.marking==='Individual'?.008:t.marking==='Híbrida'?.004:0);
    const managedAttack=homeAttack===teamOnHome();
    const goal=Math.random()<clamp(.17+(managedAttack?creation:defensiveRisk),.08,.28);
    if(goal){if(homeAttack)m.homeGoals++;else m.awayGoals++;m.events.push({minute:m.minute,text:'GOL! '+team.name+' conclui a jogada trabalhada dentro da área.'});}
    else m.events.push({minute:m.minute,text:team.name+': finalização após movimentação entre as linhas.'});
  } else if(m.minute%9<=m.speed-1) m.events.push({minute:m.minute,text:'As equipes ajustam as linhas e disputam espaço no meio-campo.'});
  if(m.minute>=90){m.finished=true;m.running=false;clearInterval(session.matchTimer);session.matchTimer=null;m.events.push({minute:90,text:'Fim de jogo.'});}
  renderMatch();
}

function updateTableForMatch(fixture,ownGoals,oppGoals) {
  if(fixture.type!=='league')return;
  const c=session.career, own=c.table.find(r=>r.team.id===c.club.id), opp=c.table.find(r=>r.team.id===fixture.opponent.id);
  const apply=(row,gf,ga)=>{if(!row)return;row.played++;row.gf+=gf;row.ga+=ga;row.gd=row.gf-row.ga;if(gf>ga){row.wins++;row.points+=3;}else if(gf===ga){row.draws++;row.points++;}else row.losses++;};
  apply(own,ownGoals,oppGoals);apply(opp,oppGoals,ownGoals);
  const idle=c.table.filter(r=>r.team.id!==c.club.id&&r.team.id!==fixture.opponent.id).sort(()=>Math.random()-.5);
  for(let i=0;i+1<idle.length;i+=2){const a=idle[i],b=idle[i+1],ag=Math.max(0,Math.round((a.team.rating-b.team.rating)/12+Math.random()*2)),bg=Math.max(0,Math.round((b.team.rating-a.team.rating)/12+Math.random()*2));apply(a,ag,bg);apply(b,bg,ag);}
}

function finishMatch() {
  const m=session.match,c=session.career,fixture=m.fixture;
  const ownGoals=teamOnHome()?m.homeGoals:m.awayGoals,oppGoals=teamOnHome()?m.awayGoals:m.homeGoals;
  fixture.played=true;fixture.score={home:m.homeGoals,away:m.awayGoals};
  const targetStats=m.source==='national'?c.national.stats:c.stats;
  targetStats.played++;targetStats.gf+=ownGoals;targetStats.ga+=oppGoals;
  if(ownGoals>oppGoals){targetStats.wins++;targetStats.points+=3;c.manager.xp+=120;c.manager.reputation=clamp(c.manager.reputation+1,1,100);}
  else if(ownGoals===oppGoals){targetStats.draws++;targetStats.points++;c.manager.xp+=55;}
  else{targetStats.losses++;c.manager.xp+=25;if(m.source==='club')c.board=clamp(c.board-2,0,100);}
  c.manager.level=1+Math.floor(c.manager.xp/500);
  c.manager.license=managerLicense(c.manager.reputation);
  if(m.source==='club'){
    updateTableForMatch(fixture,ownGoals,oppGoals);c.week++;c.date=addDays(fixture.date,1);c.fitness=clamp(c.fitness-5,35,100);c.morale=clamp(c.morale+(ownGoals>oppGoals?4:ownGoals<oppGoals?-3:1),20,100);
    c.roster.forEach(p=>{p.fitness=clamp(p.fitness-4,35,100);p.morale=clamp(p.morale+(ownGoals>oppGoals?3:ownGoals<oppGoals?-2:0),20,100);});
    const revenue=fixture.type==='continental'?2400000:fixture.type==='cup'?1200000:850000;c.budget+=revenue;c.ledger.push({date:new Date().toISOString(),label:'Receita de jogo · '+fixture.competitionName,amount:revenue,type:'income'});
    if(fixture.type==='cup'&&ownGoals>oppGoals){const next=c.fixtures.find(f=>f.type==='cup'&&f.locked);if(next)next.locked=false;}
  } else {
    const n=c.national,playedQualifiers=n.fixtures.filter(f=>f.competitionId==='world-cup-qualifiers'&&f.played).length;
    const totalQualifiers=n.fixtures.filter(f=>f.competitionId==='world-cup-qualifiers').length;
    c.date=addDays(fixture.date,1);
    if(playedQualifiers>=totalQualifiers){
      const pointsPerMatch={CONMEBOL:1.25,UEFA:1.55,CONCACAF:1.4,AFC:1.4,CAF:1.45,OFC:1.35}[n.team.confederation]||1.45;
      n.qualified=n.stats.points>=Math.ceil(totalQualifiers*pointsPerMatch);
      n.fixtures.filter(f=>f.competitionId==='continental-national-cup').forEach(f=>f.locked=false);
      if(n.qualified)n.fixtures.filter(f=>f.competitionId==='world-cup').forEach(f=>f.locked=false);
      c.messages.push({id:'qualification-'+Date.now(),from:'FIFA',subject:n.qualified?'Classificação para a Copa do Mundo':'Fim das Eliminatórias',body:n.qualified?'A seleção garantiu vaga na Copa do Mundo de 2026.':'A campanha terminou abaixo da linha de classificação para a Copa do Mundo.',date:new Date().toISOString(),read:false,priority:'high'});
    }
  }
  persist();session.match=null;navigate(m.source==='national'?'national':'dashboard');toast('Resultado registrado. Reputação e temporada atualizadas.','success');
}

function competitionForRank(rules,rank) {
  for(const [id,range] of Object.entries(rules.continental||{}))if(rank>=Number(range[0])&&rank<=Number(range[1]))return id;
  return null;
}

function resolvePromotion(rules,rank,table,club) {
  const direct=Number(rules.promotionDirect||rules.promotion||0);
  if(rank<=direct)return true;
  const playoff=rules.promotionPlayoff;
  if(!playoff||rank<playoff[0]||rank>playoff[1])return false;
  const playoffTeams=table.slice(playoff[0]-1,playoff[1]);
  const average=playoffTeams.reduce((sum,row)=>sum+row.team.rating,0)/Math.max(1,playoffTeams.length);
  return club.rating+(playoff[1]-rank)*1.5>=average;
}

function linkedLeagueFor(league,status) {
  const targetId=status==='promoted'?league.rules?.promotesTo:league.rules?.relegatesTo;
  return targetId?findLeague(targetId):null;
}

function advanceSeason() {
  const c=session.career,league=findLeague(c.club.leagueId),leagueGames=c.fixtures.filter(f=>f.type==='league');
  if(!leagueGames.length||!leagueGames.every(f=>f.played)){toast('Conclua os jogos da liga antes de encerrar a temporada.','error');return;}
  const table=sortedTable(),rank=table.findIndex(row=>row.team.id===c.club.id)+1,rules=league.rules||{};
  const relegated=Boolean(rules.relegation&&rank>table.length-rules.relegation);
  const promoted=league.division>1&&resolvePromotion(rules,rank,table,c.club);
  const champion=rank===1;
  const continentalId=competitionForRank(rules,rank);
  const continentalGames=c.fixtures.filter(f=>f.type==='continental'&&f.played);
  const continentalWins=continentalGames.filter(f=>resultClass(f)==='win').length;
  const continentalChampion=continentalGames.length>=6&&continentalWins/continentalGames.length>=.75;
  const cupGames=c.fixtures.filter(f=>f.type==='cup'&&f.played),cupChampion=cupGames.length>=5&&resultClass(cupGames[cupGames.length-1])==='win';
  const summary={season:c.season,league:league.name,rank,points:table[rank-1]?.points||0,champion,promoted,relegated,continentalQualification:continentalId,cupChampion,continentalChampion};
  c.seasonHistory.push(summary);c.seasonSummary=summary;
  const prize=Math.max(1000000,Math.round((table.length-rank+1)*750000+(champion?12000000:0)+(cupChampion?7000000:0)+(continentalChampion?18000000:0)));
  c.budget+=prize;c.ledger.push({date:new Date().toISOString(),label:'Premiação da temporada '+c.season,amount:prize,type:'income'});
  if(champion)c.manager.awards.push('Campeão de '+league.name+' '+c.season);
  if(cupChampion)c.manager.awards.push('Campeão da copa nacional '+c.season);
  if(continentalChampion)c.manager.awards.push('Campeão continental '+c.season);
  c.manager.xp+=champion?1500:Math.max(250,(table.length-rank+1)*55);
  c.manager.reputation=clamp(c.manager.reputation+(champion?5:rank<=Math.ceil(table.length/4)?2:relegated?-5:0),1,100);
  c.manager.level=1+Math.floor(c.manager.xp/500);c.manager.license=managerLicense(c.manager.reputation);
  const status=promoted?'promoted':relegated?'relegated':'stayed',linked=linkedLeagueFor(league,status);
  if(linked){c.club.leagueId=linked.id;c.club.leagueName=linked.name;c.club.division=linked.division;}
  c.season+=1;c.week=1;c.stats={played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0};c.lastTrainingWeek=0;
  const newLeague=findLeague(c.club.leagueId),participants=selectLeagueParticipants(c.club);
  const startDate=c.club.continent==='europe'?new Date(c.season,7,8,15):c.club.countryId==='brazil'?new Date(c.season,3,11,16):new Date(c.season,1,7,16);
  let fixtures=[...buildLeagueFixtures(c.club,participants,startDate),...buildCupFixtures(c.club,participants,startDate)];
  if(continentalId)fixtures.push(...buildContinentalFixtures(c.club,startDate,participants,continentalId));
  if(continentalChampion)fixtures.push(...buildWorldFixtures(c.club,startDate));
  c.participants=participants;c.table=initialTable(participants);c.fixtures=fixtures.sort((a,b)=>new Date(a.date)-new Date(b.date));c.date=startDate.toISOString();
  c.jobOffers=session.catalog.clubs.filter(club=>club.rosterPath&&club.id!==c.club.id&&club.rating<=Math.round(c.manager.reputation*1.08)).sort((a,b)=>b.rating-a.rating).slice(0,5);
  c.messages.push({id:'season-'+Date.now(),from:'Diretoria e federação',subject:'Temporada '+c.season+' iniciada',body:'Posição anterior: '+rank+'º. '+(linked?'O clube agora disputará '+newLeague.name+'. ':'')+(continentalId?'Vaga continental confirmada: '+continentalId+'. ':'')+'Premiação: '+money(prize)+'.',date:new Date().toISOString(),read:false,priority:'high'});
  persist();navigate('dashboard');toast('Nova temporada criada com acesso, rebaixamento e vagas aplicados.','success');
}

function applyTraining(plan) {
  const c=session.career;if(c.lastTrainingWeek===c.week)return;
  const effects={recovery:[8,2],tactical:[2,3],intensity:[-8,4],finishing:[-3,4],setpieces:[-2,3]},[fitness,morale]=effects[plan]||[0,0];
  const developmentChance=.015+c.facilities.training*.008;
  c.fitness=clamp(c.fitness+fitness+c.facilities.medical,20,100);c.morale=clamp(c.morale+morale,20,100);c.roster.forEach(p=>{p.fitness=clamp(p.fitness+fitness+c.facilities.medical,20,100);p.morale=clamp(p.morale+morale,20,100);if(p.age<=24&&p.overall<p.potential&&Math.random()<developmentChance)p.overall++;});c.lastTrainingWeek=c.week;persist();renderGame(renderTraining());toast('Microciclo aplicado; instalações influenciaram recuperação e evolução.','success');
}

function upgradeFacility(id) {
  const c=session.career,level=c.facilities[id]||1,cost=level*6500000;
  if(level>=5)return toast('Esta instalação já está no nível máximo.','error');
  if(c.budget<cost)return toast('Saldo insuficiente para a obra.','error');
  c.budget-=cost;c.facilities[id]=level+1;c.ledger.push({date:new Date().toISOString(),label:'Melhoria de instalação · '+id,amount:-cost,type:'expense'});persist();renderGame(renderClub());toast('Instalação elevada ao nível '+(level+1)+'.','success');
}

async function acceptClubJob(clubId) {
  const c=session.career,club=c.jobOffers.find(item=>item.id===clubId);
  if(!club?.rosterPath)return toast('Esta proposta não possui elenco comandável.','error');
  try{
    const data=await fetchJson(club.rosterPath),roster=(data.players||[]).map(normalizePlayer);
    if(roster.length<11)throw new Error('Elenco insuficiente');
    const previous=c.club.name,participants=selectLeagueParticipants(club);
    const startDate=club.continent==='europe'?new Date(c.season,7,8,15):club.countryId==='brazil'?new Date(c.season,3,11,16):new Date(c.season,1,7,16);
    c.club={...club};c.roster=roster;c.lineupIds=pickLineup(roster).map(p=>p.id);c.participants=participants;c.table=initialTable(participants);
    c.fixtures=[...buildLeagueFixtures(club,participants,startDate),...buildCupFixtures(club,participants,startDate),...buildContinentalFixtures(club,startDate,participants)].sort((a,b)=>new Date(a.date)-new Date(b.date));
    c.date=startDate.toISOString();c.week=1;c.stats={played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0};c.budget=Math.max(c.budget,Math.round((35+(club.rating-65)*3.2)*1000000));c.jobOffers=[];
    c.messages.push({id:'club-job-'+Date.now(),from:'Diretoria de '+club.name,subject:'Novo contrato assinado',body:'Você deixou '+previous+' e assumiu '+club.name+'. O calendário da nova temporada foi carregado.',date:new Date().toISOString(),read:false,priority:'high'});
    persist();navigate('dashboard');toast('Novo desafio iniciado no '+club.name+'.','success');
  }catch{toast('Não foi possível carregar o elenco do novo clube.','error');}
}

function buyPlayer(id) {
  const p=session.market.find(item=>item.id===id);if(!p)return;const fee=Math.round(p.value*1050000),salary=Math.max(25000,p.salary*1000),agentFee=Math.round(fee*.05),total=fee+agentFee;
  if(session.career.roster.length>=session.career.transferPolicy.maxSquad){toast('O elenco atingiu o limite de registro.','error');return;}
  showModal('Negociação por '+p.name,'<div class="transfer-negotiation"><p><strong>'+escapeHtml(p.sourceClub||'Clube vendedor')+'</strong> aceita analisar a proposta.</p><div class="world-metric-grid"><div><span>Transferência</span><strong>'+money(fee)+'</strong></div><div><span>Comissão</span><strong>'+money(agentFee)+'</strong></div><div><span>Salário mensal</span><strong>'+money(salary)+'</strong></div><div><span>Contrato</span><strong>4 anos</strong></div></div><p class="muted">Custo inicial: '+money(total)+'. A contratação respeita orçamento e limite de elenco.</p></div>','<button class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-transfer" data-player="'+escapeHtml(id)+'" data-total="'+total+'" data-salary="'+salary+'">Enviar e concluir</button>');
}

function confirmTransfer(target) {
  const id=target.dataset.player,p=session.market.find(item=>item.id===id),total=Number(target.dataset.total),salary=Number(target.dataset.salary);if(!p)return;
  if(session.career.budget<total){closeModal();toast('Orçamento insuficiente para taxa e comissão.','error');return;}
  session.career.budget-=total;session.career.roster.push({...p,salary:Math.round(salary/1000),contractUntil:(session.career.season+4)+'-06-30'});session.career.ledger.push({date:new Date().toISOString(),label:'Transferência e comissão · '+p.name,amount:-total,type:'expense'});session.career.messages.push({id:'transfer-'+Date.now(),from:'Diretor de futebol',subject:'Contratação concluída: '+p.name,body:'Contrato de quatro temporadas registrado. Salário mensal: '+money(salary)+'.',date:new Date().toISOString(),read:false,priority:'normal'});session.market=session.market.filter(item=>item.id!==id);closeModal();persist();renderGame(renderMarket());toast(p.name+' assinou por quatro temporadas.','success');
}

function exportSave() {
  const blob=new Blob([JSON.stringify(session.career,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vale-futebol-manager-save-'+session.slot+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function openMail(id) {
  const mail=session.career.messages.find(m=>m.id===id);if(!mail)return;mail.read=true;persist();showModal(mail.subject,'<p class="mail-from">'+escapeHtml(mail.from)+' · '+formatDate(mail.date)+'</p><p>'+escapeHtml(mail.body)+'</p>');
}

function handleAction(action,target) {
  if(action==='new-career')slotModal('new');
  else if(action==='load-career')slotModal('load');
  else if(action==='world-database')worldDatabaseModal();
  else if(action==='show-help')showModal('Como jogar','<p>Escolha um clube com elenco completo, monte os onze titulares e administre calendário, finanças e mercado. Resultados elevam sua reputação e liberam seleções nacionais. No campo 2D, os 22 jogadores respeitam a formação escolhida.</p>');
  else if(action==='close-modal')closeModal();
  else if(action==='slot-new'){session.slot=Number(target.dataset.slot);session.selectedClub=null;session.clubFilters={continent:'all',country:'all',league:'all',search:''};closeModal();renderClubSelect();}
  else if(action==='slot-load'){session.slot=Number(target.dataset.slot);session.career=migrateCareer(store.slots[session.slot-1]);closeModal();navigate('dashboard');}
  else if(action==='back-cover')renderCover();
  else if(action==='select-world-club'){session.selectedClub=session.catalog.clubs.find(club=>clubKey(club)===target.dataset.key);renderClubSelect();}
  else if(action==='club-next'&&session.selectedClub)renderManagerSetup();
  else if(action==='manager-back')renderClubSelect();
  else if(action==='select-avatar'){session.selectedAvatar=Number(target.dataset.avatar);renderManagerSetup();}
  else if(action==='start-career')createCareer();
  else if(action==='navigate')navigate(target.dataset.screen);
  else if(action==='save')persist(true);
  else if(action==='advance-season')advanceSeason();
  else if(action==='open-next-match'||action==='start-match')startMatch('club');
  else if(action==='start-national-match')startMatch('national');
  else if(action==='toggle-match'){session.match.running?stopMatchTimer():startMatchTimer();renderMatch();}
  else if(action==='match-speed'){session.match.speed=Number(target.dataset.speed);if(!session.match.running)startMatchTimer();renderMatch();}
  else if(action==='finish-match')finishMatch();
  else if(action==='exit-match'){const wasRunning=session.match.running;stopMatchTimer();session.matchWasRunningBeforeGate=wasRunning;showModal('Sair da partida?','<p>O jogo será interrompido sem registrar resultado.</p>','<button class="btn" data-action="resume-match-modal">Continuar partida</button><button class="btn btn-danger" data-action="abandon-match">Abandonar</button>');}
  else if(action==='resume-match-modal'){closeModal();if(session.matchWasRunningBeforeGate)startMatchTimer();renderMatch();}
  else if(action==='abandon-match'){closeModal();session.match=null;navigate('match-center');}
  else if(action==='best-lineup'){session.career.lineupIds=pickLineup(session.career.roster).map(p=>p.id);persist();renderGame(renderSquad());}
  else if(action==='toggle-lineup'){const id=target.dataset.player,ids=session.career.lineupIds,index=ids.indexOf(id);if(index>=0)ids.splice(index,1);else if(ids.length<11)ids.push(id);else return toast('Remova um titular antes de escalar outro.','error');persist();renderGame(renderSquad());}
  else if(action==='apply-training')applyTraining(target.dataset.plan);
  else if(action==='buy-player')buyPlayer(target.dataset.player);
  else if(action==='confirm-transfer')confirmTransfer(target);
  else if(action==='open-mail')openMail(target.dataset.mail);
  else if(action==='accept-national')acceptNationalJob(target.dataset.team);
  else if(action==='accept-club-job')acceptClubJob(target.dataset.club);
  else if(action==='upgrade-staff'){const id=target.dataset.staff,cost=1500000;if(session.career.budget<cost)return toast('Saldo insuficiente.','error');session.career.budget-=cost;session.career.staff[id]=clamp(session.career.staff[id]+2,1,99);session.career.ledger.push({date:new Date().toISOString(),label:'Investimento na comissão técnica',amount:-cost,type:'expense'});persist();renderGame(renderClub());}
  else if(action==='upgrade-facility')upgradeFacility(target.dataset.facility);
  else if(action==='export-save')exportSave();
  else if(action==='exit-career'){persist();renderCover();}
}

app.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(target)handleAction(target.dataset.action,target);});
app.addEventListener('input',event=>{const target=event.target,action=target.dataset.action;
  if(action==='filter-club-search'){session.clubFilters.search=target.value;renderClubSelect();document.querySelector('[data-action="filter-club-search"]')?.focus();}
  else if(action==='squad-search'){session.squadSearch=target.value;renderGame(renderSquad());document.querySelector('[data-action="squad-search"]')?.focus();}
  else if(action==='national-search'){session.nationalSearch=target.value;renderGame(renderNational());document.querySelector('[data-action="national-search"]')?.focus();}
  else if(action==='pressure-range'){session.career.tactics.pressure=Number(target.value);persist();renderGame(renderTactics());}
  else if(action==='tempo-range'){session.career.tactics.tempo=Number(target.value);persist();renderGame(renderTactics());}
  else if(action==='width-range'){session.career.tactics.width=Number(target.value);persist();renderGame(renderTactics());}
  else if(action==='line-range'){session.career.tactics.defensiveLine=Number(target.value);persist();renderGame(renderTactics());}
});
app.addEventListener('change',event=>{const target=event.target,action=target.dataset.action;
  if(action==='filter-continent'){session.clubFilters.continent=target.value;session.clubFilters.country='all';session.clubFilters.league='all';renderClubSelect();}
  else if(action==='filter-country'){session.clubFilters.country=target.value;session.clubFilters.league='all';renderClubSelect();}
  else if(action==='filter-league'){session.clubFilters.league=target.value;renderClubSelect();}
  else if(action==='national-filter'){session.nationalFilter=target.value;renderGame(renderNational());}
  else if(action==='position-filter'){session.positionFilter=target.value;renderGame(renderSquad());}
  else if(action==='formation-select'){session.career.tactics.formation=target.value;persist();renderGame(renderTactics());}
  else if(action==='mentality-select'){session.career.tactics.mentality=target.value;persist();renderGame(renderTactics());}
  else if(action==='passing-select'){session.career.tactics.passing=target.value;persist();renderGame(renderTactics());}
  else if(action==='marking-select'){session.career.tactics.marking=target.value;persist();renderGame(renderTactics());}
  else if(action==='transition-select'){session.career.tactics.transition=target.value;persist();renderGame(renderTactics());}
  else if(action==='reduced-motion'){store.settings.reducedMotion=target.checked;document.documentElement.classList.toggle('reduce-motion',target.checked);persist();}
});
modalRoot.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(target)handleAction(target.dataset.action,target);else if(event.target.classList.contains('modal-backdrop'))closeModal();});

function handleOrientation() {
  const portrait=matchMedia('(orientation: portrait)').matches&&innerWidth<768;
  orientationGate.style.display=portrait?'grid':'none';
  app.toggleAttribute('inert',portrait);
  if(portrait&&session.match?.running){session.matchWasRunningBeforeGate=true;stopMatchTimer();}
  else if(!portrait&&session.screen==='match'&&session.match&&session.matchWasRunningBeforeGate){session.matchWasRunningBeforeGate=false;startMatchTimer();renderMatch();}
}

window.addEventListener('resize',handleOrientation,{passive:true});
window.addEventListener('orientationchange',handleOrientation,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&session.match?.running){session.matchWasRunningBeforeGate=true;stopMatchTimer();}else if(!document.hidden&&session.screen==='match'&&session.matchWasRunningBeforeGate&&!matchMedia('(orientation: portrait)').matches){session.matchWasRunningBeforeGate=false;startMatchTimer();renderMatch();}});
window.addEventListener('popstate',()=>{if(session.career)navigate(location.hash.replace('#/','')||'dashboard',false);else renderCover();});

async function boot() {
  try {
    session.catalog=await fetchJson('data/world-catalog-2026.json');
    document.documentElement.classList.toggle('reduce-motion',store.settings.reducedMotion);
    renderCover();handleOrientation();
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
  } catch {
    app.innerHTML='<main class="screen fatal-screen"><h1>Não foi possível abrir o mundo do futebol</h1><p>Recarregue a página ou verifique os arquivos do jogo.</p></main>';
  } finally { setTimeout(()=>bootScreen.classList.add('is-ready'),350); }
}

boot();
