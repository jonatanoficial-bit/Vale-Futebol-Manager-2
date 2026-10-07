import { FACILITIES, ensureEconomy, processEconomy, financeForecast, facilityQuote, startConstruction, marketValue, validateDeal, createSaleOffer, acceptSale } from './systems/clubEconomy.js';
import { MATCH_ENGINE_V2_VERSION, createMatchEngineV2, advanceMatchEngineV2, applyMatchSubstitutionV2, applyManagerShoutV2, buildMatchReport, opponentCoachProfile } from './systems/matchEngineV2.js';
import { CAREER_PERFORMANCE_VERSION, hydratePlayerPerformance, effectiveOverall, isPlayerAvailable, selectBestLineup, advanceRosterDays, applyMatchConsequences, applyTrainingWeek, processSeasonAging, rosterHealthSummary } from './systems/careerPerformanceV3.js';
import { MANAGER_CAREER_VERSION, ensureManagerCareer, careerSecurity, reviewManagerMatch, createClubJobOffers, createNationalJobOffers, careerOfferDue, closeCareerOfferCycle, recordClubAppointment, recordNationalAppointment } from './systems/managerCareer.js';
import { COMPETITION_CAREER_VERSION, deriveCompetitionTable, competitionKind, nextCareerEvent, managerCareerScore, seasonTrophies } from './systems/competitionCareer.js';
import { COMPETITION_WORLD_VERSION, createCompetitionWorld, hydrateCompetitionWorld, managedLeagueFixtures, recordManagedCompetitionResult, simulateCompetitionRound, sortCompetitionTable } from './systems/competitionWorldV2.js';
import { WORLD_TOURNAMENT_VERSION, simulateWorldTournamentWeek, worldTournamentSummary, clubWorldQualification, deriveWorldQualifications } from './systems/worldTournamentV3.js';
import { CAREER_RELATIONS_VERSION, ensureCareerRelations, makeCareerPromise, recordPressDecision, relationsSnapshot, resolveCareerRelationsAfterMatch } from './systems/careerRelations.js';
import { TACTICAL_ROLES_VERSION, ensureTacticalRoles, roleEffects, roleLabel, rolesForPosition } from './systems/tacticalRoles.js';
import { COMPETITION_FORMATS_VERSION, buildDomesticCupPath, buildContinentalPath, domesticCupFormat, tieOutcome, groupProgress, describeFixtureFormat } from './systems/competitionFormatsV3.js';
import { MARKET_INTELLIGENCE_VERSION, ensureMarketIntelligence, hydrateMarketProfile, marketNegotiationProfile, scoutRegions, scoutInvestment, applyContractMatchBonuses, updateContractMood, contractRisk, refreshMarketPressure } from './systems/marketIntelligenceV3.js';
import { NATIONAL_CAREER_VERSION, ensureNationalCareer, nationalSelectionRanking, nationalSelectionBrief, observeNationalRegion, callUpByPerformance, recordNationalPerformance, recordNationalTournament } from './systems/nationalCareerV3.js';
import { RIVAL_CAREER_VERSION, ensureRivalCareer, simulateRivalMarketWeek, settleRivalSeason, rivalMarketBrief, transferCompetition, recordRivalTransfer, registerRivalPlayers, rivalMarketCandidates, recordUserTransfer } from './systems/rivalCareerV4.js';
import { REGULATION_ENGINE_VERSION, regulationForLeague, resolveRelegationTable, regulationCalendarSummary } from './systems/regulationEngineV4.js';

const VERSION = '24.0.0-phase18';
const SCHEMA = 2000;
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
  squadSearch: '', positionFilter: 'TODOS', marketPosition:'TODOS',marketBudget:'all',marketRegion:'all',market: [], marketLoading: false,
  match: null, matchTimer: null, matchWasRunningBeforeGate: false, modalReturnFocus: null,
  calendarView:'month', calendarDate:new Date(2026,3,1), calendarFilter:'all', competitionId:'', competitionTab:'overview', dragPlayerId:null, dragSlot:null,
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

const FACILITY_MEDIA = {
  stadium:'./assets/facilities/stadium.jpg',
  training:'./assets/facilities/training.jpg',
  youth:'./assets/facilities/youth.jpg',
  medical:'./assets/facilities/medical.jpg',
  scouting:'./assets/facilities/scouting.jpg',
  commercial:'./assets/facilities/commercial.jpg'
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
  ['dashboard','.career-command','Continue sua carreira','Este é o comando principal. Ele mostra o próximo adversário, o avanço da temporada e a decisão que faz a carreira continuar.','Abra Elenco no menu para praticar a primeira decisão.','navigate:squad'],
  ['squad','.squad-planner','Monte seus onze','O mapa do elenco mostra carências por setor. Abaixo dele, toque em Escalar ou use Melhor equipe para montar os titulares.','Toque em Melhor equipe e confira o contador 11/11.','best-lineup'],
  ['tactics','.tactical-board','Organize o time no campo','Os jogadores estão separados em defesa, meio e ataque. Arraste um atleta para reposicioná-lo ou troque a formação no painel ao lado.','Troque a formação e observe o desenho mudar.','formation-select'],
  ['match-center','.match-prep','Prepare e jogue','Antes do apito, confirme adversário, local, escalação e plano de jogo. O botão dourado abre a partida.','Entre em campo quando os onze estiverem definidos.','open-next-match'],
  ['more','.more-grid','Encontre cada área','Calendário, competições, treino, mercado, clube, mensagens, seleção e ajustes ficam nesta central.','Abra a Agenda para ver clube e seleção sincronizados.','navigate:calendar']
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
  career.trophies = Array.isArray(career.trophies) ? career.trophies : [];
  career.jobOffers = Array.isArray(career.jobOffers) ? career.jobOffers : [];
  career.transferPolicy = { wageBudget:Math.round((career.budget||50000000)*.18), maxSquad:35, foreignLimit:null, ...(career.transferPolicy || {}) };
  career.sponsor = career.sponsor || null;
  career.sponsorOffers = Array.isArray(career.sponsorOffers) ? career.sponsorOffers : [];
  career.mediaHistory = Array.isArray(career.mediaHistory) ? career.mediaHistory : [];
  career.worldNews = Array.isArray(career.worldNews) ? career.worldNews : [];
  career.worldState = career.worldState || null;
  if(session.catalog)ensureRivalCareer(career,session.catalog);
  career.telemetry = Array.isArray(career.telemetry) ? career.telemetry.slice(-120) : [];
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
  if(career.national?.roster){
    career.national.roster=career.national.roster.map(normalizePlayer);
    career.national.fixtures=Array.isArray(career.national.fixtures)?career.national.fixtures:[];
    ensureNationalCallup(career.national);
    ensureNationalCareer(career.national,career);
  }
  const validLineup=new Set(career.roster.filter(isPlayerAvailable).map(player=>player.id));
  career.lineupIds=Array.isArray(career.lineupIds)?career.lineupIds.filter((id,index,list)=>validLineup.has(id)&&list.indexOf(id)===index).slice(0,11):[];
  if(career.lineupIds.length<11)career.lineupIds=selectBestLineup(career.roster,career.tactics.formation).map(player=>player.id);
  ensureEconomy(career);
  ensureManagerCareer(career);
  ensureTacticalRoles(career);
  ensureCareerRelations(career);
  ensureMarketIntelligence(career);
  career.onboardingProgress = career.onboardingProgress && typeof career.onboardingProgress==='object' ? career.onboardingProgress : {};
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
    ...player,
    id:String(player.id || 'player-' + index), name:String(player.displayName || player.name || 'Jogador'),
    role:String(player.role || player.positionName || player.pos || 'Jogador'), pos:String(player.pos || player.position || 'MC'),
    overall, potential:clamp(Math.max(overall,Number(player.potential || player.overall || 60)), 1, 99),
    age:clamp(player.age || 24, 15, 50), salary:Number(player.salary) || 35, value:Number(player.marketValue ?? player.value) || 1,
    fitness:clamp(player.fitness ?? 88, 1, 100), morale:clamp(player.morale ?? 74, 1, 100),
    photo:player.photo || '', photoLicense:player.photoLicense || '', photoCredit:player.photoCredit || '', clubName:player.clubName || '', contractUntil:player.contractUntil || '2027-12-31',contractMonths:Number(player.contractMonths??player.contract??0),sourceClub:player.sourceClub||'',sourceClubId:player.sourceClubId||'',marketRegion:player.marketRegion||'',marketIdentity:player.marketIdentity||player.rivalId||'',basePlayerId:player.basePlayerId||'',freeAgent:Boolean(player.freeAgent),
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

function createWorldState(season, options={}) {
  return createCompetitionWorld({season,leagues:session.catalog?.leagues||[],clubs:session.catalog?.clubs||[],managedClub:options.managedClub||session.career?.club||null,qualificationSeeds:options.qualificationSeeds||null});
}

function syncCareerTableFromWorld(career, leagueId=career.club?.leagueId) {
  const state=career.worldState?.leagues?.[leagueId];if(!state)return;
  const byId=new Map((state.teams||[]).map(team=>[team.id,team]));
  career.table=sortCompetitionTable(state.table,state.rules?.tiebreakers).map(row=>({team:{...(byId.get(row.id)||{}),id:row.id,name:row.name,rating:row.rating,badge:row.badge||''},played:row.played,wins:row.wins,draws:row.draws,losses:row.losses,gf:row.gf,ga:row.ga,gd:row.gd,points:row.points}));
}

function ensureWorldState(career) {
  if(!session.catalog)return career.worldState;
  ensureRivalCareer(career,session.catalog);
  const previousWorldVersion=career.worldState?.version;
  career.worldState=hydrateCompetitionWorld(career.worldState,{season:career.season,leagues:session.catalog.leagues,clubs:session.catalog.clubs,managedClub:career.club});
  const league=career.worldState.leagues?.[career.club?.leagueId];
  if(league&&previousWorldVersion!==COMPETITION_WORLD_VERSION&&Array.isArray(career.table)){
    career.table.forEach(saved=>{const row=league.table.find(item=>item.id===saved.team?.id);if(row)Object.assign(row,{played:Number(saved.played)||0,wins:Number(saved.wins)||0,draws:Number(saved.draws)||0,losses:Number(saved.losses)||0,gf:Number(saved.gf)||0,ga:Number(saved.ga)||0,gd:Number(saved.gd)||0,points:Number(saved.points)||0});});
    const completed=Math.min(league.rounds.length,Math.floor(Math.min(...league.table.map(row=>Number(row.played)||0))));
    league.rounds.forEach(matches=>matches.forEach(match=>{match[2]=null;match[3]=null;}));
    for(let round=0;round<completed;round++)league.rounds[round].forEach(match=>{match[2]=0;match[3]=0;});
    league.nextRound=completed;
  }
  if(league&&Array.isArray(career.fixtures)){
    const managedId=career.club.id;
    career.fixtures.filter(fixture=>fixture.type==='league'&&!fixture.worldFixtureRef).forEach(fixture=>{
      const candidates=[];
      (league.rounds||[]).forEach((matches,round)=>matches.forEach((match,index)=>{
        const home=league.teams[match[0]]?.id,away=league.teams[match[1]]?.id;
        if((home===managedId&&away===fixture.opponent?.id)||(away===managedId&&home===fixture.opponent?.id))candidates.push({round,index,home});
      }));
      const desiredHome=Boolean(fixture.home);
      const match=candidates.find(item=>item.round===Number(fixture.round)-1&&((item.home===managedId)===desiredHome))||candidates.find(item=>(item.home===managedId)===desiredHome)||candidates[0];
      if(match){fixture.worldFixtureRef=career.club.leagueId+':'+match.round+':'+match.index;fixture.round=match.round+1;}
    });
  }
  syncCareerTableFromWorld(career);
  return career.worldState;
}

function processCareerDeadlines(career) {
  const current=new Date(career.date);
  if(Number.isNaN(current.getTime()))return;
  processEconomy(career);
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

function simulateWorldWeek(managed={}) {
  const c=session.career;ensureWorldState(c);
  const headlines=[];c.worldState.week++;
  Object.entries(c.worldState.leagues).forEach(([leagueId,state])=>{
    if(leagueId===c.club.leagueId&&!managed.leagueId)return;
    const requested=leagueId===managed.leagueId?managed.round:undefined;
    const result=simulateCompetitionRound(c.worldState,leagueId,requested,c.season+':'+c.worldState.week);
    result.results.filter(item=>(item.homeTeam.rating>=82||item.awayTeam.rating>=82)&&item.homeGoals+item.awayGoals>=4).forEach(item=>headlines.push(item.homeTeam.name+' '+item.homeGoals+'–'+item.awayGoals+' '+item.awayTeam.name));
  });
  const tournamentUpdates=simulateWorldTournamentWeek(c.worldState.tournaments,c.season+':'+c.worldState.week);
  const rivalWindow=simulateRivalMarketWeek(c,session.catalog,c.worldState.week);
  rivalWindow.moves.slice(0,2).forEach(move=>headlines.push('MERCADO · '+move.to+' contrata '+move.player+' de '+move.from));
  tournamentUpdates.filter(item=>item.champion).forEach(item=>headlines.push('CAMPEÃO · '+item.champion.name+' conquista '+item.id.replaceAll('-',' ')));
  syncCareerTableFromWorld(c);
  c.worldState.updatedAt=new Date().toISOString();c.worldNews.unshift(...headlines.slice(0,4).map(text=>({date:c.date,text,type:'result'})));c.worldNews=c.worldNews.slice(0,60);refreshCareerOpportunities(false);
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
  const [screen,selector,title,description,practice,requiredAction]=current;
  navigate(screen,false);
  const progress='<div class="onboarding-progress">'+ONBOARDING_STEPS.map((_,index)=>'<span class="'+(index<=step?'done':'')+'"></span>').join('')+'</div>';
  session.modalReturnFocus=document.activeElement;
  modalRoot.classList.add('coachmark-mode');
  const complete=Boolean(session.career.onboardingProgress?.[step]);
  modalRoot.innerHTML='<div class="coachmark-stage"><section class="coachmark-card" role="dialog" aria-modal="false" aria-label="'+escapeHtml(title)+'"><header><span>GUIA PRÁTICO · '+(step+1)+'/'+ONBOARDING_STEPS.length+'</span><button class="modal-close" data-action="skip-onboarding" aria-label="Encerrar guia">×</button></header>'+progress+'<h2>'+escapeHtml(title)+'</h2><p>'+escapeHtml(description)+'</p><div class="coachmark-practice '+(complete?'complete':'')+'"><strong>'+ (complete?'Ação concluída':'Faça agora') +'</strong><span>'+escapeHtml(practice)+'</span></div><footer>'+(step?'<button class="btn" data-action="onboarding-prev">Voltar</button>':'<button class="btn" data-action="skip-onboarding">Pular guia</button>')+'<button class="btn btn-primary" data-action="onboarding-next" '+(complete?'':'disabled')+'>'+ (complete?(step===ONBOARDING_STEPS.length-1?'Concluir':'Próximo passo'):'Conclua a ação') +'</button></footer></section></div>';
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

function careerStartDate(club, season=2026) {
  const profile=regulationForLeague(findLeague(club?.leagueId)||{},season),date=new Date((profile.calendar?.start||'')+'T16:00:00Z');
  if(!Number.isNaN(date.getTime()))return date;
  return club?.continent==='europe'?new Date(season,7,8,15):new Date(season,1,7,16);
}

function buildLeagueFixtures(club, participants, startDate, worldState=null) {
  const scheduled=managedLeagueFixtures(worldState,club.leagueId,club.id,club.leagueName,startDate);
  if(scheduled.length)return scheduled;
  const opponents = participants.filter(item=>item.id!==club.id);
  const first = opponents.map((opponent,index)=>({ id:'league-'+(index+1), competitionId:club.leagueId, competitionName:club.leagueName, type:'league', round:index+1, date:addDays(startDate,index*7), opponent, home:index%2===0, played:false, score:null }));
  return first.concat(opponents.map((opponent,index)=>({ id:'league-'+(opponents.length+index+1), competitionId:club.leagueId, competitionName:club.leagueName, type:'league', round:opponents.length+index+1, date:addDays(startDate,(opponents.length+index)*7), opponent, home:index%2!==0, played:false, score:null })));
}

function buildCupFixtures(club, participants, startDate) {
  const countryCup = club.countryId==='brazil' ? 'Copa do Brasil' : 'Copa de ' + club.country;
  const cupParticipants=club.countryId==='brazil'?session.catalog.clubs.filter(team=>team.countryId==='brazil'):participants;
  return buildDomesticCupPath({club,participants:cupParticipants,startDate,competitionId:'domestic-cup',competitionName:countryCup}).fixtures;
}

function onboardingActionKey(action,target){return action==='navigate'?'navigate:'+String(target?.dataset?.screen||''):String(action||'');}
function recordOnboardingAction(action,target){
  const c=session.career,step=session.onboardingStep,current=ONBOARDING_STEPS[step];if(!c||c.onboardingComplete||!current)return;
  if(onboardingActionKey(action,target)!==current[5]||c.onboardingProgress?.[step])return;
  c.onboardingProgress=c.onboardingProgress||{};c.onboardingProgress[step]=true;persist();
  const card=modalRoot.querySelector('.coachmark-card');if(card){card.querySelector('.coachmark-practice')?.classList.add('complete');const label=card.querySelector('.coachmark-practice strong');if(label)label.textContent='Ação concluída';const next=card.querySelector('[data-action="onboarding-next"]');if(next){next.disabled=false;next.textContent=step===ONBOARDING_STEPS.length-1?'Concluir':'Próximo passo';}}
  toast('Ação registrada. Continue quando estiver pronto.','success');
}

function resolveCupDraw(fixture) {
  const c=session.career,pool=(fixture.drawPool||[]).map(id=>session.catalog.clubs.find(club=>club.id===id)).filter(Boolean).filter(club=>club.id!==c.club.id);
  const used=new Set(c.fixtures.filter(item=>item.type==='cup'&&item.opponent?.id!=='draw-pending'&&item.tieId!==fixture.tieId).map(item=>item.opponent.id));
  const available=pool.filter(club=>!used.has(club.id));const opponent=(available.length?available:pool).sort((a,b)=>stableNumber(fixture.id+a.id)-stableNumber(fixture.id+b.id))[0]||fixture.opponent;
  c.fixtures.filter(item=>item.tieId===fixture.tieId).forEach(item=>{item.opponent=opponent;item.drawStatus='confirmed';item.locked=false;});
  c.messages.push({id:'draw-'+Date.now(),from:'Federação',subject:'Sorteio: '+fixture.stage,body:'O adversário definido para '+fixture.stage+' é '+fixture.opponent.name+'. A agenda foi atualizada automaticamente.',date:new Date().toISOString(),read:false,priority:'high'});
}

function buildContinentalFixtures(club, startDate, participants, forcedCompetitionId=null, worldState=null) {
  const leaguePool = session.catalog.clubs.filter(item=>item.confederation===club.confederation&&item.leagueId!==club.leagueId);
  const rated = leaguePool.sort((a,b)=>b.rating-a.rating);
  const league=findLeague(club.leagueId),ranking=[...participants].sort((a,b)=>b.rating-a.rating),seed=ranking.findIndex(team=>team.id===club.id)+1;
  const allocations=league?.rules?.continental||{};
  const persisted=clubWorldQualification(worldState?.tournaments,club.id);
  const id=forcedCompetitionId||persisted?.competition||Object.entries(allocations).find(([,range])=>seed>=Number(range[0])&&seed<=Number(range[1]))?.[0];
  if(!id)return [];
  const names = {'champions-league':'UEFA Champions League','europa-league':'UEFA Europa League','libertadores':'CONMEBOL Libertadores','sulamericana':'CONMEBOL Sul-Americana','concacaf-champions-cup':'CONCACAF Champions Cup','afc-champions-league':'AFC Champions League Elite','caf-champions-league':'CAF Champions League','ofc-champions-league':'OFC Champions League','continental-cup':'Copa continental'};
  return buildContinentalPath({club,startDate,candidates:rated,competitionId:id,competitionName:names[id]||'Copa continental'}).fixtures.map(item=>({...item,qualificationSeed:persisted?.rank||seed,qualificationSource:persisted?'vaga mundial persistida':'ranking da liga'}));
}

function buildWorldFixtures(club, startDate) {
  const confederations = ['UEFA','CONMEBOL','CONCACAF','AFC','CAF','OFC'].filter(id=>id!==club.confederation);
  const opponents = confederations.map(confederation=>session.catalog.clubs.filter(item=>item.confederation===confederation).sort((a,b)=>b.rating-a.rating)[0]).filter(Boolean).slice(0,3);
  return opponents.map((opponent,index)=>({id:'world-club-'+(index+1),competitionId:'club-world-cup',competitionName:'Mundial de Clubes',type:'world',stage:'Fase de grupos',round:index+1,date:addDays(startDate,430+index*5),opponent,home:index%2===0,played:false,score:null}));
}

function resolveTournamentDraw(fixture) {
  const c=session.career,pool=(fixture.drawPool||[]).map(id=>session.catalog.clubs.find(club=>club.id===id)).filter(Boolean).filter(club=>club.id!==c.club.id);
  const used=new Set(c.fixtures.filter(item=>item.competitionId===fixture.competitionId&&item.opponent?.id!=='draw-pending'&&item.tieId!==fixture.tieId).map(item=>item.opponent.id));
  const available=pool.filter(club=>!used.has(club.id));const opponent=(available.length?available:pool).sort((a,b)=>stableNumber(fixture.id+a.id)-stableNumber(fixture.id+b.id))[0]||fixture.opponent;
  c.fixtures.filter(item=>item.tieId===fixture.tieId).forEach(item=>{item.opponent=opponent;item.drawStatus='confirmed';item.locked=false;});
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
    const startDate = careerStartDate(session.selectedClub,2026);
    const worldState=createWorldState(2026,{managedClub:session.selectedClub});
    const fixtures = [...buildLeagueFixtures(session.selectedClub,participants,startDate,worldState),...buildCupFixtures(session.selectedClub,participants,startDate),...buildContinentalFixtures(session.selectedClub,startDate,participants,null,worldState)].sort((a,b)=>new Date(a.date)-new Date(b.date));
    const reputation = clamp(Math.round(session.selectedClub.rating*.78),45,72);
    const budget = Math.round((35 + (session.selectedClub.rating-65)*3.2)*1000000);
    session.career = {
      schema:SCHEMA,version:VERSION,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),onboardingComplete:false,
      manager:{name,avatar:session.selectedAvatar,difficulty:document.querySelector('#difficulty')?.value||'Equilibrado',reputation,xp:0,level:1,license:managerLicense(reputation),awards:[],achievements:[]},
      club:{...session.selectedClub},season:2026,date:startDate.toISOString(),week:1,budget,board:72,morale:74,fitness:88,
      roster,lineupIds:pickLineup(roster).map(p=>p.id),tactics:{formation:'4-3-3',mentality:'Equilibrada',pressure:58,tempo:55,width:55,defensiveLine:52,passing:'Misto',marking:'Zona',transition:'Equilibrada'},
      stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0},participants,table:initialTable(participants),fixtures,
      ledger:[{date:new Date().toISOString(),label:'Orçamento da temporada',amount:budget,type:'income'}],messages:initialMessages(session.selectedClub),
      staff:{assistant:68,fitnessCoach:66,scout:64,medical:65},facilities:{training:2,youth:2,medical:2,scouting:2,stadium:2,commercial:2},transferPolicy:{wageBudget:Math.round(budget*.18),maxSquad:35,foreignLimit:null},transferObligations:[],weeklyDecisions:{training:false,squad:false,tactics:false},seasonHistory:[],matchReports:[],jobOffers:[],lastTrainingWeek:0,national:null,seasonSummary:null,sponsor:null,sponsorOffers:generateSponsorOffers(session.selectedClub,{commercial:2}),mediaHistory:[],worldNews:[],worldState,tacticalPositions:(FORMATIONS['4-3-3']).map(point=>[...point]),tacticalLayoutVersion:2,individualTraining:{},youthIntakeSeason:0,youthPlayers:[],telemetry:[]
    };
    ensureEconomy(session.career);
    ensureManagerCareer(session.career);
    ensureTacticalRoles(session.career);
    ensureCareerRelations(session.career);
    ensureMarketIntelligence(session.career);
    ensureRivalCareer(session.career,session.catalog);
    syncCareerTableFromWorld(session.career);
    session.career.boardObjectives=createBoardObjectives(session.career);
    persist(); toast('Contrato assinado. O mundo do futebol está ativo.','success'); navigate('dashboard');startOnboarding();
  } catch (error) {
    if (button) { button.disabled=false; button.textContent='Assinar contrato'; }
    toast('Não foi possível carregar o elenco completo deste clube.','error');
  }
}

