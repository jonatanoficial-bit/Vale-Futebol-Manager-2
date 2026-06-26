# v8.3.0 — Fase 66: Interface Pública Limpa para Jogadores

- Removeu rodapé técnico de build das telas do jogador.
- Limpou textos de fase, schema, QA e auditoria da entrada pública.
- Ocultou módulos internos do Menu do Treinador.
- Removeu o ribbon de QA Final do lobby.
- Atualizou cache buster para `js/app.js?v=830-player-ui-clean`.
- Preservou relatórios técnicos dentro do ZIP, fora da experiência normal do jogador.

# v8.2.0 — Fase 65 — QA Final do Beta Profissional e Homologação de Primeira Sessão

## Implementado
- Novo painel interno **QA Final do Beta** na rota `betaQaCenter`.
- Novo ribbon no lobby com resumo de rotas críticas e botão direto para QA.
- Nova matriz de homologação PC/celular:
  - PC Chrome/Edge;
  - Android retrato;
  - Android paisagem;
  - iPhone Safari/PWA;
  - rede lenta/cache Vercel.
- Roteiro de primeira sessão antes da divulgação:
  - capa;
  - central de slots;
  - criação de manager;
  - avatares;
  - escolha de clube;
  - lobby;
  - menu completo;
  - calendário;
  - treino;
  - scout;
  - staff;
  - finanças;
  - partida;
  - salvar/sair/carregar.
- Lista **No-Go**: condições que impedem publicar o beta, como avatar genérico repetido, botão sem resposta, slot errado ou asset quebrado.
- Novo validator `core/safety/beta-qa-validator.js`.
- Novo motor `js/systems/betaQaEngine.js`.
- Novo data pack `js/data/betaQaData.js`.
- Novo CSS `css/beta-qa-v820.css`.
- Cache buster atualizado no `index.html`: `js/app.js?v=820-beta-final-qa`.

## Preservado
- Fase 57: Save Slots 2.0.
- Fase 58: Calendário Vivo, Viagens e Fadiga.
- Fase 59: Scout/Recrutamento.
- Fase 60: Treino Semanal Realista.
- Fase 61: Staff Vivo.
- Fase 62: Finanças Profundas.
- Fase 63: Beta Profissional.
- Fase 64: Asset Integrity e avatares v810.

## Auditoria
- `node --check`: 226 arquivos JS/core/tools OK.
- `index.html`: 44 referências, 0 ausentes.
- Imports relativos JS: 0 ausentes.
- `asset-map.json`: 737 caminhos únicos, 0 ausentes.
- Avatares v810: 12 encontrados, 12 hashes únicos.
- QA Final v8.2: validator OK.
