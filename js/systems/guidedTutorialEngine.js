import { guidedTutorialSteps, tutorialBadges, GUIDED_TUTORIAL_VERSION } from '../data/guidedTutorialData.js';

function clamp(n,min=0,max=100){ return Math.max(min, Math.min(max, Number(n||0))); }
function completedIds(state={}){ return new Set(Array.isArray(state.career?.tutorial?.completedSteps) ? state.career.tutorial.completedSteps : []); }
export function normalizeGuidedTutorial(tutorial={}){
  return {
    seen:Boolean(tutorial.seen),
    step:Math.max(1, Number(tutorial.step || 1)),
    completed:Boolean(tutorial.completed),
    activeStep:String(tutorial.activeStep || 'welcome-club'),
    completedSteps:Array.isArray(tutorial.completedSteps) ? [...new Set(tutorial.completedSteps)].slice(0,50) : [],
    claimedRewards:Array.isArray(tutorial.claimedRewards) ? [...new Set(tutorial.claimedRewards)].slice(0,50) : [],
    version:GUIDED_TUTORIAL_VERSION
  };
}
export function buildGuidedTutorialSnapshot(state={}){
  const tutorial = normalizeGuidedTutorial(state.career?.tutorial || {});
  const done = completedIds(state);
  const current = guidedTutorialSteps.find(s=>!done.has(s.id)) || guidedTutorialSteps[guidedTutorialSteps.length-1];
  const steps = guidedTutorialSteps.map(step=>{
    const completed = done.has(step.id);
    return {
      ...step,
      completed,
      active:step.id === (current?.id || tutorial.activeStep),
      percent:completed ? 100 : step.id === (current?.id || tutorial.activeStep) ? 50 : 0
    };
  });
  const completedCount = steps.filter(s=>s.completed).length;
  const badges = tutorialBadges.map(b=>{
    let unlocked = false;
    if(b.condition==='complete-3') unlocked = completedCount>=3;
    if(b.condition==='press') unlocked = done.has('press-first');
    if(b.condition==='save') unlocked = done.has('save-career');
    return {...b, unlocked};
  });
  return {
    version:GUIDED_TUTORIAL_VERSION,
    tutorial,
    currentStep:current,
    steps,
    badges,
    completedCount,
    total:steps.length,
    progress:Math.round((completedCount/Math.max(1,steps.length))*100),
    status:completedCount===steps.length ? 'completed' : 'active'
  };
}
export function completeTutorialStepPatch(state={}, stepId){
  const step = guidedTutorialSteps.find(s=>s.id===stepId) || guidedTutorialSteps[0];
  const tutorial = normalizeGuidedTutorial(state.career?.tutorial || {});
  const completed = new Set(tutorial.completedSteps);
  const claimed = new Set(tutorial.claimedRewards);
  const alreadyDone = completed.has(step.id);
  completed.add(step.id);
  claimed.add(step.id);
  const completedSteps = [...completed];
  const nextStep = guidedTutorialSteps.find(s=>!completed.has(s.id));
  const reward = alreadyDone ? {} : (step.reward || {});
  const managerRep = clamp(Number(state.manager?.reputation||50) + Number(reward.reputation||0));
  const boardTrust = clamp(Number(state.boardTrust||70) + Number(reward.boardTrust||0));
  const fanMood = clamp(Number(state.fanMood||70) + Number(reward.fanMood||0));
  const coins = Math.max(0, Number(state.coins||0) + Number(reward.coins||0));
  const tacticalBoost = Number(state.match?.tacticalBoost || 0) + Number(reward.tacticalBoost||0);
  const dressingRoomTrust = clamp(Number(state.career?.dressingRoomTrust||70) + Number(reward.dressingRoomTrust||0));
  const story = alreadyDone ? `Tutorial: ${step.title} já estava concluída.` : `Missão concluída: ${step.title}. Recompensa: ${step.rewardText}.`;
  return {
    manager:{...(state.manager||{}), reputation:managerRep},
    boardTrust,
    fanMood,
    coins,
    match:{...(state.match||{}), tacticalBoost},
    career:{
      ...(state.career||{}),
      dressingRoomTrust,
      tutorial:{...tutorial, seen:true, completedSteps, claimedRewards:[...claimed], activeStep:nextStep?.id || step.id, completed:completedSteps.length>=guidedTutorialSteps.length, step:nextStep?.order || step.order},
      activeStory:[story, ...((state.career?.activeStory)||[])].slice(0,12),
      integrationLog:[...((state.career?.integrationLog)||[]), story].slice(-40)
    }
  };
}
export function guidedTutorialAutoPatchForRoute(state={}, route='lobby'){
  const done = completedIds(state);
  const step = guidedTutorialSteps.find(s=>s.trigger===`route:${route}` && !done.has(s.id));
  return step ? completeTutorialStepPatch(state, step.id) : null;
}
export function validateGuidedTutorialSnapshot(snapshot={}){
  const issues = [];
  if(snapshot.total < 6) issues.push('tutorial precisa ter pelo menos 6 etapas');
  if(!snapshot.currentStep?.id && snapshot.status!=='completed') issues.push('etapa atual ausente');
  if(snapshot.steps?.some(s=>!s.title || !s.route || !s.rewardText)) issues.push('etapa com campos obrigatorios ausentes');
  return {status:issues.length?'warn':'ok', issues, version:GUIDED_TUTORIAL_VERSION, total:snapshot.total||0, progress:snapshot.progress||0};
}
