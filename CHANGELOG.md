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
