import { screenWrap, brand } from './common.js';
import { hasSave } from '../systems/state.js';
import { safeImg } from '../systems/assets.js';

export function mainMenu(state){
  const saveReady = hasSave();
  const quick = [
    ['career','Modo Carreira','Comece pequeno, evolua sua reputação e receba propostas de clubes e seleções.'],
    ['sandbox','Sandbox','Liberdade para testar elencos, competições e cenários sem travas.'],
    ['assets','Assets prontos','Use imagens genéricas agora e substitua depois sem mexer no código.']
  ];
  return screenWrap('mainMenu', `
    <section class="main-title-layout">
      <div class="menu-top-brand">${brand('cover-logo')}</div>
      <div class="gold-divider"></div>
      <div class="menu-panel glass-panel">
        <h1>Menu principal</h1>
        <p class="subtitle">Escolha como iniciar sua jornada no Vale Futebol Manager: Gold Edition.</p>
        <div class="menu-actions main-menu-actions">
          <button class="main-btn giant" data-route="newGame">⚽ Novo jogo</button>
          <button class="secondary-btn giant ${saveReady?'':'disabled-soft'}" data-route="${saveReady?'lobby':'newGame'}">📁 Continuar ${saveReady?'':'(novo save)'}</button>
          <button class="secondary-btn" data-route="settings">⚙️ Configurações</button>
        </div>
      </div>
      <div class="mode-grid">
        ${quick.map(([icon,title,desc])=>`<article class="mode-card"><div class="mode-icon">${iconSymbol(icon)}</div><strong>${title}</strong><p>${desc}</p></article>`).join('')}
      </div>
      <div class="asset-preview panel">
        <div>
          <strong>Sistema de imagens preparado</strong>
          <p class="small">O jogo usa placeholders se uma imagem não existir. Quando você subir um arquivo no caminho oficial, ele aparece automaticamente.</p>
        </div>
        <div class="asset-mini-row">
          ${['br','ar','gb','es','it','de'].map(code=>safeImg(`assets/countries/${code}.png`,'country',code,'mini-flag')).join('')}
        </div>
      </div>
    </section>`, false);
}
function iconSymbol(id){ return ({career:'🏆',sandbox:'🧪',assets:'🖼️'})[id] || '⚽'; }
