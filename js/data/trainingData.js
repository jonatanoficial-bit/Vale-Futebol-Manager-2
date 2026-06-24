export const trainingThemes = [
  {id:'possession', name:'Posse e circulação', focus:'Passe curto, apoio e controle territorial', intensity:62, gain:'Passe + Criatividade', risk:18, fatigue:32, icon:'◈'},
  {id:'finishing', name:'Finalização e último terço', focus:'Chutes, infiltração, cruzamentos e tomada de decisão', intensity:70, gain:'Finalização + Ataque', risk:26, fatigue:44, icon:'◎'},
  {id:'pressing', name:'Pressão pós-perda', focus:'Recuperação rápida, bloco alto e agressividade coletiva', intensity:82, gain:'Pressão + Defesa', risk:42, fatigue:61, icon:'▲'},
  {id:'defense', name:'Organização defensiva', focus:'Compactação, linha de defesa, cobertura e bolas aéreas', intensity:58, gain:'Marcação + Posicionamento', risk:20, fatigue:34, icon:'▣'},
  {id:'setpieces', name:'Bolas paradas', focus:'Escanteios, faltas laterais, pênaltis e proteção da área', intensity:48, gain:'Estratégia + Eficiência', risk:12, fatigue:22, icon:'✦'},
  {id:'recovery', name:'Recuperação ativa', focus:'Controle de carga, fisioterapia preventiva e regenerativo', intensity:26, gain:'Stamina + Moral', risk:5, fatigue:9, icon:'✚'}
];

export const weeklyPlan = [
  {day:'Seg', type:'Recuperação', title:'Regenerativo pós-jogo', load:28, effect:'Reduz fadiga e risco muscular'},
  {day:'Ter', type:'Técnico', title:'Posse sob pressão', load:58, effect:'Passe, movimentação e paciência ofensiva'},
  {day:'Qua', type:'Tático', title:'Modelo de jogo principal', load:66, effect:'Entrosamento e automatismos'},
  {day:'Qui', type:'Setor', title:'Defesa + transição', load:61, effect:'Cobertura, pressão e balanço defensivo'},
  {day:'Sex', type:'Pré-jogo', title:'Bolas paradas e finalização', load:46, effect:'Ajuste fino para a próxima partida'},
  {day:'Sáb', type:'Jogo', title:'Partida oficial', load:88, effect:'Desempenho competitivo'},
  {day:'Dom', type:'Livre', title:'Descanso monitorado', load:12, effect:'Recuperação mental e física'}
];

export const developmentFocus = [
  {player:'JP Chermont', role:'LD', age:18, focus:'Cruzamento e resistência', progress:68, potential:'+3 OVR', risk:'Baixo'},
  {player:'Miguelito', role:'MEI', age:20, focus:'Criatividade e decisão', progress:61, potential:'+4 OVR', risk:'Médio'},
  {player:'Weslley Patati', role:'PE', age:20, focus:'Aceleração e finalização', progress:57, potential:'+3 OVR', risk:'Médio'},
  {player:'Joaquim', role:'ZAG', age:25, focus:'Bola aérea e liderança', progress:52, potential:'+1 OVR', risk:'Baixo'},
  {player:'Soteldo', role:'PE', age:27, focus:'Explosão e último passe', progress:74, potential:'Pico técnico', risk:'Médio'}
];

export const trainingStaffImpact = [
  {area:'Preparação física', grade:'B+', effect:'Fadiga reduzida em semanas de jogo duplo', value:78},
  {area:'Departamento médico', grade:'B', effect:'Menor risco de lesão muscular', value:72},
  {area:'Análise de desempenho', grade:'A-', effect:'Leitura tática melhora no pré-jogo', value:84},
  {area:'Base e desenvolvimento', grade:'B+', effect:'Jovens evoluem com plano individual', value:79}
];

export const trainingAlerts = [
  {level:'Atenção', title:'Agenda apertada', text:'A próxima semana tem jogo decisivo e viagem. Intensidade alta aumenta risco de lesão.'},
  {level:'Oportunidade', title:'Evolução de jovens', text:'Três atletas sub-21 estão próximos de ganho técnico se mantiverem foco individual.'},
  {level:'Diretoria', title:'Meta de valorização', text:'Desenvolver jovens aumenta valor de elenco e melhora sustentabilidade financeira.'}
];


export const WEEKLY_TRAINING_VERSION = 'v7.7.0';

