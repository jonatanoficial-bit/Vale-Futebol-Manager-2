# MATCH_ENGINE_V3_GUIDE.md

## Build v3.0.0 — Motor de Partida Profundo

Esta build adiciona um motor de partida mais realista e seguro para o Vale Futebol Manager Gold Edition.

### Principais sistemas
- Tempo real com avanço automático.
- Velocidades 1x, 2x e 5x.
- Avanço manual +5 minutos preservado.
- Eventos dinâmicos por partida, sem depender de Santos x Palmeiras fixo.
- Gols, chances, finalizações, defesas, cartões, substituições, pênaltis e VAR narrativo.
- xG estimado, posse, passes, precisão, chutes, chutes no alvo, faltas e cartões.
- Cansaço ao longo do jogo.
- Momentum baseado em força, mando, elenco, tática, moral, clima e decisões.
- Pós-jogo com resumo, leitura tática, impacto de diretoria e torcida.

### Arquivo novo
- `js/systems/matchEngine.js`

### Segurança anti-quebra
O motor funciona mesmo quando:
- falta imagem de estádio;
- falta logo de clube;
- o clube escolhido não é Santos;
- o elenco importado tem jogadores sem foto;
- a partida vem de Série A ou Série B;
- o save veio de versões antigas.

### Integrações
- `state.js` usa o novo motor para calcular placar final.
- `match.js` usa o novo motor para renderizar estatísticas, eventos, pós-jogo e mesa tática.
- `app.js` mantém autoplay seguro e limita avanço máximo por ciclo.

### Próxima evolução recomendada
Build v3.1.0 — Propostas de clubes e seleções nacionais.
