# CAREER_ENGINE_V31_GUIDE

Build v3.1.0 adiciona propostas de clubes, selecoes nacionais, carreira dupla e convocacao segura.

## Recursos
- Gerar propostas de clubes e selecoes pelo E-mail do treinador.
- Aceitar proposta de clube troca o clube ativo e recria a temporada para o novo clube.
- Aceitar proposta de selecao ativa carreira dupla: clube + selecao.
- Tela de selecoes permite registrar interesse, montar convocacao e enviar lista.
- Calendario internacional inclui datas FIFA, eliminatorias, copa continental e Mundial a cada 4 anos.

## Anti-quebra
- Se nao houver propostas, o jogo usa sondagens estaticas como fallback.
- Convocacao bloqueia envio com menos de 11 atletas ou sem selecao ativa.
- Saves antigos v3.0.0 sao migrados para v3.1.0.
- Bandeiras usam fallback automatico quando imagem nao existir.
