import { screenWrap, brand } from './common.js';
import { safeImg } from '../systems/assets.js';

export function cover(){
  const leagueStrip = ['brasileirao_a','copa_do_brasil','libertadores','sulamericana','champions','europa_league'];
  return screenWrap('cover', `
    <section class="title-screen">
      <div class="cinema-overlay"></div>
      <div class="title-hero-card">
        ${brand('cover-logo')}
        <p class="title-kicker">Gold Edition</p>
        <h1>Construa sua dinastia no futebol.</h1>
        <p class="subtitle wide">Gestão completa de clube, carreira esportiva, tática, mercado, calendário, staff, patrocínio, seleção nacional e partidas simuladas com estatísticas ao vivo.</p>
        <div class="title-feature-row">
          <span>⚽ Carreira</span><span>📰 Jornal</span><span>📊 Dados ao vivo</span><span>🏆 Competições</span><span>💼 Gestão realista</span>
        </div>
        <div class="menu-actions main-menu-actions">
          <button class="main-btn giant" data-route="mainMenu">Entrar no jogo</button>
          <button class="secondary-btn" data-route="careerIntro">Jornada inicial</button>
          <button class="secondary-btn" data-route="matchdayPremium">Matchday premium</button>
          <button class="secondary-btn" data-route="squadAI">IA de elenco</button>
          <button class="secondary-btn" data-route="objectivesHub">Objetivos</button>
          <button class="secondary-btn" data-route="emotionalBoard">Diretoria viva</button>
          <button class="secondary-btn" data-route="agentMarket">Empresários</button>
          <button class="secondary-btn" data-route="contractRenewal">Renovações</button>
          <button class="secondary-btn" data-route="newGame">Iniciar nova carreira</button>
        </div>
      </div>
      <div class="league-strip" aria-label="Competições principais">
        ${leagueStrip.map(id=>`<div class="league-pill">${safeImg(`assets/competitions/${id}.png`,'competition',id,'league-icon')}<span>${label(id)}</span></div>`).join('')}
      </div>
    </section>`, false);
}
function label(id){ return ({brasileirao_a:'Brasileirão',copa_do_brasil:'Copa do Brasil',libertadores:'Libertadores',sulamericana:'Sul-Americana',champions:'Champions',europa_league:'Europa'})[id] || id; }
