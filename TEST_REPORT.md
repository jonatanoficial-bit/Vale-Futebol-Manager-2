# Test Report - v4.7.0

## Testes executados

- node --check js/systems/matchEngine.js: OK
- node --check js/screens/match.js: OK
- node --check js/systems/state.js: OK
- node --check js/app.js: OK
- node --check core/safety/match-engine-validator.js: OK
- node --check core/safety/event-balance-tester.js: OK
- node --check core/safety/xg-integrity-checker.js: OK
- Importação ESM do motor: OK
- buildDeepMatchSnapshot aos 90 minutos: OK
- getPostMatchReport: OK
- validateMatchEngineV470: OK
- runMatchEngineStressGate 100 partidas: OK

## Resultado do stress test
- Partidas: 100
- Erros: 0
- Média de gols: 2.89
- Média de cartões: 2.72
- Lesões narrativas: geradas sem travamento
- Pênaltis narrativos: gerados sem travamento
- VAR narrativo: gerado sem travamento

Build aprovada.
