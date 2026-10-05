export const CAREER_RELATIONS_VERSION = '1.0.0';

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

function remember(relations, item) {
  relations.memory.unshift({ id:item.id || ('memory-'+Date.now()), date:item.date || new Date().toISOString(), ...item });
  relations.memory = relations.memory.slice(0, 40);
}

function identifyLeaders(roster = []) {
  return roster.slice().sort((a,b) => Number(b.attributes?.leadership || b.overall || 0) - Number(a.attributes?.leadership || a.overall || 0)).slice(0, 3).map(player => ({ id:player.id, name:player.name, influence:Math.round(Number(player.attributes?.leadership || player.overall || 60)) }));
}

export function ensureCareerRelations(career) {
  const current = career.relations || {};
  career.relations = {
    version:CAREER_RELATIONS_VERSION,
    cohesion:clamp(current.cohesion ?? 68, 1, 100),
    atmosphere:clamp(current.atmosphere ?? career.morale ?? 72, 1, 100),
    fanConfidence:clamp(current.fanConfidence ?? 58, 1, 100),
    mediaPressure:clamp(current.mediaPressure ?? 34, 0, 100),
    boardTrust:clamp(current.boardTrust ?? career.board ?? 70, 1, 100),
    leaders:identifyLeaders(career.roster || []),
    promises:Array.isArray(current.promises) ? current.promises.slice(-12) : [],
    memory:Array.isArray(current.memory) ? current.memory.slice(-40) : []
  };
  return career.relations;
}

export function makeCareerPromise(career, player, type = 'minutes') {
  const relations = ensureCareerRelations(career);
  if (!player) return null;
  const targets = { minutes:{ label:'mais minutos em campo', matches:4 }, role:{ label:'papel importante no elenco', matches:5 }, renewal:{ label:'conversar sobre renovação', matches:3 } };
  const target = targets[type] || targets.minutes;
  const promise = { id:'promise-'+Date.now(), playerId:player.id, playerName:player.name, type, label:target.label, remaining:target.matches, status:'active', createdAt:career.date };
  relations.promises = relations.promises.filter(item => item.playerId !== player.id || item.status !== 'active');
  relations.promises.push(promise);
  remember(relations, { type:'promise', title:'Promessa a '+player.name, detail:'Você prometeu '+target.label+'.' });
  player.morale = clamp(Number(player.morale || 70) + 3, 1, 100);
  return promise;
}

export function resolveCareerRelationsAfterMatch(career, context = {}) {
  const relations = ensureCareerRelations(career), result = context.result || 'draw';
  const delta = result === 'win' ? 3 : result === 'loss' ? -3 : 0;
  relations.cohesion = clamp(relations.cohesion + (result === 'win' ? 2 : result === 'loss' ? -1 : 0), 1, 100);
  relations.atmosphere = clamp(relations.atmosphere + delta, 1, 100);
  relations.fanConfidence = clamp(relations.fanConfidence + (result === 'win' ? 4 : result === 'loss' ? -3 : 0), 1, 100);
  relations.mediaPressure = clamp(relations.mediaPressure + (result === 'loss' ? 5 : result === 'win' ? -3 : -1), 0, 100);
  relations.boardTrust = clamp(career.board, 1, 100);
  const starters = new Set(context.lineupIds || []);
  relations.promises.forEach(promise => {
    if (promise.status !== 'active') return;
    promise.remaining--;
    const player = (career.roster || []).find(item => item.id === promise.playerId);
    if (starters.has(promise.playerId)) { promise.progress = Number(promise.progress || 0) + 1; if (player) player.morale = clamp(Number(player.morale || 70) + 1, 1, 100); }
    if (promise.remaining <= 0) {
      if (Number(promise.progress || 0) >= 2) { promise.status = 'fulfilled'; if (player) player.morale = clamp(Number(player.morale || 70) + 5, 1, 100); remember(relations, { type:'promise', title:'Promessa cumprida', detail:'O compromisso com '+promise.playerName+' fortaleceu o vestiário.' }); }
      else { promise.status = 'broken'; if (player) player.morale = clamp(Number(player.morale || 70) - 8, 1, 100); relations.atmosphere = clamp(relations.atmosphere - 3, 1, 100); remember(relations, { type:'promise', title:'Promessa não cumprida', detail:promise.playerName+' ficou frustrado com a falta de minutos.' }); }
    }
  });
  remember(relations, { type:'match', title:result === 'win' ? 'Vitória repercute bem' : result === 'loss' ? 'Resultado aumenta a cobrança' : 'Empate mantém o ambiente estável', detail:'Torcida '+relations.fanConfidence+' · imprensa '+relations.mediaPressure+' · vestiário '+relations.atmosphere+'.', date:context.date || career.date });
  return relations;
}

export function recordPressDecision(career, tone = 'calm') {
  const relations = ensureCareerRelations(career);
  const effects = { calm:{ atmosphere:2, fan:1, media:-1, label:'Discurso equilibrado' }, demanding:{ atmosphere:-1, fan:2, media:2, label:'Cobrança pública' }, protective:{ atmosphere:3, fan:0, media:1, label:'Proteção ao elenco' } };
  const effect = effects[tone] || effects.calm;
  relations.atmosphere = clamp(relations.atmosphere + effect.atmosphere, 1, 100);
  relations.fanConfidence = clamp(relations.fanConfidence + effect.fan, 1, 100);
  relations.mediaPressure = clamp(relations.mediaPressure + effect.media, 0, 100);
  remember(relations, { type:'press', title:effect.label, detail:'A declaração foi registrada na memória da temporada.' });
  return relations;
}

export function relationsSnapshot(career) {
  const relations = ensureCareerRelations(career);
  return { ...relations, activePromises:relations.promises.filter(item => item.status === 'active'), recentMemory:relations.memory.slice(0, 4) };
}
