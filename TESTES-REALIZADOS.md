# Testes realizados — World Edition 10.0.0

## Ambiente

- datas: 03 e 04/08/2026;
- navegador: navegador integrado baseado em Chromium;
- servidor: HTTP local;
- aparelhos físicos: não utilizados.

## Integridade estática

- `js/app-v10.js`: sintaxe aprovada;
- `sw.js`: sintaxe aprovada;
- `manifest.webmanifest`: JSON válido e orientação `landscape`;
- 530 clubes ligados a ligas válidas;
- 149 caminhos de elencos comandáveis verificados;
- todos os elencos comandáveis possuem ao menos onze atletas nominais;
- 2.902 jogadores de clubes validados;
- 211 códigos de associações FIFA únicos;
- 48 elencos internacionais com exatamente 26 jogadores cada;
- 1.248 jogadores internacionais validados;
- seis confederações cobertas por clubes e seleções;
- referências do `index.html` e shell do service worker existentes;
- relatório automatizado: `QA-WORLD-V10.json` com status `approved`.

## Fluxo funcional

1. abertura da capa e confirmação das contagens mundiais;
2. abertura dos três espaços de save;
3. escolha do Flamengo entre 149 clubes comandáveis;
4. criação do treinador e carregamento do elenco;
5. painel, agenda, competições e carreira internacional;
6. filtro das 48 seleções com elenco oficial;
7. filtro “Todas as 211”, com exatamente 211 cartões e 163 seleções de IA;
8. entrada no campo com exatamente 22 jogadores, 11 de cada lado, e uma bola;
9. partida completa em 6× até 90 minutos;
10. empate Flamengo 1×1 Palmeiras;
11. atualização para um jogo e um ponto;
12. atualização simultânea da tabela dos 20 clubes;
13. avanço da data para 12/04/2026 e do próximo adversário para Corinthians;
14. receita de partida registrada no saldo;
15. salvamento manual confirmado por mensagem;
16. recarga da página e recuperação de data, jogo, ponto e próximo adversário.

## Responsividade

### 568×320

- documento e tela principal permaneceram em 568 px, sem overflow global;
- placar, campo, estatísticas e controles ficaram dentro da viewport;
- 22 jogadores permaneceram visíveis;
- botões de saída, início e velocidades ficaram acessíveis;
- overlay de retrato permaneceu oculto.

### 1280×720

- narração, campo e estatísticas apareceram em três colunas;
- nenhuma rolagem global horizontal ou vertical;
- nomes, formação e marcadores permaneceram legíveis.

### 390×844

- overlay de rotação exibido;
- aplicação recebeu `inert`;
- interação com o jogo ficou bloqueada até retornar à horizontal.

## Offline e PWA

1. jogo carregado uma vez com servidor ativo;
2. servidor HTTP encerrado;
3. página recarregada sem servidor;
4. capa, scripts, estilos e catálogo abriram pelo cache;
5. espaço 1 apareceu disponível para continuar;
6. carreira offline carregou com 12/04/2026, um jogo e um ponto;
7. nenhum erro ou aviso foi registrado no console.

## Limitações da homologação

Não foram usados aparelhos Android, iPhone ou tablets físicos. Instalação pela tela inicial, notch real, teclado virtual, consumo de bateria e desempenho em hardware básico devem ser homologados posteriormente. A simulação não substitui verificação jurídica de licenças de marcas, escudos, fotos ou bases de dados para distribuição comercial.
