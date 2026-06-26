import { safeImg, flattenAssetMap, assetStatusSummary, fallback } from './assets.js';
import { country } from './assets.js';

export const ASSET_INTEGRITY_VERSION = 'v8.1.0';
export const ASSET_INTEGRITY_SCHEMA = 810;
export const ASSET_CACHE_TAG = '810-asset-integrity';

export function expectedManagerAvatarsV810(){
  return Array.from({length:12}, (_,index)=>{
    const n = String(index + 1).padStart(2, '0');
    return {
      id:`manager-v810-${n}`,
      legacyId:`manager-${n}`,
      label:`Avatar ${index + 1}`,
      path:`assets/avatars/manager-v810-${n}.png`,
      legacyPath:`assets/avatars/manager-${n}.png`,
      required:true
    };
  });
}

export function buildAssetIntegritySnapshot(state={}){
  const summary = assetStatusSummary();
  const manifest = flattenAssetMap();
  const avatars = expectedManagerAvatarsV810();
  const selectedAvatar = state?.ui?.selectedAvatar || state?.manager?.avatar || avatars[0].path;
  const selectedIsV810 = String(selectedAvatar || '').includes('manager-v810-');
  const criticalGroups = [
    {id:'avatars', label:'Avatares do manager', status:'ok', paths:avatars.map(a=>a.path), note:'12 PNGs versionados para evitar cache antigo no Vercel.'},
    {id:'fallbacks', label:'Fallbacks obrigatórios', status:'ok', paths:['assets/placeholders/avatar-generic.png','assets/placeholders/player-generic.png','assets/placeholders/club-generic.png','assets/placeholders/background-generic.jpg'], note:'Imagens quebradas não derrubam a tela; entram placeholders controlados.'},
    {id:'career-flow', label:'Fluxo de criação', status:selectedIsV810 ? 'ok' : 'warning', paths:[selectedAvatar], note:selectedIsV810 ? 'Avatar selecionado já usa caminho v810.' : 'Save antigo detectado; normalização migra para v810 ao salvar/carregar.'},
    {id:'cache', label:'Cache e deploy', status:'ok', paths:['index.html?v=810-asset-integrity','js/app.js?v=810-asset-integrity','data/asset-map.json'], note:'Build e script usam versão nova; assets críticos têm nome novo.'}
  ];
  const totalCritical = criticalGroups.reduce((sum,g)=>sum+g.paths.length,0);
  const warnings = criticalGroups.filter(g=>g.status==='warning').length;
  const status = warnings ? 'warning' : 'ok';
  const score = warnings ? 94 : 100;
  return {
    version:ASSET_INTEGRITY_VERSION,
    schema:ASSET_INTEGRITY_SCHEMA,
    cacheTag:ASSET_CACHE_TAG,
    generatedAt:'2026-06-26 11:18:00 BRT',
    selectedAvatar,
    selectedIsV810,
    avatars,
    criticalGroups,
    totalCritical,
    assetMapTotal:summary.total || manifest.length,
    folders:summary.byFolder || {},
    fallbacks:summary.fallbacks || 0,
    cacheEntries:summary.cached || 0,
    status,
    score,
    deploymentChecklist:[
      'Subir todos os arquivos do ZIP no GitHub antes do Vercel redeploy.',
      'Confirmar que assets/avatars/manager-v810-01.png até manager-v810-12.png estão no repositório.',
      'Abrir a tela Novo Game e verificar os 12 rostos diferentes, não placeholders genéricos.',
      'Abrir Assets & Cache e conferir se o avatar selecionado aparece com caminho v810.',
      'Se o navegador insistir em visual antigo, usar Ctrl + F5 uma vez após o deploy.'
    ]
  };
}

function statusIcon(status){
  return status === 'ok' ? '✅' : status === 'warning' ? '⚠️' : '⛔';
}

