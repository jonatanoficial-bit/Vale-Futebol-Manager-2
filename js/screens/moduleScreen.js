import { screenWrap, topbar, clubHeader } from './common.js';
import { players, tableRows, teams } from '../data/gameData.js';
import { squadNeeds, getActiveSquad, getSquadSummary, getContractAlerts, getRosterMeta } from '../data/squadData.js';
import { formations, tacticalProfiles, playerInstructions, setPieces } from '../data/tacticsData.js';
import { standingsCompetitions, standingsTables, scorers, competitionStats } from '../data/standingsData.js';
import { competitions, seasonMonths, schedule, calendarDays, eventTitle, eventClass } from '../data/seasonData.js';
import { trainingThemes, weeklyPlan, developmentFocus, trainingStaffImpact, trainingAlerts } from '../data/trainingData.js';
import { staffBudget, currentStaff, staffCandidates, staffDepartmentKpis, sponsorsOverview, activeSponsors, sponsorProposals, financeSnapshot } from '../data/staffData.js';
import { transferWindow, transferShortlist, outgoingList, negotiations, scoutingReports, contractRules, renewalTargets, boardTransferPolicy, loanTargets, aiClubProfiles, agentEvents } from '../data/transferData.js';
import { inboxMessages, careerProfile, jobOffers, nationalTeams, callUpPool, seasonObjectives } from '../data/careerData.js';
import { difficultyProfiles, aiWeights, leaguePaceProfiles, balanceDiagnostics, aiTuningNotes } from '../data/balanceData.js';
import { stabilityChecklist, savePolicies } from '../data/stabilityData.js';
import { safeImg, clubLogo, country, stadium, assetStatusSummary, flattenAssetMap, fallback } from '../systems/assets.js';
import { visualSummary, visualLibrary } from '../systems/visualAssetManager.js';
import { evaluateTactic, buildBestLineup, squadAlerts, recommendedCaptain, recommendedSetPieceTakers, roleLabel } from '../systems/squadEngine.js';
import { buildRoundRobin, flattenFixtures, deriveStandings, leagueZones, qualificationSummary, fixturesByRound, simulateOtherRoundMatches } from '../systems/seasonEngine.js';
import { continentalCompetitions, worldCompetitions, nationalTeamCompetitions, buildWorldCalendar, continentalStatusForClub, nextGlobalCycle, qualificationRules, renderCompetitionLogo, worldCompetitionSummary } from '../systems/worldCompetitionEngine.js';
import { financeProfiles } from '../data/financeData.js';
import { buildFinanceSnapshot, boardObjectiveStatus, financeEventFeed } from '../systems/financeEngine.js';
export function moduleScreen(route,title,subtitle,state){
  const extra = content(route, state);
  return screenWrap(route, `${topbar(title,subtitle,'lobby')}${clubHeader(state)}${extra}`, true);
}

function slug(name=''){
  return String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/fc|futebol clube|club de regatas|sport club/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'santos';
}
function teamById(id){ return teams.find(t=>t.id===id) || teams[0]; }
function scheduleWithState(state={}){
  const club = teamById(state.clubId || state.ui?.selectedClub || 'santos');
  const leagueRivals = teams.filter(t => t.leagueId === club.leagueId && t.id !== club.id);
  const rivals = leagueRivals.length ? leagueRivals : teams.filter(t=>t.id !== club.id);
  const history = new Map((state.career?.completedMatches || []).map(m=>[m.id,m]));
  const dynamic = schedule.map((ev,index)=>{
    if(ev.type !== 'match') return {...ev, venue: ev.venue === 'CT' ? `CT ${club.name}` : ev.venue};
    const rival = rivals[index % Math.max(1,rivals.length)] || teamById('palmeiras');
    const homeUser = index % 2 === 0;
    const home = homeUser ? club : rival;
    const away = homeUser ? rival : club;
    const competition = ev.competition === 'LIGA_DO_CLUBE' ? club.league : ev.competition;
    const venue = ev.venue === 'ESTADIO_CLUBE' ? club.stadium : (homeUser ? club.stadium : rival.stadium || ev.venue);
    const id = `${ev.date}-${home.id}-${away.id}`;
    const done = history.get(id);
    const base = {...ev, id, home:home.name, away:away.name, homeId:home.id, awayId:away.id, competition, venue};
    return done ? {...base, status:'Concluído', result:`${done.homeGoals} x ${done.awayGoals}`, completed:true} : base;
  });
  if(state.match && !state.match.finalized){
    const h=teamById(state.match.home); const a=teamById(state.match.away);
    dynamic[0] = {...dynamic[0], id:state.match.id, date:state.match.date, home:h.name, away:a.name, homeId:h.id, awayId:a.id, competition:state.match.competition, stage:state.match.stage, venue:h.stadium || club.stadium, status:'Próximo jogo'};
  }
  return dynamic;
}
function applyIntegratedStandings(rows=[], compId='brasileirao-a', state={}){
  const derived = deriveStandings(compId, state.career?.completedMatches || []);
  const userClub = state.clubId || state.ui?.selectedClub || 'santos';
  return derived.map(r=>({...r, user:r.id===userClub}));
}

