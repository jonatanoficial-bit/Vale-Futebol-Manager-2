import { screenWrap, brand, moneyCard } from './common.js';
import { teams } from '../data/gameData.js';
import { safeImg, clubLogo, country } from '../systems/assets.js';
import { money } from '../utils/dom.js';
import { renderSlotCompactBar } from '../systems/saveSlotsEngine.js';
import { renderLiveCalendarStrip } from '../systems/liveCalendarEngine.js';
import { renderScoutingRibbon } from '../systems/scoutingEngine.js';
import { renderStaffRibbon } from '../systems/staffEngine.js';
import { renderFinanceRibbon } from '../systems/financeEngine.js';

export const PRIMARY_ACTIONS_V550 = [
  ['match','Jogar partida','⚽','Entrar no próximo compromisso oficial'],
  ['formation','Tática','🧩','Escalação, plano de jogo e banco'],
  ['squad','Elenco','👥','Jogadores, moral, contratos e forma'],
  ['training','Treino','🔶','Plano semanal, evolução e recuperação'],
  ['standings','Tabela','📊','Classificação e estatísticas'],
  ['transfers','Mercado','🔁','Contratações, vendas e empréstimos'],
  ['messages','E-mail','✉️','Diretoria, imprensa e empresários'],
  ['liveWorld','Jornal','📰','Manchetes e bastidores do dia'],
  ['saveCenter','Saves','💾','Slots, exportação, importação e backups'],
  ['managerMenu','Menu completo','☰','Todos os módulos avançados']
];

