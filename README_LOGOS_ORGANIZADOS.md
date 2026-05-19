# Vale Futebol Manager — Logos organizados para assets

Este pacote foi gerado a partir de `drive-download-20260519T130441Z-3-001.zip`.

## Como usar

1. Descompacte este ZIP.
2. Envie a pasta `assets/clubs/` para a raiz do seu projeto no GitHub/Vercel, substituindo/mesclando com a pasta existente.
3. Não altere os nomes das pastas nem dos arquivos `logo.png` e `badge.png`.

## Padrão usado pelo jogo

Cada clube foi organizado assim:

```txt
assets/clubs/<pais>/<clube>/logo.png
assets/clubs/<pais>/<clube>/badge.png
```

Exemplo:

```txt
assets/clubs/brazil/santos/logo.png
assets/clubs/brazil/santos/badge.png
```

## Resultado da organização

- Logos únicos organizados: 218
- Arquivos duplicados removidos/ignorados: 64
- Arquivos não mapeados/não usados: 1

## Documentação incluída

- `docs/LOGO_RENAME_MAP.csv`
- `docs/LOGO_RENAME_MAP.json`
- `docs/LOGO_DUPLICATES_REMOVED.json`
- `docs/LOGO_UNMATCHED_FILES.json`
- `data/club-logo-library.json`

## Observação

Quando havia duplicidade do mesmo clube, mantive preferencialmente o PNG real em maior qualidade. SVGs genéricos foram convertidos para PNG quando necessário para o jogo reconhecer como `logo.png`.
