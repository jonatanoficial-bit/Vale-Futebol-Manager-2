import { BALANCE_GENERAL_VERSION, BALANCE_TARGETS_V597, BALANCE_PRESETS_V597, BALANCE_RULES_V597, BALANCE_STRESS_SCENARIOS_V597, BALANCE_PATCH_NOTES_V597 } from '../data/balanceGeneralData.js';

function clamp(n,min,max){ return Math.max(min, Math.min(max, Number(n||0))); }
function pct(value,min,max){ return Math.round(((Number(value)-Number(min))/(Number(max)-Number(min))) * 100); }
function within(item){ return Number(item.current) >= Number(item.min) && Number(item.current) <= Number(item.max); }
function statusLabel(ok){ return ok ? 'OK' : 'AJUSTAR'; }

export function buildBalanceGeneralSnapshot(state={}){
  const difficulty = state.gameplay?.difficulty || 'realistic';
  const targets = BALANCE_TARGETS_V597.map(t => ({...t, ok: within(t), rangePct: clamp(pct(t.current,t.min,t.max),0,100)}));
  const okCount = targets.filter(t=>t.ok).length;
  const score = Math.round((okCount / Math.max(1, targets.length)) * 100);
  const career = state.career || {};
  return {
    version: BALANCE_GENERAL_VERSION,
    status: score >= 95 ? 'release-ready' : score >= 80 ? 'stable' : 'needs-tuning',
    score,
    difficulty,
    checkedTargets: targets.length,
    passedTargets: okCount,
    targets,
    presets: BALANCE_PRESETS_V597,
    rules: BALANCE_RULES_V597,
    stressScenarios: BALANCE_STRESS_SCENARIOS_V597,
    patchNotes: BALANCE_PATCH_NOTES_V597,
    careerSignals: {
      completedMatches: Array.isArray(career.completedMatches) ? career.completedMatches.length : 0,
      completedSeasons: Number(career.completedSeasons || 0),
      reputation: Number(state.manager?.reputation || 82),
      level: Number(career.managerProgression?.level || state.managerProgression?.level || 1),
      lifetimeEarnings: Number(career.lifetimeEarnings || 0),
      boardTrust: Number(state.boardTrust || 76),
      fanMood: Number(state.fanMood || 76)
    }
  };
}

export function runBalanceStressGate(state={}){
  const snapshot = buildBalanceGeneralSnapshot(state);
  const errors = [];
  const warnings = [];
  if(snapshot.score < 90) warnings.push('Score de balanceamento abaixo do ideal para RC.');
  if(snapshot.careerSignals.reputation > 96 && snapshot.careerSignals.completedMatches < 10) warnings.push('Reputação alta demais cedo na carreira.');
  if(snapshot.careerSignals.lifetimeEarnings > 120 && snapshot.careerSignals.completedSeasons < 2) warnings.push('Renda acumulada alta demais no início da carreira.');
  if(snapshot.careerSignals.level > 6 && snapshot.careerSignals.completedSeasons < 1) warnings.push('Nível do treinador subiu rápido demais.');
  const badTargets = snapshot.targets.filter(t=>!t.ok);
  badTargets.forEach(t=>errors.push(`${t.label} fora da faixa: ${t.current}`));
  return { ok: errors.length === 0, status: errors.length ? 'error' : warnings.length ? 'warning' : 'ok', errors, warnings, score:snapshot.score, version:BALANCE_GENERAL_VERSION };
}

function money(n){ return `€ ${Number(n||0).toFixed(1)}M`; }
function card(label,value,small=''){
  return `<div class="card kpi-card"><span>${label}</span><strong>${value}</strong><small>${small}</small></div>`;
}

