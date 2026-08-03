# 9.0.1 — 2026-08-03

- Adicionado ícone autoral em alta resolução ao aplicativo e ao manifesto PWA.
- Corrigida a escalação automática para sempre selecionar onze atletas e preservar um atacante.
- Corrigido o botão de retorno no modal de saída da partida para retomar o relógio.
- Fortalecido o carregamento dos elencos com busca nas Séries A, B e na base legada.
- Eliminadas duplicidades do próprio elenco no mercado após recarregar a carreira.
- Protegido o save existente durante a substituição de um espaço ocupado.
- Adicionados fallbacks separados para fotos de jogadores, avatares e escudos.
- Adicionada tolerância a navegadores que bloqueiam o armazenamento local.

# 9.0.0 — 2026-07-31

- Reconstrução do ponto de entrada e do núcleo jogável, ausentes no pacote recebido.
- Nova interface comercial mobile-first para orientação horizontal.
- Implementação de capa, três espaços de carreira, criação de treinador e escolha de clube.
- Integração dos elencos 2026, escalação, tática, treino, calendário, mercado e finanças.
- Implementação de partida simulada com relógio, pausa, velocidades e registro do resultado.
- Salvamento versionado com validação, backup, migração defensiva, importação e exportação.
- Overlay profissional de rotação com pausa e retomada segura.
- Manifesto PWA, service worker, cache offline, safe areas e caminhos relativos.
- Responsividade validada de 568×320 a 1920×1080.
- Documentação técnica e avaliação do produto separadas da interface pública.

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
