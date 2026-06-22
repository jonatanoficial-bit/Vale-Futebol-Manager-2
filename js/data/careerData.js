export const inboxMessages = [
  { id:'board-001', type:'Diretoria', priority:'Alta', status:'Novo', subject:'Metas da temporada confirmadas', from:'Presidente do clube', date:'Segunda, 08:15', body:'A diretoria espera campanha competitiva, controle financeiro e desenvolvimento de jovens. A segurança no cargo será medida por resultados, clima do elenco e saúde financeira.', action:'Ver metas', route:'club' },
  { id:'press-001', type:'Imprensa', priority:'Média', status:'Lido', subject:'Coletiva antes do clássico', from:'Assessoria de imprensa', date:'Terça, 11:30', body:'A imprensa quer saber se o time manterá postura ofensiva fora de casa. Sua resposta afetará moral, pressão da torcida e ambiente pré-jogo em futuras builds.', action:'Preparar jogo', route:'match' },
  { id:'agent-001', type:'Empresário', priority:'Média', status:'Novo', subject:'Atacante jovem oferecido por empréstimo', from:'Agente autorizado', date:'Quarta, 16:40', body:'Jogador de 20 anos, alto potencial, salário acessível. O departamento de scouting recomenda observar antes de proposta oficial.', action:'Ver mercado', route:'transfers' },
  { id:'medical-001', type:'Departamento médico', priority:'Baixa', status:'Lido', subject:'Controle de carga recomendado', from:'Médico do clube', date:'Quinta, 09:05', body:'Dois titulares acumulam fadiga. Recomendo treino de recuperação ativa ou substituições planejadas na próxima partida.', action:'Ver treino', route:'training' },
  { id:'national-001', type:'Seleção nacional', priority:'Alta', status:'Novo', subject:'Seu nome entrou no radar de uma federação', from:'Federação nacional', date:'Sexta, 19:10', body:'O desempenho no clube chamou atenção para um possível projeto de seleção nacional. O convite ainda depende de reputação, títulos e classificação continental.', action:'Abrir seleções', route:'nationalTeam' }
];

export const careerProfile = {
  managerReputation: 42,
  license: 'Continental B',
  jobSecurity: 78,
  mediaPressure: 54,
  boardTrust: 72,
  dressingRoom: 69,
  internationalRadar: 31,
  nextMilestone: 'Chegar ao G-6 e manter folha salarial sob controle',
  reputationLabel: 'Promissor no cenário sul-americano'
};

export const jobOffers = [
  { club:'Seleção Sub-23 do Brasil', country:'br', type:'Seleção nacional', role:'Treinador interino', status:'Monitorando', requiredRep:55, fit:68, calendar:'Paralelo ao clube', objective:'Classificar para torneio internacional', pressure:'Alta' },
  { club:'Seleção do Uruguai', country:'uy', type:'Seleção nacional', role:'Projeto futuro', status:'Radar inicial', requiredRep:70, fit:44, calendar:'Datas FIFA', objective:'Renovar geração', pressure:'Média' },
  { club:'Clube médio da Argentina', country:'ar', type:'Clube', role:'Treinador principal', status:'Interesse informal', requiredRep:50, fit:57, calendar:'Temporada completa', objective:'Classificação continental', pressure:'Média' },
  { club:'Clube europeu formador', country:'pt', type:'Clube', role:'Treinador principal', status:'Observando', requiredRep:65, fit:39, calendar:'Calendário europeu', objective:'Desenvolver jovens', pressure:'Baixa' }
];

