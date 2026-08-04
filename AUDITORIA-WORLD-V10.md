# Auditoria final — World Edition 10.0.0

## Resultado

Build aprovado para entrega como versão local/PWA, com ressalvas de licenciamento e datas de corte documentadas.

## Correções estruturais

- substituído o ponto de entrada quebrado do ZIP original por núcleo funcional independente;
- preservados e reincorporados elencos, logos, avatares e módulos aproveitáveis;
- removido o limite prático de Brasil/16 seleções;
- criado catálogo único para clubes, ligas, seleções e competições;
- diferenciados clubes comandáveis de clubes usados apenas pela IA;
- proibida a criação de jogadores fictícios para preencher clubes sem elenco;
- implementada migração defensiva de saves anteriores;
- criado campo 2D real com 22 jogadores e bola;
- corrigido overflow da partida em 568×320;
- implementadas vagas continentais por faixa de classificação da liga;
- implementadas eliminatórias, copa continental e desbloqueio condicional da Copa do Mundo;
- validado cache offline com recuperação do save.

## Cobertura

| Item | Total |
|---|---:|
| Clubes na simulação | 530 |
| Clubes comandáveis | 149 |
| Ligas | 38 |
| Países com liga | 37 |
| Jogadores de clubes | 2.902 |
| Associações FIFA | 211 |
| Seleções comandáveis com convocação oficial | 48 |
| Jogadores internacionais | 1.248 |
| Avatares | 36 |

Clubes por confederação: UEFA 184, CONMEBOL 174, AFC 58, CAF 56, CONCACAF 50 e OFC 8.

## Critérios de competição

- classificação continental inicial: vagas da liga aplicadas ao ranking de força da temporada;
- durante a liga: tabela mostra as zonas de classificação e rebaixamento;
- copa nacional: fases seguintes só são desbloqueadas após vitória;
- seleção: calendário de ida e volta nas eliminatórias;
- Copa do Mundo: desbloqueada apenas quando a pontuação mínima da confederação é atingida;
- Mundial de Clubes: reservado a clubes de maior força/coefficient no ciclo inicial.

## Riscos residuais

- 381 clubes reais ainda não têm elenco nominal comandável;
- 163 seleções são simuladas sem convocação nominal;
- o snapshot de alguns clubes antecede transferências posteriores a 20/05/2026;
- promoção/rebaixamento e renovação integral de uma segunda temporada ainda são abstrações, não um calendário federativo completo;
- regras reais podem mudar depois da data de corte;
- distribuição pública/comercial exige revisão das licenças dos ativos de terceiros.

Essas limitações aparecem na documentação e não são ocultadas na interface quando afetam a escolha de clube ou seleção.
