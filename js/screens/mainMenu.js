import { screenWrap, brand } from './common.js';
import { getState } from '../systems/state.js';
import { renderSlotManagerHome } from '../systems/saveSlotsEngine.js';

export function mainMenu(state=getState()){
  return screenWrap('mainMenu', `
    <section class="main-title-layout main-menu-clean-v740">
      <div class="menu-top-brand compact-brand-v731">${brand('cover-logo')}</div>
      ${renderSlotManagerHome(state)}
      <div class="menu-actions footer-entry-actions-v731">
        <button class="secondary-btn" data-route="cover">Voltar para capa</button>
        <button class="secondary-btn" data-route="settings">Configurações</button>
        <button class="secondary-btn" data-route="saveCenter">Central técnica de save</button>
      </div>
    </section>`, false);
}
