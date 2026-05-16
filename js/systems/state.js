const key = 'vfm_gold_save_v010';
export const defaultState = () => ({
  route:'cover', manager:{ name:'Joao Victor', country:'br', avatar:'assets/avatars/manager-01.png', reputation:82, mode:'career' },
  clubId:'santos', season:2024, month:'Julho', money:92.5, coins:250, notifications:3,
  match:{ minute:57, home:'santos', away:'palmeiras', homeGoals:1, awayGoals:0, speed:1 }
});
let state = defaultState();
export function getState(){ return state; }
export function setState(patch){ state = {...state, ...patch}; persist(); }
export function setManager(patch){ state.manager = {...state.manager, ...patch}; persist(); }
export function persist(){ try { localStorage.setItem(key, JSON.stringify(state)); } catch(err){ console.warn('[VFM] save local indisponivel', err); } }
export function load(){ try { const raw = localStorage.getItem(key); if(raw) state = {...defaultState(), ...JSON.parse(raw)}; } catch(err){ console.warn('[VFM] save corrompido, reset seguro', err); state = defaultState(); } return state; }
export function reset(){ state = defaultState(); persist(); }
