# Auditoria de entrega — Ultimate World 16.0.0

## Resultado

Build aprovado com ressalvas de fidelidade e licenciamento registradas em `QA-WORLD-V16.json`.

## Cobertura confirmada

- 833 clubes; 625 comandáveis;
- 50 ligas em 49 países e seis confederações;
- 20.458 jogadores de clubes;
- 211 seleções, 135 comandáveis e 3.842 jogadores nacionais;
- 211 bandeiras nacionais locais;
- 638 referências de escudos reais e 195 genéricas;
- 16 rostos fictícios de treinador;
- calendário anual, mata-matas, simulação global, tática ao vivo, patrocínio, instalações, academia, mercado e coletiva pós-jogo.

## Testes realizados

- `node --check js/app-v16.js`;
- validação integral de catálogos, elencos, imagens e referências offline;
- desktop 1280×720;
- mobile horizontal 844×390;
- criação de carreira com Atlético Mineiro;
- editor tático por toque;
- partida com 22 jogadores;
- painel ao vivo com 11 titulares e 12 reservas;
- substituição consumindo 1/5 e aplicação do plano;
- relógio avançando e console sem erros na versão final testada.

## Ressalvas honestas

- 195 clubes de simulação ainda não têm escudo real licenciado;
- bandeiras nacionais não são escudos oficiais de federações;
- regras complexas marcadas como aproximação não reproduzem integralmente médias, splits e play-offs;
- ratings próprios não são notas oficiais de terceiros;
- publicação comercial requer licenciamento das marcas e revisão jurídica.
