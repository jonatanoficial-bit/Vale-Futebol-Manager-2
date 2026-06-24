import { teams } from '../data/gameData.js';
import { getActiveSquad, getSquadSummary } from '../data/squadData.js';

function clamp(n, min, max){ return Math.max(min, Math.min(max, Number(n)||0)); }
function hashString(text=''){
  let h = 2166136261;
  for(const ch of String(text)){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rand(seed, step=1){
  let x = (Number(seed) + step * 1013904223) >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return ((x >>> 0) % 10000) / 10000;
}
function team(id){ return teams.find(t=>t.id===id) || teams[0] || {id:'generic', name:'Time', level:70, reputation:70, league:'Liga', stadium:'Estádio'}; }
function clubLevel(id){ const t = team(id); return clamp(t.level || t.reputation || 70, 45, 96); }
function trainingEdgeFor(state={}, sideId=''){
  const club = state.clubId || state.ui?.selectedClub || 'santos';
  if(sideId !== club) return 0;
  const impact = state.training?.matchImpact || {};
  const readiness = Number(state.training?.matchReadiness || impact.readiness || 74);
  const fatigue = Number(state.calendar?.teamFatigue || 24);
  const edge = Number(impact.attack||0)*0.12 + Number(impact.defense||0)*0.10 + Number(impact.setPieces||0)*0.06 + Number(impact.tacticalControl||0)*0.14 + Number(impact.fitness||0)*0.10 + (readiness-74)*0.045 - Math.max(0, fatigue-66)*0.07 - Math.max(0, Number(impact.injury||0))*0.05;
  return clamp(edge, -7, 8);
}
function tacticBoost(state={}, homeId=''){
  const club = state.clubId || state.ui?.selectedClub || homeId;
  const isHomeClub = club === homeId;
  const selected = state.ui?.selectedFormation || '433-possession';
  const profile = state.ui?.tacticalProfile || 'possession';
  let boost = 0;
  if(selected.includes('433')) boost += 2;
  if(profile === 'possession') boost += 1.5;
  if(profile === 'direct') boost += .8;
  if(profile === 'lowblock') boost -= .4;
  boost += Number(state.match?.tacticalBoost || 0);
  boost += Number(state.training?.matchImpact?.tacticalControl || 0) * 0.08;
  return isHomeClub ? boost : -boost * .6;
}
function squadBoost(state={}){
  try {
    const summary = getSquadSummary(state);
    const avg = Number(summary.averageOverall || 70);
    const fit = Number(summary.fitness || 82);
    const morale = Number(summary.morale || 76);
    return {overall:avg, fitness:fit, morale, value: ((avg-70)*.45 + (fit-80)*.10 + (morale-75)*.12)};
  } catch(err){ return {overall:70, fitness:80, morale:75, value:0}; }
}
export function getDeepMatchContext(match={}, state={}){
  const home = team(match.home || state.clubId || 'santos');
  const away = team(match.away || 'palmeiras');
  const seed = hashString(`${match.id || `${home.id}-${away.id}`}-${state.season || 2026}`);
  const climateRoll = rand(seed, 7);
  const weather = climateRoll < .18 ? 'Chuva leve' : climateRoll < .34 ? 'Gramado pesado' : climateRoll > .88 ? 'Noite quente' : 'Clima ideal';
  const attendance = Math.round((21000 + clubLevel(home.id)*640 + rand(seed, 8)*18000) / 1000) * 1000;
  const refereeTone = rand(seed, 9) > .66 ? 'Rigoroso' : rand(seed, 9) < .28 ? 'Permissivo' : 'Equilibrado';
  const homeSquad = state.clubId === home.id ? squadBoost(state) : {overall:clubLevel(home.id), fitness:82, morale:76, value:(clubLevel(home.id)-70)*.38};
  const awaySquad = state.clubId === away.id ? squadBoost(state) : {overall:clubLevel(away.id), fitness:80, morale:74, value:(clubLevel(away.id)-70)*.38};
  const homeTrainingEdge = trainingEdgeFor(state, home.id);
  const awayTrainingEdge = trainingEdgeFor(state, away.id);
  const homeBase = clubLevel(home.id) + homeSquad.value + 3.5 + tacticBoost(state, home.id) + homeTrainingEdge;
  const awayBase = clubLevel(away.id) + awaySquad.value - tacticBoost(state, home.id)*.45 + awayTrainingEdge;
  const diff = clamp(homeBase - awayBase, -24, 24);
  const tempoBase = clamp(58 + Math.abs(diff)*.55 + rand(seed, 10)*18, 48, 82);
  return {home, away, seed, weather, attendance, refereeTone, homeSquad, awaySquad, homePower:homeBase, awayPower:awayBase, diff, tempoBase};
}
function projectedGoals(power, opp, seed, side){
  const edge = clamp((power-opp)/18, -1.4, 1.4);
  const noise = rand(seed, side==='home'?21:22) * .9;
  return clamp(0.85 + edge*.52 + noise, .2, 3.3);
}
export function scoreAtMinute(match={}, state={}, minuteOverride=null){
  const minute = clamp(minuteOverride ?? match.minute ?? 1, 1, 90);
  const ctx = getDeepMatchContext(match, state);
  const hExp = projectedGoals(ctx.homePower, ctx.awayPower, ctx.seed, 'home');
  const aExp = projectedGoals(ctx.awayPower, ctx.homePower, ctx.seed, 'away');
  const homePotential = Math.max(0, Math.min(5, Math.round(hExp + rand(ctx.seed, 31)*1.7 - .55)));
  const awayPotential = Math.max(0, Math.min(5, Math.round(aExp + rand(ctx.seed, 32)*1.5 - .60)));
  const homeMinutes = [18, 34, 57, 73, 86].map((m,i)=> clamp(m + Math.round((rand(ctx.seed, 40+i)-.5)*12), 6, 89)).sort((a,b)=>a-b);
  const awayMinutes = [22, 45, 63, 79, 88].map((m,i)=> clamp(m + Math.round((rand(ctx.seed, 50+i)-.5)*12), 7, 90)).sort((a,b)=>a-b);
  const home = homeMinutes.slice(0, homePotential).filter(m=>m<=minute).length;
  const away = awayMinutes.slice(0, awayPotential).filter(m=>m<=minute).length;
  return {home, away, homePotential, awayPotential, homeMinutes, awayMinutes};
}
function playerNameForEvent(side, state={}){
  const roster = getActiveSquad(state);
  const attackers = roster.filter(p=>['ATA','PE','PD','MEI'].includes(p.pos));
  const mids = roster.filter(p=>['MC','VOL','MEI'].includes(p.pos));
  const pool = side === 'home' ? (attackers.length ? attackers : roster) : [];
  if(pool.length){ return pool[Math.floor(Math.random()*pool.length)]?.name || 'atacante'; }
  return side === 'home' ? 'atacante da equipe' : 'atacante visitante';
}
function eventText(type, side, ctx, minute, state={}){
  const club = side === 'home' ? ctx.home.name : ctx.away.name;
  const opp = side === 'home' ? ctx.away.name : ctx.home.name;
  const actor = side === 'home' ? playerNameForEvent('home', state) : 'jogador visitante';
  const phrases = {
    kickoff:`Bola rolando. ${ctx.home.name} tenta impor o ritmo contra ${ctx.away.name}.`,
    chance:`${club} acelera a jogada e força a defesa do ${opp} a trabalhar dentro da área.`,
    shot:`${club} finaliza de média distância e aumenta o volume ofensivo.`,
    save:`O goleiro aparece bem após chegada perigosa do ${club}.`,
    goal:`${actor} aproveita a melhor chance do lance e balança a rede para o ${club}.`,
    card:`Falta tática interrompe contra-ataque. O árbitro mantém o controle disciplinar.`,
    var:`Lance revisado pela arbitragem de vídeo narrativa. Decisão mantida após checagem rápida.`,
    penalty:`Pressão na área, contato claro e pênalti marcado em lance decisivo.`,
    sub:`Banco se movimenta. A comissão identifica queda física e prepara alteração.`,
    halftime:`Intervalo. A comissão avalia posse, cansaço, riscos e encaixes táticos.`,
    fulltime:`Fim de jogo. Resultado integrado ao calendário, tabela e histórico da carreira.`
  };
  return phrases[type] || `${club} movimenta a partida aos ${minute}'.`;
}
export function buildDeepTimeline(match={}, state={}){
  const ctx = getDeepMatchContext(match, state);
  const score = scoreAtMinute(match, state, 90);
  const events = [{minute:1, type:'kickoff', side:'neutral', title:'Início', text:eventText('kickoff','neutral',ctx,1,state), x:50, y:50}];
  score.homeMinutes.slice(0, score.homePotential).forEach((m,i)=> events.push({minute:m, type:'goal', side:'home', title:`Gol do ${ctx.home.name}`, text:eventText('goal','home',ctx,m,state), x:62+rand(ctx.seed,60+i)*22, y:28+rand(ctx.seed,70+i)*44}));
  score.awayMinutes.slice(0, score.awayPotential).forEach((m,i)=> events.push({minute:m, type:'goal', side:'away', title:`Gol do ${ctx.away.name}`, text:eventText('goal','away',ctx,m,state), x:16+rand(ctx.seed,80+i)*22, y:28+rand(ctx.seed,90+i)*44}));
  const base = [8,14,27,39,51,66,78,84].map((m,i)=> clamp(m + Math.round((rand(ctx.seed,100+i)-.5)*7), 4, 89));
  const types = ['chance','shot','card','var','save','sub','chance','penalty'];
  base.forEach((m,i)=>{
    const type = types[i];
    if(type==='penalty' && rand(ctx.seed,130)<.55) return;
    const side = rand(ctx.seed,110+i) + (ctx.diff/50) > .5 ? 'home' : 'away';
    events.push({minute:m, type, side, title:titleFor(type, side, ctx), text:eventText(type, side, ctx, m, state), x:side==='home'?55+rand(ctx.seed,140+i)*32:13+rand(ctx.seed,150+i)*32, y:22+rand(ctx.seed,160+i)*56});
  });
  events.push({minute:45, type:'halftime', side:'neutral', title:'Intervalo', text:eventText('halftime','neutral',ctx,45,state), x:50, y:50});
  events.push({minute:90, type:'fulltime', side:'neutral', title:'Fim de jogo', text:eventText('fulltime','neutral',ctx,90,state), x:50, y:50});
  return events.sort((a,b)=>a.minute-b.minute || orderType(a.type)-orderType(b.type));
}
function orderType(t){ return t==='halftime'?9:t==='fulltime'?99:t==='goal'?2:4; }
function titleFor(type, side, ctx){
  const club = side === 'home' ? ctx.home.name : ctx.away.name;
  const map = {chance:`Chance do ${club}`, shot:`Finalização do ${club}`, save:'Defesa importante', card:'Cartão amarelo', var:'Checagem VAR', penalty:'Pênalti marcado', sub:'Substituição sugerida'};
  return map[type] || 'Evento';
}
export function buildDeepStats(match={}, state={}){
  const minute = clamp(match.minute || 1, 1, 90);
  const phase = clamp(minute/90, .05, 1);
  const ctx = getDeepMatchContext(match, state);
  const score = scoreAtMinute(match, state, minute);
  const subCount = Array.isArray(match.substitutions) ? match.substitutions.length : 0;
  const decision = match.decision || 'balanced';
  const decisionBonus = {pressure:6, possession:3, right:2, lowblock:-4, balanced:0}[decision] || 0;
  const fatigue = clamp(100 - minute*.45 - (decision==='pressure'?8:0) + subCount*2, 38, 100);
  const homePoss = clamp(50 + ctx.diff*.45 + decisionBonus + Math.sin(minute/9)*3, 34, 68);
  const awayPoss = 100 - Math.round(homePoss);
  const tempo = clamp(ctx.tempoBase + (decision==='pressure'?8:0) - (decision==='lowblock'?7:0), 40, 90);
  const hShots = Math.round((4 + phase*11 + ctx.diff*.08 + score.home*1.1 + (decision==='pressure'?1.4:0)));
  const aShots = Math.round((4 + phase*10 - ctx.diff*.07 + score.away*1.1 + (score.home>score.away?1.1:0)));
  const hOn = Math.max(score.home, Math.round(hShots*(.31 + rand(ctx.seed,200)*.13)));
  const aOn = Math.max(score.away, Math.round(aShots*(.30 + rand(ctx.seed,201)*.12)));
  const hxg = clamp((hShots*.085 + score.home*.38 + Math.max(0,ctx.diff)*.012) * phase + .12, .05, 4.4);
  const axg = clamp((aShots*.083 + score.away*.38 + Math.max(0,-ctx.diff)*.012) * phase + .10, .05, 4.1);
  const pressure = clamp(50 + ctx.diff*.8 + decisionBonus + (score.home<score.away?8:0) + Math.sin(minute/6)*11, 12, 88);
  return {
    ctx, score, phase, fatigue, tempo,
    possession:[Math.round(homePoss), awayPoss],
    shots:[Math.max(0,hShots), Math.max(0,aShots)],
    onTarget:[hOn,aOn],
    xg:[hxg.toFixed(2), axg.toFixed(2)],
    passes:[Math.round((220 + homePoss*5.2)*phase), Math.round((210 + awayPoss*5.1)*phase)],
    accuracy:[clamp(78 + ctx.diff*.12 + (decision==='possession'?4:0),68,91).toFixed(0), clamp(77 - ctx.diff*.10,66,90).toFixed(0)],
    tackles:[Math.round((9 + phase*13 - ctx.diff*.04)), Math.round((10 + phase*14 + ctx.diff*.05))],
    corners:[Math.round((1 + phase*5 + Math.max(0,ctx.diff)*.03)), Math.round((1 + phase*4 + Math.max(0,-ctx.diff)*.03))],
    fouls:[Math.round(5 + phase*9 + (decision==='pressure'?2:0)), Math.round(6 + phase*10 + (ctx.refereeTone==='Rigoroso'?2:0))],
    cards:[Math.round((ctx.refereeTone==='Rigoroso'?1:0) + (decision==='pressure' && minute>60?1:0)), Math.round((minute>30?1:0)+(ctx.refereeTone==='Rigoroso' && minute>70?1:0))],
    momentum:Math.round(pressure),
    matchRating:clamp(6.2 + (score.home+score.away)*.35 + tempo/100, 6.1, 9.6).toFixed(1),
    advanced: buildAdvancedMatchMetrics(match, state),
    playerImpact: buildPlayerImpactModel(match, state)
  };
}
export function buildDeepMatchSnapshot(match={}, state={}){
  const stats = buildDeepStats(match, state);
  const timeline = buildAdvancedTimeline(match, state);
  const minute = clamp(match.minute || 1, 1, 90);
  const visibleEvents = timeline.filter(e=>e.minute<=minute);
  return {stats, timeline, visibleEvents, score:stats.score, ctx:stats.ctx};
}
export function deepScoreFromState(match={}, state={}){
  const score = scoreAtMinute(match, state, match.minute || 90);
  return {home:score.home, away:score.away};
}

export function buildAdvancedMatchMetrics(match={}, state={}){
  const ctx = getDeepMatchContext(match, state);
  const minute = clamp(match.minute || 1, 1, 90);
  const phase = clamp(minute/90, .05, 1);
  const score = scoreAtMinute(match, state, minute);
  const decision = match.decision || 'balanced';
  const subCount = Array.isArray(match.substitutions) ? match.substitutions.length : 0;
  const tacticalRisk = {pressure:18, possession:6, right:10, lowblock:-8, balanced:0}[decision] || 0;
  const refereeRisk = ctx.refereeTone === 'Rigoroso' ? 10 : ctx.refereeTone === 'Permissivo' ? -6 : 0;
  const fatigue = clamp(100 - minute*.46 - (decision==='pressure'?10:0) + subCount*2.5, 34, 100);
  const homeCardRisk = clamp(18 + phase*38 + tacticalRisk + refereeRisk - Math.max(0,ctx.diff)*.18, 4, 86);
  const awayCardRisk = clamp(22 + phase*42 + refereeRisk + Math.max(0,ctx.diff)*.22, 5, 88);
  const trainingInjury = Number(state.training?.matchImpact?.injury || 0) + Math.max(0, Number(state.calendar?.injuryRisk || 18)-35)*0.12;
  const injuryRisk = clamp((100-fatigue)*.23 + (ctx.weather === 'Gramado pesado' ? 8 : 0) + (decision==='pressure'?4:0) + trainingInjury, 2, 38);
  const varRisk = clamp(7 + (score.home+score.away)*3 + Math.abs(ctx.diff)*.12 + phase*8, 4, 35);
  const penaltyRisk = clamp(6 + phase*11 + (decision==='pressure'?3:0) + rand(ctx.seed,404)*8, 3, 27);
  const tacticalControl = clamp(50 + ctx.diff*.65 + (decision==='possession'?8:0) + (decision==='lowblock'?-4:0), 22, 78);
  const transitionDanger = clamp(42 - ctx.diff*.42 + (decision==='pressure'?8:0) - (decision==='lowblock'?5:0), 18, 82);
  const setPieceTraining = Number(state.training?.matchImpact?.setPieces || 0);
  const setPieceThreat = clamp(34 + rand(ctx.seed,405)*28 + (ctx.refereeTone==='Rigoroso'?4:0) + setPieceTraining, 18, 88);
  const substitutionImpact = clamp(subCount * 7 + (subCount ? rand(ctx.seed,406)*8 : 0), 0, 36);
  return {
    version:'v4.7.0', fatigue:Math.round(fatigue), homeCardRisk:Math.round(homeCardRisk), awayCardRisk:Math.round(awayCardRisk),
    injuryRisk:Math.round(injuryRisk), varRisk:Math.round(varRisk), penaltyRisk:Math.round(penaltyRisk),
    tacticalControl:Math.round(tacticalControl), transitionDanger:Math.round(transitionDanger), setPieceThreat:Math.round(setPieceThreat),
    substitutionImpact:Math.round(substitutionImpact), decision, phase:Number(phase.toFixed(2))
  };
}

export function buildPlayerImpactModel(match={}, state={}){
  const roster = getActiveSquad(state);
  const ctx = getDeepMatchContext(match, state);
  const minute = clamp(match.minute || 1, 1, 90);
  const starters = roster.filter(p=>['Titular','Estrela','Rotação'].includes(p.status)).slice(0,11);
  const pool = starters.length >= 11 ? starters : roster.slice(0,11);
  return pool.map((p,i)=>{
    const overall = clamp(p.overall || 70, 45, 96);
    const fitness = clamp((p.fitness || 82) - minute*.18 + (i%3), 35, 100);
    const morale = clamp(p.morale || p.form || 75, 35, 99);
    const attacking = ['ATA','PE','PD','MEI'].includes(p.pos) ? 1 : ['MC','VOL'].includes(p.pos) ? .55 : .18;
    const defensive = ['GOL','ZAG','LD','LE','VOL'].includes(p.pos) ? 1 : ['MC'].includes(p.pos) ? .62 : .25;
    const eventWeight = clamp(overall*.56 + fitness*.18 + morale*.16 + (attacking*8) + rand(ctx.seed,500+i)*6, 30, 98);
    return {id:p.id, name:p.name, pos:p.pos, overall, fitness:Math.round(fitness), morale:Math.round(morale), attacking, defensive, eventWeight:Math.round(eventWeight)};
  });
}

export function buildAdvancedTimeline(match={}, state={}){
  const base = buildDeepTimeline(match, state).map(e=>({...e}));
  const ctx = getDeepMatchContext(match, state);
  const metrics = buildAdvancedMatchMetrics(match, state);
  const seed = ctx.seed;
  const advanced = [];
  const add = (minute,type,side,title,text,x,y,meta={}) => advanced.push({minute,type,side,title,text,x,y,advanced:true,meta});
  if(metrics.varRisk > 18) add(clamp(24 + Math.round(rand(seed,601)*46), 16, 84),'var', rand(seed,602)>.5?'home':'away','VAR narrativo','Checagem de possível impedimento/contato na área. A decisão é integrada sem travar a simulação.',50,50,{risk:metrics.varRisk});
  if(metrics.penaltyRisk > 18) {
    const side = rand(seed,603) + (ctx.diff/80) > .48 ? 'home' : 'away';
    add(clamp(38 + Math.round(rand(seed,604)*38), 31, 88),'penalty',side,'Pênalti em revisão','Contato na área gera penalidade. O motor avalia pressão, árbitro e volume ofensivo antes do desfecho.',side==='home'?74:26,45,{risk:metrics.penaltyRisk});
  }
  if(metrics.injuryRisk > 14) add(clamp(50 + Math.round(rand(seed,605)*32), 46, 86),'injury','home','Alerta físico','Jogador sente desgaste muscular. Comissão médica recomenda substituição preventiva.',48,62,{risk:metrics.injuryRisk});
  if(metrics.homeCardRisk > 54) add(clamp(28 + Math.round(rand(seed,606)*48), 22, 86),'card','home','Cartão por pressão','Marcação agressiva aumenta o risco disciplinar do mandante.',52,58,{risk:metrics.homeCardRisk});
  if(metrics.awayCardRisk > 55) add(clamp(20 + Math.round(rand(seed,607)*55), 18, 86),'card','away','Cartão visitante','Visitante interrompe transição e recebe amarelo após acúmulo de faltas.',43,41,{risk:metrics.awayCardRisk});
  if(metrics.transitionDanger > 58) add(clamp(64 + Math.round(rand(seed,608)*20), 56, 88),'pressure','away','Contra-ataque perigoso','Linhas altas abrem espaço para transição adversária.',29,52,{risk:metrics.transitionDanger});
  return base.concat(advanced).sort((a,b)=>a.minute-b.minute || orderType(a.type)-orderType(b.type));
}

export function simulateMatchStressTest(iterations=100, state={}){
  const errors = [];
  let goals = 0, cards = 0, injuries = 0, penalties = 0, vars = 0;
  for(let i=0;i<iterations;i++){
    try {
      const match = {...(state.match || {}), id:`stress-${i}`, minute:90, home:i%2?'santos':'flamengo', away:i%3?'palmeiras':'corinthians', decision:i%4===0?'pressure':i%4===1?'possession':i%4===2?'lowblock':'balanced'};
      const snap = buildDeepMatchSnapshot(match, state);
      const adv = buildAdvancedTimeline(match, state);
      goals += Number(snap.score.home||0) + Number(snap.score.away||0);
      cards += adv.filter(e=>e.type==='card').length;
      injuries += adv.filter(e=>e.type==='injury').length;
      penalties += adv.filter(e=>e.type==='penalty').length;
      vars += adv.filter(e=>e.type==='var').length;
      if(!snap.stats || !snap.score) errors.push(`snapshot ausente ${i}`);
    } catch(err){ errors.push(err?.message || String(err)); }
  }
  return {name:'match-engine-stress', version:'v4.7.0', iterations, status:errors.length?'error':'ok', errors, totals:{goals,cards,injuries,penalties,vars}, averages:{goalsPerMatch:Number((goals/iterations).toFixed(2)), cardsPerMatch:Number((cards/iterations).toFixed(2))}};
}

export function getPostMatchReport(match={}, state={}){
  const snap = buildDeepMatchSnapshot({...match, minute:90}, state);
  const s = snap.stats;
  const homeWin = s.score.home > s.score.away;
  const draw = s.score.home === s.score.away;
  return {
    score:s.score,
    headline: draw ? 'Empate decidido por detalhes' : homeWin ? `${snap.ctx.home.name} confirma força em casa` : `${snap.ctx.away.name} vence fora em noite eficiente`,
    bestMoment: snap.timeline.filter(e=>e.type==='goal').slice(-1)[0]?.text || 'Partida de muita disputa e poucos espaços claros.',
    tacticalRead: s.momentum > 58 ? 'Plano agressivo criou volume e presença territorial.' : s.momentum < 42 ? 'Equipe precisou baixar bloco e sofreu pressão.' : 'Jogo equilibrado, decidido em detalhes de execução.',
    boardNote: homeWin ? '+ confiança' : draw ? 'estabilidade' : 'pressão moderada',
    fanNote: homeWin ? 'torcida satisfeita' : draw ? 'torcida dividida' : 'torcida cobra reação',
    stats:s
  };
}
