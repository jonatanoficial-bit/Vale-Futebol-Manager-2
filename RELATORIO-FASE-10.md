# Relatório — Fase 10: Calendário Mundial e Legado

## Entregue

O jogo possui uma agenda verdadeiramente unificada. A próxima decisão verifica os jogos disponíveis do clube e da seleção, ordena por data e direciona o usuário para a partida correta. Quando a Data FIFA acontece antes do próximo jogo do clube, o botão principal abre a partida da seleção.

As seleções exibem amistosos, eliminatórias, copa continental e Copa do Mundo com rótulos próprios, agenda detalhada e tabelas. O mesmo motor de classificação sustenta as fases de liga continentais de clubes. As partidas simuladas entre rivais são determinísticas para que a tabela não mude ao abrir a tela.

Foi criada a camada de legado: a pontuação da carreira combina XP, reputação, vitórias e títulos. A sala de troféus registra títulos por temporada. Ao concluir uma temporada campeã, o usuário recebe um popup de celebração com competição, clube e XP concedido.

## Interface

- A caixa de entrada destaca mensagens não lidas e importantes, apresenta categoria, origem, prévia e data.
- A central do treinador mostra XP, nível, troféus e pontuação de carreira antes dos demais painéis.
- A agenda possui uma faixa fixa com o próximo compromisso e indica quando se trata da seleção.
- As tabelas identificam visualmente a equipe comandada para reduzir leitura excessiva no celular.

## Limite consciente

As classificações de competições com somente os jogos do usuário persistidos projetam os resultados dos outros confrontos de forma determinística. A próxima etapa deve persistir a tabela global e toda a rodada quando os regulamentos detalhados de cada competição forem incorporados.
