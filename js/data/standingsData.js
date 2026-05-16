export const standingsCompetitions = [
  { id:'brasileirao-a', name:'Brasileirão Série A', short:'BRA', scope:'Liga nacional', logo:'assets/competitions/brasileirao_a.png' },
  { id:'copa-do-brasil', name:'Copa do Brasil', short:'CDB', scope:'Copa eliminatória', logo:'assets/competitions/copa_do_brasil.png' },
  { id:'sulamericana', name:'Sul-Americana', short:'SUL', scope:'Continental', logo:'assets/competitions/sulamericana.png' },
  { id:'paulistao', name:'Paulistão', short:'PAU', scope:'Estadual', logo:'assets/competitions/paulistao.png' }
];
export const standingsTables = {
  'brasileirao-a': [
    { pos:1, club:'Flamengo', id:'flamengo', p:10, w:7, d:2, l:1, gf:21, ga:9, pts:23, form:['V','V','E','V','D'] },
    { pos:2, club:'Palmeiras', id:'palmeiras', p:10, w:7, d:1, l:2, gf:18, ga:8, pts:22, form:['V','D','V','V','V'] },
    { pos:3, club:'Atlético-MG', id:'atletico-mg', p:10, w:6, d:2, l:2, gf:16, ga:10, pts:20, form:['E','V','V','D','V'] },
    { pos:4, club:'Santos FC', id:'santos', p:10, w:6, d:1, l:3, gf:17, ga:11, pts:19, form:['V','V','D','V','E'], user:true },
    { pos:5, club:'Fluminense', id:'fluminense', p:10, w:5, d:3, l:2, gf:14, ga:9, pts:18, form:['E','V','E','V','D'] },
    { pos:6, club:'São Paulo', id:'sao-paulo', p:10, w:5, d:2, l:3, gf:15, ga:13, pts:17, form:['D','V','V','E','V'] },
    { pos:7, club:'Botafogo', id:'botafogo', p:10, w:4, d:4, l:2, gf:13, ga:10, pts:16, form:['E','E','V','D','V'] },
    { pos:8, club:'Internacional', id:'internacional', p:10, w:4, d:3, l:3, gf:12, ga:12, pts:15, form:['V','D','E','E','V'] },
    { pos:9, club:'Corinthians', id:'corinthians', p:10, w:4, d:2, l:4, gf:11, ga:12, pts:14, form:['D','V','D','V','E'] },
    { pos:10, club:'Grêmio', id:'gremio', p:10, w:3, d:4, l:3, gf:12, ga:13, pts:13, form:['E','D','V','E','E'] },
    { pos:11, club:'Cruzeiro', id:'cruzeiro', p:10, w:3, d:3, l:4, gf:10, ga:12, pts:12, form:['D','E','V','D','E'] },
    { pos:12, club:'Bahia', id:'bahia', p:10, w:3, d:2, l:5, gf:9, ga:14, pts:11, form:['V','D','D','E','D'] }
  ],
  'copa-do-brasil': [
    { pos:1, club:'Santos FC', id:'santos', p:4, w:3, d:1, l:0, gf:8, ga:2, pts:10, form:['V','V','E','V'], user:true },
    { pos:2, club:'Cruzeiro', id:'cruzeiro', p:4, w:2, d:1, l:1, gf:5, ga:4, pts:7, form:['V','E','D','V'] },
    { pos:3, club:'Bahia', id:'bahia', p:4, w:1, d:1, l:2, gf:4, ga:6, pts:4, form:['D','V','E','D'] },
    { pos:4, club:'Vasco', id:'vasco', p:4, w:0, d:1, l:3, gf:2, ga:7, pts:1, form:['D','D','E','D'] }
  ],
  'sulamericana': [
    { pos:1, club:'Santos FC', id:'santos', p:5, w:3, d:1, l:1, gf:9, ga:5, pts:10, form:['V','V','D','E','V'], user:true },
    { pos:2, club:'Racing', id:'racing', p:5, w:2, d:2, l:1, gf:7, ga:5, pts:8, form:['E','V','E','D','V'] },
    { pos:3, club:'Colo-Colo', id:'colo-colo', p:5, w:2, d:1, l:2, gf:6, ga:7, pts:7, form:['D','V','V','E','D'] },
    { pos:4, club:'Universidad Católica', id:'u-catolica', p:5, w:1, d:0, l:4, gf:4, ga:9, pts:3, form:['D','D','V','D','D'] }
  ],
  'paulistao': [
    { pos:1, club:'Palmeiras', id:'palmeiras', p:8, w:6, d:1, l:1, gf:15, ga:5, pts:19, form:['V','V','V','E','D'] },
    { pos:2, club:'Santos FC', id:'santos', p:8, w:5, d:2, l:1, gf:14, ga:6, pts:17, form:['V','E','V','V','E'], user:true },
    { pos:3, club:'São Paulo', id:'sao-paulo', p:8, w:4, d:2, l:2, gf:11, ga:8, pts:14, form:['D','V','E','V','V'] },
    { pos:4, club:'Corinthians', id:'corinthians', p:8, w:3, d:2, l:3, gf:9, ga:10, pts:11, form:['V','D','E','D','V'] }
  ]
};
export const scorers = [
  { player:'Miguel Tavares', club:'Santos FC', goals:9, assists:3, rating:7.8 },
  { player:'Bruno Henrique', club:'Flamengo', goals:8, assists:2, rating:7.6 },
  { player:'Endrick Lima', club:'Palmeiras', goals:7, assists:4, rating:7.7 },
  { player:'Lucas Moura', club:'São Paulo', goals:6, assists:5, rating:7.5 },
  { player:'Paulinho', club:'Atlético-MG', goals:6, assists:2, rating:7.4 },
  { player:'Soteldo', club:'Santos FC', goals:4, assists:7, rating:7.6 }
];
export const competitionStats = {
  goals: 146,
  avgGoals: 2.43,
  cards: 238,
  cleanSheets: 31,
  bestAttack: 'Flamengo',
  bestDefense: 'Palmeiras',
  mostPossession: 'Santos FC',
  pressureLeader: 'Atlético-MG'
};
