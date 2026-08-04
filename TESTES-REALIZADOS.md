# Testes realizados — World Edition 11.0.0

## Ambiente

- data: 04/08/2026;
- navegador: Chromium integrado;
- servidor HTTP local;
- aparelhos físicos não utilizados.

## Integridade estática

- `js/app-v11.js`: sintaxe aprovada pelo Node;
- catálogo: 833 IDs de clubes únicos, 625 elencos comandáveis e 20.458 jogadores;
- Brasil 2026: 20 clubes únicos na Série A e 20 na Série B;
- 211 códigos de seleções únicos, 135 pools comandáveis e 3.842 jogadores;
- 48 listas oficiais com 26 jogadores e aviso de rating;
- 50 ligas com regra e status de verificação;
- seis confederações cobertas por clubes e seleções;
- todos os caminhos de elenco, escudo, HTML e service worker verificados;
- atlas com 16 rostos fotorealistas validado;
- relatório automático `QA-WORLD-V11.json`: `approved-with-disclosures`.

## Fluxo funcional

1. capa exibiu 833 clubes, 20.458 jogadores e 211 seleções;
2. seleção mundial exibiu 625 clubes comandáveis e filtros de continente, país e liga;
3. Flamengo selecionado na Série A sem duplicidade dos rebaixados de 2025;
4. tela do treinador exibiu 16 rostos entre homens e mulheres de diferentes etnias e idades;
5. carreira criada com elenco nominal e onze titulares;
6. tática exibiu 11 jogadores e todos os controles avançados;
7. centro de partida abriu campo com exatamente 22 jogadores, 11 de cada lado, e uma bola;
8. mercado carregou 13 oportunidades no teste e abriu negociação com taxa, comissão, salário e contrato;
9. filtro de seleções exibiu exatamente 211 cartões; 87 ofertas estavam liberadas pela reputação do teste;
10. modo retrato exibiu bloqueio e aplicou `inert`;
11. console encerrou sem erros ou avisos.

## Responsividade

### 1366×768

- documento permaneceu com 1366 px, sem overflow horizontal;
- capa, seleção, treinador, painel e tática proporcionais;
- campo, narração e estatísticas legíveis.

### 844×390

- documento permaneceu com 844 px, sem overflow horizontal;
- 22 jogadores e bola visíveis simultaneamente no campo;
- navegação com 12 áreas acessível;
- painel usa rolagem interna vertical, sem deslocar a página horizontalmente.

### 390×844

- tela de orientação exibida;
- aplicativo tornou-se inerte até retornar ao modo horizontal.

## Limites da homologação

Não foram usados Android, iPhone ou tablets físicos. Instalação na tela inicial, notch real, teclado virtual, bateria e hardware básico ainda exigem homologação física. A auditoria técnica não substitui licenciamento jurídico de escudos, marcas, imagens ou bases para exploração comercial.
