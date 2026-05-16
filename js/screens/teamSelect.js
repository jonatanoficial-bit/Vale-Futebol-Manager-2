import { screenWrap, topbar } from './common.js';
import { teams, countries, leagueCatalog } from '../data/gameData.js';
import { safeImg, clubLogo, country } from '../systems/assets.js';
import { money, esc } from '../utils/dom.js';

export function teamSelect(state){
  const selectedClub = state.ui?.selectedClub || state.clubId || 'santos';
  const countryFilter = state.ui?.teamCountryFilter || 'all';
  const leagueFilter = state.ui?.teamLeagueFilter || 'all';
  const sort = state.ui?.teamSort || 'level';
  const leaguesAvailable = leagueCatalog.filter(l => countryFilter === 'all' || l.country === countryFilter);
  let filtered = teams.filter(t => countryFilter === 'all' || t.country === countryFilter);
  filtered = filtered.filter(t => leagueFilter === 'all' || t.leagueId === leagueFilter);
  filtered = sortTeams(filtered, sort);
  const chosen = teams.find(t => t.id === selectedClub) || filtered[0] || teams[0];
  const visibleIds = new Set(filtered.map(t => t.id));
  const grid = filtered.length ? filtered : teams.slice(0, 8);
  return screenWrap('teamSelect', `${topbar('Escolha seu time','Filtros por país, liga, força e orçamento','newGame')}
  <section class="stack team-select-screen">
    <div class="panel team-filter-panel">
      <div class="row space filter-head"><div><span class="tag">Etapa 2 de 3</span><h1 class="title">Selecione o clube</h1><p class="subtitle">A escolha define orçamento, pressão da diretoria, competições e dificuldade inicial da carreira.</p></div><strong class="gold-text">${grid.length} clubes</strong></div>
      <div class="grid grid-3 team-filters">
        <label class="field"><span>País</span><select class="select" data-action="team-country-filter"><option value="all" ${countryFilter==='all'?'selected':''}>Todos os países</option>${countries.map(c=>`<option value="${c.code}" ${c.code===countryFilter?'selected':''}>${c.name}</option>`).join('')}</select></label>
        <label class="field"><span>Liga</span><select class="select" data-action="team-league-filter"><option value="all" ${leagueFilter==='all'?'selected':''}>Todas as ligas</option>${leaguesAvailable.map(l=>`<option value="${l.id}" ${l.id===leagueFilter?'selected':''}>${l.name}</option>`).join('')}</select></label>
        <label class="field"><span>Ordenar</span><select class="select" data-action="team-sort"><option value="level" ${sort==='level'?'selected':''}>Força do elenco</option><option value="budget" ${sort==='budget'?'selected':''}>Maior orçamento</option><option value="value" ${sort==='value'?'selected':''}>Maior valor</option><option value="reputation" ${sort==='reputation'?'selected':''}>Reputação</option><option value="challenge" ${sort==='challenge'?'selected':''}>Maior desafio</option></select></label>
      </div>
    </div>

    <div class="selected-club-hero panel">
      <div class="club-confirm big-club-card">
        ${safeImg(clubLogo(chosen.id),'club',chosen.name,'club-logo big-logo')}
        <div>
          <div class="small">Clube selecionado</div>
          <h2>${esc(chosen.name)}</h2>
          <div class="row wrap">${safeImg(country(chosen.country),'country',chosen.countryName,'mini-flag')}<span>${chosen.countryName}</span><span class="tag">${chosen.league}</span></div>
          <p class="small">Estádio: ${esc(chosen.stadium)} · Dificuldade: ${esc(chosen.difficulty)}</p>
        </div>
      </div>
      <div class="selected-club-stats">
        <div class="stat-box"><span>Geral</span><strong>${chosen.level}</strong><div class="meter"><span style="width:${chosen.level}%"></span></div></div>
        <div class="stat-box"><span>Orçamento</span><strong>${money(chosen.budget)}</strong><div class="meter"><span style="width:${clamp(chosen.budget/3.3)}%"></span></div></div>
        <div class="stat-box"><span>Valor</span><strong>${money(chosen.value)}</strong><div class="meter"><span style="width:${clamp(chosen.value/9.8)}%"></span></div></div>
      </div>
    </div>

    <div class="grid grid-2 desktop-4 club-grid-pro">
      ${grid.map(t=>clubCard(t, t.id===chosen.id, !visibleIds.has(selectedClub) && t.id===chosen.id)).join('')}
    </div>

    <div class="panel competition-preview">
      <div class="row space"><h3>Competições iniciais</h3><span class="small">caminhos de assets já preparados</span></div>
      <div class="competition-row">${chosen.competitions.map(c=>`<span class="tag">🏆 ${esc(c)}</span>`).join('')}</div>
      <p class="small">Meta da diretoria: ${esc(chosen.board)}. Na próxima fase esta seleção será conectada ao lobby principal e às metas do clube.</p>
    </div>

    <button class="main-btn giant" data-route="confirmCareer">Continuar com ${esc(chosen.name)}</button>
    <div class="alert audit-ok"><strong>Anti-quebra ativo:</strong> se o logo real do clube ainda não existir, o jogo usa placeholder automático. Você poderá subir o logo depois no caminho oficial sem alterar código.</div>
  </section>`, true);
}
function clubCard(t, selected){
  return `<button type="button" class="club-card pro ${selected?'selected':''}" data-action="select-team" data-team="${t.id}" aria-label="Selecionar ${esc(t.name)}">
    ${safeImg(clubLogo(t.id),'club',t.name,'club-logo')}
    <strong>${esc(t.name)}</strong>
    <div class="small club-country-line">${safeImg(country(t.country),'country',t.countryName,'mini-flag')} ${esc(t.countryName)} · ${esc(t.league)}</div>
    <div class="row space"><span>Geral ${t.level}</span><span>${money(t.budget)}</span></div>
    <div class="meter"><span style="width:${t.level}%"></span></div>
    <div class="small">${esc(t.difficulty)}</div>
  </button>`;
}
function sortTeams(list, sort){
  const copy = [...list];
  const key = sort === 'budget' ? 'budget' : sort === 'value' ? 'value' : sort === 'reputation' ? 'reputation' : sort === 'challenge' ? 'level' : 'level';
  copy.sort((a,b)=> sort === 'challenge' ? (a[key]-b[key]) : (b[key]-a[key]));
  return copy;
}
function clamp(v){ return Math.max(8, Math.min(100, Number(v)||0)); }
