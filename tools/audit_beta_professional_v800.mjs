import fs from 'fs';
import path from 'path';
import { defaultState } from '../js/systems/state.js';
import { moduleScreen } from '../js/screens/moduleScreen.js';
import { lobby, managerMenu, MANAGER_MENU_GROUPS_V550 } from '../js/screens/lobby.js';
import { cover } from '../js/screens/cover.js';
import { mainMenu } from '../js/screens/mainMenu.js';
import { newGame } from '../js/screens/newGame.js';
import { teamSelect } from '../js/screens/teamSelect.js';
import { confirmCareer } from '../js/screens/confirmCareer.js';
import { match } from '../js/screens/match.js';
import { pressConference } from '../js/screens/pressConference.js';
import { buildBetaProfessionalSnapshot } from '../js/systems/betaProfessionalEngine.js';
import { validateBetaProfessionalSystem } from '../core/safety/beta-professional-validator.js';
import { buildSaveSlotsV2Snapshot } from '../js/systems/saveSlotsEngine.js';
import { validateSaveSlotsV2System } from '../core/safety/save-slots-v2-validator.js';
import { buildLiveCalendarSnapshot } from '../js/systems/liveCalendarEngine.js';
import { validateLiveCalendarSystem } from '../core/safety/live-calendar-validator.js';
import { buildScoutingSnapshot } from '../js/systems/scoutingEngine.js';
import { validateScoutingSystem } from '../core/safety/scouting-validator.js';
import { buildWeeklyTrainingSnapshot } from '../js/systems/trainingEngine.js';
import { validateWeeklyTrainingSystem } from '../core/safety/weekly-training-validator.js';
import { buildStaffSnapshot } from '../js/systems/staffEngine.js';
import { validateStaffSystem } from '../core/safety/staff-validator.js';
import { buildFinanceSnapshot } from '../js/systems/financeEngine.js';
import { validateFinanceV790System } from '../core/safety/finance-v790-validator.js';

globalThis.window={__VFM_MANAGER_MENU_GROUPS__:MANAGER_MENU_GROUPS_V550};
const state=defaultState();
const routes = {
  cover:()=>cover(state), mainMenu:()=>mainMenu(state), newGame:()=>newGame(state), teamSelect:()=>teamSelect(state), confirmCareer:()=>confirmCareer(state), lobby:()=>lobby(state), managerMenu:()=>managerMenu(state), match:()=>match(state), pressConference:()=>pressConference(state),
  betaProfessional:()=>moduleScreen('betaProfessional','Beta Profissional','Auditoria final',state), saveSlotsV2:()=>moduleScreen('saveSlotsV2','Slots','',state), calendar:()=>moduleScreen('calendar','Calendário Vivo','',state), academyScouting:()=>moduleScreen('academyScouting','Scout','',state), training:()=>moduleScreen('training','Treino','',state), staff:()=>moduleScreen('staff','Staff','',state), financeCenter:()=>moduleScreen('financeCenter','Finanças','',state), finances:()=>moduleScreen('finances','Financeiro','',state), sponsorship:()=>moduleScreen('sponsorship','Patrocínio','',state), squad:()=>moduleScreen('squad','Elenco','',state), formation:()=>moduleScreen('formation','Tática','',state), transfers:()=>moduleScreen('transfers','Mercado','',state), messages:()=>moduleScreen('messages','Email','',state)
};
const routeResults = Object.entries(routes).map(([route, fn])=>{
  try { const html = fn(); return {route, ok:typeof html==='string' && html.length>100, htmlLength: String(html||'').length}; }
  catch(error){ return {route, ok:false, error:String(error && error.stack || error).slice(0,800)}; }
});
const betaSnapshot = buildBetaProfessionalSnapshot(state, MANAGER_MENU_GROUPS_V550);
const systemChecks = {
  betaProfessional: validateBetaProfessionalSystem(betaSnapshot),
  saveSlots: validateSaveSlotsV2System(buildSaveSlotsV2Snapshot(state)),
  liveCalendar: validateLiveCalendarSystem(buildLiveCalendarSnapshot(state)),
  scouting: validateScoutingSystem(buildScoutingSnapshot(state)),
  weeklyTraining: validateWeeklyTrainingSystem(buildWeeklyTrainingSnapshot(state)),
  staff: validateStaffSystem(buildStaffSnapshot(state)),
  finance: validateFinanceV790System(buildFinanceSnapshot(state))
};
const failedRoutes = routeResults.filter(r=>!r.ok);
const failedSystems = Object.entries(systemChecks).filter(([,v])=>!v.ok);
const result = {
  version:'v8.0.1',
  phase:'Fase 63.1 — Hotfix Beta Profissional / Avatares',
  generatedAt:'2026-06-26 10:58:00 BRT',
  status: failedRoutes.length || failedSystems.length ? 'ERROR' : 'OK',
  betaScore: betaSnapshot.overallScore,
  duplicateRoutesRemoved: betaSnapshot.duplicateRoutesRemoved,
  routeSmoke: {tested:routeResults.length, failed:failedRoutes.length, routes:routeResults},
  systemChecks,
  betaSnapshot
};
console.log(JSON.stringify(result,null,2));
if(result.status !== 'OK') process.exit(1);
