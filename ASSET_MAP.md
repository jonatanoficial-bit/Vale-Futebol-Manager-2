# Asset Map Resumido

## Placeholders obrigatórios
- assets/placeholders/avatar-generic.png
- assets/placeholders/player-generic.png
- assets/placeholders/staff-generic.png
- assets/placeholders/club-generic.png
- assets/placeholders/league-generic.png
- assets/placeholders/competition-generic.png
- assets/placeholders/country-flag-generic.png
- assets/placeholders/stadium-generic.jpg
- assets/placeholders/background-generic.jpg
- assets/placeholders/sponsor-generic.png
- assets/placeholders/icon-generic.png

## Fundos principais
- assets/backgrounds/bg-cover.jpg
- assets/backgrounds/bg-main-menu.jpg
- assets/backgrounds/bg-new-game.jpg
- assets/backgrounds/bg-avatar-create.jpg
- assets/backgrounds/bg-team-select.jpg
- assets/backgrounds/bg-confirm-career.jpg
- assets/backgrounds/bg-lobby.jpg
- assets/backgrounds/bg-match.jpg
- assets/backgrounds/bg-club.jpg
- assets/backgrounds/bg-championship.jpg
- assets/backgrounds/bg-calendar.jpg
- assets/backgrounds/bg-full-calendar.jpg
- assets/backgrounds/bg-formation.jpg
- assets/backgrounds/bg-instructions.jpg
- assets/backgrounds/bg-training.jpg
- assets/backgrounds/bg-staff.jpg
- assets/backgrounds/bg-sponsorship.jpg
- assets/backgrounds/bg-standings.jpg
- assets/backgrounds/bg-transfers.jpg
- assets/backgrounds/bg-settings.jpg

## Exemplo clube Santos
- assets/clubs/brazil/santos/logo.png
- assets/clubs/brazil/santos/badge.png
- assets/clubs/brazil/santos/home-kit.png
- assets/clubs/brazil/santos/away-kit.png
- assets/stadiums/brazil/santos.jpg

## Exemplo jogadores Santos
- assets/players/brazil/santos/joao-paulo.png
- assets/players/brazil/santos/gil.png
- assets/players/brazil/santos/joaquim.png
- assets/players/brazil/santos/escobar.png
- assets/players/brazil/santos/madson.png
- assets/players/brazil/santos/tomas-rincon.png
- assets/players/brazil/santos/joao-schmidt.png
- assets/players/brazil/santos/soteldo.png
- assets/players/brazil/santos/marcos-leonardo.png
- assets/players/brazil/santos/angelo.png

## Build v0.3.0 - Avatares reconhecidos
assets/avatars/manager-01.png
assets/avatars/manager-02.png
assets/avatars/manager-03.png
assets/avatars/manager-04.png
assets/avatars/manager-05.png
assets/avatars/manager-06.png
assets/avatars/manager-07.png
assets/avatars/manager-08.png
assets/avatars/manager-09.png
assets/avatars/manager-10.png
assets/avatars/manager-11.png
assets/avatars/manager-12.png

## Build v0.3.0 - Bandeiras usadas no seletor de país
assets/countries/br.png
assets/countries/ar.png
assets/countries/uy.png
assets/countries/cl.png
assets/countries/co.png
assets/countries/py.png
assets/countries/ec.png
assets/countries/pe.png
assets/countries/mx.png
assets/countries/us.png
assets/countries/gb.png
assets/countries/es.png
assets/countries/pt.png
assets/countries/it.png
assets/countries/de.png
assets/countries/fr.png
assets/countries/nl.png
assets/countries/be.png
assets/countries/tr.png
assets/countries/sa.png


## Build v0.4.0 - caminhos novos
A build expandiu `data/asset-map.json` com clubes brasileiros, argentinos, europeus, MLS e Arábia Saudita. Os nomes são reconhecidos pelo ID do clube, como `santos`, `real-madrid`, `manchester-city`, `boca-juniors` e `al-hilal`.

## Build v0.5.0 - rotas visuais preparadas
Novas áreas acessíveis pelo lobby, prontas para receber imagens e módulos específicos:

```txt
assets/backgrounds/bg-finances.jpg
assets/backgrounds/bg-messages.jpg
assets/backgrounds/bg-squad.jpg
assets/backgrounds/bg-club.jpg
assets/backgrounds/bg-sponsorship.jpg
assets/backgrounds/bg-staff.jpg
```


## Build v0.8.0 - Classificação
A tela de classificação usa logos de clubes via `assets/clubs/<pais>/<clube>/logo.png` e logos de competições via `assets/competitions/*.png`. Caso algum arquivo falte, o placeholder automático é usado.


