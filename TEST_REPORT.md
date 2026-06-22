# Test Report — v6.0.0

Testes automatizados previstos/executados:
- `node --check` em arquivos JS/core.
- Import do motor Release Candidate.
- Import do validador Release Candidate.
- Render da rota `releaseCandidate` via `moduleScreen`.
- Verificação de CSS no `index.html`.
- Verificação de ZIP íntegro.

Homologação manual ainda necessária em Android/iPhone real.
## Testes v6.1.0 — Jornada Inicial Cinematográfica

- `node --check` planejado para todos os arquivos JS em `js` e `core`.
- Validador `validateIntroCinematicSystem` deve retornar `ok: true`.
- Render da rota `careerIntro` deve gerar HTML sem dependência de DOM externo.
- Busca por marcas de conflito de merge deve retornar vazia.
- ZIP final deve passar em `unzip -t`.
