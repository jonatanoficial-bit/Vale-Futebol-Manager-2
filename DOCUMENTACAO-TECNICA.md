# Documentação técnica

## Arquitetura

A aplicação usa HTML, CSS e JavaScript nativos. Não há etapa de compilação, framework, backend ou dependência de rede obrigatória. O carregamento dos dados usa fetch com caminhos relativos.

### Entrada

- index.html: metadados, shell, splash e overlay de orientação;
- js/app-v16.js: estado, fluxo, renderização, persistência e sistemas ativos do jogo;
- css/app.css, css/world-edition.css, css/world-edition-v11.css e css/ultimate-v16.css: componentes e camadas responsivas;
- manifest.webmanifest: instalação PWA em retrato ou paisagem;
- data/player-media-manifest.json: inventário único de fotografias com licença comercial;
- sw.js: cache do shell, atualização e fallback offline.

## Estado e salvamento

O armazenamento usa localStorage sob a chave vale-futebol-manager-v16. O schema atual é 1600. Antes de gravar, a versão anterior é preservada na chave vale-futebol-manager-v16-backup. Falhas de gravação são exibidas ao jogador e impedem a saída silenciosa da carreira.

O carregador:

- trata JSON inválido;
- ignora slots sem clube ou treinador;
- normaliza números e listas;
- limita valores críticos;
- recompõe propriedades ausentes;
- procura chaves legadas conhecidas quando o store atual está vazio.

Há três espaços independentes. Decisões importantes acionam autosave. A tela de ajustes permite exportar e importar JSON validado.

## Sistemas jogáveis

- criação de carreira e perfil;
- seleção entre 625 clubes comandáveis;
- carregamento do elenco correspondente;
- escalação de até onze titulares;
- quatro formações e três mentalidades;
- pressão e ritmo ajustáveis;
- cinco planos de treino;
- calendário anual de clubes e seleções;
- mercado carregado a partir de elencos adversários;
- contratação, saldo e livro financeiro;
- simulação reproduzível por partida com força, tática, posse, pressão, desgaste, reação do adversário, xG, finalizações, gols e momentos-chave;
- planejador de elenco, impacto visual das táticas e objetivos mensuráveis da diretoria;
- atualização de pontos, moral, confiança, condição e receita.

## Identidade dos jogadores

O campo `photoRemote` dos elencos nunca é carregado como imagem. `loadPlayerMediaManifest` aceita somente entradas que declarem `commercialUse: true`; jogadores sem mídia aprovada recebem uma identidade determinística baseada no próprio ID. O validador `tools/validate_player_media.py` rejeita duplicidade, jogador desconhecido, URL não segura, dimensão insuficiente, hash inválido ou licença sem referência.

## Orientação e ciclo de vida

A interface funciona em retrato e paisagem. Até 900 px, as cinco áreas principais aparecem em uma barra inferior; em telas maiores, a mesma navegação ocupa a lateral. A partida reorganiza campo, estatísticas e controles em retrato.

Ao ocultar o aplicativo durante uma partida, o relógio é pausado sem perder minuto ou placar e retomado ao retornar. pagehide salva a carreira. O código impede mais de um intervalo de partida simultâneo.

## Execução

Inicie um servidor HTTP na raiz:

python -m http.server 8080

Acesse http://localhost:8080. Para produção, publique a raiz em qualquer hospedagem estática com HTTPS.

## Hospedagem

O projeto usa somente caminhos relativos e funciona em raiz ou subpasta, desde que todos os arquivos sejam preservados. É compatível com GitHub Pages, Cloudflare Pages, Netlify, Vercel e servidor HTTP comum. HTTPS é necessário para instalação PWA fora de localhost.

## Segurança

- textos derivados do usuário são escapados antes de entrar no HTML;
- não há eval;
- não há segredos, tokens ou credenciais;
- importações são validadas antes da aplicação;
- não são solicitadas permissões;
- falhas de rede usam dados de fallback quando possível.

