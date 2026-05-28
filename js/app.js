import { loadAssetMap } from './systems/assets.js';
import { load, getState, advanceMatch } from './systems/state.js';
import { initRouter, register, render } from './systems/router.js';
import { cover } from './screens/cover.js';
import { mainMenu } from './screens/mainMenu.js';
import { newGame } from './screens/newGame.js';
import { teamSelect } from './screens/teamSelect.js';
import { confirmCareer } from './screens/confirmCareer.js';
import { lobby } from './screens/lobby.js';
import { match } from './screens/match.js';
import { moduleScreen } from './screens/moduleScreen.js';
import { applyCommercialPolish, validateCommercialState } from './systems/commercialPolish.js';
import { applyAaaUiShell, buildUiAaaSnapshot } from './systems/uiQualityEngine.js';
import { runRuntimeAudit } from './systems/auditLogger.js';
import { loadVisualLibrary } from './systems/visualAssetManager.js';
import { runtimeSafetySnapshot } from './systems/uxEngine.js';
import { runBootSafety } from '../core/safety/safe-loader.js';

async function boot(){
  const app = document.getElementById('app');
  let buildInfo = { buildLabel:'Build v5.2.0' };
  try { buildInfo = await (await fetch('build/build-info.json', {cache:'no-store'})).json(); } catch(err) { console.warn('[VFM] build-info fallback', err); }
  const loadedAssetMap = await loadAssetMap();
  await loadVisualLibrary();
  applyCommercialPolish();
  applyAaaUiShell();
  load();
  runRuntimeAudit(getState(), {phase:'v5.2.0 boot', ux: runtimeSafetySnapshot(getState()), aaa: buildUiAaaSnapshot(getState())});
  validateCommercialState(getState());
  initRouter(app, buildInfo);
  register('cover', cover);
  register('mainMenu', mainMenu);
  register('newGame', newGame);
  register('teamSelect', teamSelect);
  register('confirmCareer', confirmCareer);
  register('lobby', lobby);
  register('match', match);
  const modules = {
    seasonCenter:['Temporada','Tabela viva, rodada completa, acesso, queda e vagas continentais'],
    copaDoBrasil:['Copa do Brasil','Mata-mata, agregado, pênaltis, premiação e vaga na Libertadores'],
    financeCenter:['Economia','Diretoria, orçamento, patrocínio e crise financeira realista'],
    polishCenter:['UI AAA','Polimento visual, responsividade, performance e prontidão comercial'],
    mobileAudit:['Auditoria Mobile','Fluxo real, smoke test de rotas, pós-jogo, save e estabilidade'],
    data2026:['Dados 2026','Divisões, elencos, avatares de jogadores e manutenção segura'],
    database2026:['Banco Maio/2026','Elencos, atributos, contratos, valores, fotos e auditoria pesada'],
    worldCompetitions:['Mundial/Intercontinental','Libertadores, Sul-Americana, rota mundial, finanças e reputação global'],
    worldComplete:['Mundo Completo','Ligas internacionais, competições europeias, calendário global, ranking mundial e mercado global'],
    championship:['Campeonato','Competições e agenda anual'],
    calendar:['Calendário','Agenda completa da temporada'],
    formation:['Formação','Escalação e desenho tático'],
    instructions:['Instruções','Comportamento coletivo e individual'],
    training:['Treino','Plano semanal, evolução, recuperação, base e departamento médico'],
    standings:['Classificação','Tabelas e estatísticas'],
    transfers:['Transferências','Mercado internacional, contratos, pré-contratos, orçamento seguro e IA global'],
    smartMarket:['Mercado Inteligente','Empresários, propostas rivais, IA de clubes e disputa por atletas'],
    academyScouting:['Base & Scouting','Categorias de base, promessas, olheiros e captação global'],
    staff:['Staff','Comissão técnica e funcionários'],
    sponsorship:['Patrocínio','Receitas comerciais e propostas'],
    club:['Clube','Resumo institucional e financeiro'],
    finances:['Financeiro','Orçamento, receitas e despesas'],
    contracts:['Contratos','Contratos de jogadores e renovações'],
    messages:['E-mail','Diretoria, imprensa, empresários, propostas e seleção nacional'],
    careerOffers:['Propostas','Clubes interessados, seleções nacionais e decisões de carreira'],
    nationalTeam:['Seleções','Carreira dupla, convocação, Datas FIFA, Copa América e Copa do Mundo'],
    squad:['Elenco','Jogadores, forma, moral e contratos'],
    settings:['Configurações','Preferências e segurança'],
    aiBalance:['IA e Balanceamento','Dificuldade, realismo, pesos da simulação e diagnóstico esportivo'],
    saveCenter:['Central de Save','Autosave, backups, exportação, importação e proteção de carreira'],
    assetChecklist:['Assets','Checklist visual, caminhos oficiais, cache e fallbacks'],
    rosterUpdate:['Atualização de Elenco','Importar, exportar e validar elencos por JSON'],
    visualLibrary:['Biblioteca Visual','Fundos dinâmicos, logos, países, ligas e extras integrados']
  };
  Object.entries(modules).forEach(([route,[title,sub]]) => register(route, (state)=> moduleScreen(route,title,sub,state)));
  await runBootSafety({ state:getState(), routes:['cover','mainMenu','newGame','teamSelect','confirmCareer','lobby','match', ...Object.keys(modules)], assetMap:loadedAssetMap, buildInfo });
  render();
  setInterval(()=>{ document.querySelectorAll('#buildBadge,.build-badge').forEach(el=>{ if(!el.textContent.trim()) el.textContent = buildInfo.buildLabel; }); }, 500);
  setInterval(()=>{ const s=getState(); if(s.route==='match' && s.match?.autoPlay && !s.match?.finalized){ const step = Math.max(5, Math.min(25, Number(s.match.speed || 1) * 5)); advanceMatch(step); render(); } }, 2200);
}
window.addEventListener('error', event => {
  console.error('[VFM] erro global capturado', event.error || event.message);
});
window.addEventListener('unhandledrejection', event => {
  console.error('[VFM] promessa rejeitada capturada', event.reason);
});
boot();