function content(route,state={}){
  const squadPlayers = getActiveSquad(state);
  const squadSummary = getSquadSummary(state);
  const contractAlerts = getContractAlerts(state);
  const rosterMeta = getRosterMeta(state);
  if(route==='seasonCenter') return seasonCenterScreen(state);
  if(route==='worldCompetitions') return worldCompetitionsScreenV320(state);
  if(route==='financeCenter') return financeCenterScreenV330(state);
  if(route==='visualLibrary') return visualLibraryScreen(state);
  if(route==='rosterUpdate') return rosterUpdateScreen(state, squadPlayers, squadSummary, rosterMeta);
  if(route==='assetChecklist') return assetChecklistScreen(state);
  if(route==='saveCenter') return saveCenterScreen(state);
  if(route==='aiBalance') return aiBalanceScreen(state);
  if(route==='formation') return formationScreen(state);
  if(route==='instructions') return instructionsScreen(state);
  if(route==='standings') {
    const selected = state.ui?.standingsCompetition || 'brasileirao-a';
    const comp = standingsCompetitions.find(c=>c.id===selected) || standingsCompetitions[0];
    const rows = applyIntegratedStandings(standingsTables[comp.id] || standingsTables['brasileirao-a'] || [], comp.id, state);
    const userRow = rows.find(r=>r.user) || rows[0] || {pos:0, pts:0, p:0, w:0, d:0, l:0, gf:0, ga:0, club:'Clube'};
    const zone = userRow.pos <= 4 ? 'Zona continental' : userRow.pos <= 8 ? 'Meio competitivo' : 'Pressão de recuperação';
    const table = rows.map(r=>`<tr class="${r.user?'user-row':''}">
      <td><strong>${r.pos}</strong></td>
      <td><div class="team-cell">${safeImg(clubLogo(r.id),'club',r.club,'mini-logo')}<span>${r.club}</span></div><small>${leagueZones(comp.id,r.pos).name}</small></td>
      <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gf-r.ga}</td><td><strong>${r.pts}</strong></td>
      <td><div class="form-strip">${(r.form||[]).map(f=>`<span class="form-${f}">${f}</span>`).join('')}</div></td>
    </tr>`).join('');
    const select = `<select class="select" data-action="standings-select">${standingsCompetitions.map(c=>`<option value="${c.id}" ${c.id===comp.id?'selected':''}>${c.name}</option>`).join('')}</select>`;
    const scorersHtml = scorers.map((s,i)=>`<div class="scorer-row ${s.club==='Santos FC'?'highlight':''}"><strong>${i+1}</strong><div><span>${s.player}</span><small>${s.club}</small></div><b>${s.goals} G</b><em>${s.assists} A</em></div>`).join('');
    return `<section class="standings-v080">
      <div class="panel standings-hero"><div><span class="tag">Classificação e estatísticas</span><h1>${comp.name}</h1><p class="small">Tabela dinâmica por competição, com escudos dos clubes, forma recente, saldo, zonas de classificação/rebaixamento e atualização automática após cada partida.</p></div><div class="standings-selector"><label>Competição</label>${select}</div></div>
      <section class="grid desktop-4"><div class="card kpi-card"><span>Posição do clube</span><strong>${userRow.pos}º</strong><small>${zone}</small></div><div class="card kpi-card"><span>Pontos</span><strong>${userRow.pts}</strong><small>${userRow.p} jogos disputados</small></div><div class="card kpi-card"><span>Saldo</span><strong>${userRow.gf-userRow.ga > 0 ? '+' : ''}${userRow.gf-userRow.ga}</strong><small>${userRow.gf} pró · ${userRow.ga} contra</small></div><div class="card kpi-card"><span>Aproveitamento</span><strong>${Math.round((userRow.pts/Math.max(1,userRow.p*3))*100)}%</strong><small>${userRow.w}V ${userRow.d}E ${userRow.l}D</small></div></section>
      <section class="panel table-panel"><div class="row space"><div><span class="tag">Tabela</span><h2>Classificação completa</h2></div><span class="status-pill">Integração v1.6 ativa</span></div><div class="table-scroll"><table class="table standings-table"><thead><tr><th>Pos</th><th>Time</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>PTS</th><th>Forma</th></tr></thead><tbody>${table}</tbody></table></div></section>
      <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Artilharia</span><h2>Líderes ofensivos</h2></div><strong class="grade">Top 6</strong></div><div class="scorer-list">${scorersHtml}</div></article><article class="panel"><div class="row space"><div><span class="tag">Radar do torneio</span><h2>Indicadores</h2></div><strong class="grade">${competitionStats.avgGoals}</strong></div><div class="stats-radar"><div><span>Gols</span><strong>${competitionStats.goals}</strong></div><div><span>Cartões</span><strong>${competitionStats.cards}</strong></div><div><span>Clean sheets</span><strong>${competitionStats.cleanSheets}</strong></div><div><span>Melhor ataque</span><strong>${competitionStats.bestAttack}</strong></div><div><span>Melhor defesa</span><strong>${competitionStats.bestDefense}</strong></div><div><span>Mais posse</span><strong>${competitionStats.mostPossession}</strong></div></div></article></section>
    </section>`;
  }
  if(route==='transfers') return transfersScreen(state);
  if(route==='messages') return messagesScreenV310(state);
  if(route==='careerOffers') return careerOffersScreenV310(state);
  if(route==='nationalTeam') return nationalTeamScreenV310(state);
  if(route==='training') return trainingScreen(state);
  if(route==='staff') return staffScreen(state);
  if(route==='sponsorship') return sponsorshipScreen(state);
  if(route==='championship') {
    const compCards = competitions.map(c=>`<article class="competition-card ${c.color}">
      <div class="comp-icon">${c.short}</div>
      <div><span class="tag">${c.type} · ${c.scope}</span><h3>${c.name}</h3><p class="small">${c.status} · ${c.round}</p></div>
      <div class="comp-meta"><strong>${c.priority}</strong><small>${c.objective}</small></div>
    </article>`).join('');
    const nextMatches = scheduleWithState(state).filter(e=>e.type==='match').slice(0,6).map(ev=>`<div class="fixture-row ${ev.completed?'completed-fixture':''}">
      <div class="fixture-date"><strong>${ev.date.slice(8,10)}</strong><small>${ev.day}</small></div>
      <div class="fixture-main"><strong>${eventTitle(ev)} ${ev.result ? '· '+ev.result : ''}</strong><span>${ev.competition} · ${ev.stage}</span><small>${ev.venue}</small></div>
      <div class="fixture-importance"><span>${ev.importance}</span><div class="meter"><span style="width:${ev.importance}%"></span></div></div>
    </div>`).join('');
    return `<section class="championship-v070">
      <div class="panel championship-hero"><div><span class="tag">Agenda anual esportiva</span><h1>Competições do clube</h1><p class="small">Visão executiva das competições que o time disputa, com fase atual, prioridade, objetivo e próximos compromissos.</p></div><button class="main-btn" data-route="calendar">Abrir calendário completo</button></div>
      <section class="competition-grid">${compCards}</section>
      <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Próximos jogos</span><h2>Sequência decisiva</h2></div><button class="secondary-btn mini" data-route="match">Iniciar jogo</button></div><div class="fixture-list">${nextMatches}</div></article>
      <article class="panel"><div class="row space"><div><span class="tag">Temporada</span><h2>Mapa anual</h2></div><strong class="grade">12 meses</strong></div><div class="month-mini-grid">${seasonMonths.map(m=>`<div class="month-mini"><strong>${m.name}</strong><span>${m.matches} eventos</span><small>${m.focus}</small></div>`).join('')}</div></article></section>
    </section>`;
  }
  if(route==='calendar') {
    const integratedSchedule = scheduleWithState(state);
    const integratedDays = Array.from({length:31}, (_,i)=>{ const day=i+1; return {day, events: integratedSchedule.filter(ev => Number(ev.date.slice(-2)) === day)}; });
    const dayCells = integratedDays.map(d=>`<div class="calendar-day ${d.events.length?'has-event':''}"><div class="day-number">${d.day}</div>${d.events.slice(0,2).map(ev=>`<span class="calendar-event ${eventClass(ev)} ${ev.completed?'event-completed':''}">${ev.result || (ev.type==='match' ? ev.competition.replace('Brasileirão Série A','Brasileirão').replace('Copa do Brasil','Copa BR') : ev.competition)}</span>`).join('')}${d.events.length>2?`<small>+${d.events.length-2}</small>`:''}</div>`).join('');
    const timeline = integratedSchedule.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(ev=>`<div class="timeline-item ${eventClass(ev)} ${ev.completed?'completed-fixture':''}">
      <div class="fixture-date"><strong>${ev.date.slice(8,10)}</strong><small>${ev.day}</small></div>
      <div class="fixture-main"><strong>${eventTitle(ev)} ${ev.result ? '· '+ev.result : ''}</strong><span>${ev.competition} · ${ev.stage}</span><small>${ev.venue}</small></div>
      <div class="status-pill">${ev.status}</div>
    </div>`).join('');
    return `<section class="calendar-v070">
      <div class="panel championship-hero"><div><span class="tag">Maio · Temporada ${state.season || 2026}</span><h1>Calendário completo</h1><p class="small">Agenda com partidas, treinos, reuniões, mercado e eventos de imprensa. Esta tela já nasce preparada para puxar temporadas completas nas próximas builds.</p></div><button class="secondary-btn" data-route="championship">Ver competições</button></div>
      <section class="grid grid-2 calendar-layout"><article class="panel"><div class="row space"><h2>Visão mensal</h2><span class="tag">31 dias</span></div><div class="calendar-weekdays"><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span></div><div class="calendar-grid-full">${dayCells}</div></article>
      <article class="panel"><div class="row space"><div><span class="tag">Linha do tempo</span><h2>Compromissos do mês</h2></div><strong class="grade">${integratedSchedule.length}</strong></div><div class="timeline-list">${timeline}</div></article></section>
      <section class="grid desktop-4"><div class="card kpi-card"><span>Jogos oficiais</span><strong>${integratedSchedule.filter(e=>e.type==='match').length}</strong><small>partidas no mês</small></div><div class="card kpi-card"><span>Treinos</span><strong>${integratedSchedule.filter(e=>e.type==='training').length}</strong><small>sessões planejadas</small></div><div class="card kpi-card"><span>Decisões</span><strong>${integratedSchedule.filter(e=>e.importance>=90).length}</strong><small>alta pressão</small></div><div class="card kpi-card"><span>Viagens</span><strong>${integratedSchedule.filter(e=>e.type==='match' && e.awayId===(state.clubId||'santos')).length}</strong><small>fora de casa</small></div></section>
    </section>`;
  }
  if(route==='club') {
    const t = teams.find(x => x.id === state.clubId) || teams[0];
    const boardTrust = Number(state.boardTrust || 76);
    const fanMood = Number(state.fanMood || 82);
    const structure = [
      ['Centro de treinamento','78','Base técnica sólida, ainda com espaço para modernização.'],
      ['Categorias de base','84','Tradição forte em formação e venda de talentos.'],
      ['Departamento médico','71','Precisa melhorar recuperação e prevenção de lesões.'],
      ['Análise de desempenho','68','Área preparada para evolução nas próximas temporadas.'],
      ['Comercial/marketing','74','Potencial de crescimento com patrocínios e resultados.']
    ];
    const trophyShelf = ['Nacionais','Copas','Continentais','Base'].map((label,i)=>`<div class="club-trophy"><span>${['🏆','🥇','🌎','⭐'][i]}</span><strong>${label}</strong><small>histórico preparado</small></div>`).join('');
    const competitions = (t.competitions || []).map(c=>`<span class="chip">${c}</span>`).join('');
    return `<section class="club-dashboard-v060">
      <div class="panel club-hero-panel">
        <div class="club-hero-bg" style="background-image:url('${stadium(t.id)}')"></div>
        <div class="club-hero-content">
          <div class="club-mark-xl">${safeImg(clubLogo(t.id),'club',t.name,'club-logo xl')}</div>
          <div class="club-title-block">
            <span class="tag">Resumo institucional</span>
            <h1>${t.name}</h1>
            <p class="small">${safeImg(country(t.country),'country',t.countryName,'inline-flag')} ${t.countryName} · ${t.league} · Estádio: ${t.stadium}</p>
            <div class="competition-row">${competitions}</div>
          </div>
          <div class="club-score-block">
            <span>Reputação</span>
            <strong>${t.reputation}</strong>
            <div class="meter"><span style="width:${t.reputation}%"></span></div>
          </div>
        </div>
      </div>

      <section class="grid desktop-4 club-kpi-grid">
        <div class="card kpi-card"><span>Valor do clube/elenco</span><strong>€ ${Number(t.value || 0).toFixed(1)}M</strong><small>base econômica atual</small></div>
        <div class="card kpi-card"><span>Orçamento</span><strong>€ ${Number(t.budget || 0).toFixed(1)}M</strong><small>transferências + operação</small></div>
        <div class="card kpi-card"><span>Força esportiva</span><strong>${t.level}</strong><div class="meter"><span style="width:${t.level}%"></span></div></div>
        <div class="card kpi-card"><span>Dificuldade</span><strong>${t.difficulty}</strong><small>pressão da carreira</small></div>
      </section>

      <section class="grid grid-2">
        <article class="panel board-panel">
          <div class="row space"><div><span class="tag">Diretoria</span><h2>Metas e avaliação</h2></div><strong class="grade">${boardTrust}%</strong></div>
          <p>${t.board}</p>
          <div class="meter tall"><span style="width:${boardTrust}%"></span></div>
          <div class="board-objectives">
            <div class="objective ok"><strong>Meta esportiva</strong><span>${t.board}</span></div>
            <div class="objective"><strong>Meta financeira</strong><span>Manter folha salarial controlada e evitar saldo negativo.</span></div>
            <div class="objective"><strong>Meta de elenco</strong><span>Valorizar jogadores jovens e manter moral acima de 70%.</span></div>
            <div class="objective"><strong>Risco no cargo</strong><span>${state.jobSecurity || 'Seguro'} · acompanha resultados, torcida e caixa.</span></div>
          </div>
        </article>

        <article class="panel fan-panel">
          <div class="row space"><div><span class="tag">Torcida</span><h2>Clima social</h2></div><strong class="grade">${fanMood}%</strong></div>
          <div class="meter tall"><span style="width:${fanMood}%"></span></div>
          <div class="news-list compact">
            <div class="news-item"><strong>Expectativa</strong><span>Competir com identidade ofensiva e bom desempenho em casa.</span></div>
            <div class="news-item"><strong>Pressão</strong><span>Clássicos, sequência sem vitória e eliminações podem derrubar confiança.</span></div>
            <div class="news-item"><strong>Oportunidade</strong><span>Boa campanha aumenta patrocínio, público e reputação do manager.</span></div>
          </div>
        </article>
      </section>

      <section class="grid grid-2">
        <article class="panel">
          <div class="row space"><div><span class="tag">Estrutura</span><h2>Departamentos do clube</h2></div><button class="secondary-btn mini" data-route="staff">Staff</button></div>
          <div class="structure-list">
            ${structure.map(([name,score,desc])=>`<div class="structure-row"><div><strong>${name}</strong><small>${desc}</small></div><span>${score}</span><div class="meter"><span style="width:${score}%"></span></div></div>`).join('')}
          </div>
        </article>
        <article class="panel">
          <div class="row space"><div><span class="tag">História</span><h2>Sala de troféus</h2></div><button class="secondary-btn mini" data-route="championship">Competições</button></div>
          <div class="trophy-grid">${trophyShelf}</div>
          <p class="alert">A vitrine histórica usa dados preparados agora e será conectada a conquistas reais da carreira nas próximas builds.</p>
        </article>
      </section>

      <section class="grid grid-2">
        <article class="panel">
          <div class="row space"><div><span class="tag">Finanças resumidas</span><h2>Controle executivo</h2></div><button class="secondary-btn mini" data-route="finances">Abrir financeiro</button></div>
          <div class="stat-line"><span>Saldo operacional</span><strong>€ ${Number(t.budget || 0).toFixed(1)}M</strong></div>
          <div class="stat-line"><span>Receita projetada</span><strong>€ ${(Number(t.value||0)*0.62).toFixed(1)}M</strong></div>
          <div class="stat-line"><span>Folha salarial estimada</span><strong>€ ${(Number(t.value||0)*0.043).toFixed(1)}M</strong></div>
          <div class="stat-line"><span>Saúde financeira</span><strong>${(t.budget || 0) > 90 ? 'Forte' : 'Controlada'}</strong></div>
        </article>
        <article class="panel">
          <div class="row space"><div><span class="tag">Identidade esportiva</span><h2>Plano do manager</h2></div><button class="secondary-btn mini" data-route="formation">Tática</button></div>
          <div class="stat-line"><span>Modelo inicial</span><strong>4-3-3 ofensivo</strong></div>
          <div class="stat-line"><span>DNA desejado</span><strong>Posse, pressão e base</strong></div>
          <div class="stat-line"><span>Prioridade da semana</span><strong>Treino de criação</strong></div>
          <button class="main-btn" data-route="lobby">Voltar ao lobby operacional</button>
        </article>
      </section>
    </section>`;
  }

  if(route==='finances') return `<section class="grid grid-2"><div class="panel"><h3>Orçamento do clube</h3><div class="stat-line"><span>Saldo disponível</span><strong>€ 92.5M</strong></div><div class="stat-line"><span>Folha salarial mensal</span><strong>€ 5.32M</strong></div><div class="stat-line"><span>Receita projetada</span><strong>€ 128.4M</strong></div><div class="stat-line"><span>Risco financeiro</span><strong>Baixo</strong></div></div><div class="panel"><h3>Diretoria financeira</h3><p class="alert">Build v0.5 prepara o painel para que patrocínio, mercado e premiações influenciem o caixa nas próximas fases.</p><button class="main-btn" data-route="sponsorship">Ver patrocínios</button></div></section>`;
  if(route==='contracts') {
    const alerts = contractAlerts.map(a=>`<div class="contract-alert-row"><div><strong>${a.player}</strong><small>${a.type} · ${a.action}</small></div><b>${a.months} meses</b><button class="secondary-btn mini">Analisar</button></div>`).join('');
    const wageRisk = squadPlayers.filter(p=>p.salary>200).map(p=>`<div class="stat-line"><span>${p.name}</span><strong>€ ${p.salary}k/mês</strong></div>`).join('');
    return `<section class="contracts-v090"><div class="panel contract-hero"><div><span class="tag">Contratos e folha salarial</span><h1>Controle do elenco</h1><p class="small">Módulo preparado para renovação, venda, empréstimo, liberação e pressão salarial. Todos os jogadores funcionam com foto genérica até você subir as imagens reais.</p></div><button class="main-btn" data-route="transfers">Abrir mercado</button></div><section class="grid desktop-4"><div class="card kpi-card"><span>Folha mensal</span><strong>€ ${(squadSummary.monthlyWages/1000).toFixed(2)}M</strong><small>estimativa atual</small></div><div class="card kpi-card"><span>Risco contratual</span><strong>${squadSummary.contractRisk}</strong><small>jogadores em alerta</small></div><div class="card kpi-card"><span>Valor do elenco</span><strong>€ ${squadSummary.totalValue.toFixed(1)}M</strong><small>base inicial</small></div><div class="card kpi-card"><span>Espaço salarial</span><strong>€ 1.8M</strong><small>margem segura</small></div></section><section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Alertas</span><h2>Contratos próximos do fim</h2></div><strong class="grade">${contractAlerts.length}</strong></div><div class="contract-alert-list">${alerts}</div></article><article class="panel"><div class="row space"><div><span class="tag">Folha</span><h2>Maiores salários</h2></div><span class="status-pill">Anti-quebra ativo</span></div>${wageRisk}<p class="alert">O sistema de renovação será ligado ao mercado nas próximas builds. Nesta versão, a leitura de risco já orienta as decisões do manager.</p></article></section></section>`;
  }
  if(route==='squad') {
    const tacticalReport = evaluateTactic(squadPlayers, state.ui?.selectedFormation || '433-possession', state.ui?.tacticalProfile || 'possession');
    const lineup = tacticalReport.lineup;
    const captain = squadPlayers.find(p=>p.id===state.ui?.captainId) || recommendedCaptain(squadPlayers) || squadPlayers[0];
    const takers = recommendedSetPieceTakers(squadPlayers);
    const playerOptions = squadPlayers.map(p=>`<option value="${p.id}" ${p.id===captain?.id?'selected':''}>${p.name} · ${p.pos} · ${p.overall}</option>`).join('');
    const penaltyOptions = squadPlayers.map(p=>`<option value="${p.id}" ${p.id===(state.ui?.penaltyTakerId||takers.penalty?.id)?'selected':''}>${p.name} · ${p.pos} · ${p.overall}</option>`).join('');
    const freeOptions = squadPlayers.map(p=>`<option value="${p.id}" ${p.id===(state.ui?.freeKickTakerId||takers.freeKick?.id)?'selected':''}>${p.name} · ${p.pos} · ${p.overall}</option>`).join('');
    const cornerOptions = squadPlayers.map(p=>`<option value="${p.id}" ${p.id===(state.ui?.cornerTakerId||takers.corner?.id)?'selected':''}>${p.name} · ${p.pos} · ${p.overall}</option>`).join('');
    const alerts = squadAlerts(squadPlayers, state.ui?.selectedFormation || '433-possession').map(a=>`<div class="squad-alert ${a.type}"><div><strong>${a.title}</strong><small>${a.detail}</small></div><span>${a.level}</span><div class="meter"><span style="width:${a.level}%"></span></div></div>`).join('');
    const startersHtml = lineup.starters.map(s=>`<div class="lineup-row realism-row"><div>${safeImg(s.player.photo,'player',s.player.name,'mini-face')}<span><strong>${s.player.name}</strong><small>${roleLabel(s.slot.role)} · ${s.player.pos} · encaixe ${s.compatibility}%</small></span></div><b>${s.score}</b><em>${s.readiness}%</em></div>`).join('');
    const benchHtml = lineup.bench.slice(0,10).map(p=>`<div class="bench-chip">${safeImg(p.photo,'player',p.name,'mini-face')}<span>${p.name}</span><b>${p.overall}</b></div>`).join('');
    const rows = squadPlayers.map(p=>`<tr><td><div class="player-cell">${safeImg(p.photo,'player',p.name,'player-face mini-face')}<div><strong>${p.name}</strong><small>${p.role} · ${safeImg(country(p.nationality),'country',p.nationality,'inline-flag')}</small></div></div></td><td>${p.pos}</td><td><strong>${p.overall}</strong></td><td>${p.potential}</td><td>${p.age}</td><td>${p.morale}%</td><td>${p.fitness}%</td><td>${p.form}%</td><td>€ ${p.value.toFixed(1)}M</td><td>${p.contract}m</td></tr>`).join('');
    const needsHtml = squadNeeds.map(n=>`<div class="need-row"><div><strong>${n.sector}</strong><small>${n.reason}</small></div><span>${n.urgency}</span><div class="meter"><span style="width:${n.urgency}%"></span></div></div>`).join('');
    return `<section class="squad-v090 squad-v290"><div class="panel squad-hero"><div><span class="tag">Elenco v2.9 · realidade esportiva</span><h1>Plantel vivo</h1><p class="small">Agora o elenco calcula posição natural, improvisação, prontidão, moral, forma, capitão, bolas paradas, rotação e risco antes da partida.</p></div><div class="row gap"><button class="secondary-btn" data-action="apply-rotation">Aplicar rotação</button><button class="main-btn" data-route="formation">Mesa tática</button></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Nota tática</span><strong>${tacticalReport.grade}</strong><small>média do plano</small></div><div class="card kpi-card"><span>Encaixe posicional</span><strong>${tacticalReport.fit}%</strong><div class="meter"><span style="width:${tacticalReport.fit}%"></span></div></div><div class="card kpi-card"><span>Prontidão</span><strong>${tacticalReport.readiness}%</strong><div class="meter"><span style="width:${tacticalReport.readiness}%"></span></div></div><div class="card kpi-card"><span>Risco físico</span><strong>${tacticalReport.fatigueRisk}%</strong><div class="meter"><span style="width:${tacticalReport.fatigueRisk}%"></span></div></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Onze ideal calculado</span><h2>${lineup.formation.name}</h2></div><button class="secondary-btn mini" data-action="auto-lineup">Recalcular</button></div><div class="lineup-list">${startersHtml}</div></article><article class="panel"><div class="row space"><div><span class="tag">Banco e rotação</span><h2>Opções reais</h2></div><strong class="grade">${lineup.bench.length}</strong></div><div class="bench-list">${benchHtml}</div><div class="squad-alert-list">${alerts}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Liderança</span><h2>Capitão e bolas paradas</h2></div><span class="status-pill">Salvo</span></div><label class="form-label">Capitão<select class="select" data-action="set-captain">${playerOptions}</select></label><label class="form-label">Pênaltis<select class="select" data-action="set-setpiece" data-kind="penalty">${penaltyOptions}</select></label><label class="form-label">Faltas<select class="select" data-action="set-setpiece" data-kind="freekick">${freeOptions}</select></label><label class="form-label">Escanteios<select class="select" data-action="set-setpiece" data-kind="corner">${cornerOptions}</select></label></article><article class="panel"><div class="row space"><div><span class="tag">Planejamento</span><h2>Necessidades do elenco</h2></div><button class="secondary-btn mini" data-route="transfers">Mercado</button></div><div class="needs-list">${needsHtml}</div></article></section>
    <section class="panel table-panel"><div class="row space"><div><span class="tag">Elenco completo</span><h2>Jogadores, moral, forma, contrato e prontidão</h2></div><span class="status-pill">${squadPlayers.length} atletas</span></div><div class="table-scroll"><table class="table squad-table"><thead><tr><th>Jogador</th><th>Pos</th><th>GER</th><th>POT</th><th>Idade</th><th>Moral</th><th>Cond.</th><th>Forma</th><th>Valor</th><th>Contrato</th></tr></thead><tbody>${rows}</tbody></table></div></section></section>`;
  }


  if(route==='settings') return `<section class="grid grid-2"><div class="panel"><h3>Geral</h3>${['Salvar automaticamente','Dicas','Negociações realistas','Lesões','Progresso offline'].map(x=>`<div class="stat-line"><span>${x}</span><strong>Ativo</strong></div>`).join('')}<button class="main-btn" data-route="saveCenter">Central de save</button><button class="secondary-btn danger" data-action="reset-save">Resetar save</button></div><div class="panel"><h3>Qualidade</h3><p class="alert">Build anti-quebra v2.2: fallbacks de assets, rotas seguras, salvamento local protegido, backups manuais, exportação/importação e auditoria de arquivos.</p></div></section>`;
  return `<section class="module-placeholder panel"><h1>Módulo preparado</h1><p class="subtitle">Esta tela já possui rota segura e será expandida nas próximas builds.</p><button class="main-btn" data-route="lobby">Voltar ao lobby</button></section>`;
}


