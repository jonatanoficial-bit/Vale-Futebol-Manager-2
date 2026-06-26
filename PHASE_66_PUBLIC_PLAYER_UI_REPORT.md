# v8.3.0 — Fase 66: Interface Pública Limpa para Jogadores

Objetivo: remover da experiência normal do jogador textos internos de fase, build, schema, QA, auditoria, cache, Vercel, quality gate e módulos de desenvolvimento.

## Ajustes aplicados

- O rodapé/etiqueta técnica de build foi removido das telas do jogador.
- A tela inicial e a central de carreiras usam linguagem de jogo, sem “fase”, “schema” ou “QA”.
- O lobby não mostra mais ribbon de QA Final.
- O Menu do Treinador oculta módulos internos de desenvolvimento, auditoria, assets/cache, data pack e beta.
- A seção “Sistema e desenvolvimento” foi convertida para “Opções do jogo”, mantendo apenas itens úteis para o jogador.
- Textos de botões e descrições foram ajustados para linguagem pública: “Gerenciar saves”, “Verificação”, “Entrada segura”, “Imagens do jogo”, “Teste rápido”.
- O script principal recebeu cache buster v830 para forçar atualização após deploy.
- Build-info e manifest foram limpos para não expor versão técnica no nome público do app.

## Sistemas preservados

- Save Slots 2.0 e 3 carreiras.
- Avatares v810 com 12 PNGs únicos.
- Calendário Vivo.
- Scout e Recrutamento.
- Treino Semanal.
- Staff e Comissão Técnica.
- Finanças, Patrocínio e Bilheteria.
- Beta Profissional e relatórios técnicos preservados nos arquivos, porém fora da interface pública.

## Auditoria executada

- node --check em 224 arquivos JS/core/tools: OK.
- index.html: 44 referências verificadas, 0 ausentes.
- imports relativos JS: 0 ausentes.
- asset-map: 739 caminhos únicos, 0 ausentes.
- avatares v810: 12 encontrados, 12 hashes únicos.
- UI pública de entrada: 0 ocorrências de Fase, Build v, Schema, QA Final, Beta Profissional ou Central técnica nos arquivos de entrada pública.

## Resultado

A interface está mais adequada para jogador final: limpa, menos técnica e sem informações internas atrapalhando a experiência.
