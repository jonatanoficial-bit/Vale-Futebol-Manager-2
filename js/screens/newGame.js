import { screenWrap, topbar } from './common.js';
import { safeImg, country } from '../systems/assets.js';
import { countries, gameModes } from '../data/gameData.js';
import { esc } from '../utils/dom.js';

export function newGame(state){
  const selectedAvatar = state.ui?.selectedAvatar || state.manager.avatar || 'assets/avatars/manager-01.png';
  const selectedCountry = state.ui?.selectedCountry || state.manager.country || 'br';
  const selectedMode = state.ui?.selectedMode || state.manager.mode || 'career';
  const av=[1,2,3,4,5,6,7,8,9,10,11,12].map(i=>`assets/avatars/manager-${String(i).padStart(2,'0')}.png`);
  return screenWrap('newGame', `
    ${topbar('Novo Game','Crie seu manager','mainMenu',{resources:false})}
    <section class="career-create stack">
      <div class="panel create-hero">
        <div>
          <span class="tag">Etapa 1 de 3</span>
          <h1 class="title">Crie seu Manager</h1>
          <p class="subtitle">Escolha avatar, nome, país de origem e modo de jogo. Tudo fica salvo automaticamente e com proteção anti-quebra.</p>
        </div>
        <div class="manager-preview-card">
          ${safeImg(selectedAvatar,'avatar','Avatar selecionado','manager-pic')}
          <strong>${esc(state.manager.name)}</strong>
          <span class="small">${countryLabel(selectedCountry)} · ${modeLabel(selectedMode)}</span>
        </div>
      </div>

      <div class="panel">
        <div class="row space"><h2>Escolha seu avatar</h2><span class="small">12 espaços preparados</span></div>
        <div class="avatar-strip">
          ${av.map((a,i)=>`<button type="button" class="avatar-card compact ${a===selectedAvatar?'selected':''}" data-action="select-avatar" data-avatar="${a}" aria-label="Selecionar avatar ${i+1}">${safeImg(a,'avatar','Avatar','avatar-img')}<span class="small">${i+1}</span></button>`).join('')}
        </div>
      </div>

      <div class="panel stack">
        <label class="field"><span>Nome do manager</span><input id="managerName" class="input" value="${esc(state.manager.name)}" maxlength="32" placeholder="Digite seu nome" autocomplete="name"></label>
        <label class="field"><span>País de origem</span><select id="managerCountry" class="select" data-action="select-country">${countries.map(c=>`<option value="${c.code}" ${c.code===selectedCountry?'selected':''}>${c.name}</option>`).join('')}</select></label>
        <div class="country-preview">${safeImg(country(selectedCountry),'country',countryLabel(selectedCountry),'mini-flag')}<span>${countryLabel(selectedCountry)}</span><small>${continentLabel(selectedCountry)}</small></div>
      </div>

      <div class="panel">
        <div class="row space"><h2>Modo de jogo</h2><span class="small">pode ser expandido depois</span></div>
        <div class="mode-grid">
          ${gameModes.map(m=>`<button type="button" class="mode-card selectable ${m.id===selectedMode?'selected':''}" data-action="select-mode" data-mode="${m.id}"><div class="mode-icon">${m.id==='career'?'🏆':'🧪'}</div><strong>${m.name}</strong><p>${m.desc}</p></button>`).join('')}
        </div>
      </div>

      <div class="panel anti-break-note">
        <strong>Proteção desta build</strong>
        <p class="small">Se avatar, bandeira ou asset real não existir, o jogo usa placeholder automático. O save também valida nome vazio e dados antigos.</p>
      </div>

      <button class="main-btn giant" data-action="manager-next">Continuar</button>
    </section>`, false);
}
function countryLabel(code){ return countries.find(c=>c.code===code)?.name || 'Brasil'; }
function continentLabel(code){ return countries.find(c=>c.code===code)?.continent || 'Internacional'; }
function modeLabel(id){ return gameModes.find(m=>m.id===id)?.short || 'Carreira'; }
