# Vale Futebol Manager v7.2.0 — Pacote de Efeitos Reais Opcionais

A Fase 55 adiciona uma camada oficial para MP3/WAV/OGG reais sem transformar áudio em dependência obrigatória do jogo.

## Objetivo

Permitir que torcida, apito, gol, entrada em campo, CT, diretoria e interface usem arquivos reais quando existirem, mantendo fallback WebAudio seguro quando os arquivos ainda não foram enviados.

## Rota

- `realAudioPack`

## Caminho oficial

- `assets/audio/`

## Segurança

- Não existe autoplay.
- O áudio só toca após toque/click do usuário.
- Falha de arquivo aciona fallback seguro.
- Botão de parar interrompe MP3/WAV/OGG e fallback WebAudio.
- O jogo continua funcionando sem nenhum áudio real.
