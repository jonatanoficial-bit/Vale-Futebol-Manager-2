export const marketVersion = 'v3.7.0';

export const negotiationRules = [
  'Jogadores agora avaliam tamanho do clube, competicao, salario, titularidade e reputacao do treinador.',
  'Empresarios podem pressionar por aumento, clausula, luvas ou promessa de titularidade.',
  'Clubes IA buscam atletas por necessidade de posicao, idade, potencial e oportunidade financeira.',
  'Propostas recusadas podem afetar moral do atleta e confianca da diretoria se o valor for muito alto.',
  'Toda acao tem fallback: se faltar dado de jogador, clube ou liga, a simulacao usa perfil seguro generico.'
];

export const clubMarketNeeds = {
  santos: ['ATA','MEI','ZAG'],
  juventude: ['ATA','VOL','LD'],
  corinthians: ['LE','MEI','ATA'],
  palmeiras: ['ZAG','PD','VOL'],
  flamengo: ['GOL','ZAG','MEI'],
  gremio: ['ATA','MEI','PE'],
  vasco: ['VOL','ZAG','LD'],
  cruzeiro: ['ATA','MEI','ZAG'],
  default: ['ATA','MEI','ZAG']
};

export const agentProfiles = [
  {id:'guardian', name:'Agente protetor', style:'prioriza minutos e estabilidade', wageMultiplier:1.04, pressure:38, loyalty:76},
  {id:'super_agent', name:'Super agente', style:'maximiza salario, luvas e vitrine', wageMultiplier:1.22, pressure:78, loyalty:41},
  {id:'career_builder', name:'Gestor de carreira', style:'busca projeto esportivo e competicao continental', wageMultiplier:1.12, pressure:55, loyalty:62},
  {id:'local_agent', name:'Agente local', style:'aceita projeto nacional com bom papel no elenco', wageMultiplier:1.08, pressure:49, loyalty:68}
];

export const playerMotivations = [
  {id:'starter', label:'Quer ser titular', effect:'bloqueia proposta se papel for reserva sem bonus'},
  {id:'continental', label:'Busca Libertadores/continental', effect:'aumenta chance em clubes classificados'},
  {id:'salary', label:'Prioriza salario', effect:'exige oferta acima do salario atual'},
  {id:'development', label:'Projeto de evolucao', effect:'prefere clubes com treino/base forte'},
  {id:'homecoming', label:'Retorno ao pais', effect:'aceita reducao salarial moderada'}
];

export const smartMarketTargets = [
  {id:'diego-costa-jr', name:'Diego Costa Jr.', pos:'ATA', age:21, club:'Base Europeia', country:'br', overall:72, potential:86, value:4.8, wage:0.18, interest:73, motivation:'development', agent:'career_builder', role:'Atacante de desenvolvimento', status:'Joia monitorada', photo:'assets/players/scouted/diego-costa-jr.png'},
  {id:'thiago-maia', name:'Thiago Maia', pos:'VOL', age:29, club:'Internacional', country:'br', overall:77, potential:77, value:6.2, wage:0.42, interest:58, motivation:'starter', agent:'local_agent', role:'Volante experiente', status:'Possivel titular', photo:'assets/players/scouted/thiago-maia.png'},
  {id:'adryelson', name:'Adryelson', pos:'ZAG', age:28, club:'Lyon', country:'br', overall:78, potential:79, value:8.6, wage:0.52, interest:52, motivation:'continental', agent:'career_builder', role:'Zagueiro rapido', status:'Depende de Libertadores', photo:'assets/players/scouted/adryelson.png'},
  {id:'pedro-lima', name:'Pedro Lima', pos:'LD', age:19, club:'Wolverhampton', country:'br', overall:73, potential:85, value:7.9, wage:0.24, interest:61, motivation:'development', agent:'super_agent', role:'Lateral de alta revenda', status:'Em disputa', photo:'assets/players/scouted/pedro-lima.png'},
  {id:'martin-ojeda', name:'Martin Ojeda', pos:'PE', age:27, club:'Orlando City', country:'ar', overall:76, potential:78, value:7.4, wage:0.36, interest:67, motivation:'homecoming', agent:'guardian', role:'Ponta criativo', status:'Negociavel', photo:'assets/players/scouted/martin-ojeda.png'}
];

export const marketEvents = [
  {id:'agent_raise', title:'Empresario pede aumento', effect:'wage', severity:'media'},
  {id:'player_unhappy', title:'Jogador quer mais minutos', effect:'morale', severity:'alta'},
  {id:'rival_bid', title:'Clube rival entrou na disputa', effect:'competition', severity:'alta'},
  {id:'board_sell', title:'Diretoria recomenda venda', effect:'board', severity:'media'},
  {id:'loan_option', title:'Oportunidade de emprestimo com opcao', effect:'loan', severity:'baixa'}
];