## Build v0.9.0 - jogadores reconhecidos inicialmente
Coloque as fotos reais dos jogadores nestes caminhos, sem alterar codigo:

- assets/players/brazil/santos/joao-paulo.png
- assets/players/brazil/santos/gabriel-brazao.png
- assets/players/brazil/santos/joaquim.png
- assets/players/brazil/santos/gil.png
- assets/players/brazil/santos/alex-nascimento.png
- assets/players/brazil/santos/escobar.png
- assets/players/brazil/santos/hayner.png
- assets/players/brazil/santos/aderlan.png
- assets/players/brazil/santos/joao-schmidt.png
- assets/players/brazil/santos/tomas-rincon.png
- assets/players/brazil/santos/diego-pituca.png
- assets/players/brazil/santos/giuliano.png
- assets/players/brazil/santos/serginho.png
- assets/players/brazil/santos/pedrinho.png
- assets/players/brazil/santos/soteldo.png
- assets/players/brazil/santos/guilherme.png
- assets/players/brazil/santos/willian-bigode.png
- assets/players/brazil/santos/julio-furch.png
- assets/players/brazil/santos/weslley-patati.png
- assets/players/brazil/santos/miguelito.png
- assets/players/brazil/santos/deivid-washington.png
- assets/players/brazil/santos/angelo.png

Se qualquer imagem nao existir, o jogo usa `assets/placeholders/player-generic.png`.

## Build v1.0.0 - Tática
Nenhum novo asset obrigatório. A tela de formação usa os caminhos de jogadores já reconhecidos em:

```txt
assets/players/brazil/santos/<nome-do-jogador>.png
assets/placeholders/player-generic.png
assets/backgrounds/bg-formation.jpg
assets/backgrounds/bg-instructions.jpg
```

## Build v1.2.0 - Staff, patrocinadores e financeiro
A tela de staff reconhece estes caminhos para imagens da comissão técnica do Santos:

```txt
assets/staff/brazil/santos/treinador.png
assets/staff/brazil/santos/auxiliar-01.png
assets/staff/brazil/santos/preparador-fisico.png
assets/staff/brazil/santos/medico.png
assets/staff/brazil/santos/fisioterapeuta.png
assets/staff/brazil/santos/olheiro.png
assets/staff/brazil/santos/diretor-comercial.png
assets/staff/brazil/santos/analista-desempenho.png
```

Se uma imagem de staff não existir, o jogo usa:

```txt
assets/placeholders/staff-generic.png
```

A tela de patrocínio reconhece estes logos:

```txt
assets/sponsors/umbro.png
assets/sponsors/philco.png
assets/sponsors/kodilar.png
assets/sponsors/tekbond.png
assets/sponsors/pixbet.png
assets/sponsors/binance.png
assets/sponsors/brahma.png
assets/sponsors/one-x-bet.png
```

Se uma imagem de patrocinador não existir, o jogo usa:

```txt
assets/placeholders/sponsor-generic.png
```

## Build v1.3.0 - Transferencias
Fotos reconhecidas para atletas observados:

```txt
assets/players/scouted/lucas-almada.png
assets/players/scouted/matias-rojas.png
assets/players/scouted/juan-sforza.png
assets/players/scouted/renan-lodi.png
assets/players/scouted/kaio-jorge.png
assets/players/scouted/gabriel-veron.png
assets/players/scouted/lucas-esquivel.png
assets/players/scouted/joao-victor.png
```

Se as imagens nao existirem, o jogo usa automaticamente:

```txt
assets/placeholders/player-generic.png
```

## Build v1.4.0 - Partida simulada premium

Novos caminhos reconhecidos pela tela de partida:

```txt
assets/backgrounds/bg-match.jpg
assets/stadiums/brazil/santos.jpg
assets/stadiums/brazil/palmeiras.jpg
assets/clubs/brazil/santos/logo.png
assets/clubs/brazil/palmeiras/logo.png
assets/icons/play-match.png
assets/icons/substitution.png
assets/icons/statistics.png
assets/icons/finish-match.png
```

A tela de partida continua usando fallback automático quando qualquer item real ainda não existir.


## Build v1.5.0 - Seleções nacionais
Caminhos reconhecidos para bandeiras de seleções:
- assets/countries/br.png
- assets/countries/ar.png
- assets/countries/uy.png
- assets/countries/co.png
- assets/countries/cl.png
- assets/countries/us.png

Fallback:
- assets/placeholders/country-flag-generic.png


## Build v1.6.0 - Integração de sistemas
Esta build não exige novos assets obrigatórios. Mantém os mesmos caminhos de clubes, bandeiras, competições e estádios.
