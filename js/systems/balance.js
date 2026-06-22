import { clubPower, difficultyProfiles, aiWeights, leaguePaceProfiles } from '../data/balanceData.js';

function clamp(n, min, max){ return Math.max(min, Math.min(max, Number(n) || 0)); }
function hashCode(text=''){
  let h = 2166136261;
  for(const ch of String(text)){ h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return Math.abs(h >>> 0);
}
export function teamPower(id){ return Number(clubPower[id] || 72); }
export function difficultyProfile(id='realistic'){
  return difficultyProfiles.find(p=>p.id===id) || difficultyProfiles[1];
}
export function leagueProfile(id='brasileirao-a'){
  return leaguePaceProfiles.find(p=>p.id===id) || leaguePaceProfiles[0];
}
export function tacticalModifier(match={}){
  const decision = String(match.decision || 'balanced');
  const base = { possession:1.5, pressure:2.2, right:1.2, lowblock:-1.8, balanced:0 }[decision] || 0;
  const subs = Array.isArray(match.substitutions) ? Math.min(5, match.substitutions.length) : 0;
  return base + subs * 0.65 + Number(match.tacticalBoost || 0) * 0.35;
}
export function computeMatchAI(match={}, state={}){
  const diff = difficultyProfile(state.gameplay?.difficulty || 'realistic');
  const league = leagueProfile(match.competitionId || 'brasileirao-a');
  const homePower = teamPower(match.home || 'santos');
  const awayPower = teamPower(match.away || 'palmeiras');
  const tactic = tacticalModifier(match);
  const morale = clamp(((state.fanMood || 80) + (state.boardTrust || 76)) / 2, 20, 100);
  const fitness = clamp(82 - Math.max(0, Number(match.minute || 1) - 55) * 0.12, 55, 92);
  const homeAdv = 4.5;
  const seed = hashCode(`${match.id || 'match'}-${match.minute || 1}-${match.decision || 'balanced'}-${Array.isArray(match.substitutions)?match.substitutions.length:0}`);
  const varianceUnit = ((seed % 2001) / 1000) - 1;
  const variance = varianceUnit * (diff.variance / 10);
  const edge = (homePower - awayPower) + homeAdv + tactic + (morale - 75) * 0.07 + variance;
  const homeExpected = clamp(1.15 + edge / 28 + (league.tempo - 70) / 120, 0.25, 3.25);
  const awayExpected = clamp(1.02 - edge / 32 + (league.parity - 78) / 160, 0.15, 2.85);
  const winChance = clamp(50 + edge * 2.6, 8, 88);
  const drawChance = clamp(26 - Math.abs(edge) * 0.35, 12, 34);
  const awayChance = clamp(100 - winChance - drawChance, 6, 82);
  return { diff, league, homePower, awayPower, tactic, morale:Math.round(morale), fitness:Math.round(fitness), edge:Number(edge.toFixed(1)), homeExpected:Number(homeExpected.toFixed(2)), awayExpected:Number(awayExpected.toFixed(2)), winChance:Math.round(winChance), drawChance:Math.round(drawChance), awayChance:Math.round(awayChance), weights:aiWeights };
}
export function scoreFromTimeline(timeline=[], match={}, state={}){
  const minute = clamp(match.minute || 1, 1, 90);
  const base = timeline.filter(e => e.type === 'goal' && e.minute <= minute).reduce((acc,e)=>{
    if(e.team === (match.home || 'santos')) acc.home += 1;
    if(e.team === (match.away || 'palmeiras')) acc.away += 1;
    return acc;
  }, {home:0, away:0});
  if(minute < 90) return base;
  const ai = computeMatchAI(match, state);
  const seed = hashCode(`${match.id || 'match'}-final-${match.decision || 'balanced'}-${base.home}-${base.away}`);
  const homeNoise = ((seed % 7) - 3) * 0.12;
  const awayNoise = (((Math.floor(seed/7)) % 7) - 3) * 0.12;
  const homeGoals = clamp(Math.round(ai.homeExpected + homeNoise + base.home * 0.35), 0, 5);
  const awayGoals = clamp(Math.round(ai.awayExpected + awayNoise + base.away * 0.35), 0, 5);
  return {home:homeGoals, away:awayGoals};
}
export function buildBalanceSummary(match={}, state={}){
  const ai = computeMatchAI(match, state);
  return [
    `IA v1.9: ${ai.diff.name}`,
    `Força ${ai.homePower} x ${ai.awayPower}`,
    `Chance casa ${ai.winChance}% · empate ${ai.drawChance}% · visitante ${ai.awayChance}%`,
    `xG previsto ${ai.homeExpected} x ${ai.awayExpected}`,
    `Ritmo da liga ${ai.league.tempo}/100`
  ];
}
