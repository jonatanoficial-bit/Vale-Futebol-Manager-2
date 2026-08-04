# Fontes, metodologia e licenças — V16

Data de corte: 04/08/2026.

## Dados

- `transfermarkt-datasets` de dcaribou, licença CC0: https://github.com/dcaribou/transfermarkt-datasets
- campos factuais importados: nomes, posições, nascimento, cidadania, contrato, clube e valor quando disponíveis;
- GER, potencial, atributos derivados e reputação são índices próprios do VFM;
- 48 listas nacionais oficiais de 2026 foram preservadas; demais pools são compilações de profissionais da base.

A licença CC0 dos dados não concede direitos sobre fotografias, escudos, marcas ou o site de origem.

## Regras

- CBF, regulamentos 2026: https://www.cbf.com.br/
- CONMEBOL, Manual de Clubes 2026: https://cdn.conmebol.com/wp-content/uploads/2025/12/CL-2026-Manual-de-Clubes-POR.pdf
- UEFA, lista de acesso 2026/27: https://www.uefa.com/news-media/news/02a4-2060ea59fbc5-4be94b1fbe5a-1000--access-list-track-which-sides-will-play-in-the-2026-27-uef/
- FIFA, eliminatórias da Copa de 2026: https://www.fifa.com/en/mens/worldcup/canadamexicousa2026/articles/road-to-world-cup-26-qualifiers-usa-canada-mexico

O status de verificação de cada liga está em `data/rules-2026.json`.

## Identidades visuais

- 638 referências de clubes apontam para arquivos de escudos reais;
- 195 clubes de simulação permanecem explicitamente genéricos;
- Atlético Mineiro: PNG obtido diretamente de `https://atletico.com.br/wp-content/uploads/2022/03/logo-atual-Converted-1.png`;
- 211 bandeiras nacionais: `flag-icons`, licença MIT, https://github.com/lipis/flag-icons;
- a licença MIT está preservada em `assets/national/LICENSE-flag-icons-MIT.txt`.

Escudos e marcas pertencem aos titulares. Publicação comercial exige autorização e revisão jurídica.

## Rostos do treinador

O atlas `assets/avatars/manager-photoreal-atlas-v11.png` contém 16 personagens fictícios gerados, sem pessoas reais, celebridades, logotipos ou uniformes de clubes. Faces reais de jogadores não fazem parte do pacote.

## Comparação com jogos licenciados

VFM é um projeto independente. A V16 aproxima profundidade de fluxo e apresentação, mas não reivindica paridade integral com Football Manager 26 ou Soccer Manager 2026, que contam com equipes, pesquisa, tecnologia e contratos de licenciamento próprios.