export const MANAGER_MENU_GROUPS_V550 = [
  ['Jogo e temporada', [
    ['seasonCenter','Temporada','📆','Tabela viva, rodada completa, acesso, queda e vagas continentais','Essencial'],
    ['championship','Campeonato','🏆','Competições nacionais e agenda anual','Essencial'],
    ['standings','Classificação','📊','Tabela, estatísticas e objetivos','Dados'],
    ['calendar','Agenda','📅','Calendário completo, treinos e jogos','Temporada'],
    ['match','Partida','⚽','Próximo jogo oficial','Jogar'],
    ['matchdayPremium','Matchday Premium','🏟️','Central do dia de jogo, drama e transmissão','v6.3'],
    ['matchSimulation90','Simulação 90 Minutos','🎮','Camada 2D/texto premium, fases táticas e decisões do treinador',''],
    ['soundAmbience','Sons e Torcida','🔊','Ambiência leve, apito, torcida e estádio vivo',''],
    ['realAudioPack','Efeitos Reais Opcionais','🎧','Sons reais opcionais com carregamento seguro',''],
    ['stadiumClimate','Clima, Estádio e Gramado','🌦️','Horário, gramado, chuva, vento, pressão e impacto tático','']
  ]],
  ['Elenco e campo', [
    ['squad','Elenco','👥','Jogadores, forma, moral e contratos','Clube'],
    ['squadAI','IA de Elenco','🧠','Moral, liderança, vestiário e rotação inteligente','v6.4'],
    ['objectivesHub','Objetivos e conquistas','🎯','Missões diárias, metas de temporada e recompensas','v6.5'],
    ['squadMorale','Moral Avançada','🔥','Crises de vestiário, promessas, banco e liderança','v6.9'],
    ['formation','Tática','🧩','Escalação, campo, banco e desenho tático','Pré-jogo'],
    ['instructions','Instruções','🎯','Pressão, passes, mentalidade e bolas paradas','Avançado'],
    ['training','Treino','🔶','Plano semanal, evolução, fadiga e lesões','Elenco'],
    ['academyScouting','Scout & Recrutamento','🔎','Observadores por região, relatórios, potencial e lista de desejos',''],
    ['staff','Staff Vivo','🧑‍🏫','Comissão técnica com impacto real no treino, scout e jogo','']
  ]],
  ['Mercado e finanças', [
    ['transfers','Transferências','🔁','Compra, venda, empréstimo e renovação','Janela'],
    ['smartMarket','Mercado Inteligente','🧠','Empresários, IA de clubes e oportunidades','Novo'],
    ['academyScouting','Scout Profissional','🔎','Observadores, relatórios, comparação com elenco e lista de desejos',''],
    ['staff','Comissão Técnica Viva','🧑‍🏫','Auxiliar, físico, analista, médico, olheiro e goleiros',''],
    ['agentMarket','Empresários e Negociações','🤝','Conversas vivas, propostas rivais, comissões e fechamento seguro','v6.7'],
    ['contracts','Contratos','📝','Salários, vencimentos, luvas e renovações','Gestão'],
    ['contractRenewal','Renovação Contratual','📝','Promessas, multa, luvas, moral, salário e efeito dominó','v6.8'],
    ['financeCenter','Finanças Profundas','🏦','Patrocínio, bilheteria, folha, premiações e crise',''],
    ['emotionalBoard','Diretoria Viva','🏦','Economia emocional, promessas, reuniões e autonomia','v6.6'],
    ['finances','Financeiro','💼','Caixa, receitas, despesas, folha e dívida',''],
    ['sponsorship','Patrocínio','🤝','Propostas comerciais, bônus e satisfação','']
  ]],
  ['Carreira e mundo', [
    ['messages','E-mail','✉️','Diretoria, imprensa, empresários e seleção','Carreira'],
    ['liveWorld','Lobby Vivo','📰','Jornal esportivo, bastidores e clima do dia','v6.2'],
    ['careerTutorial','Tutorial e missões','🎓','Funções, metas e progressão infinita','Novo'],
    ['managerProgression','Evolução do treinador','⭐','XP, níveis, licenças e especialidades','v5.9.5'],
    ['careerOffers','Mercado de treinadores','📨','Propostas, contratos e sondagens reais','v5.9.6'],
    ['nationalTeam','Seleções','🇧🇷','Carreira dupla, Datas FIFA e Copa do Mundo','Internacional'],
    ['worldCompetitions','Libertadores/Sul-Americana','🌎','CONMEBOL e rota mundial','v4.3'],
    ['worldComplete','Mundo Completo','🌐','Ligas internacionais e calendário global','v5.2'],
    ['club','Clube','🛡️','Resumo institucional, estádio e torcida','Perfil']
  ]],
  ['Sistema e desenvolvimento', [
    ['careerIntro','Jornada Inicial','🎬','Abertura cinematográfica e primeira sessão guiada','v6.1'],
    ['betaProfessional','Painel do jogo','🚀','Resumo da carreira e menus principais',''],
    ['betaQaCenter','Teste rápido','✅','Teste rápido de entrada, avatar, partida e save',''],
    ['releaseCandidate','Beta Pública','🚀','Checklist público, mobile real e fluxo de teste','v6.0'],
    ['mobileAudit','Suporte mobile','📱','Teste de rotas, rolagem, botões e estabilidade no celular',''],
    ['saveSlotsV2','Slots de Carreira','💾','Continuar, criar, trocar, renomear e apagar carreiras',''],
    ['saveCenter','Save Técnico','🛡️','Backups, exportar/importar e recuperação','v5.1'],
    ['polishCenter','UI AAA','✨','Visual, responsividade e performance','v5.0'],
    ['data2026','Dados 2026','🗃️','Divisões, elencos e caminhos de fotos','Dados'],
    ['database2026','Banco Maio/2026','🧾','Atributos, contratos e verificação de dados','Novo'],
    ['dataPack2026','Data Pack 2026','🔒','Base oficial e plano de elencos',''],
    ['visualLibrary','Biblioteca Visual','🖼️','Fundos, logos, países e extras','Assets'],
    ['assetChecklist','Assets & Cache','🧩','Avatares, imagens e carregamento seguro',''],
    ['soundAmbience','Sons e Torcida','🔊','Ambiência, apito, torcida e acessibilidade sonora',''],
    ['realAudioPack','Efeitos Reais','🎧','Sons reais opcionais com carregamento seguro',''],
    ['stadiumClimate','Clima e Gramado','🌦️','Clima offline, gramado dinâmico e pressão do estádio',''],
    ['settings','Configurações','⚙️','Qualidade, sons, acessibilidade e segurança','Sistema']
  ]]
];


