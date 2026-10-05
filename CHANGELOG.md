# 17.0.0 — Fase 11 Fundação de Competições e Carreira — 2026-10-05

- Substituída a simulação avulsa do mundo por agendas persistentes de turno e returno para todas as ligas, armazenadas de forma compacta no save.
- Integrado o placar do clube à rodada mundial correta; os demais confrontos da mesma rodada passam a ser resolvidos e gravados juntos.
- Formalizada a ordem de desempate por pontos, vitórias, saldo de gols e gols pró nas competições de liga.
- Adicionadas funções individuais aos titulares, com impacto direto nos cálculos de ataque, controle e defesa do motor de jogo.
- Criados vestiário persistente, líderes, moral coletiva, confiança da torcida, pressão da imprensa, memória de decisões e promessas de minutos.
- Adicionada convocação de seleção editável entre 23 e 26 atletas, respeitada na escalação e na partida.
- Adicionados restauração do último backup local e diagnóstico local de eventos/erros.
- Migrados saves existentes para o schema 1700 preservando a tabela do clube e convertendo o restante da temporada para o novo calendário.

# 16.10.0 — Fase 10 Calendário Mundial e Legado — 2026-10-03

- Unificado o comando da agenda de clube e seleção: a partida cronologicamente mais próxima é mostrada no painel inicial, na agenda e no centro de jogo.
- Datas FIFA passam a abrir automaticamente a partida da seleção quando ela for o próximo compromisso, sem exigir que o usuário procure outra tela.
- Adicionados amistosos internacionais e rótulos claros para amistosos, Eliminatórias, Copa continental e Copa do Mundo.
- Criadas agenda completa e tabelas de classificação para as seleções, incluindo a projeção das fases ainda bloqueadas.
- Adicionadas classificações para fases de liga continentais de clubes, além da tabela nacional já existente.
- Reformulada a caixa de entrada com prioridade, categorias visuais, prévia, indicador de mensagens novas e destaque dourado para decisões importantes.
- Criados pontuação de carreira, faixa de XP visível na central do treinador e XP no topo da interface.
- Criada sala de troféus persistente, registrando competição, clube, temporada, pontuação e XP de cada conquista.
- Implementado popup de campeão ao fechar a temporada, com logo da competição, clube campeão e recompensa de XP.
- Migrados saves existentes para o schema 1605 sem apagar carreira, seleção, calendário ou títulos anteriores.

# 16.9.0 — Fase 9 Carreira do Treinador — 2026-10-02

- Substituído o desenho abstrato das instalações por seis imagens originais e cinematográficas para estádio, CT, academia, medicina, scouting e centro comercial.
- Otimizadas as imagens das instalações para carregamento móvel e adicionados níveis visuais sobre cada cenário.
- Criado contrato do treinador com salário, duração, clube atual e linha do tempo persistente.
- Adicionadas avaliações da diretoria após cada partida, com influência da força do rival, placar, eliminações, sequência e situação financeira.
- Implementados estados de prestígio, estabilidade, avaliação, pressão, ultimato e demissão real.
- Criado período sem clube com navegação própria, propostas contratuais detalhadas e assinatura imediata com uma nova equipe.
- Adicionadas propostas durante a temporada conforme reputação e desempenho, além das oportunidades entre temporadas.
- Transformados contatos de seleções em convites formais ligados à reputação e ao histórico do treinador.
- Preservados carreira, conquistas e seleção nacional nas trocas de clube e na migração para o schema 1604.
- Validados motor de carreira, migração de save, contratação, instalações e layouts de desktop e celular.

# 16.8.0 — Fase 8 Mercado, Finanças e Instalações — 2026-10-01

- Implementado fechamento mensal idempotente de salários, comissão, manutenção e receitas comerciais.
- Adicionada previsão de caixa para 90 dias com compromissos de transferências.
- Criadas obras com investimento inicial, prazo, progresso e entrega com efeito nos sistemas existentes.
- Reformulado o campus com seis áreas visuais e comparação de níveis.
- Ampliado o mercado para o nível do clube, com filtros por posição e investimento e alcance ligado ao scouting.
- Adicionadas ofertas de venda e renovação contratual; valuation considera idade, potencial, forma e contrato.
- Bloqueadas propostas inválidas, duplicadas, sem vaga ou acima da folha salarial.
- Corrigida a preservação dos termos de empréstimo e de contrato ao recarregar saves.
- Diferenciada a receita de jogos em casa e fora; migração para schema 1603 sem cobrança retroativa.

