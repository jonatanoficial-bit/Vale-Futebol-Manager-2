# Relatório da Fase 5 — Motor de Partida 2.0

## Build

- Versão: `16.5.0-phase5`
- Motor: `5.0.0`
- Schema de save: `1601`
- Data: 01/10/2026

## Resultado entregue

A partida deixou de usar um sorteio simples dependente da velocidade da interface. A mesma partida, com a mesma escalação e as mesmas decisões, agora produz a mesma sequência em 1×, 3× ou 6×. O cálculo usa os atributos técnicos, mentais e físicos dos jogadores, adequação posicional, estado físico, moral, forma e instruções táticas.

## Sistemas implementados

- motor determinístico separado e testável em `js/systems/matchEngineV2.js`;
- confronto entre ataque, controle, defesa e goleiro das duas equipes;
- adequação do jogador à função esperada nas formações 4-3-3, 4-4-2, 4-2-3-1 e 3-5-2;
- influência combinada de mentalidade, pressão, ritmo, largura, linha defensiva, construção, marcação e transição;
- chances de bola parada, transição, cruzamento, combinação curta, jogo direto e ataque trabalhado;
- xG por finalização, precisão, gols, passes, escanteios, cartões, desgaste e notas individuais;
- goleiros recompensados por defesas e defensores por intervenções;
- IA adversária com ajustes aos 28, 55 e 70 minutos conforme placar e xG;
- substituições com impacto de energia e instruções à beira do campo com intervalo de uso;
- explicação textual da causa tática de cada chance relevante;
- análise pós-jogo com veredicto, três fatores decisivos e destaques;
- histórico persistente das últimas 40 análises no Centro de partida;
- migração segura para carreiras anteriores e inicialização correta em novas carreiras.

## Equilíbrio automatizado

Foram simuladas 2.400 partidas: cinco cenários com 400 jogos cada e duas amostras posicionais com 200 jogos cada.

| Cenário | Gols pró | Gols contra | xG pró | xG contra | Chutes pró | Físico final |
|---|---:|---:|---:|---:|---:|---:|
| Equilibrado | 1,012 | 0,858 | 1,130 | 0,910 | 10,695 | 86,785 |
| Ofensivo | 1,873 | 1,035 | 2,065 | 1,134 | 13,285 | 85,310 |
| Bloco baixo | 0,522 | 0,430 | 0,612 | 0,480 | 8,780 | 87,697 |
| Elenco superior | 1,782 | 0,465 | 1,745 | 0,591 | 12,328 | 86,882 |
| Elenco inferior | 0,725 | 1,005 | 0,908 | 1,101 | 10,023 | 86,662 |

Os resultados confirmam as relações planejadas: atacar aumenta volume e desgaste; bloco baixo reduz chances dos dois lados; qualidade individual melhora criação, finalização e proteção defensiva.

O teste adicional compara a formação correta com jogadores deslocados para funções incompatíveis. A formação correta produziu `1,110` xG e `1,055` gol por jogo; a escalação deslocada caiu para `0,885` xG e `0,775` gol.

## Validação visual

- celular paisagem `844×390`;
- celular retrato `390×844`;
- 22 atletas no campo;
- 11 titulares e 12 reservas no painel ao vivo;
- cinco grupos de seleção tática e quatro controles de intensidade;
- quatro planos rápidos e três orientações à beira do campo;
- sete linhas de estatísticas ao vivo;
- três explicações causais e três melhores notas;
- relatório pós-jogo e análise salva sem estouro horizontal;
- zero erro no console durante o fluxo completo.

## Arquivos principais

- `js/systems/matchEngineV2.js`
- `js/app-v16.js`
- `css/ultimate-v16.css`
- `tools/test-match-engine-v2.mjs`
- `tools/validate_world_build.py`
- `index.html`
- `sw.js`
- `BUILD-INFO.json`
