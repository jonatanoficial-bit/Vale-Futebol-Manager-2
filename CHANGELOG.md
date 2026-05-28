# Changelog - v4.7.0

## Fase 9 - Motor de Partida 2.0

### Implementado
- Motor de partida atualizado para v4.7.0.
- Eventos avançados por atributos, tática, moral, fadiga, clima e mando de campo.
- Risco narrativo de VAR, pênalti, cartões, lesões e contra-ataques.
- Modelo de impacto individual dos 11 jogadores principais.
- Painel de partida com controle tático, risco de transição, bola parada, VAR, pênalti, lesão e impacto do banco.
- Relatório pós-jogo preservado com fluxo seguro.
- Stress test interno de 100 partidas.

### Anti-quebra
- Validador do motor de partida.
- Validador de equilíbrio de eventos.
- Checador de integridade de xG.
- Gate de stress test executado no boot safety.

### Compatibilidade
- Migração de saves v4.6.0 e anteriores.
- Nova chave local: vfm_gold_save_v470.
