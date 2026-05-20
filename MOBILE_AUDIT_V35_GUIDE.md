# Vale Futebol Manager Gold - Guia v3.5.0

## Fase
Auditoria real de jogabilidade mobile, correção de fluxo e estabilidade.

## Objetivo
Antes de expandir novos sistemas, esta build cria uma central de QA dentro do jogo para testar os fluxos que mais quebram em um manager mobile-first:

- novo jogo ate lobby;
- escolha de clubes de Serie A e Serie B;
- partida automatica e pos-jogo;
- temporada, rodada, tabela e logos;
- transferencias;
- save, continuar e backups;
- rotas criticas em telas pequenas.

## Tela nova
No lobby existe o botao **Auditoria Mobile**. Ele abre a rota:

```txt
mobileAudit
```

## Arquivos novos

```txt
js/data/mobileAuditData.js
js/systems/mobileAuditEngine.js
MOBILE_AUDIT_V35_GUIDE.md
```

## Como testar no celular

1. Abra o jogo pelo GitHub Pages ou Vercel.
2. Crie um novo jogo.
3. Escolha pelo menos um clube da Serie A e um da Serie B em saves diferentes.
4. Inicie uma partida.
5. Ative o modo automatico.
6. Aguarde chegar ao pos-jogo.
7. Volte ao lobby.
8. Abra Temporada e confira tabela, rodada e escudos.
9. Abra Transferencias e execute uma acao de teste.
10. Abra Central de Save, exporte e importe um save.
11. Abra Auditoria Mobile e use os botoes de smoke test.

## Regra anti-quebra
Se qualquer rota falhar, o router cai no modo seguro e mostra botao de retorno ao lobby. Se uma imagem faltar, o fallback visual permanece ativo.
