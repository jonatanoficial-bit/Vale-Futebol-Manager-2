# PHASE 63.1 — Hotfix Beta Profissional / Avatares

Build: **v8.0.1**  
Schema: **801**  
Data/hora: **2026-06-26 10:58 BRT**

## Problema encontrado
Na tela **Novo Game / Crie seu Manager**, os 12 cards de avatar estavam carregando PNGs existentes, mas os arquivos `assets/avatars/manager-01.png` até `manager-12.png` eram cópias idênticas do avatar genérico. Por isso a tela não mostrava variedade real de avatares, mesmo sem erro 404.

## Correção aplicada
- Substituídos os 12 arquivos antigos por portraits distintos.
- Criados 12 arquivos versionados `assets/avatars/manager-v801-01.png` até `manager-v801-12.png` para evitar cache do navegador/Vercel.
- O fluxo de criação agora usa os caminhos versionados.
- Saves antigos que apontarem para `assets/avatars/manager-XX.png` são migrados automaticamente para `assets/avatars/manager-v801-XX.png`.
- `data/asset-map.json` recebeu a seção `avatars`.
- `index.html` passou a carregar `js/app.js?v=801-avatar-hotfix` para reforçar o cache bust.

## Sistemas preservados
- Save Slots 2.0.
- Calendário Vivo.
- Scout/Recrutamento.
- Treino Semanal.
- Staff Vivo.
- Finanças Profundas.
- Beta Profissional / painel de auditoria.

## Resultado esperado
Ao abrir **Novo Game > Crie seu Manager**, os 12 cards devem exibir rostos diferentes, e o avatar escolhido deve aparecer corretamente no preview, confirmação de carreira e lobby.
