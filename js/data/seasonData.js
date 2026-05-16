export const competitions = [
  { id:'brasileirao-a', name:'Brasileirão Série A', short:'BRA', type:'Liga', scope:'Nacional', status:'Em andamento', round:'Rodada 12', priority:'Alta', objective:'Terminar no G6', prize:'Premiação por posição', color:'gold' },
  { id:'copa-do-brasil', name:'Copa do Brasil', short:'CDB', type:'Copa', scope:'Nacional', status:'Oitavas', round:'Jogo de ida', priority:'Alta', objective:'Chegar às quartas', prize:'Bônus por fase', color:'blue' },
  { id:'sulamericana', name:'Sul-Americana', short:'SUD', type:'Continental', scope:'América do Sul', status:'Fase de grupos', round:'Grupo B - Jogo 4', priority:'Muito alta', objective:'Classificar no grupo', prize:'Bônus continental', color:'green' },
  { id:'paulistao', name:'Paulistão', short:'PAU', type:'Estadual', scope:'São Paulo', status:'Encerrado', round:'Temporada estadual', priority:'Média', objective:'Usar base e rodar elenco', prize:'Receita local', color:'dark' }
];
export const seasonMonths = [
  { id:'jan', name:'Janeiro', focus:'Pré-temporada', matches:2, intensity:'Média' },
  { id:'fev', name:'Fevereiro', focus:'Estadual + ajustes', matches:6, intensity:'Alta' },
  { id:'mar', name:'Março', focus:'Estadual decisivo', matches:7, intensity:'Alta' },
  { id:'abr', name:'Abril', focus:'Início nacional', matches:6, intensity:'Alta' },
  { id:'mai', name:'Maio', focus:'Sequência nacional', matches:7, intensity:'Muito alta' },
  { id:'jun', name:'Junho', focus:'Ajuste físico', matches:5, intensity:'Média' },
  { id:'jul', name:'Julho', focus:'Janela + jogos grandes', matches:8, intensity:'Muito alta' },
  { id:'ago', name:'Agosto', focus:'Copas e liga', matches:7, intensity:'Muito alta' },
  { id:'set', name:'Setembro', focus:'Reta de classificação', matches:6, intensity:'Alta' },
  { id:'out', name:'Outubro', focus:'Pressão por pontos', matches:7, intensity:'Muito alta' },
  { id:'nov', name:'Novembro', focus:'Decisão de temporada', matches:6, intensity:'Máxima' },
  { id:'dez', name:'Dezembro', focus:'Finalização e relatório', matches:3, intensity:'Média' }
];
export const schedule = [
  { date:'2024-07-03', day:'Qua', home:'Santos FC', away:'Palmeiras', competition:'Brasileirão Série A', stage:'Rodada 12', venue:'Vila Belmiro', type:'match', importance:95, status:'Próximo jogo' },
  { date:'2024-07-07', day:'Dom', home:'Santos FC', away:'Flamengo', competition:'Brasileirão Série A', stage:'Rodada 13', venue:'Vila Belmiro', type:'match', importance:92, status:'Agendado' },
  { date:'2024-07-10', day:'Qua', home:'Grêmio', away:'Santos FC', competition:'Copa do Brasil', stage:'Oitavas - ida', venue:'Arena do Grêmio', type:'match', importance:88, status:'Agendado' },
  { date:'2024-07-14', day:'Dom', home:'Santos FC', away:'Bahia', competition:'Brasileirão Série A', stage:'Rodada 14', venue:'Vila Belmiro', type:'match', importance:75, status:'Agendado' },
  { date:'2024-07-17', day:'Qua', home:'Santos FC', away:'Unión', competition:'Sul-Americana', stage:'Grupo B - Jogo 4', venue:'Vila Belmiro', type:'match', importance:84, status:'Agendado' },
  { date:'2024-07-21', day:'Dom', home:'Corinthians', away:'Santos FC', competition:'Brasileirão Série A', stage:'Rodada 15', venue:'Neo Química Arena', type:'match', importance:98, status:'Clássico' },
  { date:'2024-07-24', day:'Qua', home:'Santos FC', away:'Grêmio', competition:'Copa do Brasil', stage:'Oitavas - volta', venue:'Vila Belmiro', type:'match', importance:91, status:'Decisão' },
  { date:'2024-07-28', day:'Dom', home:'Atlético-MG', away:'Santos FC', competition:'Brasileirão Série A', stage:'Rodada 16', venue:'Arena MRV', type:'match', importance:81, status:'Agendado' },
  { date:'2024-07-04', day:'Qui', title:'Recuperação pós-jogo', competition:'Treino', stage:'Regenerativo', venue:'CT Rei Pelé', type:'training', importance:55, status:'Planejado' },
  { date:'2024-07-05', day:'Sex', title:'Coletivo tático', competition:'Treino', stage:'Pressão e saída de bola', venue:'CT Rei Pelé', type:'training', importance:68, status:'Planejado' },
  { date:'2024-07-08', day:'Seg', title:'Relatório da diretoria', competition:'Reunião', stage:'Metas do mês', venue:'Sala executiva', type:'board', importance:70, status:'Planejado' },
  { date:'2024-07-12', day:'Sex', title:'Observação de mercado', competition:'Transferências', stage:'Janela nacional', venue:'Departamento de scout', type:'market', importance:76, status:'Planejado' },
  { date:'2024-07-19', day:'Sex', title:'Treino de bola parada', competition:'Treino', stage:'Defensivo/ofensivo', venue:'CT Rei Pelé', type:'training', importance:63, status:'Planejado' },
  { date:'2024-07-26', day:'Sex', title:'Coletiva pré-jogo', competition:'Imprensa', stage:'Perguntas da mídia', venue:'Auditório', type:'media', importance:50, status:'Opcional' }
];
export const calendarDays = Array.from({length:31}, (_,i)=>{
  const day = i + 1;
  const events = schedule.filter(ev => Number(ev.date.slice(-2)) === day);
  return { day, events };
});
export function eventTitle(ev){
  if(ev.type === 'match') return `${ev.home} x ${ev.away}`;
  return ev.title || ev.stage || ev.competition;
}
export function eventClass(ev){
  return ev.type === 'match' ? 'event-match' : ev.type === 'training' ? 'event-training' : ev.type === 'board' ? 'event-board' : ev.type === 'market' ? 'event-market' : 'event-soft';
}
