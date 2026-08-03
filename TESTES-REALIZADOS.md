# Testes realizados

## Ambiente

- data: 31/07/2026;
- navegador: navegador integrado baseado em Chromium;
- servidor: HTTP local;
- execução: interface real, cliques, formulários, armazenamento e service worker;
- aparelhos físicos: não utilizados.

## Validações estáticas

- sintaxe de js/app.js e sw.js validada com node --check;
- 82 arquivos JSON analisados, nenhum inválido;
- manifest.webmanifest analisado como JSON válido;
- busca por caminhos locais, localhost embutido, credenciais e linguagem interna na interface pública;
- referências principais de imagens e dados verificadas;
- ZIP original preservado e manifesto SHA-256 gerado antes das alterações.

## Fluxo funcional executado

1. abertura da capa;
2. abertura dos três espaços de carreira;
3. escolha do espaço 1;
4. seleção do Flamengo;
5. preenchimento do nome do treinador;
6. criação da carreira e carregamento de 27 jogadores;
7. reabertura da página e carregamento do save;
8. elenco com 27 linhas e 11 titulares;
9. troca da formação para 4-4-2;
10. aplicação de treino de recuperação;
11. agenda com 14 jogos;
12. mercado com 18 oportunidades;
13. contratação de Marcos Antônio;
14. atualização do orçamento e do livro financeiro;
15. partida completa até 90 minutos;
16. vitória por 2 a 1, avanço para semana 2 e três pontos;
17. reabertura offline e recuperação da carreira.

## Mobile horizontal

Resoluções verificadas:

- 568×320;
- 640×360;
- 667×375;
- 740×360;
- 780×360;
- 812×375;
- 844×390;
- 852×393;
- 896×414;
- 915×412;
- 932×430;
- 960×432.

Em todas, o documento permaneceu sem overflow global, o aviso de retrato ficou oculto em paisagem e os oito atalhos mantiveram área de 44×44 px ou maior. Conteúdo mais alto usa scroll interno.

## Rotação

Com uma partida em execução a 6×:

- aos 19 minutos, a viewport foi alterada para 390×844;
- o overlay apareceu, a aplicação recebeu inert e o relógio permaneceu em 19 por mais de 1,7 segundo;
- ao retornar para 844×390, o overlay desapareceu e o relógio avançou para 31;
- não houve recarga, perda de placar ou timer duplicado.

## Tablet e desktop

Resoluções verificadas:

- 1024×600;
- 1024×768;
- 1280×720;
- 1366×768;
- 1440×900;
- 1600×900;
- 1920×1080.

O desktop exibiu menu completo, três colunas no painel quando havia espaço e nenhum overflow global. Mouse, teclado, Escape, Espaço, foco e botões foram exercitados pela automação e pela navegação semântica.

## Offline e PWA

Após o primeiro carregamento:

- o servidor HTTP foi encerrado;
- a página foi recarregada;
- capa, scripts e estilos abriram pelo cache;
- o espaço 1 foi carregado offline;
- semana 2 e três pontos foram preservados;
- não houve erro ou aviso no console.

## Limitações dos testes

Não foram usados Android, iPhone ou tablet físicos. Teclado virtual, notch real, consumo de bateria, áudio em hardware e instalação pela loja precisam de homologação posterior. Não há pacote de áudio utilizável no ZIP, portanto áudio não foi declarado como aprovado.

## Regressão final — 03/08/2026

- manifesto e ícone autoral de 1254×1254 verificados;
- carregamento de elencos validado nas rotas das Séries A e B, com fallback legado;
- escalação automática validada com onze titulares e atacante de referência;
- retomada da partida pelo modal de saída validada;
- proteção de espaço ocupado, fallbacks visuais e deduplicação do mercado revisados;
- sintaxe, arquivos JSON, referências do shell PWA e cache offline revalidados.
