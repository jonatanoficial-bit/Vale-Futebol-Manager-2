import { screenWrap, brand } from './common.js';
import { hasSave } from '../systems/state.js';

export function cover(){
  const saveReady = hasSave();
  return screenWrap('cover', `
    <section class="title-screen title-screen-clean-v740">
      <div class="cinema-overlay"></div>
      <div class="title-hero-card flow-cover-card-v731">
        ${brand('cover-logo')}
        <p class="title-kicker">Gold Edition · Save Slots 2.0</p>
        <h1>Construa sua dinastia no futebol.</h1>
        <p class="subtitle wide">Entrada definitiva: primeiro escolha o slot, depois jogue. Nada de módulos avançados na capa.</p>
        <div class="menu-actions main-menu-actions clean-entry-actions-v731">
          <button class="main-btn giant" data-route="mainMenu">${saveReady ? 'Continuar / escolher save' : 'Começar carreira'}</button>
          <button class="secondary-btn giant" data-route="mainMenu">Gerenciar slots</button>
        </div>
        <div class="flow-note-v731"><strong>Fluxo final:</strong> capa → central de slots → criação/continuação → lobby limpo → salvar e sair.</div>
      </div>
    </section>`, false);
}
