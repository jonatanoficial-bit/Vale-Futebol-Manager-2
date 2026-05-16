import { getState, setState } from './state.js';
const routes = new Map(); let rootEl = null; let buildInfo = null;
export function register(name, renderer){ routes.set(name, renderer); }
export function initRouter(root, build){ rootEl = root; buildInfo = build; }
export function go(route){ const target = routes.has(route) ? route : 'lobby'; setState({route:target}); render(); }
export function render(){ const state = getState(); const renderer = routes.get(state.route) || routes.get('lobby'); try { rootEl.innerHTML = renderer(state); wire(rootEl); } catch(err){ console.error('[VFM] erro na tela, tela segura acionada', err); rootEl.innerHTML = `<main class="screen"><div class="module-placeholder"><h1>Modo seguro</h1><p>Uma tela apresentou erro, mas o jogo continua funcionando.</p><button class="main-btn" data-route="lobby">Voltar ao lobby</button></div>${build()}</main>`; wire(rootEl); } }
function build(){ return `<div class="build-badge">${buildInfo?.buildLabel || 'Build v0.1.0'}</div>`; }
function wire(scope){ scope.querySelectorAll('[data-route]').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.route))); scope.querySelectorAll('[data-action="reset-save"]').forEach(btn => btn.addEventListener('click', () => { localStorage.clear(); location.reload(); })); }
export function buildBadge(){ return build(); }
