export const BALANCE_GENERAL_VERSION = 'v5.9.7';

export const BALANCE_TARGETS_V597 = [
  { id:'goals', label:'Gols por partida', current:2.86, min:2.25, max:3.25, target:2.65, status:'ok', note:'Mantém emoção sem placares exagerados no modo carreira.' },
  { id:'homeAdvantage', label:'Vantagem do mandante', current:54, min:48, max:60, target:53, status:'ok', note:'Casa ajuda, mas não decide o resultado sozinha.' },
  { id:'upsets', label:'Zebras controladas', current:18, min:12, max:24, target:17, status:'ok', note:'Surpresas existem, mas times fortes seguem mais consistentes.' },
  { id:'cards', label:'Cartões por jogo', current:3.4, min:2.4, max:5.2, target:3.6, status:'ok', note:'Perfil realista para Brasil/CONMEBOL sem travar a partida.' },
  { id:'injuries', label:'Lesões por mês', current:2.1, min:0.8, max:3.8, target:2.0, status:'ok', note:'Lesão existe como gestão, mas não pune demais o usuário.' },
  { id:'reputationGrowth', label:'Crescimento de reputação', current:7, min:3, max:11, target:6, status:'ok', note:'Evita virar treinador mundial rápido demais.' },
  { id:'moneyGrowth', label:'Crescimento de renda', current:8, min:4, max:13, target:7, status:'ok', note:'Carreira progride, mas sem enriquecer em uma temporada.' },
  { id:'jobOffers', label:'Propostas por temporada', current:3, min:1, max:5, target:3, status:'ok', note:'O mercado aparece, mas não polui o fluxo do jogador.' }
];

export const BALANCE_PRESETS_V597 = [
  { id:'casual', name:'Casual', label:'Mais acessível', resultVariance:18, boardPressure:58, xpMultiplier:1.12, economyPressure:0.88, injuryRisk:0.78, offerFrequency:1.12, description:'Ideal para novos jogadores aprenderem sem frustração.' },
  { id:'realistic', name:'Realista', label:'Recomendado', resultVariance:24, boardPressure:76, xpMultiplier:1.00, economyPressure:1.00, injuryRisk:1.00, offerFrequency:1.00, description:'Equilíbrio principal do Vale Futebol Manager.' },
  { id:'elite', name:'Elite', label:'Desafiador', resultVariance:28, boardPressure:88, xpMultiplier:0.88, economyPressure:1.16, injuryRisk:1.12, offerFrequency:0.82, description:'Para jogadores experientes: pressão alta, evolução mais lenta e mercado exigente.' }
];

export const BALANCE_RULES_V597 = {
  match: {
    favoriteWinSoftCap: 68,
    derbyVarianceBoost: 7,
    awayPenaltyLimit: 8,
    maxGoalSwing: 4,
    xgClampMin: 0.15,
    xgClampMax: 4.20
  },
  career: {
    reputationGainWin: 1.2,
    reputationGainDraw: 0.35,
    reputationLossBadDefeat: -1.8,
    maxSeasonReputationGain: 11,
    maxSeasonReputationLoss: -14,
    nationalTeamInviteMinReputation: 88,
    eliteClubOfferMinLevel: 5
  },
  economy: {
    wageBudgetSafetyFloor: 0,
    transferBudgetMin: 0,
    seasonPrizeCapMultiplier: 1.25,
    promotionBonusMultiplier: 1.15,
    relegationPenaltyMultiplier: 0.82
  },
  morale: {
    winBoost: 3,
    drawBoost: 1,
    defeatLoss: -3,
    heavyDefeatLoss: -7,
    pressPositiveCap: 4,
    pressNegativeCap: -5,
    floor: 20,
    ceiling: 96
  },
  progression: {
    xpFirstMatch: 80,
    xpWin: 55,
    xpDraw: 25,
    xpLoss: 12,
    xpPressConference: 20,
    xpTutorialStep: 35,
    xpSeasonComplete: 260,
    levelCap: 10
  }
};

export const BALANCE_STRESS_SCENARIOS_V597 = [
  { id:'fullSeasonSmallClub', name:'Temporada clube médio/pequeno', checks:['não cair em 90% dos saves sem motivo', 'objetivos compatíveis com força do elenco', 'reputação sobe devagar'] },
  { id:'fullSeasonBigClub', name:'Temporada clube grande', checks:['pressão maior da diretoria', 'torcida cobra clássicos', 'propostas surgem se cumprir meta'] },
  { id:'careerSwitch', name:'Troca de clube', checks:['elenco muda corretamente', 'tabela reinicia quando necessário', 'contrato do treinador sincroniza'] },
  { id:'nationalTeamDualCareer', name:'Clube + seleção', checks:['datas FIFA não travam calendário', 'convocação oficial carrega', 'reputação internacional tem peso'] },
  { id:'longCareer', name:'Carreira longa 10 temporadas', checks:['renda não explode', 'XP não passa do teto', 'save permanece migrável'] }
];

export const BALANCE_PATCH_NOTES_V597 = [
  'Reputação não deve subir rápido demais após poucas vitórias.',
  'Convites de seleção ficam mais raros antes de reputação alta.',
  'Derrotas pesadas geram impacto maior em torcida e imprensa.',
  'Dinheiro e premiações têm teto para evitar carreira quebrada financeiramente.',
  'XP, missões, coletivas e mercado de treinadores agora seguem a mesma régua de progressão.',
  'A dificuldade Realista passa a ser o padrão recomendado para release candidate.'
];
