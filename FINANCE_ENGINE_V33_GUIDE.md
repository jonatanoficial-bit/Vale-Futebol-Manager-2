# FINANCE_ENGINE_V33_GUIDE.md

Build v3.3.0 - Economia, diretoria, patrocínio e crise financeira realistas.

## Arquivos novos
- `js/data/financeData.js`
- `js/systems/financeEngine.js`

## Tela nova
- `financeCenter` / Economia no lobby.

## O que o motor calcula
- receita mensal projetada;
- despesas mensais;
- saldo mensal;
- projeção anual;
- pressão salarial;
- risco de dívida;
- confiança da diretoria;
- limite realista de mercado;
- cenários de crise;
- propostas comerciais compatíveis com reputação.

## Anti-quebra
Se faltar dado de clube, orçamento, torcida, reputação ou transferências, o motor usa valores seguros e mantém a tela funcional.
