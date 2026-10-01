import { MATCH_ENGINE_V2_VERSION, createMatchEngineV2, advanceMatchEngineV2, applyMatchSubstitutionV2, applyManagerShoutV2, buildMatchReport } from './systems/matchEngineV2.js';
import { CAREER_PERFORMANCE_VERSION, hydratePlayerPerformance, effectiveOverall, isPlayerAvailable, selectBestLineup, advanceRosterDays, applyMatchConsequences, applyTrainingWeek, processSeasonAging, rosterHealthSummary } from './systems/careerPerformanceV3.js';

const VERSION = '16.7.0-phase7';
const SCHEMA = 1602;
const STORE_KEY = 'vale-futebol-manager-v16';
const BACKUP_KEY = 'vale-futebol-manager-v16-backup';
const LEGACY_KEY = 'vale-futebol-manager-v11';
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
  match: null, matchTimer: null, matchWasRunningBeforeGate: false, modalReturnFocus: null,
  calendarView:'month', calendarDate:new Date(2026,3,1), calendarFilter:'all', dragPlayerId:null, dragSlot:null,
  onboardingStep:0, playerMedia:new Map(), matchEventFilter:'all'
};

const FORMATIONS = {
  '4-3-3': [[8,50],[25,15],[27,38],[27,62],[25,85],[45,25],[43,50],[45,75],[69,17],[76,50],[69,83]],
  '4-4-2': [[8,50],[25,15],[27,38],[27,62],[25,85],[48,14],[47,38],[47,62],[48,86],[73,35],[73,65]],
  '4-2-3-1': [[8,50],[25,15],[27,38],[27,62],[25,85],[43,36],[43,64],[61,17],[60,50],[61,83],[78,50]],
  '3-5-2': [[8,50],[27,25],[29,50],[27,75],[47,11],[47,34],[47,66],[59,50],[47,89],[75,35],[75,65]]
};

const COMPETITION_MEDIA = {
  'brasileirao-a':'./assets/competitions/real/brasileirao-a.svg',
  'brasileirao-b':'./assets/competitions/real/brasileirao-b.svg',
  'champions-league':'./assets/competitions/real/champions-league.svg',
  'europa-league':'./assets/competitions/real/europa-league.svg',
  libertadores:'./assets/competitions/real/libertadores.svg',
  sulamericana:'./assets/competitions/real/sudamericana.svg',
  'copa-do-brasil':'./assets/competitions/real/copa-do-brasil.svg'
};

const NAV_ITEMS = [
  ['dashboard','home','Início'], ['squad','squad','Elenco'], ['tactics','tactics','Tática'],
  ['match-center','play','Jogar'], ['more','more','Mais']
];
const ICON_PATHS = {
  home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5M9.5 20v-6h5v6"/>',
  squad:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20v-1.5A5.5 5.5 0 0 1 8 13h.5a5.5 5.5 0 0 1 5.5 5.5V20M14 14.5a4.8 4.8 0 0 1 7.5 4V20"/>',
  tactics:'<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M12 4v16M2.5 12h19"/><circle cx="7" cy="8" r="1.5"/><circle cx="16.5" cy="9" r="1.5"/><circle cx="8.5" cy="16" r="1.5"/>',
  play:'<circle cx="12" cy="12" r="9"/><path d="m12 8 3 2-1.2 3.5h-3.6L9 10l3-2ZM5.2 9.3 9 10M15 10l3.8-.7M10.2 13.5 8 17M13.8 13.5 16 17M8 17l-1.8.2M16 17l1.8.2"/>',
  more:'<rect x="4" y="4" width="6" height="6" rx="2"/><rect x="14" y="4" width="6" height="6" rx="2"/><rect x="4" y="14" width="6" height="6" rx="2"/><rect x="14" y="14" width="6" height="6" rx="2"/>',
  trophy:'<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 13v4M8 20h8M9 17h6"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4M17 3v4M3 10h18M7 14h2M12 14h2M17 14h1M7 18h2M12 18h2"/>',
  training:'<path d="M4 18 18 4M11 4h7v7"/><path d="M4 7v11h11"/>',
  market:'<circle cx="8" cy="7" r="3"/><path d="M2.5 17.5A5.5 5.5 0 0 1 8 12h1M13 9h8M18 6l3 3-3 3M21 17h-8M16 14l-3 3 3 3"/>',
  club:'<path d="M4 20V8l8-4 8 4v12M8 20v-6h8v6M9 9h.01M15 9h.01"/>',
  inbox:'<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
  national:'<path d="M5 21V4M6 5h11l-2 4 2 4H6"/>',
  settings:'<circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7 2-.7Z" transform="translate(2.5 0) scale(.8)"/>',
  save:'<path d="M5 4h12l2 2v14H5V4Z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/>',
  chevron:'<path d="m9 6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  book:'<path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H12v18H7.5A3.5 3.5 0 0 0 4 23.5v-18ZM20 5.5A3.5 3.5 0 0 0 16.5 2H12v18h4.5a3.5 3.5 0 0 1 3.5 3.5v-18Z"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
};
function iconSvg(name, className='ui-icon') { return '<svg class="'+className+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(ICON_PATHS[name]||ICON_PATHS.more)+'</svg>'; }
const MORE_SCREENS = new Set(['competitions','calendar','training','market','club','inbox','national','settings','more']);
const ONBOARDING_STEPS = [
  ['dashboard','.career-command','Continue sua carreira','Este é o comando principal. Ele mostra o próximo adversário, o avanço da temporada e a decisão que faz a carreira continuar.','Toque em Preparar partida quando quiser seguir.'],
  ['squad','.squad-planner','Monte seus onze','O mapa do elenco mostra carências por setor. Abaixo dele, toque em Escalar ou use Melhor equipe para montar os titulares.','Confira se o contador chegou a 11/11.'],
  ['tactics','.tactical-board','Organize o time no campo','Os jogadores estão separados em defesa, meio e ataque. Arraste um atleta para reposicioná-lo ou troque a formação no painel ao lado.','Experimente uma formação e observe o desenho mudar.'],
  ['match-center','.match-prep','Prepare e jogue','Antes do apito, confirme adversário, local, escalação e plano de jogo. O botão dourado abre a partida.','Entre em campo quando os onze estiverem definidos.'],
  ['more','.more-grid','Encontre cada área','Calendário, competições, treino, mercado, clube, mensagens, seleção e ajustes ficam nesta central.','Cada cartão abre uma área completa da carreira.']
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
  career.manager.achievements = Array.isArray(career.manager.achievements) ? career.manager.achievements : [];
  career.tactics = { formation:'4-3-3', mentality:'Equilibrada', pressure:58, tempo:55, width:55, defensiveLine:52, passing:'Misto', marking:'Zona', transition:'Equilibrada', ...(career.tactics || {}) };
  career.stats = { played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0,...(career.stats || {}) };
  career.messages = Array.isArray(career.messages) ? career.messages : [];
  career.national = career.national || null;
  career.facilities = { training:2, youth:2, medical:2, scouting:2, ...(career.facilities || {}) };
  career.facilities.stadium = Number(career.facilities.stadium || 2);
  career.facilities.commercial = Number(career.facilities.commercial || 2);
  career.seasonHistory = Array.isArray(career.seasonHistory) ? career.seasonHistory : [];
  career.jobOffers = Array.isArray(career.jobOffers) ? career.jobOffers : [];
  career.transferPolicy = { wageBudget:Math.round((career.budget||50000000)*.18), maxSquad:35, foreignLimit:null, ...(career.transferPolicy || {}) };
  career.sponsor = career.sponsor || null;
  career.sponsorOffers = Array.isArray(career.sponsorOffers) ? career.sponsorOffers : [];
  career.mediaHistory = Array.isArray(career.mediaHistory) ? career.mediaHistory : [];
  career.worldNews = Array.isArray(career.worldNews) ? career.worldNews : [];
  career.worldState = career.worldState || null;
  career.individualTraining = career.individualTraining || {};
  career.matchReports = Array.isArray(career.matchReports) ? career.matchReports.slice(-40) : [];
  career.transferObligations = Array.isArray(career.transferObligations) ? career.transferObligations : [];
  career.boardObjectives = Array.isArray(career.boardObjectives) && career.boardObjectives.length ? career.boardObjectives : createBoardObjectives(career);
  career.weeklyDecisions = career.weeklyDecisions || { training:false, squad:false, tactics:false };
  career.youthIntakeSeason = Number(career.youthIntakeSeason || 0);
  career.youthPlayers = Array.isArray(career.youthPlayers) ? career.youthPlayers.map(normalizePlayer) : [];
  if(Number(career.tacticalLayoutVersion||0)<2){
    career.tacticalPositions=(FORMATIONS[career.tactics.formation]||FORMATIONS['4-3-3']).map(point=>[...point]);
    career.tacticalLayoutVersion=2;
  } else {
    career.tacticalPositions = Array.isArray(career.tacticalPositions) && career.tacticalPositions.length===11 ? career.tacticalPositions : null;
  }
  career.roster = Array.isArray(career.roster) ? career.roster.map(normalizePlayer) : [];
  if(career.national?.roster)career.national.roster=career.national.roster.map(normalizePlayer);
  const validLineup=new Set(career.roster.filter(isPlayerAvailable).map(player=>player.id));
  career.lineupIds=Array.isArray(career.lineupIds)?career.lineupIds.filter((id,index,list)=>validLineup.has(id)&&list.indexOf(id)===index).slice(0,11):[];
  if(career.lineupIds.length<11)career.lineupIds=selectBestLineup(career.roster,career.tactics.formation).map(player=>player.id);
  career.onboardingComplete = career.onboardingComplete !== false;
  return career;
}

function managerLicense(reputation) {
  if(reputation>=88)return 'Licença Continental Pro';
  if(reputation>=76)return 'Licença Continental A';
  if(reputation>=64)return 'Licença Continental B';
  if(reputation>=52)return 'Licença Continental C';
  return 'Licença Nacional';
}

function createBoardObjectives(career) {
  const season=Number(career?.season||2026),rating=Number(career?.club?.rating||70);
  return [
    {id:'league-points',label:'Somar pontos na liga',target:rating>=80?45:rating>=70?36:28,progress:Number(career?.stats?.points||0),unit:'pts',reward:4,status:'active'},
    {id:'develop-player',label:'Desenvolver atletas sub-23',target:8,progress:0,unit:'sessões',reward:3,status:'active'},
    {id:'financial-control',label:'Manter o caixa positivo',target:1,progress:Number(career?.budget||0)>0?1:0,unit:'meta',reward:3,status:'active',season}
  ];
}

function updateBoardObjectives(career) {
  (career.boardObjectives||[]).forEach(objective=>{
    if(objective.id==='league-points')objective.progress=Math.min(objective.target,career.stats.points);
    if(objective.id==='financial-control')objective.progress=career.budget>=0?1:0;
    const completed=objective.progress>=objective.target;
    if(completed&&objective.status!=='complete'){
      objective.status='complete';career.board=clamp(career.board+objective.reward,1,100);
      career.messages.push({id:'objective-'+objective.id+'-'+Date.now(),from:'Diretoria',subject:'Objetivo concluído: '+objective.label,body:'A diretoria reconheceu o resultado. Confiança aumentada em '+objective.reward+' pontos.',date:new Date().toISOString(),read:false,priority:'normal'});
    }
  });
}

function persist(showToast = false) {
  if (session.career && session.slot) {
    session.career.updatedAt = new Date().toISOString();
    store.slots[session.slot - 1] = session.career;
  }
  const previous = storageGet(STORE_KEY);
  if (previous) storageSet(BACKUP_KEY, previous);
  const saved = storageSet(STORE_KEY, JSON.stringify(store));
  if (!saved) {
    toast('Não foi possível salvar. Exporte a carreira antes de sair.', 'error');
    return false;
  }
  if (showToast) toast('Carreira salva.', 'success');
  return true;
}

