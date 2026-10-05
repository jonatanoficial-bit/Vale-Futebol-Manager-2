# Relatório da Fase 11 — competições e carreira

Versão: `17.0.0-phase11`
Schema de save: `1700`

## Entregue

- Um novo motor de calendário mundial cria rodadas completas de turno e returno para cada liga. A agenda é guardada em tuplas compactas, evitando que o save local cresça em excesso.
- Ao terminar uma partida de liga, o placar do usuário ocupa seu confronto real na rodada; os demais jogos daquela rodada são simulados e a tabela persistida é atualizada.
- A tela de competições explica o formato de turno e returno e a sequência de desempate.
- A tela de tática ganhou responsabilidades individuais para cada titular. Elas alteram os três eixos usados pelo motor de jogo: ataque, controle e defesa.
- A gestão do clube passa a exibir ambiente do vestiário, líderes, promessas, confiança da torcida, pressão da imprensa e memória recente da carreira.
- No relatório de um jogador do próprio elenco, o treinador pode prometer minutos. A promessa é acompanhada nas partidas seguintes e pode ser cumprida ou quebrada.
- A seleção ganhou convocação editável: 23 a 26 jogadores podem ser chamados, e apenas convocados podem entrar em campo.
- Ajustes incluem restauração do último backup local e um diagnóstico local de eventos e falhas, sem coleta externa de dados.

## Compatibilidade

Ao carregar um save anterior, a tabela do clube é preservada e convertida para o novo calendário. Os confrontos anteriores são reservados como rodadas já processadas; os resultados futuros seguem o novo modelo.

## Validação executada

- Sintaxe dos módulos e da aplicação.
- Motor de partidas, performance de elenco, economia, carreira do treinador e competição existentes.
- Novo teste da Fase 11: calendário completo, rodada persistida, tamanho do save mundial, relações e funções táticas.

Os detalhes do próximo ciclo estão em [PLANO-FASES-11-A-14.md](PLANO-FASES-11-A-14.md).
