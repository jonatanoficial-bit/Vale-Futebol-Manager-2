## Limites conhecidos v7.1.0
- iPhone/Safari pode exigir PWA ou toque direto para liberar WebAudio.
- A fase usa síntese leve; efeitos reais em MP3/WAV podem entrar depois como pacote opcional.
- Homologação manual em celular real ainda é necessária.


# Known Issues — v7.0.0

- A camada 2D/texto premium usa eventos simulados internos; ainda não há animação 2D real com jogadores se movendo em tempo real.
- Homologação manual em Android/iPhone ainda necessária.
- Áudio de transmissão e efeitos de torcida ainda não foram integrados.

# Known Issues — v6.9.0

- Homologação manual em celular real ainda pendente.
- A fase v6.9.0 usa dados internos e determinísticos para simular crises; integração persistente por save pode ser aprofundada nas próximas fases.
- Sem vídeo pesado ou áudio novo nesta fase para manter ZIP estável.

## Corrigido na fase
- Link de CSS da Renovação Contratual v6.8.0 adicionado ao index.html.


## Observações v7.2.0

- Áudio real depende de arquivos inseridos manualmente em `assets/audio/`.
- Em iPhone/Android, o navegador exige toque do usuário antes de qualquer som.
- A varredura de arquivos pode variar quando o jogo é aberto diretamente por `file://`; o ideal é testar publicado no GitHub Pages/PWA.
- Nenhuma dessas limitações bloqueia o jogo, pois o fallback WebAudio permanece ativo.

## v7.3.0 — Observações

- O clima é simulado/offline nesta fase, não consulta previsão real.
- O impacto no motor de partida ainda é leitura premium e camada de decisão; a física completa será aprofundada em fases futuras.
- Homologação manual em Android/iPhone ainda precisa ser feita.
