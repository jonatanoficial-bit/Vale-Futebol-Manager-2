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
  { id:'brasil', name:'Brasil', flag:'assets/countries/br.png', level:93, reputationRequired:80, status:'Bloqueada', pool:58, expectation:'Título continental e protagonismo mundial' },
  { id:'argentina', name:'Argentina', flag:'assets/countries/ar.png', level:92, reputationRequired:82, status:'Bloqueada', pool:54, expectation:'Manter ciclo vencedor' },
  { id:'uruguai', name:'Uruguai', flag:'assets/countries/uy.png', level:84, reputationRequired:68, status:'Monitorando', pool:39, expectation:'Renovar elenco competitivo' },
  { id:'colombia', name:'Colômbia', flag:'assets/countries/co.png', level:82, reputationRequired:64, status:'Monitorando', pool:43, expectation:'Classificar e revelar nova base' },
  { id:'chile', name:'Chile', flag:'assets/countries/cl.png', level:76, reputationRequired:58, status:'Possível no futuro', pool:34, expectation:'Reconstrução esportiva' },
  { id:'usa', name:'Estados Unidos', flag:'assets/countries/us.png', level:78, reputationRequired:60, status:'Possível no futuro', pool:46, expectation:'Projeto comercial e esportivo' }
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
