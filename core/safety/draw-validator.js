import { buildCopaDoBrasilBracket } from '../../js/systems/copaDoBrasilEngine.js';

export function validateDrawSafety(){
  const bracket = buildCopaDoBrasilBracket();
  const errors = [];
  bracket.stages.forEach(stage=>{
    const seen = new Set();
    stage.ties.forEach(tie=>{
      [tie.a.id,tie.b.id].forEach(id=>{ if(seen.has(id)) errors.push(`${stage.name}: clube repetido no sorteio (${id})`); seen.add(id); });
    });
  });
  return { status: errors.length ? 'error' : 'ok', errors, warnings: errors.length ? [] : ['Sorteio protegido: nenhum clube se repete dentro da mesma fase.'] };
}
