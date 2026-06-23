# Checklist QA — Áudio real opcional v7.2.0

- Abrir o jogo sem nenhum MP3 real e confirmar que não quebra.
- Entrar em `Efeitos Reais` e tocar um efeito: deve cair no fallback se arquivo faltar.
- Inserir `assets/audio/effects/goal-roar.mp3` e testar novamente.
- Confirmar que o som só inicia após toque/click.
- Confirmar que `Parar tudo` silencia arquivo real e fallback.
- Testar Android, iPhone/PWA e desktop.
- Verificar se a rolagem mobile continua livre.
