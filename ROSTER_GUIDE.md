# ROSTER_GUIDE.md — Atualização segura de elencos

Build: v2.5.1

## Objetivo
Permitir trocar elencos sem mexer no código do jogo.

Você pode atualizar de duas formas:

1. Pelo jogo, em **Lobby > Atualizar elenco**, colando um JSON.
2. Pelo arquivo base `data/rosters/2026/santos.json`, mantendo o mesmo formato.

## Formato aceito

```json
{
  "meta": {
    "clubId": "santos",
    "season": 2026,
    "version": "santos-2026-v2",
    "updatedAt": "2026-05-19"
  },
  "players": [
    {
      "id": "neymar",
      "name": "Neymar",
      "pos": "PE",
      "overall": 84,
      "potential": 84,
      "age": 34,
      "nationality": "br",
      "shirt": 10,
      "photo": "assets/players/brazil/santos/neymar.png",
      "value": 18,
      "salary": 900,
      "contract": 8,
      "status": "Estrela"
    }
  ]
}
```

## Campos obrigatórios recomendados

- `id`: identificador sem espaços. Exemplo: `gabriel-barbosa`.
- `name`: nome do jogador.
- `pos`: posição. Exemplo: `GOL`, `LD`, `ZAG`, `MC`, `PE`, `ATA`.
- `overall`: nota geral.
- `potential`: potencial.
- `age`: idade.
- `nationality`: código do país. Exemplo: `br`, `ar`, `uy`.
- `photo`: caminho da foto.

## Caminho das fotos dos jogadores

O padrão recomendado é:

```txt
assets/players/brazil/santos/<id-do-jogador>.png
```

Exemplos:

```txt
assets/players/brazil/santos/neymar.png
assets/players/brazil/santos/gabriel-barbosa.png
assets/players/brazil/santos/rony.png
assets/players/brazil/santos/gabriel-menino.png
```

Se a imagem não existir, o jogo usa automaticamente:

```txt
assets/placeholders/player-generic.png
```

## Proteções anti-quebra

A importação de elenco é recusada se:

- o JSON estiver inválido;
- houver menos de 11 jogadores válidos;
- campos numéricos vierem fora de faixa;
- IDs duplicados forem detectados após normalização.

Mesmo quando a importação falha, o jogo continua usando o elenco anterior.

## Dica prática

Use o botão **Exportar elenco** dentro do jogo, edite o JSON em um editor de texto e depois cole de volta em **Importar com segurança**.
