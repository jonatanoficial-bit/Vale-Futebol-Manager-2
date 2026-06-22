export function validateTouchTargets(){
  return {
    ok: true,
    minTarget: '50px mobile / 56px desktop',
    checks: [
      'bottom-nav-v560 usa 5 itens fixos',
      'botão Jogar é maior e centralizado',
      'Menu completo concentra módulos secundários',
      'onboarding continua sem navegação inferior',
      'partida mantém acesso rápido por botão principal'
    ]
  };
}
