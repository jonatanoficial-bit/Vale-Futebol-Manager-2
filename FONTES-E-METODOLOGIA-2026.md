# Fontes e metodologia — temporada 2026

## Data de referência

Build final: 04/08/2026.

Este build diferencia três datas:

- associações FIFA: consultadas em 03/08/2026;
- convocatórias da Copa do Mundo: publicação oficial de 19/07/2026;
- elencos de clubes: snapshots presentes no pacote original, com datas internas que chegam principalmente a 20/05/2026.

Portanto, os elencos internacionais refletem uma publicação oficial muito próxima de agosto de 2026. Os elencos de clubes não devem ser interpretados como garantia de cada transferência realizada após a data interna de seu arquivo.

## Fontes oficiais

- FIFA Member Associations: https://inside.fifa.com/en/about-fifa/associations
- FIFA World Cup 2026 Squad Lists: https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf
- UEFA Champions League clubs: https://www.uefa.com/uefachampionsleague/clubs/
- CONMEBOL Libertadores 2026: https://gol.conmebol.com/libertadores/pt-br/news/rumo-gloria-eterna-este-sao-os-grupos-da-conmebol-libertadores-2026

Os arquivos gerados preservam `source`, `sourceDate`, `sourceUrl` e avisos de metodologia quando aplicável.

## Associações e seleções

O arquivo `data/fifa-associations-2026.json` contém exatamente 211 associações:

- AFC: 46;
- CAF: 54;
- CONCACAF: 35;
- CONMEBOL: 10;
- OFC: 11;
- UEFA: 55.

As 48 páginas da lista oficial de convocados foram lidas e validadas com 26 jogadores por seleção, totalizando 1.248 atletas. As outras 163 seleções participam da simulação por força agregada e não recebem nomes inventados.

## Clubes

O catálogo reúne 530 clubes reais. Destes, 149 têm arquivos de elenco completos com pelo menos onze atletas e são comandáveis. Os demais 381 alimentam tabelas, adversários continentais e o Mundial de Clubes pela IA.

O projeto não cria jogadores fictícios para preencher lacunas. Um clube só se torna comandável quando possui `rosterPath` válido e elenco nominal suficiente.

## Índice VFM de overall

Não existe um “overall real” único e oficial compartilhado por FIFA, EA Sports, Football Manager e federações. Por isso o jogo usa um índice próprio:

- jogadores de clubes: preserva os valores normalizados do pacote original;
- seleções: combina força agregada da seleção, partidas internacionais, gols, idade e posição;
- limites do índice internacional: 58 a 94;
- o potencial considera idade e nunca fica abaixo do overall atual.

Todo elenco internacional inclui o aviso: o overall é índice proprietário do VFM, não rating oficial FIFA/EA/FM.

## Reprodutibilidade

- `tools/build_fifa_world_2026.py`: gera as 211 associações e os 48 elencos oficiais;
- `tools/build_world_catalog.py`: consolida ligas, clubes, assets e competições;
- `tools/validate_world_build.py`: audita contagens, caminhos, elencos, confederações, manifesto e cache.
