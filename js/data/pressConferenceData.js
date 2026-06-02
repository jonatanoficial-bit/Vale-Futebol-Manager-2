export const PRESS_CONFERENCE_VERSION = 'v5.9.3';

export const pressConferenceTemplates = {
  pre: [
    {
      id: 'pre-expectation',
      reporter: 'Repórter esportivo',
      question: 'Você estreia hoje no comando do clube. A torcida quer entender rapidamente qual será a identidade do seu time. O que podemos esperar?',
      answers: [
        { id:'ambitious', label:'Vamos jogar para vencer, com coragem e organização.', tone:'Confiante', effects:{reputation:2, fanMood:3, dressingRoomTrust:1, boardTrust:0, mediaPressure:2, tacticalBoost:1}, summary:'A torcida gostou da ambição, mas a imprensa aumentou a cobrança.' },
        { id:'balanced', label:'O primeiro passo é equilíbrio: competir bem, sofrer pouco e crescer jogo a jogo.', tone:'Equilibrado', effects:{reputation:1, fanMood:1, dressingRoomTrust:2, boardTrust:2, mediaPressure:-1, tacticalBoost:0}, summary:'A diretoria aprovou o tom maduro e o elenco recebeu a mensagem com segurança.' },
        { id:'protective', label:'Ainda estamos em adaptação. O elenco precisa de confiança e tempo.', tone:'Protetor', effects:{reputation:0, fanMood:-1, dressingRoomTrust:3, boardTrust:1, mediaPressure:-2, tacticalBoost:0}, summary:'O vestiário valorizou a proteção pública, embora parte da torcida tenha esperado mais ousadia.' }
      ]
    },
    {
      id: 'pre-tactics',
      reporter: 'Setorista do clube',
      question: 'O adversário tem força ofensiva e costuma pressionar alto. Sua equipe vai propor o jogo ou administrar melhor os espaços?',
      answers: [
        { id:'attack', label:'Vamos impor nosso ritmo e atacar os espaços desde o início.', tone:'Ofensivo', effects:{reputation:1, fanMood:3, dressingRoomTrust:1, boardTrust:0, mediaPressure:2, tacticalBoost:2}, summary:'A fala anima a torcida e dá um impulso tático ofensivo, mas eleva o risco de cobrança.' },
        { id:'control', label:'Vamos controlar os momentos do jogo, com posse e paciência.', tone:'Controle', effects:{reputation:1, fanMood:1, dressingRoomTrust:2, boardTrust:2, mediaPressure:0, tacticalBoost:1}, summary:'A mensagem passa confiança e reforça a ideia de equipe organizada.' },
        { id:'compact', label:'Precisamos ser compactos. O jogo também se vence sem se expor.', tone:'Cauteloso', effects:{reputation:0, fanMood:-1, dressingRoomTrust:1, boardTrust:2, mediaPressure:-1, tacticalBoost:-1}, summary:'A diretoria gosta da responsabilidade, mas a torcida sente falta de agressividade.' }
      ]
    },
    {
      id: 'pre-squad',
      reporter: 'Rádio local',
      question: 'Alguns jogadores ainda buscam espaço. Como você pretende lidar com o elenco nesta fase inicial?',
      answers: [
        { id:'merit', label:'Quem treinar melhor vai jogar. O campo vai decidir.', tone:'Mérito', effects:{reputation:1, fanMood:1, dressingRoomTrust:2, boardTrust:1, mediaPressure:0, tacticalBoost:0}, summary:'A mensagem fortalece meritocracia e mantém o elenco atento.' },
        { id:'unity', label:'Vamos precisar de todos. Titulares e reservas fazem parte do mesmo plano.', tone:'União', effects:{reputation:1, fanMood:1, dressingRoomTrust:3, boardTrust:1, mediaPressure:-1, tacticalBoost:0}, summary:'O vestiário recebeu bem a fala coletiva e a moral sobe.' },
        { id:'leaders', label:'Vou me apoiar nos líderes, mas abrirei espaço para quem mostrar qualidade.', tone:'Liderança', effects:{reputation:2, fanMood:0, dressingRoomTrust:1, boardTrust:2, mediaPressure:0, tacticalBoost:0}, summary:'A diretoria vê liderança e o grupo entende que haverá cobrança.' }
      ]
    }
  ],
  post: [
    {
      id: 'post-reading',
      reporter: 'TV esportiva',
      question: 'Depois do apito final, qual é sua leitura principal sobre a atuação da equipe?',
      answers: [
        { id:'praise', label:'Vi entrega e coragem. Temos ajustes, mas a base foi positiva.', tone:'Elogio', effects:{reputation:1, fanMood:2, dressingRoomTrust:3, boardTrust:1, mediaPressure:-1}, summary:'O elenco sai protegido e a torcida recebe uma mensagem positiva.' },
        { id:'demand', label:'Competimos, mas precisamos ser mais consistentes. O padrão vai subir.', tone:'Cobrança', effects:{reputation:2, fanMood:0, dressingRoomTrust:-1, boardTrust:2, mediaPressure:1}, summary:'A diretoria gosta da exigência, mas alguns jogadores sentem a cobrança pública.' },
        { id:'calm', label:'Agora é analisar com calma. Nem euforia, nem desespero.', tone:'Serenidade', effects:{reputation:1, fanMood:0, dressingRoomTrust:1, boardTrust:1, mediaPressure:-2}, summary:'A coletiva reduz ruído externo e mantém a carreira estável.' }
      ]
    },
    {
      id: 'post-individuals',
      reporter: 'Portal do torcedor',
      question: 'A torcida comentou bastante sobre desempenho individual de alguns atletas. Você vai citar nomes?',
      answers: [
        { id:'team-first', label:'Prefiro falar do coletivo. Ninguém vence ou perde sozinho.', tone:'Coletivo', effects:{reputation:1, fanMood:1, dressingRoomTrust:3, boardTrust:1, mediaPressure:-1}, summary:'O vestiário aprova a proteção coletiva e a moral geral melhora.' },
        { id:'leaders', label:'Os líderes precisam aparecer nesses momentos, e eu confio neles.', tone:'Líderes', effects:{reputation:2, fanMood:1, dressingRoomTrust:1, boardTrust:2, mediaPressure:1}, summary:'A imprensa ganha manchete, mas a diretoria percebe liderança.' },
        { id:'youth', label:'Os jovens terão espaço, mas precisam entender o peso da camisa.', tone:'Formador', effects:{reputation:1, fanMood:0, dressingRoomTrust:1, boardTrust:1, mediaPressure:0}, summary:'A fala reforça desenvolvimento e responsabilidade.' }
      ]
    },
    {
      id: 'post-next',
      reporter: 'Coletiva final',
      question: 'O calendário não para. Qual será a prioridade para o próximo compromisso?',
      answers: [
        { id:'recover', label:'Recuperar bem, corrigir detalhes e chegar inteiro no próximo jogo.', tone:'Gestão física', effects:{reputation:1, fanMood:0, dressingRoomTrust:2, boardTrust:2, mediaPressure:-1}, summary:'A comissão e o elenco aprovam o cuidado com recuperação.' },
        { id:'win', label:'A prioridade é vencer. Clube grande precisa responder rápido.', tone:'Ambição', effects:{reputation:2, fanMood:3, dressingRoomTrust:0, boardTrust:0, mediaPressure:2}, summary:'A torcida se anima, mas a cobrança pelo próximo resultado aumenta.' },
        { id:'process', label:'Vamos seguir o processo. O crescimento precisa ser sustentável.', tone:'Processo', effects:{reputation:1, fanMood:0, dressingRoomTrust:1, boardTrust:3, mediaPressure:-1}, summary:'A diretoria gosta da visão de longo prazo e a pressão externa diminui.' }
      ]
    }
  ]
};

export function getConferenceQuestions(type='pre'){
  return pressConferenceTemplates[type] || pressConferenceTemplates.pre;
}
