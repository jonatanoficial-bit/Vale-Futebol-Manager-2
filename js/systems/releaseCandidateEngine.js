import { RELEASE_CANDIDATE_VERSION, RC_PUBLIC_STATUS_V600, RC_CHECKPOINTS_V600, RC_DEVICE_MATRIX_V600, RC_ROUTE_GATES_V600, RC_MANUAL_TEST_FLOW_V600, RC_KNOWN_LIMITS_V600 } from '../data/releaseCandidateData.js';

function clamp(n,min,max){ return Math.max(min, Math.min(max, Number(n||0))); }
function avg(items){ return Math.round(items.reduce((sum,item)=>sum + Number(item.score||0),0) / Math.max(1, items.length)); }
function statusFor(score){ return score >= 94 ? 'beta-publica-aprovada' : score >= 88 ? 'aprovada-com-observacoes' : 'reter-build'; }
function badgeFor(score){ return score >= 94 ? 'APROVADO' : score >= 88 ? 'OBSERVAR' : 'RETER'; }
function card(label,value,small=''){
 return `<div class="card kpi-card"><span>${label}</span><strong>${value}</strong><small>${small}</small></div>`;
}

export function buildReleaseCandidateSnapshot(state={}){
 const completedMatches = Array.isArray(state.career?.completedMatches) ? state.career.completedMatches.length : 0;
 const completedSeasons = Number(state.career?.completedSeasons || 0);
 const managerName = state.manager?.name || 'Treinador';
 const clubId = state.clubId || state.ui?.selectedClub || 'santos';
 const score = avg(RC_CHECKPOINTS_V600);
 const criticalIssues = RC_CHECKPOINTS_V600.filter(item => item.critical && Number(item.score||0) < 90);
 const warnings = [];
 if(completedMatches === 0) warnings.push('Save atual ainda não tem partida concluída; teste manual deve jogar pelo menos um matchday.');
 if(completedSeasons === 0) warnings.push('Teste de temporada longa fica para ; esta Beta é de primeira jornada mobile.');
 if(score < RC_PUBLIC_STATUS_V600.readinessTarget) warnings.push('Score abaixo da meta ideal de prontidão pública.');
 return {
  version: RELEASE_CANDIDATE_VERSION,
  status: criticalIssues.length ? 'bloqueada' : statusFor(score),
  score,
  target: RC_PUBLIC_STATUS_V600.readinessTarget,
  publicStatus: RC_PUBLIC_STATUS_V600,
  checkpoints: RC_CHECKPOINTS_V600,
  devices: RC_DEVICE_MATRIX_V600,
  routes: RC_ROUTE_GATES_V600,
  manualFlow: RC_MANUAL_TEST_FLOW_V600,
  knownLimits: RC_KNOWN_LIMITS_V600,
  criticalIssues,
  warnings,
  saveSignals: { managerName, clubId, completedMatches, completedSeasons, route: state.route || 'cover' }
 };
}

export function runReleaseCandidateGate(state={}){
 const snap = buildReleaseCandidateSnapshot(state);
 const errors = [];
 if(snap.criticalIssues.length) errors.push(...snap.criticalIssues.map(i=>`${i.area}: ${i.label}`));
 if(!snap.routes.includes('match')) errors.push('Rota de partida ausente do gate RC.');
 if(!snap.routes.includes('releaseCandidate')) errors.push('Rota da Release Candidate não foi registrada no gate.');
 if(snap.devices.length < 8) errors.push('Matriz mobile/tablet/desktop insuficiente.');
 return { ok: errors.length === 0, status: errors.length ? 'error' : snap.warnings.length ? 'warning' : 'ok', errors, warnings:snap.warnings, score:snap.score, version:snap.version };
}

