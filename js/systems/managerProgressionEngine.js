import { MANAGER_PROGRESSION_VERSION, managerLevelTiers, managerSpecialties, xpRewards, managerAchievements } from '../data/managerProgressionData.js';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n||0))); }
function nowDate(){ try { return new Date().toISOString().slice(0,10); } catch(err){ return '2026-05-20'; } }
export function xpForNextLevel(level=1){
  const next = managerLevelTiers.find(t => t.level === Number(level)+1);
  return next ? next.minXp : managerLevelTiers[managerLevelTiers.length-1].minXp;
}
export function tierForXp(xp=0){
  const safeXp = Math.max(0, Number(xp||0));
  return [...managerLevelTiers].reverse().find(t => safeXp >= t.minXp) || managerLevelTiers[0];
}
export function normalizeManagerProgression(state={}){
  const raw = state.career?.managerProgression || {};
  const seededXp = Number(raw.xp ?? Math.max(0, (Number(state.manager?.reputation||50)-35)*18));
  const tier = tierForXp(seededXp);
  const unlocked = Array.isArray(raw.unlockedSpecialties) ? raw.unlockedSpecialties : managerSpecialties.filter(s=>s.unlockLevel <= tier.level).slice(0,2).map(s=>s.id);
  const achievements = Array.isArray(raw.achievements) ? raw.achievements : [];
  const history = Array.isArray(raw.history) ? raw.history.slice(-40) : [{date:nowDate(), label:'Carreira iniciada', xp:0, reason:'Sistema de progressão ativado'}];
  const focus = raw.focus || unlocked[0] || 'tactician';
  const nextXp = xpForNextLevel(tier.level);
  const prevXp = tier.minXp;
  const progress = tier.level >= 10 ? 100 : Math.round(((seededXp - prevXp) / Math.max(1, nextXp - prevXp))*100);
  return {
    version: MANAGER_PROGRESSION_VERSION,
    xp: Math.round(seededXp),
    level: tier.level,
    title: tier.title,
    license: tier.license,
    perk: tier.perk,
    progress: clamp(progress,0,100),
    nextLevelXp: nextXp,
    currentLevelXp: prevXp,
    focus,
    unlockedSpecialties: unlocked,
    achievements,
    history,
    lastUpdated: raw.lastUpdated || nowDate()
  };
}
export function buildManagerProgressionSnapshot(state={}){
  const progression = normalizeManagerProgression(state);
  const availableSpecialties = managerSpecialties.map(s=>({ ...s, unlocked: progression.unlockedSpecialties.includes(s.id) || progression.level >= s.unlockLevel, selected: progression.focus === s.id }));
  const achievementCards = managerAchievements.map(a=>({ ...a, unlocked: progression.achievements.includes(a.id) }));
  const reputation = Number(state.manager?.reputation || 50);
  const rankingScore = Math.round(progression.level*8 + reputation*.55 + Math.min(18, progression.xp/250));
  const ranking = rankingScore >= 92 ? 'Top mundial' : rankingScore >= 78 ? 'Elite continental' : rankingScore >= 64 ? 'Nacional forte' : rankingScore >= 48 ? 'Em crescimento' : 'Iniciante';
  return { version:MANAGER_PROGRESSION_VERSION, progression, availableSpecialties, achievementCards, ranking, rankingScore:clamp(rankingScore,1,100), rewards:xpRewards };
}
export function awardManagerXpPatch(state={}, amount=0, reason='progressão', meta={}){
  const before = normalizeManagerProgression(state);
  const xpGain = Math.max(0, Math.round(Number(amount||0)));
  const nextXp = before.xp + xpGain;
  const afterTier = tierForXp(nextXp);
  const levelUp = afterTier.level > before.level;
  const unlockedSpecialties = [...new Set([...(before.unlockedSpecialties||[]), ...managerSpecialties.filter(s=>s.unlockLevel <= afterTier.level).map(s=>s.id)])];
  const achievements = new Set(before.achievements||[]);
  const completedMatches = state.career?.completedMatches || [];
  if(completedMatches.length >= 1) achievements.add('first-match');
  if(completedMatches.some(m=>Number(m.points||0)===3)) achievements.add('first-win');
  if((state.career?.pressHistory||[]).length >= 3) achievements.add('press-master');
  if(Number(state.career?.completedSeasons||0) >= 1) achievements.add('season-survivor');
  if(afterTier.level >= 7) achievements.add('continental-radar');
  if(afterTier.level >= 10) achievements.add('world-class');
  const reputationDelta = levelUp ? Math.max(1, Math.round((afterTier.level - before.level)*1.5)) : (xpGain >= 120 ? 1 : 0);
  const nextRep = clamp(Number(state.manager?.reputation||50) + reputationDelta, 1, 100);
  const history = [...(before.history||[]), { date: state.career?.currentDate || nowDate(), label: levelUp ? `Subiu para nível ${afterTier.level}` : reason, xp: xpGain, reason, level: afterTier.level, ...meta }].slice(-40);
  const nextProgression = normalizeManagerProgression({ ...state, manager:{...(state.manager||{}), reputation:nextRep}, career:{...(state.career||{}), managerProgression:{...before, xp:nextXp, level:afterTier.level, unlockedSpecialties, achievements:[...achievements], history, lastUpdated:nowDate()}} });
  const story = Array.isArray(state.career?.activeStory) ? state.career.activeStory.slice(-5) : [];
  const storyMsg = levelUp ? `Você alcançou o nível ${afterTier.level}: ${afterTier.title}. Nova licença: ${afterTier.license}.` : `Progressão do treinador: +${xpGain} XP por ${reason}.`;
  return {
    manager:{...(state.manager||{}), reputation:nextRep},
    career:{...(state.career||{}), managerProgression:nextProgression, activeStory:[...story, storyMsg].slice(-6), managerTimeline:[...((state.career?.managerTimeline)||[]), {date:state.career?.currentDate || nowDate(), title:'Evolução do treinador', text:storyMsg}].slice(-24)},
    notifications:Number(state.notifications||0) + (levelUp ? 1 : 0)
  };
}
export function xpForMatchResult(result={}){
  const points = Number(result.points||0);
  let xp = points === 3 ? xpRewards.matchWin : points === 1 ? xpRewards.matchDraw : xpRewards.matchLoss;
  if(String(result.stage||'').toLowerCase().includes('final') || String(result.competition||'').toLowerCase().includes('libertadores')) xp += xpRewards.bigGame;
  const report = result.report || {};
  if(Number(report?.score?.userGoals||result.homeGoals||0) > Number(report?.score?.opponentGoals||result.awayGoals||0) && (Number(result.homeGoals||0)===0 || Number(result.awayGoals||0)===0)) xp += xpRewards.cleanSheet;
  return xp;
}
export function setManagerSpecialtyPatch(state={}, specialtyId='tactician'){
  const progression = normalizeManagerProgression(state);
  const allowed = managerSpecialties.some(s => s.id === specialtyId && (progression.unlockedSpecialties.includes(s.id) || progression.level >= s.unlockLevel));
  if(!allowed) return {};
  return { career:{...(state.career||{}), managerProgression:{...progression, focus:specialtyId, lastUpdated:nowDate()}} };
}
