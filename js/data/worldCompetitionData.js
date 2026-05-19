
// Vale Futebol Manager Gold Edition - worldCompetitionData v3.2.0
// Estrutura expansível de competições continentais, mundiais e seleções.
export const continentalCompetitions = [
  {
    id:'libertadores', name:'Copa Libertadores', region:'CONMEBOL', tier:'continental-elite', logo:'assets/competitions/libertadores.png',
    format:'Fase de grupos + mata-mata', seasonWindow:'Fevereiro a Novembro', prize:26.5, reputation:96,
    qualification:['Top 4 da Série A','Campeão da Copa do Brasil','Campeão da Sul-Americana pode herdar vaga','Campeão atual entra como defensor do título'],
    stages:[
      {id:'pre', name:'Pré-Libertadores', months:['Fevereiro'], legs:2, teams:16},
      {id:'groups', name:'Fase de grupos', months:['Março','Abril','Maio'], rounds:6, teams:32},
      {id:'r16', name:'Oitavas de final', months:['Julho','Agosto'], legs:2, teams:16},
      {id:'qf', name:'Quartas de final', months:['Agosto','Setembro'], legs:2, teams:8},
      {id:'sf', name:'Semifinal', months:['Setembro','Outubro'], legs:2, teams:4},
      {id:'final', name:'Final única', months:['Novembro'], legs:1, teams:2}
    ]
  },
  {
    id:'sulamericana', name:'Copa Sul-Americana', region:'CONMEBOL', tier:'continental-secondary', logo:'assets/competitions/sulamericana.png',
    format:'Grupos + playoffs + mata-mata', seasonWindow:'Março a Novembro', prize:8.8, reputation:82,
    qualification:['5º ao 12º da Série A','Eliminados da Libertadores entram em playoffs','Campeões nacionais podem receber vagas conforme regra local'],
    stages:[
      {id:'first', name:'Fase nacional', months:['Março'], legs:1, teams:32},
      {id:'groups', name:'Fase de grupos', months:['Abril','Maio','Junho'], rounds:6, teams:32},
      {id:'playoff', name:'Playoffs continentais', months:['Julho'], legs:2, teams:16},
      {id:'r16', name:'Oitavas', months:['Agosto'], legs:2, teams:16},
      {id:'qf', name:'Quartas', months:['Setembro'], legs:2, teams:8},
      {id:'sf', name:'Semifinal', months:['Outubro'], legs:2, teams:4},
      {id:'final', name:'Final única', months:['Novembro'], legs:1, teams:2}
    ]
  },
  {
    id:'champions-league', name:'Champions League', region:'UEFA', tier:'continental-elite', logo:'assets/competitions/champions.png',
    format:'Liga única + mata-mata', seasonWindow:'Setembro a Maio', prize:85.0, reputation:100,
    qualification:['Campeões e melhores colocados das ligas europeias','Ranking nacional define quantidade de vagas'],
    stages:[
      {id:'league', name:'Fase de liga', months:['Setembro','Outubro','Novembro','Dezembro','Janeiro'], rounds:8, teams:36},
      {id:'playoff', name:'Playoff eliminatório', months:['Fevereiro'], legs:2, teams:16},
      {id:'r16', name:'Oitavas', months:['Março'], legs:2, teams:16},
      {id:'qf', name:'Quartas', months:['Abril'], legs:2, teams:8},
      {id:'sf', name:'Semifinal', months:['Abril','Maio'], legs:2, teams:4},
      {id:'final', name:'Final única', months:['Maio'], legs:1, teams:2}
    ]
  },
  {
    id:'europa-league', name:'Europa League', region:'UEFA', tier:'continental-secondary', logo:'assets/competitions/europa_league.png',
    format:'Liga única + mata-mata', seasonWindow:'Setembro a Maio', prize:24.0, reputation:88,
    qualification:['Faixa intermediária das principais ligas europeias','Campeões de copas nacionais','Eliminados de competições superiores conforme regra'],
    stages:[
      {id:'league', name:'Fase de liga', months:['Setembro','Outubro','Novembro','Dezembro','Janeiro'], rounds:8, teams:36},
      {id:'playoff', name:'Playoff', months:['Fevereiro'], legs:2, teams:16},
      {id:'r16', name:'Oitavas', months:['Março'], legs:2, teams:16},
      {id:'qf', name:'Quartas', months:['Abril'], legs:2, teams:8},
      {id:'sf', name:'Semifinal', months:['Abril','Maio'], legs:2, teams:4},
      {id:'final', name:'Final única', months:['Maio'], legs:1, teams:2}
    ]
  }
];

export const worldCompetitions = [
  {
    id:'club-world-cup', name:'Mundial de Clubes', region:'FIFA', logo:'assets/competitions/club-world-cup.png', cycleYears:4,
    nextEdition:2029, lastEdition:2025, month:'Junho/Julho', format:'32 clubes, fase de grupos e mata-mata', reputation:99,
    qualification:['Campeões continentais','Clubes por ranking continental','Limites por país conforme regulamento da edição'],
    gameplayImpact:['Calendário apertado','Receita extraordinária','Exposição global','Aumento de interesse por jogadores']
  },
  {
    id:'intercontinental-cup', name:'Copa Intercontinental', region:'FIFA', logo:'assets/competitions/intercontinental.png', cycleYears:1,
    nextEdition:2026, month:'Dezembro', format:'Campeões continentais em mata-mata', reputation:86,
    qualification:['Campeão continental de cada confederação','Campeão europeu entra na fase final'],
    gameplayImpact:['Prestígio internacional','Bônus de patrocínio','Pressão de calendário']
  }
];

