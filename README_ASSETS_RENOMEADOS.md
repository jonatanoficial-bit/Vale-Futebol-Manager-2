# Vale Futebol Manager — Asset Pack Renomeado

Este pacote organiza as imagens geradas para os nomes exatos que o jogo reconhece.

## Como usar no GitHub/Vercel

1. Descompacte este ZIP.
2. Copie a pasta `assets/backgrounds/` para a raiz do seu projeto do jogo.
3. Aceite substituir os arquivos provisórios antigos.
4. Não altere os nomes dos arquivos abaixo, porque o jogo busca exatamente esses caminhos.

## Fundos principais reconhecidos pelo jogo

- `assets/backgrounds/bg-cover.jpg`
- `assets/backgrounds/bg-main-menu.jpg`
- `assets/backgrounds/bg-new-game.jpg`
- `assets/backgrounds/bg-avatar-create.jpg`
- `assets/backgrounds/bg-team-select.jpg`
- `assets/backgrounds/bg-confirm-career.jpg`
- `assets/backgrounds/bg-lobby.jpg`
- `assets/backgrounds/bg-club.jpg`
- `assets/backgrounds/bg-championship.jpg`
- `assets/backgrounds/bg-calendar.jpg`
- `assets/backgrounds/bg-full-calendar.jpg`
- `assets/backgrounds/bg-match.jpg`
- `assets/backgrounds/bg-formation.jpg`
- `assets/backgrounds/bg-instructions.jpg`
- `assets/backgrounds/bg-training.jpg`
- `assets/backgrounds/bg-staff.jpg`
- `assets/backgrounds/bg-sponsorship.jpg`
- `assets/backgrounds/bg-standings.jpg`
- `assets/backgrounds/bg-transfers.jpg`
- `assets/backgrounds/bg-settings.jpg`
- `assets/backgrounds/bg-finances.jpg`
- `assets/backgrounds/bg-squad.jpg`
- `assets/backgrounds/bg-store.jpg`
- `assets/backgrounds/bg-messages.jpg`

## Extras

As imagens não usadas diretamente pelo jogo foram colocadas em:

`assets/backgrounds/extras/`

Essas imagens não quebram o jogo. Elas só serão usadas se você apontar manualmente o caminho no código ou em futuras builds.

## Observações importantes

- Todas as imagens principais foram convertidas para `.jpg`, mantendo os nomes exatos esperados pelo jogo.
- Imagens repetidas idênticas foram removidas da pasta extras para reduzir peso.
- Algumas imagens têm textos embutidos porque vieram assim no ZIP original enviado. Mantive apenas quando era a melhor imagem disponível para aquela tela.
- Este pacote não altera JavaScript, HTML ou save do jogo. Ele é seguro para substituir apenas assets visuais.

## Auditoria

- Total de imagens recebidas no ZIP original: 47
- Imagens principais renomeadas: 24
- Imagens extras únicas preservadas: 21
- Data do pacote: 2026-05-19

