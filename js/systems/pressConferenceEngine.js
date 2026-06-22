import { teams } from '../data/gameData.js';
import { getConferenceQuestions, PRESS_CONFERENCE_VERSION } from '../data/pressConferenceData.js';

function clamp(value, min=0, max=100){ return Math.max(min, Math.min(max, Number(value || 0))); }
function teamName(id){ return teams.find(t=>t.id===id)?.name || id || 'clube'; }

export function createPressConferenceSession(state, type='pre'){
  const match = state.match || {};
  const questions = getConferenceQuestions(type).map((q, index)=>({
    ...q,
    order:index+1,
    question:q.question
      .replace(/\{home\}/g, teamName(match.home))
      .replace(/\{away\}/g, teamName(match.away))
      .replace(/\{club\}/g, teamName(state.clubId))
  }));
  return {
    version: PRESS_CONFERENCE_VERSION,
    active:true,
    type,
    matchId:match.id || `match-${Date.now()}`,
    title:type === 'post' ? 'Coletiva pós-jogo' : 'Coletiva pré-jogo',
    subtitle:type === 'post' ? 'Responda à imprensa antes de voltar ao lobby.' : 'Três perguntas rápidas antes de entrar em campo.',
    questionIndex:0,
    total:questions.length,
    questions,
    answers:[],
    applied:false,
    completed:false,
    nextRoute:type === 'post' ? 'lobby' : 'match',
    createdAt:new Date().toISOString(),
    result:null
  };
}

export function currentPressQuestion(session){
  if(!session?.questions?.length) return null;
  return session.questions[Math.max(0, Math.min(session.questions.length-1, Number(session.questionIndex||0)))];
}

export function answerPressQuestion(session, answerId){
  const safe = session || createPressConferenceSession({}, 'pre');
  const question = currentPressQuestion(safe);
  const answer = question?.answers?.find(a=>a.id===answerId) || question?.answers?.[0];
  if(!question || !answer) return safe;
  const answers = [...(safe.answers || []), {
    questionId:question.id,
    question:question.question,
    answerId:answer.id,
    label:answer.label,
    tone:answer.tone,
    effects:{...(answer.effects || {})},
    summary:answer.summary
  }];
  const nextIndex = Number(safe.questionIndex||0) + 1;
  const completed = nextIndex >= Number(safe.total || safe.questions.length || 0);
  return {
    ...safe,
    answers,
    questionIndex:completed ? Number(safe.questionIndex||0) : nextIndex,
    completed,
    active:!completed,
    result: completed ? summarizePressEffects(answers) : null
  };
}

export function summarizePressEffects(answers=[]){
  const total = {reputation:0, fanMood:0, dressingRoomTrust:0, boardTrust:0, mediaPressure:0, tacticalBoost:0};
  answers.forEach(a => Object.entries(a.effects || {}).forEach(([key,value]) => { total[key] = Number(total[key] || 0) + Number(value || 0); }));
  const dominant = answers.map(a=>a.tone).filter(Boolean).slice(-3).join(' · ') || 'Equilibrado';
  return {
    total,
    dominant,
    summaries:answers.map(a=>a.summary).filter(Boolean),
    headline: total.mediaPressure > 2 ? 'A imprensa aumentou a expectativa para o próximo passo.' : total.dressingRoomTrust > 4 ? 'O vestiário recebeu bem a postura do treinador.' : total.boardTrust > 4 ? 'A diretoria aprovou a condução da coletiva.' : 'A coletiva terminou sem ruídos importantes.'
  };
}

export function applyPressConferenceEffects(state, session){
  if(!session?.completed || session.applied) return state;
  const total = session.result?.total || summarizePressEffects(session.answers).total;
  const historyItem = {
    date:state.career?.currentDate || state.match?.date || new Date().toISOString().slice(0,10),
    type:session.type,
    matchId:session.matchId,
    title:session.title,
    tone:session.result?.dominant || 'Equilibrado',
    impact:total,
    headline:session.result?.headline || 'Coletiva registrada.'
  };
  return {
    ...state,
    manager:{...(state.manager||{}), reputation:clamp(Number(state.manager?.reputation||50) + Number(total.reputation||0))},
    boardTrust:clamp(Number(state.boardTrust||76) + Number(total.boardTrust||0)),
    fanMood:clamp(Number(state.fanMood||76) + Number(total.fanMood||0)),
    match:{...(state.match||{}), tacticalBoost:Number(state.match?.tacticalBoost||0) + Number(total.tacticalBoost||0), prePressDoneFor:session.type==='pre' ? session.matchId : state.match?.prePressDoneFor, postPressDoneFor:session.type==='post' ? session.matchId : state.match?.postPressDoneFor},
    career:{
      ...(state.career||{}),
      dressingRoomTrust:clamp(Number(state.career?.dressingRoomTrust||68) + Number(total.dressingRoomTrust||0)),
      mediaPressure:clamp(Number(state.career?.mediaPressure||54) + Number(total.mediaPressure||0)),
      pressHistory:[...((state.career?.pressHistory)||[]), historyItem].slice(-30),
      activeStory:[historyItem.headline, ...((state.career?.activeStory)||[])].slice(0,5),
      pressConference:{...session, applied:true, active:false}
    },
    notifications:Number(state.notifications||0)+1
  };
}

export function buildPressConferenceSnapshot(state){
  const session = state.career?.pressConference || null;
  const question = currentPressQuestion(session);
  const result = session?.result || summarizePressEffects(session?.answers || []);
  return {
    version: PRESS_CONFERENCE_VERSION,
    hasSession:Boolean(session),
    type:session?.type || 'pre',
    title:session?.title || 'Coletiva de imprensa',
    progress:`${Math.min((session?.answers?.length||0)+1, session?.total||3)}/${session?.total||3}`,
    completed:Boolean(session?.completed),
    question,
    result,
    history:(state.career?.pressHistory || []).slice(-5)
  };
}