function currentCompetitionFixtures(id) { return session.career.fixtures.filter(f=>f.competitionId===id); }
function nextFixture() {
  if(ensureManagerCareer(session.career).status==='unemployed')return null;
  return session.career.fixtures.find(f=>!f.played&&!f.locked&&!f.cancelled) || null;
}

function nextScheduledFixture() {
  const c=session.career,includeClub=ensureManagerCareer(c).status==='employed';
  return nextCareerEvent(c,{includeClub});
}

function managedTeamFor(fixture) {
  return fixture?.eventOwner==='national'?session.career.national?.team:session.career.club;
}

function fixtureLineupCount(fixture) {
  return fixture?.eventOwner==='national'?(session.career.national?.lineupIds?.length||0):session.career.lineupIds.length;
}

function renderGame(content) {
  const c = session.career;
  const managerCareer=ensureManagerCareer(c),employed=managerCareer.status==='employed';
  const unread = c.messages.filter(m=>!m.read).length;
  const activeNav = MORE_SCREENS.has(session.screen) ? 'more' : session.screen;
  const nav = NAV_ITEMS.map(([screen,icon,label])=>{const locked=!employed&&['squad','tactics','match-center'].includes(screen);return '<button class="world-nav-btn '+(activeNav===screen?'active ':'')+(locked?'locked':'')+'" data-action="navigate" data-screen="'+screen+'" aria-label="'+label+'" '+(activeNav===screen?'aria-current="page" ':'')+(locked?'disabled':'')+'><span>'+iconSvg(icon)+'</span><small>'+label+(screen==='more'&&unread?'<b>'+unread+'</b>':'')+'</small></button>';}).join('');
  app.innerHTML = '<main class="screen game-screen world-game"><nav class="world-nav" aria-label="Menu principal"><div class="nav-brand"><strong>V</strong><span>FM</span></div><div class="nav-primary">'+nav+'</div><div class="nav-season"><span>Temporada</span><strong>'+c.season+'</strong></div></nav><section class="game-stage"><header class="world-topbar"><div class="club-identity '+(employed?'':'unemployed')+'"><span class="club-badge-shell"><img src="./'+escapeHtml(c.club.badge)+'" alt="" onerror="__vfmFallback(event)"></span><span><strong>'+(employed?escapeHtml(c.club.name):'Disponível no mercado')+'</strong><small>'+escapeHtml(c.manager.name)+' · '+(employed?escapeHtml(c.club.leagueName):'Treinador sem clube')+'</small></span><i class="manager-face-small avatar-sprite avatar-sprite-'+clamp(c.manager.avatar,1,16)+'" aria-label="Retrato do treinador"></i></div><div class="top-metrics"><span>Data <strong>'+formatDate(c.date)+'</strong></span><span>XP <strong>'+c.manager.xp+'</strong></span><span>Reputação <strong>'+c.manager.reputation+'</strong></span><span>Licença <strong>'+escapeHtml(c.manager.license)+'</strong></span><span>'+(employed?'Saldo':'Status')+' <strong>'+(employed?money(c.budget):'Sem clube')+'</strong></span></div><button class="btn btn-small top-save" data-action="save">'+iconSvg('save')+'<span>Salvar</span></button></header><div class="game-content world-screen-'+escapeHtml(session.screen)+'">'+content+'</div></section></main>';
}

function sectionHead(title,subtitle,extra='') { return '<header class="section-head"><div><p class="eyebrow">Carreira mundial</p><h1>'+escapeHtml(title)+'</h1><p>'+escapeHtml(subtitle)+'</p></div>'+extra+'</header>'; }
function options(values,current) { return values.map(value=>'<option '+(value===current?'selected':'')+'>'+value+'</option>').join(''); }

function confederationClubLabel(confederation) {
  return {UEFA:'Champions League e Europa League',CONMEBOL:'Libertadores e Sul-Americana',CONCACAF:'CONCACAF Champions Cup',AFC:'AFC Champions League Elite',CAF:'CAF Champions League',OFC:'OFC Champions League'}[confederation]||'Competições continentais';
}

