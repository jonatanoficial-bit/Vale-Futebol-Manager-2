# v8.0.1 — Fase 63.1: Hotfix Beta Profissional / Avatares reais

- Corrigido problema visual em que os 12 avatares do fluxo Criar Manager apareciam como o mesmo placeholder.
- Gerados 12 PNGs distintos em `assets/avatars/manager-v801-01.png` até `manager-v801-12.png`.
- Substituídos também os caminhos antigos `manager-01.png` até `manager-12.png` para compatibilidade.
- Adicionada migração automática de saves antigos para os caminhos versionados.
- Atualizado `asset-map.json`, build-info, manifest PWA e relatório da Fase 63.1.
- Preservados os sistemas v8.0.0 Beta Profissional.

---

# v8.0.0 — Fase 63: Beta Profissional / Consolidação Geral

- Auditoria geral dos sistemas críticos para divulgação beta.
- Adicionado Centro Beta Profissional com score, gates, rotas e roteiro manual.
- Menu completo consolidado com deduplicação visual de atalhos repetidos.
- Build atualizado para v8.0.0, schema 800 e manifest PWA revisado.
- Preservados Save Slots 2.0, Calendário Vivo, Scout, Treino Semanal, Staff Vivo e Finanças Profundas.

# v7.9.0 — Fase 62: Finanças, Patrocínio e Bilheteria Profunda

Data: 2026-06-24 17:11:11 BRT  
Base: v7.8.0 — Fase 61 Staff e Comissão Técnica Viva

## Implementado

- Novo motor financeiro `FINANCE_ENGINE_VERSION = v7.9.0`.
- Estado `finance` migrado para schema 790 no save.
- Caixa, dívida, folha salarial, teto de folha, fluxo mensal e projeção anual.
- Receitas por transmissão, bilheteria, patrocínio, premiações, loja/licenciamento e sócio-torcedor.
- Despesas por elenco, staff, operação/viagens, dívida, base e bônus.
- Patrocínios ativos com satisfação, bônus, valor anual, valor mensal e meses restantes.
- Mercado comercial com propostas negociáveis por reputação, torcida e score da diretoria.
- Política de ingressos com preço popular, equilibrado, premium e jogo decisivo.
- Bilheteria com capacidade, ocupação, público estimado, receita bruta, custos e renda líquida.
- Premiações por vitória/empate e botões de simulação controlada.
- Reunião financeira da diretoria ajustando limite de mercado, confiança e alertas.
- Integração pós-jogo: matchday + premiação entram no financeiro salvo.
- Ribbon financeiro no lobby e nova tela mobile-first do centro financeiro.

## Preservado

- Fase 57: Save Slots 2.0 e fluxo inicial limpo.
- Fase 58: Calendário vivo, viagens e fadiga.
- Fase 59: Scout, observadores e recrutamento.
- Fase 60: Treino semanal realista.
- Fase 61: Staff e comissão técnica viva.

## Auditoria

- 216 arquivos JavaScript/core verificados com `node --check`.
- Smoke test do motor financeiro v7.9.0 concluído com snapshot, validação, render, ações e ledger.

---

# v7.8.0 — Fase 61: Staff e Comissão Técnica Viva

Data/build: 2026-06-24 17:00:22 BRT

- Transformada a tela de staff em departamento vivo e persistente no save.
- Adicionadas funções reais: auxiliar técnico, preparador físico, analista de desempenho, médico, olheiro, fisioterapeuta e preparador de goleiros.
- Cada membro agora possui qualidade, influência, salário, estilo, nota e impacto por área.
- Adicionado mercado de staff com contratação por cargo, reposição automática e controle de teto mensal.
- Adicionado foco semanal da comissão: equilíbrio, preparação de jogo, prevenção de lesões, recrutamento e escola de goleiros.
- Staff agora influencia treino semanal, risco de lesão, scout/recrutamento e motor da partida.
- Lobby recebeu faixa de Comissão Técnica Viva.
- Schema geral atualizado para 780 preservando Fases 57, 58, 59 e 60.
- Auditoria: 215 arquivos JavaScript verificados com `node --check`; smoke test do staff/treino/scout OK.

---

# v7.7.0 — Fase 60: Treino Semanal Realista

Data/build: 2026-06-24 16:34:17 BRT

- Criado microciclo profissional de 7 dias: recuperação, tático, físico, bola parada, finalização, coletivo e descanso.
- Adicionados presets de semana: equilibrada, calendário congestionado, ofensiva, defensiva e recuperação.
- Treino agora gera impacto direto no motor da partida: ataque, defesa, bola parada, controle tático, condição e risco físico.
- Integração com Calendário Vivo: carga semanal, fadiga, recuperação e risco de lesão são atualizados no save.
- Preservados Save Slots 2.0 da Fase 57, Calendário Vivo da Fase 58 e Scout Profissional da Fase 59.
- Schema atualizado para 770.

## v7.6.0 — Fase 59: Scout, Observadores e Recrutamento Profundo

- Adicionado motor de scout profissional com schema 760.
- Criadas regiões de observação: Brasil, América do Sul, África Ocidental e Europa Leste.
- Adicionados observadores com qualidade, especialidade, confiabilidade, salário e perfil de análise.
- Relatórios de jogadores agora calculam overall, potencial, encaixe, risco, custo, salário, confiança e comparação com o melhor jogador do elenco na posição.
- Adicionada lista de desejos persistente no save para acompanhar alvos de recrutamento.
- Scout integrado ao lobby, menu completo, mercado e Smart Market.
- Preservados Save Slots 2.0 da Fase 57 e Calendário Vivo da Fase 58.
- Auditoria: 212 arquivos JS verificados com `node --check`; render do scout validado.


## v7.5.0 — Fase 58: Calendário Vivo, Viagens e Fadiga Realista

