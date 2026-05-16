export const formations = [
  {
    id:'433-possession',
    name:'4-3-3 Posse ofensiva',
    shape:'4-3-3',
    style:'Posse de bola',
    mentality:'Ofensiva controlada',
    risk:'Medio',
    chemistry:84,
    possessionBonus:8,
    attackBonus:7,
    defenseBonus:4,
    recommended:'Contra equipes fechadas e partidas em casa.',
    slots:[
      {role:'GK', label:'GOL', x:50, y:89},
      {role:'DL', label:'LE', x:20, y:72},
      {role:'DC', label:'ZAG', x:40, y:74},
      {role:'DC', label:'ZAG', x:60, y:74},
      {role:'DR', label:'LD', x:80, y:72},
      {role:'DMC', label:'VOL', x:50, y:58},
      {role:'MC', label:'MC', x:33, y:45},
      {role:'MC', label:'MC', x:67, y:45},
      {role:'LW', label:'PE', x:20, y:24},
      {role:'ST', label:'ATA', x:50, y:17},
      {role:'RW', label:'PD', x:80, y:24}
    ]
  },
  {
    id:'4231-balanced',
    name:'4-2-3-1 Equilibrado',
    shape:'4-2-3-1',
    style:'Equilibrio e transicao',
    mentality:'Equilibrada',
    risk:'Baixo',
    chemistry:79,
    possessionBonus:5,
    attackBonus:6,
    defenseBonus:7,
    recommended:'Plano seguro para jogos grandes e mata-mata.',
    slots:[
      {role:'GK', label:'GOL', x:50, y:89},
      {role:'DL', label:'LE', x:20, y:72},
      {role:'DC', label:'ZAG', x:40, y:74},
      {role:'DC', label:'ZAG', x:60, y:74},
      {role:'DR', label:'LD', x:80, y:72},
      {role:'DMC', label:'VOL', x:40, y:57},
      {role:'DMC', label:'VOL', x:60, y:57},
      {role:'AML', label:'MEI', x:25, y:35},
      {role:'AMC', label:'MEI', x:50, y:32},
      {role:'AMR', label:'MEI', x:75, y:35},
      {role:'ST', label:'ATA', x:50, y:17}
    ]
  },
  {
    id:'352-pressure',
    name:'3-5-2 Pressao e amplitude',
    shape:'3-5-2',
    style:'Pressao alta',
    mentality:'Agressiva',
    risk:'Alto',
    chemistry:73,
    possessionBonus:4,
    attackBonus:9,
    defenseBonus:5,
    recommended:'Quando precisa virar o jogo ou sufocar o adversario.',
    slots:[
      {role:'GK', label:'GOL', x:50, y:89},
      {role:'DC', label:'ZAG', x:30, y:73},
      {role:'DC', label:'ZAG', x:50, y:75},
      {role:'DC', label:'ZAG', x:70, y:73},
      {role:'LM', label:'ALA', x:15, y:52},
      {role:'MC', label:'MC', x:38, y:50},
      {role:'MC', label:'MC', x:50, y:42},
      {role:'MC', label:'MC', x:62, y:50},
      {role:'RM', label:'ALA', x:85, y:52},
      {role:'ST', label:'ATA', x:40, y:18},
      {role:'ST', label:'ATA', x:60, y:18}
    ]
  }
];

export const tacticalProfiles = {
  possession:{name:'Controle com posse', tempo:62, width:54, press:61, line:58, passing:78, directness:36, risk:42},
  balanced:{name:'Equilibrio competitivo', tempo:54, width:56, press:55, line:50, passing:62, directness:50, risk:38},
  direct:{name:'Transicao direta', tempo:72, width:68, press:66, line:47, passing:44, directness:79, risk:58},
  defensive:{name:'Bloco medio/baixo', tempo:42, width:45, press:38, line:35, passing:53, directness:56, risk:24}
};

export const playerInstructions = [
  {sector:'Goleiro', instruction:'Sair curto quando possivel', impact:'Aumenta construcao, risco baixo'},
  {sector:'Laterais', instruction:'Apoiar por fora com cobertura do volante', impact:'Mais amplitude, exige preparo fisico'},
  {sector:'Zagueiros', instruction:'Linha media com cobertura', impact:'Evita bola nas costas'},
  {sector:'Volante', instruction:'Proteger frente da area', impact:'Reduz contra-ataques'},
  {sector:'Meias', instruction:'Atacar espaco entre linhas', impact:'Eleva chance criada'},
  {sector:'Pontas', instruction:'Pressionar saida e cortar para dentro', impact:'Aumenta finalizacao'},
  {sector:'Centroavante', instruction:'Atacar primeiro pau e segurar zagueiros', impact:'Melhora presenca na area'}
];

export const setPieces = [
  {name:'Escanteios ofensivos', setup:'Zagueiro principal no segundo pau; meia na sobra', efficiency:68},
  {name:'Faltas laterais', setup:'Bola fechada buscando desvio curto', efficiency:61},
  {name:'Escanteios defensivos', setup:'Mista: 5 zona, 4 individual, 1 rebote', efficiency:72},
  {name:'Penaltis', setup:'Batedor com maior compostura e finalizacao', efficiency:76}
];
