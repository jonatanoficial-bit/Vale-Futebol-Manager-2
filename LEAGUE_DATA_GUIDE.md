# Guia de Ligas e Elencos - v2.6.1

## Correção aplicada
- Brasileirão Série A 2025 agora tem 20 clubes.
- Brasileirão Série B 2025 agora tem 20 clubes.
- Athletic/Athletic Club foi corrigido para Série B.

## Como trocar facilmente no futuro
Edite `js/data/gameData.js` para clubes exibidos no jogo ou use como referência `data/brazilian-leagues-2025.json`.
Para elencos, mantenha o padrão `data/rosters/<ano>/<clube>.json` e fotos em `assets/players/<pais>/<clube>/<id-do-jogador>.png`.

## Segurança
Se um logo ou foto não existir, o jogo usa fallback/placeholder e não trava.