function dedupeMenuGroupsV800(groups=[]){
  const seen = new Set();
  return groups.map(([group, items=[]]) => [group, items.map(item => {
    const route = item[0];
    if(seen.has(route)) return [...item, 'duplicate-v800'];
    seen.add(route);
    return item;
  })]);
}
const PLAYER_HIDDEN_ROUTES_V830 = new Set(['betaProfessional','betaQaCenter','releaseCandidate','mobileAudit','polishCenter','data2026','database2026','dataPack2026','visualLibrary','assetChecklist','rosterLock2026','rosterUpdate']);
function normalizePlayerMenuGroupsV830(groups=[]){
  return dedupeMenuGroupsV800(groups).map(([group, items=[]]) => {
    const publicGroup = group === 'Sistema e desenvolvimento' ? 'Opções do jogo' : group;
    const publicItems = items
      .filter(item => !PLAYER_HIDDEN_ROUTES_V830.has(item[0]))
      .map(item => {
        const cleaned = [...item];
        if(/^v\d|Novo|Dados|Assets|Sistema$/i.test(String(cleaned[4] || ''))) cleaned[4] = '';
        if(cleaned[0] === 'saveCenter') cleaned[1] = 'Gerenciar saves';
        return cleaned;
      });
    return [publicGroup, publicItems];
  }).filter(([,items]) => items.length);
}

export function lobby(state){
  const t = teams.find(x => x.id === state.clubId) || teams[0];
  const managerCountry = state.manager.country || 'br';
  const boardTrust = Number(state.boardTrust || 76);
  const fanMood = Number(state.fanMood || 82);
  const lastResult = state.career?.lastResult;
  const homeTeam = teams.find(x=>x.id===state.match?.home) || t;
  const awayTeam = teams.find(x=>x.id===state.match?.away) || teams.find(x=>x.id!==t.id) || t;
  const nextTitle = state.match?.finalized ? 'Relatório pós-jogo disponível' : `${homeTeam.name} x ${awayTeam.name}`;
  const nextInfo = state.match?.finalized ? 'Resultado salvo. Revise o pós-jogo ou avance para o próximo compromisso.' : `${homeTeam.stadium || t.stadium} · ${state.match?.stage || 'Rodada'} · ${(state.match?.date || '2026-05-24').slice(8,10)}/${(state.match?.date || '2026-05-24').slice(5,7)}`;
  const unread = Number(state.notifications || 0);
  return screenWrap('lobby', `
    <section class="lobby-shell lobby-v550-shell">
      ${renderSlotCompactBar(state)}
      <div class="premium-topbar panel lobby-topbar-v550">
        <div class="top-left-brand">${brand()}</div>
        <div class="top-status">
          <div class="resource">💵 ${money(t.budget || state.money)}</div>
          <div class="resource">⭐ Clube ${t.reputation || 78}</div>
          <div class="resource">🧠 Técnico ${state.manager?.reputation || 50}</div>
          <button class="icon-btn mail-alert" data-route="messages" aria-label="E-mail do treinador">✉${unread ? `<span>${unread}</span>` : ''}</button>
          <button class="icon-btn" data-route="saveCenter" aria-label="Gerenciar saves">💾</button>
          <button class="icon-btn" data-action="exit-career" aria-label="Salvar e sair para slots">⏻</button>
          <button class="icon-btn" data-route="managerMenu" aria-label="Menu completo">☰</button>
        </div>
      </div>

      <section class="panel lobby-hero-v550">
        <div class="hero-manager-v550">
          ${safeImg(state.manager.avatar,'avatar','Manager','manager-pic')}
          <div>
            <span class="tag">${state.manager.mode === 'sandbox' ? 'Sandbox livre' : 'Carreira completa'}</span>
            <h1>${state.manager.name}</h1>
            <p class="small">${safeImg(country(managerCountry),'country','País do manager','inline-flag')} Manager · Temporada ${state.season} · ${state.month} · Reputação ${state.manager?.reputation || 50}/100</p>
          </div>
        </div>
        <div class="hero-club-v550">
          ${safeImg(clubLogo(t.id),'club',t.name,'club-logo xl')}
          <div>
            <span class="tag">${t.league}</span>
            <h2>${t.name}</h2>
            <p class="small">${t.stadium} · ${t.countryName} · Dificuldade: ${t.difficulty}</p>
          </div>
        </div>
        <div class="hero-next-v550">
          <div class="small">Próximo jogo oficial</div>
          <strong>${nextTitle}</strong>
          <p class="small">${nextInfo}</p>
          ${lastResult ? `<p class="small">Último resultado: ${lastResult.homeGoals} x ${lastResult.awayGoals} · ${lastResult.competition}</p>` : ''}
          <button class="main-btn compact" data-route="match">⚽ Iniciar jogo</button>
        </div>
      </section>

      ${renderLiveCalendarStrip(state)}
      ${renderScoutingRibbon(state)}
      ${renderStaffRibbon(state)}
      ${renderFinanceRibbon(state)}
      <section class="quick-actions-v550" aria-label="Ações principais">
        ${PRIMARY_ACTIONS_V550.map(([route,title,icon,desc])=>`<button class="card quick-action-v550" data-route="${route}"><span>${icon}</span><strong>${title}</strong><em>${desc}</em></button>`).join('')}
      </section>

      <section class="status-row-v550">
        <article class="panel command-card wide">
          <div class="row space"><div><span class="tag">Diretoria</span><h3>Meta principal</h3></div><strong>${boardTrust}%</strong></div>
          <p>${t.board}</p>
          <div class="meter"><span style="width:${boardTrust}%"></span></div>
          <div class="small">Segurança no cargo: ${state.jobSecurity || 'Seguro'}</div>
        </article>
        <article class="panel command-card"><div class="small">Torcida</div><h2>${fanMood}%</h2><div class="meter"><span style="width:${fanMood}%"></span></div></article>
        <article class="panel command-card"><div class="small">Reputação do técnico</div><h2>${state.manager?.reputation || 50}</h2><div class="meter"><span style="width:${state.manager?.reputation || 50}%"></span></div><button class="secondary-btn mini" data-route="careerTutorial">Ver missões</button></article>
        <article class="panel command-card"><div class="small">Força do time</div><h2>${t.level}</h2><div class="meter"><span style="width:${t.level}%"></span></div></article>
      </section>

      <section class="panel coach-feed-v550">
        <div class="row space"><div><span class="tag">Resumo do dia</span><h3>Central do treinador</h3></div><div class="row"><button class="secondary-btn mini" data-route="matchdayPremium">Matchday</button><button class="secondary-btn mini" data-route="squadAI">Vestiário</button><button class="secondary-btn mini" data-route="objectivesHub">Objetivos</button><button class="secondary-btn mini" data-route="liveWorld">Jornal</button><button class="secondary-btn mini" data-route="managerMenu">Mais módulos</button></div></div>
        <div class="coach-feed-grid-v550">
          <div class="news-item"><strong>Diretoria</strong><span>Objetivo ativo: ${t.board}</span></div>
          <div class="news-item"><strong>Jogo</strong><span>${nextTitle}</span></div>
          <div class="news-item"><strong>Missões</strong><span>${(state.career?.missions || []).filter(m=>m.done).length}/${(state.career?.missions || []).length || 8} concluídas. Use Objetivos para acompanhar recompensas e retorno diário.</span></div>
        </div>
      </section>
    </section>`, true);
}

