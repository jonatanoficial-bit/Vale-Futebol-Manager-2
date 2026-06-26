# Vale Futebol Manager — v8.2.0 / Fase 65

**Fase:** QA Final do Beta Profissional e Homologação de Primeira Sessão  
**Build:** v8.2.0  
**Schema:** 820  
**Data/hora:** 2026-06-26 11:13:18 BRT  
**Base preservada:** v8.1.0 — Fase 64 Asset Integrity

## Objetivo

A Fase 65 não adiciona um sistema isolado de gameplay. Ela consolida o beta para divulgação, criando uma tela de homologação final dentro do próprio jogo, com roteiro claro para testar a primeira sessão do jogador no PC e no celular.

## Principais entregas

- Rota nova: `betaQaCenter`.
- Painel novo: **QA Final do Beta Profissional**.
- Ribbon novo no lobby com atalho para QA.
- Matriz de rotas críticas com 16 pontos obrigatórios.
- Matriz de dispositivos para teste manual.
- Roteiro de primeira sessão para validar capa, slots, manager, avatares, clube, lobby, menus, sistemas e partida.
- Lista **No-Go** para impedir publicação se houver problema crítico.
- Validator novo para impedir que o QA final fique incompleto.
- Cache buster atualizado para Vercel/navegador.

## Rotas críticas validadas

1. `cover`
2. `mainMenu`
3. `newGame`
4. `teamSelect`
5. `confirmCareer`
6. `lobby`
7. `calendar`
8. `training`
9. `academyScouting`
10. `staff`
11. `financeCenter`
12. `match`
13. `saveSlotsV2`
14. `assetChecklist`
15. `betaProfessional`
16. `betaQaCenter`

## Arquivos principais alterados/criados

- `index.html`
- `manifest.webmanifest`
- `build/build-info.json`
- `js/app.js`
- `js/screens/lobby.js`
- `js/screens/moduleScreen.js`
- `js/data/betaQaData.js`
- `js/systems/betaQaEngine.js`
- `core/safety/beta-qa-validator.js`
- `css/beta-qa-v820.css`
- `data/asset-map.json`

## Auditoria executada

- Sintaxe JavaScript/core/tools: **226 arquivos OK**.
- Referências do `index.html`: **44 / 0 ausentes**.
- Imports relativos JS: **0 ausentes**.
- Caminhos únicos do `asset-map.json`: **737 / 0 ausentes**.
- Avatares `manager-v810-01..12`: **12 encontrados / 12 hashes únicos**.
- Validator `validateBetaQaSystem`: **OK**.
- ZIP final testado com `unzip -t`: OK.

## Observação de homologação manual

Mesmo com a auditoria automatizada aprovada, a publicação do beta deve passar por teste manual no celular real. A tela `QA Final do Beta` mostra exatamente o roteiro que deve ser seguido antes de divulgar.
