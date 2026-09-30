# Vale Futebol Manager — Ultimate World 16.2

Manager internacional mobile-first para retrato e paisagem, jogável no computador e instalável como PWA. A V16.2 acrescenta identidade individual, planejamento de elenco, efeitos táticos explicados, objetivos conectados e uma partida 2D com leitura do auxiliar, pressão e reações do adversário.

## Fase 2 premium

- 8.565 IDs de jogadores com fotografia real do Wikimedia Commons, licença e crédito rastreáveis;
- foto genérica original e identificada como provisória para os demais jogadores;
- planejador do elenco por setor, idade, contrato, potencial e custo;
- efeito visual e mensurável de cada instrução tática;
- momentos-chave, pressão, desgaste, estatísticas e orientação durante a partida;
- objetivos da diretoria ligados às decisões da carreira;
- folha, parcelas futuras, empréstimos e opção de compra no mercado.

## Fase 1 mobile

- menu principal com Início, Elenco, Tática, Jogar e Mais;
- painel Hoje com até três decisões prioritárias;
- guia de primeira carreira em cinco passos;
- interface adaptativa em retrato e paisagem;
- backup, importação e confirmação confiável de salvamento;
- processamento de parcelas e encerramento de empréstimos.

## Banco mundial

- 833 clubes nas seis confederações e 50 ligas de 49 países;
- 625 clubes comandáveis em 38 países;
- 20.458 jogadores de clubes na fotografia de dados de 04/08/2026;
- 211 seleções com identidade visual local e 135 comandáveis;
- 48 listas oficiais da Copa do Mundo de 2026 e 87 pools nacionais adicionais;
- 3.842 jogadores em seleções comandáveis;
- 7.019 fotografias únicas aprovadas no Wikimedia Commons, vinculadas a 8.565 IDs do jogo;
- 16 rostos fotorealistas fictícios de treinadores, com homens e mulheres de diferentes etnias e idades.

## Novidades da V16

- calendário mensal, semanal e anual, filtros e fases sujeitas a sorteio;
- cinquenta ligas processadas em paralelo e painel de líderes mundiais;
- mata-matas com sorteio progressivo, eliminação, pênaltis e cancelamento das fases futuras;
- acesso, rebaixamento e classificação continental ao fim da temporada;
- editor tático por arrastar ou tocar, com reposicionamento livre no campo;
- painel de jogo para formação, mentalidade, pressão, ritmo, instruções rápidas e até cinco substituições;
- motor de partida com 22 jogadores, bola, xG, finalizações, cartões, desgaste, desconfortos e reação do adversário;
- coletiva pós-jogo com efeitos sobre moral, diretoria e reputação;
- mercado com relatório, empréstimo, taxa, salário, luvas, parcelas, comissão, duração e cláusula;
- treino individual, evolução por atributos, medicina, nova geração anual e promoção de jovens;
- campus visual de instalações para estádio, CT, academia, medicina, scouting e comercial;
- propostas de patrocínio, receita anual, bônus por vitória e por título;
- XP, licenças, conquistas, ofertas de trabalho e carreira simultânea em clube e seleção;
- escudo do Atlético Mineiro substituído pelo PNG em alta resolução publicado no site oficial do clube.

## Competições

Inclui ligas e copas nacionais, Libertadores, Sul-Americana, Champions League, Europa League, torneios de CONCACAF, AFC, CAF e OFC, Mundial de Clubes, eliminatórias, copas continentais de seleções e Copa do Mundo. O Mundial de Clubes só é liberado após título continental na carreira.

O arquivo `data/rules-2026.json` informa o status de cada regulamento. Formatos complexos de médias, splits, conferências e play-offs continuam marcados como aproximação quando o motor não reproduz todos os critérios reais.

## Fidelidade e licenças

O GER e o potencial são índices próprios do VFM, não ratings oficiais FIFA, EA Sports ou Football Manager. O pacote possui 638 clubes referenciando arquivos de escudos reais; 195 clubes de simulação ainda usam imagem genérica e não são apresentados como identidade oficial. As fotos reais de jogadores são ligadas por ID exato entre o elenco e a propriedade P2446 do Wikidata, com arquivo P18 do Wikimedia Commons; aliases antigos só entram quando o nome resolve para uma única pessoa confirmada. O relatório completo está em `PLAYER-MEDIA-REPORT.json`.

Cada registro fotográfico guarda autor, licença, página do arquivo e hash. Jogadores sem correspondência aprovada usam uma foto fictícia original marcada como genérica. Marcas, escudos, nomes e competições pertencem aos respectivos titulares, e uma distribuição comercial exige revisão jurídica e licenças.

As 211 seleções usam bandeiras SVG locais do projeto `flag-icons` (MIT), não escudos de federações. Consulte `FONTES-E-LICENCAS-V16.md` e `QA-WORLD-V16.json`.

## Executar

1. Abra um terminal nesta pasta.
2. Execute `python -m http.server 8080`.
3. Acesse `http://localhost:8080`.

Não abra `index.html` diretamente; elencos, dados e funcionamento offline dependem de HTTP.

## Validação

- desktop 1280×720;
- celular horizontal 844×390;
- 22 jogadores no campo;
- painel ao vivo com 11 titulares e 12 reservas;
- substituição por toque e relógio de partida testados;
- sintaxe JavaScript aprovada;
- 833 clubes, 211 seleções e 24.300 registros de jogadores auditados;
- integridade aprovada com ressalvas documentadas em `QA-WORLD-V16.json`.

Versão 16.0.0 · Ultimate World · 2026-08-04