function rosterUpdateScreen(state={}, squadPlayers=[], squadSummary={}, rosterMeta={}){
  const sample = {
    meta:{clubId:'santos', season:2026, version:'meu-elenco-v1', updatedAt:'2026-05-19'},
    players:squadPlayers.slice(0,3).map(p=>({id:p.id,name:p.name,pos:p.pos,overall:p.overall,potential:p.potential,age:p.age,nationality:p.nationality,shirt:p.shirt,photo:p.photo,value:p.value,salary:p.salary,contract:p.contract,status:p.status}))
  };
  const rows = squadPlayers.slice(0,12).map(p=>`<tr><td><div class="player-cell">${safeImg(p.photo,'player',p.name,'player-face mini-face')}<div><strong>${p.name}</strong><small>${p.id} · ${p.status || 'Elenco'}</small></div></div></td><td>${p.pos}</td><td>${p.overall}</td><td>${p.age}</td><td><code>${p.photo}</code></td></tr>`).join('');
  const sampleText = JSON.stringify(sample,null,2).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
  return `<section class="roster-v251">
    <div class="panel asset-hero"><div><span class="tag">Elencos v2.5.1</span><h1>Central de Atualização de Elenco</h1><p class="small">Atualize jogadores por JSON sem mexer no código. O jogo valida campos, impede elenco com menos de 11 atletas, remove IDs duplicados e usa foto genérica se o avatar do jogador ainda não existir.</p></div><div class="asset-hero-kpis"><strong>${squadPlayers.length}</strong><span>atletas ativos</span><small>${rosterMeta.version || 'base interna'}</small></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Overall médio</span><strong>${squadSummary.averageOverall}</strong><small>recalculado automaticamente</small></div><div class="card kpi-card"><span>Idade média</span><strong>${squadSummary.averageAge}</strong><small>plantel ativo</small></div><div class="card kpi-card"><span>Valor total</span><strong>€ ${Number(squadSummary.totalValue||0).toFixed(1)}M</strong><small>somatório do JSON</small></div><div class="card kpi-card"><span>Risco contratos</span><strong>${squadSummary.contractRisk}</strong><small>contratos até 12 meses</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Importar</span><h2>Cole um JSON de elenco</h2></div><button class="main-btn mini" data-action="roster-import">Importar com segurança</button></div><textarea id="rosterImportBox" class="save-textarea roster-box" placeholder='Cole aqui { "meta": {...}, "players": [...] }'></textarea><p class="alert">Importação inválida não quebra o jogo: ela é recusada e o elenco atual continua intacto.</p></article><article class="panel"><div class="row space"><div><span class="tag">Exportar</span><h2>Copiar elenco ativo</h2></div><button class="secondary-btn mini" data-action="roster-export">Gerar JSON</button></div><textarea id="rosterExportBox" class="save-textarea roster-box" placeholder="Clique em Gerar JSON para copiar o elenco atual."></textarea><button class="secondary-btn mini danger" data-action="roster-reset">Restaurar elenco base 2026</button></article></section>
    <section class="panel table-panel"><div class="row space"><div><span class="tag">Prévia</span><h2>Jogadores ativos e caminhos de foto</h2></div><span class="status-pill">Fallback de avatar ativo</span></div><div class="table-scroll"><table class="table squad-table"><thead><tr><th>Jogador</th><th>Pos</th><th>GER</th><th>Idade</th><th>Foto reconhecida pelo jogo</th></tr></thead><tbody>${rows}</tbody></table></div><p class="alert">Para adicionar avatar depois, suba a imagem em exatamente: <code>assets/players/brazil/santos/id-do-jogador.png</code>. Exemplo: <code>assets/players/brazil/santos/neymar.png</code>.</p></section>
    <section class="panel"><div class="row space"><div><span class="tag">Modelo rápido</span><h2>Exemplo aceito pelo importador</h2></div><button class="secondary-btn mini" data-action="roster-sample">Inserir exemplo</button></div><pre class="code-block">${sampleText}</pre></section>
  </section>`;
}


function assetChecklistScreen(state={}){
  const summary = assetStatusSummary();
  const manifest = flattenAssetMap();
  const priority = [
    ['Fundos principais', 'assets/backgrounds/bg-cover.jpg', 'assets/backgrounds/bg-lobby.jpg', 'assets/backgrounds/bg-match.jpg'],
    ['Clube escolhido', `assets/clubs/brazil/${state.clubId || 'santos'}/logo.png`, `assets/stadiums/brazil/${state.clubId || 'santos'}.jpg`, `assets/clubs/brazil/${state.clubId || 'santos'}/home-kit.png`],
    ['Jogadores', 'assets/players/brazil/santos/joao-paulo.png', 'assets/players/brazil/santos/giuliano.png', 'assets/players/brazil/santos/guilherme.png'],
    ['Bandeiras', 'assets/countries/br.png', 'assets/countries/ar.png', 'assets/countries/gb.png'],
    ['Patrocinadores', 'assets/sponsors/umbro.png', 'assets/sponsors/binance.png', 'assets/sponsors/pixbet.png']
  ];
  const groups = priority.map(([title,...paths])=>`<article class="asset-check-card"><div class="row space"><h3>${title}</h3><span class="tag">fallback ativo</span></div>${paths.map(p=>`<div class="asset-path-row"><code>${p}</code><span>se ausente: protegido</span></div>`).join('')}</article>`).join('');
  const folders = Object.entries(summary.byFolder || {}).sort((a,b)=>b[1]-a[1]).map(([folder,count])=>`<div class="stat-line"><span>${folder}</span><strong>${count}</strong></div>`).join('');
  const samples = manifest.slice(0,80).map(item=>`<tr><td>${item.key}</td><td><code>${item.path}</code></td></tr>`).join('');
  return `<section class="asset-v230">
    <div class="panel asset-hero"><div><span class="tag">Assets v2.3.0</span><h1>Checklist visual e caminhos oficiais</h1><p class="small">O jogo agora carrega imagens por caminhos padronizados, usa cache seguro, protege imagens quebradas e mantém fallback inteligente para clubes, jogadores, bandeiras, ligas, estádios, patrocinadores, staff e fundos.</p></div><div class="asset-hero-kpis"><strong>${summary.total}</strong><span>caminhos mapeados</span><small>${summary.fallbacks} fallbacks obrigatórios</small></div></div>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Resumo</span><h2>Manifesto de imagens</h2></div><span class="status-pill">Cache: ${summary.cached}</span></div>${folders}<p class="alert">Você pode adicionar imagens no GitHub usando exatamente estes caminhos. Se a imagem não existir, o jogo usa placeholder automaticamente sem quebrar a tela.</p></article><article class="panel"><div class="row space"><div><span class="tag">Fallbacks</span><h2>Proteção anti-imagem quebrada</h2></div><span class="status-pill">Ativo</span></div><div class="asset-fallback-grid">${['club','player','country','stadium','background','sponsor','staff','competition'].map(t=>`<div>${safeImg(fallback(t), t, t, 'asset-fallback-icon')}<span>${t}</span></div>`).join('')}</div></article></section>
    <section class="asset-check-grid">${groups}</section>
    <section class="panel table-panel"><div class="row space"><div><span class="tag">Mapa técnico</span><h2>Primeiros caminhos reconhecidos</h2></div><button class="secondary-btn mini" data-route="settings">Configurações</button></div><div class="table-scroll"><table class="table"><thead><tr><th>Chave</th><th>Caminho</th></tr></thead><tbody>${samples}</tbody></table></div></section>
  </section>`;
}

