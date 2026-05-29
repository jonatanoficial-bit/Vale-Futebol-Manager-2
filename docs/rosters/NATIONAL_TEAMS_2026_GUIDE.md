# Changelog — v5.8.12

## Fase 32 — Seleções nacionais 2026

- Adicionado pacote `officialNationalTeam2026RosterData.js`.
- Criados JSONs em `data/rosters/2026/national-teams/`.
- Integrado o motor de seleções ao Data Pack 2026.05.20.
- Convocações deixam de usar `Atleta Nacional` quando houver pacote oficial/referência.
- Adicionado validador anti-genérico para seleções nacionais.
- Atualizada central Data Pack com contagem de seleções e convocáveis.

## Seleções cobertas

- Brasil
- Argentina
- Uruguai
- Colômbia
- França
- Inglaterra
- Espanha
- Portugal
- Alemanha
- Holanda
- Itália
- Estados Unidos
- México
- Japão
- Marrocos
- Senegal


## Schema
Cada jogador segue o schema do Data Pack 2026 com `nationalTeamId`, `clubName`, `dataLock` e `sourceStatus`.
