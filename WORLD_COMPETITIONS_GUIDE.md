# WORLD_COMPETITIONS_GUIDE.md

Build v3.2.0 — Competições continentais e calendário mundial aprofundado.

## O que esta build adiciona

- Libertadores e Sul-Americana estruturadas por fases.
- Champions League e Europa League como competições internacionais de referência.
- Mundial de Clubes com ciclo de 4 anos.
- Intercontinental anual.
- Copa do Mundo, Copa continental e eliminatórias para seleções.
- Tela `Competições Globais` no lobby.
- Regras de classificação da Série A: Top 4 Libertadores, 5º-12º Sul-Americana, 17º-20º rebaixamento.
- Regras da Série B: Top 4 acesso.
- Fallback seguro para logos ausentes.

## Arquivos principais

- `js/data/worldCompetitionData.js`
- `js/systems/worldCompetitionEngine.js`
- Tela `worldCompetitions` integrada em `moduleScreen.js`

## Como expandir

Para adicionar uma competição, inclua um objeto novo em `continentalCompetitions`, `worldCompetitions` ou `nationalTeamCompetitions`.
Se não existir logo, o jogo usa `assets/placeholders/competition-generic.png`.
