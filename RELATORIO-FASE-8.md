# Fase 8 — Mercado, finanças e instalações

Versão `16.8.0-phase8`, schema `1603`.

## Fluxo financeiro

O clube fecha cada mês uma única vez. Salários, comissão técnica e manutenção são despesas efetivas; receitas comerciais entram no caixa. O painel mostra o caixa estimado em 90 dias e as parcelas a vencer, sem antecipar resultados de jogos ou vendas. Bilheteria de mandante tem peso maior que a receita de visitante. Saves antigos começam a contabilidade na data atual da carreira.

## Instalações

Estádio, CT, academia, medicina, scouting e comercial têm cartões com identidade própria e representação dos cinco níveis. O projeto informa investimento, prazo, benefício e manutenção adicional. O nível permanece inalterado durante a obra e só melhora na entrega. O calendário processa as entregas, que geram aviso na caixa de entrada.

## Mercado

O scout procura atletas próximos ao nível do clube; melhorar a rede amplia a amostra de clubes. Filtros separam posição e valor dentro do caixa. Idade, potencial, forma e contrato influenciam o preço. A ficha do atleta permite renovar ou ouvir uma proposta de venda, válida por 14 dias. A venda gera receita e libera salários, preservando ao menos 16 jogadores e dois goleiros.

Compras e empréstimos recusam valores negativos ou não finitos, registros duplicados, excesso de vagas e de folha salarial. Empréstimos duram seis meses. Contratos, empréstimos, parcelas e campos esportivos permanecem nos saves após migração.

## Limites

O mercado ainda usa uma lista de oportunidades, sem economia persistente para todos os rivais. As ofertas de venda são simplificadas. Janelas por país e saída automática por fim de contrato permanente ficam fora desta entrega. A renovação já funciona e altera salário, prazo e luvas.

## Verificação

`node tools/test-club-economy.mjs` cobre cobranças mensais, repetição segura, previsão de caixa, parcelas, obras, entrega única, propostas inválidas, venda, redução de folha, validade das ofertas e recarga do save. Regressões esportivas são verificadas pelos testes de carreira e por 2.400 partidas do motor.

O fluxo de navegador passou em 1365×768, 390×844 e 844×390: obra, renovação, venda, filtro, rejeição de valor negativo e save/reload, sem erro JavaScript ou estouro horizontal global. A migração de save da Fase 7 manteve caixa e termos de empréstimo e iniciou a contabilidade sem histórico retroativo.

Teste reproduzível: sirva a pasta na porta 8765 e execute `node tools/test-phase8-browser.mjs` com Playwright disponível. `VFM_PLAYWRIGHT` pode apontar para o módulo instalado, `VFM_BROWSER` para o executável do navegador e `VFM_TEST_URL` para outra URL de teste. O teste cria uma carreira em um perfil temporário do navegador.
