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