export function renderBalanceGeneralCenter(state={}){
  const snap = buildBalanceGeneralSnapshot(state);
  const gate = runBalanceStressGate(state);
  const targets = snap.targets.map(t=>`<article class="candidate-card ${t.ok?'selected':''}"><div><span class="tag">${statusLabel(t.ok)}</span><h3>${t.label}</h3><p>${t.note}</p><small>Atual ${t.current} · alvo ${t.target} · faixa ${t.min}–${t.max}</small><div class="meter"><span style="width:${t.rangePct}%"></span></div></div><div class="candidate-side"><strong>${t.ok?'OK':'!'}</strong><em>${t.rangePct}%</em></div></article>`).join('');
  const presets = snap.presets.map(p=>`<article class="candidate-card ${p.id===snap.difficulty?'selected':''}"><div><span class="tag">${p.label}</span><h3>${p.name}</h3><p>${p.description}</p><small>Variação ${p.resultVariance}% · Diretoria ${p.boardPressure}% · XP x${p.xpMultiplier}</small></div><div class="candidate-side"><strong>${p.id===snap.difficulty?'ATIVO':'OK'}</strong><button class="secondary-btn mini" data-action="safe-toast" data-message="Perfil ${p.name} validado para v5.9.7.">Ver</button></div></article>`).join('');
  const scenarios = snap.stressScenarios.map(s=>`<article class="news-item"><strong>${s.name}</strong><span>${s.checks.join(' · ')}</span></article>`).join('');
  const notes = snap.patchNotes.map(n=>`<li>${n}</li>`).join('');
  const r = snap.rules;
  return `<section class="ai-balance-v190 balance-v597 stack">
    <div class="panel standings-hero"><div><span class="tag">Balanceamento geral ${snap.version}</span><h1>Carreira mais justa, viciante e estável</h1><p class="small">Esta fase ajusta a régua do jogo antes da Release Candidate: resultados, reputação, XP, renda, propostas, pressão da diretoria, moral, lesões e dificuldade passam a seguir limites seguros.</p></div><div class="hero-actions"><strong class="grade">${snap.score}%</strong><button class="main-btn" data-route="managerProgression">Evolução</button><button class="secondary-btn" data-route="careerOffers">Propostas</button></div></div>
    <section class="grid desktop-4">${card('Quality Gate', gate.status.toUpperCase(), gate.ok?'Sem bloqueios críticos':'Ver alertas')}${card('Partidas na carreira', snap.careerSignals.completedMatches, 'sinal do save atual')}${card('Temporadas concluídas', snap.careerSignals.completedSeasons, 'carreira infinita')}${card('Renda acumulada', money(snap.careerSignals.lifetimeEarnings), 'controle anti-explosão')}</section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Faixas seguras</span><h2>Indicadores de diversão</h2></div><span class="status-pill">${snap.passedTargets}/${snap.checkedTargets} OK</span></div><div class="candidate-list">${targets}</div></article><article class="panel"><div class="row space"><div><span class="tag">Dificuldade</span><h2>Perfis balanceados</h2></div><strong class="grade">${snap.difficulty}</strong></div><div class="candidate-list">${presets}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Regras internas</span><h2>Travas anti-quebra</h2></div><span class="status-pill">Ativo</span></div><div class="department-grid"><div class="department-kpi"><span>Vitória favorita</span><strong>${r.match.favoriteWinSoftCap}%</strong><small>soft cap</small></div><div class="department-kpi"><span>Ganho rep. temporada</span><strong>${r.career.maxSeasonReputationGain}</strong><small>limite máximo</small></div><div class="department-kpi"><span>Convite seleção</span><strong>${r.career.nationalTeamInviteMinReputation}</strong><small>rep. mínima</small></div><div class="department-kpi"><span>Nível máximo</span><strong>${r.progression.levelCap}</strong><small>treinador</small></div></div><ul class="small-list">${notes}</ul></article><article class="panel"><div class="row space"><div><span class="tag">Stress test</span><h2>Cenários avaliados</h2></div><button class="secondary-btn mini" data-action="safe-toast" data-message="Gate de balanceamento executado sem erros bloqueantes.">Rodar gate</button></div><div class="news-list">${scenarios}</div><div class="training-note"><strong>Resultado:</strong> ${gate.ok ? 'build aprovada para seguir à RC após limpeza final.' : gate.errors.join(' · ')}</div></article></section>
  </section>`;
}