function saveCenterScreen(state={}){
  const stability = state.stability || {};
  const checklist = stabilityChecklist.map(item=>`<div class="stat-line"><span><strong>${item.area}</strong><small>${item.detail}</small></span><b>${item.status}</b></div>`).join('');
  const policies = savePolicies.map(p=>`<li>${p}</li>`).join('');
  const slots = [1,2,3].map(slot=>`<article class="candidate-card"><div><span class="tag">Backup ${slot}</span><h3>Slot seguro ${slot}</h3><p>Grave uma cópia manual antes de subir assets, testar builds novas ou publicar no GitHub/Vercel.</p></div><div class="candidate-side"><button class="main-btn mini" data-action="save-backup" data-slot="${slot}">Criar</button><button class="secondary-btn mini" data-action="save-restore" data-slot="${slot}">Restaurar</button></div></article>`).join('');
  return `<section class="save-center-v220">
    <div class="panel championship-hero"><div><span class="tag">Estabilidade AAA v2.2</span><h1>Central de Save e Proteção</h1><p class="small">Esta fase reforça a segurança da carreira para você poder evoluir o jogo sem testar cada build no momento: autosave, backups, exportação, importação e modo seguro.</p></div><strong class="grade">${stability.health || 'Excelente'}</strong></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Autosave</span><strong>${stability.autosave ? 'Ativo' : 'Pausado'}</strong><button class="secondary-btn mini" data-action="toggle-autosave">Alternar</button></div><div class="card kpi-card"><span>Backups</span><strong>${stability.backupCount || 0}</strong><small>criados nesta carreira</small></div><div class="card kpi-card"><span>Último backup</span><strong>${stability.lastBackup ? 'OK' : 'Nenhum'}</strong><small>${stability.lastBackup || 'crie antes de publicar'}</small></div><div class="card kpi-card"><span>Auditoria</span><strong>${stability.auditVersion || 'v2.2.0'}</strong><small>proteção ativa</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Backups manuais</span><h2>Slots de carreira</h2></div><button class="secondary-btn mini" data-route="lobby">Lobby</button></div><div class="candidate-list">${slots}</div></article><article class="panel"><div class="row space"><div><span class="tag">Checklist técnico</span><h2>Anti-quebra</h2></div><strong class="grade">8/8</strong></div>${checklist}</article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Exportar</span><h2>Guardar save fora do navegador</h2></div><button class="main-btn mini" data-action="save-export">Gerar JSON</button></div><textarea id="saveExportBox" class="save-textarea" placeholder="Clique em Gerar JSON e copie o texto para guardar."></textarea></article><article class="panel"><div class="row space"><div><span class="tag">Importar</span><h2>Restaurar por JSON</h2></div><button class="secondary-btn mini" data-action="save-import">Importar</button></div><textarea id="saveImportBox" class="save-textarea" placeholder="Cole aqui o JSON exportado anteriormente."></textarea></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Política de estabilidade</span><h2>Regras da build</h2></div><strong class="grade">AAA SAFE</strong></div><ul class="policy-list">${policies}</ul><p class="alert">Importação inválida não derruba o jogo: ela é bloqueada, registrada e o save atual continua protegido.</p></section>
  </section>`;
}

function aiBalanceScreen(state={}){
  const active = state.gameplay?.difficulty || 'realistic';
  const profiles = difficultyProfiles.map(p=>`<article class="candidate-card ${p.id===active?'selected':''}"><div><span class="tag">${p.name}</span><h3>${p.realism}% realismo</h3><p>${p.description}</p><small>Pressão da diretoria ${p.boardPressure}% · Mercado ${p.transferStrictness}% · Variação ${p.variance}%</small></div><div class="candidate-side"><strong>${p.id===active?'ATIVO':'OK'}</strong><button class="secondary-btn mini" data-action="safe-toast" data-message="Perfil ${p.name} preparado. Troca real de dificuldade será ligada na build de integração total.">Ver</button></div></article>`).join('');
  const weights = Object.entries(aiWeights).map(([k,v])=>`<div class="department-kpi"><div class="row space"><span>${labelWeight(k)}</span><strong>${v}%</strong></div><div class="meter"><span style="width:${v}%"></span></div></div>`).join('');
  const leagues = leaguePaceProfiles.map(l=>`<tr><td><strong>${l.name}</strong></td><td>${l.tempo}</td><td>${l.physicality}</td><td>${l.parity}</td><td>${l.cardRisk}</td></tr>`).join('');
  const diagnostics = balanceDiagnostics.map(d=>`<div class="need-row"><div><strong>${d.label}</strong><small>${d.note}</small></div><span>${d.value}</span><div class="meter"><span style="width:${d.value}%"></span></div></div>`).join('');
  const notes = aiTuningNotes.map(n=>`<li>${n}</li>`).join('');
  const logs = (state.gameplay?.balanceLog || []).slice(-5).reverse().map(x=>`<div class="news-item"><strong>${x.result}</strong><span>${(x.report||[]).join(' · ')}</span></div>`).join('') || '<p class="muted">Nenhuma partida finalizada com o motor v1.9 ainda.</p>';
  return `<section class="ai-balance-v190">
    <div class="panel standings-hero"><div><span class="tag">IA e balanceamento v1.9</span><h1>Motor esportivo realista</h1><p class="small">Esta build adiciona uma camada de inteligência para deixar resultados, estatísticas, mando de campo, decisões táticas, moral e variação mais coerentes. Tudo mantém fallback seguro para não quebrar saves antigos.</p></div><strong class="grade">${active.toUpperCase()}</strong></div>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Dificuldade</span><h2>Perfis de simulação</h2></div><button class="secondary-btn mini" data-route="match">Testar em partida</button></div><div class="candidate-list">${profiles}</div></article><article class="panel"><div class="row space"><div><span class="tag">Pesos da IA</span><h2>Como o resultado é calculado</h2></div><strong class="grade">100%</strong></div>${weights}</article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Diagnóstico</span><h2>Coerência esportiva</h2></div><span class="status-pill">Anti-quebra ativo</span></div><div class="needs-list">${diagnostics}</div></article><article class="panel"><div class="row space"><div><span class="tag">Últimas partidas</span><h2>Log do balanceamento</h2></div><button class="secondary-btn mini" data-route="standings">Classificação</button></div><div class="news-list">${logs}</div><ul class="small-list">${notes}</ul></article></section>
    <section class="panel table-panel"><div class="row space"><div><span class="tag">Ritmo por competição</span><h2>Perfis de liga preparados</h2></div><span class="status-pill">v1.9.0</span></div><div class="table-scroll"><table class="table"><thead><tr><th>Competição</th><th>Ritmo</th><th>Físico</th><th>Equilíbrio</th><th>Cartões</th></tr></thead><tbody>${leagues}</tbody></table></div></section>
  </section>`;
}
function labelWeight(key){
  return {squadQuality:'Qualidade do elenco', tacticalFit:'Encaixe tático', morale:'Moral', fitness:'Condição física', homeAdvantage:'Mando de campo', form:'Forma recente', staff:'Staff', randomness:'Variação controlada'}[key] || key;
}

function staffScreen(state={}){
  const usedPct = Math.round((staffBudget.used / staffBudget.monthlyLimit) * 100);
  const current = currentStaff.map(s=>`<article class="staff-card">
    ${safeImg(s.photo,'staff',s.name,'staff-photo')}
    <div><span class="tag">${s.role}</span><h3>${s.name}</h3><p>${s.effect}</p><small>Salário mensal: ${money(s.salary)}</small></div>
    <strong class="grade">${s.grade}</strong>
    <div class="meter"><span style="width:${s.impact}%"></span></div>
  </article>`).join('');
  const candidates = staffCandidates.map(c=>`<article class="candidate-card">
    <div><span class="tag">${c.role} · ${c.country}</span><h3>${c.name}</h3><p>${c.style}</p><small>${c.bonus}</small></div>
    <div class="candidate-side"><strong>${c.grade}</strong><span>${money(c.salary)}/mês</span><em>${c.fit}% encaixe</em><button class="secondary-btn mini" data-action="safe-toast" data-message="Negociação de staff preparada para build financeira.">Analisar</button></div>
  </article>`).join('');
  const kpis = staffDepartmentKpis.map(k=>`<div class="department-kpi"><div class="row space"><span>${k.label}</span><strong>${k.value}</strong></div><div class="meter"><span style="width:${k.value}%"></span></div><small>${k.status}</small></div>`).join('');
  return `<section class="staff-v120">
    <div class="panel staff-hero"><div><span class="tag">Staff e departamento</span><h1>Comissão técnica profissional</h1><p class="small">Controle treinadores auxiliares, médico, fisioterapeuta, preparador físico, olheiro, analista e diretor comercial. Tudo com fallback de imagem e preparado para contratação real em builds futuras.</p></div><button class="main-btn" data-route="training">Ver impacto no treino</button></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Orçamento mensal</span><strong>${money(staffBudget.monthlyLimit)}</strong><small>${usedPct}% utilizado</small></div><div class="card kpi-card"><span>Disponível</span><strong>${money(staffBudget.remaining)}</strong><small>Margem para contratação</small></div><div class="card kpi-card"><span>Confiança da diretoria</span><strong>${staffBudget.boardConfidence}%</strong><small>${staffBudget.departmentLevel}</small></div><div class="card kpi-card"><span>Recomendação</span><strong>Olheiro</strong><small>Prioridade estratégica</small></div></section>
    <section class="grid grid-2 staff-layout"><article class="panel"><div class="row space"><div><span class="tag">Equipe atual</span><h2>Departamentos do clube</h2></div><span class="status-pill">Anti-quebra ativo</span></div><div class="staff-list">${current}</div></article><article class="panel"><div class="row space"><div><span class="tag">Contratações possíveis</span><h2>Mercado de staff</h2></div><strong class="grade">6 alvos</strong></div><div class="candidate-list">${candidates}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Diagnóstico interno</span><h2>Qualidade por departamento</h2></div><button class="secondary-btn mini" data-route="club">Ver clube</button></div><div class="department-grid">${kpis}</div><div class="training-note"><strong>Diretoria:</strong> ${staffBudget.recommendation}</div></section>
  </section>`;
}

function sponsorshipScreen(state={}){
  const targetPct = Math.round((sponsorsOverview.annualRevenue / sponsorsOverview.boardTarget) * 100);
  const active = activeSponsors.map(s=>`<article class="sponsor-card active-sponsor">
    ${safeImg(s.logo,'sponsor',s.name,'sponsor-logo')}
    <div><span class="tag">${s.slot}</span><h3>${s.name}</h3><p>${s.bonus}</p><small>Contrato até ${s.contract} · ${s.status}</small></div>
    <strong>${money(s.value)}</strong>
  </article>`).join('');
  const proposals = sponsorProposals.map(s=>`<article class="sponsor-card proposal-sponsor">
    ${safeImg(s.logo,'sponsor',s.name,'sponsor-logo')}
    <div><span class="tag">${s.slot}</span><h3>${s.name}</h3><p>${s.bonus}</p><small>${s.demand}</small></div>
    <div class="candidate-side"><strong>${money(s.value)}</strong><em>${s.fit}% encaixe</em><button class="secondary-btn mini" data-action="safe-toast" data-message="Proposta comercial registrada para negociação futura.">Negociar</button></div>
  </article>`).join('');
  const finance = financeSnapshot.map(f=>`<div class="finance-mini"><span>${f.label}</span><strong>${f.value}</strong><small>${f.trend}</small></div>`).join('');
  return `<section class="sponsorship-v120">
    <div class="panel sponsorship-hero"><div><span class="tag">Patrocínio e financeiro</span><h1>Receita comercial do clube</h1><p class="small">Gestão de patrocinadores ativos, propostas comerciais, exposição de marca, bônus por performance e impacto direto no orçamento de transferências.</p></div><button class="main-btn" data-route="finances">Abrir financeiro</button></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Receita anual</span><strong>${money(sponsorsOverview.annualRevenue)}</strong><small>${targetPct}% da meta da diretoria</small></div><div class="card kpi-card"><span>Potencial disponível</span><strong>${money(sponsorsOverview.availableBoost)}</strong><small>Propostas em aberto</small></div><div class="card kpi-card"><span>Exposição</span><strong>${sponsorsOverview.exposure}%</strong><small>Marca em crescimento</small></div><div class="card kpi-card"><span>Espaços de camisa</span><strong>${sponsorsOverview.filledSlots}/${sponsorsOverview.shirtSlots}</strong><small>Slots preenchidos</small></div></section>
    <section class="grid grid-2 sponsorship-layout"><article class="panel"><div class="row space"><div><span class="tag">Contratos ativos</span><h2>Patrocinadores atuais</h2></div><span class="status-pill">Fallback PNG</span></div><div class="sponsor-list">${active}</div></article><article class="panel"><div class="row space"><div><span class="tag">Propostas</span><h2>Novas receitas</h2></div><strong class="grade">${money(sponsorsOverview.availableBoost)}</strong></div><div class="sponsor-list">${proposals}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Painel executivo</span><h2>Resumo financeiro</h2></div><button class="secondary-btn mini" data-route="transfers">Mercado</button></div><div class="finance-grid">${finance}</div><div class="training-note"><strong>Risco comercial:</strong> ${sponsorsOverview.risk}</div></section>
  </section>`;
}


