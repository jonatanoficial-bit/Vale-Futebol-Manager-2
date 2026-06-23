# Vale Futebol Manager v7.1.0 — Sons, Ambiência e Torcida

## Objetivo
A Fase 54 adiciona uma camada sonora leve para fazer o jogo parecer mais vivo sem transformar o projeto em arcade e sem exigir arquivos pesados.

## Sistemas adicionados
- Central `soundAmbience`.
- Presets de estádio, pré-jogo, pressão final, fora de casa, CT e diretoria.
- WebAudio gerado no navegador, sem MP3 obrigatório.
- Botões de ativar e parar som.
- Integração visual com a tela de partida.

## Regra mobile
O som só inicia depois de toque do usuário. Isso evita bloqueio em iPhone/Android e respeita as políticas dos navegadores.

## Próxima evolução
A fase seguinte pode adicionar pacote de efeitos reais opcionais em `assets/audio/`, mantendo fallback sintético para não quebrar o jogo.