export function renderReleaseCandidateCenter(state={}){
 const snap = buildReleaseCandidateSnapshot(state);
 const gate = runReleaseCandidateGate(state);
 const checkpoints = snap.checkpoints.map(item=>`<article class="candidate-card ${item.critical?'selected':''}"><div><span class="tag">${item.area} · ${item.critical?'crítico':'apoio'}</span><h3>${item.label}</h3><p>${item.note}</p><small>Score ${item.score}/100</small><div class="meter"><span style="width:${clamp(item.score,0,100)}%"></span></div></div><div class="candidate-side"><strong>${badgeFor(item.score)}</strong><em>${item.score}%</em></div></article>`).join('');
 const devices = snap.devices.map(d=>`<article class="news-item"><strong>${d.device}</strong><span>${d.viewport} · ${d.orientation} · ${d.mustPass.join(' · ')}</span></article>`).join('');
 const flow = snap.manualFlow.map((step,index)=>`<li><strong>${String(index+1).padStart(2,'0')}.</strong> ${step}</li>`).join('');
 const limits = snap.knownLimits.map(k=>`<article class="candidate-card"><div><span class="tag">${k.level}</span><h3>${k.item}</h3><p>${k.note}</p></div><div class="candidate-side"><strong>${k.level==='atenção'?'TESTAR':'OK'}</strong></div></article>`).join('');
 const warnings = gate.warnings.length ? gate.warnings.map(w=>`<li>${w}</li>`).join('') : '<li>Nenhum aviso bloqueante para Primeiros passos.</li>';
 return `<section class="release-candidate- stack">
  <div class="panel standings-hero rc-hero-"><div><span class="tag">${snap.publicStatus.phase} · ${snap.publicStatus.label} · ${snap.version}</span><h1>Primeiros passos Mobile-First</h1><p class="small">${snap.publicStatus.publicGoal} Esta etapa transforma a build corrigida em uma versão organizada para teste real com jogadores, sem criar sistemas grandes novos e sem quebrar a base existente.</p></div><div class="hero-actions"><strong class="grade">${snap.score}%</strong><button class="main-btn" data-route="newGame">Testar início</button><button class="secondary-btn" data-route="match">Testar partida</button></div></div>
  <section class="grid desktop-4">${card('Status RC', snap.status, gate.ok?'Gate aprovado':'Verificar bloqueios')}${card('Meta pública', `${snap.target}%`, snap.publicStatus.testersTarget)}${card('Rotas no gate', snap.routes.length, 'fluxos mínimos protegidos')}${card('Sessão recomendada', snap.publicStatus.recommendedSession, 'por jogador')}</section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Verificação</span><h2>Checklist</h2></div><span class="status-pill">${gate.status}</span></div><div class="candidate-list">${checkpoints}</div></article><article class="panel"><div class="row space"><div><span class="tag">Matriz real</span><h2>Celular, tablet e PC</h2></div><button class="secondary-btn mini" data-action="safe-toast" data-message="Use a matriz para testar o jogo em aparelhos reais.">Como usar</button></div><div class="news-list">${devices}</div><div class="training-note"><strong>Prioridade:</strong> ${snap.publicStatus.feedbackPriority.join(' · ')}</div></article></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Roteiro do testador</span><h2>Primeira jornada obrigatória</h2></div><span class="status-pill">10 passos</span></div><ol class="rc-flow-">${flow}</ol></article><article class="panel"><div class="row space"><div><span class="tag">Limites conhecidos</span><h2>O que observar sem pânico</h2></div><strong class="grade">Beta</strong></div><div class="candidate-list">${limits}</div></article></section>
  <section class="panel"><div class="row space"><div><span class="tag">Relatório rápido</span><h2>Estado do save e avisos</h2></div><button class="secondary-btn mini" data-route="saveCenter">Central de Save</button></div><div class="department-grid"><div class="department-kpi"><span>Técnico</span><strong>${snap.saveSignals.managerName}</strong><small>perfil atual</small></div><div class="department-kpi"><span>Clube</span><strong>${snap.saveSignals.clubId}</strong><small>save atual</small></div><div class="department-kpi"><span>Partidas</span><strong>${snap.saveSignals.completedMatches}</strong><small>concluídas</small></div><div class="department-kpi"><span>Temporadas</span><strong>${snap.saveSignals.completedSeasons}</strong><small>longa duração depois</small></div></div><ul class="small-list">${warnings}</ul><p class="alert"><strong>Decisão:</strong> ${gate.ok ? 'Versão pronta para teste público controlado. O próximo passo deve focar jornada inicial e retenção.' : gate.errors.join(' · ')}</p></section>
 </section>`;
}
