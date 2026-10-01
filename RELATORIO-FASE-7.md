# Relatório da Fase 7 — Realismo Esportivo e Balanceamento

## Build

- Versão: `16.7.0-phase7`
- Motor de carreira: `7.0.0`
- Motor de partida: `5.1.0`
- Schema de save: `1602`, com migração automática dos saves anteriores
- Data: 01/10/2026

## Resultado entregue

A qualidade de um jogador deixa de ser um único número fixo. O jogo calcula a nota por posição e o rendimento do dia com base nos atributos relevantes, condição física, forma, ritmo, moral, entrosamento, carga e adequação à função. A escalação automática usa esse resultado e nunca seleciona um atleta indisponível.

## Ciclo esportivo

- Cada minuto jogado alimenta carga, forma, ritmo, entrosamento e estatísticas da temporada.
- Dias sem jogo recuperam físico, reduzem carga e descontam o prazo das lesões.
- Pressão e ritmo altos aumentam fadiga e a incidência de problemas físicos.
- Lesões recebem diagnóstico leve, moderado ou grave, prazo e risco de recorrência.
- O treino possui efeitos próprios sobre carga, forma esportiva, entrosamento, evolução e risco.
- O foco individual e as instalações influenciam o desenvolvimento de atributos.
- Jovens evoluem conforme potencial; veteranos perdem capacidade física de forma gradual.

## Interface

- Elenco mostra GER, rendimento atual, forma, moral, físico, carga e disponibilidade.
- Planejador do elenco mostra atletas disponíveis por setor, lesionados e sobrecarregados.
- Centro de performance ganhou resumo médico e prazo de cada recuperação.
- Ficha do atleta mostra notas por posição, minutagem e seis indicadores de condição.
- O pós-jogo exibe o diagnóstico quando ocorre uma lesão.

## Calibração

- 2.400 partidas automatizadas sem divergência entre velocidades 1×, 3× e 6×.
- Média de lesões por jogo: `0,050` no plano equilibrado e `0,092` no plano de alta intensidade.
- Jogadores posicionados corretamente produziram `1,110 xG`; fora de posição, `0,885 xG`.
- Plano ofensivo produziu mais finalizações e maior desgaste que o plano equilibrado.
- Teste específico aprovou overall posicional, onze disponível, queda por fadiga, recuperação, treino determinístico, lesão persistente e envelhecimento.

## Arquivos principais

- `js/systems/careerPerformanceV3.js`
- `js/systems/matchEngineV2.js`
- `js/app-v16.js`
- `css/ultimate-v16.css`
- `tools/test-career-performance-v3.mjs`
- `tools/test-match-engine-v2.mjs`
