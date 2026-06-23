# Checklist QA — Simulação 90 Minutos v7.0.0

## Smoke test
- Abrir capa.
- Tocar em Simulação 90 minutos.
- Verificar se a rota `matchSimulation90` renderiza.
- Voltar para Partida.
- Iniciar partida e verificar tarja v7.0.0.
- Usar +5 min e confirmar mudança do minuto ativo.
- Abrir Matchday Premium.
- Abrir Moral Avançada.
- Testar em celular vertical com rolagem completa.

## Critérios de aceite
- Nenhum popup bloqueando tela.
- Nenhuma dependência externa obrigatória.
- Botões levam para rotas existentes.
- Build info exibe v7.0.0.
- `node --check` sem erros.
