import { screenWrap, brand, moneyCard } from './common.js';
import { teams } from '../data/gameData.js';
import { safeImg, clubLogo, country } from '../systems/assets.js';
import { money } from '../utils/dom.js';


export function lobby(state){
  const t = teams.find(x => x.id === state.clubId) || teams[0];
  const managerCountry = state.manager.country || 'br';
  const menu = [
    ['polishCenter','UI AAA','✨','Visual comercial, responsividade, performance e prontidão Steam/mobile','v5.0'],
    ['saveCenter','Save Profissional','💾','Múltiplos saves, backup automático, exportar/importar e recuperação anti-corrupção','v5.1'],
    ['worldComplete','Mundo Completo','🌐','Ligas internacionais, competições europeias, ranking mundial e calendário global','v5.2'],
    ['seasonCenter','Temporada','📆','Tabela viva, rodada completa, acesso, queda e vagas continentais','Novo'],
    ['championship','Campeonato','🏆','Competições, copa, continental e agenda anual','Essencial'],
    ['worldCompetitions','Libertadores/Sul-Americana','🌎','Grupos CONMEBOL, mata-mata continental e rota mundial','v4.3'],
    ['financeCenter','Economia','🏦','Diretoria, orçamento, patrocínio, risco e crise financeira','Novo'],
    ['calendar','Agenda','📅','Calendário completo, treinos e jogos','Temporada'],
    ['formation','Tática','🧩','Escalação, campo, banco e desenho tático','Pré-jogo'],
    ['instructions','Instruções','🎯','Pressão, passes, mentalidade e bolas paradas','Avançado'],
    ['training','Treino','🔶','Plano semanal, evolução, fadiga e lesões','Elenco'],
    ['standings','Classificação','📊','Tabela, estatísticas e disputa por objetivos','Dados'],
    ['transfers','Transferências','🔁','Mercado, compra, venda, empréstimo e renovação','Janela'],
    ['smartMarket','Mercado Inteligente','🧠','Empresários, disputa por atletas, IA de clubes e oportunidades','Novo'],
    ['academyScouting','Base & Scouting','🌱','Categorias de base, promessas, olheiros e captação de talentos','Novo'],
    ['contracts','Contratos','📝','Salários, vencimentos, luvas e renovações','Gestão'],
    ['rosterUpdate','Atualizar elenco','🧾','Importar JSON, exportar plantel e trocar avatares depois','Dados'],
    ['staff','Staff','👥','Comissão técnica, médico, olheiro e diretor comercial','Clube'],
    ['sponsorship','Patrocínio','🤝','Receitas comerciais, bônus e exposição de marca','Finanças'],
    ['finances','Financeiro','💼','Orçamento, receitas, despesas e folha salarial','Diretoria'],
    ['messages','E-mail','✉️','Diretoria, imprensa, empresário e possíveis seleções','Carreira'],
    ['careerOffers','Propostas','📨','Sondagens de clubes, seleção nacional e carreira dupla','Novo'],
    ['aiBalance','IA / Realismo','🧠','Balanceamento esportivo, dificuldade e leitura da simulação','Motor'],
    ['club','Clube','🛡️','Resumo institucional, estádio, torcida e estrutura','Perfil'],
    ['visualLibrary','Biblioteca Visual','🖼️','Fundos extras, logos, países, ligas e rotação visual','Assets'],
    ['mobileAudit','Auditoria Mobile','📱','Teste real de jogabilidade, rotas críticas, pós-jogo e save','QA'],
    ['data2026','Dados 2026','🗃️','Divisões, elencos editáveis, cobertura de dados e caminhos de fotos','Novo'],
    ['settings','Configuração','⚙️','Save, qualidade, sons, acessibilidade e segurança','Sistema']
  ];
  const boardTrust = Number(state.boardTrust || 76);
  const fanMood = Number(state.fanMood || 82);
  const lastResult = state.career?.lastResult;
  const homeTeam = teams.find(x=>x.id===state.match?.home) || t;
  const awayTeam = teams.find(x=>x.id===state.match?.away) || teams.find(x=>x.id!==t.id) || t;
  const nextTitle = state.match?.finalized ? 'Pós-jogo concluído' : `${homeTeam.name} x ${awayTeam.name}`;
  const nextInfo = state.match?.finalized ? 'Resultado salvo. Próximo compromisso será carregado na evolução da carreira.' : `${homeTeam.stadium || t.stadium} · ${state.match?.stage || 'Rodada'} · ${(state.match?.date || '2026-05-24').slice(8,10)}/${(state.match?.date || '2026-05-24').slice(5,7)}`;
  return screenWrap('lobby', `
    <section class="lobby-shell">
      <div class="premium-topbar panel">
        <div class="top-left-brand">${brand()}</div>
        <div class="top-status">
          <div class="resource">💵 ${money(t.budget || state.money)}</div>
          <div class="resource">⭐ Rep. ${t.reputation || 78}</div>
          <button class="icon-btn mail-alert" data-route="messages" aria-label="E-mail do treinador">✉<span>${state.notifications || 0}</span></button>
        </div>
      </div>

      <section class="lobby-hero-v050 panel">
        <div class="manager-card">
          ${safeImg(state.manager.avatar,'avatar','Manager','manager-pic')}
          <div>
            <span class="tag">${state.manager.mode === 'sandbox' ? 'Sandbox livre' : 'Carreira completa'}</span>
            <h1>${state.manager.name}</h1>
            <p class="small">${safeImg(country(managerCountry),'country','País do manager','inline-flag')} Manager · Temporada ${state.season} · ${state.month}</p>
          </div>
        </div>
        <div class="club-identity-card">
          ${safeImg(clubLogo(t.id),'club',t.name,'club-logo xl')}
          <div>
            <span class="tag">${t.league}</span>
            <h2>${t.name}</h2>
            <p class="small">${t.stadium} · ${t.countryName} · Dificuldade: ${t.difficulty}</p>
          </div>
        </div>
        <div class="next-match-card">
          <div class="small">Próximo jogo oficial</div>
          <strong>${nextTitle}</strong>
          <p class="small">${nextInfo}</p>
          ${lastResult ? `<p class="small">Último resultado: ${lastResult.homeGoals} x ${lastResult.awayGoals} · ${lastResult.competition}</p>` : ''}
          <button class="main-btn compact" data-route="match">⚽ Iniciar jogo</button>
        </div>
      </section>

      <section class="command-grid">
        <article class="panel command-card wide">
          <div class="row space"><div><span class="tag">Diretoria</span><h3>Meta principal</h3></div><strong>${boardTrust}%</strong></div>
          <p>${t.board}</p>
          <div class="meter"><span style="width:${boardTrust}%"></span></div>
          <div class="small">Segurança no cargo: ${state.jobSecurity || 'Seguro'}</div>
        </article>
        <article class="panel command-card">
          <div class="small">Torcida</div><h2>${fanMood}%</h2><div class="meter"><span style="width:${fanMood}%"></span></div>
        </article>
        <article class="panel command-card">
          <div class="small">Força do time</div><h2>${t.level}</h2><div class="meter"><span style="width:${t.level}%"></span></div>
        </article>
      </section>

      <section class="quick-summary v050">
        ${moneyCard('Valor do elenco', t.value)}
        ${moneyCard('Orçamento disponível', t.budget)}
        <div class="card"><div class="small">Forma recente</div><strong>V V E D V</strong><p class="small">Últimos 5 jogos</p></div>
        <div class="card"><div class="small">Competições</div><strong>${t.competitions?.length || 0}</strong><p class="small">${(t.competitions || []).slice(0,3).join(' · ')}</p></div>
      </section>

      <section class="panel inbox-preview">
        <div class="row space"><div><span class="tag">Central do treinador</span><h3>E-mail e notícias</h3></div><button class="secondary-btn mini" data-route="messages">Abrir e-mail</button></div>
        <div class="news-list">
          <div class="news-item"><strong>Diretoria</strong><span>Conselho cobra evolução sem quebrar o orçamento.</span></div>
          <div class="news-item"><strong>Imprensa</strong><span>Torcida espera vitória no clássico e melhor aproveitamento em casa.</span></div>
          <div class="news-item"><strong>Seleção nacional</strong><span>Seu perfil será observado para futuras propostas internacionais.</span></div>
        </div>
      </section>

      <section class="grid menu-grid command-menu">
        ${menu.map(([r,title,icon,desc,badge])=>`<button class="card menu-tile premium-tile" data-route="${r}"><span class="tile-badge">${badge}</span><span class="tile-icon">${icon}</span><strong>${title}</strong><span class="small">${desc}</span></button>`).join('')}
      </section>
    </section>`, true);
}

function slug(name=''){ return String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/fc|futebol clube|club de regatas|sport club/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'santos'; }
