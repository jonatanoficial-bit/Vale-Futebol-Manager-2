import { screenWrap, topbar } from './common.js';
import { teams, countries, gameModes } from '../data/gameData.js';
import { safeImg, clubLogo, country } from '../systems/assets.js';
import { money, esc } from '../utils/dom.js';
export function confirmCareer(state){
  const t=teams.find(x=>x.id===(state.ui?.selectedClub || state.clubId))||teams[0];
  const c=countries.find(x=>x.code===state.manager.country)||countries[0];
  const mode=gameModes.find(x=>x.id===state.manager.mode)||gameModes[0];
  return screenWrap('confirmCareer', `${topbar('Confirme seu desafio','Revise suas escolhas','teamSelect')}
  <section class="panel stack confirm-screen">
    <div class="row space"><span class="tag">Etapa 3 de 3</span><strong class="gold-text">${mode.short}</strong></div>
    <div class="confirm-grid">
      <div class="card manager-confirm">
        ${safeImg(state.manager.avatar,'avatar','Manager','manager-pic')}
        <div><div class="small">Nome do manager</div><h2>${esc(state.manager.name)}</h2><div class="row">${safeImg(country(state.manager.country),'country',c.name,'mini-flag')} ${c.name}</div><p class="small">Modo: ${mode.name}</p></div>
      </div>
      <div class="card club-confirm">
        ${safeImg(clubLogo(t.id),'club',t.name,'club-logo')}
        <div><div class="small">Clube escolhido</div><h2>${t.name}</h2><p class="small">${t.countryName} · ${t.stadium}</p><span class="tag">${t.level} Geral</span><p class="small">${t.difficulty || 'Médio'} · ${t.board || 'Competir forte'}</p></div>
      </div>
    </div>
    <div class="grid grid-2">
      <div class="panel"><div class="small">Valor do elenco</div><h2>${money(t.value)}</h2><p class="small">Orçamento inicial: ${money(t.budget)}</p></div>
      <div class="panel"><div class="small">Objetivo inicial</div><h2>Competir forte</h2><p class="small">Diretoria cobra evolução, equilíbrio financeiro e boa campanha.</p></div>
    </div>
    <div><h3>Competições que irá disputar</h3><div class="grid grid-2 desktop-4">${t.competitions.map(c=>`<div class="card competition-chip">🏆 <strong>${c}</strong><span class="small">Calendário preparado</span></div>`).join('')}</div></div>
    <button class="main-btn giant" data-action="start-career">Confirmar e começar</button>
  </section>`, true);
}
