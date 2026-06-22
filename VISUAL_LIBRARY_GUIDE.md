# Biblioteca Visual Dinamica - v2.6.0

O jogo agora entende imagens extras pelo arquivo `data/asset-library.json`.

## Fundos
Cada tela consulta uma categoria visual. Exemplo:

```json
"backgrounds": {
  "lobby": [
    "assets/backgrounds/bg-lobby.jpg",
    "assets/backgrounds/extras/lobby-vip-01.jpg"
  ]
}
```

## Anti-quebra
A ordem de seguranca e:
1. imagem extra contextual;
2. fundo principal da tela;
3. `assets/placeholders/background-generic.jpg`;
4. gradiente CSS da tela.

## Logos de clubes
Use sempre:

```txt
assets/clubs/<pais>/<clube>/logo.png
assets/clubs/<pais>/<clube>/badge.png
```

O arquivo `data/club-logo-library.json` lista os clubes importados.

## Ligas e paises
`data/world-league-library.json` prepara ligas adicionais. Se o PNG da liga ainda nao existir, o jogo usa placeholder automaticamente.