function messagesScreen(state={}){
  const unread = inboxMessages.filter(m=>m.status==='Novo').length;
  const important = inboxMessages.filter(m=>m.priority==='Alta').length;
  const list = inboxMessages.map(m=>`<article class="mail-card ${m.status==='Novo'?'unread':''}">
    <div class="mail-icon">${m.type.slice(0,2).toUpperCase()}</div>
    <div class="mail-body"><div class="row space"><span class="tag">${m.type} · ${m.priority}</span><small>${m.date}</small></div><h3>${m.subject}</h3><p>${m.body}</p><small>De: ${m.from}</small></div>
    <button class="secondary-btn mini" data-route="${m.route}">${m.action}</button>
  </article>`).join('');
  const goals = seasonObjectives.map(o=>`<div class="objective-row"><div><strong>${o.area}</strong><small>${o.goal}</small></div><b>${o.progress}%</b><div class="meter"><span style="width:${o.progress}%"></span></div><em>${o.risk}</em></div>`).join('');
  const offers = jobOffers.map(o=>`<article class="offer-row">
    ${safeImg(country(o.country),'flag',o.country,'mini-flag')}
    <div><span class="tag">${o.type} · ${o.status}</span><h3>${o.club}</h3><p>${o.role} · ${o.objective}</p><small>${o.calendar} · Pressão ${o.pressure}</small></div>
    <div class="candidate-side"><strong>${o.fit}%</strong><small>encaixe</small><button class="secondary-btn mini" data-route="${o.type==='Seleção nacional'?'nationalTeam':'club'}">Analisar</button></div>
  </article>`).join('');
  return `<section class="career-v150">
    <div class="panel career-hero"><div><span class="tag">Carreira e e-mail do treinador</span><h1>Central executiva do manager</h1><p class="small">Diretoria, imprensa, empresários, departamento médico e federações passam a enviar mensagens que orientam o rumo da carreira. Esta build prepara a carreira dupla clube + seleção.</p></div><button class="main-btn" data-route="nationalTeam">Seleções nacionais</button></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Mensagens novas</span><strong>${unread}</strong><small>${important} de alta prioridade</small></div><div class="card kpi-card"><span>Reputação</span><strong>${careerProfile.managerReputation}</strong><small>${careerProfile.reputationLabel}</small></div><div class="card kpi-card"><span>Segurança no cargo</span><strong>${careerProfile.jobSecurity}%</strong><small>Diretoria confiante</small></div><div class="card kpi-card"><span>Radar internacional</span><strong>${careerProfile.internationalRadar}%</strong><small>${careerProfile.license}</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Inbox</span><h2>E-mail do treinador</h2></div><span class="status-pill">Save seguro</span></div><div class="mail-list">${list}</div></article><article class="panel"><div class="row space"><div><span class="tag">Metas</span><h2>Painel de carreira</h2></div><strong class="grade">${careerProfile.boardTrust}</strong></div><div class="objectives-list">${goals}</div><div class="training-note"><strong>Próximo marco:</strong> ${careerProfile.nextMilestone}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Mercado de trabalho</span><h2>Propostas e sondagens</h2></div><button class="secondary-btn mini" data-route="club">Ver diretoria</button></div><div class="offer-list">${offers}</div></section>
  </section>`;
}

function nationalTeamScreen(state={}){
  const rep = careerProfile.managerReputation;
  const teamsHtml = nationalTeams.map(t=>{
    const unlocked = rep >= t.reputationRequired;
    return `<article class="national-card ${unlocked?'available':'locked'}">
      ${safeImg(t.flag,'flag',t.name,'flag-large')}
      <div><span class="tag">${unlocked?'Disponível':'Bloqueada'} · Nível ${t.level}</span><h3>${t.name}</h3><p>${t.expectation}</p><small>Reputação exigida: ${t.reputationRequired} · Pool observado: ${t.pool}</small></div>
      <button class="secondary-btn mini" data-action="safe-toast" data-message="${unlocked?'Interesse registrado.':'Aumente a reputação para desbloquear esta seleção.'}">${unlocked?'Registrar interesse':'Bloqueada'}</button>
    </article>`;
  }).join('');
  const pool = callUpPool.map(p=>`<div class="callup-row"><div><strong>${p.name}</strong><small>${p.pos} · ${p.club}</small></div><b>${p.overall}</b><em>${p.form}% forma</em><span>${p.status}</span></div>`).join('');
  const calendar = ['Data FIFA: amistoso internacional','Eliminatórias: rodada dupla','Observação de jogadores no clube','Lista preliminar de convocados','Convocação final e preparação'].map((e,i)=>`<div class="timeline-row"><strong>${i+1}</strong><span>${e}</span><small>${i<2?'Próxima temporada':'Sistema preparado'}</small></div>`).join('');
  return `<section class="national-v150">
    <div class="panel national-hero"><div><span class="tag">Carreira internacional</span><h1>Seleções nacionais</h1><p class="small">O treinador pode receber sondagens para comandar seleção em paralelo ao clube. Convocação, calendário FIFA e reputação internacional foram preparados com proteção anti-quebra.</p></div><button class="main-btn" data-route="messages">Voltar ao e-mail</button></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Reputação atual</span><strong>${rep}</strong><small>${careerProfile.license}</small></div><div class="card kpi-card"><span>Radar internacional</span><strong>${careerProfile.internationalRadar}%</strong><small>cresce com títulos</small></div><div class="card kpi-card"><span>Pressão da mídia</span><strong>${careerProfile.mediaPressure}%</strong><small>impacta entrevistas</small></div><div class="card kpi-card"><span>Ambiente do elenco</span><strong>${careerProfile.dressingRoom}%</strong><small>liderança interna</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Federações</span><h2>Seleções monitoradas</h2></div><span class="status-pill">Bandeiras por código</span></div><div class="national-list">${teamsHtml}</div></article><article class="panel"><div class="row space"><div><span class="tag">Convocação</span><h2>Pool de jogadores</h2></div><strong class="grade">Pré-lista</strong></div><div class="callup-list">${pool}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Calendário paralelo</span><h2>Clube + seleção</h2></div><button class="secondary-btn mini" data-route="calendar">Agenda do clube</button></div><div class="timeline-list">${calendar}</div><p class="alert">Nas próximas builds, estes blocos serão conectados ao calendário real do save, reputação, convocações e desempenho em competições internacionais.</p></section>
  </section>`;
}


function money(value){
  const n = Number(value||0);
  if(!n) return 'R$ 0';
  if(n >= 1000000) return `R$ ${(n/1000000).toFixed(n%1000000===0?0:1)}M`;
  return `R$ ${Math.round(n/1000)}k`;
}


function transfersScreen(state={}){
  const selectedFilter = state.ui?.transferFilter || 'all';
  const transferState = state.transfer || {budget:42.8, wageRoom:2.4, activeNegotiations:[], acceptedDeals:[], rejectedDeals:[], outgoingDeals:[], renewals:[], loanDeals:[], incomingOffers:[], aiDeals:[], negotiationLog:[], windowOpen:true, boardApproval:82};
  const activeMap = new Map([...(negotiations||[]), ...(transferState.activeNegotiations||[])].map(n=>[n.id || n.player, n]));
  const accepted = new Set((transferState.acceptedDeals||[]).map(d=>d.id));
  const rejected = new Set((transferState.rejectedDeals||[]).map(d=>d.id));
  const soldNames = new Set((transferState.outgoingDeals||[]).map(d=>d.name));
  const loaned = new Set((transferState.loanDeals||[]).map(d=>d.id));
  const renewed = new Set((transferState.renewals||[]).map(r=>r.id));
  const pool = transferShortlist.concat(loanTargets||[]);
  const filtered = selectedFilter==='all' ? pool : pool.filter(p=>p.pos===selectedFilter || String(p.status||'').toLowerCase().includes(selectedFilter));
  const filters = ['all','ATA','MEI','VOL','ZAG','LE','PD','livre','empréstimo'].map(f=>`<button class="filter-chip ${selectedFilter===f?'active':''}" data-action="set-ui" data-ui-key="transferFilter" data-ui-value="${f}">${f==='all'?'Todos':f}</button>`).join('');
  const cards = filtered.map(p=>{
    const n = activeMap.get(p.id) || activeMap.get(p.name);
    const isAccepted = accepted.has(p.id);
    const isLoan = loaned.has(p.id);
    const isRejected = rejected.has(p.id);
    const disabled = isAccepted || isLoan || !transferState.windowOpen ? 'disabled' : '';
    const status = isAccepted ? 'Assinado' : isLoan ? 'Emprestado' : isRejected ? 'Encerrado' : n ? n.stage : p.status;
    const chance = n?.chance ?? p.interest;
    const offer = n ? (p.value===0 ? 'Livre/Empréstimo' : `Oferta € ${Number(n.offer||0).toFixed(1)}M`) : (p.value===0?'Sem taxa':'€ '+p.value.toFixed(1)+'M');
    return `<article class="transfer-card ${p.status==='Prioridade'?'priority':''} ${isAccepted||isLoan?'deal-done':''}">
      <div class="transfer-face">${safeImg(p.photo,'player',p.name,'player-face')}</div>
      <div class="transfer-main"><div class="row space"><div><strong>${p.name}</strong><small>${p.pos} · ${p.age} anos · ${p.club}</small></div><span class="status-pill">${status}</span></div>
        <p>${p.role} · Risco ${p.risk}</p>
        <div class="transfer-metrics"><span>OVR <b>${p.overall}</b></span><span>POT <b>${p.potential}</b></span><span>Chance <b>${chance}%</b></span></div>
        <div class="meter"><span style="width:${chance}%"></span></div>
      </div>
      <div class="transfer-price"><strong>${offer}</strong><small>Salário € ${(n?.wageOffer ?? p.wage).toFixed(2)}M</small><div class="transfer-actions"><button class="secondary-btn mini" ${disabled} data-action="transfer-negotiate" data-player="${p.id}">${n?'Melhorar':'Negociar'}</button><button class="main-btn mini" ${disabled} data-action="transfer-accept" data-player="${p.id}">Comprar</button><button class="secondary-btn mini" ${disabled} data-action="transfer-loan" data-player="${p.id}">Empréstimo</button><button class="secondary-btn mini danger" ${isAccepted?'disabled':''} data-action="transfer-reject" data-player="${p.id}">Encerrar</button></div></div>
    </article>`;
  }).join('');
  const outgoing = outgoingList.map(p=>`<div class="outgoing-row ${soldNames.has(p.name)?'deal-done':''}"><div><strong>${p.name}</strong><small>${p.pos} · ${p.age} anos · ${p.market}</small></div><b>€ ${p.value.toFixed(1)}M</b><span>${soldNames.has(p.name)?'Concluído':p.status}</span><button class="secondary-btn mini" ${soldNames.has(p.name)||!transferState.windowOpen?'disabled':''} data-action="transfer-sell" data-player="${p.name}">Negociar saída</button></div>`).join('');
  const incoming = (transferState.incomingOffers||[]).slice().reverse().map(o=>`<div class="offer-row ${o.status!=='Pendente'?'deal-done':''}"><div><strong>${o.buyer}</strong><small>quer ${o.player} · expira em ${o.expiresIn||7} dias</small></div><b>€ ${Number(o.value||0).toFixed(1)}M</b><span>${o.status}</span><button class="main-btn mini" ${o.status!=='Pendente'?'disabled':''} data-action="transfer-offer-accept" data-offer="${o.id}">Aceitar</button><button class="secondary-btn mini danger" ${o.status!=='Pendente'?'disabled':''} data-action="transfer-offer-reject" data-offer="${o.id}">Recusar</button></div>`).join('') || '<p class="small">Nenhuma proposta recebida. Use o botão para testar empresários e clubes compradores.</p>';
  const negRows = [...(negotiations||[]), ...(transferState.activeNegotiations||[])].filter((n,i,arr)=>arr.findIndex(x=>(x.id||x.player)===(n.id||n.player))===i).map(n=>`<div class="negotiation-row"><div><strong>${n.player}</strong><small>${n.type} · ${n.stage}</small></div><div><b>${n.chance}%</b><div class="meter"><span style="width:${n.chance}%"></span></div><small>${n.next}</small></div></div>`).join('');
  const renewals = renewalTargets.map(r=>`<div class="renewal-row ${renewed.has(r.id)?'deal-done':''}"><div><strong>${r.player}</strong><small>Vence em ${r.expires} · risco ${r.risk}</small><p>${r.recommendation}</p></div><b>€ ${r.demand.toFixed(2)}M</b><button class="secondary-btn mini" ${renewed.has(r.id)?'disabled':''} data-action="transfer-renew" data-player="${r.id}">${renewed.has(r.id)?'Renovado':'Renovar'}</button></div>`).join('');
  const aiDeals = (transferState.aiDeals||[]).slice().reverse().map(d=>`<div class="mail-row compact"><strong>${d.to} contratou ${d.player}</strong><small>${d.from} · ${d.type} · € ${Number(d.fee||0).toFixed(1)}M</small></div>`).join('') || '<p class="small">Nenhum movimento de IA simulado ainda.</p>';
  const scout = scoutingReports.map(r=>`<div class="scout-row"><strong>${r.area}</strong><span>${r.grade}</span><p>${r.note}</p></div>`).join('');
  const events = agentEvents.map(e=>`<div class="news-item"><strong>${e.title}</strong><span>${e.impact}</span></div>`).join('');
  const rules = [...contractRules, ...boardTransferPolicy].map(r=>`<div class="stat-line"><span>${r.label}</span><strong>${r.value}</strong></div>`).join('');
  const log = (transferState.negotiationLog||[]).slice(-8).reverse().map(l=>`<div class="mail-row compact"><strong>${l.message || l}</strong><small>${l.time ? new Date(l.time).toLocaleString('pt-BR') : 'Registro local'}</small></div>`).join('') || '<p class="small">Nenhuma negociação registrada nesta sessão.</p>';
  return `<section class="transfers-v280">
    <div class="panel transfer-hero"><div><span class="tag">Mercado profundo v2.8</span><h1>Central de transferências funcional</h1><p class="small">Compra, venda, empréstimo, propostas recebidas, renovações, janela aberta/fechada, orçamento, folha, bloqueio da diretoria e mercado IA dos outros clubes.</p></div><div class="row gap"><button class="secondary-btn" data-action="transfer-window-toggle">${transferState.windowOpen?'Fechar janela teste':'Abrir janela teste'}</button><button class="main-btn" data-route="contracts">Ver contratos</button></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Janela</span><strong>${transferState.windowOpen?'Aberta':'Fechada'}</strong><small>${transferWindow.daysLeft} dias restantes</small></div><div class="card kpi-card"><span>Orçamento vivo</span><strong>€ ${Number(transferState.budget).toFixed(1)}M</strong><small>limite seguro € ${transferWindow.boardLimit.toFixed(1)}M</small></div><div class="card kpi-card"><span>Folha livre</span><strong>€ ${Number(transferState.wageRoom).toFixed(2)}M</strong><small>bloqueio automático</small></div><div class="card kpi-card"><span>Aprovação diretoria</span><strong>${Number(transferState.boardApproval||82)}%</strong><small>risco financeiro controlado</small></div></section>
    <section class="grid grid-2 transfer-layout"><article class="panel transfer-market"><div class="row space"><div><span class="tag">Radar</span><h2>Alvos de compra e empréstimo</h2></div><div class="filter-row">${filters}</div></div><div class="transfer-list">${cards}</div></article>
    <article class="panel"><div class="row space"><div><span class="tag">Negociações</span><h2>Em andamento</h2></div><span class="status-pill">Estado real</span></div><div class="negotiation-list">${negRows}</div><div class="transfer-note"><strong>Necessidades da diretoria:</strong> ${transferWindow.needs.join(', ')}.</div><div class="news-list">${events}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Propostas recebidas</span><h2>Clubes interessados</h2></div><button class="secondary-btn mini" data-action="transfer-offer-generate">Gerar proposta</button></div><div class="outgoing-list">${incoming}</div></article><article class="panel"><div class="row space"><div><span class="tag">Mercado IA</span><h2>Outros clubes</h2></div><button class="secondary-btn mini" data-action="transfer-ai-sim">Simular IA</button></div><div class="premium-list">${aiDeals}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Saídas</span><h2>Atletas negociáveis</h2></div><span class="status-pill">Receita soma no orçamento</span></div><div class="outgoing-list">${outgoing}</div></article>
    <article class="panel"><div class="row space"><div><span class="tag">Renovações</span><h2>Contratos críticos</h2></div><button class="secondary-btn mini" data-route="contracts">Contratos</button></div><div class="renewal-list">${renewals}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Olheiros</span><h2>Relatórios por mercado</h2></div><button class="secondary-btn mini" data-route="staff">Olheiros</button></div><div class="scout-list">${scout}</div></article><article class="panel"><div class="row space"><div><span class="tag">Diário de mercado</span><h2>Últimas ações</h2></div><span class="status-pill">Save local</span></div><div class="premium-list">${log}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Política contratual</span><h2>Diretrizes anti-quebra</h2></div><button class="secondary-btn mini" data-route="finances">Financeiro</button></div><div class="grid desktop-4">${rules}</div><p class="alert">Proteção v2.8: janela fechada bloqueia movimentos, diretoria bloqueia orçamento/folha insuficientes, vendas e empréstimos atualizam dinheiro/folha e todo evento fica salvo.</p></section>
  </section>`;
}

