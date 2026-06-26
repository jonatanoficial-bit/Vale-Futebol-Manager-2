import { teams } from '../data/gameData.js';
import { safeImg, clubLogo, bg } from './assets.js';
import { esc } from '../utils/dom.js';
import { LIVE_WORLD_VERSION, LIVE_WORLD_STATUS_V620, LIVE_HEADLINES_V620, LIVE_BACKSTAGE_V620, LIVE_JOURNAL_SECTIONS_V620, LIVE_WORLD_RULES_V620, LIVE_DEVICE_FOCUS_V620 } from '../data/liveWorldData.js';

function activeTeam(state={}){
 return teams.find(t => t.id === (state.clubId || state.ui?.selectedClub)) || teams[0];
}
function rivalTeam(club){
 return teams.find(t => t.id !== club.id && t.leagueId === club.leagueId) || teams.find(t => t.id !== club.id) || club;
}
function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n || 0))); }
function avg(list=[], key='weight'){
 if(!list.length) return 0;
 return Math.round(list.reduce((sum,item)=>sum + Number(item[key] || 0),0) / list.length);
}
function kpi(label,value,note=''){
 return `<div class="department-kpi live-world-kpi-"><span>${label}</span><strong>${value}</strong><small>${note}</small></div>`;
}
function toneIcon(tone=''){
 return ({pressao:'🔥', emocao:'📣', oportunidade:'💼', esperanca:'🌱', competitivo:'🏆', bastidor:'🎙️'})[tone] || '📰';
}

export function buildLiveWorldSnapshot(state={}){
 const club = activeTeam(state);
 const rival = rivalTeam(club);
 const boardTrust = clamp(state.boardTrust || 76);
 const fanMood = clamp(state.fanMood || 82);
 const managerRep = clamp(state.manager?.reputation || 50);
 const baseScore = avg(LIVE_HEADLINES_V620);
 const pressureScore = Math.round((100 - boardTrust) * 0.35 + (100 - fanMood) * 0.25 + Math.max(0, 70 - managerRep) * 0.4);
 const engagementBase = Math.round((boardTrust + fanMood + managerRep) / 3);
 const urgency = Math.min(100, Math.max(80, Math.round(baseScore * 0.82 + engagementBase * 0.18 + 8 - pressureScore * 0.05))); 
 const nextMatch = state.match && !state.match.finalized ? state.match : null;
 const nextTitle = nextMatch ? `${club.name} x ${rival.name}` : `${club.name} x ${rival.name}`;
 const routeCoverage = new Set([...LIVE_HEADLINES_V620.map(n=>n.route), 'lobby', 'messages', 'pressConference', 'match', 'formation', 'standings', 'transfers', 'smartMarket', 'academyScouting', 'careerIntro', 'releaseCandidate', 'liveWorld']);
 return {
  version: LIVE_WORLD_VERSION,
  status: urgency >= LIVE_WORLD_STATUS_V620.readinessTarget ? 'lobby-vivo-aprovado' : 'lobby-vivo-monitorar',
  score: urgency,
  phase: LIVE_WORLD_STATUS_V620.phase,
  clubId: club.id,
  clubName: club.name,
  league: club.league,
  stadium: club.stadium,
  rivalId: rival.id,
  rivalName: rival.name,
  managerName: state.manager?.name || 'Treinador',
  boardTrust,
  fanMood,
  managerRep,
  nextTitle,
  heroBackground: bg('lobby'),
  headlines: LIVE_HEADLINES_V620,
  backstage: LIVE_BACKSTAGE_V620,
  sections: LIVE_JOURNAL_SECTIONS_V620,
  rules: LIVE_WORLD_RULES_V620,
  devices: LIVE_DEVICE_FOCUS_V620,
  routeCoverage: [...routeCoverage],
  dailyHooks: [
   `Abrir jornal antes de ${nextTitle}`,
   'Responder coletiva com contexto da imprensa',
   'Ajustar tática usando pressão da torcida e vestiário',
   'Ver tabela antes do jogo para sentir a rodada',
   'Salvar após pós-jogo para manter continuidade da carreira'
  ]
 };
}

