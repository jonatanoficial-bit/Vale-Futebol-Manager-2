
export const MANAGER_JOB_MARKET_VERSION = 'v5.9.6';
export const MANAGER_MARKET_TIERS = [
  { key:'regional', label:'Regional', minRep:0, fitBase:62, wage:[0.12,0.45], pressure:'Baixa' },
  { key:'national', label:'Nacional', minRep:45, fitBase:68, wage:[0.45,1.2], pressure:'Média' },
  { key:'continental', label:'Continental', minRep:65, fitBase:72, wage:[1.2,2.8], pressure:'Alta' },
  { key:'elite', label:'Elite mundial', minRep:82, fitBase:78, wage:[2.8,7.5], pressure:'Muito alta' }
];
export const MANAGER_CLUB_MARKET = [
  {id:'fluminense',name:'Fluminense',country:'br',league:'Brasileirão Série A',tier:'continental',role:'Treinador principal',style:'posse e experiência',objective:'G-5 e campanha forte em copas',project:'Elenco competitivo com pressão imediata'},
  {id:'corinthians',name:'Corinthians',country:'br',league:'Brasileirão Série A',tier:'continental',role:'Treinador principal',style:'intensidade e vestiário forte',objective:'Classificar à Libertadores',project:'Clube de massa, pressão alta e grande exposição'},
  {id:'palmeiras',name:'Palmeiras',country:'br',league:'Brasileirão Série A',tier:'elite',role:'Treinador principal',style:'tática e títulos',objective:'Disputar todos os títulos',project:'Estrutura elite e cobrança máxima'},
  {id:'flamengo',name:'Flamengo',country:'br',league:'Brasileirão Série A',tier:'elite',role:'Treinador principal',style:'protagonismo e ataque',objective:'Título nacional ou continental',project:'Elenco estrelado e pressão de campeão'},
  {id:'santos',name:'Santos',country:'br',league:'Brasileirão Série A',tier:'national',role:'Treinador principal',style:'base e reconstrução',objective:'Sul-Americana e valorização da base',project:'Reconstrução com tradição ofensiva'},
  {id:'vasco',name:'Vasco',country:'br',league:'Brasileirão Série A',tier:'national',role:'Treinador principal',style:'recuperação competitiva',objective:'Meio de tabela com copa forte',project:'Retomada esportiva e torcida exigente'},
  {id:'internacional',name:'Internacional',country:'br',league:'Brasileirão Série A',tier:'continental',role:'Treinador principal',style:'organização e transição',objective:'Libertadores',project:'Clube continental com meta agressiva'},
  {id:'gremio',name:'Grêmio',country:'br',league:'Brasileirão Série A',tier:'continental',role:'Treinador principal',style:'resultado e tradição copeira',objective:'G-6 e copa',project:'Ambição continental e torcida forte'},
  {id:'real-madrid',name:'Real Madrid',country:'es',league:'LaLiga',tier:'elite',role:'Técnico principal',style:'estrelas e títulos',objective:'Champions League',project:'Elenco galáctico, cobrança global'},
  {id:'manchester-city',name:'Manchester City',country:'gb',league:'Premier League',tier:'elite',role:'Head Coach',style:'posse e controle',objective:'Premier League e Champions',project:'Projeto mundial de alta exigência'},
  {id:'boca-juniors',name:'Boca Juniors',country:'ar',league:'Argentina',tier:'continental',role:'Treinador principal',style:'competitividade e clássicos',objective:'Libertadores',project:'Pressão sul-americana máxima'},
  {id:'river-plate',name:'River Plate',country:'ar',league:'Argentina',tier:'continental',role:'Treinador principal',style:'posse e base',objective:'Título nacional e Libertadores',project:'Academia forte e ambição continental'}
];
export const MANAGER_NATIONAL_MARKET = [
  {id:'brasil',name:'Brasil',country:'br',tier:'elite',role:'Treinador da Seleção',objective:'Ganhar Copa América e Copa do Mundo',calendar:'Eliminatórias, Copa América e Copa do Mundo',pressure:'Extrema'},
  {id:'argentina',name:'Argentina',country:'ar',tier:'elite',role:'Treinador da Seleção',objective:'Manter hegemonia internacional',calendar:'Eliminatórias e Copa do Mundo',pressure:'Extrema'},
  {id:'uruguai',name:'Uruguai',country:'uy',tier:'continental',role:'Treinador da Seleção',objective:'Chegar longe em torneios internacionais',calendar:'Eliminatórias e Copa América',pressure:'Alta'},
  {id:'colombia',name:'Colômbia',country:'co',tier:'continental',role:'Treinador da Seleção',objective:'Classificar e competir em mata-mata',calendar:'Eliminatórias e Copa América',pressure:'Alta'},
  {id:'portugal',name:'Portugal',country:'pt',tier:'elite',role:'Selecionador nacional',objective:'Disputar título europeu e mundial',calendar:'Data FIFA e Copa do Mundo',pressure:'Muito alta'},
  {id:'franca',name:'França',country:'fr',tier:'elite',role:'Selecionador nacional',objective:'Final de Copa do Mundo',calendar:'Data FIFA e Copa do Mundo',pressure:'Muito alta'}
];
export const MANAGER_MARKET_EVENTS = ['Imprensa especula seu nome em projeto maior.','Diretoria rival monitora seu desempenho recente.','Empresário intermediário sondou disponibilidade para conversa.','Federação observa sua evolução de reputação e licenças.'];
