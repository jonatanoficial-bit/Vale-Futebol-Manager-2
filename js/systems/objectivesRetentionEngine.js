import { OBJECTIVES_RETENTION_VERSION, OBJECTIVES_RETENTION_STATUS_V650, DAILY_OBJECTIVES_V650, SEASON_OBJECTIVES_V650, ACHIEVEMENTS_V650, RETENTION_LOOPS_V650, REWARD_TIERS_V650, RETENTION_MOBILE_RULES_V650 } from '../data/objectivesRetentionData.js';
import { teams } from '../data/gameData.js';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Math.round(Number(n) || 0))); }
function safe(v,fallback=''){ return String(v ?? fallback).replace(/[<>]/g,''); }
function teamById(id){ return teams.find(t=>t.id===id) || teams.find(t=>t.id==='santos') || teams[0]; }
function pct(n){ return `${clamp(n)}%`; }
function scoreTier(score){ return REWARD_TIERS_V650.find(t=>score >= t.min && score <= t.max) || REWARD_TIERS_V650[0]; }

export function buildObjectivesRetentionSnapshot(state={}){
  const club = teamById(state.clubId || state.ui?.selectedClub || 'santos');
  const boardTrust = clamp(state.boardTrust || 76);
  const fanMood = clamp(state.fanMood || 82);
  const managerRep = clamp(state.manager?.reputation || 50);
  const doneMissions = (state.career?.missions || []).filter(m=>m.done).length;
  const totalMissions = Math.max(8, (state.career?.missions || []).length || 8);
  const dailyProgress = clamp((DAILY_OBJECTIVES_V650.reduce((sum,o)=>sum + o.progress,0) / DAILY_OBJECTIVES_V650.length));
  const retentionScore = clamp((dailyProgress * 0.42) + (boardTrust * 0.18) + (fanMood * 0.18) + (managerRep * 0.16) + (doneMissions / totalMissions) * 60, 0, 100);
  const points = Math.round((doneMissions * 70) + dailyProgress * 4 + managerRep * 3);
  const tier = scoreTier(points);
  return {
    version: OBJECTIVES_RETENTION_VERSION,
    status: OBJECTIVES_RETENTION_STATUS_V650.status,
    route: 'objectivesHub',
    tutorialRoute: 'careerTutorial',
    progressionRoute: 'managerProgression',
    liveWorldRoute: 'liveWorld',
    squadAiRoute: 'squadAI',
    matchdayRoute: 'matchdayPremium',
    mobileFirst: true,
    offlineReady: true,
    noBlockingPopup: true,
    noHeavyTimer: true,
    preservesOldRoutes: true,
    objectiveCount: DAILY_OBJECTIVES_V650.length + SEASON_OBJECTIVES_V650.length,
    achievementCount: ACHIEVEMENTS_V650.length,
    loopCount: RETENTION_LOOPS_V650.length,
    tierCount: REWARD_TIERS_V650.length,
    mobileRuleCount: RETENTION_MOBILE_RULES_V650.length,
    context: {
      club: club.name,
      league: club.league || 'Liga nacional',
      boardTrust,
      fanMood,
      managerRep,
      doneMissions,
      totalMissions,
      dailyProgress,
      retentionScore,
      points,
      tier: tier.tier,
      tierLabel: tier.label,
      nextAction: retentionScore < 55 ? 'Completar rotina diária' : dailyProgress < 80 ? 'Fechar objetivos do dia' : 'Buscar conquista de temporada'
    }
  };
}

export function renderObjectivesRetentionRibbon(state={}, snapOverride=null){
  const snap = snapOverride || buildObjectivesRetentionSnapshot(state);
  const c = snap.context;
  return `<section class="objectives-ribbon-v650 panel" aria-label="Objetivos e retenção">
    <div class="objectives-orb-v650"></div>
    <div class="objectives-ribbon-copy-v650"><span class="tag">${OBJECTIVES_RETENTION_VERSION} · objetivos vivos</span><h2>${safe(c.nextAction)}</h2><p>${safe(c.club)} · ${safe(c.league)} · ${safe(c.tierLabel)}</p></div>
    <div class="objectives-ribbon-kpis-v650"><div><span>Dia</span><strong>${pct(c.dailyProgress)}</strong></div><div><span>Retenção</span><strong>${pct(c.retentionScore)}</strong></div><div><span>Pontos</span><strong>${c.points}</strong></div></div>
    <div class="objectives-ribbon-actions-v650"><button class="main-btn mini" data-route="objectivesHub">Ver metas</button><button class="secondary-btn mini" data-route="careerTutorial">Missões</button></div>
  </section>`;
}

