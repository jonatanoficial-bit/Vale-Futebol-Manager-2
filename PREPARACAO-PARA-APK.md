# PREPARACAO-PARA-APK

## O que está pronto

- aplicação estática sem backend obrigatório;
- caminhos relativos e ausência de dependência em localhost;
- viewport com viewport-fit=cover;
- safe areas em todos os lados;
- orientação landscape no manifesto;
- overlay de retrato independente da Screen Orientation API;
- toque sem dependência de hover;
- áreas mínimas de toque em mobile;
- armazenamento local versionado;
- pausa por orientação e segundo plano;
- PWA instalável e operação offline;
- ícone autoral em alta resolução integrado ao manifesto;
- ausência de permissões e segredos;
- fallback de assets e dados.

## Tecnologia recomendada

Capacitor é a opção mais adequada. Ele preserva a aplicação web atual, oferece integração gradual com APIs nativas, controle de orientação, splash, ícones e ciclo de vida Android. Uma Trusted Web Activity é alternativa para publicação centrada na PWA, mas depende de hospedagem HTTPS e verificação do domínio.

## Etapas para gerar o APK ou AAB

1. criar um projeto Capacitor Android;
2. apontar webDir para uma cópia limpa desta raiz;
3. definir landscape no AndroidManifest;
4. gerar ícones adaptativos e splash em densidades Android;
5. tratar a barra de status e navegação com o plugin apropriado;
6. validar armazenamento após atualização do app;
7. compilar no Android Studio;
8. testar em aparelhos de entrada, intermediários e tablets;
9. criar chave de assinatura e gerar AAB;
10. preparar política de privacidade, ficha de dados e materiais da Play Store.

## Limitações

- não existe projeto Android nativo no ZIP;
- não foi gerado APK ou AAB;
- não houve teste em WebView físico;
- localStorage deve ser validado em atualização e limpeza de dados do Android;
- a Screen Orientation API não é garantida em todo WebView, por isso o overlay continua obrigatório;
- os escudos, nomes, fotos e dados esportivos precisam de revisão de licenciamento antes de distribuição comercial;
- não há sincronização em nuvem;
- o pacote de áudio recebido contém apenas documentação e manifestos, sem trilha aprovada.

## Permissões futuras

Nenhuma permissão sensível é necessária para o jogo atual. Compartilhamento de save pode usar o seletor de arquivos do sistema sem acesso amplo ao armazenamento. Analytics, notificações ou serviços online devem ser adicionados somente com consentimento e documentação de privacidade.

## Play Store

Antes de publicar, produzir ícone, feature graphic, capturas reais, política de privacidade, termos de uso, classificação indicativa e formulário de segurança de dados. Recomenda-se distribuir primeiro em faixa interna e fechada, com teste em Android 9 a 16.
