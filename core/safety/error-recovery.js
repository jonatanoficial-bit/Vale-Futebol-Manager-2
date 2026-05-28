export function publicRecoveryMessage(){
  return 'A carreira foi recuperada com segurança. Você pode continuar normalmente.';
}

export function safeScreenFallback(buildLabel='Build v4.0.0'){
  return `<main class="screen"><div class="module-placeholder"><h1>Modo seguro</h1><p>${publicRecoveryMessage()}</p><button class="main-btn" data-route="lobby">Voltar ao lobby</button></div><div class="build-badge">${buildLabel}</div></main>`;
}
