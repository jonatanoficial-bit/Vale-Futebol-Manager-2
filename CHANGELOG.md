# Changelog - v4.9.0

## Fase 11 - Mercado internacional

- Criado `js/systems/transferEngine.js`.
- Adicionado livro internacional de transacoes no mercado.
- Adicionado registro anti-duplicacao de jogadores.
- Compra agora valida janela, orcamento, folha e duplicidade.
- Emprestimo agora valida folha e registra transacao.
- Venda agora atualiza orcamento, folha e livro de transacoes.
- Renovacao agora valida folha e registra custo salarial.
- Adicionado pre-contrato para chegada futura.
- Mercado IA global agora evita jogador ja assinado/emprestado/pre-contratado.
- Tela Transferencias atualizada para Mercado Internacional v4.9.0.
- Build visivel atualizada para `Build v4.9.0 | 2026-05-28 | 21:08 BRT`.

## Anti-quebra

- `core/safety/transfer-validator.js`
- `core/safety/contract-negotiation-validator.js`
- `core/safety/budget-guard.js`

## Compatibilidade

- Novo save key: `vfm_gold_save_v490`.
- Save v4.8.0 entra como legacy e pode migrar para v4.9.0.