export const nationalTeams = [
  { id:'brasil', name:'Brasil', flag:'assets/countries/br.png', level:93, reputationRequired:80, status:'Disponível por reputação', pool:26, expectation:'Disputar título mundial' },
  { id:'argentina', name:'Argentina', flag:'assets/countries/ar.png', level:92, reputationRequired:80, status:'Disponível por reputação', pool:26, expectation:'Disputar título mundial' },
  { id:'uruguai', name:'Uruguai', flag:'assets/countries/uy.png', level:84, reputationRequired:70, status:'Monitorando', pool:26, expectation:'Avançar no Mundial e competir em alto nível' },
  { id:'colombia', name:'Colômbia', flag:'assets/countries/co.png', level:83, reputationRequired:60, status:'Monitorando', pool:26, expectation:'Avançar no Mundial e competir em alto nível' },
  { id:'franca', name:'França', flag:'assets/countries/fr.png', level:94, reputationRequired:80, status:'Disponível por reputação', pool:26, expectation:'Disputar título mundial' },
  { id:'inglaterra', name:'Inglaterra', flag:'assets/countries/gb-eng.png', level:93, reputationRequired:80, status:'Disponível por reputação', pool:26, expectation:'Disputar título mundial' },
  { id:'espanha', name:'Espanha', flag:'assets/countries/es.png', level:92, reputationRequired:80, status:'Disponível por reputação', pool:26, expectation:'Disputar título mundial' },
  { id:'portugal', name:'Portugal', flag:'assets/countries/pt.png', level:91, reputationRequired:80, status:'Disponível por reputação', pool:26, expectation:'Disputar título mundial' },
  { id:'alemanha', name:'Alemanha', flag:'assets/countries/de.png', level:89, reputationRequired:70, status:'Monitorando', pool:26, expectation:'Disputar título mundial' },
  { id:'holanda', name:'Holanda', flag:'assets/countries/nl.png', level:88, reputationRequired:70, status:'Monitorando', pool:26, expectation:'Disputar título mundial' },
  { id:'italia', name:'Itália', flag:'assets/countries/it.png', level:87, reputationRequired:70, status:'Monitorando', pool:26, expectation:'Avançar no Mundial e competir em alto nível' },
  { id:'estados-unidos', name:'Estados Unidos', flag:'assets/countries/us.png', level:79, reputationRequired:60, status:'Monitorando', pool:26, expectation:'Avançar no Mundial e competir em alto nível' },
  { id:'mexico', name:'México', flag:'assets/countries/mx.png', level:80, reputationRequired:60, status:'Monitorando', pool:26, expectation:'Avançar no Mundial e competir em alto nível' },
  { id:'japao', name:'Japão', flag:'assets/countries/jp.png', level:80, reputationRequired:60, status:'Monitorando', pool:26, expectation:'Avançar no Mundial e competir em alto nível' },
  { id:'marrocos', name:'Marrocos', flag:'assets/countries/ma.png', level:83, reputationRequired:60, status:'Monitorando', pool:26, expectation:'Avançar no Mundial e competir em alto nível' },
  { id:'senegal', name:'Senegal', flag:'assets/countries/sn.png', level:81, reputationRequired:60, status:'Monitorando', pool:26, expectation:'Avançar no Mundial e competir em alto nível' }
];

export const callUpPool = [
  { name:'Goleiro Liderança', pos:'GOL', club:'Brasil A', overall:83, form:78, status:'Titular provável' },
  { name:'Zagueiro Comando', pos:'ZAG', club:'Europa FC', overall:85, form:81, status:'Convocação segura' },
  { name:'Lateral Motor', pos:'LD', club:'São Paulo', overall:79, form:74, status:'Disputa vaga' },
  { name:'Volante Equilíbrio', pos:'VOL', club:'Santos FC', overall:80, form:86, status:'Em alta no clube' },
  { name:'Meia Criativo', pos:'MEI', club:'Palmeiras', overall:84, form:76, status:'Peça-chave' },
  { name:'Ponta Velocidade', pos:'ATA', club:'Europa Reds', overall:86, form:89, status:'Momento excelente' },
  { name:'Centroavante Área', pos:'ATA', club:'Flamengo', overall:82, form:71, status:'Monitorar condição' }
];

export const seasonObjectives = [
  { area:'Esportivo', goal:'Classificar para competição continental', progress:46, risk:'Médio' },
  { area:'Financeiro', goal:'Fechar temporada com superávit operacional', progress:62, risk:'Baixo' },
  { area:'Base', goal:'Dar minutos a jovens com potencial', progress:38, risk:'Médio' },
  { area:'Imagem', goal:'Melhorar reputação do manager', progress:42, risk:'Médio' }
];
