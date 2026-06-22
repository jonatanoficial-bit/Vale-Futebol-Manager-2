# SQUAD_TACTICS_ENGINE_GUIDE.md

Build v2.9.0 adiciona o sistema realista de elenco, escalação e tática.

## Arquivo principal
`js/systems/squadEngine.js`

## O que ele calcula
- compatibilidade entre posição do jogador e função no esquema;
- prontidão do atleta usando condição física, moral e forma;
- nota de jogo do atleta por função;
- melhor onze para cada formação;
- banco recomendado por impacto;
- risco físico;
- alertas de improvisação;
- recomendação de capitão;
- recomendação de cobradores de pênalti, falta e escanteio.

## Como atualizar depois
Você pode continuar importando elenco pela Central de Atualização de Elenco. O motor v2.9.0 normaliza qualquer jogador com estes campos:

```json
{
  "id": "jogador-exemplo",
  "name": "Jogador Exemplo",
  "pos": "MC",
  "overall": 72,
  "potential": 78,
  "age": 23,
  "morale": 70,
  "form": 72,
  "fitness": 86,
  "photo": "assets/players/brazil/clube/jogador-exemplo.png"
}
```

## Avatares de jogadores
O caminho de foto continua livre e seguro. Se a imagem não existir, o jogo usa fallback automático.

## Anti-quebra
- se faltar posição, usa MC;
- se faltar overall, usa 65;
- se faltar moral/forma/condição, usa valores seguros;
- se a formação não existir, usa 4-3-3;
- se não houver 11 atletas válidos, o elenco base é restaurado.
