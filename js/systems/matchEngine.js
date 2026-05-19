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
  const homeBase = clubLevel(home.id) + homeSquad.value + 3.5 + tacticBoost(state, home.id);
  const awayBase = clubLevel(away.id) + awaySquad.value - tacticBoost(state, home.id)*.45;
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
    matchRating:clamp(6.2 + (score.home+score.away)*.35 + tempo/100, 6.1, 9.6).toFixed(1)
  };
}
export function buildDeepMatchSnapshot(match={}, state={}){
  const stats = buildDeepStats(match, state);
  const timeline = buildDeepTimeline(match, state);
  const minute = clamp(match.minute || 1, 1, 90);
  const visibleEvents = timeline.filter(e=>e.minute<=minute);
  return {stats, timeline, visibleEvents, score:stats.score, ctx:stats.ctx};
}
export function deepScoreFromState(match={}, state={}){
  const score = scoreAtMinute(match, state, match.minute || 90);
  return {home:score.home, away:score.away};
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
