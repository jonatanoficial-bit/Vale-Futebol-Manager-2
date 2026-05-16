export const balanceVersion = 'v1.9.0';

export const clubPower = {
  santos: 76,
  palmeiras: 84,
  flamengo: 86,
  corinthians: 78,
  'sao-paulo': 80,
  'atletico-mg': 82,
  gremio: 79,
  internacional: 79,
  fluminense: 81,
  botafogo: 81,
  bahia: 73,
  vasco: 72,
  'red-bull-bragantino': 74,
  'real-madrid': 92,
  barcelona: 89,
  'manchester-city': 93,
  liverpool: 90,
  arsenal: 88,
  'bayern-munich': 91,
  'paris-saint-germain': 89,
  'boca-juniors': 80,
  'river-plate': 82,
  'inter-miami': 77,
  'al-hilal': 82,
  'al-nassr': 81
};

export const difficultyProfiles = [
  { id:'easy', name:'Acessível', realism:62, variance:14, boardPressure:58, transferStrictness:55, description:'Resultados menos punitivos, ideal para aprender o jogo.' },
  { id:'realistic', name:'Realista', realism:84, variance:22, boardPressure:78, transferStrictness:76, description:'Equilíbrio recomendado: força do elenco, forma, mando, tática e pressão pesam bastante.' },
  { id:'hardcore', name:'Hardcore', realism:94, variance:28, boardPressure:91, transferStrictness:90, description:'Margem de erro pequena, diretoria exigente e mercado mais difícil.' }
];

export const aiWeights = {
  squadQuality: 34,
  tacticalFit: 18,
  morale: 12,
  fitness: 12,
  homeAdvantage: 8,
  form: 8,
  staff: 5,
  randomness: 3
};

export const leaguePaceProfiles = [
  { id:'brasileirao-a', name:'Brasileirão Série A', tempo:72, physicality:81, parity:86, cardRisk:74 },
  { id:'copa-do-brasil', name:'Copa do Brasil', tempo:69, physicality:83, parity:78, cardRisk:78 },
  { id:'sulamericana', name:'Sul-Americana', tempo:68, physicality:79, parity:82, cardRisk:80 },
  { id:'paulistao', name:'Paulistão', tempo:66, physicality:72, parity:74, cardRisk:65 }
];

export const balanceDiagnostics = [
  { label:'Força do elenco', value:84, note:'Peso central na chance de vitória, mas não garante resultado sozinho.' },
  { label:'Mando de campo', value:76, note:'Aumenta posse, pressão territorial e probabilidade de reação.' },
  { label:'Tática e instruções', value:81, note:'Decisões em jogo alteram momentum e volume ofensivo.' },
  { label:'Moral e fadiga', value:73, note:'Afeta consistência, risco de queda no segundo tempo e cartões.' },
  { label:'Variação realista', value:68, note:'Mantém surpresas sem transformar o jogo em aleatório demais.' }
];

export const aiTuningNotes = [
  'Times fortes vencem mais, mas clássicos e jogos fora mantêm risco real.',
  'Pressionar saída aumenta chance de roubo e chute, porém sobe desgaste e faltas.',
  'Baixar bloco protege vantagem, reduz posse e baixa chance de ampliar.',
  'Substituições melhoram energia e podem recuperar momentum após 60 minutos.',
  'Diretoria e torcida reagem com mais força a derrotas em casa e eliminações.'
];
