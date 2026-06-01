# Changelog v5.9.2 - Fase 35

## Carreira infinita, reputação e missões

- Reputação atual do usuário agora aparece no lobby.
- Criada rota `careerTutorial` com tutorial, missões, renda acumulada e histórico de temporadas.
- Criado motor `careerProgressionEngine.js`.
- Criado validador `career-loop-validator.js`.
- Corrigido fluxo de fim de temporada: após os 38 jogos da liga, o jogo calcula posição, prêmio, reputação e inicia automaticamente a próxima temporada.
- Modo carreira agora suporta anos ilimitados sem travar no fim do calendário.
- Missões de engajamento adicionadas: primeira partida, tática, 5 jogos, 3 vitórias, reputação 90, renda, seleção nacional e objetivo da liga.

## Testes

- 38 partidas simuladas até fim da temporada: OK.
- Virada 2026 -> 2027: OK.
- Tabela reiniciada para nova temporada: OK.
- Histórico de temporada preservado: OK.
- Reputação e renda atualizadas: OK.
