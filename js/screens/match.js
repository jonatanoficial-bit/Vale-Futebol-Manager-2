import { screenWrap, topbar } from './common.js';
import { teams } from '../data/gameData.js';
import { matchActionTips } from '../data/matchData.js';
import { getActiveSquad } from '../data/squadData.js';
import { safeImg, clubLogo, stadium } from '../systems/assets.js';
import { buildBalanceSummary } from '../systems/balance.js';
import { buildDeepMatchSnapshot, getPostMatchReport } from '../systems/matchEngine.js';

function pct(n){ return `${Math.max(0, Math.min(100, Math.round(n)))}%`; }
function eventIcon(type){ return {goal:'⚽', chance:'🎯', shot:'🥅', save:'🧤', danger:'⚠️', card:'🟨', var:'📺', penalty:'⚪', sub:'🔁', pressure:'🔥', halftime:'⏱️', fulltime:'🏁', kickoff:'▶'}[type] || '•'; }
function teamById(id){ return teams.find(t=>t.id===id) || teams.find(t=>t.id==='santos') || teams[0]; }
function ratingRows(players=[], snap){
  const base = players.slice().sort((a,b)=>Number(b.overall||0)-Number(a.overall||0)).slice(0,5);
  return base.map((p,i)=>{
    const bonus = (snap.score.home > snap.score.away ? .4 : snap.score.home === snap.score.away ? .1 : -.2) + (i===0?.35:0);
    const rating = Math.max(5.8, Math.min(9.4, (Number(p.overall||70)/12) + bonus + (Number(p.form||70)-70)/35));
    return `<div class="rating-row"><strong>${rating.toFixed(1)}</strong><div><b>${p.name}</b><small>${p.pos} · ${p.role || 'Jogador do elenco'}</small></div></div>`;
  }).join('');
}
function buildSubOptions(players=[], state, isOver){
  const subs = Array.isArray(state.match?.substitutions) ? state.match.substitutions : [];
  const subsLeft = Math.max(0, Number(state.match?.maxSubs || 5) - subs.length);
  const starters = players.filter(p=>['Titular','Estrela','Rotação'].includes(p.status)).slice(0,5);
  const bench = players.filter(p=>!starters.some(s=>s.id===p.id)).sort((a,b)=>Number(b.fitness||0)-Number(a.fitness||0)).slice(0,5);
  if(!starters.length || !bench.length) return '<p class="muted">Banco insuficiente para sugestões automáticas.</p>';
  return starters.map((outP,i)=>{
    const inP = bench[i] || bench[0];
    const done = subs.some(x=>x.out===outP.id) || subs.some(x=>x.in===inP.id);
    const fatigue = Math.max(38, Math.round((outP.fitness||80) - Number(state.match?.minute||1)/3));
    return `<button class="sub-card ${done?'disabled':''}" ${done || subsLeft<=0 || isOver ? 'disabled' : ''} data-action="match-substitution" data-out="${outP.id}" data-in="${inP.id}"><strong>${outP.name} ↔ ${inP.name}</strong><small>${outP.pos} ${fatigue}% → ${inP.pos} ${inP.fitness||90}%</small></button>`;
  }).join('');
}
function postMatchPanel(report, home, away){
  if(!report) return '';
  const s = report.stats;
  const score = s.score || report.score || {home:0, away:0};
  const homeWin = score.home > score.away;
  const draw = score.home === score.away;
  const managerImpact = homeWin ? 'Confiança ampliada' : draw ? 'Projeto estável' : 'Cobrança controlada';
  const financialImpact = homeWin ? '+ bônus por vitória' : draw ? '+ bônus de presença' : '+ receita de jogo';
  const media = homeWin ? 'Imprensa destaca execução do plano de jogo.' : draw ? 'Coletiva cobra ajustes finos para a próxima rodada.' : 'Narrativa externa pede resposta imediata.';
  return `<section class="panel post-match-report premium-postmatch">
    <div class="row space"><div><span class="tag">Relatório pós-jogo · salvo</span><h2>${report.headline}</h2><p class="small">Fluxo seguro v4.7.0: resultado integrado, relatório preservado e próximo jogo enfileirado somente após confirmação.</p></div><button class="main-btn mini" data-action="post-match-lobby">Salvar e voltar ao lobby</button></div>
    <div class="grid desktop-4">
      <div class="card kpi-card"><span>Resultado final</span><strong>${score.home} - ${score.away}</strong><small>${home.name} x ${away.name}</small></div>
      <div class="card kpi-card"><span>Nota do jogo</span><strong>${s.matchRating}</strong><small>Ritmo, xG e chances</small></div>
      <div class="card kpi-card"><span>Diretoria</span><strong>${managerImpact}</strong><small>${report.boardNote}</small></div>
      <div class="card kpi-card"><span>Torcida</span><strong>${report.fanNote}</strong><small>Humor social pós-jogo</small></div>
    </div>
    <div class="postmatch-grid">
      <p class="alert"><b>Momento-chave:</b> ${report.bestMoment}</p>
      <p class="alert"><b>Leitura tática:</b> ${report.tacticalRead}</p>
      <p class="alert"><b>Imprensa:</b> ${media}</p>
      <p class="alert"><b>Financeiro:</b> ${financialImpact}. Receita e moral foram atualizadas no save local.</p>
    </div>
    <div class="grid desktop-4 compact-stats">
      <div class="stat-line"><span>Chutes</span><strong>${s.shots?.[0] || 0} - ${s.shots?.[1] || 0}</strong></div>
      <div class="stat-line"><span>xG</span><strong>${s.xg?.[0] || '0.00'} - ${s.xg?.[1] || '0.00'}</strong></div>
      <div class="stat-line"><span>Posse</span><strong>${s.possession?.[0] || 50}% - ${s.possession?.[1] || 50}%</strong></div>
      <div class="stat-line"><span>Momentum</span><strong>${s.momentum || 50}%</strong></div>
    </div>
  </section>`;
}
export function match(state){
  const minute = Math.min(90, Math.max(1, Number(state.match?.minute || 1)));
  const home = teamById(state.match?.home || state.clubId || 'santos');
  const away = teamById(state.match?.away || 'palmeiras');
  const players = getActiveSquad(state);
  const snap = buildDeepMatchSnapshot(state.match || {}, state);
  const stats = snap.stats;
  const score = snap.score;
  const isOver = minute >= 90 || Boolean(state.match?.finalized);
  const report = isOver ? (state.match?.postMatchReport || getPostMatchReport({...state.match, minute:90}, state)) : null;
  const events = snap.visibleEvents.slice(-9).reverse();
  const fieldEvents = snap.visibleEvents.filter(e=>e.x && e.y).slice(-10);
  const commentary = events.map(e=>`<p class="live-event ${e.type}"><strong>${e.minute}' ${eventIcon(e.type)}</strong><span><b>${e.title}</b>${e.text}</span></p>`).join('') || '<p class="muted">Aguardando primeiros eventos da partida.</p>';
  const fieldDots = fieldEvents.map(e=>`<div class="event-dot ${e.type}" style="left:${e.x}%;top:${e.y}%"><span>${eventIcon(e.type)}</span><small>${e.minute}'</small></div>`).join('');
  const decisionMap = { 'Manter posse':'possession', 'Pressionar saída':'pressure', 'Explorar direita':'right', 'Baixar bloco':'lowblock' };
  const tips = matchActionTips.map(t=>`<button class="tactical-action ${state.match?.decision===decisionMap[t.label]?'active':''}" data-action="match-decision" data-decision="${decisionMap[t.label] || 'balanced'}"><strong>${t.label}</strong><small>${t.impact}</small></button>`).join('');
  const subs = Array.isArray(state.match?.substitutions) ? state.match.substitutions : [];
  const subsLeft = Math.max(0, Number(state.match?.maxSubs || 5) - subs.length);
  const byId = new Map(players.map(p=>[p.id,p]));
  const subOptions = buildSubOptions(players, state, isOver);
  const subHistory = subs.length ? subs.map(x=>`<p class="live-event sub"><strong>${x.minute}' 🔁</strong><span><b>Substituição</b>${(byId.get(x.out)||{}).name || x.out} sai para entrada de ${(byId.get(x.in)||{}).name || x.in}.</span></p>`).join('') : '<p class="muted">Nenhuma substituição realizada.</p>';
  const decisionLog = (state.match?.decisionLog || []).slice(-4).reverse().map(x=>`<div class="stat-line"><span>${x.minute}' ${x.label}</span><strong>Ativo</strong></div>`).join('') || '<p class="muted">Plano equilibrado ativo.</p>';
  const balanceLines = buildBalanceSummary(state.match || {}, state);
  const autoLabel = state.match?.autoPlay ? 'Pausar automático' : 'Avançar automático';
  const speed = Number(state.match?.speed || 1);
  const matchHeader = `${home.stadium || 'Estádio'} · ${stats.ctx.weather} · Árbitro ${stats.ctx.refereeTone} · ${stats.ctx.attendance.toLocaleString('pt-BR')} torcedores`;
  return screenWrap('match', `${topbar('Partida ao vivo','Motor 2.0 v4.7 · atributos, xG, VAR, lesões, cartões e pós-jogo','lobby')}
    <section class="match-v140 match-v300">
      <article class="panel match-score-hero">
        <div class="match-team-side">${safeImg(clubLogo(home.id),'club',home.name,'match-logo')}<h2>${home.name}</h2><span>${home.league}</span></div>
        <div class="match-score-center"><span class="tag">${matchHeader}</span><div class="score ultra">${score.home} - ${score.away}</div><div class="clock premium">${String(minute).padStart(2,'0')}:00</div><div class="match-progress"><span style="width:${pct((minute/90)*100)}"></span></div><small>${isOver ? 'Partida encerrada. Pós-jogo pronto para retorno ao lobby.' : `Simulação ${speed}x com atributos, cansaço, moral, tática, VAR e risco físico.`}</small></div>
        <div class="match-team-side">${safeImg(clubLogo(away.id),'club',away.name,'match-logo')}<h2>${away.name}</h2><span>${away.league}</span></div>
      </article>

      ${postMatchPanel(report, home, away)}

      <section class="match-live-grid">
        <article class="panel tactical-table">
          <div class="row space"><div><span class="tag">Mesa tática 2D</span><h2>Campo, zonas e eventos</h2></div><strong class="grade">${stats.momentum}%</strong></div>
          <div class="live-pitch deep-pitch" style="background-image:linear-gradient(rgba(6,16,10,.34),rgba(3,8,6,.70)),url('${stadium(home.id)}')">
            <div class="pitch-lines"><span class="center-circle"></span><span class="box left"></span><span class="box right"></span></div>
            <div class="team-shape home"><i style="left:12%;top:50%">GOL</i><i style="left:27%;top:24%">LD</i><i style="left:26%;top:43%">ZAG</i><i style="left:26%;top:62%">ZAG</i><i style="left:27%;top:80%">LE</i><i style="left:43%;top:37%">VOL</i><i style="left:45%;top:61%">MC</i><i style="left:60%;top:25%">PD</i><i style="left:64%;top:50%">ATA</i><i style="left:60%;top:75%">PE</i></div>
            <div class="team-shape away"><i style="left:86%;top:50%">GOL</i><i style="left:73%;top:30%">DEF</i><i style="left:73%;top:70%">DEF</i><i style="left:58%;top:42%">MEI</i><i style="left:58%;top:62%">MEI</i><i style="left:42%;top:50%">ATA</i></div>
            ${fieldDots}
          </div>
          <div class="possession-bar"><span style="width:${stats.possession[0]}%"><b>${home.name}</b> ${stats.possession[0]}%</span><em><b>${away.name}</b> ${stats.possession[1]}%</em></div>
          <div class="match-context-grid"><span>Ritmo ${stats.tempo}%</span><span>Fadiga ${Math.round(100-stats.fatigue)}%</span><span>Clima: ${stats.ctx.weather}</span></div>
          <div class="match-context-grid engine-v470"><span>Controle ${stats.advanced?.tacticalControl || 50}%</span><span>Transição ${stats.advanced?.transitionDanger || 42}%</span><span>Bola parada ${stats.advanced?.setPieceThreat || 34}%</span></div>
        </article>
        <aside class="panel live-commentary-panel"><div class="row space"><div><span class="tag">Narração ao vivo</span><h2>Eventos e decisões</h2></div>${isOver ? '<button class="secondary-btn mini" data-action="post-match-lobby">Ir ao lobby</button>' : '<button class="secondary-btn mini" data-action="match-advance">Avançar +5 min</button>'}</div><div class="commentary premium-list">${commentary}</div></aside>
      </section>

      <section class="grid desktop-4 match-kpis">
        <div class="card kpi-card"><span>Chutes</span><strong>${stats.shots[0]} - ${stats.shots[1]}</strong><small>No alvo: ${stats.onTarget[0]} - ${stats.onTarget[1]}</small></div>
        <div class="card kpi-card"><span>xG estimado</span><strong>${stats.xg[0]} - ${stats.xg[1]}</strong><small>Chance acumulada</small></div>
        <div class="card kpi-card"><span>Passes certos</span><strong>${stats.accuracy[0]}% - ${stats.accuracy[1]}%</strong><small>${stats.passes[0]} - ${stats.passes[1]} passes</small></div>
        <div class="card kpi-card"><span>Disciplina</span><strong>${stats.fouls[0]+stats.fouls[1]}</strong><small>Cartões: ${stats.cards[0]} - ${stats.cards[1]}</small></div>
      </section>

      <section class="grid desktop-4 match-kpis engine-v470-panel">
        <div class="card kpi-card"><span>Risco VAR</span><strong>${stats.advanced?.varRisk || 8}%</strong><small>Revisões narrativas seguras</small></div>
        <div class="card kpi-card"><span>Pênalti</span><strong>${stats.advanced?.penaltyRisk || 6}%</strong><small>Pressão na área</small></div>
        <div class="card kpi-card"><span>Lesão</span><strong>${stats.advanced?.injuryRisk || 4}%</strong><small>Clima + fadiga + intensidade</small></div>
        <div class="card kpi-card"><span>Impacto banco</span><strong>${stats.advanced?.substitutionImpact || 0}%</strong><small>Substituições e físico</small></div>
      </section>

      <section class="grid grid-3 match-control-grid">
        <article class="panel"><span class="tag">Controles</span><h3>Ritmo da simulação</h3><div class="row wrap"><button class="secondary-btn ${speed===1?'active':''}" data-action="match-speed" data-speed="1">1x</button><button class="secondary-btn ${speed===2?'active':''}" data-action="match-speed" data-speed="2">2x</button><button class="secondary-btn ${speed===5?'active':''}" data-action="match-speed" data-speed="5">5x</button></div>${isOver ? '<button class="main-btn" data-action="post-match-lobby">Salvar e voltar ao lobby</button>' : '<button class="main-btn" data-action="match-advance">Avançar +5 min</button><button class="secondary-btn" data-action="match-autoplay" data-enabled="'+(!state.match?.autoPlay)+'">'+autoLabel+'</button><button class="secondary-btn danger" data-action="match-finish">Finalizar e ver relatório</button>'}</article>
        <article class="panel substitutions-panel"><span class="tag">Substituições</span><h3>Banco e queda física</h3><div class="stat-line"><span>Trocas restantes</span><strong>${subsLeft}/${state.match?.maxSubs || 5}</strong></div><div class="sub-list">${subOptions}</div><div class="commentary compact">${subHistory}</div></article>
        <article class="panel"><span class="tag">Decisões em jogo</span><h3>Comandos rápidos</h3><div class="tactical-actions">${tips}</div><div class="decision-log">${decisionLog}</div></article>
      </section>

      <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Notas ao vivo</span><h2>Destaques individuais</h2></div><strong class="grade">${stats.matchRating}</strong></div><div class="rating-list">${ratingRows(players, snap)}</div></article><article class="panel ai-balance-live"><div class="row space"><div><span class="tag">IA v3.0</span><h2>Leitura realista</h2></div><strong class="grade">${stats.ctx.diff>4?'Casa':stats.ctx.diff<-4?'Visitante':'Equilíbrio'}</strong></div>${balanceLines.map(x=>`<div class="stat-line"><span>${x}</span><strong>OK</strong></div>`).join('')}<div class="stat-line"><span>Momentum</span><strong>${stats.momentum}%</strong></div><div class="stat-line"><span>Condição média</span><strong>${Math.round(stats.fatigue)}%</strong></div><p class="alert">O motor 2.0 considera atributos individuais, posição, tática, moral, fadiga, clima, mando, substituições, VAR, risco físico, cartões e variação controlada.</p></article><article class="panel"><div class="row space"><div><span class="tag">Assistente</span><h2>Diagnóstico</h2></div><span class="status-pill">Anti-quebra ativo</span></div><p class="alert">Motor de partida 2.0 com stress test interno, eventos seguros, xG, VAR, cartões, lesões, substituições e relatório pós-jogo preservado.</p><div class="stat-line"><span>Recomendação</span><strong>${score.home>=score.away?'Controlar transição':'Aumentar pressão'}</strong></div><div class="stat-line"><span>Risco atual</span><strong>${minute>75?'Alto':'Médio'}</strong></div></article></section>
    </section>`, true);
}
