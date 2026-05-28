# Changelog - v5.0.0

## Fase 12 - UI AAA + Responsividade

### Adicionado
- `css/aaa-ui.css` com visual premium glass, cards responsivos, bottom navigation flutuante e acabamento comercial.
- `js/systems/uiQualityEngine.js` para aplicar shell AAA e gerar snapshot de qualidade visual.
- `core/safety/ui-route-validator.js`.
- `core/safety/responsive-validator.js`.
- `core/safety/theme-validator.js`.
- Central `UI AAA` acessível pelo lobby.

### Melhorado
- Lobby com novo card de acesso à UI AAA.
- Build visível atualizada para v5.0.0.
- Layout mobile com safe-area, 100svh, botões mínimos de 44px e proteção de overflow.
- Layout desktop com grid mais comercial, glassmorphism, sombras premium e tabelas com rolagem segura.

### Anti-quebra
- Caso a UI AAA falhe, o jogo mantém o CSS anterior v4.9.0 e continua abrindo.
- Validadores de rota, responsividade e tema ficam disponíveis no painel de desenvolvimento.
