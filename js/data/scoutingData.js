export const SCOUTING_VERSION = 'v7.6.0';

export const scoutingStatus = {
  version: SCOUTING_VERSION,
  phase: 'Scout e recrutamento',
  label: 'Scout Profissional 1.0',
  status: 'ready',
  schema: 760
};

export const scoutingRegions = [
  { id:'br-sudeste', name:'Brasil Sudeste', country:'BR', style:'técnica + mercado nacional', cost:0.42, days:5, chance:82, risk:24, positions:['ATA','MEI','ZAG'], note:'Boa leitura de Série A/B, atletas prontos e revenda segura.' },
  { id:'br-nordeste', name:'Brasil Nordeste', country:'BR', style:'força, velocidade e custo baixo', cost:0.28, days:6, chance:73, risk:32, positions:['PE','PD','VOL'], note:'Excelente para garimpo barato e atletas de intensidade.' },
  { id:'arg-uru', name:'Argentina / Uruguai', country:'AR/UY', style:'competitividade e personalidade', cost:0.64, days:8, chance:77, risk:38, positions:['VOL','ZAG','MEI'], note:'Bons líderes, marcação forte e adaptação sul-americana rápida.' },
  { id:'col-equ-per', name:'Colômbia / Equador / Peru', country:'CO/EC/PE', style:'explosão física e pontas', cost:0.58, days:9, chance:71, risk:41, positions:['ATA','PE','LD'], note:'Mercado ótimo para velocidade e transição.' },
  { id:'africa-oeste', name:'África Ocidental', country:'AF', style:'potencial físico alto', cost:0.86, days:13, chance:68, risk:54, positions:['ATA','VOL','ZAG'], note:'Maior risco de adaptação, mas teto físico e revenda podem compensar.' },
  { id:'europa-leste', name:'Europa Leste', country:'EU', style:'disciplina tática e custo médio', cost:1.05, days:15, chance:63, risk:49, positions:['GOL','ZAG','MC'], note:'Relatórios mais caros, bons goleiros e defensores.' }
];

export const scoutObservers = [
  { id:'carlos-araujo', name:'Carlos Araújo', role:'Observador nacional', quality:78, speciality:'Brasil Série A/B', patience:66, reliability:82, salary:0.18, bias:'prefere jogadores prontos', regions:['br-sudeste','br-nordeste'] },
  { id:'martina-rojas', name:'Martina Rojas', role:'Scout sul-americana', quality:84, speciality:'Argentina, Uruguai e Andes', patience:74, reliability:86, salary:0.24, bias:'valoriza personalidade e competitividade', regions:['arg-uru','col-equ-per'] },
  { id:'samuel-okoro', name:'Samuel Okoro', role:'Analista de potencial', quality:81, speciality:'África e sub-23', patience:88, reliability:76, salary:0.22, bias:'aceita risco para achar teto alto', regions:['africa-oeste','br-nordeste'] },
  { id:'ivan-petrovic', name:'Ivan Petrovic', role:'Observador europeu', quality:75, speciality:'defesa e goleiros', patience:70, reliability:79, salary:0.27, bias:'prefere disciplina tática', regions:['europa-leste','arg-uru'] }
];

export const recruitmentPriorities = [
  { id:'urgent-starter', label:'Titular urgente', riskLimit:44, costTolerance:80, description:'Busca jogador pronto, custo maior e risco menor.' },
  { id:'rotation', label:'Rotação competitiva', riskLimit:58, costTolerance:62, description:'Reforço para banco forte e calendário cheio.' },
  { id:'future-star', label:'Potencial futuro', riskLimit:72, costTolerance:54, description:'Aceita adaptação mais lenta em troca de potencial alto.' },
  { id:'low-cost', label:'Baixo custo', riskLimit:66, costTolerance:38, description:'Foca oportunidade, fim de contrato e salário controlado.' }
];

export const externalRecruitmentPool = [
  { id:'thiago-viana', name:'Thiago Viana', age:22, pos:'ATA', club:'Ceará', region:'br-nordeste', overall:72, potential:82, value:5.8, wage:0.32, style:'ataca profundidade', personality:'ambicioso', adaptation:78, injury:31, availability:'negociável' },
  { id:'renan-campos', name:'Renan Campos', age:24, pos:'VOL', club:'Sport', region:'br-nordeste', overall:71, potential:78, value:3.7, wage:0.24, style:'marcador intenso', personality:'líder silencioso', adaptation:84, injury:26, availability:'oportunidade' },
  { id:'joaquin-valdez', name:'Joaquín Valdez', age:21, pos:'MEI', club:'Defensor', region:'arg-uru', overall:73, potential:85, value:7.2, wage:0.41, style:'criador entre linhas', personality:'competitivo', adaptation:70, injury:34, availability:'disputado' },
  { id:'matias-ibarra', name:'Matías Ibarra', age:26, pos:'ZAG', club:'Rosario Central', region:'arg-uru', overall:75, potential:78, value:6.5, wage:0.48, style:'zagueiro agressivo', personality:'temperamental', adaptation:68, injury:39, availability:'negociável' },
  { id:'kevin-arboleda', name:'Kevin Arboleda', age:20, pos:'PD', club:'Independiente del Valle', region:'col-equ-per', overall:70, potential:86, value:8.1, wage:0.37, style:'ponta explosivo', personality:'confiante', adaptation:64, injury:42, availability:'alto potencial' },
  { id:'diego-cuellar', name:'Diego Cuéllar', age:23, pos:'LD', club:'Alianza Lima', region:'col-equ-per', overall:69, potential:77, value:2.9, wage:0.21, style:'apoio constante', personality:'profissional', adaptation:74, injury:28, availability:'baixo custo' },
  { id:'moussa-kone', name:'Moussa Koné', age:19, pos:'ATA', club:'ASEC Mimosas', region:'africa-oeste', overall:68, potential:88, value:4.4, wage:0.18, style:'força e aceleração', personality:'em evolução', adaptation:51, injury:37, availability:'aposta internacional' },
  { id:'ibrahim-diallo', name:'Ibrahim Diallo', age:22, pos:'ZAG', club:'Stade Malien', region:'africa-oeste', overall:70, potential:83, value:3.9, wage:0.2, style:'duelo físico', personality:'resiliente', adaptation:55, injury:33, availability:'garimpo' },
  { id:'nikola-markovic', name:'Nikola Marković', age:25, pos:'GOL', club:'Partizan', region:'europa-leste', overall:74, potential:80, value:5.6, wage:0.44, style:'goleiro reflexo', personality:'frio', adaptation:62, injury:20, availability:'negociável' },
  { id:'adam-kowalski', name:'Adam Kowalski', age:23, pos:'MC', club:'Wisła Kraków', region:'europa-leste', overall:72, potential:81, value:4.9, wage:0.35, style:'passe vertical', personality:'disciplinado', adaptation:66, injury:25, availability:'monitorado' },
  { id:'lucas-miranda', name:'Lucas Miranda', age:20, pos:'PE', club:'Ponte Preta', region:'br-sudeste', overall:69, potential:82, value:3.4, wage:0.19, style:'drible curto', personality:'ousado', adaptation:88, injury:29, availability:'série b' },
  { id:'fabio-lacerda', name:'Fábio Lacerda', age:27, pos:'ZAG', club:'Novorizontino', region:'br-sudeste', overall:73, potential:74, value:2.6, wage:0.3, style:'zagueiro seguro', personality:'profissional', adaptation:92, injury:22, availability:'pronto' }
];
