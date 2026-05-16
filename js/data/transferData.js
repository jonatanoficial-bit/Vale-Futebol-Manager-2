export const transferWindow = {
  status:'Aberta', daysLeft:27, budget:42.8, wageRoom:2.4, boardLimit:58.0, reputationPull:78,
  needs:['Centroavante de velocidade','Zagueiro canhoto','Meia criativo reserva','Lateral com fôlego']
};
export const transferShortlist = [
  {id:'lucas-almada', name:'Lucas Almada', pos:'MEI', age:23, club:'Vélez', country:'ar', overall:78, potential:86, value:12.5, wage:0.42, interest:71, role:'Criador de chances', status:'Observado', risk:'Médio', photo:'assets/players/scouted/lucas-almada.png'},
  {id:'matias-rojas', name:'Matías Rojas', pos:'MEI', age:28, club:'Sem contrato', country:'py', overall:77, potential:78, value:0.0, wage:0.55, interest:84, role:'Meia experiente', status:'Livre', risk:'Baixo', photo:'assets/players/scouted/matias-rojas.png'},
  {id:'juan-sforza', name:'Juan Sforza', pos:'VOL', age:22, club:'Newell’s', country:'ar', overall:75, potential:83, value:8.8, wage:0.31, interest:65, role:'Volante construtor', status:'Monitorado', risk:'Médio', photo:'assets/players/scouted/juan-sforza.png'},
  {id:'renan-lodi', name:'Renan Lodi', pos:'LE', age:26, club:'Al-Hilal', country:'br', overall:80, potential:81, value:18.0, wage:0.95, interest:46, role:'Lateral ofensivo', status:'Difícil', risk:'Alto', photo:'assets/players/scouted/renan-lodi.png'},
  {id:'kaio-jorge', name:'Kaio Jorge', pos:'ATA', age:23, club:'Cruzeiro', country:'br', overall:76, potential:82, value:10.2, wage:0.38, interest:79, role:'Atacante móvel', status:'Prioridade', risk:'Baixo', photo:'assets/players/scouted/kaio-jorge.png'},
  {id:'gabriel-veron', name:'Gabriel Veron', pos:'PD', age:22, club:'Porto', country:'br', overall:75, potential:84, value:9.5, wage:0.36, interest:62, role:'Ponta agressivo', status:'Em análise', risk:'Médio', photo:'assets/players/scouted/gabriel-veron.png'},
  {id:'lucas-esquivel', name:'Lucas Esquivel', pos:'LE', age:22, club:'Athletico-PR', country:'ar', overall:74, potential:81, value:7.4, wage:0.26, interest:69, role:'Lateral físico', status:'Alternativa', risk:'Baixo', photo:'assets/players/scouted/lucas-esquivel.png'},
  {id:'joao-victor', name:'João Victor', pos:'ZAG', age:25, club:'Benfica', country:'br', overall:77, potential:80, value:11.0, wage:0.48, interest:57, role:'Zagueiro rápido', status:'Empréstimo possível', risk:'Médio', photo:'assets/players/scouted/joao-victor.png'}
];
export const outgoingList = [
  {name:'Meia reserva', pos:'MEI', age:30, value:2.8, wage:0.18, market:'Série B / MLS', status:'Pode vender'},
  {name:'Zagueiro veterano', pos:'ZAG', age:34, value:1.4, wage:0.24, market:'Argentina / Chile', status:'Aliviar folha'},
  {name:'Ponta jovem', pos:'PE', age:19, value:3.1, wage:0.06, market:'Empréstimo', status:'Dar minutos'},
  {name:'Goleiro reserva', pos:'GOL', age:27, value:1.9, wage:0.11, market:'Brasil', status:'Negociável'}
];
export const negotiations = [
  {player:'Kaio Jorge', type:'Compra', stage:'Proposta inicial enviada', chance:68, offer:8.5, demand:10.2, next:'Ajustar bônus por metas'},
  {player:'Matías Rojas', type:'Livre', stage:'Salário em discussão', chance:82, offer:0.48, demand:0.55, next:'Oferecer luvas menores'},
  {player:'João Victor', type:'Empréstimo', stage:'Clube aceita dividir salário', chance:59, offer:0.24, demand:0.32, next:'Negociar opção de compra'}
];
export const scoutingReports = [
  {area:'Brasil Sub-23', grade:'A-', note:'Boa geração de pontas e laterais. Custo controlado, alto potencial.'},
  {area:'Argentina', grade:'B+', note:'Meias criativos com preço competitivo, risco salarial baixo.'},
  {area:'Europa retorno', grade:'B', note:'Atletas valorizados, mas chance de empréstimo é alta no meio da temporada.'},
  {area:'Mercado livre', grade:'A', note:'Oportunidade imediata para compor elenco sem custo de transferência.'}
];
export const contractRules = [
  {label:'Teto salarial recomendado', value:'€ 0.65M/mês'},
  {label:'Idade ideal de compra', value:'18 a 26 anos'},
  {label:'Política da diretoria', value:'Revenda e base forte'},
  {label:'Risco de folha', value:'Moderado'}
];