function trainingScreen(state={}){
  const selectedId = state.ui?.trainingTheme || 'possession';
  const active = trainingThemes.find(t=>t.id===selectedId) || trainingThemes[0];
  const themeButtons = trainingThemes.map(t=>`<button class="training-theme-card ${t.id===active.id?'active':''}" data-action="set-ui" data-ui-key="trainingTheme" data-ui-value="${t.id}"><span>${t.icon}</span><strong>${t.name}</strong><small>${t.focus}</small><em>${t.gain}</em></button>`).join('');
  const week = weeklyPlan.map(d=>`<article class="training-day ${d.type==='Jogo'?'match-day':''}"><div><strong>${d.day}</strong><span>${d.type}</span></div><h3>${d.title}</h3><p>${d.effect}</p><div class="meter"><span style="width:${d.load}%"></span></div><small>Carga ${d.load}%</small></article>`).join('');
  const focus = developmentFocus.map(p=>`<div class="development-row"><div class="dev-avatar">${p.role}</div><div><strong>${p.player}</strong><small>${p.age} anos · ${p.focus}</small></div><b>${p.progress}%</b><em>${p.potential}</em><div class="meter"><span style="width:${p.progress}%"></span></div></div>`).join('');
  const staff = trainingStaffImpact.map(s=>`<div class="staff-impact"><div><span>${s.area}</span><strong>${s.grade}</strong></div><p>${s.effect}</p><div class="meter"><span style="width:${s.value}%"></span></div></div>`).join('');
  const alerts = trainingAlerts.map(a=>`<div class="training-alert"><span>${a.level}</span><strong>${a.title}</strong><p>${a.text}</p></div>`).join('');
  const readiness = Math.max(42, Math.min(96, 88 - Math.round(active.fatigue/4) - Math.round(active.risk/5)));
  return `<section class="training-v110">
    <div class="panel training-hero"><div><span class="tag">Treino e evolução</span><h1>Centro de performance</h1><p class="small">Plano semanal, carga física, evolução individual, risco de lesão e influência direta no desempenho de partida. Tudo preparado para integrar com staff, calendário e motor de jogo nas próximas builds.</p></div><button class="main-btn" data-route="match">Testar no jogo</button></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Tema ativo</span><strong>${active.name}</strong><small>${active.gain}</small></div><div class="card kpi-card"><span>Intensidade</span><strong>${active.intensity}%</strong><small>Carga semanal controlada</small></div><div class="card kpi-card"><span>Risco de lesão</span><strong>${active.risk}%</strong><small>${active.risk>35?'Alto cuidado':'Sob controle'}</small></div><div class="card kpi-card"><span>Prontidão</span><strong>${readiness}%</strong><small>Elenco para próximo jogo</small></div></section>
    <section class="grid grid-2 training-main-grid"><article class="panel"><div class="row space"><div><span class="tag">Tema da semana</span><h2>Escolha o foco</h2></div><span class="status-pill">Salvo local</span></div><div class="training-theme-list">${themeButtons}</div><div class="training-note"><strong>Impacto atual:</strong> ${active.focus}. Ganho principal: ${active.gain}. Carga estimada: ${active.fatigue}%.</div></article><article class="panel"><div class="row space"><div><span class="tag">Calendário de treino</span><h2>Microciclo</h2></div><strong class="grade">7 dias</strong></div><div class="week-plan">${week}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Desenvolvimento</span><h2>Jogadores em foco</h2></div><strong class="grade">Subida técnica</strong></div><div class="development-list">${focus}</div></article><article class="panel"><div class="row space"><div><span class="tag">Staff</span><h2>Impacto no treino</h2></div><button class="secondary-btn mini" data-route="staff">Gerir staff</button></div><div class="staff-impact-list">${staff}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Relatório do centro de performance</span><h2>Alertas e recomendações</h2></div><button class="secondary-btn mini" data-route="calendar">Ver agenda</button></div><div class="training-alerts">${alerts}</div></section>
  </section>`;
}


function formationScreen(state={}){
  const squadPlayers = getActiveSquad(state);
  const selectedId = state.ui?.selectedFormation || '433-possession';
  const profileId = state.ui?.tacticalProfile || 'possession';
  const report = evaluateTactic(squadPlayers, selectedId, profileId);
  const formation = report.lineup.formation;
  const starters = report.lineup.starters;
  const bench = report.lineup.bench.slice(0,8);
  const tacticButtons = formations.map(f=>`<button class="tactic-choice ${f.id===formation.id?'active':''}" data-action="set-ui" data-ui-key="selectedFormation" data-ui-value="${f.id}"><strong>${f.shape}</strong><span>${f.name}</span></button>`).join('');
  const pitchPlayers = starters.map((entry)=>{
    const p = entry.player; const slot = entry.slot;
    const warn = entry.compatibility < 75 ? ' improvised' : '';
    return `<button class="tactic-player-dot${warn}" style="left:${slot.x}%;top:${slot.y}%" title="${p.name}"><span>${slot.label}</span><strong>${shortName(p.name)}</strong><em>${entry.score}</em><small>${entry.compatibility}%</small></button>`;
  }).join('');
  const startersList = starters.map((entry)=>`<div class="lineup-row realism-row"><div>${safeImg(entry.player.photo,'player',entry.player.name,'mini-face')}<span><strong>${entry.player.name}</strong><small>${roleLabel(entry.slot.role)} · ${entry.player.pos} · prontidão ${entry.readiness}%</small></span></div><b>${entry.score}</b><em>${entry.compatibility}%</em></div>`).join('');
  const benchList = bench.map(p=>`<div class="bench-chip">${safeImg(p.photo,'player',p.name,'mini-face')}<span>${p.name}</span><b>${p.overall}</b></div>`).join('');
  const alerts = squadAlerts(squadPlayers, formation.id).map(a=>`<div class="squad-alert ${a.type}"><div><strong>${a.title}</strong><small>${a.detail}</small></div><span>${a.level}</span><div class="meter"><span style="width:${a.level}%"></span></div></div>`).join('');
  return `<section class="tactics-v100 tactics-v290">
    <div class="panel tactic-hero"><div><span class="tag">Tática v2.9 · escalação realista</span><h1>Mesa tática do manager</h1><p class="small">O onze agora é calculado por função natural, overall, forma, moral, condição física e risco de improvisação. Isso prepara o motor profundo de partida.</p></div><div class="row gap"><button class="secondary-btn" data-action="auto-lineup">Auto XI</button><button class="main-btn" data-route="instructions">Instruções</button></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Nota do plano</span><strong>${report.grade}</strong><small>${formation.shape}</small></div><div class="card kpi-card"><span>Entrosamento</span><strong>${report.chemistry}%</strong><div class="meter"><span style="width:${report.chemistry}%"></span></div></div><div class="card kpi-card"><span>Ataque</span><strong>${report.attack}</strong><div class="meter"><span style="width:${report.attack}%"></span></div></div><div class="card kpi-card"><span>Defesa</span><strong>${report.defense}</strong><div class="meter"><span style="width:${report.defense}%"></span></div></div></section>
    <section class="grid grid-2 tactic-main-grid">
      <article class="panel tactic-board-panel"><div class="row space"><div><span class="tag">Formação ativa</span><h2>${formation.name}</h2></div><strong class="grade">${formation.shape}</strong></div><div class="tactic-pitch"><div class="pitch-lines"></div>${pitchPlayers}</div></article>
      <article class="panel tactic-control-panel"><div class="row space"><div><span class="tag">Planos de jogo</span><h2>Escolha rápida</h2></div><span class="status-pill">Salvo local</span></div><div class="tactic-choice-list">${tacticButtons}</div><div class="tactic-kpis"><div><span>Encaixe</span><strong>${report.fit}%</strong><div class="meter"><span style="width:${report.fit}%"></span></div></div><div><span>Prontidão</span><strong>${report.readiness}%</strong><div class="meter"><span style="width:${report.readiness}%"></span></div></div><div><span>Controle</span><strong>${report.control}</strong><div class="meter"><span style="width:${report.control}%"></span></div></div><div><span>Risco</span><strong>${report.risk}%</strong><div class="meter"><span style="width:${report.risk}%"></span></div></div></div><div class="squad-alert-list">${alerts}</div></article>
    </section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Onze inicial</span><h2>Escalação calculada</h2></div><button class="secondary-btn mini" data-route="squad">Elenco</button></div><div class="lineup-list">${startersList}</div></article><article class="panel"><div class="row space"><div><span class="tag">Banco</span><h2>Substituições prováveis</h2></div><button class="secondary-btn mini" data-route="match">Ir para jogo</button></div><div class="bench-list">${benchList}</div><div class="tactic-note">Banco ordenado por capacidade de impacto, condição física e encaixe mínimo por setor. Improvisações aparecem com alerta no campo.</div></article></section>
  </section>`;
}

function instructionsScreen(state={}){
  const profileId = state.ui?.tacticalProfile || 'possession';
  const profile = tacticalProfiles[profileId] || tacticalProfiles.possession;
  const profileButtons = Object.entries(tacticalProfiles).map(([id,p])=>`<button class="tactic-choice ${id===profileId?'active':''}" data-action="set-ui" data-ui-key="tacticalProfile" data-ui-value="${id}"><strong>${p.name}</strong><span>Ritmo ${p.tempo} · Risco ${p.risk}</span></button>`).join('');
  const sliders = [
    ['Ritmo', profile.tempo], ['Largura', profile.width], ['Pressão', profile.press], ['Linha defensiva', profile.line], ['Passes curtos', profile.passing], ['Verticalidade', profile.directness], ['Risco criativo', profile.risk]
  ].map(([label,val])=>`<div class="instruction-slider"><div class="row space"><span>${label}</span><strong>${val}%</strong></div><div class="meter"><span style="width:${val}%"></span></div></div>`).join('');
  const individual = playerInstructions.map(item=>`<div class="instruction-row"><div><strong>${item.sector}</strong><small>${item.instruction}</small></div><span>${item.impact}</span></div>`).join('');
  const balls = setPieces.map(item=>`<div class="setpiece-row"><div><strong>${item.name}</strong><small>${item.setup}</small></div><b>${item.efficiency}%</b><div class="meter"><span style="width:${item.efficiency}%"></span></div></div>`).join('');
  const projection = Math.round((profile.tempo + profile.press + profile.passing + (100-profile.risk))/4);
  return `<section class="instructions-v100">
    <div class="panel instruction-hero"><div><span class="tag">Instruções avançadas</span><h1>Modelo de jogo</h1><p class="small">Configure comportamento coletivo, setores, bolas paradas e plano de partida. Tudo fica salvo no save local migrável e preparado para influenciar o motor de jogo.</p></div><button class="main-btn" data-route="formation">Voltar à formação</button></div>
    <section class="grid grid-2">
      <article class="panel"><div class="row space"><div><span class="tag">Perfil coletivo</span><h2>${profile.name}</h2></div><span class="status-pill">Plano A</span></div><div class="tactic-choice-list compact">${profileButtons}</div></article>
      <article class="panel"><div class="row space"><div><span class="tag">Impacto previsto</span><h2>Leitura pré-jogo</h2></div><strong class="grade">${projection}</strong></div><div class="stats-radar"><div><span>Posse esperada</span><strong>${Math.min(68, Math.round(45+profile.passing/4))}%</strong></div><div><span>Volume ofensivo</span><strong>${Math.round((profile.tempo+profile.directness)/2)}</strong></div><div><span>Proteção defensiva</span><strong>${Math.round((100-profile.risk+100-profile.line)/2)}</strong></div><div><span>Desgaste</span><strong>${Math.round((profile.tempo+profile.press)/2)}</strong></div></div></article>
    </section>
    <section class="grid grid-2">
      <article class="panel"><div class="row space"><div><span class="tag">Comportamento</span><h2>Controles táticos</h2></div><button class="secondary-btn mini">Aplicado</button></div><div class="instruction-slider-list">${sliders}</div></article>
      <article class="panel"><div class="row space"><div><span class="tag">Setores</span><h2>Instruções individuais</h2></div><span class="status-pill">7 setores</span></div><div class="instruction-list">${individual}</div></article>
    </section>
    <section class="panel"><div class="row space"><div><span class="tag">Bolas paradas</span><h2>Rotinas especiais</h2></div><button class="secondary-btn mini" data-route="match">Testar na partida</button></div><div class="setpiece-grid">${balls}</div><p class="alert">Na próxima build de partida, estas instruções alimentarão narração, pressão, chances, posse, faltas, escanteios e substituições recomendadas.</p></section>
  </section>`;
}