# 16.7.0 — Fase 7 Realismo Esportivo — 2026-10-01

- Criado cálculo de overall por posição a partir dos atributos técnicos, físicos e mentais.
- Adicionado rendimento atual influenciado por físico, forma, ritmo, moral, entrosamento, carga e adequação à função.
- Reformulada a escalação automática para respeitar a formação e excluir atletas lesionados ou suspensos.
- Adicionados carga acumulada, minutagem de 28 dias, minutos na temporada, jogos e titularidades.
- Implementadas lesões persistentes com gravidade, prazo de recuperação, recorrência e boletim médico.
- Conectados pressão, ritmo, fadiga, carga e risco individual à ocorrência de lesões na partida.
- Substituído o treino aleatório por progressão determinística ligada a idade, potencial, foco e nível do CT.
- Adicionada evolução anual de jovens e declínio gradual dos veteranos.
- Atualizadas as telas de elenco, treino, ficha e pós-jogo com dados de rendimento e medicina.
- Mantida compatibilidade automática com carreiras anteriores por migração para o schema 1602.
- Validados o motor de carreira e 2.400 jogos automatizados, incluindo incidência de lesões por intensidade.

# 16.6.0 — Fase 6 Acabamento Visual Comercial — 2026-10-01

- Adicionados rostos dos jogadores no campo tático, no banco e nas alterações durante a partida.
- Criados cartões por setor com cores distintas para goleiro, defesa, meio-campo e ataque.
- Redesenhados os ícones de Elenco, Tática, Jogar e Mercado como símbolos esportivos diretos.
- Aplicada identidade cromática própria aos cinco destinos principais e aos oito módulos da Central Mais.
- Reforçada a hierarquia dos botões de escalação, plano de jogo, dia de partida e instruções ao vivo.
- Validada a leitura dos nomes, notas, físico, posições e fotografias em computador e celular.

# 16.5.0 — Fase 5 Motor de Partida 2.0 — 2026-10-01

- Substituído o sorteio simples da partida por um motor determinístico orientado por atributos, adequação posicional, forma, moral e condição física.
- Garantido o mesmo resultado em 1×, 3× e 6× quando escalação e decisões são iguais.
- Integradas mentalidade, pressão, ritmo, largura, linha defensiva, construção, marcação e transição ao cálculo minuto a minuto.
- Adicionada IA adversária que reage ao placar e à qualidade das chances em três momentos da partida.
- Adicionados tipos de chance, xG, passes, escanteios, cartões, notas individuais, defesas e causas táticas explicadas.
- Ampliado o painel ao vivo com cinco seleções táticas, quatro controles, quatro planos rápidos, substituições e três orientações do treinador.
- Criado relatório pós-jogo persistente com fatores decisivos e melhores jogadores.
- Validado o equilíbrio em 2.400 partidas automatizadas e o fluxo visual em celular retrato e paisagem.

# 16.4.0 — Fase 4 Carreira Cinematográfica — 2026-10-01

- Restaurados os fundos cinematográficos de cada tela com sobreposição mais leve e painéis translúcidos.
- Reorganizada a home da carreira em torno do próximo jogo, progresso da temporada, diretoria, escalação e forma recente.
- Aplicado o campo fornecido pelo autor ao editor tático e à partida 2D.
- Recalculadas quatro formações para o campo horizontal, com setores claros de defesa, meio-campo e ataque.
- Substituídos placeholders por marcas reais rastreáveis de sete competições nacionais e continentais.
- Transformado o tutorial em guia visual: a interface continua aparente, a área explicada recebe destaque e cada passo propõe uma ação prática.
- Adaptados campo, atletas, tutorial e comando da carreira a celulares em retrato e paisagem.

# 16.3.0 — Fase 3 Interface Internacional — 2026-09-30

