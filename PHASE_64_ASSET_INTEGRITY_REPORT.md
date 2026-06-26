# Vale Futebol Manager — v8.1.0 / Fase 64

## Asset Integrity, Cache Buster e Homologação Visual Pós-Beta

**Gerado em:** 2026-06-26 11:18:00 BRT  
**Build:** v8.1.0  
**Schema:** 810  
**Base preservada:** v8.0.1 — Hotfix Beta Profissional / Avatares

---

## Objetivo

Esta fase foi criada depois da homologação visual em produção apontar que os avatares do fluxo **Novo Game / Crie seu Manager** não estavam aparecendo como assets reais. A Fase 64 reforça o jogo contra esse tipo de problema em três frentes:

1. assets reais versionados para evitar cache antigo no navegador/Vercel;
2. tela interna de auditoria visual para conferir paths e previews;
3. criação física de placeholders para zerar referências ausentes do `asset-map.json`.

---

## Correções e melhorias aplicadas

- Atualizado para **Build v8.1.0 / Schema 810**.
- Criado novo painel interno: **Assets & Cache — Auditoria Visual Real**.
- Criados/ativados caminhos oficiais:
  - `assets/avatars/manager-v810-01.png`
  - até `assets/avatars/manager-v810-12.png`.
- Mantida compatibilidade com:
  - `assets/avatars/manager-01.png` até `manager-12.png`;
  - `assets/avatars/manager-v801-01.png` até `manager-v801-12.png`.
- Migração automática de saves antigos que apontem para `manager-01.png` ou `manager-v801-01.png` para `manager-v810-01.png`.
- Tela **Novo Game** agora usa somente avatares `manager-v810`.
- Painel Beta Profissional atualizado para v8.1.0.
- Quality gate de asset integrity integrado ao boot/runtime audit.
- CSS novo: `css/asset-integrity-v810.css`.
- Script principal versionado no HTML:
  - `js/app.js?v=810-asset-integrity`.
- `data/asset-map.json` atualizado para v8.1.0.
- `manifest.webmanifest` atualizado para v8.1.0.

---

## Auditoria técnica

- JavaScript/core/tools verificados com `node --check`: **223 arquivos / OK**.
- Referências de `index.html`: **43 verificadas / 0 ausentes**.
- Referências únicas do `asset-map.json`: **739 / 0 ausentes**.
- Referências totais do `asset-map.json`: **853 / 0 ausentes**.
- Avatares v810: **12 encontrados / 12 hashes únicos**.
- Avatares legados mantidos: **12 encontrados**.
- Avatares v801 mantidos: **12 encontrados**.
- Placeholders físicos criados para referências futuras do asset-map: **162 arquivos**.
- Integridade do pacote validada antes do ZIP.

---

## Arquivos de auditoria incluídos

- `PHASE_64_ASSET_INTEGRITY_REPORT.md`
- `AUDIT_ASSET_INTEGRITY_V810.json`
- `AUDIT_ASSET_PLACEHOLDER_FILES_CREATED_V810.json`
- `BUILD_MANIFEST_V810.json`
- `SHA256SUMS.txt`
- `TEST_REPORT.md`

---

## Sistemas preservados

- Fase 57: Save Slots 2.0.
- Fase 58: Calendário Vivo, viagens e fadiga.
- Fase 59: Scout, observadores e recrutamento.
- Fase 60: Treino semanal realista.
- Fase 61: Staff e comissão técnica viva.
- Fase 62: Finanças, patrocínio e bilheteria profunda.
- Fase 63: Beta Profissional.
- Fase 63.1: Hotfix de avatares.

---

## Checklist manual pós-upload

1. Subir o ZIP no GitHub.
2. Aguardar redeploy do Vercel.
3. Abrir a URL publicada.
4. Fazer Ctrl + F5 uma vez se o navegador insistir em cache antigo.
5. Entrar em **Novo Game**.
6. Confirmar que os 12 avatares aparecem diferentes.
7. Abrir **Menu do Treinador → Assets & Cache**.
8. Confirmar que o avatar selecionado usa caminho `manager-v810`.

