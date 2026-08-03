# Documentação técnica

## Arquitetura

A aplicação usa HTML, CSS e JavaScript nativos. Não há etapa de compilação, framework, backend ou dependência de rede obrigatória. O carregamento dos dados usa fetch com caminhos relativos.

### Entrada

- index.html: metadados, shell, splash e overlay de orientação;
- js/app.js: estado, fluxo, renderização, persistência e sistemas de jogo;
- css/app.css: layout mobile-first horizontal, componentes e breakpoints;
- manifest.webmanifest: instalação PWA e preferência landscape;
- sw.js: cache do shell, atualização e fallback offline.

## Estado e salvamento

O armazenamento usa localStorage sob a chave vale-futebol-manager-v9. O schema atual é 900. Cada gravação preserva a versão anterior na chave vale-futebol-manager-v9-backup.

O carregador:

- trata JSON inválido;
- ignora slots sem clube ou treinador;
- normaliza números e listas;
- limita valores críticos;
- recompõe propriedades ausentes;
- procura chaves legadas conhecidas quando o store atual está vazio.

Há três espaços independentes. Decisões importantes acionam autosave. A tela de ajustes permite exportar e importar JSON.

## Sistemas jogáveis

- criação de carreira e perfil;
- seleção entre clubes da Série A 2026;
- carregamento do elenco correspondente;
- escalação de até onze titulares;
- três formações e três mentalidades;
- pressão e ritmo ajustáveis;
- quatro planos de treino;
- quatorze rodadas de calendário;
- mercado carregado a partir de elencos adversários;
- contratação, saldo e livro financeiro;
- simulação de partida com força, posse, finalizações, gols e narração;
- atualização de pontos, moral, confiança, condição e receita.

## Orientação e ciclo de vida

O CSS exibe o overlay em retrato até 1024 px. O JavaScript usa matchMedia, resize e visibilitychange. Quando o bloqueio aparece:

- a aplicação recebe inert;
- o timer da partida é cancelado;
- o minuto e o placar são preservados;
- o estado não é recriado;
- ao retornar para paisagem, a partida retoma apenas se estava em execução.

pagehide salva a carreira. O código impede mais de um intervalo de partida simultâneo.

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

