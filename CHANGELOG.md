# Changelog - Vale Futebol Manager: Gold Edition

## v1.6.0 - 2026-05-16 16:09 UTC

### Fase
Integração real entre partida, calendário, classificação e save.

### Incluído
- Motor seguro para avançar partida em blocos de 5 minutos.
- Botão Finalizar partida grava resultado no save local.
- Resultado integrado ao histórico da carreira.
- Lobby passa a exibir último resultado e próximo compromisso real da agenda.
- Calendário marca jogos concluídos e exibe placar salvo.
- Classificação recalcula pontos, jogos, gols, saldo e forma recente após resultado salvo.
- Save migrável com chave nova v160 e suporte a saves antigos.
- Log interno de integração anti-quebra.

### Anti-quebra
- Fallback de save corrompido preservado.
- Rotas seguras preservadas.
- Botões de partida não quebram quando a partida já terminou.
- Cálculo de classificação só altera clubes existentes; se algum clube não existir na tabela, o jogo ignora com segurança.