function toast(message, type = '') {
  while(toastRoot.children.length>=2)toastRoot.firstElementChild?.remove();
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
window.__vfmPortraitFallback = event => {
  const img=event.target,portrait=img?.closest('.player-portrait');
  if(!portrait||img?.dataset.genericFallback)return;
  img.dataset.genericFallback='1';
  img.src='./assets/players/generic/player-generic-128.webp';
  img.alt='Foto genérica provisória';
  portrait.classList.remove('licensed');portrait.classList.add('generic');
};

async function fetchJson(path) {
  const response = await fetch('./' + String(path).replace(/^\.\//,''));
  if (!response.ok) throw new Error('Falha ao carregar ' + path);
  return response.json();
}

function normalizePlayer(player, index = 0) {
  const overall=clamp(player.overall || 60,1,99),seed=stableNumber(String(player.id||player.name||index));
  const variance=(offset,spread=8)=>clamp(overall+((seed>>(offset%16))%(spread*2+1))-spread,1,99);
  return hydratePlayerPerformance({
    id:String(player.id || 'player-' + index), name:String(player.displayName || player.name || 'Jogador'),
    role:String(player.role || player.positionName || player.pos || 'Jogador'), pos:String(player.pos || player.position || 'MC'),
    overall, potential:clamp(Math.max(overall,Number(player.potential || player.overall || 60)), 1, 99),
    age:clamp(player.age || 24, 15, 50), salary:Number(player.salary) || 35, value:Number(player.marketValue ?? player.value) || 1,
    fitness:clamp(player.fitness ?? 88, 1, 100), morale:clamp(player.morale ?? 74, 1, 100),
    photo:player.photo || '', photoLicense:player.photoLicense || '', photoCredit:player.photoCredit || '', clubName:player.clubName || '', contractUntil:player.contractUntil || '2027-12-31',
    nationality:player.nationality || '', foot:player.foot || '', height:Number(player.height)||0, dataSource:player.dataSource || '',
    attributes:player.attributes||{pace:variance(1),stamina:variance(3),strength:variance(5),passing:variance(7),technique:variance(9),vision:variance(11),finishing:variance(13),tackling:variance(15),positioning:variance(2),decisions:variance(4),teamwork:variance(6),leadership:variance(8)},
    personality:player.personality||['Profissional','Ambicioso','Determinado','Equilibrado','Leal'][seed%5],
    injuryRisk:clamp(player.injuryRisk??(5+seed%16),1,35), form:clamp(player.form??70,1,100), knowledge:clamp(player.knowledge??45,1,100),
    suspended:Boolean(player.suspended), injuredUntil:player.injuredUntil||null,
    sourceOverall:player.sourceOverall, ratingOffset:player.ratingOffset, workload:player.workload, sharpness:player.sharpness, chemistry:player.chemistry,
    minutesLast28:player.minutesLast28,seasonMinutes:player.seasonMinutes,appearances:player.appearances,starts:player.starts,
    developmentProgress:player.developmentProgress,injury:player.injury,injuryHistory:player.injuryHistory,recurrenceRisk:player.recurrenceRisk
  });
}

function stableNumber(value='') { let hash=2166136261;for(let i=0;i<value.length;i++){hash^=value.charCodeAt(i);hash=Math.imul(hash,16777619);}return hash>>>0; }
function average(values){return values.length?values.reduce((sum,value)=>sum+Number(value||0),0)/values.length:0;}

function licensedPlayerMedia(player) { return session.playerMedia.get(String(player?.id||'')) || null; }
function playerPhoto(player,size='small') {
  const media=licensedPlayerMedia(player);
  if(!media)return '';
  if(media.commonsTitle){
    const filename=String(media.commonsTitle).replace(/^File:/,'');
    return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(filename)+'?width='+(size==='small'?128:320);
  }
  return size==='small'?(media.src96||media.src||''):(media.src||'');
}
function initials(name='Jogador') { return name.trim().split(/\s+/).slice(0,2).map(part=>part[0]||'').join('').toUpperCase()||'JF'; }
function playerPortrait(player,size='small') {
  const src=playerPhoto(player,size);
  return src?'<span class="player-portrait '+size+' licensed"><img src="'+escapeHtml(src)+'" alt="Fotografia real de '+escapeHtml(player.name)+'" loading="lazy" referrerpolicy="no-referrer" onerror="__vfmPortraitFallback(event)"></span>':'<span class="player-portrait '+size+' generic"><img src="./assets/players/generic/'+(size==='small'?'player-generic-128.webp':'player-generic.webp')+'" alt="Foto genérica provisória de '+escapeHtml(player?.name||'jogador')+'" loading="lazy"></span>';
}

function positionClass(position='') {
  if(position==='GOL')return 'position-gk';
  if(['ZAG','LD','LE','ADD','ADE'].includes(position))return 'position-def';
  if(['VOL','MC','MEI','MD','ME'].includes(position))return 'position-mid';
  return 'position-att';
}

function playerStatus(player){
  if(player.injury?.daysRemaining>0)return {label:player.injury.type+' · '+player.injury.daysRemaining+'d',className:'injured'};
  if(player.suspended)return {label:'Suspenso',className:'suspended'};
  if(player.workload>=82)return {label:'Sobrecarga '+Math.round(player.workload)+'%',className:'overloaded'};
  if(player.fitness<68)return {label:'Físico baixo',className:'warning'};
  return {label:'Disponível',className:'available'};
}

function repairCareerLineup(career){
  const available=new Set(career.roster.filter(isPlayerAvailable).map(player=>player.id));
  career.lineupIds=(career.lineupIds||[]).filter((id,index,list)=>available.has(id)&&list.indexOf(id)===index).slice(0,11);
  if(career.lineupIds.length<11)career.lineupIds=selectBestLineup(career.roster,career.tactics.formation).map(player=>player.id);
  return career.lineupIds;
}

async function loadPlayerMediaManifest() {
  try{
    const manifest=await fetchJson('data/player-media-manifest.json');
    const records=(manifest.players||[]).filter(item=>item.id&&(item.commonsTitle||/^https:\/\//.test(item.src||''))&&item.license?.commercialUse===true);
    session.playerMedia=new Map(records.map(item=>[String(item.id),item]));
    Object.entries(manifest.aliases||{}).forEach(([alias,target])=>{const media=session.playerMedia.get(String(target));if(media)session.playerMedia.set(String(alias),media);});
  }catch{session.playerMedia=new Map();}
}

function pickLineup(roster) {
  return selectBestLineup(roster,session.career?.tactics?.formation||'4-3-3');
}

function clubKey(club) { return club.leagueId + ':' + club.id; }
function findClub(id, leagueId) { return session.catalog.clubs.find(club => club.id === id && (!leagueId || club.leagueId === leagueId)); }
function findLeague(id) { return session.catalog.leagues.find(league => league.id === id); }

function createWorldState(season) {
  const leagues={};
  session.catalog.leagues.forEach(league=>{
    const clubs=session.catalog.clubs.filter(club=>club.leagueId===league.id).sort((a,b)=>b.rating-a.rating);
    leagues[league.id]={round:0,champion:null,table:clubs.map(club=>({id:club.id,name:club.name,rating:club.rating,played:0,wins:0,draws:0,losses:0,gf:0,ga:0,gd:0,points:0}))};
  });
  return {season,week:0,leagues,transfers:[],champions:[],updatedAt:new Date().toISOString()};
}

function simulateScore(home,away,seed) {
  const rand=(shift)=>((stableNumber(seed+':'+shift)%1000)/1000);
  const advantage=(home.rating-away.rating)/18+.28;
  return {home:Math.max(0,Math.floor(rand(1)*2.5+Math.max(0,advantage))),away:Math.max(0,Math.floor(rand(2)*2.3+Math.max(0,-advantage)))};
}

function applyWorldResult(row,gf,ga){row.played++;row.gf+=gf;row.ga+=ga;row.gd=row.gf-row.ga;if(gf>ga){row.wins++;row.points+=3;}else if(gf===ga){row.draws++;row.points++;}else row.losses++;}

function processCareerDeadlines(career) {
  const current=new Date(career.date);
  if(Number.isNaN(current.getTime()))return;
  const obligations=[];
  (career.transferObligations||[]).forEach(item=>{
    let due=new Date(item.nextDue),remaining=Math.max(0,Number(item.remainingBalance)||0),installments=Math.max(0,Number(item.remainingInstallments)||0);
    const installment=Math.max(0,Number(item.installmentAmount)||0);
    while(remaining>0&&installments>0&&!Number.isNaN(due.getTime())&&due<=current){
      const amount=Math.min(installment||remaining,remaining);
      career.budget-=amount;remaining-=amount;installments--;
      career.ledger.push({date:due.toISOString(),label:'Parcela de transferência · '+item.playerName,amount:-amount,type:'expense'});
      due=new Date(addDays(due,30));
    }
    if(remaining>0&&installments>0)obligations.push({...item,remainingBalance:remaining,remainingInstallments:installments,nextDue:due.toISOString()});
  });
  career.transferObligations=obligations;
  const expired=career.roster.filter(player=>player.onLoan&&player.loanUntil&&new Date(player.loanUntil)<=current);
  if(expired.length){
    const expiredIds=new Set(expired.map(player=>player.id));
    career.roster=career.roster.filter(player=>!expiredIds.has(player.id));
    career.lineupIds=career.lineupIds.filter(id=>!expiredIds.has(id));
    career.messages.push({id:'loans-ended-'+Date.now(),from:'Diretor de futebol',subject:'Empréstimos encerrados',body:expired.map(player=>player.name).join(', ')+' '+(expired.length===1?'retornou':'retornaram')+' aos clubes de origem.',date:current.toISOString(),read:false,priority:'normal'});
  }
}

function simulateWorldWeek() {
  const c=session.career;if(!c.worldState)c.worldState=createWorldState(c.season);
  const headlines=[];c.worldState.week++;
  Object.entries(c.worldState.leagues).forEach(([leagueId,state])=>{
    const teams=state.table,round=state.round++,rotation=teams.slice();if(rotation.length%2)rotation.push(null);
    for(let i=0;i<rotation.length/2;i++){
      const home=rotation[(i+round)%rotation.length],away=rotation[(rotation.length-1-i+round)%rotation.length];if(!home||!away||home.id===away.id)continue;
      const score=simulateScore(home,away,c.season+':'+c.worldState.week+':'+leagueId+':'+home.id+':'+away.id);applyWorldResult(home,score.home,score.away);applyWorldResult(away,score.away,score.home);
      if((home.rating>=82||away.rating>=82)&&score.home+score.away>=4)headlines.push(home.name+' '+score.home+'–'+score.away+' '+away.name);
    }
  });
  c.worldState.updatedAt=new Date().toISOString();c.worldNews.unshift(...headlines.slice(0,4).map(text=>({date:c.date,text,type:'result'})));c.worldNews=c.worldNews.slice(0,60);
}

function generateSponsorOffers(club,facilities) {
  const brands=['Aurora Sports','Nexum Global','Vértice Mobile','Atlas Airlines','Orion Bank','Pulse Energy','Titan Motors','PrimeBet','Connecta','Solaris'];
  const base=Math.max(1200000,(club.rating-55)*420000+facilities.commercial*900000);
  return brands.slice().sort(()=>Math.random()-.5).slice(0,3).map((name,index)=>({id:'sponsor-'+Date.now()+'-'+index,name,years:index===0?3:2,annual:Math.round(base*(.9+index*.18)),winBonus:Math.round(base*(.06+index*.03)),titleBonus:Math.round(base*(.35+index*.18)),reputationRequired:Math.max(40,club.rating-10+index*4)}));
}

function showModal(title, body, actions = '<button class="btn" data-action="close-modal">Fechar</button>') {
  clearTutorialFocus();
  session.modalReturnFocus = document.activeElement;
  modalRoot.innerHTML = '<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-label="' + escapeHtml(title) + '"><header class="modal-header"><div><span>VALE FUTEBOL MANAGER</span><h2>' + escapeHtml(title) + '</h2></div><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button></header><div class="modal-body">' + body + '</div><div class="modal-actions">' + actions + '</div></section></div>';
  const focus = modalRoot.querySelector('button,input,select');
  if (focus) focus.focus({ preventScroll:true });
}

function clearTutorialFocus() {
  document.querySelectorAll('.tutorial-focus').forEach(element=>element.classList.remove('tutorial-focus'));
  modalRoot.classList.remove('coachmark-mode');
}

function closeModal() {
  clearTutorialFocus();
  modalRoot.innerHTML = '';
  if (session.modalReturnFocus?.focus) session.modalReturnFocus.focus({ preventScroll:true });
  session.modalReturnFocus = null;
}

function showOnboardingStep(step=0) {
  if(!session.career||session.career.onboardingComplete)return;
  const current=ONBOARDING_STEPS[step];
  if(!current){session.career.onboardingComplete=true;persist();closeModal();toast('Guia concluído. Boa temporada!','success');return;}
  session.onboardingStep=step;
  const [screen,selector,title,description,practice]=current;
  navigate(screen,false);
  const progress='<div class="onboarding-progress">'+ONBOARDING_STEPS.map((_,index)=>'<span class="'+(index<=step?'done':'')+'"></span>').join('')+'</div>';
  session.modalReturnFocus=document.activeElement;
  modalRoot.classList.add('coachmark-mode');
  modalRoot.innerHTML='<div class="coachmark-stage"><section class="coachmark-card" role="dialog" aria-modal="false" aria-label="'+escapeHtml(title)+'"><header><span>GUIA PRÁTICO · '+(step+1)+'/'+ONBOARDING_STEPS.length+'</span><button class="modal-close" data-action="skip-onboarding" aria-label="Encerrar guia">×</button></header>'+progress+'<h2>'+escapeHtml(title)+'</h2><p>'+escapeHtml(description)+'</p><div class="coachmark-practice"><strong>Faça agora</strong><span>'+escapeHtml(practice)+'</span></div><footer>'+(step?'<button class="btn" data-action="onboarding-prev">Voltar</button>':'<button class="btn" data-action="skip-onboarding">Pular guia</button>')+'<button class="btn btn-primary" data-action="onboarding-next">'+(step===ONBOARDING_STEPS.length-1?'Concluir':'Próximo passo')+'</button></footer></section></div>';
  requestAnimationFrame(()=>{
    const target=document.querySelector(selector);
    if(target){target.classList.add('tutorial-focus');target.scrollIntoView({behavior:store.settings.reducedMotion?'auto':'smooth',block:'center'});}
    modalRoot.querySelector('.btn-primary')?.focus({preventScroll:true});
  });
}

function startOnboarding() { session.onboardingStep=0;showOnboardingStep(0); }

function renderCover() {
  stopMatchTimer();
  session.screen = 'cover'; session.career = null; session.slot = null;
  const canContinue = store.slots.some(Boolean);
  app.innerHTML = '<main class="screen cover-screen"><section class="cover-copy"><p class="eyebrow">Gold World Edition</p>' +
    '<h1 class="cover-title">Vale Futebol <span>Manager</span></h1><p class="cover-lead">Construa uma carreira mundial. Comande clubes e seleções, dispute ligas, copas nacionais e torneios continentais.</p>' +
    '<div class="cover-actions"><button class="btn btn-primary" data-action="new-career">'+iconSvg('plus')+'<span>Nova carreira</span></button><button class="btn" data-action="load-career" ' + (canContinue?'':'disabled') + '>'+iconSvg('play')+'<span>Continuar</span></button><button class="btn" data-action="world-database">'+iconSvg('globe')+'<span>Base mundial</span></button><button class="btn" data-action="show-help">'+iconSvg('book')+'<span>Como jogar</span></button></div>' +
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
  const realPhotoPlayers = session.playerMedia.size;
  showModal('Base mundial 2026', '<div class="world-stats"><div><strong>' + stats.playableClubs + '</strong><span>clubes comandáveis</span></div><div><strong>' + stats.simulationClubs + '</strong><span>clubes no mundo</span></div><div><strong>' + stats.clubPlayers.toLocaleString('pt-BR') + '</strong><span>jogadores de clubes</span></div><div><strong>' + stats.nationalTeams + '</strong><span>associações FIFA</span></div><div><strong>' + stats.commandableNationalTeams + '</strong><span>seleções comandáveis</span></div><div><strong>' + stats.nationalPlayers.toLocaleString('pt-BR') + '</strong><span>jogadores de seleções</span></div><div><strong>' + countries + '</strong><span>países com liga</span></div><div><strong>' + realPhotoPlayers.toLocaleString('pt-BR') + '</strong><span>jogadores com foto real</span></div></div><p class="muted">As 211 seleções participam da simulação. Há 48 listas oficiais da Copa de 2026 e pools profissionais atuais para outras seleções; GER e potencial são índices próprios do VFM.</p>');
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
  const pending={id:'draw-pending',name:'Adversário definido por sorteio',badge:'assets/competitions/copa_do_brasil.png',rating:68};
  return stages.map((stage,index)=>({ id:'cup-'+(index+1), competitionId:'domestic-cup', competitionName:countryCup, type:'cup', stage, round:index+1, date:addDays(startDate,18+index*42), opponent:index===0?opponents[0]:pending, drawPool:opponents.map(team=>team.id), drawStatus:index===0?'confirmed':'provisional', home:index%2===0, played:false, locked:index>0, score:null }));
}

function resolveCupDraw(fixture) {
  const c=session.career,pool=(fixture.drawPool||[]).map(id=>session.catalog.clubs.find(club=>club.id===id)).filter(Boolean).filter(club=>club.id!==c.club.id);
  const used=new Set(c.fixtures.filter(item=>item.type==='cup'&&item.opponent?.id!=='draw-pending').map(item=>item.opponent.id));
  const available=pool.filter(club=>!used.has(club.id));fixture.opponent=(available.length?available:pool).sort(()=>Math.random()-.5)[0]||fixture.opponent;fixture.drawStatus='confirmed';fixture.locked=false;
  c.messages.push({id:'draw-'+Date.now(),from:'Federação',subject:'Sorteio: '+fixture.stage,body:'O adversário definido para '+fixture.stage+' é '+fixture.opponent.name+'. A agenda foi atualizada automaticamente.',date:new Date().toISOString(),read:false,priority:'high'});
}

function buildContinentalFixtures(club, startDate, participants, forcedCompetitionId=null) {
  const leaguePool = session.catalog.clubs.filter(item=>item.confederation===club.confederation&&item.leagueId!==club.leagueId);
  const rated = leaguePool.sort((a,b)=>b.rating-a.rating);
  const league=findLeague(club.leagueId),ranking=[...participants].sort((a,b)=>b.rating-a.rating),seed=ranking.findIndex(team=>team.id===club.id)+1;
  const allocations=league?.rules?.continental||{};
  const id=forcedCompetitionId||Object.entries(allocations).find(([,range])=>seed>=Number(range[0])&&seed<=Number(range[1]))?.[0];
  if(!id)return [];
  const names = {'champions-league':'UEFA Champions League','europa-league':'UEFA Europa League','libertadores':'CONMEBOL Libertadores','sulamericana':'CONMEBOL Sul-Americana','concacaf-champions-cup':'CONCACAF Champions Cup','afc-champions-league':'AFC Champions League Elite','caf-champions-league':'CAF Champions League','ofc-champions-league':'OFC Champions League','continental-cup':'Copa continental'};
  const groupCount=club.confederation==='UEFA'?8:6,group= rated.slice(0,groupCount).map((opponent,index)=>({ id:'continental-'+(index+1), competitionId:id, competitionName:names[id]||'Copa continental', type:'continental', qualificationSeed:seed, stage:club.confederation==='UEFA'?'Fase de liga':'Fase de grupos', phase:'league', round:index+1, date:addDays(startDate,10+index*21), opponent, home:index%2===0, played:false, score:null }));
  const pending={id:'draw-pending',name:'Adversário definido por sorteio',badge:'assets/competitions/champions.png',rating:78};
  const knockoutStages=['Oitavas de final','Quartas de final','Semifinal','Final'].map((stage,index)=>({id:'continental-ko-'+(index+1),competitionId:id,competitionName:names[id]||'Copa continental',type:'continental',phase:'knockout',stage,round:groupCount+index+1,date:addDays(startDate,10+groupCount*21+index*28),opponent:pending,drawPool:rated.slice(0,24).map(team=>team.id),drawStatus:'provisional',home:index%2===0,played:false,locked:true,score:null}));
  return group.concat(knockoutStages);
}

function buildWorldFixtures(club, startDate) {
  const confederations = ['UEFA','CONMEBOL','CONCACAF','AFC','CAF','OFC'].filter(id=>id!==club.confederation);
  const opponents = confederations.map(confederation=>session.catalog.clubs.filter(item=>item.confederation===confederation).sort((a,b)=>b.rating-a.rating)[0]).filter(Boolean).slice(0,3);
  return opponents.map((opponent,index)=>({id:'world-club-'+(index+1),competitionId:'club-world-cup',competitionName:'Mundial de Clubes',type:'world',stage:'Fase de grupos',round:index+1,date:addDays(startDate,430+index*5),opponent,home:index%2===0,played:false,score:null}));
}

function resolveTournamentDraw(fixture) {
  const c=session.career,pool=(fixture.drawPool||[]).map(id=>session.catalog.clubs.find(club=>club.id===id)).filter(Boolean).filter(club=>club.id!==c.club.id);
  const used=new Set(c.fixtures.filter(item=>item.competitionId===fixture.competitionId&&item.opponent?.id!=='draw-pending').map(item=>item.opponent.id));
  const available=pool.filter(club=>!used.has(club.id));fixture.opponent=(available.length?available:pool).sort(()=>Math.random()-.5)[0]||fixture.opponent;fixture.drawStatus='confirmed';fixture.locked=false;
  c.messages.push({id:'draw-'+Date.now(),from:'Organização da competição',subject:'Sorteio: '+fixture.stage,body:'O adversário definido para '+fixture.stage+' é '+fixture.opponent.name+'. A agenda anual foi atualizada.',date:new Date().toISOString(),read:false,priority:'high'});
}

function cancelRemainingKnockout(fixture) {
  session.career.fixtures.filter(item=>item.competitionId===fixture.competitionId&&(item.type==='cup'||item.phase==='knockout')&&!item.played&&new Date(item.date)>new Date(fixture.date)).forEach(item=>{item.cancelled=true;item.locked=true;});
}

function unlockAchievement(id,name,description) {
  const c=session.career;c.manager.achievements=c.manager.achievements||[];if(c.manager.achievements.some(item=>item.id===id))return;
  c.manager.achievements.push({id,name,description,date:c.date});c.manager.xp+=150;
  c.messages.push({id:'achievement-'+id,from:'Carreira VFM',subject:'Conquista desbloqueada: '+name,body:description+' Você recebeu 150 XP de treinador.',date:new Date().toISOString(),read:false,priority:'high'});
  toast('Conquista desbloqueada: '+name,'success');
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
      schema:SCHEMA,version:VERSION,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),onboardingComplete:false,
      manager:{name,avatar:session.selectedAvatar,difficulty:document.querySelector('#difficulty')?.value||'Equilibrado',reputation,xp:0,level:1,license:managerLicense(reputation),awards:[],achievements:[]},
      club:{...session.selectedClub},season:2026,date:startDate.toISOString(),week:1,budget,board:72,morale:74,fitness:88,
      roster,lineupIds:pickLineup(roster).map(p=>p.id),tactics:{formation:'4-3-3',mentality:'Equilibrada',pressure:58,tempo:55,width:55,defensiveLine:52,passing:'Misto',marking:'Zona',transition:'Equilibrada'},
      stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0},participants,table:initialTable(participants),fixtures,
      ledger:[{date:new Date().toISOString(),label:'Orçamento da temporada',amount:budget,type:'income'}],messages:initialMessages(session.selectedClub),
      staff:{assistant:68,fitnessCoach:66,scout:64,medical:65},facilities:{training:2,youth:2,medical:2,scouting:2,stadium:2,commercial:2},transferPolicy:{wageBudget:Math.round(budget*.18),maxSquad:35,foreignLimit:null},transferObligations:[],weeklyDecisions:{training:false,squad:false,tactics:false},seasonHistory:[],matchReports:[],jobOffers:[],lastTrainingWeek:0,national:null,seasonSummary:null,sponsor:null,sponsorOffers:generateSponsorOffers(session.selectedClub,{commercial:2}),mediaHistory:[],worldNews:[],worldState:createWorldState(2026),tacticalPositions:(FORMATIONS['4-3-3']).map(point=>[...point]),tacticalLayoutVersion:2,individualTraining:{},youthIntakeSeason:0,youthPlayers:[]
    };
    session.career.boardObjectives=createBoardObjectives(session.career);
    persist(); toast('Contrato assinado. O mundo do futebol está ativo.','success'); navigate('dashboard');startOnboarding();
  } catch (error) {
    if (button) { button.disabled=false; button.textContent='Assinar contrato'; }
    toast('Não foi possível carregar o elenco completo deste clube.','error');
  }
}

function currentCompetitionFixtures(id) { return session.career.fixtures.filter(f=>f.competitionId===id); }
function nextFixture() { return session.career.fixtures.find(f=>!f.played&&!f.locked&&!f.cancelled) || null; }

function renderGame(content) {
  const c = session.career;
  const unread = c.messages.filter(m=>!m.read).length;
  const activeNav = MORE_SCREENS.has(session.screen) ? 'more' : session.screen;
  const nav = NAV_ITEMS.map(([screen,icon,label])=>'<button class="world-nav-btn '+(activeNav===screen?'active':'')+'" data-action="navigate" data-screen="'+screen+'" aria-label="'+label+'" '+(activeNav===screen?'aria-current="page"':'')+'><span>'+iconSvg(icon)+'</span><small>'+label+(screen==='more'&&unread?'<b>'+unread+'</b>':'')+'</small></button>').join('');
  app.innerHTML = '<main class="screen game-screen world-game"><nav class="world-nav" aria-label="Menu principal"><div class="nav-brand"><strong>V</strong><span>FM</span></div><div class="nav-primary">'+nav+'</div><div class="nav-season"><span>Temporada</span><strong>'+c.season+'</strong></div></nav><section class="game-stage"><header class="world-topbar"><div class="club-identity"><span class="club-badge-shell"><img src="./'+escapeHtml(c.club.badge)+'" alt="" onerror="__vfmFallback(event)"></span><span><strong>'+escapeHtml(c.club.name)+'</strong><small>'+escapeHtml(c.manager.name)+' · '+escapeHtml(c.club.leagueName)+'</small></span><i class="manager-face-small avatar-sprite avatar-sprite-'+clamp(c.manager.avatar,1,16)+'" aria-label="Retrato do treinador"></i></div><div class="top-metrics"><span>Data <strong>'+formatDate(c.date)+'</strong></span><span>Reputação <strong>'+c.manager.reputation+'</strong></span><span>Licença <strong>'+escapeHtml(c.manager.license)+'</strong></span><span>Saldo <strong>'+money(c.budget)+'</strong></span></div><button class="btn btn-small top-save" data-action="save">'+iconSvg('save')+'<span>Salvar</span></button></header><div class="game-content world-screen-'+escapeHtml(session.screen)+'">'+content+'</div></section></main>';
}

function sectionHead(title,subtitle,extra='') { return '<header class="section-head"><div><p class="eyebrow">Carreira mundial</p><h1>'+escapeHtml(title)+'</h1><p>'+escapeHtml(subtitle)+'</p></div>'+extra+'</header>'; }
function options(values,current) { return values.map(value=>'<option '+(value===current?'selected':'')+'>'+value+'</option>').join(''); }

function confederationClubLabel(confederation) {
  return {UEFA:'Champions League e Europa League',CONMEBOL:'Libertadores e Sul-Americana',CONCACAF:'CONCACAF Champions Cup',AFC:'AFC Champions League Elite',CAF:'CAF Champions League',OFC:'OFC Champions League'}[confederation]||'Competições continentais';
}

function renderWeeklyLoop(c){
  const stages=[['Decisões',c.messages.some(message=>!message.read)?'pending':'done'],['Treino',c.lastTrainingWeek===c.week?'done':'current'],['Preparação',c.lineupIds.length===11?'done':'pending'],['Partida',nextFixture()?'current':'done']];
  return '<section class="weekly-loop panel"><header><p class="eyebrow">SEMANA '+c.week+'</p><strong>Decida, prepare, jogue e veja as consequências</strong></header><div>'+stages.map(([label,status],index)=>'<span class="'+status+'"><i>'+(status==='done'?'✓':index+1)+'</i><b>'+label+'</b></span>').join('')+'</div></section>';
}

function competitionLogoPath(id,name='') {
  if(COMPETITION_MEDIA[id])return COMPETITION_MEDIA[id];
  const text=(id+' '+name).toLowerCase();
  if(text.includes('brasileir')&&text.includes('série b'))return COMPETITION_MEDIA['brasileirao-b'];
  if(text.includes('brasileir'))return COMPETITION_MEDIA['brasileirao-a'];
  if(text.includes('champions league')&&text.includes('uefa'))return COMPETITION_MEDIA['champions-league'];
  if(text.includes('libertadores'))return COMPETITION_MEDIA.libertadores;
  if(text.includes('sul-americana')||text.includes('sudamericana'))return COMPETITION_MEDIA.sulamericana;
  if(text.includes('europa league'))return COMPETITION_MEDIA['europa-league'];
  if(text.includes('copa do brasil'))return COMPETITION_MEDIA['copa-do-brasil'];
  if(id==='copa-nacional'&&session.career?.club?.country==='Brasil')return COMPETITION_MEDIA['copa-do-brasil'];
  return '';
}

function competitionLogo(id,name='',className='competition-logo-image') {
  const path=competitionLogoPath(id,name);
  return path?'<img class="'+className+'" src="'+path+'" alt="Logo '+escapeHtml(name||id)+'">':iconSvg('trophy',className+' ui-icon');
}

function renderDashboard() {
  const c=session.career, next=nextFixture(), recent=c.fixtures.filter(f=>f.played).slice(-5).reverse(),health=rosterHealthSummary(c.roster);
  const unread=c.messages.filter(m=>!m.read).length;
  const leagueFinished=c.fixtures.filter(f=>f.type==='league').length>0&&c.fixtures.filter(f=>f.type==='league').every(f=>f.played);
  const seasonFixtures=c.fixtures.filter(f=>!f.cancelled),seasonPlayed=seasonFixtures.filter(f=>f.played).length,seasonProgress=seasonFixtures.length?Math.round(seasonPlayed/seasonFixtures.length*100):0;
  const tasks=[];
  if(c.lineupIds.length<11)tasks.push(['squad','Complete a escalação','Escolha os onze titulares antes da próxima partida.','Definir time']);
  else if(next)tasks.push(['match-center','Prepare o próximo jogo',escapeHtml(next.opponent.name)+' · '+formatDate(next.date),'Preparar']);
  if(unread)tasks.push(['inbox','Leia as mensagens',unread+' '+(unread===1?'mensagem precisa':'mensagens precisam')+' da sua atenção.','Abrir caixa']);
  if(health.injured.length)tasks.push(['training','Departamento médico',health.injured.length+' atleta(s) em recuperação.','Ver boletim']);
  if(c.lastTrainingWeek!==c.week)tasks.push(['training','Planeje o treino','O elenco ainda não treinou nesta semana.','Escolher treino']);
  const today=tasks.slice(0,3).map(([screen,title,detail,action],index)=>'<article class="today-task"><span>'+String(index+1).padStart(2,'0')+'</span><div><strong>'+title+'</strong><small>'+detail+'</small></div><button class="btn btn-small '+(index===0?'btn-primary':'')+'" data-action="navigate" data-screen="'+screen+'">'+action+'</button></article>').join('');
  const command=next?'<section class="career-command panel"><div class="career-command-copy"><div class="career-command-kicker"><span class="competition-emblem">'+competitionLogo(next.competitionId,next.competitionName)+'</span><span><small>PRÓXIMA DECISÃO</small><strong>'+escapeHtml(next.competitionName)+'</strong></span></div><h2>'+escapeHtml(c.club.name)+' <b>×</b> '+escapeHtml(next.opponent.name)+'</h2><p>'+formatDate(next.date)+' · '+(next.home?'Em casa':'Fora de casa')+' · Semana '+c.week+'</p><button class="btn btn-primary" data-action="open-next-match">Preparar partida</button></div><div class="career-command-opponent"><img src="./'+escapeHtml(next.opponent.badge)+'" alt="Escudo '+escapeHtml(next.opponent.name)+'" onerror="__vfmFallback(event)"><strong>'+escapeHtml(next.opponent.name)+'</strong><small>GER '+next.opponent.rating+'</small></div><div class="career-command-progress"><span><small>Temporada</small><strong>'+seasonProgress+'%</strong></span><i><em style="width:'+seasonProgress+'%"></em></i><div><span><small>Diretoria</small><strong>'+c.board+'%</strong></span><span><small>Elenco</small><strong>'+c.lineupIds.length+'/11</strong></span><span><small>Forma</small><strong>'+(recent.length?recent.map(resultLetter).join(''):'—')+'</strong></span></div></div></section>':'<section class="career-command panel season-complete"><div><small>TEMPORADA</small><h2>Calendário concluído</h2><p>Revise resultados, objetivos e elenco antes de iniciar a próxima época.</p></div>'+(leagueFinished?'<button class="btn btn-primary" data-action="advance-season">Encerrar temporada</button>':'<span>Ainda há jogos de liga pendentes.</span>')+'</section>';
  return sectionHead('Central do treinador','Todas as decisões do clube e da seleção em um só lugar.','<span class="tag">Nível '+c.manager.level+'</span>') +
    command+renderWeeklyLoop(c)+'<section class="today-panel panel"><header><div><p class="eyebrow">HOJE</p><h2>Suas próximas decisões</h2></div><small>Faça o essencial e avance sem se perder em menus.</small></header><div class="today-list">'+(today||'<article class="today-clear"><strong>Tudo em dia</strong><span>Você pode avançar pelo calendário quando estiver pronto.</span></article>')+'</div></section>'+
    '<div class="dashboard-world-grid"><article class="panel"><h2>Desempenho</h2><div class="world-metric-grid"><div><span>Jogos</span><strong>'+c.stats.played+'</strong></div><div><span>Pontos</span><strong>'+c.stats.points+'</strong></div><div><span>Saldo</span><strong>'+(c.stats.gf-c.stats.ga)+'</strong></div><div><span>Diretoria</span><strong>'+c.board+'%</strong></div></div><div class="form-strip">'+(recent.length?recent.map(f=>'<span class="'+resultClass(f)+'">'+resultLetter(f)+'</span>').join(''):'<small>A temporada começa no próximo jogo.</small>')+'</div></article>' +
    '<article class="panel"><h2>Caixa de entrada</h2><p class="big-number">'+unread+'</p><p>mensagens aguardando leitura</p><button class="btn" data-action="navigate" data-screen="inbox">Abrir e-mail</button></article>' +
    '<article class="panel"><h2>Carreira internacional</h2>'+(c.national?'<div class="national-mini"><img src="./'+escapeHtml(c.national.team.badge)+'" alt="" onerror="__vfmFallback(event)"><span><strong>'+escapeHtml(c.national.team.name)+'</strong><small>'+escapeHtml(c.national.competitionLabel)+'</small></span></div><button class="btn" data-action="navigate" data-screen="national">Abrir seleção</button>':'<p>Receba propostas de seleções conforme sua reputação cresce.</p><button class="btn" data-action="navigate" data-screen="national">Ver oportunidades</button>')+'</article>' +
    '<article class="panel news-panel"><h2>Mundo do futebol</h2><ul>'+(c.worldNews.length?c.worldNews.slice(0,5).map(item=>'<li><strong>'+formatDate(item.date)+'</strong><span>'+escapeHtml(item.text)+'</span></li>').join(''):'<li><strong>'+escapeHtml(c.club.leagueName)+'</strong><span>A temporada nacional está em andamento.</span></li><li><strong>'+escapeHtml(c.club.confederation)+'</strong><span>'+escapeHtml(confederationClubLabel(c.club.confederation))+' movimenta o continente.</span></li><li><strong>Simulação global</strong><span>'+Object.keys(c.worldState?.leagues||{}).length+' ligas estão sendo processadas a cada rodada.</span></li>')+'</ul></article><article class="panel career-progress"><h2>Jornada do treinador</h2><div class="progress-track"><span style="width:'+((c.manager.xp%500)/5)+'%"></span></div><p>'+c.manager.xp+' XP · Nível '+c.manager.level+' · '+(500-c.manager.xp%500)+' XP para o próximo nível</p><div class="achievement-strip">'+((c.manager.achievements||[]).slice(-4).map(item=>'<span title="'+escapeHtml(item.description)+'">★ '+escapeHtml(item.name)+'</span>').join('')||'<small>Suas conquistas aparecerão aqui.</small>')+'</div></article></div>';
}

function resultClass(f) { const own=f.home?f.score?.home:f.score?.away, opp=f.home?f.score?.away:f.score?.home;if(own===opp&&f.score?.penalties){const ownPens=f.home?f.score.penalties.home:f.score.penalties.away,oppPens=f.home?f.score.penalties.away:f.score.penalties.home;return ownPens>oppPens?'win':'loss';}return own>opp?'win':own<opp?'loss':'draw'; }
function resultLetter(f) { return resultClass(f)==='win'?'V':resultClass(f)==='loss'?'D':'E'; }

function squadSector(pos){if(pos==='GOL')return 'Goleiros';if(['ZAG','LD','LE'].includes(pos))return 'Defesa';if(['VOL','MC','MEI'].includes(pos))return 'Meio';return 'Ataque';}
function renderSquadPlanner(c){
  const sectors=['Goleiros','Defesa','Meio','Ataque'].map(label=>{const list=c.roster.filter(player=>squadSector(player.pos)===label),avg=Math.round(average(list.map(player=>effectiveOverall(player,player.pos)))),young=list.filter(player=>player.age<=23).length,minimum={Goleiros:2,Defesa:7,Meio:6,Ataque:5}[label],available=list.filter(isPlayerAvailable).length,status=available<minimum?'Reforçar':avg<65?'Evoluir':'Coberto';return '<article class="planner-sector '+(status==='Reforçar'?'needs-attention':'')+'"><span>'+label+'</span><strong>'+available+'/'+list.length+' disponíveis · REND '+avg+'</strong><small>'+young+' sub-23 · '+status+'</small></article>';}).join('');
  const now=new Date(c.date),limit=new Date(addDays(now,365)),expiring=c.roster.filter(player=>new Date(player.contractUntil)<=limit).length,prospects=c.roster.filter(player=>player.age<=23&&player.potential-player.overall>=4).length,health=rosterHealthSummary(c.roster);
  return '<section class="squad-planner panel"><header><div><p class="eyebrow">PLANEJADOR · MOTOR '+CAREER_PERFORMANCE_VERSION+'</p><h2>Mapa do elenco</h2></div><div class="planner-alerts"><span>'+health.injured.length+' no DM</span><span>'+health.overloaded.length+' sobrecarregados</span><span>'+expiring+' contratos em 12 meses</span><span>'+prospects+' jovens com margem</span></div></header><div class="planner-sectors">'+sectors+'</div></section>';
}

function renderSquad() {
  const c=session.career, filtered=c.roster.filter(p=>(session.positionFilter==='TODOS'||p.pos===session.positionFilter)&&(!session.squadSearch||p.name.toLowerCase().includes(session.squadSearch.toLowerCase()))).sort((a,b)=>effectiveOverall(b,b.pos)-effectiveOverall(a,a.pos));
  const positions=['TODOS',...new Set(c.roster.map(p=>p.pos))];
  const rows=filtered.map(p=>{const status=playerStatus(p),rend=effectiveOverall(p,p.pos),available=isPlayerAvailable(p);return '<tr class="player-row '+status.className+'"><td><button class="player-cell player-cell-button" data-action="player-report" data-player="'+escapeHtml(p.id)+'">'+playerPortrait(p,'small')+'<span><strong>'+escapeHtml(p.name)+'</strong><small>'+escapeHtml(status.label)+'</small></span></button></td><td><span class="pos-tag">'+escapeHtml(p.pos)+'</span></td><td><span class="rating-cell"><strong>'+p.overall+'</strong><small>Hoje '+rend.toFixed(1)+'</small></span></td><td>'+p.age+'</td><td><span class="condition-cell">'+Math.round(p.fitness)+'%<small>Carga '+Math.round(p.workload)+'</small></span></td><td><span class="condition-cell">'+Math.round(p.form)+'%<small>Moral '+Math.round(p.morale)+'</small></span></td><td>'+money(p.value*1000000)+'</td><td><button class="btn btn-small squad-action '+(c.lineupIds.includes(p.id)?'btn-primary':'')+'" data-action="toggle-lineup" data-player="'+escapeHtml(p.id)+'" '+(available?'':'disabled')+'>'+(c.lineupIds.includes(p.id)?'Titular':available?'Escalar':'Indisponível')+'</button></td></tr>';}).join('');
  return sectionHead('Elenco','Overall por posição, rendimento atual, carga, forma e disponibilidade médica.','<span class="tag">'+c.lineupIds.length+'/11 titulares</span>')+renderSquadPlanner(c)+'<div class="toolbar"><input data-action="squad-search" aria-label="Buscar jogador" placeholder="Buscar jogador" value="'+escapeHtml(session.squadSearch)+'"><select data-action="position-filter" aria-label="Filtrar posição">'+positions.map(p=>'<option '+(p===session.positionFilter?'selected':'')+'>'+p+'</option>').join('')+'</select><button class="btn action-with-icon squad-action" data-action="best-lineup">'+iconSvg('squad')+'<span>Melhor equipe disponível</span></button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Jogador</th><th>Pos.</th><th>GER / hoje</th><th>Idade</th><th>Físico / carga</th><th>Forma / moral</th><th>Valor</th><th>Escalação</th></tr></thead><tbody>'+rows+'</tbody></table></div>';
}

function activeTacticalPositions(){const c=session.career,base=FORMATIONS[c.tactics.formation]||FORMATIONS['4-3-3'];if(!c.tacticalPositions||c.tacticalPositions.length!==11)c.tacticalPositions=base.map(point=>[...point]);return c.tacticalPositions;}
function formationPreview(roster,lineupIds,formation) {
  const players=lineupIds.map(id=>roster.find(p=>p.id===id)).filter(Boolean).slice(0,11),coords=activeTacticalPositions();
  const zones='<div class="pitch-zones" aria-hidden="true"><span>DEFESA</span><span>MEIO-CAMPO</span><span>ATAQUE</span></div>';
  const pitch='<div class="formation-pitch premium-pitch" data-drop-zone="pitch">'+zones+coords.map(([x,y],i)=>{const player=players[i],tone=positionClass(player?.pos);return '<button class="formation-player draggable-player drop-player '+tone+'" draggable="true" data-player="'+escapeHtml(player?.id||'')+'" data-slot="'+i+'" style="left:'+x+'%;top:'+y+'%" aria-label="'+escapeHtml(player?.name||'Vaga')+'"><span class="formation-face">'+(player?playerPortrait(player,'small'):'<span class="empty-player-face">+</span>')+'<b>'+escapeHtml(player?.pos||'–')+'</b></span><small>'+escapeHtml((player?.name||'Vaga').split(' ').slice(-1)[0])+'</small><em>'+Number(player?.overall||0)+'</em></button>';}).join('')+'<div class="pitch-drag-hint">Arraste para trocar ou reposicionar</div></div>';
  const bench=roster.filter(player=>!lineupIds.includes(player.id)&&isPlayerAvailable(player)).sort((a,b)=>effectiveOverall(b,b.pos)-effectiveOverall(a,a.pos)).slice(0,12).map(player=>'<button class="bench-player draggable-player drop-player '+positionClass(player.pos)+'" draggable="true" data-player="'+escapeHtml(player.id)+'">'+playerPortrait(player,'small')+'<span class="pos-tag">'+escapeHtml(player.pos)+'</span><strong>'+escapeHtml(player.name)+'</strong><em>'+effectiveOverall(player,player.pos).toFixed(1)+'</em><small>Físico '+Math.round(player.fitness)+'% · Carga '+Math.round(player.workload)+'</small></button>').join('');
  return pitch+'<section class="tactical-bench"><header><h3>Banco e reservas</h3><small>Arraste um reserva sobre um titular</small></header><div>'+bench+'</div></section>';
}

function swapTacticalPlayers(sourceId,targetId){
  const c=session.career,source=c.roster.find(player=>player.id===sourceId),target=c.roster.find(player=>player.id===targetId);if(!source||!target||source.id===target.id)return;
  if(!isPlayerAvailable(source))return toast('Este atleta não está disponível.','error');
  const ids=c.lineupIds,sourceIndex=ids.indexOf(source.id),targetIndex=ids.indexOf(target.id);
  if(sourceIndex>=0&&targetIndex>=0){[ids[sourceIndex],ids[targetIndex]]=[ids[targetIndex],ids[sourceIndex]];}
  else if(sourceIndex<0&&targetIndex>=0){ids[targetIndex]=source.id;}
  else if(sourceIndex>=0&&targetIndex<0){ids[sourceIndex]=target.id;}
  else return;
  persist();renderGame(renderTactics());toast(source.name+' e '+target.name+' trocaram de função.','success');
}

function moveTacticalPlayer(slot,x,y){const positions=activeTacticalPositions();if(slot<0||slot>=positions.length)return;positions[slot]=[clamp(x,7,93),clamp(y,8,92)];persist();renderGame(renderTactics());}

function tacticalImpact(t){
  const attack=clamp(Math.round(50+(t.mentality==='Ofensiva'?18:t.mentality==='Defensiva'?-14:0)+(t.tempo-55)*.18+(t.width-55)*.12),20,90);
  const control=clamp(Math.round(52+(t.passing==='Curto'?14:t.passing==='Direto'?-8:2)+(t.pressure-55)*.1),20,90);
  const defense=clamp(Math.round(58+(t.mentality==='Defensiva'?16:t.mentality==='Ofensiva'?-10:0)-(t.defensiveLine-52)*.16+(t.marking==='Zona'?5:t.marking==='Individual'?-2:2)),20,90);
  const intensity=clamp(Math.round((t.pressure+t.tempo)/2),20,90),risk=clamp(Math.round(20+intensity*.55+(t.defensiveLine-52)*.25),20,85);
  const summary=attack>=70?'Cria mais chances, mas deixa espaço nas transições.':defense>=72?'Protege a área e reduz o ritmo ofensivo.':control>=68?'Valoriza posse e decisões pacientes.':'Plano equilibrado para adaptar durante o jogo.';
  return {attack,control,defense,intensity,risk,summary};
}

function renderTacticalImpact(t){const impact=tacticalImpact(t);return '<section class="tactical-impact"><header><div><p class="eyebrow">EFEITO ESPERADO</p><h3>'+escapeHtml(impact.summary)+'</h3></div><span class="risk-chip">Desgaste '+impact.risk+'%</span></header><div>'+[['Ataque',impact.attack],['Controle',impact.control],['Defesa',impact.defense],['Intensidade',impact.intensity]].map(([label,value])=>'<label><span>'+label+'</span><b>'+value+'</b><i><em style="width:'+value+'%"></em></i></label>').join('')+'</div><p>Os valores respondem imediatamente às instruções e entram no cálculo das chances durante a partida.</p></section>';}

function renderTactics() {
  const c=session.career,t=c.tactics;
  return sectionHead('Tática e escalação','Arraste com dedo ou mouse, defina funções e prepare mudanças para a partida.','<span class="tag">'+c.lineupIds.length+'/11 titulares</span>')+'<div class="tactics-layout"><article class="panel tactical-board">'+formationPreview(c.roster,c.lineupIds,t.formation)+'</article><article class="panel tactics-controls">'+renderTacticalImpact(t)+'<div class="tactics-phase-tabs"><button class="active">Com bola</button><button>Sem bola</button><button>Bolas paradas</button></div><div class="tactics-select-grid"><div class="field"><label>Formação</label><select data-action="formation-select">'+options(Object.keys(FORMATIONS),t.formation)+'</select></div><div class="field"><label>Mentalidade</label><select data-action="mentality-select">'+options(['Defensiva','Equilibrada','Ofensiva'],t.mentality)+'</select></div><div class="field"><label>Construção</label><select data-action="passing-select">'+options(['Curto','Misto','Direto'],t.passing)+'</select></div><div class="field"><label>Marcação</label><select data-action="marking-select">'+options(['Zona','Individual','Híbrida'],t.marking)+'</select></div><div class="field"><label>Transição</label><select data-action="transition-select">'+options(['Reagrupar','Equilibrada','Contra-atacar'],t.transition)+'</select></div></div><label>Pressão <output>'+t.pressure+'</output><input type="range" min="20" max="90" value="'+t.pressure+'" data-action="pressure-range"></label><label>Ritmo <output>'+t.tempo+'</output><input type="range" min="20" max="90" value="'+t.tempo+'" data-action="tempo-range"></label><label>Largura <output>'+t.width+'</output><input type="range" min="25" max="85" value="'+t.width+'" data-action="width-range"></label><label>Linha defensiva <output>'+t.defensiveLine+'</output><input type="range" min="20" max="85" value="'+t.defensiveLine+'" data-action="line-range"></label><button class="btn action-with-icon tactics-action" data-action="reset-tactical-shape">'+iconSvg('tactics')+'<span>Restaurar desenho</span></button><p class="muted">Toque em um atleta e depois em outro também funciona como alternativa ao arrastar.</p></article></div>';
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
  const compCards=compIds.map(id=>{const list=currentCompetitionFixtures(id).filter(f=>!f.cancelled),played=list.filter(f=>f.played).length,next=list.find(f=>!f.played&&!f.locked),pending=list.find(f=>!f.played&&f.locked),name=list[0]?.competitionName||id;return '<article class="competition-card"><span class="competition-logo">'+competitionLogo(id,name)+'</span><div><strong>'+escapeHtml(name)+'</strong><small>'+played+'/'+list.length+' jogos · '+(next?escapeHtml(next.stage||'Rodada '+next.round)+' em '+formatDate(next.date):pending?'aguardando classificação/sorteio':'concluída')+'</small></div></article>';}).join('');
  const rows=table.map((row,index)=>'<tr class="'+zoneFor(row,index,table.length,league.rules)+'"><td>'+(index+1)+'</td><td><div class="mini-club"><img src="./'+escapeHtml(row.team.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(row.team.name)+'</strong></div></td><td>'+row.played+'</td><td>'+row.wins+'</td><td>'+row.draws+'</td><td>'+row.losses+'</td><td>'+row.gf+'</td><td>'+row.ga+'</td><td>'+row.gd+'</td><td><strong>'+row.points+'</strong></td></tr>').join('');
  const timeline=c.fixtures.filter(f=>f.type==='cup'||f.phase==='knockout').map(f=>'<div class="stage-node '+(f.played?'done':f.cancelled?'cancelled':f.locked?'locked':'active')+'"><span>'+escapeHtml(f.stage||'Fase')+'</span><strong>'+(f.cancelled?'Eliminado':f.played?(f.score.home+'–'+f.score.away):escapeHtml(f.opponent.name))+'</strong><small>'+formatDate(f.date)+'</small></div>').join('');
  const leaders=Object.entries(c.worldState?.leagues||{}).map(([id,state])=>{const leader=state.table.slice().sort((a,b)=>b.points-a.points||b.gd-a.gd||b.rating-a.rating)[0];return {league:findLeague(id),leader};}).filter(item=>item.league&&item.leader&&item.league.id!==league.id).sort((a,b)=>b.leader.rating-a.leader.rating).slice(0,10).map(item=>'<div class="world-leader"><span>'+escapeHtml(item.league.name)+'</span><strong>'+escapeHtml(item.leader.name)+'</strong><em>'+item.leader.points+' pts · '+item.leader.played+' J</em></div>').join('');
  return sectionHead('Competições','Liga, copas, sorteios e cinquenta campeonatos simulados em paralelo.')+'<div class="competition-grid">'+compCards+'</div><div class="rules-strip">'+rulesText(league).map(item=>'<span>'+escapeHtml(item)+'</span>').join('')+'</div><div class="competition-hub"><div class="table-wrap"><table class="data-table standings-table"><thead><tr><th>#</th><th>'+escapeHtml(league.name)+'</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>PTS</th></tr></thead><tbody>'+rows+'</tbody></table></div><aside class="panel world-leaders"><h2>Líderes pelo mundo</h2>'+leaders+'</aside></div>'+(timeline?'<section class="panel competition-timeline"><h2>Caminho nas copas</h2><div>'+timeline+'</div></section>':'');
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

function dateKey(value){const date=new Date(value);return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
function allCareerEvents(){const c=session.career,club=c.fixtures.map(f=>({...f,eventOwner:'club'})),national=(c.national?.fixtures||[]).map(f=>({...f,eventOwner:'national'}));return [...club,...national].sort((a,b)=>new Date(a.date)-new Date(b.date));}
function filteredCalendarEvents(){return allCareerEvents().filter(event=>session.calendarFilter==='all'||session.calendarFilter===event.eventOwner||session.calendarFilter===event.type||session.calendarFilter===event.competitionId);}
function calendarEventChip(event){const status=event.cancelled?'cancelled':event.played?'played':event.locked?'provisional':'confirmed';return '<span class="calendar-event '+status+' type-'+event.type+'"><img src="./'+escapeHtml(event.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><b>'+escapeHtml(event.opponent.name)+'</b><small>'+(event.cancelled?'ELIMINADO':event.played?event.score.home+'–'+event.score.away:event.drawStatus==='provisional'?'Sorteio pendente':event.home?'CASA':'FORA')+'</small></span>';}
function monthGrid(date,compact=false){const year=date.getFullYear(),month=date.getMonth(),first=new Date(year,month,1),days=new Date(year,month+1,0).getDate(),offset=(first.getDay()+6)%7,events=filteredCalendarEvents();let cells='';for(let i=0;i<offset;i++)cells+='<span class="calendar-day empty"></span>';for(let day=1;day<=days;day++){const key=dateKey(new Date(year,month,day)),items=events.filter(event=>dateKey(event.date)===key),today=key===dateKey(session.career.date);cells+='<button class="calendar-day '+(items.length?'has-events ':'')+(today?'is-today':'')+'" data-action="calendar-day" data-date="'+key+'"><strong>'+day+'</strong>'+items.slice(0,compact?2:3).map(calendarEventChip).join('')+(items.length>(compact?2:3)?'<em>+'+(items.length-(compact?2:3))+'</em>':'')+'</button>';}return '<section class="calendar-month '+(compact?'compact':'')+'"><header><h2>'+new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(date)+'</h2></header><div class="calendar-weekdays">'+['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map(day=>'<span>'+day+'</span>').join('')+'</div><div class="calendar-days">'+cells+'</div></section>';}
function yearCalendar(date){return '<div class="calendar-year-grid">'+Array.from({length:12},(_,month)=>monthGrid(new Date(date.getFullYear(),month,1),true)).join('')+'</div>';}
function weekCalendar(date){const start=new Date(date);start.setDate(start.getDate()-((start.getDay()+6)%7));const events=filteredCalendarEvents();return '<div class="calendar-week-grid">'+Array.from({length:7},(_,index)=>{const day=new Date(start);day.setDate(start.getDate()+index);const key=dateKey(day),items=events.filter(event=>dateKey(event.date)===key);return '<button class="calendar-week-day" data-action="calendar-day" data-date="'+key+'"><span>'+new Intl.DateTimeFormat('pt-BR',{weekday:'short'}).format(day)+'</span><strong>'+day.getDate()+'</strong><small>'+new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(day)+'</small>'+items.map(calendarEventChip).join('')+(items.length?'<em>'+items.length+' evento(s)</em>':'<em>Recuperação / treino</em>')+'</button>';}).join('')+'</div>';}
function renderCalendar() {
  const c=session.career,events=allCareerEvents(),view=session.calendarView,date=session.calendarDate;
  const body=view==='year'?yearCalendar(date):view==='week'?weekCalendar(date):monthGrid(date);
  return sectionHead('Agenda anual','Jogos, sorteios, Datas FIFA e alterações de calendário em uma visão unificada.','<span class="tag">'+c.season+'</span>')+'<div class="calendar-command"><div><button class="btn btn-small" data-action="calendar-shift" data-shift="-1">‹</button><button class="btn btn-small" data-action="calendar-today">Hoje</button><button class="btn btn-small" data-action="calendar-shift" data-shift="1">›</button></div><div><select data-action="calendar-view"><option value="month" '+(view==='month'?'selected':'')+'>Mês</option><option value="week" '+(view==='week'?'selected':'')+'>Semana</option><option value="year" '+(view==='year'?'selected':'')+'>Ano</option></select><select data-action="calendar-filter"><option value="all">Todos</option><option value="club" '+(session.calendarFilter==='club'?'selected':'')+'>Clube</option><option value="national" '+(session.calendarFilter==='national'?'selected':'')+'>Seleção</option><option value="league" '+(session.calendarFilter==='league'?'selected':'')+'>Liga</option><option value="cup" '+(session.calendarFilter==='cup'?'selected':'')+'>Copas</option><option value="continental" '+(session.calendarFilter==='continental'?'selected':'')+'>Continental</option></select></div></div><div class="calendar-summary"><span><strong>'+events.filter(f=>!f.played&&!f.cancelled).length+'</strong> jogos restantes</span><span><strong>'+events.filter(f=>f.drawStatus==='provisional'&&!f.cancelled).length+'</strong> dependem de sorteio</span><span><strong>'+events.filter(f=>f.played).length+'</strong> concluídos</span></div>'+body;
}

function openCalendarDay(key){const items=allCareerEvents().filter(event=>dateKey(event.date)===key);const date=new Date(key+'T12:00:00');showModal(new Intl.DateTimeFormat('pt-BR',{dateStyle:'full'}).format(date),items.length?'<div class="day-event-list">'+items.map(event=>'<article><img src="./'+escapeHtml(event.opponent.badge)+'" alt=""><div><strong>'+escapeHtml(event.competitionName)+'</strong><span>'+escapeHtml(event.opponent.name)+' · '+(event.stage||'Rodada '+event.round)+'</span><small>'+(event.drawStatus==='provisional'?'Adversário e horário sujeitos ao sorteio':event.home?'Em casa':'Fora de casa')+'</small></div></article>').join('')+'</div>':'<p>Dia livre para recuperação, treino, scouting e compromissos administrativos.</p>');}

function latestMatchAnalysis(){
  const report=session.career.matchReports?.[0];if(!report)return '';
  const causes=(report.signals||[]).map(item=>'<li><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.detail)+'</span></li>').join('');
  const players=(report.performers||[]).slice(0,3).map(item=>'<div><span>'+escapeHtml(item.name)+'</span><strong>'+Number(item.rating).toFixed(1)+'</strong></div>').join('');
  return '<section class="panel saved-match-analysis"><header><div><p class="eyebrow">ÚLTIMA ANÁLISE · MOTOR '+escapeHtml(report.engineVersion||MATCH_ENGINE_V2_VERSION)+'</p><h2>'+escapeHtml(report.opponent)+' · '+escapeHtml(report.score)+'</h2></div><span class="tag">'+escapeHtml(report.result||'partida')+'</span></header><p>'+escapeHtml(report.verdict||'Relatório de desempenho disponível.')+'</p><div class="analysis-numbers"><span>xG <strong>'+Number(report.ownXg||0).toFixed(1)+'–'+Number(report.opponentXg||0).toFixed(1)+'</strong></span><span>Posse <strong>'+Number(report.ownPossession||0)+'%</strong></span></div>'+(causes?'<ul class="causal-list">'+causes+'</ul>':'')+(players?'<div class="saved-ratings">'+players+'</div>':'')+'</section>';
}

function renderMatchCenter() {
  const next=nextFixture(),candidate=String(next?.opponent?.stadium||''),stadium=/\.(?:avif|webp|png|jpe?g)$/i.test(candidate)?candidate:'assets/placeholders/stadium-generic.jpg';
  return sectionHead('Centro de partida','Prepare escalação, formação e estratégia antes do apito inicial.')+(next?'<div class="match-prep"><article class="panel match-poster" style="background-image:linear-gradient(rgba(5,12,22,.58),rgba(5,12,22,.88)),url(\'./'+escapeHtml(stadium)+'\')"><span class="competition-pill competition-pill-logo">'+competitionLogo(next.competitionId,next.competitionName,'competition-pill-image')+'<b>'+escapeHtml(next.competitionName)+'</b></span><div class="versus-row large"><div><img src="./'+escapeHtml(session.career.club.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(session.career.club.name)+'</strong></div><b>VS</b><div><img src="./'+escapeHtml(next.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(next.opponent.name)+'</strong></div></div><p>'+formatDate(next.date)+' · '+(next.home?'Em casa':'Fora de casa')+'</p><button class="btn btn-primary action-with-icon matchday-action" data-action="start-match">'+iconSvg('play')+'<span>Entrar em campo</span></button></article><article class="panel match-plan-card"><span class="match-plan-icon">'+iconSvg('tactics')+'</span><h2>Plano de jogo</h2><p><strong>'+session.career.tactics.formation+'</strong> · '+escapeHtml(session.career.tactics.mentality)+'</p><p>Pressão '+session.career.tactics.pressure+' · Ritmo '+session.career.tactics.tempo+'</p><p>'+session.career.lineupIds.length+' titulares confirmados.</p><button class="btn action-with-icon tactics-action" data-action="navigate" data-screen="tactics">'+iconSvg('tactics')+'<span>Ajustar tática</span></button></article></div>':'<div class="panel empty-state"><strong>Temporada concluída</strong><span>Consulte o resumo e avance para a próxima época.</span></div>')+latestMatchAnalysis();
}

function renderTraining() {
  const c=session.career, trained=c.lastTrainingWeek===c.week,health=rosterHealthSummary(c.roster);
  const plans=[['recovery','Recuperação','Reduz carga e acelera o retorno'],['tactical','Tático','Entrosamento, decisões e organização'],['intensity','Alta intensidade','Evolução física com maior risco'],['finishing','Finalização','Ataque, técnica e confiança'],['setpieces','Bola parada','Posicionamento e execução']];
  const development=c.roster.filter(player=>player.age<=25).sort((a,b)=>b.potential-b.overall-(a.potential-a.overall)).slice(0,10).map(player=>'<div class="development-row"><span><strong>'+escapeHtml(player.name)+'</strong><small>'+player.pos+' · GER '+player.overall+' · POT '+player.potential+'</small></span><select data-action="individual-focus" data-player="'+player.id+'">'+options(['Equilibrado','Físico','Técnica','Passe','Finalização','Defesa'],c.individualTraining[player.id]||'Equilibrado')+'</select><em>'+escapeHtml(player.personality)+'</em></div>').join('');
  const academy=c.youthPlayers.map(player=>'<div class="academy-player"><span class="pos-tag">'+player.pos+'</span><strong>'+escapeHtml(player.name)+'</strong><small>'+player.age+' anos · GER '+player.overall+' · POT '+player.potential+'</small><button class="btn btn-small" data-action="promote-youth" data-player="'+player.id+'">Promover</button></div>').join('');
  const bulletin=health.injured.map(player=>'<div class="medical-player"><span>'+playerPortrait(player,'small')+'<strong>'+escapeHtml(player.name)+'</strong></span><em>'+escapeHtml(player.injury.type)+'</em><b>'+player.injury.daysRemaining+' dias</b></div>').join('');
  return sectionHead('Centro de performance','Microciclo, desenvolvimento individual, carga, medicina e academia.','<span class="tag">Físico '+health.fitness+'%</span>')+'<section class="performance-command panel"><div><span>Disponíveis<strong>'+health.available+'</strong></span><span>No departamento médico<strong>'+health.injured.length+'</strong></span><span>Sobrecarga<strong>'+health.overloaded.length+'</strong></span><span>Entrosamento<strong>'+health.chemistry+'%</strong></span></div>'+(bulletin?'<article><h3>Boletim médico</h3>'+bulletin+'</article>':'<article class="medical-clear"><strong>Elenco sem lesões</strong><small>Controle a carga para manter a disponibilidade.</small></article>')+'</section><div class="facility-summary"><span>Centro de treino <strong>Nível '+c.facilities.training+'</strong></span><span>Base <strong>Nível '+c.facilities.youth+'</strong></span><span>Medicina <strong>Nível '+c.facilities.medical+'</strong></span></div><div class="training-grid">'+plans.map(([id,name,effect])=>'<button class="training-card" data-action="apply-training" data-plan="'+id+'" '+(trained?'disabled':'')+'><span>◎</span><strong>'+name+'</strong><small>'+effect+'</small></button>').join('')+'</div>'+(trained?'<div class="notice success">O treino desta semana já foi aplicado.</div>':'')+'<div class="performance-layout"><article class="panel"><h2>Planos individuais</h2>'+development+'</article><article class="panel"><header class="academy-head"><div><h2>Academia</h2><p>Captação influenciada pela instalação de base.</p></div><button class="btn btn-primary btn-small" data-action="youth-intake" '+(c.youthIntakeSeason===c.season?'disabled':'')+'>Nova geração</button></header><div class="academy-list">'+(academy||'<p class="muted">A avaliação anual da base ainda não foi realizada.</p>')+'</div></article></div>';
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
  const c=session.career,payroll=c.roster.reduce((sum,p)=>sum+Number(p.salary||0)*1000,0),future=(c.transferObligations||[]).reduce((sum,item)=>sum+Number(item.remainingBalance||0),0);
  const cards=session.market.map(p=>'<article class="market-card"><div class="market-player">'+playerPortrait(p,'medium')+'<div><strong>'+escapeHtml(p.name)+'</strong><small>'+escapeHtml(p.pos)+' · '+p.age+' anos · '+escapeHtml(p.sourceClub||'')+'</small><em>'+escapeHtml(p.personality)+'</em></div></div><div class="market-value"><span>GER <strong>'+p.overall+'</strong></span><span>'+money(p.value*1000000)+'</span><small>Conhecimento '+p.knowledge+'%</small></div><div class="market-actions"><button class="btn btn-small" data-action="player-report" data-player="'+escapeHtml(p.id)+'">Relatório</button><button class="btn btn-small" data-action="loan-player" data-player="'+escapeHtml(p.id)+'">Empréstimo</button><button class="btn btn-primary btn-small" data-action="buy-player" data-player="'+escapeHtml(p.id)+'">Negociar</button></div></article>').join('');
  return sectionHead('Mercado internacional','Atletas nominais da base 2026, filtrados por desempenho e valor.','<span class="tag">'+money(c.budget)+'</span>')+'<div class="market-budget-strip"><span>Caixa <strong>'+money(c.budget)+'</strong></span><span>Folha <strong>'+money(payroll)+' / '+money(c.transferPolicy.wageBudget)+'</strong></span><span>Parcelas futuras <strong>'+money(future)+'</strong></span><span>Vagas <strong>'+c.roster.length+' / '+c.transferPolicy.maxSquad+'</strong></span></div><div class="market-grid">'+(session.marketLoading?'<div class="panel">Carregando rede mundial…</div>':cards||'<div class="panel">Nenhuma oportunidade disponível.</div>')+'</div>';
}

function renderFacilitiesCampus(c){const buildings=[['stadium','Estádio','Arena'],['training','Treinamento','CT'],['youth','Academia','Base'],['medical','Medicina','DM'],['scouting','Scouting','Scout'],['commercial','Comercial','Sede']];return '<section class="club-campus panel"><header><div><p class="eyebrow">CAMPUS DO CLUBE</p><h2>Instalações interativas</h2></div><small>Toque em um prédio para evoluir</small></header><div class="campus-scene"><div class="campus-road"></div>'+buildings.map(([id,name,label],index)=>'<button class="campus-building building-'+id+' level-'+c.facilities[id]+'" data-action="upgrade-facility" data-facility="'+id+'" style="--building-index:'+index+'"><span>'+label+'</span><strong>'+name+'</strong><small>Nível '+c.facilities[id]+'/5</small></button>').join('')+'</div></section>';}

function renderSponsorPanel(c){if(!c.sponsor&&!c.sponsorOffers.length)c.sponsorOffers=generateSponsorOffers(c.club,c.facilities);if(c.sponsor)return '<article class="panel sponsor-panel"><p class="eyebrow">PARCEIRO PRINCIPAL</p><h2>'+escapeHtml(c.sponsor.name)+'</h2><div class="world-metric-grid"><div><span>Contrato</span><strong>'+c.sponsor.years+' anos</strong></div><div><span>Receita anual</span><strong>'+money(c.sponsor.annual)+'</strong></div><div><span>Bônus por vitória</span><strong>'+money(c.sponsor.winBonus)+'</strong></div><div><span>Bônus por título</span><strong>'+money(c.sponsor.titleBonus)+'</strong></div></div></article>';return '<article class="panel sponsor-panel"><p class="eyebrow">NEGOCIAÇÃO COMERCIAL</p><h2>Propostas de patrocínio</h2><div class="sponsor-offers">'+c.sponsorOffers.map(offer=>'<div><strong>'+escapeHtml(offer.name)+'</strong><span>'+money(offer.annual)+'/ano · '+offer.years+' anos</span><small>Título: '+money(offer.titleBonus)+'</small><button class="btn btn-small btn-primary" data-action="accept-sponsor" data-sponsor="'+offer.id+'">Assinar</button></div>').join('')+'</div></article>';}

function renderClub() {
  const c=session.career,payroll=c.roster.reduce((sum,p)=>sum+p.salary*1000,0),value=c.roster.reduce((sum,p)=>sum+p.value*1000000,0);
  const ledger=c.ledger.slice().reverse().map(item=>'<tr><td>'+formatDate(item.date)+'</td><td>'+escapeHtml(item.label)+'</td><td class="'+(item.amount>=0?'positive':'negative')+'">'+(item.amount>=0?'+':'')+money(item.amount)+'</td></tr>').join('');
  const facilityNames={training:'Centro de treinamento',youth:'Academia de base',medical:'Departamento médico',scouting:'Rede de observação',stadium:'Estádio e matchday',commercial:'Centro comercial'};
  const offers=c.jobOffers.length?'<article class="panel job-offers"><h2>Propostas de trabalho</h2><p class="muted">Ofertas liberadas pela reputação conquistada na última temporada.</p>'+c.jobOffers.map(club=>'<div class="staff-row"><span><strong>'+escapeHtml(club.name)+'</strong><small>'+escapeHtml(club.leagueName)+' · GER VFM '+club.rating+'</small></span><img class="job-club-badge" src="./'+escapeHtml(club.badge)+'" alt="" onerror="__vfmFallback(event)"><button class="btn btn-small btn-primary" data-action="accept-club-job" data-club="'+escapeHtml(club.id)+'">Aceitar</button></div>').join('')+'</article>':'';
  return sectionHead('Gestão total do clube','Finanças, diretoria, instalações, patrocínio e carreira executiva.')+'<div class="world-metric-grid club-metrics"><div><span>Saldo</span><strong>'+money(c.budget)+'</strong></div><div><span>Folha mensal</span><strong>'+money(payroll)+'</strong></div><div><span>Valor do elenco</span><strong>'+money(value)+'</strong></div><div><span>Diretoria</span><strong>'+c.board+'%</strong></div></div>'+renderFacilitiesCampus(c)+renderSponsorPanel(c)+'<div class="club-admin-grid"><article class="panel"><h2>Comissão técnica</h2>'+Object.entries(c.staff).map(([id,rating])=>'<div class="staff-row"><span>'+({assistant:'Auxiliar',fitnessCoach:'Preparador físico',scout:'Chefe de scout',medical:'Departamento médico'})[id]+'</span><strong>'+rating+'</strong><button class="btn btn-small" data-action="upgrade-staff" data-staff="'+id+'">Melhorar</button></div>').join('')+'</article><article class="panel"><h2>Instalações e obras</h2>'+Object.entries(c.facilities).map(([id,level])=>'<div class="staff-row"><span>'+facilityNames[id]+'</span><strong>Nível '+level+'/5</strong><button class="btn btn-small" data-action="upgrade-facility" data-facility="'+id+'" '+(level>=5?'disabled':'')+'>Evoluir</button></div>').join('')+'</article><article class="panel"><h2>Carreira do treinador</h2><p><strong>Nível '+c.manager.level+'</strong> · '+escapeHtml(c.manager.license)+'</p><p>'+c.manager.xp+' XP · '+c.manager.awards.length+' prêmio(s)</p><ul class="objective-list">'+c.manager.awards.slice(-4).map(a=>'<li>'+escapeHtml(a)+'</li>').join('')+'</ul></article><article class="panel"><h2>Objetivos da diretoria</h2><div class="board-objectives">'+c.boardObjectives.map(objective=>'<div class="board-objective '+objective.status+'"><span><strong>'+escapeHtml(objective.label)+'</strong><small>'+Math.min(objective.progress,objective.target)+' / '+objective.target+' '+escapeHtml(objective.unit)+'</small></span><i><em style="width:'+clamp(objective.progress/objective.target*100,0,100)+'%"></em></i><b>'+(objective.status==='complete'?'✓':'+'+objective.reward)+'</b></div>').join('')+'</div></article>'+offers+'</div><div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Movimentação</th><th>Valor</th></tr></thead><tbody>'+ledger+'</tbody></table></div>';
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

function renderMore() {
  const c=session.career,unread=c.messages.filter(message=>!message.read).length;
  const items=[
    ['competitions','trophy','Competições','Tabelas, fases e líderes mundiais'],
    ['calendar','calendar','Agenda','Semana, mês e temporada'],
    ['training','training','Treino','Planos, evolução e academia'],
    ['market','market','Mercado','Contratações e empréstimos'],
    ['club','club','Clube','Finanças, estrutura e equipe'],
    ['inbox','inbox','Mensagens',unread?unread+' não '+(unread===1?'lida':'lidas'):'Tudo lido'],
    ['national','national','Seleção',c.national?c.national.team.name:'Oportunidades internacionais'],
    ['settings','settings','Ajustes','Salvar, importar e acessibilidade']
  ];
  return sectionHead('Mais','Os recursos menos frequentes ficam organizados em um só lugar.')+
    '<div class="more-grid">'+items.map(([screen,icon,label,description])=>'<button class="more-card" data-action="navigate" data-screen="'+screen+'"><span>'+iconSvg(icon)+'</span><div><strong>'+escapeHtml(label)+'</strong><small>'+escapeHtml(description)+'</small></div><b aria-hidden="true">'+iconSvg('chevron')+'</b></button>').join('')+'</div>';
}

function renderSettings() {
  return sectionHead('Ajustes e carreira','Preferências, proteção do save e retorno ao menu.')+'<div class="settings-grid"><article class="panel"><h2>Preferências</h2><label class="switch-row"><span>Reduzir animações</span><input type="checkbox" data-action="reduced-motion" '+(store.settings.reducedMotion?'checked':'')+'></label><p class="muted">O jogo agora funciona em retrato e paisagem. Use a posição mais confortável para cada tela.</p></article><article class="panel"><h2>Carreira</h2><p class="muted">Um backup local é preservado antes de cada nova gravação.</p><button class="btn" data-action="save">Salvar agora</button><button class="btn" data-action="export-save">Exportar save</button><button class="btn" data-action="choose-import-save">Importar save</button><input id="save-import" class="visually-hidden" type="file" accept="application/json,.json" data-action="import-save"><button class="btn btn-danger" data-action="exit-career">Salvar e sair</button></article></div>';
}

function navigate(screen,push=true) {
  if(!session.career){renderCover();return;}
  if(screen!=='match')stopMatchTimer();
  session.screen=screen;
  if(push)history.pushState({screen},'', '#/'+screen);
  const renderers={dashboard:renderDashboard,squad:renderSquad,tactics:renderTactics,'match-center':renderMatchCenter,more:renderMore,competitions:renderCompetitions,calendar:renderCalendar,training:renderTraining,market:renderMarket,club:renderClub,inbox:renderInbox,national:renderNational,settings:renderSettings};
  renderGame((renderers[screen]||renderDashboard)());
  if(screen==='market')loadMarket();
}

function lineupFor(roster,ids) { return ids.map(id=>roster.find(p=>p.id===id)).filter(player=>player&&isPlayerAvailable(player)).slice(0,11); }

async function startMatch(source='club') {
  const c=session.career;
  const national=source==='national' ? c.national : null;
  const fixture=national ? national.fixtures.find(f=>!f.played&&!f.locked) : nextFixture();
  if(!fixture){toast('Não há partida disponível.','error');return;}
  if(!national){
    const elapsed=Math.max(0,Math.floor((new Date(fixture.date)-new Date(c.date))/86400000));
    const recovery=advanceRosterDays(c.roster,elapsed,{medicalLevel:c.facilities.medical,fitnessCoach:c.staff.fitnessCoach});
    c.date=fixture.date;repairCareerLineup(c);
    if(recovery.recovered.length)c.messages.push({id:'medical-clearance-'+Date.now(),from:'Departamento médico',subject:'Atletas liberados',body:recovery.recovered.join(', ')+' '+(recovery.recovered.length===1?'voltou':'voltaram')+' a ficar disponível(is) para a comissão técnica.',date:new Date().toISOString(),read:false,priority:'normal'});
  }
  let opponentRoster=[];
  if(fixture.opponent.rosterPath){try{opponentRoster=(await fetchJson(fixture.opponent.rosterPath)).players.map(normalizePlayer);}catch{}}
  const ownRoster=national?national.roster:c.roster, ownIds=national?national.lineupIds:c.lineupIds;
  let ownLineup=lineupFor(ownRoster,ownIds);
  if(ownLineup.length<11){ownLineup=selectBestLineup(ownRoster,national?'4-3-3':c.tactics.formation);if(national)national.lineupIds=ownLineup.map(player=>player.id);else c.lineupIds=ownLineup.map(player=>player.id);}
  if(ownLineup.length<11){toast('Não há onze atletas disponíveis. Revise lesões e suspensões.','error');persist();return;}
  const selectedIds=new Set(ownLineup.map(player=>player.id)),ownBench=ownRoster.filter(player=>!selectedIds.has(player.id)&&isPlayerAvailable(player)).sort((a,b)=>effectiveOverall(b,b.pos)-effectiveOverall(a,a.pos)).slice(0,12).map(player=>({...player,attributes:{...(player.attributes||{})}}));
  const ownTeam=national?national.team:c.club;
  const engine=createMatchEngineV2({
    seed:stableNumber(fixture.id+':'+c.season+':'+c.club.id),ownHome:Boolean(fixture.home),ownName:ownTeam.name,opponentName:fixture.opponent.name,
    ownLineup,opponentLineup:opponentRoster.length?selectBestLineup(opponentRoster,'4-2-3-1'):[],opponentRating:fixture.opponent.rating,ownTactics:c.tactics
  });
  session.match={source,fixture,...engine,speed:1,running:false,tacticalOpen:false,tacticalWasRunning:false,liveSelectedPlayer:null,substitutionsUsed:0,maxSubstitutions:5,substitutionHistory:[],substitutedOut:[],ownBench,tacticalPositions:(c.tacticalPositions||FORMATIONS[c.tactics.formation]||FORMATIONS['4-3-3']).map(point=>[...point]),coachInsight:'O jogo começa equilibrado. Observe posse, desgaste e qualidade das chances.'};
  session.matchEventFilter='all';
  persist();session.screen='match';history.pushState({screen:'match'},'','#/match');renderMatch();
}

function teamOnHome() { return session.match.fixture.home; }

function matchTeams() {
  const m=session.match,c=session.career;
  const own=m.source==='national'?c.national.team:c.club;
  return m.fixture.home?{home:own,away:m.fixture.opponent}:{home:m.fixture.opponent,away:own};
}

function pitchPlayers() {
  const m=session.match,coords=m.tacticalPositions||FORMATIONS[m.ownTactics.formation]||FORMATIONS['4-3-3'];
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

function liveTacticsPanel(){
  const m=session.match;if(!m?.tacticalOpen)return '';
  const starters=m.ownLineup.map(player=>'<button class="live-player '+positionClass(player.pos)+' '+(m.liveSelectedPlayer===player.id?'selected':'')+'" draggable="true" data-action="live-player-select" data-live-player="'+escapeHtml(player.id)+'" data-live-kind="starter">'+playerPortrait(player,'small')+'<span class="live-position">'+escapeHtml(player.pos)+'</span><strong>'+escapeHtml(player.name)+'</strong><em>'+Number(m.playerPerformance?.[player.id]?.rating||6.2).toFixed(1)+'</em><small>Físico '+Math.round(player.fitness)+'%</small></button>').join('');
  const bench=m.ownBench.map(player=>'<button class="live-player '+positionClass(player.pos)+' '+(m.liveSelectedPlayer===player.id?'selected':'')+'" draggable="true" data-action="live-player-select" data-live-player="'+escapeHtml(player.id)+'" data-live-kind="bench">'+playerPortrait(player,'small')+'<span class="live-position">'+escapeHtml(player.pos)+'</span><strong>'+escapeHtml(player.name)+'</strong><em>'+player.overall+'</em><small>Físico '+Math.round(player.fitness)+'%</small></button>').join('');
  const impact=tacticalImpact(m.ownTactics),shoutReady=Number(m.lastShoutMinute??-20)+12<=m.minute;
  return `<section class="live-tactics-drawer"><header><div><small>PAUSA TÁTICA · ${m.minute}’ · MOTOR ${MATCH_ENGINE_V2_VERSION}</small><h2>Alterações durante a partida</h2></div><button class="btn btn-primary action-with-icon" data-action="close-live-tactics">${iconSvg('tactics')}<span>Aplicar e voltar</span></button></header><div class="live-tactics-grid"><article><h3>Em campo · nota ao vivo</h3><div class="live-player-list">${starters}</div></article><article><h3>Banco · ${m.substitutionsUsed}/${m.maxSubstitutions} substituições</h3><div class="live-player-list bench">${bench}</div></article><article class="live-instructions"><h3>Plano de jogo</h3><div class="live-impact-summary"><span>Ataque <b>${impact.attack}</b></span><span>Controle <b>${impact.control}</b></span><span>Defesa <b>${impact.defense}</b></span><span>Desgaste <b>${impact.risk}</b></span></div><label>Formação<select data-action="live-formation">${options(Object.keys(FORMATIONS),m.ownTactics.formation)}</select></label><label>Mentalidade<select data-action="live-mentality">${options(['Defensiva','Equilibrada','Ofensiva'],m.ownTactics.mentality)}</select></label><label>Construção<select data-action="live-passing">${options(['Curto','Misto','Direto'],m.ownTactics.passing)}</select></label><label>Transição<select data-action="live-transition">${options(['Reagrupar','Equilibrada','Contra-atacar'],m.ownTactics.transition)}</select></label><label>Marcação<select data-action="live-marking">${options(['Zona','Individual','Híbrida'],m.ownTactics.marking)}</select></label><label>Pressão <output>${m.ownTactics.pressure}</output><input type="range" min="20" max="90" value="${m.ownTactics.pressure}" data-action="live-pressure"></label><label>Ritmo <output>${m.ownTactics.tempo}</output><input type="range" min="20" max="90" value="${m.ownTactics.tempo}" data-action="live-tempo"></label><label>Largura <output>${m.ownTactics.width}</output><input type="range" min="25" max="85" value="${m.ownTactics.width}" data-action="live-width"></label><label>Linha defensiva <output>${m.ownTactics.defensiveLine}</output><input type="range" min="20" max="85" value="${m.ownTactics.defensiveLine}" data-action="live-line"></label><div class="quick-instructions"><button class="plan-protect" data-action="live-preset" data-preset="protect">Segurar</button><button class="plan-control" data-action="live-preset" data-preset="control">Controlar</button><button class="plan-attack" data-action="live-preset" data-preset="attack">Buscar gol</button><button class="plan-counter" data-action="live-preset" data-preset="counter">Contra-atacar</button></div><div class="touchline-shouts"><span>À beira do campo</span><button data-action="live-shout" data-shout="encourage" ${shoutReady?'':'disabled'}>Incentivar</button><button data-action="live-shout" data-shout="focus" ${shoutReady?'':'disabled'}>Pedir foco</button><button data-action="live-shout" data-shout="calm" ${shoutReady?'':'disabled'}>Acalmar</button></div><p>Os efeitos são calculados minuto a minuto. Gritos têm intervalo de 12 minutos.</p></article></div></section>`;
}

function selectLivePlayer(playerId){const m=session.match;if(!m)return;if(m.liveSelectedPlayer&&m.liveSelectedPlayer!==playerId){const first=m.liveSelectedPlayer;m.liveSelectedPlayer=null;makeLiveSwap(first,playerId);}else{m.liveSelectedPlayer=playerId;renderMatch();}}

function makeLiveSwap(firstId,secondId){const m=session.match;if(!m)return;const firstStarter=m.ownLineup.findIndex(player=>player.id===firstId),secondStarter=m.ownLineup.findIndex(player=>player.id===secondId),firstBench=m.ownBench.findIndex(player=>player.id===firstId),secondBench=m.ownBench.findIndex(player=>player.id===secondId);if(firstStarter>=0&&secondStarter>=0){[m.ownLineup[firstStarter],m.ownLineup[secondStarter]]=[m.ownLineup[secondStarter],m.ownLineup[firstStarter]];m.events.push({minute:m.minute,type:'tactical',text:'A equipe reorganiza funções e posicionamento.'});renderMatch();return;}const starterIndex=firstStarter>=0?firstStarter:secondStarter,benchIndex=firstBench>=0?firstBench:secondBench;if(starterIndex<0||benchIndex<0)return;if(m.substitutionsUsed>=m.maxSubstitutions)return toast('Limite de substituições atingido.','error');const outgoing=m.ownLineup[starterIndex],incoming=m.ownBench[benchIndex];m.ownLineup[starterIndex]=incoming;m.ownBench.splice(benchIndex,1);m.substitutedOut.push(outgoing);m.substitutionsUsed++;m.substitutionHistory.push({minute:m.minute,out:outgoing.name,in:incoming.name});applyMatchSubstitutionV2(m,outgoing,incoming);m.events.push({minute:m.minute,type:'tactical',text:'SUBSTITUIÇÃO: sai '+outgoing.name+', entra '+incoming.name+'.'});renderMatch();toast(incoming.name+' entrou no lugar de '+outgoing.name+'.','success');}

function bindMatchControls(){
  const root=app.querySelector('.world-match');if(!root)return;
  const directActions=new Set(['toggle-match','match-speed','finish-match','open-live-tactics','close-live-tactics','live-player-select','live-preset','live-shout','match-event-filter','exit-match']);
  root.querySelectorAll('[data-action]').forEach(target=>{if(!directActions.has(target.dataset.action))return;target.onclick=event=>{event.stopPropagation();handleAction(target.dataset.action,target);};});
}

function matchInsight(m){
  const ownHome=teamOnHome(),ownXg=ownHome?m.xgHome:m.xgAway,oppXg=ownHome?m.xgAway:m.xgHome,fitness=Math.round(average(m.ownLineup.map(player=>player.fitness)));
  if(fitness<68)return 'O time perdeu intensidade. Faça substituições ou reduza pressão e ritmo.';
  if(oppXg-ownXg>.45)return 'O adversário cria chances melhores. Proteja a entrada da área ou recue a linha.';
  if(ownXg-oppXg>.45)return 'Seu plano está criando as melhores oportunidades. Mantenha a estrutura.';
  if(m.minute>60&&m.opponentPlan==='Ofensivo')return 'O adversário avançou as linhas. Há espaço para contra-atacar.';
  if((ownHome&&m.possessionHome>58)||(!ownHome&&m.possessionHome<42))return 'Você controla a posse, mas precisa transformar domínio em finalizações.';
  return 'Partida equilibrada. Ritmo, pressão e desgaste explicam a variação das chances.';
}

function renderMatch() {
  const m=session.match,teams=matchTeams();
  const visibleEvents=m.events.filter(event=>session.matchEventFilter==='all'||event.type===session.matchEventFilter),commentary=visibleEvents.slice().reverse().slice(0,14).map(e=>'<li class="event-'+escapeHtml(e.type||'info')+'"><strong>'+e.minute+'’</strong><span>'+escapeHtml(e.text)+(e.reason?'<small>'+escapeHtml(e.reason)+(e.xg?' · xG '+Number(e.xg).toFixed(2):'')+'</small>':'')+'</span></li>').join('');
  const ownHome=teamOnHome(),fitness=Math.round(average(m.ownLineup.map(player=>player.fitness))),momentum=ownHome?m.momentum:100-m.momentum;m.coachInsight=matchInsight(m);
  const filters=[['all','Todos'],['goal','Gols'],['chance','Chances'],['tactical','Tática']].map(([id,label])=>'<button class="'+(session.matchEventFilter===id?'active':'')+'" data-action="match-event-filter" data-filter="'+id+'">'+label+'</button>').join('');
  const phase=m.minute<16?'Estudo inicial':m.minute<31?'Construção':m.minute<46?'Disputa territorial':m.minute<61?'Ajustes':m.minute<76?'Decisão':'Pressão final';
  const passHome=m.passesHome?Math.round(m.completedPassesHome/m.passesHome*100):0,passAway=m.passesAway?Math.round(m.completedPassesAway/m.passesAway*100):0;
  const ownIds=new Set([...m.ownLineup,...(m.substitutedOut||[])].map(player=>player.id));
  const topPlayers=Object.values(m.playerPerformance||{}).filter(item=>ownIds.has(item.id)).sort((a,b)=>b.rating-a.rating).slice(0,3).map(item=>'<div><span>'+escapeHtml(item.name)+'</span><strong>'+Number(item.rating).toFixed(1)+'</strong><small>'+item.goals+' gol · '+item.assists+' assistência</small></div>').join('');
  const signals=(m.tacticalSignals||[]).slice(-3).reverse().map(item=>'<li class="'+(item.side===(ownHome?'home':'away')?'positive':'warning')+'"><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.detail)+'</span></li>').join('');
  app.innerHTML=`<main class="screen match-screen world-match" onclick="window.__vfmMatchAction(event)"><header class="match-scoreboard"><div><img src="./${escapeHtml(teams.home.badge)}" alt="" onerror="__vfmFallback(event)"><strong>${escapeHtml(teams.home.name)}</strong></div><span class="score">${m.homeGoals} · ${m.awayGoals}</span><span class="clock">${m.minute}’<small>${phase}</small></span><div><strong>${escapeHtml(teams.away.name)}</strong><img src="./${escapeHtml(teams.away.badge)}" alt="" onerror="__vfmFallback(event)"></div></header><section class="match-world-layout"><aside class="match-side commentary-panel"><div class="match-engine-label">MOTOR ${MATCH_ENGINE_V2_VERSION} · DETERMINÍSTICO</div><h2>Momentos-chave</h2><div class="event-filters">${filters}</div><ul class="commentary-list">${commentary||'<li><span>Nenhum evento neste filtro.</span></li>'}</ul>${signals?`<h3>Por que aconteceu</h3><ul class="causal-list">${signals}</ul>`:''}</aside><div class="visual-pitch" aria-label="Campo com vinte e dois jogadores"><div class="pitch-markings"></div><span class="match-competition-mark">${competitionLogo(m.fixture.competitionId,m.fixture.competitionName,'match-competition-image')}</span><div class="pressure-map"><i style="opacity:${m.possessionHome/100}"></i><b style="opacity:${(100-m.possessionHome)/100}"></b></div>${pitchPlayers()}<div class="match-ball" style="left:${m.ball.x}%;top:${m.ball.y}%"></div><div class="momentum-meter"><span>Pressão do seu time</span><i><em style="width:${momentum}%"></em></i><b>${Math.round(momentum)}%</b></div></div><aside class="match-side stats-panel"><h2>Leitura da partida</h2><div class="coach-insight"><span>Auxiliar</span><p>${escapeHtml(m.coachInsight)}</p></div><div class="stat-row"><strong>${m.possessionHome}%</strong><span>Posse</span><strong>${100-m.possessionHome}%</strong></div><div class="stat-row"><strong>${m.shotsHome} (${m.shotsOnTargetHome})</strong><span>Finalizações (alvo)</span><strong>${m.shotsAway} (${m.shotsOnTargetAway})</strong></div><div class="stat-row"><strong>${m.xgHome.toFixed(1)}</strong><span>xG</span><strong>${m.xgAway.toFixed(1)}</strong></div><div class="stat-row"><strong>${passHome}%</strong><span>Precisão de passe</span><strong>${passAway}%</strong></div><div class="stat-row"><strong>${m.cornersHome||0}</strong><span>Escanteios</span><strong>${m.cornersAway||0}</strong></div><div class="stat-row"><strong>${m.cardsHome||0}</strong><span>Cartões</span><strong>${m.cardsAway||0}</strong></div><div class="stat-row"><strong>${fitness}%</strong><span>Físico / plano rival</span><strong>${escapeHtml(m.opponentPlan)}</strong></div><div class="tactic-live"><span>Formação</span><strong>${escapeHtml(m.ownTactics.formation)}</strong><span>Mentalidade</span><strong>${escapeHtml(m.ownTactics.mentality)}</strong><span>Substituições</span><strong>${m.substitutionsUsed}/${m.maxSubstitutions}</strong></div>${topPlayers?`<div class="live-ratings"><h3>Melhores notas</h3>${topPlayers}</div>`:''}</aside></section><footer class="match-controls"><button class="btn" data-action="exit-match">Sair</button>${m.finished?'<button class="btn btn-primary" data-action="finish-match">Análise pós-jogo</button>':`<button class="btn" data-action="open-live-tactics">Tática e substituições</button><button class="btn btn-primary" data-action="toggle-match">${m.running?'Pausar':'Começar'}</button><button class="btn ${m.speed===1?'active':''}" data-action="match-speed" data-speed="1">1×</button><button class="btn ${m.speed===3?'active':''}" data-action="match-speed" data-speed="3">3×</button><button class="btn ${m.speed===6?'active':''}" data-action="match-speed" data-speed="6">6×</button>`}</footer>${liveTacticsPanel()}</main>`;bindMatchControls();
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
  advanceMatchEngineV2(m,m.speed);
  if(m.finished){clearInterval(session.matchTimer);session.matchTimer=null;}
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
  if(fixture.played)return;
  const ownGoals=teamOnHome()?m.homeGoals:m.awayGoals,oppGoals=teamOnHome()?m.awayGoals:m.homeGoals;
  const engineReport=m.postMatchReport||buildMatchReport(m);
  fixture.played=true;fixture.score={home:m.homeGoals,away:m.awayGoals};fixture.engineReport={...engineReport,signals:engineReport.signals?.slice(0,3),performers:engineReport.performers?.slice(0,5)};
  c.matchReports=Array.isArray(c.matchReports)?c.matchReports:[];c.matchReports.unshift({fixtureId:fixture.id,date:fixture.date,competition:fixture.competitionName,opponent:fixture.opponent.name,score:ownGoals+'–'+oppGoals,...fixture.engineReport});c.matchReports=c.matchReports.slice(0,40);
  const knockout=fixture.type==='cup'||fixture.phase==='knockout'||fixture.type==='world';
  if(knockout&&ownGoals===oppGoals){const ownPens=3+stableNumber(c.club.id+':'+fixture.id+':'+c.season)%3,oppPens=2+stableNumber(fixture.opponent.id+':'+fixture.id+':'+c.season)%3,tied=ownPens===oppPens,adjustedOpp=tied?Math.max(2,oppPens-1):oppPens,winner=ownPens>adjustedOpp?c.club.name:fixture.opponent.name;fixture.score.penalties=teamOnHome()?{home:ownPens,away:adjustedOpp}:{home:adjustedOpp,away:ownPens};m.events.push({minute:90,text:'Decisão por pênaltis: '+ownPens+'–'+adjustedOpp+'. '+winner+' avança.'});}
  const advanced=resultClass(fixture)==='win';
  const targetStats=m.source==='national'?c.national.stats:c.stats;
  targetStats.played++;targetStats.gf+=ownGoals;targetStats.ga+=oppGoals;
  if(ownGoals>oppGoals){targetStats.wins++;targetStats.points+=3;c.manager.xp+=120;c.manager.reputation=clamp(c.manager.reputation+1,1,100);}
  else if(ownGoals===oppGoals){targetStats.draws++;targetStats.points++;c.manager.xp+=55;}
  else{targetStats.losses++;c.manager.xp+=25;if(m.source==='club')c.board=clamp(c.board-2,0,100);}
  c.manager.level=1+Math.floor(c.manager.xp/500);
  c.manager.license=managerLicense(c.manager.reputation);
  if(m.source==='club'){
    updateTableForMatch(fixture,ownGoals,oppGoals);c.week++;c.date=addDays(fixture.date,1);
    const outcome=ownGoals>oppGoals?'win':ownGoals<oppGoals?'loss':'draw',consequences=applyMatchConsequences(c.roster,m,{result:outcome,date:fixture.date,seed:fixture.id+':'+c.season});
    const health=rosterHealthSummary(c.roster);c.fitness=health.fitness;c.morale=Math.round(average(c.roster.map(player=>player.morale)));repairCareerLineup(c);
    if(consequences.injuries.length){const diagnosis=consequences.injuries.map(item=>item.name+' · '+item.type+' ('+item.daysRemaining+' dias)').join('; ');c.messages.push({id:'injury-'+Date.now(),from:'Departamento médico',subject:'Boletim médico pós-jogo',body:diagnosis,date:new Date().toISOString(),read:false,priority:'high'});fixture.engineReport.injuries=consequences.injuries;c.matchReports[0].injuries=consequences.injuries;}
    const matchRevenue=fixture.type==='continental'?2400000:fixture.type==='cup'?1200000:850000,stadiumRevenue=Math.round(matchRevenue*(1+(c.facilities.stadium-2)*.12)),sponsorBonus=advanced?Number(c.sponsor?.winBonus||0):0,revenue=stadiumRevenue+sponsorBonus;c.budget+=revenue;c.ledger.push({date:new Date().toISOString(),label:'Receita de jogo'+(sponsorBonus?' e bônus do patrocinador':'')+' · '+fixture.competitionName,amount:revenue,type:'income'});
    if(fixture.type==='cup'){if(advanced){const next=c.fixtures.find(f=>f.type==='cup'&&f.locked&&!f.cancelled);if(next)resolveCupDraw(next);}else cancelRemainingKnockout(fixture);}
    if(fixture.type==='continental'&&fixture.phase==='league'){
      const phase=c.fixtures.filter(f=>f.competitionId===fixture.competitionId&&f.phase==='league'),finished=phase.every(f=>f.played);
      if(finished){const points=phase.reduce((sum,item)=>sum+(resultClass(item)==='win'?3:resultClass(item)==='draw'?1:0),0),qualified=points>=Math.ceil(phase.length*1.25),next=c.fixtures.find(f=>f.competitionId===fixture.competitionId&&f.phase==='knockout'&&!f.cancelled);if(qualified&&next)resolveTournamentDraw(next);else c.fixtures.filter(f=>f.competitionId===fixture.competitionId&&f.phase==='knockout').forEach(f=>{f.cancelled=true;f.locked=true;});c.messages.push({id:'continental-phase-'+Date.now(),from:'Confederação continental',subject:qualified?'Classificação ao mata-mata':'Eliminação continental',body:qualified?'A campanha garantiu vaga nas oitavas; o sorteio foi realizado.':'A equipe não alcançou a pontuação de corte da fase inicial.',date:new Date().toISOString(),read:false,priority:'high'});}
    } else if(fixture.type==='continental'&&fixture.phase==='knockout') {if(advanced){const next=c.fixtures.find(f=>f.competitionId===fixture.competitionId&&f.phase==='knockout'&&f.locked&&!f.cancelled&&new Date(f.date)>new Date(fixture.date));if(next)resolveTournamentDraw(next);}else cancelRemainingKnockout(fixture);}
    if(c.stats.wins>=1)unlockAchievement('first-win','Primeira vitória','Conquiste sua primeira vitória como treinador principal.');
    if(c.stats.wins>=5)unlockAchievement('five-wins','Sequência de respeito','Alcance cinco vitórias na carreira.');
    if(oppGoals===0)unlockAchievement('clean-sheet','Muralha tática','Termine uma partida oficial sem sofrer gols.');
    if(m.substitutionsUsed>=3)unlockAchievement('active-manager','Leitura de jogo','Faça pelo menos três substituições durante uma partida.');
  } else {
    const n=c.national,playedQualifiers=n.fixtures.filter(f=>f.competitionId==='world-cup-qualifiers'&&f.played).length;
    const totalQualifiers=n.fixtures.filter(f=>f.competitionId==='world-cup-qualifiers').length;
    const nationalOutcome=ownGoals>oppGoals?'win':ownGoals<oppGoals?'loss':'draw',nationalConsequences=applyMatchConsequences(n.roster,m,{result:nationalOutcome,date:fixture.date,seed:'national:'+fixture.id+':'+c.season});
    n.lineupIds=selectBestLineup(n.roster,'4-3-3').map(player=>player.id);
    if(nationalConsequences.injuries.length)c.messages.push({id:'national-injury-'+Date.now(),from:'Departamento médico da seleção',subject:'Boletim médico pós-jogo',body:nationalConsequences.injuries.map(item=>item.name+' · '+item.type+' ('+item.daysRemaining+' dias)').join('; '),date:new Date().toISOString(),read:false,priority:'high'});
    c.date=addDays(fixture.date,1);
    if(playedQualifiers>=totalQualifiers){
      const pointsPerMatch={CONMEBOL:1.25,UEFA:1.55,CONCACAF:1.4,AFC:1.4,CAF:1.45,OFC:1.35}[n.team.confederation]||1.45;
      n.qualified=n.stats.points>=Math.ceil(totalQualifiers*pointsPerMatch);
      n.fixtures.filter(f=>f.competitionId==='continental-national-cup').forEach(f=>f.locked=false);
      if(n.qualified)n.fixtures.filter(f=>f.competitionId==='world-cup').forEach(f=>f.locked=false);
      c.messages.push({id:'qualification-'+Date.now(),from:'FIFA',subject:n.qualified?'Classificação para a Copa do Mundo':'Fim das Eliminatórias',body:n.qualified?'A seleção garantiu vaga na Copa do Mundo de 2026.':'A campanha terminou abaixo da linha de classificação para a Copa do Mundo.',date:new Date().toISOString(),read:false,priority:'high'});
    }
  }
  c.manager.level=1+Math.floor(c.manager.xp/500);c.weeklyDecisions={training:false,squad:false,tactics:false};processCareerDeadlines(c);updateBoardObjectives(c);simulateWorldWeek();c.tactics={...m.ownTactics};persist();showPostMatchInterview(ownGoals,oppGoals);
}

function showPostMatchInterview(ownGoals,oppGoals){
  const result=ownGoals>oppGoals?'vitória':ownGoals<oppGoals?'derrota':'empate',m=session.match,report=m.postMatchReport||buildMatchReport(m);
  const reasons=(report.signals||[]).map(item=>'<li><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.detail)+'</span></li>').join('');
  const performers=(report.performers||[]).slice(0,3).map(item=>'<div><span>'+escapeHtml(item.name)+'</span><strong>'+Number(item.rating).toFixed(1)+'</strong><small>'+item.goals+' gol · '+item.assists+' assistência</small></div>').join('');
  const diagnoses=(session.career.matchReports?.[0]?.injuries||[]).map(item=>'<div class="post-match-injury"><strong>'+escapeHtml(item.name)+'</strong><span>'+escapeHtml(item.type)+' · '+item.daysRemaining+' dias</span></div>').join('');
  toastRoot.replaceChildren();
  showModal('Análise e entrevista pós-jogo','<div class="press-room phase5-report"><p class="eyebrow">MOTOR '+MATCH_ENGINE_V2_VERSION+' · '+escapeHtml(m.fixture.competitionName)+'</p><h3>'+escapeHtml(report.verdict)+'</h3><div class="press-summary"><span>Placar <strong>'+ownGoals+'–'+oppGoals+'</strong></span><span>xG <strong>'+report.ownXg.toFixed(1)+'–'+report.opponentXg.toFixed(1)+'</strong></span><span>Posse <strong>'+report.ownPossession+'%</strong></span><span>Alterações <strong>'+m.substitutionsUsed+'</strong></span></div>'+(reasons?'<div class="post-match-causes"><h4>O que decidiu a partida</h4><ul>'+reasons+'</ul></div>':'')+(performers?'<div class="post-match-ratings"><h4>Destaques</h4>'+performers+'</div>':'')+(diagnoses?'<div class="post-match-medical"><h4>Boletim médico</h4>'+diagnoses+'</div>':'')+'<h3>“Como você avalia a '+result+' e as decisões tomadas durante a partida?”</h3><p>Suas palavras afetam elenco, diretoria, torcida e reputação.</p></div>','<button class="btn" data-action="post-interview" data-tone="calm">Valorizar o coletivo</button><button class="btn" data-action="post-interview" data-tone="demanding">Cobrar evolução</button><button class="btn btn-primary" data-action="post-interview" data-tone="protective">Proteger os jogadores</button>');
}

function completePostMatchInterview(tone){const c=session.career,m=session.match;if(!m)return;const effects={calm:[2,1,1],demanding:[-1,2,0],protective:[3,0,1]},[morale,board,reputation]=effects[tone]||[0,0,0];c.morale=clamp(c.morale+morale,1,100);c.board=clamp(c.board+board,1,100);c.manager.reputation=clamp(c.manager.reputation+reputation,1,100);c.roster.forEach(player=>player.morale=clamp(player.morale+morale,1,100));c.mediaHistory.push({date:c.date,competition:m.fixture.competitionName,tone,minute:m.minute,score:m.homeGoals+'-'+m.awayGoals});c.messages.push({id:'press-'+Date.now(),from:'Assessoria de imprensa',subject:'Repercussão da entrevista pós-jogo',body:tone==='protective'?'O elenco aprovou sua postura de proteção.':tone==='demanding'?'A cobrança elevou a pressão por desempenho.':'A mensagem coletiva foi recebida com equilíbrio.',date:new Date().toISOString(),read:false,priority:'normal'});const destination=m.source==='national'?'national':'dashboard';closeModal();session.match=null;persist();navigate(destination);toast('Entrevista publicada e impactos aplicados.','success');}

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
  const sponsorTitleBonus=(champion||cupChampion||continentalChampion)?Number(c.sponsor?.titleBonus||0):0;if(sponsorTitleBonus){c.budget+=sponsorTitleBonus;c.ledger.push({date:new Date().toISOString(),label:'Bônus de título · '+c.sponsor.name,amount:sponsorTitleBonus,type:'income'});}
  c.manager.xp+=champion?1500:Math.max(250,(table.length-rank+1)*55);
  c.manager.reputation=clamp(c.manager.reputation+(champion?5:rank<=Math.ceil(table.length/4)?2:relegated?-5:0),1,100);
  c.manager.level=1+Math.floor(c.manager.xp/500);c.manager.license=managerLicense(c.manager.reputation);
  const aging=processSeasonAging(c.roster,{season:c.season,seed:c.club.id+':'+c.season});
  processSeasonAging(c.youthPlayers||[],{season:c.season,seed:'academy:'+c.club.id+':'+c.season});
  advanceRosterDays(c.roster,35,{medicalLevel:c.facilities.medical,fitnessCoach:c.staff.fitnessCoach});repairCareerLineup(c);
  const status=promoted?'promoted':relegated?'relegated':'stayed',linked=linkedLeagueFor(league,status);
  if(linked){c.club.leagueId=linked.id;c.club.leagueName=linked.name;c.club.division=linked.division;}
  c.season+=1;c.week=1;c.stats={played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0};c.lastTrainingWeek=0;c.worldState=createWorldState(c.season);if(c.sponsor){c.sponsor.years--;if(c.sponsor.years<=0){c.sponsor=null;c.sponsorOffers=generateSponsorOffers(c.club,c.facilities);}else{c.budget+=c.sponsor.annual;c.ledger.push({date:new Date().toISOString(),label:'Patrocínio anual · '+c.sponsor.name,amount:c.sponsor.annual,type:'income'});}}
  const newLeague=findLeague(c.club.leagueId),participants=selectLeagueParticipants(c.club);
  const startDate=c.club.continent==='europe'?new Date(c.season,7,8,15):c.club.countryId==='brazil'?new Date(c.season,3,11,16):new Date(c.season,1,7,16);
  let fixtures=[...buildLeagueFixtures(c.club,participants,startDate),...buildCupFixtures(c.club,participants,startDate)];
  if(continentalId)fixtures.push(...buildContinentalFixtures(c.club,startDate,participants,continentalId));
  if(continentalChampion)fixtures.push(...buildWorldFixtures(c.club,startDate));
  c.participants=participants;c.table=initialTable(participants);c.fixtures=fixtures.sort((a,b)=>new Date(a.date)-new Date(b.date));c.date=startDate.toISOString();processCareerDeadlines(c);
  c.jobOffers=session.catalog.clubs.filter(club=>club.rosterPath&&club.id!==c.club.id&&club.rating<=Math.round(c.manager.reputation*1.08)).sort((a,b)=>b.rating-a.rating).slice(0,5);
  c.messages.push({id:'season-'+Date.now(),from:'Diretoria e federação',subject:'Temporada '+c.season+' iniciada',body:'Posição anterior: '+rank+'º. '+(linked?'O clube agora disputará '+newLeague.name+'. ':'')+(continentalId?'Vaga continental confirmada: '+continentalId+'. ':'')+'Premiação: '+money(prize)+'. Evolução anual: '+aging.improved.length+' jogador(es) subiram de GER e '+aging.declined.length+' tiveram declínio.',date:new Date().toISOString(),read:false,priority:'high'});
  persist();navigate('dashboard');toast('Nova temporada criada com acesso, rebaixamento e vagas aplicados.','success');
}

function applyTraining(plan) {
  const c=session.career;if(c.lastTrainingWeek===c.week)return;
  const outcome=applyTrainingWeek(c.roster,plan,{seed:c.club.id+':'+c.season+':'+c.week,medicalLevel:c.facilities.medical,trainingLevel:c.facilities.training,individualTraining:c.individualTraining,date:c.date});
  const health=rosterHealthSummary(c.roster);c.fitness=health.fitness;c.morale=Math.round(average(c.roster.map(player=>player.morale)));repairCareerLineup(c);
  if(outcome.injuries.length)c.messages.push({id:'training-injury-'+Date.now(),from:'Departamento médico',subject:'Ocorrência no treinamento',body:outcome.injuries.map(item=>item.name+' · '+item.type+' ('+item.daysRemaining+' dias)').join('; '),date:new Date().toISOString(),read:false,priority:'high'});
  if(outcome.improvements.length)c.messages.push({id:'development-'+Date.now(),from:'Centro de performance',subject:'Evolução individual confirmada',body:outcome.improvements.map(item=>item.name+' evoluiu em '+item.attribute).join('; '),date:new Date().toISOString(),read:false,priority:'normal'});
  c.lastTrainingWeek=c.week;c.weeklyDecisions.training=true;const development=c.boardObjectives.find(item=>item.id==='develop-player');if(development)development.progress=Math.min(development.target,development.progress+c.roster.filter(player=>player.age<=23).length);updateBoardObjectives(c);persist();renderGame(renderTraining());toast('Microciclo aplicado: carga, forma, entrosamento e evolução foram recalculados.'+(outcome.injuries.length?' Houve ocorrência médica.':''),outcome.injuries.length?'error':'success');
}

function createYouthIntake(){const c=session.career;if(c.youthIntakeSeason===c.season)return;const first=['Lucas','Gabriel','Matheus','Rafael','João','Pedro','Caio','Davi','Thiago','Bruno'],last=['Silva','Santos','Oliveira','Costa','Souza','Lima','Alves','Rocha','Mendes','Pereira'],positions=['GOL','ZAG','LD','LE','VOL','MC','MEI','PD','PE','ATA'],count=4+c.facilities.youth;c.youthPlayers=Array.from({length:count},(_,index)=>{const seed=stableNumber(c.club.id+':'+c.season+':'+index),overall=clamp(45+c.facilities.youth*3+seed%9,40,72),potential=clamp(overall+8+seed%18,overall,92);return normalizePlayer({id:'youth-'+c.season+'-'+seed,name:first[seed%first.length]+' '+last[(seed>>3)%last.length],pos:positions[(seed>>5)%positions.length],role:'Revelação da academia',overall,potential,age:15+seed%3,salary:2,value:.08,fitness:94,morale:82,personality:['Determinado','Profissional','Ambicioso'][seed%3]},index);});c.youthIntakeSeason=c.season;c.messages.push({id:'youth-'+Date.now(),from:'Diretor da academia',subject:'Nova geração avaliada',body:count+' jovens foram incorporados à academia. A qualidade reflete o nível atual das instalações.',date:new Date().toISOString(),read:false,priority:'high'});unlockAchievement('academy-class','Olheiro de talentos','Avalie sua primeira geração anual da academia.');persist();renderGame(renderTraining());toast('Nova geração da academia disponível.','success');}

function promoteYouth(id){const c=session.career,index=c.youthPlayers.findIndex(player=>player.id===id);if(index<0)return;if(c.roster.length>=c.transferPolicy.maxSquad)return toast('Elenco principal sem vaga de registro.','error');const [player]=c.youthPlayers.splice(index,1);c.roster.push(player);c.messages.push({id:'promotion-'+Date.now(),from:'Academia',subject:'Promoção ao elenco principal',body:player.name+' foi promovido e já pode ser escalado.',date:new Date().toISOString(),read:false,priority:'normal'});persist();renderGame(renderTraining());toast(player.name+' promovido ao profissional.','success');}

function upgradeFacility(id) {
  const c=session.career,level=c.facilities[id]||1,cost=level*6500000;
  if(level>=5)return toast('Esta instalação já está no nível máximo.','error');
  if(c.budget<cost)return toast('Saldo insuficiente para a obra.','error');
  c.budget-=cost;c.facilities[id]=level+1;c.ledger.push({date:new Date().toISOString(),label:'Melhoria de instalação · '+id,amount:-cost,type:'expense'});persist();renderGame(renderClub());toast('Instalação elevada ao nível '+(level+1)+'.','success');
}

function acceptSponsor(id){const c=session.career,offer=c.sponsorOffers.find(item=>item.id===id);if(!offer)return;c.sponsor={...offer};c.sponsorOffers=[];c.budget+=offer.annual;c.ledger.push({date:new Date().toISOString(),label:'Patrocínio anual · '+offer.name,amount:offer.annual,type:'income'});c.messages.push({id:'sponsor-'+Date.now(),from:'Diretoria comercial',subject:'Novo patrocinador principal',body:offer.name+' assinou por '+offer.years+' temporadas. Receita anual: '+money(offer.annual)+'.',date:new Date().toISOString(),read:false,priority:'high'});unlockAchievement('commercial-deal','Executivo de mercado','Assine seu primeiro patrocinador principal.');persist();renderGame(renderClub());toast('Contrato de patrocínio assinado.','success');}

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
  const p=session.market.find(item=>item.id===id);if(!p)return;const fee=Math.round(p.value*1050000),salary=Math.max(25000,p.salary*1000);
  if(session.career.roster.length>=session.career.transferPolicy.maxSquad){toast('O elenco atingiu o limite de registro.','error');return;}
  showModal('Mesa de negociação · '+p.name,'<div class="transfer-negotiation"><p><strong>'+escapeHtml(p.sourceClub||'Clube vendedor')+'</strong> aceita analisar condições. O clube e o agente podem rejeitar valores insuficientes.</p><div class="negotiation-fields"><label>Taxa de transferência<input id="neg-fee" type="number" min="0" step="100000" value="'+fee+'"><small>Pedido estimado: '+money(fee)+'</small></label><label>Salário mensal<input id="neg-salary" type="number" min="1000" step="1000" value="'+salary+'"><small>Expectativa do agente: '+money(salary)+'</small></label><label>Duração<select id="neg-years"><option>2</option><option>3</option><option selected>4</option><option>5</option></select></label><label>Luvas<input id="neg-signing" type="number" min="0" step="50000" value="'+Math.round(salary*5)+'"></label><label>Parcelas<select id="neg-installments"><option value="1">À vista</option><option value="2">2 parcelas</option><option value="3" selected>3 parcelas</option></select></label><label>Cláusula de rescisão<input id="neg-release" type="number" min="0" step="1000000" value="'+Math.round(fee*2.2)+'"></label></div><p class="muted">Comissão do agente: 5% da taxa. Parcelas futuras continuam registradas no passivo do clube.</p></div>','<button class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-transfer" data-player="'+escapeHtml(id)+'" data-asking="'+fee+'" data-expected-salary="'+salary+'">Enviar proposta</button>');
}

function confirmTransfer(target) {
  const id=target.dataset.player,p=session.market.find(item=>item.id===id);if(!p)return;const asking=Number(target.dataset.asking),expected=Number(target.dataset.expectedSalary),fee=Number(document.querySelector('#neg-fee')?.value),salary=Number(document.querySelector('#neg-salary')?.value),years=Number(document.querySelector('#neg-years')?.value||4),signing=Number(document.querySelector('#neg-signing')?.value||0),installments=Number(document.querySelector('#neg-installments')?.value||1),releaseClause=Number(document.querySelector('#neg-release')?.value||0),agentFee=Math.round(fee*.05),installmentAmount=Math.ceil(fee/installments),firstInstallment=Math.min(fee,installmentAmount),initial=firstInstallment+agentFee+signing;
  if(fee<asking*.9){showModal('Contraproposta do clube','<p>'+escapeHtml(p.sourceClub||'O clube vendedor')+' recusou a taxa. A contraproposta é <strong>'+money(Math.round(asking*1.08))+'</strong>.</p><p>Você pode retornar à mesa ou encerrar.</p>','<button class="btn" data-action="close-modal">Encerrar</button><button class="btn btn-primary" data-action="buy-player" data-player="'+escapeHtml(id)+'">Renegociar</button>');return;}
  if(salary<expected*.88){showModal('Exigência do agente','<p>O agente considera o salário insuficiente. A expectativa mínima é <strong>'+money(expected)+'</strong>.</p>','<button class="btn" data-action="close-modal">Encerrar</button><button class="btn btn-primary" data-action="buy-player" data-player="'+escapeHtml(id)+'">Reformular contrato</button>');return;}
  if(session.career.budget<initial){closeModal();toast('Orçamento insuficiente para a primeira parcela, luvas e comissão.','error');return;}
  session.career.budget-=initial;session.career.roster.push({...p,salary:Math.round(salary/1000),contractUntil:(session.career.season+years)+'-06-30',releaseClause,transferFee:fee});session.career.ledger.push({date:new Date().toISOString(),label:'Transferência · '+p.name+' · parcela 1/'+installments+' + luvas e comissão',amount:-initial,type:'expense',remainingInstallments:installments-1,totalFee:fee});if(installments>1){session.career.transferObligations.push({id:'transfer-'+Date.now(),playerId:p.id,playerName:p.name,remainingBalance:Math.max(0,fee-firstInstallment),installmentAmount,nextDue:addDays(session.career.date,30),remainingInstallments:installments-1});}session.career.messages.push({id:'transfer-'+Date.now(),from:'Diretor de futebol',subject:'Contratação concluída: '+p.name,body:'Contrato de '+years+' temporadas. Salário: '+money(salary)+'. Taxa: '+money(fee)+' em '+installments+' parcela(s).',date:new Date().toISOString(),read:false,priority:'normal'});session.market=session.market.filter(item=>item.id!==id);unlockAchievement('first-signing','Primeira contratação','Conclua uma negociação internacional de transferência.');closeModal();persist();renderGame(renderMarket());toast(p.name+' assinou por '+years+' temporadas.','success');
}

function playerReport(id){
  const p=session.market.find(item=>item.id===id)||session.career.roster.find(item=>item.id===id);if(!p)return;
  const attrs=Object.entries(p.attributes||{}).map(([key,value])=>'<div><span>'+escapeHtml(({pace:'Velocidade',stamina:'Resistência',strength:'Força',passing:'Passe',technique:'Técnica',vision:'Visão',finishing:'Finalização',tackling:'Desarme',positioning:'Posicionamento',decisions:'Decisões',teamwork:'Trabalho em equipe',leadership:'Liderança'})[key]||key)+'</span><strong>'+value+'</strong></div>').join('');
  const media=licensedPlayerMedia(p),identity=media?'Foto real do Wikimedia Commons · '+escapeHtml(media.license.name)+' · '+escapeHtml(media.credit||'crédito no manifesto'):'Foto genérica provisória criada para o VFM; este jogador ainda não possui correspondência real verificada.';
  const details=[p.nationality,p.foot?('Pé '+p.foot):'',p.height?(p.height+' cm'):''].filter(Boolean).map(escapeHtml).join(' · ');
  const status=playerStatus(p),roles=Object.entries(p.positionRatings||{}).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([role,rating])=>'<span><b>'+role+'</b><strong>'+rating+'</strong></span>').join('');
  const performance='<div class="player-performance-grid"><span><small>Rendimento hoje</small><strong>'+effectiveOverall(p,p.pos).toFixed(1)+'</strong></span><span><small>Forma</small><strong>'+Math.round(p.form)+'%</strong></span><span><small>Físico</small><strong>'+Math.round(p.fitness)+'%</strong></span><span><small>Carga</small><strong>'+Math.round(p.workload)+'%</strong></span><span><small>Ritmo</small><strong>'+Math.round(p.sharpness)+'%</strong></span><span><small>Entrosamento</small><strong>'+Math.round(p.chemistry)+'%</strong></span></div><div class="position-ratings"><h4>Nota por posição</h4>'+roles+'</div><div class="medical-status '+status.className+'"><strong>'+escapeHtml(status.label)+'</strong><small>'+p.seasonMinutes+' min · '+p.appearances+' jogos na temporada</small></div>';
  const actions=p.onLoan&&p.purchaseOption?'<button class="btn" data-action="close-modal">Fechar</button><button class="btn btn-primary" data-action="exercise-purchase-option" data-player="'+escapeHtml(p.id)+'">Comprar por '+money(p.purchaseOption)+'</button>':'<button class="btn btn-primary" data-action="close-modal">Fechar</button>';
  showModal('Relatório · '+p.name,'<div class="player-report"><header>'+playerPortrait(p,'large')+'<div><h3>'+escapeHtml(p.name)+'</h3><p>'+p.pos+' · '+p.age+' anos · '+escapeHtml(p.personality)+'</p><strong>GER '+p.overall+' · POT '+p.potential+'</strong><small>'+details+'</small></div></header>'+performance+'<div class="identity-source">'+identity+'</div><div class="attribute-grid">'+attrs+'</div><p>Risco-base de lesão: '+p.injuryRisk+'% · Conhecimento do scout: '+p.knowledge+'% · Contrato: '+escapeHtml(p.contractUntil)+'</p></div>',actions);
}

function loanPlayer(id){const p=session.market.find(item=>item.id===id);if(!p)return;const fee=Math.max(100000,Math.round(p.value*1000000*.06)),wage=Math.max(10000,p.salary*1000);showModal('Empréstimo · '+p.name,'<p>Proposta de empréstimo até o fim da temporada, com taxa de <strong>'+money(fee)+'</strong> e 70% dos salários.</p><p>Uma opção de compra de '+money(p.value*1000000)+' será registrada.</p>','<button class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-loan" data-player="'+p.id+'" data-fee="'+fee+'" data-wage="'+wage+'">Enviar proposta</button>');}

function confirmLoan(target){const p=session.market.find(item=>item.id===target.dataset.player),fee=Number(target.dataset.fee),wage=Number(target.dataset.wage);if(!p)return;if(session.career.budget<fee)return toast('Orçamento insuficiente.','error');session.career.budget-=fee;session.career.roster.push({...p,onLoan:true,loanUntil:session.career.season+'-12-31',salary:Math.round(wage*.7/1000),purchaseOption:p.value*1000000});session.career.ledger.push({date:new Date().toISOString(),label:'Empréstimo · '+p.name,amount:-fee,type:'expense'});session.market=session.market.filter(item=>item.id!==p.id);closeModal();persist();renderGame(renderMarket());toast('Empréstimo concluído.','success');}

function exercisePurchaseOption(id){const c=session.career,p=c.roster.find(player=>player.id===id&&player.onLoan),cost=Number(p?.purchaseOption||0);if(!p||!cost)return;if(c.budget<cost)return toast('Saldo insuficiente para exercer a opção.','error');c.budget-=cost;p.onLoan=false;p.loanUntil=null;p.purchaseOption=0;p.contractUntil=(c.season+4)+'-12-31';c.ledger.push({date:new Date().toISOString(),label:'Opção de compra · '+p.name,amount:-cost,type:'expense'});c.messages.push({id:'loan-buy-'+Date.now(),from:'Diretor de futebol',subject:'Opção de compra exercida: '+p.name,body:'O atleta agora pertence em definitivo ao clube. Valor pago: '+money(cost)+'.',date:new Date().toISOString(),read:false,priority:'normal'});closeModal();persist();renderGame(renderSquad());toast(p.name+' foi contratado em definitivo.','success');}

function exportSave() {
  const blob=new Blob([JSON.stringify(session.career,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='vale-futebol-manager-save-'+session.slot+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

async function importSaveFile(file) {
  if(!file)return;
  try{
    const parsed=JSON.parse(await file.text());
    const imported=parsed?.career||parsed;
    if(!imported?.manager||!imported?.club||!Array.isArray(imported.roster)||!Array.isArray(imported.fixtures))throw new Error('invalid-save');
    session.career=migrateCareer(imported);
    if(!session.career.worldState)session.career.worldState=createWorldState(session.career.season);
    if(!persist())throw new Error('save-failed');
    navigate('dashboard');
    toast('Carreira importada e salva com segurança.','success');
  }catch{
    toast('Arquivo de carreira inválido ou corrompido.','error');
  }
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
  else if(action==='onboarding-next'){closeModal();showOnboardingStep(session.onboardingStep+1);}
  else if(action==='onboarding-prev'){closeModal();showOnboardingStep(Math.max(0,session.onboardingStep-1));}
  else if(action==='skip-onboarding'){session.career.onboardingComplete=true;persist();closeModal();toast('Guia encerrado. Você pode jogar no seu ritmo.','success');}
  else if(action==='slot-new'){session.slot=Number(target.dataset.slot);session.selectedClub=null;session.clubFilters={continent:'all',country:'all',league:'all',search:''};closeModal();renderClubSelect();}
  else if(action==='slot-load'){session.slot=Number(target.dataset.slot);session.career=migrateCareer(store.slots[session.slot-1]);if(!session.career.worldState)session.career.worldState=createWorldState(session.career.season);closeModal();persist();navigate('dashboard');if(!session.career.onboardingComplete)startOnboarding();}
  else if(action==='back-cover')renderCover();
  else if(action==='select-world-club'){session.selectedClub=session.catalog.clubs.find(club=>clubKey(club)===target.dataset.key);renderClubSelect();}
  else if(action==='club-next'&&session.selectedClub)renderManagerSetup();
  else if(action==='manager-back')renderClubSelect();
  else if(action==='select-avatar'){session.selectedAvatar=Number(target.dataset.avatar);renderManagerSetup();}
  else if(action==='start-career')createCareer();
  else if(action==='navigate')navigate(target.dataset.screen);
  else if(action==='save')persist(true);
  else if(action==='advance-season')advanceSeason();
  else if(action==='calendar-shift'){const amount=Number(target.dataset.shift)||0,date=new Date(session.calendarDate);if(session.calendarView==='year')date.setFullYear(date.getFullYear()+amount);else if(session.calendarView==='week')date.setDate(date.getDate()+amount*7);else date.setMonth(date.getMonth()+amount);session.calendarDate=date;renderGame(renderCalendar());}
  else if(action==='calendar-today'){session.calendarDate=new Date(session.career.date);renderGame(renderCalendar());}
  else if(action==='calendar-day')openCalendarDay(target.dataset.date);
  else if(action==='open-next-match'||action==='start-match')startMatch('club');
  else if(action==='start-national-match')startMatch('national');
  else if(action==='toggle-match'){session.match.running?stopMatchTimer():startMatchTimer();renderMatch();}
  else if(action==='match-speed'){session.match.speed=Number(target.dataset.speed);if(!session.match.running)startMatchTimer();renderMatch();}
  else if(action==='match-event-filter'){session.matchEventFilter=target.dataset.filter||'all';renderMatch();}
  else if(action==='finish-match')finishMatch();
  else if(action==='open-live-tactics'){session.match.tacticalWasRunning=session.match.running;stopMatchTimer();session.match.tacticalOpen=true;renderMatch();}
  else if(action==='close-live-tactics'){const resume=session.match.tacticalWasRunning;session.match.tacticalOpen=false;session.match.liveSelectedPlayer=null;session.career.tactics={...session.match.ownTactics};persist();if(resume)startMatchTimer();renderMatch();}
  else if(action==='live-player-select')selectLivePlayer(target.dataset.livePlayer);
  else if(action==='live-preset'){const preset=target.dataset.preset,t=session.match.ownTactics;if(preset==='protect'){Object.assign(t,{mentality:'Defensiva',tempo:35,pressure:42,defensiveLine:38,transition:'Reagrupar'});}else if(preset==='control'){Object.assign(t,{mentality:'Equilibrada',passing:'Curto',tempo:48,pressure:58,width:62});}else if(preset==='attack'){Object.assign(t,{mentality:'Ofensiva',tempo:78,pressure:82,defensiveLine:69,transition:'Contra-atacar'});}else{Object.assign(t,{mentality:'Equilibrada',transition:'Contra-atacar',passing:'Direto',tempo:68,pressure:55});}session.match.events.push({minute:session.match.minute,type:'tactical',text:'O treinador altera o plano: '+target.textContent+'. As novas instruções já entram no cálculo.'});renderMatch();}
  else if(action==='live-shout'){if(applyManagerShoutV2(session.match,target.dataset.shout))renderMatch();else toast('Aguarde antes de dar uma nova orientação.','error');}
  else if(action==='post-interview')completePostMatchInterview(target.dataset.tone);
  else if(action==='exit-match'){const wasRunning=session.match.running;stopMatchTimer();session.matchWasRunningBeforeGate=wasRunning;showModal('Sair da partida?','<p>O jogo será interrompido sem registrar resultado.</p>','<button class="btn" data-action="resume-match-modal">Continuar partida</button><button class="btn btn-danger" data-action="abandon-match">Abandonar</button>');}
  else if(action==='resume-match-modal'){closeModal();if(session.matchWasRunningBeforeGate)startMatchTimer();renderMatch();}
  else if(action==='abandon-match'){closeModal();session.match=null;navigate('match-center');}
  else if(action==='best-lineup'){session.career.lineupIds=pickLineup(session.career.roster).map(p=>p.id);persist();renderGame(renderSquad());}
  else if(action==='reset-tactical-shape'){session.career.tacticalPositions=(FORMATIONS[session.career.tactics.formation]||FORMATIONS['4-3-3']).map(point=>[...point]);persist();renderGame(renderTactics());}
  else if(action==='toggle-lineup'){const id=target.dataset.player,player=session.career.roster.find(item=>item.id===id),ids=session.career.lineupIds,index=ids.indexOf(id);if(index>=0)ids.splice(index,1);else if(!isPlayerAvailable(player))return toast('Este atleta está indisponível.','error');else if(ids.length<11)ids.push(id);else return toast('Remova um titular antes de escalar outro.','error');persist();renderGame(renderSquad());}
  else if(action==='apply-training')applyTraining(target.dataset.plan);
  else if(action==='youth-intake')createYouthIntake();
  else if(action==='promote-youth')promoteYouth(target.dataset.player);
  else if(action==='buy-player')buyPlayer(target.dataset.player);
  else if(action==='confirm-transfer')confirmTransfer(target);
  else if(action==='player-report')playerReport(target.dataset.player);
  else if(action==='loan-player')loanPlayer(target.dataset.player);
  else if(action==='confirm-loan')confirmLoan(target);
  else if(action==='exercise-purchase-option')exercisePurchaseOption(target.dataset.player);
  else if(action==='open-mail')openMail(target.dataset.mail);
  else if(action==='accept-national')acceptNationalJob(target.dataset.team);
  else if(action==='accept-club-job')acceptClubJob(target.dataset.club);
  else if(action==='upgrade-staff'){const id=target.dataset.staff,cost=1500000;if(session.career.budget<cost)return toast('Saldo insuficiente.','error');session.career.budget-=cost;session.career.staff[id]=clamp(session.career.staff[id]+2,1,99);session.career.ledger.push({date:new Date().toISOString(),label:'Investimento na comissão técnica',amount:-cost,type:'expense'});persist();renderGame(renderClub());}
  else if(action==='upgrade-facility')upgradeFacility(target.dataset.facility);
  else if(action==='accept-sponsor')acceptSponsor(target.dataset.sponsor);
  else if(action==='export-save')exportSave();
  else if(action==='choose-import-save')document.querySelector('#save-import')?.click();
  else if(action==='exit-career'){if(persist())renderCover();}
}

window.__vfmMatchAction=event=>{const target=event.target.closest('[data-action]');if(!target)return;event.stopPropagation();handleAction(target.dataset.action,target);};

app.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(target)handleAction(target.dataset.action,target);});
app.addEventListener('input',event=>{const target=event.target,action=target.dataset.action;
  if(action==='filter-club-search'){session.clubFilters.search=target.value;renderClubSelect();document.querySelector('[data-action="filter-club-search"]')?.focus();}
  else if(action==='squad-search'){session.squadSearch=target.value;renderGame(renderSquad());document.querySelector('[data-action="squad-search"]')?.focus();}
  else if(action==='national-search'){session.nationalSearch=target.value;renderGame(renderNational());document.querySelector('[data-action="national-search"]')?.focus();}
  else if(action==='pressure-range'){session.career.tactics.pressure=Number(target.value);persist();renderGame(renderTactics());}
  else if(action==='tempo-range'){session.career.tactics.tempo=Number(target.value);persist();renderGame(renderTactics());}
  else if(action==='width-range'){session.career.tactics.width=Number(target.value);persist();renderGame(renderTactics());}
  else if(action==='line-range'){session.career.tactics.defensiveLine=Number(target.value);persist();renderGame(renderTactics());}
  else if(action==='live-pressure'){session.match.ownTactics.pressure=Number(target.value);}
  else if(action==='live-tempo'){session.match.ownTactics.tempo=Number(target.value);}
  else if(action==='live-width'){session.match.ownTactics.width=Number(target.value);}
  else if(action==='live-line'){session.match.ownTactics.defensiveLine=Number(target.value);}
});
app.addEventListener('change',event=>{const target=event.target,action=target.dataset.action;
  if(action==='import-save'){importSaveFile(target.files?.[0]);target.value='';}
  else if(action==='filter-continent'){session.clubFilters.continent=target.value;session.clubFilters.country='all';session.clubFilters.league='all';renderClubSelect();}
  else if(action==='filter-country'){session.clubFilters.country=target.value;session.clubFilters.league='all';renderClubSelect();}
  else if(action==='filter-league'){session.clubFilters.league=target.value;renderClubSelect();}
  else if(action==='national-filter'){session.nationalFilter=target.value;renderGame(renderNational());}
  else if(action==='calendar-view'){session.calendarView=target.value;renderGame(renderCalendar());}
  else if(action==='calendar-filter'){session.calendarFilter=target.value;renderGame(renderCalendar());}
  else if(action==='position-filter'){session.positionFilter=target.value;renderGame(renderSquad());}
  else if(action==='formation-select'){session.career.tactics.formation=target.value;session.career.tacticalPositions=(FORMATIONS[target.value]||FORMATIONS['4-3-3']).map(point=>[...point]);persist();renderGame(renderTactics());}
  else if(action==='mentality-select'){session.career.tactics.mentality=target.value;persist();renderGame(renderTactics());}
  else if(action==='passing-select'){session.career.tactics.passing=target.value;persist();renderGame(renderTactics());}
  else if(action==='marking-select'){session.career.tactics.marking=target.value;persist();renderGame(renderTactics());}
  else if(action==='transition-select'){session.career.tactics.transition=target.value;persist();renderGame(renderTactics());}
  else if(action==='individual-focus'){session.career.individualTraining[target.dataset.player]=target.value;persist();}
  else if(action==='live-formation'){session.match.ownTactics.formation=target.value;session.match.tacticalPositions=(FORMATIONS[target.value]||FORMATIONS['4-3-3']).map(point=>[...point]);renderMatch();}
  else if(action==='live-mentality'){session.match.ownTactics.mentality=target.value;renderMatch();}
  else if(action==='live-passing'){session.match.ownTactics.passing=target.value;renderMatch();}
  else if(action==='live-transition'){session.match.ownTactics.transition=target.value;renderMatch();}
  else if(action==='live-marking'){session.match.ownTactics.marking=target.value;renderMatch();}
  else if(action==='reduced-motion'){store.settings.reducedMotion=target.checked;document.documentElement.classList.toggle('reduce-motion',target.checked);persist();}
});

app.addEventListener('dragstart',event=>{const player=event.target.closest('.draggable-player');if(!player)return;session.dragPlayerId=player.dataset.player;session.dragSlot=Number(player.dataset.slot);event.dataTransfer?.setData('text/player',session.dragPlayerId);event.dataTransfer?.setDragImage(player,player.offsetWidth/2,player.offsetHeight/2);player.classList.add('is-dragging');});
app.addEventListener('dragend',event=>event.target.closest('.draggable-player')?.classList.remove('is-dragging'));
app.addEventListener('dragover',event=>{if(event.target.closest('.drop-player,[data-drop-zone="pitch"]'))event.preventDefault();});
app.addEventListener('drop',event=>{const zone=event.target.closest('.drop-player,[data-drop-zone="pitch"]');if(!zone)return;event.preventDefault();const sourceId=event.dataTransfer?.getData('text/player')||session.dragPlayerId,target=event.target.closest('.drop-player');if(target?.dataset.player&&target.dataset.player!==sourceId)swapTacticalPlayers(sourceId,target.dataset.player);else{const pitch=event.target.closest('[data-drop-zone="pitch"]');if(pitch&&Number.isInteger(session.dragSlot)){const rect=pitch.getBoundingClientRect();moveTacticalPlayer(session.dragSlot,(event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100);}}session.dragPlayerId=null;session.dragSlot=null;});

let pointerDrag=null;
app.addEventListener('pointerdown',event=>{const player=event.target.closest('.draggable-player');if(!player)return;pointerDrag={id:player.dataset.player,slot:Number(player.dataset.slot),x:event.clientX,y:event.clientY,element:player};player.classList.add('touch-dragging');});
app.addEventListener('pointerup',event=>{if(!pointerDrag)return;const drag=pointerDrag;pointerDrag=null;drag.element?.classList.remove('touch-dragging');const distance=Math.hypot(event.clientX-drag.x,event.clientY-drag.y),target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.drop-player'),pitch=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-drop-zone="pitch"]');if(target?.dataset.player&&target.dataset.player!==drag.id){session.dragPlayerId=null;swapTacticalPlayers(drag.id,target.dataset.player);return;}if(distance>8&&pitch&&Number.isInteger(drag.slot)){const rect=pitch.getBoundingClientRect();session.dragPlayerId=null;moveTacticalPlayer(drag.slot,(event.clientX-rect.left)/rect.width*100,(event.clientY-rect.top)/rect.height*100);return;}if(distance<=8){if(session.dragPlayerId&&session.dragPlayerId!==drag.id){const first=session.dragPlayerId;session.dragPlayerId=null;swapTacticalPlayers(first,drag.id);}else{session.dragPlayerId=drag.id;drag.element?.classList.add('is-selected');toast('Jogador selecionado. Toque em outro para trocar.');}}});
let liveDragId=null,livePointer=null;
app.addEventListener('dragstart',event=>{const player=event.target.closest('.live-player');if(!player)return;liveDragId=player.dataset.livePlayer;event.dataTransfer?.setData('text/live-player',liveDragId);});
app.addEventListener('dragover',event=>{if(event.target.closest('.live-player'))event.preventDefault();});
app.addEventListener('drop',event=>{const target=event.target.closest('.live-player');if(!target)return;const source=event.dataTransfer?.getData('text/live-player')||liveDragId;if(source&&source!==target.dataset.livePlayer){event.preventDefault();makeLiveSwap(source,target.dataset.livePlayer);}liveDragId=null;});
app.addEventListener('pointerdown',event=>{const player=event.target.closest('.live-player');if(player)livePointer={id:player.dataset.livePlayer,x:event.clientX,y:event.clientY};});
app.addEventListener('pointerup',event=>{if(!livePointer)return;const start=livePointer;livePointer=null;if(Math.hypot(event.clientX-start.x,event.clientY-start.y)<8)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('.live-player');if(target?.dataset.livePlayer&&target.dataset.livePlayer!==start.id)makeLiveSwap(start.id,target.dataset.livePlayer);});
modalRoot.addEventListener('click',event=>{const target=event.target.closest('[data-action]');if(target)handleAction(target.dataset.action,target);else if(event.target.classList.contains('modal-backdrop'))closeModal();});

function handleOrientation() {
  orientationGate.style.display='none';
  app.removeAttribute('inert');
}

window.addEventListener('resize',handleOrientation,{passive:true});
window.addEventListener('orientationchange',handleOrientation,{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&session.match?.running){session.matchWasRunningBeforeGate=true;stopMatchTimer();}else if(!document.hidden&&session.screen==='match'&&session.matchWasRunningBeforeGate){session.matchWasRunningBeforeGate=false;startMatchTimer();renderMatch();}});
window.addEventListener('popstate',()=>{if(session.career)navigate(location.hash.replace('#/','')||'dashboard',false);else renderCover();});

async function boot() {
  try {
    const [catalog]=await Promise.all([fetchJson('data/world-catalog-2026.json'),loadPlayerMediaManifest()]);session.catalog=catalog;
    document.documentElement.classList.toggle('reduce-motion',store.settings.reducedMotion);
    renderCover();handleOrientation();
    if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
  } catch {
    app.innerHTML='<main class="screen fatal-screen"><h1>Não foi possível abrir o mundo do futebol</h1><p>Recarregue a página ou verifique os arquivos do jogo.</p></main>';
  } finally { setTimeout(()=>bootScreen.classList.add('is-ready'),350); }
}

boot();
