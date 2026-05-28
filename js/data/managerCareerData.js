
export const managerLicenses = [
  { id:'continental-c', name:'Continental C', minRep:35, unlock:'clubes de base e Série B' },
  { id:'continental-b', name:'Continental B', minRep:45, unlock:'clubes médios e mata-mata nacional' },
  { id:'continental-a', name:'Continental A', minRep:62, unlock:'clubes de ponta sul-americanos' },
  { id:'pro', name:'Licença Pro', minRep:78, unlock:'seleções e elite mundial' }
];

export const managerStyles = [
  { id:'possession', name:'Posse dominante', board:'paciência e controle', fan:'jogo bonito', risk:'cobra repertório contra retrancas' },
  { id:'pressing', name:'Pressão intensa', board:'competitividade imediata', fan:'energia alta', risk:'aumenta desgaste físico' },
  { id:'counter', name:'Transição vertical', board:'resultado acima da posse', fan:'jogo direto', risk:'torcida cobra protagonismo em casa' },
  { id:'youth', name:'Formador de base', board:'venda futura e sustentabilidade', fan:'identificação', risk:'resultados podem oscilar' }
];

export const managerContractTemplates = [
  { level:'Reconstrução', wage:0.45, lengthMonths:18, bonus:'Acesso ou G-12', releaseClause:2.4, objective:'estabilizar elenco e reduzir pressão financeira' },
  { level:'Competitivo', wage:0.9, lengthMonths:24, bonus:'G-6 ou semifinal de copa', releaseClause:5.8, objective:'classificar para torneio continental' },
  { level:'Elite nacional', wage:1.8, lengthMonths:30, bonus:'título nacional/continental', releaseClause:14.0, objective:'brigar por títulos e elevar reputação internacional' },
  { level:'Projeto mundial', wage:3.2, lengthMonths:36, bonus:'final continental ou Mundial', releaseClause:28.0, objective:'transformar o clube em potência global' }
];

export const boardReviewRules = [
  { min:82, label:'Blindado', decision:'Diretoria protege publicamente o treinador.' },
  { min:68, label:'Seguro', decision:'Projeto segue estável, com cobrança moderada.' },
  { min:52, label:'Pressionado', decision:'Próximas partidas entram em observação.' },
  { min:35, label:'Risco alto', decision:'Presidente considera troca se crise continuar.' },
  { min:0, label:'À beira da demissão', decision:'Ultimato interno ativado.' }
];

export const careerMilestones = [
  { id:'first-win', title:'Primeira vitória', reputation:2, trigger:'vencer uma partida oficial' },
  { id:'derby-win', title:'Vitória em clássico', reputation:4, trigger:'vencer rival de alta reputação' },
  { id:'top-six', title:'Entrou no G-6', reputation:5, trigger:'ficar em zona continental' },
  { id:'cup-final', title:'Finalista de copa', reputation:8, trigger:'chegar a uma final nacional ou continental' },
  { id:'international-title', title:'Título internacional', reputation:14, trigger:'ganhar Libertadores, Sul-Americana ou Mundial' }
];
