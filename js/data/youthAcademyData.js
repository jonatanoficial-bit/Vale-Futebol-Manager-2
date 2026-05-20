export const academyProfile = {
  name: 'Centro de Formação Vale Gold',
  level: 68,
  facilities: 72,
  coaching: 66,
  scoutingNetwork: 61,
  education: 74,
  medical: 63,
  budgetMonthly: 0.42,
  focus: 'formar atletas para o profissional e gerar receitas futuras',
  risk: 'baixo',
  seasonGoal: 'promover 2 atletas e vender 1 promessa com lucro'
};

export const academyDepartments = [
  { id:'u20', name:'Sub-20', score:72, note:'Pronto para abastecer elenco em baixa complexidade.' },
  { id:'u17', name:'Sub-17', score:64, note:'Boa margem de evolução, exige paciência.' },
  { id:'scouting', name:'Captação', score:61, note:'Rede regional funcional, precisa expansão nacional.' },
  { id:'education', name:'Formação humana', score:74, note:'Reduz risco de queda mental e indisciplina.' },
  { id:'medical', name:'Prevenção física', score:63, note:'Atenção ao excesso de carga em promessas.' }
];

export const youthProspects = [
  { id:'yan-matheus', name:'Yan Matheus', age:17, pos:'ATA', potential:84, overall:61, personality:'Ambicioso', trait:'Ataca profundidade', readiness:58, value:1.8, photo:'assets/players/youth/yan-matheus.png', status:'sub-20' },
  { id:'diego-senna', name:'Diego Senna', age:18, pos:'MEI', potential:82, overall:63, personality:'Criativo', trait:'Último passe', readiness:62, value:2.2, photo:'assets/players/youth/diego-senna.png', status:'sub-20' },
  { id:'marcos-viana', name:'Marcos Viana', age:16, pos:'VOL', potential:80, overall:57, personality:'Disciplinado', trait:'Desarme limpo', readiness:49, value:1.1, photo:'assets/players/youth/marcos-viana.png', status:'sub-17' },
  { id:'caio-ferreira', name:'Caio Ferreira', age:18, pos:'ZAG', potential:79, overall:62, personality:'Líder', trait:'Jogo aéreo', readiness:64, value:1.6, photo:'assets/players/youth/caio-ferreira.png', status:'sub-20' },
  { id:'lucas-avelar', name:'Lucas Avelar', age:17, pos:'LD', potential:78, overall:59, personality:'Regular', trait:'Apoio constante', readiness:55, value:1.0, photo:'assets/players/youth/lucas-avelar.png', status:'sub-17' },
  { id:'pedro-salles', name:'Pedro Salles', age:16, pos:'GOL', potential:83, overall:56, personality:'Frio', trait:'Reflexo curto', readiness:46, value:1.4, photo:'assets/players/youth/pedro-salles.png', status:'sub-17' }
];

export const scoutingRegions = [
  { id:'sudeste', name:'Sudeste', cost:0.08, chance:72, style:'técnico e competitivo', risk:'baixo' },
  { id:'sul', name:'Sul', cost:0.07, chance:64, style:'físico e disciplinado', risk:'baixo' },
  { id:'nordeste', name:'Nordeste', cost:0.06, chance:67, style:'velocidade e criatividade', risk:'médio' },
  { id:'conmebol', name:'América do Sul', cost:0.18, chance:70, style:'talentos subvalorizados', risk:'médio' },
  { id:'africa', name:'África Ocidental', cost:0.22, chance:66, style:'força e explosão', risk:'alto' },
  { id:'europe-b', name:'Europa emergente', cost:0.24, chance:58, style:'formação tática', risk:'alto' }
];

export const academyEvents = [
  { type:'promotion', title:'Promessa pede chance no profissional', text:'Um atleta do sub-20 está com desempenho acima da média e pode ser relacionado na próxima partida.' },
  { type:'scouting', title:'Olheiro encontrou perfil raro', text:'Relatório aponta jovem com potencial alto em mercado regional de baixo custo.' },
  { type:'risk', title:'Carga de treino na base elevada', text:'Departamento médico recomenda controle para evitar lesão muscular em promessas.' },
  { type:'board', title:'Diretoria quer retorno da base', text:'Conselho espera ao menos uma venda de jovem ou promoção esportiva nesta temporada.' }
];

export const academyPolicies = [
  { id:'balanced', name:'Equilíbrio esportivo', effect:'Evolução moderada com baixo risco de lesão.', risk:22 },
  { id:'aggressive', name:'Acelerar talentos', effect:'Aumenta prontidão, mas cresce risco físico e mental.', risk:48 },
  { id:'sales', name:'Vitrine comercial', effect:'Valoriza atletas para vendas, reduz foco competitivo imediato.', risk:34 },
  { id:'elite', name:'Formação de elite', effect:'Custa mais, melhora potencial e personalidade.', risk:26 }
];
