# Vale Futebol Manager: Gold Edition

Build inicial v0.1.0 do simulador manager de futebol mobile-first.

## Como publicar
1. Descompacte o ZIP.
2. Envie todos os arquivos para um repositório GitHub.
3. No Vercel, importe o repositório como projeto estático.
4. Não há backend obrigatório e não há dependências externas.

## Build atual
Consulte `build/build-info.json`.

## Regras do projeto
- Toda atualização deve ser entregue como ZIP completo.
- Toda build deve ter versão, data e hora visíveis dentro do jogo.
- O jogo deve continuar funcionando mesmo sem imagens reais.
- Assets reais podem ser adicionados depois nas pastas previstas, sem alterar código.

## Estado desta build
- Estrutura base completa.
- Navegação inicial.
- Telas principais com rotas seguras.
- Sistema de assets com fallback.
- Placeholders criados.
- Save local protegido.
- Auditoria automatizada incluída.

## Build v1.0.0 - Formação, tática e instruções avançadas

Inclui tela de formação premium, mesa tática mobile-first, seleção de esquema, banco de reservas, painel de entrosamento, instruções avançadas, perfis de jogo, bolas paradas e save migrável da v0.9.0. O sistema mantém fallback visual para todos os jogadores e assets.

### Build v1.6.0
Adiciona a partida simulada premium com mesa tática 2D, eventos por minuto, estatísticas ao vivo, narração, momentum, substituições preparadas e controles de avanço/finalização.


### Build v1.6.0
Integração entre partida, calendário, classificação e save local. A partida agora grava resultado, atualiza histórico da carreira, exibe último resultado no lobby, marca jogo concluído no calendário e recalcula a tabela com segurança.
