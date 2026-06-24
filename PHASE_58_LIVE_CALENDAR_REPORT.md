# Vale Futebol Manager — v7.5.0

## Fase 58 — Calendário Vivo, Viagens e Fadiga Realista

Build: `v7.5.0`  
Data/hora: `2026-06-24 19:05:00 BRT`  
Base preservada: `v7.4.0 — Fase 57 Save Slots 2.0 e Fluxo de Carreira Definitivo`

## Objetivo da fase

Transformar o calendário em um sistema vivo que influencia a carreira, sem quebrar o fluxo definitivo de 3 slots da Fase 57.

## Sistemas adicionados

- Motor `liveCalendarEngine.js`.
- Dados `liveCalendarData.js`.
- Validador `live-calendar-validator.js`.
- CSS mobile-first `live-calendar-v750.css`.
- Tela de calendário substituída por Central de Calendário Vivo.
- Integração com lobby por faixa rápida de fadiga/recuperação.
- Integração com treino, partida, pós-jogo e save.

## Recursos implementados

- Sequência de jogos e compromissos calculada pelo clube ativo.
- Detecção de viagem fora de casa.
- Perfis de viagem: local, regional, voo nacional e voo continental.
- Fadiga acumulada por partida, treino e viagem.
- Recuperação por descanso, treino leve e recuperação ativa.
- Treino leve, pesado, descanso, recuperação e avanço de dia.
- Risco de lesão calculado por fadiga, recuperação, treino e congestionamento.
- Prontidão da equipe antes do próximo jogo.
- Recomendação automática da semana.
- Registro persistente no save atual.
- Schema atualizado para `750`.

## Fluxo preservado da Fase 57

- O jogo continua abrindo pela capa/central, sem entrar direto no lobby.
- 3 slots oficiais continuam preservados: `principal`, `career-2`, `career-3`.
- Criar carreira, carregar, renomear, apagar, continuar e sair permanecem ativos.
- O novo calendário grava dentro do slot ativo sem misturar carreiras.

## Auditoria realizada

- `node --check` executado em `209` arquivos JavaScript.
- Smoke test do motor do calendário executado via Node ESM.
- Renderização da tela `calendar` validada via `moduleScreen`.
- Validador `validateLiveCalendarSystem()` retornou OK.

## Arquivos principais alterados/criados

- `js/data/liveCalendarData.js`
- `js/systems/liveCalendarEngine.js`
- `core/safety/live-calendar-validator.js`
- `css/live-calendar-v750.css`
- `js/systems/state.js`
- `js/screens/moduleScreen.js`
- `js/screens/lobby.js`
- `js/systems/router.js`
- `js/app.js`
- `index.html`
- `build/build-info.json`

## Próxima fase recomendada

`v7.6.0 — Fase 59: Scout, Observadores e Recrutamento Profundo`

Implementar observadores por região, relatórios de jogadores, potencial, risco de contratação, custo, comparação com elenco e lista de desejos.
