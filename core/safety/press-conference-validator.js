import { getConferenceQuestions } from '../../js/data/pressConferenceData.js';
import { createPressConferenceSession, answerPressQuestion, summarizePressEffects } from '../../js/systems/pressConferenceEngine.js';

export function validatePressConferenceSystem(state={}){
  const errors = [];
  const warnings = [];
  ['pre','post'].forEach(type => {
    const questions = getConferenceQuestions(type);
    if(questions.length !== 3) errors.push(`${type}: precisa ter exatamente 3 perguntas.`);
    questions.forEach((q, idx)=>{
      if(!q.question || q.question.length < 20) errors.push(`${type} pergunta ${idx+1}: texto ausente/curto.`);
      if(!Array.isArray(q.answers) || q.answers.length < 3) errors.push(`${type} pergunta ${idx+1}: precisa ter 3 respostas.`);
      q.answers?.forEach((a, aidx)=>{
        if(!a.label) errors.push(`${type} pergunta ${idx+1} resposta ${aidx+1}: label ausente.`);
        if(!a.effects) warnings.push(`${type} pergunta ${idx+1} resposta ${aidx+1}: sem efeitos.`);
      });
    });
  });
  let session = createPressConferenceSession(state, 'pre');
  session = answerPressQuestion(session, session.questions[0].answers[0].id);
  session = answerPressQuestion(session, session.questions[1].answers[0].id);
  session = answerPressQuestion(session, session.questions[2].answers[0].id);
  if(!session.completed) errors.push('Fluxo de 3 respostas não concluiu sessão pré-jogo.');
  const result = summarizePressEffects(session.answers);
  if(typeof result.total.reputation !== 'number') errors.push('Impacto de reputação inválido.');
  return {status:errors.length?'blocked':'ok', version:'v5.9.3', errors, warnings, questions:{pre:getConferenceQuestions('pre').length, post:getConferenceQuestions('post').length}};
}
