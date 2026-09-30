# Pipeline de rostos de jogadores

O jogo só exibe uma fotografia real quando ela consta em `data/player-media-manifest.json` com uma licença reutilizável verificada no Wikimedia Commons. O campo `photoRemote` dos dados de elenco serve apenas como referência de origem e nunca é carregado pela interface.

Cada registro licenciado deve ter:

- `id`: identificador único do jogador, compartilhado entre clube e seleção;
- `commonsTitle`: título exato do arquivo no Wikimedia Commons; o jogo monta miniaturas de 128 px e 320 px conforme o contexto;
- `credit`: autoria ou crédito exigido;
- `license.name`: CC0, Domínio Público, CC BY ou CC BY-SA;
- `license.reference`: endereço da licença ou da página do arquivo;
- `license.commercialUse`: obrigatoriamente `true`;
- `sha1`: hash publicado pela API do Wikimedia Commons;
- `width` e `height`: no mínimo 256 × 256.

O vínculo principal é exato: o identificador `tm-` do elenco é comparado à propriedade P2446 do Wikidata, e a fotografia vem da propriedade P18. IDs antigos do próprio jogo só recebem um alias compacto quando o nome completo normalizado aponta para um único jogador já confirmado. Licença, autor, página do arquivo e hash permanecem no manifesto.

Antes de publicar um lote, execute:

```powershell
python tools/validate_player_media.py
```

Para reconstruir o catálogo, execute `python tools/build_wikimedia_player_media.py`. Quem não tiver correspondência e licença aprovadas usa `assets/players/generic/player-generic.webp`, uma fotografia fictícia original do VFM. Isso evita rosto real errado e link quebrado.