function shortName(name=''){
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if(parts.length<=1) return parts[0] || 'Atleta';
  return parts[parts.length-1].slice(0,12);
}



function seasonCenterScreen(state={}){
  const club = teamById(state.clubId || 'santos');
  const leagueId = club.leagueId || 'brasileirao-a';
  const round = Math.max(1, Number(state.career?.matchday || state.match?.round || 1));
  const fixtures = fixturesByRound(leagueId, round);
  const completed = new Map((state.career?.completedMatches || []).map(m=>[m.id,m]));
  const rows = deriveStandings(leagueId, state.career?.completedMatches || []).map(r=>({...r,user:r.id===club.id, zone:leagueZones(leagueId,r.pos)}));
  const table = rows.map(r=>`<tr class="${r.user?'user-row':''} ${r.zone.className}">
    <td><strong>${r.pos}</strong></td><td><div class="team-cell">${safeImg(clubLogo(r.id),'club',r.club,'mini-logo')}<span>${r.club}</span></div><small>${r.zone.name}</small></td>
    <td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gf-r.ga}</td><td><strong>${r.pts}</strong></td>
  </tr>`).join('');
  const fixtureCards = fixtures.map(f=>{
    const h=teamById(f.home), a=teamById(f.away), done=completed.get(f.id);
    return `<div class="fixture-card ${h.id===club.id||a.id===club.id?'user-fixture':''}">
      <span>${f.stage} · ${f.date.slice(8,10)}/${f.date.slice(5,7)}</span>
      <div class="row space"><div class="team-cell">${safeImg(clubLogo(h.id),'club',h.name,'mini-logo')}<b>${h.name}</b></div><strong>${done?`${done.homeGoals} x ${done.awayGoals}`:'x'}</strong><div class="team-cell right">${safeImg(clubLogo(a.id),'club',a.name,'mini-logo')}<b>${a.name}</b></div></div>
      <small>${f.venue}</small>
    </div>`;
  }).join('');
  const summary = qualificationSummary(leagueId).map(x=>`<li>${x}</li>`).join('');
  const lastRound = (state.career?.lastRoundResults || []).map(m=>{const h=teamById(m.home),a=teamById(m.away);return `<div class="news-item"><strong>${h.name} ${m.homeGoals} x ${m.awayGoals} ${a.name}</strong><span>${m.competition} · ${m.stage}</span></div>`}).join('') || '<p class="muted">A rodada ainda não foi simulada.</p>';
  return `<section class="season-center-v270">
    <article class="panel standings-hero"><div><span class="tag">Temporada real v2.7</span><h1>${club.league}</h1><p class="small">Calendário de ida e volta, rodada completa, simulação dos outros clubes, tabela com logos e zonas de classificação/rebaixamento.</p></div><div class="club-identity-card mini">${safeImg(clubLogo(club.id),'club',club.name,'club-logo')}<div><strong>${club.name}</strong><small>Rodada ${round}</small></div></div></article>
    <section class="grid grid-2"><article class="panel"><span class="tag">Rodada atual</span><h2>Jogos da rodada ${round}</h2><div class="fixture-list">${fixtureCards}</div></article><article class="panel"><span class="tag">Regras esportivas</span><h2>Consequências da temporada</h2><ul class="premium-list bullets">${summary}</ul><div class="news-list">${lastRound}</div></article></section>
    <article class="panel table-panel"><div class="row space"><div><span class="tag">Tabela viva</span><h2>Classificação com escudos</h2></div><button class="secondary-btn mini" data-action="safe-toast" data-message="A rodada é simulada automaticamente ao finalizar seu jogo.">Simulação automática</button></div><div class="table-scroll"><table class="table standings-table"><thead><tr><th>Pos</th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>PTS</th></tr></thead><tbody>${table}</tbody></table></div></article>
  </section>`;
}

function visualLibraryScreen(state={}){
  const summary = visualSummary();
  const lib = visualLibrary();
  const categories = summary.categories.map(cat=>`<article class="card"><div class="row space"><strong>${cat.key}</strong><span class="tag">${cat.total} fundos</span></div><p class="small">Primeiro caminho: <code>${cat.first || 'fallback'}</code></p></article>`).join('');
  const leagues = Object.entries(lib.leagues || {}).slice(0,32).map(([id,l])=>`<div class="asset-row"><span>${safeImg(l.logo,'league',l.name,'mini-logo')}</span><div><strong>${l.name}</strong><small>${id} · ${l.country}</small></div></div>`).join('');
  const countryRows = Object.entries(lib.countries || {}).slice(0,42).map(([code,path])=>`<span class="country-pill">${safeImg(path,'country',code,'mini-flag')} ${code}</span>`).join('');
  const clubCountries = Object.entries(lib.clubs || {}).map(([countrySlug, clubs])=>`<article class="card"><strong>${countrySlug}</strong><p class="small">${Object.keys(clubs||{}).length} logos de clubes cadastrados</p></article>`).join('');
  return `<section class="visual-library-v260 stack">
    <div class="panel"><div class="row space"><div><span class="tag">v2.6.1</span><h1>Biblioteca Visual Dinâmica</h1><p class="small">O jogo agora entende os fundos extras, logos organizados, países e ligas pelo manifesto <code>data/asset-library.json</code>. Se uma imagem estiver ausente, quebrada ou com nome errado, o fallback preserva a tela.</p></div><strong class="grade">${summary.version}</strong></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Fundos por categorias</span><strong>${summary.categories.length}</strong><small>rotação diária segura</small></div><div class="card kpi-card"><span>Clubes com logos</span><strong>${summary.clubs}</strong><small>${summary.clubCountries} países/pastas</small></div><div class="card kpi-card"><span>Ligas preparadas</span><strong>${summary.leagues}</strong><small>com fallback se faltar logo</small></div><div class="card kpi-card"><span>Países/códigos</span><strong>${summary.countries}</strong><small>bandeiras e aliases</small></div></section>
    <section class="panel"><div class="row space"><div><span class="tag">Fundos dinâmicos</span><h2>Categorias reconhecidas</h2></div><span class="status-pill">anti-quebra ativo</span></div><div class="grid desktop-4">${categories}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Ligas</span><h2>Biblioteca de ligas preparada</h2></div><span class="small">adicione PNGs nos caminhos oficiais</span></div><div class="asset-list compact">${leagues}</div></article><article class="panel"><div class="row space"><div><span class="tag">Países</span><h2>Códigos reconhecidos</h2></div><span class="small">flags com fallback</span></div><div class="country-cloud">${countryRows}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Clubes importados</span><h2>Logos organizados por país</h2></div><span class="small">data/club-logo-library.json</span></div><div class="grid desktop-4">${clubCountries}</div></section>
    <section class="panel"><h2>Como adicionar novos visuais sem mexer no código</h2><p class="small">Suba a imagem no caminho indicado pelo guia e cadastre no <code>data/asset-library.json</code>. Para logos, use <code>assets/clubs/pais/clube/logo.png</code> e <code>badge.png</code>. O jogo tentará a imagem, depois o fundo principal da tela, depois o fallback global.</p></section>
  </section>`;
}


function careerOffersFromState(state={}){
  const base = Array.isArray(state.career?.jobOffers) ? state.career.jobOffers : [];
  return base.length ? base : jobOffers.map((o,i)=>({
    id:`legacy-${i}`,
    type:o.type === 'Seleção nacional' ? 'national' : 'club',
    targetId:o.type === 'Seleção nacional' ? String(o.club).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-') : '',
    name:o.club,
    country:o.country,
    role:o.role,
    status:o.status,
    requiredRep:o.requiredRep,
    fit:o.fit,
    objective:o.objective,
    pressure:o.pressure,
    calendar:o.calendar
  }));
}
function offerCardV310(o){
  const isNational = o.type === 'national';
  const canAccept = Number(o.fit||0) >= 45 || String(o.status||'').toLowerCase().includes('proposta');
  return `<article class="offer-row career-offer-card ${isNational?'national-offer':'club-offer'}">
    ${safeImg(country(o.country||'br'),'flag',o.country||'br','mini-flag')}
    <div><span class="tag">${isNational?'Seleção nacional':'Clube'} · ${o.status||'Sondagem'}</span><h3>${o.name}</h3><p>${o.role||'Treinador'} · ${o.objective||'Projeto esportivo'}</p><small>${o.calendar || o.league || 'Calendário completo'} · Pressão ${o.pressure||'Média'} · Reputação exigida ${o.requiredRep||40}</small></div>
    <div class="candidate-side"><strong>${o.fit||50}%</strong><small>encaixe</small><button class="main-btn mini" ${canAccept?'':'disabled'} data-action="career-offer-accept" data-offer="${o.id}">Aceitar</button><button class="secondary-btn mini danger" data-action="career-offer-reject" data-offer="${o.id}">Recusar</button></div>
  </article>`;
}
function messagesScreenV310(state={}){
  const unread = inboxMessages.filter(m=>m.status==='Novo').length + (state.career?.jobOffers?.length || 0);
  const important = inboxMessages.filter(m=>m.priority==='Alta').length;
  const list = inboxMessages.map(m=>`<article class="mail-card ${m.status==='Novo'?'unread':''}"><div class="mail-icon">${m.type.slice(0,2).toUpperCase()}</div><div class="mail-body"><div class="row space"><span class="tag">${m.type} · ${m.priority}</span><small>${m.date}</small></div><h3>${m.subject}</h3><p>${m.body}</p><small>De: ${m.from}</small></div><button class="secondary-btn mini" data-route="${m.route}">${m.action}</button></article>`).join('');
  const goals = seasonObjectives.map(o=>`<div class="objective-row"><div><strong>${o.area}</strong><small>${o.goal}</small></div><b>${o.progress}%</b><div class="meter"><span style="width:${o.progress}%"></span></div><em>${o.risk}</em></div>`).join('');
  const activeJob = state.career?.nationalTeamJob;
  const offers = careerOffersFromState(state).map(offerCardV310).join('');
  const history = (state.career?.offerHistory||[]).slice(-6).reverse().map(h=>`<div class="timeline-row"><strong>•</strong><span>${h}</span><small>Carreira</small></div>`).join('') || '<p class="small">Sem decisões registradas ainda.</p>';
  return `<section class="career-v310"><div class="panel career-hero"><div><span class="tag">Carreira v3.1</span><h1>Central executiva do manager</h1><p class="small">Agora propostas de clubes e seleções podem ser aceitas ou recusadas. Ao aceitar seleção nacional, o treinador passa a atuar em carreira dupla: clube + seleção.</p></div><div class="hero-actions"><button class="main-btn" data-action="career-offers-generate">Gerar propostas</button><button class="secondary-btn" data-route="nationalTeam">Seleções</button></div></div>
  <section class="grid desktop-4"><div class="card kpi-card"><span>Mensagens novas</span><strong>${unread}</strong><small>${important} de alta prioridade</small></div><div class="card kpi-card"><span>Reputação</span><strong>${state.manager?.reputation||careerProfile.managerReputation}</strong><small>${careerProfile.reputationLabel}</small></div><div class="card kpi-card"><span>Carreira dupla</span><strong>${activeJob?'Ativa':'Inativa'}</strong><small>${activeJob?.name||'Sem seleção'}</small></div><div class="card kpi-card"><span>Segurança no cargo</span><strong>${state.boardTrust||careerProfile.jobSecurity}%</strong><small>Diretoria monitorando</small></div></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Inbox</span><h2>E-mail do treinador</h2></div><span class="status-pill">Save seguro</span></div><div class="mail-list">${list}</div></article><article class="panel"><div class="row space"><div><span class="tag">Metas</span><h2>Painel de carreira</h2></div><strong class="grade">${state.boardTrust||careerProfile.boardTrust}</strong></div><div class="objectives-list">${goals}</div><div class="training-note"><strong>Próximo marco:</strong> ${careerProfile.nextMilestone}</div></article></section>
  <section class="panel"><div class="row space"><div><span class="tag">Mercado de trabalho</span><h2>Propostas e sondagens</h2></div><button class="secondary-btn mini" data-action="career-offers-generate">Atualizar radar</button></div><div class="offer-list">${offers}</div></section>
  <section class="panel"><div class="row space"><div><span class="tag">Histórico</span><h2>Decisões recentes</h2></div><button class="secondary-btn mini" data-route="lobby">Lobby</button></div><div class="timeline-list">${history}</div></section></section>`;
}
function careerOffersScreenV310(state={}){
  return messagesScreenV310(state);
}
function nationalTeamScreenV310(state={}){
  const rep = Number(state.manager?.reputation || careerProfile.managerReputation);
  const activeJob = state.career?.nationalTeamJob;
  const teamsHtml = nationalTeams.map(t=>{
    const unlocked = rep >= t.reputationRequired || activeJob?.id===t.id;
    const active = activeJob?.id===t.id;
    return `<article class="national-card ${unlocked?'available':'locked'} ${active?'active-national':''}">${safeImg(t.flag,'flag',t.name,'flag-large')}<div><span class="tag">${active?'Comando atual':unlocked?'Disponível':'Bloqueada'} · Nível ${t.level}</span><h3>${t.name}</h3><p>${t.expectation}</p><small>Reputação exigida: ${t.reputationRequired} · Pool observado: ${t.pool}</small></div><button class="secondary-btn mini" ${active?'disabled':''} data-action="national-interest" data-team="${t.id}">${active?'Selecionada':unlocked?'Registrar interesse':'Pedir observação'}</button></article>`;
  }).join('');
  const selection = state.career?.callUpSelection || callUpPool.map((p,i)=>({id:String(p.name).toLowerCase().replace(/[^a-z0-9]+/g,'-'), ...p, selected:i<11}));
  const selectedCount = selection.filter(p=>p.selected).length;
  const pool = selection.map(p=>`<div class="callup-row ${p.selected?'selected-callup':''}"><div><strong>${p.name}</strong><small>${p.pos} · ${p.club}</small></div><b>${p.overall}</b><em>${p.form}% forma</em><span>${p.selected?'Convocado':'Pré-lista'}</span><button class="secondary-btn mini" data-action="callup-toggle" data-player="${p.id}">${p.selected?'Remover':'Convocar'}</button></div>`).join('');
  const calendar = (state.career?.internationalCalendar || []).map((e,i)=>`<div class="timeline-row"><strong>${i+1}</strong><span>${e.title}</span><small>${String(e.date||'').slice(0,10)} · ${e.phase}</small></div>`).join('');
  return `<section class="national-v310"><div class="panel national-hero"><div><span class="tag">Carreira internacional v3.1</span><h1>Seleções nacionais</h1><p class="small">Sistema preparado para receber proposta, aceitar seleção em paralelo ao clube, montar convocação e seguir calendário com datas FIFA, eliminatórias, copa continental e Mundial a cada 4 anos.</p></div><div class="hero-actions"><button class="main-btn" data-route="messages">E-mail</button><button class="secondary-btn" data-action="career-offers-generate">Gerar propostas</button></div></div>
  <section class="grid desktop-4"><div class="card kpi-card"><span>Reputação atual</span><strong>${rep}</strong><small>${careerProfile.license}</small></div><div class="card kpi-card"><span>Seleção atual</span><strong>${activeJob?.name || 'Nenhuma'}</strong><small>${activeJob?'Carreira dupla ativa':'Aguardando proposta'}</small></div><div class="card kpi-card"><span>Convocados</span><strong>${selectedCount}</strong><small>máximo seguro 26</small></div><div class="card kpi-card"><span>Calendário</span><strong>${(state.career?.internationalCalendar||[]).length}</strong><small>eventos internacionais</small></div></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Federações</span><h2>Seleções monitoradas</h2></div><span class="status-pill">Bandeiras por código</span></div><div class="national-list">${teamsHtml}</div></article><article class="panel"><div class="row space"><div><span class="tag">Convocação</span><h2>Pool de jogadores</h2></div><button class="main-btn mini" data-action="callup-finalize">Enviar convocação</button></div><div class="callup-list">${pool}</div></article></section>
  <section class="panel"><div class="row space"><div><span class="tag">Calendário paralelo</span><h2>Clube + seleção</h2></div><button class="secondary-btn mini" data-route="calendar">Agenda do clube</button></div><div class="timeline-list">${calendar}</div><p class="alert">Se nenhum convite estiver ativo, registre interesse em uma seleção ou gere propostas no e-mail do treinador.</p></section></section>`;
}


