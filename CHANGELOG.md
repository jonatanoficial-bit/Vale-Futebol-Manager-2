# 11.0.0 — World Edition — 2026-08-04

- Importados 548 clubes de uma fotografia CC0 atualizada, com elencos e metadados profissionais.
- Ampliado o mundo final para 833 clubes, 625 comandáveis, 20.458 jogadores, 50 ligas e 49 países.
- Criados pools profissionais para 87 seleções adicionais: 135 comandáveis e 211 simuladas.
- Adicionados 16 rostos fotorealistas fictícios e diversos para o treinador.
- Implementadas instruções táticas avançadas, instalações, negociação contratual, XP, licenças, prêmios e propostas de emprego.
- Implementado encerramento de temporada com acesso, rebaixamento, vagas continentais e histórico.
- Corrigida a Série A de 2026, removendo quatro rebaixados e quatro aliases legados duplicados; Série A e B agora têm 20 clubes únicos.
- Mundial de Clubes passou a exigir conquista continental na carreira, sem convite inicial por rating.
- Reduzida a camada azul que escondia as artes e aplicados fundos cinematográficos específicos por tela.
- Validado o campo 2D com 22 jogadores e bola, desktop 1366×768 e celular horizontal 844×390.
- Atualizado o service worker para buscar JSON primeiro na rede e evitar catálogos obsoletos em novas versões.
- Documentadas as 195 referências genéricas de escudo e as regras ainda aproximadas, sem alegar cobertura licenciada inexistente.

# 10.0.0 — World Edition — 2026-08-04

- Expandido o mundo para 530 clubes reais em 38 ligas e nas seis confederações.
- Integradas as 211 associações FIFA às eliminatórias continentais.
- Importadas 48 convocatórias oficiais da Copa do Mundo de 2026, com 1.248 jogadores.
- Mantidos 149 clubes comandáveis e 2.902 jogadores nominais do pacote original.
- Criada seleção mundial de clubes por continente, país, liga e busca.
- Adicionada carreira simultânea em clube e seleção, condicionada à reputação.
- Adicionadas Libertadores, Sul-Americana, Champions League, Europa League, CONCACAF Champions Cup, AFC/CAF/OFC Champions League e Mundial de Clubes.
- Implementadas vagas continentais por faixa da liga, promoção/rebaixamento exibidos e classificação internacional por pontos.
- Criado campo 2D com 22 jogadores, bola, formações, narração e estatísticas.
- Corrigido o layout da partida em 568×320 sem overflow global.
- Validado salvamento, recarga, progressão de tabela e funcionamento offline.
- Documentadas fontes, datas de corte e a natureza proprietária do overall VFM.

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