export function managerMenu(state){
  const t = teams.find(x => x.id === state.clubId) || teams[0];
  const displayGroups = normalizePlayerMenuGroupsV830(MANAGER_MENU_GROUPS_V550);
  return screenWrap('managerMenu', `
    <section class="manager-menu-shell-v550">
      <div class="premium-topbar panel lobby-topbar-v550">
        <div><span class="tag">Central organizada</span><h1>Menu do treinador</h1><p class="small">Escolha rapidamente o que deseja administrar no clube.</p></div>
        <div class="top-status"><button class="secondary-btn mini" data-route="lobby">Voltar ao lobby</button><div class="resource">${t.name}</div></div>
      </div>
      <section class="menu-groups-v550">
        ${displayGroups.map(([group,items])=>`
          <article class="panel menu-group-v550">
            <div class="row space"><h2>${group}</h2><span class="tag">${items.length} atalhos</span></div>
            <div class="menu-grid-v550">
              ${items.map(([r,title,icon,desc,badge,duplicate])=>`<button class="card menu-tile premium-tile" data-route="${r}" ${duplicate?'data-beta-duplicate="true" aria-hidden="true" tabindex="-1"':''}>${badge?`<span class="tile-badge">${badge}</span>`:''}<span class="tile-icon">${icon}</span><strong>${title}</strong><span class="small">${desc}</span></button>`).join('')}
            </div>
          </article>`).join('')}
      </section>
    </section>`, true);
}
