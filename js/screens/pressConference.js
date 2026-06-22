import { screenWrap, topbar } from './common.js';
import { teams } from '../data/gameData.js';
import { safeImg, clubLogo } from '../systems/assets.js';
import { buildPressConferenceSnapshot } from '../systems/pressConferenceEngine.js';

function team(id){ return teams.find(t=>t.id===id) || teams[0]; }
function signed(n=0){ const v=Number(n||0); return `${v>0?'+':''}${v}`; }
function impactPill(label, value){ return `<span class="impact-pill ${Number(value)>=0?'positive':'negative'}"><b>${label}</b> ${signed(value)}</span>`; }
function typewriter(text=''){
  const safe = String(text).replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const chars = Math.min(180, Math.max(55, safe.length));
  return `<p class="typewriter-v593" style="--chars:${chars}">${safe}</p>`;
}
function answerCards(question){
  return (question?.answers || []).map((a, idx)=>`
    <button class="press-answer-v593" data-action="press-answer" data-answer="${a.id}">
      <span class="answer-letter">${String.fromCharCode(65+idx)}</span>
      <strong>${a.label}</strong>
      <small>${a.tone}</small>
    </button>`).join('');
}
function resultPanel(snapshot){
  const total = snapshot.result?.total || {};
  const summaries = snapshot.result?.summaries || [];
  return `<section class="panel press-result-v593">
    <div class="row space"><div><span class="tag">Impacto da coletiva</span><h2>Resposta enviada à imprensa</h2></div><strong class="grade">${snapshot.result?.dominant || 'Equilibrado'}</strong></div>
    <p class="alert">${snapshot.result?.headline || 'A coletiva foi registrada com segurança.'}</p>
    <div class="impact-grid-v593">
      ${impactPill('Reputação', total.reputation)}
      ${impactPill('Torcida', total.fanMood)}
      ${impactPill('Elenco', total.dressingRoomTrust)}
      ${impactPill('Diretoria', total.boardTrust)}
      ${impactPill('Imprensa', total.mediaPressure)}
      ${typeof total.tacticalBoost === 'number' && total.tacticalBoost !== 0 ? impactPill('Tática', total.tacticalBoost) : ''}
    </div>
    <div class="press-summary-list-v593">${summaries.map(s=>`<div class="news-item"><strong>Repercussão</strong><span>${s}</span></div>`).join('')}</div>
    <button class="main-btn" data-action="press-complete">${snapshot.type === 'post' ? 'Salvar coletiva e voltar ao lobby' : 'Entrar em campo'}</button>
  </section>`;
}

export function pressConference(state){
  const snapshot = buildPressConferenceSnapshot(state);
  const session = state.career?.pressConference;
  const q = snapshot.question;
  const home = team(state.match?.home);
  const away = team(state.match?.away);
  const isCompleted = Boolean(session?.completed);
  const progress = `${Math.min((session?.answers?.length||0)+1, session?.total||3)}/${session?.total||3}`;
  return screenWrap('pressConference', `
    ${topbar(snapshot.title, snapshot.type === 'post' ? 'Três perguntas rápidas depois do jogo' : 'Três perguntas rápidas antes da partida', 'lobby')}
    <section class="press-shell-v593">
      <article class="panel press-hero-v593">
        <div class="press-match-v593">
          <div>${safeImg(clubLogo(home.id),'club',home.name,'club-logo')}<strong>${home.name}</strong></div>
          <span>Coletiva ${snapshot.type === 'post' ? 'pós-jogo' : 'pré-jogo'}</span>
          <div>${safeImg(clubLogo(away.id),'club',away.name,'club-logo')}<strong>${away.name}</strong></div>
        </div>
        <div class="row space"><div><span class="tag">Pergunta ${isCompleted ? session.total : progress}</span><h1>${snapshot.title}</h1><p class="small">As respostas influenciam reputação, moral do elenco, diretoria, torcida e pressão da imprensa.</p></div><strong class="grade">${state.manager?.reputation || 50}</strong></div>
      </article>

      ${isCompleted ? resultPanel(snapshot) : `<article class="panel press-question-v593">
        <div class="reporter-v593"><span>🎙️</span><div><strong>${q?.reporter || 'Repórter'}</strong><small>${state.match?.competition || 'Competição oficial'} · ${state.match?.stage || 'Rodada'}</small></div></div>
        ${typewriter(q?.question || 'Como você avalia o momento da equipe?')}
        <div class="press-answers-grid-v593">${answerCards(q)}</div>
      </article>`}

      <section class="panel press-history-v593">
        <div class="row space"><div><span class="tag">Histórico</span><h3>Últimas declarações</h3></div><button class="secondary-btn mini" data-route="careerTutorial">Ver missões</button></div>
        <div class="coach-feed-grid-v550">
          ${(snapshot.history || []).length ? snapshot.history.map(h=>`<div class="news-item"><strong>${h.title}</strong><span>${h.headline}</span></div>`).join('') : '<div class="news-item"><strong>Primeira coletiva</strong><span>Suas declarações ficarão registradas aqui durante a carreira.</span></div>'}
        </div>
      </section>
    </section>`, true);
}