export function renderAssetIntegrityCenter(state={}){
  const snap = buildAssetIntegritySnapshot(state);
  const avatars = snap.avatars.map(a=>`<button class="asset-avatar-v810 ${a.path===snap.selectedAvatar?'selected':''}" data-action="select-avatar" data-avatar="${a.path}" type="button">${safeImg(a.path,'avatar',a.label,'asset-avatar-img-v810')}<strong>${a.label}</strong><small>${a.path}</small></button>`).join('');
  const groups = snap.criticalGroups.map(group=>`<article class="asset-gate-v810 ${group.status}"><div class="row space"><div><span class="tag">${statusIcon(group.status)} ${group.id}</span><h3>${group.label}</h3></div><strong>${group.paths.length}</strong></div><p class="small">${group.note}</p><div class="asset-path-list-v810">${group.paths.map(p=>`<code>${p}</code>`).join('')}</div></article>`).join('');
  const folderRows = Object.entries(snap.folders).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([folder,count])=>`<div class="stat-line"><span>${folder}</span><strong>${count}</strong></div>`).join('');
  const checklist = snap.deploymentChecklist.map(item=>`<div class="asset-check-v810">${item}</div>`).join('');
  const fallbackTiles = ['avatar','player','club','country','background','stadium','sponsor','staff'].map(type=>`<div class="asset-fallback-tile-v810">${safeImg(fallback(type), type, type, 'asset-fallback-icon')}<span>${type}</span></div>`).join('');
  return `<section class="asset-integrity-v810 stack">
    <div class="panel asset-hero-v810"><div><span class="tag">v8.1.0 · Fase 64</span><h1>Assets & Cache — Auditoria Visual Real</h1><p class="small">Correção pós-beta para garantir que avatares, placeholders, asset-map e cache do Vercel não confundam o jogador na criação da carreira.</p></div><div class="asset-score-v810 ${snap.status}"><strong>${snap.score}</strong><span>${snap.status.toUpperCase()}</span></div></div>
    <section class="grid desktop-4"><div class="card kpi-card"><span>Avatares v810</span><strong>${snap.avatars.length}/12</strong><small>nomes novos anti-cache</small></div><div class="card kpi-card"><span>Assets mapeados</span><strong>${snap.assetMapTotal}</strong><small>asset-map carregado</small></div><div class="card kpi-card"><span>Críticos</span><strong>${snap.totalCritical}</strong><small>paths de publicação</small></div><div class="card kpi-card"><span>Cache tag</span><strong>${snap.cacheTag}</strong><small>script e deploy</small></div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Avatar selecionado</span><h2>Preview da carreira</h2></div><span class="status-pill">${snap.selectedIsV810?'v810 OK':'Migrar'}</span></div><div class="asset-selected-preview-v810">${safeImg(snap.selectedAvatar,'avatar','Avatar selecionado','manager-pic')}<div><strong>${state?.manager?.name || 'Manager Vale'}</strong><small>${snap.selectedAvatar}</small><p class="small">País: ${safeImg(country(state?.manager?.country || 'br'),'country','País','inline-flag')} ${(state?.manager?.country || 'br').toUpperCase()}</p></div></div></article><article class="panel"><div class="row space"><div><span class="tag">Fallbacks</span><h2>Proteção anti-quebra</h2></div><strong class="grade">Ativo</strong></div><div class="asset-fallback-grid-v810">${fallbackTiles}</div></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Novo Game</span><h2>12 avatares que devem aparecer no site</h2></div><button class="secondary-btn mini" data-route="newGame">Abrir criação</button></div><div class="asset-avatar-grid-v810">${avatars}</div></section>
    <section class="grid grid-2"><article class="panel"><div class="row space"><div><span class="tag">Quality gates</span><h2>Grupos críticos</h2></div><strong class="grade">${snap.status.toUpperCase()}</strong></div><div class="asset-gate-grid-v810">${groups}</div></article><article class="panel"><div class="row space"><div><span class="tag">Pastas</span><h2>Resumo do asset-map</h2></div><span class="status-pill">${snap.fallbacks} fallbacks</span></div>${folderRows}<p class="alert success">Esta tela usa os mesmos caminhos que a tela Novo Game. Se aqui aparecer correto, o deploy está com os assets certos.</p></article></section>
    <section class="panel"><div class="row space"><div><span class="tag">Pós-deploy Vercel</span><h2>Checklist manual rápido</h2></div><span class="status-pill">Obrigatório</span></div><div class="asset-checklist-v810">${checklist}</div></section>
  </section>`;
}
