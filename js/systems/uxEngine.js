
import { uxAuditChecklist, releaseReadiness } from '../data/uxData.js';

export function clampScore(value){
  return Math.max(0, Math.min(100, Number(value) || 0));
}

export function buildUXAudit(state={}){
  const saveOk = !!state.manager && !!state.clubId && !!state.match && !!state.career;
  const gameplayOk = !!state.season && !!state.roster && !!state.transfer && !!state.finance;
  const rows = uxAuditChecklist.map(item => ({...item, score: clampScore(item.score)}));
  if(!saveOk) rows.push({area:'Estado do jogo',status:'Atenção',score:70,detail:'Estado principal incompleto, modo seguro sera acionado.'});
  if(!gameplayOk) rows.push({area:'Loop de gameplay',status:'Atenção',score:72,detail:'Algum sistema de gameplay nao retornou estado esperado.'});
  const avg = Math.round(rows.reduce((sum,item)=>sum + item.score, 0) / Math.max(1, rows.length));
  return {
    version:'v3.4.0',
    score: Math.min(releaseReadiness.score, avg),
    blockers: rows.filter(r => r.score < 75).length,
    status: rows.some(r=>r.score<75) ? 'Modo seguro recomendado' : 'Pronto para teste comercial',
    rows,
    generatedAt: new Date().toISOString(),
    recommendation: releaseReadiness.recommendation
  };
}

export function runtimeSafetySnapshot(state={}){
  const snapshot = buildUXAudit(state);
  return {
    ok: snapshot.blockers === 0,
    score: snapshot.score,
    version: snapshot.version,
    checklist: snapshot.rows.map(r => `${r.area}: ${r.status}`)
  };
}