- Adicionado motor de calendário vivo com sequência de jogos, viagens, fadiga, recuperação e risco de lesão.
- Calendário agora permite aplicar treino leve, treino pesado, recuperação, descanso, viagem e avanço de dia.
- Lobby exibe faixa rápida de calendário vivo.
- Pós-jogo e treino agora alimentam o calendário e o departamento médico.
- Schema de save atualizado para 750 preservando os 3 slots definitivos da Fase 57.
- Auditoria: 209 arquivos JS verificados com `node --check`; render do calendário validado.

## v7.1.0 — Fase 54 — Sons, Ambiência e Torcida
- Adicionada central soundAmbience.
- Adicionados presets leves de estádio, pré-jogo, pressão final, fora de casa, CT e diretoria.
- Adicionados controles de ativar/parar som com WebAudio e fallback seguro.
- Integrada tarja sonora na tela de partida.
- Preservadas as fases v7.0.0 e anteriores.


## v7.0.0 — Fase 53 — Simulação 90 Minutos 2D/Texto Premium
- Adicionada rota `matchSimulation90`.
- Criado motor de leitura premium dos 90 minutos com fases táticas, pressão, eventos 2D/texto e microcomandos do treinador.
- Integrada tarja v7.0.0 dentro da tela de partida.
- Preservados Matchday Premium, Moral Avançada, Renovações, Empresários, Diretoria Viva, Jornal e sistemas mobile.
- Adicionado validador anti-quebra `match-simulation90-validator`.

# Changelog

## v6.2.0 — Fase 45 — Lobby Vivo e Jornal Esportivo
- Adicionada rota `liveWorld`.
- Adicionado jornal esportivo com manchetes tocáveis.
- Adicionados bastidores de vestiário, diretoria, torcida, comissão e imprensa.
- Adicionado ritual diário de retenção no lobby.
- Adicionado validador anti-quebra `validateLiveWorldSystem`.
- Preservadas Beta Pública v6.0.0 e Jornada Inicial v6.1.0.

## v6.1.0 — Fase 44
- Jornada inicial cinematográfica com 6 atos.

## v6.0.0 — Fase 43
- Beta pública mobile-first.


## v6.3.0 — Fase 46 — Matchday Premium
- Adicionada rota matchdayPremium.
- Adicionada tarja premium dentro da tela de partida.
- Criado fluxo pré-jogo → partida → banco → pós-jogo → jornal.
- Criado validador anti-quebra v6.3.0.
- Preservadas as fases v6.0.0, v6.1.0 e v6.2.0.

## v6.7.0 — Fase 50 — Mercado com Empresários e Negociações Vivas
- Nova rota `agentMarket`.
- Adicionados motor, dados, CSS e validador de empresários/negociações.
- Integração com capa, menu principal, lobby e menu do treinador.
- Preservadas fases v6.6.0, v6.5.0, v6.4.0, v6.3.0, v6.2.0, v6.1.0 e v6.0.0.
- Status: agent-market-ready.

## v6.9.0 — Fase 52 — Moral Avançada e Crises de Vestiário
- Nova rota `squadMorale`.
- Adicionados motor, dados, CSS e validador de moral avançada.
- Adicionado sistema de gatilhos de crise: promessa quebrada, salário, banco, capitão, derrotas e vazamento da diretoria.
- Adicionadas respostas do treinador: conversa individual, reunião de grupo, minutos no matchday, defesa pública e linha dura.
- Integração com IA de elenco, contratos, empresários, matchday, diretoria, jornal e coletiva.
- CSS de Renovação Contratual v6.8.0 linkado no index.html.
- Preservadas fases v6.0.0 até v6.8.0.
- Status: morale-crisis-ready.


## v7.2.0 — Fase 55 — Pacote de Efeitos Reais Opcionais

- Adicionada a rota `realAudioPack`.
- Criado manifest oficial para MP3/WAV/OGG em `assets/audio/`.
- Criado fallback WebAudio automático quando o arquivo real não existir.
- Adicionados controles de tocar, verificar arquivos e parar tudo.
- Integrado com partida, matchday, simulação 90 minutos, configurações e sons v7.1.0.
- Mantida regra mobile: sem autoplay, apenas após toque do usuário.

## v7.3.0 — Fase 56 — Clima, Estádio e Gramado Dinâmicos

- Adicionada rota `stadiumClimate`.
- Criado sistema offline de clima, estádio, horário e gramado dinâmico.
- Adicionados 8 presets climáticos, 6 perfis de gramado e 6 contextos de estádio.
- Nova leitura tática: ritmo da bola, fadiga, passe, risco físico, pressão de torcida e receita.
- Tarja de clima integrada na tela de partida.
- Botões na capa, menu principal, lobby e menu do treinador.
- Validador anti-quebra v7.3.0.
- CSS mobile-first sem popup fixo bloqueando a rolagem.


## v7.3.1 — Fase 56.1 — Hotfix Fluxo Inicial e Slots
- Corrigida sensação de duas telas iguais entre capa e menu principal.
- Capa agora tem apenas continuar, central inicial, nova carreira e saves.
- Menu principal virou central de slots, não vitrine de módulos.
- Lobby agora mostra ações essenciais e envia módulos avançados para Menu Completo.
- Adicionados botões de sair para central inicial e gerenciar save.


## v7.4.0 — Fase 57 — Save Slots 2.0 e Fluxo de Carreira Definitivo
- Central inicial convertida em gerenciador real de slots.
- Capa limpa sem módulos avançados.
- Cinco slots jogáveis oficiais.
- Ações de carregar, criar, salvar, renomear e apagar slot.
- Botão de sair da carreira salva e volta para a central.
- Save técnico preservado para backup/exportação/importação.
