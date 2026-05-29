export const NAVIGATION_EXPERIENCE_VERSION = 'v5.6.0';

export const NAVIGATION_ROUTES_V560 = [
  { route:'lobby', label:'Home', icon:'🏠', hint:'Central' },
  { route:'squad', label:'Elenco', icon:'👥', hint:'Jogadores' },
  { route:'formation', label:'Tática', icon:'🧩', hint:'Plano' },
  { route:'match', label:'Jogar', icon:'⚽', hint:'Partida', primary:true },
  { route:'managerMenu', label:'Menu', icon:'☰', hint:'Mais' }
];

export const ROUTE_SECTION_MAP_V560 = {
  lobby:'home', managerMenu:'menu', match:'play', squad:'squad', formation:'tactics',
  championship:'menu', seasonCenter:'menu', standings:'menu', calendar:'menu', copaDoBrasil:'menu',
  transfers:'menu', smartMarket:'menu', contracts:'menu', financeCenter:'menu', finances:'menu', sponsorship:'menu',
  training:'tactics', instructions:'tactics', academyScouting:'squad', staff:'menu', club:'menu',
  messages:'menu', careerOffers:'menu', nationalTeam:'menu', worldCompetitions:'menu', worldComplete:'menu',
  saveCenter:'menu', polishCenter:'menu', mobileAudit:'menu', data2026:'menu', database2026:'menu',
  visualLibrary:'menu', settings:'menu', aiBalance:'menu', assetChecklist:'menu', rosterUpdate:'menu'
};

export function applyNavigationExperienceShell(){
  const root = document.documentElement;
  root.classList.add('vfm-nav-v560');
  root.style.setProperty('--vfm-nav-count', String(NAVIGATION_ROUTES_V560.length));
}

export function getNavigationRouteForActive(route='lobby'){
  if(NAVIGATION_ROUTES_V560.some(item => item.route === route)) return route;
  const section = ROUTE_SECTION_MAP_V560[route] || 'menu';
  if(section === 'play') return 'match';
  if(section === 'squad') return 'squad';
  if(section === 'tactics') return 'formation';
  if(section === 'home') return 'lobby';
  return 'managerMenu';
}

export function buildNavigationSnapshot(currentRoute='lobby'){
  return {
    version: NAVIGATION_EXPERIENCE_VERSION,
    items: NAVIGATION_ROUTES_V560.length,
    primaryRoute: 'match',
    mobilePattern: 'bottom-nav-5-actions',
    desktopPattern: 'compact-premium-bottom-nav',
    activeRoute: getNavigationRouteForActive(currentRoute),
    hiddenDuringOnboarding: true,
    routes: NAVIGATION_ROUTES_V560.map(item => item.route),
    touchTargets: '>=50px'
  };
}
