import { BALANCE_TARGETS_V597, BALANCE_PRESETS_V597, BALANCE_RULES_V597, BALANCE_GENERAL_VERSION } from '../../js/data/balanceGeneralData.js';

export function validateBalanceGeneralSystem(state={}){
  const errors = [];
  const warnings = [];
  if(BALANCE_PRESETS_V597.length < 3) errors.push('Perfis de dificuldade insuficientes.');
  if(BALANCE_TARGETS_V597.length < 6) errors.push('Poucos indicadores de balanceamento.');
  BALANCE_TARGETS_V597.forEach(t=>{
    if(t.current < t.min || t.current > t.max) errors.push(`${t.label} fora da faixa segura.`);
    if(typeof t.note !== 'string' || t.note.length < 12) warnings.push(`${t.label} sem nota explicativa robusta.`);
  });
  if(!BALANCE_RULES_V597?.career?.nationalTeamInviteMinReputation) errors.push('Regra de convite de seleção ausente.');
  if(Number(state.manager?.reputation || 82) > 98) warnings.push('Reputação do save atual está muito próxima do teto.');
  return { ok: errors.length===0, status: errors.length?'error':warnings.length?'warning':'ok', errors, warnings, version:BALANCE_GENERAL_VERSION, checkedTargets:BALANCE_TARGETS_V597.length, checkedPresets:BALANCE_PRESETS_V597.length };
}
