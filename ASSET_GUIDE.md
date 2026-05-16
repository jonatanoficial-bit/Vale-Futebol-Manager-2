# Guia de Assets - Vale Futebol Manager

O jogo foi preparado para funcionar com placeholders. Para substituir imagens, basta colocar o arquivo real no caminho correto.

## Formatos recomendados
- Fundos: JPG ou WEBP, 1080x1920.
- Logos, escudos, bandeiras: PNG transparente, 512x512.
- Jogadores, staff e avatares: PNG transparente ou WEBP, 512x512 ou 768x768.

## Regra anti-quebra
Se uma imagem não existir ou falhar ao carregar, o jogo usa automaticamente um placeholder de `assets/placeholders/`.

## Caminhos importantes
- Fundos: `assets/backgrounds/`
- Clubes: `assets/clubs/pais/clube/logo.png`
- Jogadores: `assets/players/pais/clube/nome-jogador.png`
- Staff: `assets/staff/pais/clube/nome-staff.png`
- Bandeiras: `assets/countries/br.png`, `assets/countries/ar.png`, etc.
- Competições: `assets/competitions/brasileirao_a.png`, etc.

## Nomeação
Quando possível, manter a nomeação existente dos seus pacotes:
- bandeiras por sigla curta: `br.png`, `ar.png`, `gb.png`.
- competições com underline: `brasileirao_a.png`, `copa_do_brasil.png`.
- clubes em slug: `santos/logo.png`, `palmeiras/logo.png`.

## Arquivo de mapa
O arquivo `data/asset-map.json` contém os caminhos oficiais reconhecidos pela build.

## Build v0.3.0 - Substituição de avatares
Para trocar um avatar sem mexer no código, substitua o arquivo correspondente:

assets/avatars/manager-01.png
assets/avatars/manager-02.png
...
assets/avatars/manager-12.png

Use PNG ou WEBP quadrado, preferencialmente 768x768. O jogo exibirá placeholder se a imagem estiver ausente ou corrompida.


## Build v0.4.0 - Clubes e ligas
Para inserir logos reais sem alterar código, salve o arquivo no caminho informado em `data/asset-map.json`. Exemplo: `assets/clubs/brazil/santos/logo.png`. Se o arquivo não existir, o jogo carrega `assets/placeholders/club-generic.png`.

## Build v0.5.0 - Lobby principal
O lobby usa os mesmos caminhos de assets já definidos. Para personalizar visualmente esta tela, substitua estes arquivos sem alterar código:

```txt
assets/backgrounds/bg-lobby.jpg
assets/clubs/<pais>/<clube>/logo.png
assets/countries/<codigo>.png
assets/avatars/manager-01.png ... manager-12.png
```

O jogo continua funcionando se qualquer imagem estiver ausente, pois usa automaticamente os placeholders.
