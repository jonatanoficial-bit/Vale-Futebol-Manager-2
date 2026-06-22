
export function validateManagerJobMarketSystem(stateOrSnapshot={}){
 const career=stateOrSnapshot.career||stateOrSnapshot; const offers=Array.isArray(career.jobOffers)?career.jobOffers:(Array.isArray(stateOrSnapshot.offers)?stateOrSnapshot.offers:[]); const errors=[], warnings=[];
 if(!offers.length) warnings.push('Nenhuma proposta ativa no radar; use Atualizar radar.');
 offers.forEach((o,i)=>{ if(!o.id) errors.push(`Oferta ${i+1} sem id.`); if(!o.name) errors.push(`Oferta ${i+1} sem nome.`); if(!['club','national'].includes(o.type)) errors.push(`Oferta ${o.name||i+1} com tipo inválido.`); if(o.type==='club'&&!o.targetId) errors.push(`Oferta de clube ${o.name||i+1} sem targetId.`); if(Number(o.fit||0)<0||Number(o.fit||0)>100) errors.push(`Oferta ${o.name||i+1} com encaixe inválido.`); if(Number(o.wage||0)<0) errors.push(`Oferta ${o.name||i+1} com salário negativo.`); });
 const duplicated=offers.map(o=>o.id).filter((id,i,a)=>id&&a.indexOf(id)!==i); if(duplicated.length) errors.push(`Ofertas duplicadas: ${[...new Set(duplicated)].join(', ')}`);
 return {ok:errors.length===0,status:errors.length?'error':warnings.length?'warning':'ok',errors,warnings,checkedOffers:offers.length,version:'v5.9.6'};
}
