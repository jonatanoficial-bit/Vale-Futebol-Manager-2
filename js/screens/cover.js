import { screenWrap, brand } from './common.js';
import { hasSave } from '../systems/state.js';

export function cover(){
  const saveReady = hasSave();
  return screenWrap('cover', `
    <section class="title-screen title-screen-clean-v731">
      <div class="cinema-overlay"></div>
      <div class="title-hero-card flow-cover-card-v731">
        ${brand('cover-logo')}
        <p class="title-kicker">Gold Edition · Fluxo reorganizado</p>
        <h1>Construa sua dinastia no futebol.</h1>
        <p class="subtitle wide">Entrada limpa: continue seu save, crie uma nova carreira ou gerencie slots. Os módulos avançados ficam dentro do jogo, no Menu do Treinador.</p>
        <div class="menu-actions main-menu-actions clean-entry-actions-v731">
          <button class="main-btn giant" data-route="${saveReady ? 'lobby' : 'newGame'}">${saveReady ? 'Continuar carreira' : 'Criar primeira carreira'}</button>
          <button class="secondary-btn giant" data-route="mainMenu">Central inicial / slots</button>
          <button class="secondary-btn" data-route="newGame">Nova carreira</button>
          <button class="secondary-btn" data-route="saveCenter">Gerenciar saves</button>
        </div>
        <div class="flow-note-v731">
          <strong>Fluxo corrigido:</strong> capa → central inicial → carreira/saves. Sem duplicar todos os módulos na primeira tela.
        </div>
      </div>
    </section>`, false);
}