export const nationalTeamCompetitions = [
  {
    id:'world-cup', name:'Copa do Mundo', region:'FIFA', logo:'assets/competitions/world-cup.png', cycleYears:4,
    nextEdition:2026, month:'Junho/Julho', format:'Fase de grupos + mata-mata', reputation:100,
    qualification:['Eliminatórias continentais','Vagas por confederação','País-sede classificado automaticamente'],
    stages:['Grupos','16 avos/Oitavas conforme edição','Quartas','Semifinal','Final']
  },
  {
    id:'copa-america', name:'Copa continental sul-americana', region:'CONMEBOL', logo:'assets/competitions/copa-america.png', cycleYears:4,
    nextEdition:2028, month:'Junho/Julho', format:'Grupos + mata-mata', reputation:92,
    qualification:['Seleções CONMEBOL','Convidados quando aplicável'],
    stages:['Grupos','Quartas','Semifinal','Final']
  },
  {
    id:'euro', name:'Copa continental europeia', region:'UEFA', logo:'assets/competitions/euro.png', cycleYears:4,
    nextEdition:2028, month:'Junho/Julho', format:'Grupos + mata-mata', reputation:94,
    qualification:['Eliminatórias europeias','Playoffs continentais'],
    stages:['Grupos','Oitavas','Quartas','Semifinal','Final']
  },
  {
    id:'world-cup-qualifiers', name:'Eliminatórias continentais', region:'Global', logo:'assets/competitions/qualifiers.png', cycleYears:4,
    nextEdition:2026, month:'Datas FIFA', format:'Rodadas por confederação', reputation:90,
    qualification:['Convocação nacional ativa','Calendário FIFA'],
    stages:['Datas FIFA de março','Datas FIFA de junho','Datas FIFA de setembro','Datas FIFA de outubro','Datas FIFA de novembro']
  }
];

export const globalCalendarTemplates = [
  {month:'Janeiro', type:'club', title:'Pré-temporada e janela doméstica', competitions:['Ligas nacionais','Mercado']},
  {month:'Fevereiro', type:'continental', title:'Pré-Libertadores e copas nacionais', competitions:['Libertadores','Copa do Brasil']},
  {month:'Março', type:'mixed', title:'Liga nacional, grupos continentais e data FIFA', competitions:['Série A/B','Libertadores','Sul-Americana','Eliminatórias']},
  {month:'Abril', type:'continental', title:'Grupos continentais em andamento', competitions:['Libertadores','Sul-Americana','Champions','Europa League']},
  {month:'Maio', type:'continental', title:'Finais europeias e liga nacional', competitions:['Champions','Europa League','Série A/B']},
  {month:'Junho', type:'international', title:'Data FIFA, Copa continental ou Mundial de Clubes', competitions:['Seleções','Mundial de Clubes']},
  {month:'Julho', type:'market', title:'Janela internacional e mata-mata continental', competitions:['Transferências','Libertadores','Sul-Americana']},
  {month:'Agosto', type:'mixed', title:'Mata-mata continental e liga', competitions:['Libertadores','Sul-Americana','Série A/B']},
  {month:'Setembro', type:'international', title:'Data FIFA e semifinais continentais', competitions:['Eliminatórias','Libertadores','Sul-Americana']},
  {month:'Outubro', type:'pressure', title:'Reta final nacional e decisão continental', competitions:['Série A/B','Libertadores','Sul-Americana']},
  {month:'Novembro', type:'finals', title:'Finais sul-americanas e definição nacional', competitions:['Libertadores','Sul-Americana','Série A/B']},
  {month:'Dezembro', type:'world', title:'Encerramento, prêmios e competições globais', competitions:['Intercontinental','Planejamento']}
];

export const qualificationRules = {
  brazilSerieA:{
    leagueId:'brasileirao-a',
    rules:[
      {range:'1º a 4º', destination:'Libertadores', impact:'Fase principal ou vaga direta conforme ajuste de calendário'},
      {range:'5º a 12º', destination:'Sul-Americana', impact:'Competição continental secundária'},
      {range:'17º a 20º', destination:'Série B', impact:'Rebaixamento e perda de receita'}
    ]
  },
  brazilSerieB:{
    leagueId:'brasileirao-b',
    rules:[
      {range:'1º a 4º', destination:'Série A', impact:'Acesso e aumento de orçamento'},
      {range:'17º a 20º', destination:'Série C', impact:'Queda, corte de orçamento e crise esportiva'}
    ]
  },
  continental:{
    rules:[
      {source:'Campeão da Libertadores', destination:'Mundial de Clubes / Intercontinental', impact:'Prestígio global, receitas e interesse internacional'},
      {source:'Campeão da Sul-Americana', destination:'Recopa / vaga continental superior', impact:'Reputação continental e bônus de patrocínio'},
      {source:'Campeão da Champions', destination:'Mundial de Clubes / Intercontinental', impact:'Maior reputação global do ciclo'}
    ]
  }
};