export const realisticMicrocycleSessions = [
  {id:'recovery', day:'Seg', type:'Recuperação', title:'Regenerativo + fisioterapia', subtitle:'D+1 pós-jogo', load:18, icon:'🧊', goal:'Recuperar titulares, tratar pancadas, sono e hidratação.', effects:{recovery:18, fatigue:-16, sharpness:-2, tactical:1, physical:-1, setPieces:0, finishing:0, collective:1, injuryRisk:-8, morale:2}, matchImpact:{fitness:6, injury:-5, control:1, attack:0, defense:1, setPieces:0}},
  {id:'tactical', day:'Ter', type:'Tático', title:'Modelo de jogo e vídeo', subtitle:'Organização com bola e sem bola', load:42, icon:'♟️', goal:'Ajustar bloco, saída de bola, pressão e coberturas sem carga física alta.', effects:{recovery:3, fatigue:6, sharpness:4, tactical:10, physical:0, setPieces:1, finishing:1, collective:4, injuryRisk:1, morale:1}, matchImpact:{fitness:0, injury:0, control:7, attack:2, defense:4, setPieces:1}},
  {id:'physical', day:'Qua', type:'Físico', title:'Pico físico controlado', subtitle:'Força, aceleração e resistência', load:74, icon:'🔥', goal:'Elevar condição física quando há distância segura para o próximo jogo.', effects:{recovery:-8, fatigue:18, sharpness:6, tactical:2, physical:12, setPieces:0, finishing:2, collective:2, injuryRisk:8, morale:-1}, matchImpact:{fitness:4, injury:4, control:1, attack:2, defense:2, setPieces:0}},
  {id:'setpieces', day:'Qui', type:'Bola parada', title:'Escanteios, faltas e laterais', subtitle:'Ataque e defesa de bola parada', load:36, icon:'🎯', goal:'Preparar jogadas ensaiadas, cobranças, marcação mista e segunda bola.', effects:{recovery:2, fatigue:5, sharpness:3, tactical:4, physical:0, setPieces:12, finishing:2, collective:3, injuryRisk:1, morale:1}, matchImpact:{fitness:0, injury:0, control:2, attack:2, defense:2, setPieces:9}},
  {id:'finishing', day:'Sex', type:'Finalização', title:'Último terço e tomada de decisão', subtitle:'Chutes, cruzamentos e infiltrações', load:52, icon:'🥅', goal:'Melhorar xG, aproveitamento e confiança ofensiva sem exagerar na carga.', effects:{recovery:-2, fatigue:9, sharpness:8, tactical:2, physical:1, setPieces:2, finishing:12, collective:2, injuryRisk:3, morale:2}, matchImpact:{fitness:0, injury:1, control:1, attack:8, defense:0, setPieces:1}},
  {id:'collective', day:'Sáb', type:'Coletivo', title:'Ensaio 11 contra 11', subtitle:'Plano de jogo completo', load:66, icon:'⚽', goal:'Sincronizar titulares e reservas, testar transições e gatilhos de pressão.', effects:{recovery:-5, fatigue:14, sharpness:8, tactical:7, physical:2, setPieces:2, finishing:4, collective:10, injuryRisk:5, morale:2}, matchImpact:{fitness:1, injury:2, control:6, attack:4, defense:4, setPieces:1}},
  {id:'rest', day:'Dom', type:'Descanso', title:'Folga monitorada', subtitle:'Controle mental e muscular', load:6, icon:'🌙', goal:'Baixar fadiga, preservar moral e evitar lesões em sequência apertada.', effects:{recovery:14, fatigue:-14, sharpness:-3, tactical:0, physical:-1, setPieces:0, finishing:0, collective:1, injuryRisk:-6, morale:3}, matchImpact:{fitness:4, injury:-4, control:0, attack:0, defense:0, setPieces:0}}
];

export const weeklyTrainingPresets = [
  {id:'balanced', name:'Semana equilibrada', description:'Uma carga realista para semana normal com 5 a 6 dias até o jogo.', sessions:['recovery','tactical','physical','setpieces','finishing','collective','rest']},
  {id:'congested', name:'Semana com jogo perto', description:'Reduz físico/coletivo e protege titulares quando há viagem ou 2 jogos em poucos dias.', sessions:['recovery','tactical','setpieces','rest','finishing','recovery','rest']},
  {id:'attacking', name:'Semana ofensiva', description:'Dá prioridade a finalização, último terço e coletivo ofensivo.', sessions:['recovery','tactical','finishing','finishing','setpieces','collective','rest']},
  {id:'defensive', name:'Semana defensiva', description:'Foco em organização, bola parada defensiva e bloco compacto.', sessions:['recovery','tactical','tactical','setpieces','collective','recovery','rest']},
  {id:'recovery', name:'Semana de recuperação', description:'Para calendário pesado, viagem longa ou risco físico alto.', sessions:['recovery','rest','tactical','recovery','setpieces','rest','recovery']}
];

export const weeklyTrainingRules = [
  {id:'match-close', label:'Jogo em até 2 dias', rule:'bloquear carga física pesada e recomendar recuperação/bola parada'},
  {id:'away-trip', label:'Viagem fora de casa', rule:'aumentar peso de descanso, sono e regenerativo'},
  {id:'injury-red', label:'Risco acima de 60%', rule:'reduzir treino físico, preservar titulares e rodar elenco'},
  {id:'form-low', label:'Ritmo abaixo de 70%', rule:'usar treino tático curto e finalização controlada'}
];