function worldCompetitionsScreenV320(state={}){
  const status = continentalStatusForClub(state);
  const cycle = nextGlobalCycle(state);
  const summary = worldCompetitionSummary(state);
  const monthRows = buildWorldCalendar(state).map(m=>`<div class="calendar-world-row ${m.type}"><div><strong>${m.month}</strong><small>${m.title}</small></div><span>${m.competitions.join(' · ')}</span><em>${m.pressure}</em></div>`).join('');
  const continentalCards = continentalCompetitions.map(c=>`<article class="competition-card global-card"><div class="row space"><div>${renderCompetitionLogo(c.logo,c.name,'competition-logo')}<div><strong>${c.name}</strong><small>${c.region} · ${c.seasonWindow}</small></div></div><span class="status-pill">Rep. ${c.reputation}</span></div><p>${c.format}</p><div class="small-list">${c.qualification.map(q=>`<span>${q}</span>`).join('')}</div><div class="stage-strip">${c.stages.map(s=>`<b>${s.name}</b>`).join('')}</div></article>`).join('');
  const worldCards = worldCompetitions.map(c=>`<article class="competition-card world"><div class="row space"><div>${renderCompetitionLogo(c.logo,c.name,'competition-logo')}<div><strong>${c.name}</strong><small>${c.region} · ciclo ${c.cycleYears} ano(s)</small></div></div><span class="status-pill">${c.nextEdition}</span></div><p>${c.format}</p><div class="small-list">${c.qualification.map(q=>`<span>${q}</span>`).join('')}</div><div class="impact-list">${(c.gameplayImpact||[]).map(i=>`<em>${i}</em>`).join('')}</div></article>`).join('');
  const ntCards = nationalTeamCompetitions.map(c=>`<article class="competition-card national"><div class="row space"><div>${renderCompetitionLogo(c.logo,c.name,'competition-logo')}<div><strong>${c.name}</strong><small>${c.region} · próxima ${c.nextEdition}</small></div></div><span class="status-pill">${c.month}</span></div><p>${c.format}</p><div class="stage-strip">${(c.stages||[]).map(s=>`<b>${s}</b>`).join('')}</div></article>`).join('');
  const brRules = [...qualificationRules.brazilSerieA.rules, ...qualificationRules.brazilSerieB.rules].map(r=>`<div class="rule-row"><strong>${r.range}</strong><span>${r.destination}</span><small>${r.impact}</small></div>`).join('');
  const continentalRules = qualificationRules.continental.rules.map(r=>`<div class="rule-row"><strong>${r.source}</strong><span>${r.destination}</span><small>${r.impact}</small></div>`).join('');
  return `<section class="world-v320"><div class="panel world-hero"><div><span class="tag">Calendário mundial v3.2</span><h1>Competições continentais e globais</h1><p class="small">O jogo agora entende Libertadores, Sul-Americana, torneios europeus, Mundial de Clubes, Intercontinental, seleções, eliminatórias e ciclos de Copa. Tudo com fallback seguro de logos e regras expansíveis.</p></div><div class="world-cycle-box"><strong>${status.qualification.label}</strong><small>${status.position.club} · posição ${status.position.pos} · próxima Copa ${cycle.worldCup}</small></div></div>
  <section class="grid desktop-4"><div class="card kpi-card"><span>Competições mapeadas</span><strong>${summary.totalCompetitions}</strong><small>clubes + seleções</small></div><div class="card kpi-card"><span>Destino atual</span><strong>${summary.activeClubDestination}</strong><small>${summary.currentLeague}</small></div><div class="card kpi-card"><span>Mundial de Clubes</span><strong>${cycle.clubWorldCup}</strong><small>ciclo quadrienal</small></div><div class="card kpi-card"><span>Eliminatórias</span><strong>Ativas</strong><small>datas FIFA integradas</small></div></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Regras brasileiras</span><h2>Vagas, acesso e queda</h2></div><span class="status-pill">Série A/B</span></div>${brRules}</article><article class="panel"><div class="row space"><div><span class="tag">Pontes internacionais</span><h2>Campeões e Mundial</h2></div><span class="status-pill">Global</span></div>${continentalRules}</article></section>
  <section class="panel"><div class="row space"><div><span class="tag">Agenda global</span><h2>Calendário anual integrado</h2></div><button class="secondary-btn mini" data-route="calendar">Ver agenda do clube</button></div><div class="world-calendar-list">${monthRows}</div></section>
  <section class="panel"><div class="row space"><div><span class="tag">CONMEBOL/UEFA</span><h2>Competições continentais</h2></div><span class="status-pill">Fallback de logos ativo</span></div><div class="competition-card-grid">${continentalCards}</div></section>
  <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">FIFA</span><h2>Competições mundiais de clubes</h2></div></div><div class="stack-list">${worldCards}</div></article><article class="panel"><div class="row space"><div><span class="tag">Seleções</span><h2>Ciclo internacional</h2></div><button class="secondary-btn mini" data-route="nationalTeam">Seleções</button></div><div class="stack-list">${ntCards}</div></article></section></section>`;
}


function financeCenterScreenV330(state={}){
  const snap = buildFinanceSnapshot(state);
  const objectives = boardObjectiveStatus(state);
  const feed = financeEventFeed(state);
  const profile = financeProfiles[(state.finance?.profile || 'balanced')] || financeProfiles.balanced;
  const revenueRows = snap.revenues.map(r=>`<div class="finance-stream income"><div><strong>${r.name}</strong><small>${r.note}</small></div><b>€ ${r.value}M/mês</b><span>vol. ${r.volatility}%</span></div>`).join('');
  const expenseRows = snap.expenses.map(e=>`<div class="finance-stream expense"><div><strong>${e.name}</strong><small>${e.note}</small></div><b>€ ${e.value}M/mês</b><span>pressão ${e.pressure}%</span></div>`).join('');
  const objectiveRows = objectives.map(o=>`<div class="board-objective ${o.status==='Risco'?'danger':o.status==='Monitorar'?'warn':'ok'}"><div><strong>${o.area}</strong><small>${o.target}</small></div><b>${o.score}%</b><em>${o.status}</em><div class="meter"><span style="width:${o.score}%"></span></div></div>`).join('');
  const sponsorRows = snap.sponsorshipFit.map(s=>`<div class="sponsor-proposal ${s.available?'available':'locked'}"><div><span class="tag">${s.tier}</span><strong>${s.name}</strong><small>${s.fit} · mínimo rep. ${s.minRep} · ${s.risk}</small></div><b>€ ${s.projectedAnnual}M/ano</b><em>${s.available?'Negociável':'Bloqueado'}</em></div>`).join('');
  const crisisRows = snap.activeCrisis.length ? snap.activeCrisis.map(c=>`<div class="crisis-card"><strong>${c.name}</strong><small>${c.trigger}</small><p>${c.action}</p><div class="meter danger"><span style="width:${c.severity}%"></span></div></div>`).join('') : `<div class="crisis-card ok"><strong>Sem crise ativa</strong><small>Monitoramento preventivo</small><p>O clube está dentro de uma faixa segura. Continue controlando folha, contratos e investimento.</p><div class="meter"><span style="width:22%"></span></div></div>`;
  const feedRows = feed.map(f=>`<div class="finance-feed ${f.type}"><strong>${f.title}</strong><small>${f.text}</small></div>`).join('');
  return `<section class="finance-v330">
    <div class="panel finance-hero"><div><span class="tag">Economia v3.3 · diretoria e crise</span><h1>Centro financeiro do clube</h1><p class="small">Orçamento, folha, patrocínios, mandatos da diretoria e gatilhos de crise agora formam uma camada de gestão realista conectada ao mercado e à carreira.</p></div><div class="finance-health"><strong>${snap.health}</strong><small>${profile.name}</small></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Receita mensal</span><strong>€ ${snap.monthlyRevenue}M</strong><small>projeção operacional</small></div><div class="card kpi-card"><span>Despesa mensal</span><strong>€ ${snap.monthlyExpense}M</strong><small>folha + operação</small></div><div class="card kpi-card"><span>Saldo mensal</span><strong>${snap.monthlyBalance>=0?'+':''}€ ${snap.monthlyBalance}M</strong><small>impacta confiança</small></div><div class="card kpi-card"><span>Limite mercado</span><strong>€ ${snap.transferLimit}M</strong><small>aprovado pela diretoria</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Receitas</span><h2>Entradas financeiras</h2></div><strong class="grade">€ ${snap.monthlyRevenue}M</strong></div><div class="finance-list">${revenueRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Custos</span><h2>Saídas e pressão</h2></div><strong class="grade">${snap.wagePressure}%</strong></div><div class="finance-list">${expenseRows}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Diretoria</span><h2>Mandatos e risco de cobrança</h2></div><strong class="grade">${snap.boardScore}%</strong></div><div class="objective-list">${objectiveRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Patrocínio</span><h2>Mercado comercial</h2></div><button class="secondary-btn mini" data-route="sponsorship">Tela de patrocínio</button></div><div class="sponsor-market-list">${sponsorRows}</div></article></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Crises</span><h2>Gatilhos financeiros</h2></div><strong class="grade">${snap.debtRisk}%</strong></div><div class="crisis-list">${crisisRows}</div></article><article class="panel"><div class="row space"><div><span class="tag">Relatório vivo</span><h2>Eventos executivos</h2></div><span class="status-pill">Anti-quebra ativo</span></div><div class="finance-feed-list">${feedRows}</div><p class="alert">Na v3.3 o centro financeiro é seguro: se qualquer dado faltar, o motor usa projeções e fallbacks para não travar o jogo.</p></article></section>
  </section>`;
}

