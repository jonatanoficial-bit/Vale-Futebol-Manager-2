import { screenWrap, brand } from './common.js';
import { hasSave, getState } from '../systems/state.js';
import { listSlots } from '../systems/saveManager.js';
import { teams } from '../data/gameData.js';
import { clubLogo, safeImg } from '../systems/assets.js';

function slotLabel(slot){
  return String(slot || 'principal').replace('principal','Carreira principal').replace('career-2','Carreira 2').replace('career-3','Carreira 3').replace('career-4','Carreira 4').replace('career-5','Carreira 5').replace(/-/g,' ');
}
function renderSlotRows(){
  let slots = [];
  try { slots = listSlots(); } catch(err){ slots = []; }
  if(!slots.length) return '<div class="empty-slot-v731"><strong>Nenhum slot salvo ainda.</strong><span>Crie uma nova carreira para liberar continuar.</span></div>';
  return slots.slice(0,5).map(s=>{
    const team = teams.find(t=>t.id === s.clubId);
    return `<button class="save-slot-row-v731" data-action="load-save-slot" data-slot="${s.slot}">
      <span class="slot-logo-v731">${team ? safeImg(clubLogo(team.id),'club',team.name,'mini-crest-v731') : '💾'}</span>
      <span><strong>${slotLabel(s.slot)}</strong><small>${s.manager || 'Manager'} · ${team?.name || s.clubId || 'Clube'} · ${s.updatedAt ? String(s.updatedAt).slice(0,10) : 'sem data'}</small></span>
      <em>Carregar</em>
    </button>`;
  }).join('');
}
export function mainMenu(state=getState()){
  const saveReady = hasSave();
  const activeSlot = state?.save?.activeSlot || 'principal';
  return screenWrap('mainMenu', `
    <section class="main-title-layout main-menu-clean-v731">
      <div class="menu-top-brand compact-brand-v731">${brand('cover-logo')}</div>
      <div class="menu-panel glass-panel entry-panel-v731">
        <span class="tag">Central inicial corrigida</span>
        <h1>Escolha seu save</h1>
        <p class="subtitle">Aqui o jogador decide se continua, cria outra carreira ou gerencia slots. As telas premium ficam dentro do jogo, não na entrada.</p>
        <div class="entry-grid-v731">
          <article class="panel entry-card-v731 primary-entry-v731">
            <h2>${saveReady ? 'Continuar carreira' : 'Começar agora'}</h2>
            <p>${saveReady ? `Slot ativo: ${slotLabel(activeSlot)}.` : 'Nenhum save encontrado neste navegador.'}</p>
            <button class="main-btn giant" data-route="${saveReady ? 'lobby' : 'newGame'}">${saveReady ? 'Entrar no lobby' : 'Nova carreira'}</button>
          </article>
          <article class="panel entry-card-v731">
            <h2>Nova carreira</h2>
            <p>Crie outro treinador sem precisar apagar o save principal.</p>
            <div class="slot-create-row-v731">
              <button class="secondary-btn" data-action="new-career-slot" data-slot="principal">Principal</button>
              <button class="secondary-btn" data-action="new-career-slot" data-slot="career-2">Slot 2</button>
              <button class="secondary-btn" data-action="new-career-slot" data-slot="career-3">Slot 3</button>
            </div>
          </article>
        </div>
        <section class="panel saved-slots-panel-v731">
          <div class="row space"><div><span class="tag">Slots salvos</span><h2>Carreiras disponíveis</h2></div><button class="secondary-btn mini" data-route="saveCenter">Central de save</button></div>
          <div class="save-slot-list-v731">${renderSlotRows()}</div>
        </section>
        <div class="menu-actions footer-entry-actions-v731">
          <button class="secondary-btn" data-route="cover">Voltar para capa</button>
          <button class="secondary-btn" data-route="settings">Configurações</button>
          <button class="secondary-btn danger" data-action="reset-save">Resetar dados locais</button>
        </div>
      </div>
    </section>`, false);
}
