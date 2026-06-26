import { teams } from '../data/gameData.js';
import { safeImg, clubLogo, bg } from './assets.js';
import { esc } from '../utils/dom.js';
import { INTRO_CINEMATIC_VERSION, INTRO_PUBLIC_STATUS_V610, INTRO_STORY_ACTS_V610, INTRO_SESSION_FLOW_V610, INTRO_RETENTION_HOOKS_V610, INTRO_MOBILE_RULES_V610 } from '../data/introCinematicData.js';

function activeTeam(state={}){
  return teams.find(t=>t.id === (state.clubId || state.ui?.selectedClub)) || teams[0];
}

function avg(list=[], key='impact'){
  if(!list.length) return 0;
  return Math.round(list.reduce((sum,item)=>sum + Number(item[key] || 0),0) / list.length);
}

export function buildIntroCinematicSnapshot(state={}){
  const club = activeTeam(state);
  const manager = state.manager || {};
  const acts = INTRO_STORY_ACTS_V610.map((act,index)=>({
    ...act,
    order: index + 1,
    unlocked: index < 2 || !!state.clubId,
    current: act.route === (state.route || 'cover')
  }));
  const routeCoverage = new Set([...acts.map(a=>a.route), ...INTRO_SESSION_FLOW_V610.map(s=>s.route)]);
  const score = Math.min(100, Math.round((avg(INTRO_RETENTION_HOOKS_V610) * 0.65) + (INTRO_MOBILE_RULES_V610.length >= 6 ? 35 : 25)));
  return {
    version: INTRO_CINEMATIC_VERSION,
    status: score >= INTRO_PUBLIC_STATUS_V610.readinessTarget ? 'cinematic-ready' : 'needs-polish',
    score,
    phase: INTRO_PUBLIC_STATUS_V610.phase,
    managerName: manager.name || 'Novo Manager',
    managerAvatar: manager.avatar || 'assets/avatars/manager-v801-01.png',
    clubId: club.id,
    clubName: club.name,
    clubLeague: club.league,
    boardPressure: club.board || 'Construir uma carreira competitiva.',
    difficulty: club.difficulty || 'Normal',
    acts,
    flow: INTRO_SESSION_FLOW_V610,
    hooks: INTRO_RETENTION_HOOKS_V610,
    mobileRules: INTRO_MOBILE_RULES_V610,
    routeCoverage: [...routeCoverage],
    skipRoutes: ['newGame','lobby','match'],
    heroBackground: bg('cover')
  };
}

function kpi(label,value,note=''){
  return `<div class="department-kpi cinematic-kpi-v610"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
}

export function renderIntroCinematicCenter(state={}){
  const snap = buildIntroCinematicSnapshot(state);
  const acts = snap.acts.map(act=>`<article class="panel intro-act-card-v610 ${act.current ? 'current' : ''}">
    <div class="intro-act-head-v610"><span class="intro-act-icon-v610">${act.icon}</span><div><span class="tag">Ato ${act.order} · ${act.tone} · ${act.duration}</span><h2>${act.title}</h2></div></div>
    <p>${act.subtitle}</p>
    <div class="training-note"><strong>Promessa:</strong> ${act.playerPromise}</div>
    <small>${act.mobileCue}</small>
    <button class="secondary-btn" data-route="${act.route}">Abrir etapa</button>
  </article>`).join('');
  const flow = snap.flow.map(item=>`<li><button class="intro-flow-button-v610" data-route="${item.route}"><strong>${item.step}. ${item.action}</strong><span>${item.expected}</span></button></li>`).join('');
  const hooks = snap.hooks.map(item=>`<div class="news-item"><strong>${item.label}</strong><span>${item.note}</span><em>${item.impact}% retenção</em></div>`).join('');
  const rules = snap.mobileRules.map(rule=>`<li>${rule}</li>`).join('');
  return `<section class="intro-cinematic-v610 stack">
    <div class="panel intro-hero-v610" style="--intro-bg:url('${snap.heroBackground}')">
      <div class="intro-hero-copy-v610"><span class="tag">${snap.phase} · ${INTRO_PUBLIC_STATUS_V610.label} · ${snap.version}</span><h1>Primeira jornada com cara de jogo comercial</h1><p>${INTRO_PUBLIC_STATUS_V610.goal}</p><p class="small">${INTRO_PUBLIC_STATUS_V610.promise}</p><div class="menu-actions"><button class="main-btn giant" data-route="newGame">Começar carreira</button><button class="secondary-btn" data-route="lobby">Pular para lobby</button><button class="secondary-btn" data-route="match">Teste rápido da partida</button></div></div>
      <div class="intro-manager-contract-v610">${safeImg(snap.managerAvatar,'avatar','Manager','manager-pic')}<div><span class="small">Contrato inicial</span><strong>${esc(snap.managerName)}</strong><p>${safeImg(clubLogo(snap.clubId),'club',snap.clubName,'inline-club')} ${snap.clubName} · ${snap.clubLeague}</p></div></div>
    </div>
    <section class="grid desktop-4">${kpi('Status', snap.status, 'gate narrativo')}${kpi('Pontuação', `${snap.score}%`, 'retenção inicial')}${kpi('Atos', snap.acts.length, 'cenas leves')}${kpi('Rotas', snap.routeCoverage.length, 'fluxo coberto')}</section>
    <section class="panel"><div class="row space"><div><span class="tag">Abertura guiada</span><h2>Arco emocional do primeiro save</h2></div><button class="secondary-btn mini" data-route="releaseCandidate">Ver Beta Pública</button></div><div class="intro-act-grid-v610">${acts}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Roteiro de 20 minutos</span><h2>Do menu ao primeiro pós-jogo</h2></div><span class="status-pill">Mobile-first</span></div><ol class="intro-flow-v610">${flow}</ol></article><article class="panel"><div class="row space"><div><span class="tag">Retenção</span><h2>Ganchos comerciais</h2></div><strong class="grade">${snap.score}%</strong></div><div class="news-list compact">${hooks}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Anti-quebra mobile</span><h2>Regras da jornada cinematográfica</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria Mobile</button></div><ul class="small-list intro-rules-v610">${rules}</ul><p class="alert"><strong>Decisão:</strong> a Beta v6.0.0 agora ganha uma entrada mais emocional. Próxima fase pode aprofundar lobby vivo, jornal esportivo e mensagens de bastidor.</p></section>
  </section>`;
}
