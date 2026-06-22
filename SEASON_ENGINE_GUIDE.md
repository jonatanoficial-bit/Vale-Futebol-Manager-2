# Vale Futebol Manager Gold Edition - Season Engine v2.7.0

Esta build adiciona a primeira camada real de temporada competitiva.

## O que o jogo entende agora

- clube escolhido define liga, calendário e próxima partida;
- Brasileirão Série A e Série B usam calendário de ida e volta;
- cada rodada possui todos os jogos da liga;
- ao finalizar a partida do usuário, os demais jogos da rodada são simulados automaticamente;
- tabela usa escudos/logos por clube;
- Série A: top 4 Libertadores, faixa intermediária Sul-Americana, 4 últimos rebaixados;
- Série B: 4 primeiros sobem para Série A, 4 últimos entram em risco de queda;
- histórico da rodada fica salvo no save local;
- tela nova `Temporada` no lobby.

## Segurança anti-quebra

Se um escudo não existir, o jogo usa placeholder. Se uma liga não tiver clubes suficientes, o motor cai para lista brasileira base. Se um save antigo for carregado, o jogo migra para `vfm_gold_save_v270`.

## Próximas evoluções recomendadas

v2.8.0 deve aprofundar transferências reais: propostas recebidas, compra, venda, empréstimo, janela, folha, orçamento, clubes rivais e negociação por IA.
