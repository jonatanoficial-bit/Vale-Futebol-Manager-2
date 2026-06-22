# Vale Futebol Manager Gold Edition — Real Data Pack v3.6.0

Esta build adiciona uma central para dados 2026 com foco em manutenção segura.

## O que ela resolve
- Série A e Série B 2026 auditáveis no jogo.
- Arquivo de elenco por clube em `data/rosters/2026/<clube>.json`.
- Caminho de foto por jogador em `assets/players/brazil/<clube>/<id>.png`.
- Status de qualidade por clube: `verified`, `curated` ou `template`.
- Templates seguros para clubes ainda sem elenco real conferido.

## Regra anti-quebra
Se um JSON estiver incompleto, o jogo usa normalização segura. Se a foto do jogador não existir, usa `assets/placeholders/player-generic.png`.

## Como atualizar um clube sem mexer no código
1. Abra `data/rosters/2026/<clube>.json`.
2. Substitua nomes, posições e atributos.
3. Coloque fotos em `assets/players/brazil/<clube>/<id>.png`.
4. Abra a tela `Dados 2026` ou `Atualizar elenco` para validar.

## Observação
A divisão 2026 foi estruturada conforme listas públicas consultadas em maio de 2026. Elencos marcados como `template` são jogáveis, mas devem ser substituídos por dados reais quando você tiver tempo ou arquivos confiáveis.
