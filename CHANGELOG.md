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


## v1.7.0 - Substituições funcionais e decisões durante a partida
- Substituições agora alteram o estado real da partida e ficam registradas no save local.
- Limite seguro de 5 substituições, com bloqueio anti-quebra para partida encerrada, atleta repetido ou combinação inválida.
- Comandos rápidos de decisão tática agora aplicam impacto no momentum, posse e volume ofensivo.
- Painel de histórico de substituições e decisões em jogo adicionado à tela de partida.
- Save migrável da v1.6.0 para v1.7.0.


## v1.8.0 - 2026-05-16 18:10 UTC
- Mercado de transferências agora é interativo e persistente.
- Botões Negociar, Melhorar, Fechar, Encerrar, Negociar saída e Renovar gravam no save local.
- Orçamento e folha livre passam a ser atualizados por compras, vendas e renovações.
- Diretoria bloqueia automaticamente negócios acima do orçamento ou da folha.
- Diário de mercado registra ações para auditoria interna do jogador.


## v1.9.0 - 2026-05-16 18:45 UTC

### Fase
IA e balanceamento esportivo.

### Incluído
- Novo módulo IA / Realismo no lobby.
- Novo arquivo js/data/balanceData.js com perfis de dificuldade, pesos da simulação e ritmo por competição.
- Novo sistema js/systems/balance.js para cálculo determinístico e anti-quebra de força, mando, tática, moral, fadiga e variação controlada.
- Tela de partida passa a exibir leitura de IA v1.9 com chance estimada, xG previsto, força dos times e ritmo da liga.
- Resultado final agora usa camada de balanceamento quando a partida chega aos 90 minutos.
- Log de balanceamento salvo no estado local para auditoria de coerência esportiva.

### Anti-quebra
- Saves antigos v1.8.0 e anteriores migram automaticamente para v1.9.0.
- Se uma equipe não tiver força cadastrada, o motor usa rating genérico seguro.
- Se dificuldade estiver inválida no save, o jogo volta para modo realista.
