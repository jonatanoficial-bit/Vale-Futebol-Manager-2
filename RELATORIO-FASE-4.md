# Relatório da Fase 4 — Carreira Cinematográfica

Data: 01/10/2026  
Versão: 16.4.0-phase4

## Objetivo

Recuperar a imersão visual perdida, dar aparência realista ao campo tático e à partida, tornar o tutorial demonstrativo e organizar a home da carreira em torno das decisões que fazem o jogador continuar.

## Construção entregue

### Atmosfera e fundos

- removido o `background-blend-mode: multiply` que escurecia as imagens até quase desaparecerem;
- restaurados fundos específicos para home, elenco, tática, competições, calendário, jogo, treino, mercado, clube, mensagens, central Mais e ajustes;
- painéis mantidos translúcidos para preservar a leitura sem esconder o cenário.

### Campo e organização tática

- o arquivo `assets/backgrounds/campo-futebol-cinematografico.png`, fornecido pelo autor, passou a ser a base do editor tático e da partida;
- o campo usa proporção horizontal 1675:941 em celular e computador;
- as formações 4-3-3, 4-4-2, 4-2-3-1 e 3-5-2 foram recalculadas em coordenadas horizontais;
- o editor identifica visualmente defesa, meio-campo e ataque;
- carreiras já salvas recebem migração automática para o novo desenho tático;
- a partida conserva 22 jogadores, bola, pressão, momentos-chave, estatísticas e controles ao vivo.

### Competições

- placeholders idênticos foram substituídos por logos reais de Brasileirão Série A, Brasileirão Série B, UEFA Champions League, UEFA Europa League, CONMEBOL Libertadores, CONMEBOL Sudamericana e Copa do Brasil;
- os logos aparecem nos cartões de competição, preparação do jogo, comando da carreira e campo da partida;
- origem e licença de cada arquivo estão registradas em `assets/competitions/real/README.md`.

### Tutorial prático

- o tutorial deixou de cobrir a interface com um modal opaco;
- cada passo abre a área correta, destaca o elemento explicado e mantém o restante da tela visível;
- cada etapa contém uma ação concreta: preparar a partida, completar 11 titulares, testar uma formação, entrar em campo e localizar as áreas da central Mais;
- foram adicionados avanço, retorno e encerramento do guia.

### Estrutura da carreira

- a home agora começa pelo próximo adversário e pela principal ação da semana;
- o mesmo painel mostra competição, data, local, progresso da temporada, confiança da diretoria, escalação e forma recente;
- o ciclo semanal Decisões → Treino → Preparação → Partida aparece logo abaixo;
- as decisões de hoje continuam limitadas a três prioridades para evitar excesso de botões;
- desempenho, mensagens, carreira internacional, notícias do mundo e progressão do treinador continuam acessíveis abaixo do núcleo principal.

## Validação

Teste automatizado executado em navegador Chromium:

| Cenário | Resultado |
|---|---|
| Celular 390×844 | sem overflow horizontal; cinco botões principais; home e tutorial legíveis |
| Tática no celular | 11 jogadores; campo 321×180; proporção 1,78; 5 atletas no setor defensivo, 3 no meio e 3 no ataque no 4-3-3 |
| Competições brasileiras | dois cartões ativos e dois logos reais carregados |
| Celular horizontal 844×390 | 22 jogadores; campo fornecido aplicado; sem overflow horizontal |
| Partida em retrato | campo 380×213; proporção 1,78 |
| Computador 1440×900 | navegação de 176 px; home de 1205 px; fundo cinematográfico visível |
| Console do navegador | nenhum erro |
| Integridade mundial | validador aprovado com 833 clubes, 20.458 jogadores, 50 ligas e 211 seleções |

Capturas de validação ficam na pasta local `outputs` do ambiente de trabalho com o prefixo `fase4-`.

## Arquivos centrais

- `js/app-v16.js`: progressão da home, tutorial, logos e coordenadas táticas;
- `css/ultimate-v16.css`: fundos, campo, responsividade, tutorial e apresentação da carreira;
- `sw.js`: cache da versão 16.4 e novos assets;
- `assets/backgrounds/campo-futebol-cinematografico.png`: campo fornecido;
- `assets/competitions/real/`: sete marcas de competições e registro de fontes.
