export const STAFF_ENGINE_VERSION = 'v7.8.0';

export const staffBudget = {
  monthlyLimit: 950000,
  boardConfidence: 82,
  departmentLevel: 'Profissional competitivo',
  recommendation: 'Reforçar analista, preparador físico e preparador de goleiros para transformar treino semanal, scout e jogo em vantagem real.'
};

export const staffRoles = [
  { id:'assistant', role:'Auxiliar técnico', icon:'🧠', area:'Tático', description:'Ajuda na leitura de jogo, entrosamento, plano de partida e ajustes de intervalo.', primaryMetric:'tactical', required:true },
  { id:'fitness', role:'Preparador físico', icon:'🏃', area:'Físico', description:'Controla carga, resistência, recuperação entre jogos e queda física no segundo tempo.', primaryMetric:'physical', required:true },
  { id:'analyst', role:'Analista de desempenho', icon:'📈', area:'Análise', description:'Lê adversários, aumenta preparação por scout de jogo, xG narrativo e controle tático.', primaryMetric:'analysis', required:true },
  { id:'doctor', role:'Médico', icon:'🩺', area:'Médico', description:'Reduz risco de lesão, tempo parado e alerta de calendário pesado.', primaryMetric:'medical', required:true },
  { id:'scout', role:'Olheiro', icon:'🔎', area:'Scout', description:'Aumenta precisão de potencial, risco, custo e recomendação de contratação.', primaryMetric:'scouting', required:true },
  { id:'goalkeeper', role:'Preparador de goleiros', icon:'🧤', area:'Goleiros', description:'Melhora goleiros, bola aérea, defesa de pênalti e segurança em jogos difíceis.', primaryMetric:'goalkeeper', required:true },
  { id:'physio', role:'Fisioterapeuta', icon:'♻️', area:'Recuperação', description:'Acelera retorno físico, previne desgaste e melhora prontidão de atletas cansados.', primaryMetric:'medical', required:false }
];

export const currentStaff = [
  {id:'assistant-01', roleId:'assistant', role:'Auxiliar técnico', name:'Carlos Menezes', country:'BR', grade:'B+', quality:78, influence:76, salary:92000, style:'Entrosamento tático', effect:'Aumenta entrosamento tático e leitura de adversários.', impact:78, photo:'assets/staff/brazil/santos/auxiliar-01.png'},
  {id:'fitness-01', roleId:'fitness', role:'Preparador físico', name:'Rafael Costa', country:'BR', grade:'B', quality:74, influence:72, salary:82000, style:'Controle de carga', effect:'Reduz queda física e melhora recuperação semanal.', impact:74, photo:'assets/staff/brazil/santos/preparador-fisico.png'},
  {id:'doctor-01', roleId:'doctor', role:'Médico', name:'Dra. Helena Prado', country:'BR', grade:'A', quality:86, influence:84, salary:118000, style:'Prevenção de lesões', effect:'Reduz tempo de lesão e risco em semanas apertadas.', impact:86, photo:'assets/staff/brazil/santos/medico.png'},
  {id:'physio-01', roleId:'physio', role:'Fisioterapeuta', name:'Bruno Lacerda', country:'BR', grade:'B+', quality:80, influence:78, salary:76000, style:'Retorno físico', effect:'Acelera retorno físico e melhora prontidão para jogo.', impact:80, photo:'assets/staff/brazil/santos/fisioterapeuta.png'},
  {id:'scout-01', roleId:'scout', role:'Olheiro', name:'Miguel Aranda', country:'UY', grade:'B-', quality:70, influence:69, salary:69000, style:'Mercado sul-americano', effect:'Aumenta precisão de potencial e revela jovens talentos.', impact:70, photo:'assets/staff/brazil/santos/olheiro.png'},
  {id:'analyst-01', roleId:'analyst', role:'Analista de desempenho', name:'Theo Nakamura', country:'BR', grade:'B+', quality:79, influence:80, salary:71000, style:'Dados e vídeo', effect:'Aumenta qualidade das estatísticas e preparação por adversário.', impact:79, photo:'assets/staff/brazil/santos/analista-desempenho.png'},
  {id:'goalkeeper-01', roleId:'goalkeeper', role:'Preparador de goleiros', name:'Sérgio Valença', country:'BR', grade:'B', quality:73, influence:71, salary:68000, style:'Reflexo e bola aérea', effect:'Melhora goleiros, pênaltis e segurança defensiva.', impact:73, photo:'assets/staff/brazil/santos/preparador-goleiros.png'}
];

