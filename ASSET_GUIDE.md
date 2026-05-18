# ASSET_GUIDE.md — Vale Futebol Manager Gold v2.3.0

Build: v2.3.0 | 2026-05-18 12:00 UTC
Fase: integração dos assets finais e refinamento visual completo.

## Regra principal
O jogo funciona completo com placeholders. Para trocar uma imagem, suba o arquivo no GitHub no caminho exato listado em `ASSET_MAP.md` ou em `data/asset-map.json`. Não é necessário alterar código.

## Proteção anti-quebra
A build v2.3.0 inclui:
- `js/systems/assetLoader.js`: carregamento definitivo, cache seguro e manifesto de assets.
- `js/systems/fallbackManager.js`: fallback inteligente por tipo de imagem.
- `onerror` em todas as imagens renderizadas por `safeImg`.
- guarda global contra imagem quebrada.
- placeholders obrigatórios para clubes, jogadores, bandeiras, ligas, competições, estádios, patrocinadores, staff, fundos e ícones.

## Formatos recomendados
- Fundos: JPG ou WEBP, 1080x1920, sem texto.
- Logos, escudos, bandeiras, patrocinadores: PNG transparente, 512x512 ou parecido.
- Jogadores, staff, avatares: PNG transparente, 512x512 ou 768x768.
- Estádios: JPG/WEBP, 1080x1920 ou 1440x1920.

## Caminhos importantes
Fundos principais ficam em `assets/backgrounds/`.
Clubes ficam em `assets/clubs/pais/clube/`.
Jogadores ficam em `assets/players/pais/clube/`.
Bandeiras ficam em `assets/countries/` usando códigos curtos como `br.png`, `ar.png`, `gb.png`, `us.png`.
Competições ficam em `assets/competitions/`.
Ligas ficam em `assets/leagues/pais/`.
Estádios ficam em `assets/stadiums/pais/clube.jpg`.

## Como adicionar sem mexer no código
1. Gere a imagem no ChatGPT sem texto.
2. Renomeie exatamente conforme `ASSET_MAP.md`.
3. Suba no GitHub dentro da pasta correta.
4. Publique novamente no Vercel/GitHub Pages.
5. O jogo detecta o caminho automaticamente.

## Exemplo
Para trocar o logo do Santos, coloque:
`assets/clubs/brazil/santos/logo.png`

Para trocar a bandeira do Brasil, coloque:
`assets/countries/br.png`

Para trocar a foto de um jogador do Santos, coloque:
`assets/players/brazil/santos/joao-paulo.png`

## Checklist visual da v2.3.0
Dentro do jogo existe a rota `assetChecklist`, acessível pelo sistema de rotas, que mostra caminhos mapeados, fallbacks e resumo do manifesto.

## Atualização de fotos de jogadores — v2.5.0

Cada jogador do elenco possui um `id`. A foto deve seguir o caminho definido no JSON do elenco.

Exemplo:

- Jogador: Neymar
- ID: `neymar`
- Caminho reconhecido: `assets/players/brazil/santos/neymar.png`

Se a imagem ainda não existir, o jogo usa `assets/placeholders/player-generic.png` automaticamente.

Para trocar o elenco sem código:

1. Abra o jogo.
2. Vá em **Atualizar elenco**.
3. Clique em **Gerar JSON**.
4. Copie o JSON, edite jogadores e cole de volta em **Importar com segurança**.
5. O jogo valida o elenco antes de aplicar.
