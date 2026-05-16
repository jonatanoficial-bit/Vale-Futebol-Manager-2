import { screenWrap, topbar } from './common.js';
import { teams } from '../data/gameData.js';
import { matchTimeline, matchActionTips, playerRatings } from '../data/matchData.js';
import { squadPlayers } from '../data/squadData.js';
import { safeImg, clubLogo, stadium } from '../systems/assets.js';
import { computeMatchAI, buildBalanceSummary } from '../systems/balance.js';

function scoreUntil(minute){
  return matchTimeline.filter(e=>e.type==='goal' && e.minute<=minute).reduce((acc,e)=>{
    if(e.team==='santos') acc.home += 1;
    if(e.team==='palmeiras') acc.away += 1;
    return acc;
  }, {home:0, away:0});
}
function pct(n){ return `${Math.max(0, Math.min(100, Math.round(n)))}%`; }
function buildStats(minute, score, matchState={}, state={}){
  const phase = Math.max(0.1, Math.min(1, minute/90));
  const ai = computeMatchAI(matchState, state);
  const boost = Number(matchState.tacticalBoost || 0);
  const subBoost = Array.isArray(matchState.substitutions) ? Math.min(5, matchState.substitutions.length * 2) : 0;
  const edgeBoost = Math.max(-6, Math.min(6, ai.edge / 2));
  const homePoss = Math.max(35, Math.min(68, Math.round(52 + edgeBoost + boost + subBoost/2 + (score.home>score.away ? -2 : 2) + Math.sin(minute/11)*2)));
  const awayPoss = 100 - homePoss;
  return {
    homePoss, awayPoss, ai,
    shots:[Math.round(4 + phase*7 + ai.homeExpected*1.5 + score.home*1.5 + Math.max(0, boost)), Math.round(3 + phase*6 + ai.awayExpected*1.4 + score.away*1.5)],
    onTarget:[Math.round(1 + phase*3 + ai.homeExpected + score.home + Math.max(0, subBoost/3)), Math.round(1 + phase*2.5 + ai.awayExpected + score.away)],
    xg:[(ai.homeExpected * (0.45 + phase*.75) + score.home*.20).toFixed(2), (ai.awayExpected * (0.45 + phase*.75) + score.away*.20).toFixed(2)],
    corners:[Math.round(1 + phase*4 + Math.max(0, ai.edge/18)), Math.round(phase*3 + Math.max(0, -ai.edge/20))],
    fouls:[Math.round(5 + phase*8 + (matchState.decision==='pressure'?2:0)), Math.round(7 + phase*9 + (ai.league.cardRisk-70)/20)],
    cards:[minute>=76 && matchState.decision==='pressure'?1:0, minute>=27?1:0],
    momentum: pct(48 + edgeBoost + boost + subBoost + Math.sin(minute/8)*18 + (score.home-score.away)*10)
  };
}
function eventIcon(type){
  return {goal:'⚽', chance:'🎯', danger:'⚠️', card:'🟨', sub:'🔁', pressure:'🔥', halftime:'⏱️', fulltime:'🏁', kickoff:'▶'}[type] || '•';
}
export function match(state){
  const minute = Math.min(90, Math.max(1, Number(state.match?.minute || 57)));
  const home = teams.find(t=>t.id===state.match?.home) || teams.find(t=>t.id==='santos') || teams[0];
  const away = teams.find(t=>t.id===state.match?.away) || teams.find(t=>t.id==='palmeiras') || teams[1] || home;
  const score = scoreUntil(minute);
  const stats = buildStats(minute, score, state.match || {}, state);
  const balanceLines = buildBalanceSummary(state.match || {}, state);
  const events = matchTimeline.filter(e=>e.minute<=minute).slice(-7).reverse();
  const fieldEvents = matchTimeline.filter(e=>e.x && e.y && e.minute<=minute).slice(-8);
  const isOver = minute >= 90;
  const controlLabel = isOver ? 'Partida encerrada' : 'Avançar +5 min';
  const commentary = events.map(e=>`<p class="live-event ${e.type}"><strong>${e.minute}' ${eventIcon(e.type)}</strong><span><b>${e.title}</b>${e.text}</span></p>`).join('');
  const fieldDots = fieldEvents.map(e=>`<div class="event-dot ${e.type}" style="left:${e.x}%;top:${e.y}%"><span>${eventIcon(e.type)}</span><small>${e.minute}'</small></div>`).join('');
  const ratingRows = playerRatings.map(p=>`<div class="rating-row"><strong>${p.rating.toFixed(1)}</strong><div><b>${p.name}</b><small>${p.role} · ${p.note}</small></div></div>`).join('');
  const decisionMap = { 'Manter posse':'possession', 'Pressionar saída':'pressure', 'Explorar direita':'right', 'Baixar bloco':'lowblock' };
  const tips = matchActionTips.map(t=>`<button class="tactical-action ${state.match?.decision===decisionMap[t.label]?'active':''}" data-action="match-decision" data-decision="${decisionMap[t.label] || 'balanced'}"><strong>${t.label}</strong><small>${t.impact}</small></button>`).join('');
  const subs = Array.isArray(state.match?.substitutions) ? state.match.substitutions : [];
  const subsLeft = Math.max(0, Number(state.match?.maxSubs || 5) - subs.length);
  const starters = ['giuliano','lucas-lima','julio-furch','tomas-rincon','guilherme'];
  const bench = ['miguelito','weslley-patati','deivid-washington','angelo','pedrinho'];
  const byId = new Map(squadPlayers.map(p=>[p.id,p]));
  const subOptions = starters.map((outId,i)=>{ const inId = bench[i] || bench[0]; const outP = byId.get(outId) || {name:outId,pos:'--',fitness:68}; const inP = byId.get(inId) || {name:inId,pos:'--',fitness:90}; const done = subs.some(x=>x.out===outId) || subs.some(x=>x.in===inId); return `<button class="sub-card ${done?'disabled':''}" ${done || subsLeft<=0 || isOver ? 'disabled' : ''} data-action="match-substitution" data-out="${outId}" data-in="${inId}"><strong>${outP.name} ↔ ${inP.name}</strong><small>${outP.pos} ${Math.max(50, Math.round((outP.fitness||80)-minute/4))}% → ${inP.pos} ${inP.fitness||92}%</small></button>`; }).join('');
  const subHistory = subs.length ? subs.map(x=>`<p class="live-event sub"><strong>${x.minute}' 🔁</strong><span><b>Substituição</b>${(byId.get(x.out)||{}).name || x.out} sai para entrada de ${(byId.get(x.in)||{}).name || x.in}.</span></p>`).join('') : '<p class="muted">Nenhuma substituição realizada.</p>';
  const decisionLog = (state.match?.decisionLog || []).slice(-3).reverse().map(x=>`<div class="stat-line"><span>${x.minute}' ${x.label}</span><strong>Ativo</strong></div>`).join('') || '<p class="muted">Plano equilibrado ativo.</p>'; 
  return screenWrap('match', `${topbar('Partida ao vivo','Simulação premium · mesa tática 2D','lobby')}
    <section class="match-v140">
      <article class="panel match-score-hero">
        <div class="match-team-side">${safeImg(clubLogo(home.id),'club',home.name,'match-logo')}<h2>${home.name}</h2><span>${home.league}</span></div>
        <div class="match-score-center"><span class="tag">${home.stadium} · ${minute>=45?'2º tempo':'1º tempo'}</span><div class="score ultra">${score.home} - ${score.away}</div><div class="clock premium">${String(minute).padStart(2,'0')}:00</div><div class="match-progress"><span style="width:${pct((minute/90)*100)}"></span></div><small>${isOver ? 'Resultado final salvo no histórico local da carreira.' : 'Simulação em tempo real por eventos, tática, moral e mando de campo.'}</small></div>
        <div class="match-team-side">${safeImg(clubLogo(away.id),'club',away.name,'match-logo')}<h2>${away.name}</h2><span>${away.league}</span></div>
      </article>

      <section class="match-live-grid">
        <article class="panel tactical-table">
          <div class="row space"><div><span class="tag">Mesa tática</span><h2>Campo e acontecimentos</h2></div><strong class="grade">${stats.momentum}</strong></div>
          <div class="live-pitch" style="background-image:linear-gradient(rgba(7,19,12,.52),rgba(6,12,9,.88)),url('${stadium(home.id)}')">
            <div class="pitch-lines"><span class="center-circle"></span><span class="box left"></span><span class="box right"></span></div>
            <div class="team-shape home"><i style="left:12%;top:50%">GOL</i><i style="left:27%;top:28%">LD</i><i style="left:26%;top:50%">ZAG</i><i style="left:27%;top:72%">LE</i><i style="left:43%;top:38%">VOL</i><i style="left:45%;top:62%">MC</i><i style="left:60%;top:25%">PD</i><i style="left:62%;top:50%">ATA</i><i style="left:60%;top:75%">PE</i></div>
            <div class="team-shape away"><i style="left:86%;top:50%">GOL</i><i style="left:72%;top:30%">DEF</i><i style="left:72%;top:70%">DEF</i><i style="left:58%;top:50%">MEI</i><i style="left:42%;top:50%">ATA</i></div>
            ${fieldDots}
          </div>
          <div class="possession-bar"><span style="width:${stats.homePoss}%"><b>${home.name}</b> ${stats.homePoss}%</span><em>${awayPossLabel(stats.awayPoss, away.name)}</em></div>
        </article>
        <aside class="panel live-commentary-panel"><div class="row space"><div><span class="tag">Narração ao vivo</span><h2>Eventos da partida</h2></div><button class="secondary-btn mini" data-action="match-advance">${controlLabel}</button></div><div class="commentary premium-list">${commentary}</div></aside>
      </section>

      <section class="grid desktop-4 match-kpis">
        <div class="card kpi-card"><span>Chutes</span><strong>${stats.shots[0]} - ${stats.shots[1]}</strong><small>No alvo: ${stats.onTarget[0]} - ${stats.onTarget[1]}</small></div>
        <div class="card kpi-card"><span>xG estimado</span><strong>${stats.xg[0]} - ${stats.xg[1]}</strong><small>Chance acumulada</small></div>
        <div class="card kpi-card"><span>Escanteios</span><strong>${stats.corners[0]} - ${stats.corners[1]}</strong><small>Pressão territorial</small></div>
        <div class="card kpi-card"><span>Faltas/cartões</span><strong>${stats.fouls[0]+stats.fouls[1]}</strong><small>Cartões: ${stats.cards[0]} - ${stats.cards[1]}</small></div>
      </section>

      <section class="grid grid-3 match-control-grid">
        <article class="panel"><span class="tag">Controles</span><h3>Ritmo da simulação</h3><div class="row wrap"><button class="secondary-btn" data-action="match-speed" data-speed="1">1x</button><button class="secondary-btn" data-action="match-speed" data-speed="2">2x</button><button class="secondary-btn" data-action="match-speed" data-speed="3">3x</button></div><button class="main-btn" data-action="match-advance">${controlLabel}</button><button class="secondary-btn danger" data-action="match-finish">Finalizar partida</button></article>
        <article class="panel substitutions-panel"><span class="tag">Substituições funcionais</span><h3>Banco e leitura física</h3><div class="stat-line"><span>Trocas restantes</span><strong>${subsLeft}/${state.match?.maxSubs || 5}</strong></div><div class="sub-list">${subOptions}</div><div class="commentary compact">${subHistory}</div></article>
        <article class="panel"><span class="tag">Decisões em jogo</span><h3>Comandos rápidos</h3><div class="tactical-actions">${tips}</div><div class="decision-log">${decisionLog}</div></article>
      </section>

      <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Notas ao vivo</span><h2>Destaques individuais</h2></div><strong class="grade">8.3</strong></div><div class="rating-list">${ratingRows}</div></article><article class="panel ai-balance-live"><div class="row space"><div><span class="tag">IA v1.9</span><h2>Leitura realista da partida</h2></div><strong class="grade">${stats.ai.diff.name}</strong></div>${balanceLines.map(x=>`<div class="stat-line"><span>${x}</span><strong>OK</strong></div>`).join('')}<p class="alert">O motor considera força do elenco, mando, tática, moral, fadiga, ritmo da liga e variação controlada.</p></article><article class="panel"><div class="row space"><div><span class="tag">Leitura do assistente</span><h2>Diagnóstico</h2></div><span class="status-pill">Anti-quebra ativo</span></div><p class="alert">O motor de partida agora registra decisões táticas e substituições reais no estado da partida. Tudo continua com fallback automático para não quebrar quando assets finais ainda não existirem.</p><div class="stat-line"><span>Recomendação</span><strong>${score.home>=score.away?'Controlar transição':'Aumentar pressão'}</strong></div><div class="stat-line"><span>Risco atual</span><strong>${minute>75?'Alto':'Médio'}</strong></div></article></section>
    </section>`, true);
}
function awayPossLabel(value, name){ return `<b>${name}</b> ${value}%`; }