export function renderLiveWorldCenter(state={}){
 const snap = buildLiveWorldSnapshot(state);
 const headlines = snap.headlines.map((item,index)=>`<article class="live-headline-card- ${index===0?'lead':''}">
  <div class="live-headline-icon-">${toneIcon(item.tone)}</div>
  <div><span class="tag">${item.scope} · ${item.tone} · peso ${item.weight}</span><h3>${item.title}</h3><p>${item.impact}</p><button class="secondary-btn mini" data-route="${item.route}">Abrir impacto</button></div>
 </article>`).join('');
 const backstage = snap.backstage.map(item=>`<article class="news-item live-backstage-"><strong>${item.department}</strong><span>${item.signal}</span><small>${item.mood}</small><em>${item.risk}</em></article>`).join('');
 const sections = snap.sections.map(item=>`<div class="live-section-pill-"><span>${item.icon}</span><strong>${item.title}</strong><small>${item.description}</small></div>`).join('');
 const hooks = snap.dailyHooks.map((h,i)=>`<li><strong>${String(i+1).padStart(2,'0')}.</strong> ${h}</li>`).join('');
 const rules = snap.rules.map(rule=>`<li>${rule}</li>`).join('');
 const devices = snap.devices.map(d=>`<div class="candidate-card"><div><span class="tag">${d.device}</span><h3>${d.viewport}</h3><p>${d.must}</p></div><div class="candidate-side"><strong>Mobile</strong></div></div>`).join('');
 return `<section class="live-world- stack">
  <div class="panel live-world-hero-" style="--live-bg:url('${snap.heroBackground}')">
   <div><span class="tag">${snap.phase} · ${LIVE_WORLD_STATUS_V620.label} · ${snap.version}</span><h1>Lobby vivo e jornal esportivo</h1><p>${LIVE_WORLD_STATUS_V620.goal}</p><p class="small">${LIVE_WORLD_STATUS_V620.promise}</p><div class="menu-actions"><button class="main-btn giant" data-route="match">Jogar com contexto</button><button class="secondary-btn" data-route="pressConference">Coletiva</button><button class="secondary-btn" data-route="formation">Plano de jogo</button></div></div>
   <div class="live-club-pulse-">${safeImg(clubLogo(snap.clubId),'club',snap.clubName,'club-logo xl')}<div><span class="small">Pulso do dia</span><strong>${esc(snap.clubName)}</strong><p>${snap.league} · ${snap.stadium}</p><p class="small">Próximo clima: ${snap.nextTitle}</p></div></div>
  </div>
  <section class="grid desktop-4">${kpi('Status', snap.status, 'verificação')}${kpi('Urgência', `${snap.score}%`, 'mundo vivo')}${kpi('Torcida', `${snap.fanMood}%`, 'humor')}${kpi('Diretoria', `${snap.boardTrust}%`, 'confiança')}</section>
  <section class="panel"><div class="row space"><div><span class="tag">Jornal esportivo</span><h2>Manchetes que puxam o jogador para agir</h2></div><button class="secondary-btn mini" data-route="messages">E-mails</button></div><div class="live-headline-grid-">${headlines}</div></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Bastidores</span><h2>O que acontece no clube hoje</h2></div><strong class="grade">Ao vivo</strong></div><div class="news-list">${backstage}</div></article><article class="panel"><div class="row space"><div><span class="tag">Editorias</span><h2>Estrutura do jornal</h2></div><span class="status-pill">${snap.sections.length} blocos</span></div><div class="live-section-grid-">${sections}</div></article></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Ritual diário</span><h2>Loop de retenção do lobby</h2></div><button class="main-btn mini" data-route="careerIntro">Jornada</button></div><ol class="rc-flow- live-flow-">${hooks}</ol></article><article class="panel"><div class="row space"><div><span class="tag">Matriz mobile</span><h2>Garantias da fase</h2></div><button class="secondary-btn mini" data-route="mobileAudit">Verificação</button></div><div class="candidate-list">${devices}</div></article></section>
  <section class="panel"><div class="row space"><div><span class="tag">Segurança</span><h2>Regras de segurança do mundo vivo</h2></div><button class="secondary-btn mini" data-route="releaseCandidate">Primeiros passos</button></div><ul class="small-list live-rules-">${rules}</ul><p class="alert"><strong>Decisão:</strong> o lobby agora tem jornal, bastidores e motivo para o jogador abrir tática, tabela, coletiva e partida sem depender de internet ou vídeo pesado.</p></section>
 </section>`;
}
