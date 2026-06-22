# Vale Futebol Manager Gold - Mercado Inteligente v3.7.0

Esta build adiciona uma camada de realidade ao mercado de transferencias sem quebrar o sistema ja existente.

## O que muda
- Jogadores agora recebem uma nota de encaixe considerando posicao, necessidade do clube, reputacao do manager, orcamento, folha salarial, motivacao e agente.
- Empresarios podem gerar eventos de pressao.
- Clubes controlados por IA simulam compras com base em oportunidade e necessidade.
- Propostas recebidas passam a ter risco moral e nota de contexto.
- A central `Mercado Inteligente` foi adicionada ao lobby.

## Arquivos novos
- `js/data/marketIntelligenceData.js`
- `js/systems/marketIntelligenceEngine.js`
- `MARKET_INTELLIGENCE_V37_GUIDE.md`

## Protecao anti-quebra
Se faltar dado de clube, jogador, agente, motivacao ou foto, o sistema usa valores seguros e placeholders. Nenhuma negociacao deve travar o jogo por imagem ausente, dado incompleto ou elenco incompleto.

## Como evoluir depois
Para adicionar mais jogadores observados, edite `js/data/marketIntelligenceData.js` ou integre um JSON externo futuro em `data/markets/2026/` mantendo os campos: id, name, pos, age, club, country, overall, potential, value, wage, interest, motivation, agent e photo.
