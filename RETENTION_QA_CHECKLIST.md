# Checklist QA — Retenção v6.5.0

## Teste principal
1. Abrir o jogo no celular.
2. Entrar pelo menu principal.
3. Abrir Objetivos e Conquistas.
4. Tocar em cada missão diária.
5. Voltar para o lobby.
6. Abrir Jornal, Vestiário e Matchday pelos botões de objetivo.
7. Conferir se a rolagem não trava.
8. Conferir se cards não cortam em retrato.
9. Conferir se o botão de tela cheia não cobre os cards.
10. Conferir se `git grep` não encontra marcas de conflito.

## Resultado esperado
- Rota `objectivesHub` abre sem erro.
- Barras de progresso renderizam.
- Conquistas aparecem em grid mobile.
- Rotas antigas continuam funcionando.
- O jogo permanece offline/local.
