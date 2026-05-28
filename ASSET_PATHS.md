# Asset Paths — v4.6.0

## Jogadores Maio/2026

Padrão de foto por jogador:

```txt
assets/players/brazil/{clubId}/{playerId}.png
```

Fallback automático:

```txt
assets/placeholders/player-generic.png
```

## JSONs de elenco

```txt
data/rosters/2026/{clubId}.json
```

## Observação

Os assets pesados não precisam ser reenviados a cada fase se os caminhos forem mantidos. Esta build mantém o mapa de caminhos para evitar perda de referência.