export function renderObjectivesRetentionCenter(state={}){
  const snap = buildObjectivesRetentionSnapshot(state);
  const c = snap.context;
  const daily = DAILY_OBJECTIVES_V650.map(o=>`<article class="card objective-card-v650"><div class="row space"><span class="objective-icon-v650">${o.icon}</span><strong>${o.xp} XP</strong></div><h3>${o.title}</h3><p>${o.note}</p><div class="meter"><span style="width:${clamp(o.progress)}%"></span></div><div class="row space"><small>${o.reward}</small><button class="secondary-btn mini" data-route="${o.route}">abrir</button></div></article>`).join('');
  const season = SEASON_OBJECTIVES_V650.map(o=>`<div class="fixture-row season-objective-v650"><div class="fixture-date"><strong>${o.tier}</strong><small>meta</small></div><div class="fixture-main"><strong>${o.title}</strong><span>${o.reward}</span><small>Risco: ${o.risk}</small></div><button class="secondary-btn mini" data-route="${o.route}">ver</button></div>`).join('');
  const achievements = ACHIEVEMENTS_V650.map(a=>`<article class="panel achievement-card-v650"><div class="row space"><span class="achievement-icon-v650">${a.icon}</span><span class="tag">${a.rarity}</span></div><h3>${a.title}</h3><p class="small">${a.condition}</p><strong>${a.points} pts</strong></article>`).join('');
  const loops = RETENTION_LOOPS_V650.map((l,i)=>`<article class="card retention-loop-v650"><span class="tag">loop ${i+1}</span><h3>${l.title}</h3><p>${l.goal}</p><small>${l.feedback}</small></article>`).join('');
  const tiers = REWARD_TIERS_V650.map(t=>`<div class="tier-row-v650 ${t.tier===c.tier?'active-tier-v650':''}"><strong>${t.tier}</strong><span>${t.min}-${t.max} pts · ${t.label}</span><small>${t.benefit}</small></div>`).join('');
  const rules = RETENTION_MOBILE_RULES_V650.map(rule=>`<li>${rule}</li>`).join('');
  const report = JSON.stringify(snap, null, 2);
  return `<section class="objectives-center-v650 stack">
    <div class="panel championship-hero objectives-hero-v650"><div><span class="tag">${OBJECTIVES_RETENTION_VERSION} · ${OBJECTIVES_RETENTION_STATUS_V650.status}</span><h1>Objetivos, Conquistas e Retenção</h1><p class="small">Esta fase transforma a carreira em ciclo diário: sempre existe uma meta clara, uma recompensa visível e um próximo passo para o jogador continuar.</p></div><div class="release-score"><strong>${pct(c.retentionScore)}</strong><small>${safe(c.tier)}</small></div></div>
    ${renderObjectivesRetentionRibbon(state, snap)}
    <section class="panel"><div class="row space"><div><span class="tag">Rotina diária</span><h2>Missões rápidas de hoje</h2></div><button class="main-btn mini" data-route="matchdayPremium">Jogar dia</button></div><div class="objectives-grid-v650">${daily}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Temporada</span><h2>Metas grandes</h2></div><button class="secondary-btn mini" data-route="seasonCenter">Temporada</button></div><div class="fixture-list">${season}</div></article><article class="panel"><div class="row space"><div><span class="tag">Nível de retenção</span><h2>Recompensas</h2></div><strong>${c.points} pts</strong></div><div class="tier-list-v650">${tiers}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Conquistas</span><h2>Troféus internos</h2></div><button class="secondary-btn mini" data-route="managerProgression">XP técnico</button></div><div class="achievements-grid-v650">${achievements}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Loop comercial</span><h2>Por que o jogador volta</h2></div><span class="status-pill">mobile-first</span></div><div class="retention-loop-grid-v650">${loops}</div></article><article class="panel"><div class="row space"><div><span class="tag">Anti-quebra</span><h2>Regras mobile</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Auditoria</button></div><ul class="small-list objectives-rules-v650">${rules}</ul></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Snapshot técnico</span><h2>Validação da fase</h2></div><span class="status-pill">${snap.status}</span></div><textarea class="code-box" readonly>${report}</textarea></section>
  </section>`;
}