- Criado um sistema visual único para botões, campos, painéis, modais, avisos e estados de foco.
- Substituídos símbolos de texto por ícones SVG consistentes na navegação principal e na central Mais.
- Reformulada a navegação lateral no computador e a barra inferior no celular, com área ativa mais clara.
- Refinados cabeçalho do clube, métricas da carreira, cartões de menu e hierarquia tipográfica.
- Convertida a tabela do elenco em cartões de leitura rápida nas telas pequenas.
- Ampliadas áreas de toque, contraste, feedback de pressão e suporte a movimento reduzido.
- Reduzida a competição visual dos fundos para priorizar decisões e dados do jogo.

# 16.2.0 — Fase 2 Premium — 2026-09-29

- Integradas 7.019 fotografias reais únicas do Wikimedia Commons, com licença e crédito rastreáveis, cobrindo 8.565 IDs de jogadores.
- Adicionada foto genérica original, identificada como provisória, para jogadores sem correspondência real aprovada.
- Criada reconstrução auditável via Wikidata P2446/P18 e API de metadados do Wikimedia Commons.
- Adicionado planejador do elenco por setor, idade, contrato, potencial e folha salarial.
- Adicionado comparativo visual do impacto das instruções táticas em ataque, controle, defesa, intensidade e desgaste.
- Reformulado o jogo 2D com momentos-chave, filtros, pressão, físico, finalizações no alvo e orientação do auxiliar.
- Tornada a simulação reproduzível por partida e adicionadas reações táticas do adversário ao placar.
- Conectados objetivos da diretoria a pontos, desenvolvimento de jovens e controle financeiro.
- Ampliado o mercado com visão de folha, parcelas futuras, vagas e opção de compra de empréstimos.

# 16.1.0 — Fase 1 Mobile — 2026-09-29

- Reduzida a navegação principal de doze para cinco áreas: Início, Elenco, Tática, Jogar e Mais.
- Reunidos competições, agenda, treino, mercado, clube, mensagens, seleção e ajustes em uma central organizada.
- Adicionado painel Hoje com até três decisões prioritárias e ações contextuais.
- Adicionado guia inicial de cinco passos para novos jogadores.
- Liberada a interface em retrato e paisagem, com menu inferior, áreas de toque maiores e partida 2D adaptativa.
- Adicionados backup local antes de cada gravação, aviso real de falha e importação de carreira pela interface.
- Implementado processamento das parcelas futuras de transferências e encerramento automático de empréstimos.
- Tornada a ficha do jogador acessível diretamente pela lista do elenco.

# 16.0.0 — Ultimate World — 2026-08-04

- Ampliado o manager internacional para 833 clubes, 625 comandáveis, 20.458 jogadores, 50 ligas e 49 países.
- Integradas 211 seleções, 135 comandáveis, com eliminatórias continentais, copas continentais e Copa do Mundo.
- Adicionado calendário mensal, semanal e anual com filtros, sorteios e atualização dinâmica das fases.
- Implementado editor tático por arrastar ou tocar, banco com 12 atletas e até cinco substituições durante a partida.
- Expandido o motor 2D para 22 jogadores, bola, xG, finalizações, cartões, desgaste, desconfortos e reação tática adversária.
- Adicionados patrocínios, instalações, academia, treino individual, entrevistas pós-jogo e negociações detalhadas de transferências.
- Adicionadas 211 identidades nacionais locais e substituído o escudo do Atlético Mineiro pelo arquivo publicado no site oficial do clube.
- Atualizados PWA, cache, migração de salvamento, documentação, licenças e auditoria automatizada para o schema 1600.
- Mantidas divulgações explícitas sobre 195 escudos genéricos e formatos complexos de competição ainda aproximados.

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
# 16.0.0 — Ultimate World (2026-08-04)

- calendário anual, semanal e mensal com sorteios dinâmicos;
- simulação paralela de 50 ligas e líderes mundiais;
- mata-matas com progressão, eliminação e pênaltis;
- tática por arrastar/toque e substituições ao vivo;
- campo 2D com 22 jogadores, xG, cartões e desgaste;
- negociações avançadas, empréstimos, academia e treino individual;
- campus visual de instalações, patrocínios e coletiva pós-jogo;
- 211 identidades nacionais locais e escudo oficial do Atlético em alta resolução;
- interface mobile horizontal certificada em 844×390.
