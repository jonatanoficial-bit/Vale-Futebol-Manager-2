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
