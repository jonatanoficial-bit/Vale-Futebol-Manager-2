# Relatório da Fase 9 — Carreira do Treinador

Data: 02 de outubro de 2026  
Versão: 16.9.0-phase9  
Schema do save: 1604

## Resultado

A Fase 9 transforma o treinador em uma carreira persistente. A diretoria passa a avaliar cada partida, o contrato pode entrar em pressão ou terminar em demissão, e o jogador pode receber e aceitar projetos de outros clubes sem perder reputação, licença, conquistas ou vínculo com uma seleção nacional.

As instalações também foram refeitas visualmente. Estádio, centro de treinamento, academia, departamento médico, scouting e centro comercial agora usam cenas originais com leitura imediata, nível visível e progresso da obra sobre a imagem. Os seis arquivos foram reduzidos para 960 × 540 e somam menos de 1 MB, evitando que a nova apresentação prejudique o carregamento no celular.

## Sistema de carreira

- contrato do treinador com clube, salário, duração e data de assinatura;
- confiança classificada como prestigiado, estável, em avaliação, sob pressão ou risco imediato;
- avaliação posterior a cada partida com força do adversário, saldo de gols, eliminação, forma recente e caixa do clube;
- alertas formais enviados pela diretoria quando o risco aumenta;
- demissão efetiva após campanha crítica, com período sem clube e menus adequados ao estado da carreira;
- propostas com salário, duração, objetivo e nível esportivo do clube;
- troca de clube com novo elenco, orçamento, calendário, comissão, instalações e objetivos;
- convites formais de seleções nacionais segundo reputação;
- linha do tempo de nomeações, alertas, renovações, seleções e demissões.

## Instalações

As imagens originais estão em `assets/facilities/`:

- `stadium.jpg` — estádio e receita de matchday;
- `training.jpg` — centro de treinamento;
- `youth.jpg` — academia de base;
- `medical.jpg` — medicina e recuperação;
- `scouting.jpg` — central internacional de observação;
- `commercial.jpg` — marketing, mídia, loja e hospitalidade.

Cada cartão mantém custo, prazo, benefício, nível, obra em andamento e acesso ao projeto de expansão.

## Compatibilidade

Saves da Fase 8 são migrados automaticamente. O novo estado contratual é criado a partir do clube atual, enquanto orçamento, obras, elenco, finanças, transferências e seleção permanecem intactos.

## Validação prevista para a publicação

- sintaxe dos módulos JavaScript;
- testes unitários do motor de carreira;
- regressão do desempenho esportivo e da economia;
- migração do schema 1603 para 1604;
- carregamento das seis imagens;
- estado empregado, demissão, propostas e nova contratação;
- ausência de rolagem horizontal em desktop, celular retrato e celular paisagem.
