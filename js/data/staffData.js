export const staffBudget = {
  monthlyLimit: 950000,
  used: 642000,
  remaining: 308000,
  boardConfidence: 82,
  departmentLevel: 'Profissional competitivo',
  recommendation: 'Contratar um olheiro sul-americano e reforcar departamento medico antes de calendario continental.'
};

export const currentStaff = [
  {id:'head-coach', role:'Treinador principal', name:'Manager do usuario', grade:'A-', salary:0, effect:'Define modelo de jogo, escalação e decisões de partida.', impact:88, photo:'assets/staff/brazil/santos/treinador.png'},
  {id:'assistant', role:'Auxiliar tecnico', name:'Carlos Menezes', grade:'B+', salary:92000, effect:'Aumenta entrosamento tatico e leitura de adversarios.', impact:78, photo:'assets/staff/brazil/santos/auxiliar-01.png'},
  {id:'fitness', role:'Preparador fisico', name:'Rafael Costa', grade:'B', salary:82000, effect:'Reduz queda fisica e melhora recuperacao semanal.', impact:74, photo:'assets/staff/brazil/santos/preparador-fisico.png'},
  {id:'doctor', role:'Medico', name:'Dra. Helena Prado', grade:'A', salary:118000, effect:'Reduz tempo de lesao e risco em semanas apertadas.', impact:86, photo:'assets/staff/brazil/santos/medico.png'},
  {id:'physio', role:'Fisioterapeuta', name:'Bruno Lacerda', grade:'B+', salary:76000, effect:'Acelera retorno fisico e melhora prontidao para jogo.', impact:80, photo:'assets/staff/brazil/santos/fisioterapeuta.png'},
  {id:'scout', role:'Olheiro', name:'Miguel Aranda', grade:'B-', salary:69000, effect:'Aumenta precisao de potencial e revela jovens talentos.', impact:70, photo:'assets/staff/brazil/santos/olheiro.png'},
  {id:'commercial', role:'Diretor comercial', name:'Paulo Ferraz', grade:'B', salary:84000, effect:'Melhora propostas de patrocinio e bonus comerciais.', impact:73, photo:'assets/staff/brazil/santos/diretor-comercial.png'},
  {id:'analyst', role:'Analista de desempenho', name:'Theo Nakamura', grade:'B+', salary:71000, effect:'Aumenta qualidade das estatisticas e preparacao por adversario.', impact:79, photo:'assets/staff/brazil/santos/analista-desempenho.png'}
];

export const staffCandidates = [
  {name:'Leandro Barros', role:'Auxiliar tecnico', country:'BR', grade:'A-', salary:132000, fee:420000, style:'Posse e transicao curta', bonus:'+5 entrosamento tatico', fit:91},
  {name:'Sofia Rinaldi', role:'Analista de desempenho', country:'IT', grade:'A', salary:148000, fee:510000, style:'Dados avancados e xG', bonus:'+7 leitura de adversario', fit:88},
  {name:'Andres Villalba', role:'Olheiro', country:'AR', grade:'A-', salary:126000, fee:390000, style:'Base sul-americana', bonus:'+8 descoberta de jovens', fit:93},
  {name:'Marina Kato', role:'Fisioterapeuta', country:'BR', grade:'A', salary:121000, fee:360000, style:'Recuperacao de alto rendimento', bonus:'-6 risco de lesao', fit:89},
  {name:'Eduardo Salles', role:'Diretor comercial', country:'BR', grade:'A-', salary:139000, fee:480000, style:'Marcas e experiencia de arena', bonus:'+9 receita comercial', fit:84},
  {name:'Nicolas Meyer', role:'Preparador fisico', country:'DE', grade:'A', salary:155000, fee:620000, style:'Alta intensidade controlada', bonus:'+7 prontidao fisica', fit:86}
];

export const staffDepartmentKpis = [
  {label:'Tatico', value:81, status:'Forte'},
  {label:'Fisico', value:76, status:'Bom'},
  {label:'Medico', value:84, status:'Excelente'},
  {label:'Olheiros', value:69, status:'Pode melhorar'},
  {label:'Comercial', value:73, status:'Estavel'},
  {label:'Analise', value:79, status:'Competitivo'}
];

export const sponsorsOverview = {
  annualRevenue: 18400000,
  availableBoost: 5200000,
  exposure: 78,
  boardTarget: 22000000,
  shirtSlots: 5,
  filledSlots: 3,
  risk: 'Media exposicao internacional; Sul-Americana pode destravar bonus.'
};

export const activeSponsors = [
  {name:'Umbro', slot:'Fornecedor esportivo', value:6200000, bonus:'Bonus por titulo estadual', status:'Ativo', logo:'assets/sponsors/umbro.png', contract:'2026'},
  {name:'Philco', slot:'Master frontal', value:7800000, bonus:'Bonus por top 6 nacional', status:'Ativo', logo:'assets/sponsors/philco.png', contract:'2025'},
  {name:'Kodilar', slot:'Manga', value:1900000, bonus:'Bonus por media de publico', status:'Ativo', logo:'assets/sponsors/kodilar.png', contract:'2024'},
  {name:'Tekbond', slot:'Placas e digital', value:2500000, bonus:'Bonus por semifinal de copa', status:'Ativo', logo:'assets/sponsors/tekbond.png', contract:'2025'}
];

export const sponsorProposals = [
  {name:'Pixbet', slot:'Costas', value:4100000, bonus:'R$ 1.2M por classificacao continental', demand:'Exige top 8 nacional', logo:'assets/sponsors/pixbet.png', fit:86},
  {name:'Binance', slot:'Digital global', value:5300000, bonus:'R$ 900k por engajamento', demand:'Conteudo semanal no app', logo:'assets/sponsors/binance.png', fit:82},
  {name:'Brahma', slot:'Experiencia de estadio', value:3200000, bonus:'R$ 600k por media de publico', demand:'Campanha de torcida', logo:'assets/sponsors/brahma.png', fit:76},
  {name:'1XBet', slot:'Publicidade internacional', value:4800000, bonus:'R$ 1M por fase continental', demand:'Exposicao em jogos grandes', logo:'assets/sponsors/one-x-bet.png', fit:80}
];

export const financeSnapshot = [
  {label:'Caixa atual', value:'R$ 42.8M', trend:'+3.4M no mes'},
  {label:'Folha salarial', value:'R$ 6.9M', trend:'68% do teto'},
  {label:'Receita comercial', value:'R$ 18.4M', trend:'84% da meta'},
  {label:'Projecao anual', value:'R$ 126M', trend:'Cenario estavel'}
];
