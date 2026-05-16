import { loadAssetMap } from './systems/assets.js';
import { load, getState } from './systems/state.js';
import { initRouter, register, render } from './systems/router.js';
import { cover } from './screens/cover.js';
import { mainMenu } from './screens/mainMenu.js';
import { newGame } from './screens/newGame.js';
import { teamSelect } from './screens/teamSelect.js';
import { confirmCareer } from './screens/confirmCareer.js';
import { lobby } from './screens/lobby.js';
import { match } from './screens/match.js';
import { moduleScreen } from './screens/moduleScreen.js';

async function boot(){
  const app = document.getElementById('app');
  let buildInfo = { buildLabel:'Build v0.1.0' };
  try { buildInfo = await (await fetch('build/build-info.json', {cache:'no-store'})).json(); } catch(err) { console.warn('[VFM] build-info fallback', err); }
  await loadAssetMap();
  load();
  initRouter(app, buildInfo);
  register('cover', cover);
  register('mainMenu', mainMenu);
  register('newGame', newGame);
  register('teamSelect', teamSelect);
  register('confirmCareer', confirmCareer);
  register('lobby', lobby);
  register('match', match);
  const modules = {
    championship:['Campeonato','Competições e agenda anual'],
    calendar:['Calendário','Agenda completa da temporada'],
    formation:['Formação','Escalação e desenho tático'],
    instructions:['Instruções','Comportamento coletivo e individual'],
    training:['Treino','Plano semanal e evolução'],
    standings:['Classificação','Tabelas e estatísticas'],
    transfers:['Transferências','Mercado, contratos e negociações'],
    staff:['Staff','Comissão técnica e funcionários'],
    sponsorship:['Patrocínio','Receitas comerciais e propostas'],
    club:['Clube','Resumo institucional e financeiro'],
    settings:['Configurações','Preferências e segurança']
  };
  Object.entries(modules).forEach(([route,[title,sub]]) => register(route, (state)=> moduleScreen(route,title,sub,state)));
  render();
  setInterval(()=>{ document.querySelectorAll('#buildBadge,.build-badge').forEach(el=>{ if(!el.textContent.trim()) el.textContent = buildInfo.buildLabel; }); }, 500);
}
window.addEventListener('error', event => {
  console.error('[VFM] erro global capturado', event.error || event.message);
});
window.addEventListener('unhandledrejection', event => {
  console.error('[VFM] promessa rejeitada capturada', event.reason);
});
boot();
