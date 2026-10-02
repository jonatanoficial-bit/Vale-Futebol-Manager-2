export const MANAGER_CAREER_VERSION = '1.0.0';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

function stableNumber(value = '') {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function managerSalary(club) {
  return Math.round(Math.max(45000, (Number(club?.rating) || 60) ** 2 * 28) / 1000) * 1000;
}

export function ensureManagerCareer(career) {
  const club = career?.club || {};
  const current = career.managerCareer || {};
  const status = current.status === 'unemployed' ? 'unemployed' : 'employed';
  career.managerCareer = {
    version: MANAGER_CAREER_VERSION,
    status,
    clubId: status === 'employed' ? (current.clubId || club.id || '') : null,
    clubName: status === 'employed' ? (current.clubName || club.name || '') : null,
    signedAt: current.signedAt || career.createdAt || career.date,
    contractEndSeason: Math.max(Number(career.season) || 2026, Number(current.contractEndSeason) || (Number(career.season) || 2026) + 2),
    salary: Math.max(0, Number(current.salary) || managerSalary(club)),
    warningLevel: clamp(current.warningLevel, 0, 3),
    nextOfferWeek: Math.max(1, Number(current.nextOfferWeek) || 6),
    results: Array.isArray(current.results) ? current.results.slice(-10) : [],
    history: Array.isArray(current.history) ? current.history.slice(-40) : [],
    nationalOffers: Array.isArray(current.nationalOffers) ? current.nationalOffers.slice(0, 5) : [],
    dismissedAt: current.dismissedAt || null,
    previousClub: current.previousClub || null
  };
  if (!career.managerCareer.history.length && club.name) {
    career.managerCareer.history.push({ type:'appointed', date:career.date, season:career.season, clubName:club.name, label:'Assumiu o comando do '+club.name });
  }
  return career.managerCareer;
}

export function careerSecurity(board) {
  const confidence = clamp(board, 0, 100);
  if (confidence <= 12) return { id:'critical', label:'Risco imediato', detail:'A diretoria pode encerrar o contrato após o próximo resultado ruim.' };
  if (confidence <= 28) return { id:'pressure', label:'Sob pressão', detail:'Resultados e controle financeiro precisam melhorar agora.' };
  if (confidence <= 48) return { id:'watch', label:'Em avaliação', detail:'A direção acompanha a evolução rodada a rodada.' };
  if (confidence <= 72) return { id:'stable', label:'Estável', detail:'O trabalho tem respaldo, mas os objetivos seguem valendo.' };
  return { id:'strong', label:'Prestigiado', detail:'A direção considera o projeto acima das expectativas.' };
}

export function reviewManagerMatch(career, context = {}) {
  const managerCareer = ensureManagerCareer(career);
  if (managerCareer.status !== 'employed') return { delta:0, dismissed:false, warning:null, security:careerSecurity(career.board) };

  const result = ['win','draw','loss'].includes(context.result) ? context.result : 'draw';
  const ownRating = Number(career.club?.rating) || 65;
  const opponentRating = Number(context.opponentRating) || ownRating;
  const goalDiff = Number(context.goalDiff) || 0;
  let delta = result === 'win' ? 3 : result === 'draw' ? 0 : -3;
  if (result === 'win' && opponentRating >= ownRating + 5) delta += 2;
  if (result === 'draw' && opponentRating >= ownRating + 7) delta += 1;
  if (result === 'loss' && opponentRating <= ownRating - 6) delta -= 2;
  if (result === 'loss' && goalDiff <= -3) delta -= 2;
  if (context.knockedOut) delta -= context.competitionType === 'continental' ? 5 : 3;
  if (Number(career.budget) < 0) delta -= 1;

  managerCareer.results.push(result);
  managerCareer.results = managerCareer.results.slice(-10);
  const recent = managerCareer.results.slice(-5);
  const recentLosses = recent.filter(item => item === 'loss').length;
  const recentWins = recent.filter(item => item === 'win').length;
  if (recent.length >= 4 && recentLosses >= 4) delta -= 2;
  if (recent.length >= 4 && recentWins >= 4) delta += 2;

  const before = clamp(career.board, 0, 100);
  career.board = clamp(before + delta, 0, 100);
  const security = careerSecurity(career.board);
  const severity = { strong:0, stable:0, watch:1, pressure:2, critical:3 }[security.id];
  let warning = null;
  if (severity > managerCareer.warningLevel) {
    managerCareer.warningLevel = severity;
    warning = security.id;
    managerCareer.history.push({ type:'warning', date:career.date, season:career.season, clubName:career.club?.name, label:security.label+' na diretoria' });
  } else if (severity === 0 && managerCareer.warningLevel > 0) {
    managerCareer.warningLevel = 0;
  }

  const played = Number(career.stats?.played) || 0;
  const dismissed = played >= 8 && (career.board <= 8 || (career.board <= 12 && recent.length >= 5 && recentLosses >= 4));
  if (dismissed) {
    const previousClub = { id:career.club?.id, name:career.club?.name, badge:career.club?.badge, leagueName:career.club?.leagueName, rating:career.club?.rating };
    managerCareer.status = 'unemployed';
    managerCareer.previousClub = previousClub;
    managerCareer.clubId = null;
    managerCareer.clubName = null;
    managerCareer.dismissedAt = career.date;
    managerCareer.history.push({ type:'dismissed', date:career.date, season:career.season, clubName:previousClub.name, label:'Contrato encerrado pelo '+previousClub.name });
  }
  managerCareer.history = managerCareer.history.slice(-40);
  return { delta:career.board-before, dismissed, warning, security };
}

export function createClubJobOffers(career, clubs, limit = 3) {
  const managerCareer = ensureManagerCareer(career);
  const reputation = clamp(career.manager?.reputation, 1, 100);
  const currentRating = Number(career.club?.rating) || reputation;
  const unemployed = managerCareer.status === 'unemployed';
  const ceiling = Math.max(58, Math.round(reputation * 1.08) + (unemployed ? 4 : 0));
  const target = unemployed ? Math.min(ceiling, Math.max(55, reputation)) : Math.min(ceiling, Math.max(currentRating, reputation));
  const seed = [career.manager?.name, career.season, career.week, managerCareer.history.length].join(':');
  let candidates = (clubs || []).filter(club => club?.rosterPath && club.id !== career.club?.id && Number(club.rating) <= ceiling);
  if (!candidates.length) candidates = (clubs || []).filter(club => club?.rosterPath && club.id !== career.club?.id);
  return candidates
    .map(club => ({ club, score:Math.abs(Number(club.rating)-target) * 1000 + stableNumber(seed+':'+club.id) % 997 }))
    .sort((a,b) => a.score-b.score)
    .slice(0, Math.max(1, limit))
    .map(({club}, index) => ({
      ...club,
      careerOffer:{
        salary:managerSalary(club),
        years:index === 0 ? 3 : 2,
        confidence:unemployed ? 62 : 68,
        objective:Number(club.rating) >= 80 ? 'Disputar títulos e chegar às fases finais' : Number(club.rating) >= 70 ? 'Classificar para competição continental' : 'Construir uma campanha competitiva',
        offeredAt:career.date,
        expiresWeek:(Number(career.week) || 1) + 5
      }
    }));
}

export function createNationalJobOffers(career, nationalTeams, limit = 3) {
  const managerCareer = ensureManagerCareer(career);
  const reputation = clamp(career.manager?.reputation, 1, 100);
  const currentId = career.national?.team?.id;
  const seed = [career.manager?.name, career.season, career.week, 'national'].join(':');
  managerCareer.nationalOffers = (nationalTeams || [])
    .filter(team => team?.rosterPath && team.id !== currentId && Number(team.reputationRequired || 99) <= reputation)
    .map(team => ({ team, score:Math.abs(Number(team.rating)-reputation) * 1000 + stableNumber(seed+':'+team.id) % 997 }))
    .sort((a,b) => a.score-b.score)
    .slice(0, Math.max(1, limit))
    .map(({team}) => team.id);
  return managerCareer.nationalOffers;
}

export function careerOfferDue(career) {
  const managerCareer = ensureManagerCareer(career);
  return managerCareer.status === 'unemployed' || Number(career.week || 1) >= managerCareer.nextOfferWeek;
}

export function closeCareerOfferCycle(career, delay = 6) {
  const managerCareer = ensureManagerCareer(career);
  managerCareer.nextOfferWeek = Number(career.week || 1) + Math.max(3, Number(delay) || 6);
}

export function recordClubAppointment(career, club) {
  const managerCareer = ensureManagerCareer(career);
  managerCareer.status = 'employed';
  managerCareer.clubId = club.id;
  managerCareer.clubName = club.name;
  managerCareer.signedAt = career.date;
  managerCareer.contractEndSeason = Number(career.season || 2026) + 2;
  managerCareer.salary = managerSalary(club);
  managerCareer.warningLevel = 0;
  managerCareer.dismissedAt = null;
  managerCareer.results = [];
  managerCareer.nextOfferWeek = Number(career.week || 1) + 8;
  managerCareer.history.push({ type:'appointed', date:career.date, season:career.season, clubName:club.name, label:'Assumiu o comando do '+club.name });
  managerCareer.history = managerCareer.history.slice(-40);
  return managerCareer;
}

export function recordNationalAppointment(career, team) {
  const managerCareer = ensureManagerCareer(career);
  managerCareer.nationalOffers = managerCareer.nationalOffers.filter(id => id !== team.id);
  managerCareer.history.push({ type:'national', date:career.date, season:career.season, clubName:team.name, label:'Assumiu a seleção '+team.name });
  managerCareer.history = managerCareer.history.slice(-40);
  return managerCareer;
}
