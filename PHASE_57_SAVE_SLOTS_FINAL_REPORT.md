# Vale Futebol Manager — v7.4.0 Fase 57

Gerado em: 2026-06-24 15:37:35 BRT

## Entrega
- ZIP completo do jogo preservando a base recebida.
- Sistema real com exatamente 3 slots jogáveis oficiais: Principal, Carreira 2 e Carreira 3.
- Entrada protegida: ao abrir o jogo, a rota volta para a capa/central; não entra direto no lobby salvo.
- Continuar último save pela central de carreiras.
- Criar carreira dentro de slot escolhido, sem misturar dados antigos.
- Trocar carreira salvando o slot ativo antes de carregar outro.
- Apagar slot isolado sem limpar os outros slots.
- Renomear save com prompt preenchido pelo nome atual.
- Sair da carreira com salvamento e retorno à central.
- Build com data/hora visível inclusive nas telas sem menu inferior.

## Arquivos principais alterados
- `js/data/saveSlotsData.js`
- `js/systems/saveSlotsEngine.js`
- `js/systems/saveManager.js`
- `js/systems/state.js`
- `js/systems/router.js`
- `js/screens/common.js`
- `js/screens/moduleScreen.js`
- `core/safety/save-slots-v2-validator.js`
- `css/save-slots-v740.css`
- `build/build-info.json`

## Auditoria executada
- `node --check` em 206 arquivos JavaScript.
- Teste lógico local com `localStorage` simulado: criar slot, iniciar carreira, recarregar jogo e confirmar que a rota inicial volta para `cover`.
- Snapshot Save Slots 2.0 validado com 3 slots oficiais.
