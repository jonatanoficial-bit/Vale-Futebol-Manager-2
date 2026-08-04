# Vale Futebol Manager — World Edition 11

Manager internacional de futebol, mobile-first horizontal e instalável como PWA. A versão 11 amplia a base mundial, adiciona rostos fotográficos para o treinador, aprofunda a carreira e mostra os 22 jogadores no campo 2D.

## Conteúdo desta versão

- 833 clubes nas seis confederações e em 50 ligas de 49 países;
- 625 clubes comandáveis em 38 países, todos com elenco nominal de ao menos 11 atletas;
- 20.458 jogadores de clubes;
- 211 associações nacionais na simulação e 135 seleções comandáveis;
- 48 listas oficiais da Copa do Mundo de 2026 preservadas e 87 pools adicionais de profissionais;
- 3.842 jogadores nas seleções comandáveis;
- 16 rostos fotorealistas fictícios de homens e mulheres, com diversidade de idade e etnia;
- 638 clubes com referência de escudo real e 195 clubes de simulação ainda identificados honestamente com escudo genérico.

## Competições e carreira

- Brasileirão Série A e Série B com 20 clubes cada;
- regra oficial de 2026 da Série B: dois acessos diretos e play-offs entre 3º–6º por duas vagas;
- quatro rebaixados e acesso/rebaixamento efetivo entre as Séries A e B;
- faixas de Libertadores e Sul-Americana com cascata documentada no Brasil;
- ligas e copas nacionais, Libertadores, Sul-Americana, Champions League, Europa League, torneios continentais de CONCACAF/AFC/CAF/OFC e Mundial de Clubes;
- Mundial de Clubes só criado após conquista continental na carreira, nunca apenas pelo rating inicial;
- eliminatórias, copas continentais de seleções e Copa do Mundo condicionada à classificação;
- XP, nível, licenças, premiações, reputação, propostas de clubes e carreira simultânea em clube e seleção.

## Gestão e partida

- escalação, quatro formações e instruções de mentalidade, construção, marcação, transição, pressão, ritmo, largura e linha defensiva;
- treino semanal, evolução de jovens, condição física e moral;
- instalações de treino, base, medicina e observação, com cinco níveis;
- mercado internacional com taxa, comissão, salário, duração contratual, orçamento e limite de elenco;
- e-mail, diretoria, finanças, comissão técnica, calendário e histórico de temporada;
- campo 2D com 22 jogadores identificados, bola, posicionamento conforme formação, narração e estatísticas;
- três espaços de carreira, migração do save da versão 10 e funcionamento offline depois do primeiro carregamento.

## Fidelidade e licenças

Os nomes, posições, datas, nacionalidades, contratos e valores importados usam uma fotografia de dados disponível em 04/08/2026. O GER e o potencial são estimativas próprias do VFM e não são ratings oficiais da FIFA, EA Sports ou Football Manager.

Nem todas as regras especiais (médias, splits e play-offs) estão reproduzidas integralmente. Cada liga possui um status de verificação em `data/rules-2026.json`. Escudos e marcas pertencem aos seus titulares; distribuição comercial requer licenças. Consulte `FONTES-E-LICENCAS-V11.md` e `LIMITES-DE-FIDELIDADE-V11.md`.

## Executar

1. Abra um terminal nesta pasta.
2. Inicie um servidor HTTP, por exemplo: `python -m http.server 8080`.
3. Acesse `http://localhost:8080`.

Não abra `index.html` diretamente pelo sistema de arquivos; os elencos e o modo offline dependem de HTTP.

## Compatibilidade validada

- desktop: 1366×768;
- celular horizontal: 844×390, sem overflow global;
- celular vertical: 390×844, com bloqueio e pedido de rotação;
- Chromium integrado, sem erros ou avisos no console;
- sintaxe JavaScript e integridade de catálogo aprovadas em `QA-WORLD-V11.json`.

Versão 11.0.0 · World Edition · 2026-08-04
