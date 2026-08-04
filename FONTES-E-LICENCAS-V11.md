# Fontes, metodologia e licenças — V11

Data de corte da compilação: 04/08/2026.

## Dados de clubes e jogadores

- `transfermarkt-datasets`, projeto de dcaribou: https://github.com/dcaribou/transfermarkt-datasets
- licença declarada pelo conjunto de dados: CC0;
- arquivos utilizados: `clubs.csv.gz` e `players.csv.gz`, fotografia disponível em 04/08/2026;
- campos factuais importados: nomes, posição, data de nascimento, cidadania, contrato, clube e valor de mercado quando disponível;
- o GER e o potencial são estimativas próprias do VFM, não notas oficiais de terceiros.

A licença CC0 do conjunto de dados não concede automaticamente direitos sobre o site de origem, fotografias, escudos, nomes comerciais ou marcas.

## Regras e torneios

- CBF, regulamento da Série A 2026: https://stcbfsiteprdimgbrs.blob.core.windows.net/img-site/cdn/REC_Brasileiro_SA_rie_A_2026_v15_12_2025_final_02692c1077.pdf
- CBF, Série B 2026 e novo formato: https://www.cbf.com.br/futebol-brasileiro/noticias/copa-do-nordeste/profissional/brasileirao-serie-b-comeca-com-novo-formato
- CBF, confirmação dos quatro rebaixados na Série B: https://www.cbf.com.br/futebol-brasileiro/noticias/campeonato-brasileiro-serie-b/a/ceara-fortaleza-juventude-e-sport-como-estao-na-serie-b-os-quatro-times-que-cairam-da-serie-a-em-2025
- CONMEBOL, Manual de Clubes da Libertadores 2026: https://cdn.conmebol.com/wp-content/uploads/2025/12/CL-2026-Manual-de-Clubes-POR.pdf
- UEFA, lista de acesso 2026/27: https://www.uefa.com/news-media/news/02a4-2060ea59fbc5-4be94b1fbe5a-1000--access-list-track-which-sides-will-play-in-the-2026-27-uef/
- FIFA, eliminatórias da Copa de 2026: https://www.fifa.com/en/mens/worldcup/canadamexicousa2026/articles/road-to-world-cup-26-qualifiers-usa-canada-mexico

O arquivo `data/rules-2026.json` identifica quais regras são oficiais/verificadas e quais são aproximações do motor.

## Escudos

O pacote possui 638 clubes apontando para arquivos de escudos reais e 195 clubes de simulação com imagem genérica. Os escudos importados foram obtidos por IDs públicos de clubes em `tmssl.akamaized.net`. Esses arquivos e marcas não são cobertos pela licença CC0 dos CSVs. Uso comercial ou publicação pública deve ser precedido de autorização dos respectivos clubes, ligas e titulares.

## Rostos do treinador

O atlas `assets/avatars/manager-photoreal-atlas-v11.png` foi criado com geração de imagem. Ele contém personagens fictícios, não fotografias ou identidades de pessoas reais.

Prompt final usado: “Crie um atlas quadrado 4×4 com exatamente 16 retratos fotorealistas de treinadores de futebol fictícios, enquadramento de cabeça e ombros, fundo escuro neutro e iluminação cinematográfica consistente. Oito mulheres e oito homens, ampla diversidade de etnias — negra, leste-asiática, sul-asiática, latina, árabe e branca — e idades adultas variadas, incluindo pessoas seniores. Cada célula deve ter uma única pessoa centralizada; sem texto, logotipos, uniformes de clubes, marcas, celebridades ou pessoas reais.”

Método: geração de uma única imagem otimizada e recorte visual por CSS em 16 sprites selecionáveis. Faces de jogadores não foram geradas, conforme solicitado.
