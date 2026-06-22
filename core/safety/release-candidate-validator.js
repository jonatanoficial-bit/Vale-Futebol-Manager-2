import { RELEASE_CANDIDATE_VERSION, RC_CHECKPOINTS_V600, RC_DEVICE_MATRIX_V600, RC_ROUTE_GATES_V600, RC_MANUAL_TEST_FLOW_V600 } from '../../js/data/releaseCandidateData.js';

export function validateReleaseCandidateSystem(snapshot={}){
  const errors = [];
  const warnings = [];
  const critical = RC_CHECKPOINTS_V600.filter(item=>item.critical);
  if(RELEASE_CANDIDATE_VERSION !== 'v6.0.0') errors.push('Versão RC divergente de v6.0.0.');
  if(RC_CHECKPOINTS_V600.length < 10) errors.push('Checklist público insuficiente.');
  if(critical.length < 6) errors.push('Poucos checkpoints críticos para Beta Pública.');
  if(RC_DEVICE_MATRIX_V600.length < 8) errors.push('Matriz mobile/tablet/desktop insuficiente.');
  if(RC_MANUAL_TEST_FLOW_V600.length < 10) errors.push('Roteiro manual da primeira jornada insuficiente.');
  ['cover','newGame','teamSelect','confirmCareer','lobby','match','pressConference','saveCenter','releaseCandidate'].forEach(route=>{
    if(!RC_ROUTE_GATES_V600.includes(route)) errors.push(`Rota obrigatória ausente no gate RC: ${route}`);
  });
  const score = Number(snapshot.score || 0);
  if(score && score < 90) warnings.push('Snapshot RC abaixo de 90%.');
  const lowCritical = critical.filter(item=>Number(item.score||0) < 90);
  lowCritical.forEach(item=>errors.push(`Checkpoint crítico abaixo de 90: ${item.label}`));
  return { ok: errors.length === 0, status: errors.length ? 'error' : warnings.length ? 'warning' : 'ok', errors, warnings, version: RELEASE_CANDIDATE_VERSION, checkedRoutes: RC_ROUTE_GATES_V600.length, checkedDevices: RC_DEVICE_MATRIX_V600.length };
}
