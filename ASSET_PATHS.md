# Asset Paths - v5.1.0

A Fase 13 não adiciona assets pesados.

Mantidos os caminhos já utilizados pelo projeto:

```txt
assets/backgrounds/
assets/clubs/
assets/players/brazil/{clubId}/{playerId}.png
assets/placeholders/player-generic.png
assets/logos/
assets/stadiums/
```

Sistema de save não depende de imagens e não altera o mapa visual.

## v5.2.0 - Mundo completo
Logos de clubes globais esperados:
- assets/clubs/world/{clubId}.png
- fallback: assets/placeholders/club-generic.png

Logos de competições europeias esperados:
- assets/competitions/uefa-champions-league.png
- assets/competitions/uefa-europa-league.png
- assets/competitions/uefa-conference-league.png
- fallback: assets/placeholders/competition-generic.png

Bandeiras/países esperados:
- assets/countries/{countryCode}.png
- fallback: assets/placeholders/country-generic.png
