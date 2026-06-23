# Vale Futebol Manager v7.0.0 — Simulação 90 Minutos 2D/Texto Premium

## Objetivo
A Fase 53 adiciona uma camada premium para a partida: leitura de 90 minutos, fases táticas, pressão emocional, eventos 2D/texto e microdecisões do treinador.

## Rota nova
- `matchSimulation90`

## Integrações
- Tela `match` preservada com tarja v7.0.0.
- `matchdayPremium` continua funcionando.
- `squadMorale`, `formation`, `instructions`, `training`, `liveWorld` e `mobileAudit` são usados como rotas conectadas.

## Estrutura
- `js/data/matchSimulation90Data.js`
- `js/systems/matchSimulation90Engine.js`
- `core/safety/match-simulation90-validator.js`
- `css/match-simulation90-v700.css`

## Regras
A camada v7.0.0 não substitui o motor de partida existente. Ela adiciona leitura premium e painel tático sem quebrar save antigo, sem depender de assets externos obrigatórios e sem bloquear rolagem no mobile.
