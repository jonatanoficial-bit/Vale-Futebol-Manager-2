# Vale Futebol Manager — World Edition

Manager de futebol estático, mobile-first horizontal e instalável como PWA. A versão 10.0.0 reconstrói o jogo em torno de um mundo conectado de clubes, seleções e competições.

## Base mundial

- 530 clubes reais na simulação, em 38 ligas de 37 países;
- 149 clubes comandáveis com elenco nominal completo e 2.902 jogadores;
- 211 associações FIFA nas seis confederações;
- 48 seleções comandáveis com as convocatórias oficiais da Copa do Mundo de 2026 e 1.248 jogadores;
- 36 avatares de treinador;
- clubes das principais ligas de CONMEBOL, UEFA, CONCACAF, AFC, CAF e OFC para alimentar torneios continentais e o Mundial de Clubes.

Clubes sem elenco verificável participam pela IA. Eles não recebem jogadores fictícios. Todas as 211 seleções disputam a simulação das eliminatórias; as 48 com convocação nominal oficial podem ser comandadas.

## Competições e regras

- Brasileirão Série A e Série B;
- ligas e copas nacionais;
- Copa do Brasil;
- CONMEBOL Libertadores e Sul-Americana;
- UEFA Champions League e Europa League;
- CONCACAF Champions Cup;
- AFC Champions League Elite;
- CAF Champions League;
- OFC Champions League;
- Mundial de Clubes;
- eliminatórias continentais, Copa América, Euro, Copa Ouro, Copa da Ásia, Copa Africana de Nações, Copa das Nações da OFC e Copa do Mundo.

As tabelas exibem zonas de classificação, promoção e rebaixamento. A entrada nas competições continentais usa as faixas de vagas definidas pela liga; a Copa do Mundo só é liberada quando a seleção atinge o critério de classificação nas eliminatórias.

## Gestão e partida

- três espaços de carreira com migração e persistência;
- carreira simultânea em clube e seleção;
- escalação de onze titulares, formações e instruções táticas;
- treino semanal, físico e moral;
- mercado internacional apenas com atletas nominais existentes na base;
- orçamento, receitas, folha, comissão técnica e livro financeiro;
- e-mail de diretoria, competições e seleções;
- calendário integrado de liga, copas e torneios internacionais;
- campo 2D com 22 jogadores, bola, formação, placar, narração e estatísticas;
- pausa automática ao girar ou ocultar a aplicação;
- funcionamento offline após o primeiro carregamento.

## Executar

1. Abra um terminal nesta pasta.
2. Inicie um servidor HTTP, por exemplo: `python -m http.server 8080`.
3. Acesse `http://localhost:8080`.

Não abra `index.html` diretamente pelo sistema de arquivos: elencos, módulos e service worker dependem de HTTP.

## Dados e ratings

As associações e os 48 elencos internacionais vêm de publicações oficiais da FIFA. Os dados de clubes reaproveitam e normalizam o pacote original recebido. O campo `overall` é um índice proprietário de simulação do VFM e não representa nota oficial da FIFA, EA Sports ou Football Manager.

Consulte [FONTES-E-METODOLOGIA-2026.md](FONTES-E-METODOLOGIA-2026.md) para datas de corte, fontes e limitações.

## Compatibilidade validada

- celular horizontal: 568×320;
- celular vertical: 390×844 com bloqueio de orientação e aplicação inerte;
- desktop: 1280×720;
- PWA offline com carregamento e recuperação do save.

Versão 10.0.0 · World Edition · 2026-08-04