export const staffCandidates = [
  {id:'candidate-leandro-barros', name:'Leandro Barros', roleId:'assistant', role:'Auxiliar técnico', country:'BR', grade:'A-', quality:86, influence:84, salary:132000, fee:420000, style:'Posse e transição curta', bonus:'+5 entrosamento tático', fit:91},
  {id:'candidate-sofia-rinaldi', name:'Sofia Rinaldi', roleId:'analyst', role:'Analista de desempenho', country:'IT', grade:'A', quality:90, influence:87, salary:148000, fee:510000, style:'Dados avançados e xG', bonus:'+7 leitura de adversário', fit:88},
  {id:'candidate-andres-villalba', name:'Andrés Villalba', roleId:'scout', role:'Olheiro', country:'AR', grade:'A-', quality:87, influence:86, salary:126000, fee:390000, style:'Base sul-americana', bonus:'+8 descoberta de jovens', fit:93},
  {id:'candidate-marina-kato', name:'Marina Kato', roleId:'physio', role:'Fisioterapeuta', country:'BR', grade:'A', quality:88, influence:85, salary:121000, fee:360000, style:'Recuperação de alto rendimento', bonus:'-6 risco de lesão', fit:89},
  {id:'candidate-nicolas-meyer', name:'Nicolas Meyer', roleId:'fitness', role:'Preparador físico', country:'DE', grade:'A', quality:91, influence:88, salary:155000, fee:620000, style:'Alta intensidade controlada', bonus:'+7 prontidão física', fit:86},
  {id:'candidate-hugo-sampaio', name:'Hugo Sampaio', roleId:'goalkeeper', role:'Preparador de goleiros', country:'BR', grade:'A-', quality:85, influence:83, salary:109000, fee:330000, style:'Goleiro-líbero e pênaltis', bonus:'+6 segurança dos goleiros', fit:90},
  {id:'candidate-dra-larissa-nobre', name:'Dra. Larissa Nobre', roleId:'doctor', role:'Médico', country:'BR', grade:'A+', quality:93, influence:90, salary:170000, fee:740000, style:'Medicina esportiva preventiva', bonus:'-9 risco de lesão', fit:87}
];

export const staffFocusModes = [
  {id:'balanced', name:'Equilíbrio profissional', description:'Mantém todos os departamentos balanceados.', weights:{tactical:1, physical:1, analysis:1, medical:1, scouting:1, goalkeeper:1}},
  {id:'match-prep', name:'Preparação de jogo', description:'Auxiliar e analista ganham mais peso no impacto de partida.', weights:{tactical:1.25, analysis:1.25, physical:.95, medical:.9, scouting:.9, goalkeeper:1}},
  {id:'injury-prevention', name:'Prevenção de lesões', description:'Médico, fisioterapeuta e físico priorizam recuperação e proteção.', weights:{medical:1.35, physical:1.15, tactical:.9, analysis:.9, scouting:.85, goalkeeper:1}},
  {id:'recruitment', name:'Recrutamento profundo', description:'Olheiro e analista aumentam precisão de relatórios e lista de desejos.', weights:{scouting:1.35, analysis:1.1, tactical:.9, physical:.9, medical:.9, goalkeeper:.9}},
  {id:'goalkeeper-school', name:'Escola de goleiros', description:'Preparador de goleiros ganha prioridade no treino e no motor da partida.', weights:{goalkeeper:1.35, medical:.95, physical:.95, tactical:1, analysis:1, scouting:.9}}
];

export const staffDepartmentKpis = [
  {id:'tactical', label:'Tático', value:81, status:'Forte'},
  {id:'physical', label:'Físico', value:76, status:'Bom'},
  {id:'medical', label:'Médico', value:84, status:'Excelente'},
  {id:'scouting', label:'Olheiros', value:69, status:'Pode melhorar'},
  {id:'analysis', label:'Análise', value:79, status:'Competitivo'},
  {id:'goalkeeper', label:'Goleiros', value:73, status:'Evoluindo'}
];

export const sponsorsOverview = {
  annualRevenue: 18400000,
  availableBoost: 5200000,
  exposure: 78,
  boardTarget: 22000000,
  shirtSlots: 5,
  filledSlots: 3,
  risk: 'Média exposição internacional; Sul-Americana pode destravar bônus.'
};

export const activeSponsors = [
  {name:'Umbro', slot:'Fornecedor esportivo', value:6200000, bonus:'Bônus por título estadual', status:'Ativo', logo:'assets/sponsors/umbro.png', contract:'2026'},
  {name:'Philco', slot:'Master frontal', value:7800000, bonus:'Bônus por top 6 nacional', status:'Ativo', logo:'assets/sponsors/philco.png', contract:'2025'},
  {name:'Kodilar', slot:'Manga', value:1900000, bonus:'Bônus por média de público', status:'Ativo', logo:'assets/sponsors/kodilar.png', contract:'2024'},
  {name:'Tekbond', slot:'Placas e digital', value:2500000, bonus:'Bônus por semifinal de copa', status:'Ativo', logo:'assets/sponsors/tekbond.png', contract:'2025'}
];

export const sponsorProposals = [
  {name:'Pixbet', slot:'Costas', value:4100000, bonus:'R$ 1.2M por classificação continental', demand:'Exige top 8 nacional', logo:'assets/sponsors/pixbet.png', fit:86},
  {name:'Binance', slot:'Digital global', value:5300000, bonus:'R$ 900k por engajamento', demand:'Conteúdo semanal no app', logo:'assets/sponsors/binance.png', fit:82},
  {name:'Brahma', slot:'Experiência de estádio', value:3200000, bonus:'R$ 600k por média de público', demand:'Campanha de torcida', logo:'assets/sponsors/brahma.png', fit:76},
  {name:'1XBet', slot:'Publicidade internacional', value:4800000, bonus:'R$ 1M por fase continental', demand:'Exposição em jogos grandes', logo:'assets/sponsors/one-x-bet.png', fit:80}
];

export const financeSnapshot = [
  {label:'Caixa atual', value:'R$ 42.8M', trend:'+3.4M no mês'},
  {label:'Folha salarial', value:'R$ 6.9M', trend:'68% do teto'},
  {label:'Receita comercial', value:'R$ 18.4M', trend:'84% da meta'},
  {label:'Projeção anual', value:'R$ 126M', trend:'Cenário estável'}
];