function renderWeeklyLoop(c){
  if(ensureManagerCareer(c).status==='unemployed')return '<section class="weekly-loop panel career-search-loop"><header><p class="eyebrow">MERCADO DE TREINADORES</p><strong>Analise propostas e escolha o próximo projeto</strong></header><div><span class="current"><i>1</i><b>Propostas</b></span><span class="pending"><i>2</i><b>Contrato</b></span><span class="pending"><i>3</i><b>Novo clube</b></span></div></section>';
  const scheduled=nextScheduledFixture(),lineupReady=scheduled?.eventOwner==='national'?(c.national?.lineupIds?.length||0)===11:c.lineupIds.length===11;
  const stages=[['Decisões',c.messages.some(message=>!message.read)?'pending':'done'],['Treino',c.lastTrainingWeek===c.week?'done':'current'],['Preparação',lineupReady?'done':'pending'],['Partida',scheduled?'current':'done']];
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

function renderCareerOfferCards(c,compact=false) {
  const offers=Array.isArray(c.jobOffers)?c.jobOffers:[];
  if(!offers.length)return '<div class="career-offers-empty"><strong>Nenhuma proposta ativa</strong><span>A rede de contatos procura um projeto compatível com sua reputação.</span></div>';
  return '<div class="career-offer-grid '+(compact?'compact':'')+'">'+offers.map(club=>{
    const contract=club.careerOffer||{},objective=contract.objective||'Conduzir o projeto esportivo da temporada';
    return '<article class="career-job-card"><img src="./'+escapeHtml(club.badge)+'" alt="Escudo '+escapeHtml(club.name)+'" onerror="__vfmFallback(event)"><div><small>'+escapeHtml(club.leagueName||club.country||'Novo desafio')+'</small><h3>'+escapeHtml(club.name)+'</h3><p>'+escapeHtml(objective)+'</p><span>GER '+club.rating+' · '+(contract.years||2)+' anos · '+money(contract.salary||0)+'/mês</span></div><button class="btn btn-primary" data-action="accept-club-job" data-club="'+escapeHtml(club.id)+'">Assinar contrato</button></article>';
  }).join('')+'</div>';
}

function renderCareerStatus(c) {
  const managerCareer=ensureManagerCareer(c),security=careerSecurity(c.board),employed=managerCareer.status==='employed';
  return '<section class="manager-career-panel panel status-'+security.id+'"><header><div><p class="eyebrow">CARREIRA DO TREINADOR · MOTOR '+MANAGER_CAREER_VERSION+'</p><h2>'+(employed?'Situação contratual':'Disponível no mercado')+'</h2></div><span class="career-security">'+(employed?escapeHtml(security.label):'Sem clube')+'</span></header><div class="manager-contract-grid"><span><small>Clube</small><strong>'+(employed?escapeHtml(c.club.name):'Aguardando proposta')+'</strong></span><span><small>Contrato</small><strong>'+(employed?'até '+managerCareer.contractEndSeason:'Livre')+'</strong></span><span><small>Salário</small><strong>'+(employed?money(managerCareer.salary)+'/mês':'—')+'</strong></span><span><small>Confiança</small><strong>'+(employed?c.board+'%':'—')+'</strong></span></div><p>'+(employed?escapeHtml(security.detail):'Sua reputação, licença e histórico definem os clubes e seleções que podem fazer contato.')+'</p></section>';
}

function renderCareerHistory(c) {
  const items=ensureManagerCareer(c).history.slice().reverse().slice(0,8);
  return '<article class="panel career-timeline"><h2>Linha do tempo</h2><div>'+items.map(item=>'<span class="timeline-'+escapeHtml(item.type)+'"><i></i><strong>'+escapeHtml(item.label)+'</strong><small>'+formatDate(item.date)+'</small></span>').join('')+'</div></article>';
}

function refreshCareerOpportunities(force=false) {
  const c=session.career,managerCareer=ensureManagerCareer(c);
  if(!force&&managerCareer.status==='unemployed'&&(c.jobOffers||[]).length)return false;
  if(!force&&!careerOfferDue(c))return false;
  const played=Math.max(1,Number(c.stats?.played)||0),winRate=(Number(c.stats?.wins)||0)/played;
  const eligible=managerCareer.status==='unemployed'||Number(c.manager?.reputation)>=55||winRate>=.5;
  const previousClubIds=(c.jobOffers||[]).map(item=>item.id).join(',');
  if(eligible)c.jobOffers=createClubJobOffers(c,session.catalog.clubs,managerCareer.status==='unemployed'?4:3);
  else c.jobOffers=[];
  const previousNational=managerCareer.nationalOffers.join(',');
  createNationalJobOffers(c,session.catalog.nationalTeams,3);
  closeCareerOfferCycle(c,managerCareer.status==='unemployed'?4:6);
  if(c.jobOffers.length&&previousClubIds!==c.jobOffers.map(item=>item.id).join(','))c.messages.push({id:'career-offers-'+Date.now(),from:'Agente do treinador',subject:managerCareer.status==='unemployed'?'Clubes fizeram contato':'Novas propostas de trabalho',body:c.jobOffers.map(item=>item.name).join(', ')+' apresentaram projetos para sua carreira. Consulte a área Clube.',date:c.date,read:false,priority:'high'});
  if(managerCareer.nationalOffers.length&&previousNational!==managerCareer.nationalOffers.join(','))c.messages.push({id:'national-offers-'+Date.now(),from:'Agente do treinador',subject:'Convites de seleções nacionais',body:managerCareer.nationalOffers.map(id=>session.catalog.nationalTeams.find(team=>team.id===id)?.name).filter(Boolean).join(', ')+' demonstraram interesse. Consulte a central de seleções.',date:c.date,read:false,priority:'high'});
  return true;
}

function recordTelemetry(type, detail = '') {
  const career=session.career;if(!career)return;
  career.telemetry=Array.isArray(career.telemetry)?career.telemetry:[];
  career.telemetry.push({date:new Date().toISOString(),type:String(type).slice(0,40),screen:session.screen,detail:String(detail||'').slice(0,160)});
  career.telemetry=career.telemetry.slice(-120);
}

function restoreBackup() {
  const backup=safeParse(storageGet(BACKUP_KEY),null),slot=Math.max(0,(session.slot||1)-1),candidate=backup?.slots?.[slot];
  if(!candidate){toast('Nenhum backup compatível foi encontrado para esta carreira.','error');return;}
  session.career=migrateCareer(candidate);ensureWorldState(session.career);store=normalizeStore(backup);store.slots[slot]=session.career;recordTelemetry('save-recovered','backup-local');
  if(!persist()){toast('O backup foi carregado, mas não pôde ser salvo neste navegador.','error');return;}
  navigate('dashboard');toast('Backup local restaurado com segurança.','success');
}

function renderManagerScorecard(c) {
  const xp=Number(c.manager.xp||0),level=Number(c.manager.level||1),progress=xp%500,score=managerCareerScore(c),trophies=(c.trophies||[]).length;
  return '<section class="manager-scorecard"><div class="manager-score-level"><span>NÍVEL</span><strong>'+level+'</strong></div><div class="manager-score-copy"><small>PROGRESSÃO DO TREINADOR · MOTOR '+COMPETITION_CAREER_VERSION+'</small><h2>'+score.toLocaleString('pt-BR')+' pontos de carreira</h2><i><em style="width:'+(progress/5)+'%"></em></i><p><b>'+xp+' XP</b> · '+(500-progress)+' XP para o nível '+(level+1)+' · '+trophies+' '+(trophies===1?'troféu':'troféus')+'</p></div><button class="btn btn-small" data-action="navigate" data-screen="club">Ver sala de troféus</button></section>';
}

function renderDashboard() {
  const c=session.career,next=nextScheduledFixture(),recent=c.fixtures.filter(f=>f.played).slice(-5).reverse(),health=rosterHealthSummary(c.roster),unread=c.messages.filter(m=>!m.read).length;
  const managerCareer=ensureManagerCareer(c),employed=managerCareer.status==='employed',seasonFixtures=c.fixtures.filter(f=>!f.cancelled),seasonPlayed=seasonFixtures.filter(f=>f.played).length,seasonProgress=seasonFixtures.length?Math.round(seasonPlayed/seasonFixtures.length*100):0;
  const table=sortedTable(),leagueRank=Math.max(0,table.findIndex(row=>(row.team.id||row.team.name)===(c.club.id||c.club.name)))+1;
  const managed=next?managedTeamFor(next):c.club,kind=next?competitionKind(next):null;
  const priority=!employed?['club','Escolha seu projeto',c.jobOffers.length+' proposta(s) esperam sua decisão.','Ver propostas']:c.lineupIds.length<11?['squad','Escalação incompleta','Defina os 11 titulares antes do próximo jogo.','Montar equipe']:unread?['inbox','Mensagens pendentes',unread+' mensagem(ns) precisam da sua atenção.','Abrir mensagens']:health.injured.length?['training','Boletim médico',health.injured.length+' atleta(s) estão em recuperação.','Ver departamento médico']:null;
  const matchCard=!employed?'<section class="home-match-card panel home-no-club"><div><small>NOVO PROJETO</small><h2>Você está no mercado</h2><p>Compare metas, elenco e contrato antes de assumir o próximo clube.</p></div><button class="btn btn-primary" data-action="navigate" data-screen="club">Ver propostas</button></section>':next?'<section class="home-match-card panel '+(next.eventOwner==='national'?'is-national':'')+'"><div class="home-match-meta"><span class="competition-emblem">'+(next.eventOwner==='national'?'<img src="./'+escapeHtml(managed.badge)+'" alt="">':competitionLogo(next.competitionId,next.competitionName))+'</span><span><small>'+escapeHtml(kind.label).toUpperCase()+'</small><strong>'+formatDate(next.date)+' · '+(next.home?'Casa':'Fora')+'</strong></span></div><div class="home-match-teams"><div><img src="./'+escapeHtml(managed.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(managed.name)+'</strong></div><b>×</b><div><img src="./'+escapeHtml(next.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(next.opponent.name)+'</strong></div></div><div class="home-match-actions"><button class="btn" data-action="navigate" data-screen="'+(next.eventOwner==='national'?'national':'tactics')+'">'+iconSvg('tactics')+'<span>Tática</span></button><button class="btn btn-primary" data-action="open-next-match">'+iconSvg('play')+'<span>Preparar jogo</span></button></div></section>':'<section class="home-match-card panel home-no-club"><div><small>TEMPORADA</small><h2>Calendário concluído</h2><p>Revise a campanha e avance quando estiver pronto.</p></div><button class="btn btn-primary" data-action="advance-season">Próxima temporada</button></section>';
  const upcoming=allCareerEvents().filter(item=>!item.played&&!item.locked&&!item.cancelled).slice(0,3).map(item=>'<li><time>'+new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short'}).format(new Date(item.date))+'</time><img src="./'+escapeHtml(item.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><span><strong>'+escapeHtml(item.opponent.name)+'</strong><small>'+escapeHtml(item.eventOwner==='national'?'Seleção · ':'')+escapeHtml(item.competitionName)+'</small></span></li>').join('')||'<li class="home-empty-list">Nenhum novo compromisso agendado.</li>';
  const shortcuts=[['competitions','trophy','Competições',leagueRank?leagueRank+'º no '+c.club.leagueName:'Tabela e chaves'],['calendar','calendar','Agenda',seasonProgress+'% da temporada'],['market','market','Mercado','Scouts e negociações'],['club','club','Clube','Diretoria '+c.board+'%']];
  return sectionHead('Início','A próxima decisão e o essencial da carreira.','<span class="home-season-chip">Semana '+c.week+' · '+seasonProgress+'%</span>')+matchCard+
    (priority?'<section class="home-priority panel"><span>'+iconSvg(priority[0]==='inbox'?'inbox':priority[0]==='training'?'training':priority[0]==='club'?'club':'squad')+'</span><div><small>PRECISA DA SUA ATENÇÃO</small><strong>'+escapeHtml(priority[1])+'</strong><p>'+escapeHtml(priority[2])+'</p></div><button class="btn btn-small" data-action="navigate" data-screen="'+priority[0]+'">'+escapeHtml(priority[3])+'</button></section>':'')+
    '<section class="home-snapshot"><article class="panel home-form"><header><span>Campanha</span><button class="text-link" data-action="navigate" data-screen="competitions">Ver tabela</button></header><div><strong>'+c.stats.played+'</strong><small>jogos</small><b>'+c.stats.points+' pts</b></div><div class="form-strip">'+(recent.length?recent.map(f=>'<span class="'+resultClass(f)+'">'+resultLetter(f)+'</span>').join(''):'<small>Primeiro jogo a caminho.</small>')+'</div></article><article class="panel home-inbox"><header><span>Mensagens</span><button class="text-link" data-action="navigate" data-screen="inbox">Abrir</button></header><strong>'+unread+'</strong><p>'+(!unread?'Caixa de entrada em dia.':unread===1?'nova decisão aguardando.':'novas decisões aguardando.')+'</p></article><article class="panel home-upcoming"><header><span>Próximos compromissos</span><button class="text-link" data-action="navigate" data-screen="calendar">Agenda</button></header><ul>'+upcoming+'</ul></article></section>'+
    '<section class="home-shortcuts" aria-label="Atalhos de gestão">'+shortcuts.map(([screen,icon,label,detail])=>'<button data-action="navigate" data-screen="'+screen+'"><span>'+iconSvg(icon)+'</span><div><strong>'+label+'</strong><small>'+escapeHtml(detail)+'</small></div>'+iconSvg('chevron','shortcut-chevron')+'</button>').join('')+'</section>';
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

function renderTacticalRoles(c){
  const roles=ensureTacticalRoles(c),starters=c.lineupIds.map(id=>c.roster.find(player=>player.id===id)).filter(Boolean);
  const effect=roleEffects(starters,roles);
  const rows=starters.map(player=>'<label class="tactical-role-row">'+playerPortrait(player,'small')+'<span><strong>'+escapeHtml(player.name)+'</strong><small>'+escapeHtml(player.pos)+' · '+escapeHtml(roleLabel(player,roles))+'</small></span><select data-action="tactical-role" data-player="'+escapeHtml(player.id)+'">'+options(rolesForPosition(player.pos),roleLabel(player,roles))+'</select></label>').join('');
  return '<section class="panel tactical-roles"><header><div><p class="eyebrow">FUNÇÕES INDIVIDUAIS · '+TACTICAL_ROLES_VERSION+'</p><h3>Responsabilidades dos titulares</h3></div><span class="tag">A '+(effect.attack>=effect.defence?'ofensiva':'defensiva')+' '+(effect.attack>=effect.defence?'+':'')+Math.round(Math.max(effect.attack,effect.defence))+'</span></header><p>As funções alteram ataque, controle e proteção no motor da partida.</p><div>'+rows+'</div></section>';
}

function renderTactics() {
  const c=session.career,t=c.tactics;
  return sectionHead('Tática e escalação','Arraste com dedo ou mouse, defina funções e prepare mudanças para a partida.','<span class="tag">'+c.lineupIds.length+'/11 titulares</span>')+'<div class="tactics-layout"><article class="panel tactical-board">'+formationPreview(c.roster,c.lineupIds,t.formation)+'</article><article class="panel tactics-controls">'+renderTacticalImpact(t)+'<div class="tactics-phase-tabs"><button class="active">Com bola</button><button>Sem bola</button><button>Bolas paradas</button></div><div class="tactics-select-grid"><div class="field"><label>Formação</label><select data-action="formation-select">'+options(Object.keys(FORMATIONS),t.formation)+'</select></div><div class="field"><label>Mentalidade</label><select data-action="mentality-select">'+options(['Defensiva','Equilibrada','Ofensiva'],t.mentality)+'</select></div><div class="field"><label>Construção</label><select data-action="passing-select">'+options(['Curto','Misto','Direto'],t.passing)+'</select></div><div class="field"><label>Marcação</label><select data-action="marking-select">'+options(['Zona','Individual','Híbrida'],t.marking)+'</select></div><div class="field"><label>Transição</label><select data-action="transition-select">'+options(['Reagrupar','Equilibrada','Contra-atacar'],t.transition)+'</select></div></div><label>Pressão <output>'+t.pressure+'</output><input type="range" min="20" max="90" value="'+t.pressure+'" data-action="pressure-range"></label><label>Ritmo <output>'+t.tempo+'</output><input type="range" min="20" max="90" value="'+t.tempo+'" data-action="tempo-range"></label><label>Largura <output>'+t.width+'</output><input type="range" min="25" max="85" value="'+t.width+'" data-action="width-range"></label><label>Linha defensiva <output>'+t.defensiveLine+'</output><input type="range" min="20" max="85" value="'+t.defensiveLine+'" data-action="line-range"></label><button class="btn action-with-icon tactics-action" data-action="reset-tactical-shape">'+iconSvg('tactics')+'<span>Restaurar desenho</span></button><p class="muted">Toque em um atleta e depois em outro também funciona como alternativa ao arrastar.</p></article></div>'+renderTacticalRoles(c);
}

function zoneFor(row,index,total,rules) {
  if (rules.promotion && index<rules.promotion) return 'promotion';
  const continental=rules.continental||{};
  for (const [id,range] of Object.entries(continental)) if(index+1>=range[0]&&index+1<=range[1]) return id;
  if (rules.relegation && index>=total-rules.relegation) return 'relegation';
  return '';
}

function sortedTable() { return session.career.table.slice().sort((a,b)=>b.points-a.points||b.wins-a.wins||b.gd-a.gd||b.gf-a.gf||b.team.rating-a.team.rating); }

function standingsTableMarkup(table,title,managedId,subtitle='Classificação atual') {
  const rows=table.map((row,index)=>'<tr class="'+((row.team.id||row.team.name)===managedId?'managed-row':'')+'"><td>'+(index+1)+'</td><td><div class="mini-club"><img src="./'+escapeHtml(row.team.badge||'assets/placeholders/club-generic.png')+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(row.team.name)+'</strong></div></td><td>'+row.played+'</td><td>'+row.wins+'</td><td>'+row.draws+'</td><td>'+row.losses+'</td><td>'+row.gd+'</td><td><strong>'+row.points+'</strong></td></tr>').join('');
  return '<section class="panel phase-table"><header><div><p class="eyebrow">'+escapeHtml(subtitle)+'</p><h2>'+escapeHtml(title)+'</h2></div><span class="tag">'+table.length+' participantes</span></header><div class="table-wrap"><table class="data-table standings-table"><thead><tr><th>#</th><th>Equipe</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>PTS</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}

function renderContinentalTables(c) {
  const ids=[...new Set(c.fixtures.filter(f=>f.type==='continental'&&(f.phase==='league'||f.phase==='group')).map(f=>f.competitionId))];
  return ids.map(id=>{const fixtures=c.fixtures.filter(f=>f.competitionId===id&&(f.phase==='league'||f.phase==='group')&&!f.cancelled),name=fixtures[0]?.competitionName||'Competição continental',table=deriveCompetitionTable(c.club,fixtures,c.season+':'+id),rule=fixtures[0]?.formatRule||'Fase de grupos';return standingsTableMarkup(table,name,c.club.id,'GRUPO '+(fixtures[0]?.group||'')+' · '+rule);}).join('');
}

function renderWorldTournaments(c) {
  const all=worldTournamentSummary(c.worldState?.tournaments),continental=all.filter(item=>item.kind==='continental').slice(0,8),cups=all.filter(item=>item.kind==='domestic-cup').slice(0,8);
  const cards=list=>list.map(item=>'<article class="world-tournament-card"><div><span>'+escapeHtml(item.kind==='continental'?'CONTINENTAL':'COPA NACIONAL')+'</span><strong>'+escapeHtml(item.name)+'</strong><small>'+escapeHtml(item.stage)+' · '+item.participants+' clubes</small></div><b>'+escapeHtml(item.champion?.name||'Em disputa')+'</b></article>').join('');
  const qualification=clubWorldQualification(c.worldState?.tournaments,c.club.id);
  return '<section class="panel world-tournaments"><header><div><p class="eyebrow">MUNDO PERSISTENTE · '+WORLD_TOURNAMENT_VERSION+'</p><h2>Chaves, sorteios e vagas continentais</h2><p>Cada torneio evolui para todos os clubes a cada semana. Os resultados e campeões ficam gravados no save.</p></div><span class="tag">'+(qualification?escapeHtml(qualification.competition.replaceAll('-',' ')):'vaga em disputa')+'</span></header><div class="world-tournament-grid"><div><h3>Competições continentais</h3>'+cards(continental)+'</div><div><h3>Copas nacionais</h3>'+cards(cups)+'</div></div></section>';
}

function competitionEntries(c) {
  return [...new Set(c.fixtures.map(fixture=>fixture.competitionId))].map(id=>{
    const fixtures=currentCompetitionFixtures(id).slice().sort((a,b)=>new Date(a.date)-new Date(b.date));
    const first=fixtures[0]||{},next=fixtures.find(fixture=>!fixture.played&&!fixture.locked);
    return {id,name:first.competitionName||id,fixtures,type:first.type||'league',next,played:fixtures.filter(fixture=>fixture.played).length};
  });
}

function selectedCompetition(c) {
  const entries=competitionEntries(c);
  if(!entries.length)return {id:c.club.leagueId,name:c.club.leagueName,fixtures:[],type:'league',next:null,played:0};
  if(!entries.some(entry=>entry.id===session.competitionId))session.competitionId=entries.find(entry=>entry.id===c.club.leagueId)?.id||entries[0].id;
  return entries.find(entry=>entry.id===session.competitionId)||entries[0];
}

function selectedCompetitionTable(c,competition) {
  if(competition.id===c.club.leagueId)return sortedTable();
  if(['continental','league'].includes(competition.type))return deriveCompetitionTable(c.club,competition.fixtures,c.season+':'+competition.id);
  return [];
}

function selectedCompetitionStats(c,competition,table) {
  const played=competition.fixtures.filter(fixture=>fixture.played),scores=played.map(fixture=>({for:fixture.home?fixture.score.home:fixture.score.away,against:fixture.home?fixture.score.away:fixture.score.home}));
  const wins=scores.filter(score=>score.for>score.against).length,draws=scores.filter(score=>score.for===score.against).length,goals=scores.reduce((total,score)=>total+Number(score.for||0),0);
  const rank=table.findIndex(row=>(row.team.id||row.team.name)===(c.club.id||c.club.name))+1;
  return {played:played.length,wins,draws,goals,points:wins*3+draws,rank};
}

function competitionFixtureList(competition,c) {
  const items=competition.fixtures.map(fixture=>{
    const score=fixture.played?((fixture.home?fixture.score.home:fixture.score.away)+'–'+(fixture.home?fixture.score.away:fixture.score.home)):fixture.cancelled?'Eliminado':fixture.locked?'A definir':'—';
    const status=fixture.played?'played':fixture.locked?'locked':fixture.cancelled?'cancelled':'scheduled';
    return '<li class="competition-fixture '+status+'"><time>'+formatDate(fixture.date)+'</time><div><img src="./'+escapeHtml(c.club.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(c.club.name)+'</strong></div><b>'+score+'</b><div><img src="./'+escapeHtml(fixture.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(fixture.opponent.name)+'</strong></div><small>'+escapeHtml(fixture.stage||'Rodada '+fixture.round)+' · '+(fixture.home?'Casa':'Fora')+'</small></li>';
  }).join('')||'<li class="competition-empty">Calendário ainda será definido.</li>';
  return '<section class="panel competition-fixtures"><header><div><p class="eyebrow">CALENDÁRIO DA COMPETIÇÃO</p><h2>Jogos</h2></div><span class="tag">'+competition.fixtures.length+' compromisso(s)</span></header><ul>'+items+'</ul></section>';
}

function competitionPath(competition) {
  const stages=competition.fixtures.filter(fixture=>fixture.type==='cup'||fixture.phase==='knockout');
  if(!stages.length)return '<div class="competition-empty">A classificação geral define o próximo objetivo desta competição.</div>';
  return '<div class="competition-path">'+stages.map(fixture=>'<article class="'+(fixture.played?'done':fixture.cancelled?'cancelled':fixture.locked?'locked':'active')+'"><small>'+escapeHtml(fixture.stage||'Fase')+'</small><strong>'+escapeHtml(fixture.opponent.name)+'</strong><span>'+escapeHtml(describeFixtureFormat(fixture))+'</span><b>'+((fixture.played)?fixture.score.home+'–'+fixture.score.away:fixture.locked?'Sorteio':'A jogar')+'</b></article>').join('')+'</div>';
}

function competitionTablePanel(c,competition,table) {
  if(!table.length)return '<section class="panel competition-path-panel"><header><div><p class="eyebrow">CHAVE DA COMPETIÇÃO</p><h2>'+escapeHtml(competition.name)+'</h2></div><span class="tag">Mata-mata</span></header>'+competitionPath(competition)+'</section>';
  return standingsTableMarkup(table,competition.name,c.club.id,competition.type==='continental'?'Classificação continental':'Classificação atual');
}

function renderCompetitions() {
  const c=session.career,competition=selectedCompetition(c),entries=competitionEntries(c),table=selectedCompetitionTable(c,competition),stats=selectedCompetitionStats(c,competition,table),league=findLeague(c.club.leagueId);
  const tabs=[['overview','Visão geral'],['table',table.length?'Tabela':'Chave'],['fixtures','Jogos'],['rules','Regulamento']];
  const controls='<section class="competition-console panel"><label><span>Competição</span><select data-action="competition-select">'+entries.map(entry=>'<option value="'+escapeHtml(entry.id)+'" '+(entry.id===competition.id?'selected':'')+'>'+escapeHtml(entry.name)+'</option>').join('')+'</select></label><div class="competition-tabs">'+tabs.map(([id,label])=>'<button class="'+(session.competitionTab===id?'active':'')+'" data-action="competition-tab" data-tab="'+id+'">'+label+'</button>').join('')+'</div></section>';
  const summary='<section class="competition-focus panel"><div class="competition-focus-title"><span class="competition-logo">'+competitionLogo(competition.id,competition.name)+'</span><div><small>'+escapeHtml(competition.type==='continental'?'COMPETIÇÃO CONTINENTAL':competition.type==='cup'?'COPA NACIONAL':'CAMPEONATO')+'</small><h2>'+escapeHtml(competition.name)+'</h2><p>'+stats.played+'/'+competition.fixtures.length+' jogos realizados'+(competition.next?' · próximo em '+formatDate(competition.next.date):' · campanha atualizada')+'</p></div></div><div class="competition-kpis"><span><small>Posição</small><strong>'+((stats.rank)||'—')+'</strong></span><span><small>Pontos</small><strong>'+stats.points+'</strong></span><span><small>Vitórias</small><strong>'+stats.wins+'</strong></span><span><small>Gols</small><strong>'+stats.goals+'</strong></span></div></section>';
  const rules=competition.id===c.club.leagueId?rulesText(league):[competition.type==='cup'?domesticCupFormat(c.club.countryId).label:'Fase e tabela persistidas no save',competition.next?'Próxima etapa: '+(competition.next.stage||'Rodada '+competition.next.round):'Classificação atualiza os próximos confrontos'];
  let content='';
  if(session.competitionTab==='table')content=competitionTablePanel(c,competition,table);
  else if(session.competitionTab==='fixtures')content=competitionFixtureList(competition,c);
  else if(session.competitionTab==='rules')content='<section class="panel competition-rules-panel"><header><div><p class="eyebrow">REGULAMENTO E PROGRESSÃO</p><h2>Como funciona</h2></div></header><ul>'+rules.map(rule=>'<li>'+escapeHtml(rule)+'</li>').join('')+'</ul>'+competitionPath(competition)+'</section>';
  else content=summary+'<div class="competition-focus-grid">'+competitionTablePanel(c,competition,table)+competitionFixtureList(competition,c)+'</div><details class="competition-world-summary"><summary>Ver torneios e líderes do mundo</summary>'+renderWorldTournaments(c)+'</details>';
  return sectionHead('Competições','Escolha um torneio. Tabela, calendário e regras aparecem no mesmo lugar.')+controls+'<div class="competition-workspace">'+content+'</div>';
}

function rulesText(league) {
  const rules=league.rules||{},profile=regulationForLeague(league,session.career?.season),calendar=regulationCalendarSummary(profile),result=[];
  const regulation=league?.rules?.format||'double-round-robin';
  if(regulation==='double-round-robin')result.push('Turno e returno · rodadas persistidas');
  else result.push(regulation.replaceAll('-',' ')+' · calendário e classificação persistidos');
  result.push('Desempate: pontos, vitórias, saldo e gols pró');
  if(rules.promotionDirect)result.push('1º–'+rules.promotionDirect+'º: acesso direto');
  else if(rules.promotion)result.push('1º–'+rules.promotion+'º: acesso');
  if(rules.promotionPlayoff)result.push(rules.promotionPlayoff[0]+'º–'+rules.promotionPlayoff[1]+'º: playoff de acesso');
  if(rules.continental)Object.entries(rules.continental).forEach(([id,range])=>result.push(range[0]+'º–'+range[1]+'º: '+id.replaceAll('-',' ')));
  if(rules.relegation)result.push('Últimos '+rules.relegation+': rebaixamento');
  if(profile.relegationMethod==='promedio')result.push('Descenso: média de pontos por jogo');
  if(profile.playIn)result.push('Play-in: '+profile.playIn[0]+'º ao '+profile.playIn[1]+'º');
  if(calendar.start)result.push('Calendário: '+calendar.start+' → '+(calendar.regularEnd||calendar.end));
  if(calendar.playoffs?.length)result.push('Datas do playoff: '+calendar.playoffs.map(([date,label])=>label+' · '+date).join(' | '));
  if(calendar.breaks?.length)result.push('Pausa oficial integrada ao calendário');
  if(rules.verification)result.push('Regra: '+rules.verification.replaceAll('-',' '));
  return result;
}

function dateKey(value){const date=new Date(value);return date.getFullYear()+'-'+String(date.getMonth()+1).padStart(2,'0')+'-'+String(date.getDate()).padStart(2,'0');}
function allCareerEvents(){const c=session.career;if(c.national)ensureNationalCalendar(c.national);const club=c.fixtures.map(f=>({...f,eventOwner:'club'})),national=(c.national?.fixtures||[]).map(f=>({...f,eventOwner:'national'}));return [...club,...national].sort((a,b)=>new Date(a.date)-new Date(b.date));}
function filteredCalendarEvents(){return allCareerEvents().filter(event=>session.calendarFilter==='all'||session.calendarFilter===event.eventOwner||session.calendarFilter===event.type||session.calendarFilter===event.competitionId);}
function calendarEventChip(event){const status=event.cancelled?'cancelled':event.played?'played':event.locked?'provisional':'confirmed',kind=competitionKind(event);return '<span class="calendar-event '+status+' type-'+event.type+' kind-'+kind.id+'"><em>'+escapeHtml(event.eventOwner==='national'?kind.short:event.competitionName)+'</em><img src="./'+escapeHtml(event.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><b>'+escapeHtml(event.opponent.name)+'</b><small>'+(event.cancelled?'ELIMINADO':event.played?event.score.home+'–'+event.score.away:event.locked?'AGUARDANDO':event.home?'CASA':'FORA')+'</small></span>';}
function monthGrid(date,compact=false){const year=date.getFullYear(),month=date.getMonth(),first=new Date(year,month,1),days=new Date(year,month+1,0).getDate(),offset=(first.getDay()+6)%7,events=filteredCalendarEvents();let cells='';for(let i=0;i<offset;i++)cells+='<span class="calendar-day empty"></span>';for(let day=1;day<=days;day++){const key=dateKey(new Date(year,month,day)),items=events.filter(event=>dateKey(event.date)===key),today=key===dateKey(session.career.date);cells+='<button class="calendar-day '+(items.length?'has-events ':'')+(today?'is-today':'')+'" data-action="calendar-day" data-date="'+key+'"><strong>'+day+'</strong>'+items.slice(0,compact?2:3).map(calendarEventChip).join('')+(items.length>(compact?2:3)?'<em>+'+(items.length-(compact?2:3))+'</em>':'')+'</button>';}return '<section class="calendar-month '+(compact?'compact':'')+'"><header><h2>'+new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(date)+'</h2></header><div class="calendar-weekdays">'+['SEG','TER','QUA','QUI','SEX','SÁB','DOM'].map(day=>'<span>'+day+'</span>').join('')+'</div><div class="calendar-days">'+cells+'</div></section>';}
function yearCalendar(date){return '<div class="calendar-year-grid">'+Array.from({length:12},(_,month)=>monthGrid(new Date(date.getFullYear(),month,1),true)).join('')+'</div>';}
function weekCalendar(date){const start=new Date(date);start.setDate(start.getDate()-((start.getDay()+6)%7));const events=filteredCalendarEvents();return '<div class="calendar-week-grid">'+Array.from({length:7},(_,index)=>{const day=new Date(start);day.setDate(start.getDate()+index);const key=dateKey(day),items=events.filter(event=>dateKey(event.date)===key);return '<button class="calendar-week-day" data-action="calendar-day" data-date="'+key+'"><span>'+new Intl.DateTimeFormat('pt-BR',{weekday:'short'}).format(day)+'</span><strong>'+day.getDate()+'</strong><small>'+new Intl.DateTimeFormat('pt-BR',{month:'short'}).format(day)+'</small>'+items.map(calendarEventChip).join('')+(items.length?'<em>'+items.length+' evento(s)</em>':'<em>Recuperação / treino</em>')+'</button>';}).join('')+'</div>';}
function renderCalendar() {
  const c=session.career,events=allCareerEvents(),view=session.calendarView,date=session.calendarDate,next=nextScheduledFixture();
  const body=view==='year'?yearCalendar(date):view==='week'?weekCalendar(date):monthGrid(date);
  return sectionHead('Agenda anual','Clube e seleção avançam pela mesma linha do tempo, sem perder Datas FIFA.','<span class="tag">'+c.season+'</span>')+(next?'<section class="calendar-next panel '+(next.eventOwner==='national'?'is-national':'')+'"><div><small>PRÓXIMO COMPROMISSO · '+escapeHtml(competitionKind(next).short)+'</small><strong>'+escapeHtml(managedTeamFor(next).name)+' × '+escapeHtml(next.opponent.name)+'</strong><span>'+formatDate(next.date)+' · '+escapeHtml(competitionKind(next).label)+'</span></div><button class="btn btn-primary" data-action="open-next-match">Avançar para a partida</button></section>':'')+'<div class="calendar-command"><div><button class="btn btn-small" data-action="calendar-shift" data-shift="-1">‹</button><button class="btn btn-small" data-action="calendar-today">Hoje</button><button class="btn btn-small" data-action="calendar-shift" data-shift="1">›</button></div><div><select data-action="calendar-view"><option value="month" '+(view==='month'?'selected':'')+'>Mês</option><option value="week" '+(view==='week'?'selected':'')+'>Semana</option><option value="year" '+(view==='year'?'selected':'')+'>Ano</option></select><select data-action="calendar-filter"><option value="all">Todos</option><option value="club" '+(session.calendarFilter==='club'?'selected':'')+'>Clube</option><option value="national" '+(session.calendarFilter==='national'?'selected':'')+'>Seleção</option><option value="league" '+(session.calendarFilter==='league'?'selected':'')+'>Liga</option><option value="cup" '+(session.calendarFilter==='cup'?'selected':'')+'>Copas</option><option value="continental" '+(session.calendarFilter==='continental'?'selected':'')+'>Continental</option></select></div></div><div class="calendar-summary"><span><strong>'+events.filter(f=>f.eventOwner==='club'&&!f.played&&!f.cancelled).length+'</strong> jogos do clube</span><span><strong>'+events.filter(f=>f.eventOwner==='national'&&!f.played&&!f.cancelled).length+'</strong> jogos da seleção</span><span><strong>'+events.filter(f=>f.played).length+'</strong> concluídos</span></div>'+body;
}

function openCalendarDay(key){const items=allCareerEvents().filter(event=>dateKey(event.date)===key),next=nextScheduledFixture();const date=new Date(key+'T12:00:00');showModal(new Intl.DateTimeFormat('pt-BR',{dateStyle:'full'}).format(date),items.length?'<div class="day-event-list">'+items.map(event=>{const kind=competitionKind(event);return '<article class="'+(event.eventOwner==='national'?'national-day-event':'')+'"><img src="./'+escapeHtml(event.opponent.badge)+'" alt=""><div><small>'+escapeHtml(event.eventOwner==='national'?'SELEÇÃO · '+kind.short:'CLUBE · '+kind.short)+'</small><strong>'+escapeHtml(kind.label)+'</strong><span>'+escapeHtml(event.opponent.name)+' · '+(event.stage||'Rodada '+event.round)+'</span><em>'+(event.played?'Concluído: '+event.score.home+'–'+event.score.away:event.locked?'Aguardando classificação':event.home?'Em casa':'Fora de casa')+'</em></div>'+(event.id===next?.id?'<button class="btn btn-primary btn-small" data-action="open-next-match">Jogar</button>':'')+'</article>';}).join('')+'</div>':'<p>Dia livre para recuperação, treino, scouting e compromissos administrativos.</p>');}

function latestMatchAnalysis(){
  const report=session.career.matchReports?.[0];if(!report)return '';
  const causes=(report.signals||[]).map(item=>'<li><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.detail)+'</span></li>').join('');
  const players=(report.performers||[]).slice(0,3).map(item=>'<div><span>'+escapeHtml(item.name)+'</span><strong>'+Number(item.rating).toFixed(1)+'</strong></div>').join('');
  return '<section class="panel saved-match-analysis"><header><div><p class="eyebrow">ÚLTIMA ANÁLISE · MOTOR '+escapeHtml(report.engineVersion||MATCH_ENGINE_V2_VERSION)+'</p><h2>'+escapeHtml(report.opponent)+' · '+escapeHtml(report.score)+'</h2></div><span class="tag">'+escapeHtml(report.result||'partida')+'</span></header><p>'+escapeHtml(report.verdict||'Relatório de desempenho disponível.')+'</p><div class="analysis-numbers"><span>xG <strong>'+Number(report.ownXg||0).toFixed(1)+'–'+Number(report.opponentXg||0).toFixed(1)+'</strong></span><span>Posse <strong>'+Number(report.ownPossession||0)+'%</strong></span></div>'+(causes?'<ul class="causal-list">'+causes+'</ul>':'')+(players?'<div class="saved-ratings">'+players+'</div>':'')+'</section>';
}

function renderMatchCenter() {
  const next=nextScheduledFixture(),team=next?managedTeamFor(next):session.career.club,candidate=String(next?.opponent?.stadium||''),stadium=/\.(?:avif|webp|png|jpe?g)$/i.test(candidate)?candidate:'assets/placeholders/stadium-generic.jpg',kind=competitionKind(next||{});
  return sectionHead('Centro de partida','O compromisso mais próximo do clube ou da seleção aparece automaticamente.')+(next?'<div class="match-prep '+(next.eventOwner==='national'?'national-match-prep':'')+'"><article class="panel match-poster" style="background-image:linear-gradient(rgba(5,12,22,.58),rgba(5,12,22,.88)),url(\'./'+escapeHtml(stadium)+'\')"><span class="competition-pill competition-pill-logo">'+(next.eventOwner==='national'?'<img class="competition-pill-image" src="./'+escapeHtml(team.badge)+'" alt="">':competitionLogo(next.competitionId,next.competitionName,'competition-pill-image'))+'<b>'+escapeHtml(kind.label)+'</b></span><div class="versus-row large"><div><img src="./'+escapeHtml(team.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(team.name)+'</strong></div><b>VS</b><div><img src="./'+escapeHtml(next.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><strong>'+escapeHtml(next.opponent.name)+'</strong></div></div><p>'+formatDate(next.date)+' · '+(next.home?'Em casa':'Fora de casa')+' · '+(next.eventOwner==='national'?'Seleção nacional':'Clube')+'</p><button class="btn btn-primary action-with-icon matchday-action" data-action="open-next-match">'+iconSvg('play')+'<span>Entrar em campo</span></button></article><article class="panel match-plan-card"><span class="match-plan-icon">'+iconSvg('tactics')+'</span><h2>Plano de jogo</h2><p><strong>'+session.career.tactics.formation+'</strong> · '+escapeHtml(session.career.tactics.mentality)+'</p><p>Pressão '+session.career.tactics.pressure+' · Ritmo '+session.career.tactics.tempo+'</p><p>'+fixtureLineupCount(next)+' titulares confirmados.</p><button class="btn action-with-icon tactics-action" data-action="navigate" data-screen="'+(next.eventOwner==='national'?'national':'tactics')+'">'+iconSvg(next.eventOwner==='national'?'national':'tactics')+'<span>'+(next.eventOwner==='national'?'Ver convocação':'Ajustar tática')+'</span></button></article></div>':'<div class="panel empty-state"><strong>Temporada concluída</strong><span>Consulte o resumo e avance para a próxima época.</span></div>')+latestMatchAnalysis();
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
  const c=session.career,network=ensureMarketIntelligence(c),marketSeed=c.club.id+':'+c.season+':'+c.week;
  const candidates=session.catalog.clubs.filter(club=>club.rosterPath&&club.id!==c.club.id).sort((a,b)=>stableNumber(marketSeed+a.id)-stableNumber(marketSeed+b.id)).slice(0,6+c.facilities.scouting*3);
  const rosters=await Promise.all(candidates.map(async club=>{try{const data=await fetchJson(club.rosterPath);return (data.players||[]).map(normalizePlayer).sort((a,b)=>Math.abs(a.overall-session.career.club.rating)-Math.abs(b.overall-session.career.club.rating)).slice(0,4).map(p=>{const identity=club.id+':'+p.id;return hydrateMarketProfile({...p,id:identity,basePlayerId:p.id,marketIdentity:identity,sourceClub:club.name,sourceClubId:club.id,marketRegion:club.continent},c,club);});}catch{return[];}}));
  const owned=new Set(session.career.roster.map(p=>p.id));
  const observed=rosters.flat(),rival=registerRivalPlayers(c,session.catalog,observed),staticCandidates=observed.filter(player=>rival.players[player.marketIdentity||player.id]?.ownerId===player.sourceClubId),transferred=rivalMarketCandidates(c,session.catalog,candidates.map(club=>club.id)).map(player=>hydrateMarketProfile(normalizePlayer(player),c,{continent:player.marketRegion})),byIdentity=new Map();
  [...staticCandidates,...transferred].forEach(player=>{const identity=player.marketIdentity||player.id;if(!byIdentity.has(identity))byIdentity.set(identity,player);});
  session.market=[...byIdentity.values()].filter(p=>!owned.has(p.id)&&p.sourceClubId!==c.club.id).sort((a,b)=>Math.abs(a.overall-c.club.rating)-Math.abs(b.overall-c.club.rating)-((network.regions[b.marketRegion]||0)-(network.regions[a.marketRegion]||0))*.04).slice(0,24);
  session.marketLoading=false;if(session.screen==='market')renderGame(renderMarket());
}

function renderMarketPressure(c) {
  const pressure=refreshMarketPressure(c,c.week),rows=pressure.entries.slice(0,4).map(item=>'<li class="market-risk-'+item.level+'"><span><strong>'+escapeHtml(item.playerName)+'</strong><small>'+escapeHtml(item.position)+' · '+escapeHtml(item.reasons.join(', '))+'</small></span><b>'+item.risk+'%</b><button class="btn btn-small" data-action="player-report" data-player="'+escapeHtml(item.playerId)+'">Gerir</button></li>').join('');
  return '<section class="panel market-pressure-panel"><header><div><p class="eyebrow">VESTIÁRIO E MERCADO</p><h2>Risco de perder jogadores</h2><p>Satisfação, contrato, empresário e interesse externo criam pressão concreta por renovação ou venda.</p></div><span class="tag">'+pressure.entries.length+' alerta(s)</span></header><ul>'+ (rows||'<li class="market-risk-stable"><span><strong>Elenco protegido</strong><small>Não há atleta com pressão de mercado relevante.</small></span><b>OK</b></li>') +'</ul></section>';
}

function renderMarket() {
  const c=session.career,network=ensureMarketIntelligence(c),payroll=c.roster.reduce((sum,p)=>sum+Number(p.salary||0)*1000,0),future=(c.transferObligations||[]).reduce((sum,item)=>sum+Number(item.remainingBalance||0),0);
  const marketPlayers=session.market.filter(p=>(session.marketPosition==='TODOS'||p.pos===session.marketPosition)&&(session.marketBudget!=='affordable'||marketValue(p,c.date)*1.05<=c.budget)&&(session.marketRegion==='all'||p.marketRegion===session.marketRegion));
  const filters='<div class="market-filters"><label>Posição<select data-action="market-position">'+options(['TODOS',...new Set(session.market.map(p=>p.pos))],session.marketPosition)+'</select></label><label>Região<select data-action="market-region"><option value="all">Rede completa</option>'+scoutRegions().map(region=>'<option value="'+region.id+'" '+(session.marketRegion===region.id?'selected':'')+'>'+region.label+' · '+network.regions[region.id]+'%</option>').join('')+'</select></label><label>Investimento<select data-action="market-budget"><option value="all">Todos os atletas</option><option value="affordable" '+(session.marketBudget==='affordable'?'selected':'')+'>Valor dentro do caixa</option></select></label></div>';
  const scouts='<section class="market-scout-network panel"><header><div><p class="eyebrow">REDE DE OBSERVAÇÃO</p><h2>Conhecimento por região</h2></div><span class="tag">Foco: '+escapeHtml(scoutRegions().find(r=>r.id===network.focus)?.label||'América do Sul')+'</span></header><div>'+scoutRegions().map(region=>'<button class="scout-region '+(network.focus===region.id?'focused':'')+'" data-action="invest-scout" data-region="'+region.id+'"><strong>'+escapeHtml(region.label)+'</strong><span><i style="width:'+network.regions[region.id]+'%"></i></span><em>'+network.regions[region.id]+'%</em></button>').join('')+'</div><small>Toque numa região para investir R$ 650 mil e ampliar relatórios, conhecimento e oportunidades.</small></section>';
  const rival=ensureRivalCareer(c,session.catalog),brief=rivalMarketBrief(c),rivalMoves=brief.moves.map(move=>'<li><strong>'+escapeHtml(move.to)+'</strong><span>'+escapeHtml(move.player)+' · '+money(move.fee)+'</span><small>de '+escapeHtml(move.from)+' · '+escapeHtml(move.reason)+'</small></li>').join('')||'<li><span>Os rivais ainda analisam oportunidades.</span></li>',spenders=brief.biggestSpenders.map(club=>'<span>'+escapeHtml(club.name)+' · '+money(club.budget)+'</span>').join(''),lostDeals=brief.negotiations.map(item=>'<li><strong>'+escapeHtml(item.player)+'</strong><span>'+escapeHtml(item.winner)+' levou a negociação</span></li>').join('')||'<li><span>Nenhuma disputa direta perdida nesta carreira.</span></li>',freeAgents=brief.freeAgents.map(player=>'<li><strong>'+escapeHtml(player.name)+'</strong><span>'+escapeHtml(player.pos)+' · GER '+player.overall+' · livre</span></li>').join('')||'<li><span>Nenhum atleta monitorado está livre.</span></li>',managerChanges=brief.managerChanges.map(change=>'<li><strong>'+escapeHtml(change.club)+'</strong><span>'+escapeHtml(change.next)+'</span></li>').join('')||'<li><span>Sem troca de treinador recente.</span></li>';
  const rivalPanel='<section class="panel rival-market-panel"><header><div><p class="eyebrow">MERCADO DOS RIVAIS · '+RIVAL_CAREER_VERSION+'</p><h2>Clubes negociam com estratégia própria</h2><p>'+brief.clubs+' clubes têm orçamento, carências, ambição, treinador e atletas rastreados entre temporadas.</p></div><span class="tag '+(brief.window.active?'':'muted')+'">'+escapeHtml(brief.window.label)+'</span></header><div class="rival-market-grid"><article><h3>Últimas negociações</h3><ul>'+rivalMoves+'</ul></article><article><h3>Disputas pela sua lista</h3><ul>'+lostDeals+'</ul><h3>Atletas livres</h3><ul>'+freeAgents+'</ul></article><article><h3>Caixa para investir</h3><div class="rival-spenders">'+spenders+'</div><h3>Mudanças técnicas</h3><ul>'+managerChanges+'</ul><small>'+ (brief.window.active?'Janela ativa: elencos dos rivais e atletas livres podem alterar as opções da sua rede.':'Fora da janela principal: clubes seguem observando, renovando e planejando.') +'</small></article></div></section>';
  const cards=marketPlayers.map(p=>'<article class="market-card"><div class="market-player">'+playerPortrait(p,'medium')+'<div><strong>'+escapeHtml(p.name)+'</strong><small>'+escapeHtml(p.pos)+' · '+p.age+' anos · '+escapeHtml(p.sourceClub||'')+'</small><em>'+escapeHtml(p.personality)+' · '+escapeHtml(scoutRegions().find(r=>r.id===p.marketRegion)?.label||p.marketRegion)+'</em></div></div><div class="market-value"><span>GER <strong>'+p.overall+'</strong></span><span>'+ (p.freeAgent?'Sem taxa':money(marketValue(p,c.date))) +'</span><small>Scout '+p.knowledge+'% · interesse '+p.marketInterest+'%</small></div><div class="market-actions"><button class="btn btn-small" data-action="player-report" data-player="'+escapeHtml(p.id)+'">Relatório</button><button class="btn btn-small" data-action="loan-player" data-player="'+escapeHtml(p.id)+'" '+(p.freeAgent?'disabled':'')+'>Empréstimo</button><button class="btn btn-primary btn-small" data-action="buy-player" data-player="'+escapeHtml(p.id)+'">Negociar</button></div></article>').join('');
  return sectionHead('Mercado internacional','Empresários, cláusulas, bônus, interesse e uma rede de scouts regional orientam cada contratação.','<span class="tag">'+money(c.budget)+'</span>')+'<div class="market-budget-strip"><span>Caixa <strong>'+money(c.budget)+'</strong></span><span>Folha <strong>'+money(payroll)+' / '+money(c.transferPolicy.wageBudget)+'</strong></span><span>Parcelas futuras <strong>'+money(future)+'</strong></span><span>Vagas <strong>'+c.roster.length+' / '+c.transferPolicy.maxSquad+'</strong></span></div>'+renderMarketPressure(c)+rivalPanel+scouts+filters+'<div class="market-grid">'+(session.marketLoading?'<div class="panel">Carregando rede mundial…</div>':cards||'<div class="panel">Nenhuma oportunidade disponível.</div>')+'</div>';
}

function renderFacilitiesCampus(c){
  ensureEconomy(c);
  return '<section class="club-campus panel phase9-campus"><header><div><p class="eyebrow">PATRIMÔNIO DO CLUBE</p><h2>Campus e instalações</h2></div><small>Veja cada estrutura, compare o impacto e acompanhe sua evolução</small></header><div class="facility-cards">'+Object.entries(FACILITIES).map(([id,spec])=>{
    const level=c.facilities[id],q=facilityQuote(c,id),project=c.construction.find(p=>p.id===id),progress=project?clamp((new Date(c.date)-new Date(project.startedAt))/(new Date(project.finishAt)-new Date(project.startedAt))*100,0,100):0;
    return '<article class="facility-card" style="--facility-color:'+spec.color+'"><div class="facility-art level-'+level+'"><img src="'+FACILITY_MEDIA[id]+'" alt="'+escapeHtml(spec.name)+'" loading="lazy"><span class="facility-icon">'+iconSvg(spec.icon)+'</span><div class="facility-level"><strong>Nível '+level+'</strong><small>'+(level>=5?'Elite':'de 5')+'</small></div><div class="facility-tiers">'+Array.from({length:5},(_,i)=>'<i class="'+(i<level?'built':'')+'"></i>').join('')+'</div></div><div class="facility-copy"><small>'+escapeHtml(spec.name).toUpperCase()+'</small><h3>'+(level>=5?'Referência mundial':'Estrutura em evolução')+'</h3><p>'+spec.benefit+'</p>'+(project?'<strong>Em obras · entrega '+formatDate(project.finishAt)+'</strong><progress max="100" value="'+progress+'" aria-label="Progresso da obra"></progress>':level>=5?'<strong>Estrutura de elite em operação</strong>':'<span>'+money(q.cost)+' · '+q.duration+' dias</span><button class="btn" data-action="upgrade-facility" data-facility="'+id+'">Ver projeto de expansão</button>')+'</div></article>';
  }).join('')+'</div></section>';
}

function renderSponsorPanel(c){if(!c.sponsor&&!c.sponsorOffers.length)c.sponsorOffers=generateSponsorOffers(c.club,c.facilities);if(c.sponsor)return '<article class="panel sponsor-panel"><p class="eyebrow">PARCEIRO PRINCIPAL</p><h2>'+escapeHtml(c.sponsor.name)+'</h2><div class="world-metric-grid"><div><span>Contrato</span><strong>'+c.sponsor.years+' anos</strong></div><div><span>Receita anual</span><strong>'+money(c.sponsor.annual)+'</strong></div><div><span>Bônus por vitória</span><strong>'+money(c.sponsor.winBonus)+'</strong></div><div><span>Bônus por título</span><strong>'+money(c.sponsor.titleBonus)+'</strong></div></div></article>';return '<article class="panel sponsor-panel"><p class="eyebrow">NEGOCIAÇÃO COMERCIAL</p><h2>Propostas de patrocínio</h2><div class="sponsor-offers">'+c.sponsorOffers.map(offer=>'<div><strong>'+escapeHtml(offer.name)+'</strong><span>'+money(offer.annual)+'/ano · '+offer.years+' anos</span><small>Título: '+money(offer.titleBonus)+'</small><button class="btn btn-small btn-primary" data-action="accept-sponsor" data-sponsor="'+offer.id+'">Assinar</button></div>').join('')+'</div></article>';}

function renderTrophyRoom(c) {
  const trophies=(c.trophies||[]).slice().reverse(),score=managerCareerScore(c),best=trophies[0];
  const shelf=trophies.map(trophy=>'<article class="trophy-card"><span>'+competitionLogo(trophy.competitionId,trophy.competitionName)+'</span><div><small>'+escapeHtml(trophy.label).toUpperCase()+' · '+trophy.season+'</small><strong>'+escapeHtml(trophy.competitionName)+'</strong><em>'+escapeHtml(trophy.club?.name||c.club.name)+'</em></div><b>+'+trophy.xp+' XP</b></article>').join('');
  return '<section class="trophy-room panel"><header><div><p class="eyebrow">MUSEU DA CARREIRA</p><h2>Sala de troféus</h2></div><span class="tag">'+trophies.length+' '+(trophies.length===1?'conquista':'conquistas')+'</span></header><div class="trophy-room-score"><span>'+iconSvg('trophy')+'</span><div><small>PONTUAÇÃO DO TREINADOR</small><strong>'+score.toLocaleString('pt-BR')+'</strong><em>Nível '+c.manager.level+' · '+c.manager.xp+' XP · Reputação '+c.manager.reputation+'</em></div>'+(best?'<aside>'+competitionLogo(best.competitionId,best.competitionName)+'<small>ÚLTIMO TÍTULO</small><b>'+escapeHtml(best.competitionName)+'</b></aside>':'<aside class="trophy-empty"><small>PRÓXIMO MARCO</small><b>Conquiste seu primeiro título</b></aside>')+'</div><div class="trophy-shelf">'+(shelf||'<div class="trophy-room-empty">A vitrine espera o primeiro título da sua carreira. Cada campeonato conquistado registra clube, competição, temporada e XP.</div>')+'</div></section>';
}

function renderRelationsPanel(c) {
  const relations=relationsSnapshot(c),leaders=relations.leaders.map(item=>'<li><strong>'+escapeHtml(item.name)+'</strong><span>Liderança '+item.influence+'</span></li>').join(''),promises=relations.activePromises.map(item=>'<li><strong>'+escapeHtml(item.playerName)+'</strong><span>'+escapeHtml(item.label)+' · '+item.remaining+' jogo(s)</span></li>').join(''),memory=relations.recentMemory.map(item=>'<li><strong>'+escapeHtml(item.title)+'</strong><span>'+escapeHtml(item.detail)+'</span></li>').join('');
  return '<section class="panel career-relations"><header><div><p class="eyebrow">VESTIÁRIO E NARRATIVA · '+CAREER_RELATIONS_VERSION+'</p><h2>Ambiente do clube</h2></div><span class="tag">Torcida '+relations.fanConfidence+'%</span></header><div class="world-metric-grid"><div><span>Entrosamento</span><strong>'+relations.cohesion+'%</strong></div><div><span>Vestiário</span><strong>'+relations.atmosphere+'%</strong></div><div><span>Imprensa</span><strong>'+relations.mediaPressure+'%</strong></div><div><span>Diretoria</span><strong>'+relations.boardTrust+'%</strong></div></div><div class="career-relations-grid"><article><h3>Líderes</h3><ul>'+leaders+'</ul></article><article><h3>Promessas ativas</h3><ul>'+(promises||'<li><span>Nenhuma promessa pendente.</span></li>')+'</ul></article><article><h3>Memória recente</h3><ul>'+memory+'</ul></article></div></section>';
}

function renderClub() {
  const c=session.career,payroll=c.roster.reduce((sum,p)=>sum+p.salary*1000,0),value=c.roster.reduce((sum,p)=>sum+p.value*1000000,0);
  const managerCareer=ensureManagerCareer(c),employed=managerCareer.status==='employed';
  const ledger=c.ledger.slice().reverse().map(item=>'<tr><td>'+formatDate(item.date)+'</td><td>'+escapeHtml(item.label)+'</td><td class="'+(item.amount>=0?'positive':'negative')+'">'+(item.amount>=0?'+':'')+money(item.amount)+'</td></tr>').join('');
  const offers='<section class="panel career-market"><header><div><p class="eyebrow">MERCADO DE TREINADORES</p><h2>'+(employed?'Clubes interessados':'Escolha o próximo projeto')+'</h2></div><span class="tag">'+c.jobOffers.length+' proposta(s)</span></header>'+renderCareerOfferCards(c)+'</section>';
  if(!employed)return sectionHead('Carreira do treinador','Propostas, contrato, reputação e próximos desafios.','<span class="tag">Livre no mercado</span>')+renderCareerStatus(c)+offers+'<div class="career-office-grid">'+renderCareerHistory(c)+'<article class="panel"><h2>Carreira internacional</h2><p>O comando de uma seleção continua independente do vínculo com clubes.</p><button class="btn btn-primary" data-action="navigate" data-screen="national">Ver convites de seleções</button></article></div>';
  return sectionHead('Gestão total do clube','Finanças, diretoria, instalações, patrocínio e carreira executiva.')+renderCareerStatus(c)+(c.jobOffers.length?offers:'')+'<div class="world-metric-grid club-metrics"><div><span>Saldo</span><strong>'+money(c.budget)+'</strong></div><div><span>Folha mensal</span><strong>'+money(payroll)+'</strong></div><div><span>Valor do elenco</span><strong>'+money(value)+'</strong></div><div><span>Diretoria</span><strong>'+c.board+'%</strong></div></div>'+renderTrophyRoom(c)+renderRelationsPanel(c)+renderFinance(c)+renderFacilitiesCampus(c)+renderSponsorPanel(c)+'<div class="club-admin-grid"><article class="panel"><h2>Comissão técnica</h2>'+Object.entries(c.staff).map(([id,rating])=>'<div class="staff-row"><span>'+({assistant:'Auxiliar',fitnessCoach:'Preparador físico',scout:'Chefe de scout',medical:'Departamento médico'})[id]+'</span><strong>'+rating+'</strong><button class="btn btn-small" data-action="upgrade-staff" data-staff="'+id+'">Melhorar</button></div>').join('')+'</article><article class="panel"><h2>Perfil do treinador</h2><p><strong>Nível '+c.manager.level+'</strong> · '+escapeHtml(c.manager.license)+'</p><p>'+c.manager.xp+' XP · '+c.manager.awards.length+' prêmio(s)</p><ul class="objective-list">'+c.manager.awards.slice(-4).map(a=>'<li>'+escapeHtml(a)+'</li>').join('')+'</ul></article><article class="panel"><h2>Objetivos da diretoria</h2><div class="board-objectives">'+c.boardObjectives.map(objective=>'<div class="board-objective '+objective.status+'"><span><strong>'+escapeHtml(objective.label)+'</strong><small>'+Math.min(objective.progress,objective.target)+' / '+objective.target+' '+escapeHtml(objective.unit)+'</small></span><i><em style="width:'+clamp(objective.progress/objective.target*100,0,100)+'%"></em></i><b>'+(objective.status==='complete'?'✓':'+'+objective.reward)+'</b></div>').join('')+'</div></article>'+renderCareerHistory(c)+'</div><div class="table-wrap"><table class="data-table"><thead><tr><th>Data</th><th>Movimentação</th><th>Valor</th></tr></thead><tbody>'+ledger+'</tbody></table></div>';
}

function mailPresentation(mail) {
  const text=(mail.from+' '+mail.subject).toLowerCase();
  if(text.includes('médic'))return {id:'medical',label:'Departamento médico',icon:'training'};
  if(text.includes('seleç')||text.includes('fifa')||text.includes('federaç'))return {id:'national',label:'Seleção e federação',icon:'national'};
  if(text.includes('confedera')||text.includes('copa')||text.includes('liga')||text.includes('competição'))return {id:'competition',label:'Competições',icon:'trophy'};
  if(text.includes('empresár')||text.includes('agente')||text.includes('transfer'))return {id:'market',label:'Mercado',icon:'market'};
  if(text.includes('imprensa')||text.includes('mídia'))return {id:'media',label:'Imprensa',icon:'globe'};
  return {id:'board',label:'Clube e diretoria',icon:'club'};
}

function renderInbox() {
  const c=session.career,unread=c.messages.filter(m=>!m.read),urgent=unread.filter(m=>m.priority==='high');
  const cards=c.messages.slice().reverse().map(m=>{const category=mailPresentation(m),preview=String(m.body||'').slice(0,120);return '<button class="mail-item mail-'+category.id+' '+(!m.read?'unread ':'')+(m.priority==='high'?'high-priority':'')+'" data-action="open-mail" data-mail="'+escapeHtml(m.id)+'"><span class="mail-icon">'+iconSvg(category.icon)+'</span><span class="mail-copy"><small>'+escapeHtml(category.label)+' · '+escapeHtml(m.from)+'</small><strong>'+escapeHtml(m.subject)+'</strong><em>'+escapeHtml(preview)+(String(m.body||'').length>120?'…':'')+'</em></span><span class="mail-meta">'+(!m.read?'<b>NOVA</b>':'')+(m.priority==='high'?'<i>IMPORTANTE</i>':'')+'<time>'+formatDate(m.date)+'</time></span></button>';}).join('');
  return sectionHead('Caixa de entrada','Decisões da carreira organizadas por prioridade e área responsável.','<span class="tag">'+unread.length+' novas</span>')+'<section class="mail-command"><div><span>'+iconSvg('inbox')+'</span><strong>'+unread.length+' pendente(s)</strong><small>Leia antes de avançar a próxima data.</small></div><div class="mail-command-priority"><strong>'+urgent.length+'</strong><span>mensagens importantes</span></div></section><div class="mail-layout"><div class="mail-list">'+(cards||'<div class="panel empty-state"><strong>Caixa vazia</strong><span>Novas decisões aparecerão aqui.</span></div>')+'</div><article class="panel mail-preview"><span class="mail-preview-icon">'+iconSvg('inbox')+'</span><h2>Central de decisões</h2><p>Diretoria, departamento médico, mercado, competições e seleção usam canais visuais diferentes. Mensagens importantes recebem faixa dourada e ficam evidentes.</p><div class="mail-legend"><span class="board">Clube</span><span class="medical">Médico</span><span class="competition">Competições</span><span class="national">Seleção</span></div></article></div>';
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
  const qualifiers=qualifierOpponents.map((opponent,index)=>({id:'national-q-'+(index+1),competitionId:'world-cup-qualifiers',competitionName:'Eliminatórias da Copa do Mundo',type:'national',stage:'Fase classificatória',round:index+1,date:addDays(start,index*28),opponent,home:index<opponents.length,played:false,score:null}));
  const friendlyPool=pool.filter(item=>item.confederation!==team.confederation).sort((a,b)=>Math.abs(Number(a.rating||70)-Number(team.rating||70))-Math.abs(Number(b.rating||70)-Number(team.rating||70)));
  const friendlies=friendlyPool.slice(0,2).map((opponent,index)=>({id:'national-friendly-'+(index+1),competitionId:'international-friendly',competitionName:'Amistoso internacional',type:'national',stage:'Data FIFA',round:index+1,date:index===0?addDays(start,-14):addDays(start,qualifiers.length*28+14),opponent,home:index===0,played:false,locked:false,score:null}));
  const cupOpp=seeded.filter(item=>item.id!==team.id).slice(0,3);
  const cupNames={CONMEBOL:'Copa América',UEFA:'Euro',CONCACAF:'Copa Ouro',AFC:'Copa da Ásia',CAF:'Copa Africana de Nações',OFC:'Copa das Nações da OFC'};
  const cup=cupOpp.map((opponent,index)=>({id:'national-cup-'+(index+1),competitionId:'continental-national-cup',competitionName:cupNames[team.confederation]||'Copa continental',type:'national',phase:'group',stage:'Fase de grupos',round:index+1,date:addDays(start,qualifiers.length*28+35+index*6),opponent,home:index%2===0,played:false,locked:true,score:null}));
  const nationalPending={id:'draw-pending',name:'Adversário definido pela classificação',badge:'assets/placeholders/club-generic.png',rating:72};
  const cupFinals=['Quartas de final','Semifinal','Final'].map((stage,index)=>({id:'national-cup-ko-'+(index+1),competitionId:'continental-national-cup',competitionName:cupNames[team.confederation]||'Copa continental',type:'national',phase:'knockout',stage,round:4+index,date:addDays(start,qualifiers.length*28+58+index*9),opponent:nationalPending,home:index!==2,played:false,locked:true,score:null}));
  const worldOpp=pool.filter(item=>item.confederation!==team.confederation).sort((a,b)=>b.rating-a.rating).slice(0,3);
  const world=worldOpp.map((opponent,index)=>({id:'national-world-'+(index+1),competitionId:'world-cup',competitionName:'Copa do Mundo',type:'national',phase:'group',stage:'Fase de grupos',round:index+1,date:addDays(start,qualifiers.length*28+180+index*5),opponent,home:index%2===0,played:false,locked:true,score:null}));
  const worldFinals=['Oitavas de final','Quartas de final','Semifinal','Final'].map((stage,index)=>({id:'national-world-ko-'+(index+1),competitionId:'world-cup',competitionName:'Copa do Mundo',type:'national',phase:'knockout',stage,round:4+index,date:addDays(start,qualifiers.length*28+198+index*7),opponent:nationalPending,home:index!==3,played:false,locked:true,score:null}));
  return [...friendlies,...qualifiers,...cup,...cupFinals,...world,...worldFinals].sort((a,b)=>new Date(a.date)-new Date(b.date));
}

function ensureNationalCalendar(national) {
  if(!national||national.fixtures?.some(f=>f.competitionId==='international-friendly')||!session.catalog?.nationalTeams)return national;
  const start=national.fixtures?.length?new Date(national.fixtures[0].date):new Date(2026,2,20,20);
  const pool=session.catalog.nationalTeams.filter(item=>item.id!==national.team.id&&item.confederation!==national.team.confederation).sort((a,b)=>Math.abs(Number(a.rating||70)-Number(national.team.rating||70))-Math.abs(Number(b.rating||70)-Number(national.team.rating||70)));
  const lastQualifier=national.fixtures.filter(f=>f.competitionId==='world-cup-qualifiers').sort((a,b)=>new Date(b.date)-new Date(a.date))[0];
  const current=new Date(session.career?.date||start),candidates=[new Date(addDays(start,-14)),new Date(addDays(lastQualifier?.date||start,14))];
  const dates=candidates.map((candidate,index)=>candidate>current?candidate.toISOString():addDays(current,14+index*28));
  pool.slice(0,2).forEach((opponent,index)=>national.fixtures.push({id:'national-friendly-'+(index+1),competitionId:'international-friendly',competitionName:'Amistoso internacional',type:'national',stage:'Data FIFA',round:index+1,date:dates[index],opponent,home:index===0,played:false,locked:false,score:null}));
  national.fixtures.sort((a,b)=>new Date(a.date)-new Date(b.date));
  return national;
}

function ensureNationalCallup(national) {
  if(!national?.roster)return national;
  ensureNationalCareer(national,session.career||{});
  national.selectionPoolIds=Array.isArray(national.selectionPoolIds)&&national.selectionPoolIds.length?national.selectionPoolIds:[...new Set(national.roster.map(player=>player.id))];
  const valid=new Set(national.selectionPoolIds);
  const selected=Array.isArray(national.calledUpIds)?national.calledUpIds.filter((id,index,list)=>valid.has(id)&&list.indexOf(id)===index):[];
  national.calledUpIds=selected.length>=23?selected:national.roster.filter(player=>valid.has(player.id)).slice(0,Math.min(26,national.roster.length)).map(player=>player.id);
  national.lineupIds=(national.lineupIds||[]).filter(id=>national.calledUpIds.includes(id)).slice(0,11);
  if(national.lineupIds.length<11)national.lineupIds=selectBestLineup(national.roster.filter(player=>national.calledUpIds.includes(player.id)),'4-3-3').map(player=>player.id);
  return national;
}

function selectNationalRegion(region) {
  const n=session.career?.national;if(!n)return;
  const report=observeNationalRegion(n,region,session.career.date);
  session.career.messages.push({id:'national-scout-'+Date.now(),from:'Departamento de observação nacional',subject:'Relatório de '+report.region,body:report.updated+' atletas foram atualizados; conhecimento da região em '+report.knowledge+'%.',date:session.career.date,read:false,priority:'normal'});
  persist();renderGame(renderNational());toast('Relatório nacional atualizado.','success');
}

function callUpNationalByForm() {
  const n=session.career?.national;if(!n)return;
  const result=callUpByPerformance(n,26);ensureNationalCallup(n);
  session.career.messages.push({id:'national-callup-'+Date.now(),from:'Comissão técnica da seleção',subject:'Convocação por rendimento concluída',body:'A lista foi ordenada por forma, minutos, impacto e condição física. Destaque: '+(result.ranking[0]?.name||'sem dados')+'.',date:session.career.date,read:false,priority:'high'});
  persist();renderGame(renderNational());toast('Convocação ajustada pelo desempenho recente.','success');
}

function toggleNationalCallup(playerId) {
  const n=session.career?.national;if(!n)return;
  ensureNationalCallup(n);const index=n.calledUpIds.indexOf(playerId);
  if(index>=0){if(n.calledUpIds.length<=23)return toast('A lista precisa ter ao menos 23 atletas.','error');n.calledUpIds.splice(index,1);n.lineupIds=n.lineupIds.filter(id=>id!==playerId);}
  else {if(n.calledUpIds.length>=26)return toast('A convocação comporta no máximo 26 atletas.','error');n.calledUpIds.push(playerId);}
  ensureNationalCallup(n);persist();renderGame(renderNational());
}

function resolveNationalTournamentDraw(national, fixture) {
  const continental=fixture.competitionId==='continental-national-cup';
  const pool=session.catalog.nationalTeams.filter(team=>team.id!==national.team.id&&(!continental||team.confederation===national.team.confederation));
  const used=new Set(national.fixtures.filter(item=>item.competitionId===fixture.competitionId&&item.opponent?.id!=='draw-pending').map(item=>item.opponent.id));
  const opponent=(pool.filter(team=>!used.has(team.id)).length?pool.filter(team=>!used.has(team.id)):pool).sort((a,b)=>stableNumber(fixture.id+a.id)-stableNumber(fixture.id+b.id))[0];
  if(opponent){fixture.opponent=opponent;fixture.locked=false;fixture.drawStatus='confirmed';}
  return opponent;
}

function progressNationalTournament(national, fixture) {
  const phase=fixture.phase;
  if(phase==='group'){
    const group=national.fixtures.filter(item=>item.competitionId===fixture.competitionId&&item.phase==='group');
    if(!group.every(item=>item.played))return;
    const points=group.reduce((sum,item)=>sum+(resultClass(item)==='win'?3:resultClass(item)==='draw'?1:0),0),qualified=points>=3;
    const next=national.fixtures.find(item=>item.competitionId===fixture.competitionId&&item.phase==='knockout'&&!item.cancelled);
    if(qualified&&next){resolveNationalTournamentDraw(national,next);session.career.messages.push({id:'national-group-'+Date.now(),from:national.team.name,subject:'Classificação confirmada',body:'A seleção somou '+points+' pontos no grupo e avançou para '+next.stage+'.',date:session.career.date,read:false,priority:'high'});}
    else {national.fixtures.filter(item=>item.competitionId===fixture.competitionId&&item.phase==='knockout').forEach(item=>{item.cancelled=true;item.locked=true;});recordNationalTournament(national,{id:fixture.competitionId+':'+session.career.season,season:session.career.season,name:fixture.competitionName,stage:'Fase de grupos',result:'Eliminada',date:session.career.date});session.career.messages.push({id:'national-group-'+Date.now(),from:national.team.name,subject:'Eliminação na fase de grupos',body:'A seleção somou '+points+' pontos e não alcançou o mata-mata.',date:session.career.date,read:false,priority:'high'});}
  } else if(phase==='knockout') {
    if(resultClass(fixture)==='win'){
      const next=national.fixtures.find(item=>item.competitionId===fixture.competitionId&&item.phase==='knockout'&&item.locked&&!item.cancelled&&new Date(item.date)>new Date(fixture.date));
      if(next)resolveNationalTournamentDraw(national,next);
    } else {national.fixtures.filter(item=>item.competitionId===fixture.competitionId&&item.phase==='knockout'&&!item.played&&new Date(item.date)>new Date(fixture.date)).forEach(item=>{item.cancelled=true;item.locked=true;});recordNationalTournament(national,{id:fixture.competitionId+':'+session.career.season,season:session.career.season,name:fixture.competitionName,stage:fixture.stage,result:'Eliminada por '+fixture.opponent.name,opponent:fixture.opponent.name,date:session.career.date});}
    if(fixture.stage==='Final'&&resultClass(fixture)==='win')recordNationalTournament(national,{id:fixture.competitionId+':'+session.career.season,season:session.career.season,name:fixture.competitionName,stage:'Final',result:'Campeã',opponent:fixture.opponent.name,date:session.career.date});
  }
}

async function acceptNationalJob(teamId) {
  const team=session.catalog.nationalTeams.find(item=>item.id===teamId);
  if(!team?.rosterPath){toast('Esta seleção participa da simulação, mas ainda não tem convocação nominal oficial disponível.','error');return;}
  if(session.career.manager.reputation<team.reputationRequired){toast('Sua reputação ainda não atende a esta seleção.','error');return;}
  try{
    const data=await fetchJson(team.rosterPath),roster=(data.players||[]).map(normalizePlayer);
    session.career.national={team,roster,selectionPoolIds:roster.map(p=>p.id),calledUpIds:roster.slice(0,Math.min(26,roster.length)).map(p=>p.id),lineupIds:pickLineup(roster).map(p=>p.id),fixtures:buildNationalFixtures(team),stats:{played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0},qualified:false,competitionLabel:nationalCompetitionLabel(team)};
    ensureNationalCallup(session.career.national);
    ensureNationalCareer(session.career.national,session.career);
    recordNationalAppointment(session.career,team);
    session.career.messages.push({id:'national-'+Date.now(),from:team.name,subject:'Contrato de seleção assinado',body:'Você agora comanda '+team.name+'. As Datas FIFA aparecem no centro internacional e o vínculo é independente da carreira em clubes.',date:new Date().toISOString(),read:false,priority:'high'});
    persist();renderGame(renderNational());toast('Você assumiu '+team.name+'.','success');
  }catch{toast('Não foi possível carregar a convocação.','error');}
}

function renderNationalAgenda(n) {
  const next=n.fixtures.filter(f=>!f.played&&!f.locked&&!f.cancelled).sort((a,b)=>new Date(a.date)-new Date(b.date))[0];
  return '<section class="panel national-schedule"><header><div><p class="eyebrow">AGENDA SINCRONIZADA</p><h2>Clube e seleção na mesma temporada</h2></div><button class="btn btn-small" data-action="navigate" data-screen="calendar">Abrir agenda completa</button></header><div class="national-fixture-list">'+n.fixtures.slice().sort((a,b)=>new Date(a.date)-new Date(b.date)).map(fixture=>{const kind=competitionKind(fixture),status=fixture.played?'Finalizado · '+fixture.score.home+'–'+fixture.score.away:fixture.locked?'Aguardando classificação':fixture.id===next?.id?'Próximo compromisso':'Confirmado';return '<article class="kind-'+kind.id+' '+(fixture.id===next?.id?'is-next':'')+'"><time>'+formatDate(fixture.date)+'</time><span class="national-kind">'+escapeHtml(kind.short)+'</span><img src="./'+escapeHtml(fixture.opponent.badge)+'" alt="" onerror="__vfmFallback(event)"><div><strong>'+escapeHtml(fixture.opponent.name)+'</strong><small>'+escapeHtml(kind.label)+' · '+escapeHtml(fixture.stage||'Rodada '+fixture.round)+'</small></div><em>'+escapeHtml(status)+'</em>'+(fixture.id===next?.id?'<button class="btn btn-primary btn-small" data-action="start-national-match">Jogar</button>':'')+'</article>';}).join('')+'</div></section>';
}

function renderNationalTables(n) {
  const competitions=['world-cup-qualifiers','continental-national-cup','world-cup'];
  return '<div class="national-table-stack">'+competitions.map(id=>{const all=n.fixtures.filter(f=>f.competitionId===id&&!f.cancelled),fixtures=all.filter(f=>!f.phase||f.phase==='group'),name=all[0]?.competitionName||id;if(!fixtures.length)return '';const table=deriveCompetitionTable(n.team,fixtures,n.team.id+':'+id),knockout=all.filter(f=>f.phase==='knockout'),nextKnockout=knockout.find(f=>!f.played&&!f.locked);return standingsTableMarkup(table,name,n.team.id,id==='world-cup-qualifiers'?'CLASSIFICAÇÃO DAS ELIMINATÓRIAS':fixtures.some(f=>!f.locked)?'FASE DE GRUPOS · MATA-MATA '+(nextKnockout?'aguardando':'em andamento'):'TABELA PROJETADA · AINDA BLOQUEADA');}).join('')+'</div>';
}

function renderNationalIntelligence(n) {
  const brief=nationalSelectionBrief(n),top=brief.ranking.map(player=>'<li><span>'+escapeHtml(player.name)+' · '+escapeHtml(player.pos)+'</span><strong>'+player.nationalForm+'</strong><small>GER '+player.overall+' · observado '+player.knowledge+'%</small></li>').join(''),regions=Object.entries(brief.regions).map(([id,value])=>'<button class="btn btn-small" data-action="national-scout" data-region="'+escapeHtml(id)+'">'+escapeHtml(id)+' '+value+'%</button>').join(''),history=brief.history.slice(0,4).map(item=>'<li><strong>'+escapeHtml(item.name)+'</strong><span>'+escapeHtml(item.stage)+' · '+escapeHtml(item.result)+'</span></li>').join('')||'<li><span>O histórico será registrado a cada torneio encerrado.</span></li>',objectives=brief.objectives.map(item=>'<li><span>'+escapeHtml(item.label)+'</span><b>'+escapeHtml(item.target)+'</b></li>').join('');
  return '<section class="panel national-intelligence"><header><div><p class="eyebrow">OBSERVAÇÃO E CICLO INTERNACIONAL · '+NATIONAL_CAREER_VERSION+'</p><h2>Seleção por desempenho</h2><p>Forma, minutos, gols, assistência, condição e conhecimento regional alteram a ordem de convocação.</p></div><button class="btn btn-primary btn-small" data-action="national-callup-form">Convocar por desempenho</button></header><div class="national-intelligence-grid"><article><h3>Regiões observadas</h3><div class="national-scout-actions">'+regions+'</div><ul class="national-form-list">'+top+'</ul></article><article><h3>Objetivos da federação</h3><ul class="national-history">'+objectives+'</ul><h3>Histórico internacional</h3><ul class="national-history">'+history+'</ul></article></div></section>';
}

function renderNational() {
  const c=session.career,n=c.national;
  if(!n){
    const inviteIds=new Set(ensureManagerCareer(c).nationalOffers||[]);
    const filters=[['official','48 listas oficiais da Copa'],['all','Todas as 211'],['CONMEBOL','CONMEBOL'],['UEFA','UEFA'],['CONCACAF','CONCACAF'],['AFC','AFC'],['CAF','CAF'],['OFC','OFC']];
    const shown=session.catalog.nationalTeams.filter(team=>(session.nationalFilter==='official'?team.officialSquad:session.nationalFilter==='all'||team.confederation===session.nationalFilter)&&(!session.nationalSearch||team.name.toLowerCase().includes(session.nationalSearch.toLowerCase())));
    const nationalCard=team=>{const sourced=Boolean(team.rosterPath),available=sourced&&c.manager.reputation>=team.reputationRequired,invited=inviteIds.has(team.id),label=!sourced?'Simulação':invited?'Aceitar convite':available?'Demonstrar interesse':'Bloqueada';return '<article class="national-offer '+(available?'available':'locked')+' '+(invited?'invited':'')+'"><img src="./'+escapeHtml(team.badge)+'" alt="" onerror="__vfmFallback(event)"><div><strong>'+escapeHtml(team.name)+'</strong><small>'+escapeHtml(team.confederation)+' · GER VFM '+team.rating+'</small><span>'+(invited?'Convite formal recebido':sourced?'Reputação exigida: '+team.reputationRequired:'Participa das eliminatórias pela IA')+'</span></div><button class="btn btn-small '+(available?'btn-primary':'')+'" data-action="accept-national" data-team="'+team.id+'" '+(available?'':'disabled')+'>'+label+'</button></article>';};
    const invited=session.catalog.nationalTeams.filter(team=>inviteIds.has(team.id));
    const offers=shown.map(nationalCard).join('');
    return sectionHead('Seleções nacionais','211 associações em seis confederações, com eliminatórias e carreira internacional.','<span class="tag">Sua reputação: '+c.manager.reputation+'</span>')+(invited.length?'<section class="panel national-invitations"><header><div><p class="eyebrow">CONVITES RECEBIDOS</p><h2>Federações querem conversar</h2></div><span class="tag">'+invited.length+' convite(s)</span></header><div class="national-grid">'+invited.map(nationalCard).join('')+'</div></section>':'')+'<div class="notice">Todas participam da simulação; '+session.catalog.stats.commandableNationalTeams+' possuem lista nominal comandável. Reputação, licença e desempenho liberam convites reais durante a carreira.</div><div class="toolbar"><select data-action="national-filter" aria-label="Filtrar seleções">'+filters.map(([id,label])=>'<option value="'+id+'" '+(session.nationalFilter===id?'selected':'')+'>'+label+'</option>').join('')+'</select><input data-action="national-search" aria-label="Buscar seleção" placeholder="Buscar seleção" value="'+escapeHtml(session.nationalSearch)+'"><span class="tag">'+shown.length+' seleções</span></div><div class="national-grid">'+offers+'</div>';
  }
  ensureNationalCalendar(n);
  ensureNationalCallup(n);
  const next=n.fixtures.filter(f=>!f.played&&!f.locked&&!f.cancelled).sort((a,b)=>new Date(a.date)-new Date(b.date))[0],played=n.fixtures.filter(f=>f.played).length;
  const formById=new Map(nationalSelectionRanking(n,99).map(player=>[player.id,player]));
  const roster=n.roster.filter(p=>n.selectionPoolIds.includes(p.id)).slice().sort((a,b)=>(formById.get(b.id)?.nationalForm||0)-(formById.get(a.id)?.nationalForm||0)).map(p=>{const called=n.calledUpIds.includes(p.id),form=formById.get(p.id)?.nationalForm||p.overall;return '<tr><td><button class="btn btn-small '+(called?'btn-primary':'')+'" data-action="toggle-national-callup" data-player="'+escapeHtml(p.id)+'">'+(called?'Convocado':'Chamar')+'</button></td><td>'+escapeHtml(p.name)+'</td><td>'+p.pos+'</td><td><strong>'+p.overall+'</strong></td><td><strong>'+form+'</strong></td><td>'+escapeHtml(p.clubName||'—')+'</td><td>'+(n.lineupIds.includes(p.id)?'Titular':called?'Convocado':'Disponível')+'</td></tr>';}).join('');
  return sectionHead(n.team.name,'Agenda, competição, classificação e convocação internacional.','<span class="tag">'+escapeHtml(n.team.confederation)+'</span>')+'<div class="national-hero panel"><img src="./'+escapeHtml(n.team.badge)+'" alt="" onerror="__vfmFallback(event)"><div><p class="eyebrow">COMANDO INTERNACIONAL</p><h2>'+escapeHtml(n.competitionLabel)+'</h2><p>'+played+' jogos · '+n.stats.wins+' vitórias · '+n.stats.points+' pontos</p>'+(next?'<p>Próximo: <strong>'+escapeHtml(next.opponent.name)+'</strong> · '+escapeHtml(competitionKind(next).label)+' · '+formatDate(next.date)+'</p><button class="btn btn-primary" data-action="start-national-match">Avançar para a partida</button>':'<p>Calendário internacional concluído.</p>')+'</div></div>'+renderNationalAgenda(n)+renderNationalTables(n)+renderNationalIntelligence(n)+'<section class="panel national-roster"><header><div><p class="eyebrow">POOL NACIONAL E CONVOCAÇÃO EDITÁVEL</p><h2>Lista da Data FIFA</h2><p>O pool federativo contém '+n.selectionPoolIds.length+' atletas. Monte uma lista de 23 a 26 atletas; a escalação usa apenas os convocados.</p></div><span class="tag">'+n.calledUpIds.length+'/26 · pool '+n.selectionPoolIds.length+'</span></header><div class="table-wrap"><table class="data-table"><thead><tr><th>Lista</th><th>Jogador</th><th>Pos.</th><th>GER</th><th>Forma</th><th>Clube</th><th>Status</th></tr></thead><tbody>'+roster+'</tbody></table></div></section>';
}

function renderMore() {
  const c=session.career,unread=c.messages.filter(message=>!message.read).length;
  const items=ensureManagerCareer(c).status==='unemployed' ? [
    ['club','club','Carreira','Propostas, contrato e histórico'],
    ['inbox','inbox','Mensagens',unread?unread+' não '+(unread===1?'lida':'lidas'):'Tudo lido'],
    ['national','national','Seleção',c.national?c.national.team.name:'Convites internacionais'],
    ['settings','settings','Ajustes','Salvar, importar e acessibilidade']
  ] : [
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
  const events=session.career?.telemetry||[],failures=events.filter(item=>item.type==='error').length;
  return sectionHead('Ajustes e carreira','Preferências, proteção do save e retorno ao menu.')+'<div class="settings-grid"><article class="panel"><h2>Preferências</h2><label class="switch-row"><span>Reduzir animações</span><input type="checkbox" data-action="reduced-motion" '+(store.settings.reducedMotion?'checked':'')+'></label><p class="muted">O jogo agora funciona em retrato e paisagem. Use a posição mais confortável para cada tela.</p></article><article class="panel"><h2>Carreira</h2><p class="muted">Um backup local é preservado antes de cada nova gravação.</p><button class="btn" data-action="save">Salvar agora</button><button class="btn" data-action="restore-backup">Restaurar último backup</button><button class="btn" data-action="export-save">Exportar save</button><button class="btn" data-action="choose-import-save">Importar save</button><input id="save-import" class="visually-hidden" type="file" accept="application/json,.json" data-action="import-save"><button class="btn btn-danger" data-action="exit-career">Salvar e sair</button></article><article class="panel"><h2>Diagnóstico local</h2><p><strong>'+events.length+'</strong> eventos registrados neste save · '+failures+' erro(s) capturado(s).</p><p class="muted">O diagnóstico permanece neste aparelho e ajuda a recuperar a carreira sem enviar dados pessoais.</p></article></div>';
}

function navigate(screen,push=true) {
  if(!session.career){renderCover();return;}
  const clubOnlyScreens=new Set(['squad','tactics','match-center','competitions','calendar','training','market']);
  if(ensureManagerCareer(session.career).status==='unemployed'&&clubOnlyScreens.has(screen))screen='club';
  if(screen!=='match')stopMatchTimer();
  session.screen=screen;
  recordTelemetry('route',screen);
  if(push)history.pushState({screen},'', '#/'+screen);
  const renderers={dashboard:renderDashboard,squad:renderSquad,tactics:renderTactics,'match-center':renderMatchCenter,more:renderMore,competitions:renderCompetitions,calendar:renderCalendar,training:renderTraining,market:renderMarket,club:renderClub,inbox:renderInbox,national:renderNational,settings:renderSettings};
  renderGame((renderers[screen]||renderDashboard)());
  if(screen==='market')loadMarket();
}

function lineupFor(roster,ids) { return ids.map(id=>roster.find(p=>p.id===id)).filter(player=>player&&isPlayerAvailable(player)).slice(0,11); }

async function startMatch(source='club') {
  const c=session.career;
  if(source==='club'&&ensureManagerCareer(c).status==='unemployed'){toast('Assine com um clube antes de disputar partidas.','error');navigate('club');return;}
  const national=source==='national' ? c.national : null;
  const fixture=national ? national.fixtures.filter(f=>!f.played&&!f.locked&&!f.cancelled).sort((a,b)=>new Date(a.date)-new Date(b.date))[0] : nextFixture();
  if(!fixture){toast('Não há partida disponível.','error');return;}
  if(!national){
    const elapsed=Math.max(0,Math.floor((new Date(fixture.date)-new Date(c.date))/86400000));
    const recovery=advanceRosterDays(c.roster,elapsed,{medicalLevel:c.facilities.medical,fitnessCoach:c.staff.fitnessCoach});
    c.date=fixture.date;processCareerDeadlines(c);repairCareerLineup(c);
    if(recovery.recovered.length)c.messages.push({id:'medical-clearance-'+Date.now(),from:'Departamento médico',subject:'Atletas liberados',body:recovery.recovered.join(', ')+' '+(recovery.recovered.length===1?'voltou':'voltaram')+' a ficar disponível(is) para a comissão técnica.',date:new Date().toISOString(),read:false,priority:'normal'});
  }
  let opponentRoster=[];
  if(fixture.opponent.rosterPath){try{opponentRoster=(await fetchJson(fixture.opponent.rosterPath)).players.map(normalizePlayer);}catch{}}
  if(national)ensureNationalCallup(national);
  const ownRoster=national?national.roster.filter(player=>national.calledUpIds.includes(player.id)):c.roster, ownIds=national?national.lineupIds:c.lineupIds;
  let ownLineup=lineupFor(ownRoster,ownIds);
  if(ownLineup.length<11){ownLineup=selectBestLineup(ownRoster,national?'4-3-3':c.tactics.formation);if(national)national.lineupIds=ownLineup.map(player=>player.id);else c.lineupIds=ownLineup.map(player=>player.id);}
  if(ownLineup.length<11){toast('Não há onze atletas disponíveis. Revise lesões e suspensões.','error');persist();return;}
  const selectedIds=new Set(ownLineup.map(player=>player.id)),ownBench=ownRoster.filter(player=>!selectedIds.has(player.id)&&isPlayerAvailable(player)).sort((a,b)=>effectiveOverall(b,b.pos)-effectiveOverall(a,a.pos)).slice(0,12).map(player=>({...player,attributes:{...(player.attributes||{})}}));
  const ownTeam=national?national.team:c.club;
  const ownRoleEffects=national?{}:roleEffects(ownLineup,ensureTacticalRoles(c));
  const opponentLineup=opponentRoster.length?selectBestLineup(opponentRoster,'4-2-3-1'):[];
  const opponentStarterIds=new Set(opponentLineup.map(player=>player.id)),opponentBench=opponentRoster.filter(player=>!opponentStarterIds.has(player.id)&&isPlayerAvailable(player)).sort((a,b)=>effectiveOverall(b,b.pos)-effectiveOverall(a,a.pos)).slice(0,9);
  const rivalCoach=opponentCoachProfile(fixture.opponent.id+':'+fixture.opponent.name,fixture.opponent.rating);
  const engine=createMatchEngineV2({
    seed:stableNumber(fixture.id+':'+c.season+':'+c.club.id),ownHome:Boolean(fixture.home),ownName:ownTeam.name,opponentName:fixture.opponent.name,
    ownLineup,opponentLineup,opponentBench,opponentCoach:rivalCoach,opponentRating:fixture.opponent.rating,ownTactics:c.tactics,ownRoleEffects
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
  const matchCompetition=competitionKind(m.fixture);
  app.innerHTML=`<main class="screen match-screen world-match" onclick="window.__vfmMatchAction(event)"><header class="match-scoreboard"><div><img src="./${escapeHtml(teams.home.badge)}" alt="" onerror="__vfmFallback(event)"><strong>${escapeHtml(teams.home.name)}</strong></div><span class="score">${m.homeGoals} · ${m.awayGoals}</span><span class="clock">${m.minute}’<small>${phase}</small></span><div><strong>${escapeHtml(teams.away.name)}</strong><img src="./${escapeHtml(teams.away.badge)}" alt="" onerror="__vfmFallback(event)"></div></header><section class="match-world-layout"><aside class="match-side commentary-panel"><div class="match-engine-label">MOTOR ${MATCH_ENGINE_V2_VERSION} · DETERMINÍSTICO</div><h2>Momentos-chave</h2><div class="event-filters">${filters}</div><ul class="commentary-list">${commentary||'<li><span>Nenhum evento neste filtro.</span></li>'}</ul>${signals?`<h3>Por que aconteceu</h3><ul class="causal-list">${signals}</ul>`:''}</aside><div class="visual-pitch" aria-label="Campo com vinte e dois jogadores"><div class="pitch-markings"></div><span class="match-competition-mark">${competitionLogo(m.fixture.competitionId,m.fixture.competitionName,'match-competition-image')}<b>${escapeHtml(matchCompetition.label)}</b></span><div class="pressure-map"><i style="opacity:${m.possessionHome/100}"></i><b style="opacity:${(100-m.possessionHome)/100}"></b></div>${pitchPlayers()}<div class="match-ball" style="left:${m.ball.x}%;top:${m.ball.y}%"></div><div class="momentum-meter"><span>Pressão do seu time</span><i><em style="width:${momentum}%"></em></i><b>${Math.round(momentum)}%</b></div></div><aside class="match-side stats-panel"><h2>Leitura da partida</h2><div class="coach-insight"><span>Auxiliar</span><p>${escapeHtml(m.coachInsight)}</p></div><div class="stat-row"><strong>${m.possessionHome}%</strong><span>Posse</span><strong>${100-m.possessionHome}%</strong></div><div class="stat-row"><strong>${m.shotsHome} (${m.shotsOnTargetHome})</strong><span>Finalizações (alvo)</span><strong>${m.shotsAway} (${m.shotsOnTargetAway})</strong></div><div class="stat-row"><strong>${m.xgHome.toFixed(1)}</strong><span>xG</span><strong>${m.xgAway.toFixed(1)}</strong></div><div class="stat-row"><strong>${passHome}%</strong><span>Precisão de passe</span><strong>${passAway}%</strong></div><div class="stat-row"><strong>${m.cornersHome||0}</strong><span>Escanteios</span><strong>${m.cornersAway||0}</strong></div><div class="stat-row"><strong>${m.cardsHome||0}</strong><span>Cartões</span><strong>${fitness}%</strong></div><div class="tactic-live"><span>Formação</span><strong>${escapeHtml(m.ownTactics.formation)}</strong><span>Mentalidade</span><strong>${escapeHtml(m.ownTactics.mentality)}</strong><span>Substituições</span><strong>${m.substitutionsUsed}/${m.maxSubstitutions}</strong></div>${topPlayers?`<div class="live-ratings"><h3>Melhores notas</h3>${topPlayers}</div>`:''}</aside></section><footer class="match-controls"><button class="btn" data-action="exit-match">Sair</button>${m.finished?'<button class="btn btn-primary" data-action="finish-match">Análise pós-jogo</button>':`<button class="btn" data-action="open-live-tactics">Tática e substituições</button><button class="btn btn-primary" data-action="toggle-match">${m.running?'Pausar':'Começar'}</button><button class="btn ${m.speed===1?'active':''}" data-action="match-speed" data-speed="1">1×</button><button class="btn ${m.speed===3?'active':''}" data-action="match-speed" data-speed="3">3×</button><button class="btn ${m.speed===6?'active':''}" data-action="match-speed" data-speed="6">6×</button>`}</footer>${liveTacticsPanel()}</main>`;bindMatchControls();
  const statRows=app.querySelectorAll('.stats-panel .stat-row'),cardRow=statRows[5];
  if(cardRow){
    cardRow.innerHTML='<strong>'+m.cardsHome+'</strong><span>Cartões</span><strong>'+m.cardsAway+'</strong>';
    cardRow.insertAdjacentHTML('afterend','<div class="stat-row"><strong>'+fitness+'%</strong><span>Físico / plano rival</span><strong>'+escapeHtml(m.opponentPlan)+'</strong></div>');
  }
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
  if(fixture.type!=='league')return null;
  const c=session.career;ensureWorldState(c);
  const recorded=recordManagedCompetitionResult(c.worldState,fixture.competitionId,c.club.id,fixture.opponent.id,fixture.home,ownGoals,oppGoals,Number(fixture.round)-1);
  if(recorded.recorded){fixture.round=recorded.round+1;syncCareerTableFromWorld(c);return {leagueId:fixture.competitionId,round:recorded.round};}
  return null;
}

function finishMatch() {
  const m=session.match,c=session.career,fixture=m.fixture;
  if(fixture.played)return;
  const ownGoals=teamOnHome()?m.homeGoals:m.awayGoals,oppGoals=teamOnHome()?m.awayGoals:m.homeGoals;
  const engineReport=m.postMatchReport||buildMatchReport(m);
  fixture.played=true;fixture.score={home:m.homeGoals,away:m.awayGoals};fixture.engineReport={...engineReport,signals:engineReport.signals?.slice(0,3),performers:engineReport.performers?.slice(0,5)};
  c.matchReports=Array.isArray(c.matchReports)?c.matchReports:[];c.matchReports.unshift({fixtureId:fixture.id,date:fixture.date,competition:fixture.competitionName,opponent:fixture.opponent.name,score:ownGoals+'–'+oppGoals,...fixture.engineReport});c.matchReports=c.matchReports.slice(0,40);
  const knockout=fixture.type==='cup'||fixture.type==='promotion-playoff'||fixture.phase==='knockout'||fixture.type==='world';
  let tieResult=null;
  if(knockout&&fixture.twoLegged){
    tieResult=tieOutcome(c.fixtures,fixture,c.club.id,fixture.id+':'+c.season);
    if(tieResult.resolved&&tieResult.penalties){
      fixture.score.penalties=teamOnHome()?{home:tieResult.penalties.own,away:tieResult.penalties.opponent}:{home:tieResult.penalties.opponent,away:tieResult.penalties.own};
      m.events.push({minute:90,text:'Agregado '+tieResult.ownGoals+'–'+tieResult.opponentGoals+'. Decisão por pênaltis: '+tieResult.penalties.own+'–'+tieResult.penalties.opponent+'. '+(tieResult.advanced?c.club.name:fixture.opponent.name)+' avança.'});
    }
  } else if(knockout&&ownGoals===oppGoals){
    const ownPens=3+stableNumber(c.club.id+':'+fixture.id+':'+c.season)%3,oppPens=2+stableNumber(fixture.opponent.id+':'+fixture.id+':'+c.season)%3,tied=ownPens===oppPens,adjustedOpp=tied?Math.max(2,oppPens-1):oppPens,winner=ownPens>adjustedOpp?c.club.name:fixture.opponent.name;fixture.score.penalties=teamOnHome()?{home:ownPens,away:adjustedOpp}:{home:adjustedOpp,away:ownPens};m.events.push({minute:90,text:'Decisão por pênaltis: '+ownPens+'–'+adjustedOpp+'. '+winner+' avança.'});
  }
  const advanced=fixture.twoLegged?(tieResult?.resolved?tieResult.advanced:null):resultClass(fixture)==='win';
  const targetStats=m.source==='national'?c.national.stats:c.stats;
  targetStats.played++;targetStats.gf+=ownGoals;targetStats.ga+=oppGoals;
  if(ownGoals>oppGoals){targetStats.wins++;targetStats.points+=3;c.manager.xp+=120;c.manager.reputation=clamp(c.manager.reputation+1,1,100);}
  else if(ownGoals===oppGoals){targetStats.draws++;targetStats.points++;c.manager.xp+=55;}
  else{targetStats.losses++;c.manager.xp+=25;}
  c.manager.level=1+Math.floor(c.manager.xp/500);
  c.manager.license=managerLicense(c.manager.reputation);
  let completedLeagueRound=null;
  if(m.source==='club'){
    completedLeagueRound=updateTableForMatch(fixture,ownGoals,oppGoals);c.week++;c.date=addDays(fixture.date,1);
    const outcome=ownGoals>oppGoals?'win':ownGoals<oppGoals?'loss':'draw',consequences=applyMatchConsequences(c.roster,m,{result:outcome,date:fixture.date,seed:fixture.id+':'+c.season});
    const contractBonuses=applyContractMatchBonuses(c,m),marketPressure=updateContractMood(c,{result:outcome,lineupIds:m.ownLineup.map(player=>player.id)});
    if(contractBonuses.total)c.messages.push({id:'contract-bonus-'+Date.now(),from:'Diretor de futebol',subject:'Bônus contratuais liquidados',body:'Foram pagos '+money(contractBonuses.total)+' em bônus de presença e desempenho: '+contractBonuses.entries.join('; ')+'.',date:c.date,read:false,priority:'normal'});
    marketPressure.alerts.slice(0,2).forEach(alert=>c.messages.push({id:'market-pressure-'+Date.now()+'-'+alert.playerId,from:'Empresário · '+alert.playerName,subject:'Situação contratual exige atenção',body:alert.playerName+' entrou em nível '+alert.level+' de pressão: '+alert.reasons.join(', ')+'. Renove, aumente seu papel no elenco ou aceite negociar antes que concorrentes avancem.',date:c.date,read:false,priority:'high'}));
    const health=rosterHealthSummary(c.roster);c.fitness=health.fitness;c.morale=Math.round(average(c.roster.map(player=>player.morale)));repairCareerLineup(c);
    if(consequences.injuries.length){const diagnosis=consequences.injuries.map(item=>item.name+' · '+item.type+' ('+item.daysRemaining+' dias)').join('; ');c.messages.push({id:'injury-'+Date.now(),from:'Departamento médico',subject:'Boletim médico pós-jogo',body:diagnosis,date:new Date().toISOString(),read:false,priority:'high'});fixture.engineReport.injuries=consequences.injuries;c.matchReports[0].injuries=consequences.injuries;}
    const matchRevenue=fixture.type==='continental'?2400000:fixture.type==='promotion-playoff'?1600000:fixture.type==='cup'?1200000:850000,stadiumRevenue=Math.round(matchRevenue*(fixture.home?1+(c.facilities.stadium-2)*.12:.3)),sponsorBonus=resultClass(fixture)==='win'?Number(c.sponsor?.winBonus||0):0,revenue=stadiumRevenue+sponsorBonus;c.budget+=revenue;c.ledger.push({date:new Date().toISOString(),label:'Receita de jogo'+(sponsorBonus?' e bônus do patrocinador':'')+' · '+fixture.competitionName,amount:revenue,type:'income'});
    if(fixture.type==='cup'&&advanced!==null){if(advanced){const next=c.fixtures.find(f=>f.type==='cup'&&f.locked&&!f.cancelled);if(next)resolveCupDraw(next);}else cancelRemainingKnockout(fixture);}
    if(fixture.type==='promotion-playoff'&&tieResult?.resolved){
      c.brazilAccessPlayoff={...(c.brazilAccessPlayoff||{}),resolved:true,advanced:tieResult.advanced,ownGoals:tieResult.ownGoals,opponentGoals:tieResult.opponentGoals};
      c.messages.push({id:'access-result-'+Date.now(),from:'CBF',subject:tieResult.advanced?'Acesso à Série A conquistado':'Fim da disputa pelo acesso',body:tieResult.advanced?'O agregado terminou '+tieResult.ownGoals+'–'+tieResult.opponentGoals+(tieResult.penalties?' nos pênaltis':'')+'. O clube assegurou o acesso à Série A.':'O agregado terminou '+tieResult.ownGoals+'–'+tieResult.opponentGoals+(tieResult.penalties?' nos pênaltis':'')+'. O clube permanecerá na Série B.',date:c.date,read:false,priority:'high'});
    }
    if(fixture.type==='continental'&&(fixture.phase==='league'||fixture.phase==='group')){
      const groupFixtures=c.fixtures.filter(f=>f.competitionId===fixture.competitionId&&(f.phase==='league'||f.phase==='group'));
      const progress=groupProgress(groupFixtures,7),next=c.fixtures.find(f=>f.competitionId===fixture.competitionId&&f.phase==='knockout'&&!f.cancelled);
      if(progress.complete){if(progress.qualified&&next)resolveTournamentDraw(next);else c.fixtures.filter(f=>f.competitionId===fixture.competitionId&&f.phase==='knockout').forEach(f=>{f.cancelled=true;f.locked=true;});c.messages.push({id:'continental-phase-'+Date.now(),from:'Confederação continental',subject:progress.qualified?'Classificação ao mata-mata':'Eliminação continental',body:progress.qualified?'O grupo terminou com '+progress.points+' pontos. A campanha garantiu vaga nas oitavas e o sorteio foi realizado.':'O grupo terminou com '+progress.points+' pontos e a equipe não avançou ao mata-mata.',date:new Date().toISOString(),read:false,priority:'high'});}
    } else if(fixture.type==='continental'&&fixture.phase==='knockout'&&advanced!==null) {if(advanced){const next=c.fixtures.find(f=>f.competitionId===fixture.competitionId&&f.phase==='knockout'&&f.locked&&!f.cancelled&&new Date(f.date)>new Date(fixture.date));if(next)resolveTournamentDraw(next);}else cancelRemainingKnockout(fixture);}
    const careerReview=reviewManagerMatch(c,{result:outcome,goalDiff:ownGoals-oppGoals,opponentRating:fixture.opponent.rating,competitionType:fixture.type,knockedOut:(fixture.type==='cup'||fixture.phase==='knockout')&&advanced===false});
    c.pendingCareerReview=careerReview;
    if(careerReview.warning&&!careerReview.dismissed){const title=careerReview.warning==='critical'?'Ultimato da diretoria':careerReview.warning==='pressure'?'Pressão por resultados':'Trabalho em avaliação';c.messages.push({id:'board-warning-'+Date.now(),from:'Presidência',subject:title,body:'A confiança está em '+c.board+'%. '+careerReview.security.detail,date:c.date,read:false,priority:'high'});}
    if(careerReview.dismissed){c.messages.push({id:'dismissal-'+Date.now(),from:'Presidência de '+c.club.name,subject:'Encerramento do contrato',body:'A diretoria decidiu interromper o trabalho após a sequência de resultados. Seu histórico, reputação e licença foram preservados; o agente já abriu conversas com novos clubes.',date:c.date,read:false,priority:'high'});refreshCareerOpportunities(true);}
    if(c.stats.wins>=1)unlockAchievement('first-win','Primeira vitória','Conquiste sua primeira vitória como treinador principal.');
    if(c.stats.wins>=5)unlockAchievement('five-wins','Sequência de respeito','Alcance cinco vitórias na carreira.');
    if(oppGoals===0)unlockAchievement('clean-sheet','Muralha tática','Termine uma partida oficial sem sofrer gols.');
    if(m.substitutionsUsed>=3)unlockAchievement('active-manager','Leitura de jogo','Faça pelo menos três substituições durante uma partida.');
  } else {
    const n=c.national,playedQualifiers=n.fixtures.filter(f=>f.competitionId==='world-cup-qualifiers'&&f.played).length;
    const totalQualifiers=n.fixtures.filter(f=>f.competitionId==='world-cup-qualifiers').length;
    const nationalOutcome=ownGoals>oppGoals?'win':ownGoals<oppGoals?'loss':'draw',nationalConsequences=applyMatchConsequences(n.roster,m,{result:nationalOutcome,date:fixture.date,seed:'national:'+fixture.id+':'+c.season});
    recordNationalPerformance(n,{playerPerformance:m.playerPerformance||{},date:fixture.date});
    ensureNationalCallup(n);n.lineupIds=selectBestLineup(n.roster.filter(player=>n.calledUpIds.includes(player.id)),'4-3-3').map(player=>player.id);
    if(nationalConsequences.injuries.length)c.messages.push({id:'national-injury-'+Date.now(),from:'Departamento médico da seleção',subject:'Boletim médico pós-jogo',body:nationalConsequences.injuries.map(item=>item.name+' · '+item.type+' ('+item.daysRemaining+' dias)').join('; '),date:new Date().toISOString(),read:false,priority:'high'});
    c.date=addDays(fixture.date,1);
    if(playedQualifiers>=totalQualifiers&&!n.qualificationResolved){
      const pointsPerMatch={CONMEBOL:1.25,UEFA:1.55,CONCACAF:1.4,AFC:1.4,CAF:1.45,OFC:1.35}[n.team.confederation]||1.45;
      const qualifierPoints=n.fixtures.filter(f=>f.competitionId==='world-cup-qualifiers'&&f.played).reduce((sum,item)=>sum+(resultClass(item)==='win'?3:resultClass(item)==='draw'?1:0),0);
      n.qualified=qualifierPoints>=Math.ceil(totalQualifiers*pointsPerMatch);
      n.qualificationResolved=true;
      n.fixtures.filter(f=>f.competitionId==='continental-national-cup').forEach(f=>f.locked=false);
      if(n.qualified)n.fixtures.filter(f=>f.competitionId==='world-cup').forEach(f=>f.locked=false);
      c.messages.push({id:'qualification-'+Date.now(),from:'FIFA',subject:n.qualified?'Classificação para a Copa do Mundo':'Fim das Eliminatórias',body:n.qualified?'A seleção garantiu vaga na Copa do Mundo de 2026.':'A campanha terminou abaixo da linha de classificação para a Copa do Mundo.',date:new Date().toISOString(),read:false,priority:'high'});
    }
    if((fixture.competitionId==='continental-national-cup'||fixture.competitionId==='world-cup')&&(fixture.phase==='group'||fixture.phase==='knockout'))progressNationalTournament(n,fixture);
  }
  c.manager.level=1+Math.floor(c.manager.xp/500);c.weeklyDecisions={training:false,squad:false,tactics:false};session.market=[];processCareerDeadlines(c);updateBoardObjectives(c);simulateWorldWeek(completedLeagueRound||{});if(m.source==='club')scheduleBrazilAccessPlayoff(c);c.tactics={...m.ownTactics};ensureTacticalRoles(c);resolveCareerRelationsAfterMatch(c,{result:ownGoals>oppGoals?'win':ownGoals<oppGoals?'loss':'draw',lineupIds:m.source==='club'?c.lineupIds:[],date:fixture.date});persist();showPostMatchInterview(ownGoals,oppGoals);
}

function showPostMatchInterview(ownGoals,oppGoals){
  const result=ownGoals>oppGoals?'vitória':ownGoals<oppGoals?'derrota':'empate',m=session.match,report=m.postMatchReport||buildMatchReport(m);
  const reasons=(report.signals||[]).map(item=>'<li><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.detail)+'</span></li>').join('');
  const performers=(report.performers||[]).slice(0,3).map(item=>'<div><span>'+escapeHtml(item.name)+'</span><strong>'+Number(item.rating).toFixed(1)+'</strong><small>'+item.goals+' gol · '+item.assists+' assistência</small></div>').join('');
  const diagnoses=(session.career.matchReports?.[0]?.injuries||[]).map(item=>'<div class="post-match-injury"><strong>'+escapeHtml(item.name)+'</strong><span>'+escapeHtml(item.type)+' · '+item.daysRemaining+' dias</span></div>').join('');
  toastRoot.replaceChildren();
  showModal('Análise e entrevista pós-jogo','<div class="press-room phase5-report"><p class="eyebrow">MOTOR '+MATCH_ENGINE_V2_VERSION+' · '+escapeHtml(m.fixture.competitionName)+'</p><h3>'+escapeHtml(report.verdict)+'</h3><div class="press-summary"><span>Placar <strong>'+ownGoals+'–'+oppGoals+'</strong></span><span>xG <strong>'+report.ownXg.toFixed(1)+'–'+report.opponentXg.toFixed(1)+'</strong></span><span>Posse <strong>'+report.ownPossession+'%</strong></span><span>Alterações <strong>'+m.substitutionsUsed+'</strong></span></div>'+(reasons?'<div class="post-match-causes"><h4>O que decidiu a partida</h4><ul>'+reasons+'</ul></div>':'')+(performers?'<div class="post-match-ratings"><h4>Destaques</h4>'+performers+'</div>':'')+(diagnoses?'<div class="post-match-medical"><h4>Boletim médico</h4>'+diagnoses+'</div>':'')+'<h3>“Como você avalia a '+result+' e as decisões tomadas durante a partida?”</h3><p>Suas palavras afetam elenco, diretoria, torcida e reputação.</p></div>','<button class="btn" data-action="post-interview" data-tone="calm">Valorizar o coletivo</button><button class="btn" data-action="post-interview" data-tone="demanding">Cobrar evolução</button><button class="btn btn-primary" data-action="post-interview" data-tone="protective">Proteger os jogadores</button>');
}

function completePostMatchInterview(tone){const c=session.career,m=session.match;if(!m)return;const effects={calm:[2,1,1],demanding:[-1,2,0],protective:[3,0,1]},[morale,board,reputation]=effects[tone]||[0,0,0],dismissed=Boolean(c.pendingCareerReview?.dismissed);c.morale=clamp(c.morale+morale,1,100);if(!dismissed)c.board=clamp(c.board+board,1,100);c.manager.reputation=clamp(c.manager.reputation+reputation,1,100);c.roster.forEach(player=>player.morale=clamp(player.morale+morale,1,100));recordPressDecision(c,tone);c.mediaHistory.push({date:c.date,competition:m.fixture.competitionName,tone,minute:m.minute,score:m.homeGoals+'-'+m.awayGoals});c.messages.push({id:'press-'+Date.now(),from:'Assessoria de imprensa',subject:'Repercussão da entrevista pós-jogo',body:tone==='protective'?'O elenco aprovou sua postura de proteção.':tone==='demanding'?'A cobrança elevou a pressão por desempenho.':'A mensagem coletiva foi recebida com equilíbrio.',date:new Date().toISOString(),read:false,priority:'normal'});const destination=m.source==='national'?'national':'dashboard';delete c.pendingCareerReview;closeModal();session.match=null;persist();navigate(destination);toast(dismissed?'Contrato encerrado. Novas propostas já estão disponíveis.':'Entrevista publicada e impactos aplicados.',dismissed?'error':'success');}

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

function scheduleBrazilAccessPlayoff(c) {
  const league=findLeague(c.club?.leagueId),profile=regulationForLeague(league,c.season);
  if(league?.id!=='brasileirao-b'||Number(profile.promotionPlayoffLegs)!==2)return false;
  if(c.fixtures.some(fixture=>fixture.type==='promotion-playoff'))return false;
  const state=c.worldState?.leagues?.[league.id];
  if(!state?.rounds?.length||state.rounds.some(round=>round.some(match=>match[2]===null||match[3]===null)))return false;
  const table=sortCompetitionTable(state.table,state.rules?.tiebreakers),rank=table.findIndex(row=>row.id===c.club.id)+1;
  if(rank<3||rank>6)return false;
  const opponentRank=rank===3?6:rank===4?5:rank===5?4:3,opponentRow=table[opponentRank-1];
  if(!opponentRow)return false;
  const opponentTeam=(state.teams||[]).find(team=>team.id===opponentRow.id)||{id:opponentRow.id,name:opponentRow.name,rating:opponentRow.rating,badge:opponentRow.badge||''};
  const dates=(profile.calendar?.playoffs||[]).map(item=>item[0]).filter(Boolean);
  if(dates.length<2)return false;
  const tieId=league.id+'-access-'+c.club.id+'-'+opponentTeam.id;
  const fixtureBase={competitionId:league.id,competitionName:league.name,type:'promotion-playoff',phase:'knockout',stage:'Playoff de acesso · '+rank+'º × '+opponentRank+'º',round:39,tieId,legs:2,twoLegged:true,opponent:opponentTeam,played:false,locked:false,score:null,formatRule:'Série B 2026 · 3º ao 6º disputam duas vagas em ida e volta'};
  c.fixtures.push(
    {...fixtureBase,id:tieId+'-1',leg:1,date:new Date(dates[0]+'T16:00:00Z').toISOString(),home:rank>opponentRank},
    {...fixtureBase,id:tieId+'-2',leg:2,date:new Date(dates[1]+'T16:00:00Z').toISOString(),home:rank<opponentRank}
  );
  c.fixtures.sort((left,right)=>new Date(left.date)-new Date(right.date));
  c.brazilAccessPlayoff={season:c.season,rank,opponentRank,opponentId:opponentTeam.id,resolved:false,advanced:null,tieId};
  c.messages.push({id:'access-playoff-'+Date.now(),from:'CBF',subject:'Playoff de acesso confirmado',body:'A Série B terminou em '+rank+'º. Você enfrentará '+opponentTeam.name+' em ida e volta pelas vagas restantes na Série A. Ida: '+dates[0]+'. Volta: '+dates[1]+'.',date:c.date,read:false,priority:'high'});
  return true;
}

function showChampionCelebration(trophies=[]) {
  if(!trophies.length)return;
  const cards=trophies.map(trophy=>'<article class="champion-card"><span class="champion-logo">'+competitionLogo(trophy.competitionId,trophy.competitionName)+'</span><div><small>'+escapeHtml(trophy.label).toUpperCase()+' · '+trophy.season+'</small><h3>'+escapeHtml(trophy.competitionName)+'</h3><p>'+escapeHtml(trophy.club.name)+' é campeão.</p></div><b>+'+trophy.xp+' XP</b></article>').join('');
  showModal('Parabéns, campeão!','<section class="champion-celebration"><span class="champion-cup">'+iconSvg('trophy')+'</span><p class="eyebrow">TEMPORADA ENCERRADA</p><h2>Uma conquista entra para a história</h2><p>O título foi registrado na sua sala de troféus e aumentou a pontuação da carreira.</p><div class="champion-list">'+cards+'</div></section>','<button class="btn btn-primary" data-action="close-modal">Celebrar e continuar</button>');
}

function advanceSeason() {
  const c=session.career,league=findLeague(c.club.leagueId),leagueGames=c.fixtures.filter(f=>f.type==='league');
  if(!leagueGames.length||!leagueGames.every(f=>f.played)){toast('Conclua os jogos da liga antes de encerrar a temporada.','error');return;}
  const accessPlayoffs=c.fixtures.filter(f=>f.type==='promotion-playoff');
  if(accessPlayoffs.length&&!accessPlayoffs.every(f=>f.played)){toast('Conclua o playoff de acesso antes de encerrar a temporada.','error');return;}
  const table=sortedTable(),rank=table.findIndex(row=>row.team.id===c.club.id)+1,rules=league.rules||{};
  const regulation=regulationForLeague(league,c.season),worldLeague=c.worldState?.leagues?.[league.id];
  const relegatedIds=resolveRelegationTable(worldLeague?.table||table.map(row=>({...row,id:row.team.id,rating:row.team.rating})),regulation);
  const relegated=relegatedIds.includes(c.club.id);
  const promoted=league.division>1&&(accessPlayoffs.length?c.brazilAccessPlayoff?.advanced===true:resolvePromotion(rules,rank,table,c.club));
  const champion=rank===1;
  const continentalId=competitionForRank(rules,rank);
  const continentalGames=c.fixtures.filter(f=>f.type==='continental'&&f.played);
  const continentalWins=continentalGames.filter(f=>resultClass(f)==='win').length;
  const continentalChampion=continentalGames.length>=6&&continentalWins/continentalGames.length>=.75;
  const cupGames=c.fixtures.filter(f=>f.type==='cup'&&f.played),cupChampion=cupGames.length>=5&&resultClass(cupGames[cupGames.length-1])==='win';
  const summary={season:c.season,league:league.name,rank,points:table[rank-1]?.points||0,champion,promoted,relegated,continentalQualification:continentalId,cupChampion,continentalChampion};
  const titles=seasonTrophies({season:c.season,club:c.club,league,champion,cupChampion,continentalChampion,continentalId:continentalGames[0]?.competitionId||continentalId,date:c.date});
  const knownTrophies=new Set(c.trophies.map(trophy=>trophy.id));
  const newTitles=titles.filter(trophy=>!knownTrophies.has(trophy.id));
  c.trophies.push(...newTitles);
  c.seasonHistory.push(summary);c.seasonSummary=summary;
  const prize=Math.max(1000000,Math.round((table.length-rank+1)*750000+(champion?12000000:0)+(cupChampion?7000000:0)+(continentalChampion?18000000:0)));
  c.budget+=prize;c.ledger.push({date:new Date().toISOString(),label:'Premiação da temporada '+c.season,amount:prize,type:'income'});
  if(champion)c.manager.awards.push('Campeão de '+league.name+' '+c.season);
  if(cupChampion)c.manager.awards.push('Campeão da copa nacional '+c.season);
  if(continentalChampion)c.manager.awards.push('Campeão continental '+c.season);
  const sponsorTitleBonus=(champion||cupChampion||continentalChampion)?Number(c.sponsor?.titleBonus||0):0;if(sponsorTitleBonus){c.budget+=sponsorTitleBonus;c.ledger.push({date:new Date().toISOString(),label:'Bônus de título · '+c.sponsor.name,amount:sponsorTitleBonus,type:'income'});}
  const rankingXp=champion?1500:Math.max(250,(table.length-rank+1)*55),additionalTitleXp=newTitles.filter(trophy=>trophy.competitionId!==league.id).reduce((sum,trophy)=>sum+trophy.xp,0);
  c.manager.xp+=rankingXp+additionalTitleXp;
  c.manager.reputation=clamp(c.manager.reputation+(champion?5:rank<=Math.ceil(table.length/4)?2:relegated?-5:0),1,100);
  c.manager.level=1+Math.floor(c.manager.xp/500);c.manager.license=managerLicense(c.manager.reputation);
  const aging=processSeasonAging(c.roster,{season:c.season,seed:c.club.id+':'+c.season});
  processSeasonAging(c.youthPlayers||[],{season:c.season,seed:'academy:'+c.club.id+':'+c.season});
  advanceRosterDays(c.roster,35,{medicalLevel:c.facilities.medical,fitnessCoach:c.staff.fitnessCoach});repairCareerLineup(c);
  const status=promoted?'promoted':relegated?'relegated':'stayed',linked=linkedLeagueFor(league,status);
  const qualificationSeeds=deriveWorldQualifications({leagues:session.catalog.leagues,clubs:session.catalog.clubs,leagueStates:c.worldState?.leagues||{}});
  const rivalSettlement=settleRivalSeason(c,c.worldState,session.catalog);
  if(linked){c.club.leagueId=linked.id;c.club.leagueName=linked.name;c.club.division=linked.division;}
  c.season+=1;c.week=1;c.stats={played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0};c.lastTrainingWeek=0;c.worldState=createWorldState(c.season,{managedClub:c.club,qualificationSeeds});if(c.sponsor){c.sponsor.years--;if(c.sponsor.years<=0){c.sponsor=null;c.sponsorOffers=generateSponsorOffers(c.club,c.facilities);}else{c.budget+=c.sponsor.annual;c.ledger.push({date:new Date().toISOString(),label:'Patrocínio anual · '+c.sponsor.name,amount:c.sponsor.annual,type:'income'});}}
  const newLeague=findLeague(c.club.leagueId),participants=selectLeagueParticipants(c.club);
  const startDate=careerStartDate(c.club,c.season);
  let fixtures=[...buildLeagueFixtures(c.club,participants,startDate,c.worldState),...buildCupFixtures(c.club,participants,startDate)];
  if(continentalId||clubWorldQualification(c.worldState.tournaments,c.club.id))fixtures.push(...buildContinentalFixtures(c.club,startDate,participants,continentalId,c.worldState));
  if(continentalChampion)fixtures.push(...buildWorldFixtures(c.club,startDate));
  c.participants=participants;c.fixtures=fixtures.sort((a,b)=>new Date(a.date)-new Date(b.date));syncCareerTableFromWorld(c);c.date=startDate.toISOString();processCareerDeadlines(c);
  const managerCareer=ensureManagerCareer(c);if(managerCareer.contractEndSeason<=c.season&&c.board>=35){managerCareer.contractEndSeason=c.season+2;managerCareer.history.push({type:'renewed',date:c.date,season:c.season,clubName:c.club.name,label:'Contrato renovado pelo '+c.club.name});}refreshCareerOpportunities(true);
  c.messages.push({id:'season-'+Date.now(),from:'Diretoria e federação',subject:'Temporada '+c.season+' iniciada',body:'Posição anterior: '+rank+'º. '+(linked?'O clube agora disputará '+newLeague.name+'. ':'')+(continentalId?'Vaga continental confirmada: '+continentalId+'. ':'')+'Premiação: '+money(prize)+'. Evolução anual: '+aging.improved.length+' jogador(es) subiram de GER e '+aging.declined.length+' tiveram declínio. '+rivalSettlement.summaries.length+' clubes rivais atualizaram orçamento e elenco; '+rivalSettlement.contractEvents.length+' situação(ões) contratual(is) e '+rivalSettlement.managerChanges.length+' troca(s) de treinador foram registradas.',date:new Date().toISOString(),read:false,priority:'high'});
  persist();navigate('dashboard');if(newTitles.length)showChampionCelebration(newTitles);else toast('Nova temporada criada com acesso, rebaixamento e vagas aplicados.','success');
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

function upgradeFacility(id){
  const c=ensureEconomy(session.career),q=facilityQuote(c,id);if(!q)return;
  if(q.level>5)return toast('Instalação no nível máximo.','error');
  if(c.construction.some(p=>p.id===id))return toast('Obra em andamento. Consulte o prazo no campus.');
  showModal('Projeto · '+q.name,'<p>'+escapeHtml(q.benefit)+'.</p><div class="finance-cards"><span>Investimento<strong>'+money(q.cost)+'</strong></span><span>Prazo<strong>'+q.duration+' dias</strong></span><span>Manutenção adicional<strong>'+money(q.maintenance)+'/mês</strong></span></div><p>O nível '+q.level+' entra em operação quando a obra terminar.</p>','<button class="btn" data-action="close-modal">Voltar</button><button class="btn btn-primary" data-action="confirm-facility" data-facility="'+id+'">Iniciar obra</button>');
}

function renderFinance(c){
  ensureEconomy(c);const f=financeForecast(c);
  return '<section class="panel finance-hub"><header><div><p class="eyebrow">CONTROLE FINANCEIRO</p><h2>Planeje os próximos 90 dias</h2></div><span class="tag">'+(f.projected<0?'Atenção ao caixa':'Caixa projetado positivo')+'</span></header><div class="finance-cards"><span>Receita recorrente<strong>'+money(f.recurring)+'/mês</strong></span><span>Salários e operação<strong>'+money(f.expenses)+'/mês</strong></span><span>Parcelas em 90 dias<strong>'+money(f.installments)+'</strong></span><span>Caixa projetado<strong class="'+(f.projected<0?'negative':'positive')+'">'+money(f.projected)+'</strong></span></div><p class="muted">Projeção conservadora: não inclui futuros jogos, vendas, prêmios ou novos patrocínios. O fechamento mensal cobra salários, comissão e manutenção automaticamente.</p></section>';
}

function salePlayer(id){
  const c=session.career,p=c.roster.find(p=>p.id===id),clubs=session.catalog.clubs.filter(club=>club.id!==c.club.id&&Math.abs(club.rating-(p?.overall||65))<12);
  const buyer=clubs[stableNumber(id+c.date)%Math.max(1,clubs.length)]?.name||'Clube interessado';
  const result=createSaleOffer(c,p,buyer);if(result.error)return toast(result.error,'error');persist();const o=result.offer;
  showModal('Oferta · '+p.name,'<p><strong>'+escapeHtml(o.buyer)+'</strong> oferece '+money(o.fee)+' por '+escapeHtml(p.name)+'.</p><p>Salário liberado: '+money(p.salary*1000)+'/mês. Proposta válida até '+formatDate(o.expiresAt)+'.</p>','<button class="btn" data-action="close-modal">Decidir depois</button><button class="btn btn-primary" data-action="accept-sale" data-offer="'+escapeHtml(o.id)+'">Aceitar venda</button>');
}

function renewPlayer(id){
  const p=session.career.roster.find(p=>p.id===id);if(!p||p.onLoan)return;
  const salary=Math.max(1000,Math.round(p.salary*1100));
  showModal('Renovação · '+p.name,'<p>Contrato atual: '+formatDate(p.contractUntil)+'. Expectativa salarial: '+money(salary)+'/mês.</p><div class="negotiation-fields"><label>Salário mensal<input id="renew-salary" type="number" min="1000" value="'+salary+'"></label><label>Temporadas<select id="renew-years"><option>1</option><option selected>2</option><option>3</option></select></label></div><p>Luvas: dois salários. A renovação respeita o limite da folha.</p>','<button class="btn" data-action="close-modal">Voltar</button><button class="btn btn-primary" data-action="confirm-renewal" data-player="'+escapeHtml(id)+'">Renovar</button>');
}
function confirmRenewal(id){
  const c=session.career,p=c.roster.find(p=>p.id===id);if(!p||p.onLoan)return;
  const salary=Number(document.querySelector('#renew-salary').value),years=Number(document.querySelector('#renew-years').value),signing=salary*2;
  const invalid=validateDeal(c,p,{fee:0,salary,years,signing,renewal:true});if(invalid)return toast(invalid,'error');
  if(salary<Math.round(p.salary*1100))return toast('O agente pede pelo menos 10% de reajuste.','error');
  const end=new Date(Math.max(new Date(c.date).getTime(),new Date(p.contractUntil).getTime()));end.setUTCFullYear(end.getUTCFullYear()+years);
  p.salary=salary/1000;p.contractUntil=end.toISOString().slice(0,10);c.budget-=signing;c.ledger.push({date:c.date,label:'Luvas de renovação · '+p.name,amount:-signing,type:'expense'});closeModal();persist();renderGame(renderSquad());toast('Contrato renovado.','success');
}

function acceptSponsor(id){const c=session.career,offer=c.sponsorOffers.find(item=>item.id===id);if(!offer)return;c.sponsor={...offer};c.sponsorOffers=[];c.budget+=offer.annual;c.ledger.push({date:new Date().toISOString(),label:'Patrocínio anual · '+offer.name,amount:offer.annual,type:'income'});c.messages.push({id:'sponsor-'+Date.now(),from:'Diretoria comercial',subject:'Novo patrocinador principal',body:offer.name+' assinou por '+offer.years+' temporadas. Receita anual: '+money(offer.annual)+'.',date:new Date().toISOString(),read:false,priority:'high'});unlockAchievement('commercial-deal','Executivo de mercado','Assine seu primeiro patrocinador principal.');persist();renderGame(renderClub());toast('Contrato de patrocínio assinado.','success');}

async function acceptClubJob(clubId) {
  const c=session.career,club=c.jobOffers.find(item=>item.id===clubId);
  if(!club?.rosterPath)return toast('Esta proposta não possui elenco comandável.','error');
  try{
    const data=await fetchJson(club.rosterPath),roster=(data.players||[]).map(normalizePlayer);
    if(roster.length<11)throw new Error('Elenco insuficiente');
    const managerCareer=ensureManagerCareer(c),previous=managerCareer.status==='employed'?c.club.name:(managerCareer.previousClub?.name||c.club.name),participants=selectLeagueParticipants(club);
    const startDate=new Date(c.date);if(Number.isNaN(startDate.getTime()))startDate.setTime(new Date(c.season,1,7,16).getTime());startDate.setDate(startDate.getDate()+2);startDate.setHours(16,0,0,0);
    const tier=clamp(Math.round((Number(club.rating)-52)/10),1,4),newBudget=Math.max(12000000,Math.round((35+(club.rating-65)*3.2)*1000000));
    c.construction=[];c.transferOffers=[];c.transferObligations=[];c.economy=null;session.market=[];
    c.club={...club};c.roster=roster;c.lineupIds=pickLineup(roster).map(p=>p.id);c.participants=participants;c.table=initialTable(participants);
    c.fixtures=[...buildLeagueFixtures(club,participants,startDate),...buildCupFixtures(club,participants,startDate),...buildContinentalFixtures(club,startDate,participants)].sort((a,b)=>new Date(a.date)-new Date(b.date));
    c.date=startDate.toISOString();c.week=Math.max(1,Number(c.week)||1);c.stats={played:0,wins:0,draws:0,losses:0,gf:0,ga:0,points:0};c.budget=newBudget;c.board=68;c.morale=72;c.fitness=88;c.jobOffers=[];
    c.facilities={training:tier,youth:Math.max(1,tier-1),medical:tier,scouting:tier,stadium:Math.min(5,tier+1),commercial:tier};
    c.staff={assistant:clamp(club.rating-3,55,88),fitnessCoach:clamp(club.rating-5,55,88),scout:clamp(club.rating-4,55,88),medical:clamp(club.rating-5,55,88)};
    c.transferPolicy={wageBudget:Math.round(newBudget*.18),maxSquad:35,foreignLimit:null};c.sponsor=null;c.sponsorOffers=generateSponsorOffers(club,c.facilities);c.lastTrainingWeek=0;c.weeklyDecisions={training:false,squad:false,tactics:false};c.individualTraining={};
    c.ledger.push({date:c.date,label:'Orçamento do novo projeto · '+club.name,amount:newBudget,type:'income'});
    ensureEconomy(c);
    recordClubAppointment(c,club);c.boardObjectives=createBoardObjectives(c);
    c.messages.push({id:'club-job-'+Date.now(),from:'Diretoria de '+club.name,subject:'Novo contrato assinado',body:'Você deixou '+previous+' e assumiu '+club.name+'. O calendário da nova temporada foi carregado.',date:new Date().toISOString(),read:false,priority:'high'});
    persist();navigate('dashboard');toast('Novo desafio iniciado no '+club.name+'.','success');
  }catch{toast('Não foi possível carregar o elenco do novo clube.','error');}
}

function buyPlayer(id) {
  const p=session.market.find(item=>item.id===id),c=session.career;if(!p)return;const profile=marketNegotiationProfile(p,c),fee=p.freeAgent?0:Math.round(marketValue(p,c.date)*profile.clubFlexibility),salary=Math.max(25000,Math.round(p.salary*1000*profile.minimumSalaryMultiplier)),competition=transferCompetition(c,session.catalog,p,{fee,salary,expectedSalary:salary});
  if(session.career.roster.length>=session.career.transferPolicy.maxSquad){toast('O elenco atingiu o limite de registro.','error');return;}
  const rivals=competition.rivals.map(rival=>'<li><span><strong>'+escapeHtml(rival.name)+'</strong><small>'+escapeHtml(rival.reason)+'</small></span><b>'+money(rival.fee)+'</b></li>').join('');
  const contest=rivals?'<section class="transfer-rival-interest"><header><strong>Concorrência ativa</strong><span>pressão '+competition.pressure+'%</span></header><p>'+(competition.playerWins?'Sua proposta inicial lidera, mas o agente ainda pode pedir melhora.':'Há clubes preparados para superar uma proposta abaixo das expectativas.')+'</p><ul>'+rivals+'</ul></section>':'<p class="muted">Nenhum concorrente formalizado neste momento.</p>';
  showModal('Mesa de negociação · '+p.name,'<div class="transfer-negotiation"><p><strong>'+escapeHtml(p.sourceClub||'Clube vendedor')+'</strong> aceita analisar condições. <strong>'+escapeHtml(profile.summary)+'</strong>.</p>'+contest+'<div class="negotiation-fields"><label>Taxa de transferência<input id="neg-fee" type="number" min="0" step="100000" value="'+fee+'" '+(p.freeAgent?'readonly':'')+'><small>'+ (p.freeAgent?'Atleta livre: sem taxa entre clubes.':'Pedido estimado: '+money(fee)) +'</small></label><label>Salário mensal<input id="neg-salary" type="number" min="1000" step="1000" value="'+salary+'"><small>Expectativa do agente: '+money(salary)+'</small></label><label>Duração<select id="neg-years"><option>2</option><option>3</option><option selected>4</option><option>5</option></select></label><label>Luvas<input id="neg-signing" type="number" min="0" step="50000" value="'+Math.round(salary*5)+'"></label><label>Parcelas<select id="neg-installments"><option value="1">À vista</option><option value="2">2 parcelas</option><option value="3" selected>3 parcelas</option></select></label><label>Cláusula de rescisão<input id="neg-release" type="number" min="0" step="1000000" value="'+Math.round(fee*2.2)+'"></label><label>Bônus por jogo<input id="neg-appearance" type="number" min="0" step="500" value="'+p.appearanceBonus+'"></label><label>Bônus por gol<input id="neg-goal" type="number" min="0" step="500" value="'+p.goalBonus+'"></label></div><p class="muted">Comissão de '+Math.round(profile.agentFeeRate*100)+'% sobre a taxa. Parcelas, bônus e cláusula ficam registrados no contrato.</p></div>','<button class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-transfer" data-player="'+escapeHtml(id)+'" data-asking="'+fee+'" data-expected-salary="'+salary+'" data-agent-rate="'+profile.agentFeeRate+'">Enviar proposta</button>');
}

function confirmTransfer(target) {
  const id=target.dataset.player,p=session.market.find(item=>item.id===id);if(!p)return;const asking=Number(target.dataset.asking),expected=Number(target.dataset.expectedSalary),fee=Number(document.querySelector('#neg-fee')?.value),salary=Number(document.querySelector('#neg-salary')?.value),years=Number(document.querySelector('#neg-years')?.value||4),signing=Number(document.querySelector('#neg-signing')?.value||0),installments=Number(document.querySelector('#neg-installments')?.value||1),releaseClause=Number(document.querySelector('#neg-release')?.value||0),appearanceBonus=Number(document.querySelector('#neg-appearance')?.value||0),goalBonus=Number(document.querySelector('#neg-goal')?.value||0),agentFeeRate=Number(target.dataset.agentRate||.05),agentFee=Math.round(fee*agentFeeRate),installmentAmount=Math.ceil(fee/installments),firstInstallment=Math.min(fee,installmentAmount),initial=firstInstallment+agentFee+signing;
  const invalid=validateDeal(session.career,p,{fee,salary,years,signing,installments,releaseClause,agentFeeRate});if(invalid)return toast(invalid,'error');
  if(fee<asking*.9){showModal('Contraproposta do clube','<p>'+escapeHtml(p.sourceClub||'O clube vendedor')+' recusou a taxa. A contraproposta é <strong>'+money(Math.round(asking*1.08))+'</strong>.</p><p>Você pode retornar à mesa ou encerrar.</p>','<button class="btn" data-action="close-modal">Encerrar</button><button class="btn btn-primary" data-action="buy-player" data-player="'+escapeHtml(id)+'">Renegociar</button>');return;}
  if(salary<expected*.88){showModal('Exigência do agente','<p>O agente considera o salário insuficiente. A expectativa mínima é <strong>'+money(expected)+'</strong>.</p>','<button class="btn" data-action="close-modal">Encerrar</button><button class="btn btn-primary" data-action="buy-player" data-player="'+escapeHtml(id)+'">Reformular contrato</button>');return;}
  if(session.career.budget<initial){closeModal();toast('Orçamento insuficiente para a primeira parcela, luvas e comissão.','error');return;}
  const competition=transferCompetition(session.career,session.catalog,p,{fee,salary,expectedSalary:expected});
  if(!competition.playerWins){
    const move=recordRivalTransfer(session.career,session.catalog,p,competition);
    session.career.messages.push({id:'market-lost-'+Date.now(),from:'Diretor de futebol',subject:'Negociação perdida: '+p.name,body:(move?.to||competition.best?.name||'Um rival')+' superou a proposta por '+p.name+'. A janela continua aberta para novos alvos.',date:session.career.date,read:false,priority:'high'});
    session.market=session.market.filter(item=>item.id!==id);closeModal();persist();renderGame(renderMarket());toast('Um concorrente venceu a disputa por '+p.name+'.','error');return;
  }
  session.career.budget-=initial;recordUserTransfer(session.career,session.catalog,p);session.career.roster.push({...p,salary:Math.round(salary/1000),contractUntil:(session.career.season+years)+'-06-30',releaseClause,appearanceBonus,goalBonus,agentFeeRate,transferFee:fee,contractSatisfaction:72});session.career.ledger.push({date:new Date().toISOString(),label:'Transferência · '+p.name+' · parcela 1/'+installments+' + luvas e comissão',amount:-initial,type:'expense',remainingInstallments:installments-1,totalFee:fee});if(installments>1){session.career.transferObligations.push({id:'transfer-'+Date.now(),playerId:p.id,playerName:p.name,remainingBalance:Math.max(0,fee-firstInstallment),installmentAmount,nextDue:addDays(session.career.date,30),remainingInstallments:installments-1});}session.career.messages.push({id:'transfer-'+Date.now(),from:'Diretor de futebol',subject:'Contratação concluída: '+p.name,body:'Contrato de '+years+' temporadas com '+p.agent+'. Salário: '+money(salary)+'. Taxa: '+money(fee)+' em '+installments+' parcela(s). Bônus por jogo: '+money(appearanceBonus)+'.',date:new Date().toISOString(),read:false,priority:'normal'});session.market=session.market.filter(item=>item.id!==id);ensureMarketIntelligence(session.career);unlockAchievement('first-signing','Primeira contratação','Conclua uma negociação internacional de transferência.');closeModal();persist();renderGame(renderMarket());toast(p.name+' assinou por '+years+' temporadas.','success');
}

function playerReport(id){
  const p=session.market.find(item=>item.id===id)||session.career.roster.find(item=>item.id===id);if(!p)return;
  const attrs=Object.entries(p.attributes||{}).map(([key,value])=>'<div><span>'+escapeHtml(({pace:'Velocidade',stamina:'Resistência',strength:'Força',passing:'Passe',technique:'Técnica',vision:'Visão',finishing:'Finalização',tackling:'Desarme',positioning:'Posicionamento',decisions:'Decisões',teamwork:'Trabalho em equipe',leadership:'Liderança'})[key]||key)+'</span><strong>'+value+'</strong></div>').join('');
  const media=licensedPlayerMedia(p),identity=media?'Foto real do Wikimedia Commons · '+escapeHtml(media.license.name)+' · '+escapeHtml(media.credit||'crédito no manifesto'):'Foto genérica provisória criada para o VFM; este jogador ainda não possui correspondência real verificada.';
  const details=[p.nationality,p.foot?('Pé '+p.foot):'',p.height?(p.height+' cm'):''].filter(Boolean).map(escapeHtml).join(' · ');
  const status=playerStatus(p),roles=Object.entries(p.positionRatings||{}).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([role,rating])=>'<span><b>'+role+'</b><strong>'+rating+'</strong></span>').join('');
  const performance='<div class="player-performance-grid"><span><small>Rendimento hoje</small><strong>'+effectiveOverall(p,p.pos).toFixed(1)+'</strong></span><span><small>Forma</small><strong>'+Math.round(p.form)+'%</strong></span><span><small>Físico</small><strong>'+Math.round(p.fitness)+'%</strong></span><span><small>Carga</small><strong>'+Math.round(p.workload)+'%</strong></span><span><small>Ritmo</small><strong>'+Math.round(p.sharpness)+'%</strong></span><span><small>Entrosamento</small><strong>'+Math.round(p.chemistry)+'%</strong></span></div><div class="position-ratings"><h4>Nota por posição</h4>'+roles+'</div><div class="medical-status '+status.className+'"><strong>'+escapeHtml(status.label)+'</strong><small>'+p.seasonMinutes+' min · '+p.appearances+' jogos na temporada</small></div>';
  const owned=session.career.roster.some(item=>item.id===id),management=owned&&!p.onLoan?'<button class="btn" data-action="make-promise" data-player="'+escapeHtml(id)+'">Prometer mais minutos</button><button class="btn" data-action="renew-player" data-player="'+escapeHtml(id)+'">Renovar contrato</button><button class="btn" data-action="sale-player" data-player="'+escapeHtml(id)+'">Ouvir proposta de venda</button>':'';
  const actions=p.onLoan&&p.purchaseOption?'<button class="btn" data-action="close-modal">Fechar</button><button class="btn btn-primary" data-action="exercise-purchase-option" data-player="'+escapeHtml(p.id)+'">Comprar por '+money(p.purchaseOption)+'</button>':'<button class="btn btn-primary" data-action="close-modal">Fechar</button>';
  hydrateMarketProfile(p,session.career);const risk=contractRisk(p,session.career);showModal('Relatório · '+p.name,'<div class="player-report"><header>'+playerPortrait(p,'large')+'<div><h3>'+escapeHtml(p.name)+'</h3><p>'+p.pos+' · '+p.age+' anos · '+escapeHtml(p.personality)+'</p><strong>GER '+p.overall+' · POT '+p.potential+'</strong><small>'+details+'</small></div></header>'+performance+'<div class="identity-source">'+identity+'</div><div class="attribute-grid">'+attrs+'</div><p>Empresário: <strong>'+escapeHtml(p.agent)+'</strong> · interesse de mercado: '+p.marketInterest+'% · satisfação: '+p.contractSatisfaction+'%</p><p>Pressão contratual: <strong>'+escapeHtml(risk.level)+' · '+risk.risk+'%</strong> · '+escapeHtml(risk.reasons.join(', '))+'.</p><p>Cláusula: '+money(p.releaseClause)+' · bônus por jogo: '+money(p.appearanceBonus)+' · bônus por gol: '+money(p.goalBonus)+'</p><p>Risco-base de lesão: '+p.injuryRisk+'% · Conhecimento do scout: '+p.knowledge+'% · Contrato: '+escapeHtml(p.contractUntil)+'</p></div>',management+actions);
}

function loanPlayer(id){const p=session.market.find(item=>item.id===id);if(!p)return;const fee=Math.max(100000,Math.round(marketValue(p,session.career.date)*.06)),wage=Math.max(10000,p.salary*1000);showModal('Empréstimo · '+p.name,'<p>Proposta de empréstimo por seis meses, com taxa de <strong>'+money(fee)+'</strong> e 70% dos salários.</p><p>Uma opção de compra de '+money(marketValue(p,session.career.date))+' será registrada.</p>','<button class="btn" data-action="close-modal">Cancelar</button><button class="btn btn-primary" data-action="confirm-loan" data-player="'+p.id+'" data-fee="'+fee+'" data-wage="'+wage+'">Enviar proposta</button>');}

function confirmLoan(target){
  const c=session.career,p=session.market.find(item=>item.id===target.dataset.player);if(!p)return;
  const fee=Math.max(100000,Math.round(marketValue(p,c.date)*.06)),salary=Math.max(10000,p.salary*1000)*.7;
  const invalid=validateDeal(c,p,{fee:0,salary,signing:fee});if(invalid)return toast(invalid,'error');
  c.budget-=fee;c.roster.push({...p,onLoan:true,loanUntil:addDays(c.date,180),salary:salary/1000,purchaseOption:marketValue(p,c.date)});
  c.ledger.push({date:c.date,label:'Empréstimo · '+p.name,amount:-fee,type:'expense'});session.market=session.market.filter(item=>item.id!==p.id);closeModal();persist();renderGame(renderMarket());toast('Empréstimo de seis meses concluído.','success');
}

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
    ensureWorldState(session.career);
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
  recordOnboardingAction(action,target);
  if(action==='new-career')slotModal('new');
  else if(action==='load-career')slotModal('load');
  else if(action==='world-database')worldDatabaseModal();
  else if(action==='show-help')showModal('Como jogar','<p>Escolha um clube com elenco completo, monte os onze titulares e administre calendário, finanças e mercado. Resultados elevam sua reputação e liberam seleções nacionais. No campo 2D, os 22 jogadores respeitam a formação escolhida.</p>');
  else if(action==='close-modal')closeModal();
  else if(action==='onboarding-next'){closeModal();showOnboardingStep(session.onboardingStep+1);}
  else if(action==='onboarding-prev'){closeModal();showOnboardingStep(Math.max(0,session.onboardingStep-1));}
  else if(action==='skip-onboarding'){session.career.onboardingComplete=true;persist();closeModal();toast('Guia encerrado. Você pode jogar no seu ritmo.','success');}
  else if(action==='slot-new'){session.slot=Number(target.dataset.slot);session.selectedClub=null;session.clubFilters={continent:'all',country:'all',league:'all',search:''};closeModal();renderClubSelect();}
  else if(action==='slot-load'){session.slot=Number(target.dataset.slot);session.career=migrateCareer(store.slots[session.slot-1]);ensureWorldState(session.career);closeModal();persist();navigate('dashboard');if(!session.career.onboardingComplete)startOnboarding();}
  else if(action==='back-cover')renderCover();
  else if(action==='select-world-club'){session.selectedClub=session.catalog.clubs.find(club=>clubKey(club)===target.dataset.key);renderClubSelect();}
  else if(action==='club-next'&&session.selectedClub)renderManagerSetup();
  else if(action==='manager-back')renderClubSelect();
  else if(action==='select-avatar'){session.selectedAvatar=Number(target.dataset.avatar);renderManagerSetup();}
  else if(action==='start-career')createCareer();
  else if(action==='navigate')navigate(target.dataset.screen);
  else if(action==='competition-tab'){session.competitionTab=target.dataset.tab||'overview';renderGame(renderCompetitions());}
  else if(action==='save')persist(true);
  else if(action==='advance-season')advanceSeason();
  else if(action==='calendar-shift'){const amount=Number(target.dataset.shift)||0,date=new Date(session.calendarDate);if(session.calendarView==='year')date.setFullYear(date.getFullYear()+amount);else if(session.calendarView==='week')date.setDate(date.getDate()+amount*7);else date.setMonth(date.getMonth()+amount);session.calendarDate=date;renderGame(renderCalendar());}
  else if(action==='calendar-today'){session.calendarDate=new Date(session.career.date);renderGame(renderCalendar());}
  else if(action==='calendar-day')openCalendarDay(target.dataset.date);
  else if(action==='open-next-match'){const scheduled=nextScheduledFixture();startMatch(scheduled?.eventOwner||'club');}
  else if(action==='start-match')startMatch('club');
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
  else if(action==='invest-scout'){const result=scoutInvestment(session.career,target.dataset.region);if(result.error)return toast(result.error,'error');session.market=[];persist();renderGame(renderMarket());toast('Rede ampliada: conhecimento regional em '+result.knowledge+'%.','success');}
  else if(action==='make-promise'){const player=session.career.roster.find(item=>item.id===target.dataset.player),promise=makeCareerPromise(session.career,player,'minutes');if(promise){closeModal();persist();toast('Promessa registrada: '+player.name+' espera minutos nos próximos jogos.','success');}}
  else if(action==='loan-player')loanPlayer(target.dataset.player);
  else if(action==='confirm-loan')confirmLoan(target);
  else if(action==='exercise-purchase-option')exercisePurchaseOption(target.dataset.player);
  else if(action==='open-mail')openMail(target.dataset.mail);
  else if(action==='accept-national')acceptNationalJob(target.dataset.team);
  else if(action==='toggle-national-callup')toggleNationalCallup(target.dataset.player);
  else if(action==='national-scout')selectNationalRegion(target.dataset.region);
  else if(action==='national-callup-form')callUpNationalByForm();
  else if(action==='accept-club-job')acceptClubJob(target.dataset.club);
  else if(action==='upgrade-staff'){const id=target.dataset.staff,cost=1500000;if(session.career.budget<cost)return toast('Saldo insuficiente.','error');session.career.budget-=cost;session.career.staff[id]=clamp(session.career.staff[id]+2,1,99);session.career.ledger.push({date:new Date().toISOString(),label:'Investimento na comissão técnica',amount:-cost,type:'expense'});persist();renderGame(renderClub());}
  else if(action==='confirm-facility'){const result=startConstruction(session.career,target.dataset.facility);if(result.error)return toast(result.error,'error');closeModal();persist();renderGame(renderClub());toast('Obra iniciada. Acompanhe a entrega no campus.','success');}
  else if(action==='sale-player')salePlayer(target.dataset.player);
  else if(action==='accept-sale'){const result=acceptSale(session.career,target.dataset.offer);if(result.error)return toast(result.error,'error');repairCareerLineup(session.career);closeModal();persist();navigate('squad');toast('Venda concluída e receita recebida.','success');}
  else if(action==='renew-player')renewPlayer(target.dataset.player);
  else if(action==='confirm-renewal')confirmRenewal(target.dataset.player);
  else if(action==='upgrade-facility')upgradeFacility(target.dataset.facility);
  else if(action==='accept-sponsor')acceptSponsor(target.dataset.sponsor);
  else if(action==='export-save')exportSave();
  else if(action==='restore-backup')restoreBackup();
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
  recordOnboardingAction(action,target);
  if(action==='import-save'){importSaveFile(target.files?.[0]);target.value='';}
  else if(action==='filter-continent'){session.clubFilters.continent=target.value;session.clubFilters.country='all';session.clubFilters.league='all';renderClubSelect();}
  else if(action==='filter-country'){session.clubFilters.country=target.value;session.clubFilters.league='all';renderClubSelect();}
  else if(action==='filter-league'){session.clubFilters.league=target.value;renderClubSelect();}
  else if(action==='national-filter'){session.nationalFilter=target.value;renderGame(renderNational());}
  else if(action==='calendar-view'){session.calendarView=target.value;renderGame(renderCalendar());}
  else if(action==='calendar-filter'){session.calendarFilter=target.value;renderGame(renderCalendar());}
  else if(action==='competition-select'){session.competitionId=target.value;session.competitionTab='overview';renderGame(renderCompetitions());}
  else if(action==='market-position'){session.marketPosition=target.value;renderGame(renderMarket());}
  else if(action==='market-budget'){session.marketBudget=target.value;renderGame(renderMarket());}
  else if(action==='market-region'){session.marketRegion=target.value;renderGame(renderMarket());}
  else if(action==='position-filter'){session.positionFilter=target.value;renderGame(renderSquad());}
  else if(action==='formation-select'){session.career.tactics.formation=target.value;session.career.tacticalPositions=(FORMATIONS[target.value]||FORMATIONS['4-3-3']).map(point=>[...point]);persist();renderGame(renderTactics());}
  else if(action==='mentality-select'){session.career.tactics.mentality=target.value;persist();renderGame(renderTactics());}
  else if(action==='passing-select'){session.career.tactics.passing=target.value;persist();renderGame(renderTactics());}
  else if(action==='marking-select'){session.career.tactics.marking=target.value;persist();renderGame(renderTactics());}
  else if(action==='transition-select'){session.career.tactics.transition=target.value;persist();renderGame(renderTactics());}
  else if(action==='tactical-role'){ensureTacticalRoles(session.career);session.career.tacticalRoles[target.dataset.player]=target.value;persist();renderGame(renderTactics());}
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
window.addEventListener('error',event=>recordTelemetry('error',event.message||'erro sem mensagem'));
window.addEventListener('unhandledrejection',event=>recordTelemetry('error',event.reason?.message||String(event.reason||'promessa rejeitada')));
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
