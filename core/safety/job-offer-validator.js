export function validateJobOffers(offers=[]){
  const seen = new Set();
  const safe = [];
  const issues = [];
  for(const offer of Array.isArray(offers)?offers:[]){
    const id = offer.id || `${offer.type||'offer'}-${offer.targetId||offer.name||safe.length}`;
    if(seen.has(id)){ issues.push(`Oferta duplicada ignorada: ${id}`); continue; }
    seen.add(id);
    safe.push({
      id,
      type: offer.type === 'national' ? 'national' : 'club',
      targetId: offer.targetId || id,
      name: offer.name || 'Clube interessado',
      role: offer.role || 'Treinador principal',
      status: offer.status || 'Sondagem',
      requiredRep: Math.max(1, Math.min(100, Number(offer.requiredRep || 45))),
      fit: Math.max(1, Math.min(100, Number(offer.fit || 50))),
      objective: offer.objective || 'campanha competitiva',
      pressure: offer.pressure || 'Média'
    });
  }
  return {status:issues.length?'warning':'ok', offers:safe, issues};
}
