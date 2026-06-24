export const LIVE_CALENDAR_VERSION = 'v7.5.0';

export const liveCalendarStatus = {
  version: LIVE_CALENDAR_VERSION,
  phase: 'Fase 58 — Calendário Vivo, Viagens e Fadiga Realista',
  label: 'Calendário Vivo 2.0',
  status: 'ready',
  schema: 750
};

export const travelProfiles = [
  { id:'local', label:'Jogo local', km:35, hours:1, fatigue:4, recoveryCost:2, risk:1, note:'Deslocamento curto, impacto físico quase neutro.' },
  { id:'regional-bus', label:'Viagem regional', km:180, hours:3, fatigue:9, recoveryCost:5, risk:3, note:'Ônibus ou voo curto: exige regenerativo no dia seguinte.' },
  { id:'national-flight', label:'Voo nacional', km:760, hours:6, fatigue:16, recoveryCost:9, risk:6, note:'Viagem fora de casa com hotel, alimentação e sono afetados.' },
  { id:'continental-flight', label:'Voo continental', km:2400, hours:12, fatigue:24, recoveryCost:14, risk:10, note:'Calendário pesado: rotação e treino leve viram prioridade.' }
];

export const trainingLoadPresets = [
  { id:'recovery', label:'Recuperação', icon:'🧊', load:12, fatigue:-14, recovery:16, sharpness:-1, tactical:1, injuryRisk:-7, morale:2, description:'Regenerativo, fisioterapia, piscina, sono e controle de carga.' },
  { id:'light', label:'Treino leve', icon:'🟢', load:34, fatigue:6, recovery:4, sharpness:4, tactical:4, injuryRisk:1, morale:1, description:'Rondo, vídeo, bolas paradas e ajustes sem esgotar elenco.' },
  { id:'balanced', label:'Treino equilibrado', icon:'🟡', load:56, fatigue:12, recovery:-2, sharpness:7, tactical:6, injuryRisk:4, morale:0, description:'Sessão tática normal para semana com boa janela de descanso.' },
  { id:'heavy', label:'Treino pesado', icon:'🔴', load:82, fatigue:22, recovery:-9, sharpness:11, tactical:7, injuryRisk:10, morale:-2, description:'Alta intensidade: melhora ritmo, mas pesa em sequência apertada.' },
  { id:'rest', label:'Descanso total', icon:'🌙', load:0, fatigue:-18, recovery:20, sharpness:-3, tactical:0, injuryRisk:-9, morale:3, description:'Folga orientada quando o elenco entra em zona vermelha.' }
];

export const calendarMedicalRules = [
  { id:'green', min:0, max:33, label:'Zona verde', advice:'Pode treinar normalmente, mantendo aquecimento e monitoramento.' },
  { id:'yellow', min:34, max:58, label:'Zona amarela', advice:'Evite treino pesado dois dias antes do jogo e rode titulares.' },
  { id:'red', min:59, max:100, label:'Zona vermelha', advice:'Priorize recuperação, descanso, viagem antecipada e banco forte.' }
];

export const liveCalendarMicrocycle = [
  { day:'D+1', type:'Recuperação', load:18, goal:'Recuperar titulares, tratar pancadas e avaliar minutos jogados.' },
  { day:'D+2', type:'Tático leve', load:36, goal:'Vídeo, posicionamento e bola parada sem quebrar recuperação.' },
  { day:'D+3', type:'Físico/tático', load:62, goal:'Pico de carga se houver quatro ou mais dias até a partida.' },
  { day:'D-2', type:'Ajuste de plano', load:44, goal:'Organização, transição, substituições planejadas e elenco misto.' },
  { day:'D-1', type:'Ativação', load:24, goal:'Treino curto, bolas paradas e concentração.' },
  { day:'Jogo', type:'Partida', load:90, goal:'Carga real calculada por mando, viagem e pressão.' },
  { day:'Pós-jogo', type:'Relatório médico', load:10, goal:'Risco de lesão, sono, viagem de volta e plano da semana seguinte.' }
];
