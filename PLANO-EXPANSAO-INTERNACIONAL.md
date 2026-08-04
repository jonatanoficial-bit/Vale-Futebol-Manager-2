# Plano de expansão internacional

## Situação da versão 10.0.0

| Métrica | Atual |
|---|---:|
| Clubes na simulação | 530 |
| Clubes comandáveis | 149 |
| Clubes apenas de IA | 381 |
| Clubes com escudo genérico | 322 |
| Ligas representadas | 38 |
| Países com liga | 37 |
| Jogadores de clubes | 2.902 |
| Seleções na simulação | 211 |
| Seleções comandáveis | 48 |

O jogo já é mundial na simulação, mas a jogabilidade ainda se concentra na América do Sul e em parte das principais ligas europeias. CONCACAF, AFC, CAF e OFC estão presentes como adversários, porém ainda não possuem clubes comandáveis.

## Cobertura comandável atual

### América do Sul

- Argentina: 27;
- Brasil: 40 entre Séries A e B;
- Chile: 11;
- Colômbia: 17;
- Equador: 12;
- Uruguai: 13;
- Bolívia: 1;
- Paraguai: 2;
- Peru: 2;
- Venezuela: 0.

### Europa

- Inglaterra: 8;
- Itália: 5;
- Alemanha: 4;
- Espanha: 3;
- Portugal: 3;
- França: 1;
- Países Baixos, Bélgica, Turquia, Escócia, Áustria e Grécia: 0.

### Demais confederações

- América do Norte/Central: 0;
- Ásia: 0;
- África: 0;
- Oceania: 0.

## O que falta para ser um manager internacional amplo

### 1. Transformar clubes de IA em clubes comandáveis

Cada clube precisa de elenco nominal verificável, posições, idade, nacionalidade, contratos e índice VFM. A meta inicial deve ser elevar os 149 comandáveis para pelo menos 500, sem criar jogadores fictícios para preencher lacunas.

### 2. Substituir os 322 escudos genéricos

É necessário um pipeline de assets com:

- escudo correto por clube;
- nome e slug padronizados;
- arquivo PNG/WebP otimizado e transparente;
- validação visual e de duplicidade;
- fallback somente para erro, não como asset definitivo;
- registro de origem e situação de licença.

Para uma versão publicável, nenhum clube comandável deve usar escudo genérico.

### 3. Completar a América do Sul primeiro

Prioridade máxima:

- completar todos os clubes das primeiras divisões de Argentina, Bolívia, Brasil, Chile, Colômbia, Equador, Paraguai, Peru, Uruguai e Venezuela;
- adicionar segundas divisões onde houver dados confiáveis;
- inserir formatos locais reais, Apertura/Clausura quando aplicável, médias, rebaixamento e vagas continentais;
- usar participantes oficiais da Libertadores e Sul-Americana em cada temporada.

### 4. Expandir a Europa além dos gigantes

Completar primeiras e segundas divisões de Inglaterra, Espanha, Itália, Alemanha, França, Países Baixos e Portugal; depois Bélgica, Turquia, Escócia, Áustria, Grécia, Suíça, Dinamarca, Noruega, Suécia, Polônia, República Tcheca, Croácia, Sérvia, Ucrânia e outras ligas com participação UEFA.

### 5. Tornar CONCACAF e Ásia jogáveis

Primeira onda:

- MLS e Liga MX;
- ligas de Costa Rica, Canadá e principais países da América Central;
- Saudi Pro League;
- J1 League;
- K League 1;
- ligas de Catar, Emirados Árabes Unidos, Austrália, China, Índia e Irã.

### 6. Tornar a África e Oceania jogáveis

Priorizar Egito, Marrocos, África do Sul, Tunísia e Argélia; depois ampliar para as ligas que abastecem CAF Champions League e Confederation Cup. Na OFC, iniciar pela Nova Zelândia e pelos participantes recorrentes da Champions da OFC.

### 7. Aprofundar formatos e calendário

Os torneios atuais são funcionais, mas vários formatos ainda são aproximações. Faltam:

- sorteios e chaves completas;
- fases preliminares;
- critérios de desempate específicos;
- ida e volta quando exigida;
- registros e limites de estrangeiros;
- calendário de seleções integrado sem conflito com clubes;
- renovação de temporada com promoção, rebaixamento e novas classificações;
- coeficientes continentais e distribuição dinâmica de vagas.

### 8. Aprofundar a gestão

- negociações com contraproposta, parcelas, bônus e empréstimos;
- contratos, renovações e jogadores livres;
- lesões, suspensões, cartões e fadiga por viagem;
- base/sub-20, geração de jovens e evolução de potencial;
- scouts por região e conhecimento progressivo;
- comissão técnica com impacto real;
- satisfação do elenco, hierarquia, promessas e entrevistas;
- estádios, ingressos, patrocinadores e infraestrutura;
- regras de inscrição por liga e competição.

### 9. Evoluir o motor de partidas

O campo já mostra 22 jogadores, mas ainda precisa:

- movimentação contínua dos atletas, não apenas posições de formação;
- decisões influenciadas pelos atributos individuais;
- passes, desarmes, impedimentos, faltas, cartões e bolas paradas;
- substituições, lesões e mudanças táticas durante o jogo;
- estatísticas individuais e mapa de calor;
- diferenças claras entre estilos de equipes e treinadores;
- simulação rápida coerente com o motor visual.

### 10. Atualização e licenciamento

- criar rotina de atualização por janela de transferências;
- registrar data de corte por elenco;
- não chamar ratings de “oficiais” quando forem cálculo VFM;
- revisar direitos de escudos, fotos, nomes de competições e bases antes de publicação comercial.

## Ordem recomendada de versões

### 10.1 — América do Sul jogável

Completar elencos e escudos das dez primeiras divisões da CONMEBOL e corrigir formatos nacionais.

### 10.2 — Europa ampliada

Completar as sete grandes estruturas europeias e adicionar segundas divisões prioritárias.

### 10.3 — MLS, México e Ásia

Transformar MLS, Liga MX, Arábia Saudita, Japão e Coreia do Sul em ligas comandáveis.

### 10.4 — África, Oceania e torneios globais

Completar os principais campeonatos CAF/OFC e aprofundar o Mundial de Clubes.

### 11.0 — Carreira internacional profunda

Renovação multitemporada, promoção/rebaixamento real, contratos, base, lesões, inscrições, coeficientes e motor 2D avançado.

## Critério de “World Edition ampla”

Uma meta realista para a próxima grande entrega é:

- 800 a 1.000 clubes na simulação;
- pelo menos 500 a 600 clubes comandáveis;
- 70 a 100 ligas/divisões;
- 15.000 ou mais jogadores nominais;
- zero escudos genéricos entre clubes comandáveis;
- todas as seis confederações com ligas comandáveis;
- todas as primeiras divisões da CONMEBOL completas;
- promoção/rebaixamento e classificação continental funcionando entre temporadas.
